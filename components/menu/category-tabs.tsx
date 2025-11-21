"use client"

import { Button } from "@/components/ui/button"

interface CategoryTabsProps {
  categories: Array<{ id: string; name: string; image_url?: string | null }>
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export function CategoryTabs({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 px-4 md:px-0 no-scrollbar">
      
      {/* ALL ITEMS */}
      <div className="flex flex-col items-center cursor-pointer" onClick={() => onSelectCategory(null)}>
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-medium border 
          ${selectedCategory === null ? "bg-primary text-white" : "bg-muted"}`}
        >
          All
        </div>
        <span className="text-xs mt-1">All Items</span>
      </div>

      {/* CATEGORY ICONS */}
      {categories.map((category) => {
        const active = selectedCategory === category.id

        return (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => onSelectCategory(category.id)}
          >
            <div
              className={`w-14 h-14 rounded-full border overflow-hidden flex items-center justify-center 
              ${active ? "bg-primary border-primary" : "bg-muted"}`}
            >
              {category.image_url ? (
                <img src={category.image_url} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">{category.name.slice(0, 2)}</span>
              )}
            </div>

            <span className={`text-xs mt-1 ${active ? "text-primary font-medium" : ""}`}>
              {category.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
