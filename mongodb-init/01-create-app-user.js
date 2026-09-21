const fs = require("fs");
const appPassword = fs
  .readFileSync("/run/secrets/mongo_app_password", "utf8")
  .trim();
const appDb = db.getSiblingDB("profiledb");

if (!appDb.getUser(process.env.MONGO_APP_USER)) {
  appDb.createUser({
    user: process.env.MONGO_APP_USER,
    pwd: appPassword,
    roles: [{ role: "readWrite", db: "profiledb" }]
  });
}
