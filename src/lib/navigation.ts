import type { NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Index', href: '/', enabled: true },
  { label: 'Archive', href: '/archive', enabled: true },
  { label: 'Works', href: '/works', enabled: true },
  { label: 'Designs', href: '/designs', enabled: true },
  { label: 'Games', href: '/games', enabled: true },
  { label: 'Resources', href: '/resources', enabled: true },
  { label: 'Music', href: '/music', enabled: true },
  { label: 'About', href: '/about', enabled: true },
  { label: 'Friends', href: '/friends', enabled: true },
];

export const ENABLED_NAV_ITEMS = NAV_ITEMS.filter((item) => item.enabled);

export const NAV_ITEMS_LEGACY = ENABLED_NAV_ITEMS.map((item) => ({
  name: item.label,
  path: item.href,
}));
