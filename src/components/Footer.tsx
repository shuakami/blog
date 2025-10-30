import Link from "next/link";
import { Route } from "next";

const FOOTER_LINK_CLASS = "text-black/60 hover:text-black/90 dark:text-white/60 dark:hover:text-white/90 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-current after:opacity-0 after:transition-opacity hover:after:opacity-20" as const;

export default function Footer() {
  return (
    <footer className="max-w-2xl mx-auto px-6 py-10 border-t border-black/10 dark:border-white/10">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-black/60 dark:text-white/60">
            © 2024 Luoxiaohei
          </span>
          <div className="space-x-8">
            <Link href={"/rss" as Route} className={FOOTER_LINK_CLASS} target="_blank" rel="noopener noreferrer">
              RSS
            </Link>
            <Link href={"/privacy" as Route} className={FOOTER_LINK_CLASS}>
              Privacy
            </Link>
          </div>
        </div>
        
        {/* ICP备案信息 */}
        <div className="flex justify-center items-center text-sm text-black/60 dark:text-white/60">
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-black/90 dark:hover:text-white/90 transition-colors duration-200"
          >
            桂ICP备2023016069号-2
          </a>
        </div>
      </div>
    </footer>
  );
} 