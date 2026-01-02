import { getBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';
import RSS from 'rss';

export async function GET() {
  const { posts } = await getBlogPosts(1);
  const resources = await getResources();
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const feed = new RSS({
    title: 'Shuakami',
    description: '编程、创作、生活。Ciallo～(∠・ω< )⌒★',
    site_url,
    feed_url: `${site_url}/rss`,
    language: 'zh-CN',
    pubDate: new Date(),
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt || '',
      url: `${site_url}/post/${post.slug}`,
      date: new Date(post.date),
      categories: post.tags || [],
      author: 'Shuakami',
    });
  });

  // 添加资源（排除命令类型）
  resources
    .filter((r) => r.type !== 'command')
    .forEach((resource) => {
      feed.item({
        title: `[资源] ${resource.title}`,
        description: resource.description || '',
        url: `${site_url}/resources/${resource.slug}`,
        date: resource.lastUpdated ? new Date(resource.lastUpdated) : new Date(),
        categories: resource.tags || [],
        author: 'Shuakami',
      });
    });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 