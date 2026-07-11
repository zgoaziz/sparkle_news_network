import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ArticleSummary, Category } from "@/lib/api-client";

export function fdate(d?: string | null) {
  if (!d) return "";
  return format(new Date(d), "d MMM yyyy", { locale: fr });
}

export function matchesCategory(article: ArticleSummary, category: Category) {
  const articleCategory = article.category;
  const articleCategoryId = article.category?.id;
  const categoryId = category.id;

  return (
    (articleCategoryId != null && categoryId != null && String(articleCategoryId) === String(categoryId)) ||
    (articleCategory?.slug &&
      category.slug &&
      articleCategory.slug.toLowerCase() === category.slug.toLowerCase()) ||
    (articleCategory?.name &&
      category.name &&
      articleCategory.name.toLowerCase() === category.name.toLowerCase())
  );
}

export function buildCategorySections(
  categories: Category[],
  latestArticles: ArticleSummary[],
) {
  return categories
    .map((category) => ({
      category,
      articles: latestArticles.filter((article) => matchesCategory(article, category)).slice(0, 5),
    }))
    .filter((section) => section.articles.length > 0)
    .slice(0, 4);
}
