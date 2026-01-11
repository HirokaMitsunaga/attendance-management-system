import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ulid } from 'ulid';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { CustomLoggerService } from 'src/config/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

const describeDb = process.env.RUN_DB_TESTS === '1' ? describe : describe.skip;

describeDb('AttendanceRuleController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: unknown;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 本番と同じレスポンス形に寄せる
    const logger = app.get(CustomLoggerService);
    app.useGlobalFilters(new GlobalExceptionFilter(logger));

    await app.init();

    prisma = app.get(PrismaService);
    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    if (!prisma) return;
    // テスト前に必ずデータベースをクリーンアップ
    await prisma.attendanceRule.deleteMany();
  });

  afterEach(async () => {
    if (!prisma) return;
    // テスト後にも必ずクリーンアップ（並列実行や異常終了時の影響を低減）
    await prisma.attendanceRule.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /attendance-rule', () => {
    it('正常系: 勤怠ルールが作成される（ALLOW_CLOCK_IN_ONLY_BEFORE_TIME）', async () => {
      const requestBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '10:00',
        },
        enabled: true,
      };

      await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(201);

      const rules = await prisma.attendanceRule.findMany();
      expect(rules).toHaveLength(1);
      expect(rules[0].targets).toEqual(['CLOCK_IN']);
      expect(rules[0].type).toBe('ALLOW_CLOCK_IN_ONLY_BEFORE_TIME');
      expect(rules[0].enabled).toBe(true);

      const setting = rules[0].setting as {
        type: string;
        latestClockInTime: string;
      };
      expect(setting.type).toBe('ALLOW_CLOCK_IN_ONLY_BEFORE_TIME');
      expect(setting.latestClockInTime).toBe('10:00');
    });

    it('正常系: 勤怠ルールが作成される（ALLOW_CLOCK_OUT_ONLY_AFTER_TIME）', async () => {
      const requestBody = {
        targets: ['CLOCK_OUT'],
        type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
        setting: {
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          earliestClockOutTime: '17:00',
        },
        enabled: true,
      };

      await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(201);

      const rules = await prisma.attendanceRule.findMany();
      expect(rules).toHaveLength(1);
      expect(rules[0].targets).toEqual(['CLOCK_OUT']);
      expect(rules[0].type).toBe('ALLOW_CLOCK_OUT_ONLY_AFTER_TIME');
      expect(rules[0].enabled).toBe(true);

      const setting = rules[0].setting as {
        type: string;
        earliestClockOutTime: string;
      };
      expect(setting.type).toBe('ALLOW_CLOCK_OUT_ONLY_AFTER_TIME');
      expect(setting.earliestClockOutTime).toBe('17:00');
    });

    it('正常系: 複数のターゲットアクションを指定できる', async () => {
      const requestBody = {
        targets: ['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '09:30',
        },
        enabled: false,
      };

      await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(201);

      const rules = await prisma.attendanceRule.findMany();
      expect(rules).toHaveLength(1);
      expect(rules[0].targets).toEqual([
        'CLOCK_IN',
        'CLOCK_OUT',
        'BREAK_START',
        'BREAK_END',
      ]);
      expect(rules[0].enabled).toBe(false);
    });

    it('異常系: targetsが空配列の場合は400で返る', async () => {
      const requestBody = {
        targets: [],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '10:00',
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        'targets: 対象アクションは必須です',
      );
    });

    it('異常系: 時刻フォーマットが不正な場合は400で返る', async () => {
      const requestBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '25:00', // 不正な時刻
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        '最遅出勤時刻の形式が正しくありません',
      );
    });

    it('異常系: typeとsettingのtypeが一致しない場合は400で返る', async () => {
      const requestBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME', // typeと不一致
          earliestClockOutTime: '17:00',
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('PUT /attendance-rule/:ruleId', () => {
    it('正常系: 勤怠ルールが更新される', async () => {
      // 事前にルールを作成
      const ruleId = ulid();
      await prisma.attendanceRule.create({
        data: {
          id: ruleId,
          targets: ['CLOCK_IN'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '10:00',
          },
          enabled: true,
        },
      });

      const updateBody = {
        targets: ['CLOCK_IN', 'CLOCK_OUT'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '09:00',
        },
        enabled: false,
      };

      await request(httpServer as never)
        .put(`/attendance-rule/${ruleId}`)
        .send(updateBody)
        .expect(200);

      const updatedRule = await prisma.attendanceRule.findUnique({
        where: { id: ruleId },
      });

      expect(updatedRule).not.toBeNull();
      expect(updatedRule?.targets).toEqual(['CLOCK_IN', 'CLOCK_OUT']);
      expect(updatedRule?.enabled).toBe(false);

      const setting = updatedRule?.setting as {
        type: string;
        latestClockInTime: string;
      };
      expect(setting.latestClockInTime).toBe('09:00');
    });

    it('正常系: ルールタイプを変更できる', async () => {
      // 事前にルールを作成
      const ruleId = ulid();
      await prisma.attendanceRule.create({
        data: {
          id: ruleId,
          targets: ['CLOCK_IN'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '10:00',
          },
          enabled: true,
        },
      });

      const updateBody = {
        targets: ['CLOCK_OUT'],
        type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
        setting: {
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          earliestClockOutTime: '17:00',
        },
        enabled: true,
      };

      await request(httpServer as never)
        .put(`/attendance-rule/${ruleId}`)
        .send(updateBody)
        .expect(200);

      const updatedRule = await prisma.attendanceRule.findUnique({
        where: { id: ruleId },
      });

      expect(updatedRule).not.toBeNull();
      expect(updatedRule?.type).toBe('ALLOW_CLOCK_OUT_ONLY_AFTER_TIME');

      const setting = updatedRule?.setting as {
        type: string;
        earliestClockOutTime: string;
      };
      expect(setting.type).toBe('ALLOW_CLOCK_OUT_ONLY_AFTER_TIME');
      expect(setting.earliestClockOutTime).toBe('17:00');
    });

    it('異常系: 存在しないruleIdで更新しようとすると404で返る', async () => {
      const nonExistentRuleId = ulid();
      const updateBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '10:00',
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .put(`/attendance-rule/${nonExistentRuleId}`)
        .send(updateBody)
        .expect(404);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 404,
        errorCode: 'NOT_FOUND',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        '勤怠ルール',
      );
    });

    it('異常系: targetsが空配列の場合は400で返る', async () => {
      const ruleId = ulid();
      await prisma.attendanceRule.create({
        data: {
          id: ruleId,
          targets: ['CLOCK_IN'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '10:00',
          },
          enabled: true,
        },
      });

      const updateBody = {
        targets: [],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '10:00',
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .put(`/attendance-rule/${ruleId}`)
        .send(updateBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        'targets: 対象アクションは必須です',
      );
    });

    it('異常系: 時刻フォーマットが不正な場合は400で返る', async () => {
      const ruleId = ulid();
      await prisma.attendanceRule.create({
        data: {
          id: ruleId,
          targets: ['CLOCK_OUT'],
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          setting: {
            type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
            earliestClockOutTime: '17:00',
          },
          enabled: true,
        },
      });

      const updateBody = {
        targets: ['CLOCK_OUT'],
        type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
        setting: {
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          earliestClockOutTime: 'invalid', // 不正な時刻
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .put(`/attendance-rule/${ruleId}`)
        .send(updateBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        '最早退勤時刻の形式が正しくありません',
      );
    });
  });

  describe('DELETE /attendance-rule/:ruleId', () => {
    it('正常系: 勤怠ルールが削除される', async () => {
      // 事前にルールを作成
      const ruleId = ulid();
      await prisma.attendanceRule.create({
        data: {
          id: ruleId,
          targets: ['CLOCK_IN'],
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          setting: {
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            latestClockInTime: '10:00',
          },
          enabled: true,
        },
      });

      await request(httpServer as never)
        .delete(`/attendance-rule/${ruleId}`)
        .expect(200);

      const deletedRule = await prisma.attendanceRule.findUnique({
        where: { id: ruleId },
      });

      expect(deletedRule).toBeNull();
    });

    it('正常系: 複数のルールがある場合、指定したルールのみ削除される', async () => {
      // 事前に複数のルールを作成
      const ruleId1 = ulid();
      const ruleId2 = ulid();
      await prisma.attendanceRule.createMany({
        data: [
          {
            id: ruleId1,
            targets: ['CLOCK_IN'],
            type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
            setting: {
              type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
              latestClockInTime: '10:00',
            },
            enabled: true,
          },
          {
            id: ruleId2,
            targets: ['CLOCK_OUT'],
            type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
            setting: {
              type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
              earliestClockOutTime: '17:00',
            },
            enabled: true,
          },
        ],
      });

      await request(httpServer as never)
        .delete(`/attendance-rule/${ruleId1}`)
        .expect(200);

      const deletedRule = await prisma.attendanceRule.findUnique({
        where: { id: ruleId1 },
      });
      const remainingRule = await prisma.attendanceRule.findUnique({
        where: { id: ruleId2 },
      });

      expect(deletedRule).toBeNull();
      expect(remainingRule).not.toBeNull();
      expect(remainingRule?.id).toBe(ruleId2);
    });

    it('異常系: 存在しないruleIdで削除しようとすると404で返る', async () => {
      const nonExistentRuleId = ulid();

      const res = await request(httpServer as never)
        .delete(`/attendance-rule/${nonExistentRuleId}`)
        .expect(404);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 404,
        errorCode: 'NOT_FOUND',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        '勤怠ルール',
      );
    });
  });

  describe('境界値テスト', () => {
    it('境界値: 時刻が00:00の場合も正常に作成される', async () => {
      const requestBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '00:00',
        },
        enabled: true,
      };

      await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(201);

      const rules = await prisma.attendanceRule.findMany();
      expect(rules).toHaveLength(1);

      const setting = rules[0].setting as {
        type: string;
        latestClockInTime: string;
      };
      expect(setting.latestClockInTime).toBe('00:00');
    });

    it('境界値: 時刻が23:59の場合も正常に作成される', async () => {
      const requestBody = {
        targets: ['CLOCK_OUT'],
        type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
        setting: {
          type: 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME',
          earliestClockOutTime: '23:59',
        },
        enabled: true,
      };

      await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(201);

      const rules = await prisma.attendanceRule.findMany();
      expect(rules).toHaveLength(1);

      const setting = rules[0].setting as {
        type: string;
        earliestClockOutTime: string;
      };
      expect(setting.earliestClockOutTime).toBe('23:59');
    });

    it('境界値: 時刻が24:00の場合は400で返る', async () => {
      const requestBody = {
        targets: ['CLOCK_IN'],
        type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
        setting: {
          type: 'ALLOW_CLOCK_IN_ONLY_BEFORE_TIME',
          latestClockInTime: '24:00', // 無効な時刻
        },
        enabled: true,
      };

      const res = await request(httpServer as never)
        .post('/attendance-rule')
        .send(requestBody)
        .expect(400);

      const body: unknown = res.body;
      expect(body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
      });
      expect(String((body as { message: unknown }).message)).toContain(
        '最遅出勤時刻の形式が正しくありません',
      );
    });
  });
});
