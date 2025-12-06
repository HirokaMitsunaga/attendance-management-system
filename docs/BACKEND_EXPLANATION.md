# バックエンド実装説明書

## 1. 設計思想（シンプル構成）

このバックエンドアプリケーションは、NestJS の**機能ごとモジュール構成**をベースにした、シンプルなレイヤードアーキテクチャです。  
現在は以下の 2 機能だけを扱います。

- `users` … ユーザー管理（user / admin ロール、ソフトデリート）
- `search-conditions` … 画面検索条件の保存（ソフトデリート）

### 1.1 レイヤー構成

- **Controller 層**: HTTP の受付（URL と入力チェック、レスポンス整形）
- **Service 層**: ユースケース単位のロジック（「何をするか」を書く）
- **Prisma（インフラ）層**: DB アクセス（PrismaClient）

DDD / CQRS は採用せず、**機能ごとの単純な 3 レイヤー構成**にしています。

#### Controller 層

**責務**

- HTTP リクエスト（パスパラメータ、クエリ、ボディ）の受付
- Zod + `ZodValidationPipe` による入力バリデーション
- Service の呼び出しとレスポンスの返却

**してはいけないこと**

- 複雑なビジネスロジック（条件分岐・計算）
- Prisma を直接叩くこと

#### Service 層

**責務**

- ユースケース単位の処理をまとめる
- Prisma を経由したデータ操作
- エラーハンドリングとログ出力

**してはいけないこと**

- HTTP 依存（`Request` / `Response` への依存）
- フロント専用のフォーマット（DTO）のためだけの変換処理を大量に持つこと

#### Prisma 層

`PrismaService` を通じて **直接 PrismaClient を呼び出す**形にします。

- 複雑なクエリやパフォーマンスチューニングは「Service 層 + PrismaService」で完結
- 追加の `Repository / DAO` 抽象レイヤーは置かない（シンプルさ重視）

---

## 2. 技術スタック

- **NestJS**: フレームワーク
- **TypeScript**
- **Prisma**: ORM
- **PostgreSQL**
- **Zod**: バリデーション

---

## 3. ディレクトリ構成

現状のバックエンドの最小構成は次のとおりです。

```text
src/
├── app.module.ts          # ルートモジュール
├── main.ts                # エントリポイント
├── prisma/
│   └── prisma.module.ts   # PrismaService を提供するモジュール
├── prisma.service.ts      # PrismaClient ラッパ
├── config/
│   └── logger.module.ts   # ロガー設定
├── common/                # 共通処理
│   ├── filters/           # グローバル例外フィルター
│   ├── pipes/             # Zod バリデーションパイプ
│   ├── errors/            # カスタムエラー
│   └── utils/             # ユーティリティ（日付等）
├── users/                 # ユーザー機能
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   │   └── create-user.dto.ts
│   └── entities/
│       └── user.entity.ts
└── search-conditions/     # 検索条件機能
    ├── search-conditions.controller.ts
    ├── search-conditions.service.ts
    └── search-conditions.module.ts
```

過去の `command/`, `query/`, `modules/` ディレクトリは今後参照しません（歴史的なコードとして残っているだけです）。

---

## 4. コーディング時の具体的な指針

### 4.1 各レイヤーの実装パターン

#### 処理の流れ

```text
HTTPリクエスト
  ↓
【Controller】
  - リクエスト受け取り
  - Zod で入力バリデーション
  - Service 呼び出し
  ↓
【Service】
  - PrismaService を使って DB アクセス
  - ビジネスロジック（ユースケース単位）の実装
  - エラーハンドリング
  ↓
【Controller】
  - レスポンス返却
```

#### ✅ Controller 層の書き方（例：Users）

```typescript
// src/users/users.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import {
  createUserRequestSchema,
  type CreateUserRequestDto,
} from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ) {
    return this.usersService.create({
      email: dto.email,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender ?? null,
    });
  }
}
```

#### ✅ Service 層の書き方（例：Users）

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type CreateUserParams = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(params: CreateUserParams) {
    const systemUserId = 'system';
    return this.prisma.user.create({
      data: {
        email: params.email,
        role: params.role,
        firstName: params.firstName,
        lastName: params.lastName,
        gender: params.gender,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
    });
  }
}
```

---

### 4.2 DTO / バリデーションの書き方

#### ✅ DTO（Zod スキーマ）

```typescript
// src/users/dto/create-user.dto.ts
import { z } from 'zod';

