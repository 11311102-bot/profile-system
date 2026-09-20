const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error("啟動失敗：SESSION_SECRET 必須設定，且至少需要 32 個字元。");
  process.exit(1);
}

if (
  !ADMIN_PASSWORD ||
  ADMIN_PASSWORD.trim().toLowerCase() === "change_me"
) {
  console.error("啟動失敗：ADMIN_PASSWORD 不可為空，也不可使用 change_me。");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "童兆瑜" },
    studentId: { type: String, default: "" },
    department: { type: String, default: "資訊工程學系" },
    email: { type: String, default: "" },
    bio: { type: String, default: "歡迎來到我的個人資料頁面。" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Profile = mongoose.model("Profile", profileSchema);

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 1000
    }
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "登入嘗試次數過多，請稍後再試。" }
});

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "請先登入。" });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/profile", async (req, res) => {
  const profile = await Profile.findOne().select("-__v");
  res.json(profile);
});

app.get("/api/session", (req, res) => {
  res.json({
    loggedIn: Boolean(req.session.userId),
    username: req.session.username || null
  });
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "帳號或密碼錯誤。" });
  }

  req.session.regenerate((error) => {
    if (error) {
      return res.status(500).json({ message: "登入失敗。" });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.json({ message: "登入成功。" });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "已登出。" });
  });
});

app.put("/api/profile", requireLogin, async (req, res) => {
  const fields = ["name", "studentId", "department", "email", "bio"];
  const updates = {};

  for (const field of fields) {
    if (typeof req.body[field] === "string") {
      updates[field] = req.body[field].trim().slice(0, 500);
    }
  }

  const profile = await Profile.findOneAndUpdate({}, updates, {
    new: true,
    upsert: true,
    runValidators: true
  }).select("-__v");

  res.json(profile);
});

app.use(express.static(path.join(__dirname, "public")));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "伺服器發生錯誤。" });
});

async function startServer() {
  await mongoose.connect(MONGO_URI);

  const username = process.env.ADMIN_USERNAME;
  const existingUser = await User.findOne({ username });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({ username, passwordHash });
    console.log("管理員帳號已建立。");
  }

  if (!(await Profile.findOne())) {
    await Profile.create({});
    console.log("預設個人資料已建立。");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`網站已啟動，連接埠：${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("啟動失敗：", error);
  process.exit(1);
});
