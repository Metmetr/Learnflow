import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Compass, Bookmark, Bot, Heart, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import TrendingSidebar from "@/components/TrendingSidebar";
import UserStatsCard from "@/components/UserStatsCard";

export default function Feed() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // URL'den topic parametresini al
  const searchParams = new URLSearchParams(window.location.search);
  const topicParam = searchParams.get("topic");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(topicParam);

  // URL değişince state'i güncelle (Geri/İleri navigasyon için)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedTopic(params.get("topic"));
  }, [window.location.search]);

  // Konu seçilince URL'i güncelle
  const handleTopicSelect = (topic: string | null) => {
    setSelectedTopic(topic);
    if (topic) {
      setLocation(`/feed?topic=${encodeURIComponent(topic)}`);
    } else {
      setLocation("/feed");
    }
  };

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/feed/personalized", selectedTopic], // Topic değişince refetch yap
    queryFn: async () => {
      // Eğer konu seçiliyse filtreli getir, yoksa kişiselleştirilmiş (veya genel) akış
      const url = selectedTopic
        ? `/api/content?topic=${encodeURIComponent(selectedTopic)}`
        : "/api/feed/personalized";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    enabled: !!user || !!selectedTopic, // User yoksa bile topic varsa çek
  });

  // Dinamik Konu Listesi
  const { data: topicsData = [] } = useQuery<any[]>({
    queryKey: ["/api/content/topics"],
  });

  const uniqueTopics = topicsData.map((t: any) => t.topic);

  const navItems = [
    { icon: Home, label: "Ana Sayfa", href: "/feed", active: location === "/feed" && !selectedTopic },
    { icon: Compass, label: "Keşfet", href: "/explore", active: location === "/explore" },
    { icon: Bookmark, label: "Kaydedilenler", href: "/bookmarks", active: location === "/bookmarks" },
    { icon: Heart, label: "Beğenilenler", href: "/likes", active: location === "/likes" },
  ];

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
            <UserStatsCard />
            <Card className="sticky top-20">
              <CardContent className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-6 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-3" data-testid="heading-topics">
                  Konular
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTopic === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTopicSelect(null)}
                    data-testid="button-topic-all"
                  >
                    Tümü
                  </Button>
                  {uniqueTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant={selectedTopic === topic ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTopicSelect(topic)}
                      data-testid={`button-topic-${topic.toLowerCase()}`}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {!user && !selectedTopic ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">LearnFlow'a Hoş Geldiniz</h3>
                    <p className="text-muted-foreground mb-4">
                      AI tarafından oluşturulan eğitim içeriklerini keşfedin
                    </p>
                    <Button asChild data-testid="button-login-cta">
                      <Link href="/auth">Giriş Yap</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">İçerikler yükleniyor...</p>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Henüz içerik yok</h3>
                    <p className="text-muted-foreground">
                      {selectedTopic ? `"${selectedTopic}" konusunda henüz içerik bulunamadı.` : "Jarvis yakında yeni içerikler paylaşacak!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                  />
                ))
              )}
            </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold" data-testid="heading-jarvis">Jarvis</h2>
                    <p className="text-xs text-muted-foreground">AI İçerik Üreticisi</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Tüm içerikler Jarvis tarafından yapay zeka kullanılarak oluşturulmaktadır.
                </p>
                <Link href="/jarvis">
                  <Button variant="outline" className="w-full" data-testid="link-jarvis-profile">
                    Jarvis Profilini Gör
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <div className="mt-6">
              <TrendingSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
