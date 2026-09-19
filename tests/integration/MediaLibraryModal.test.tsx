import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MediaLibraryModal } from '../../src/components/admin/MediaLibraryModal';

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      success: true,
      images: [
        {
          url: '/static/images/carousel/hero-photo-1.jpg',
          filename: 'hero-photo-1.jpg',
          category: 'carousel',
          source: 'uploaded',
        },
        {
          url: '/static/images/events/stem-summit.jpg',
          filename: 'stem-summit.jpg',
          category: 'events',
          source: 'uploaded',
        },
      ],
    }),
  });
});

describe('MediaLibraryModal Integration', () => {
  it('renders in Manage mode without ambiguous "Select as Portfolio Item Photo"', async () => {
    const handleClose = vi.fn();

    render(
      <MediaLibraryModal
        isOpen={true}
        onClose={handleClose}
        mode="manage"
        targetCategoryLabel="Universal Media Library"
      />
    );

    // Check title and subtitle
    expect(screen.getByText('Universal Media Library')).toBeInTheDocument();
    expect(
      screen.getByText(/Browse, upload, organize by category, clean duplicates, or copy photo URLs/i)
    ).toBeInTheDocument();

    // Verify "Select as Portfolio Item Photo" is NOT in the document
    expect(screen.queryByText(/Select as Portfolio Item Photo/i)).toBeNull();

    // Verify "Close" button exists
    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('in Manage mode, selecting a photo reveals Copy URL and Open actions', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MediaLibraryModal
        isOpen={true}
        onClose={() => {}}
        mode="manage"
      />
    );

    // Wait for images to load
    await waitFor(() => {
      expect(screen.getByText('hero-photo-1.jpg')).toBeInTheDocument();
    });

    // Click photo to select it
    fireEvent.click(screen.getByText('hero-photo-1.jpg'));

    // Check that "Copy Image URL" button is present
    const copyBtn = await screen.findByRole('button', { name: /Copy Image URL/i });
    expect(copyBtn).toBeInTheDocument();

    // Check that "Open" button/link is present
    expect(screen.getByTitle('Open full-size image in new tab')).toBeInTheDocument();

    // Click copy URL
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('/static/images/carousel/hero-photo-1.jpg');
  });

  it('renders in Picker mode with targeted "Use as [Target] Image" button', async () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <MediaLibraryModal
        isOpen={true}
        onClose={handleClose}
        mode="picker"
        targetCategoryLabel="Hero Carousel"
        onSelectPhoto={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('hero-photo-1.jpg')).toBeInTheDocument();
    });

    // Verify targeted picker button text
    const useBtn = screen.getByRole('button', { name: /Use as Hero Carousel Image/i });
    expect(useBtn).toBeInTheDocument();
    expect(useBtn).toBeDisabled(); // Disabled until selected

    // Select the photo
    fireEvent.click(screen.getByText('hero-photo-1.jpg'));
    expect(useBtn).not.toBeDisabled();

    // Click confirm
    fireEvent.click(useBtn);
    expect(handleSelect).toHaveBeenCalledWith(
      '/static/images/carousel/hero-photo-1.jpg',
      expect.objectContaining({ filename: 'hero-photo-1.jpg', category: 'carousel' })
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
