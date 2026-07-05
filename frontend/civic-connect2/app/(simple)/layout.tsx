import BottomNav from "@/components/BottomNav";

export default function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
