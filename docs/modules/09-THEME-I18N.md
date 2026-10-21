# Module 09 — Theme và đa ngôn ngữ

## Mục tiêu

Cho phép chuyển dark/light mode và English/Tiếng Việt mà không cần thư viện i18n ngoài.

## State

`useUIState.ts` quản lý:

- `darkMode`
- `language`
- Hàm `t(key)`

## Persist

LocalStorage keys:

```text
FASTBOARD-theme
FASTBOARD-lang
```

Khi theme thay đổi, hook thêm/xóa class `dark` trên `document.documentElement`.

## Translation

`src/translations.ts` chứa dictionary:

```text
en
vi
```

Component gọi:

```ts
t('newTask')
```

Nếu key không tồn tại, helper trả chính key để UI không crash.

## UI entry

- `HeaderLanguage.tsx`: đổi ngôn ngữ.
- `HeaderControls.tsx`: đổi theme.
- LoginScreen nhận language prop và có bộ text riêng.

## Không liên quan database

Theme/language là preference local, không lưu Supabase.

## Hạn chế

- Một số toast và label động còn hard-code English.
- Không dùng react-i18next.
- Dictionary phẳng, chưa namespace.
- Không đồng bộ preference giữa thiết bị.

## Câu hỏi bảo vệ

### Vì sao không lưu theme trong database?

Đây là preference UI nhẹ; localStorage đủ cho phạm vi MVP và hoạt động trước khi login.

### Dark mode hoạt động thế nào?

Tailwind dark variants dựa trên class `dark` ở root HTML.

## File liên quan

- `src/hooks/modules/useUIState.ts`
- `src/translations.ts`
- `src/components/layout/header/HeaderLanguage.tsx`
- `src/components/layout/header/HeaderControls.tsx`
