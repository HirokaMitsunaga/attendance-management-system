export const formatDateToJST = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDateToISOString = (date?: Date | string): string => {
  const dateObj = date
    ? typeof date === 'string'
      ? new Date(date)
      : date
    : new Date();
  return dateObj.toISOString().split('T')[0];
};

export const formatDateTimeToLocal = (date?: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatTimeFromDateTime = (dateTime?: Date | string): string => {
  if (!dateTime) return '';
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatTimeToLocal = (time?: string): string => {
  if (!time) return '';
  return time;
};

export const combineDateAndTime = (
  date: string,
  time: string,
): string | null => {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
};

export const formatCurrentDateToJST = (): string => {
  const now = new Date();
  return now.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
};

/**
 * datetime-local形式の文字列をISO形式のDateTime文字列に変換
 * @param dateTimeLocal - datetime-local形式の文字列 (例: "2024-01-01T10:00")
 * @returns ISO形式のDateTime文字列 (例: "2024-01-01T10:00:00")
 */
export const convertDateTimeLocalToISO = (
  dateTimeLocal?: string,
): string | null => {
  if (!dateTimeLocal) return null;
  // datetime-local形式は "YYYY-MM-DDTHH:mm" なので、秒を追加してISO形式に変換
  return `${dateTimeLocal}:00`;
};
