import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-gray-400 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            ページが見つかりません
          </h2>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-600">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="block w-full max-w-xs bg-blue-600 text-white font-medium rounded-md px-4 py-2 text-base hover:bg-blue-700 transition-colors text-center"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
