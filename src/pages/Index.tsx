import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Award, ChefHat, Star, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import MenuCard from "@/components/MenuCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroPizza from "@/assets/hero-pizza.jpg";
import chefImg from "@/assets/chef.jpg";
import interiorImg from "@/assets/restaurant-interior.jpg";
import margherita from "@/assets/menu/margherita.jpg";
import burger from "@/assets/menu/burger.jpg";
import pasta from "@/assets/menu/pasta.jpg";
import beverages from "@/assets/menu/beverages.jpg";
import dessert from "@/assets/menu/dessert.jpg";

const fallbackImages: Record<string, string> = {
  Pizzas: margherita, Burgers: burger, Pasta: pasta, Beverages: beverages, Desserts: dessert,
};

const faqs = [
  { q: "What are your opening hours?", a: "We're open Monday–Sunday, 11:00 AM – 11:00 PM." },
  { q: "Do you take walk-in guests?", a: "Yes! Walk-ins are welcome. Reservations are recommended for weekends." },
  { q: "Is parking available?", a: "Free parking is available for all guests at our location." },
  { q: "Do you offer vegan options?", a: "Absolutely! We have a dedicated vegan section on our menu." },
];

const testimonials = [
  { name: "Priya S.", text: "Best pizza in town! The Margherita is perfection. 10/10 recommend.", rating: 5 },
  { name: "Rahul M.", text: "Amazing burgers and the vibe is incredible. My family's new favorite spot.", rating: 5 },
  { name: "Anjali K.", text: "The Chocolate Lava Cake alone is worth the trip. Outstanding quality!", rating: 5 },
];

const Index = () => {
  const [featuredItems, setFeaturedItems] = useState<Tables<"menu_items">[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("featured", true).limit(6);
      if (data) setFeaturedItems(data);
    };
    load();
  }, []);

  const featured = featuredItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    category: item.category,
    image: item.image_url || fallbackImages[item.category] || margherita,
    featured: item.featured,
    chefRecommended: item.chef_recommended,
  }));

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPizza} alt="Signature Pizza" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider gradient-text mb-6">
              Hot. Fresh. Fast.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Premium fast-casual dining crafted with passion. From wood-fired pizzas to gourmet burgers — every bite tells a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reservations">
                <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 font-semibold hover:bg-primary/90">
                  Book a Table <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-foreground/20 text-foreground hover:bg-foreground/10">
                  View Menu
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Clock, label: "Years of Excellence", value: "5+" },
              { icon: Users, label: "Happy Customers", value: "50K+" },
              { icon: Award, label: "Awards Won", value: "12" },
              { icon: ChefHat, label: "Expert Chefs", value: "8" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-display text-4xl text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionHeading title="Our Story" subtitle="" center={false} />
              <p className="text-muted-foreground leading-relaxed mb-6">
                Born from a love of authentic flavors and fast service, PizzaFast brings you the best of both worlds. Our chefs combine traditional recipes with modern techniques to create dishes that are as beautiful as they are delicious.
              </p>
              <div className="flex items-center gap-4">
                <img src={chefImg} alt="Chef Marco" loading="lazy" width={64} height={64} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                <div>
                  <div className="font-semibold text-foreground">Chef Marco Rossi</div>
                  <div className="text-sm text-muted-foreground">Head Chef & Founder</div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <img src={interiorImg} alt="Restaurant interior" loading="lazy" width={600} height={400} className="rounded-2xl w-full object-cover h-80 md:h-96" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto">
          <SectionHeading title="Popular Dishes" subtitle="Fan favorites that keep our guests coming back for more" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/menu">
              <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                See Full Menu <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container mx-auto relative z-10 text-center">
          <SectionHeading title="Reserve Your Table" subtitle="Special occasions or casual dinners — we've got the perfect table for you" />
          <Link to="/reservations">
            <Button size="lg" className="bg-primary text-primary-foreground text-lg px-10 py-6 font-semibold">
              Book Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto">
          <SectionHeading title="What Our Guests Say" subtitle="Real reviews from real food lovers" />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="text-sm text-muted-foreground font-medium">— {t.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding">
        <div className="container mx-auto">
          <SectionHeading title="Find Us" subtitle="We're located in the heart of the city" />
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Address</div>
                  <div className="text-muted-foreground text-sm">123 Food Street, Kolkata, West Bengal 700001</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Phone</div>
                  <a href="tel:+919748004981" className="text-muted-foreground text-sm hover:text-primary transition-colors">+91 97480 04981</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Hours</div>
                  <div className="text-muted-foreground text-sm">Mon–Sun: 11:00 AM – 11:00 PM</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-72 md:h-80">
              <iframe
                title="PizzaFast Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.1236754!2d88.3473!3d22.5726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM0JzIxLjQiTiA4OMKwMjAnNTAuMyJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading title="FAQ" subtitle="Frequently asked questions" />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-card p-5 group cursor-pointer"
              >
                <summary className="font-semibold text-foreground list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
