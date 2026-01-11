import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { EntityId } from '../domain/entity-id.vo';
import { AttendanceRule } from '../domain/attendance-rule/attendance-rule.entity';
import { type RuleSetting } from '../domain/attendance-rule/attendance-rule-setting';
import { type IAttendanceRuleRepository } from '../domain/attendance-rule/attendance-rule-repository.interface';
import { NotFoundError } from '../../common/errors/not-found.error';

@Injectable()
export class AttendanceRuleRepositoryPrisma
  implements IAttendanceRuleRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(params: {
    ruleId: EntityId;
  }): Promise<AttendanceRule | undefined> {
    const rule = await this.prisma.attendanceRule.findUnique({
      where: { id: params.ruleId.getEntityId() },
    });
    if (!rule) return undefined;

    return AttendanceRule.reconstruct({
      id: EntityId.reconstruct({ entityId: rule.id }),
      targets: rule.targets,
      type: rule.type,
      setting: this.toRuleSetting(rule.setting),
      enabled: rule.enabled,
    });
  }

  async create(params: { rule: AttendanceRule }): Promise<void> {
    const { rule } = params;
    await this.prisma.attendanceRule.create({
      data: {
        id: rule.getId(),
        targets: rule.getTargets(),
        type: rule.getType(),
        setting: this.toPrismaSetting(rule.getSetting()),
        enabled: rule.isEnabled(),
      },
    });
  }

  async update(params: { rule: AttendanceRule }): Promise<void> {
    const { rule } = params;
    try {
      await this.prisma.attendanceRule.update({
        where: { id: rule.getId() },
        data: {
          targets: rule.getTargets(),
          type: rule.getType(),
          setting: this.toPrismaSetting(rule.getSetting()),
          enabled: rule.isEnabled(),
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('勤怠ルール', rule.getId());
      }
      throw error;
    }
  }

  async delete(params: { rule: AttendanceRule }): Promise<void> {
    const { rule } = params;
    try {
      await this.prisma.attendanceRule.delete({
        where: { id: rule.getId() },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('勤怠ルール', rule.getId());
      }
      throw error;
    }
  }

  /**
   * Prisma の JsonValue -> ドメイン型への変換。
   * ここではバリデーションを行わず、型の整合はエンティティ側の不変条件（type一致）に委譲する。
   */
  private toRuleSetting(setting: Prisma.JsonValue): RuleSetting {
    // NOTE: DBにはRuleSetting互換のJSONが保存される前提（アプリ層で生成して保存する）
    return setting as unknown as RuleSetting;
  }

  private toPrismaSetting(setting: RuleSetting): Prisma.InputJsonValue {
    return setting;
  }
}
