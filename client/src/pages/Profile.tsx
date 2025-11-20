import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import { 
  User, 
  Mail, 
  Edit3, 
  X, 
  Save, 
  FileText, 
  Heart, 
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp
} from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSpecialty, setEditedSpecialty] = useState("");
  const [editedBio, setEditedBio] = useState("");

  const { data: userContent, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/user/content"],
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { specialty?: string | null; bio?: string | null }) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil güncellendi",
        description: "Bilgileriniz başarıyla kaydedildi.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return null;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleEditClick = () => {
    setEditedSpecialty((user as any).specialty || "");
    setEditedBio((user as any).bio || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      specialty: editedSpecialty || null,
      bio: editedBio || null,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSpecialty("");
    setEditedBio("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Onaylandı";
      case "pending":
        return "Beklemede";
      case "rejected":
        return "Reddedildi";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profil</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditClick}
                      data-testid="button-edit-profile"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={(user as any).avatar || (user as any).profileImageUrl} alt={(user as any).name} />
                    <AvatarFallback>
                      {(user as any).name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2 w-full">
                    <h2 className="text-xl font-semibold">{(user as any).name}</h2>
                    
                    {(user as any).verified && (
                      <Badge variant="secondary" className="w-fit mx-auto">
                        {(user as any).role === "educator" ? "Doğrulanmış Eğitimci" : 
                         (user as any).role === "admin" ? "Yönetici" : "Kullanıcı"}
                      </Badge>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{(user as any).email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Uzmanlık Alanı</Label>
                        <Input
                          id="specialty"
                          value={editedSpecialty}
                          onChange={(e) => setEditedSpecialty(e.target.value)}
                          placeholder="Örn: Matematik Öğretmeni"
                          maxLength={100}
                          data-testid="input-specialty"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Hakkımda</Label>
                        <Textarea
                          id="bio"
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          placeholder="Kendiniz hakkında birkaç cümle yazın..."
                          rows={4}
                          maxLength={500}
                          data-testid="textarea-bio"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {editedBio.length}/500
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="flex-1"
                          data-testid="button-save-profile"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Kaydet
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-cancel-edit"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(user as any).specialty && (
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground">Uzmanlık</h3>
                          <p className="text-sm">{(user as any).specialty}</p>
                        </div>
                      )}

                      {(user as any).bio && (
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground">Hakkımda</h3>
                          <p className="text-sm leading-relaxed">{(user as any).bio}</p>
                        </div>
                      )}

                      {!(user as any).specialty && !(user as any).bio && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>Profilinizi düzenlemek için yukarıdaki düzenle butonuna tıklayın.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{(stats as any).totalContent}</p>
                      <p className="text-xs text-muted-foreground">Toplam İçerik</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{(stats as any).verifiedContent}</p>
                      <p className="text-xs text-muted-foreground">Onaylı İçerik</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{(stats as any).totalLikes}</p>
                      <p className="text-xs text-muted-foreground">Toplam Beğeni</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{(stats as any).totalComments}</p>
                      <p className="text-xs text-muted-foreground">Yorum</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>İçeriklerim</CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Yükleniyor...
                  </div>
                ) : userContent && (userContent as any).length > 0 ? (
                  <div className="space-y-4">
                    {(userContent as any).map((content: any) => (
                      <Card 
                        key={content.id} 
                        className="hover-elevate cursor-pointer"
                        onClick={() => setLocation(`/content/${content.id}`)}
                        data-testid={`card-content-${content.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-2">
                                {content.title}
                              </CardTitle>
                              {content.excerpt && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {content.excerpt}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant={
                                content.verificationStatus === "verified" ? "default" :
                                content.verificationStatus === "pending" ? "secondary" : 
                                "destructive"
                              }
                              className="flex items-center gap-1 shrink-0"
                            >
                              {getStatusIcon(content.verificationStatus)}
                              {getStatusText(content.verificationStatus)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{content.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{content.commentCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                              <FileText className="h-4 w-4" />
                              <span>
                                {new Date(content.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">Henüz içerik paylaşmadınız</p>
                    <p className="text-sm">
                      {(user as any).role === "educator" 
                        ? "İlk eğitim içeriğinizi oluşturarak başlayın."
                        : "Eğitimci olmak için SheerID doğrulamasını tamamlayın."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
