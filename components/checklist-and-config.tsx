"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle, Loader2 } from "lucide-react";
import { PhoneNumber } from "@/components/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChecklistAndConfig({
  ready,
  setReady,
  selectedPhoneNumber,
  setSelectedPhoneNumber,
}: {
  ready: boolean;
  setReady: (val: boolean) => void;
  selectedPhoneNumber: string;
  setSelectedPhoneNumber: (val: string) => void;
}) {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [currentNumberSid, setCurrentNumberSid] = useState("");
  const [currentVoiceUrl, setCurrentVoiceUrl] = useState("");
  const [phoneNumbersError, setPhoneNumbersError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [allChecksPassed, setAllChecksPassed] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);

  // AWS Amplify環境では、Webhook URLは現在のドメインを使用
  const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrl = currentDomain ? `${currentDomain}/api/twilio/webhook` : "";
  
  // 開発環境（localhost）ではWebhook URLの更新をスキップ
  const isDevelopment = currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1');
  const shouldSkipWebhookUpdate = isDevelopment;

  const isWebhookMismatch =
    webhookUrl && currentVoiceUrl && webhookUrl !== currentVoiceUrl && !shouldSkipWebhookUpdate;

  useEffect(() => {
    let polling = true;
    let pollCount = 0;
    const maxPolls = 10; // 最大10回までポーリング

    const pollChecks = async () => {
      try {
        // 1. Check credentials
        let res = await fetch("/api/twilio");
        if (!res.ok) throw new Error("Failed credentials check");
        const credData = await res.json();
        setHasCredentials(!!credData?.credentialsSet);

        // 2. Fetch numbers
        res = await fetch("/api/twilio/numbers");
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to fetch phone numbers:", errorData);
          const errorMessage = errorData.details?.hasAccountSid === false || errorData.details?.hasAuthToken === false
            ? "Twilio認証情報が設定されていません。AWS Amplifyコンソールで環境変数を確認してください。"
            : errorData.error || res.statusText;
          setPhoneNumbersError(errorMessage);
          throw new Error(`Failed to fetch phone numbers: ${errorMessage}`);
        }
        const numbersData = await res.json();
        console.log("Phone numbers response:", numbersData);
        
        setPhoneNumbersError(null); // Clear any previous errors
        
        if (Array.isArray(numbersData) && numbersData.length > 0) {
          setPhoneNumbers(numbersData);
          
          // 電話番号の選択ロジックを改善
          let selected;
          
          // 1. 既に選択されている番号がある場合はそれを維持
          if (currentNumberSid) {
            selected = numbersData.find((p: PhoneNumber) => p.sid === currentNumberSid);
          }
          
          // 2. 選択されていない場合は、最も適切な番号を選択
          if (!selected) {
            // 優先順位: 1) 既にWebhookが設定されている番号 2) 最初の番号
            selected = numbersData.find((p: PhoneNumber) => p.voiceUrl && p.voiceUrl.trim() !== '') ||
                      numbersData[0];
          }
          
          setCurrentNumberSid(selected.sid);
          setCurrentVoiceUrl(selected.voiceUrl || "");
          setSelectedPhoneNumber(selected.friendlyName || "");
          
          console.log(`Selected phone number: ${selected.friendlyName} (${selected.sid})`);
          
          // 電話番号が取得できたらポーリングを停止
          polling = false;
        } else {
          console.log("No phone numbers found in response");
          setPhoneNumbers([]);
          setPhoneNumbersError("電話番号が見つかりません。Twilio Consoleで電話番号を購入してください。");
        }
      } catch (err) {
        console.error("Polling error:", err);
        pollCount++;
        
        // エラーが続く場合はポーリングを停止
        if (pollCount >= maxPolls) {
          polling = false;
        }
      }
    };

    pollChecks();
    const intervalId = setInterval(() => {
      if (polling && pollCount < maxPolls) {
        pollChecks();
      } else {
        clearInterval(intervalId);
      }
    }, 5000); // 5秒間隔に変更
    
    return () => {
      polling = false;
      clearInterval(intervalId);
    };
  }, [currentNumberSid, setSelectedPhoneNumber]);

  const updateWebhook = async () => {
    if (shouldSkipWebhookUpdate) {
      console.log("Skipping webhook update in development environment");
      return;
    }
    
    if (!currentNumberSid || !webhookUrl) return;
    try {
      setWebhookLoading(true);
      const res = await fetch("/api/twilio/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberSid: currentNumberSid,
          voiceUrl: webhookUrl,
        }),
      });
      if (!res.ok) throw new Error("Failed to update webhook");
      setCurrentVoiceUrl(webhookUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setWebhookLoading(false);
    }
  };

  const refreshPhoneNumbers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/twilio/numbers");
      if (!res.ok) {
        const errorData = await res.json();
        setPhoneNumbersError(errorData.error || res.statusText);
        return;
      }
      const numbersData = await res.json();
      setPhoneNumbersError(null);
      
      if (Array.isArray(numbersData) && numbersData.length > 0) {
        setPhoneNumbers(numbersData);
        const selected = numbersData.find((p: PhoneNumber) => p.sid === currentNumberSid) ||
                        numbersData[0];
        setCurrentNumberSid(selected.sid);
        setCurrentVoiceUrl(selected.voiceUrl || "");
        setSelectedPhoneNumber(selected.friendlyName || "");
      } else {
        setPhoneNumbers([]);
        setPhoneNumbersError("電話番号が見つかりません。Twilio Consoleで電話番号を購入してください。");
      }
    } catch (err) {
      console.error("Refresh error:", err);
      setPhoneNumbersError("電話番号の更新に失敗しました");
    } finally {
      setIsRefreshing(false);
    }
  };

  const checklist = useMemo(() => {
    return [
      {
        label: "Twilioアカウントの設定",
        done: hasCredentials,
        description: "環境変数でTWILIO_ACCOUNT_SIDとTWILIO_AUTH_TOKENを設定してください",
        field: (
          <Button
            className="w-full"
            onClick={() => window.open("https://console.twilio.com/", "_blank")}
          >
            Twilioコンソールを開く
          </Button>
        ),
      },
      {
        label: "Twilio電話番号の設定",
        done: phoneNumbers.length > 0,
        description: phoneNumbersError 
          ? phoneNumbersError 
          : "月額約$1.15の費用がかかります",
        field:
          phoneNumbers.length > 0 ? (
            phoneNumbers.length === 1 ? (
              <div className="space-y-1">
                <Input value={phoneNumbers[0].friendlyName || ""} disabled />
                <div className="text-xs text-gray-500">
                  {phoneNumbers[0].phoneNumber}
                  {phoneNumbers[0].voiceUrl && (
                    <span className="ml-2 text-green-600">✓ Webhook設定済み</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPhoneNumbers}
                  disabled={isRefreshing}
                  className="w-full"
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-2 h-4 animate-spin" />
                  ) : (
                    "更新"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    setCurrentNumberSid(value);
                    const selected = phoneNumbers.find((p) => p.sid === value);
                    if (selected) {
                      setSelectedPhoneNumber(selected.friendlyName || "");
                      setCurrentVoiceUrl(selected.voiceUrl || "");
                    }
                  }}
                  value={currentNumberSid}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="電話番号を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {phoneNumbers.map((phone) => (
                      <SelectItem key={phone.sid} value={phone.sid}>
                        <div className="flex flex-col">
                          <span>{phone.friendlyName || phone.phoneNumber}</span>
                          <span className="text-xs text-gray-500">
                            {phone.phoneNumber}
                            {phone.voiceUrl && (
                              <span className="ml-1 text-green-600">✓ Webhook設定済み</span>
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500">
                  {phoneNumbers.length}個の電話番号が利用可能です
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPhoneNumbers}
                  disabled={isRefreshing}
                  className="w-full"
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-2 h-4 animate-spin" />
                  ) : (
                    "更新"
                  )}
                </Button>
              </div>
            )
          ) : (
            <Button
              className="w-full"
              onClick={() =>
                window.open(
                  "https://console.twilio.com/us1/develop/phone-numbers/manage/incoming",
                  "_blank"
                )
              }
            >
              Twilio電話番号を設定
            </Button>
          ),
      },
      {
        label: "Webhook URLの更新",
        done: shouldSkipWebhookUpdate || (!!webhookUrl && !isWebhookMismatch),
        description: shouldSkipWebhookUpdate 
          ? "開発環境では自動的にスキップされます（本番環境で設定してください）"
          : "Twilioコンソールで手動設定することも可能です",
        field: shouldSkipWebhookUpdate ? (
          <div className="text-sm text-gray-500">
            開発環境では自動スキップ
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1">
              <Input value={currentVoiceUrl} disabled className="w-full" />
            </div>
            <div className="flex-1">
              <Button
                onClick={updateWebhook}
                disabled={webhookLoading}
                className="w-full"
              >
                {webhookLoading ? (
                  <Loader2 className="mr-2 h-4 animate-spin" />
                ) : (
                  "Webhookを更新"
                )}
              </Button>
            </div>
          </div>
        ),
      },
    ];
  }, [
    hasCredentials,
    phoneNumbers,
    currentNumberSid,
    webhookUrl,
    currentVoiceUrl,
    isWebhookMismatch,
    webhookLoading,
    phoneNumbersError,
    setSelectedPhoneNumber,
    shouldSkipWebhookUpdate,
    isRefreshing,
    refreshPhoneNumbers,
  ]);

  useEffect(() => {
    setAllChecksPassed(checklist.every((item) => item.done));
  }, [checklist]);

  useEffect(() => {
    if (!allChecksPassed) {
      setReady(false);
    }
  }, [allChecksPassed, setReady]);

  const handleDone = () => setReady(true);

  return (
    <Dialog open={!ready}>
      <DialogContent className="w-full max-w-[800px]">
        <DialogHeader>
          <DialogTitle>セットアップチェックリスト</DialogTitle>
          <DialogDescription>
            {shouldSkipWebhookUpdate 
              ? "開発環境では一部の設定が自動的にスキップされます。本番環境では全ての設定が必要です。"
              : "このアプリを使用する前に、以下の手順を完了してください"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-0">
          {checklist.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 py-2"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  {item.done ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <Circle className="text-gray-400" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 ml-8">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center mt-2 sm:mt-0">{item.field}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleDone}
            disabled={!allChecksPassed}
          >
            開始する！
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
