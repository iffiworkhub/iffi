export enum OpCode {
  MOV = 'MOV',   // Move data
  ADD = 'ADD',   // Arithmetic Add
  SUB = 'SUB',   // Arithmetic Subtract
  CMP = 'CMP',   // Compare
  JMP = 'JMP',   // Jump
  JZ = 'JZ',     // Jump if Zero (after CMP)
  LOAD = 'LOAD', // Load from RAM
  STORE = 'STORE', // Store to RAM
  HALT = 'HALT', // Stop execution
  PRINT = 'PRINT' // Output to console
}

export interface Instruction {
  id: string;
  op: OpCode;
  args: number[]; // [operand1, operand2]
  description: string;
}

export interface CpuState {
  pc: number; // Program Counter
  ir: Instruction | null; // Instruction Register
  registers: number[]; // R0 - R7
  acc: number; // Accumulator
  zeroFlag: boolean; // ALU Flag
  cycleCount: number;
  temperature: number;
  status: 'IDLE' | 'RUNNING' | 'HALTED' | 'ERROR';
  lastError?: string;
}

export interface MemorySlot {
  address: number;
  value: number;
  lastAccessTick: number; // For visualization highlighting
  isInstruction: boolean;
}

export interface VirtualFile {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  contentUrl?: string; // For images/audio
  children?: VirtualFile[];
}

export type ThemeName = 'neon-cyan' | 'cyber-purple' | 'matrix-green' | 'fire-orange' | 'royal-gold';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  glow: string;
}

export interface Program {
  name: string;
  description: string;
  instructions: Instruction[];
}