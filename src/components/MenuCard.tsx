import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/data/menuData";

const MenuCard = ({ item }: { item: MenuItem }) => (
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
      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
    </div>
  </motion.div>
);

export default MenuCard;
