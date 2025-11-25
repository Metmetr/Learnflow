import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function Likes() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: likedContent = [], isLoading } = useQuery({
    queryKey: ["/api/content/likes/my"],
    enabled: !!user,
  });

  if (authLoading) {
    return null;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="heading-likes">
            Beğenilenler
          </h1>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </CardContent>
          </Card>
        ) : likedContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Henüz beğeni yok</h3>
              <p className="text-muted-foreground">
                Beğendiğiniz içerikler burada görüntülenecek.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {likedContent.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
