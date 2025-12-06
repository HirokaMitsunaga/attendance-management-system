type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageContainer = ({
  children,
  className = '',
}: PageContainerProps) => {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
      <div className={`max-w-7xl mx-auto flex-1 w-full py-4 px-4 ${className}`}>
        {children}
      </div>
    </div>
  );
};
