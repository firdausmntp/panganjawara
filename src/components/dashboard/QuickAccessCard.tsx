import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent" | "info";
  features: string[];
  onClick?: () => void;
}

const QuickAccessCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  features,
  onClick 
}: QuickAccessCardProps) => {
  const colorClasses = {
    primary: "bg-gradient-primary text-primary-foreground",
    secondary: "bg-gradient-sunrise text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    info: "bg-info text-white"
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 cursor-pointer",
        "transform transition-all duration-300 hover:scale-105 hover:shadow-elegant",
        "border border-border/50 bg-card"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={cn("w-full h-full rounded-full", colorClasses[color])} />
      </div>
      
      <div className="relative z-10">
        <div className={cn(
          "inline-flex p-3 rounded-lg mb-4",
          colorClasses[color]
        )}>
          <Icon size={24} />
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", colorClasses[color])} />
              <span className="text-sm text-foreground/80">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <span className={cn(
            "text-sm font-semibold",
            color === "primary" ? "text-primary" :
            color === "secondary" ? "text-secondary" :
            color === "accent" ? "text-accent" :
            "text-info"
          )}>
            Akses Sekarang →
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessCard;