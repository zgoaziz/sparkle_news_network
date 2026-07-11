"use client";
import { useState } from "react";
import { useSubmitContact } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const submitContact = useSubmitContact();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitContact.mutate({ data: form }, {
      onSuccess: () => setSent(true),
      onError: () => toast.error("Erreur lors de l'envoi du message"),
    });
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-[#003B8F] dark:text-white">Nous contacter</h1>
        <p className="text-muted-foreground">Une question, une suggestion ou un partenariat ? Nous sommes à votre écoute.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            {[
              { Icon: Mail, title: "Email", lines: ["contact@sparklenews.fr", "redaction@sparklenews.fr"] },
              { Icon: Phone, title: "Téléphone", lines: ["+33 1 23 45 67 89", "Lun-Ven, 9h-18h"] },
              { Icon: MapPin, title: "Adresse", lines: ["12 Rue de la Presse", "75001 Paris, France"] },
            ].map(({ Icon, title, lines }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 sparkle-gradient rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  {lines.map((l) => <p key={l} className="text-muted-foreground text-sm">{l}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Message envoyé !</h2>
              <p className="text-muted-foreground mb-6">Nous vous répondrons dans les plus brefs délais.</p>
              <Button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} variant="outline">
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@example.com" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Objet de votre message" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Votre message..." required className="min-h-[160px] resize-none" />
              </div>
              <Button type="submit" className="sparkle-gradient text-white border-0 hover:opacity-90 px-8" disabled={submitContact.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {submitContact.isPending ? "Envoi..." : "Envoyer le message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
