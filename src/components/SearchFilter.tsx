
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceTime?: number;
}

export function SearchFilter({ 
  onSearch, 
  placeholder = "Search gyms...", 
  initialValue = "", 
  debounceTime = 300 
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, debounceTime);
    
    return () => clearTimeout(timer);
  }, [searchValue, onSearch, debounceTime]);
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-9 w-full"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
}
