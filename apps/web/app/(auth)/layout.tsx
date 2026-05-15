export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">TeamFlow</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Collaborative task command center</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Projects, team membership, assignments, status tracking, and analytics in one clean
            workspace.
          </p>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </main>
  );
}
