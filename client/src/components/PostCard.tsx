import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Bookmark, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTopicIcon } from "@/lib/topicIcons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  mediaUrl?: string;
  topics: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  createdAt: Date;
  verificationStatus: "pending" | "verified" | "rejected";
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onBookmark }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const TopicIcon = getTopicIcon(post.topics[0]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike?.(post.id);
    console.log("Like toggled:", post.id);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.(post.id);
    console.log("Bookmark toggled:", post.id);
  };

  const getVerificationBadge = () => {
    if (post.verificationStatus === "verified") {
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    } else if (post.verificationStatus === "pending") {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else if (post.verificationStatus === "rejected") {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden hover-elevate">
      {TopicIcon && (
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
          <TopicIcon className="h-12 w-12" />
        </div>
      )}

      <CardHeader className="gap-3 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12" data-testid={`avatar-${post.author.id}`}>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate" data-testid={`text-author-${post.id}`}>
                {post.author.name}
              </span>
              {post.author.verified && getVerificationBadge()}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span data-testid={`text-time-${post.id}`}>
                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
              </span>
              {post.topics.slice(0, 2).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Link href={`/content/${post.id}`}>
          <h3 className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer" data-testid={`text-title-${post.id}`}>
            {post.title}
          </h3>
        </Link>
        
        {post.mediaUrl && (
          <Link href={`/content/${post.id}`}>
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-md cursor-pointer"
              data-testid={`img-media-${post.id}`}
            />
          </Link>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-excerpt-${post.id}`}>
          {post.excerpt}
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={liked ? "text-red-500" : ""}
            onClick={handleLike}
            data-testid={`button-like-${post.id}`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span className="ml-1 text-xs" data-testid={`text-likes-${post.id}`}>{likeCount}</span>
          </Button>

          <Button variant="ghost" size="sm" asChild data-testid={`button-comments-${post.id}`}>
            <Link href={`/content/${post.id}#comments`}>
              <MessageCircle className="h-4 w-4" />
              <span className="ml-1 text-xs" data-testid={`text-comments-${post.id}`}>{post.comments}</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" data-testid={`button-share-${post.id}`}>
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={bookmarked ? "text-primary" : ""}
            onClick={handleBookmark}
            data-testid={`button-bookmark-${post.id}`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
