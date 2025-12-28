import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { User, FileText, Heart, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserStats {
    totalContent: number;
    verifiedContent: number;
    totalLikes: number;
    totalComments: number;
}

export default function UserStatsCard() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery<UserStats>({
        queryKey: ["/api/user/stats"],
        enabled: !!user,
    });

    if (!user) {
        return (
            <Card className="mb-6">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-4 pt-6">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Hoş Geldiniz!</h3>
                        <p className="text-sm text-muted-foreground">
                            İçerik üretmek ve etkileşime girmek için giriş yapın.
                        </p>
                    </div>
                    <Link href="/auth">
                        <Button className="w-full">Giriş Yap</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6">
            <CardContent className="p-4 pt-6">
                <div className="flex flex-col items-center text-center space-y-3 mb-6">
                    <Link href="/profile">
                        <Avatar className="h-20 w-20 cursor-pointer border-2 border-primary/10 hover:border-primary/30 transition-colors">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xl">
                                {user.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link href="/profile">
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                {user.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                            <FileText className="h-4 w-4 mb-1 text-blue-500" />
                            <span className="text-sm font-bold">{stats?.totalContent || 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">İçerik</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                            <Heart className="h-4 w-4 mb-1 text-red-500" />
                            <span className="text-sm font-bold">{stats?.totalLikes || 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Beğeni</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                            <MessageSquare className="h-4 w-4 mb-1 text-green-500" />
                            <span className="text-sm font-bold">{stats?.totalComments || 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Yorum</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
