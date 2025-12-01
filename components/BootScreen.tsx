import React, { useEffect, useState } from 'react';
import { BRANDING } from '../constants';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const bootSequence = [
      `IFFI-BIOS (c) 2025 ${BRANDING.company}`,
      `Developer: ${BRANDING.developer}`,
      "Initializing Virtual Hardware...",
      "CPU: Iffi-Core X1 @ 4.0GHz - OK",
      "RAM: 1024 Blocks mapped - OK",
      "Video: NEON-FX GPU - OK",
      "Loading Kernel...",
      "Mounting Virtual Filesystem...",
      "System Check Passed.",
      "Booting OS..."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 400 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setTimeout(onComplete, 1000);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-black text-cyan-500 font-mono p-8 flex flex-col justify-start items-start text-sm md:text-base leading-relaxed overflow-hidden">
      <div className="mb-4 text-white font-bold border-b border-gray-700 w-full pb-2">
        {BRANDING.company} WORKSTATION
      </div>
      {lines.map((line, i) => (
        <div key={i} className="animate-fade-in">{line}</div>
      ))}
      <div className="mt-auto w-full border-t border-gray-800 pt-2 text-xs text-gray-500">
        Contact: {BRANDING.email} | {BRANDING.phone}
      </div>
    </div>
  );
};