export const createUserRequestSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: '権限は必須です' }),
  }),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
```

#### ✅ Controller でのバリデーション

上記の Controller 例の通り、`ZodValidationPipe` にスキーマを渡して使います。

---

### 4.3 SearchConditions の扱い

- エンドポイント例: `GET /search-conditions`
- ソフトデリートカラム（`deletedAt`, `deletedBy`）を持ち、通常の取得では `deletedAt IS NULL` のものだけ返します。
- 必要に応じて、`formType` や `name` で絞り込むロジックを `SearchConditionsService` に足していく想定です。

---

## 5. 実装時のチェックリスト

```typescript
// command/application/user/user.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import { UserEntity } from '../../domain/user/user.entity';
import { UserDao } from '../../../query/dao/user/user.dao';
import { INJECTION_TOKENS } from '../../constants/injection-tokens';

@Injectable()
export class UserService {
  constructor(
    @Inject(INJECTION_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userDao: UserDao, // Query側のDAOを使用
  ) {}

  async create(params: CreateParams): Promise<UserResponseDto> {
    // ✅ OK: Entityの作成（ファクトリメソッドを使用）
    // ビジネスロジックはEntityに集約されている
    const userEntity = UserEntity.create({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      departmentId: params.departmentId,
      createdBy: params.userId,
      updatedBy: params.userId,
    });

    // ✅ OK: Repositoryで保存（Entityをそのまま渡す）
    const created = await this.userRepository.create(userEntity);

    // ✅ OK: Query側のDAOを使って完全な情報を取得
    // Command側ではEntityのみを扱い、表示用データはQuery側のDAOを使用
    const userWithRelations = await this.userDao.findOne({ id: created.id });
    if (!userWithRelations) {
      throw new InternalServerError(
        'ユーザー情報の取得に失敗しました。データの整合性に問題があります。',
      );
    }

    return userWithRelations;
  }

  async update(params: UpdateParams): Promise<UserResponseDto> {
    // ✅ OK: RepositoryからEntityを取得
    const userEntity = await this.userRepository.findById(params.id);
    if (!userEntity) {
      throw new NotFoundError('ユーザー', params.id);
    }

    // ✅ OK: Entityの振る舞いメソッドを使用して更新
    // ビジネスロジック（値の変更チェック等）はEntity側で処理される
    userEntity.changeEmail({
      email: params.email,
      updatedBy: params.userId,
    });

    userEntity.changeRole({
      role: params.role,
      updatedBy: params.userId,
    });

    userEntity.updateProfile({
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      updatedBy: params.userId,
    });

    userEntity.changeDepartment({
      departmentId: params.departmentId,
      updatedBy: params.userId,
    });

    // ✅ OK: Repositoryで保存（Entityをそのまま渡す）
    await this.userRepository.update(userEntity);

    // ✅ OK: Query側のDAOを使って最新の情報を取得
    const userWithRelations = await this.userDao.findOne({ id: params.id });
    if (!userWithRelations) {
      throw new InternalServerError(
        'ユーザー情報の取得に失敗しました。データの整合性に問題があります。',
      );
    }

    return userWithRelations;
  }
}
```

**❌ Application層でやってはいけないこと**:

```typescript
// ❌ NG: ビジネスロジックをApplication層に書く
async update(params: UpdateParams) {
  const userEntity = await this.userRepository.findById(params.id);

  // ❌ NG: ビジネスロジック（Entityに書くべき）
  if (params.email !== userEntity.email) {
    // メールアドレスの重複チェック
    const existingUser = await this.userDao.findOne({ email: params.email });
    if (existingUser) {
      throw new ConflictError('メールアドレスが既に使用されています');
    }
  }

  // ❌ NG: 直接プロパティを変更（Entityの振る舞いメソッドを使うべき）
  userEntity.email = params.email;
  userEntity.role = params.role;

  await this.userRepository.update(userEntity);
}
```

#### ✅ Application層の書き方（Query側）

**責務**: DAOの呼び出しとデータの加工。エラーハンドリング。

**なぜこの書き方か**:

- Query側は「読み取り専用」。パフォーマンスを最適化するため、Prismaを直接使用
- データの加工（ID文字列の変換等）はApplication層で行う
- エラーハンドリング（NotFoundError等）はApplication層で行う

```typescript
// query/application/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserDao } from '../../dao/user/user.dao';
import { UserResponseDto } from '../../dto/user/user-response.dto';
import { UserListResponseDto } from '../../dto/user/user-list-response.dto';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { splitIds } from '../../../common/utils/string.utils';
import type { UserRole, Gender } from '../../types/user.types';

@Injectable()
export class UserService {
  constructor(private readonly userDao: UserDao) {}

