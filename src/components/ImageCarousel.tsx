'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: (string | React.ReactNode)[]
  alt: string
  priority?: boolean
}

export function ImageCarousel({ images, alt, priority = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null
  
  // 检查是否是 React 组件
  const isReactNode = (item: string | React.ReactNode): item is React.ReactNode => {
    return typeof item !== 'string'
  }
  
  if (images.length === 1) {
    const firstItem = images[0]
    
    // 如果第一张是自定义组件，直接渲染
    if (isReactNode(firstItem)) {
      return <div className="relative w-full h-full">{firstItem}</div>
    }
    
    // 否则渲染图片
    return (
      <div className="relative w-full h-full">
        {/* 模糊背景层 */}
        <Image
          src={firstItem}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-cover blur-2xl scale-110 opacity-30"
          quality={95}
          priority={priority}
          unoptimized
        />
        {/* 清晰图片层 */}
        <Image
          src={firstItem}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-contain relative z-10"
          quality={95}
          priority={priority}
          unoptimized
        />
      </div>
    )
  }

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 4000) // 4秒切换一次

    return () => clearInterval(timer)
  }, [images.length])

  const handleCapsuleClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full h-full">
      {/* 所有图片 - 带淡入淡出动效 */}
      {images.map((image, index) => {
        const isCustomComponent = isReactNode(image)
        
        return (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
            {isCustomComponent ? (
              // 渲染自定义组件
              image
            ) : (
              // 渲染图片
              <>
          {/* 模糊背景层 */}
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover blur-2xl scale-110 opacity-30"
            quality={95}
            priority={priority && index === 0}
            unoptimized
          />
          {/* 清晰图片层 */}
          <Image
            src={image}
            alt={`${alt} - ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-contain relative z-10"
            quality={95}
            priority={priority && index === 0}
            unoptimized
          />
              </>
            )}
        </div>
        )
      })}

      {/* 胶囊指示器 - 底部居中，带半透明背景 */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2 px-3 py-2 rounded-full bg-black/20 dark:bg-black/40 backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleCapsuleClick(e, index)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8 shadow-lg'
                    : 'bg-white/50 w-6 hover:bg-white/70'
                }`}
                aria-label={`切换到第 ${index + 1} 张`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


