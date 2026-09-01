import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../src/components/Header';
import { PROFILE } from '../../src/data';

describe('Header Component Integration Tests', () => {
  const defaultProps = {
    currentPath: '/',
    onNavigate: vi.fn(),
    isDark: true,
    onToggleTheme: vi.fn(),
    profile: PROFILE,
    isAdminLoggedIn: false,
    onOpenAdminLogin: vi.fn(),
    onGoToAdmin: vi.fn(),
  };

  it('renders branding title and developer name', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Timothy Ododo')).toBeInTheDocument();
  });

  it('renders primary navigation links on desktop', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument();
  });

  it('calls onNavigate with appropriate path when link is clicked', () => {
    const onNavigateMock = vi.fn();
    render(<Header {...defaultProps} onNavigate={onNavigateMock} />);
    const projectsBtn = screen.getByRole('button', { name: 'Projects' });
    fireEvent.click(projectsBtn);
    expect(onNavigateMock).toHaveBeenCalledWith('/projects');
  });

  it('calls onToggleTheme when theme button is clicked', () => {
    const onToggleThemeMock = vi.fn();
    render(<Header {...defaultProps} onToggleTheme={onToggleThemeMock} />);
    const themeBtn = screen.getByTitle(/Switch to/i);
    fireEvent.click(themeBtn);
    expect(onToggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
