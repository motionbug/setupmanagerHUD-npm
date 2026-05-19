/**
 * upgrade.js
 *
 * Updates the @motionbug/setupmanagerhud-core package to the latest version
 * and warns if new migrations need to be applied.
 *
 * Usage: npm run upgrade
 *
 * Per D-06: Uses npm update (not npm install) to respect semver.
 * Per D-07: Compares migrations and warns if new ones found.
 */

import { execSync } from 'child_process';
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
  // Step 1: Update the core package
  console.log('Updating @motionbug/setupmanagerhud-core...');
  try {
    execSync('npm update @motionbug/setupmanagerhud-core', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to update package:', err.message);
    process.exit(1);
  }

  // Step 2: Check if directories exist
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Migration source directory not found at ${sourceDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(destDir)) {
    console.log('No local migrations directory found. Run npm install to sync migrations.');
    return;
  }

  // Step 3: Read source and destination migration files
  const sourceFiles = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.sql'));
  const destFiles = fs.readdirSync(destDir).filter((f) => f.endsWith('.sql'));

  // Find migrations in source but not in destination
  const newMigrations = sourceFiles.filter((f) => !destFiles.includes(f));

  // Step 4: Report results
  if (newMigrations.length > 0) {
    console.log('\n⚠️  New migrations detected:');
    newMigrations.forEach((m) => console.log(`   - ${m}`));
    console.log('\nTo apply these migrations, run:');
    console.log('  npx wrangler d1 migrations apply DB --local');
    console.log('  npx wrangler d1 migrations apply DB --remote');
    console.log('\nOr re-run npm install to sync migration files first.');
  } else {
    console.log('\n✓ All migrations up to date.');
  }
}

main();
