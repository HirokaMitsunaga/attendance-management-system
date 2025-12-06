# Lint/Prettier セットアップガイド

このプロジェクトでは、チーム全体でコードスタイルを統一するために、ESLintとPrettierを設定しています。

## セットアップ手順

### 1. 依存関係のインストール

ルートディレクトリで以下を実行：

```bash
npm install
```

これにより、Huskyとlint-stagedがインストールされます。

### 2. Huskyの初期化

初回のみ、以下を実行：

```bash
npx husky install
```

または、`package.json`の`prepare`スクリプトが自動的に実行される場合もあります。

これにより、Gitのpre-commitフックが設定され、コミット前に自動的にLintとPrettierが実行されます。

**注意**: Husky 9.xでは`husky install`コマンドは非推奨ですが、`.husky/pre-commit`ファイルが既に作成されていれば動作します。

### 3. VS Code拡張機能のインストール

VS Codeを使用している場合、プロジェクトを開くと推奨拡張機能の通知が表示されます。以下の拡張機能をインストールしてください：

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

または、手動でインストール：

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

### 4. 動作確認

VS Codeでファイルを保存すると、自動的にフォーマットされます。

コミット時に、変更されたファイルに対して自動的にLintとPrettierが実行されます。

## 設定ファイル

- **`.prettierrc`**: Prettierの設定（ルート）
- **`.prettierignore`**: Prettierで無視するファイル
- **`.vscode/settings.json`**: VS Codeの設定（保存時に自動フォーマット）
- **`.vscode/extensions.json`**: 推奨拡張機能
- **`.husky/pre-commit`**: Gitコミット前のフック
- **`package.json`**: lint-stagedの設定

## 手動実行

### 全ファイルをフォーマット

```bash
# バックエンド
cd backend && npm run format

# フロントエンド
cd frontend && npx prettier --write "src/**/*.{ts,tsx}"

# または、ルートから
npm run format
```

### Lintチェック

```bash
# バックエンド
cd backend && npm run lint

# フロントエンド
cd frontend && npm run lint

# または、ルートから
npm run lint
```

## CI/CD

GitHub Actionsで、プルリクエスト時に自動的にLintチェックが実行されます。

`.github/workflows/lint.yml`を参照してください。

## トラブルシューティング

### Huskyが動作しない場合

```bash
# Huskyを再初期化
npm run prepare
```

### Prettierが動作しない場合

1. VS Codeの拡張機能がインストールされているか確認
2. `.vscode/settings.json`が正しく設定されているか確認
3. ファイルを再保存してみる

### ESLintエラーが解消されない場合

```bash
# 自動修正を試す
cd backend && npm run lint
cd frontend && npm run lint
```

