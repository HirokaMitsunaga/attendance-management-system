'use client';

import Link from 'next/link';
import Image from 'next/image';

export const HeaderLogo = () => {
  // 日本語ファイル名をURLエンコード
  const logoPath = encodeURI('/クロネコアイコン2.svg');

  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Image
        src={logoPath}
        alt="Sample"
        width={100}
        height={100}
        loading="eager"
        priority
        className="object-contain w-10 h-10"
      />
    </Link>
  );
};
