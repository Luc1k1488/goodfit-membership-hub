
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
  step?: number;
}

export function PriceFilter({ 
  minPrice, 
  maxPrice, 
  onChange, 
  step = 500 
}: PriceFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  
  const handlePriceChange = (value: number[]) => {
    const [min, max] = value as [number, number];
    setPriceRange([min, max]);
    onChange(min, max);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Price Range</Label>
        <div className="flex justify-between mt-1 mb-2 text-sm">
          <span>₽{priceRange[0].toLocaleString()}</span>
          <span>₽{priceRange[1].toLocaleString()}</span>
        </div>
        <Slider 
          defaultValue={priceRange}
          min={minPrice}
          max={maxPrice}
          step={step}
          onValueChange={handlePriceChange}
          className="mt-2"
        />
      </div>
    </div>
  );
}
