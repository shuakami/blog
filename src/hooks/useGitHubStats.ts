'use client';

import useSWR from 'swr';

interface RepoStats {
  name: string;
  stars: number;
  forks: number;
}

interface GitHubStats {
  totalStars: number;
  totalForks: number;
  contributions: number;
  repos: RepoStats[];
  updatedAt: string;
  cached?: boolean;
  stale?: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useGitHubStats() {
  const { data, error, isLoading } = useSWR<GitHubStats>(
    '/api/github/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60 * 60 * 1000, // 1小时内不重复请求
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

export function getRepoStats(stats: GitHubStats | undefined, repoName: string) {
  if (!stats) return null;
  return stats.repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
}
