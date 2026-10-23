


create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


do $$ begin
  drop trigger if exists on_auth_user_created on auth.users;
exception
  when insufficient_privilege then
    raise notice 'Skip drop trigger on auth.users (not owner) — sẽ recreate nếu được phép.';
  when undefined_object then
    null;
end $$;

do $$ begin
  drop function if exists public.handle_new_user() cascade;
exception
  when insufficient_privilege then
    raise notice 'Skip drop handle_new_user (auth trigger vẫn giữ) — sẽ CREATE OR REPLACE.';
end $$;

drop function if exists public.is_admin() cascade;
drop function if exists public.is_project_member(uuid) cascade;
drop function if exists public.notify_task_assignment() cascade;
drop function if exists public.notify_task_status_change() cascade;
drop function if exists public.notify_new_comment() cascade;


drop table if exists messages cascade;
drop table if exists channels cascade;
drop table if exists time_entries cascade;
drop table if exists notifications cascade;
drop table if exists comments cascade;
drop table if exists subtasks cascade;
drop table if exists tasks cascade;
drop table if exists project_members cascade;
drop table if exists projects cascade;
drop table if exists users cascade;

drop type if exists task_status cascade;
drop type if exists priority cascade;
drop type if exists user_role cascade;
drop type if exists channel_type cascade;


create type task_status as enum ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
create type priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type user_role as enum ('ADMIN', 'MEMBER');





create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  role user_role default 'MEMBER',
  job_role text,
  email text
);

create table projects (
  id text primary key,
  name text not null,
  description text,
  status text default 'ACTIVE',
  progress integer default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table project_members (
  project_id text not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text default 'MEMBER',
  joined_at timestamptz default now(),
  primary key (project_id, user_id)
);

create table tasks (
  id text primary key,
  project_id text references projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status default 'TODO',
  priority priority default 'MEDIUM',
  assignee_id uuid references users(id) on delete set null,
  due_date timestamptz,
  tags text[],
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table subtasks (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  assignee_id uuid references users(id) on delete set null
);

create table comments (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

create table notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at timestamptz default now(),
  task_id text references tasks(id) on delete set null
);


create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.is_project_member(p_project_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.project_members
      where project_id = p_project_id and user_id = auth.uid()
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, avatar, role, job_role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.email, new.id::text)
    ),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'MEMBER'),
    new.raw_user_meta_data->>'job_role',
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;




create or replace function public.notify_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null
     and (tg_op = 'INSERT' or old.assignee_id is distinct from new.assignee_id)
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Công việc mới được giao',
      'Bạn được giao công việc: ' || new.title,
      'ASSIGNMENT',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_assignment
  after insert or update of assignee_id on public.tasks
  for each row execute function public.notify_task_assignment();

create or replace function public.notify_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and new.assignee_id is not null
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Trạng thái công việc thay đổi',
      new.title || ' → ' || new.status::text,
      'STATUS_CHANGE',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_status_change
  after update of status on public.tasks
  for each row execute function public.notify_task_status_change();

create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignee uuid;
  v_title text;
begin
  select assignee_id, title into v_assignee, v_title
  from public.tasks where id = new.task_id;

  if v_assignee is not null and v_assignee is distinct from new.user_id then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      v_assignee,
      'Có bình luận mới',
      'Bình luận trong công việc: ' || coalesce(v_title, new.task_id),
      'COMMENT',
      new.task_id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();


grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;


alter table users enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;


create policy users_select on users for select to authenticated using (true);
create policy users_update_self on users for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    (id = auth.uid() and role = (select u.role from public.users u where u.id = auth.uid()))
    or public.is_admin()
  );
create policy users_insert_admin on users for insert to authenticated
  with check (public.is_admin());
create policy users_delete_admin on users for delete to authenticated
  using (public.is_admin() and id <> auth.uid());


create policy projects_select on projects for select to authenticated
  using (public.is_admin() or public.is_project_member(id));
create policy projects_insert on projects for insert to authenticated
  with check (auth.uid() is not null);
create policy projects_update on projects for update to authenticated
  using (public.is_admin() or public.is_project_member(id))
  with check (public.is_admin() or public.is_project_member(id));
create policy projects_delete on projects for delete to authenticated
  using (public.is_admin());


