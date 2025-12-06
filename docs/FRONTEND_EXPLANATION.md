# フロントエンド実装説明書

## 1. 設計思想

このフロントエンドアプリケーションは、以下の設計思想に基づいて構築されています。

### 1.1 機能の独立性（Feature-based Architecture）

**思想**: 機能ごとにコードを完全に分離し、各機能が独立して動作するように設計する。

- 各機能は`features/{feature-name}/`配下に配置され、`components/`、`hooks/`、`constants/`、`types/`を含む
- 機能間の依存関係を最小限に抑え、変更の影響範囲を明確にする
- チーム開発時にコンフリクトが発生しにくく、機能の追加・削除が容易

**実装例**:

```
features/user-management/
├── components/          # この機能専用のコンポーネント
├── hooks/               # この機能専用のロジック
├── constants/           # この機能専用の定数
└── types/               # この機能専用の型（Colocation）
```

### 1.2 URL駆動の状態管理（URL-Driven State Management）

**思想**: 検索条件やページネーションなどの状態は、URLパラメータで管理する。これにより、状態の一貫性を保ち、デバッグを容易にする。

- **状態はURLに反映される**: 検索条件、ページ番号などはすべてURLパラメータで管理
- **URLを変更することで状態を更新**: `useState`で状態を管理せず、`router.push`でURLを更新
- **Effectの連鎖を避ける**: URLパラメータの変更を検知してデータ取得を行う一方向のデータフロー

**なぜこの思想か**:

- ブラウザの戻る/進むボタンで状態が復元される
- URLを共有すると検索条件も共有される
- デバッグ時にURLを見るだけで状態が分かる
- サーバーサイドレンダリング（SSR）と相性が良い

### 1.3 ロジックと表示の分離（Separation of Concerns）

**思想**: コンポーネントは表示ロジックのみを担当し、ビジネスロジックやデータ取得処理はカスタムフックに集約する。

- **コンポーネント**: 表示のみ（JSXの記述）
- **カスタムフック**: ビジネスロジック、データ取得、状態管理
- **共通コンポーネント**: UIの見た目のみ（ロジックを含まない）

**なぜこの思想か**:

- コンポーネントがシンプルになり、可読性が向上
- ロジックの再利用が容易
- テストが書きやすい（ロジックと表示を分けてテスト可能）

### 1.4 必要以上に共通化しない（YAGNI原則）

**思想**: 全画面共通のUIや、同一画面内で同一のUIのみを共通化する。特定画面のUIや機能が異なるUIは共通化しない。

- **共通化する**: Button、Input、Table、Dialogなど、見た目と動作が完全に同一のUI
- **共通化しない**: 特定機能専用のUI、見た目は似ているが動作が異なるUI

**なぜこの思想か**:

- 過度な共通化は、後から機能を追加する際に制約となる
- 機能ごとに独立して進化できる
- コードの可読性が向上（「この機能はこのファイルを見れば分かる」）

---

## 2. 技術スタック

- **Next.js 16.0.0** (App Router): ルーティング、SSR/SSG
- **React 19.2.0**: UIライブラリ
- **TypeScript 5**: 型安全性
- **Tailwind CSS 4**: スタイリング
- **React Hook Form 7.66.1**: フォーム管理
- **react-hot-toast 2.6.0**: トースト通知

---

## 3. ディレクトリ構成と配置ルール

```
src/
├── app/                    # ルーティング関連のみ（URL構造）
│   ├── {role}/            # 権限別のページ（例: master/）
│   │   ├── layout.tsx     # 権限チェックを行うlayout
│   │   └── {page}/        # 権限が必要なページ
│   │       └── page.tsx   # Next.jsのページコンポーネント
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ
│   ├── error.tsx          # グローバルエラーバウンダリー
│   └── not-found.tsx      # 404エラーページ
│
├── components/            # 共通コンポーネント
│   ├── layout/            # レイアウトコンポーネント（Header, Footer, Breadcrumb）
│   ├── ui/                # UIコンポーネント（Button, Input, Select, Table, Dialog等）
│   ├── form/              # フォームコンポーネント（TextField, SelectField等）
│   └── features/          # 機能共通コンポーネント（検索条件保存、一括操作等）
│
├── features/               # 機能ごとのドメインロジック
│   └── {feature-name}/
│       ├── components/     # 機能固有のコンポーネント
│       ├── hooks/         # 機能固有のカスタムフック
│       ├── constants/     # 機能固有の定数
│       └── types/          # 機能固有の型定義（Colocation）
│
├── contexts/              # React Context（RecruitYearContext, UserContext, BreadcrumbContext）
├── hooks/                 # グローバルフック（useAuth, useSearchCondition）
├── libs/                  # ライブラリ設定（api-client.ts）
└── types/                 # アプリケーション全体で共有する型定義
```

### 配置ルール

- **`app/`**: ルーティングのみ。ビジネスロジックは書かない
- **`components/`**: 全画面で使用される共通コンポーネントのみ
- **`features/`**: 機能ごとに完全に分離。機能固有のコンポーネント、フック、型はここに配置
- **`types/`**: アプリケーション全体で共有する型のみ（User, RecruitYear等）

