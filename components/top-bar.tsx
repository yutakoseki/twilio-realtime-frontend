import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Wifi, WifiOff, AlertCircle } from "lucide-react";
import Link from "next/link";

type TopBarProps = {
  wsStatus?: "connecting" | "connected" | "disconnected" | "error";
};

const TopBar: React.FC<TopBarProps> = ({ wsStatus = "disconnected" }) => {
  const getStatusIcon = () => {
    switch (wsStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "connecting":
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (wsStatus) {
      case "connected":
        return "WebSocket接続済み";
      case "connecting":
        return "WebSocket接続中...";
      case "error":
        return "WebSocket接続エラー";
      default:
        return "WebSocket未接続";
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        <svg
          id="openai-symbol"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8"
        >
          <path d="M29.71,13.09A8.09,8.09,0,0,0,20.34,2.68a8.08,8.08,0,0,0-13.7,2.9A8.08,8.08,0,0,0,2.3,18.9,8,8,0,0,0,3,25.45a8.08,8.08,0,0,0,8.69,3.87,8,8,0,0,0,6,2.68,8.09,8.09,0,0,0,7.7-5.61,8,8,0,0,0,5.33-3.86A8.09,8.09,0,0,0,29.71,13.09Zm-12,16.82a6,6,0,0,1-3.84-1.39l.19-.11,6.37-3.68a1,1,0,0,0,.53-.91v-9l2.69,1.56a.08.08,0,0,1,.05.07v7.44A6,6,0,0,1,17.68,29.91ZM4.8,24.41a6,6,0,0,1-.71-4l.19.11,6.37,3.68a1,1,0,0,0,1,0l7.79-4.49V22.8a.09.09,0,0,1,0,.08L13,26.6A6,6,0,0,1,4.8,24.41ZM3.12,10.53A6,6,0,0,1,6.28,7.9v7.57a1,1,0,0,0,.51.9l7.75,4.47L11.85,22.4a.14.14,0,0,1-.09,0L5.32,18.68a6,6,0,0,1-2.2-8.18Zm22.13,5.14-7.78-4.52L20.16,9.6a.08.08,0,0,1,.09,0l6.44,3.72a6,6,0,0,1-.9,10.81V16.56A1.06,1.06,0,0,0,25.25,15.67Zm2.68-4-.19-.12-6.36-3.7a1,1,0,0,0-1.05,0l-7.78,4.49V9.2a.09.09,0,0,1,0-.09L19,5.4a6,6,0,0,1,8.91,6.21ZM11.08,17.15,8.38,15.6a.14.14,0,0,1-.05-.08V8.1a6,6,0,0,1,9.84-4.61L18,3.6,11.61,7.28a1,1,0,0,0-.53.91ZM12.54,14,16,12l3.47,2v4L16,20l-3.47-2Z" />
        </svg>
        <h1 className="text-xl font-semibold">OpenAI Call Assistant</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* WebSocket接続状態インジケーター */}
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className="text-muted-foreground">{getStatusText()}</span>
        </div>
        <Button variant="ghost" size="sm">
          <Link
            href="https://platform.openai.com/docs/guides/realtime"
            className="flex items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
