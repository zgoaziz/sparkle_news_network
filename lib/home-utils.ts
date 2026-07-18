import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ArticleSummary, Category } from "@/lib/api-client";

export function fdate(d?: string | null) {
  if (!d) return "";
  return format(new Date(d), "d MMM yyyy", { locale: fr });
}

export function matchesCategory(article: any, category: Category) {
  const categoryId = category.id;
  const categorySlug = category.slug?.toLowerCase();
  const categoryName = category.name?.toLowerCase();

  const checkSingleCat = (cat: any) => {
    if (!cat) return false;
    const catId = cat.id;
    const catSlug = cat.slug?.toLowerCase();
    const catName = cat.name?.toLowerCase();

    return (
      (catId != null && categoryId != null && String(catId) === String(categoryId)) ||
      (catSlug && categorySlug && catSlug === categorySlug) ||
      (catName && categoryName && catName === categoryName)
    );
  };

  if (Array.isArray(article.categories) && article.categories.length > 0) {
    return article.categories.some(checkSingleCat);
  }

  return checkSingleCat(article.category);
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
