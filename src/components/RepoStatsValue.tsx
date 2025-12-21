'use client';

import { useGitHubStats, getRepoStats } from '@/hooks/useGitHubStats';

interface RepoStatsValueProps {
  repoName: string;
  type: 'stars' | 'forks';
  fallback: number;
}

export function RepoStatsValue({ repoName, type, fallback }: RepoStatsValueProps) {
  const { stats, isLoading } = useGitHubStats();
  const repoStats = getRepoStats(stats, repoName);
  
  const value = type === 'stars' 
    ? (repoStats?.stars ?? fallback)
    : (repoStats?.forks ?? fallback);

  return (
    <span className={isLoading ? 'opacity-60' : ''}>
      {value.toLocaleString()}
    </span>
  );
}
