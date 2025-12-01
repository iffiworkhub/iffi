import React, { useEffect, useRef } from 'react';
import { CpuState, ThemeColors } from '../types';
import { Activity, Cpu, Thermometer } from 'lucide-react';

interface BackendWindowProps {
  cpu: CpuState;
  logs: string[];
  theme: ThemeColors;
}

export const BackendWindow: React.FC<BackendWindowProps> = ({ cpu, logs, theme }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`h-full flex flex-col bg-black/90 text-${theme.text} font-mono text-xs border-r border-gray-800`}>
      <div className={`p-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Cpu size={14} className={`text-${theme.primary}`} />
          <span className="font-bold uppercase">Backend Processor</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={cpu.status === 'RUNNING' ? 'text-green-500 animate-pulse' : 'text-red-500'}>
            ● {cpu.status}
          </span>
        </div>
      </div>

      {/* Registers */}
      <div className="p-3 grid grid-cols-4 gap-2 border-b border-gray-800 bg-gray-900/20">
        {cpu.registers.map((val, idx) => (
          <div key={idx} className="bg-gray-800/50 p-1 rounded border border-gray-700">
            <div className="text-[9px] text-gray-500">R{idx}</div>
            <div className={`text-${theme.primary} font-bold`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="p-3 grid grid-cols-3 gap-2 border-b border-gray-800 bg-gray-900/20">
         <div className="flex flex-col">
            <span className="text-gray-500 text-[9px]">PC</span>
            <span className="text-white">{cpu.pc}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-gray-500 text-[9px]">CYCLES</span>
            <span className="text-white">{cpu.cycleCount}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-gray-500 text-[9px]">TEMP</span>
            <div className="flex items-center gap-1">
              <Thermometer size={10} className={cpu.temperature > 80 ? 'text-red-500' : 'text-blue-500'}/>
              <span className={cpu.temperature > 80 ? 'text-red-500' : 'text-white'}>
                {cpu.temperature.toFixed(1)}°C
              </span>
            </div>
         </div>
      </div>

      {/* Instruction Stream / Execution Log */}
      <div className="flex-1 overflow-hidden flex flex-col bg-black">
        <div className="p-2 bg-gray-900 text-[10px] text-gray-400 uppercase tracking-wide flex justify-between border-b border-gray-800">
           <span>Execution Log</span>
           <span className="text-xs">Console Output</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {logs.map((log, i) => {
            let colorClass = "text-gray-400";
            let borderClass = "border-gray-800";
            
            // Syntax Highlighting for Logs
            if (log.startsWith("SYSCALL")) {
                colorClass = `text-${theme.secondary} font-bold`;
                borderClass = `border-${theme.secondary}`;
            } else if (log.startsWith("NET_REQ") || log.startsWith("HTTP")) {
                colorClass = "text-blue-400 font-bold";
                borderClass = "border-blue-500";
            } else if (log.startsWith(">> OUTPUT")) {
                colorClass = "text-green-400 font-bold";
                borderClass = "border-green-500";
            } else if (log.startsWith("ERR")) {
                colorClass = "text-red-500";
                borderClass = "border-red-500";
            } else if (log.startsWith("LOADED")) {
                colorClass = "text-white font-bold underline";
            }

            return (
              <div key={i} className={`font-mono text-[10px] border-l-2 pl-2 py-0.5 ${borderClass} ${colorClass}`}>
                <span className="opacity-30 mr-2 text-[9px]">[{i.toString().padStart(3, '0')}]</span>
                {log}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};