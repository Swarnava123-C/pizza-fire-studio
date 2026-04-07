import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, X } from "lucide-react";

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string | null;
  status: string;
  created_at: string;
}

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setReviews(data as Review[]);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success(`Review ${status}`);
    load();
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Reviews</h1>

      {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}

      <div className="grid gap-3">
        {reviews.map((r) => (
          <div key={r.id} className={`glass-card p-5 ${r.status === "rejected" ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-foreground">{r.customer_name}</div>
                <div className="text-sm text-muted-foreground">{r.customer_email}</div>
                {renderStars(r.rating)}
              </div>
              <Badge variant="outline">{r.status}</Badge>
            </div>
            {r.review_text && <p className="text-sm text-foreground mt-2">{r.review_text}</p>}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(r.id, "approved")} className="bg-green-600/20 text-green-400 hover:bg-green-600/30">
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "rejected")} className="text-destructive">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReviewsManager;
