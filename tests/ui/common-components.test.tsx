// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail, Pencil } from 'lucide-react';
import { AppLink, TextLink } from '@/app/components/common/AppLink';
import { Button, ButtonLink } from '@/app/components/common/Button';
import { ErrorBanner } from '@/app/components/common/ErrorBanner';
import { ImageWithFallback } from '@/app/components/common/ImageWithFallback';
import { Field } from '@/app/components/common/Field';
import { IconButton } from '@/app/components/common/IconButton';
import { Input } from '@/app/components/common/input';
import { Select } from '@/app/components/common/Select';
import { Switch } from '@/app/components/common/Switch';
import { Tag, TagList } from '@/app/components/common/Tag';

describe('Button', () => {
  it('is a plain button by default, so it never submits a form by accident', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Annuler</Button>
        <Button type="submit">Envoyer</Button>
      </form>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('lets the caller override the variant classes', () => {
    render(<Button className="px-4">Filtre</Button>);
    const button = screen.getByRole('button', { name: 'Filtre' });
    expect(button).toHaveClass('px-4');
    expect(button).not.toHaveClass('px-5');
  });

  it('renders ButtonLink as a link', () => {
    render(<ButtonLink href="/contact">Écrire</ButtonLink>);
    expect(screen.getByRole('link', { name: 'Écrire' })).toHaveAttribute('href', '/contact');
  });
});

describe('AppLink', () => {
  it('adds noopener noreferrer when opening a new tab', () => {
    render(
      <AppLink href="https://github.com/example" newTab>
        GitHub
      </AppLink>,
    );
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps internal links in the same tab', () => {
    render(<TextLink href="/projets">Projets</TextLink>);
    const link = screen.getByRole('link', { name: 'Projets' });
    expect(link).toHaveAttribute('href', '/projets');
    expect(link).not.toHaveAttribute('target');
  });

  it('keeps a route with a dot in its path as an internal link', () => {
    render(<AppLink href="/projets/v2.0">Version 2</AppLink>);
    expect(screen.getByRole('link', { name: 'Version 2' })).toHaveAttribute('href', '/projets/v2.0');
  });

  it('accepts mailto: and file links', () => {
    render(
      <>
        <AppLink href="mailto:ada@example.com">E-mail</AppLink>
        <AppLink href="/cv.pdf" newTab>
          CV
        </AppLink>
      </>,
    );
    expect(screen.getByRole('link', { name: 'E-mail' })).toHaveAttribute('href', 'mailto:ada@example.com');
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv.pdf');
  });
});

describe('IconButton', () => {
  it('is named by its label and hides the icon', () => {
    render(
      <IconButton label="Modifier Java">
        <Pencil aria-hidden="true" />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Modifier Java' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('form fields', () => {
  it('Field labels its control and shows the help text', () => {
    render(
      <Field id="email" label="E-mail" hint="Jamais affiché">
        <Input id="email" icon={Mail} />
      </Field>,
    );
    expect(screen.getByLabelText('E-mail')).toBeInstanceOf(HTMLInputElement);
    // The help text is announced with the field
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Jamais affiché');
  });

  it('Field shows its footer after the help text', () => {
    render(
      <Field id="bio" label="Bio" hint="Une ligne par point" footer={<p>0/2000</p>}>
        <Input id="bio" />
      </Field>,
    );
    const hint = screen.getByText('Une ligne par point');
    expect(hint.compareDocumentPosition(screen.getByText('0/2000')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('Input with an end element keeps the element reachable', async () => {
    const onClick = vi.fn();
    render(
      <Input
        aria-label="Mot de passe"
        end={
          <IconButton label="Afficher le mot de passe" onClick={onClick}>
            <Pencil aria-hidden="true" />
          </IconButton>
        }
      />,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Mot de passe')).toHaveClass('pr-12');
  });

  it('Select is a native, labelled combobox', () => {
    render(
      <Select aria-label="Domaine">
        <option value="">Autres</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Domaine' })).toBeInTheDocument();
  });

  it('Switch exposes its state and toggles', async () => {
    const onChange = vi.fn();
    render(<Switch id="dispo" label="Afficher le voyant" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Afficher le voyant' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.setup().click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('ErrorBanner', () => {
  it('renders nothing without a message', () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('announces the error and can be closed', async () => {
    const onClose = vi.fn();
    render(<ErrorBanner message="Erreur réseau" onClose={onClose} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Erreur réseau');
    await userEvent.setup().click(screen.getByRole('button', { name: "Fermer le message d'erreur" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('Tag and TagList', () => {
  it('removable tag has a named remove button', async () => {
    const onRemove = vi.fn();
    render(<Tag name="Go" onRemove={onRemove} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retirer Go' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('shows the first tags and announces the hidden ones', () => {
    render(<TagList names={['Java', 'Spring', 'Docker', 'Kafka', 'Redis']} label="Tags de Backend" limit={3} />);
    const list = screen.getByRole('list', { name: 'Tags de Backend' });
    expect(list).toHaveTextContent('JavaSpringDocker+2 autres tags');
    expect(screen.queryByText('Kafka')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<TagList names={[]} label="Tags" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ImageWithFallback', () => {
  it('shows a placeholder when the image fails, and tries again when the URL changes', () => {
    const { rerender } = render(<ImageWithFallback src="https://example.com/broken.png" alt="Capture de Portfolio" />);
    fireEvent.error(screen.getByRole('img', { name: 'Capture de Portfolio' }));
    expect(screen.getByRole('img', { name: 'Capture de Portfolio (image indisponible)' })).toBeInTheDocument();

    rerender(<ImageWithFallback src="https://example.com/fixed.png" alt="Capture de Portfolio" />);
    expect(screen.getByRole('img', { name: 'Capture de Portfolio' })).toHaveAttribute('src', 'https://example.com/fixed.png');
  });
});
