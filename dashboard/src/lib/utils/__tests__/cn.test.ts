/**
 * Tests for cn utility (className merger)
 */

import { cn } from '../cn';

describe('cn Utility', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe(
      'base active'
    );
  });

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('should merge Tailwind conflicting classes correctly', () => {
    // twMerge should keep the last class when they conflict
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle objects', () => {
    expect(
      cn({
        active: true,
        inactive: false,
        pending: true,
      })
    ).toBe('active pending');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });
});
