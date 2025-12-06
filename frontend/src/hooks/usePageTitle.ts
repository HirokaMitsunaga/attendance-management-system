import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * ページタイトルを設定する関数
 * フックではなく、直接呼び出し可能な関数として実装
 * @param title ページタイトル（例: "ユーザー管理"）
 */
export const setPageTitle = (title: string) => {
  if (typeof document !== 'undefined') {
    const fullTitle = title ? `Sample App | ${title}` : 'Sample App';
    document.title = fullTitle;
  }
};

/**
 * ページタイトルを設定するカスタムフック
 * @param title ページタイトル（例: "ユーザー管理"）
 */
export const usePageTitle = (title: string) => {
  const titleRef = useRef(title);

  // useLayoutEffectで、DOM更新前にタイトルを設定（確実に表示される）
  useLayoutEffect(() => {
    titleRef.current = title;
    const fullTitle = title ? `Sample App | ${title}` : 'Sample App';
    document.title = fullTitle;
  }, [title]);

  // useEffectでも設定（念のため、タイミングの問題を回避）
  useEffect(() => {
    titleRef.current = title;
    const fullTitle = title ? `Sample App | ${title}` : 'Sample App';
    document.title = fullTitle;

    // 定期的にタイトルをチェックして、変更されていたら再設定
    const intervalId = setInterval(() => {
      const expectedTitle = titleRef.current
        ? `Sample App | ${titleRef.current}`
        : 'Sample App';
      if (document.title !== expectedTitle) {
        document.title = expectedTitle;
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [title]);
};
