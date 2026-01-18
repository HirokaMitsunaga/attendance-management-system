/*
 * ISO形式の日時文字列から、ローカル時刻の「HH:mm」部分を抽出して返します。
 *
 * @param isoString - ISO 8601形式の日時文字列（例: "2026-01-18T09:30:00.000Z"）
 * @returns 時刻（24時間表記）の文字列（例: "18:30"）
 *
 * @remarks
 * - `Date` の解釈結果に基づき、端末/環境のローカルタイムゾーンで `getHours()` / `getMinutes()` を取得します。
 * - 不正な日時文字列の場合は `Invalid Date` となり、結果が `"NaN:NaN"` になる可能性があります。
 *
 * @example
 * extractTimeFromISO("2026-01-18T09:30:00.000Z"); // => "18:30" (環境のTZに依存)
 */
export const extractTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