  async findOne({ id }: { id: string }): Promise<UserResponseDto> {
    // ✅ OK: DAOの呼び出し
    const user = await this.userDao.findOne({ id });

    // ✅ OK: エラーハンドリング（Application層の責務）
    if (!user) {
      throw new NotFoundError('ユーザー', id);
    }

    return user;
  }

  async findMany({
    page = 1,
    pageSize = 10,
    id,
    search,
    role,
    gender,
    departmentId,
  }: FindManyParams): Promise<UserListResponseDto> {
    // ✅ OK: データの加工（Application層の責務）
    // ID文字列を配列に変換（カンマ/スペース区切り対応）
    const ids = id ? splitIds(id) : undefined;

    // ✅ OK: DAOの呼び出し
    const { users, total } = await this.userDao.findMany({
      page,
      pageSize,
      ids,
      search,
      role,
      gender,
      departmentId,
    });

    // ✅ OK: レスポンスの構築（Application層の責務）
    return new UserListResponseDto({
      users,
      total,
      page,
      pageSize,
    });
  }
}
```

**❌ Application層でやってはいけないこと**:

```typescript
// ❌ NG: データベースクエリを直接記述（DAOに書くべき）
async findMany(params: FindManyParams) {
  // ❌ NG: Prismaを直接使用
  const users = await this.prisma.user.findMany({
    where: { role: params.role },
  });

  // ❌ NG: データの加工をアプリケーション側で行う（DB側で完結させるべき）
  const filteredUsers = users.filter((user) => user.email.includes('@'));

  return filteredUsers;
}
```

#### ✅ Repository層の書き方（Command側）

**責務**: データの永続化。EntityとPrisma型の変換。

**なぜこの書き方か**:

- Repositoryは「データの永続化」のみを担当
- Mapperを使用することで、EntityとPrisma型を完全に分離
- Entityを返すことで、上位層がPrismaに依存しない

```typescript
// command/infra/user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import { UserEntity } from '../../domain/user/user.entity';
import { UserMapper } from '../../domain/user/user.mapper';
import { CustomLoggerService } from '../../../config/custom-logger.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotFoundError } from '../../../common/errors/not-found.error';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      // ✅ OK: Mapperを使用してEntityからPrisma型に変換
      const data = await this.prisma.user.create({
        data: UserMapper.toPersistence(user),
      });

      // ✅ OK: Mapperを使用してPrisma型からEntityに変換
      return UserMapper.toDomain(data);
    } catch (error) {
      // ✅ OK: エラーハンドリングとログ出力（Repository層の責務）
      this.logger.error(error, undefined, 'UserRepository');
      throw error;
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    try {
      if (!user.id) {
        throw new Error(getEntityIdRequired('User'));
      }

      // ✅ OK: Mapperを使用してEntityからPrisma型に変換
      const data = await this.prisma.user.update({
        where: { id: user.id },
        data: UserMapper.toUpdatePersistence(user),
      });

      // ✅ OK: Mapperを使用してPrisma型からEntityに変換
      return UserMapper.toDomain(data);
    } catch (error) {
      this.logger.error(error, undefined, 'UserRepository');

      // ✅ OK: Prismaのエラーコードをカスタムエラーに変換
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('ユーザー', user.id!);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      // ✅ OK: Prismaを使ったデータベースアクセス
      const userData = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userData) {
        return null;
      }

      // ✅ OK: Mapperを使用してPrisma型からEntityに変換
      return UserMapper.toDomain(userData);
    } catch (error) {
      this.logger.error(error, undefined, 'UserRepository');
      throw error;
    }
  }
}
```

**❌ Repositoryでやってはいけないこと**:

```typescript
// ❌ NG: ビジネスロジックをRepositoryに書く
async create(user: UserEntity) {
  // ❌ NG: バリデーション（Entityに書くべき）
  if (!user.email.includes('@')) {
    throw new Error('メールアドレスの形式が正しくありません');
  }

  // ❌ NG: データの加工（Application層に書くべき）
  const userData = {
    ...user,
    email: user.email.toLowerCase(),
  };

  return this.prisma.user.create({ data: userData });
}

