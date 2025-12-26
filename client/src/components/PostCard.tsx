import { Link } from "wouter";
import { Heart, MessageCircle, Share2, Bookmark, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTopicIcon } from "@/lib/topicIcons";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { socialAPI } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getYouTubeVideoId } from "@/lib/utils";

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
    isBot?: boolean;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const TopicIcon = getTopicIcon(post.topics[0]);

  const likeMutation = useMutation({
    mutationFn: async (currentlyLiked: boolean) => {
      if (currentlyLiked) {
        return socialAPI.unlike(post.id);
      } else {
        return socialAPI.like(post.id);
      }
    },
    onMutate: async (currentlyLiked: boolean) => {
      const previousLiked = currentlyLiked;
      const previousCount = likeCount;
      setLiked(!currentlyLiked);
      setLikeCount(currentlyLiked ? likeCount - 1 : likeCount + 1);
      return { previousLiked, previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setLiked(context.previousLiked);
        setLikeCount(context.previousCount);
      }
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed/personalized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content/likes/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (currentlyBookmarked: boolean) => {
      if (currentlyBookmarked) {
        return socialAPI.unbookmark(post.id);
      } else {
        return socialAPI.bookmark(post.id);
      }
    },
    onMutate: async (currentlyBookmarked: boolean) => {
      const previousBookmarked = currentlyBookmarked;
      setBookmarked(!currentlyBookmarked);
      return { previousBookmarked };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setBookmarked(context.previousBookmarked);
      }
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content/bookmarks/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed/personalized"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Beğeni yapmak için giriş yapmanız gerekiyor.",
      });
      return;
    }
    likeMutation.mutate(liked);
  };

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Kaydetmek için giriş yapmanız gerekiyor.",
      });
      return;
    }
    bookmarkMutation.mutate(bookmarked);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/content/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopyalandı",
        description: "İçerik linki panoya kopyalandı.",
      });
    } catch {
      toast({
        title: "Hata",
        description: "Link kopyalanamadı.",
        variant: "destructive",
      });
    }
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
          <Link href={post.author.isBot ? "/jarvis" : `/profile/${post.author.id}`}>
            <Avatar className="h-12 w-12 cursor-pointer" data-testid={`avatar-${post.author.id}`}>
              {post.author.isBot ? (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={post.author.isBot ? "/jarvis" : `/profile/${post.author.id}`}>
                <span className="font-semibold text-sm truncate hover:text-primary cursor-pointer" data-testid={`text-author-${post.id}`}>
                  {post.author.name}
                </span>
              </Link>
              {post.author.isBot && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Bot className="h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span data-testid={`text-time-${post.id}`}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
              </span>
              {post.topics.slice(0, 2).map((topic) => (
                <Link key={topic} href={`/feed?topic=${encodeURIComponent(topic)}`}>
                  <Badge variant="outline" className="text-xs hover:bg-secondary cursor-pointer">
                    {topic}
                  </Badge>
                </Link>
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


        {(() => {
          const videoId = getYouTubeVideoId(post.mediaUrl);

          if (videoId) {
            return (
              <Link href={`/content/${post.id}`}>
                <div className="relative w-full aspect-video rounded-md overflow-hidden cursor-pointer group">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-testid={`img-media-${post.id}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          }

          if (post.mediaUrl) {
            return (
              <Link href={`/content/${post.id}`}>
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="w-full aspect-video object-cover rounded-md cursor-pointer"
                  data-testid={`img-media-${post.id}`}
                />
              </Link>
            );
          }

          return null;
        })()}

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
            disabled={likeMutation.isPending}
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
          <Button variant="ghost" size="sm" onClick={handleShare} data-testid={`button-share-${post.id}`}>
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={bookmarked ? "text-primary" : ""}
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            data-testid={`button-bookmark-${post.id}`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
