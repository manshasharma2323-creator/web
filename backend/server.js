const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Directory where files will be stored
const FILES_DIR = path.join(__dirname, "files");

// Create files directory if it doesn't exist
fs.mkdirSync(FILES_DIR, { recursive: true });

// Validate filename and generate file path
function getFilePath(filename) {
    if ( 
        typeof filename !== "string" ||
        filename.trim() === "" ||
        filename === "." ||
        filename === ".." ||
        filename.includes("/") ||
        filename.includes("\\") ||
        path.basename(filename) !== filename
    ) {
        return null;
    }

    return path.join(FILES_DIR, filename);
}

// ==========================================
// GET: Fetch all filenames
// ==========================================
app.get("/api/files", (req, res) => {
    fs.readdir(FILES_DIR, { withFileTypes: true }, (err, entries) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to fetch files"
            });
        }

        const files = entries
            .filter(entry => entry.isFile())
            .map(entry => entry.name);

        res.status(200).json({
            message: "Files fetched successfully",
            files
        });
    });
});

// ==========================================
// GET: Read a specific file
// ==========================================
app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = getFilePath(filename);

    if (!filepath) {
        return res.status(400).json({
            message: "Invalid filename"
        });
    }

    fs.readFile(filepath, "utf8", (err, content) => {
        if (err) {
            return res.status(
                err.code === "ENOENT" ? 404 : 500
            ).json({
                message: err.code === "ENOENT"
                    ? "File not found"
                    : "Unable to read file"
            });
        }

        res.status(200).json({
            message: "File read successfully",
            filename,
            content
        });
    });
});

// ==========================================
// POST: Create a new file
// ==========================================
app.post("/api/files", (req, res) => {
    const { filename, content } = req.body;
    const filepath = getFilePath(filename);

    if (!filepath || typeof content !== "string") {
        return res.status(400).json({
            message: "A valid filename and string content are required"
        });
    }

    fs.writeFile(filepath, content, { flag: "wx" }, (err) => {
        if (err) {
            return res.status(
                err.code === "EEXIST" ? 409 : 500
            ).json({
                message: err.code === "EEXIST"
                    ? "File already exists"
                    : "Unable to create file"
            });
        }

        res.status(201).json({
            message: "File created successfully",
            filename
        });
    });
});

// ==========================================
// PUT: Update an existing file
// ==========================================
app.put("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = getFilePath(filename);
    const { content } = req.body;

    if (!filepath || typeof content !== "string") {
        return res.status(400).json({
            message: "A valid filename and string content are required"
        });
    }

    // Check whether the file exists
    fs.access(filepath, fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // Replace the entire file content
        fs.writeFile(filepath, content, (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Unable to update file"
                });
            }

            res.status(200).json({
                message: "File updated successfully",
                filename
            });
        });
    });
});

// ==========================================
// DELETE: Delete an existing file
// ==========================================
app.delete("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = getFilePath(filename);

    if (!filepath) {
        return res.status(400).json({
            message: "Invalid filename"
        });
    }

    fs.unlink(filepath, (err) => {
        if (err) {
            return res.status(
                err.code === "ENOENT" ? 404 : 500
            ).json({
                message: err.code === "ENOENT"
                    ? "File not found"
                    : "Unable to delete file"
            });
        }

        res.status(200).json({
            message: "File deleted successfully",
            filename
        });
    });
});

// ==========================================
// Handle unknown routes
// ==========================================
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// ==========================================
// Start server
// ==========================================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});