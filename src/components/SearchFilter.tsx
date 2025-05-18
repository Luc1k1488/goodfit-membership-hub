
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ value = "", onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Поиск залов, адресов, категорий..."
        className="pl-10 py-6 rounded-xl"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
