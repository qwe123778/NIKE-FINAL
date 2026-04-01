import * as React from "react";
import { ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

const ChartContext = React.createContext(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within <ChartContainer />");
  return context;
}

export const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

export const ChartTooltipContent = React.forwardRef(
  ({ active, payload, className }, ref) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        ref={ref}
        className={cn("rounded bg-white p-2 shadow text-xs", className)}
      >
        {payload.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export const ChartLegendContent = React.forwardRef(({ payload, className }, ref) => {
  if (!payload?.length) return null;
  return (
    <div ref={ref} className={cn("flex gap-2", className)}>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export { ResponsiveContainer as ChartResponsive, Tooltip as ChartTooltip, Legend as ChartLegend };