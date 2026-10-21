# Module 08 — AI qua Supabase Edge Functions

## Mục tiêu

Giữ AI hữu ích cho workflow nhưng không để Groq API key trong browser.

Hai chức năng:

1. Generate Subtasks.
2. Suggest Priority.

## Kiến trúc

```text
TaskDetails buttons
→ useTaskForm handlers
→ aiService
→ supabase.functions.invoke
→ Supabase gateway kiểm tra JWT
→ Edge Function
→ Groq API
→ validate response
→ form state
```

## Client

`src/services/aiService.ts` chỉ:

- Gọi `generate-subtasks`.
- Gọi `suggest-priority`.
- Kiểm tra response shape.
- Ném error để UI hiển thị toast.

Client không import Groq SDK và không biết API key.

## Shared Edge gateway

`supabase/functions/_shared/groq.ts`:

- Đọc `Deno.env.get('GROQ_API_KEY')`.
- Gọi Groq REST endpoint.
- Dùng model `openai/gpt-oss-20b`.
- Thiết lập CORS.
- Yêu cầu Authorization header.
- Chuẩn hóa JSON response/error.

Supabase gateway verify JWT mặc định khi deploy không dùng `--no-verify-jwt`.

## Generate Subtasks

Input:

```json
{
  "title": "Implement login",
  "description": "Use Supabase Auth"
}
```

Output:

```json
{
  "subtasks": [
    "Create login form",
    "Connect Supabase Auth",
    "Handle session restore"
  ]
}
```

Function:

- Giới hạn input length.
- Yêu cầu raw JSON array.
- Loại markdown fence.
- Chỉ nhận string hợp lệ.
- Giới hạn tối đa 5 subtask.

## Suggest Priority

Input gồm title và description.

Output:

```json
{
  "priority": "HIGH"
}
```

Edge Function chỉ trả `LOW`, `MEDIUM`, `HIGH`; nếu text không rõ thì dùng `MEDIUM`.

## Human-in-the-loop

Handlers trong `useTaskForm` chỉ gọi:

- `setSubtasks`
- `setPriority`

Không gọi `onSave`, `useEntityOperations` hoặc `supabase.from('tasks')`.

Người dùng có thể:

- Sửa gợi ý.
- Xóa gợi ý.
- Đóng modal để bỏ toàn bộ.
- Bấm Save để chấp nhận.

## Bảo mật

- `GROQ_API_KEY` là Edge Secret.
- Không inject key trong `vite.config.ts`.
- Không để key trong `.env` frontend.
- Không dùng `dangerouslyAllowBrowser`.
- Không cài `groq-sdk` trong package frontend.

## Deploy

```bash
supabase login
supabase link --project-ref your_project_ref
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase functions deploy generate-subtasks
supabase functions deploy suggest-priority
```

## Lỗi `Cannot find name 'Deno'`

`Deno` là global của Edge Runtime, không phải browser API. Workspace dùng:

```text
supabase/functions/deno.d.ts
```

và triple-slash reference để TypeScript server nhận diện type. File declaration chỉ phục vụ editor; runtime vẫn dùng Deno thật của Supabase.

## Hạn chế

- Phụ thuộc Groq quota/network.
- Chưa có retry, cache hoặc rate limit riêng.
- Không có fallback model.
- Chưa có automated integration test cho Edge Functions.

## Câu hỏi bảo vệ

### Tại sao không gọi Groq trực tiếp từ React?

Browser bundle có thể bị đọc. Đặt key ở frontend sẽ lộ secret.

### Tại sao dùng Edge Function?

Giữ secret server-side, xác thực user bằng JWT và chuẩn hóa input/output trước khi trả về client.

## File liên quan

- `src/services/aiService.ts`
- `src/hooks/useTaskForm.ts`
- `src/components/task-modal/TaskDetails.tsx`
- `supabase/functions/_shared/groq.ts`
- `supabase/functions/generate-subtasks/index.ts`
- `supabase/functions/suggest-priority/index.ts`
