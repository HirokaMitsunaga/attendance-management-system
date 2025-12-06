'use client';

import type { UserResponseDto } from '@/types/user';

type MyPageViewProps = {
  user: UserResponseDto;
};

export const MyPageView = ({ user }: MyPageViewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <p className="text-sm text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <p className="text-sm text-gray-900">{user.lastName} {user.firstName}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            権限
          </label>
          <p className="text-sm text-gray-900">
            {user.role === 'admin' ? '管理者' : 'ユーザー'}
          </p>
        </div>

        {user.gender && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <p className="text-sm text-gray-900">
              {user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : 'その他'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

