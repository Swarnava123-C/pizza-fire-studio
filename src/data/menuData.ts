import heroPizza from "@/assets/hero-pizza.jpg";
import margherita from "@/assets/menu/margherita.jpg";
import burger from "@/assets/menu/burger.jpg";
import pasta from "@/assets/menu/pasta.jpg";
import dessert from "@/assets/menu/dessert.jpg";
import beverages from "@/assets/menu/beverages.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured: boolean;
  chefRecommended: boolean;
}

export const menuItems: MenuItem[] = [
  // Pizzas
  { id: "p1", name: "Margherita Classica", description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil", price: 299, category: "Pizzas", image: margherita, featured: true, chefRecommended: true },
  { id: "p2", name: "Pepperoni Inferno", description: "Spicy pepperoni, mozzarella, chili flakes, honey drizzle", price: 349, category: "Pizzas", image: heroPizza, featured: true, chefRecommended: false },
  { id: "p3", name: "BBQ Chicken Supreme", description: "Grilled chicken, BBQ sauce, red onions, bell peppers, smoked gouda", price: 399, category: "Pizzas", image: margherita, featured: false, chefRecommended: true },
  { id: "p4", name: "Veggie Garden", description: "Mushrooms, olives, artichokes, sun-dried tomatoes, feta", price: 329, category: "Pizzas", image: margherita, featured: false, chefRecommended: false },
  // Burgers
  { id: "b1", name: "Classic Smash Burger", description: "Double smashed patty, American cheese, pickles, special sauce", price: 249, category: "Burgers", image: burger, featured: true, chefRecommended: true },
  { id: "b2", name: "Truffle Mushroom Burger", description: "Angus beef, truffle aioli, sautéed mushrooms, Swiss cheese", price: 349, category: "Burgers", image: burger, featured: false, chefRecommended: true },
  { id: "b3", name: "Spicy Jalapeño Burger", description: "Beef patty, pepper jack, jalapeños, chipotle mayo", price: 279, category: "Burgers", image: burger, featured: false, chefRecommended: false },
  // Pasta
  { id: "pa1", name: "Carbonara", description: "Spaghetti, pancetta, egg yolk, pecorino romano, black pepper", price: 299, category: "Pasta", image: pasta, featured: true, chefRecommended: true },
  { id: "pa2", name: "Penne Arrabbiata", description: "Penne, spicy tomato sauce, garlic, fresh parsley", price: 249, category: "Pasta", image: pasta, featured: false, chefRecommended: false },
  { id: "pa3", name: "Alfredo Fettuccine", description: "Fettuccine, creamy parmesan sauce, grilled chicken", price: 329, category: "Pasta", image: pasta, featured: false, chefRecommended: false },
  // Beverages
  { id: "bv1", name: "Fresh Mango Smoothie", description: "Alphonso mango, yogurt, honey, ice", price: 149, category: "Beverages", image: beverages, featured: false, chefRecommended: false },
  { id: "bv2", name: "Strawberry Blast", description: "Fresh strawberries, banana, vanilla ice cream", price: 169, category: "Beverages", image: beverages, featured: true, chefRecommended: false },
  { id: "bv3", name: "Classic Lemonade", description: "Fresh lemon, mint, sparkling water, cane sugar", price: 99, category: "Beverages", image: beverages, featured: false, chefRecommended: false },
  // Desserts
  { id: "d1", name: "Chocolate Lava Cake", description: "Warm molten chocolate center, vanilla gelato, berry compote", price: 199, category: "Desserts", image: dessert, featured: true, chefRecommended: true },
  { id: "d2", name: "Tiramisu", description: "Espresso-soaked ladyfingers, mascarpone, cocoa powder", price: 229, category: "Desserts", image: dessert, featured: false, chefRecommended: true },
  { id: "d3", name: "New York Cheesecake", description: "Creamy baked cheesecake, graham cracker crust, berry sauce", price: 189, category: "Desserts", image: dessert, featured: false, chefRecommended: false },
];

export const categories = ["All", "Pizzas", "Burgers", "Pasta", "Beverages", "Desserts"];
