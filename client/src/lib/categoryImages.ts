
// Kategori bazlı varsayılan görseller
// Konuya en uygun, yüksek kaliteli Unsplash görselleri

export const CATEGORY_IMAGES: Record<string, string> = {
    // Bilim & Teknoloji
    "teknoloji": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1280",
    "yazılım": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1280",
    "bilim": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1280",
    "kimya": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1280",
    "fizik": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1280",
    "biyoloji": "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=1280",
    "uzay": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1280",

    // Tarih & Toplum
    "tarih": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1280",
    "savaş": "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=1280",
    "atatürk": "https://images.unsplash.com/photo-1662973163345-32e6732f7143?auto=format&fit=crop&q=80&w=1280",
    "coğrafya": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1280",
    "felsefe": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1280",

    // Sanat & Kültür
    "sanat": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1280",
    "edebiyat": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1280",
    "müzik": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1280",

    // Matematik
    "matematik": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1280",

    // Varsayılan (Eğer konu bulunamazsa)
    "default": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1280"
};

export function getCategoryImage(topics: string[]): string {
    if (!topics || topics.length === 0) return CATEGORY_IMAGES["default"];

    // Konuları küçük harfe çevir ve eşleşme ara
    for (const topic of topics) {
        const t = topic.toLowerCase();

        // Doğrudan eşleşme var mı?
        if (CATEGORY_IMAGES[t]) return CATEGORY_IMAGES[t];

        // Kelime içinde geçiyor mu? (Örn: "Türk Tarihi" içinde "tarih" var mı?)
        for (const key of Object.keys(CATEGORY_IMAGES)) {
            if (t.includes(key)) return CATEGORY_IMAGES[key];
        }
    }

    return CATEGORY_IMAGES["default"];
}
