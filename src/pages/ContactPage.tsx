import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => (data[k] = v.toString()));

    try {
      const res = await fetch("https://formspree.io/f/xreoodow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        toast.success("Message sent!");
      } else {
        toast.error("Failed to send. Please try again.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <SectionHeading title="Get in Touch" subtitle="We'd love to hear from you" />

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {[
              { icon: Phone, label: "Phone", value: "+91 97480 04981", href: "tel:+919748004981" },
              { icon: Mail, label: "Email", value: "swarnavamalakar863@gmail.com", href: "mailto:swarnavamalakar863@gmail.com" },
              { icon: MapPin, label: "Address", value: "123 Food Street, Kolkata, WB 700001" },
              { icon: Clock, label: "Hours", value: "Mon–Sun: 11:00 AM – 11:00 PM" },
            ].map((item) => (
              <div key={item.label} className="glass-card p-5 flex items-start gap-4">
                <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-foreground text-sm">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <div className="text-muted-foreground text-sm">{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl overflow-hidden h-48">
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
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {success ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">✉️</div>
                <h3 className="font-display text-2xl text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">We'll get back to you soon.</p>
                <Button onClick={() => setSuccess(false)} className="bg-primary text-primary-foreground">Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Name *</label>
                  <Input name="name" required placeholder="Your name" className="bg-background border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email *</label>
                  <Input name="email" type="email" required placeholder="you@email.com" className="bg-background border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Message *</label>
                  <Textarea name="message" required placeholder="How can we help?" className="bg-background border-border" rows={5} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-6 text-lg font-semibold">
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
