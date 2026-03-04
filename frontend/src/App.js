import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    author: "",
    year: "",
    category: "",
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/all-books");
      setBooks(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch books");
    }
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get("/all-books");
        setBooks(res.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch books");
      }
      setLoading(false);
    };
    run();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Derived list with filter and sorting
  const filteredBooks = useMemo(() => {
    let filtered = books;
    
    // Apply filter
    const q = filter.trim().toLowerCase();
    if (q) {
      filtered = books.filter((b) =>
        String(b.id).includes(q) ||
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle numeric fields
      if (sortField === "id" || sortField === "year") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        // Handle string fields
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [books, filter, sortField, sortDirection]);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setForm({ id: "", title: "", author: "", year: "", category: "" });
    setEditId(null);
  };

  // Create or update book
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const bookData = {
        ...form,
        id: Number(form.id),
        year: Number(form.year),
      };
      
      if (editId) {
        await api.put(`/books/${editId}`, bookData);
        setMessage("Book updated successfully");
      } else {
        await api.post("/books/", bookData);
        setMessage("Book created successfully");
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.detail || "Operation failed");
    }
    setLoading(false);
  };

  // Edit book
  const handleEdit = (book) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year,
      category: book.category || "",
    });
    setEditId(book.id);
    setMessage("");
    setError("");
  };

  // Delete book
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this book?");
    if (!ok) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await api.delete(`/books/delee_book/${id}`);
      setMessage("Book deleted successfully");
      fetchBooks();
    } catch (err) {
      setError("Delete failed");
    }
    setLoading(false);
  };

  return (
    <div className="app-bg">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">📚</span>
          <h1>Books Library</h1>
        </div>
        <div className="top-actions">
          <button className="btn btn-light" onClick={fetchBooks} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <div className="container">
        <div className="stats">
          <div className="chip">Total: {books.length}</div>
          <div className="search">
            <input
              type="text"
              placeholder="Search by id, title, author or category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="content-grid">
          <div className="card form-card">
            <h2>{editId ? "Edit Book" : "Add Book"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="number"
                name="id"
                placeholder="ID"
                value={form.id}
                onChange={handleChange}
                required
                disabled={!!editId}
              />
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="year"
                placeholder="Year"
                value={form.year}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
              />
              <div className="form-actions">
                <button className="btn" type="submit" disabled={loading}>
                  {editId ? "Update" : "Add"}
                </button>
                {editId && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMessage("");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}
          </div>

          <div className="card list-card">
            <h2>Books</h2>
            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              <div className="scroll-x">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th 
                        className={`sortable ${sortField === 'id' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('id')}
                      >
                        ID
                      </th>
                      <th 
                        className={`sortable ${sortField === 'title' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('title')}
                      >
                        Title
                      </th>
                      <th 
                        className={`sortable ${sortField === 'author' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('author')}
                      >
                        Author
                      </th>
                      <th 
                        className={`sortable ${sortField === 'year' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('year')}
                      >
                        Year
                      </th>
                      <th 
                        className={`sortable ${sortField === 'category' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('category')}
                      >
                        Category
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td className="name-cell">{b.title}</td>
                        <td className="desc-cell">{b.author}</td>
                        <td className="price-cell">{b.year}</td>
                        <td>
                          <span className="qty-badge">{b.category || "N/A"}</span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(b)}>
                              Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDelete(b.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="empty">
                          No books found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
