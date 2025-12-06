# PowerShell用のMakeスクリプト

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "利用可能なコマンド:"
    Write-Host ""
    Write-Host "開発サーバー:"
    Write-Host "  .\make dev-be                 - バックエンド開発サーバーを起動"
    Write-Host "  .\make dev-fe                 - フロントエンド開発サーバーを起動"
    Write-Host ""
    Write-Host "セットアップ:"
    Write-Host "  .\make dev-setup              - 開発環境の完全セットアップ（推奨）"
    Write-Host "  .\make setup-backend          - バックエンドのセットアップ"
    Write-Host "  .\make setup-frontend         - フロントエンドのセットアップ"
    Write-Host "  .\make seed-backend           - バックエンドのシードデータを投入"
    Write-Host "  .\make generate-local         - Prismaクライアントを生成"
    Write-Host "  .\make migrate-local          - データベースマイグレーションを実行"
    Write-Host "  .\make seed-local             - ローカルでシードデータを投入"
    Write-Host "  .\make studio-local           - Prisma Studioを起動"
    Write-Host ""
    Write-Host "テスト:"
    Write-Host "  .\make test                   - すべてのテストを実行"
    Write-Host "  .\make test-backend           - バックエンドのテストを実行"
    Write-Host "  .\make test-frontend          - フロントエンドのテストを実行"
    Write-Host "  .\make ci-test-backend        - CI環境と同じ条件でテストを実行"
    Write-Host ""
    Write-Host "コード品質:"
    Write-Host "  .\make lint-backend           - バックエンドのLintを実行"
    Write-Host "  .\make lint-frontend          - フロントエンドのLintを実行"
    Write-Host "  .\make format-backend         - バックエンドのフォーマットを実行"
    Write-Host "  .\make format-frontend        - フロントエンドのフォーマットを実行"
    Write-Host ""
    Write-Host "その他:"
    Write-Host "  .\make clean                  - 生成されたファイルをクリーンアップ"
}

function Setup-Backend {
    Write-Host "バックエンドのセットアップを開始..."
    Set-Location backend
    npm install
    npx prisma generate
    npx prisma migrate deploy
    Set-Location ..
    Write-Host "バックエンドのセットアップが完了しました"
}

function Setup-Frontend {
    Write-Host "フロントエンドのセットアップを開始..."
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "フロントエンドのセットアップが完了しました"
}

function Seed-Backend {
    Write-Host "バックエンドのシードデータを投入..."
    Set-Location backend
    npm run seed:dev
    Set-Location ..
    Write-Host "シードデータの投入が完了しました"
}

function Generate-Local {
    Write-Host "Prismaクライアントを生成..."
    Set-Location backend
    npm run generate
    Set-Location ..
    Write-Host "Prismaクライアントの生成が完了しました"
}

