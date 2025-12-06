type FormErrorProps = {
  error: string | null;
};

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-800 text-sm whitespace-pre-line">{error}</p>
    </div>
  );
};
