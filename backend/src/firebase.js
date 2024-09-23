require("dotenv").config({ path: "../.env" });

const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

console.log("Service Account Path:", serviceAccountPath);

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.error("Service account not found");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
