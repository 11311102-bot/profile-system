const appDb = db.getSiblingDB("profiledb");

if (!appDb.getUser(process.env.MONGO_APP_USER)) {
  appDb.createUser({
    user: process.env.MONGO_APP_USER,
    pwd: process.env.MONGO_APP_PASSWORD,
    roles: [{ role: "readWrite", db: "profiledb" }]
  });
}
