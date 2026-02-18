import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function TimerBar({ duration = 30, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = useMotionValue(1);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const barColor = useTransform(
    progress,
    [0, 0.33, 0.66, 1],
    ['#ef4444', '#f97316', '#eab308', '#22c55e']
  );

  const barWidth = useTransform(progress, (v) => `${v * 100}%`);

  // Animated bar
  useEffect(() => {
    progress.set(1);
    const ctrl = animate(progress, 0, {
      duration,
      ease: 'linear',
    });
    return () => ctrl.stop();
  }, [duration]);

  // Countdown display
  useEffect(() => {
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onExpireRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);

  const pct = timeLeft / duration;
  const timeColor =
    pct > 0.5 ? 'text-green-400' : pct > 0.25 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Time Remaining
        </span>
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-sm font-bold tabular-nums ${timeColor}`}
        >
          {timeLeft}s
        </motion.span>
      </div>

      {/* Track */}
      <div className="w-full h-3 bg-gray-700/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: barWidth,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}
