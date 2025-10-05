const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// Support either firebase-service-account.json or firebase-service-account.json.json
const primaryPath = path.join(__dirname, 'firebase-service-account.json');
const fallbackPath = path.join(__dirname, 'firebase-service-account.json.json');
const saPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;

if (!fs.existsSync(saPath)) {
  throw new Error('Firebase service account file not found in server/config');
}

const serviceAccount = require(saPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
