import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiGoogle } from "react-icons/si";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email: loginEmail, password: loginPassword });
    onOpenChange(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup:", { name: signupName, email: signupEmail, password: signupPassword });
    onOpenChange(false);
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>LearnFlow'a Hoş Geldiniz</DialogTitle>
          <DialogDescription>
            Doğrulanmış eğitimcilerden kaliteli içerik keşfetmek için giriş yapın.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">
              Giriş Yap
            </TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">
              Kayıt Ol
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              data-testid="button-google-login"
            >
              <SiGoogle className="mr-2 h-4 w-4" />
              Google ile Giriş Yap
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  data-testid="input-login-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Şifre</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  data-testid="input-login-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-submit-login">
                Giriş Yap
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              data-testid="button-google-signup"
            >
              <SiGoogle className="mr-2 h-4 w-4" />
              Google ile Kayıt Ol
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Ad Soyad</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  data-testid="input-signup-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  data-testid="input-signup-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Şifre</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  data-testid="input-signup-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-submit-signup">
                Kayıt Ol
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
