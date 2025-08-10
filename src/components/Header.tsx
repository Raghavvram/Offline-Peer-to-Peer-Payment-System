import React from "react";
import { useUpi } from "@/context/UpiContext";
import { Switch } from "@/components/ui/switch";
import { WifiIcon, WifiOffIcon } from "lucide-react";

const Header: React.FC = () => {
  const { isOnline, toggleOnline } = useUpi();

  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-upi-blue">Payzzle</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <div className="flex items-center text-upi-green">
              <WifiIcon size={16} className="mr-1" /> <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center text-upi-red">
              <WifiOffIcon size={16} className="mr-1" /> <span>Offline</span>
            </div>
          )}
          <Switch
            checked={isOnline}
            onCheckedChange={toggleOnline}
            aria-label="Toggle online/offline mode"
            className={isOnline ? "bg-upi-green" : "bg-upi-red"}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
