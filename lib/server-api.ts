import type {
  ArticleListResponse,
  ArticleSummary,
  Category,
} from "@/lib/api-client";

const DEFAULT_REVALIDATE = 60;

function resolveApiBase(baseUrl?: string) {
  if (baseUrl) {
    return baseUrl;
  }

  const fromEnv =
    process.env.API_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL;

  if (fromEnv) {
    return fromEnv;
  }

  return typeof window !== "undefined"
    ? window.location.origin
    : "http://127.0.0.1:3000";
}

async function serverFetch<T>(
  path: string,
  revalidate = DEFAULT_REVALIDATE,
  baseUrl?: string,
): Promise<T | null> {
  try {
    const apiBase = resolveApiBase(baseUrl);
    const url = new URL(path, apiBase.endsWith("/") ? apiBase : `${apiBase}/`);

    const res = await fetch(url, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch (err) {
    console.error("serverFetch error", err);
    return null;
  }
}

export async function getFeaturedArticles(
  baseUrl?: string,
): Promise<ArticleSummary[]> {
  const data = await serverFetch<ArticleSummary[]>(
    "/api/articles/featured",
    DEFAULT_REVALIDATE,
    baseUrl,
  );

  if (Array.isArray(data) && data.length > 0) {
    return data;
  }

  const fallback = await serverFetch<ArticleListResponse>(
    "/api/articles?limit=6",
    DEFAULT_REVALIDATE,
    baseUrl,
  );

  return fallback?.articles ?? [];
}

export async function getPopularArticles(
  limit = 6,
  baseUrl?: string,
): Promise<ArticleSummary[]> {
  const data = await serverFetch<ArticleSummary[]>(
    `/api/articles/popular?limit=${limit}`,
    DEFAULT_REVALIDATE,
    baseUrl,
  );
  return Array.isArray(data) ? data : [];
}

export async function getLatestArticles(
  limit = 24,
  baseUrl?: string,
): Promise<ArticleSummary[]> {
  const data = await serverFetch<ArticleListResponse>(
    `/api/articles?limit=${limit}`,
    DEFAULT_REVALIDATE,
    baseUrl,
  );
  return data?.articles ?? [];
}

export async function getCategories(baseUrl?: string): Promise<Category[]> {
  const data = await serverFetch<Category[]>(
    "/api/categories",
    DEFAULT_REVALIDATE,
    baseUrl,
  );
  return Array.isArray(data) ? data : [];
}

export async function getHomePageData(baseUrl?: string) {
  const [featuredArticles, popularArticles, latestArticles, categories] =
    await Promise.all([
      getFeaturedArticles(baseUrl),
      getPopularArticles(6, baseUrl),
      getLatestArticles(24, baseUrl),
      getCategories(baseUrl),
    ]);

  return { featuredArticles, popularArticles, latestArticles, categories };
}
