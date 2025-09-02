// Utility untuk membersihkan konten markdown / placeholder menjadi plain text singkat
export function stripMarkdown(raw: string, maxLength = 120): string {
  if (!raw) return '';
  let txt = raw;
  // Remove image placeholders {{image:..}} / {{img:..}} / {{image}}
  txt = txt.replace(/\{\{image:[^}]+\}\}/gi, ' ')
           .replace(/\{\{img:[^}]+\}\}/gi, ' ')
           .replace(/\{\{image\}\}/gi, ' ');
  // Remove headings #'s
  txt = txt.replace(/^#{1,6}\s+/gm, '');
  // Bold / italic / inline code markers
  txt = txt.replace(/\*\*([^*]+)\*\*/g, '$1')
           .replace(/\*([^*]+)\*/g, '$1')
           .replace(/`([^`]+)`/g, '$1')
           .replace(/~~([^~]+)~~/g, '$1');
  // Links [text](url) -> text
  txt = txt.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Remove HTML tags (simple)
  txt = txt.replace(/<[^>]+>/g, ' ');
  // Collapse multiple whitespace
  txt = txt.replace(/\s+/g, ' ').trim();
  if (txt.length > maxLength) txt = txt.slice(0, maxLength).trim() + '...';
  return txt;
}
