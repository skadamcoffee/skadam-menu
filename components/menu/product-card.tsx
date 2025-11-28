"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image_url?: string | null
  onAddToCart: (productId: string, quantity: number) => void
}

export function ProductCard({ id, name, description, price, image_url, onAddToCart }: ProductCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    onAddToCart(id, quantity)
    setQuantity(1)
    setFlipped(false)
  }

  return (
    <div className="w-full h-[260px] perspective" onClick={() => setFlipped(!flipped)}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <Card
          className="rounded-3xl overflow-hidden absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Circular Starbucks-style image */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center mb-3">
            {image_url ? (
              <img src={image_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">☕</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-center">{name}</h3>
          <p className="text-muted-foreground text-sm">From {Number(price).toFixed(2)} د.ت</p>
        </Card>

        {/* BACK */}
        <Card
          className="rounded-3xl overflow-hidden absolute inset-0 backface-hidden flex flex-col justify-between p-4"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm mt-1">{description}</p>
          </div>

          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(Math.max(1, quantity - 1))
                }}
                className="px-2 py-1 rounded hover:bg-primary/20"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <span className="font-semibold">{quantity}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(quantity + 1)
                }}
                className="px-2 py-1 rounded hover:bg-primary/20"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Add Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAdd()
              }}
              className="w-full rounded-full flex gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {(price * quantity).toFixed(2)} د.ت
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
