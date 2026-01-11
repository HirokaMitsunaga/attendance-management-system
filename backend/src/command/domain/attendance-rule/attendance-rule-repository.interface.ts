import { EntityId } from '../entity-id.vo';
import { AttendanceRule } from './attendance-rule.entity';

export interface IAttendanceRuleRepository {
  findById(params: { ruleId: EntityId }): Promise<AttendanceRule | undefined>;
  findAllEnabled(): Promise<AttendanceRule[]>;
  create(params: { rule: AttendanceRule }): Promise<void>;
  update(params: { rule: AttendanceRule }): Promise<void>;
  delete(params: { rule: AttendanceRule }): Promise<void>;
}
