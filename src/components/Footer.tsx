"use client"

import Link from "next/link"
import { Route } from "next"
import { Github, Mail, Rss } from "lucide-react"

const SOCIAL_LINKS = [
  { name: "GitHub", href: "https://github.com/shuakami", icon: Github },
  { name: "RSS", href: "/rss", icon: Rss },
  { name: "Email", href: "mailto:shuakami@sdjz.wiki", icon: Mail },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-16">
        {/* 主要内容 */}
        <div className="flex flex-col items-center text-center space-y-8">
          {/* 社交链接 */}
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors duration-200"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Ciallo */}
          <div className="text-black/60 dark:text-white/60 text-base">
            Ciallo～(∠・ω&lt; )⌒★
          </div>

          {/* 版权和备案 */}
          <div className="flex flex-col items-center gap-2 text-xs text-black/40 dark:text-white/40">
            <div className="flex items-center gap-3">
              <span>© {currentYear} Shuakami</span>
              <span>·</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                桂ICP备2023016069号-2
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 