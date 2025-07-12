# Twilio Realtime Frontend

OpenAI Realtime Twilio Demoのフロントエンドアプリケーション

## 技術スタック

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 環境変数

以下の環境変数を設定してください：

- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocketサーバーのURL

## デプロイ

このアプリケーションはAWS Amplifyでデプロイされています。 