import PostCard from "../PostCard";
import educatorImage from "@assets/generated_images/Turkish_female_educator_portrait_f68f89da.png";

export default function PostCardExample() {
  const mockPost = {
    id: "1",
    title: "Kuantum Fiziği: Temel Kavramlar ve Uygulamalar",
    excerpt: "Kuantum fiziği, modern fiziğin en ilginç dallarından biridir. Bu yazıda, kuantum mekaniğinin temel ilkelerini ve günlük yaşamdaki uygulamalarını inceleyeceğiz.",
    topics: ["Fizik", "Bilim"],
    author: {
      id: "1",
      name: "Dr. Ayşe Yılmaz",
      avatar: educatorImage,
      verified: true,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    verificationStatus: "verified" as const,
    likes: 124,
    comments: 23,
    isLiked: false,
    isBookmarked: false,
  };

  return (
    <div className="max-w-2xl">
      <PostCard
        post={mockPost}
        onLike={(id) => console.log("Liked:", id)}
        onBookmark={(id) => console.log("Bookmarked:", id)}
      />
    </div>
  );
}
