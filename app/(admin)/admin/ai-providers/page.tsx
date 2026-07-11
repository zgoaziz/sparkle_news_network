"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { 
  Plus, Edit2, Trash2, Power, ArrowUp, ArrowDown, Key, Eye, EyeOff
} from "lucide-react";

interface AIProvider {
  id: number;
  name: string;
  providerType: string;
  apiKeyEncrypted: string;
  baseUrl: string | null;
  defaultModel: string;
  priority: number;
  isEnabled: boolean;
}

export default function AdminAIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  // Track which provider cards show their masked key
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  // Show/hide in modals
  const [showKeyInModal, setShowKeyInModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [providerType, setProviderType] = useState("openai");
  const [apiKeyEncrypted, setApiKeyEncrypted] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [defaultModel, setDefaultModel] = useState("");

  const toggleRevealKey = (id: number) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin-extended/ai-providers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      setProviders(res.data);
    } catch (err) {
      toast.error("Erreur lors de la récupération des fournisseurs d'IA");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (provider: AIProvider) => {
    try {
      const updated = { ...provider, isEnabled: !provider.isEnabled };
      await axios.put(`/api/admin-extended/ai-providers/${provider.id}`, updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success(`${provider.name} ${updated.isEnabled ? "activé" : "désactivé"}`);
      fetchProviders();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour de l'état");
    }
  };

  const handlePriorityChange = async (provider: AIProvider, direction: "up" | "down") => {
    const currentIndex = providers.findIndex((p) => p.id === provider.id);
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === providers.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetProvider = providers[swapIndex];

    try {
      const priorities = [
        { id: provider.id, priority: targetProvider.priority },
        { id: targetProvider.id, priority: provider.priority }
      ];
      await axios.put("/api/admin-extended/ai-providers/priority", { priorities }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      fetchProviders();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour des priorités");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin-extended/ai-providers", {
        name,
        providerType,
        apiKeyEncrypted,
        baseUrl: baseUrl || null,
        defaultModel,
        priority: providers.length + 1,
        isEnabled: true
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Fournisseur ajouté avec succès");
      setShowAddModal(false);
      resetForm();
      fetchProviders();
    } catch (err) {
      toast.error("Impossible d'ajouter le fournisseur");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      await axios.put(`/api/admin-extended/ai-providers/${selectedProvider.id}`, {
        name,
        providerType,
        apiKeyEncrypted,
        baseUrl: baseUrl || null,
        defaultModel
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Fournisseur mis à jour");
      setShowEditModal(false);
      resetForm();
      fetchProviders();
    } catch (err) {
      toast.error("Mise à jour impossible");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
    try {
      await axios.delete(`/api/admin-extended/ai-providers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Fournisseur supprimé");
      fetchProviders();
    } catch (err) {
      toast.error("Suppression impossible");
    }
  };

  const resetForm = () => {
    setName("");
    setProviderType("openai");
    setApiKeyEncrypted("");
    setBaseUrl("");
    setDefaultModel("");
    setSelectedProvider(null);
    setShowKeyInModal(false);
  };

  const openEdit = (p: AIProvider) => {
    setSelectedProvider(p);
    setName(p.name);
    setProviderType(p.providerType);
    setApiKeyEncrypted(p.apiKeyEncrypted);
    setBaseUrl(p.baseUrl || "");
    setDefaultModel(p.defaultModel);
    setShowEditModal(true);
  };

  return (
    <AdminLayout title="Fournisseurs d'Intelligence Artificielle">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground max-w-xl">
          Configurez vos clés d'API et gérez l'ordre de routage automatique. 
          Si un fournisseur de rang supérieur tombe en panne, le système basculera vers le suivant disponible.
        </p>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-[#006FE6] hover:bg-[#0052A3] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="h-4.5 w-4.5" />
          Ajouter un fournisseur
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card border animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p, index) => (
            <div 
              key={p.id} 
              className={`bg-card border rounded-2xl p-5 flex items-center justify-between gap-4 transition-all ${
                p.isEnabled ? "border-card-border" : "opacity-60 grayscale"
              }`}
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 items-center justify-center bg-muted w-10 h-16 rounded-xl border border-white/5">
                  <button 
                    disabled={index === 0}
                    onClick={() => handlePriorityChange(p, "up")}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold">{index + 1}</span>
                  <button 
                    disabled={index === providers.length - 1}
                    onClick={() => handlePriorityChange(p, "down")}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{p.name}</h3>
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      {p.providerType}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <div>Modèle par défaut: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{p.defaultModel}</span></div>
                    {p.baseUrl && <div className="truncate max-w-sm">Endpoint URL: <span className="font-mono text-[11px]">{p.baseUrl}</span></div>}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Key className="h-3 w-3 text-muted-foreground/60" />
                      <span className="font-mono text-[11px] tracking-wider">
                        {revealedKeys.has(p.id) 
                          ? p.apiKeyEncrypted 
                          : `${p.apiKeyEncrypted.slice(0, 6)}${'•'.repeat(Math.min(20, p.apiKeyEncrypted.length - 6))}`
                        }
                      </span>
                      <button
                        onClick={() => toggleRevealKey(p.id)}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        title={revealedKeys.has(p.id) ? "Masquer la clé" : "Révéler la clé"}
                      >
                        {revealedKeys.has(p.id) 
                          ? <EyeOff className="h-3 w-3" /> 
                          : <Eye className="h-3 w-3" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(p)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    p.isEnabled 
                      ? "border-[#10b981]/25 text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/25" 
                      : "border-gray-300 text-gray-500 bg-gray-100 hover:bg-gray-200"
                  }`}
                  title={p.isEnabled ? "Désactiver" : "Activer"}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2.5 rounded-xl border border-card-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2.5 rounded-xl border border-destructive/25 text-destructive bg-destructive/10 hover:bg-destructive/25 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border max-w-lg w-full rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Ajouter un nouveau fournisseur d'IA</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Nom personnalisé</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: OpenAI Prod, Claude 3.5 Backup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Type d'adaptateur</label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="openai">OpenAI (ChatGPT)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="groq">Groq (Llama)</option>
                    <option value="openrouter">OpenRouter Gateway</option>
                    <option value="custom">Custom API (Local LLM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Modèle par défaut</label>
                  <input
                    required
                    type="text"
                    placeholder="gpt-4o, claude-3-5-sonnet..."
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Clé d'API (ou FAIL pour tester le routage de secours)</label>
                <div className="relative">
                  <input
                    required
                    type={showKeyInModal ? "text" : "password"}
                    placeholder="Clé secrète d'API (ex: sk-...)"
                    value={apiKeyEncrypted}
                    onChange={(e) => setApiKeyEncrypted(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyInModal(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showKeyInModal ? "Masquer" : "Afficher"}
                  >
                    {showKeyInModal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Base URL (Optionnel)</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#006FE6] text-white hover:bg-[#0052A3]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-card-border max-w-lg w-full rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Modifier le fournisseur</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Nom personnalisé</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Type d'adaptateur</label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="openai">OpenAI (ChatGPT)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="groq">Groq (Llama)</option>
                    <option value="openrouter">OpenRouter Gateway</option>
                    <option value="custom">Custom API (Local LLM)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Modèle par défaut</label>
                  <input
                    required
                    type="text"
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Clé d'API (Laissez "FAIL" pour forcer la panne et tester le fallback)</label>
                <div className="relative">
                  <input
                    required
                    type={showKeyInModal ? "text" : "password"}
                    value={apiKeyEncrypted}
                    onChange={(e) => setApiKeyEncrypted(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyInModal(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showKeyInModal ? "Masquer" : "Afficher"}
                  >
                    {showKeyInModal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Base URL (Optionnel)</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#006FE6] text-white hover:bg-[#0052A3]"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
