.PHONY: help test test-backend test-frontend setup-backend setup-frontend seed-backend lint-backend lint-frontend format-backend format-frontend clean dev-be dev-fe dev-setup ci-test-backend studio-local generate-local migrate-local seed-local

# デフォルトターゲット
help:
	@echo "利用可能なコマンド:"
	@echo ""
	@echo "開発サーバー:"
	@echo "  make dev-be              - バックエンド開発サーバーを起動"
	@echo "  make dev-fe              - フロントエンド開発サーバーを起動"
	@echo ""
	@echo "セットアップ:"
	@echo "  make dev-setup           - 開発環境の完全セットアップ（推奨）"
	@echo "  make setup-backend       - バックエンドのセットアップ"
	@echo "  make setup-frontend      - フロントエンドのセットアップ"
	@echo "  make seed-backend        - バックエンドのシードデータを投入"
	@echo "  make generate-local      - Prismaクライアントを生成"
	@echo "  make migrate-local       - データベースマイグレーションを実行"
	@echo "  make seed-local          - ローカルでシードデータを投入"
	@echo "  make studio-local        - Prisma Studioを起動"
	@echo ""
	@echo "テスト:"
	@echo "  make test                - すべてのテストを実行"
	@echo "  make test-backend        - バックエンドのテストを実行"
	@echo "  make test-frontend       - フロントエンドのテストを実行"
	@echo "  make ci-test-backend     - CI環境と同じ条件でテストを実行"
	@echo ""
	@echo "コード品質:"
	@echo "  make lint-backend        - バックエンドのLintを実行"
	@echo "  make lint-frontend       - フロントエンドのLintを実行"
	@echo "  make format-backend      - バックエンドのフォーマットを実行"
	@echo "  make format-frontend     - フロントエンドのフォーマットを実行"
	@echo ""
	@echo "その他:"
	@echo "  make clean               - 生成されたファイルをクリーンアップ"

# バックエンドのセットアップ
setup-backend:
	@echo "バックエンドのセットアップを開始..."
	cd backend && npm install
	cd backend && npx prisma generate
	cd backend && npx prisma migrate deploy
	@echo "バックエンドのセットアップが完了しました"

# フロントエンドのセットアップ
setup-frontend:
	@echo "フロントエンドのセットアップを開始..."
	cd frontend && npm install
	@echo "フロントエンドのセットアップが完了しました"

# バックエンドのシードデータを投入
seed-backend:
	@echo "バックエンドのシードデータを投入..."
	cd backend && npm run seed:dev
	@echo "シードデータの投入が完了しました"

# バックエンドのテスト
test-backend:
	@echo "バックエンドのテストを実行..."
	cd backend && npm run test
	@echo "バックエンドのテストが完了しました"

# フロントエンドのテスト
test-frontend:
	@echo "フロントエンドのテストを実行..."
	cd frontend && npm run test
	@echo "フロントエンドのテストが完了しました"

# すべてのテスト
test: test-backend test-frontend

# バックエンドのLint
lint-backend:
	@echo "バックエンドのLintを実行..."
	cd backend && npm run lint
	@echo "バックエンドのLintが完了しました"

# フロントエンドのLint
lint-frontend:
	@echo "フロントエンドのLintを実行..."
	cd frontend && npm run lint
	@echo "フロントエンドのLintが完了しました"

# バックエンドのフォーマット
format-backend:
	@echo "バックエンドのフォーマットを実行..."
	cd backend && npm run format
	@echo "バックエンドのフォーマットが完了しました"

# フロントエンドのフォーマット
format-frontend:
	@echo "フロントエンドのフォーマットを実行..."
	cd frontend && npm run format
	@echo "フロントエンドのフォーマットが完了しました"

# クリーンアップ
clean:
	@echo "生成されたファイルをクリーンアップ..."
	cd backend && rm -rf node_modules dist coverage
	cd frontend && rm -rf node_modules .next out
	@echo "クリーンアップが完了しました"

