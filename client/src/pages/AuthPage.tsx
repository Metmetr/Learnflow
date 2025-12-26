import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

// Validation schemas matching backend requirements
const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

const registerSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
});

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/feed");
        }
    }, [user, setLocation]);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            name: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onLogin(values: z.infer<typeof loginSchema>) {
        try {
            await loginMutation.mutateAsync(values);
        } catch (e) {
            // Error handled by mutation onError
        }
    }

    async function onRegister(values: z.infer<typeof registerSchema>) {
        try {
            await registerMutation.mutateAsync(values);
        } catch (e) {
            // Error handled by mutation onError
        }
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left: Hero Section */}
            <div className="hidden lg:flex flex-col justify-center bg-zinc-900 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-primary/20 to-purple-500/20" />
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 max-w-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <Bot className="h-7 w-7" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">LearnFlow</h1>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                        Öğrenme Yolculuğunu <br />
                        <span className="text-primary">Yapay Zeka</span> ile Dönüştür.
                    </h2>

                    <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                        Kişiselleştirilmiş içerikler, akıllı öneriler ve interaktif öğrenme deneyimi için topluluğumuza katıl.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-zinc-300">
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <p>Jarvis AI ile sana özel içerik kürasyonu</p>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-300">
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                            <p>Toplulukla etkileşim ve bilgi paylaşımı</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Auth Forms */}
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-none shadow-none lg:shadow-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Hoşgeldiniz</CardTitle>
                        <CardDescription>Hesabınıza erişmek için giriş yapın veya kayıt olun.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={new URLSearchParams(window.location.search).get("tab") === "register" ? "register" : "login"} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                                <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>E-posta</Label>
                                                    <FormControl>
                                                        <Input placeholder="ornek@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Şifre</Label>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-11 font-semibold"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register">
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                        <FormField
                                            control={registerForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Ad Soyad</Label>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>E-posta</Label>
                                                    <FormControl>
                                                        <Input placeholder="ornek@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Şifre</Label>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label>Şifre Tekrar</Label>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-11 font-semibold"
                                            disabled={registerMutation.isPending}
                                        >
                                            {registerMutation.isPending ? "Kayıt Olunuyor..." : "Kayıt Ol"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
