import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Bookmark, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/CommentSection";
import educatorImage from "@assets/generated_images/Turkish_female_educator_portrait_f68f89da.png";
import mathImage from "@assets/generated_images/Mathematics_educational_illustration_1451ee54.png";

export default function ContentDetail() {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(234);

  const article = {
    id: "1",
    title: "Diferansiyel Denklemler ve Gerçek Hayat Uygulamaları",
    author: {
      id: "1",
      name: "Dr. Ayşe Yılmaz",
      avatar: educatorImage,
      verified: true,
      specialty: "Matematik",
    },
    publishedAt: new Date(Date.now() - 3600000),
    readTime: "8 dakika okuma",
    topics: ["Matematik", "Uygulamalar"],
    mediaUrl: mathImage,
    content: `
      <p>Diferansiyel denklemler, matematiğin en güçlü araçlarından biridir ve doğadaki pek çok olayı modellemek için kullanılır. Bu yazıda, diferansiyel denklemlerin temellerini ve gerçek hayattaki uygulamalarını inceleyeceğiz.</p>
      
      <h2>Diferansiyel Denklem Nedir?</h2>
      <p>Diferansiyel denklem, bir fonksiyon ile bu fonksiyonun türevleri arasındaki ilişkiyi ifade eden bir denklemdir. En basit haliyle, bir değişkenin değişim hızını tanımlar.</p>
      
      <h2>Gerçek Hayat Uygulamaları</h2>
      <p>Diferansiyel denklemler birçok alanda kullanılır:</p>
      <ul>
        <li><strong>Fizik:</strong> Newton'un hareket yasaları, elektromanyetik alanlar</li>
        <li><strong>Mühendislik:</strong> Yapısal analiz, sinyal işleme</li>
        <li><strong>Biyoloji:</strong> Popülasyon dinamikleri, hastalık yayılımı</li>
        <li><strong>Ekonomi:</strong> Piyasa modelleri, yatırım stratejileri</li>
      </ul>
      
      <h2>Örnek: Nüfus Artışı Modeli</h2>
      <p>Bir popülasyonun büyümesi, diferansiyel denklemlerle modellenebilir. Malthus modeli, nüfusun zaman içindeki değişimini şu şekilde ifade eder:</p>
      <p><em>dP/dt = rP</em></p>
      <p>Burada P(t) zamana bağlı nüfusu, r ise büyüme oranını temsil eder.</p>
      
      <h2>Sonuç</h2>
      <p>Diferansiyel denklemler, karmaşık sistemleri anlamak ve tahmin etmek için vazgeçilmez bir araçtır. Matematiksel bir kavram olmanın ötesinde, günlük yaşamımızı etkileyen pek çok olayın altında yatan mekanizmaları anlamamızı sağlar.</p>
    `,
  };

  const comments = [
    {
      id: "1",
      author: {
        id: "user1",
        name: "Zeynep Demir",
      },
      content: "Çok faydalı bir yazı olmuş, özellikle gerçek hayat örnekleri çok açıklayıcı. Teşekkürler!",
      createdAt: new Date(Date.now() - 3600000),
      replies: [
        {
          id: "2",
          author: {
            id: "author1",
            name: "Dr. Ayşe Yılmaz",
          },
          content: "Teşekkür ederim! İlginize sevindim.",
          createdAt: new Date(Date.now() - 1800000),
        },
      ],
    },
    {
      id: "3",
      author: {
        id: "user2",
        name: "Ahmet Kaya",
      },
      content: "Bu konuyla ilgili daha detaylı kaynak önerebilir misiniz?",
      createdAt: new Date(Date.now() - 7200000),
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    console.log("Like toggled");
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    console.log("Bookmark toggled");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/feed">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={liked ? "text-red-500" : ""}
                onClick={handleLike}
                data-testid="button-like"
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={bookmarked ? "text-primary" : ""}
                onClick={handleBookmark}
                data-testid="button-bookmark"
              >
                <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <article className="container max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {article.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight font-serif">
            {article.title}
          </h1>

          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12" data-testid="avatar-author">
              <AvatarImage src={article.author.avatar} alt={article.author.name} />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold" data-testid="text-author-name">
                  {article.author.name}
                </span>
                {article.author.verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {article.author.specialty} • {article.readTime}
              </div>
            </div>

            <Button size="sm" data-testid="button-follow-author">
              Takip Et
            </Button>
          </div>

          {article.mediaUrl && (
            <img
              src={article.mediaUrl}
              alt={article.title}
              className="w-full aspect-video object-cover rounded-lg"
              data-testid="img-article-hero"
            />
          )}

          <Separator />

          <div
            className="prose prose-lg max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: article.content }}
            data-testid="article-content"
          />

          <Separator />

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                data-testid="button-like-bottom"
              >
                <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
                {likeCount} Beğeni
              </Button>
              <span className="text-sm text-muted-foreground">
                {comments.length} Yorum
              </span>
            </div>

            <Button variant="outline" data-testid="button-share-bottom">
              <Share2 className="mr-2 h-4 w-4" />
              Paylaş
            </Button>
          </div>

          <Separator />

          <CommentSection comments={comments} currentUserId="user1" />
        </div>
      </article>
    </div>
  );
}
