import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Gestión de Libros', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )
    );
  });

  it('renderiza el título y los campos del formulario de libros', async () => {
    render(<App />);

    expect(await screen.findByText('Gestión de Libros')).toBeInTheDocument();
    expect(await screen.findByText('No hay libros registrados.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ISBN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Título')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Autor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Libro/i })).toBeInTheDocument();
  });
});
