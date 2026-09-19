import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CarouselSettingsManager } from '../../src/components/admin/CarouselSettingsManager';
import { CarouselConfig } from '../../src/types';

describe('CarouselSettingsManager Integration', () => {
  const mockConfig: CarouselConfig = {
    mode: 'carousel',
    steadyPhotoId: 'photo-1',
    autoPlay: true,
    intervalSeconds: 4,
    showArrows: true,
    showIndicators: true,
    showCaptions: true,
    photos: [
      {
        id: 'photo-1',
        url: '/static/images/carousel/carousel-photo-1.jpg',
        caption: 'Keynote Speaker at Tech Summit',
        tag: 'Carousel',
        isIncludedInCarousel: true,
        order: 1,
        dateAdded: '2026-09-01T21:58:17.275Z',
      },
      {
        id: 'photo-2',
        url: '/static/images/events/robotics-mentorship.jpg',
        caption: 'Robotics Mentorship',
        tag: 'Events',
        isIncludedInCarousel: true,
        order: 2,
        dateAdded: '2026-09-01T21:58:43.314Z',
      },
    ],
  };

  it('renders carousel configuration with correct tags and photos', () => {
    const handleSave = vi.fn();
    render(<CarouselSettingsManager config={mockConfig} onSaveConfig={handleSave} />);

    // Check header
    expect(screen.getByText(/Intro Section Photo Carousel & Steady Control/i)).toBeInTheDocument();

    // Check photos rendered
    expect(screen.getByDisplayValue('Keynote Speaker at Tech Summit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Robotics Mentorship')).toBeInTheDocument();

    // Check tags
    expect(screen.getAllByText('Carousel').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Events').length).toBeGreaterThanOrEqual(1);
  });

  it('allows clicking quick preset chips to set Category Tag', () => {
    const handleSave = vi.fn();
    render(<CarouselSettingsManager config={mockConfig} onSaveConfig={handleSave} />);

    const mentoringChip = screen.getByRole('button', { name: 'Mentoring' });
    expect(mentoringChip).toBeInTheDocument();

    fireEvent.click(mentoringChip);

    const tagInput = screen.getByPlaceholderText(/e\.g\. Carousel, Events/i) as HTMLInputElement;
    expect(tagInput.value).toBe('Mentoring');
  });

  it('allows switching display mode between Carousel and Steady photo', () => {
    const handleSave = vi.fn();
    render(<CarouselSettingsManager config={mockConfig} onSaveConfig={handleSave} />);

    const steadyModeTitle = screen.getByText(/Steady Picture Locked/i);
    fireEvent.click(steadyModeTitle);

    const saveBtn = screen.getByRole('button', { name: /Save Carousel Settings/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'steady',
        autoPlay: false,
      })
    );
  });
});
