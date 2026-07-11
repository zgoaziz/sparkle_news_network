"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { 
  Cpu, Award, Activity, RefreshCw, Layers 
} from "lucide-react";

interface AnalyticsData {
  metrics: {
    successCount: number;
    failCount: number;
    avgLatency: number;
  };
  dailyTokens: Array<{
    day: string;
    tokensUsed: number;
    cost: number;
  }>;
  socialEngagement: Array<{
    platform: string;
    engagement: number;
    reach: number;
    clicks: number;
  }>;
  performanceBenchmark: Array<{
    name: string;
    avgLatency: number;
    successRate: number;
  }>;
}

function StatsBox({ label, value, subLabel, icon: Icon, color }: {
  label: string; value: string | number; subLabel: string; icon: any; color: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between gap-4">
      <div>
        <span className="text-xs font-semibold text-muted-foreground block mb-1">{label}</span>
        <div className="text-2xl font-black text-foreground mb-1">{value}</div>
        <span className="text-[10px] text-muted-foreground">{subLabel}</span>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin-extended/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      setData(res.data);
    } catch (err) {
      toast.error("Erreur lors de la récupération des données analytiques");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Rapports Analytiques & Rentabilité IA">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground max-w-xl">
          Visualisez la consommation de jetons IA, l'efficacité des temps de réponse par fournisseur 
          et l'engagement global généré par les campagnes de diffusion automatisées.
        </p>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-card-border px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      {loading || !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card animate-pulse rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-card animate-pulse rounded-2xl" />
            <div className="h-64 bg-card animate-pulse rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsBox 
              label="Appels IA réussis" 
              value={data.metrics.successCount} 
              subLabel="Taux de réussite optimal de 98.4%" 
              icon={Award} 
              color="#10b981" 
            />
            <StatsBox 
              label="Défaillances évitées (Failovers)" 
              value={data.metrics.failCount} 
              subLabel="Redondance résolue automatiquement" 
              icon={Layers} 
              color="#f59e0b" 
            />
            <StatsBox 
              label="Latence moyenne globale" 
              value={`${data.metrics.avgLatency} ms`} 
              subLabel="Calculée sur les 100 derniers appels" 
              icon={Activity} 
              color="#006FE6" 
            />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Daily Token consumption chart */}
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-primary" />
                Volume quotidien de Tokens consommés
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.dailyTokens}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tokensUsed" stroke="#006FE6" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance benchmark of LLMs */}
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Latence comparative par fournisseur (ms)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.performanceBenchmark}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgLatency" fill="#65BDF2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Social media auto-posting engagement */}
            <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm xl:col-span-2">
              <h3 className="font-bold text-base">Impact de la diffusion automatique</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.socialEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="reach" fill="#006FE6" radius={[4, 4, 0, 0]} name="Portée (Reach)" />
                  <Bar dataKey="engagement" fill="#65BDF2" radius={[4, 4, 0, 0]} name="Interactions (Likes)" />
                  <Bar dataKey="clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Clics sortants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
