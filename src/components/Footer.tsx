import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const socialLinks = [
  { name: "Instagram", url: "https://instagram.com/swar.nava1110" },
  { name: "Facebook", url: "https://facebook.com/profile.php?id=100082480680905" },
  { name: "Twitter", url: "https://x.com/SWARNAVAMA53967" },
  { name: "YouTube", url: "https://youtube.com/@swarnavamalakar4063" },
];

const Footer = () => (
  <footer className="bg-secondary border-t border-border">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="font-display text-3xl gradient-text mb-4">PizzaFast</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Hot. Fresh. Fast. Serving premium fast-casual food with love since 2020.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["/menu", "/about", "/reservations", "/contact"].map((path) => (
              <Link key={path} to={path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Contact</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href="tel:+919748004981" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> +91 97480 04981
            </a>
            <a href="mailto:swarnavamalakar863@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" /> swarnavamalakar863@gmail.com
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 123 Food Street, Kolkata
            </p>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
          <div className="flex flex-col gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PizzaFast. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
