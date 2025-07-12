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
          setPhoneNumbersError(errorData.error || res.statusText);
          throw new Error(`Failed to fetch phone numbers: ${errorData.error || res.statusText}`);
        }
        const numbersData = await res.json();
        console.log("Phone numbers response:", numbersData);
        
        setPhoneNumbersError(null); // Clear any previous errors
        
        if (Array.isArray(numbersData) && numbersData.length > 0) {
          setPhoneNumbers(numbersData);
          // If currentNumberSid not set or not in the list, use first
          const selected =
            numbersData.find((p: PhoneNumber) => p.sid === currentNumberSid) ||
            numbersData[0];
          setCurrentNumberSid(selected.sid);
          setCurrentVoiceUrl(selected.voiceUrl || "");
          setSelectedPhoneNumber(selected.friendlyName || "");
        } else {
          console.log("No phone numbers found in response");
          setPhoneNumbers([]);
          setPhoneNumbersError("電話番号が見つかりません。Twilio Consoleで電話番号を購入してください。");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollChecks();
    const intervalId = setInterval(() => polling && pollChecks(), 2000);
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
              <Input value={phoneNumbers[0].friendlyName || ""} disabled />
            ) : (
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
                      {phone.friendlyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
