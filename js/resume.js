// Resume action: downloads the PDF if it has been added, otherwise asks by email — never a broken link.
import { CONTACT } from './content.js';
let cached;
export function resumeInfo() {
  cached ||= fetch(CONTACT.resume, { method: 'HEAD' })
    .then(r => r.ok && !/text\/html/.test(r.headers.get('content-type') || ''))
    .catch(() => false)
    .then(ok => ok
      ? { available: true, href: CONTACT.resume, download: 'Ashita-Taneja-Resume.pdf', label: 'Download Resume' }
      : { available: false, href: `mailto:${CONTACT.email}?subject=${encodeURIComponent('Resume request')}&body=${encodeURIComponent('Hi Ashita, could you share your resume?')}`, label: 'Request Resume' });
  return cached;
}
export async function wireResume(a) {
  const r = await resumeInfo();
  a.href = r.href;
  if (r.download) a.setAttribute('download', r.download); else a.removeAttribute('download');
  const lab = a.querySelector('[data-label]'); if (lab) lab.textContent = r.label;
  if (!r.available) a.title = 'Opens an email to request the resume';
  return r;
}
