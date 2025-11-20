import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Bookmark } from "lucide-react";

export default function Bookmarks() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["/api/social/bookmarks"],
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
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Kaydedilenler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarksLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Yükleniyor...
              </div>
            ) : bookmarks && (bookmarks as any).length > 0 ? (
              <div className="space-y-4">
                {/* TODO: Implement bookmarked content list */}
                <p className="text-sm text-muted-foreground">
                  {(bookmarks as any).length} kaydedilmiş içerik
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">Henüz kayıtlı içerik yok</p>
                <p className="text-sm">
                  Beğendiğiniz içerikleri daha sonra okumak üzere kaydedebilirsiniz.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
