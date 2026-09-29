import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { getResourceBySlug, getResources } from '@/utils/resources';
import { CodeCopyButton } from '@/components/CodeCopyButton';
import { DesignPreview } from '@/components/DesignPreview';

export const revalidate = 60;

export const dynamicParams = true;

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: 'Not found',
    };
  }

  return {
    title: resource.title,
    description: resource.description,
    openGraph: {
      title: resource.title,
      description: resource.description,
    },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const facts = [
    ['Kind', resource.type],
    ['Format', resource.format],
    ['Size', resource.size],
    ['Updated', resource.lastUpdated],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  const firstParagraph = resource.sample?.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1].replace(/<[^>]+>/g, '').trim();
  const showDescription = Boolean(resource.description) && firstParagraph !== resource.description?.trim();

  return (
    <article className="mx-auto w-full max-w-(--column-w) px-6 pb-8 pt-8 md:px-0 md:pt-14">
      <nav className="flex items-center justify-between">
        <Link href={'/resources' as never} className="pill">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>Resources</span>
        </Link>
        {resource.downloadUrl && (
          <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer" className="pill">
            <Download className="h-4 w-4" strokeWidth={1.75} />
            <span>Download</span>
          </a>
        )}
      </nav>

      <header className="mt-12 md:mt-20">
        <h1 className="display text-[clamp(2rem,4vw,3.75rem)]">{resource.title}</h1>
        {showDescription && (
          <p className="mt-5 text-[1.0625rem] md:text-[1.25rem] leading-[1.6] text-ink-body">{resource.description}</p>
        )}
        {facts.length > 0 && (
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <dt className="italic text-ink-3">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {resource.details && Object.keys(resource.details).length > 0 && (
        <dl className="mt-10 md:mt-14 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          {Object.entries(resource.details).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-[0.9375rem] italic text-ink-3">{key}</dt>
              <dd className="text-[1rem] md:text-[1.125rem] font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {resource.sample && (
        <section className="mt-10 md:mt-14">
          {resource.type === 'design' ? (
            <DesignPreview code={resource.sample} title={resource.title} />
          ) : (
            <>
              <div className="markdown-body plain" dangerouslySetInnerHTML={{ __html: resource.sample }} />
              <CodeCopyButton />
            </>
          )}
        </section>
      )}

      {((resource.usage && resource.usage.length > 0) || (resource.tags && resource.tags.length > 0)) && (
        <footer className="mt-12 md:mt-16 flex flex-col gap-4">
          {resource.usage && resource.usage.length > 0 && (
            <p className="text-[1rem] md:text-[1.125rem] italic leading-[1.6] text-ink-2">
              Of use for {resource.usage.join(', ')}.
            </p>
          )}
          {resource.tags && resource.tags.length > 0 && (
            <p className="caps flex flex-wrap gap-x-4 gap-y-1">
              {resource.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
