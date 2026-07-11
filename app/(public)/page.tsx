import type { Metadata } from "next";
import { headers } from "next/headers";
import { HomePageContent } from "@/components/home/HomePageContent";
import { getHomePageData } from "@/lib/server-api";

const SITE_NAME = "Sparkle News";
const SITE_DESCRIPTION =
  "Decouvrez les dernieres actualites, tendances et analyses sur Sparkle News. Votre source d'information fiable au quotidien.";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Actualites et informations en temps reel`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const headerList = await headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host") ?? "localhost:3000";
  const origin = `${protocol}://${host}`;

  const { featuredArticles, popularArticles, latestArticles, categories } = await getHomePageData(origin);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: "/",
        inLanguage: "fr-FR",
      },
      {
        "@type": "ItemList",
        name: "A la une",
        itemListElement: featuredArticles.slice(0, 10).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `/article/${article.slug}`,
          name: article.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageContent
        featuredArticles={featuredArticles}
        popularArticles={popularArticles}
        latestArticles={latestArticles}
        categories={categories}
      />
    </>
  );
}
