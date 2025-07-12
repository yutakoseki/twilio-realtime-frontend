# Twilio Realtime Frontend

OpenAI Realtime Twilio Demoのフロントエンドアプリケーション

## 技術スタック

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Twilio API

## 機能

- Twilio電話番号の管理
- リアルタイム通話インターフェース
- 通話履歴とトランスクリプト
- セッション設定管理

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

### 開発環境
- `TWILIO_ACCOUNT_SID`: TwilioアカウントSID
- `TWILIO_AUTH_TOKEN`: Twilio認証トークン

### 本番環境（AWS Amplify）
AWS Amplifyコンソールで以下の環境変数を設定：
- `TWILIO_ACCOUNT_SID`: TwilioアカウントSID
- `TWILIO_AUTH_TOKEN`: Twilio認証トークン

## デプロイ

このアプリケーションはAWS Amplifyでデプロイされています。

### AWS Amplifyでのセットアップ

詳細なセットアップ手順は [AMPLIFY_SETUP.md](./AMPLIFY_SETUP.md) を参照してください。

#### 簡単な手順：

1. **Twilioアカウントの設定**
   - Twilio Consoleでアカウントを作成
   - 電話番号を購入（月額約$1.15）

2. **AWS Amplifyでの環境変数設定**
   - Amplifyコンソールで環境変数を設定
   - `TWILIO_ACCOUNT_SID` と `TWILIO_AUTH_TOKEN` を追加

3. **Webhook URLの設定**
   - アプリにアクセス後、セットアップチェックリストで自動設定
   - またはTwilio Consoleで手動設定

4. **動作確認**
   - 設定したTwilio番号に電話をかけてテスト

## アーキテクチャ

- **フロントエンド**: Next.js 14 + React 18
- **API**: Next.js API Routes
- **Webhook**: Twilio Webhookエンドポイント
- **ホスティング**: AWS Amplify

## トラブルシューティング

### よくある問題

1. **環境変数が設定されていない**
   - Amplifyコンソールで環境変数を確認
   - `/api/health` エンドポイントで確認

2. **Webhookが動作しない**
   - Twilio ConsoleでWebhook URLを確認
   - アプリのログを確認

3. **通話が接続されない**
   - Twilio Consoleで電話番号の設定を確認
   - アカウントの残高を確認

## ライセンス

MIT License 