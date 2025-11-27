"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ProductCard({ item }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full h-[260px] perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
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
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-muted-foreground">From {item.price} DT</p>
        </Card>

        {/* BACK */}
        <Card
          className="rounded-3xl overflow-hidden absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4 rotateY-180"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
          <p className="mb-4">{item.description}</p>

          <Button className="px-6 py-2 rounded-full text-white">
            Add to Cart
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
