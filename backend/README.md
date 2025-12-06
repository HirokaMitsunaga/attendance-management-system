## 開発（Docker）

ローカル Docker で Nest をホットリロード起動します。

```bash
docker compose up -d --build backend db
```

初回はマイグレーションを適用してください。

```bash
docker compose exec backend npx prisma migrate dev --name init
```

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation (Swagger)

このプロジェクトでは、Swagger UI を使用してAPIドキュメントを提供しています。

### Swagger UIへのアクセス

バックエンドサーバーを起動後、以下のURLでSwagger UIにアクセスできます：

```
http://localhost:3001/api
```

### Swagger UIの使い方

1. **APIエンドポイントの確認**
   - 左側のメニューから各エンドポイント（GET /companies、POST /companies など）を選択できます
   - エンドポイントはタグごとにグループ化されています

2. **エンドポイントの詳細確認**
   - エンドポイントをクリックすると、詳細な情報が表示されます
   - リクエストパラメータ、リクエストボディ、レスポンス形式などを確認できます

3. **APIのテスト実行**
   - "Try it out" ボタンをクリックして、実際にAPIを実行できます
   - パラメータやリクエストボディを入力し、"Execute" ボタンをクリックします
   - レスポンスとステータスコードが表示されます

4. **スキーマの確認**
   - 各モデルのスキーマ（DTO）を確認できます
   - プロパティの型、必須項目、説明などを確認できます

### ローカル開発環境でSwaggerを使用する

#### Dockerを使用する場合

```bash
# バックエンドを起動
docker-compose up -d backend db

# または、全サービスを起動
docker-compose up -d

# ブラウザでアクセス
# http://localhost:3001/api
```

#### ローカルで直接実行する場合

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係をインストール（初回のみ）
npm install

# Prismaクライアントを生成
npm run generate

# 開発サーバーを起動
npm run start:dev

# ブラウザでアクセス
# http://localhost:3001/api
```

### よく使うコマンド

```bash
# 開発サーバーを起動（Swagger UIが自動的に有効化されます）
npm run start:dev

# 本番ビルド（Swagger UIは開発環境のみ）
npm run build
npm run start:prod

# テスト実行（Swagger UIの設定はテストに影響しません）
npm run test
npm run test:e2e
```

### Swagger設定のカスタマイズ

Swagger設定は `src/main.ts` で管理されています。以下の設定を変更できます：

- **タイトル**: `.setTitle('ats API')`
- **説明**: `.setDescription('ats API ドキュメント')`
- **バージョン**: `.setVersion('1.0')`
- **タグ**: `.addTag('companies', '会社管理API')`
- **Swagger UIパス**: `SwaggerModule.setup('api', app, document)`

### 新しいエンドポイントにSwaggerデコレータを追加する

新しいコントローラーやエンドポイントを追加する際は、以下のデコレータを追加してください：

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';

@ApiTags('your-tag')
@Controller('your-endpoint')
export class YourController {
  @Get()
  @ApiOperation({ summary: 'エンドポイントの説明' })
  @ApiResponse({ status: 200, description: '成功時の説明' })
  async yourMethod() {
    // 実装
  }
}
```

DTOクラスには `@ApiProperty()` デコレータを追加してください：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class YourDto {
  @ApiProperty({ description: 'プロパティの説明' })
  property: string;
}
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
