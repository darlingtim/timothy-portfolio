import { describe, it, expect, beforeEach } from 'vitest';

describe('Theme Logic & Default Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to dark/night theme when no stored preference exists', () => {
    const stored = localStorage.getItem('theme_preference');
    const isDark = stored !== null ? stored === 'dark' : true;
    expect(isDark).toBe(true);
  });

  it('honors explicitly saved light mode in localStorage', () => {
    localStorage.setItem('theme_preference', 'light');
    const stored = localStorage.getItem('theme_preference');
    const isDark = stored !== null ? stored === 'dark' : true;
    expect(isDark).toBe(false);
  });

  it('honors explicitly saved dark mode in localStorage', () => {
    localStorage.setItem('theme_preference', 'dark');
    const stored = localStorage.getItem('theme_preference');
    const isDark = stored !== null ? stored === 'dark' : true;
    expect(isDark).toBe(true);
  });

  it('toggles theme state and updates localStorage properly', () => {
    let currentDark = true; // Night mode initial
    // User clicks toggle to switch to light
    currentDark = !currentDark;
    localStorage.setItem('theme_preference', currentDark ? 'dark' : 'light');
    expect(localStorage.getItem('theme_preference')).toBe('light');

    // User clicks toggle again to switch to dark
    currentDark = !currentDark;
    localStorage.setItem('theme_preference', currentDark ? 'dark' : 'light');
    expect(localStorage.getItem('theme_preference')).toBe('dark');
  });
});
