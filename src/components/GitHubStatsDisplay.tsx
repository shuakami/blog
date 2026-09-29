'use client';

import { useGitHubStats, getRepoStats } from '@/hooks/useGitHubStats';

interface GitHubStatsHeaderProps {
  fallbackStars?: number;
  fallbackUsers?: string;
  fallbackContributions?: number;
}

export function GitHubStatsHeader({ 
  fallbackStars = 476, 
  fallbackUsers = '7,000+',
  fallbackContributions = 2132 
}: GitHubStatsHeaderProps) {
  const { stats, isLoading } = useGitHubStats();

  const totalStars = stats?.totalStars ?? fallbackStars;
  const contributions = stats?.contributions ?? fallbackContributions;

  return (
    <p className="mt-8 text-[1.0625rem] md:text-[1.3125rem] leading-[1.6] tracking-[-0.015em] text-ink-body">
      Here be the things I have made. They have been given{' '}
      <span className={`font-semibold text-ink ${isLoading ? 'opacity-50' : ''}`}>{totalStars.toLocaleString('en-US')}</span> stars, are
      used by some <span className="font-semibold text-ink">{fallbackUsers}</span> souls, and cost me{' '}
      <span className={`font-semibold text-ink ${isLoading ? 'opacity-50' : ''}`}>{contributions.toLocaleString('en-US')}</span>{' '}
      commits in the twelvemonth past.
    </p>
  );
}

// 用于显示单个仓库的 stars
export function RepoStars({ repoName, fallback = 0 }: { repoName: string; fallback?: number }) {
  const { stats, isLoading } = useGitHubStats();
  const repoStats = getRepoStats(stats, repoName);
  const value = repoStats?.stars ?? fallback;

  return (
    <span className={isLoading ? 'opacity-50' : ''}>
      {value.toLocaleString()}
    </span>
  );
}

// 用于显示单个仓库的 forks
export function RepoForks({ repoName, fallback = 0 }: { repoName: string; fallback?: number }) {
  const { stats, isLoading } = useGitHubStats();
  const repoStats = getRepoStats(stats, repoName);
  const value = repoStats?.forks ?? fallback;

  return (
    <span className={isLoading ? 'opacity-50' : ''}>
      {value.toLocaleString()}
    </span>
  );
}