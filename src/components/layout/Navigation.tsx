import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

const Navigation = ({ mobile = false, onItemClick }: NavigationProps) => {
  const navItems = [
    { path: "/", label: "Beranda" },
    { path: "/edukasi", label: "Edukasi" },
    { path: "/data", label: "Data & Analytics" },
    { path: "/komunitas", label: "Komunitas Jawara" }
  ];

  return (
    <nav className={cn(
      "flex",
      mobile ? "flex-col space-y-1" : "flex-row items-center space-x-2"
    )}>
      {navItems.map((item) => {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                "relative px-5 py-3 rounded-2xl transition-all duration-300 group",
                "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-green-500/50",
                isActive 
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white font-bold shadow-lg transform scale-105" 
                  : "text-foreground/75 hover:text-green-700",
                mobile && "w-full justify-start"
              )
            }
          >
            <span className={cn(
              "text-sm font-medium relative z-10",
              mobile ? "text-base" : ""
            )}>
              {item.label}
            </span>
            {/* Animated background for hover effect */}
            <div className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-100/20 to-orange-100/20",
              "transform scale-0 group-hover:scale-100 transition-transform duration-300",
              "opacity-0 group-hover:opacity-100"
            )}></div>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;