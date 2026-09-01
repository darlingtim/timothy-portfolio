import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactView } from '../../src/components/ContactView';
import { PROFILE } from '../../src/data';

describe('ContactView Component Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders contact form fields correctly', () => {
    render(<ContactView profile={PROFILE} />);
    expect(screen.getByPlaceholderText(/e.g. Alex Johnson/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/alex@company.org/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mentorship/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your project/i)).toBeInTheDocument();
  });

  it('displays error if submitted with empty fields', async () => {
    const { container } = render(<ContactView profile={PROFILE} />);
    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  it('submits contact form and displays success confirmation', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Delivered' }),
    } as any);

    const onNewMessageMock = vi.fn();
    render(<ContactView profile={PROFILE} onNewMessage={onNewMessageMock} />);

    fireEvent.change(screen.getByPlaceholderText(/e.g. Alex Johnson/i), {
      target: { value: 'Dr. Jane Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText(/alex@company.org/i), {
      target: { value: 'jane@mit.edu' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mentorship/i), {
      target: { value: 'Enterprise Knowledge Graph Project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe your project/i), {
      target: { value: 'Looking to collaborate on a knowledge platform system architecture.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Message transmitted successfully/i)).toBeInTheDocument();
    });
    expect(onNewMessageMock).toHaveBeenCalled();
  });
});
