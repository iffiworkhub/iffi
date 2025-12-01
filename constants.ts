import { Instruction, OpCode, Program, ThemeColors, ThemeName, VirtualFile } from "./types";

// --- BRANDING ---
export const BRANDING = {
  developer: "Iftikhar Ali",
  role: "Software Engineer",
  company: "iffi.dev",
  email: "iffibaloch334@gmail.com",
  phone: "03181998588",
  website: "https://iffi-dev-crafted-code.vercel.app",
  inspiration: "Dr. Amanat Ali, Waqar Ali",
  teacher: "Prof. Ghanwa",
  headerComment: `// Iffi Virtual PC Simulator
// Fully Functional CPU + RAM + Disk Simulation
// Developed by Iftikhar Ali`
};

// --- THEMES ---
export const THEMES: Record<ThemeName, ThemeColors> = {
  'neon-cyan': {
    primary: 'cyan-500',
    secondary: 'blue-600',
    accent: 'white',
    bg: 'slate-900',
    text: 'cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]'
  },
  'cyber-purple': {
    primary: 'purple-500',
    secondary: 'fuchsia-600',
    accent: 'pink-400',
    bg: 'zinc-900',
    text: 'purple-300',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]'
  },
  'matrix-green': {
    primary: 'green-500',
    secondary: 'emerald-700',
    accent: 'green-300',
    bg: 'black',
    text: 'green-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.6)]'
  },
  'fire-orange': {
    primary: 'orange-500',
    secondary: 'red-600',
    accent: 'yellow-400',
    bg: 'stone-900',
    text: 'orange-400',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]'
  },
  'royal-gold': {
    primary: 'yellow-500',
    secondary: 'amber-700',
    accent: 'yellow-200',
    bg: 'slate-950',
    text: 'amber-400',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.6)]'
  }
};

// --- SAMPLE PROGRAMS ---

// 1. Addition Program
// Adds 10 + 20 and stores in Memory[50]
const PROG_ADDITION: Instruction[] = [
  { id: '1', op: OpCode.MOV, args: [0, 10], description: 'MOV R0, 10' },
  { id: '2', op: OpCode.MOV, args: [1, 20], description: 'MOV R1, 20' },
  { id: '3', op: OpCode.ADD, args: [0, 1], description: 'ADD R0, R1' },
  { id: '4', op: OpCode.STORE, args: [0, 50], description: 'STORE R0 -> MEM[50]' },
  { id: '5', op: OpCode.PRINT, args: [0], description: 'PRINT R0' },
  { id: '6', op: OpCode.HALT, args: [], description: 'HALT' }
];

// 2. Search Program (Functional Fix)
// Searches for value 99 in memory.
// Uses R3 as an incrementer (value 1) to ensure ADD works with registers.
const PROG_SEARCH: Instruction[] = [
  { id: '1', op: OpCode.MOV, args: [0, 100], description: 'MOV R0, 100 (Start)' },
  { id: '2', op: OpCode.MOV, args: [1, 99], description: 'MOV R1, 99 (Target)' }, 
  { id: '3', op: OpCode.MOV, args: [3, 1], description: 'MOV R3, 1 (Inc)' }, 
  { id: '4', op: OpCode.LOAD, args: [2, 0], description: 'LOAD R2 <- MEM[R0]' },
  { id: '5', op: OpCode.CMP, args: [2, 1], description: 'CMP R2, R1' },
  { id: '6', op: OpCode.JZ, args: [10], description: 'JZ -> Found (Jump)' },
  { id: '7', op: OpCode.ADD, args: [0, 3], description: 'ADD R0, R3 (Next)' },
  { id: '8', op: OpCode.CMP, args: [0, 105], description: 'CMP R0, 105 (End)' },
  { id: '9', op: OpCode.JMP, args: [4], description: 'JMP -> Loop Start' },
  { id: '10', op: OpCode.PRINT, args: [0], description: 'PRINT "Found At" R0' },
  { id: '11', op: OpCode.HALT, args: [], description: 'HALT' }
];

// 3. Sorting Program (Bubble Sort Step Visual)
const PROG_SORT: Instruction[] = [
  { id: '1', op: OpCode.MOV, args: [0, 200], description: 'MOV R0, 200 (Addr A)' },
  { id: '2', op: OpCode.MOV, args: [1, 201], description: 'MOV R1, 201 (Addr B)' },
  { id: '3', op: OpCode.LOAD, args: [2, 0], description: 'LOAD R2 <- MEM[200]' },
  { id: '4', op: OpCode.LOAD, args: [3, 1], description: 'LOAD R3 <- MEM[201]' },
  { id: '5', op: OpCode.CMP, args: [2, 3], description: 'CMP R2, R3' },
  { id: '6', op: OpCode.JZ, args: [10], description: 'JZ (Skip Swap)' }, 
  { id: '7', op: OpCode.STORE, args: [3, 0], description: 'STORE R3 -> MEM[200]' },
  { id: '8', op: OpCode.STORE, args: [2, 1], description: 'STORE R2 -> MEM[201]' },
  { id: '9', op: OpCode.PRINT, args: [2], description: 'PRINT "Swapped"' },
  { id: '10', op: OpCode.HALT, args: [], description: 'HALT' }
];

export const PROGRAMS: Program[] = [
  { name: 'Addition', description: 'Simple Add & Store', instructions: PROG_ADDITION },
  { name: 'Search', description: 'Find 99 in RAM', instructions: PROG_SEARCH },
  { name: 'Sorting', description: 'Compare & Swap', instructions: PROG_SORT },
];

export const INITIAL_FILES: VirtualFile[] = [
  { name: 'System', type: 'dir', children: [
      { name: 'kernel.sys', type: 'file', content: 'BINARY_DATA_CORRUPT' },
      { name: 'boot.log', type: 'file', content: 'POST OK. MEM OK. CPU OK.' }
    ] 
  },
  { name: 'Documents', type: 'dir', children: [
      { name: 'project_iffi.txt', type: 'file', content: 'Virtual PC Project by Iftikhar Ali.' },
      { name: 'notes.txt', type: 'file', content: 'Remember to check memory address 99.' }
    ]
  },
  { name: 'Pictures', type: 'dir', children: [
      { 
        name: 'author.jpg', 
        type: 'file', 
        contentUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop', // Placeholder for "Reference Image"
        content: 'Image File'
      },
      { 
        name: 'cyber_city.jpg', 
        type: 'file', 
        contentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', 
        content: 'Image File'
      }
    ]
  },
  { name: 'Music', type: 'dir', children: [
      { name: 'startup_beat.mp3', type: 'file', content: 'Audio File' },
      { name: 'retro_wave.mp3', type: 'file', content: 'Audio File' }
    ]
  },
  { name: 'readme.txt', type: 'file', content: 'Welcome to Iffi Virtual PC.\nDouble click files to open.\nRun programs from the Start Menu.' }
];