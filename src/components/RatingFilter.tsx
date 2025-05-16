
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingFilterProps {
  onRatingChange: (rating: number) => void;
  initialRating?: number;
}

export function RatingFilter({ onRatingChange, initialRating = 0 }: RatingFilterProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleRatingClick = (newRating: number) => {
    // Toggle off if clicking the same rating
    const updatedRating = newRating === rating ? 0 : newRating;
    setRating(updatedRating);
    onRatingChange(updatedRating);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Minimum Rating</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(value)}
          >
            <Star
              className={`h-5 w-5 ${
                (hoverRating ? value <= hoverRating : value <= rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </Button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm self-center">{rating}+ stars</span>
        )}
      </div>
    </div>
  );
}
