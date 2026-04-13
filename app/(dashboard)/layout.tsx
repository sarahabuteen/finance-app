import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-400 py-400 lg:px-500 lg:py-400 pb-[120px] md:pb-[120px] lg:pb-400 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
