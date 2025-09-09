import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, BookOpen, Video, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

const Navigation = ({ mobile = false, onItemClick }: NavigationProps) => {
  const location = useLocation();
  const [edukasiDropdownOpen, setEdukasiDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { path: "/", label: "Beranda" },
    { path: "/data", label: "Data & Analytics" },
    { path: "/komunitas", label: "Komunitas Jawara" }
  ];

  const edukasiSubItems = [
    { path: "/edukasi", label: "Ringkasan", icon: BookOpen },
    { path: "/edukasi/artikel", label: "Artikel", icon: BookOpen },
    { path: "/edukasi/video", label: "Video", icon: Video },
    { path: "/edukasi/tools", label: "Tools", icon: Calculator }
  ];

  const isEdukasiActive = location.pathname.startsWith('/edukasi');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEdukasiDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdukasiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setEdukasiDropdownOpen(!edukasiDropdownOpen);
  };

  const handleSubItemClick = () => {
    setEdukasiDropdownOpen(false);
    if (onItemClick) onItemClick();
  };

  return (
    <nav className={cn(
      "flex relative",
      mobile ? "flex-col space-y-1 w-full" : "flex-row items-center space-x-1 lg:space-x-2"
    )}>
      {/* Beranda first */}
      <NavLink
        key="/"
        to="/"
        onClick={onItemClick}
        className={({ isActive }) =>
          cn(
            "relative px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-300 group",
            "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-green-500/50",
            isActive 
              ? "bg-gradient-to-r from-green-600 to-green-500 text-white font-bold shadow-lg transform scale-105" 
              : "text-foreground/75 hover:text-green-700",
            mobile && "w-full justify-start text-left"
          )
        }
      >
        <span className={cn(
          "text-sm font-medium relative z-10 whitespace-nowrap",
          mobile ? "text-base" : ""
        )}>
          Beranda
        </span>
        <div className={cn(
          "absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-amber-100/20 to-orange-100/20",
          "transform scale-0 group-hover:scale-100 transition-transform duration-300",
          "opacity-0 group-hover:opacity-100"
        )}></div>
      </NavLink>

      {/* Edukasi Dropdown - moved to second position */}
      <div className={cn("relative", mobile && "w-full")} ref={dropdownRef}>
        <button
          onClick={handleEdukasiClick}
          className={cn(
            "relative px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-300 group flex items-center",
            "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-green-500/50",
            isEdukasiActive 
              ? "bg-gradient-to-r from-green-600 to-green-500 text-white font-bold shadow-lg transform scale-105" 
              : "text-foreground/75 hover:text-green-700",
            mobile ? "w-full justify-between text-left" : "justify-center"
          )}
        >
          <span className={cn(
            "text-sm font-medium relative z-10 whitespace-nowrap",
            mobile ? "text-base" : ""
          )}>
            Edukasi
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-1 transition-transform duration-200",
            mobile ? (edukasiDropdownOpen ? "rotate-180" : "") : (edukasiDropdownOpen && "rotate-180")
          )} />
          <div className={cn(
            "absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-amber-100/20 to-orange-100/20",
            "transform scale-0 group-hover:scale-100 transition-transform duration-300",
            "opacity-0 group-hover:opacity-100"
          )}></div>
        </button>

        {/* Desktop Dropdown */}
        {!mobile && edukasiDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 lg:w-56 bg-white rounded-lg shadow-lg border border-border z-50">
            <div className="py-2">
              {edukasiSubItems.map((subItem) => {
                const Icon = subItem.icon;
                return (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    onClick={handleSubItemClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 text-sm transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:text-green-700"
                      )
                    }
                  >
                    <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{subItem.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Dropdown */}
        {mobile && edukasiDropdownOpen && (
          <div className="mt-2 space-y-1 pl-4 border-l-2 border-green-200">
            {edukasiSubItems.map((subItem) => {
              const Icon = subItem.icon;
              return (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  onClick={handleSubItemClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm transition-colors w-full",
                      isActive
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-700"
                    )
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{subItem.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Rest of nav items */}
      {navItems.slice(1).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "relative px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-300 group",
              "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 hover:shadow-lg",
              "focus:outline-none focus:ring-2 focus:ring-green-500/50",
              isActive 
                ? "bg-gradient-to-r from-green-600 to-green-500 text-white font-bold shadow-lg transform scale-105" 
                : "text-foreground/75 hover:text-green-700",
              mobile && "w-full justify-start text-left"
            )
          }
        >
          <span className={cn(
            "text-sm font-medium relative z-10 whitespace-nowrap",
            mobile ? "text-base" : ""
          )}>
            {item.label}
          </span>
          <div className={cn(
            "absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-amber-100/20 to-orange-100/20",
            "transform scale-0 group-hover:scale-100 transition-transform duration-300",
            "opacity-0 group-hover:opacity-100"
          )}></div>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;