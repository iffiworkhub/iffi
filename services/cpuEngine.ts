import { CpuState, Instruction, MemorySlot, OpCode } from "../types";

export class CpuEngine {
  // Execute a single step
  static step(state: CpuState, memory: MemorySlot[], instructions: Instruction[], outputLog: (msg: string) => void): { newState: CpuState, newMemory: MemorySlot[] } {
    const newState = { ...state, cycleCount: state.cycleCount + 1 };
    const newMemory = [...memory];
    
    // 1. Fetch
    if (newState.pc >= instructions.length) {
      newState.status = 'HALTED';
      return { newState, newMemory };
    }
    
    const instr = instructions[newState.pc];
    newState.ir = instr;
    
    // Simulate Heat
    newState.temperature = Math.min(90, newState.temperature + Math.random() * 2);

    // 2. Decode & Execute
    try {
      const { op, args } = instr;
      
      switch (op) {
        case OpCode.MOV: // MOV TargetReg, Value
          newState.registers[args[0]] = args[1];
          outputLog(`MOV: R${args[0]} set to ${args[1]}`);
          break;

        case OpCode.ADD: // ADD R_dest, R_src (or Immediate if > 7)
            const r1 = newState.registers[args[0]];
            // If the second arg is a valid register index (0-7), use the register value.
            // Otherwise, treat it as an immediate value.
            const val2 = (args[1] >= 0 && args[1] <= 7) ? newState.registers[args[1]] : args[1];
            
            newState.registers[args[0]] = r1 + val2;
            outputLog(`ADD: R${args[0]} = ${r1} + ${val2} => ${newState.registers[args[0]]}`);
          break;

        case OpCode.SUB:
          newState.registers[args[0]] -= newState.registers[args[1]];
          newState.zeroFlag = newState.registers[args[0]] === 0;
          break;

        case OpCode.CMP:
          const vA = newState.registers[args[0]];
          const vB = args[1] > 7 ? args[1] : newState.registers[args[1]]; // Allow immediate compare
          newState.zeroFlag = (vA === vB);
          outputLog(`CMP: R${args[0]}(${vA}) vs ${vB} -> ZeroFlag: ${newState.zeroFlag}`);
          break;

        case OpCode.JMP:
          newState.pc = args[0] - 1; // -1 because we increment at end
          outputLog(`JMP: Jump to line ${args[0]}`);
          break;

        case OpCode.JZ:
          if (newState.zeroFlag) {
            newState.pc = args[0] - 1;
            outputLog(`JZ: Condition met. Jumping to ${args[0]}`);
          }
          break;

        case OpCode.LOAD: // LOAD TargetReg, SourceReg(as Addr) or ImmediateAddr
          const addr = newState.registers[args[1]];
          if (addr >= 0 && addr < 1024) {
             newState.registers[args[0]] = newMemory[addr].value;
             newMemory[addr].lastAccessTick = Date.now();
             outputLog(`LOAD: R${args[0]} <- MEM[${addr}] (${newMemory[addr].value})`);
          } else {
             outputLog(`ERR: SegFault at ${addr}`);
          }
          break;

        case OpCode.STORE: // STORE SourceReg, DestAddr (Immediate) OR DestReg
          let targetAddr = args[1];
          // If target < 8, assume it's a register holding the address
          if (targetAddr < 8) {
             targetAddr = newState.registers[targetAddr];
          }

          if (targetAddr >= 0 && targetAddr < 1024) {
             newMemory[targetAddr].value = newState.registers[args[0]];
             newMemory[targetAddr].lastAccessTick = Date.now();
             outputLog(`STORE: MEM[${targetAddr}] <- R${args[0]} (${newState.registers[args[0]]})`);
          }
          break;

        case OpCode.PRINT:
          outputLog(`>> OUTPUT: ${newState.registers[args[0]]}`);
          break;

        case OpCode.HALT:
          newState.status = 'HALTED';
          outputLog('CPU HALTED');
          break;
      }
    } catch (e) {
      newState.status = 'ERROR';
      newState.lastError = (e as Error).message;
    }

    if (newState.status === 'RUNNING') {
       newState.pc++;
    }

    return { newState, newMemory };
  }
}