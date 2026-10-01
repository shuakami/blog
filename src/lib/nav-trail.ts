const KEY = 'nav-trail';

interface Trail {
  current: string | null;
  previous: string | null;
}

function read(): Trail {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Trail;
  } catch {}
  return { current: null, previous: null };
}

function write(trail: Trail) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(trail));
  } catch {}
}

export function recordVisit(url: string) {
  const trail = read();
  if (trail.current === url) return;
  write({ current: url, previous: trail.current });
}

export function replaceVisit(url: string) {
  write({ ...read(), current: url });
}

export function cameFrom(here: string): string | null {
  const { current, previous } = read();
  if (current && current !== here) return current;
  return previous && previous !== here ? previous : null;
}
