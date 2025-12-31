import { DomainError } from '../../../../common/errors/domain.error';

const parseHHmm = (hhmm: string): { h: number; m: number } => {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);

  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    throw new DomainError(`不正な時刻形式です: ${hhmm}`);
  }

  return { h, m };
};

const toMinutes = (hhmm: string): number => {
  const { h, m } = parseHHmm(hhmm);
  return h * 60 + m;
};

const nowMinutes = (now: Date): number =>
  now.getHours() * 60 + now.getMinutes();

// <=
export const isBeforeOrEqual = (now: Date, hhmm: string): boolean => {
  return nowMinutes(now) <= toMinutes(hhmm);
};

// >=
export const isAfterOrEqual = (now: Date, hhmm: string): boolean => {
  return nowMinutes(now) >= toMinutes(hhmm);
};