// ❌ NG: Prisma型を直接返す（Entityを返すべき）
async findById(id: string): Promise<User | null> {
  return this.prisma.user.findUnique({ where: { id } });
}
```

#### ✅ DAO層の書き方（Query側）

**責務**: データベースクエリの構築とDTOへの変換。データの加工（フィルタリング、ソート、ページネーション）はDB側で完結させる。

**なぜこの書き方か**:

- Query側は「読み取り専用」。パフォーマンスを最適化するため、Prismaを直接使用
- 複雑なクエリはDAO層に集約することで、保守性が向上
- データの加工（フィルタリング、ソート、ページネーション）はDB側で完結させることで、パフォーマンスを最適化
- DTO変換をDAO層で行うことで、Application層をシンプルに保つ

```typescript
// query/dao/user/user.dao.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import type { UserRole, Gender } from '../../types/user.types';
import { UserResponseDto } from '../../dto/user/user-response.dto';

@Injectable()
export class UserDao {
  constructor(private readonly prisma: PrismaService) {}

  async findOne({ id }: { id: string }): Promise<UserResponseDto | null> {
    // ✅ OK: Prismaを使ったデータベースアクセス
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        interviewer: {
          select: { category: true },
        },
        department: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    // ✅ OK: DTOのfromQueryメソッドを使用して変換
    return UserResponseDto.fromQuery(user);
  }

  async findMany({
    page = 1,
    pageSize = 10,
    ids,
    search,
    role,
    gender,
    departmentId,
  }: FindManyParams): Promise<{
    users: UserResponseDto[];
    total: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {};

    // ✅ OK: データの加工（フィルタリング）はDB側で完結
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (gender) where.gender = gender;
    if (departmentId) where.departmentId = departmentId;

    // ✅ OK: データの加工（集計）はDB側で完結
    const [usersData, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          interviewer: { select: { category: true } },
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // ✅ OK: DTOのfromQueryメソッドを使用して変換
    const users = usersData.map((user) => UserResponseDto.fromQuery(user));

    return { users, total };
  }
}
```

**❌ DAOでやってはいけないこと**:

```typescript
// ❌ NG: データの加工をアプリケーション側で行う（DB側で完結させるべき）
async findMany(params: FindManyParams) {
  // ❌ NG: 全件取得してからフィルタリング
  const allUsers = await this.prisma.user.findMany();
  const filteredUsers = allUsers.filter((user) => user.role === params.role);

  // ❌ NG: アプリケーション側で集計
  const total = filteredUsers.length;

  // ❌ NG: アプリケーション側でページネーション
  const pagedUsers = filteredUsers.slice(
    (params.page - 1) * params.pageSize,
    params.page * params.pageSize,
  );

  return { users: pagedUsers, total };
}
```

### 4.2 バリデーションの書き方

#### ✅ DTOの定義（Zodスキーマ）

```typescript
// command/dto/user/user.dto.ts
import { z } from 'zod';

export const createUserRequestSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  role: z.enum(['user', 'admin', 'master'], {
    errorMap: () => ({ message: '権限は必須です' }),
  }),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  departmentId: z.string().min(1, '部署IDは必須です'),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
```

#### ✅ Controllerでのバリデーション

```typescript
// command/controller/user/user.controller.ts
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';

@Post()
async create(
  @Body(new ZodValidationPipe(createUserRequestSchema))
  dto: CreateUserRequestDto,
): Promise<UserResponseDto> {
  // dtoは既にバリデーション済み
  return this.userService.create(dto);
}
```

#### ✅ エラーレスポンス

バリデーションエラーは自動的に以下の形式で返されます：

```json
{
  "statusCode": 400,
  "message": "バリデーションエラー",
  "details": [
    {
      "path": ["email"],
      "message": "メールアドレスの形式が正しくありません"
    }
  ]
}
```

### 4.3 エラーハンドリングの書き方

#### ✅ カスタムエラーの定義

```typescript
// common/errors/not-found.error.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { getResourceNotFound } from '../constants/not-found-error';

export class NotFoundError extends HttpException {
  constructor(resourceName: string, id: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: getResourceNotFound(resourceName, id),
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
```

#### ✅ Repositoryでのエラーハンドリング

```typescript
// command/infra/user/user.repository.ts
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLoggerService } from '../../../config/custom-logger.service';
import { NotFoundError } from '../../../common/errors/not-found.error';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async update(user: UserEntity): Promise<UserEntity> {
    try {
      const data = await this.prisma.user.update({
        where: { id: user.id },
        data: UserMapper.toUpdatePersistence(user),
      });
      return UserMapper.toDomain(data);
    } catch (error) {
      this.logger.error(error, undefined, 'UserRepository');

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('ユーザー', user.id!);
      }
      throw error;
    }
  }
}
```

#### ✅ グローバル例外フィルター

```typescript
// common/filters/global-exception.filter.ts
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { CustomLoggerService } from '../../config/custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status >= 500) {
        this.logger.error(exception, undefined, 'GlobalExceptionFilter');
      } else if (status >= 400) {
        this.logger.warn(
          JSON.stringify(exceptionResponse),
          'GlobalExceptionFilter',
        );
      }

      return response.status(status).json(exceptionResponse);
    }

    // 予期しないエラー
    this.logger.error(exception, undefined, 'GlobalExceptionFilter');
    return response.status(500).json({
      statusCode: 500,
      message: '予期せぬエラーが発生しました',
      error: 'Internal Server Error',
    });
  }
}
```

### 4.4 Value Object（値オブジェクト）の書き方

**思想**: VOは積極的に使うべき。特に「バリデーション」や「ルール」がある値は必ずVOにする。VOの中にロジックを持たせることで、エンティティを軽くし、コードの散在を防ぐ。

**実装例**:

```typescript
// command/domain/value-objects/user-name.vo.ts
import { DomainError } from '../../../common/errors/domain.error';
import { REQUIRED_FIELD } from '../../../common/constants';

