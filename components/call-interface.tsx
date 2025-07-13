"use client";

import React, { useState, useEffect, useRef } from "react";
import TopBar from "@/components/top-bar";
import ChecklistAndConfig from "@/components/checklist-and-config";
import SessionConfigurationPanel from "@/components/session-configuration-panel";
import Transcript from "@/components/transcript";
import FunctionCallsPanel from "@/components/function-calls-panel";
import { Item } from "@/components/types";
import PhoneNumberChecklist from "@/components/phone-number-checklist";
import handleRealtimeEvent from "@/lib/handle-realtime-event";

const CallInterface = () => {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [allConfigsReady, setAllConfigsReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [callStatus, setCallStatus] = useState("disconnected");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket接続の確立
  useEffect(() => {
    const connectWebSocket = () => {
      // WebSocketサーバーのURLを取得
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://production-alb-981597197.ap-northeast-1.elb.amazonaws.com';
      const logsUrl = `${wsUrl}/logs`;
      
      console.log("Connecting to WebSocket:", logsUrl);
      setWsStatus("connecting");
      
      const ws = new WebSocket(logsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsStatus("connected");
        setWsConnection(ws);
        setCallStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          handleRealtimeEvent(data, setItems);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setWsStatus("disconnected");
        setWsConnection(null);
        setCallStatus("disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus("error");
        setCallStatus("error");
      };
    };

    // コンポーネントマウント時にWebSocket接続を確立
    connectWebSocket();

    // クリーンアップ
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // セッション設定の保存
  const handleSessionSave = (config: any) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: "session.update",
        session: config
      }));
      console.log("Session configuration sent to WebSocket:", config);
    } else {
      console.log("WebSocket not connected, session configuration saved locally:", config);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <ChecklistAndConfig
        ready={allConfigsReady}
        setReady={setAllConfigsReady}
        selectedPhoneNumber={selectedPhoneNumber}
        setSelectedPhoneNumber={setSelectedPhoneNumber}
      />
      <TopBar wsStatus={wsStatus} />
      <div className="flex-grow p-4 h-full overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-3 flex flex-col h-full overflow-hidden">
            <SessionConfigurationPanel
              callStatus={callStatus}
              onSave={handleSessionSave}
            />
          </div>

          {/* Middle Column: Transcript */}
          <div className="col-span-6 flex flex-col gap-4 h-full overflow-hidden">
            <PhoneNumberChecklist
              selectedPhoneNumber={selectedPhoneNumber}
              allConfigsReady={allConfigsReady}
              setAllConfigsReady={setAllConfigsReady}
            />
            <Transcript items={items} />
          </div>

          {/* Right Column: Function Calls */}
          <div className="col-span-3 flex flex-col h-full overflow-hidden">
            <FunctionCallsPanel items={items} ws={wsConnection} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
