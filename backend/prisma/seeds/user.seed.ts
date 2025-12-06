import { PrismaClient, UserRole, Gender } from '@prisma/client';
import { ulid } from 'ulid';

/**
 * User シード作成用
 */
export async function seedUsers({ prisma }: { prisma: PrismaClient }) {
  console.log('User シード作成を開始...');

  // 既存のデータを削除
  await prisma.user.deleteMany();

  const systemUserId = 'system';

  // systemユーザーを作成（システム用）
  await prisma.user.create({
    data: {
      id: systemUserId,
      email: 'system@example.com',
      role: UserRole.admin,
      firstName: 'System',
      lastName: 'User',
      gender: Gender.other,
      createdBy: systemUserId,
      updatedBy: systemUserId,
    },
  });

  // 管理者ユーザーを作成
  const adminUserId = ulid();
  await prisma.user.create({
    data: {
      id: adminUserId,
      email: 'admin@example.com',
      role: UserRole.admin,
      firstName: 'Admin',
      lastName: 'User',
      gender: Gender.other,
      createdBy: systemUserId,
      updatedBy: systemUserId,
    },
  });

  // 一般ユーザーを50人作成
  const firstNames = [
    '太郎',
    '花子',
    '一郎',
    '次郎',
    '三郎',
    '四郎',
    '五郎',
    '六郎',
    '七郎',
    '八郎',
    '美咲',
    'さくら',
    'あかり',
    'みお',
    'ゆい',
    'あい',
    'まな',
    'りん',
    'えみ',
    'なつき',
    '健太',
    '翔太',
    '大輔',
    '拓也',
    '直樹',
    '智也',
    '亮太',
    '和也',
    '翔',
    '大樹',
    '麻衣',
    '由美',
    '恵子',
    '美香',
    '智子',
    '真理',
    '直美',
    '由佳',
    '美穂',
    '佳子',
  ];
  const lastNames = [
    '山田',
    '佐藤',
    '鈴木',
    '高橋',
    '田中',
    '渡辺',
    '伊藤',
    '中村',
    '小林',
    '加藤',
    '吉田',
    '山本',
    '松本',
    '井上',
    '木村',
    '林',
    '斎藤',
    '清水',
    '山崎',
    '森',
    '池田',
    '橋本',
    '石川',
    '前田',
    '藤田',
    '後藤',
    '近藤',
    '村上',
    '遠藤',
    '青木',
  ];
  // 性別の分布: 男性24人、女性24人、その他2人
  const genderDistribution: Gender[] = [
    Gender.male, // user1
    Gender.female, // user2
    Gender.male, // user3
    Gender.male, // user4
    Gender.female, // user5
    Gender.other, // user6
    Gender.male, // user7
    Gender.female, // user8
    Gender.other, // user9
    Gender.male, // user10
    Gender.female, // user11
    Gender.female, // user12
    Gender.female, // user13
    Gender.female, // user14
    Gender.female, // user15
    Gender.female, // user16
    Gender.female, // user17
    Gender.female, // user18
    Gender.female, // user19
    Gender.female, // user20
    Gender.male, // user21
    Gender.male, // user22
    Gender.male, // user23
    Gender.male, // user24
    Gender.male, // user25
    Gender.male, // user26
    Gender.male, // user27
    Gender.male, // user28
    Gender.male, // user29
    Gender.male, // user30
    Gender.female, // user31
    Gender.female, // user32
    Gender.female, // user33
    Gender.female, // user34
    Gender.female, // user35
    Gender.female, // user36
    Gender.female, // user37
    Gender.female, // user38
    Gender.female, // user39
    Gender.female, // user40
    Gender.male, // user41
    Gender.female, // user42
    Gender.male, // user43
    Gender.male, // user44
    Gender.male, // user45
    Gender.male, // user46
    Gender.male, // user47
    Gender.male, // user48
    Gender.male, // user49
    Gender.male, // user50
  ];

  const userData = Array.from({ length: 50 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const gender = genderDistribution[i];
    return {
      id: ulid(),
      email: `user${i + 1}@example.com`,
      role: UserRole.user,
      firstName,
      lastName,
      gender,
      createdBy: systemUserId,
      updatedBy: systemUserId,
    };
  });

  const users = await prisma.user.createMany({
    data: userData,
  });

  console.log(`1 件の System User 作成完了`);
  console.log(`1 件の Admin User 作成完了`);
  console.log(`${users.count} 件の User 作成完了`);
}
