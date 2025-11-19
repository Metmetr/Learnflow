import { useState } from "react";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import EducatorCard from "@/components/EducatorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Compass, Grid3x3, Bookmark, PenSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import educatorImage1 from "@assets/generated_images/Turkish_female_educator_portrait_f68f89da.png";
import educatorImage2 from "@assets/generated_images/Turkish_male_educator_portrait_b66a1d53.png";
import studentImage from "@assets/generated_images/Turkish_female_student_portrait_902b5101.png";
import mathImage from "@assets/generated_images/Mathematics_educational_illustration_1451ee54.png";
import bioImage from "@assets/generated_images/Biology_scientific_illustration_e921027e.png";

export default function Feed() {
  const [location] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const posts = [
    {
      id: "1",
      title: "Diferansiyel Denklemler ve Gerçek Hayat Uygulamaları",
      excerpt: "Matematik derslerinde öğrendiğimiz diferansiyel denklemlerin mühendislik, fizik ve ekonomide nasıl kullanıldığını keşfedin.",
      mediaUrl: mathImage,
      topics: ["Matematik", "Uygulamalar"],
      author: {
        id: "1",
        name: "Dr. Ayşe Yılmaz",
        avatar: educatorImage1,
        verified: true,
      },
      createdAt: new Date(Date.now() - 3600000),
      verificationStatus: "verified" as const,
      likes: 234,
      comments: 45,
    },
    {
      id: "2",
      title: "Hücre Bölünmesi: Mitoz ve Mayoz",
      excerpt: "Canlılarda hücre bölünmesinin iki temel türünü, mitoz ve mayozu detaylı şekilde inceleyelim.",
      mediaUrl: bioImage,
      topics: ["Biyoloji", "Genetik"],
      author: {
        id: "2",
        name: "Prof. Dr. Mehmet Kaya",
        avatar: educatorImage2,
        verified: true,
      },
      createdAt: new Date(Date.now() - 7200000),
      verificationStatus: "verified" as const,
      likes: 189,
      comments: 32,
    },
    {
      id: "3",
      title: "Osmanlı İmparatorluğu'nun Kuruluş Dönemi",
      excerpt: "13. yüzyılın sonlarında Anadolu'da kurulan Osmanlı Beyliği'nin imparatorluğa dönüşüm sürecini inceleyelim.",
      topics: ["Tarih", "Osmanlı"],
      author: {
        id: "3",
        name: "Zeynep Demir",
        avatar: studentImage,
        verified: true,
      },
      createdAt: new Date(Date.now() - 14400000),
      verificationStatus: "verified" as const,
      likes: 156,
      comments: 28,
    },
  ];

  const topEducators = [
    {
      id: "1",
      name: "Dr. Ayşe Yılmaz",
      avatar: educatorImage1,
      specialty: "Matematik",
      verified: true,
      followers: 2543,
      postsCount: 127,
    },
    {
      id: "2",
      name: "Prof. Dr. Mehmet Kaya",
      avatar: educatorImage2,
      specialty: "Fizik",
      verified: true,
      followers: 1876,
      postsCount: 94,
    },
  ];

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
    { icon: Home, label: "Ana Sayfa", path: "/feed" },
    { icon: Compass, label: "Keşfet", path: "/explore" },
    { icon: Grid3x3, label: "Konular", path: "/topics" },
    { icon: Bookmark, label: "Kaydedilenler", path: "/bookmarks" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex gap-6 py-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      asChild
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Link href={item.path}>
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>

              <Separator />

              <div className="space-y-2">
                <h3 className="px-3 text-sm font-semibold text-muted-foreground">
                  Konular
                </h3>
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    variant={selectedTopic === topic ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                    data-testid={`topic-${topic.toLowerCase()}`}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Akış</h1>
              <Button data-testid="button-create-post">
                <PenSquare className="mr-2 h-4 w-4" />
                Yeni İçerik
              </Button>
            </div>

            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </main>

          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Önerilen Eğitimciler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topEducators.map((educator) => (
                    <EducatorCard key={educator.id} {...educator} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Popüler Konular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topics.slice(0, 6).map((topic) => (
                      <Button
                        key={topic}
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedTopic(topic)}
                        data-testid={`popular-topic-${topic.toLowerCase()}`}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
