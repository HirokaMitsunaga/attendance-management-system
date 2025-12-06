'use client';

import { Table, Button, EditIcon } from '@/components/ui';
import { roleLabelMap } from '../../constants/user.constants';
import type { UserResponseDto } from '@/types/user';

type UserTableProps = {
  users: UserResponseDto[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onRowClick: (userId: string) => void;
};

export const UserTable = ({
  users,
  total,
  page,
  onPageChange,
  onRowClick,
}: UserTableProps) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'メールアドレス' },
    { key: 'name', label: '名前' },
    { key: 'role', label: '権限' },
    {
      key: 'actions',
      label: '操作',
      render: (_value: unknown, row: { id: string }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row.id);
          }}
          icon={<EditIcon />}
        >
          編集
        </Button>
      ),
    },
  ];

  const data = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: `${user.lastName} ${user.firstName}`,
    role: roleLabelMap[user.role],
  }));

  return (
    <Table
      columns={columns}
      data={data}
      emptyMessage="ユーザーが見つかりません"
      onRowClick={(row) => onRowClick(row.id)}
      pagination={{
        page,
        total,
        onPageChange,
      }}
    />
  );
};
