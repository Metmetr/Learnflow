import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { TrendingUp, ThumbsUp, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingSidebar() {
    const { data: trendingPosts = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/content/explore?sort=popular&limit=5"],
        queryFn: async () => {
            const res = await fetch("/api/content/explore?sort=popular&limit=5");
            if (!res.ok) throw new Error("Failed to fetch trending posts");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <Card className="sticky top-20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Popüler İçerikler
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-1/3" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (trendingPosts.length === 0) return null;

    return (
        <Card className="sticky top-20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Popüler İçerikler
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {trendingPosts.map((post) => (
                    <Link key={post.id} href={`/content/${post.id}`}>
                        <div className="block group cursor-pointer space-y-1">
                            <h4 className="font-medium text-sm group-hover:text-primary line-clamp-2 leading-snug">
                                {post.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="truncate">{post.author.name}</span>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{post.likes}</span>
                                </div>
                                {post.comments > 0 && (
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        <span>{post.comments}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
