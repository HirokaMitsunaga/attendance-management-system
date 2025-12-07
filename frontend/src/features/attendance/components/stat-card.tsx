type StatCardProps = {
  readonly label: string;
  readonly value: string | null;
  readonly placeholder?: string;
};

export const StatCard = ({ label, value, placeholder }: StatCardProps) => {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {value || placeholder}
      </p>
    </div>
  );
};
