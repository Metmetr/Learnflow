import EducatorCard from "../EducatorCard";
import educatorImage from "@assets/generated_images/Turkish_male_educator_portrait_b66a1d53.png";

export default function EducatorCardExample() {
  return (
    <div className="max-w-sm">
      <EducatorCard
        id="1"
        name="Prof. Dr. Mehmet Kaya"
        avatar={educatorImage}
        specialty="Matematik"
        verified={true}
        followers={1243}
        postsCount={87}
      />
    </div>
  );
}
