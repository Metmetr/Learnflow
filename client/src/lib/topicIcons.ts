import {
  Calculator,
  BookOpen,
  Code,
  Leaf,
  Lightbulb,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const topicIconMap: Record<string, LucideIcon> = {
  Matematik: Calculator,
  Fizik: Sparkles,
  Tarih: BookOpen,
  Programlama: Code,
  Biyoloji: Leaf,
  "Kişisel Gelişim": Lightbulb,
  Kimya: Sparkles,
  Edebiyat: BookOpen,
  Felsefe: Lightbulb,
  Coğrafya: BookOpen,
};

export function getTopicIcon(topic: string): LucideIcon | null {
  return topicIconMap[topic] || null;
}
