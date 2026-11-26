// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineDeleteConfirm, InlineEditActions, ViewLink } from '@/app/components/admin/common/AdminUi';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/common/dialog';

describe('InlineEditActions', () => {
  it('disables save while the name is empty and still allows cancelling', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<InlineEditActions name="Java" onSave={onSave} onCancel={onCancel} canSave={false} />);
    expect(screen.getByRole('button', { name: 'Enregistrer le nouveau nom de Java' })).toBeDisabled();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Annuler le renommage de Java' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves when allowed, and locks both buttons while busy', async () => {
    const onSave = vi.fn();
    const { rerender } = render(<InlineEditActions name="Java" onSave={onSave} onCancel={vi.fn()} canSave />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Enregistrer le nouveau nom de Java' }));
    expect(onSave).toHaveBeenCalledOnce();

    rerender(<InlineEditActions name="Java" onSave={onSave} onCancel={vi.fn()} canSave busy />);
    expect(screen.getByRole('button', { name: 'Enregistrer le nouveau nom de Java' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Annuler le renommage de Java' })).toBeDisabled();
  });
});

describe('InlineDeleteConfirm', () => {
  it('focuses "Non", confirms with "Oui" and cancels with Escape', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<InlineDeleteConfirm question="Supprimer ce message ?" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('group', { name: 'Supprimer ce message ?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Non' })).toHaveFocus();

    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Oui' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe('ViewLink', () => {
  it('opens an external URL in a new tab', () => {
    render(<ViewLink label="Voir la démo" href="https://example.com" />);
    const link = screen.getByRole('link', { name: 'Voir la démo' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens a page of the site in the same tab', () => {
    render(<ViewLink label="Voir Portfolio sur le site" href="/projets/1" />);
    const link = screen.getByRole('link', { name: 'Voir Portfolio sur le site' });
    expect(link).toHaveAttribute('href', '/projets/1');
    expect(link).not.toHaveAttribute('target');
  });
});

describe('Dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Nouveau projet</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  it('closes with its named "Fermer" button', async () => {
    render(<Harness />);
    expect(screen.getByRole('dialog', { name: 'Nouveau projet' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
