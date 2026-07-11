import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingNews } from "@/components/BreakingNews";
import { CookieConsent } from "@/components/CookieConsent";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8FC] dark:bg-[#071A33]">
      <Header />
      <BreakingNews />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <CookieConsent />
    </div>
  );
}
