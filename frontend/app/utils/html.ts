import sanitize from 'sanitize-html';

export function sanitizeHtml(html: string): string {
  return sanitize(html);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