---

## 4. コーディング時の具体的な指針

### 4.1 コンポーネントの書き方

#### ✅ 必ず守ること

1. **Named Exportを使用する**（`export default`は禁止）

```tsx
// ✅ OK
export const UserManagement = () => {
  return <div>...</div>;
};

// ❌ NG
export default UserManagement;
```

2. **アロー関数を使用する**

```tsx
// ✅ OK
const handleClick = () => {
  // ...
};

// ❌ NG
function handleClick() {
  // ...
}
```

3. **1ファイル1コンポーネント**

```tsx
// ✅ OK: UserManagement.tsx
export const UserManagement = () => { ... };

// ❌ NG: UserManagement.tsx
const UserSearchForm = () => { ... };
export const UserManagement = () => { ... };
```

4. **インポートは`@/`エイリアスを使用**

```tsx
// ✅ OK
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// ❌ NG
import { Button } from '../../../components/ui';
```

### 4.2 API送信の書き方

#### ✅ 必ず`apiClient`を使う

```tsx
import { apiClient } from '@/libs/api-client';
import type { UserResponseDto } from '@/types/user';

// GETリクエスト
const fetchUsers = async () => {
  const users = await apiClient<UserResponseDto[]>('/users');
  return users;
};

// POSTリクエスト
const createUser = async (data: CreateUserRequestDto) => {
  const user = await apiClient<UserResponseDto>('/users', {
    method: 'POST',
    body: data,
  });
  return user;
};

// PUTリクエスト
const updateUser = async (id: string, data: UpdateUserRequestDto) => {
  const user = await apiClient<UserResponseDto>(`/users/${id}`, {
    method: 'PUT',
    body: data,
  });
  return user;
};

// DELETEリクエスト
const deleteUser = async (id: string) => {
  await apiClient(`/users/${id}`, {
    method: 'DELETE',
  });
};
```

#### ✅ エラーハンドリング

```tsx
import { ApiClientError } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import { toast } from 'react-hot-toast';

try {
  await apiClient('/users', { method: 'POST', body: data });
  toast.success('作成しました');
} catch (err) {
  if (err instanceof ApiClientError && err.details) {
    // サーバーサイドのバリデーションエラー（フィールド固有）
    err.details.forEach((detail) => {
      setError(detail.path[0] as keyof FormData, {
        type: 'server',
        message: detail.message,
      });
    });
  } else if (err instanceof ApiClientError) {
    // 一般的なAPIエラー
    toast.error(err.message);
  } else {
    const message = extractErrorMessage(err, '処理に失敗しました');
    toast.error(message);
  }
}
```

### 4.3 フォーム管理の書き方

#### ✅ 必ずこのパターンを使う

```tsx
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { apiClient } from '@/libs/api-client';
import { toast } from 'react-hot-toast';
import { handleFormError } from '@/libs/error-handler';

type FormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
};

export const CreateUserForm = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      role: 'user',
      firstName: '',
      lastName: '',
    },
    mode: 'onSubmit', // 送信時にバリデーション
    reValidateMode: 'onChange', // 再バリデーションは変更時
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await apiClient('/users', { method: 'POST', body: data });
      toast.success('作成しました');
      methods.reset();
    } catch (err) {
      handleFormError(err, methods.setError, setError, '作成に失敗しました');
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          name="email"
          label="メールアドレス"
          rules={{ required: 'メールアドレスは必須です' }}
        />
        <SelectField
          name="role"
          label="権限"
          options={roleOptions}
          rules={{ required: '権限は必須です' }}
        />
        <TextField
          name="firstName"
          label="名"
          rules={{ required: '名は必須です' }}
        />
        <TextField
          name="lastName"
          label="姓"
          rules={{ required: '姓は必須です' }}
        />
        <Button type="submit">送信</Button>
      </form>
    </FormProvider>
  );
};
```

#### ✅ 編集フォームの場合（データ取得が必要）

```tsx
// features/user-management/hooks/useUserForm.ts
export const useUserForm = ({ userId }: { userId: string | undefined }) => {
  const isEdit = userId && userId !== 'new';
  const [isLoading, setIsLoading] = useState(isEdit);
  const [user, setUser] = useState<UserResponseDto | null>(null);

  const fetchUser = useCallback(async () => {
    if (!isEdit || !userId) return;

    try {
      setIsLoading(true);
      const data = await apiClient<UserResponseDto>(`/users/${userId}`);
      setUser(data);
    } catch (err) {
      const message = extractErrorMessage(
        err,
        'ユーザー情報の取得に失敗しました',
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isEdit]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const defaultValues: FormData = useMemo(
    () =>
      user
        ? {
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        : {
            email: '',
            role: 'user',
            firstName: '',
            lastName: '',
          },
    [user],
  );

  return { isLoading, defaultValues, handleSubmit };
};

// features/user-management/components/CreateUserForm.tsx
export const CreateUserForm = ({ userId }: { userId?: string }) => {
  const { isLoading, defaultValues, handleSubmit } = useUserForm({ userId });

  const methods = useForm<FormData>({
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
        {/* フィールド */}
      </form>
    </FormProvider>
  );
};
```

