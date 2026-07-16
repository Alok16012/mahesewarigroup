import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>
      <Sidebar />
      {/* pt-14 on mobile = space for fixed top bar; lg:ml-[260px] = desktop sidebar offset */}
      <main className="flex-1 lg:ml-[260px] min-h-screen overflow-y-auto pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-5 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}
