import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Compass, Bookmark, PenSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { feedAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Feed() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/feed/personalized"],
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
                      data-testid={`link-${item.label.toLowerCase()}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <Separator className="my-4" />

                {user?.role === "educator" && (
                  <Link href="/create">
                    <Button variant="default" className="w-full gap-2" data-testid="button-create-content">
                      <PenSquare className="h-4 w-4" />
                      İçerik Oluştur
                    </Button>
                  </Link>
                )}
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
                      İçerikleri görmek için giriş yapın
                    </p>
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
                    <p className="text-muted-foreground">Henüz içerik yok</p>
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
                      id={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      mediaUrl={post.mediaUrl}
                      topics={post.topics}
                      author={{
                        id: post.author.id,
                        name: post.author.name,
                        avatar: post.author.avatar,
                        verified: post.author.verified,
                      }}
                      createdAt={new Date(post.createdAt)}
                      verificationStatus={post.verificationStatus}
                      likes={post.likes}
                      comments={post.comments}
                    />
                  ))
              )}
            </div>
          </main>

          <aside className="hidden lg:block lg:col-span-3">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4" data-testid="heading-suggestions">
                  Önerilen Eğitimciler
                </h2>
                <p className="text-sm text-muted-foreground">Yakında...</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
