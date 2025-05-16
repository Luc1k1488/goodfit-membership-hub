
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onChange: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategories, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category);
        return (
          <Badge
            key={category}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 capitalize ${
              isSelected ? "bg-goodfit-primary" : "hover:bg-gray-100"
            }`}
            onClick={() => onChange(category)}
          >
            {isSelected && <CheckIcon className="w-3 h-3 mr-1" />}
            {category}
          </Badge>
        );
      })}
    </div>
  );
}
