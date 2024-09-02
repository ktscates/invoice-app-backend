const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:4200",
  "https://ktscates-invoice-app.netlify.app/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

let invoices;

function loadInvoices() {
  try {
    invoices = JSON.parse(fs.readFileSync("./data.json", "utf8"));
  } catch (error) {
    console.error("Error loading invoices:", error);
    invoices = [];
  }
}

function saveInvoices() {
  try {
    fs.writeFileSync("./data.json", JSON.stringify(invoices, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving invoices:", error);
  }
}

// Load invoices at server start
loadInvoices();

// Get all invoices
app.get("/api/invoices", (req, res) => {
  res.json(invoices);
});

// Get invoice by ID
app.get("/api/invoices/:id", (req, res) => {
  const invoice = invoices.find((inv) => inv.id === req.params.id);
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
});

// Create a new invoice
app.post("/api/invoices", (req, res) => {
  const newInvoice = { ...req.body };
  invoices.push(newInvoice);
  saveInvoices();
  res.status(201).json(newInvoice);
});

// Update an invoice
app.put("/api/invoices/:id", (req, res) => {
  const index = invoices.findIndex((inv) => inv.id === req.params.id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...req.body };
    saveInvoices();
    res.json(invoices[index]);
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
});

// Delete an invoice
app.delete("/api/invoices/:id", (req, res) => {
  const index = invoices.findIndex((inv) => inv.id === req.params.id);
  if (index !== -1) {
    const deletedInvoice = invoices.splice(index, 1);
    saveInvoices();
    res.json(deletedInvoice[0]);
  } else {
    res.status(404).json({ message: "Invoice not found" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
