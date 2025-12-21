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
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set');
    return null;
  }

  try {
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
      next: { revalidate: 3600 } // 缓存1小时
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
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return null;
  }
}
