import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(
  new URL('../index.html', import.meta.url),
  'utf8',
);


test('homepage describes the live download workflow', () => {
  assert.match(
    indexHtml,
    /Download authorised public media/,
  );
  assert.match(
    indexHtml,
    /short-lived, one-time download/,
  );
});


test('homepage does not describe a future demonstration', () => {
  assert.doesNotMatch(
    indexHtml,
    /does FlowSnap download real files yet/i,
  );
  assert.doesNotMatch(
    indexHtml,
    /backend service can be connected later/i,
  );
  assert.doesNotMatch(
    indexHtml,
    /media processing is intentionally not included/i,
  );
});


test('homepage keeps responsible-use boundaries visible', () => {
  assert.match(
    indexHtml,
    /Only save content you own or have permission to download\./,
  );
  assert.match(
    indexHtml,
    /does not bypass private media, protected content or platform access controls\./,
  );
});
