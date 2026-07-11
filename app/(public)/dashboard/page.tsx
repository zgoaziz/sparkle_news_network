"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyFavorites, useGetReadingHistory, useRemoveFavorite, getGetMyFavoritesQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { ArticleCard } from "@/components/ArticleCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Bookmark, Clock, Settings, Heart, LogOut, Link } from "lucide-react";

function ProtectedDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: favoritesData, isLoading: favLoading } = useGetMyFavorites();
  const { data: historyData, isLoading: histLoading } = useGetReadingHistory();
  const removeFavorite = useRemoveFavorite();

  const favorites = (favoritesData as any)?.articles || (favoritesData as any)?.data || (Array.isArray(favoritesData) ? favoritesData : []);
  const history = (historyData as any)?.articles || (historyData as any)?.data || (Array.isArray(historyData) ? historyData : []);

  function handleRemoveFavorite(articleId: number) {
    removeFavorite.mutate({ articleId }, {
      onSuccess: () => {
        toast.success("Retiré des favoris");
        queryClient.invalidateQueries({ queryKey: getGetMyFavoritesQueryKey() });
      },
    });
  }

  function handleLogout() {
    logout();
    router.push("/");
    toast.success("Déconnexion réussie");
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-[#006FE6]/20">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-[#006FE6] text-white text-2xl font-black">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <Badge className="w-fit mx-auto sm:mx-0" style={{ backgroundColor: user?.role === "admin" ? "#003B8F" : user?.role === "editor" ? "#006FE6" : "#65BDF2", color: "white" }}>
              {user?.role === "admin" ? "Administrateur" : user?.role === "editor" ? "Éditeur" : "Lecteur"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{user?.email}</p>
          {user?.createdAt && (
            <p className="text-xs text-muted-foreground">Membre depuis {format(new Date(user.createdAt), "MMMM yyyy", { locale: fr })}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profil")}>
            <Settings className="h-4 w-4 mr-1.5" /> Modifier
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-1.5" /> Déconnexion
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites">
        <TabsList className="mb-6">
          <TabsTrigger value="favorites" className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4" /> Favoris
            {favorites.length > 0 && <span className="text-xs bg-[#006FE6] text-white px-1.5 py-0.5 rounded-full">{favorites.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium mb-2">Aucun article sauvegardé</p>
              <p className="text-sm mb-4">Sauvegardez des articles pour les retrouver ici</p>
              <Button onClick={() => router.push("/actualites")} className="sparkle-gradient text-white border-0">Explorer les actualités</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map((article: any) => (
                <div key={article.id} className="relative group">
                  <ArticleCard article={article} variant="default" />
                  <button
                    onClick={() => handleRemoveFavorite(article.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-black/70 rounded-lg p-1.5 text-destructive hover:bg-red-50 transition-all"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {histLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium mb-2">Aucun article lu récemment</p>
              <Button onClick={() => router.push("/actualites")} className="sparkle-gradient text-white border-0">Découvrir des articles</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((article: any) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/connexion");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return null; // Return null on server and first client render to avoid hydration mismatch
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedDashboard />;
}
