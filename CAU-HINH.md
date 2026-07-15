# CẤU HÌNH — Threads ⇄ Lark Base (bản điền sẵn cho Trung Nguyễn)

> Hướng dẫn cấu hình riêng cho hệ thống đã dựng. Bảng đã tạo tự động, giá trị Lark đã điền sẵn.
> Bạn chỉ cần làm **3 việc**: (A) lấy Threads token · (B) nạp Secrets/Variables lên GitHub · (C) nối nút "Đăng" trong Lark.

## ✅ Đã dựng sẵn (không cần làm lại)
| Thứ | Giá trị |
|---|---|
| Lark App ID | `cli_a9216144fa78de1b` |
| Lark Base (app_token) | `Nbbtb21QSaGUqusHr9lj70rYppO` |
| Bảng đăng Threads | **`14.7 Đăng Threads (Meta)`** — id `tblGC9HpQ2YSx9Om` *(đã tạo tự động, đủ 13 cột)* |
| Lark Domain | `https://open.larksuite.com` |
| Repo GitHub | `trungnguyenbridal/mentor_club_threads` |

Bảng nằm trong Base của bạn (mở link Base → tab **14.7 Đăng Threads (Meta)**). Cột máy tự ghi:
`Trạng thái`, `Link bài đăng`, `Threads post ID`, `Đăng lúc`, `Log`.

---

## A. Lấy TOKEN Threads (làm 1 lần, ~5 phút)

Threads dùng token RIÊNG (không phải token Facebook). Làm trên máy:

1. Vào **developers.facebook.com** → App của bạn → **Add use case → "Truy cập API Threads"**.
   Bật quyền `threads_basic` + `threads_content_publish`. Thêm **Redirect URI** = một domain https bạn có
   (ví dụ `https://trungnguyenbridal.com/`). Thêm tài khoản Threads muốn đăng làm **Người kiểm thử** → vào app Threads Accept.
2. Vào **App settings → Basic**, lấy **ID ứng dụng Threads** (khác App ID Facebook) + **App Secret**.
3. Mở link sau trên trình duyệt (thay `<THREADS_APP_ID>` và domain redirect của bạn), bấm **Cho phép**:
   ```
   https://www.threads.com/oauth/authorize?client_id=<THREADS_APP_ID>&redirect_uri=https://trungnguyenbridal.com/&scope=threads_basic,threads_content_publish&response_type=code
   ```
4. Trình duyệt nhảy về `https://trungnguyenbridal.com/?code=XXXXXXXX#_` → copy phần `code` (bỏ `#_` cuối).
5. Đổi code lấy token dài hạn (60 ngày):
   ```bash
   cd mentor_club_threads
   node src/get-token.js <THREADS_APP_ID> <THREADS_APP_SECRET> https://trungnguyenbridal.com/ <CODE>
   ```
   → In ra **`THREADS_ACCESS_TOKEN`** (dán vào Secret) + **`THREADS_USER_ID`** (dán vào Variable).

> ⚠️ 2 cái bẫy: `client_id` phải là **Threads App ID** (không phải App ID Facebook) → nhầm sẽ lỗi 4476002.
> `user_id` từ OAuth không đăng được — engine luôn tự lấy id qua `/me`, cứ điền id mà `get-token.js` in ra.
> Gia hạn token: `GET https://graph.threads.net/v1.0/refresh_access_token?grant_type=th_refresh_token&access_token=<token>`.

---

## B. Nạp GitHub — Secrets & Variables

Repo → **Settings → Secrets and variables → Actions**.

### B1. Tab **Variables** (giá trị thường — điền sẵn được ngay)
| Tên | Giá trị |
|---|---|
| `LARK_APP_ID` | `cli_a9216144fa78de1b` |
| `LARK_BASE_ID` | `Nbbtb21QSaGUqusHr9lj70rYppO` |
| `LARK_DOMAIN` | `https://open.larksuite.com` |
| `THREADS_TABLE_NAME` | `14.7 Đăng Threads (Meta)` |
| `THREADS_TABLE_ID` | `tblGC9HpQ2YSx9Om` |
| `THREADS_USER_ID` | *(id mà get-token.js in ra ở bước A5)* |
| `THREADS_MEDIA_BASE_URL` | *(chỉ cần nếu đăng ẢNH/VIDEO — vd `https://trungnguyenbridal.com`)* |

### B2. Tab **Secrets** (bí mật)
| Tên | Nội dung |
|---|---|
| `LARK_APP_SECRET` | secret app Lark của bạn |
| `THREADS_ACCESS_TOKEN` | token dài hạn ở bước A5 |
| `GH_PAT` | *(cho auto-refresh token — mục E)* PAT scope **repo** để workflow ghi lại Secret |
| `WP_APP_PASSWORD` | *(chỉ khi đăng ẢNH/VIDEO bằng FILE)* Application Password WordPress |

Và thêm **Variable**: `MEDIA_HOST` = `wordpress`, `WP_URL` = `https://trungnguyenbridal.com`, `WP_USER` = *(tài khoản WP)*.

> **Đăng bài chữ (Text) chỉ cần:** Variables B1 (4 dòng đầu) + Secrets `LARK_APP_SECRET` + `THREADS_ACCESS_TOKEN`.
> Ảnh/Video: nếu dán **link công khai** vào cột "Ảnh URL (công khai)" thì KHÔNG cần host; nếu **thả file** vào
> cột "Ảnh/video" thì cần host WordPress (`MEDIA_HOST`/`WP_URL`/`WP_USER`/`WP_APP_PASSWORD`).

### B3. Bật Actions cho fork
Repo là fork → tab **Actions** có thể đang tắt. Mở tab **Actions** → bấm **"I understand… enable workflows"**.

