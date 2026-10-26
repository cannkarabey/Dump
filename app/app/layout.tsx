export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <div className="theme-dark flex min-h-dvh flex-1 flex-col bg-bg text-fg">{children}</div>;
}
