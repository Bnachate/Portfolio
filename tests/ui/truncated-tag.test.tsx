// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TruncatedTag } from '@/app/components/common/TruncatedTag';

// jsdom has no layout: give the tag the widths a browser would measure
function setWidths(scrollWidth: number, clientWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => scrollWidth });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => clientWidth });
}

afterEach(() => {
  delete (HTMLElement.prototype as { scrollWidth?: number }).scrollWidth;
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
});

const tooltip = () => screen.queryByTestId('truncated-tag-tooltip');

describe('TruncatedTag', () => {
  it('has no tooltip when the text fits', async () => {
    setWidths(120, 200);
    render(<TruncatedTag name="AdTech · Data marketing" />);
    await userEvent.setup().hover(screen.getByText('AdTech · Data marketing'));
    expect(tooltip()).toBeNull();
  });

  it('shows the full text below on hover when it is cut, and hides it with Escape', async () => {
    setWidths(320, 200);
    render(<TruncatedTag name="Legal Tech · Propriété intellectuelle" />);
    const user = userEvent.setup();
    // The full text stays in the tag for assistive technologies; the tooltip is a visual copy
    expect(tooltip()).toHaveAttribute('aria-hidden', 'true');
    expect(tooltip()).toHaveClass('hidden');

    await user.hover(screen.getAllByText('Legal Tech · Propriété intellectuelle')[0]);
    expect(tooltip()).toHaveClass('block', 'top-full');
    expect(tooltip()).toHaveTextContent('Legal Tech · Propriété intellectuelle');

    await user.keyboard('{Escape}');
    expect(tooltip()).toHaveClass('hidden');
    expect(tooltip()).not.toHaveClass('group-focus-visible:block');

    // Hovering again brings it back; leaving hides it
    await user.unhover(screen.getAllByText('Legal Tech · Propriété intellectuelle')[0]);
    await user.hover(screen.getAllByText('Legal Tech · Propriété intellectuelle')[0]);
    expect(tooltip()).toHaveClass('block');
    await user.unhover(screen.getAllByText('Legal Tech · Propriété intellectuelle')[0]);
    expect(tooltip()).toHaveClass('hidden');
  });

  it('also shows when the surrounding card has the keyboard focus', () => {
    setWidths(320, 200);
    render(<TruncatedTag name="Legal Tech · Propriété intellectuelle" />);
    expect(tooltip()).toHaveClass('group-focus-visible:block');
  });
});