---

## C. Nút "Đăng" trong Lark Base

Bảng 14.7 có sẵn mọi cột, riêng **nút bấm không tạo được qua API** → thêm tay 1 lần:

1. Trong bảng `14.7`, thêm cột kiểu **Button (Nút)**, đặt tên **`Đăng`**, đặt sau cột `Lịch đăng bài`.
2. Vào **Automation (Tự động hoá)** của Base → tạo luồng:
   - **Trigger:** *Khi bấm nút `Đăng`*.
   - **Action:** *Gửi yêu cầu HTTP (Send request)*.

   > ⚠️ **QUAN TRỌNG — điền vào TỪNG Ô RIÊNG, KHÔNG dán cả khối vào ô URL** (dán cả khối sẽ báo lỗi
   > *"ký tự điều khiển không hợp lệ trong URL"*).

   | Ô trong Lark | Điền chính xác |
   |---|---|
   | **URL** | `https://api.github.com/repos/trungnguyenbridal/mentor_club_threads/dispatches` |
   | **Method (Phương thức)** | `POST` |
   | **Header 1** | Key: `Authorization` · Value: `Bearer <GITHUB_PAT_scope_repo>` |
   | **Header 2** | Key: `Accept` · Value: `application/vnd.github+json` |
   | **Header 3** | Key: `X-GitHub-Api-Version` · Value: `2022-11-28` |
   | **Body (JSON)** | `{"event_type":"dang-threads","client_payload":{"record_id":"<map: Record ID>"}}` |

   - ✅ `event_type` là **`dang-threads`** (có chữ **s** — viết `dang-thread` là sai, không kích hoạt được).
   - Map `record_id` = cột **Record ID** của bản ghi đang bấm.
3. Bấm nút ở 1 dòng → GitHub Actions chạy `dang-threads` → **đăng đúng dòng đó** (bỏ qua canh giờ) → ghi
   **Link bài đăng** + `Trạng thái = Thành công` về bảng.

**Biến thể:**
- **Đăng tất cả dòng "Chờ đăng":** Body `{"event_type":"dang-threads"}` (không có record_id).
- **Kéo số liệu (view/like) về bảng:** Body `{"event_type":"so-lieu-threads"}`.
- **Tạo lại/đồng bộ bảng:** Body `{"event_type":"init-tables"}`.

> `<GITHUB_PAT_scope_repo>` chỉ đặt trong cấu hình Automation của Lark, **không** ghi vào repo.

---

## D. Chạy thử & lấy URL bài đăng

1. Trong bảng 14.7, thêm 1 dòng: điền **Nội dung** (≤500 ký tự), đặt **Trạng thái = Chờ đăng**.
2. Đăng theo 1 trong 3 cách:
   - **Nút Lark** (mục C) — tiện nhất.
   - **GitHub:** tab Actions → **dang-threads → Run workflow** (tick `dry_run` để thử trước).
   - **Máy cá nhân:**
     ```bash
     cp .env.example .env 2>/dev/null   # (repo không có .env.example — tự tạo .env, xem biến ở mục B)
     node src/post-threads.js --dry-run   # thử
     node src/post-threads.js             # đăng thật
     ```
3. Xong: cột **Link bài đăng** hiện **permalink Threads** (đó là *URL bài đăng* trả về), `Trạng thái = Thành công`.
   Lỗi thì xem cột **Log**, sửa, đặt lại `Chờ đăng`, chạy lại.

> **Luật LUÔN DUYỆT:** chỉ dòng `Trạng thái = Chờ đăng` mới được đăng (các trạng thái Ý tưởng/Nháp AI/Chờ duyệt bị bỏ qua). `Comment ebook` (nếu điền) phải **khác nhau từng dòng** — Threads chặn reply trùng.

---

## E. Token tự gia hạn (không bao giờ chết)

Token Threads sống **60 ngày** (theo thời gian, không theo số lần đăng). Workflow **`refresh-token`** tự gia hạn giúp bạn:

- Chạy **ngày 1 & 15 hằng tháng** (cron), hoặc bấm tay: Actions → **refresh-token → Run workflow**.
- Nó gọi API gia hạn → lấy token mới (+60 ngày) → **tự ghi lại vào Secret `THREADS_ACCESS_TOKEN`** bằng `gh secret set`.
- **Cần Secret `GH_PAT`** = PAT scope **repo** (để có quyền ghi Secret). Đặt ở mục B2.

> Điều kiện: token phải **>24h tuổi** (nên đừng chạy ngay sau khi vừa cấp token). Cứ để chạy theo lịch là token luôn sống.
> Gia hạn tay khi cần: `curl "https://graph.threads.net/v1.0/refresh_access_token?grant_type=th_refresh_token&access_token=<TOKEN>"`.

---

## Tình trạng hiện tại (đã chạy thật 2026-07-15)
- ✅ Bảng `14.7 Đăng Threads (Meta)` đã tạo trong Base (id `tblGC9HpQ2YSx9Om`).
- ✅ Token Threads OK — tài khoản **@trungkyvyqn**. **Đã đăng thật 3 bài**: 1 text, 1 ảnh (link), 1 video (link).
- ✅ Engine: fix retry publish (lỗi 4279009) + thêm host **WordPress** cho case file + workflow **auto-refresh token**.
- ⏳ Case **file trong cột Ảnh/video**: cần `WP_USER` + `WP_APP_PASSWORD` để upload lên WordPress rồi đăng.
- ⏳ Bạn cần: **push repo** + **nạp Secrets/Variables** (token/Lark/GH_PAT/WP) + **bật Actions** + thêm **nút Đăng** (mục C).
