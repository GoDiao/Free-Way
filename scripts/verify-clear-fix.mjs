/**
 * Manual verification script for issue #27 fix:
 * "Persist cleared usage records to disk"
 *
 * Tests that clear() writes an empty list to .freeway/usage.json
 * so usage does not come back after a restart.
 */
import { readFile } from 'fs/promises';
import path from 'path';
import assert from 'node:assert/strict';
import { usageTracker } from '../dist/usage-tracker.js';

const cacheFile = path.resolve(process.cwd(), '.freeway', 'usage.json');

// ── Step 1: record some usage (flush is async, wait a tick) ─────────────────
await usageTracker.init();
usageTracker.record('gpt-4o', 'test-provider', 100, 50);
await new Promise(r => setTimeout(r, 200)); // let the background flush finish

const before = JSON.parse(await readFile(cacheFile, 'utf-8'));
assert.equal(before.length, 1, 'Expected 1 record on disk before clear()');
console.log('✓ Usage written to disk:', before[0].modelId, '/ callCount:', before[0].callCount);

// ── Step 2: clear usage ──────────────────────────────────────────────────────
const returned = await usageTracker.clear();
assert.equal(returned.length, 1, 'clear() must return the cleared records');
console.log('✓ clear() returned', returned.length, 'record(s)');

// ── Step 3: disk must now be empty (this was the bug) ───────────────────────
const afterClear = JSON.parse(await readFile(cacheFile, 'utf-8'));
assert.equal(afterClear.length, 0, 'BUG: disk still has records after clear()');
console.log('✓ Disk is empty after clear() — fix confirmed');

// ── Step 4: in-memory state is also empty ───────────────────────────────────
assert.equal(usageTracker.getStats().length, 0, 'In-memory records must be cleared too');
console.log('✓ In-memory records cleared');

// ── Step 5: response shape unchanged ────────────────────────────────────────
assert.ok(Array.isArray(returned), 'clear() must return an array (response shape compat)');
console.log('✓ Response shape compatible (returns UsageRecord[])');

console.log('\nAll checks passed — bug fix verified!');
