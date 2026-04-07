import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

interface ReviewData {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const ReviewSection = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: user?.email || "", rating: 5, review_text: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    const { data } = await supabase.from("reviews").select("*").eq("status", "approved").order("created_at", { ascending: false }).limit(6);
    if (data) {
      setReviews(data as ReviewData[]);
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Name and email required");
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      customer_name: form.name,
      customer_email: form.email,
      rating: form.rating,
      review_text: form.review_text || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted! It will appear after approval.");
      setForm({ name: "", email: user?.email || "", rating: 5, review_text: "" });
      setShowForm(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-5 h-5 cursor-${interactive ? "pointer" : "default"} transition-colors ${
            s <= (interactive ? hoveredStar || form.rating : rating)
              ? "text-accent fill-accent"
              : "text-muted-foreground"
          }`}
          onClick={interactive ? () => setForm({ ...form, rating: s }) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(s) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        />
      ))}
    </div>
  );

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto">
        <SectionHeading title="What Our Guests Say" subtitle="Real reviews from real food lovers" />

        {avgRating > 0 && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              {renderStars(Math.round(avgRating))}
              <span className="font-display text-3xl text-foreground">{avgRating}</span>
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} approved reviews</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {renderStars(r.rating)}
              </div>
              {r.review_text && <p className="text-foreground mb-4 leading-relaxed">"{r.review_text}"</p>}
              <div className="text-sm text-muted-foreground font-medium">— {r.customer_name}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              Write a Review
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 text-left">
                <h3 className="font-display text-xl text-foreground">Leave a Review</h3>
                <Input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
                <Input placeholder="Your Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border" />
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Rating</label>
                  {renderStars(form.rating, true)}
                </div>
                <Textarea placeholder="Your review (optional)" value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} className="bg-background border-border" rows={3} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground flex-1">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
