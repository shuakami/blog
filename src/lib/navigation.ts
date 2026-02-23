import type { NavItem } from './types';

// 统一的导航配置
export const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/', enabled: true },
  { label: '归档', href: '/archive', enabled: true },
  { label: '作品', href: '/works', enabled: true },
  { label: '设计', href: '/designs', enabled: true },
  { label: '游戏', href: '/games', enabled: true },
  { label: '资源', href: '/resources', enabled: true },
  { label: '音乐', href: '/music', enabled: true },
  { label: '关于', href: '/about', enabled: true },
  { label: '好兄弟们', href: '/friends', enabled: true },
];

// 兼容旧格式的导航项（用于 SideNav、Header、MobileNav）
export const NAV_ITEMS_LEGACY = NAV_ITEMS.filter(item => item.enabled).map(item => ({
  name: item.label,
  path: item.href,
}));
