import { DashRail } from "@/components/dashboard/DashRail";

/** Dashboard shell (My dumps, Templates). The editor has its own full-screen layout. */
export default function DashLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex h-dvh">
      <DashRail />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
