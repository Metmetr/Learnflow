import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">Ayarlar sayfası yakında eklenecek</p>
              <p className="text-sm">
                Bildirim tercihleri, gizlilik ayarları ve diğer özelleştirmeleri burada yönetebileceksiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
