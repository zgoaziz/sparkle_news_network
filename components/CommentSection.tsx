"use client";
import { useState } from "react";
import { useGetArticleComments, useCreateComment, getGetArticleCommentsQueryKey } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface CommentSectionProps {
  articleId: any;
}

function normalizeComments(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const maybeComments = (data as any).comments ?? (data as any).data ?? (data as any).items;
    if (Array.isArray(maybeComments)) return maybeComments;
    if (Array.isArray((data as any).results)) return (data as any).results;
  }
  return [];
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  const { data, isLoading } = useGetArticleComments(articleId);
  const comments = normalizeComments(data);

  // Create comment mutation
  const createCommentMutation = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Veuillez vous connecter pour commenter.");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide.");
      return;
    }

    if (commentText.length < 3) {
      toast.error("Le commentaire doit faire au moins 3 caractères.");
      return;
    }

    if (commentText.length > 1000) {
      toast.error("Le commentaire ne peut pas dépasser 1000 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createCommentMutation.mutateAsync({
        data: {
          articleId,
          content: commentText,
        },
      });

      toast.success("Commentaire soumis pour modération !");
      setCommentText("");

      // Invalidate and refetch comments
      await queryClient.invalidateQueries({
        queryKey: getGetArticleCommentsQueryKey(articleId),
      });
    } catch (error) {
      toast.error("Erreur lors de la publication du commentaire.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Commentaires ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {!user ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-blue-900 font-medium mb-2">
              Connectez-vous pour commenter
            </p>
            <Link href="/connexion">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-5 mb-8 border border-gray-200">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {user.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{user.name || "Vous"}</div>
              <div className="text-xs text-gray-500">Juste maintenant</div>
            </div>
          </div>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Partagez votre avis sur cet article..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isSubmitting}
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {commentText.length}/1000 caractères
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Publication...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publier
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Votre commentaire sera modéré avant publication.
          </p>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-12 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun commentaire pour le moment</p>
            <p className="text-gray-400 text-sm mt-1">
              Soyez le premier à partager votre avis !
            </p>
          </div>
        ) : (
          comments.map((comment: any) => (
            <div key={comment.id || comment._id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
              {/* Avatar */}
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={comment.author?.avatar || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {comment.author?.name?.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {comment.author?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {comment.createdAt
                        ? formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })
                        : "il y a peu"}
                    </p>
                  </div>
                  {comment.status === "pending" && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      En attente
                    </span>
                  )}
                  {comment.status === "rejected" && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                      Rejeté
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Link */}
      {user?.role === "admin" && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/admin/commentaires">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Voir tous les commentaires (Admin)
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
