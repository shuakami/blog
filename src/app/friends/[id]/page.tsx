import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { FRIENDS, hostOf } from '../data';

type Params = { params: Promise<{ id: string }> };

const find = (id: string) => FRIENDS.find((f) => f.id === id.toLowerCase());

export function generateStaticParams() {
  return FRIENDS.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const friend = find((await params).id);
  if (!friend) return { title: 'Not found' };
  return { title: friend.name, openGraph: { title: friend.name } };
}

export default async function FriendPage({ params }: Params) {
  const friend = find((await params).id);
  if (!friend) notFound();

  return (
    <div className="mx-auto w-full max-w-(--column-w) px-6 pb-8 pt-8 md:px-0 md:pt-14">
      <Link href={'/friends' as never} className="pill">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        <span>Friends</span>
      </Link>

      <header className="mt-14 md:mt-24 flex flex-col items-center text-center">
        <Image src={friend.avatar} alt="" width={128} height={128} className="h-32 w-32 rounded-full object-cover" />
        <h1 className="display mt-10 text-[clamp(2rem,5vw,4.5rem)]">{friend.name}</h1>
        {friend.note && <p className="mt-4 text-[1.0625rem] md:text-[1.25rem] italic text-ink-2">{friend.note}</p>}
        <a href={friend.link} target="_blank" rel="noopener noreferrer" className="pill mt-10">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
          <span>{hostOf(friend.link)}</span>
        </a>
      </header>
    </div>
  );
}
