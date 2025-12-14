'use client';
import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AttendanceCorrectionHistory } from './attendance-correction-history';
import {
  ATTENDANCE_CORRECTION_TYPE,
  AttendanceCorrectionType,
  isValidCorrectionType,
} from '../types/attendance-correction-type';
import { InputField } from './input-field';
import { SelectField } from './select-field';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/page-header';

export const AttendanceCorrection = () => {
  const [date, setDate] = useState('');
  const [correctionType, setCorrectionType] =
    useState<AttendanceCorrectionType>(
      ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value,
    );
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[v0] Form submitted:', {
      date,
      correctionType,
      clockIn,
      clockOut,
      reason,
    });
    // ここで申請処理を実装
  };

  //Selectボタンからだとundefinedの可能性があるため、チェックする
  const handleCorrectionTypeChange = (value: string) => {
    if (!isValidCorrectionType(value)) {
      // 開発者向け: コンソールにエラーを記録
      console.error(`不正な修正項目が選択されました: ${value}`);
      // ユーザー向け: 画面上で通知
      toast.error(`不正な修正項目が選択されました: ${value}`);
      // 不正な値で状態を更新しない
      return;
    }
    setCorrectionType(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="勤怠修正申請" href="/" />
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              打刻時間の修正申請
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              修正が必要な日付と時刻、修正理由を入力して申請してください。
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="date"
                label="対象日"
                type="date"
                value={date}
                onChange={setDate}
                required
                icon={Calendar}
                className="max-w-xs"
              />
              <SelectField
                id="correctionType"
                label="修正項目"
                value={correctionType}
                onChange={handleCorrectionTypeChange}
                options={Object.values(ATTENDANCE_CORRECTION_TYPE)}
                icon={Clock}
                className="max-w-xs"
              />

              {/* Time Inputs */}
              <div className="grid gap-6 sm:grid-cols-2">
                {correctionType ===
                  ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value && (
                  <InputField
                    id={ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value}
                    label={`修正後の${ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.label}`}
                    type="time"
                    value={clockIn}
                    onChange={setClockIn}
                    required
                    icon={Clock}
                    className="max-w-xs"
                  />
                )}
                {correctionType ===
                  ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value && (
                  <InputField
                    id={ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value}
                    label={`修正後の${ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.label}`}
                    type="time"
                    value={clockOut}
                    onChange={setClockOut}
                    required
                    currentValue="未打刻"
                    icon={Clock}
                  />
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">修正理由</Label>
                <Textarea
                  id="reason"
                  placeholder="修正が必要な理由を入力してください（例：打刻忘れ、システムエラー等）"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  承認者が確認するため、具体的な理由を記載してください。
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Link href="/" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    キャンセル
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 gap-2">
                  <FileText className="h-4 w-4" />
                  申請する
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <AttendanceCorrectionHistory />
      </main>
    </div>
  );
};
