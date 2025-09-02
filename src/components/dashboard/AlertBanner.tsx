import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
}

interface AlertBannerProps {
  alerts: Alert[];
}

const AlertBanner = ({ alerts }: AlertBannerProps) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  
  if (activeAlerts.length === 0) return null;

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "bg-warning/10 border-warning/50 text-warning";
      case "danger":
        return "bg-danger/10 border-danger/50 text-danger";
      case "info":
        return "bg-info/10 border-info/50 text-info";
      case "success":
        return "bg-success/10 border-success/50 text-success";
    }
  };

  return (
    <div className="space-y-2">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-start justify-between p-4 rounded-lg border",
            "animate-in slide-in-from-top duration-300",
            getAlertStyles(alert.type)
          )}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="mt-0.5" />
            <div>
              <h4 className="font-semibold">{alert.title}</h4>
              <p className="text-sm opacity-90">{alert.message}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {alert.timestamp.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;