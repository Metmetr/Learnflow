import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface EducatorCardProps {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  verified: boolean;
  followers: number;
  postsCount: number;
}

export default function EducatorCard({
  id,
  name,
  avatar,
  specialty,
  verified,
  followers,
  postsCount,
}: EducatorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    console.log(isFollowing ? "Unfollowed" : "Followed", id);
  };

  return (
    <Card className="hover-elevate">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12" data-testid={`avatar-educator-${id}`}>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-semibold text-sm truncate" data-testid={`text-name-${id}`}>
                {name}
              </span>
              {verified && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
            </div>
            
            <Badge variant="secondary" className="mb-2 text-xs">
              {specialty}
            </Badge>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span data-testid={`text-posts-${id}`}>{postsCount} içerik</span>
              <span data-testid={`text-followers-${id}`}>{followers} takipçi</span>
            </div>

            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              className="w-full"
              onClick={handleFollow}
              data-testid={`button-follow-${id}`}
            >
              {isFollowing ? "Takip Ediliyor" : "Takip Et"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
