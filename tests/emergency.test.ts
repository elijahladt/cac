import { describe, it, expect } from 'vitest';
import { detectImmediateEmergency, EMERGENCY_SERVICES } from '@/lib/emergency';

describe('Emergency Module Tests', () => {
  it('should detect emergency keywords in English', () => {
    expect(detectImmediateEmergency('I want to kill myself')).toBe(true);
    expect(detectImmediateEmergency('Someone is having a heart attack')).toBe(true);
  });

  it('should detect emergency keywords in Spanish', () => {
    expect(detectImmediateEmergency('Siento deseos de suicidio')).toBe(true);
    expect(detectImmediateEmergency('Alguien me quiere quitarme la vida')).toBe(true);
  });

  it('should detect emergency keywords in Tagalog', () => {
    expect(detectImmediateEmergency('Gusto kong magpakamatay')).toBe(true);
  });

  it('should not flag non-emergency requests', () => {
    expect(detectImmediateEmergency('I need food for my kids')).toBe(false);
    expect(detectImmediateEmergency('My electric bill is overdue')).toBe(false);
    expect(detectImmediateEmergency('Necesito ayuda con el alquiler')).toBe(false);
  });

  it('should contain verified 911, 988, and 211 numbers', () => {
    const numbers = EMERGENCY_SERVICES.map((s) => s.number);
    expect(numbers).toContain('911');
    expect(numbers).toContain('988');
    expect(numbers).toContain('2-1-1');
  });
});
