import { motion } from "framer-motion";
import TableMap from "@/components/TableMap";

const TableMapPage = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h1 className="font-display text-3xl gradient-text">Table Availability</h1>
      <p className="text-muted-foreground text-sm">Click on a table to change its status</p>
      <TableMap />
    </motion.div>
  );
};

export default TableMapPage;