#### ✅ 使用するコンポーネント

- **`TextField`**: テキスト入力フィールド（`components/form/TextField.tsx`）
- **`SelectField`**: セレクトボックス（`components/form/SelectField.tsx`）
- **`TextareaField`**: テキストエリア（`components/form/TextareaField.tsx`）
- **`FormField`**: カスタムフィールドが必要な場合（`components/form/FormField.tsx`）

#### ❌ 使ってはいけないこと

- `Input`コンポーネントを直接使う（`TextField`を使う）
- `Select`コンポーネントを直接使う（`SelectField`を使う）

### 4.4 データ取得の書き方

#### ✅ SWRを使ったデータ取得（推奨）

**特徴**: SWR（stale-while-revalidate）を使用してデータ取得を行います。キャッシュ管理、リトライ、競合状態のハンドリングを自動で行ってくれます。

```tsx
// features/user-management/hooks/useUserList.ts
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

const fetcher = async (url: string) => {
  return apiClient<UserResponseDto[]>(url);
};

export const useUserList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから直接値を取得
  const getSearchParams = useCallback(() => {
    return {
      id: searchParams.get('id') || '',
      search: searchParams.get('search') || '',
      page: Number(searchParams.get('page')) || 1,
    };
  }, [searchParams]);

  // SWRでデータ取得（URLパラメータをキーとして使用）
  const params = getSearchParams();
  const searchKey = `/users?${new URLSearchParams(params).toString()}`;
  const {
    data: users,
    error,
    isLoading,
    mutate,
  } = useSWR(searchKey, fetcher, {
    revalidateOnFocus: false, // フォーカス時の再検証を無効化
    revalidateOnReconnect: true, // 再接続時の再検証を有効化
  });

  const handleSearch = (data: SearchFormData) => {
    // URLのみを変更（状態は直接更新しない）
    router.push(`/users?search=${data.search}`);
  };

  const handleReset = () => {
    // URLのみを変更（状態は直接更新しない）
    router.push('/users');
  };

  return {
    users: users || [],
    isLoading,
    error,
    handleSearch,
    handleReset,
    mutate, // 手動で再検証する場合に使用
  };
};
```

**メリット**:

- キャッシュ管理が自動（同じキーで複数回呼び出しても、1回だけリクエスト）
- 競合状態の管理が不要（古いリクエストは自動で無視される）
- リトライ機能が組み込まれている
- ローディング状態とエラー状態が自動で管理される
- リアルタイムな更新が容易（`mutate`を使用）

**デメリット**:

- 初期表示時にローディング画面が一瞬表示される
- ライブラリの追加が必要

#### Server Componentsを使わない理由

Next.js App Routerでは、**Server Components**を使うことで、サーバー側でデータ取得を行い、完成品のHTMLをブラウザに返すことができます。

**Server Componentsのメリット**:

- 初期表示が速い（ローディング画面が不要）
- URL駆動と相性が良い（`searchParams`を直接受け取れる）
- 競合状態の管理が不要（サーバー側で処理される）
- SEOに強い
- `useEffect`、`useState`、`isLoading`の管理が不要

**それでも使わない理由**:

1. **SEOが不要**: 管理画面のため、SEOのメリットは不要です。

2. **BFFとしての意味がない**: このプロジェクトでは、別途NestJSのバックエンドAPIが存在します。Server Componentsを使うと、Next.jsのサーバー側でバックエンドAPIを呼び出すだけの「意味のないBFF（Backend For Frontend）」になってしまいます。これは以下の問題を引き起こします：
   - レイテンシの増加（Next.jsサーバー → バックエンドAPI → Next.jsサーバー → ブラウザ）
   - サーバーリソースの無駄（Next.jsサーバーが単なるプロキシとして機能する）
   - 複雑性の増加（サーバー側とクライアント側の両方でAPI呼び出しロジックを管理する必要がある）

3. **SWRの方が適している**: クライアントサイドで直接バックエンドAPIを呼び出すことで、以下のメリットがあります：
   - レイテンシの削減（ブラウザ → バックエンドAPI）
   - キャッシュ管理が自動（SWRが提供）
   - 競合状態の管理が自動（SWRが提供）
   - リアルタイムな更新が容易（`mutate`を使用）

**結論**: このプロジェクトでは、SWRを使ったクライアントサイドでのデータ取得を採用しています。Server Componentsは、バックエンドAPIがNext.js内にある場合や、SEOが重要な場合に有効ですが、このプロジェクトの要件には適していません。

#### ❌ 使ってはいけないこと

```tsx
// ❌ NG: useStateで状態管理
const [searchParams, setSearchParams] = useState({ id: '', search: '' });

// ❌ NG: 直接APIを叩く（URLを更新しない）
const handleSearch = async (data: FormData) => {
  const users = await apiClient(`/users?search=${data.search}`);
  setUsers(users);
};

// ❌ NG: useEffectで直接データ取得（SWRを使うべき）
useEffect(() => {
  const fetchUsers = async () => {
    const users = await apiClient('/users');
    setUsers(users);
  };
  fetchUsers();
}, []);
```

### 4.5 テーブルの書き方

