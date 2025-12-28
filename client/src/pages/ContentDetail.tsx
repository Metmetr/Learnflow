import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Heart, Bookmark, Share2, Bot, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import CommentSection from "@/components/CommentSection";
import ReportDialog from "@/components/ReportDialog";
import { useAuth } from "@/hooks/useAuth";
import { socialAPI } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { getYouTubeVideoId } from "@/lib/utils";
import { tr } from "date-fns/locale";
// Helper for YouTube ID (imported or logic within component scope if import fails linting, but preferably imported)
// Since I added it to utils, I will use logic here to decide what to render.

interface ContentData {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  mediaUrl?: string;
  topics: string[];
  type?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    specialty?: string;
    bio?: string;
    isBot?: boolean;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function ContentDetail() {
  const params = useParams();
  const contentId = params.id;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: content, isLoading, error } = useQuery<ContentData>({
    queryKey: ['/api/content', contentId],
    enabled: !!contentId,
  });

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (content) {
      setLiked(content.isLiked || false);
      setBookmarked(content.isBookmarked || false);
      setLikeCount(content.likes || 0);
    }
  }, [content]);

  const likeMutation = useMutation({
    mutationFn: () => liked ? socialAPI.unlike(contentId!) : socialAPI.like(contentId!),
    onMutate: () => {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    },
    onError: () => {
      setLiked(liked);
      setLikeCount(likeCount);
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content', contentId] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarked ? socialAPI.unbookmark(contentId!) : socialAPI.bookmark(contentId!),
    onMutate: () => {
      setBookmarked(!bookmarked);
    },
    onError: () => {
      setBookmarked(bookmarked);
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content', contentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/content/bookmarks/my'] });
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
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Giriş yapın",
        description: "Kaydetmek için giriş yapmanız gerekiyor.",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Bağlantı kopyalandı",
        description: "İçerik bağlantısı panoya kopyalandı.",
      });
    } catch (err) {
      toast({
        title: "Hata",
        description: "Bağlantı kopyalanamadı.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/feed">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold mb-2">İçerik bulunamadı</h2>
              <p className="text-muted-foreground mb-4">Bu içerik silinmiş veya mevcut değil.</p>
              <Button asChild>
                <Link href="/feed">Akışa Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isBot = content.author.isBot;
  const authorProfileLink = isBot ? "/jarvis" : `/profile/${content.author.id}`;
  const videoId = getYouTubeVideoId(content.mediaUrl);

  return (
    <div className="min-h-screen bg-background">
      <ReportDialog
        contentId={contentId!}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/feed">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={liked ? "text-red-500" : ""}
                onClick={handleLike}
                disabled={likeMutation.isPending}
                data-testid="button-like"
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={bookmarked ? "text-primary" : ""}
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                data-testid="button-bookmark"
              >
                <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare} data-testid="button-share">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setReportOpen(true)}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <article className="container max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {content.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight font-serif" data-testid="text-content-title">
            {content.title}
          </h1>

          <div className="flex items-center gap-4">
            <Link href={authorProfileLink}>
              <Avatar className="h-12 w-12 cursor-pointer" data-testid="avatar-author">
                {isBot ? (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={content.author.avatar} alt={content.author.name} />
                    <AvatarFallback>{content.author.name.charAt(0)}</AvatarFallback>
                  </>
                )}
              </Avatar>
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={authorProfileLink}>
                  <span className="font-semibold hover:text-primary cursor-pointer" data-testid="text-author-name">
                    {content.author.name}
                  </span>
                </Link>
                {isBot && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Bot className="h-3 w-3" />
                    AI
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {content.author.specialty && <span>{content.author.specialty} • </span>}
                {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true, locale: tr })}
              </div>
            </div>

            {!isBot && (
              <Button size="sm" data-testid="button-follow-author">
                Takip Et
              </Button>
            )}
          </div>

          {videoId ? (
            <iframe
              className="w-full aspect-video rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : content.mediaUrl && (
            <img
              src={content.mediaUrl}
              alt={content.title}
              className="w-full aspect-video object-cover rounded-lg"
              data-testid="img-article-hero"
            />
          )}

          <Separator />

          <div
            className="prose prose-lg max-w-none font-serif dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content.body }}
            data-testid="article-content"
          />

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                disabled={likeMutation.isPending}
                data-testid="button-like-bottom"
              >
                <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
                {likeCount} Beğeni
              </Button>
              <span className="text-sm text-muted-foreground">
                {content.comments} Yorum
              </span>
            </div>

            <Button variant="outline" onClick={handleShare} data-testid="button-share-bottom">
              <Share2 className="mr-2 h-4 w-4" />
              Paylaş
            </Button>
          </div>

          <Separator />

          <CommentSection contentId={contentId!} />
        </div>
      </article>
    </div>
  );
}
