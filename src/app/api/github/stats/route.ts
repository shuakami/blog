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
  // 如果有 token，使用 GraphQL API
  if (GITHUB_TOKEN) {
    try {
      const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      };

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

      if (response.ok) {
        const data = await response.json();
        
        if (!data.errors) {
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
      }
    } catch (e) {
      console.error('GraphQL API failed, falling back to REST:', e);
    }
  }

  // Fallback: 使用公开的 REST API
  const reposResponse = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=stars`
  );

  if (!reposResponse.ok) {
    throw new Error(`GitHub REST API error: ${reposResponse.status}`);
  }

  const repos = await reposResponse.json();
  
  let totalStars = 0;
  let totalForks = 0;
  const repoStats: RepoStats[] = [];

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    repoStats.push({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
    });
  }

  // 获取贡献数据（使用第三方 API）
  let contributions = 0;
  try {
    const contribResponse = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
    );
    if (contribResponse.ok) {
      const contribData = await contribResponse.json();
      contributions = (contribData.contributions || []).reduce(
        (sum: number, c: { count: number }) => sum + c.count, 
        0
      );
    }
  } catch {
    // 忽略贡献数据获取失败
  }

  return {
    totalStars,
    totalForks,
    contributions,
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
