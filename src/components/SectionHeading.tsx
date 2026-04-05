import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionHeading = ({ title, subtitle, center = true }: SectionHeadingProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6 }}
    className={`mb-12 ${center ? "text-center" : ""}`}
  >
    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide gradient-text">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
        {subtitle}
      </p>
    )}
  </motion.div>
);

export default SectionHeading;
