import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HomePageEditor } from '../../src/components/admin/HomePageEditor';
import { AboutPageEditor } from '../../src/components/admin/AboutPageEditor';
import { Profile, HomePageContent, AboutPageContent } from '../../src/types';

describe('Admin Home & About Page Text Editors', () => {
  const mockProfile: Profile = {
    name: 'Timothy Ododo',
    title: 'Technology Mentor & Software Engineer',
    subtitle: 'Building reliable solutions',
    tagline: 'Practical solutions with measurable impact',
    location: 'Nigeria / Remote',
    email: 'timothyododo@gmail.com',
    github: 'https://github.com/timothyododo',
    linkedin: 'https://linkedin.com/in/timothyododo',
    bio: 'Experienced technology professional.',
    status: 'Available for Engineering Roles',
    impactMetrics: [
      { value: '500+', label: 'Learners Mentored', detail: 'Youth training in computing' },
      { value: '15+', label: 'Systems Deployed', detail: 'Cloud applications' }
    ],
    capabilities: [
      { id: 'dev', title: 'Software Development', description: 'Building web and backend systems.', icon: 'code', ctaText: 'View Projects', ctaLink: '/projects' },
      { id: 'support', title: 'IT Systems', description: 'Troubleshooting and maintenance.', icon: 'shield', ctaText: 'Learn More', ctaLink: '/experience' }
    ]
  };

  const mockHomeContent: HomePageContent = {
    heroGreeting: "Hello, I'm",
    heroCta1Text: 'View My Work',
    heroCta1Link: '/projects',
    heroCta2Text: 'Download CV',
    heroCta2Link: '/resume',
    heroCta3Text: 'Certifications & Events',
    heroCta3Link: '/events',
    connectHeading: 'Connect with me',
    whatIDoTitle: 'What I Do',
    whatIDoSubtitle: 'I work at the intersection of technology, education, and impact.',
    ctaSection: {
      badge: 'Collaboration & Mentorship',
      title: "Let's Build, Solve and Learn Together",
      description: "Whether you're looking for a technology mentor or backend developer, let's connect.",
      primaryButtonText: 'View My Work',
      primaryButtonLink: '/projects',
      secondaryButtonText: 'Contact Me',
      secondaryButtonLink: '/contact'
    }
  };

  const mockAboutContent: AboutPageContent = {
    eyebrow: 'Biography & Philosophy',
    heading: 'About Timothy Ododo',
    subheading: 'Technology Mentor & Advocate',
    storyParagraph1: 'Story paragraph 1 content about technology background.',
    storyParagraph2: 'Story paragraph 2 content about rapid learning philosophy.',
    storyParagraph3: 'Story paragraph 3 content about academic degrees and ongoing work.',
    calloutTitle: 'The Rapid Learning Differentiator',
    calloutText: 'Mastered Raspberry Pi Pico in 3 days.',
    quickFactsTitle: 'Quick Facts',
    quickFacts: [
      { label: 'Role', value: 'Technology Mentor' },
      { label: 'Degree', value: 'B.Sc. Computer Science' }
    ],
    connectCardTitle: "Let's Connect",
    connectCardText: 'Interested in collaborating?',
    connectCardButtonText: 'Get in Touch',
    progressionEyebrow: 'Career Evolution',
    progressionTitle: 'Multidisciplinary Growth Matrix',
    progressionSteps: [
      { title: 'Technology Learner', desc: 'Assimilating new architectures rapidly.' },
      { title: 'Technology Educator', desc: 'Teaching logic to 200+ students.' }
    ]
  };

  it('renders HomePageEditor with all sections, handles text edits, and triggers onSave', () => {
    const handleSave = vi.fn();
    const handlePreview = vi.fn();
    const setProfile = vi.fn();

    render(
      <HomePageEditor
        profile={mockProfile}
        setProfile={setProfile}
        homeContent={mockHomeContent}
        onSave={handleSave}
        onPreviewHome={handlePreview}
      />
    );

    // Verify Title & Greetings
    expect(screen.getByText(/Home Page Text & Sections Editor/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello, I'm")).toBeInTheDocument();
    expect(screen.getByDisplayValue('Timothy Ododo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Technology Mentor & Software Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('What I Do')).toBeInTheDocument();
    expect(screen.getByDisplayValue("Let's Build, Solve and Learn Together")).toBeInTheDocument();

    // Modify a greeting text field
    const greetingInput = screen.getByDisplayValue("Hello, I'm");
    fireEvent.change(greetingInput, { target: { value: 'Welcome, I am' } });

    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save Home Page Changes/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const [savedHomeContent, savedProfile] = handleSave.mock.calls[0];
    expect(savedHomeContent.heroGreeting).toBe('Welcome, I am');
    expect(savedProfile.name).toBe('Timothy Ododo');
  });

  it('renders AboutPageEditor with biography, facts, and progression steps and triggers onSave', () => {
    const handleSave = vi.fn();
    const handlePreview = vi.fn();

    render(
      <AboutPageEditor
        profile={mockProfile}
        aboutContent={mockAboutContent}
        onSave={handleSave}
        onPreviewAbout={handlePreview}
      />
    );

    // Verify fields
    expect(screen.getByText(/About Page Text, Story & Career Matrix/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Biography & Philosophy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('About Timothy Ododo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('The Rapid Learning Differentiator')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Technology Learner')).toBeInTheDocument();

    // Edit heading
    const headingInput = screen.getByDisplayValue('About Timothy Ododo');
    fireEvent.change(headingInput, { target: { value: 'Biography of Timothy Ododo' } });

    // Add a quick fact
    const addFactBtn = screen.getByRole('button', { name: /Add Fact/i });
    fireEvent.click(addFactBtn);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save About Page Changes/i });
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedAboutContent = handleSave.mock.calls[0][0];
    expect(savedAboutContent.heading).toBe('Biography of Timothy Ododo');
    expect(savedAboutContent.quickFacts.length).toBe(3);
  });
});
