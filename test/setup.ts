import { vi } from 'vitest';

// Mock Next.js headers/navigation
vi.mock('next/headers', () => ({
    headers: vi.fn(() => new Map()),
    cookies: vi.fn(() => new Map()),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
    useRouter: vi.fn(),
}));

// Mock Resend
vi.mock('resend', () => ({
    Resend: vi.fn().mockImplementation(() => ({
        emails: {
            send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
        },
    })),
}));

// Mock ReCAPTCHA - REMOVED

// Mock IP helper
vi.mock('@/lib/events', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/events')>();
    return {
        ...actual,
        logEvent: vi.fn().mockResolvedValue({}),
    };
});
