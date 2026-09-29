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

      <header className="mt-20 flex flex-col items-center text-center md:mt-28">
        <span className="hedera text-[1.75rem] text-ink-3" aria-hidden />
        <h1 className="display mt-8 text-[clamp(2.5rem,4.2vw,4.5rem)] md:-mx-16">{resource.title}</h1>
        <p className="mt-8 max-w-[36rem] text-[1.25rem] leading-[1.6] text-ink-body">{resource.description}</p>
        {facts.length > 0 && (
          <dl className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col items-center gap-1.5">
                <dd className="text-[1.5rem] font-bold tracking-[-0.03em] text-ink">{v}</dd>
                <dt className="text-[0.9375rem] italic text-ink-3">{k}</dt>
              </div>
            ))}
          </dl>
        )}
      </header>

      {resource.details && Object.keys(resource.details).length > 0 && (
        <dl className="mt-20 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {Object.entries(resource.details).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-[0.9375rem] italic text-ink-3">{key}</dt>
              <dd className="text-[1.125rem] font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {resource.sample && (
        <section className="mt-20">
          {resource.type === 'design' ? (
            <DesignPreview code={resource.sample} title={resource.title} />
          ) : (
            <>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: resource.sample }} />
              <CodeCopyButton />
            </>
          )}
        </section>
      )}

      {((resource.usage && resource.usage.length > 0) || (resource.tags && resource.tags.length > 0)) && (
        <footer className="mt-24 flex flex-col items-center gap-6 text-center">
          <span className="hedera text-[1.25rem] text-ink-3" aria-hidden />
          {resource.usage && resource.usage.length > 0 && (
            <p className="max-w-[36rem] text-[1.125rem] italic leading-[1.6] text-ink-2">
              Of use for {resource.usage.join(', ')}.
            </p>
          )}
          {resource.tags && resource.tags.length > 0 && (
            <p className="caps flex flex-wrap justify-center gap-x-4 gap-y-1">
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
