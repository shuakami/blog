import type { Metadata } from 'next';
import Image from 'next/image';
import { FRIENDS, hostOf } from './data';

export const metadata: Metadata = {
  title: 'Friends',
  description: 'The good company Shuakami keeps.',
  openGraph: {
    title: 'Friends',
    description: 'The good company Shuakami keeps.',
  },
};

export default function FriendsPage() {
  return (
    <div className="mx-auto w-full max-w-[64rem] px-6 pb-8 pt-14 md:px-12 md:pt-28">
      <h1 className="display text-[clamp(3rem,5vw,5rem)]">Friends</h1>

      <ul className="mt-20 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRIENDS.map((friend) => (
          <li key={friend.id}>
            <a
              href={friend.link}
              target="_blank"
              rel="noopener noreferrer"
              className="-mx-4 flex items-center gap-5 rounded-[14px] px-4 py-4 hover:bg-[rgba(var(--ink-rgb),0.045)]"
            >
              <Image
                src={friend.avatar}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 flex-none rounded-full object-cover"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-[1.3125rem] font-semibold tracking-[-0.025em] text-ink">
                  {friend.name}
                  {friend.note && <span className="ml-2 text-[1rem] font-normal italic text-ink-3">{friend.note}</span>}
                </span>
                <span className="truncate text-[0.9375rem] text-ink-3">{hostOf(friend.link)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
