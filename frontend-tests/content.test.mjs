import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(
  new URL('../index.html', import.meta.url),
  'utf8',
);
const privacyHtml = await readFile(
  new URL('../privacy.html', import.meta.url),
  'utf8',
);
const termsHtml = await readFile(
  new URL('../terms.html', import.meta.url),
  'utf8',
);
const contactHtml = await readFile(
  new URL('../contact.html', import.meta.url),
  'utf8',
);
const copyrightHtml = await readFile(
  new URL('../copyright.html', import.meta.url),
  'utf8',
);
const supportedPlatformsHtml = await readFile(
  new URL('../supported-platforms.html', import.meta.url),
  'utf8',
);
const stylesCss = await readFile(
  new URL('../styles.css', import.meta.url),
  'utf8',
);
const scriptJs = await readFile(
  new URL('../script.js', import.meta.url),
  'utf8',
);
const revenueConfigJs = await readFile(
  new URL('../revenue-config.js', import.meta.url),
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


test('privacy page describes live temporary processing', () => {
  assert.match(privacyHtml, /up to 10 minutes/);
  assert.match(privacyHtml, /up to 5 minutes/);
  assert.match(privacyHtml, /scheduled for deletion after delivery/);
  assert.doesNotMatch(privacyHtml, /static demonstration/i);
  assert.doesNotMatch(privacyHtml, /add your business contact/i);
});


test('terms page describes the live authorised workflow', () => {
  assert.match(termsHtml, /public-media analysis/);
  assert.match(termsHtml, /short-lived, one-time download job/);
  assert.match(termsHtml, /digital rights management/);
  assert.doesNotMatch(termsHtml, /front-end demonstration/i);
  assert.doesNotMatch(termsHtml, /future backend services/i);
});


test('public pages use the approved monitored contact', () => {
  for (const page of [
    indexHtml,
    privacyHtml,
    termsHtml,
    contactHtml,
    copyrightHtml,
  ]) {
    assert.match(page, /flowsnap\.support@gmail\.com|contact\.html/);
  }

  assert.doesNotMatch(privacyHtml, /contact channel.+planned/i);
  assert.doesNotMatch(termsHtml, /contact.+planned under SEO-003/i);
});


test('contact page warns against sharing credentials', () => {
  assert.match(contactHtml, /Do not email passwords/);
  assert.match(contactHtml, /never ask for your source-platform password/);
});


test('copyright page provides a takedown process', () => {
  assert.match(copyrightHtml, /Copyright and Takedown Requests/);
  assert.match(copyrightHtml, /Information to include/);
  assert.match(copyrightHtml, /submitted in good faith/);
  assert.match(copyrightHtml, /does not control or permanently host/);
});


test('platform page reports verified local and production results', () => {
  for (const platform of [
    'TikTok',
    'Instagram',
    'Facebook',
    'YouTube',
  ]) {
    assert.match(supportedPlatformsHtml, new RegExp(`<h2>${platform}</h2>`));
  }

  assert.match(
    supportedPlatformsHtml,
    /<strong>Last verified:<\/strong> August 7, 2026/,
  );
  assert.match(
    supportedPlatformsHtml,
    /<strong>Production workflow:<\/strong> Currently unavailable\./,
  );
});


test('platform page discloses current limitations', () => {
  assert.match(supportedPlatformsHtml, /intermittently refuse extraction/);
  assert.match(supportedPlatformsHtml, /format labelled with audio/);
  assert.match(
    supportedPlatformsHtml,
    /YouTube is temporarily refusing access/,
  );
  assert.match(
    supportedPlatformsHtml,
    /does not guarantee that every link/,
  );
});


test('homepage links to current platform status', () => {
  assert.match(indexHtml, /href="supported-platforms\.html"/);
});


test('mobile download controls allow long filenames to wrap', () => {
  assert.match(
    stylesCss,
    /\.prepare-status\s*\{[^}]*overflow-wrap:\s*anywhere/s,
  );
  assert.match(
    stylesCss,
    /@media \(max-width: 600px\)[\s\S]*\.result-details\s*\{[^}]*min-width:\s*0/s,
  );
  assert.match(
    stylesCss,
    /@media \(max-width: 600px\)[\s\S]*\.prepare-button\s*\{[^}]*min-height:\s*48px/s,
  );
});


test('revenue placement is disabled and separate from download controls', () => {
  const resultCardStart = indexHtml.indexOf(
    '<section class="media-result"',
  );
  const resultCardEnd = indexHtml.indexOf(
    '</section>',
    resultCardStart,
  );
  const placementStart = indexHtml.indexOf(
    'id="result-revenue-placement"',
  );

  assert.match(
    indexHtml,
    /<aside[\s\S]*id="result-revenue-placement"[\s\S]*hidden/,
  );
  assert.match(indexHtml, /Sponsored content/);
  assert.match(
    indexHtml,
    /separate from FlowSnap's media and download controls/,
  );
  assert.ok(resultCardStart >= 0);
  assert.ok(resultCardEnd > resultCardStart);
  assert.ok(placementStart > resultCardEnd);
  assert.match(
    revenueConfigJs,
    /placementsEnabled:\s*false/,
  );
});


test('revenue placement reserves responsive space only when visible', () => {
  assert.match(
    stylesCss,
    /\.revenue-placement\[hidden\]\s*\{[^}]*display:\s*none/s,
  );
  assert.match(
    stylesCss,
    /\.revenue-placement-inner\s*\{[^}]*min-height:\s*120px/s,
  );
  assert.match(
    stylesCss,
    /@media \(max-width: 600px\)[\s\S]*\.revenue-placement-inner\s*\{[^}]*min-height:\s*100px/s,
  );
});


test('disabled revenue component has no provider or tracking requests', () => {
  assert.match(
    indexHtml,
    /<img\s+class="revenue-placement-image"(?![^>]*\ssrc=)[^>]*>/s,
  );
  assert.doesNotMatch(
    indexHtml,
    /doubleclick|googlesyndication|adservice|tracking-pixel/i,
  );
  assert.doesNotMatch(
    scriptJs,
    /doubleclick|googlesyndication|adservice|tracking-pixel/i,
  );
});