#### ✅ 必ず`Table`コンポーネントを使う

```tsx
import { Table } from '@/components/ui';

<Table
  columns={[
    { key: 'name', label: '名前' },
    { key: 'email', label: 'メール' },
    {
      key: 'status',
      label: 'ステータス',
      render: (value) => <span className="text-green-600">{value}</span>,
    },
  ]}
  data={users}
  emptyMessage="データがありません"
/>;
```

#### ❌ 使ってはいけないこと

- ネイティブの`<table>`タグを直接使う（`Table`コンポーネントを使う）

### 4.6 ダイアログの書き方

#### ✅ 必ず`Dialog`コンポーネントを使う

```tsx
import { Dialog, Button } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>キャンセル</Button>
      <Button onClick={handleConfirm}>確定</Button>
    </>
  }
>
  <p>本当に削除しますか？</p>
</Dialog>;
```

#### ❌ 使ってはいけないこと

- 独自のモーダル実装（`Dialog`コンポーネントを使う）

### 4.7 ローディング表示の書き方

#### ✅ 必ず`Loading`コンポーネントを使う

```tsx
import { Loading } from '@/components/ui';

if (!data) {
  return <Loading />;
}
```

### 4.8 エラーハンドリングの書き方

#### ✅ 必ずこのパターンを使う

```tsx
import { ApiClientError } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import { toast } from 'react-hot-toast';

const handleSubmit = async (
  data: FormData,
  setError: UseFormSetError<FormData>,
) => {
  try {
    await apiClient('/users', { method: 'POST', body: data });
    toast.success('作成しました');
  } catch (err) {
    if (err instanceof ApiClientError && err.details) {
      // サーバーサイドのバリデーションエラー（フィールド固有）
      err.details.forEach((detail) => {
        setError(detail.path[0] as keyof FormData, {
          type: 'server',
          message: detail.message,
        });
      });
    } else if (err instanceof ApiClientError) {
      // 一般的なAPIエラー
      toast.error(err.message);
    } else {
      toast.error('処理に失敗しました');
    }
  }
};
```

### 4.9 型定義の書き方

#### ✅ 必ず`type`文を使用

```tsx
// ✅ OK
type User = {
  id: string;
  name: string;
};

// ❌ NG
interface User {
  id: string;
  name: string;
}
```

#### ✅ 型定義の配置場所

- **機能固有の型**: `features/{feature-name}/types/` または `features/{feature-name}/schema.ts`
- **共有型**: `types/`

```tsx
// ✅ OK: features/user-management/types/user-form.ts
export type UserSearchFormData = {
  id: string;
  search: string;
};

// ✅ OK: types/user.ts
export type UserResponseDto = {
  id: string;
  email: string;
};
```

### 4.10 条件分岐の書き方

#### ✅ マッピングやオブジェクトを使用

```tsx
// ✅ OK: マッピングを使用
const statusColorMap: Record<string, string> = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
};
const color = statusColorMap[status] || 'gray';

// ❌ NG: if文で分岐
let color: string;
if (status === 'success') {
  color = 'green';
} else if (status === 'error') {
  color = 'red';
} else {
  color = 'gray';
}

// ❌ NG: switch文
switch (status) {
  case 'success':
    color = 'green';
    break;
  case 'error':
    color = 'red';
    break;
  default:
    color = 'gray';
}
```

### 4.11 ロジックの配置

#### ✅ 必ずカスタムフックに切り出す

```tsx
// ✅ OK: features/user-management/hooks/useUserList.ts
export const useUserList = () => {
  // データ取得ロジック
  // 状態管理
  return { users, handleSearch, handleReset };
};

// ✅ OK: features/user-management/components/UserManagement.tsx
export const UserManagement = () => {
  const { users, handleSearch, handleReset } = useUserList();
  return <div>{/* 表示のみ */}</div>;
};

// ❌ NG: ロジックをコンポーネントに直接書く
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    // データ取得ロジック
  };
  return <div>...</div>;
};
```

### 4.12 権限チェックの書き方

#### ✅ 権限チェックの仕組み

権限チェックは**layout**で行います。権限が必要なページは`app/{role}/`配下に配置し、layoutで権限がない場合は`/unauthorized`にリダイレクトします。

#### ✅ layoutでの権限チェック

```tsx
// app/master/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function MasterLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const { isMaster } = useAuth();

  useEffect(() => {
    if (!isMaster()) {
      router.push('/unauthorized');
    }
  }, [isMaster, router]);

  if (!isMaster()) {
    return null;
  }

  return <>{children}</>;
}
```

#### ✅ コンポーネント内での権限チェック

```tsx
import { useAuth } from '@/hooks/useAuth';

export const MyComponent = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return null;
  }

  return <div>管理者のみ表示</div>;
};
```

#### ✅ 権限が必要なページの配置

```
app/
├── master/              # マスター権限が必要
│   ├── layout.tsx       # 権限チェックを行うlayout
│   └── user-management/
│       └── page.tsx
├── admin/               # 管理者権限が必要
│   ├── layout.tsx       # 権限チェックを行うlayout
│   └── event-management/
│       └── page.tsx
└── applicants/          # ユーザー権限でアクセス可能（layoutなし）
    └── page.tsx
```

