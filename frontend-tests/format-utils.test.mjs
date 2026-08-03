import test from 'node:test';
import assert from 'node:assert/strict';

import {
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
