"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateMyProfile } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ChevronLeft, Save } from "lucide-react";

function ProtectedProfile() {
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateMyProfile();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ data: { name, avatar: avatar || undefined } }, {
      onSuccess: (res: any) => {
        // Handle both axios responses and direct data structures
        const updated = res?.data || res;
        if (updated && (updated.id || updated._id)) updateUser(updated);
        toast.success("Profil mis à jour !");
      },
      onError: () => toast.error("Erreur lors de la mise à jour"),
    });
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft className="h-4 w-4" /> Mon espace
      </Link>

      <h1 className="text-3xl font-black mb-8 text-[#003B8F] dark:text-white">Modifier mon profil</h1>

      <div className="bg-card border border-card-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <Avatar className="h-16 w-16 ring-4 ring-[#006FE6]/20">
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback className="bg-[#006FE6] text-white text-xl font-black">
              {name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name || "Votre nom"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input id="email" value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar">Image de profil</Label>
            <div className="flex items-center gap-4">
              {avatar && (
                <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-border" />
              )}
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatar(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="sparkle-gradient text-white border-0 hover:opacity-90" disabled={updateProfile.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  if (!isAuthenticated) {
    router.push("/connexion");
    return null;
  }
  return <ProtectedProfile />;
}
