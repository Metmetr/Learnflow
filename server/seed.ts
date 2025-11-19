import { db } from "./db";
import { users, content } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@learnflow.com",
      name: "LearnFlow Admin",
      password: adminPassword,
      role: "admin",
      verified: true,
      avatar: null,
    })
    .returning();
  console.log("Created admin user");

  // Create system user for n8n
  const [systemUser] = await db
    .insert(users)
    .values({
      email: "system@learnflow.com",
      name: "LearnFlow System",
      password: null,
      role: "admin",
      verified: true,
      avatar: null,
    })
    .returning();
  console.log("Created system user");

  // Create verified educators
  const educatorPassword = await bcrypt.hash("educator123", 10);
  
  const [educator1] = await db
    .insert(users)
    .values({
      email: "ayse.yilmaz@learnflow.com",
      name: "Dr. Ayşe Yılmaz",
      password: educatorPassword,
      role: "educator",
      verified: true,
      specialty: "Matematik",
      bio: "İTÜ Matematik Bölümü öğretim üyesi. 15 yıllık öğretim deneyimi.",
    })
    .returning();

  const [educator2] = await db
    .insert(users)
    .values({
      email: "mehmet.kaya@learnflow.com",
      name: "Prof. Dr. Mehmet Kaya",
      password: educatorPassword,
      role: "educator",
      verified: true,
      specialty: "Fizik",
      bio: "ODTÜ Fizik Bölümü öğretim görevlisi. Kuantum mekaniği uzmanı.",
    })
    .returning();

  const [educator3] = await db
    .insert(users)
    .values({
      email: "zeynep.demir@learnflow.com",
      name: "Zeynep Demir",
      password: educatorPassword,
      role: "educator",
      verified: true,
      specialty: "Tarih",
      bio: "Ankara Üniversitesi Tarih Bölümü araştırma görevlisi.",
    })
    .returning();

  const [educator4] = await db
    .insert(users)
    .values({
      email: "ali.ozkan@learnflow.com",
      name: "Dr. Ali Özkan",
      password: educatorPassword,
      role: "educator",
      verified: true,
      specialty: "Biyoloji",
      bio: "Hacettepe Üniversitesi Moleküler Biyoloji bölümü.",
    })
    .returning();

  console.log("Created educators");

  // Create regular users
  const userPassword = await bcrypt.hash("user123", 10);
  
  await db.insert(users).values([
    {
      email: "can.yilmaz@example.com",
      name: "Can Yılmaz",
      password: userPassword,
      role: "user",
      verified: false,
    },
    {
      email: "elif.koc@example.com",
      name: "Elif Koç",
      password: userPassword,
      role: "user",
      verified: false,
    },
  ]);
  console.log("Created regular users");

  // Create Turkish educational content
  const contentData = [
    {
      title: "Diferansiyel Denklemler ve Gerçek Hayat Uygulamaları",
      body: `<h2>Diferansiyel Denklem Nedir?</h2>
<p>Diferansiyel denklem, bir fonksiyon ile bu fonksiyonun türevleri arasındaki ilişkiyi ifade eden bir denklemdir. Matematiğin en güçlü araçlarından biri olan diferansiyel denklemler, doğadaki pek çok olayı modellemek için kullanılır.</p>

<h2>Gerçek Hayat Uygulamaları</h2>
<p>Diferansiyel denklemler birçok alanda kullanılır:</p>
<ul>
<li><strong>Fizik:</strong> Newton'un hareket yasaları, elektromanyetik alanlar, ısı transferi</li>
<li><strong>Mühendislik:</strong> Yapısal analiz, sinyal işleme, kontrol sistemleri</li>
<li><strong>Biyoloji:</strong> Popülasyon dinamikleri, hastalık yayılımı modelleri</li>
<li><strong>Ekonomi:</strong> Piyasa modelleri, yatırım stratejileri, risk analizi</li>
</ul>

<h2>Nüfus Artışı Modeli Örneği</h2>
<p>Malthus modeli, bir popülasyonun büyümesini diferansiyel denklemle ifade eder:</p>
<p><em>dP/dt = rP</em></p>
<p>Burada P(t) zamana bağlı nüfusu, r ise büyüme oranını temsil eder. Bu basit model, bakterilerin üremesinden dünya nüfusuna kadar pek çok sistemi modellemek için kullanılabilir.</p>

<h2>Sonuç</h2>
<p>Diferansiyel denklemler, karmaşık sistemleri anlamak ve tahmin etmek için vazgeçilmez bir araçtır. Günlük yaşamımızı etkileyen pek çok olayın altında yatan mekanizmaları anlamamızı sağlar.</p>`,
      excerpt:
        "Matematik derslerinde öğrendiğimiz diferansiyel denklemlerin mühendislik, fizik ve ekonomide nasıl kullanıldığını keşfedin.",
      topics: ["Matematik", "Uygulamalar"],
      authorId: educator1.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 234,
    },
    {
      title: "Hücre Bölünmesi: Mitoz ve Mayoz",
      body: `<h2>Hücre Bölünmesi Nedir?</h2>
<p>Canlılarda hücre bölünmesi, büyüme, gelişme ve onarım için hayati öneme sahiptir. İki temel hücre bölünmesi türü vardır: mitoz ve mayoz.</p>

<h2>Mitoz</h2>
<p>Mitoz, eşey hücreleri dışındaki vücut hücrelerinin bölünmesidir. Sonucunda genetik olarak özdeş iki hücre oluşur.</p>
<p><strong>Evreler:</strong></p>
<ul>
<li>Profaz: Kromozomlar görünür hale gelir</li>
<li>Metafaz: Kromozomlar ekvator düzleminde sıralanır</li>
<li>Anafaz: Kardeş kromatitler ayrılır</li>
<li>Telofaz: İki yeni çekirdek oluşur</li>
</ul>

<h2>Mayoz</h2>
<p>Mayoz, eşey hücrelerinin (gamet) oluşumu için gereklidir. İki bölünme aşamasında kromozom sayısı yarıya iner.</p>
<p><strong>Önemi:</strong> Genetik çeşitlilik sağlar ve canlıların evrimsel adaptasyonunu destekler.</p>

<h2>Sonuç</h2>
<p>Mitoz ve mayoz, yaşamın sürekliliği için kritik süreçlerdir. Her ikisi de hücre döngüsünün özenle düzenlenmiş aşamalarıdır.</p>`,
      excerpt:
        "Canlılarda hücre bölünmesinin iki temel türünü, mitoz ve mayozu detaylı şekilde inceleyelim.",
      topics: ["Biyoloji", "Genetik"],
      authorId: educator4.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 189,
    },
    {
      title: "Osmanlı İmparatorluğu'nun Kuruluş Dönemi",
      body: `<h2>Beylikten İmparatorluğa</h2>
<p>Osmanlı Devleti, 13. yüzyılın sonlarında Söğüt'te küçük bir beylik olarak kuruldu. Osman Bey'in liderliğinde başlayan bu süreç, zamanla üç kıtaya yayılan bir imparatorluğa dönüştü.</p>

<h2>Erken Dönem Genişleme</h2>
<p>Osman Bey ve oğlu Orhan Bey döneminde Osmanlılar, Bizans topraklarında hızla genişledi:</p>
<ul>
<li>1326: Bursa'nın fethi (ilk başkent)</li>
<li>1331: İznik'in alınması</li>
<li>1337: Nikomedia (İzmit) fethi</li>
<li>1354: Gelibolu'nun Osmanlı hakimiyetine girmesi</li>
</ul>

<h2>Devlet Teşkilatı</h2>
<p>Orhan Bey döneminde düzenli ordu (yaya ve müsellem), para basımı ve ilk medreselerin kurulması gibi önemli adımlar atıldı.</p>

<h2>I. Murad Dönemi</h2>
<p>Yeniçeri Ocağı'nın kuruluşu, Edirne'nin fethi (1361) ve Balkanlar'a yayılma bu dönemin başarılarıdır.</p>`,
      excerpt:
        "13. yüzyılın sonlarında Anadolu'da kurulan Osmanlı Beyliği'nin imparatorluğa dönüşüm sürecini inceleyelim.",
      topics: ["Tarih", "Osmanlı"],
      authorId: educator3.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 156,
    },
    {
      title: "Python ile Veri Analizi: Pandas Kütüphanesi",
      body: `<h2>Pandas Nedir?</h2>
<p>Pandas, Python'da veri manipülasyonu ve analizi için en popüler kütüphanelerden biridir. Tablo şeklindeki verileri işlemek için güçlü araçlar sunar.</p>

<h2>Temel Veri Yapıları</h2>
<p><strong>Series:</strong> Tek boyutlu etiketli dizi</p>
<p><strong>DataFrame:</strong> İki boyutlu etiketli veri yapısı (Excel tablosu gibi)</p>

<h2>Örnek Kullanım</h2>
<pre><code>import pandas as pd

# CSV dosyası okuma
df = pd.read_csv('veriler.csv')

# Veri önizleme
print(df.head())

# İstatistiksel özet
print(df.describe())

# Filtreleme
yuksek_degerler = df[df['puan'] > 80]</code></pre>

<h2>Veri Temizleme</h2>
<p>Eksik değerleri bulma ve doldurma, tekrar eden satırları silme, veri tiplerini dönüştürme gibi işlemler için Pandas çok kullanışlıdır.</p>`,
      excerpt:
        "Python programlama dilinde veri analizi yapmak için Pandas kütüphanesinin temellerini öğrenin.",
      topics: ["Programlama", "Python"],
      authorId: educator2.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 198,
    },
    {
      title: "Kuantum Mekaniği: Dalga-Parçacık İkiliği",
      body: `<h2>Klasik Fizik vs Kuantum Mekaniği</h2>
<p>Klasik fizik, maddenin ya parçacık ya da dalga olduğunu kabul eder. Ancak kuantum mekaniği, ışık ve maddenin hem dalga hem parçacık özelliği gösterdiğini ortaya koydu.</p>

<h2>Çift Yarık Deneyi</h2>
<p>Thomas Young'ın ünlü deneyi, ışığın dalga doğasını kanıtladı. Ancak tek tek foton gönderildiğinde bile girişim deseni oluşması, dalga-parçacık ikiliğinin en çarpıcı göstergesidir.</p>

<h2>De Broglie Dalga Boyu</h2>
<p>Louis de Broglie, her parçacığın bir dalga boyu olduğunu öne sürdü:</p>
<p><em>λ = h/p</em></p>
<p>Burada h Planck sabiti, p ise momentumdur.</p>

<h2>Günümüz Uygulamaları</h2>
<ul>
<li>Elektron mikroskobu</li>
<li>Kuantum bilgisayarlar</li>
<li>Yarı iletken teknolojisi</li>
</ul>`,
      excerpt:
        "Kuantum mekaniğinin en ilginç kavramlarından biri olan dalga-parçacık ikiliğini keşfedin.",
      topics: ["Fizik", "Kuantum"],
      authorId: educator2.id,
      verificationStatus: "pending" as const,
      popularity: 145,
    },
    {
      title: "Etkili İletişim Becerileri Geliştirme",
      body: `<h2>İletişim Nedir?</h2>
<p>İletişim, düşünce, duygu ve bilgilerin paylaşılması sürecidir. Etkili iletişim, hem kişisel hem de profesyonel başarı için kritiktir.</p>

<h2>Aktif Dinleme</h2>
<p>İyi bir iletişimci olmak için önce iyi bir dinleyici olmalısınız:</p>
<ul>
<li>Göz teması kurun</li>
<li>Dikkatinizi konuşana verin</li>
<li>Yargılamadan dinleyin</li>
<li>Geri bildirimde bulunun</li>
</ul>

<h2>Beden Dili</h2>
<p>İletişimin %55'i beden dili ile gerçekleşir. Duruşunuz, jest ve mimikleriniz mesajınızı güçlendirir veya zayıflatır.</p>

<h2>Empati</h2>
<p>Karşınızdaki kişinin bakış açısını anlamak, etkili iletişimin temelidir. Empati kurarak daha sağlıklı ilişkiler geliştirebilirsiniz.</p>`,
      excerpt:
        "Kişisel ve profesyonel yaşamda başarı için etkili iletişim becerilerini nasıl geliştirebileceğinizi öğrenin.",
      topics: ["Kişisel Gelişim", "İletişim"],
      authorId: educator1.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 172,
    },
    {
      title: "JavaScript'te Asenkron Programlama",
      body: `<h2>Asenkron Programlama Nedir?</h2>
<p>JavaScript'te asenkron programlama, kodun bekleme sürecinde bloke olmadan çalışmasını sağlar. Bu, özellikle web uygulamalarında performans için kritiktir.</p>

<h2>Callback Fonksiyonları</h2>
<p>En temel asenkron yapı callback'lerdir:</p>
<pre><code>setTimeout(() => {
  console.log('2 saniye sonra çalıştı');
}, 2000);</code></pre>

<h2>Promise'ler</h2>
<p>Promise'ler, callback cehenneminden kurtulmak için geliştirildi:</p>
<pre><code>fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));</code></pre>

<h2>Async/Await</h2>
<p>Modern JavaScript'te en okunabilir asenkron kod yazma yöntemi:</p>
<pre><code>async function veriGetir() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}</code></pre>`,
      excerpt:
        "JavaScript'te asenkron programlamanın temellerini ve modern yaklaşımlarını öğrenin.",
      topics: ["Programlama", "JavaScript"],
      authorId: educator2.id,
      verificationStatus: "verified" as const,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      popularity: 211,
    },
  ];

  await db.insert(content).values(contentData);
  console.log("Created Turkish educational content");

  console.log("Database seed completed successfully!");
  console.log("\nTest Credentials:");
  console.log("Admin: admin@learnflow.com / admin123");
  console.log("Educator: ayse.yilmaz@learnflow.com / educator123");
  console.log("User: can.yilmaz@example.com / user123");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