create policy pm_select on project_members for select to authenticated
  using (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_insert on project_members for insert to authenticated
  with check (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_update on project_members for update to authenticated
  using (public.is_admin() or public.is_project_member(project_id));
create policy pm_delete on project_members for delete to authenticated
  using (public.is_admin() or public.is_project_member(project_id));


create policy tasks_select on tasks for select to authenticated
  using (public.is_project_member(project_id));
create policy tasks_insert on tasks for insert to authenticated
  with check (public.is_project_member(project_id));
create policy tasks_update on tasks for update to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy tasks_delete on tasks for delete to authenticated
  using (public.is_project_member(project_id));


create policy subtasks_select on subtasks for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy subtasks_write on subtasks for all to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ))
  with check (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));


create policy comments_select on comments for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy comments_insert on comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id))
  );
create policy comments_update on comments for update to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy comments_delete on comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());


create policy notif_select on notifications for select to authenticated
  using (user_id = auth.uid());
create policy notif_update on notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy notif_insert on notifications for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy notif_delete on notifications for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());





alter table tasks disable trigger trg_notify_task_assignment;
alter table tasks disable trigger trg_notify_task_status_change;
alter table comments disable trigger trg_notify_new_comment;


delete from auth.identities
where user_id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or provider_id in (
  'admin@fastboard.com',
  'sarah@fastboard.com',
  'mike@fastboard.com',
  'emily@fastboard.com',
  'lan@fastboard.com'
);

delete from auth.users
where id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or email in (
  'admin@fastboard.com',
  'sarah@fastboard.com',
  'mike@fastboard.com',
  'emily@fastboard.com',
  'lan@fastboard.com'
);


insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
(
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'admin@fastboard.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Nguyễn Văn Admin","role":"ADMIN","job_role":"Product Owner","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a2222222-2222-4222-8222-222222222222',
  'authenticated', 'authenticated', 'sarah@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sarah Miller","role":"MEMBER","job_role":"UI Designer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a3333333-3333-4333-8333-333333333333',
  'authenticated', 'authenticated', 'mike@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Mike Ross","role":"MEMBER","job_role":"Backend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a4444444-4444-4444-8444-444444444444',
  'authenticated', 'authenticated', 'emily@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Emily Wong","role":"MEMBER","job_role":"QA Engineer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a5555555-5555-4555-8555-555555555555',
  'authenticated', 'authenticated', 'lan@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Trần Thị Lan","role":"MEMBER","job_role":"Frontend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Lan"}'::jsonb,
  now(), now(), '', '', '', ''
);


insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) values
(
  gen_random_uuid(), 'a1111111-1111-4111-8111-111111111111',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a1111111-1111-4111-8111-111111111111', 'admin@fastboard.com')::jsonb,
  'email', 'a1111111-1111-4111-8111-111111111111', now(), now(), now()
),
(
  gen_random_uuid(), 'a2222222-2222-4222-8222-222222222222',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a2222222-2222-4222-8222-222222222222', 'sarah@fastboard.com')::jsonb,
  'email', 'a2222222-2222-4222-8222-222222222222', now(), now(), now()
),
(
  gen_random_uuid(), 'a3333333-3333-4333-8333-333333333333',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a3333333-3333-4333-8333-333333333333', 'mike@fastboard.com')::jsonb,
  'email', 'a3333333-3333-4333-8333-333333333333', now(), now(), now()
),
(
  gen_random_uuid(), 'a4444444-4444-4444-8444-444444444444',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a4444444-4444-4444-8444-444444444444', 'emily@fastboard.com')::jsonb,
  'email', 'a4444444-4444-4444-8444-444444444444', now(), now(), now()
),
(
  gen_random_uuid(), 'a5555555-5555-4555-8555-555555555555',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a5555555-5555-4555-8555-555555555555', 'lan@fastboard.com')::jsonb,
  'email', 'a5555555-5555-4555-8555-555555555555', now(), now(), now()
);

