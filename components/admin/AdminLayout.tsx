"use client";
import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft, Menu, Bell, Check, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

function AdminContent({ children, title }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token") || ""}` }
      });
      if (!res.ok) return;
      const result = await res.json();
      if (Array.isArray(result)) {
        setNotifications(result);
      } else if (Array.isArray(result?.notifications)) {
        setNotifications(result.notifications);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/mark-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token") || ""}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F7FB] dark:bg-[#0a1525]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 h-screen">
        <AdminSidebar collapsed={collapsed} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-[#0B1F3A] border-b border-border px-4 py-3 flex items-center gap-3">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Desktop toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          {title && <h1 className="text-lg font-bold text-[#003B8F] dark:text-white flex-1">{title}</h1>}
          {!title && <div className="flex-1" />}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0B1F3A]"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="h-8 text-xs px-2 text-muted-foreground">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <div className="flex flex-col">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif._id} className={`p-3 border-b border-border last:border-0 flex flex-col gap-1 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.title}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-6 pt-6 pb-2 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !isAdmin)) {
      router.replace("/connexion");
    }
  }, [mounted, isAuthenticated, isAdmin, router]);

  // During SSR and first client render, show a neutral loading state
  // to avoid hydration mismatch (localStorage is not available on server)
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#F3F7FB] dark:bg-[#0a1525] items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <AdminContent title={title}>{children}</AdminContent>;
}
