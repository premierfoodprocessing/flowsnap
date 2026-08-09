import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDownloadUrl,
  buildPreparePayload,
  chooseDefaultFormat,
  describeAudioNotice,
  describeFormat,
  downloadPreparedFile,
  formatFileSize,
  resolveApiBaseUrl,
  startBrowserDownload,
} from '../format-utils.mjs';

test('resolveApiBaseUrl uses the local backend during development', () => {
  for (const hostname of ['127.0.0.1', 'localhost', '[::1]']) {
    assert.equal(
      resolveApiBaseUrl({ hostname }),
      'http://127.0.0.1:8000',
    );
  }
});


test('resolveApiBaseUrl uses Render on GitHub Pages', () => {
  assert.equal(
    resolveApiBaseUrl({
      hostname: 'premierfoodprocessing.github.io',
    }),
    'https://flowsnap-api.onrender.com',
  );
});


test('resolveApiBaseUrl defaults safely to Render', () => {
  assert.equal(
    resolveApiBaseUrl(undefined),
    'https://flowsnap-api.onrender.com',
  );
});

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


test('describeFormat explains audio-aware video streams', () => {
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
    (
      '1080p · MP4 · 8 MB · Video stream · '
      + 'Audio added when available'
    ),
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


test('chooseDefaultFormat recommends 720p over a higher resolution', () => {
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
    '136',
  );
});


test('chooseDefaultFormat prefers compatible video over higher AV1', () => {
  const formats = [
    {
      format_id: 'hd',
      quality: '720p',
      resolution: '720x1280',
      has_audio: false,
      has_video: true,
      is_compatible: true,
    },
    {
      format_id: 'av1-full-hd',
      quality: '1080p',
      resolution: '1080x1920',
      has_audio: false,
      has_video: true,
      is_compatible: false,
    },
  ];

  assert.equal(
    chooseDefaultFormat(formats),
    'hd',
  );
});


test('chooseDefaultFormat uses higher quality when no 720p exists', () => {
  const formats = [
    {
      format_id: '1080-only',
      quality: '1080p',
      resolution: '1920x1080',
      has_audio: true,
      has_video: true,
      is_compatible: true,
    },
  ];

  assert.equal(
    chooseDefaultFormat(formats),
    '1080-only',
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


test('downloadPreparedFile downloads a successful response', async () => {
  const events = [];
  const fileBlob = { type: 'video/mp4' };
  const link = {
    click() {
      events.push('click');
    },
    remove() {
      events.push('remove');
    },
  };
  const documentObject = {
    createElement() {
      return link;
    },
    body: {
      append() {
        events.push('append');
      },
    },
  };
  const fetchFunction = async () => ({
    ok: true,
    async blob() {
      return fileBlob;
    },
  });
  const urlObject = {
    createObjectURL(blob) {
      assert.equal(blob, fileBlob);
      return 'blob:flowsnap-file';
    },
    revokeObjectURL(url) {
      events.push(`revoke:${url}`);
    },
  };

  await downloadPreparedFile(
    documentObject,
    'http://127.0.0.1:8000/api/media/download/job-123',
    'video.mp4',
    fetchFunction,
    urlObject,
  );

  assert.equal(link.href, 'blob:flowsnap-file');
  assert.equal(link.download, 'video.mp4');
  assert.deepEqual(
    events,
    ['append', 'click', 'remove', 'revoke:blob:flowsnap-file'],
  );
});


test('downloadPreparedFile reports a structured backend error', async () => {
  const fetchFunction = async () => ({
    ok: false,
    async json() {
      return {
        detail: {
          code: 'download_failed',
          message: 'FlowSnap could not download this media.',
        },
      };
    },
  });

  await assert.rejects(
    downloadPreparedFile(
      {},
      'http://127.0.0.1:8000/api/media/download/job-123',
      'video.mp4',
      fetchFunction,
    ),
    /FlowSnap could not download this media\./,
  );
});


test('describeAudioNotice explains video-only source streams', () => {
  assert.equal(
    describeAudioNotice({
      has_video: true,
      has_audio: false,
    }),
    (
      'The source provides this as a video-only stream. '
      + 'FlowSnap will combine it with separate audio during '
      + 'preparation when audio is available.'
    ),
  );
});


test('describeAudioNotice stays empty when audio is included', () => {
  assert.equal(
    describeAudioNotice({
      has_video: true,
      has_audio: true,
    }),
    '',
  );
});


test('describeAudioNotice stays empty without a format', () => {
  assert.equal(describeAudioNotice(null), '');
});
