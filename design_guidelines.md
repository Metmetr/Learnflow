# LearnFlow Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Social Media Foundation

**Primary References:**
- **Instagram/Facebook:** Feed layout, card interactions, navigation structure
- **Medium:** Reader mode, content presentation, typography hierarchy
- **LinkedIn:** Professional credibility signals, verification badges

**Design Principles:**
1. **Familiar Yet Focused:** Leverage social media patterns users know, eliminate distractions
2. **Educational Credibility:** Verification badges, clean typography, authoritative presence
3. **Turkish-First:** Support Turkish characters perfectly, culturally appropriate visual language
4. **Progressive Disclosure:** Dense information revealed progressively, not overwhelming

---

## Typography

**Font Families:**
- **Primary (UI):** Inter or Rubik (excellent Turkish character support, modern, readable)
- **Content/Reading:** Georgia or Merriweather (serif, traditional educational feel for article bodies)

**Scale:**
- Hero/H1: text-4xl to text-5xl (40-48px), font-bold
- H2/Section Headers: text-2xl to text-3xl (24-30px), font-semibold
- H3/Card Titles: text-lg to text-xl (18-20px), font-semibold
- Body: text-base (16px), font-normal, leading-relaxed
- Metadata/Small: text-sm (14px), font-medium
- Captions: text-xs (12px), font-normal

**Reader Mode Typography:**
- Article title: text-4xl, font-bold, mb-6
- Article body: text-lg, leading-loose (1.8), max-w-prose, serif font
- Generous line height for Turkish text readability

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 consistently
- Component padding: p-4 or p-6
- Section spacing: py-12 or py-16
- Card gaps: gap-4 or gap-6
- Icon margins: m-2 or m-3

**Grid Structure:**
- **Desktop (lg:):** Three-column layout
  - Left sidebar: w-64 (navigation, topics)
  - Center feed: flex-1 max-w-2xl (main content stream)
  - Right sidebar: w-80 (recommendations, verified educators)
- **Tablet (md:):** Two-column - hide left sidebar, show hamburger menu
- **Mobile:** Single column, full-width cards, bottom navigation

**Container Widths:**
- Feed container: max-w-7xl mx-auto px-4
- Content cards: w-full with internal max-w-2xl
- Reader mode: max-w-3xl mx-auto px-6

---

## Component Library

### Navigation
**Top Navbar (Fixed):**
- Height: h-16, white background, shadow-sm
- Logo left (LearnFlow with book/flow icon), search bar center (flex-1 max-w-lg), icons right (notifications, profile)
- Hamburger menu (md: and below) reveals left navigation

**Left Sidebar:**
- Sticky positioning, hidden on mobile
- Navigation items with icons: Home (house), Keşfet/Explore (compass), Konular/Topics (grid), Kaydedilenler/Bookmarks (bookmark)
- Topic quick links below with small thematic icons

**Bottom Navigation (Mobile):**
- Fixed bottom, h-16, 4-5 icon buttons
- Home, Explore, Create (educator+), Bookmarks, Profile

### Feed Cards
**Standard Post Card:**
- White background, rounded-lg, shadow-sm, p-6, mb-4
- Header: Avatar (left, w-12 h-12 rounded-full), Name + verification badge, timestamp (text-sm text-gray-500)
- Title: text-xl font-semibold mb-2
- Excerpt/Media: Truncated text (3 lines) OR image (aspect-video, rounded-md, mb-3)
- Footer: Like count + icon, comment count + icon, share, bookmark (all text-sm, flex justify-between)
- Thematic icon: Absolute positioned, top-4 right-4, w-8 h-8, opacity-10, decorative

**Verification Badge:**
- Blue checkmark in circle for verified educators
- Inline next to name, w-5 h-5
- Yellow pending icon for content under review
- Red rejected icon (admin view only)

### Content Detail (Reader Mode)
- Clean white background, no sidebars
- Back button top-left
- Article header: Large title, author info with badge, read time, publish date
- Hero image (if media): aspect-video or aspect-[21/9], rounded-lg, mb-8
- Body content: Serif font, generous spacing, max-w-prose centered
- Floating action bar (sticky): like, comment, bookmark, share icons
- Comments section below: Nested structure, max depth 2

### Forms & Inputs
- Input fields: border-2 border-gray-200 focus:border-blue-500, rounded-lg, p-3, text-base
- Buttons: Primary (bg-blue-600 hover:bg-blue-700 text-white, rounded-lg, px-6 py-3, font-semibold)
- Secondary: border-2 border-gray-300 hover:bg-gray-50, rounded-lg
- Verification status tags: Pills with colored backgrounds (green/yellow/red, text-xs, rounded-full, px-3 py-1)

### Admin Dashboard
- Sidebar navigation (vertical, left, w-64)
- Main content area: Cards for stats (grid-cols-1 md:grid-cols-3), tables for moderation queue
- Action buttons prominent (Approve/Reject as primary/destructive)
- SheerID logs: Table with columns (user, status, date, verification ID, actions)
- ML Demo: Side-by-side view with score breakdown visualization (simple bars showing score components)

### Thematic Icons
Map topics to SVG icons (Heroicons or Font Awesome via CDN):
- **Matematik/Math:** Calculator, function, chart-bar
- **Fizik/Physics:** Beaker, atom (use "sparkles" as proxy)
- **Tarih/History:** Book-open, academic-cap
- **Programlama/Programming:** Code-bracket, terminal
- **Biyoloji/Biology:** Leaf, DNA helix (use "sparkles" or plant)
- **Kişisel Gelişim/Personal Development:** Light-bulb, star

Display these as large, low-opacity decorative elements positioned at card corners

---

## Images

**Hero Section (Landing Page):**
- Large hero banner: aspect-[21/9] or h-96, featuring diverse students/educators collaborating
- Image description: Modern, bright, Turkish university or learning environment, people engaged with tablets/books
- Overlay: Dark gradient (bg-gradient-to-r from-black/60 to-transparent)
- Text overlay: White text, large heading "Türkiye'nin Eğitim Platformu", CTA button with backdrop-blur-sm bg-white/20

**Feed Content:**
- Post preview images: aspect-video, object-cover, rounded-md
- Use educational imagery: diagrams, infographics, classroom scenes, educational illustrations
- Educator avatars: Circular, professional photos
- Default placeholder: Gradient backgrounds with topic icons

**Profile Pages:**
- Cover photo: aspect-[3/1], subtle educational theme
- Profile picture: Large circular avatar, w-32 h-32 with border-4 border-white

**Empty States:**
- Friendly illustrations for empty feed, no bookmarks, etc.
- Simple line drawings in brand color palette

**Admin Dashboard:**
- Charts/graphs for analytics (use chart library placeholders)
- Content thumbnails in moderation queue

---

## Animations

Use minimal, purposeful animations:
- **Card hover:** Subtle shadow elevation (transition-shadow duration-200)
- **Like button:** Scale pulse on click (scale-110)
- **Navigation transitions:** Fade in/out for sidebar (transition-opacity duration-300)
- **Loading states:** Skeleton screens (shimmer effect with gradient animation)

**Avoid:** Auto-playing carousels, excessive scroll triggers, distracting motion