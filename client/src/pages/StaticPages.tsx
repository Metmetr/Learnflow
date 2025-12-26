import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, Shield, FileText } from "lucide-react";

const StaticPageLayout = ({ title, icon: Icon, children }: any) => (
    <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader className="text-center border-b pb-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 prose dark:prose-invert max-w-none">
                    {children}
                </CardContent>
            </Card>
        </main>
    </div>
);

export const About = () => (
    <StaticPageLayout title="Hakkımızda" icon={BookOpen}>
        <p>
            LearnFlow, yapay zeka destekli bir eğitim platformudur. Amacımız, herkese
            erişilebilir ve kişiselleştirilmiş bir öğrenme deneyimi sunmaktır.
        </p>
        <p>
            Jarvis AI asistanımız, internetteki en kaliteli eğitim içeriklerini sizin
            için bulur, özetler ve kategorize eder.
        </p>
    </StaticPageLayout>
);

export const Contact = () => (
    <StaticPageLayout title="İletişim" icon={Mail}>
        <p>Bizimle iletişime geçmek için:</p>
        <ul>
            <li>E-posta: support@learnflow.com</li>
            <li>Tel: +90 555 123 45 67</li>
            <li>Adres: Teknopark İstanbul, Türkiye</li>
        </ul>
    </StaticPageLayout>
);

export const Privacy = () => (
    <StaticPageLayout title="Gizlilik Politikası" icon={Shield}>
        <p>
            Gizliliğiniz bizim için önemlidir. Bu politika, kişisel verilerinizin nasıl
            işlendiğini açıklar.
        </p>
        <h3>Veri Toplama</h3>
        <p>
            Hizmetlerimizi geliştirmek için çerezler ve kullanım verilerini topluyoruz.
        </p>
    </StaticPageLayout>
);

export const Terms = () => (
    <StaticPageLayout title="Kullanım Koşulları" icon={FileText}>
        <p>
            LearnFlow'u kullanarak aşağıdaki koşulları kabul etmiş olursunuz.
        </p>
        <h3>İçerik Kullanımı</h3>
        <p>
            Platformdaki içerikler sadece eğitim amaçlıdır. Ticari olarak
            kopyalanamaz.
        </p>
    </StaticPageLayout>
);
