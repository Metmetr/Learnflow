import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard, { type Post } from "@/components/PostCard";

interface SearchResult {
  id: string;
  title: string;
  excerpt: string | null;
  mediaUrl: string | null;
  topics: string[];
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  authorVerified: boolean;
}

export default function Search() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const query = params.get("q") || "";

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", { q: query }],
    enabled: query.length > 0,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Arama Sonuçları</h1>
        {query && (
          <p className="text-muted-foreground">
            "{query}" için {isLoading ? "aranıyor..." : `${results.length} sonuç bulundu`}
          </p>
        )}
      </div>

      {!query ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Arama yapmak için bir kelime girin</h3>
              <p className="text-sm text-muted-foreground">
                Yukarıdaki arama kutusunu kullanarak içerik arayabilirsiniz
              </p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Sonuç bulunamadı</h3>
              <p className="text-sm text-muted-foreground">
                "{query}" için hiçbir içerik bulunamadı. Başka bir arama yapmayı deneyin.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const post: Post = {
              id: result.id,
              title: result.title,
              excerpt: result.excerpt || "",
              mediaUrl: result.mediaUrl || undefined,
              topics: result.topics,
              author: {
                id: result.authorId,
                name: result.authorName,
                avatar: result.authorAvatar || undefined,
              },
              createdAt: result.createdAt,
              verificationStatus: "verified" as const,
              likes: 0,
              comments: 0,
            };
            return (
              <PostCard
                key={result.id}
                post={post}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
