export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Size unknown';
  }

  if (bytes < 1_000) {
    return `${Math.round(bytes)} B`;
  }

  const units = [
    ['GB', 1_000_000_000],
    ['MB', 1_000_000],
    ['KB', 1_000],
  ];

  for (const [unit, divisor] of units) {
    if (bytes >= divisor) {
      const value = bytes / divisor;
      const formatted = Number.isInteger(value)
        ? String(value)
        : value.toFixed(1).replace(/\.0$/, '');

      return `${formatted} ${unit}`;
    }
  }

  return `${Math.round(bytes)} B`;
}


export function describeFormat(format) {
  const quality =
    format.quality && format.quality !== 'unknown'
      ? format.quality
      : format.resolution && format.resolution !== 'unknown'
        ? format.resolution
        : 'Original';

  const extension = (
    format.extension || 'file'
  ).toUpperCase();

  const audioDescription = format.has_audio
    ? 'Video + audio'
    : 'Video only';

  return [
    quality,
    extension,
    formatFileSize(format.filesize),
    audioDescription,
  ].join(' · ');
}
