import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import LockedContent from "@/components/LockedContent";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  /*
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/content"],
  });
  */

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/feed");
    }
  }, [user, isLoading, setLocation]);

  /*
  const filteredPosts = selectedTopic
    ? (posts as any[]).filter((post: any) => post.topics?.includes(selectedTopic))
    : (posts as any[]).slice(0, 6);
  */

  const handleTopicSelect = (topic: string) => {
    // If not logged in, redirect to auth with topic intent (optional enhancement)
    // or just scroll to locked content
    const element = document.getElementById('locked-content');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar showSearch={false} />

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Hero onTopicSelect={handleTopicSelect} />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">AI Destekli İçerik</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Jarvis, güncel ve kaliteli eğitim içerikleri oluşturmak için yapay zeka kullanır.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Çeşitli Konular</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Matematik, fizik, tarih, biyoloji ve daha birçok konuda içerik keşfedin.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Kişiselleştirilmiş Akış</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                İlgi alanlarınıza göre özelleştirilmiş içerik önerileri alın.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6" id="locked-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold" data-testid="heading-featured">
                Neler Öğrenebilirsin?
              </h2>
            </div>
          </div>

          <LockedContent />
        </section>

        <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Bot className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold">Jarvis ile Öğrenmeye Başla</h2>
            <p className="text-lg text-muted-foreground">
              Yapay zeka destekli eğitim içeriklerini keşfet, beğen, kaydet ve yorum yap.
              Öğrenme deneyimini kişiselleştir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" asChild data-testid="button-start-learning">
                <Link href="/auth">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Hemen Başla
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur hover:bg-background/80" asChild data-testid="button-explore">
                <Link href="/jarvis">
                  <Bot className="mr-2 h-5 w-5" />
                  Örnekleri İncele
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">LF</span>
              </div>
              <div>
                <span className="font-semibold">LearnFlow</span>
                <p className="text-xs text-muted-foreground">Powered by Jarvis AI</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors" data-testid="link-about">
                Hakkımızda
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
                Kullanım Koşulları
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">
                İletişim
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            © 2024 LearnFlow. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
