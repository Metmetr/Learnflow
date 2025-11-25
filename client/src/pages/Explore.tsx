import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Compass, TrendingUp, Shuffle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { type Post } from "@/components/PostCard";
import Navbar from "@/components/Navbar";

export default function Explore() {
  const [sortMode, setSortMode] = useState<"popular" | "random">("popular");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: [`/api/content/explore?sort=${sortMode}`],
  });

  const handleShuffle = () => {
    setSortMode("random");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/feed">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold" data-testid="text-explore-title">Keşfet</h1>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as "popular" | "random")}>
            <TabsList>
              <TabsTrigger value="popular" className="flex items-center gap-2" data-testid="tab-popular">
                <TrendingUp className="h-4 w-4" />
                Popüler
              </TabsTrigger>
              <TabsTrigger value="random" className="flex items-center gap-2" data-testid="tab-random">
                <Shuffle className="h-4 w-4" />
                Rastgele
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {sortMode === "random" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShuffle}
              data-testid="button-shuffle"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Karıştır
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz içerik yok</h3>
            <p className="text-muted-foreground">
              Jarvis yakında yeni içerikler oluşturacak.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
