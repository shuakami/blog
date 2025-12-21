const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'shuakami';

interface RepoStats {
  name: string;
  stars: number;
  forks: number;
}

export interface GitHubStats {
  totalStars: number;
  totalForks: number;
  contributions: number;
  repos: RepoStats[];
}

export async function getGitHubStats(): Promise<GitHubStats | null> {
  try {
    // 如果有 token，使用 GraphQL API
    if (GITHUB_TOKEN) {
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
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username: GITHUB_USERNAME }
        }),
        next: { revalidate: 3600 }
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
          };
        }
      }
    }

    // Fallback: 使用公开的 REST API 获取仓库数据
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=stars`,
      { next: { revalidate: 3600 } }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`);
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
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
        { next: { revalidate: 3600 } }
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
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return null;
  }
}
