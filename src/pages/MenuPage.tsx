import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import MenuCard from "@/components/MenuCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const categories = ["All", "Pizzas", "Burgers", "Pasta", "Beverages", "Desserts"];

// Fallback images by category
import margherita from "@/assets/menu/margherita.jpg";
import burger from "@/assets/menu/burger.jpg";
import pasta from "@/assets/menu/pasta.jpg";
import beverages from "@/assets/menu/beverages.jpg";
import dessert from "@/assets/menu/dessert.jpg";

const fallbackImages: Record<string, string> = {
  Pizzas: margherita,
  Burgers: burger,
  Pasta: pasta,
  Beverages: beverages,
  Desserts: dessert,
};

const MenuPage = () => {
  const [active, setActive] = useState("All");
  const [items, setItems] = useState<Tables<"menu_items">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
      if (data) setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="Our Menu" subtitle="Crafted with passion, served with love" />

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                active === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading menu...</div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={{
                  id: item.id,
                  name: item.name,
                  description: item.description || "",
                  price: item.price,
                  category: item.category,
                  image: item.image_url || fallbackImages[item.category] || margherita,
                  featured: item.featured,
                  chefRecommended: item.chef_recommended,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default MenuPage;
