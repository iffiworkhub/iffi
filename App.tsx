import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BackendWindow } from './components/BackendWindow';
import { BootScreen } from './components/BootScreen';
import { Desktop } from './components/Desktop';
import { MemoryMap } from './components/MemoryMap';
import { BRANDING, INITIAL_FILES, PROGRAMS, THEMES } from './constants';
import { CpuEngine } from './services/cpuEngine';
import { CpuState, MemorySlot, Program, ThemeName } from './types';
import { Power, Play, Pause, RefreshCw } from 'lucide-react';

const MEM_SIZE = 1024;

const App: React.FC = () => {
  // --- STATE ---
  const [powerOn, setPowerOn] = useState(false);
  const [booted, setBooted] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>('neon-cyan');
  
  const [memory, setMemory] = useState<MemorySlot[]>([]);
  const [cpu, setCpu] = useState<CpuState>({
    pc: 0,
    ir: null,
    registers: [0, 0, 0, 0, 0, 0, 0, 0],
    acc: 0,
    zeroFlag: false,
    cycleCount: 0,
    temperature: 35,
    status: 'IDLE'
  });
  
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [execInterval, setExecInterval] = useState<number | null>(null);
  const [speed, setSpeed] = useState(500); // ms per cycle

  const theme = THEMES[themeName];

  // --- INITIALIZATION ---
  useEffect(() => {
    // Init Memory
    const newMem = Array.from({ length: MEM_SIZE }, (_, i) => ({
      address: i,
      value: 0,
      lastAccessTick: 0,
      isInstruction: false
    }));
    
    // Random noise for realism
    for(let i=0; i<50; i++) {
        const addr = Math.floor(Math.random() * MEM_SIZE);
        newMem[addr].value = Math.floor(Math.random() * 255);
    }
    
    // Plant the "Search" target
    newMem[99].value = 99; // Fallback location
    newMem[103].value = 99; // Actual target for program logic
    newMem[200].value = 45; // Sort A
    newMem[201].value = 12; // Sort B

    setMemory(newMem);
  }, []);

  // --- ACTIONS ---
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-99), msg]); // Increased log history size
  };

  const handlePower = () => {
    if (powerOn) {
      setPowerOn(false);
      setBooted(false);
      setCpu(prev => ({...prev, status: 'IDLE', pc: 0, cycleCount: 0}));
      setLogs([]);
      if (execInterval) clearInterval(execInterval);
      setExecInterval(null);
    } else {
      setPowerOn(true);
    }
  };

  const loadProgram = (progName: string) => {
    const prog = PROGRAMS.find(p => p.name === progName);
    if (!prog) return;

    setCurrentProgram(prog);
    setCpu(prev => ({
       ...prev,
       pc: 0,
       registers: [0,0,0,0,0,0,0,0],
       status: 'IDLE',
       cycleCount: 0,
       temperature: 40,
       zeroFlag: false
    }));
    addLog(`LOADED: ${prog.name}`);
  };

  /**
   * Simulates OS level activity when the user interacts with the desktop.
   * Flashes Video Memory (800+) and Kernel Stack (0-50).
   */
  const handleSystemEvent = (action: string) => {
    addLog(`SYSCALL: ${action}`);
    
    setCpu(prev => ({
        ...prev, 
        cycleCount: prev.cycleCount + 15, // Simulate CPU cycles used for UI
        temperature: Math.min(90, prev.temperature + 0.5)
    }));

    setMemory(prevMem => {
        const newMem = [...prevMem];
        
        // 1. Simulate Video Memory Refresh (Addresses 800 - 950)
        // This makes the RAM map "flash" at the bottom when windows open
        const numVideoUpdates = 20;
        for(let i = 0; i < numVideoUpdates; i++) {
            const addr = 800 + Math.floor(Math.random() * 150);
            if(addr < MEM_SIZE) {
                newMem[addr].value = Math.floor(Math.random() * 255);
                newMem[addr].lastAccessTick = Date.now();
            }
        }

        // 2. Simulate Kernel/Stack Activity (Addresses 0 - 50)
        const numStackUpdates = 5;
        for(let i = 0; i < numStackUpdates; i++) {
            const addr = Math.floor(Math.random() * 50);
            newMem[addr].value = Math.floor(Math.random() * 255);
            newMem[addr].lastAccessTick = Date.now();
        }

        return newMem;
    });
  };

  const stepCpu = useCallback(() => {
    if (!currentProgram || cpu.status === 'HALTED' || cpu.status === 'ERROR') {
        if (execInterval) {
            clearInterval(execInterval);
            setExecInterval(null);
        }
        return;
    }

    const { newState, newMemory } = CpuEngine.step(cpu, memory, currentProgram.instructions, addLog);
    
    setCpu(newState);
    setMemory(newMemory);

    // Search Logic Pop-up Requirement
    if (currentProgram.name === 'Search' && newState.ir?.op === 'PRINT') {
       if (newState.ir.id === '9') {
           alert(`Value Found at Memory Address: ${newState.registers[0]}`);
       }
    }
  }, [cpu, memory, currentProgram, execInterval]);

  const toggleRun = () => {
    if (execInterval) {
      clearInterval(execInterval);
      setExecInterval(null);
      setCpu(prev => ({...prev, status: 'IDLE'}));
    } else {
      setCpu(prev => ({...prev, status: 'RUNNING'}));
      const interval = window.setInterval(stepCpu, speed);
      setExecInterval(interval);
    }
  };

  useEffect(() => {
    if (execInterval) {
      clearInterval(execInterval);
      const interval = window.setInterval(stepCpu, speed);
      setExecInterval(interval);
    }
  }, [stepCpu, speed]);

  // --- RENDER ---
  return (
    <div className="h-screen w-screen bg-neutral-900 flex items-center justify-center p-4 md:p-8 font-inter">
      
      {/* CASE CONTAINER */}
      <div className={`relative w-full max-w-7xl aspect-[16/9] bg-gray-900 rounded-xl border-4 border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden ${powerOn ? theme.glow : ''} transition-shadow duration-1000`}>
        
        {/* LEFT: MONITOR */}
        <div className="flex-[3] relative bg-black border-r-4 border-gray-800 flex flex-col p-4">
           {/* Screen Bezel */}
           <div className={`absolute inset-0 border-[16px] border-gray-800 rounded-lg pointer-events-none z-50 shadow-inner`}></div>
           
           {/* Screen Content */}
           <div className="relative h-full w-full bg-black overflow-hidden rounded border border-gray-700">
             <div className="scanline"></div>
             
             {!powerOn && (
               <div className="h-full w-full flex items-center justify-center text-gray-800 font-mono text-xl animate-pulse">
                 NO SIGNAL
               </div>
             )}

             {powerOn && !booted && (
               <div className="h-full w-full flex flex-row">
                 {/* Main Desktop Area */}
                 <div className="flex-1 relative">
                   <BootScreen onComplete={() => setBooted(true)} />
                 </div>
               </div>
             )}

             {powerOn && booted && (
               <div className="h-full w-full flex flex-row">
                 {/* Main Desktop Area */}
                 <div className="flex-1 relative">
                    <Desktop 
                      theme={theme} 
                      setThemeName={setThemeName} 
                      cpu={cpu} 
                      files={INITIAL_FILES}
                      runProgram={(p) => loadProgram(p.name)}
                      onInteract={handleSystemEvent} // Pass the event handler
                    />
                 </div>
               </div>
             )}
           </div>

           {/* Monitor Brand */}
           <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-gray-500 text-[10px] font-bold tracking-widest z-50">
             IFFI VISION 3000
           </div>
        </div>

        {/* RIGHT: SYSTEM INTERNALS (The "Backend") */}
        <div className="flex-[1.2] bg-gray-950 flex flex-col border-l border-gray-700 relative z-40">
           
           {/* Top Control Panel */}
           <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                 <button 
                   onClick={handlePower}
                   className={`w-10 h-10 rounded-full border-2 border-gray-700 flex items-center justify-center transition-all ${powerOn ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_cyan]' : 'text-gray-600 hover:text-white'}`}
                 >
                   <Power size={20} />
                 </button>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">Power</span>
                   <div className={`h-1 w-full rounded-full ${powerOn ? 'bg-cyan-500' : 'bg-red-900'}`}></div>
                 </div>
              </div>

              {powerOn && (
                 <div className="flex gap-2">
                   <button onClick={toggleRun} disabled={!currentProgram || cpu.status === 'HALTED'} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50">
                     {execInterval ? <Pause size={16} className="text-yellow-500"/> : <Play size={16} className="text-green-500"/>}
                   </button>
                   <button onClick={stepCpu} disabled={!currentProgram || !!execInterval || cpu.status === 'HALTED'} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50">
                     <RefreshCw size={16} className="text-white"/>
                   </button>
                 </div>
              )}
           </div>

           {/* Execution View */}
           <div className="flex-1 flex flex-col min-h-0">
             {/* Upper: CPU State & LOGS (EXTENDED) */}
             <div className="h-3/4 border-b border-gray-800 flex flex-col">
               <BackendWindow cpu={cpu} logs={logs} theme={theme} />
             </div>
             
             {/* Lower: Memory Map (COMPACT) */}
             <div className="h-1/4 p-2 bg-gray-900/50 border-t border-gray-800">
               <MemoryMap memory={memory} />
             </div>
           </div>

           {/* Speed Control Footer */}
           <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-4">
             <span className="text-[10px] text-gray-400">CLOCK SPEED</span>
             <input 
               type="range" min="50" max="1000" step="50"
               value={1050 - speed} 
               onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
               className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
           </div>

        </div>

      </div>

      {/* Developer Branding - Footer */}
      <div className="absolute bottom-2 right-4 text-gray-600 text-xs font-mono">
        {BRANDING.headerComment.split('\n')[0]}
      </div>
    </div>
  );
};

export default App;