/**
 * 姓と名をセットで扱うValue Object
 */
export class UserName {
  private constructor(
    private readonly firstName: string,
    private readonly lastName: string,
  ) {
    if (!firstName || !lastName) {
      throw new DomainError(REQUIRED_FIELD('姓名'));
    }
  }

  /**
   * ファクトリメソッド
   */
  static create(props: { firstName: string; lastName: string }): UserName {
    return new UserName(props.firstName, props.lastName);
  }

  /**
   * 必須のファクトリメソッド
   */
  static createRequired(props: {
    firstName: string;
    lastName: string;
  }): UserName {
    return new UserName(props.firstName, props.lastName);
  }

  get firstNameValue(): string {
    return this.firstName;
  }

  get lastNameValue(): string {
    return this.lastName;
  }

  // ✅ ロジックはVOに持たせる（計算プロパティ）
  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }

  // ✅ 「表示用」のロジックを持たせてもいい
  get formalName(): string {
    return `${this.lastName} ${this.firstName} 様`;
  }

  // ✅ イニシャルを返すロジックとかもここ
  get initials(): string {
    return `${this.lastName[0]}.${this.firstName[0]}`;
  }

  /**
   * 値による等価性の比較
   */
  equals(other: UserName | null): boolean {
    if (other === null) return false;
    return (
      this.firstName === other.firstName && this.lastName === other.lastName
    );
  }

  toString(): string {
    return this.fullName;
  }
}
```

**エンティティで使う**:

```typescript
// command/domain/user/user.entity.ts
import { UserName } from '../value-objects/user-name.vo';

export class UserEntity {
  // エンティティはプリミティブを持たず、VOを持つ
  private _userName: UserName;

  private constructor(props: UserProps) {
    this._userName = UserName.createRequired({
      firstName: props.firstName,
      lastName: props.lastName,
    });
    // ...
  }

  // エンティティはVOのメソッドを呼ぶだけ（委譲）
  get name(): string {
    return this._userName.fullName;
  }

  get formalName(): string {
    return this._userName.formalName;
  }

