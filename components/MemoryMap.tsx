import React, { useMemo } from 'react';
import { MemorySlot } from '../types';

interface MemoryMapProps {
  memory: MemorySlot[];
}

export const MemoryMap: React.FC<MemoryMapProps> = ({ memory }) => {
  // We only render a subset to keep DOM light, or render small blocks
  // 1024 slots is fine for modern React if pure
  
  return (
    <div className="flex flex-col h-full bg-black/40 border border-gray-700 rounded p-2">
      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">RAM Map (1024 Slots)</h3>
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-16 gap-0.5">
          {memory.map((slot) => {
            const isHot = Date.now() - slot.lastAccessTick < 200;
            const hasData = slot.value !== 0;
            
            let bgClass = 'bg-gray-900';
            if (isHot) bgClass = 'bg-white scale-110 shadow-lg shadow-cyan-500/50 z-10';
            else if (hasData) bgClass = 'bg-cyan-700';

            return (
              <div 
                key={slot.address} 
                title={`Addr: ${slot.address} | Val: ${slot.value}`}
                className={`w-full pt-[100%] relative rounded-[1px] transition-all duration-300 ${bgClass}`}
              >
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
        <span>0x0000</span>
        <span>0x0400</span>
      </div>
    </div>
  );
};