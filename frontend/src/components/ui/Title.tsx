type TitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const Title = ({ children, className = '' }: TitleProps) => {
  return (
    <h1 className={`text-2xl font-bold my-4 text-gray-900 ${className}`}>
      {children}
    </h1>
  );
};
