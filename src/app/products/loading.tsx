export default function ProductsLoading() {
  return (
    <div className="container-page py-10 lg:py-14" aria-busy="true">
      <p className="sr-only">Memuat katalog…</p>

      <div className="h-3 w-32 animate-pulse rounded bg-surface-2" />
      <div className="mt-7 h-9 w-64 animate-pulse rounded bg-surface-2" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden h-[30rem] animate-pulse rounded-2xl border border-border bg-surface lg:block" />

        <div>
          <div className="h-4 w-48 animate-pulse rounded bg-surface-2" />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="aspect-square animate-pulse bg-surface-2" />
                <div className="space-y-3 p-4">
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-2" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                  <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
                  <div className="h-5 w-1/2 animate-pulse rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
