import { expect, test, describe } from 'vitest';
import { calculateCpm, type CpmTask, type CpmDep } from '@/features/scheduling/logic/cpmMath';

describe('CPM Math Engine (Client-Side)', () => {
  test('calculates float and critical path correctly', () => {
    const tasks: CpmTask[] = [
      { id: 'T1', duration: 5, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false },
      { id: 'T2', duration: 10, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false }
    ];
    const deps: CpmDep[] = [{ pred: 'T1', succ: 'T2', type: 'FS', lag: 0 }];
    const result = calculateCpm(tasks, deps);
    
    expect(result.error).toBeUndefined();
    const t1 = result.tasks.find(t => t.id === 'T1')!;
    const t2 = result.tasks.find(t => t.id === 'T2')!;
    
    expect(t1.es).toBe(0);
    expect(t1.ef).toBe(5);
    expect(t1.is_critical).toBe(true);
    expect(t2.es).toBe(5);
    expect(t2.ef).toBe(15);
    expect(t2.is_critical).toBe(true);
  });

  test('detects circular dependencies', () => {
    const tasks: CpmTask[] = [
      { id: 'T1', duration: 5, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false },
      { id: 'T2', duration: 5, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false }
    ];
    const deps: CpmDep[] = [
      { pred: 'T1', succ: 'T2', type: 'FS', lag: 0 },
      { pred: 'T2', succ: 'T1', type: 'FS', lag: 0 }
    ];
    const result = calculateCpm(tasks, deps);
    expect(result.error).toBe('Circular dependency detected');
  });
});