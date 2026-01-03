import { DomainError } from '../../../common/errors/domain.error';
import { EntityId } from '../entity-id.vo';
import { RuleTargetAction } from './attendance-rule-target-action';
import { RuleType } from './attendance-rule-type';
import { RuleSetting } from './attendance-rule-setting';

type AttendanceRuleparams = {
  id: EntityId;
  targets: RuleTargetAction[];
  type: RuleType;
  setting: RuleSetting;
  enabled: boolean;
};

// 「AttendanceRule は単体の不変条件（type と setting の整合など）だけを保証する。」
// 「occurredAt を使った出勤/退勤の可否判定は、ルール集合を扱う AttendanceRulePolicy 側で行う。」
export class AttendanceRule {
  private readonly id: EntityId;
  private readonly targets: RuleTargetAction[];
  private readonly type: RuleType; //定義したしたルールの名称
  private readonly setting: RuleSetting; //具体的なルール
  private readonly enabled: boolean;

  private constructor({
    id,
    targets,
    type,
    setting,
    enabled,
  }: AttendanceRuleparams) {
    if (type !== setting.type) {
      throw new DomainError(
        '勤怠ルール定義が不正です（typeとsetting.typeが一致しません）',
      );
    }
    this.id = id;
    this.targets = targets;
    this.type = type;
    this.setting = setting;
    this.enabled = enabled;
  }

  public static create({
    targets,
    type,
    setting,
    enabled,
  }: Omit<AttendanceRuleparams, 'id'>): AttendanceRule {
    return new AttendanceRule({
      id: EntityId.generate(),
      targets,
      type,
      setting,
      enabled,
    });
  }

  public static reconstruct({
    id,
    targets,
    type,
    setting,
    enabled,
  }: AttendanceRuleparams): AttendanceRule {
    return new AttendanceRule({
      id,
      targets,
      type,
      setting,
      enabled,
    });
  }

  public getId(): string {
    return this.id.getEntityId();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getTargets(): RuleTargetAction[] {
    return this.targets;
  }

  public getType(): RuleType {
    return this.type;
  }

  public getSetting(): RuleSetting {
    return this.setting;
  }
}
