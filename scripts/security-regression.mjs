import assert from 'node:assert/strict';
import { createServer } from '../dist/server.js';
import { setFreewayApiKey } from '../dist/config.js';

setFreewayApiKey('secret');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      assert(address && typeof address === 'object');
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const server = createServer({
  routeChatCompletion: async () => {
    throw new Error('security regression should not route chat completions');
  },
});
const baseUrl = await listen(server);
const localOrigin = baseUrl;

try {
  const evilPreflight = await fetch(`${baseUrl}/api/config/keys`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://evil.example',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(evilPreflight.status, 403);
  assert.equal(evilPreflight.headers.get('access-control-allow-origin'), null);

  const evilWrite = await fetch(`${baseUrl}/api/config/keys`, {
    method: 'POST',
    headers: {
      Origin: 'https://evil.example',
      'Content-Type': 'application/json',
      Authorization: 'Bearer secret',
    },
    body: JSON.stringify({ keys: {} }),
  });
  assert.equal(evilWrite.status, 403);
  assert.equal(evilWrite.headers.get('access-control-allow-origin'), null);

  const localNoAuth = await fetch(`${baseUrl}/api/usage`, {
    method: 'DELETE',
    headers: { Origin: localOrigin },
  });
  assert.equal(localNoAuth.status, 401);
  assert.equal(localNoAuth.headers.get('access-control-allow-origin'), localOrigin);

  const localAuthed = await fetch(`${baseUrl}/api/usage`, {
    method: 'DELETE',
    headers: {
      Origin: localOrigin,
      Authorization: 'Bearer secret',
    },
  });
  assert.equal(localAuthed.status, 200);
  assert.equal(localAuthed.headers.get('access-control-allow-origin'), localOrigin);

  const publicHealth = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'https://evil.example' },
  });
  assert.equal(publicHealth.status, 200);
  assert.equal(publicHealth.headers.get('access-control-allow-origin'), null);

  console.log('security regression checks passed');
} finally {
  setFreewayApiKey('');
  await close(server);
}
