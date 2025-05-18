
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ 
  value = "", 
  onChange,
  onSearch,
  placeholder = "Поиск залов, адресов, категорий...",
  initialValue
}) => {
  const [inputValue, setInputValue] = React.useState(initialValue || value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    if (onSearch) {
      onSearch(newValue);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 py-6 rounded-xl"
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};