  get initials(): string {
    return this._userName.initials;
  }
}
```

**なぜこの書き方か**:

- **高凝集**: データ（姓・名）とそのデータを使ったロジック（フルネームを返す）が近くにある
- **コードの散在を防ぐ**: ロジックをエンティティやサービスに書くと、同じロジックが複数箇所に散らばる
- **エンティティを軽くする**: VOに細かいルールやロジックを任せることで、エンティティは重要なビジネスフローに集中できる
- **テスト容易性**: VOのロジックは独立してテストできる

### 4.5 EntityとMapperの書き方

#### ✅ Entityの定義

```typescript
// command/domain/user/user.entity.ts
export class UserEntity {
  private constructor(private props: UserProps) {}

  // ファクトリメソッド（static create）
  static create(
    props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): UserEntity {
    return new UserEntity({
      ...props,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });
  }

  // 振る舞いメソッド
  changeEmail({
    email,
    updatedBy,
  }: {
    email: string;
    updatedBy: string;
  }): void {
    if (this.props.email === email) {
      return; // 変更がない場合は何もしない
    }
    this.props.email = email;
    this.props.updatedBy = updatedBy;
  }

  changeRole({ role, updatedBy }: { role: UserRole; updatedBy: string }): void {
    if (this.props.role === role) {
      return;
    }
    this.props.role = role;
    this.props.updatedBy = updatedBy;
  }

  // getter
  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }
}
```

#### ✅ Mapperの定義

```typescript
// command/domain/user/user.mapper.ts
import { User } from '@prisma/client';
import { UserEntity } from './user.entity';

export class UserMapper {
  // Prisma型からEntityに変換
  static toDomain(data: User): UserEntity {
    return new UserEntity({
      id: data.id,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      departmentId: data.departmentId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  // EntityからPrismaの保存用データ形式に変換（id、createdAt、updatedAtは含めない）
  static toPersistence(entity: UserEntity): {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    departmentId: string;
    createdBy: string;
    updatedBy: string;
  } {
    return {
      email: entity.email,
      role: entity.role,
      firstName: entity.firstName,
      lastName: entity.lastName,
      gender: entity.gender,
      departmentId: entity.departmentId,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }

  // EntityからPrismaの更新用データ形式に変換（id、createdAtは含めない、updatedAtは自動管理）
  static toUpdatePersistence(entity: UserEntity): {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    departmentId: string;
    updatedBy: string;
  } {
    return {
      email: entity.email,
      role: entity.role,
      firstName: entity.firstName,
      lastName: entity.lastName,
      gender: entity.gender,
      departmentId: entity.departmentId,
      updatedBy: entity.updatedBy,
    };
  }
}
```

### 4.5 DTOの書き方

#### ✅ Command側のDTO（リクエスト）

```typescript
// command/dto/user/user.dto.ts
import { z } from 'zod';

export const createUserRequestSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  role: z.enum(['user', 'admin', 'master']),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  departmentId: z.string().min(1, '部署IDは必須です'),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
```

#### ✅ Query側のDTO（レスポンス）

```typescript
// query/dto/user/user-response.dto.ts
import { User } from '@prisma/client';
import { UserEntity } from '../../../command/domain/user/user.entity';

export class UserResponseDto {
  constructor({
    id,
    email,
    role,
    firstName,
    lastName,
    gender,
    departmentId,
    createdAt,
    updatedAt,
    isInterviewer,
    departmentName,
  }: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    departmentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    isInterviewer: boolean;
    departmentName: string | null;
  }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.departmentId = departmentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isInterviewer = isInterviewer;
    this.departmentName = departmentName;
  }

  // Command側のEntityからDTOを作成
  static fromEntity(user: UserEntity): UserResponseDto {
    user.ensureId();
    return new UserResponseDto({
      id: user.id!,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      departmentId: user.departmentId,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
      isInterviewer: false,
      departmentName: null,
    });
  }

  // Query側のDAOから取得したデータからDTOを作成
  static fromQuery(
    user: User & {
      interviewer: { category: string } | null;
      department: { id: string; name: string } | null;
    },
  ): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isInterviewer: user.interviewer !== null,
      departmentName: user.department?.name ?? null,
    });
  }
}
```

### 4.6 モジュールの書き方

#### ✅ Query側モジュール

```typescript
// modules/user/user-query.module.ts
import { Module } from '@nestjs/common';
import { UserController } from '../../query/controller/user/user.controller';
import { UserService } from '../../query/application/user/user.service';
import { UserDao } from '../../query/dao/user/user.dao';

