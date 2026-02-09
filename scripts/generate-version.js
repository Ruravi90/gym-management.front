const fs = require('fs');
const path = require('path');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

// Parse current version
let [major, minor, patch] = packageJson.version.split('.').map(Number);

// Increment patch version
patch++;
const newVersion = `${major}.${minor}.${patch}`;

// Update package.json object
packageJson.version = newVersion;

// Write updated package.json back to file
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json version to ${newVersion}`);
} catch (error) {
  console.warn('Could not write to package.json (likely in a read-only environment). Skipping version increment in file.', error.message);
}

const timestamp = new Date().toISOString();
const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const versionData = {
  version: newVersion,
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

console.log(`Version ${newVersion} generated at ${filePath}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Hash: ${hash}`);
