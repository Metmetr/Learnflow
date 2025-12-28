import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Trash2, Bot, Loader2, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { socialAPI } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isBot?: boolean;
  };
  content: string;
  createdAt: string;
  parentId?: string | null;
  replies?: Comment[];
  likeCount: number;
  isLiked: boolean;
}

interface CommentSectionProps {
  contentId: string;
}

function CommentItem({
  comment,
  currentUserId,
  contentId,
  depth = 0
}: {
  comment: Comment;
  currentUserId?: string;
  contentId: string;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const canDelete = currentUserId === comment.author.id;

  const replyMutation = useMutation({
    mutationFn: (text: string) => socialAPI.createComment(contentId, text, comment.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/social/comments', contentId] });
      setReplyText("");
      setShowReply(false);
      toast({
        title: "Yanıt gönderildi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt gönderilemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => socialAPI.deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/comments', contentId] });
      toast({
        title: "Yorum silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yorum silinemedi.",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => {
      if (comment.isLiked) {
        return socialAPI.unlikeComment(comment.id);
      } else {
        return socialAPI.likeComment(comment.id);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['/api/social/comments', contentId] });
      const previousComments = queryClient.getQueryData(['/api/social/comments', contentId]);

      queryClient.setQueryData(['/api/social/comments', contentId], (old: Comment[] | undefined) => {
        if (!old) return [];
        return old.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              isLiked: !c.isLiked,
              likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1
            };
          }
          return c;
        });
      });

      return { previousComments };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['/api/social/comments', contentId], context?.previousComments);
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/comments', contentId] });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Beğenmek için giriş yapmanız gerekiyor.",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleReply = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Yanıt yazmak için giriş yapmanız gerekiyor.",
      });
      return;
    }
    if (replyText.trim()) {
      replyMutation.mutate(replyText.trim());
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : "mt-6"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8" data-testid={`avatar-comment-${comment.id}`}>
          {comment.author.isBot ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" data-testid={`text-comment-author-${comment.id}`}>
              {comment.author.name}
            </span>
            {comment.author.isBot && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">AI</span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
            </span>
          </div>

          <p className="text-sm mb-2" data-testid={`text-comment-content-${comment.id}`}>
            {comment.content}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2 text-xs gap-1", comment.isLiked && "text-red-500 hover:text-red-600")}
              onClick={handleLike}
              disabled={likeMutation.isPending}
            >
              <Heart className={cn("h-3 w-3", comment.isLiked && "fill-current")} />
              <span>{comment.likeCount > 0 ? comment.likeCount : ""}</span>
            </Button>

            {depth < 3 && ( // Allow up to 3 levels of nesting (0, 1, 2)
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowReply(!showReply)}
                data-testid={`button-reply-${comment.id}`}
              >
                Yanıtla
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-comment-${comment.id}`}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Yanıtınızı yazın..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-20 resize-none text-sm"
                data-testid={`textarea-reply-${comment.id}`}
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  data-testid={`button-submit-reply-${comment.id}`}
                >
                  {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gönder"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReply(false)}
                  data-testid={`button-cancel-reply-${comment.id}`}
                >
                  İptal
                </Button>
              </div>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              contentId={contentId}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


export default function CommentSection({ contentId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: rawComments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/social/comments', contentId],
  });

  // Reconstruct tree from flat list on the client side
  const { rootComments, totalCount } = React.useMemo(() => {
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    // 1. Initialize map with fresh objects (to avoid mutation issues)
    rawComments.forEach(c => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    // 2. Link children to parents
    rawComments.forEach(c => {
      const comment = commentMap.get(c.id)!;
      if (c.parentId && commentMap.has(c.parentId)) {
        const parent = commentMap.get(c.parentId)!;
        parent.replies!.push(comment);
      } else {
        roots.push(comment);
      }
    });

    // 3. Sort roots by newness (reversed)
    roots.reverse();

    return { rootComments: roots, totalCount: rawComments.length };
  }, [rawComments]);

  const commentMutation = useMutation({
    mutationFn: (text: string) => socialAPI.createComment(contentId, text),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/social/comments', contentId] });
      await queryClient.refetchQueries({ queryKey: ['/api/social/comments', contentId] });
      setNewComment("");
      toast({
        title: "Yorum gönderildi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yorum gönderilemedi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Yorum yazmak için giriş yapmanız gerekiyor.",
      });
      return;
    }
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Yorumlar</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Yorumlar ({totalCount})</h3>

      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          {user ? (
            <>
              <AvatarImage src={(user as any).avatar || undefined} alt={(user as any).name || "User"} />
              <AvatarFallback>{(user as any).name?.charAt(0) || "U"}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback>?</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder={user ? "Yorumunuzu yazın..." : "Yorum yazmak için giriş yapın..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20 resize-none"
            disabled={!user}
            data-testid="textarea-new-comment"
          />
          <Button
            onClick={handleSubmit}
            disabled={commentMutation.isPending || !newComment.trim() || !user}
            data-testid="button-submit-comment"
          >
            {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gönder"}
          </Button>
        </div>
      </div>

      {rootComments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Henüz yorum yok. İlk yorumu siz yazın!
        </p>
      ) : (
        <div className="divide-y">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={(user as any)?.id}
              contentId={contentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
