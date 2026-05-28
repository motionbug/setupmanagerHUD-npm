/**
 * sync-assets.js
 *
 * Copies built UI assets from the core package to the consumer's
 * public directory. Overwrites existing files (assets are immutable
 * with content hashes in filenames).
 *
 * Called via: node ./node_modules/@motionbug/setupmanagerhud-core/dist-scripts/sync-assets.js
 */

import fs from 'fs';
import path from 'path';

const sourceDir = path.join(
  process.cwd(),
  'node_modules',
  '@motionbug',
  'setupmanagerhud-core',
  'dist'
);
const destDir = path.join(process.cwd(), 'public');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${path.relative(process.cwd(), dest)}`);
  }
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Asset source directory not found at ${sourceDir}`);
    console.error('Run "npm install" to install the core package first.');
    process.exit(1);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created public directory: ${destDir}`);
  }

  console.log('Syncing UI assets from @motionbug/setupmanagerhud-core...');
  copyRecursive(sourceDir, destDir);
  console.log('Asset sync complete.');
}

main();
