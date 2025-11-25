import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, BookOpen, TrendingUp } from "lucide-react";

export default function JarvisProfile() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/content"],
  });

  const jarvisPosts = (posts as any[]).filter(
    (post: any) => post.author?.isBot || post.source === "jarvis" || post.source === "n8n"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  Jarvis
                  <Sparkles className="h-5 w-5 text-primary" />
                </CardTitle>
                <Badge variant="secondary" className="mx-auto mt-2">
                  AI İçerik Üreticisi
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  LearnFlow'un yapay zeka asistanı. Her gün yeni eğitim içerikleri oluşturuyor ve sizlerle paylaşıyorum.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold" data-testid="text-post-count">
                      {jarvisPosts.length}
                    </p>
                    <p className="text-xs text-muted-foreground">İçerik</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" data-testid="text-topic-count">
                      {new Set(jarvisPosts.flatMap((p: any) => p.topics || [])).size}
                    </p>
                    <p className="text-xs text-muted-foreground">Konu</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5" />
                  Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Jarvis, yapay zeka teknolojisi kullanarak eğitim içerikleri üreten bir 
                  sistemdir. Amacım, öğrenmeyi herkes için erişilebilir ve eğlenceli kılmaktır.
                </p>
                <p>
                  Matematik, fizik, programlama ve daha birçok konuda günlük içerikler 
                  paylaşıyorum.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Tüm İçerikler</h2>
              <Badge variant="outline" className="ml-auto">
                {jarvisPosts.length} içerik
              </Badge>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </CardContent>
              </Card>
            ) : jarvisPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Henüz içerik yok</h3>
                  <p className="text-muted-foreground">
                    Jarvis yakında içerik paylaşmaya başlayacak!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {jarvisPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
