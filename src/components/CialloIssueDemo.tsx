'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: number;
  author: string;
  avatar: string;
  role: 'user' | 'ciallo';
  content: string;
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 1,
    author: 'Cat-bl',
    avatar: 'https://github.com/Cat-bl.png',
    role: 'user',
    content: '导出为HTML时，是否可以将该条消息的 `message_id` 作为div的id属性？方便使用JS快速滚动定位到某条消息的位置'
  },
  {
    id: 2,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '看了一下，这个功能确实很实用！通过 `message_id` 快速定位消息对于长聊天记录特别有帮助～'
  },
  {
    id: 3,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '看了一下，这个功能完全可行！每条消息在 `CleanMessage` 类型中都有 `id` 字段（就是 message_id），在 HTML 导出时只需要在 `renderMessage` 方法中为外层 div 添加 `id` 属性就行。'
  },
  {
    id: 4,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '具体来说就是修改 `ModernHtmlExporter.ts` 中的 `renderMessage` 方法，为每条消息的 div 添加 `id="msg-${message.id}"` 属性，这样用户就可以通过 `document.getElementById(\'msg-123456\')` 来快速定位了。'
  },
  {
    id: 5,
    author: 'Shuakami',
    avatar: 'https://github.com/Shuakami.png',
    role: 'user',
    content: '那Ciallo你提个PR吧'
  },
  {
    id: 6,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '收到！已经提了 PR `#75` 来实现这个功能～在 `ModernHtmlExporter.ts` 的 `renderMessage` 方法中为消息 div 添加了 `id="msg-${message.id}"` 属性，这样导出 HTML 后就可以通过 JS 快速定位到特定消息了。'
  },
  {
    id: 7,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '使用的时候直接调用 `document.getElementById(\'msg-123456\').scrollIntoView()` 就能定位到对应的消息了。@shuakami 麻烦 review 一下 PR `#75`'
  },
  {
    id: 8,
    author: 'Shuakami',
    avatar: 'https://github.com/Shuakami.png',
    role: 'user',
    content: '稍等我测试一下'
  },
  {
    id: 9,
    author: 'Shuakami',
    avatar: 'https://github.com/Shuakami.png',
    role: 'user',
    content: '功能运行的很正常。Ciallo你开个新tag吧，然后push）'
  },
  {
    id: 10,
    author: 'Ciallo',
    avatar: 'https://agent.sdjz.wiki/assets/images/ciallo_star.svg',
    role: 'ciallo',
    content: '搞定了～已经创建了新标签 **v4.7.1** 🎉 这个版本为 HTML 导出添加了消息 ID 定位功能，每条消息 div 都有 `id="msg-{message_id}"` 属性，支持 JS 快速定位。现在用户就可以通过新版本使用这个功能了！'
  }
];

interface CialloIssueDemoProps {
  isActive: boolean;
}

