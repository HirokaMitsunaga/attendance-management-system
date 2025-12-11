export function calcWorkingHours(clockIn: string, clockOut: string): string {
  const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeFormat.test(clockIn) || !timeFormat.test(clockOut)) {
    throw new Error(
      `時刻のフォーマットが不正です: 出勤時刻=${clockIn}, 退勤時刻=${clockOut}`,
    );
  }

  // "HH:MM" フォーマットから時間と分を抽出
  const [inHours, inMinutes] = clockIn.split(':').map(Number);
  const [outHours, outMinutes] = clockOut.split(':').map(Number);

  // 総分数に変換
  const totalInMinutes = inHours * 60 + inMinutes;
  let totalOutMinutes = outHours * 60 + outMinutes;

  // 深夜勤務対応（退勤時刻が出勤時刻以前の場合は翌日とみなす）
  if (totalOutMinutes <= totalInMinutes) {
    totalOutMinutes += 24 * 60;
  }

  // 勤務時間を分単位で計算
  const workingMinutes = totalOutMinutes - totalInMinutes;

  // 時間と分に変換
  const hours = Math.floor(workingMinutes / 60);
  const minutes = workingMinutes % 60;

  return `${hours}時間${minutes}分`;
}
