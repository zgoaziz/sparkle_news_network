"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useListCategories, useGetSponsors } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Search, Menu, Moon, Sun, LogOut, User, LayoutDashboard, Settings, UserCircle2, Linkedin, Facebook, Instagram, Youtube, ChevronRight } from "lucide-react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { data: categoriesData } = useListCategories();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: sponsorsData } = useGetSponsors("navbar");
  const navbarSponsors = Array.isArray(sponsorsData) ? sponsorsData.filter((s) => s.isActive) : [];

  const categories = (categoriesData as any)?.categories || (categoriesData as any)?.data || (Array.isArray(categoriesData) ? categoriesData : []);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => {
      const isScrolled = window.scrollY > 4;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function toggleDark() {
    setDarkMode((d) => { document.documentElement.classList.toggle("dark", !d); return !d; });
  }
  function handleLogout() { logout(); router.push("/"); }

  const staticTopText = "Decouvrez la nouvelle offre fibre a -50% ! | Code PROMO : SPARKLE24 | Partenaire officiel des JO 2024.";
  // Build ticker items: sponsors first, then static text
  const tickerItems: { text: string; href?: string }[] = [
    ...navbarSponsors.map((s) => ({ text: `🎯 ${s.name} — ${s.content}`, href: s.linkUrl || undefined })),
    { text: staticTopText },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "shadow-lg" : ""}`}>
      
      {/* ── TOP UTILITY BAR (White background) ──────────────── */}
      <div className="bg-white dark:bg-[#071A33] text-foreground h-9 text-[11px] font-semibold hidden md:block border-b border-border/40">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
          
          {/* LEFT: Date */}
          <div className="flex-1 flex items-center text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          
          {/* CENTER: Scrolling text with fade edges */}
          <div className="flex-[2] h-full flex items-center relative overflow-hidden">
            {/* Fade Left */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#071A33] to-transparent z-10" />
            
            <div className="flex-1 overflow-hidden relative flex items-center h-full">
              <div className="animate-ticker whitespace-nowrap text-[#003B8F] dark:text-[#65BDF2] flex items-center gap-10">
                {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline cursor-pointer"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span key={i}>{item.text}</span>
                  )
                )}
              </div>
            </div>
            
            {/* Fade Right */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#071A33] to-transparent z-10" />
          </div>

          {/* RIGHT: Socials */}
          <div className="flex-1 flex items-center justify-end gap-4 text-muted-foreground">
            <span className="opacity-80">Suivez-nous :</span>
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/company/sparkle-news-network/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Sparkle News" className="hover:text-[#006FE6] transition-colors"><Linkedin className="h-3.5 w-3.5" /></a>
              <a href="https://www.facebook.com/profile.php?id=61557477545725" target="_blank" rel="noopener noreferrer" aria-label="Facebook Sparkle News" className="hover:text-[#006FE6] transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
              <a href="https://www.instagram.com/sparklenewsnetwork/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Sparkle News" className="hover:text-[#006FE6] transition-colors"><Instagram className="h-3.5 w-3.5" /></a>
              <a href="https://www.linkedin.com/company/sparkle-news-network/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="YouTube Sparkle News" className="hover:text-[#006FE6] transition-colors"><Youtube className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER (The blue bar) ─────────────────────── */}
      <div className="bg-[#003B8F] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-[80px] lg:h-[96px] flex items-center justify-between">
          
          {/* LEFT: Menu + Search */}
          <div className="flex items-center gap-3 flex-1">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 border border-white/40 hover:bg-white/10 hover:border-white rounded-full px-4 py-2 transition-all">
                  <Menu className="h-5 w-5" />
                  <span className="text-sm font-bold hidden sm:block">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] bg-gradient-to-b from-[#003B8F] via-[#003B8F] to-[#071A33] text-white border-r-0 p-0 flex flex-col h-full shadow-2xl">
                <SheetTitle className="sr-only">Menu principal</SheetTitle>
                
                {/* Menu Header */}
                <div className="p-4 shrink-0" />

                {/* Menu Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
                  <div className="flex flex-col gap-2 mb-8">
                    {["/", "/actualites", "/a-propos", "/contact"].map((href, i) => {
                      const labels = ["Accueil", "A la une", "À propos", "Contact"];
                      const isActive = pathname === href;
                      return (
                        <Link key={href} href={href} onClick={() => setMobileOpen(false)} prefetch={false}
                          className={`px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between group ${isActive ? "bg-white text-[#003B8F] shadow-md" : "bg-white/8 text-white/90 hover:bg-white/12 hover:text-white"}`}>
                          {labels[i]}
                          <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "text-[#003B8F]" : "text-white/50 group-hover:text-white group-hover:translate-x-1"}`} />
                        </Link>
                      );
                    })}
                  </div>
                  
                  {categories.length > 0 && (
                    <>
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-3 ml-2">Rubriques</div>
                      <div className="flex flex-col gap-1.5">
                        {categories.map((cat: any) => (
                          <Link key={cat.id} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)} prefetch={false}
                            className="px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-3 group bg-white/5 hover:bg-white/10 font-semibold text-white/85 hover:text-white">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color || "#006FE6" }} />
                            <span className="flex-1">{cat.name}</span>
                            <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Menu Footer */}
                {!isAuthenticated && (
                  <div className="p-4 bg-black/10 border-t border-white/10 shrink-0">
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="w-full h-11 rounded-xl bg-white text-[#003B8F] hover:bg-white/90 font-bold border-white" asChild>
                        <Link href="/connexion" onClick={() => setMobileOpen(false)} prefetch={false}>Connexion</Link>
                      </Button>
                      <Button className="w-full h-11 rounded-xl bg-[#006FE6] hover:bg-[#0059BC] text-white border-0 font-bold shadow-lg" asChild>
                        <Link href="/inscription" onClick={() => setMobileOpen(false)} prefetch={false}>S'inscrire</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Desktop Search Bar */}
            <HeaderSearch />
          </div>

          {/* CENTER: Logo */}
          <div className="flex justify-center shrink-0">
            <Link href="/" className="flex items-center group">
              <img src="/logo.png" alt="Sparkle News Logo" className="h-20 lg:h-28 w-auto object-contain scale-[1.15]" />
            </Link>
          </div>

          {/* RIGHT: Actions & User */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            <button onClick={toggleDark} className="p-2.5 rounded-full hover:bg-white/10 transition-colors hidden sm:block">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {!mounted ? (
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center rounded-full hover:bg-white/10 p-1.5 transition-all">
                    {user?.avatar ? (
                      <Avatar className="h-9 w-9 ring-2 ring-white/20">
                        <AvatarImage src={user.avatar} />
                      </Avatar>
                    ) : (
                      <UserCircle2 className="h-8 w-8" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <div className="px-2 py-2 mb-2 border-b border-border">
                    <div className="font-bold text-sm">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium">
                      <Link href="/admin" prefetch={false}>
                        <Settings className="h-4 w-4 mr-2" /> Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium">
                    <Link href="/dashboard" prefetch={false}>
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Mon espace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium">
                    <Link href="/dashboard/profil" prefetch={false}>
                      <User className="h-4 w-4 mr-2" /> Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive font-medium"><LogOut className="h-4 w-4 mr-2" /> Deconnexion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3">
                <Link href="/connexion" className="text-[11px] sm:text-sm font-bold hover:text-white/80 transition-colors">Connexion</Link>
                <span className="text-white/30 hidden sm:inline">|</span>
                <Link href="/inscription" className="text-[11px] sm:text-sm font-bold hover:bg-white hover:text-[#003B8F] transition-colors border-2 border-white/40 hover:border-white px-4 py-1.5 rounded-full hidden sm:inline-block">S'inscrire</Link>
                <Link href="/connexion" className="sm:hidden flex items-center justify-center rounded-full hover:bg-white/10 p-2 ml-1 transition-all">
                  <UserCircle2 className="h-7 w-7" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY NAV BAR (White/Dark bar below) ────────────── */}
      <nav className="bg-white dark:bg-[#071A33] border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center sm:justify-start h-[44px]">
          <div className="flex items-stretch overflow-x-auto scrollbar-hide h-full gap-2 w-full">
            <Link href="/actualites" prefetch={false}
              className={`shrink-0 px-3 flex items-center text-[11px] sm:text-xs font-black uppercase tracking-wider transition-colors border-b-[3px] ${pathname === "/actualites" ? "border-[#003B8F] text-[#003B8F] dark:border-white dark:text-white" : "border-transparent text-foreground/70 hover:text-[#003B8F] dark:hover:text-white"}`}>
              A la une
            </Link>
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} prefetch={false}
                className={`shrink-0 px-3 flex items-center text-[11px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-b-[3px] ${pathname === `/categories/${cat.slug}` ? "border-[#003B8F] text-[#003B8F] dark:border-white dark:text-white" : "border-transparent text-foreground/65 hover:text-[#003B8F] dark:hover:text-white"}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeaderSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <form onSubmit={handleSearch} className="hidden md:flex relative group">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher..."
        className="w-48 lg:w-64 h-10 bg-black/10 border-white/20 text-white placeholder:text-white/60 rounded-full pl-4 pr-10 focus:border-white focus:bg-white/10 transition-all shadow-inner"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
        <Search className="h-4 w-4 text-white/70 group-focus-within:text-white transition-colors" />
      </button>
    </form>
  );
}
