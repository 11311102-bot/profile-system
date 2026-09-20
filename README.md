# 個人資料管理系統

本專案是在 Ubuntu Server 上，以 Docker Compose 部署的個人資料管理網站。訪客可以瀏覽公開資料，管理員登入後可以修改資料，內容儲存在 MongoDB。

## 功能

- 顯示姓名、學號、科系、電子郵件與自我介紹
- 管理員登入及登出
- 登入後編輯個人資料
- Session 登入狀態管理
- MongoDB 資料持久化
- Docker Compose 自動部署

## 使用技術

- Ubuntu Server 26.04 LTS
- Docker 與 Docker Compose
- Node.js 22
- Express
- MongoDB 8.2
- Mongoose
- HTML、CSS、JavaScript
- UFW
- SSH 金鑰驗證

## 系統架構

```mermaid
flowchart TD
    A[Windows 瀏覽器] -->|HTTP 3000| B[Node.js 與 Express 容器]
    B -->|Mongoose 27017| C[MongoDB 容器]
    C --> D[(Docker Volume)]
    E[Windows PowerShell] -->|SSH 金鑰 2222| F[Ubuntu Server]
    F --> B
```

## 專案結構

```text
profile-system/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── profile.js
│   ├── admin.js
│   └── style.css
├── compose.yaml
├── .env
├── .gitignore
└── README.md
```

## 啟動方式

1. 建立 `.env` 並設定必要的環境變數。
2. 建立並啟動服務：

```bash
docker compose up -d --build
```

3. 檢查容器狀態：

```bash
docker compose ps
```

4. 開啟網站：

```text
http://127.0.0.1:3000
```

## 安全設定

- SSH 僅允許公開金鑰驗證
- 禁止 SSH 密碼登入及 root 登入
- UFW 預設拒絕傳入連線
- `.env` 不會提交至 Git
- 管理員密碼使用雜湊方式儲存
- MongoDB 未直接對外開放連接埠
- Express 使用 Helmet、Session 與登入速率限制

## 停止服務

```bash
docker compose down
```

## 作者

童兆瑜
## 部署與網路安全

本專案採用單體式架構，由 Express 同時提供 `public/` 靜態前端檔案與 `/api` 後端 API，因此前端與後端不分成兩個獨立服務。

Docker 僅將網站連接埠綁定至 Ubuntu 本機的 `127.0.0.1:3000`，避免容器連接埠直接暴露至外部網路。Windows 可使用 SSH 通道安全存取：

```powershell
ssh -p 2222 -L 3001:127.0.0.1:3000 <ubuntu-user>@127.0.0.1
```

建立通道後，使用瀏覽器開啟 `http://127.0.0.1:3001`。

- `.env` 已加入 `.gitignore`，不可提交至 Git。
- MongoDB 使用獨立且僅具 `profiledb` 讀寫權限的應用程式帳號。
- MongoDB 初始化帳號只會在第一次建立資料卷時生效；修改 `.env` 不會自動更換既有資料庫密碼。
- 本機測試透過 SSH 加密通道連線。
- 若部署至公開網路，應使用反向代理與 HTTPS，並啟用 Express `trust proxy`、安全 Cookie及 Docker secrets。
