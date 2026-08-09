import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActiveSponsorship,
  getLocalSponsorshipPreview,
} from '../sponsorship.js';


function buildConfig(overrides = {}) {
  return {
    placementsEnabled: true,
    sponsorship: {
      enabled: true,
      label: 'Sponsored',
      headline: 'Creator tools',
      description: 'A clearly separated direct sponsorship.',
      imageSrc: 'assets/sponsors/example.png',
      imageAlt: 'Example sponsor',
      destinationUrl: 'https://sponsor.example/offer',
      linkLabel: 'Visit sponsor',
      startsAt: '2026-08-01T00:00:00Z',
      endsAt: '2026-09-01T00:00:00Z',
      ...overrides,
    },
  };
}


const ACTIVE_DATE = Date.parse('2026-08-15T00:00:00Z');


test('sponsorship remains hidden when the master flag is disabled', () => {
  const config = buildConfig();
  config.placementsEnabled = false;

  assert.equal(getActiveSponsorship(config, ACTIVE_DATE), null);
});


test('sponsorship remains hidden when its entry is disabled', () => {
  const config = buildConfig({ enabled: false });

  assert.equal(getActiveSponsorship(config, ACTIVE_DATE), null);
});


test('active sponsorship returns sanitized display fields', () => {
  assert.deepEqual(
    getActiveSponsorship(buildConfig(), ACTIVE_DATE),
    {
      label: 'Sponsored',
      headline: 'Creator tools',
      description: 'A clearly separated direct sponsorship.',
      imageSrc: 'assets/sponsors/example.png',
      imageAlt: 'Example sponsor',
      destinationUrl: 'https://sponsor.example/offer',
      linkLabel: 'Visit sponsor',
    },
  );
});


test('sponsorship can omit its local image', () => {
  const result = getActiveSponsorship(
    buildConfig({ imageSrc: '', imageAlt: '' }),
    ACTIVE_DATE,
  );

  assert.equal(result.imageSrc, '');
  assert.equal(result.imageAlt, '');
});


test('sponsorship rejects non-HTTPS destinations', () => {
  for (const destinationUrl of [
    'http://sponsor.example',
    'javascript:alert(1)',
    '/relative-link',
  ]) {
    assert.equal(
      getActiveSponsorship(
        buildConfig({ destinationUrl }),
        ACTIVE_DATE,
      ),
      null,
    );
  }
});


test('sponsorship rejects remote or unsafe image paths', () => {
  for (const imageSrc of [
    'https://sponsor.example/image.png',
    'assets/sponsors/../private.png',
    'assets/other/image.png',
  ]) {
    assert.equal(
      getActiveSponsorship(buildConfig({ imageSrc }), ACTIVE_DATE),
      null,
    );
  }
});


test('sponsorship respects its start and end dates', () => {
  const config = buildConfig();

  assert.equal(
    getActiveSponsorship(
      config,
      Date.parse('2026-07-31T23:59:59Z'),
    ),
    null,
  );
  assert.equal(
    getActiveSponsorship(
      config,
      Date.parse('2026-09-01T00:00:00Z'),
    ),
    null,
  );
});


test('sponsorship rejects missing content and invalid schedules', () => {
  for (const overrides of [
    { headline: '' },
    { description: '' },
    { linkLabel: '' },
    { imageAlt: '' },
    { startsAt: 'not-a-date' },
    {
      startsAt: '2026-09-01T00:00:00Z',
      endsAt: '2026-08-01T00:00:00Z',
    },
  ]) {
    assert.equal(
      getActiveSponsorship(buildConfig(overrides), ACTIVE_DATE),
      null,
    );
  }
});


test('local sponsorship preview requires localhost and query flag', () => {
  const preview = getLocalSponsorshipPreview({
    hostname: '127.0.0.1',
    search: '?sponsor-preview=1',
  });

  assert.equal(preview.isPreview, true);
  assert.equal(preview.label, 'Sponsored');
  assert.equal(preview.imageSrc, '');

  for (const locationObject of [
    {
      hostname: 'premierfoodprocessing.github.io',
      search: '?sponsor-preview=1',
    },
    {
      hostname: 'localhost',
      search: '',
    },
  ]) {
    assert.equal(
      getLocalSponsorshipPreview(locationObject),
      null,
    );
  }
});
