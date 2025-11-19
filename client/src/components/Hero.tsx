import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@assets/generated_images/Turkish_students_studying_together_18ea859b.png";
import { useState } from "react";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="relative h-[400px] md:h-[500px]">
        <img
          src={heroImage}
          alt="Türk öğrenciler birlikte çalışıyor"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Türkiye'nin Eğitim Platformu
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Doğrulanmış eğitimcilerden kaliteli, güvenilir eğitim içeriği. 
              Matematik, fizik, tarih ve daha fazlası.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Konu ara..."
                  className="pl-9 bg-white/90 backdrop-blur-sm border-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-hero-search"
                />
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                data-testid="button-hero-search"
              >
                Keşfet
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Matematik", "Fizik", "Programlama", "Tarih"].map((topic) => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  data-testid={`button-topic-${topic.toLowerCase()}`}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
