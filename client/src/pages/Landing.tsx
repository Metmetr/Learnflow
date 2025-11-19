import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import EducatorCard from "@/components/EducatorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Shield, Users, TrendingUp } from "lucide-react";
import educatorImage1 from "@assets/generated_images/Turkish_female_educator_portrait_f68f89da.png";
import educatorImage2 from "@assets/generated_images/Turkish_male_educator_portrait_b66a1d53.png";
import mathImage from "@assets/generated_images/Mathematics_educational_illustration_1451ee54.png";
import bioImage from "@assets/generated_images/Biology_scientific_illustration_e921027e.png";

export default function Landing() {
  const featuredPosts = [
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
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      verificationStatus: "verified" as const,
      likes: 234,
      comments: 45,
    },
    {
      id: "2",
      title: "Hücre Bölünmesi: Mitoz ve Mayoz",
      excerpt: "Canlılarda hücre bölünmesinin iki temel türünü, mitoz ve mayozu detaylı şekilde inceleyelim. Animasyonlar ve şemalarla desteklenmiş içerik.",
      mediaUrl: bioImage,
      topics: ["Biyoloji", "Genetik"],
      author: {
        id: "2",
        name: "Prof. Dr. Mehmet Kaya",
        avatar: educatorImage2,
        verified: true,
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      verificationStatus: "verified" as const,
      likes: 189,
      comments: 32,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar showSearch={false} />

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12">
        <Hero />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Doğrulanmış İçerik</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tüm içerikler akademik uzmanlar tarafından incelenir ve doğrulanır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Güvenilir Eğitimciler</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                SheerID ile doğrulanmış öğretmenler ve akademisyenlerden öğrenin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Kişiselleştirilmiş Öğrenme</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                İlgi alanlarınıza göre özelleştirilmiş içerik akışı.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Öne Çıkan İçerikler</h2>
            <Button variant="ghost" asChild data-testid="button-view-all">
              <Link href="/feed">Tümünü Gör</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Öne Çıkan Eğitimciler</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topEducators.map((educator) => (
              <EducatorCard key={educator.id} {...educator} />
            ))}
          </div>
        </section>

        <section className="bg-primary/5 rounded-lg p-8 md:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold">Eğitimci misiniz?</h2>
            <p className="text-lg text-muted-foreground">
              SheerID ile kimliğinizi doğrulayın ve binlerce öğrenciye ulaşın. 
              Bilginizi paylaşın, eğitim topluluğumuzun bir parçası olun.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" data-testid="button-educator-signup">
                <Users className="mr-2 h-4 w-4" />
                Eğitimci Olarak Katıl
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <Link href="/about">Daha Fazla Bilgi</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t mt-12">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">LearnFlow</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">Hakkımızda</Link></li>
                <li><Link href="/careers">Kariyer</Link></li>
                <li><Link href="/press">Basın</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Topluluk</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/educators">Eğitimciler</Link></li>
                <li><Link href="/topics">Konular</Link></li>
                <li><Link href="/guidelines">Kurallar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Destek</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help">Yardım Merkezi</Link></li>
                <li><Link href="/contact">İletişim</Link></li>
                <li><Link href="/faq">SSS</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Yasal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Gizlilik</Link></li>
                <li><Link href="/terms">Kullanım Koşulları</Link></li>
                <li><Link href="/kvkk">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 LearnFlow. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
