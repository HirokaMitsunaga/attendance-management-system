'use client';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AttendanceCorrectionHistory } from '@/features/attendance-correction/components/attendance-correction-history';
import { ATTENDANCE_CORRECTION_TYPE } from '@/features/attendance-correction/types/attendance-correction-type';
import { InputField } from '@/components/form/input-field';
import { SelectField } from '@/components/form/select-field';
import {
  AttendanceCorrectionFormData,
  AttendanceCorrectionSchema,
} from '../schema/attendance-correction-schema';
import { PageHeader } from '@/components/layout/page-header';

export const AttendanceCorrection = () => {
  const methods = useForm<AttendanceCorrectionFormData>({
    resolver: zodResolver(AttendanceCorrectionSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      correctionType: ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value,
    },
  });

  const { watch } = methods;
  const correctionType = watch('correctionType');

  const onSubmit = () => {
    console.log('勤怠修正ボタンが押されました。');
    // ここで申請処理を実装
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
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <InputField
                  name="date"
                  label="対象日"
                  type="date"
                  icon={Calendar}
                  className="max-w-xs"
                />
                <SelectField
                  name="correctionType"
                  label="修正項目"
                  options={Object.values(ATTENDANCE_CORRECTION_TYPE)}
                  icon={Clock}
                  className="max-w-xs"
                />

                {/* Time Inputs */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {correctionType ===
                    ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value && (
                    <InputField
                      name="time"
                      label={`修正後の${ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.label}`}
                      type="time"
                      icon={Clock}
                      className="max-w-xs"
                    />
                  )}
                  {correctionType ===
                    ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value && (
                    <InputField
                      name="time"
                      label={`修正後の${ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.label}`}
                      type="time"
                      icon={Clock}
                      className="max-w-xs"
                    />
                  )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">修正理由</Label>
                  <Textarea
                    id="reason"
                    placeholder="修正が必要な理由を入力してください（例：打刻忘れ、システムエラー等）"
                    rows={4}
                    className="resize-none"
                    {...methods.register('reason')}
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
            </FormProvider>
          </CardContent>
        </Card>
        <AttendanceCorrectionHistory />
      </main>
    </div>
  );
};
