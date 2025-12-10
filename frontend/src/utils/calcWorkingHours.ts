export function calcWorkingHours(clockIn: string, clockOut: string): string {
  // "HH:MM" フォーマットから時間と分を抽出
  const [inHours, inMinutes] = clockIn.split(':').map(Number);
  const [outHours, outMinutes] = clockOut.split(':').map(Number);

  // 総分数に変換
  const totalInMinutes = inHours * 60 + inMinutes;
  const totalOutMinutes = outHours * 60 + outMinutes;

  // 勤務時間を分単位で計算
  const workingMinutes = totalOutMinutes - totalInMinutes;

  // 時間と分に変換
  const hours = Math.floor(workingMinutes / 60);
  const minutes = workingMinutes % 60;

  return `${hours}時間${minutes}分`;
}
