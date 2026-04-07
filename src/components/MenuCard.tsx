import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import type { MenuItem } from "@/data/menuData";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden hover-lift group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.chefRecommended && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-none">
            ⭐ Chef's Pick
          </Badge>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
          <span className="font-display text-2xl text-primary whitespace-nowrap">₹{item.price}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
        <Button
          size="sm"
          onClick={handleAdd}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default MenuCard;
