
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FilterIcon, X } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

interface FilterLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function FilterLayout({ sidebar, content }: FilterLayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  return (
    <div className="px-4 py-4 mx-auto">
      {/* Mobile Filter Button */}
      <div className="flex justify-end mb-4">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center rounded-full">
              <FilterIcon className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Фильтры</h3>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <div className="pr-4 overflow-auto h-[calc(100%-120px)]">
              {sidebar}
            </div>
            <div className="mt-6 sticky bottom-0 bg-white p-4 border-t">
              <SheetClose asChild>
                <Button className="w-full bg-goodfit-primary hover:bg-goodfit-dark rounded-xl py-6">
                  Применить фильтры
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Content */}
      <div>
        {content}
      </div>
    </div>
  );
}
