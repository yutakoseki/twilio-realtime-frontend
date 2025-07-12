# AWS Amplify セットアップガイド

このガイドでは、Twilioリアルタイム通話アプリをAWS Amplifyで本番環境にデプロイする手順を説明します。

## 前提条件

- AWSアカウント
- Twilioアカウント
- GitHubリポジトリ（このプロジェクト）

## 1. Twilioアカウントの設定

### 1.1 Twilioアカウントの作成
1. [Twilio Console](https://console.twilio.com/) にアクセス
2. アカウントを作成（無料トライアルで開始可能）
3. アカウントSIDとAuth Tokenを取得

### 1.2 電話番号の取得
1. Twilio Consoleで「Phone Numbers」→「Manage」→「Buy a number」
2. 電話番号を購入（月額約$1.15）
3. 購入した番号のSIDをメモ

## 2. AWS Amplifyでの環境変数設定

### 2.1 Amplifyコンソールでの設定
1. AWS Amplifyコンソールにアクセス
2. アプリを選択
3. 「Environment variables」タブを開く
4. 以下の環境変数を追加：

```
TWILIO_ACCOUNT_SID = your_account_sid_here
TWILIO_AUTH_TOKEN = your_auth_token_here
```

### 2.2 環境変数の確認
デプロイ後、以下のURLで環境変数が正しく設定されているか確認：
```
https://your-app-domain.amplifyapp.com/api/health
```

## 3. Webhook URLの設定

### 3.1 自動設定
アプリにアクセス後、セットアップチェックリストで「Webhookを更新」ボタンをクリック

### 3.2 手動設定
Twilio Consoleで：
1. Phone Numbers → Manage → Active numbers
2. 使用する番号をクリック
3. Voice Configuration で以下を設定：
   - Webhook URL: `https://your-app-domain.amplifyapp.com/api/twilio/webhook`
   - HTTP Method: POST

## 4. 動作確認

### 4.1 アプリへのアクセス
```
https://your-app-domain.amplifyapp.com
```

### 4.2 セットアップチェックリスト
1. Twilioアカウントの設定 ✅
2. Twilio電話番号の設定 ✅
3. Webhook URLの更新 ✅

### 4.3 通話テスト
1. 設定したTwilio番号に電話をかける
2. 自動音声メッセージが再生されることを確認

## 5. トラブルシューティング

### 5.1 環境変数が設定されていない
- Amplifyコンソールで環境変数を再確認
- デプロイを再実行

### 5.2 Webhookが動作しない
- Twilio ConsoleでWebhook URLを確認
- アプリのログを確認（Amplifyコンソール → Hosting environments → アプリ → View logs）

### 5.3 通話が接続されない
- Twilio Consoleで電話番号の設定を確認
- アカウントの残高を確認

## 6. セキュリティ注意事項

- 環境変数はAmplifyコンソールでのみ設定
- Auth Tokenは絶対にコードにハードコーディングしない
- 本番環境では適切なIAMロールとポリシーを設定

## 7. コスト管理

- Twilio電話番号: 月額約$1.15
- AWS Amplify: 使用量に応じて課金
- 通話料金: 通話時間と地域に応じて課金

## サポート

問題が発生した場合は、以下を確認してください：
1. AWS Amplifyのログ
2. Twilio Consoleのログ
3. ブラウザの開発者ツールのコンソール 