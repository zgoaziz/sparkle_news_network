"use client";

import { ArticleCardsGrid } from "@/components/ui/article-card";
import { useState } from "react";

export default function ArticleCardsPreview() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const sampleArticles = [
    {
      title: "Breakthrough in AI Research Transforms Technology Industry",
      excerpt:
        "Scientists announce a major advancement that could revolutionize how we approach artificial intelligence and machine learning applications. This discovery opens new possibilities for the future of technology.",
      category: "Technology",
      readTime: 5,
      author: "Sarah Johnson",
      date: "Mar 9, 2024",
      views: 12450,
      likes: 3420,
      image:
        "https://images.unsplash.com/photo-1677442d019cecf8e5004804fdf3ef3592eeb92c38bab67203129d8value47?w=600&h=400&fit=crop",
      featured: false,
      onSeeMore: () => setSelectedArticle("ai-research"),
    },
    {
      title: "Climate Summit Reaches Historic Agreement on Emissions",
      excerpt:
        "World leaders unite to sign a groundbreaking accord aimed at reducing global carbon emissions by 50% over the next decade. This represents the most ambitious climate agreement to date.",
      category: "Environment",
      readTime: 7,
      author: "Michael Chen",
      date: "Mar 8, 2024",
      views: 25630,
      likes: 8900,
      image:
        "https://images.unsplash.com/photo-1559027615-cd1628902d4avalue?w=600&h=400&fit=crop",
      featured: true,
      onSeeMore: () => setSelectedArticle("climate"),
    },
    {
      title: "Tech Giants Launch New Quantum Computing Initiative",
      excerpt:
        "Leading technology companies announce a collaborative effort to advance quantum computing research and development. The initiative aims to overcome current technical challenges.",
      category: "Innovation",
      readTime: 6,
      author: "Emma Davis",
      date: "Mar 7, 2024",
      views: 8920,
      likes: 2105,
      image:
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4dfvalue?w=600&h=400&fit=crop",
      featured: false,
      onSeeMore: () => setSelectedArticle("quantum"),
    },
    {
      title: "Global Economy Shows Strong Growth Indicators",
      excerpt:
        "International markets demonstrate robust performance with GDP growth exceeding forecasts. Economists attribute the strength to increased consumer spending and business investment.",
      category: "Business",
      readTime: 4,
      author: "James Wilson",
      date: "Mar 6, 2024",
      views: 15240,
      likes: 4560,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71value?w=600&h=400&fit=crop",
      featured: false,
      onSeeMore: () => setSelectedArticle("economy"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Modern Article Cards
          </h1>
          <p className="text-lg text-slate-600">
            Clean, transparent design with full article details in 2-column layout
          </p>
        </div>

        {/* Cards Grid - 2 Columns */}
        <ArticleCardsGrid articles={sampleArticles} />

        {/* Selected Article Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <button
                onClick={() => setSelectedArticle(null)}
                className="float-right text-2xl font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {
                  sampleArticles.find((a) => a.onSeeMore?.toString().includes(selectedArticle))
                    ?.title
                }
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Full article content would be displayed here...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
