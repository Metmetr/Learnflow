import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Compass, Bookmark, Bot, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Feed() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/feed/personalized"],
    enabled: !!user,
  });

  const topics = [
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Tarih",
    "Coğrafya",
    "Programlama",
    "Kişisel Gelişim",
  ];

  const navItems = [
    { icon: Home, label: "Ana Sayfa", href: "/feed", active: location === "/feed" },
    { icon: Compass, label: "Keşfet", href: "/explore", active: location === "/explore" },
    { icon: Bookmark, label: "Kaydedilenler", href: "/bookmarks", active: location === "/bookmarks" },
    { icon: Heart, label: "Beğenilenler", href: "/likes", active: location === "/likes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-3">
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
                    onClick={() => setSelectedTopic(null)}
                    data-testid="button-topic-all"
                  >
                    Tümü
                  </Button>
                  {topics.map((topic) => (
                    <Button
                      key={topic}
                      variant={selectedTopic === topic ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTopic(topic)}
                      data-testid={`button-topic-${topic.toLowerCase()}`}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {!user ? (
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
                    <p className="text-muted-foreground">İçerikler yükleniyor...</p>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Henüz içerik yok</h3>
                    <p className="text-muted-foreground">
                      Jarvis yakında yeni içerikler paylaşacak!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts
                  .filter((post: any) =>
                    selectedTopic ? post.topics.includes(selectedTopic) : true
                  )
                  .map((post: any) => (
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
          </aside>
        </div>
      </div>
    </div>
  );
}