#### ✅ ダッシュボードでの権限フィルタリング

```tsx
// features/dashboard/components/Dashboard.tsx
import { useAuth } from '@/hooks/useAuth';

type DashboardLink = {
  href: string;
  label: string;
  description: string;
  requiredRole: UserRole;
};

const dashboardLinks: DashboardLink[] = [
  {
    href: '/applicants/search',
    label: '応募者検索',
    description: '応募者情報を検索・閲覧します',
    requiredRole: 'user',
  },
  {
    href: '/admin/bulk-processing',
    label: '一括処理',
    description: '一括での処理を実行します',
    requiredRole: 'admin',
  },
];

export const Dashboard = () => {
  const { hasRole } = useAuth();

  const visibleLinks = dashboardLinks.filter((link) =>
    hasRole(link.requiredRole),
  );

  return (
    <div>
      {visibleLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  );
};
```

### 4.13 グローバル状態管理の書き方

#### ✅ ライブラリを使ったグローバル管理

グローバル状態は**Zustand**などの状態管理ライブラリで管理します。主に以下の3つのストアがあります：

1. **`recruitYearStore`**: 年度情報の管理
2. **`userStore`**: ログインユーザー情報の管理
3. **`breadcrumbStore`**: パンくずリストの管理

**なぜライブラリを使うか**:

- Contextは再レンダリングの問題がある（Provider配下の全コンポーネントが再レンダリングされる）
- ライブラリを使うことで、必要な部分だけを再レンダリングできる
- デバッグツールが充実している
- 型安全性が高い

#### ✅ Zustandを使った実装例

```tsx
// stores/recruit-year.store.ts
import { create } from 'zustand';
import type { RecruitYearResponseDto } from '@/types/recruit-year';
import { apiClient } from '@/libs/api-client';

type RecruitYearState = {
  recruitYears: RecruitYearResponseDto[];
  selectedRecruitYear: RecruitYearResponseDto | null;
  isLoading: boolean;
  error: Error | null;
  setRecruitYears: (years: RecruitYearResponseDto[]) => void;
  setSelectedRecruitYear: (year: RecruitYearResponseDto | null) => void;
  fetchRecruitYears: () => Promise<void>;
};

export const useRecruitYearStore = create<RecruitYearState>((set) => ({
  recruitYears: [],
  selectedRecruitYear: null,
  isLoading: false,
  error: null,
  setRecruitYears: (years) => set({ recruitYears: years }),
  setSelectedRecruitYear: (year) => set({ selectedRecruitYear: year }),
  fetchRecruitYears: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient<RecruitYearResponseDto[]>('/recruit-years');
      set({ recruitYears: data, isLoading: false });
      if (data.length > 0) {
        set({ selectedRecruitYear: data[0] });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error
            : new Error('年度情報の取得に失敗しました'),
        isLoading: false,
      });
    }
  },
}));

// 使用例
import { useRecruitYearStore } from '@/stores/recruit-year.store';

export const MyComponent = () => {
  // 必要な部分だけを選択的に取得（再レンダリングを最小化）
  const selectedRecruitYear = useRecruitYearStore(
    (state) => state.selectedRecruitYear,
  );
  const setSelectedRecruitYear = useRecruitYearStore(
    (state) => state.setSelectedRecruitYear,
  );

  // 年度が必要なAPI呼び出し
  const fetchData = async () => {
    const data = await apiClient(
      `/companies?recruitYearId=${selectedRecruitYear?.recruitYear}`,
    );
  };
};
```

#### ✅ UserStore（ユーザー情報管理）

```tsx
// stores/user.store.ts
import { create } from 'zustand';
import type { User } from '@/types/user';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// 使用例
import { useUserStore } from '@/stores/user.store';

export const MyComponent = () => {
  const user = useUserStore((state) => state.user);
  return <div>{user?.name}</div>;
};
```

#### ✅ BreadcrumbStore（パンくずリスト管理）

```tsx
// stores/breadcrumb.store.ts
import { create } from 'zustand';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbState = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
};

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

// 使用例
import { useBreadcrumbStore } from '@/stores/breadcrumb.store';

export default function MyPage() {
  const setItems = useBreadcrumbStore((state) => state.setItems);

  useEffect(() => {
    setItems([{ label: 'ホーム', href: '/' }, { label: 'ユーザー管理' }]);
  }, [setItems]);

  return <div>...</div>;
}
```

#### ❌ Contextを使った実装（非推奨）

```tsx
// ❌ NG: Contextを使った実装
// 問題点: Provider配下の全コンポーネントが再レンダリングされる
export const RecruitYearProvider = ({ children }) => {
  const [selectedRecruitYear, setSelectedRecruitYear] = useState(null);
  // ...
  return (
    <RecruitYearContext.Provider
      value={{ selectedRecruitYear, setSelectedRecruitYear }}
    >
      {children}
    </RecruitYearContext.Provider>
  );
};
```

### 4.14 年度管理の書き方

#### ✅ 必ず`useRecruitYear`フックを使う

