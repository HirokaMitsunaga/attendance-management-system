'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/contexts/UserContext';
import { BreadcrumbProvider } from '@/contexts/BreadcrumbContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type ProvidersProps = {
  children: React.ReactNode;
};

const ProvidersContent = ({ children }: ProvidersProps) => {
  return (
    <>
      <Toaster position="top-right" />
      <Header />
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      <Footer />
    </>
  );
};

export const Providers = ({ children }: ProvidersProps) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const isChunkError =
        errorMessage.includes('Failed to load chunk') ||
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Loading CSS chunk');

      if (isChunkError) {
        event.preventDefault();
        console.warn(
          'チャンク読み込みエラーを検出しました。ページを再読み込みします...',
        );
        setTimeout(() => {
          globalThis.window.location.reload();
        }, 100);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason) || '';
      const isChunkError =
        errorMessage.includes('Failed to load chunk') ||
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('Loading CSS chunk');

      if (isChunkError) {
        event.preventDefault();
        console.warn(
          'チャンク読み込みエラーを検出しました。ページを再読み込みします...',
        );
        setTimeout(() => {
          globalThis.window.location.reload();
        }, 100);
      }
    };

    globalThis.window.addEventListener('error', handleError);
    globalThis.window.addEventListener(
      'unhandledrejection',
      handleUnhandledRejection,
    );

    return () => {
      globalThis.window.removeEventListener('error', handleError);
      globalThis.window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, []);

  return (
    <UserProvider>
      <BreadcrumbProvider>
        <ProvidersContent>{children}</ProvidersContent>
      </BreadcrumbProvider>
    </UserProvider>
  );
};