insert into public.users (id, name, avatar, role, job_role, email) values
('a1111111-1111-4111-8111-111111111111', 'Nguyễn Văn Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'ADMIN', 'Product Owner', 'admin@fastboard.com'),
('a2222222-2222-4222-8222-222222222222', 'Sarah Miller', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'MEMBER', 'UI Designer', 'sarah@fastboard.com'),
('a3333333-3333-4333-8333-333333333333', 'Mike Ross', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'MEMBER', 'Backend Developer', 'mike@fastboard.com'),
('a4444444-4444-4444-8444-444444444444', 'Emily Wong', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 'MEMBER', 'QA Engineer', 'emily@fastboard.com'),
('a5555555-5555-4555-8555-555555555555', 'Trần Thị Lan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', 'MEMBER', 'Frontend Developer', 'lan@fastboard.com')
on conflict (id) do update set
  name = excluded.name,
  avatar = excluded.avatar,
  role = excluded.role,
  job_role = excluded.job_role,
  email = excluded.email;

insert into projects (id, name, description, status, progress, created_by) values
('p1', 'Cổng dịch vụ sinh viên', 'Nâng cấp cổng thông tin tập trung cho lịch học, học phí và hồ sơ sinh viên.', 'ACTIVE', 40, 'a1111111-1111-4111-8111-111111111111'),
('p2', 'Hệ thống quản lý thực tập', 'Theo dõi đơn vị thực tập, đề cương, nhật ký tuần và tiến độ báo cáo.', 'ACTIVE', 25, 'a1111111-1111-4111-8111-111111111111'),
('p3', 'Chiến dịch tuyển sinh năm 2026', 'Chuẩn bị nội dung, hình ảnh và báo cáo tổng kết cho đợt tuyển sinh năm 2026.', 'COMPLETED', 100, 'a2222222-2222-4222-8222-222222222222'),
('p4', 'Ứng dụng đặt lịch phòng học', 'Xây dựng quy trình đặt phòng, kiểm tra trùng lịch và thông báo thay đổi.', 'ACTIVE', 25, 'a1111111-1111-4111-8111-111111111111');

insert into project_members (project_id, user_id) values
('p1', 'a1111111-1111-4111-8111-111111111111'),
('p1', 'a2222222-2222-4222-8222-222222222222'),
('p1', 'a4444444-4444-4444-8444-444444444444'),
('p1', 'a5555555-5555-4555-8555-555555555555'),
('p2', 'a1111111-1111-4111-8111-111111111111'),
('p2', 'a3333333-3333-4333-8333-333333333333'),
('p2', 'a4444444-4444-4444-8444-444444444444'),
('p2', 'a5555555-5555-4555-8555-555555555555'),
('p3', 'a2222222-2222-4222-8222-222222222222'),
('p3', 'a3333333-3333-4333-8333-333333333333'),
('p3', 'a4444444-4444-4444-8444-444444444444'),
('p4', 'a1111111-1111-4111-8111-111111111111'),
('p4', 'a2222222-2222-4222-8222-222222222222'),
('p4', 'a5555555-5555-4555-8555-555555555555');

insert into tasks (id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_at) values
('t1', 'p1', 'Hoàn thiện đăng nhập một lần', 'Kết nối tài khoản sinh viên với hệ thống xác thực tập trung của trường.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '15 days', ARRAY['Bảo mật', 'Tài khoản'], now() - interval '31 days'),
('t2', 'p1', 'Đồng bộ lịch học cá nhân', 'Hiển thị lịch học theo tuần và tự động cập nhật khi có thay đổi.', 'DONE', 'MEDIUM', 'a5555555-5555-4555-8555-555555555555', now() - interval '10 days', ARRAY['Lịch học', 'Giao diện'], now() - interval '25 days'),
('t3', 'p1', 'Kiểm thử hồ sơ sinh viên', 'Rà soát luồng cập nhật thông tin và kiểm tra dữ liệu bắt buộc.', 'REVIEW', 'HIGH', 'a4444444-4444-4444-8444-444444444444', now() - interval '2 days', ARRAY['Kiểm thử', 'Hồ sơ'], now() - interval '12 days'),
('t4', 'p1', 'Tối ưu trang tra cứu học phí', 'Rút ngắn thời gian tải và làm rõ trạng thái các khoản cần thanh toán.', 'IN_PROGRESS', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() + interval '1 day', ARRAY['Hiệu năng', 'Học phí'], now() - interval '8 days'),
('t5', 'p1', 'Bổ sung hướng dẫn sử dụng', 'Viết hướng dẫn ngắn cho các chức năng thường dùng của sinh viên.', 'TODO', 'LOW', 'a2222222-2222-4222-8222-222222222222', now() + interval '5 days', ARRAY['Tài liệu', 'Hỗ trợ'], now() - interval '3 days'),
('t6', 'p2', 'Xác nhận danh sách đơn vị thực tập', 'Đối chiếu thông tin liên hệ và trạng thái tiếp nhận của từng đơn vị.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '12 days', ARRAY['Đơn vị', 'Dữ liệu'], now() - interval '28 days'),
('t7', 'p2', 'Phê duyệt đề cương thực tập', 'Kiểm tra mục tiêu, phạm vi và kế hoạch thực hiện của sinh viên.', 'IN_PROGRESS', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() - interval '4 days', ARRAY['Đề cương', 'Phê duyệt'], now() - interval '16 days'),
('t8', 'p2', 'Tổng hợp nhật ký tuần', 'Chuẩn hóa biểu mẫu và tổng hợp tiến độ thực tập theo từng tuần.', 'REVIEW', 'MEDIUM', 'a4444444-4444-4444-8444-444444444444', now() + interval '2 days', ARRAY['Nhật ký', 'Báo cáo'], now() - interval '9 days'),
('t9', 'p2', 'Gửi nhắc hạn báo cáo', 'Thiết lập thông báo trước hạn nộp báo cáo cho sinh viên và giảng viên.', 'TODO', 'MEDIUM', 'a5555555-5555-4555-8555-555555555555', now() + interval '7 days', ARRAY['Thông báo', 'Báo cáo'], now() - interval '2 days'),
('t10', 'p3', 'Chốt số liệu chiến dịch', 'Đối chiếu lượt đăng ký và hoàn thiện bảng số liệu cuối kỳ.', 'DONE', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() - interval '20 days', ARRAY['Số liệu', 'Tổng kết'], now() - interval '42 days'),
('t11', 'p3', 'Hoàn thiện bộ ảnh truyền thông', 'Chọn ảnh, chuẩn hóa kích thước và bàn giao thư viện nội dung.', 'DONE', 'MEDIUM', 'a2222222-2222-4222-8222-222222222222', now() - interval '18 days', ARRAY['Truyền thông', 'Hình ảnh'], now() - interval '38 days'),
('t12', 'p3', 'Lưu trữ báo cáo tổng kết', 'Sắp xếp biên bản, số liệu và báo cáo vào kho tài liệu chung.', 'DONE', 'LOW', 'a4444444-4444-4444-8444-444444444444', now() - interval '14 days', ARRAY['Lưu trữ', 'Báo cáo'], now() - interval '30 days'),
('t13', 'p4', 'Thiết kế sơ đồ phòng học', 'Hoàn thiện sơ đồ tầng và thông tin sức chứa của từng phòng.', 'DONE', 'MEDIUM', 'a2222222-2222-4222-8222-222222222222', now() - interval '3 days', ARRAY['Thiết kế', 'Phòng học'], now() - interval '18 days'),
('t14', 'p4', 'Sửa lỗi trùng lịch đặt phòng', 'Ngăn hai yêu cầu được duyệt cùng thời điểm cho một phòng học.', 'IN_PROGRESS', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() - interval '1 day', ARRAY['Lịch phòng', 'Lỗi'], now() - interval '10 days'),
('t15', 'p4', 'Kiểm thử thông báo đổi phòng', 'Kiểm tra thông báo tới giảng viên và sinh viên khi phòng học thay đổi.', 'REVIEW', 'HIGH', 'a4444444-4444-4444-8444-444444444444', now() + interval '3 days', ARRAY['Kiểm thử', 'Thông báo'], now() - interval '6 days'),
('t16', 'p4', 'Chuẩn bị hướng dẫn cho giảng viên', 'Soạn hướng dẫn tạo yêu cầu và theo dõi trạng thái đặt phòng.', 'TODO', 'MEDIUM', 'a5555555-5555-4555-8555-555555555555', now() + interval '10 days', ARRAY['Tài liệu', 'Giảng viên'], now() - interval '1 day');

update tasks set completed_at = case id
  when 't1' then now() - interval '18 days'
  when 't2' then now() - interval '11 days'
  when 't6' then now() - interval '14 days'
  when 't10' then now() - interval '22 days'
  when 't11' then now() - interval '19 days'
  when 't12' then now() - interval '15 days'
  when 't13' then now() - interval '5 days'
end where status = 'DONE';

insert into subtasks (id, task_id, title, completed, assignee_id) values
('st1', 't1', 'Kết nối máy chủ xác thực', true, 'a1111111-1111-4111-8111-111111111111'),
('st2', 't1', 'Kiểm tra đăng xuất trên nhiều thiết bị', true, 'a4444444-4444-4444-8444-444444444444'),
('st3', 't3', 'Kiểm tra trường thông tin bắt buộc', true, 'a4444444-4444-4444-8444-444444444444'),
('st4', 't3', 'Kiểm tra tải ảnh đại diện', false, 'a4444444-4444-4444-8444-444444444444'),
('st5', 't4', 'Đo thời gian phản hồi hiện tại', true, 'a3333333-3333-4333-8333-333333333333'),
('st6', 't4', 'Tối ưu truy vấn danh sách học phí', false, 'a3333333-3333-4333-8333-333333333333'),
('st7', 't7', 'Kiểm tra mục tiêu thực tập', true, 'a3333333-3333-4333-8333-333333333333'),
('st8', 't7', 'Gửi phản hồi cho sinh viên', false, 'a3333333-3333-4333-8333-333333333333'),
('st9', 't8', 'Chuẩn hóa tên cột dữ liệu', true, 'a4444444-4444-4444-8444-444444444444'),
('st10', 't8', 'Đối chiếu tuần còn thiếu', false, 'a4444444-4444-4444-8444-444444444444'),
('st11', 't14', 'Tái hiện trường hợp trùng lịch', true, 'a3333333-3333-4333-8333-333333333333'),
('st12', 't14', 'Bổ sung kiểm tra trước khi duyệt', false, 'a3333333-3333-4333-8333-333333333333'),
('st13', 't15', 'Kiểm tra thông báo trên trình duyệt', true, 'a4444444-4444-4444-8444-444444444444'),
('st14', 't15', 'Kiểm tra nội dung thư điện tử', false, 'a4444444-4444-4444-8444-444444444444'),
('st15', 't16', 'Chụp ảnh từng bước thao tác', false, 'a5555555-5555-4555-8555-555555555555');

insert into comments (id, task_id, user_id, text, created_at) values
('c1', 't3', 'a4444444-4444-4444-8444-444444444444', 'Đã kiểm tra luồng cập nhật thông tin, còn lỗi ở bước tải ảnh.', now() - interval '5 days'),
('c2', 't4', 'a3333333-3333-4333-8333-333333333333', 'Thời gian tải đã giảm rõ rệt sau khi tối ưu truy vấn.', now() - interval '2 days'),
('c3', 't7', 'a1111111-1111-4111-8111-111111111111', 'Ưu tiên xử lý các đề cương đang quá hạn trong hôm nay.', now() - interval '1 day'),
('c4', 't8', 'a4444444-4444-4444-8444-444444444444', 'Còn hai sinh viên thiếu nhật ký tuần gần nhất.', now() - interval '1 day'),
('c5', 't14', 'a3333333-3333-4333-8333-333333333333', 'Đã xác định nguyên nhân do kiểm tra lịch chạy sau bước duyệt.', now());

insert into notifications (id, user_id, title, message, type, read, created_at, task_id) values
('n1', 'a1111111-1111-4111-8111-111111111111', 'Công việc sắp đến hạn', 'Tối ưu trang tra cứu học phí sẽ đến hạn vào ngày mai.', 'STATUS_CHANGE', false, now() - interval '1 day', 't4'),
('n2', 'a3333333-3333-4333-8333-333333333333', 'Công việc đã quá hạn', 'Phê duyệt đề cương thực tập cần được cập nhật tiến độ.', 'ASSIGNMENT', false, now() - interval '2 days', 't7'),
('n3', 'a4444444-4444-4444-8444-444444444444', 'Có bình luận mới', 'Quản trị viên đã phản hồi về công việc phê duyệt đề cương.', 'COMMENT', true, now() - interval '1 day', 't7'),
('n4', 'a5555555-5555-4555-8555-555555555555', 'Công việc mới được giao', 'Bạn phụ trách chuẩn bị hướng dẫn cho giảng viên.', 'ASSIGNMENT', false, now(), 't16');

alter table tasks enable trigger trg_notify_task_assignment;
alter table tasks enable trigger trg_notify_task_status_change;
alter table comments enable trigger trg_notify_new_comment;


do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception
  when duplicate_object then
    raise notice 'Trigger on_auth_user_created already exists.';
  when insufficient_privilege then
    raise notice 'Skip create trigger on auth.users (not owner). Demo seed vẫn dùng được; user mới có thể cần tạo profile thủ công hoặc chạy seed:auth.';
end $$;
