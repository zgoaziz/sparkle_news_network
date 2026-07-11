import { Metadata } from 'next';
import ArticleDetailClient from './ArticleDetailClient';

async function getArticle(slug: string) {
  try {
    const apiBase = process.env.API_PUBLIC_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
    const url = apiBase ? `${apiBase}/api/articles/${slug}` : `/api/articles/${slug}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article introuvable | Sparkle News',
    };
  }

  return {
    title: `${article.title} | Sparkle News`,
    description: article.excerpt || article.seoDescription || "Lisez cet article sur Sparkle News",
    openGraph: {
      title: article.title,
      description: article.excerpt || article.seoDescription,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default function ArticlePage() {
  return <ArticleDetailClient />;
}
