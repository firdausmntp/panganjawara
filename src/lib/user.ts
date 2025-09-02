// Utility untuk menghasilkan identifier anonim konsisten per browser
export function getUserIdentifier(): string {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    const browserInfo = navigator.userAgent + navigator.language + screen.width + screen.height;
    const timestamp = Date.now();
    identifier = btoa(browserInfo + timestamp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    try { localStorage.setItem('user_identifier', identifier); } catch {}
  }
  return identifier;
}
