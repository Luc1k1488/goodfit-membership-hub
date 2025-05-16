
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gym } from "@/types";
import { Star } from "lucide-react";

interface GymCardProps {
  gym: Gym;
}

export function GymCard({ gym }: GymCardProps) {
  return (
    <Link to={`/gyms/${gym.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={gym.mainImage}
            alt={gym.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-goodfit-primary">
              <Star className="w-3 h-3 mr-1 fill-current" /> 
              {gym.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-bold">{gym.name}</h3>
          <p className="text-sm text-gray-500">{gym.address}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {gym.category.slice(0, 3).map((cat, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-sm line-clamp-2 text-muted-foreground">
            {gym.description}
          </p>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t flex justify-between">
          <div className="text-sm text-gray-500">
            {gym.workingHours.open} - {gym.workingHours.close}
          </div>
          <div className="text-sm text-gray-500">
            {gym.reviewCount} reviews
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
