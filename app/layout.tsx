import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Sparkle News",
  description: "Plateforme d'actualités",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
