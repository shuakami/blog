"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Settings, Sun, Moon, Monitor, Image as ImageIcon, Minimize2, Maximize2, Square, Palette } from "lucide-react";

export type BackgroundOption = "none" | "character" | "luoxiaohei";
export type LayoutMode = "default" | "wide" | "compact";

interface AppearanceConfig {
  backgroundStyle: BackgroundOption;
  layoutMode: LayoutMode;
}

// 这些页面禁用背景图片
const NO_BACKGROUND_PAGES = ['/music', '/works', '/friends'];

// 这些页面强制使用默认布局
const FORCE_DEFAULT_LAYOUT_PAGES = ['/music'];

export default function AppearanceSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [config, setConfig] = useState<AppearanceConfig>({
    backgroundStyle: "character",
    layoutMode: "default",
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // 检查当前页面是否需要禁用背景
  const shouldDisableBackground = NO_BACKGROUND_PAGES.some(page => pathname.startsWith(page));
  
  // 检查当前页面是否需要强制默认布局
  const shouldForceDefaultLayout = FORCE_DEFAULT_LAYOUT_PAGES.some(page => pathname.startsWith(page));

  useEffect(() => {
    // 读取配置并设置状态（背景和布局已在 inline script 中应用）
    const saved = localStorage.getItem("appearance-config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse appearance config:", e);
      }
    }
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("appearance-config", JSON.stringify(config));
    
    // 应用背景样式（特定页面强制禁用背景）
    document.body.classList.remove("background-character", "background-luoxiaohei");
    
    if (shouldDisableBackground || config.backgroundStyle === "none") {
      // 不添加任何背景 class，保持纯净
    } else if (config.backgroundStyle === "luoxiaohei") {
      document.body.classList.add("background-luoxiaohei");
    } else if (config.backgroundStyle === "character") {
      document.body.classList.add("background-character");
    }
    
    // 应用布局模式（音乐页面强制使用宽屏布局）
    document.documentElement.classList.remove("layout-default", "layout-wide", "layout-compact");
    const layoutToApply = shouldForceDefaultLayout ? "wide" : config.layoutMode;
    document.documentElement.classList.add(`layout-${layoutToApply}`);
  }, [config, mounted, shouldDisableBackground, shouldForceDefaultLayout]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!mounted) return null;

  const updateBackground = (style: BackgroundOption) => {
    setConfig((prev) => ({ ...prev, backgroundStyle: style }));
  };

  const updateLayout = (mode: LayoutMode) => {
    setConfig((prev) => ({ ...prev, layoutMode: mode }));
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        aria-label="外观设置"
      >
        <Settings className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden z-50"
          >
            <div className="p-5 space-y-5">
              {/* 主题切换 */}
              <div>
                <div className="text-[11px] font-semibold text-black/40 dark:text-white/40 mb-3 uppercase tracking-wider">
                  主题
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "light", label: "浅色", Icon: Sun },
                    { value: "dark", label: "深色", Icon: Moon },
                    { value: "system", label: "系统", Icon: Monitor },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setTheme(item.value)}
                      className={`group relative p-3 rounded-xl transition-all ${
                        theme === item.value
                          ? "bg-black/[0.06] dark:bg-white/[0.06]"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <item.Icon className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                        theme === item.value 
                          ? "text-black dark:text-white" 
                          : "text-black/50 dark:text-white/50"
                      }`} />
                      <div className={`text-[11px] font-medium transition-colors ${
                        theme === item.value
                          ? "text-black dark:text-white"
                          : "text-black/60 dark:text-white/60"
                      }`}>
                        {item.label}
                      </div>
                      {theme === item.value && (
                        <motion.div
                          layoutId="activeTheme"
                          className="absolute inset-0 border-2 border-black/[0.12] dark:border-white/[0.12] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分隔线 */}
              <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

              {/* 背景设置 */}
              <div>
                <div className="text-[11px] font-semibold text-black/40 dark:text-white/40 mb-3 uppercase tracking-wider">
                  背景
                </div>
                {shouldDisableBackground && (
                  <div className="mb-3 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400/90">
                      当前页面不支持背景图片
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "character" as const, label: "角色", Icon: ImageIcon },
                    { value: "luoxiaohei" as const, label: "彩绘", Icon: Palette },
                    { value: "none" as const, label: "纯净", Icon: Square },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => updateBackground(item.value)}
                      disabled={shouldDisableBackground}
                      className={`group relative p-3 rounded-xl transition-all ${
                        shouldDisableBackground 
                          ? "opacity-40 cursor-not-allowed"
                          : config.backgroundStyle === item.value
                          ? "bg-black/[0.06] dark:bg-white/[0.06]"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <item.Icon className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                        !shouldDisableBackground && config.backgroundStyle === item.value 
                          ? "text-black dark:text-white" 
                          : "text-black/50 dark:text-white/50"
                      }`} />
                      <div className={`text-[11px] font-medium transition-colors ${
                        !shouldDisableBackground && config.backgroundStyle === item.value
                          ? "text-black dark:text-white"
                          : "text-black/60 dark:text-white/60"
                      }`}>
                        {item.label}
                      </div>
                      {config.backgroundStyle === item.value && !shouldDisableBackground && (
                        <motion.div
                          layoutId="activeBackground"
                          className="absolute inset-0 border-2 border-black/[0.12] dark:border-white/[0.12] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分隔线 */}
              <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

              {/* 页面布局 */}
              <div>
                <div className="text-[11px] font-semibold text-black/40 dark:text-white/40 mb-3 uppercase tracking-wider">
                  布局
                </div>
                {shouldForceDefaultLayout && (
                  <div className="mb-3 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400/90">
                      当前页面仅支持默认布局
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "compact" as const, label: "紧凑", Icon: Minimize2 },
                    { value: "default" as const, label: "默认", Icon: Square },
                    { value: "wide" as const, label: "宽屏", Icon: Maximize2 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => updateLayout(item.value)}
                      disabled={shouldForceDefaultLayout}
                      className={`group relative p-3 rounded-xl transition-all ${
                        shouldForceDefaultLayout
                          ? item.value === "default" 
                            ? "bg-black/[0.06] dark:bg-white/[0.06] cursor-not-allowed"
                            : "opacity-40 cursor-not-allowed"
                          : config.layoutMode === item.value
                          ? "bg-black/[0.06] dark:bg-white/[0.06]"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <item.Icon className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${
                        shouldForceDefaultLayout
                          ? item.value === "default"
                            ? "text-black dark:text-white"
                            : "text-black/50 dark:text-white/50"
                          : config.layoutMode === item.value 
                          ? "text-black dark:text-white" 
                          : "text-black/50 dark:text-white/50"
                      }`} />
                      <div className={`text-[11px] font-medium transition-colors ${
                        shouldForceDefaultLayout
                          ? item.value === "default"
                            ? "text-black dark:text-white"
                            : "text-black/60 dark:text-white/60"
                          : config.layoutMode === item.value
                          ? "text-black dark:text-white"
                          : "text-black/60 dark:text-white/60"
                      }`}>
                        {item.label}
                      </div>
                      {((shouldForceDefaultLayout && item.value === "default") || 
                        (!shouldForceDefaultLayout && config.layoutMode === item.value)) && (
                        <motion.div
                          layoutId="activeLayout"
                          className="absolute inset-0 border-2 border-black/[0.12] dark:border-white/[0.12] rounded-xl"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

