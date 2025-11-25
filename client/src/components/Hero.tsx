import { Button } from "@/components/ui/button";
import { Search, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";

interface HeroProps {
  onTopicSelect?: (topic: string) => void;
}

export default function Hero({ onTopicSelect }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const topics = [
    "Matematik",
    "Fizik",
    "Tarih",
    "Biyoloji",
    "Kimya",
    "Coğrafya",
    "Programlama",
    "Kişisel Gelişim",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTopicClick = (topic: string) => {
    if (onTopicSelect) {
      onTopicSelect(topic);
    } else {
      setLocation(`/feed?topic=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 via-primary to-primary/80">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-12 md:px-12 md:py-20 lg:px-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Bot className="h-9 w-9 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-white/80 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight" data-testid="heading-hero">
            Jarvis ile Kişisel Eğitim İçerikleri
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            Yapay zeka destekli öğrenme deneyimi. Matematik, fizik, tarih ve daha fazlasında 
            size özel eğitim içerikleri.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Konu veya içerik ara..."
                className="pl-12 h-12 text-base bg-white/95 backdrop-blur-sm border-white/20 rounded-xl shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-hero-search"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 bg-white text-primary hover:bg-white/90 rounded-xl shadow-lg font-semibold"
              data-testid="button-hero-search"
            >
              <Search className="h-5 w-5 mr-2" />
              Ara
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {topics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 rounded-full px-4"
                onClick={() => handleTopicClick(topic)}
                data-testid={`button-topic-${topic.toLowerCase()}`}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
