import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataItem {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
}

interface LiveDataWidgetProps {
  title: string;
  icon: React.ReactNode;
  data: DataItem[];
  className?: string;
}

const LiveDataWidget = ({ title, icon, data, className }: LiveDataWidgetProps) => {
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus size={16} className="text-data-neutral" />;
    if (change > 0) return <TrendingUp size={16} className="text-data-positive" />;
    return <TrendingDown size={16} className="text-data-negative" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return "text-data-neutral";
    if (change > 0) return "text-data-positive";
    return "text-data-negative";
  };

  return (
    <div className={cn(
      "bg-card rounded-xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300",
      "border border-border/50 hover:border-primary/20",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
          {icon}
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground">
                {item.value}{item.unit && ` ${item.unit}`}
              </span>
              {item.change !== undefined && (
                <div className={cn("flex items-center space-x-1", getTrendColor(item.change))}>
                  {getTrendIcon(item.change)}
                  <span className="text-xs font-medium">
                    {Math.abs(item.change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Update terakhir: {new Date().toLocaleTimeString('id-ID')}
        </span>
      </div>
    </div>
  );
};

export default LiveDataWidget;