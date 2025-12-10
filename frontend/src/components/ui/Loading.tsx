export const Loading = ({
  message = '読み込み中...',
}: {
  readonly message?: string;
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
