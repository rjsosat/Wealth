
import { motion } from 'framer-motion';

export function ProgressBar({ progress, color = 'bg-indigo-500', height = 'h-2', trackColor = 'bg-gray-100' }: { progress: number, color?: string, height?: string, trackColor?: string }) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full ${trackColor} rounded-full overflow-hidden ${height}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${safeProgress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`${color} h-full rounded-full`}
      />
    </div>
  );
}
