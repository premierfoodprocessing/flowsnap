import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDownloadUrl,
  buildPreparePayload,
  chooseDefaultFormat,
  describeFormat,
  formatFileSize,
  startBrowserDownload,
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


test('buildDownloadUrl resolves a backend download path', () => {
  assert.equal(
    buildDownloadUrl(
      'http://127.0.0.1:8000',
      '/api/media/download/job-123',
    ),
    'http://127.0.0.1:8000/api/media/download/job-123',
  );
});


test('buildDownloadUrl accepts an absolute URL from the backend', () => {
  assert.equal(
    buildDownloadUrl(
      'http://127.0.0.1:8000',
      'http://127.0.0.1:8000/api/media/download/job-123',
    ),
    'http://127.0.0.1:8000/api/media/download/job-123',
  );
});


test('buildDownloadUrl rejects another origin', () => {
  assert.equal(
    buildDownloadUrl(
      'http://127.0.0.1:8000',
      'https://example.com/api/media/download/job-123',
    ),
    null,
  );
});


test('buildDownloadUrl rejects a non-download API path', () => {
  assert.equal(
    buildDownloadUrl(
      'http://127.0.0.1:8000',
      '/api/media/formats',
    ),
    null,
  );
});


test('buildDownloadUrl rejects a missing URL', () => {
  assert.equal(
    buildDownloadUrl('http://127.0.0.1:8000', ''),
    null,
  );
});


test('startBrowserDownload clicks and removes a temporary link', () => {
  const events = [];
  const link = {
    click() {
      events.push('click');
    },
    remove() {
      events.push('remove');
    },
  };
  const documentObject = {
    createElement(tagName) {
      assert.equal(tagName, 'a');
      return link;
    },
    body: {
      append(element) {
        assert.equal(element, link);
        events.push('append');
      },
    },
  };

  assert.equal(
    startBrowserDownload(
      documentObject,
      'http://127.0.0.1:8000/api/media/download/job-123',
    ),
    true,
  );
  assert.equal(
    link.href,
    'http://127.0.0.1:8000/api/media/download/job-123',
  );
  assert.equal(link.download, '');
  assert.equal(link.hidden, true);
  assert.deepEqual(events, ['append', 'click', 'remove']);
});


test('startBrowserDownload rejects an unavailable document', () => {
  assert.equal(
    startBrowserDownload(
      null,
      'http://127.0.0.1:8000/api/media/download/job-123',
    ),
    false,
  );
});
