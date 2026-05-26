export function formatDate(dateString, options = {}) {
  const date = new Date(dateString);

  if (options.absolute) {
    return date.toLocaleDateString();
  }

  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

  return `${Math.floor(diff / 86400)} days ago`;
}