```tsx
import { useRecruitYear } from '@/contexts/RecruitYearContext';

export const MyComponent = () => {
  const { selectedRecruitYear } = useRecruitYear();

  if (!selectedRecruitYear) {
    return <Loading />;
  }

  // 年度情報を使用
  return <div>{selectedRecruitYear.recruitYear}年度</div>;
};
```

#### ✅ 年度が必要なAPI呼び出しには必ず`recruitYearId`を含める

```tsx
const { selectedRecruitYear } = useRecruitYear();

const fetchData = async () => {
  const data = await apiClient(
    `/companies?recruitYearId=${selectedRecruitYear.recruitYear}`,
  );
};
```

### 4.15 CSV処理の書き方

#### ✅ CSV出力の実装

```tsx
// features/user-management/hooks/useUserCsvExport.ts
import { apiClient } from '@/libs/api-client';
import { convertToCSV, downloadCSV } from '@/libs/csv-utils';
import { formatDateToISOString } from '@/libs/date-utils';

export const useUserCsvExport = ({ searchParams }: UseUserCsvExportParams) => {
  const handleExportCSV = useCallback(async () => {
    try {
      // 検索条件をクエリパラメータに変換
      const params = new URLSearchParams();
      if (searchParams.id) params.append('id', searchParams.id);
      if (searchParams.search) params.append('search', searchParams.search);
      if (searchParams.role) params.append('role', searchParams.role);

      // APIからデータを取得
      const exportUsers = await apiClient<UserResponseDto[]>(
        `/users/export?${params.toString()}`,
      );

      // CSV形式に変換
      const csvData = exportUsers.map((user) => ({
        ID: user.id,
        メールアドレス: user.email,
        姓: user.lastName,
        名: user.firstName,
        権限: roleLabelMap[user.role],
        性別: user.gender ? genderLabelMap[user.gender] : '-',
        部署: user.departmentName || '-',
      }));

      const csvContent = convertToCSV({
        data: csvData,
        headers: userExportCsvHeaders,
      });

      // ダウンロード
      const filename = `ユーザー一覧_${formatDateToISOString()}.csv`;
      downloadCSV({ csvContent, filename });
    } catch (err) {
      const message = extractErrorMessage(err, 'CSV出力に失敗しました');
      throw new Error(message);
    }
  }, [searchParams]);

  return { handleExportCSV };
};
```

#### ✅ CSVアップロードの実装

```tsx
// features/user-management/hooks/useUserCsvUpload.ts
import { parseCSV } from '@/libs/csv-parse';
import { chunk } from '@/libs/array-utils';

export const useUserCsvUpload = ({ fetchUsers }: UseUserCsvUploadParams) => {
  const handleUploadCSV = useCallback(
    async (file: File, isEdit: boolean) => {
      try {
        // ファイル形式の検証
        validateFileType(file);

        // CSVをパース
        const csvData = await parseCSV(file);

        // データの検証
        const validCsvData = validateCsvData(csvData, isEdit);

        // CSVデータをユーザーデータに変換
        const users = validCsvData.map((row) =>
          convertCsvRowToUser(row, isEdit),
        );

        // 一括処理（50件ずつ）
        if (isEdit) {
          await handleBulkEdit(users);
        } else {
          await handleBulkCreate(users);
        }

        // データを再取得
        await fetchUsers();
      } catch (err) {
        const message = extractErrorMessage(
          err,
          'CSVアップロードに失敗しました',
        );
        throw new Error(message);
      }
    },
    [handleBulkEdit, handleBulkCreate, convertCsvRowToUser, fetchUsers],
  );

  return { handleUploadCSV };
};
```

#### ✅ CSVテンプレートダウンロードの実装

```tsx
// features/user-management/hooks/useUserCsvTemplate.ts
import { convertToCSV, downloadCSV } from '@/libs/csv-utils';
import { userExportCsvHeaders } from '../constants/user-csv.constants';

export const useUserCsvTemplate = () => {
  const handleDownloadTemplateCSV = useCallback(() => {
    // 空のデータでCSVを作成
    const csvContent = convertToCSV({
      data: [],
      headers: userExportCsvHeaders,
    });

    downloadCSV({
      csvContent,
      filename: 'ユーザー一括登録テンプレート.csv',
    });
  }, []);

  return { handleDownloadTemplateCSV };
};
```

### 4.16 コンポーネント分割の目安

#### ✅ 分割する基準

1. **責任が異なる場合**: 検索フォーム、テーブル、ダイアログなど、役割が異なるものは分割
2. **再利用する可能性がある場合**: 他の画面でも使う可能性があるものは分割
3. **ファイルが長くなる場合**: 200行を超える場合は分割を検討
4. **状態管理が複雑になる場合**: 複数の状態を持つ場合は分割

#### ✅ 分割例