function Migrate-Local {
    Write-Host "データベースマイグレーションを実行..."
    Set-Location backend
    
    # タイムスタンプでマイグレーション名を生成
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $migrationName = "migrate_$timestamp"
    
    # 非対話式でマイグレーションを実行
    # PowerShellで "y" をパイプして警告を自動承認
    try {
        # 警告に対する自動応答のために "y" を標準入力に送る
        $migrateResult = "y" | npx prisma migrate dev --name $migrationName --skip-seed 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "エラー: データベースマイグレーションに失敗しました" -ForegroundColor Red
            Write-Host $migrateResult -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        Write-Host $migrateResult
    } catch {
        Write-Host "エラー: データベースマイグレーション中にエラーが発生しました: $_" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
    Write-Host "データベースマイグレーションが完了しました" -ForegroundColor Green
}

function Seed-Local {
    Write-Host "ローカルでシードデータを投入..."
    Set-Location backend
    npm run seed
    Set-Location ..
    Write-Host "シードデータの投入が完了しました"
}

function Studio-Local {
    Write-Host "Prisma Studioを起動..."
    
    # DATABASE_URL環境変数を設定（未設定の場合）
    if (-not $env:DATABASE_URL) {
        $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/app?schema=public"
        Write-Host "DATABASE_URL環境変数を設定しました: $env:DATABASE_URL" -ForegroundColor Yellow
    }
    
    Set-Location backend
    npm run prisma:studio
    Set-Location ..
    Write-Host "Prisma Studioが終了しました"
}

function Test-Backend {
    Write-Host "バックエンドのテストを実行..."
    Set-Location backend
    npm run test
    Set-Location ..
    Write-Host "バックエンドのテストが完了しました"
}

function Test-Frontend {
    Write-Host "フロントエンドのテストを実行..."
    Set-Location frontend
    npm run test
    Set-Location ..
    Write-Host "フロントエンドのテストが完了しました"
}

function Test-All {
    Test-Backend
    Test-Frontend
}

function Lint-Backend {
    Write-Host "バックエンドのLintを実行..."
    Set-Location backend
    npm run lint
    Set-Location ..
    Write-Host "バックエンドのLintが完了しました"
}

function Lint-Frontend {
    Write-Host "フロントエンドのLintを実行..."
    Set-Location frontend
    npm run lint
    Set-Location ..
    Write-Host "フロントエンドのLintが完了しました"
}

function Format-Backend {
    Write-Host "バックエンドのフォーマットを実行..."
    Set-Location backend
    npm run format
    Set-Location ..
    Write-Host "バックエンドのフォーマットが完了しました"
}

function Format-Frontend {
    Write-Host "フロントエンドのフォーマットを実行..."
    Set-Location frontend
    npm run format
    Set-Location ..
    Write-Host "フロントエンドのフォーマットが完了しました"
}

function Clean-All {
    Write-Host "生成されたファイルをクリーンアップ..."
    if (Test-Path "backend/node_modules") { Remove-Item -Recurse -Force backend/node_modules }
    if (Test-Path "backend/dist") { Remove-Item -Recurse -Force backend/dist }
    if (Test-Path "backend/coverage") { Remove-Item -Recurse -Force backend/coverage }
    if (Test-Path "frontend/node_modules") { Remove-Item -Recurse -Force frontend/node_modules }
    if (Test-Path "frontend/.next") { Remove-Item -Recurse -Force frontend/.next }
    if (Test-Path "frontend/out") { Remove-Item -Recurse -Force frontend/out }
    Write-Host "クリーンアップが完了しました"
}

function CI-Test-Backend {
    Write-Host "CI環境と同じ条件でバックエンドのテストを実行..."
    Setup-Backend
    Test-Backend
    Write-Host "CI環境でのテストが完了しました"
}

function Dev-Backend {
    Write-Host "バックエンド開発サーバーを起動..."
    Set-Location backend
    npm run start:dev
}

function Dev-Frontend {
    Write-Host "フロントエンド開発サーバーを起動..."
    Set-Location frontend
    npm run dev
}

function Dev-Setup {
    Write-Host "ローカル開発環境のセットアップを開始します..." -ForegroundColor Green
    Write-Host ""

    # 1. バックエンドの依存関係インストール
    Write-Host "1. バックエンドの依存関係をインストールしています..." -ForegroundColor Yellow
    Set-Location backend
    $null = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: バックエンドの依存関係のインストールに失敗しました" -ForegroundColor Red
        Set-Location ..
        exit 1
    }

    # 2. フロントエンドの依存関係インストール
    Write-Host "2. フロントエンドの依存関係をインストールしています..." -ForegroundColor Yellow
    Set-Location ../frontend
    $null = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: フロントエンドの依存関係のインストールに失敗しました" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..

    # 3. Dockerが起動しているか確認
    Write-Host "3. Dockerが起動しているか確認しています..." -ForegroundColor Yellow
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: Dockerが起動していません。Docker Desktopを起動してから再度実行してください。" -ForegroundColor Red
        exit 1
    }

    # 4. データベースを起動
    Write-Host "4. データベースを起動しています..." -ForegroundColor Yellow
    $dockerUp = docker compose up -d db 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: データベースコンテナの起動に失敗しました" -ForegroundColor Red
        Write-Host $dockerUp -ForegroundColor Red
        exit 1
    }

    # 5. PostgreSQLの起動を待つ
    Write-Host "5. PostgreSQLの起動を待っています..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    # 6. Prismaクライアント生成
    Write-Host "6. Prismaクライアントを生成しています..." -ForegroundColor Yellow
    $env:DATABASE_URL = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgresql://postgres:postgres@localhost:5433/app?schema=public" }
    Set-Location backend
    $prismaGenerate = npm run generate 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: Prismaクライアントの生成に失敗しました" -ForegroundColor Red
        Write-Host $prismaGenerate -ForegroundColor Red
        Set-Location ..
        exit 1
    }

    # 7. データベースマイグレーション
    Write-Host "7. データベースマイグレーションを実行しています..." -ForegroundColor Yellow
    $migrateResult = npm run migrate:dev 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: データベースマイグレーションに失敗しました" -ForegroundColor Red
        Write-Host $migrateResult -ForegroundColor Red
        Set-Location ..
        exit 1
    }

    # 8. シードデータ投入
    Write-Host "8. シードデータを投入しています..." -ForegroundColor Yellow
    $seedResult = npm run seed 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "エラー: シードデータの投入に失敗しました" -ForegroundColor Red
        Write-Host $seedResult -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..

    # 完了メッセージ
    Write-Host ""
    Write-Host "セットアップ完了！" -ForegroundColor Green
    Write-Host ""
    Write-Host "次に開発サーバーを起動してください：" -ForegroundColor Cyan
    Write-Host "  .\make dev-be  （別ターミナルで .\make dev-fe）" -ForegroundColor Cyan
}

# コマンドの実行
switch ($Command) {
    "help" { Show-Help }
    "dev-setup" { Dev-Setup }
    "dev-be" { Dev-Backend }
    "dev-fe" { Dev-Frontend }
    "setup-backend" { Setup-Backend }
    "setup-frontend" { Setup-Frontend }
    "test" { Test-All }
    "test-backend" { Test-Backend }
    "test-frontend" { Test-Frontend }
    "seed-backend" { Seed-Backend }
    "lint-backend" { Lint-Backend }
    "lint-frontend" { Lint-Frontend }
    "format-backend" { Format-Backend }
    "format-frontend" { Format-Frontend }
    "clean" { Clean-All }
    "ci-test-backend" { CI-Test-Backend }
    "generate-local" { Generate-Local }
    "migrate-local" { Migrate-Local }
    "seed-local" { Seed-Local }
    "studio-local" { Studio-Local }
    default {
        Write-Host "不明なコマンド: $Command"
        Show-Help
        exit 1
    }
}
