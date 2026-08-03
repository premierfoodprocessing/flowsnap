import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPreparePayload,
  chooseDefaultFormat,
  describeFormat,
  formatFileSize,
} from '../format-utils.mjs';

test('formatFileSize presents decimal file sizes', () => {
  assert.equal(formatFileSize(950), '950 B');
  assert.equal(formatFileSize(1_500_000), '1.5 MB');
  assert.equal(formatFileSize(8_000_000), '8 MB');
});


test('formatFileSize handles unknown sizes', () => {
  assert.equal(formatFileSize(null), 'Size unknown');
  assert.equal(formatFileSize(undefined), 'Size unknown');
  assert.equal(formatFileSize(0), 'Size unknown');
});


test('describeFormat presents combined video and audio', () => {
  const format = {
    format_id: '18',
    extension: 'mp4',
    resolution: '640x360',
    quality: '360p',
    filesize: 1_500_000,
    has_audio: true,
    has_video: true,
  };

  assert.equal(
    describeFormat(format),
    '360p · MP4 · 1.5 MB · Video + audio',
  );
});


test('describeFormat identifies video-only formats', () => {
  const format = {
    format_id: '137',
    extension: 'mp4',
    resolution: '1920x1080',
    quality: '1080p',
    filesize: 8_000_000,
    has_audio: false,
    has_video: true,
  };

  assert.equal(
    describeFormat(format),
    '1080p · MP4 · 8 MB · Video only',
  );
});


test('describeFormat handles direct media with unknown details', () => {
  const format = {
    format_id: 'mp4',
    extension: 'mp4',
    resolution: 'unknown',
    quality: 'unknown',
    filesize: null,
    has_audio: true,
    has_video: true,
  };

  assert.equal(
    describeFormat(format),
    'Original · MP4 · Size unknown · Video + audio',
  );
});

test('chooseDefaultFormat prefers the best format with audio', () => {
  const formats = [
    {
      format_id: '137',
      quality: '1080p',
      resolution: '1920x1080',
      has_audio: false,
      has_video: true,
    },
    {
      format_id: '18',
      quality: '360p',
      resolution: '640x360',
      has_audio: true,
      has_video: true,
    },
    {
      format_id: '22',
      quality: '720p',
      resolution: '1280x720',
      has_audio: true,
      has_video: true,
    },
  ];

  assert.equal(
    chooseDefaultFormat(formats),
    '22',
  );
});


test('chooseDefaultFormat falls back to the best video-only format', () => {
  const formats = [
    {
      format_id: '136',
      quality: '720p',
      resolution: '1280x720',
      has_audio: false,
      has_video: true,
    },
    {
      format_id: '137',
      quality: '1080p',
      resolution: '1920x1080',
      has_audio: false,
      has_video: true,
    },
  ];

  assert.equal(
    chooseDefaultFormat(formats),
    '137',
  );
});


test('chooseDefaultFormat handles an empty format list', () => {
  assert.equal(chooseDefaultFormat([]), null);
  assert.equal(chooseDefaultFormat(null), null);
});


test('buildPreparePayload creates a preparation request', () => {
  assert.deepEqual(
    buildPreparePayload(
      'analysis-test-123',
      '18',
    ),
    {
      analysis_id: 'analysis-test-123',
      format_id: '18',
    },
  );
});


test('buildPreparePayload rejects a missing analysis ID', () => {
  assert.equal(
    buildPreparePayload('', '18'),
    null,
  );
});


test('buildPreparePayload rejects a missing format ID', () => {
  assert.equal(
    buildPreparePayload(
      'analysis-test-123',
      '',
    ),
    null,
  );
});
