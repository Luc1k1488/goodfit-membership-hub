
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
    <div className="container px-4 py-8 mx-auto sm:px-6">
      {/* Mobile Filter Button */}
      <div className="flex justify-end mb-4 md:hidden">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Filters</h3>
              <SheetClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <div className="pr-4">
              {sidebar}
            </div>
            <div className="mt-6">
              <SheetClose asChild>
                <Button className="w-full bg-goodfit-primary hover:bg-goodfit-dark">
                  Apply Filters
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Layout */}
      <div className="grid gap-6 md:grid-cols-[280px,1fr]">
        <div className="hidden md:block space-y-6">
          {sidebar}
        </div>
        <div>
          {content}
        </div>
      </div>
    </div>
  );
}
