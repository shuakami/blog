import { getBlogPosts } from '@/utils/posts';
import RSS from 'rss';

export async function GET() {
  const { posts } = await getBlogPosts(1);
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const feed = new RSS({
    title: 'Luoxiaohei',
    description: 'Personal blog and archive',
    site_url,
    feed_url: `${site_url}/rss`,
    language: 'en',
    pubDate: new Date(),
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt || '',
      url: `${site_url}/post/${post.slug}`,
      date: new Date(post.date),
      categories: post.tags || [],
      author: 'Luoxiaohei',
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 