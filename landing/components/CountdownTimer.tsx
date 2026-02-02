
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string; // ISO string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  return (
    <div className="flex gap-4">
      <TimeUnit value={h} label="Hrs" />
      <TimeUnit value={m} label="Min" />
      <TimeUnit value={s} label="Sec" />
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="glass w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold mb-2">
      {value.toString().padStart(2, '0')}
    </div>
    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
  </div>
);

export default CountdownTimer;
