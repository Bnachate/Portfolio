import { describe, expect, it } from 'vitest';
import {
  createContactSchema,
  createExperienceSchema,
  createProjectSchema,
  heroSchema,
  tagSchema,
} from '@/server/validation';

const project = {
  title: 'Portfolio',
  description: 'My site',
  projectImageUrl: 'https://example.com/screenshot.png',
};

describe('project URLs', () => {
  it('accepts http(s) URLs', () => {
    expect(createProjectSchema.safeParse(project).success).toBe(true);
  });

  it('rejects javascript: URLs that could run code when clicked', () => {
    const result = createProjectSchema.safeParse({ ...project, githubUrl: 'javascript:alert(1)' });
    expect(result.success).toBe(false);
  });

  it('turns an empty optional URL into null', () => {
    const result = createProjectSchema.parse({ ...project, demoUrl: '' });
    expect(result.demoUrl).toBeNull();
  });
});

describe('experience dates', () => {
  const experience = { job: 'Dev', company: 'ACME', description: 'Work', startDate: '2023-01-01' };

  it('accepts an ongoing experience', () => {
    expect(createExperienceSchema.safeParse(experience).success).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = createExperienceSchema.safeParse({ ...experience, endDate: '2022-01-01' });
    expect(result.success).toBe(false);
  });
});

describe('contact form', () => {
  const message = { name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Hi!' };

  it('accepts a complete message', () => {
    expect(createContactSchema.safeParse(message).success).toBe(true);
  });

  it('requires a subject', () => {
    expect(createContactSchema.safeParse({ ...message, subject: '   ' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(createContactSchema.safeParse({ ...message, email: 'not-an-email' }).success).toBe(false);
  });
});

describe('hero links', () => {
  const hero = {
    title: 'Dev',
    subtitle: 'Sub',
    description: 'Desc',
    primaryButtonText: 'Contact',
    primaryButtonUrl: '#contact',
    secondaryButtonText: 'CV',
    secondaryButtonUrl: '/cv.pdf',
    githubUrl: 'https://github.com/someone',
    linkedinUrl: 'https://linkedin.com/in/someone',
    email: 'me@example.com',
  };

  it('accepts anchors, relative paths and http(s) URLs', () => {
    expect(heroSchema.safeParse(hero).success).toBe(true);
  });

  it('rejects protocol-relative and javascript: links', () => {
    expect(heroSchema.safeParse({ ...hero, primaryButtonUrl: '//evil.example' }).success).toBe(false);
    expect(heroSchema.safeParse({ ...hero, secondaryButtonUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});

describe('tags', () => {
  it('trims names and rejects empty ones', () => {
    expect(tagSchema.parse({ name: '  Vue.js  ' }).name).toBe('Vue.js');
    expect(tagSchema.safeParse({ name: '   ' }).success).toBe(false);
  });
});
