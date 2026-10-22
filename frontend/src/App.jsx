import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/files";

function App() {
  const [files, setFiles] = useState([]);
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // GET: Fetch all files
  async function fetchFiles() {
    try {
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch files");
      }

      setFiles(data.files);
    } catch (err) {
      setError(err.message || "Cannot connect to the server");
    }
  }

  // GET: Read a selected file
  async function readFile(name) {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(name)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to read file");
      }

      setSelectedFile(data.filename);
      setFilename(data.filename);
      setContent(data.content);
      setMessage("File loaded successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // POST: Create a new file
  async function createFile(event) {
    if (event) event.preventDefault();

    if (!filename.trim()) {
      setError("Please enter a filename");
      return;
    }

    if (selectedFile) {
      setError(
        "A file is selected. Click Clear to create a new file."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename.trim(),
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create file");
      }

      setMessage(data.message);
      setSelectedFile(data.filename);

      await fetchFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // PUT: Update an existing file
  async function updateFile(event) {
    if (event) event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file before updating");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(selectedFile)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update file");
      }

      setMessage(data.message);

      await fetchFiles();

      // Refresh the editor with the saved content
      await readFile(selectedFile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // DELETE: Delete a file
  async function deleteFile(name) {
    if (!name) {
      setError("Please select a file to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete file");
      }

      setMessage(data.message);

      if (selectedFile === name) {
        setSelectedFile("");
        setFilename("");
        setContent("");
      }

      await fetchFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Clear the form and selection
  function clearForm() {
    setFilename("");
    setContent("");
    setSelectedFile("");
    setMessage("");
    setError("");
  }

  // Load files when the application opens
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">F</div>

          <div>
            <h1>FileManager</h1>
            <p>Simple File Management System</p>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={fetchFiles}
          disabled={loading}
        >
          ↻ Refresh Files
        </button>
      </header>

      <main className="main-container">
        {/* Page heading */}
        <section className="page-heading">
          <div>
            <h2>My Files</h2>
            <p>
              Create, read, update, and delete your text files.
            </p>
          </div>

          <div className="file-count">
            {files.length} {files.length === 1 ? "File" : "Files"}
          </div>
        </section>

        {/* Success message */}
        {message && (
          <div className="alert success-alert" role="status">
            ✓ {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="alert error-alert" role="alert">
            ⚠ {error}
          </div>
        )}

        <div className="content-grid">
          {/* Left side: File list */}
          <section className="card files-card">
            <div className="card-heading">
              <div>
                <h3>All Files</h3>
                <p>Select a file to view or edit it.</p>
              </div>

              <span className="folder-icon">📁</span>
            </div>

            {files.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h4>No files found</h4>
                <p>Create your first file using the form.</p>
              </div>
            ) : (
              <div className="file-list">
                {files.map((file) => (
                  <div
                    key={file}
                    className={`file-item ${
                      selectedFile === file ? "active-file" : ""
                    }`}
                  >
                    <button
                      className="file-select"
                      onClick={() => readFile(file)}
                      disabled={loading}
                    >
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file}</span>
                    </button>

                    <button
                      className="icon-button delete-icon"
                      onClick={() => deleteFile(file)}
                      disabled={loading}
                      title="Delete file"
                      aria-label={`Delete ${file}`}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right side: File editor */}
          <section className="card editor-card">
            <div className="card-heading">
              <div>
                <h3>
                  {selectedFile ? "Edit File" : "Create New File"}
                </h3>

                <p>
                  {selectedFile
                    ? `Selected file: ${selectedFile}`
                    : "Enter a filename and its content."}
                </p>
              </div>

              <span className="editor-icon">✎</span>
            </div>

            <form onSubmit={createFile}>
              <label htmlFor="filename">File Name</label>

              <input
                id="filename"
                type="text"
                placeholder="e.g. notes.txt"
                value={filename}
                onChange={(event) => setFilename(event.target.value)}
                disabled={loading || Boolean(selectedFile)}
                required
              />

              {selectedFile && (
                <p className="field-hint">
                  To edit another file, select it from the file list.
                </p>
              )}

              <label htmlFor="content">File Content</label>

              <textarea
                id="content"
                placeholder="Write your file content here..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={12}
                disabled={loading}
                required={!selectedFile}
              />

              {/* All action buttons */}
              <div className="form-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={createFile}
                  disabled={loading || Boolean(selectedFile)}
                >
                  + Create File
                </button>

                <button
                  className="update-button"
                  type="button"
                  onClick={updateFile}
                  disabled={loading || !selectedFile}
                >
                  ✎ Update File
                </button>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteFile(selectedFile)}
                  disabled={loading || !selectedFile}
                >
                  🗑 Delete File
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={clearForm}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* HTTP methods information */}
        <section className="info-card">
          <h3>HTTP Methods Used</h3>

          <div className="method-grid">
            <div className="method-item">
              <span className="method-badge get">GET</span>
              <div>
                <strong>Read Files</strong>
                <p>Retrieve filenames and contents.</p>
              </div>
            </div>

            <div className="method-item">
              <span className="method-badge post">POST</span>
              <div>
                <strong>Create File</strong>
                <p>Create a new file.</p>
              </div>
            </div>

            <div className="method-item">
              <span className="method-badge put">PUT</span>
              <div>
                <strong>Update File</strong>
                <p>Replace existing file content.</p>
              </div>
            </div>

            <div className="method-item">
              <span className="method-badge delete">DELETE</span>
              <div>
                <strong>Delete File</strong>
                <p>Remove an existing file.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        React Frontend <span>•</span> Node.js Backend <span>•</span> REST APIs
      </footer>
    </div>
  );
}

export default App;
