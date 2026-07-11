"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { Plug, Settings, RefreshCw, ToggleLeft, ToggleRight, Check } from "lucide-react";

interface PluginModule {
  id: number;
  name: string;
  slug: string;
  version: string;
  isEnabled: boolean;
  config: any;
  hooksRegistered: string[];
}

export default function AdminPlugins() {
  const [plugins, setPlugins] = useState<PluginModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginModule | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configJson, setConfigJson] = useState("");

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin-extended/plugins", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      setPlugins(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des extensions (plugins)");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (p: PluginModule) => {
    try {
      const nextState = !p.isEnabled;
      await axios.post(`/api/admin-extended/plugins/${p.id}/toggle`, { isEnabled: nextState }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success(`Extension "${p.name}" ${nextState ? "activée" : "désactivée"}`);
      fetchPlugins();
    } catch (err) {
      toast.error("Erreur lors de la modification de l'état");
    }
  };

  const openConfig = (p: PluginModule) => {
    setSelectedPlugin(p);
    setConfigJson(JSON.stringify(p.config, null, 2));
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlugin) return;
    try {
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(configJson);
      } catch (err) {
        toast.error("Format JSON invalide");
        return;
      }

      await axios.put(`/api/admin-extended/plugins/${selectedPlugin.id}/config`, { config: parsedConfig }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Configuration sauvegardée");
      setShowConfigModal(false);
      fetchPlugins();
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    }
  };

  return (
    <AdminLayout title="Gestionnaire des extensions & Plugins">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground max-w-xl">
          Installez et configurez des extensions additionnelles pour votre plateforme de rédaction. 
          Les modules s'accrochent dynamiquement aux cycle de vie de vos articles.
        </p>

        <button
          onClick={fetchPlugins}
          disabled={loading}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-card-border px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recharger
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-44 bg-card border animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.map((p) => (
            <div 
              key={p.id} 
              className={`bg-card border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                p.isEnabled ? "border-card-border" : "border-card-border opacity-70 bg-card/60"
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      p.isEnabled ? "border-primary/20 bg-primary/10 text-primary" : "border-muted text-muted-foreground bg-muted/40"
                    }`}>
                      <Plug className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                      <span className="text-[10px] text-muted-foreground">Version {p.version}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(p)}
                    className={`transition-colors p-1 rounded ${
                      p.isEnabled ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {p.isEnabled ? (
                      <ToggleRight className="h-9 w-9 text-[#10b981]" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs text-muted-foreground font-semibold">Évènements surveillés (Hooks) :</div>
                  <div className="flex flex-wrap gap-1">
                    {p.hooksRegistered?.map((hook, i) => (
                      <span key={i} className="text-[10px] bg-muted border font-mono px-2 py-0.5 rounded text-muted-foreground">
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configure button */}
              <div className="border-t border-card-border/60 pt-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">Slug: {p.slug}</span>
                <button
                  disabled={!p.isEnabled}
                  onClick={() => openConfig(p)}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline disabled:opacity-30 disabled:no-underline"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configurer l'extension
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Config Editor Modal */}
      {showConfigModal && selectedPlugin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border max-w-md w-full rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-1">Paramètres : {selectedPlugin.name}</h3>
            <span className="text-[10px] text-muted-foreground font-mono block mb-4">slug: {selectedPlugin.slug}</span>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Configuration (Format JSON)</label>
                <textarea
                  required
                  rows={8}
                  value={configJson}
                  onChange={(e) => setConfigJson(e.target.value)}
                  className="w-full bg-[#0f172a] text-slate-100 border border-card-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#006FE6] text-white hover:bg-[#0052A3]"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
