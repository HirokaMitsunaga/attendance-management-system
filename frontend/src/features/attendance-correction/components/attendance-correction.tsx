'use client';

import type React from 'react';

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AttendanceCorrection() {
  const [date, setDate] = useState('');
  const [correctionType, setCorrectionType] = useState<
    'clockIn' | 'clockOut' | 'both'
  >('both');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            勤怠修正申請
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  対象日
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="correctionType"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  修正項目
                </Label>
                <Select
                  value={correctionType}
                  onValueChange={(value) =>
                    setCorrectionType(value as 'clockIn' | 'clockOut' | 'both')
                  }
                >
                  <SelectTrigger id="correctionType" className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clockIn">出勤時刻のみ</SelectItem>
                    <SelectItem value="clockOut">退勤時刻のみ</SelectItem>
                    <SelectItem value="both">出勤・退勤時刻の両方</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Inputs */}
              <div className="grid gap-6 sm:grid-cols-2">
                {(correctionType === 'clockIn' ||
                  correctionType === 'both') && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="clockIn"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      修正後の出勤時刻
                    </Label>
                    <Input
                      id="clockIn"
                      type="time"
                      value={clockIn}
                      onChange={(e) => setClockIn(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">現在: 09:02</p>
                  </div>
                )}

                {(correctionType === 'clockOut' ||
                  correctionType === 'both') && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="clockOut"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      修正後の退勤時刻
                    </Label>
                    <Input
                      id="clockOut"
                      type="time"
                      value={clockOut}
                      onChange={(e) => setClockOut(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      現在: 未打刻
                    </p>
                  </div>
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

              {/* Info Box */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                  <FileText className="h-4 w-4" />
                  申請について
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>・申請後、承認者による承認が必要です</li>
                  <li>・承認されるまで勤怠データは更新されません</li>
                  <li>・申請状況はダッシュボードで確認できます</li>
                </ul>
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

        {/* Recent Requests */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">申請履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  date: '2025/01/04',
                  time: '09:15 → 09:00',
                  status: '承認' as const,
                  reason: '電車の遅延により遅刻',
                },
                {
                  date: '2025/01/02',
                  time: '09:30 → 09:00',
                  status: '申請中' as const,
                  reason: '打刻忘れ',
                },
                {
                  date: '2025/01/01',
                  time: '18:00 → 19:30',
                  status: '却下' as const,
                  reason: '理由が不明確',
                },
              ].map((request, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">
                        {request.date}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          request.status === '承認'
                            ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                            : request.status === '申請中'
                              ? 'bg-amber-500/15 text-amber-600 border-amber-500/20'
                              : 'bg-destructive/15 text-destructive border-destructive/20'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
