import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Clock } from "lucide-react";

interface Settings {
  id: string;
  restaurant_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  opening_hours: Record<string, string>;
  logo_url: string;
  notification_email: boolean;
  notification_sms: boolean;
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("restaurant_settings").select("*").limit(1).single();
      if (data) setSettings(data as unknown as Settings);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("restaurant_settings").update({
      restaurant_name: settings.restaurant_name,
      tagline: settings.tagline,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      opening_hours: settings.opening_hours as unknown as import("@/integrations/supabase/types").Json,
      logo_url: settings.logo_url,
      notification_email: settings.notification_email,
      notification_sms: settings.notification_sms,
    }).eq("id", settings.id);
    setSaving(false);
    if (error) return toast.error("Failed to save");
    toast.success("Settings saved!");
  };

  const updateHours = (day: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      opening_hours: { ...settings.opening_hours, [day]: value },
    });
  };

  if (!settings) return <div className="text-muted-foreground p-4">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl gradient-text">Settings</h1>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Restaurant Details */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-xl text-foreground">Restaurant Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Restaurant Name</Label>
            <Input value={settings.restaurant_name} onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="bg-background border-border" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Logo URL</Label>
            <Input value={settings.logo_url} onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })} placeholder="https://..." className="bg-background border-border" />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Opening Hours</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">{DAY_LABELS[day]}</span>
              <Input
                value={settings.opening_hours[day] || ""}
                onChange={(e) => updateHours(day, e.target.value)}
                placeholder="10:00-22:00 or Closed"
                className="bg-background border-border flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-xl text-foreground">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch checked={settings.notification_email} onCheckedChange={(v) => setSettings({ ...settings, notification_email: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS Notifications</Label>
            <Switch checked={settings.notification_sms} onCheckedChange={(v) => setSettings({ ...settings, notification_sms: v })} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
