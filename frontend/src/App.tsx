import { useEffect, useState, FormEvent } from 'react';

export interface Book {
  id: number;
  isbn: string;
  titulo: string;
  autor: string;
  anioPublicacion: number;
  fechaRegistro: string;
  fechaActualizacion: string;
  descripcion: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const emptyForm = {
  isbn: '',
  titulo: '',
  autor: '',
  anioPublicacion: new Date().getFullYear(),
  descripcion: '',
};

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/books`);
      if (res.ok) {
        setBooks(await res.json());
      }
    } catch {
      // Ignorado en entorno sin backend activo
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/api/books/${editingId}` : `${API_URL}/api/books`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm(emptyForm);
      setEditingId(null);
      await fetchBooks();
    }
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setForm({
      isbn: book.isbn,
      titulo: book.titulo,
      autor: book.autor,
      anioPublicacion: book.anioPublicacion,
      descripcion: book.descripcion,
    });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchBooks();
    }
  };

  return (
    <div className="container">
      <h1>Gestión de Libros</h1>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            placeholder="ISBN"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            required
          />
          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
          <input
            placeholder="Autor"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Año Publicación"
            value={form.anioPublicacion}
            onChange={(e) => setForm({ ...form, anioPublicacion: Number(e.target.value) })}
            required
          />
        </div>
        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <div className="actions">
          <button type="submit">{editingId ? 'Actualizar Libro' : 'Registrar Libro'}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Año</th>
              <th>Descripción</th>
              <th>Registro</th>
              <th>Actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={8}>No hay libros registrados.</td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id}>
                  <td>{b.isbn}</td>
                  <td>{b.titulo}</td>
                  <td>{b.autor}</td>
                  <td>{b.anioPublicacion}</td>
                  <td>{b.descripcion}</td>
                  <td>{new Date(b.fechaRegistro).toLocaleDateString()}</td>
                  <td>{new Date(b.fechaActualizacion).toLocaleDateString()}</td>
                  <td className="actions">
                    <button type="button" onClick={() => handleEdit(b)}>
                      Editar
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(b.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
