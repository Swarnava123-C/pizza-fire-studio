import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import chefImg from "@/assets/chef.jpg";
import interiorImg from "@/assets/restaurant-interior.jpg";

const AboutPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4">
      <SectionHeading title="About PizzaFast" subtitle="Where passion meets flavor" />

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h3 className="font-display text-3xl text-foreground mb-4">Our Story</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            PizzaFast was born in 2020 from a simple idea: why can't fast food be premium? Our founder, Chef Marco Rossi, spent years perfecting recipes that deliver restaurant-quality taste in record time.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Every ingredient is sourced fresh daily. Our dough is hand-stretched, our sauces are made from scratch, and our burgers use only 100% grass-fed beef. We believe fast doesn't have to mean compromise.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, PizzaFast is a beloved neighborhood staple, serving over 50,000 happy customers and counting. But we're just getting started.
          </p>
        </motion.div>
        <motion.img
          src={interiorImg}
          alt="PizzaFast interior"
          loading="lazy"
          width={600}
          height={400}
          className="rounded-2xl w-full h-80 md:h-96 object-cover"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          src={chefImg}
          alt="Chef Marco Rossi"
          loading="lazy"
          width={600}
          height={600}
          className="rounded-2xl w-full h-80 md:h-96 object-cover order-2 md:order-1"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="order-1 md:order-2"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-display text-3xl text-foreground mb-4">Meet Chef Marco</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            With over 15 years of culinary experience across Italy, New York, and Mumbai, Chef Marco brings a global perspective to every dish. His philosophy is simple: use the best ingredients, respect the craft, and never stop innovating.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            "Food is love made visible. At PizzaFast, every dish is a love letter to our guests." — Chef Marco Rossi
          </p>
        </motion.div>
      </div>
    </div>
  </main>
);

export default AboutPage;
