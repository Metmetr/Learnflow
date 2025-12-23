import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  FileText,
  Bot,
  Heart,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
    refetchInterval: 3000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
    refetchInterval: 3000,
  });

  const { data: content = [] } = useQuery({
    queryKey: ["/api/admin/content"],
    enabled: !!user && user.role === "admin",
    refetchInterval: 3000,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/admin/reports"],
    enabled: !!user && user.role === "admin",
    refetchInterval: 3000,
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/content/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "İçerik silindi",
        description: "İçerik başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İçerik silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resolveReportMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/reports/${id}/resolve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Rapor çözüldü",
        description: "Rapor başarıyla çözüldü.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Rapor çözülürken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return null;
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold" data-testid="heading-admin">
            Admin Paneli
          </h1>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold" data-testid="stat-users">{(stats as any).totalUsers}</p>
                <p className="text-xs text-muted-foreground">Kullanıcı</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold" data-testid="stat-content">{(stats as any).totalContent}</p>
                <p className="text-xs text-muted-foreground">İçerik</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold" data-testid="stat-jarvis">{(stats as any).jarvisContent}</p>
                <p className="text-xs text-muted-foreground">Jarvis İçeriği</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold" data-testid="stat-likes">{(stats as any).totalLikes}</p>
                <p className="text-xs text-muted-foreground">Beğeni</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold" data-testid="stat-comments">{(stats as any).totalComments}</p>
                <p className="text-xs text-muted-foreground">Yorum</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-2xl font-bold" data-testid="stat-reports">{(stats as any).pendingReports}</p>
                <p className="text-xs text-muted-foreground">Bekleyen Rapor</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content" data-testid="tab-content">İçerikler</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Raporlar</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tüm İçerikler</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Kaynak</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(content as any[]).map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>{item.authorName}</TableCell>
                        <TableCell>
                          <Badge variant={item.source === "jarvis" || item.source === "n8n" ? "default" : "secondary"}>
                            {item.source === "jarvis" || item.source === "n8n" ? (
                              <><Bot className="h-3 w-3 mr-1" /> Jarvis</>
                            ) : (
                              item.source
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteContentMutation.mutate(item.id)}
                            disabled={deleteContentMutation.isPending}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(content as any[]).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Henüz içerik yok
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users as any[]).map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                            {u.role === "admin" ? "Yönetici" : "Kullanıcı"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(users as any[]).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Henüz kullanıcı yok
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>İçerik Raporları</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İçerik</TableHead>
                      <TableHead>Raporlayan</TableHead>
                      <TableHead>Sebep</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reports as any[]).map((report: any) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">
                          {report.contentTitle}
                        </TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "pending" ? "destructive" : "default"}>
                            {report.status === "pending" ? "Beklemede" : "Çözüldü"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveReportMutation.mutate(report.id)}
                              disabled={resolveReportMutation.isPending}
                              data-testid={`button-resolve-${report.id}`}
                            >
                              Çöz
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(reports as any[]).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Henüz rapor yok
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
