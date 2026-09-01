import { describe, it, expect } from 'vitest';
import {
  PROFILE,
  PROJECTS,
  SKILLS,
  EXPERIENCE,
  EVENTS,
  AWARDS,
  SYSTEM_METRICS,
} from '../../src/data';

describe('Portfolio Data Integrity & Schema Validation', () => {
  describe('Profile Information', () => {
    it('contains valid profile contact info and identity', () => {
      expect(PROFILE.name).toBe('Timothy Ododo');
      expect(PROFILE.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(PROFILE.bio).toBeDefined();
      expect(PROFILE.bio.length).toBeGreaterThan(20);
      expect(PROFILE.title).toBeDefined();
    });

    it('has social links configured', () => {
      expect(PROFILE.github).toContain('github.com');
      expect(PROFILE.linkedin).toContain('linkedin.com');
    });
  });

  describe('Projects Data', () => {
    it('contains valid projects with unique slugs', () => {
      expect(PROJECTS.length).toBeGreaterThan(0);
      const slugs = PROJECTS.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('every project has mandatory metadata fields', () => {
      PROJECTS.forEach((project) => {
        expect(project.slug).toBeTruthy();
        expect(project.name).toBeTruthy();
        expect(project.shortDescription).toBeTruthy();
        expect(Array.isArray(project.technologies)).toBe(true);
        expect(project.technologies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Skills Data', () => {
    it('contains technical skills categorized appropriately', () => {
      expect(SKILLS.length).toBeGreaterThan(0);
      SKILLS.forEach((skill) => {
        expect(skill.name).toBeTruthy();
        expect(skill.level).toBeTruthy();
        expect(typeof skill.level).toBe('string');
      });
    });
  });

  describe('Experience Timeline', () => {
    it('contains structured work experiences with non-empty descriptions', () => {
      expect(EXPERIENCE.length).toBeGreaterThan(0);
      EXPERIENCE.forEach((exp) => {
        expect(exp.role).toBeTruthy();
        expect(exp.organization).toBeTruthy();
        expect(exp.period).toBeTruthy();
        expect(Array.isArray(exp.highlights)).toBe(true);
        expect(exp.highlights.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Events & Awards', () => {
    it('events and awards collections have valid records', () => {
      expect(Array.isArray(EVENTS)).toBe(true);
      expect(Array.isArray(AWARDS)).toBe(true);
      expect(SYSTEM_METRICS).toBeDefined();
      expect(SYSTEM_METRICS.uptime).toBeDefined();
    });
  });
});
