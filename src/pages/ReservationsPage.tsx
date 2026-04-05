import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SectionHeading from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
  "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM",
];

const foodOptions = [
  "Margherita Classica", "Pepperoni Inferno", "BBQ Chicken Supreme", "Classic Smash Burger",
  "Truffle Mushroom Burger", "Carbonara", "Alfredo Fettuccine", "Penne Arrabbiata",
  "Strawberry Blast", "Chocolate Lava Cake", "Tiramisu", "Classic Lemonade",
];

const ReservationsPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [otherFood, setOtherFood] = useState("");

  const toggleFood = (name: string) => {
    setSelectedFoods((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string;
    const guests = parseInt(fd.get("guests") as string);
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const instructions = fd.get("instructions") as string;
    const foodPrefs = [...selectedFoods, otherFood].filter(Boolean).join(", ");

    try {
      // Save to database
      await supabase.from("reservations").insert({
        name, email, phone, guests,
        reservation_date: date,
        time_slot: time,
        food_preferences: foodPrefs || null,
        instructions: instructions || null,
      });

      // Also send to Formspree
      await fetch("https://formspree.io/f/xreoodow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, guests, date, time, food_preferences: foodPrefs, instructions }),
      });

      setSuccess(true);
      toast.success("Reservation submitted successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl text-foreground mb-3">Reservation Confirmed!</h2>
          <p className="text-muted-foreground mb-6">We've received your booking. You'll get a confirmation email shortly.</p>
          <Button onClick={() => setSuccess(false)} className="bg-primary text-primary-foreground">Book Another</Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <SectionHeading title="Reserve a Table" subtitle="Pick a date, choose your favorites, and leave the rest to us" />
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Name *</label>
              <Input name="name" required placeholder="Your name" className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email *</label>
              <Input name="email" type="email" required placeholder="you@email.com" className="bg-background border-border" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Phone *</label>
              <Input name="phone" type="tel" required placeholder="+91 XXXXX XXXXX" className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Guests *</label>
              <Input name="guests" type="number" min={1} max={20} required placeholder="Number of guests" className="bg-background border-border" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Date *</label>
              <Input name="date" type="date" required className="bg-background border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Time Slot *</label>
              <select name="time" required className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="">Select time</option>
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">Food Preferences (optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {foodOptions.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <Checkbox checked={selectedFoods.includes(item)} onCheckedChange={() => toggleFood(item)} />
                  <span className="truncate">{item}</span>
                </label>
              ))}
            </div>
            <Input placeholder="Other preferences..." value={otherFood} onChange={(e) => setOtherFood(e.target.value)} className="bg-background border-border" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Special Instructions</label>
            <Textarea name="instructions" placeholder="Any special requests?" className="bg-background border-border" rows={3} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-6 text-lg font-semibold">
            {loading ? "Submitting..." : "Reserve My Table"}
          </Button>
        </motion.form>
      </div>
    </main>
  );
};

export default ReservationsPage;
