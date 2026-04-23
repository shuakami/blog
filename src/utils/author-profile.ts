const DEFAULT_AUTHOR_NAME = 'Shuakami';
const DEFAULT_AUTHOR_AVATAR =
  'https://uapis.cn/api/v1/avatar/gravatar?email=shuakami%40sdjz.wiki&s=80&d=mp&r=g';

const AUTHOR_AVATAR_MAP: Record<string, string> = {
  shuakami: DEFAULT_AUTHOR_AVATAR,
  xiaoyueyoqwq: 'https://d.kstore.dev/download/4782/xiaoyueyoqwq.jpg',
};

export interface AuthorProfile {
  name: string;
  avatar: string;
}

function normalizeAuthorKey(author?: string | null): string {
  return author?.trim().toLowerCase() ?? '';
}

export function resolveAuthorProfile(
  author?: string | null,
  authorAvatar?: string | null
): AuthorProfile {
  const normalizedName = author?.trim() || DEFAULT_AUTHOR_NAME;
  const explicitAvatar = authorAvatar?.trim();

  if (explicitAvatar) {
    return {
      name: normalizedName,
      avatar: explicitAvatar,
    };
  }

  return {
    name: normalizedName,
    avatar: AUTHOR_AVATAR_MAP[normalizeAuthorKey(normalizedName)] ?? DEFAULT_AUTHOR_AVATAR,
  };
}
