const express = require("express");
const app = express();
const path = require("path");

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Set up views folder and HTML rendering with EJS
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Main pages
app.get("/", (req, res) => res.render("index"));    // Home
app.get("/notes", (req, res) => res.render("notes")); // Notes
app.get("/about", (req, res) => res.render("about"));


// 404 fallback
app.use((req, res) => res.status(404).send("Page not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on http://localhost:${PORT}`));
