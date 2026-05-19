/**
 * sync-migrations.js
 *
 * Copies migration files from the core package to the consumer's
 * migrations directory. Additive only -- existing files are NOT overwritten.
 *
 * This script is called by postinstall in the consumer's package.json:
 *   "postinstall": "node ./node_modules/@motionbug/setupmanagerhud-core/dist-scripts/sync-migrations.js"
 *
 * Per D-12, D-13: Migrations are additive only. If a consumer has modified
 * a migration file locally, the local version is preserved.
 */

import fs from 'fs';
import path from 'path';

const sourceDir = path.join(
  process.cwd(),
  'node_modules',
  '@motionbug',
  'setupmanagerhud-core',
  'migrations'
);
const destDir = path.join(process.cwd(), 'migrations');

function main() {
  // Check if source directory exists (package installed correctly)
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Migration source directory not found at ${sourceDir}`);
    console.error('This may indicate the package was not installed correctly.');
    process.exit(1);
  }

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created migrations directory: ${destDir}`);
  }

  // Read all migration files from source
  let files;
  try {
    files = fs.readdirSync(sourceDir);
  } catch (err) {
    console.error(`Error reading source directory: ${err.message}`);
    process.exit(1);
  }

  // Copy each migration file if it doesn't already exist (additive only)
  for (const file of files) {
    const sourceFile = path.join(sourceDir, file);
    const destFile = path.join(destDir, file);

    // Only process files, not directories
    if (!fs.statSync(sourceFile).isFile()) {
      continue;
    }

    if (!fs.existsSync(destFile)) {
      try {
        fs.copyFileSync(sourceFile, destFile);
        console.log(`Copied migration: ${file}`);
      } catch (err) {
        console.error(`Error copying ${file}: ${err.message}`);
        // Continue with other files even if one fails
      }
    } else {
      console.log(`Skipped (exists): ${file}`);
    }
  }
}

main();