```tsx
// ❌ NG: 1つのファイルにすべてを書く
// features/user-management/components/UserManagement.tsx (500行)

// ✅ OK: 責任ごとに分割
// features/user-management/components/UserManagement.tsx (メインコンポーネント)
export const UserManagement = () => {
  const { users, handleSearch, handleReset } = useUserManagement();

  return (
    <PageContainer>
      <UserSearchForm onSearch={handleSearch} onReset={handleReset} />
      <UserTable users={users} />
      <UserManagementDialogs />
    </PageContainer>
  );
};

// features/user-management/components/UserSearchForm.tsx (検索フォーム)
export const UserSearchForm = ({ onSearch, onReset }) => {
  // 検索フォームのロジック
};

// features/user-management/components/UserTable.tsx (テーブル)
export const UserTable = ({ users }) => {
  // テーブルのロジック
};

// features/user-management/components/UserManagementDialogs.tsx (ダイアログ)
export const UserManagementDialogs = () => {
  // ダイアログのロジック
};
```

#### ✅ 分割しない基準

1. **単純な表示のみ**: ロジックがなく、単純な表示のみの場合は分割不要
2. **1画面でしか使わない**: その画面でしか使わない場合は分割不要
3. **密接に関連している**: 密接に関連している場合は分割しない

### 4.17 検索条件保存機能の実装

#### ✅ 必ず`useSearchCondition`フックを使う

```tsx
// features/user-management/hooks/useSearchCondition.ts
import { useSearchCondition as useSearchConditionBase } from '@/hooks/useSearchCondition';
import { useSearchParams } from 'next/navigation';

const FORM_TYPE = 'user';
const CURRENT_PATH = '/master/user-management';

const buildUrlParams = (searchParams: URLSearchParams): string => {
  const params = new URLSearchParams();
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  if (id) params.set('id', id);
  if (search) params.set('search', search);
  return params.toString();
};

export const useSearchCondition = () => {
  const buildUrlParamsFn = useCallback(
    (params: URLSearchParams) => buildUrlParams(params),
    [],
  );

  return useSearchConditionBase({
    formType: FORM_TYPE,
    currentPath: CURRENT_PATH,
    buildUrlParams: buildUrlParamsFn,
  });
};
```

#### ✅ 検索条件保存ボタンと一覧ボタンを配置

```tsx
import { SaveSearchConditionButton } from '@/components/features';
import { SearchConditionListDialog } from '@/components/features';

export const UserManagement = () => {
  const {
    savedConditions,
    saveCondition,
    deleteCondition,
    applyCondition,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    isListDialogOpen,
    setIsListDialogOpen,
  } = useSearchCondition();

  return (
    <>
      <SaveSearchConditionButton
        hasSearchConditions={hasSearchConditions}
        onClick={() => setIsSaveDialogOpen(true)}
      />
      <Button onClick={() => setIsListDialogOpen(true)}>検索条件一覧</Button>
      <SearchConditionListDialog
        isOpen={isListDialogOpen}
        onClose={() => setIsListDialogOpen(false)}
        conditions={savedConditions}
        onDelete={deleteCondition}
        onApply={applyCondition}
      />
    </>
  );
};
```

### 4.15 CSV機能の実装

#### ✅ ユーザー管理の実装パターンを参考にする

参考実装:

- 検索フォーム: `features/user-management/components/UserSearchForm.tsx`
- CSV機能フック: `features/user-management/hooks/useUserCsv.ts`
- CSV定数: `features/user-management/constants/user-csv.constants.ts`

#### ✅ 実装する機能

1. **CSV出力**: `handleExportCSV`関数を実装
2. **CSVテンプレートダウンロード**: `handleDownloadTemplateCSV`（一括登録用）、`handleDownloadEditTemplateCSV`（一括編集用）を実装
3. **CSVアップロード**: `handleUploadCSV`関数を実装（`isEdit`パラメータで登録/編集を切り替え）

### 4.16 スタイリングの書き方

#### ✅ 必ずTailwind CSSクラスを使用

```tsx
// ✅ OK: Tailwind CSSのクラスを使用
<div className="flex flex-col gap-4">
  <ComponentA />
  <ComponentB />
</div>

// ✅ OK: Gridレイアウト
<div className="grid grid-cols-2 gap-6">
  <ComponentA />
  <ComponentB />
</div>

// ❌ NG: インラインスタイル
<div style={{ display: 'flex', flexDirection: 'column' }}>
```

---

## 5. 主要なコンポーネントと使い方

### 5.1 フォームコンポーネント

#### `TextField` - テキスト入力フィールド

```tsx
import { TextField } from '@/components/form';

<TextField name="name" label="名前" rules={{ required: '名前は必須です' }} />;
```

#### `SelectField` - セレクトボックス

```tsx
import { SelectField } from '@/components/form';

<SelectField
  name="role"
  label="権限"
  options={[
    { value: 'user', label: 'ユーザー' },
    { value: 'admin', label: '管理者' },
  ]}
  rules={{ required: '権限は必須です' }}
/>;
```

#### `TextareaField` - テキストエリア

```tsx
import { TextareaField } from '@/components/form';

<TextareaField
  name="memo"
  label="メモ"
  rules={{
    maxLength: { value: 1000, message: '1000文字以内で入力してください' },
  }}
/>;
```

### 5.2 UIコンポーネント

#### `Button` - ボタン

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" onClick={handleClick}>
  送信
</Button>

<Button variant="outline" onClick={handleCancel}>
  キャンセル
</Button>

<Button variant="danger" onClick={handleDelete}>
  削除
