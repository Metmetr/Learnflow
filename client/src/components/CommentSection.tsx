import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Trash2 } from "lucide-react";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  currentUserId?: string;
}

function CommentItem({ comment, currentUserId, depth = 0 }: { comment: Comment; currentUserId?: string; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const canDelete = currentUserId === comment.author.id;

  const handleReply = () => {
    console.log("Reply to", comment.id, ":", replyText);
    setReplyText("");
    setShowReply(false);
  };

  const handleDelete = () => {
    console.log("Delete comment:", comment.id);
  };

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : "mt-6"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8" data-testid={`avatar-comment-${comment.id}`}>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" data-testid={`text-comment-author-${comment.id}`}>
              {comment.author.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: tr })}
            </span>
          </div>

          <p className="text-sm mb-2" data-testid={`text-comment-content-${comment.id}`}>
            {comment.content}
          </p>

          <div className="flex items-center gap-2">
            {depth < 1 && (
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
                data-testid={`button-delete-comment-${comment.id}`}
              >
                <Trash2 className="h-3 w-3" />
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
                <Button size="sm" onClick={handleReply} data-testid={`button-submit-reply-${comment.id}`}>
                  Gönder
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
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ comments, currentUserId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    console.log("New comment:", newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Yorumlar ({comments.length})</h3>

      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder="Yorumunuzu yazın..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20 resize-none"
            data-testid="textarea-new-comment"
          />
          <Button onClick={handleSubmit} data-testid="button-submit-comment">
            Gönder
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}