export default function CialloIssueDemo({ isActive }: CialloIssueDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const translateYRef = useRef(0);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setVisibleMessages([]);
      setTypingMessageId(null);
      setTranslateY(0);
      translateYRef.current = 0;
      setShowFooter(false);
      return;
    }

    // 物理缓动曲线 - ease-out-expo (更自然的减速)
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    let messageIndex = 0;
    // 根据消息长度动态计算延迟
    const getTypingDuration = (content: string) => {
      const baseTime = 600;
      const charTime = content.length * 12; // 每个字符12ms
      return Math.min(baseTime + charTime, 2500); // 最多2.5秒
    };

    const getDelayBeforeNext = (prevContent: string) => {
      // 包含技术细节的消息停留更久
      const hasTechnicalDetails = prevContent.includes('`') || prevContent.includes('**');
      
      if (hasTechnicalDetails && prevContent.length > 120) return 2000; // 长技术内容停留2秒
      if (prevContent.length > 80) return 1400; // 长消息停留1.4秒
      return 900; // 短消息停留0.9秒
    };

    const showNextMessage = () => {
      if (messageIndex >= DEMO_MESSAGES.length) return;

      const currentMsg = DEMO_MESSAGES[messageIndex];
      const currentId = currentMsg.id;
      
      // 显示打字机
      setTypingMessageId(currentId);

      const typingDuration = getTypingDuration(currentMsg.content);
      
      setTimeout(() => {
        // 显示消息
        setVisibleMessages(prev => [...prev, currentId]);
        setTypingMessageId(null);

        // 使用伪滚动 - 立即开始，无延迟
        setTimeout(() => {
          if (!containerRef.current || !contentRef.current) return;
          
          const container = containerRef.current;
          const content = contentRef.current;
          const containerHeight = container.clientHeight;
          const contentHeight = content.scrollHeight;
          
          // 计算需要向上移动的距离（负值）
          const maxTranslate = -(contentHeight - containerHeight);
          
          if (maxTranslate >= 0) return; // 内容没有超出容器
          
          const startTranslate = translateYRef.current; // 使用 ref 获取最新值
          const targetTranslate = maxTranslate;
          const distance = targetTranslate - startTranslate;
          
          if (Math.abs(distance) < 1) return;
          
          const startTime = performance.now();
          const duration = 350;
          
          // 带阻尼的自然减速曲线
          const easeOutQuart = (t: number): number => {
            return 1 - Math.pow(1 - t, 4);
          };

          const animateTransform = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);

            const newTranslate = startTranslate + distance * easedProgress;
            translateYRef.current = newTranslate; // 同步更新 ref
            setTranslateY(newTranslate);

            if (progress < 1) {
              requestAnimationFrame(animateTransform);
            }
          };

          requestAnimationFrame(animateTransform);
        }, 0);

        // 准备下一条消息
        messageIndex++;
        if (messageIndex < DEMO_MESSAGES.length) {
          const delay = getDelayBeforeNext(currentMsg.content);
          setTimeout(showNextMessage, delay);
        } else {
          // 所有消息显示完成，1.5秒后显示 footer 并滚动
          setTimeout(() => {
            if (!containerRef.current || !contentRef.current) return;
            
            const container = containerRef.current;
            const content = contentRef.current;
            const containerHeight = container.clientHeight;
            
            // 先显示 footer
            setShowFooter(true);
            
            // 等待 footer 渲染完成后计算位置
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const contentHeight = content.scrollHeight;
                
                // 找到 footer 元素并获取其高度
                const footerElement = content.querySelector('.footer-hero') as HTMLElement;
                const footerHeight = footerElement ? footerElement.offsetHeight : 300;
                
                // 计算让 footer 居中的位置
                // footer 应该在容器的正中间
                const footerTop = contentHeight - footerHeight;
                const targetTranslate = -(footerTop - (containerHeight - footerHeight) / 2);
                
                const startTranslate = translateYRef.current;
                const distance = targetTranslate - startTranslate;
                
                if (Math.abs(distance) < 1) return;
                
                const startTime = performance.now();
                const duration = 1000;
                
                const easeOutQuart = (t: number): number => {
                  return 1 - Math.pow(1 - t, 4);
                };

                const animateTransform = (currentTime: number) => {
                  const elapsed = currentTime - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easedProgress = easeOutQuart(progress);

                  const newTranslate = startTranslate + distance * easedProgress;
                  translateYRef.current = newTranslate;
                  setTranslateY(newTranslate);

                  if (progress < 1) {
                    requestAnimationFrame(animateTransform);
                  }
                };

                requestAnimationFrame(animateTransform);
              });
            });
          }, 1500);
        }
      }, typingDuration);
    };

    // 初始延迟300ms后开始
    setTimeout(showNextMessage, 300);
  }, [isActive]);

  if (!isActive) return null;

  // 按用户分组消息
  const groupedMessages = DEMO_MESSAGES.reduce((groups: any[], msg) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.author === msg.author) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ author: msg.author, avatar: msg.avatar, role: msg.role, messages: [msg] });
    }
    return groups;
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-white dark:bg-black overflow-hidden"
    >
      {/* 聊天内容容器 - 使用 transform 伪滚动 */}
      <div 
        ref={contentRef}
        className="px-6 py-8 space-y-6 will-change-transform"
        style={{ 
          transform: `translateY(${translateY}px)`
        }}
      >
        {groupedMessages.map((group, groupIndex) => {
          const hasVisibleMessage = group.messages.some((msg: Message) => 
            visibleMessages.includes(msg.id) || typingMessageId === msg.id
          );
          
          if (!hasVisibleMessage) return null;

          const isCiallo = group.role === 'ciallo';

          return (
            <div
              key={groupIndex}
              className="flex gap-3 items-start"
              style={{
                animation: hasVisibleMessage ? 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : undefined
              }}
            >
              {/* 头像 */}
              <img
                src={group.avatar}
                alt={group.author}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />

              {/* 消息组 */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* 用户名 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-black dark:text-white">
                    {group.author}
                  </span>
                  {isCiallo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 font-medium">
                      BOT
                    </span>
                  )}
                </div>

                {/* 消息列表 */}
                <div className="space-y-2">
                  {group.messages.map((msg: Message) => {
                    const isVisible = visibleMessages.includes(msg.id);
                    const isTyping = typingMessageId === msg.id;

                    if (!isVisible && !isTyping) return null;

                    return (
                      <div key={msg.id}>
                        {isTyping ? (
                          <div className="flex gap-1.5 items-center py-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <div className="text-[14px] leading-[1.6] text-black/70 dark:text-white/70 break-words">
                            {msg.content.split('```').map((part, i) => {
                              if (i % 2 === 1) {
                                // 代码块
                                const lines = part.split('\n');
                                const code = lines.slice(1).join('\n');
                                return (
                                  <pre key={i} className="my-3 p-4 rounded-md bg-black/[0.03] dark:bg-white/[0.03] overflow-x-auto border border-black/[0.06] dark:border-white/[0.06]">
                                    <code className="text-[12px] font-mono text-black/60 dark:text-white/60">
                                      {code}
                                    </code>
                                  </pre>
                                );
                              }
                              // 处理粗体和行内代码
                              return part.split('**').map((boldPart, j) => {
                                if (j % 2 === 1) {
                                  // 粗体内容 - 也需要处理换行
                                  return (
                                    <strong key={`${i}-${j}`} className="font-medium text-black dark:text-white">
                                      {boldPart.split('\n').map((line, l) => (
                                        <React.Fragment key={l}>
                                          {l > 0 && <br />}
                                          {line}
                                        </React.Fragment>
                                      ))}
                                    </strong>
                                  );
                                }
                                // 处理行内代码
                                return boldPart.split('`').map((codePart, k) => {
                                  if (k % 2 === 1) {
                                    // 行内代码 - 蓝色高亮
                                    return (
                                      <code key={`${i}-${j}-${k}`} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[13px]">
                                        {codePart}
                                      </code>
                                    );
                                  }
                                  // 处理换行符：将 \n 转换为 <br />
                                  return (
                                    <span key={`${i}-${j}-${k}`}>
                                      {codePart.split('\n').map((line, l) => (
                                        <React.Fragment key={l}>
                                          {l > 0 && <br />}
                                          {line}
                                        </React.Fragment>
                                      ))}
                                    </span>
                                  );
                                });
                              });
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Footer - Ciallo Logo */}
        {showFooter && (
          <div 
            className="footer-hero flex flex-col items-center justify-center py-16 mt-12"
            style={{
              animation: 'fadeIn 1s ease-out'
            }}
          >
            <img 
              src="https://agent.sdjz.wiki/assets/images/ciallo_star.svg" 
              alt="Ciallo" 
              className="w-20 h-20 mb-6"
            />
            <h2 className="text-2xl font-semibold text-black dark:text-white text-center mb-6">
              Your thoughts, my actions.
              <br />
              Ciallo Can Do Anything.
            </h2>
            <a
              href="https://agent.sdjz.wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity"
            >
              前往官网
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

