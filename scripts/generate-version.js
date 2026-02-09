const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;
const timestamp = new Date().toISOString();
const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const versionData = {
  version: version,
  timestamp: timestamp,
  hash: hash
};

const filePath = path.join(__dirname, '../src/assets/version.json');

// Ensure directory exists
const dir = path.dirname(filePath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(filePath, JSON.stringify(versionData, null, 2));

console.log(`Version ${version} generated at ${filePath}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Hash: ${hash}`);
