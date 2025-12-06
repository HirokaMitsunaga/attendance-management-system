type LoadingProps = {
  message?: string;
};

export const Loading = ({ message = '読み込み中...' }: LoadingProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};
