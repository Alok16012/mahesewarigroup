import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>
      <Sidebar />
      <main className="flex-1 ml-[260px] min-h-screen overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