# CIと同じ環境でテストを実行
ci-test-backend: setup-backend
	@echo "CI環境と同じ条件でバックエンドのテストを実行..."
	cd backend && npm run test
	@echo "CI環境でのテストが完了しました"

# 開発サーバーの起動
dev-be:
	@echo "バックエンド開発サーバーを起動..."
	cd backend && npm run start:dev

dev-fe:
	@echo "フロントエンド開発サーバーを起動..."
	cd frontend && npm run dev

# 開発環境の完全セットアップ
dev-setup:
	@echo "ローカル開発環境のセットアップを開始します..."
	@echo ""
	@echo "1. ルートの依存関係をインストールしています..."
	@npm install
	@echo "2. Huskyを初期化しています..."
	@npm run prepare || true
	@echo "3. バックエンドの依存関係をインストールしています..."
	@cd backend && npm install
	@echo "4. フロントエンドの依存関係をインストールしています..."
	@cd frontend && npm install
	@echo "5. Dockerが起動しているか確認しています..."
	@docker info > /dev/null 2>&1 || (echo "エラー: Dockerが起動していません。Docker Desktopを起動してから再度実行してください。" && exit 1)
	@echo "6. データベースを起動しています..."
	@docker compose up -d db
	@echo "7. PostgreSQLの起動を待っています..."
	@sleep 10
	@echo "8. Prismaクライアントを生成しています..."
	@cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" npm run generate
	@echo "9. データベースマイグレーションを実行しています..."
	@cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" npm run migrate:dev
	@echo "10. シードデータを投入しています..."
	@cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" npm run seed
	@echo ""
	@echo "セットアップ完了！"
	@echo ""
	@echo "次に開発サーバーを起動してください："
	@echo "  make dev-be  （別ターミナルで make dev-fe）"
	@echo ""
	@echo "VS Codeを使用している場合、推奨拡張機能をインストールしてください："
	@echo "  - ESLint (dbaeumer.vscode-eslint)"
	@echo "  - Prettier (esbenp.prettier-vscode)"

# Prismaクライアント生成
generate-local:
	@echo "Prismaクライアントを生成..."
	@if [ -z "$$DATABASE_URL" ]; then \
		export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" && \
		echo "DATABASE_URL環境変数を設定しました: $$DATABASE_URL" && \
		cd backend && DATABASE_URL=$$DATABASE_URL npm run generate; \
	else \
		cd backend && npm run generate; \
	fi
	@echo "Prismaクライアントの生成が完了しました"

# データベースマイグレーション
migrate-local:
	@echo "データベースマイグレーションを実行..."
	@if [ -z "$$DATABASE_URL" ]; then \
		export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" && \
		echo "DATABASE_URL環境変数を設定しました: $$DATABASE_URL" && \
		timestamp=$$(date +%Y%m%d%H%M%S) && \
		cd backend && DATABASE_URL=$$DATABASE_URL npx prisma migrate dev --name migrate_$$timestamp --skip-seed; \
	else \
		timestamp=$$(date +%Y%m%d%H%M%S) && \
		cd backend && npx prisma migrate dev --name migrate_$$timestamp --skip-seed; \
	fi
	@echo "データベースマイグレーションが完了しました"

# ローカルでシードデータを投入
seed-local:
	@echo "ローカルでシードデータを投入..."
	@if [ -z "$$DATABASE_URL" ]; then \
		export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" && \
		echo "DATABASE_URL環境変数を設定しました: $$DATABASE_URL" && \
		cd backend && DATABASE_URL=$$DATABASE_URL npm run seed; \
	else \
		cd backend && npm run seed; \
	fi
	@echo "シードデータの投入が完了しました"

# Prisma Studioを起動
studio-local:
	@echo "Prisma Studioを起動..."
	@if [ -z "$$DATABASE_URL" ]; then \
		export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" && \
		echo "DATABASE_URL環境変数を設定しました: $$DATABASE_URL" && \
		cd backend && DATABASE_URL=$$DATABASE_URL npm run prisma:studio; \
	else \
		cd backend && npm run prisma:studio; \
	fi
