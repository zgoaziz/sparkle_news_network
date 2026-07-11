"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { toast } from "sonner";
import { 
  Settings, Paintbrush, Shield, Key, FileText, Save, RefreshCw, Eye, EyeOff 
} from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("branding");
  const [saving, setSaving] = useState(false);

  // Branding Fields
  const [appName, setAppName] = useState("");
  const [themeColor, setThemeColor] = useState("#006FE6");
  const [logoUrl, setLogoUrl] = useState("");

  // General Fields
  const [locale, setLocale] = useState("fr");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Security Fields
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [ipWhitelist, setIpWhitelist] = useState("");

  // API Secrets mock visibility
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin-extended/settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      setSettings(res.data);
      
      // Seed local states
      if (res.data.branding) {
        setAppName(res.data.branding.appName || "");
        setThemeColor(res.data.branding.themeColor || "#006FE6");
        setLogoUrl(res.data.branding.logoUrl || "");
      }
      if (res.data.general) {
        setLocale(res.data.general.locale || "fr");
        setTimezone(res.data.general.timezone || "Europe/Paris");
        setItemsPerPage(res.data.general.itemsPerPage || 10);
      }
      if (res.data.security) {
        setTwoFactorEnabled(res.data.security.twoFactorEnabled || false);
        setSessionTimeout(res.data.security.sessionTimeout || 60);
        setIpWhitelist(res.data.security.ipWhitelist || "");
      }
    } catch (err) {
      toast.error("Erreur de récupération des configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      await axios.post(`/api/admin-extended/settings/${key}`, { value }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("sparkle_token")}` }
      });
      toast.success("Configurations enregistrées avec succès !");
      fetchSettings();
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const tabs = [
    { id: "branding", label: "Branding / Charte", icon: Paintbrush },
    { id: "general", label: "Général & Localisation", icon: FileText },
    { id: "security", label: "Sécurité & Accès", icon: Shield },
    { id: "api_keys", label: "Coffre-fort d'API", icon: Key },
  ];

  return (
    <AdminLayout title="Paramètres Généraux Système">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement de la configuration générale...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation vertical sidebar tabs */}
          <div className="lg:col-span-1 bg-card border rounded-2xl p-4 h-fit space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSelected 
                      ? "bg-primary text-white" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form details tab panels */}
          <div className="lg:col-span-3 bg-card border rounded-2xl p-6 shadow-sm">
            {activeTab === "branding" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Charte graphique et Branding</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Personnalisez le logo de l'application et l'apparence générale.</p>
                </div>
                <hr />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Nom de la Plateforme (App Name)</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Couleur d'accentuation principale</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="h-9 w-10 p-0 border-0 bg-transparent cursor-pointer rounded"
                        />
                        <input
                          type="text"
                          value={themeColor}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">URL du Logo corporatif (Optionnel)</label>
                    <input
                      type="text"
                      placeholder="https://mon-domaine.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => handleSave("branding", { appName, themeColor, logoUrl })}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-4.5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer la charte
                  </button>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Localisation et Pagination</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Modifiez les préférences de fuseau horaire et de langue par défaut.</p>
                </div>
                <hr />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Langue par défaut</label>
                      <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                        className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="fr">Français (French)</option>
                        <option value="en">English (Anglais)</option>
                        <option value="es">Español (Espagnol)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Fuseau horaire (Timezone)</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Éléments par page par défaut (Dashboard)</label>
                    <input
                      type="number"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    onClick={() => handleSave("general", { locale, timezone, itemsPerPage })}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-4.5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Sauvegarder les configurations
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Paramètres de sécurité</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Renforcez le contrôle d'accès au panel d'administration.</p>
                </div>
                <hr />

                <div className="space-y-4">
                  <div className="flex items-center justify-between border rounded-xl p-3 bg-muted/20">
                    <div>
                      <div className="font-semibold text-sm">Authentification à 2 Facteurs (2FA)</div>
                      <div className="text-[10px] text-muted-foreground">Exiger une validation par code d'authentification à la connexion.</div>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`h-6 w-11 rounded-full p-1 transition-colors ${twoFactorEnabled ? "bg-[#10b981]" : "bg-gray-300"}`}
                    >
                      <div className={`h-4 w-4 bg-white rounded-full transition-transform ${twoFactorEnabled ? "translate-x-5" : ""}`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Expiration de session (minutes)</label>
                    <input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                      className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Adresses IP autorisées (IP Whitelist - séparées par des virgules)</label>
                    <input
                      type="text"
                      placeholder="127.0.0.1, 192.168.1.1 (Laisser vide pour désactiver)"
                      value={ipWhitelist}
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-sm font-mono text-[11px]"
                    />
                  </div>

                  <button
                    onClick={() => handleSave("security", { twoFactorEnabled, sessionTimeout, ipWhitelist })}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#006FE6] hover:bg-[#0052A3] text-white text-xs px-4.5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Appliquer la sécurité
                  </button>
                </div>
              </div>
            )}

            {activeTab === "api_keys" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Coffre-fort des clés d'API tierces</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clés secrètes utilisées par vos intégrations de diffusion et de logs. 
                    Les valeurs sont chiffrées au repos via clé maître.
                  </p>
                </div>
                <hr />

                <div className="space-y-4">
                  {[
                    { id: "meta", label: "Meta Graph API (Facebook / Instagram Token)", placeholder: "EAABw..." },
                    { id: "linkedin", label: "LinkedIn Share API Client Secret", placeholder: "li-sec-..." },
                    { id: "sendgrid", label: "SendGrid / SMTP API Secret Token", placeholder: "SG.key-..." }
                  ].map((keyItem) => {
                    const isVisible = showKeys[keyItem.id] || false;
                    return (
                      <div key={keyItem.id}>
                        <label className="text-xs font-semibold block mb-1">{keyItem.label}</label>
                        <div className="relative">
                          <input
                            type={isVisible ? "text" : "password"}
                            placeholder={keyItem.placeholder}
                            value={settings?.api_keys?.[keyItem.id] || "••••••••••••••••••••••••••••••••••••"}
                            disabled
                            className="w-full bg-muted border border-card-border rounded-xl pl-3 pr-10 py-2 text-sm font-mono text-[11px] text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(keyItem.id)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-4 rounded-xl leading-relaxed">
                    💡 <strong>Note de l'architecte :</strong> Pour ajouter ou modifier des clés de fournisseur de modèles IA,
                    rendez-vous directement sur l'onglet <a href="/admin/ai-providers" className="font-bold underline hover:text-[#c27e07]">Fournisseurs d'IA</a> pour configurer le Smart Fallback routing.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
