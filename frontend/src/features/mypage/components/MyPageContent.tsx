'use client';

import { useState } from 'react';
import { useSWRData } from '@/libs/swr-client';
import { Title, PageContainer, Loading, Button, EditIcon } from '@/components/ui';
import { MyPageForm } from './MyPageForm';
import { MyPageView } from './MyPageView';
import type { UserResponseDto } from '@/types/user';

export const MyPageContent = () => {
  const { data: user, isLoading } = useSWRData<UserResponseDto>('/me');
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <Title>マイページ</Title>
        <Loading />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <Title>マイページ</Title>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500">ユーザー情報を取得できませんでした</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <Title>マイページ</Title>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            icon={<EditIcon />}
          >
            編集
          </Button>
        )}
      </div>

      {isEditing ? (
        <MyPageForm
          user={user}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <MyPageView user={user} />
      )}
    </PageContainer>
  );
};

