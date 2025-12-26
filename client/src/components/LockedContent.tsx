import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function LockedContent() {
    // Mock data for blurred cards
    const mockPosts = [
        {
            title: "Yapay Zeka ve Geleceğin Meslekleri",
            topic: "Teknoloji",
            readTime: "5 dk okuma",
        },
        {
            title: "Kuantum Fiziğine Giriş: Temel Kavramlar",
            topic: "Fizik",
            readTime: "8 dk okuma",
        },
        {
            title: "Osmanlı Tarihinde Bilinmeyen Gerçekler",
            topic: "Tarih",
            readTime: "6 dk okuma",
        },
        {
            title: "Python ile Veri Analizi Temelleri",
            topic: "Yazılım",
            readTime: "10 dk okuma",
        },
    ];

    return (
        <div className="relative py-8">
            {/* Blurred Content Layer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 filter blur-sm select-none pointer-events-none opacity-50">
                {mockPosts.map((post, i) => (
                    <Card key={i} className="h-full overflow-hidden border-2">
                        <div className="h-48 bg-muted/50 animate-pulse" />
                        <CardHeader className="space-y-2">
                            <div className="h-4 w-24 bg-primary/20 rounded-full" />
                            <div className="h-6 w-3/4 bg-muted-foreground/20 rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-muted/30 rounded" />
                                <div className="h-4 w-5/6 bg-muted/30 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Access Denied Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-background/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border text-center max-w-lg mx-4 space-y-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">İçerikleri Keşfetmeye Hazır mısın?</h3>
                        <p className="text-muted-foreground">
                            Jarvis tarafından hazırlanan binlerce özel eğitim içeriğine erişmek için
                            aramıza katılın.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="/auth?tab=register">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Ücretsiz Kayıt Ol
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="/auth">Giriş Yap</Link>
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground pt-2">
                        *Kayıt olmak tamamen ücretsizdir.
                    </p>
                </div>
            </div>
        </div>
    );
}
