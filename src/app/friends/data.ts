export interface Friend {
  id: string;
  name: string;
  note?: string;
  avatar: string;
  link: string;
}

export const FRIENDS: Friend[] = [
  { id: 'shuakami', name: 'Shuakami', avatar: '/friends/assets/avatars/shuakami.jpg', link: 'https://github.com/shuakami' },
  { id: 'xiaoyueyoqwq', name: 'xiaoyueyoqwq', avatar: '/friends/assets/avatars/xiaoyueyoqwq.jpg', link: 'https://xiaoyue.vaiiya.org' },
  {
    id: 'darf',
    name: 'Darf',
    note: 'Xiaoxian',
    avatar: 'https://uapis.cn/api/v1/avatar/gravatar?email=xiaoxian@axtn.net&s=256&d=mp',
    link: 'https://xiaoxian.org',
  },
  {
    id: 'mrsunny',
    name: 'Mrsunny',
    avatar: 'https://proxy.sdjz.wiki/https:/avatars.githubusercontent.com/u/91064101?v=4',
    link: 'https://mrsunny.top',
  },
  {
    id: 'shanshui',
    name: 'Shanshui',
    note: '量子猫步',
    avatar: 'http://q.qlogo.cn/g?b=qq&nk=3381734705&s=640',
    link: 'https://blog.shanshui.site',
  },
];

export const hostOf = (link: string) => new URL(link).hostname;
