import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'shuakami';

// 缓存数据
let cachedData: GitHubStats | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

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
}

async function fetchGitHubData(): Promise<GitHubStats> {
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // GraphQL 查询获取用户仓库和贡献数据
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            stargazerCount
            forkCount
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { username: GITHUB_USERNAME }
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  const user = data.data.user;
  const repos = user.repositories.nodes;
  
  let totalStars = 0;
  let totalForks = 0;
  const repoStats: RepoStats[] = [];

  for (const repo of repos) {
    totalStars += repo.stargazerCount;
    totalForks += repo.forkCount;
    repoStats.push({
      name: repo.name,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
    });
  }

  return {
    totalStars,
    totalForks,
    contributions: user.contributionsCollection.contributionCalendar.totalContributions,
    repos: repoStats,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();
    
    // 检查缓存
    if (cachedData && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
      });
    }

    // 获取新数据
    const stats = await fetchGitHubData();
    
    // 更新缓存
    cachedData = stats;
    cacheTime = now;

    return NextResponse.json({
      ...stats,
      cached: false,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    
    // 如果有缓存数据，返回缓存（即使过期）
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    );
  }
}
