"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Tag, Users, MessageSquare, Mail, Bell, LogOut, Globe,
  BrainCircuit, Layers, History, Share2, BarChart3, Plug, Settings, PenSquare, Megaphone
} from "lucide-react";
const logo = "/logo.png";

const SECTIONS = [
  {
    title: "Général",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: "/admin/articles", label: "Articles", icon: FileText },
      { href: "/admin/categories", label: "Catégories", icon: Tag },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
      { href: "/admin/commentaires", label: "Commentaires", icon: MessageSquare },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", icon: Bell },
      { href: "/admin/sponsors", label: "Sponsors", icon: Megaphone },
    ]
  },
  {
    title: "AI Hub",
    items: [
      { href: "/admin/ai-providers", label: "Fournisseurs d'IA", icon: BrainCircuit },
      { href: "/admin/ai-studio", label: "Studio de Publication", icon: PenSquare },
      { href: "/admin/ai-templates", label: "Templates", icon: Layers },
      { href: "/admin/ai-logs", label: "Logs IA", icon: History },
    ]
  },
  {
    title: "Publishing & Plugins",
    items: [
      { href: "/admin/publishing", label: "Auto Posting", icon: Share2 },
      { href: "/admin/plugins", label: "Extensions", icon: Plug },
    ]
  },
  {
    title: "Performance & Config",
    items: [
      { href: "/admin/analytics", label: "Analytics System", icon: BarChart3 },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ]
  }
];

interface AdminSidebarProps {
  collapsed?: boolean;
}

export function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  }

  return (
    <aside className={cn(
      "flex flex-col bg-[#0B1F3A] text-white sticky top-0 h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center justify-center px-4 py-5 border-b border-white/10", collapsed && "px-2")}>
        <img src={logo} alt="Sparkle" className="h-10 w-auto shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto scrollbar-hide">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed ? (
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-3 mb-1">
                {section.title}
              </div>
            ) : (
              <div className="border-b border-white/5 my-2" />
            )}
            {section.items.map(({ href, label, icon: Icon, exact }) => (
              <Link key={href} href={href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-medium",
                  isActive(href, exact) ? "bg-[#006FE6] text-white" : "text-white/60 hover:text-white hover:bg-white/10",
                  collapsed && "justify-center px-2"
                )}>
                  <Icon className="h-4.5 w-4.5 shrink-0" style={{ height: "1.1rem", width: "1.1rem" }} />
                  {!collapsed && label}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-2 border-t border-white/10 space-y-1">
        <Link href="/">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors",
            collapsed && "justify-center px-2"
          )}>
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && "Voir le site"}
          </div>
        </Link>

        {user && !collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mt-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-[#006FE6] text-white text-xs">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user.name}</div>
              <div className="text-[10px] text-white/40 truncate">{user.email}</div>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="text-white/40 hover:text-white transition-colors shrink-0">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
