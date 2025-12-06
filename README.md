# 勤怠管理システム

## 必要な環境

- Node.js 22.x
- PostgreSQL 14.x 以上
- npm

## セットアップ

### クイックスタート（推奨）

**前提条件：Docker Desktop が起動していること**

開発に必要な全てのセットアップを一度に実行：

```bash
# Mac/Linuxの場合
make dev-setup

# Windowsの場合
.\make dev-setup
```

このコマンドは以下を自動で実行します：

1. バックエンドの依存関係インストール
2. フロントエンドの依存関係インストール
3. Docker の起動確認
4. PostgreSQL データベースの起動（Docker Compose）
5. Prisma クライアントの生成
6. データベースマイグレーションの実行
7. シードデータの投入

### 個別セットアップ

個別にセットアップする場合：

#### バックエンド

```bash
# Mac/Linuxの場合
make setup-backend

# Windowsの場合
.\make setup-backend
```

#### フロントエンド

```bash
# Mac/Linuxの場合
make setup-frontend

# Windowsの場合
.\make setup-frontend
```

#### シードデータの投入

```bash
# Mac/Linuxの場合
make seed-backend

# Windowsの場合
.\make seed-backend
```

### Windows での実行について

Windows では `.\make` コマンドで実行できます。実行できない場合は、以下の設定を行ってください：

```powershell
# PowerShell実行ポリシーの変更（管理者権限で実行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## テスト実行

### すべてのテスト

```bash
# Mac/Linuxの場合
make test

# Windowsの場合
.\make test
```

### バックエンドのみ

```bash
# Mac/Linuxの場合
make test-backend

# Windowsの場合
.\make test-backend
```

### フロントエンドのみ

```bash
# Mac/Linuxの場合
make test-frontend

# Windowsの場合
.\make test-frontend
```

### CI 環境と同じ条件でテスト

```bash
# Mac/Linuxの場合
make ci-test-backend

# Windowsの場合
.\make ci-test-backend
```

**重要：ローカルでテストを実行する前に、必ずセットアップを実行してください！**

```bash
# Mac/Linuxの場合
make setup-backend

# Windowsの場合
.\make setup-backend
```

## Lint & Format

詳細なセットアップ手順は [SETUP_LINT.md](./SETUP_LINT.md) を参照してください。

### バックエンド

```bash
# Mac/Linuxの場合
make lint-backend
make format-backend

# Windowsの場合
.\make lint-backend
.\make format-backend
```

### フロントエンド

```bash
# Mac/Linuxの場合
make lint-frontend
make format-frontend

# Windowsの場合
.\make lint-frontend
.\make format-frontend
```

### 自動フォーマット

VS Codeを使用している場合、ファイルを保存すると自動的にフォーマットされます。

コミット時にも自動的にLintとPrettierが実行されます（Husky + lint-staged）。

## クリーンアップ

```bash
# Mac/Linuxの場合
make clean

# Windowsの場合
.\make clean
```

## 開発環境の起動

### バックエンド

```bash
# Mac/Linuxの場合
make dev-be

# Windowsの場合
.\make dev-be
```

または直接実行：

```bash
cd backend
npm run start:dev
```

### フロントエンド

```bash
# Mac/Linuxの場合
make dev-fe

# Windowsの場合
.\make dev-fe
```

または直接実行：

```bash
cd frontend
npm run dev
```

## データベース操作

### マイグレーション作成

```bash
cd backend
npx prisma migrate dev --name <マイグレーション名>
```

### マイグレーション適用

```bash
cd backend
npx prisma migrate deploy
```

### Prisma Studio（データベース GUI）

```bash
cd backend
npm run prisma:studio
```

## Swagger API ドキュメント

バックエンドを起動後、以下の URL で Swagger UI にアクセスできます：

```
http://localhost:3001/api
```

## プロジェクト構成

```
├── backend/              # バックエンド（Nest.js + Prisma）
│   ├── src/
│   │   ├── command/      # Command側（書き込み・更新・削除）
│   │   ├── query/        # Query側（読み取り専用）
│   │   ├── modules/      # モジュール定義
│   │   ├── common/       # 共通処理
│   │   └── config/       # 設定
│   └── prisma/           # Prismaスキーマとシード
│
├── frontend/             # フロントエンド（Next.js）
│   ├── src/
│   │   ├── app/          # ルーティング
│   │   ├── components/   # 共通コンポーネント
│   │   ├── features/     # 機能ごとのドメインロジック
│   │   ├── contexts/     # React Context
│   │   ├── hooks/        # グローバルフック
│   │   ├── libs/         # ライブラリ設定
│   │   └── types/        # 型定義
│
├── Makefile              # Mac/Linux用タスクランナー
├── make.ps1              # Windows用タスクランナー（PowerShell）
└── make.bat              # Windows用タスクランナー（バッチファイル）
```

## アーキテクチャ

### バックエンド

- **CQRS (Command Query Responsibility Segregation)**: Command（書き込み）と Query（読み取り）を分離
- **DDD (Domain-Driven Design)**: Command 側でドメイン駆動設計を採用

### フロントエンド

- **Next.js App Router**: ルーティング管理
- **React Hook Form**: フォーム管理
- **Zod**: バリデーション（バックエンド）
- **Tailwind CSS**: スタイリング

## テスト戦略

- **Unit Test**: ユニットテスト（各層の単体テスト）
- **Integration Test**: 結合テスト（Controller、DAO、Repository の統合テスト）
- **E2E Test**: E2E テスト（API 全体のテスト）

## CI/CD

GitHub Actions を使用して CI を実行しています：

- **Lint**: ESLint によるコード品質チェック
- **Test**: Jest による自動テスト
- **Type Check**: TypeScript の型チェック

## ライセンス

UNLICENSED
