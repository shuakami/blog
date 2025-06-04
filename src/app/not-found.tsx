import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center">
          <h1 className="text-[2.5rem] leading-tight mb-6 font-medium text-black dark:text-white">
            404
          </h1>
          <p className="text-lg text-black/60 dark:text-white/60 mb-8">
            页面不存在
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <span>返回首页</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
} 