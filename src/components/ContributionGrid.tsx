'use client';

import { useState } from 'react';

type Contribution = {
  date: string;
  count: number;
};

type MonthLabel = {
  key: string;
  name: string;
  firstDay: string;
  position: number;
};

interface ContributionGridProps {
  contributions: Contribution[];
  maxContributions: number;
  visibleMonthLabels: MonthLabel[];
}

// Get color class based on contribution count
const getColorClassByCount = (count: number, maxContributions: number) => {
  if (count === 0) return "bg-black/[0.04] dark:bg-white/[0.04]";
  if (maxContributions === 0) return "bg-black/40 dark:bg-white/40";
  
  const percentage = count / maxContributions;
  if (percentage > 0.75) return "bg-black dark:bg-white";
  if (percentage > 0.5) return "bg-black/70 dark:bg-white/70";
  if (percentage > 0.25) return "bg-black/50 dark:bg-white/50";
  return "bg-black/30 dark:bg-white/30";
};

export default function ContributionGrid({
  contributions,
  maxContributions,
  visibleMonthLabels
}: ContributionGridProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredContribution, setHoveredContribution] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    contribution: Contribution
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredContribution({
      date: contribution.date,
      count: contribution.count,
      x: rect.left + rect.width / 2,
      y: rect.top - 36  // 往上移多一点，避免挡住鼠标
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          <div className="relative pt-8">
            {/* 月份标签 */}
            <div className="absolute top-0 left-8 flex">
              {visibleMonthLabels.map((month) => (
                <div
                  key={month.key}
                  className="absolute text-xs text-black/40 dark:text-white/40"
                  style={{ left: `${month.position}px` }}
                >
                  {month.name}
                </div>
              ))}
            </div>

            <div className="inline-flex gap-2">
              {/* 星期标签 */}
              <div className="flex w-6 flex-col justify-between text-right text-xs text-black/40 dark:text-white/40">
                <div className="h-3" />
                <div className="h-3 leading-3">M</div>
                <div className="h-3" />
                <div className="h-3 leading-3">W</div>
                <div className="h-3" />
                <div className="h-3 leading-3">F</div>
                <div className="h-3" />
              </div>

              {/* 贡献热力图 */}
              <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
                {contributions.map((c) => (
                  <div
                    key={c.date}
                    className={`h-3 w-3 rounded-sm ${getColorClassByCount(c.count, maxContributions)} transition-colors cursor-pointer`}
                    onMouseEnter={(e) => handleMouseEnter(e, c)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip - 固定存在，通过 opacity 控制显示 */}
      <div
        className="fixed z-50 px-3 py-1.5 text-xs rounded-md bg-black dark:bg-white text-white dark:text-black font-medium whitespace-nowrap pointer-events-none transition-all duration-150 ease-out"
        style={{
          left: hoveredContribution ? `${hoveredContribution.x}px` : '0px',
          top: hoveredContribution ? `${hoveredContribution.y}px` : '0px',
          transform: 'translate(-50%, -100%)',
          opacity: showTooltip && hoveredContribution ? 1 : 0
        }}
      >
        {hoveredContribution && (
          <>
            在 {hoveredContribution.date} 有 {hoveredContribution.count} 次贡献
            {/* 箭头 - 朝下 */}
            <div className="absolute left-1/2 bottom-[-4px] -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black dark:border-t-white" />
          </>
        )}
      </div>
    </>
  );
}

