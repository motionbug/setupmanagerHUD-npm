#!/usr/bin/env node
/**
 * sync-all.js
 *
 * Runs both migration and asset sync. Called as CLI bin command.
 * Usage: npx setupmanagerhud-sync
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('=== Setup Manager HUD Sync ===\n');

console.log('1. Syncing migrations...');
execSync(`node ${path.join(__dirname, 'sync-migrations.js')}`, { stdio: 'inherit' });

console.log('\n2. Syncing UI assets...');
execSync(`node ${path.join(__dirname, 'sync-assets.js')}`, { stdio: 'inherit' });

console.log('\n=== Sync complete ===');
console.log('Run "npm run deploy" to deploy your changes.');
