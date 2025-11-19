import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Users, FileText, Shield, TrendingUp } from "lucide-react";
import educatorImage from "@assets/generated_images/Turkish_female_educator_portrait_f68f89da.png";

export default function AdminDashboard() {
  const [pendingContent] = useState([
    {
      id: "1",
      title: "Kuantum Fiziğine Giriş",
      author: "Dr. Mehmet Yılmaz",
      submittedAt: new Date(Date.now() - 3600000),
      topics: ["Fizik"],
      status: "pending" as const,
    },
    {
      id: "2",
      title: "Python ile Veri Analizi",
      author: "Ayşe Kaya",
      submittedAt: new Date(Date.now() - 7200000),
      topics: ["Programlama"],
      status: "pending" as const,
    },
  ]);

  const [sheeridVerifications] = useState([
    {
      id: "1",
      userName: "Zeynep Demir",
      email: "zeynep@example.com",
      verificationId: "SID-12345",
      status: "verified" as const,
      submittedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      userName: "Ahmet Öz",
      email: "ahmet@example.com",
      verificationId: "SID-12346",
      status: "pending" as const,
      submittedAt: new Date(Date.now() - 43200000),
    },
  ]);

  const handleApprove = (id: string) => {
    console.log("Approved content:", id);
  };

  const handleReject = (id: string) => {
    console.log("Rejected content:", id);
  };

  const handleVerifyEducator = (id: string) => {
    console.log("Verified educator:", id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Yönetici Paneli</h1>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen İçerik</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-pending-content">
                {pendingContent.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-users">
                2,543
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doğrulanmış İçerik</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-verified-content">
                1,284
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Eğitimci</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-educators">
                156
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="moderation" className="space-y-6">
          <TabsList>
            <TabsTrigger value="moderation" data-testid="tab-moderation">
              Moderasyon Kuyruğu
            </TabsTrigger>
            <TabsTrigger value="sheerid" data-testid="tab-sheerid">
              SheerID Doğrulama
            </TabsTrigger>
            <TabsTrigger value="ml-demo" data-testid="tab-ml">
              ML Demo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bekleyen İçerikler</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Konu</TableHead>
                      <TableHead>Gönderim</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingContent.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium" data-testid={`content-title-${content.id}`}>
                          {content.title}
                        </TableCell>
                        <TableCell>{content.author}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {content.topics.map((topic) => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {content.submittedAt.toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(content.id)}
                              data-testid={`button-approve-${content.id}`}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(content.id)}
                              data-testid={`button-reject-${content.id}`}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reddet
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sheerid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SheerID Doğrulama Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Doğrulama ID</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheeridVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={educatorImage} />
                              <AvatarFallback>{verification.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {verification.userName}
                          </div>
                        </TableCell>
                        <TableCell>{verification.email}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {verification.verificationId}
                        </TableCell>
                        <TableCell>
                          {verification.status === "verified" ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Doğrulandı
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Bekliyor
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {verification.submittedAt.toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          {verification.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyEducator(verification.id)}
                              data-testid={`button-verify-${verification.id}`}
                            >
                              Manuel Onayla
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml-demo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ML Sıralama Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  İçerik sıralaması için kullanılan ML algoritmasının görselleştirilmesi. 
                  Skorlar: Doğrulama durumu (2 puan) + Konu eşleşmesi (1.5 puan) + 
                  Popülerlik (1 puan) - Yaş cezası (0.01/gün)
                </p>

                <div className="space-y-3">
                  {[
                    { title: "Kuantum Fiziği", score: 4.2, verified: true, popularity: 0.8 },
                    { title: "Python Temelleri", score: 3.9, verified: true, popularity: 0.6 },
                    { title: "Osmanlı Tarihi", score: 2.1, verified: false, popularity: 0.4 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                      data-testid={`ml-item-${idx}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{item.title}</span>
                          {item.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Doğrulama: {item.verified ? "+2.0" : "0.0"}</span>
                          <span>Popülerlik: +{item.popularity.toFixed(1)}</span>
                          <span>Toplam: {item.score.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{item.score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