</Button>
```

#### `Table` - テーブル

```tsx
import { Table } from '@/components/ui';

<Table
  columns={[
    { key: 'name', label: '名前' },
    { key: 'email', label: 'メール' },
    {
      key: 'actions',
      label: '操作',
      render: (_, row) => (
        <Button onClick={() => handleEdit(row.id)}>編集</Button>
      ),
    },
  ]}
  data={users}
  emptyMessage="データがありません"
/>;
```

#### `Dialog` - モーダルダイアログ

```tsx
import { Dialog, Button } from '@/components/ui';

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>キャンセル</Button>
      <Button onClick={handleConfirm}>確定</Button>
    </>
  }
>
  <p>本当に削除しますか？</p>
</Dialog>;
```

#### `Loading` - ローディング表示

```tsx
import { Loading } from '@/components/ui';

if (isLoading) {
  return <Loading />;
}
```

---

## 6. 主要なフックと使い方

### 6.1 `useAuth` - 認証・権限チェック

```tsx
import { useAuth } from '@/hooks/useAuth';

const { user, isMaster, isAdmin, hasRole } = useAuth();

// 権限チェック
if (hasRole('admin')) {
  // 管理者のみ実行
}
```

### 6.2 `useRecruitYear` - 年度情報

```tsx
import { useRecruitYear } from '@/contexts/RecruitYearContext';

const { selectedRecruitYear, setSelectedRecruitYear, recruitYears } =
  useRecruitYear();

// 年度が必要なAPI呼び出し
const fetchData = async () => {
  const data = await apiClient(
    `/companies?recruitYearId=${selectedRecruitYear.recruitYear}`,
  );
};
```

### 6.3 `useSearchCondition` - 検索条件保存

```tsx
// features/{feature}/hooks/useSearchCondition.ts でラップ
const { savedConditions, saveCondition, deleteCondition, applyCondition } =
  useSearchCondition();
```

---

## 7. 実装時のチェックリスト

新しい機能を実装する際は、以下を確認してください。

### フォーム実装時

- [ ] `FormProvider`と`useForm`を使用しているか
- [ ] `TextField`、`SelectField`などのフォームコンポーネントを使用しているか
- [ ] `mode: 'onSubmit'`と`reValidateMode: 'onChange'`を設定しているか
- [ ] エラーハンドリングで`setError`と`toast`を使用しているか

### データ取得実装時

- [ ] URLパラメータから直接値を取得しているか（`useSearchParams`）
- [ ] `useState`で検索条件を管理していないか
- [ ] `router.push`でURLを更新しているか
- [ ] `useEffect`でURLパラメータの変更を検知しているか
- [ ] 年度が必要な場合は`recruitYearId`を含めているか

### コンポーネント実装時

- [ ] Named Exportを使用しているか
- [ ] アロー関数を使用しているか
- [ ] 1ファイル1コンポーネントか
- [ ] ロジックはカスタムフックに切り出しているか
- [ ] `@/`エイリアスでインポートしているか

### 型定義時

- [ ] `type`文を使用しているか（`interface`は使っていないか）
- [ ] 機能固有の型は`features/{feature}/types/`に配置しているか
- [ ] 共有型は`types/`に配置しているか

### スタイリング時

- [ ] Tailwind CSSクラスを使用しているか
- [ ] インラインスタイルを使っていないか

---

## 8. よくある間違いと正しい実装

### ❌ 間違い: useStateで検索条件を管理

```tsx
// ❌ NG
const [searchParams, setSearchParams] = useState({ id: '', search: '' });
```

### ✅ 正しい: URLパラメータから直接取得

```tsx
// ✅ OK
const searchParams = useSearchParams();
const id = searchParams.get('id') || '';
```

### ❌ 間違い: 直接APIを叩く

```tsx
// ❌ NG
const handleSearch = async (data: FormData) => {
  const users = await apiClient(`/users?search=${data.search}`);
  setUsers(users);
};
```

### ✅ 正しい: URLを更新してデータ取得

```tsx
// ✅ OK
const handleSearch = (data: FormData) => {
  router.push(`/users?search=${data.search}`);
};
```

### ❌ 間違い: ロジックをコンポーネントに直接書く

```tsx
// ❌ NG
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    // データ取得ロジック
  };
  return <div>...</div>;
};
```

### ✅ 正しい: カスタムフックに切り出す

```tsx
// ✅ OK: hooks/useUserList.ts
export const useUserList = () => {
  // データ取得ロジック
  return { users, fetchUsers };
};

// ✅ OK: components/UserManagement.tsx
export const UserManagement = () => {
  const { users } = useUserList();
  return <div>...</div>;
};
```

---

## 9. まとめ

このフロントエンドアプリケーションは、以下の設計思想に基づいて構築されています：

1. **機能の独立性**: 機能ごとにコードを完全に分離
2. **URL駆動の状態管理**: 状態はURLパラメータで管理
3. **ロジックと表示の分離**: コンポーネントは表示のみ、ロジックはフックに集約
4. **必要以上に共通化しない**: 全画面共通のUIのみを共通化

これらの思想に従って実装することで、保守性が高く、スケーラブルなアプリケーションを実現できます。
