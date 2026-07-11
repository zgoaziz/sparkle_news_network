"use client";
import { useGetAdminStats } from "@/lib/api-client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  FileText, Users, MessageSquare, Eye, TrendingUp, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-4.5 w-4.5" style={{ color, height: "1.1rem", width: "1.1rem" }} />
        </div>
      </div>
      <div className="text-3xl font-black mb-1">{typeof value === "number" ? value.toLocaleString("fr") : value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStats();
  const stats = (data as any)?.stats || data;

  const categoryChartData = stats?.articlesByCategory?.map((c: any) => ({
    name: c.categoryName?.length > 10 ? c.categoryName.slice(0, 10) + "…" : c.categoryName,
    articles: c.count || c.articles || 0,
  })) || [];

  const topArticlesData = stats?.viewsByArticle?.slice(0, 6).map((a: any) => ({
    name: a.title?.length > 15 ? a.title.slice(0, 15) + "…" : a.title,
    vues: a.views || 0,
  })) || [];

  return (
    <AdminLayout title="Tableau de bord">
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Articles publiés" value={stats?.publishedArticles || 0} icon={CheckCircle} color="#006FE6" sub={`${stats?.totalArticles || 0} au total`} />
            <StatCard label="Brouillons" value={stats?.draftArticles || 0} icon={Clock} color="#65BDF2" />
            <StatCard label="Utilisateurs" value={stats?.totalUsers || 0} icon={Users} color="#003B8F" />
            <StatCard label="Catégories" value={stats?.totalCategories || 0} icon={FileText} color="#006FE6" />
            <StatCard label="Commentaires" value={stats?.totalComments || 0} icon={MessageSquare} color="#65BDF2" sub={`${stats?.pendingComments || 0} en attente`} />
            <StatCard label="Vues totales" value={stats?.totalViews || 0} icon={Eye} color="#003B8F" />
            <StatCard label="En attente" value={stats?.pendingComments || 0} icon={AlertCircle} color="#f59e0b" />
            <StatCard label="Tendance" value={"+24%"} icon={TrendingUp} color="#10b981" sub="ce mois-ci" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {categoryChartData.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-bold mb-4">Articles par catégorie</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="articles" fill="#006FE6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topArticlesData.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-bold mb-4">Top articles (vues)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topArticlesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="vues" fill="#65BDF2" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent articles + users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.recentArticles?.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Articles récents</h3>
                  <Link href="/admin/articles" className="text-xs text-[#006FE6] hover:text-[#003B8F]">Voir tout</Link>
                </div>
                <div className="space-y-3">
                  {stats.recentArticles.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.publishedAt ? format(new Date(a.publishedAt), "d MMM yyyy", { locale: fr }) : "Non publié"}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {a.status === "published" ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats?.recentUsers?.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Nouveaux utilisateurs</h3>
                  <Link href="/admin/utilisateurs" className="text-xs text-[#006FE6] hover:text-[#003B8F]">Voir tout</Link>
                </div>
                <div className="space-y-3">
                  {stats.recentUsers.slice(0, 5).map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#006FE6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {u.createdAt ? format(new Date(u.createdAt), "d MMM", { locale: fr }) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
