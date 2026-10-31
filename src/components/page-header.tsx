export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        {children && (
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
