import { describe, it, expect } from 'vitest';
import { generateSecureItalianPassword } from '@/lib/auth';

describe('Password Generator', () => {
    it('should generate a password with at least 3 parts and a number', () => {
        const pwd = generateSecureItalianPassword();
        const parts = pwd.split('-');
        expect(parts.length).toBe(4); // 3 words + 1 number
        expect(Number(parts[3])).toBeGreaterThan(999);
    });

    it('should be at least 20 characters long on average', () => {
        const pwd = generateSecureItalianPassword();
        expect(pwd.length).toBeGreaterThan(15);
    });
});
