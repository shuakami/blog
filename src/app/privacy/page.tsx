import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - Shuakami',
  description: '关于数据收集和隐私保护的说明',
  openGraph: {
    title: '隐私政策 - Shuakami',
    description: '关于数据收集和隐私保护的说明',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 页面标题 */}
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-4">
          隐私政策
        </h1>
        <p className="text-lg text-black/50 dark:text-white/50 mb-8">
          最后更新：2025 年 11 月
        </p>
        <div className="w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 正文内容 */}
      <div className="space-y-8 text-base text-black/80 dark:text-white/80 leading-relaxed">
        <p>
          这是一个简单的个人博客，我会尽可能地尊重你的隐私。这份隐私政策会告诉你我收集了什么信息，以及如何使用它们。
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            我收集的信息
          </h2>
          <p>
            这个网站不会主动收集你的个人信息。但是像所有网站一样，服务器会自动记录一些基本的访问信息，包括你的 IP 地址、浏览器类型和版本、访问时间和访问的页面，以及你使用的设备类型。这些信息只是用来了解网站的使用情况和改进性能，不会用于追踪个人或者与任何第三方分享。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            Cookies 的使用
          </h2>
          <p>
            网站会使用少量的 Cookies 来提升你的浏览体验，主要是用来记住你选择的深色或浅色模式，以及侧边栏的展开状态。就这么简单，没有用于广告或追踪的 Cookies，也不会收集你的个人偏好数据用于其他目的。你可以随时在浏览器设置中清除这些 Cookies，不过这样的话每次访问时就需要重新选择主题了。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            第三方服务
          </h2>
          <p>
            为了提供更好的访问体验，网站会使用一些第三方服务。CDN 用于加速图片和资源的加载，让页面打开得更快。音乐播放功能使用了网易云音乐的接口，所以当你听歌时，网易云会知道哪些歌曲被播放了。网站还使用了 Google Fonts 来显示漂亮的字体。这些第三方服务都有各自的隐私政策，我无法控制它们如何处理数据，建议你在使用相关功能时查看它们的隐私说明。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            互动和联系
          </h2>
          <p>
            如果你通过邮件或其他方式与我联系，我会保存你的邮件地址和消息内容，以便能够回复你。这些信息仅用于与你沟通，不会分享给任何第三方，也不会用于发送营销邮件或垃圾信息。如果你不想让我继续保存这些信息，可以随时告诉我删除。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            数据安全
          </h2>
          <p>
            我会采取合理的技术措施来保护数据安全，包括使用 HTTPS 加密传输、定期更新服务器安全补丁等。但说实话，互联网传输没有 100% 安全的方法，所以我不能保证绝对的安全。如果万一发生了数据泄露，我会尽快通知受影响的用户，并采取补救措施。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            你的权利
          </h2>
          <p>
            你有权随时清除浏览器中的 Cookies，要求我删除保存的关于你的任何信息，或者询问我收集了哪些关于你的数据。如果你想行使这些权利，直接发邮件告诉我就行，我会在合理的时间内处理你的请求。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            政策更新
          </h2>
          <p>
            我可能会不定期更新这个隐私政策，比如添加了新功能或使用了新的第三方服务时。如果有重大变更，我会在网站上发布通知，或者通过其他适当的方式告知你。建议你偶尔回来看看，了解最新的隐私政策内容。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">
            联系方式
          </h2>
          <p>
            如果你对这份隐私政策有任何疑问，或者想要行使上述的任何权利，欢迎随时通过邮箱联系我。我会尽快回复你的问题。
          </p>
          <div className="mt-6 p-6 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
            <p className="text-sm text-black/60 dark:text-white/60 mb-2">邮箱</p>
            <a
              href="mailto:shuakami@sdjz.wiki"
              className="text-lg font-medium text-black dark:text-white hover:text-black/60 dark:hover:text-white/60 transition-colors"
            >
              shuakami@sdjz.wiki
            </a>
          </div>
        </section>
      </div>
    </div>
  );
} 