import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import MenuCard from "@/components/MenuCard";
import { menuItems, categories } from "@/data/menuData";

const MenuPage = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? menuItems : menuItems.filter((i) => i.category === active);

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="Our Menu" subtitle="Crafted with passion, served with love" />

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </main>
  );
};

export default MenuPage;
