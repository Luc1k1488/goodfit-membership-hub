
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CityFilterProps {
  cities: string[];
  onCityChange: (city: string) => void;
  activeCity?: string;
}

export function CityFilter({ cities, onCityChange, activeCity }: CityFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <Tabs 
        value={activeCity || "all"} 
        onValueChange={(value) => onCityChange(value === "all" ? "" : value)}
        className="w-full"
      >
        <TabsList className="inline-flex w-auto">
          <TabsTrigger value="all" className="px-4">All Cities</TabsTrigger>
          {cities.map((city) => (
            <TabsTrigger key={city} value={city} className="px-4">
              {city}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
