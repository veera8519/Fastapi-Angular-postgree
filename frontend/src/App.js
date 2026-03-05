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
    description: "",
    rating: "",
    published_year: "",
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
      console.error("Fetch error:", err); // Log error for debugging
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch books";
      setError(errorMsg);
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
        console.error("Fetch error:", err); // Log error for debugging
        const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch books";
        setError(errorMsg);
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
    setForm({ id: "", title: "", author: "", description: "", rating: "", published_year: "" });
    setEditId(null);
  };

  // Create or update book
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      // Map frontend fields to backend fields
      const bookData = {
        id: Number(form.id),
        title: form.title,
        author: form.author,
        description: form.description,
        rating: Number(form.rating) || 0,
        published_year: Number(form.published_year) || 2024,
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
      description: book.description || "",
      rating: book.rating || "",
      published_year: book.published_year || "",
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
      await api.delete(`/books/${id}`);
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
                name="published_year"
                placeholder="Published Year"
                value={form.published_year}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="rating"
                placeholder="Rating (1-5)"
                value={form.rating}
                onChange={handleChange}
                required
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
                        className={`sortable ${sortField === 'description' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('description')}
                      >
                        Description
                      </th>
                      <th 
                        className={`sortable ${sortField === 'rating' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('rating')}
                      >
                        Rating
                      </th>
                      <th 
                        className={`sortable ${sortField === 'published_year' ? `sort-${sortDirection}` : ''}`}
                        onClick={() => handleSort('published_year')}
                      >
                        Published Year
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
                        <td>{b.description || "N/A"}</td>
                        <td><span className="qty-badge">{b.rating || "N/A"}</span></td>
                        <td>{b.published_year}</td>
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
                        <td colSpan={7} className="empty">
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