@Module({
  controllers: [UserController],
  providers: [UserService, UserDao],
  exports: [UserDao], // Command側で使用するためにexport
})
export class UserQueryModule {}
```

#### ✅ Command側モジュール

```typescript
// modules/user/user-command.module.ts
import { Module } from '@nestjs/common';
import { UserQueryModule } from './user-query.module';
import { UserController } from '../../command/controller/user/user.controller';
import { UserService } from '../../command/application/user/user.service';
import { UserRepository } from '../../command/infra/user/user.repository';
import { INJECTION_TOKENS } from '../../command/constants/injection-tokens';

@Module({
  imports: [UserQueryModule], // Query側のDAOを使用するためにimport
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: INJECTION_TOKENS.IUserRepository,
      useClass: UserRepository,
    },
    UserRepository,
  ],
})
export class UserCommandModule {}
```

#### ✅ 統合モジュール

```typescript
// modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserQueryModule } from './user-query.module';
import { UserCommandModule } from './user-command.module';

@Module({
  imports: [UserQueryModule, UserCommandModule],
})
export class UserModule {}
```

### 4.7 ロギングの書き方

#### ✅ ログの出力方法

```typescript
import { CustomLoggerService } from '../config/custom-logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async create(params: CreateParams): Promise<UserResponseDto> {
    try {
      // 処理
      this.logger.log('ユーザーを作成しました', 'UserService');
    } catch (error) {
      this.logger.error(error, undefined, 'UserService');
      throw error;
    }
  }
}
```

#### ✅ ログの形式

すべてのログは以下のJSON形式で出力されます：

```json
{
  "traceId": "01KAYWZQY4BDMP31RCX6GRWV7D",
  "timestamp": "2025-11-26T01:38:28.422Z",
  "level": "LOG",
  "context": "UserService",
  "message": "ユーザーを作成しました"
}
```

### 4.8 データベースクエリの書き方

#### ✅ データ加工はDB側で完結させる

```typescript
// ✅ OK: データベースでフィルタリング
const users = await this.prisma.user.findMany({
  where: {
    role: 'admin',
    createdAt: { gte: new Date('2024-01-01') },
  },
});

// ❌ NG: アプリケーションでフィルタリング
const allUsers = await this.prisma.user.findMany();
const adminUsers = allUsers.filter((user) => user.role === 'admin');
```

#### ✅ 集計はDB側で完結させる

```typescript
// ✅ OK: データベースで集計
const total = await this.prisma.user.count({
  where: { role: 'admin' },
});

// ❌ NG: アプリケーションで集計
const users = await this.prisma.user.findMany();
const total = users.length;
```

### 4.9 日付操作の書き方

#### ✅ 必ずDateUtilを使用する

```typescript
import {
  getCurrentDate,
  formatDateToISOString,
} from '../common/utils/date.utils';

// ✅ OK: DateUtilを使用
const now = getCurrentDate();
const isoString = formatDateToISOString();

// ❌ NG: 直接Dateを使用
const now = new Date();
const isoString = new Date().toISOString();
```

### 4.10 エラーメッセージの書き方

#### ✅ 必ず定数から取得する

```typescript
import { REQUIRED_FIELD, getEntityIdRequired } from '../common/constants';

// ✅ OK: 定数から取得
throw new Error(REQUIRED_FIELD('email'));
throw new Error(getEntityIdRequired('User'));

// ❌ NG: 文字列リテラル
throw new Error('emailは必須です');
throw new Error('UserのIDは必須です');
```

---

### Controller 実装時

- [ ] `@Controller` デコレータを付けているか
- [ ] `ZodValidationPipe` で入力バリデーションしているか
- [ ] HTTP メソッドと URL がユースケースに合っているか

### Service 実装時

- [ ] `@Injectable` デコレータを付けているか
- [ ] 依存は `PrismaService` と共通サービス（ロガー等）に絞れているか
- [ ] 重いロジックが Controller に漏れていないか

---

## 6. まとめ

- バックエンドは **シンプルな Nest 標準構成**（機能ごとの module / controller / service）に寄せています。
- DDD / CQRS は使わず、`users` / `search-conditions` の 2 機能にフォーカスした最小構成です。
- 追加機能を作る場合も、`src/{feature}/{feature}.controller.ts` / `.service.ts` / `.module.ts` という形で増やしていけば OK です。

