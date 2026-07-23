import React from 'react';

// --- PIE / DONUT CHART ---
interface PieData {
  category: string;
  count: number;
  percentage: number;
}

interface SvgPieChartProps {
  data: PieData[];
  colors?: string[];
}

export const SvgPieChart: React.FC<SvgPieChartProps> = ({
  data,
  colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280']
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let accumulatedAngle = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-xs">
        No case records for the selected period
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((item, idx) => {
            if (item.count === 0) return null;
            const percentage = item.count / total;
            const angle = percentage * 360;
            const startAngle = accumulatedAngle;
            accumulatedAngle += angle;

            // Compute coordinates
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            const color = colors[idx % colors.length];

            return (
              <path
                key={item.category}
                d={pathData}
                fill={color}
                className="transition-all duration-300 hover:opacity-90 hover:scale-105 cursor-pointer origin-center"
                style={{ transformOrigin: '50px 50px' }}
              >
                <title>{`${item.category}: ${item.count} (${Math.round(percentage * 100)}%)`}</title>
              </path>
            );
          })}
          {/* Inner cutout for donut effect */}
          <circle cx="50" cy="50" r="24" fill="#ffffff" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2.5 max-w-[200px]">
        {data.map((item, idx) => {
          const color = colors[idx % colors.length];
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="font-semibold text-gray-700 truncate max-w-[120px]" title={item.category}>
                  {item.category}
                </span>
              </div>
              <span className="font-bold text-gray-900 whitespace-nowrap ml-2">
                {item.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- BAR / STACKED BAR CHART ---
interface SvgBarChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  stacked?: boolean;
}

export const SvgBarChart: React.FC<SvgBarChartProps> = ({
  data,
  xKey,
  yKeys,
  colors = ['#3b82f6', '#8b5cf6', '#10b981'],
  stacked = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-gray-400 text-xs">
        No case records for the selected period
      </div>
    );
  }

  // Find max value for Y-axis scaling
  let maxValue = 0;
  if (stacked) {
    maxValue = data.reduce((max, item) => {
      const sum = yKeys.reduce((s, key) => s + (Number(item[key]) || 0), 0);
      return sum > max ? sum : max;
    }, 0);
  } else {
    maxValue = data.reduce((max, item) => {
      const itemMax = yKeys.reduce((m, key) => (Number(item[key]) || 0) > m ? Number(item[key]) : m, 0);
      return itemMax > max ? itemMax : max;
    }, 0);
  }

  if (maxValue === 0) maxValue = 10;
  // Pad the max value slightly
  maxValue = Math.ceil(maxValue * 1.1);

  const width = 500;
  const height = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getBarHeight = (val: number) => (val / maxValue) * chartHeight;

  // Grid tick marks
  const yTicks = 4;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Y-Axis Grid Lines & Labels */}
        {Array.from({ length: yTicks + 1 }).map((_, idx) => {
          const yVal = Math.round((maxValue / yTicks) * idx);
          const yPos = height - paddingBottom - (idx * chartHeight) / yTicks;
          return (
            <g key={idx} className="opacity-60">
              <text x={paddingLeft - 8} y={yPos + 3} textAnchor="end" className="text-[9px] fill-gray-500 font-semibold">
                {yVal}
              </text>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}

        {/* Bar columns */}
        {data.map((item, idx) => {
          const label = item[xKey];
          const colWidth = chartWidth / data.length;
          const xPos = paddingLeft + idx * colWidth;

          // Inside the column
          const renderBars = () => {
            if (stacked) {
              let currentY = height - paddingBottom;
              return yKeys.map((key, kIdx) => {
                const val = Number(item[key]) || 0;
                const bH = getBarHeight(val);
                if (bH === 0) return null;
                const barY = currentY - bH;
                currentY = barY;
                return (
                  <rect
                    key={key}
                    x={xPos + colWidth * 0.25}
                    y={barY}
                    width={colWidth * 0.5}
                    height={bH}
                    fill={colors[kIdx % colors.length]}
                    className="transition-all duration-300 hover:brightness-95 cursor-pointer"
                  >
                    <title>{`${key}: ${val}`}</title>
                  </rect>
                );
              });
            } else {
              // Grouped bars side-by-side
              const subBarWidth = (colWidth * 0.7) / yKeys.length;
              return yKeys.map((key, kIdx) => {
                const val = Number(item[key]) || 0;
                const bH = getBarHeight(val);
                const barX = xPos + colWidth * 0.15 + kIdx * subBarWidth;
                const barY = height - paddingBottom - bH;
                return (
                  <rect
                    key={key}
                    x={barX}
                    y={barY}
                    width={subBarWidth * 0.9}
                    height={bH}
                    fill={colors[kIdx % colors.length]}
                    className="transition-all duration-300 hover:brightness-95 cursor-pointer"
                  >
                    <title>{`${key}: ${val}`}</title>
                  </rect>
                );
              });
            }
          };

          return (
            <g key={idx}>
              {renderBars()}
              {/* X label */}
              <text
                x={xPos + colWidth / 2}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                className="text-[9px] fill-gray-500 font-semibold"
              >
                {label && label.length > 7 ? `${label.substring(2, 7)}...` : label}
              </text>
            </g>
          );
        })}

        {/* X and Y axes */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};


// --- LINE & AREA CHART ---
interface SvgLineChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  area?: boolean;
}

export const SvgLineChart: React.FC<SvgLineChartProps> = ({
  data,
  xKey,
  yKeys,
  colors = ['#3b82f6', '#8b5cf6', '#10b981'],
  area = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-gray-400 text-xs">
        No case records for the selected period
      </div>
    );
  }

  // Find max value
  const maxValue = data.reduce((max, item) => {
    const itemMax = yKeys.reduce((m, key) => (Number(item[key]) || 0) > m ? Number(item[key]) : m, 0);
    return itemMax > max ? itemMax : max;
  }, 0) || 10;

  const paddedMax = Math.ceil(maxValue * 1.15);

  const width = 500;
  const height = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getYPos = (val: number) => height - paddingBottom - (val / paddedMax) * chartHeight;
  const getXPos = (idx: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx * chartWidth) / (data.length - 1);
  };

  const yTicks = 4;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Y Axis Grid & labels */}
        {Array.from({ length: yTicks + 1 }).map((_, idx) => {
          const yVal = Math.round((paddedMax / yTicks) * idx);
          const yPos = height - paddingBottom - (idx * chartHeight) / yTicks;
          return (
            <g key={idx} className="opacity-60">
              <text x={paddingLeft - 8} y={yPos + 3} textAnchor="end" className="text-[9px] fill-gray-500 font-semibold">
                {yVal}
              </text>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}

        {/* Lines and Areas */}
        {yKeys.map((key, kIdx) => {
          const color = colors[kIdx % colors.length];

          // Build line path
          const points = data.map((item, idx) => {
            const val = Number(item[key]) || 0;
            return `${getXPos(idx)},${getYPos(val)}`;
          });

          const pathD = `M ${points.join(' L ')}`;

          // Area path
          const areaD = data.length > 0 ?
            `${pathD} L ${getXPos(data.length - 1)},${height - paddingBottom} L ${getXPos(0)},${height - paddingBottom} Z`
            : '';

          return (
            <g key={key}>
              {area && data.length > 0 && (
                <path
                  d={areaD}
                  fill={color}
                  fillOpacity="0.15"
                  className="transition-all duration-300"
                />
              )}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
              {/* Nodes */}
              {data.map((item, idx) => {
                const val = Number(item[key]) || 0;
                const cx = getXPos(idx);
                const cy = getYPos(val);
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#ffffff"
                    stroke={color}
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-200 hover:r-6"
                  >
                    <title>{`${key} (${item[xKey]}): ${val}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}

        {/* X labels */}
        {data.map((item, idx) => {
          const label = item[xKey];
          // Skip drawing too many labels to avoid clutter
          const divisor = Math.max(1, Math.ceil(data.length / 8));
          if (idx % divisor !== 0) return null;

          return (
            <text
              key={idx}
              x={getXPos(idx)}
              y={height - paddingBottom + 16}
              textAnchor="middle"
              className="text-[9px] fill-gray-500 font-semibold"
            >
              {label && label.length > 7 ? `${label.substring(2, 7)}...` : label}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
