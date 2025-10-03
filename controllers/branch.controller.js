const pool = require("../config/db");

// Create Branch
const createBranch = async (req, res) => {
  try {
    const { code, name, address, phone } = req.body;
    const result = await pool.query(
      "INSERT INTO branches (code, name, address, phone) VALUES ($1, $2, $3, $4) RETURNING *",
      [code, name, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Branches
const getBranches = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM branches ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM branches WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Branch not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let i = 1;

    for (const key of ["name", "address", "phone"]) {
      if (req.body[key]) {
        fields.push(`${key}=$${i}`);
        values.push(req.body[key]);
        i++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE branches SET ${fields.join(", ")} WHERE id=$${i} RETURNING *`;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ message: "Branch not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM branches WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Branch not found" });
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};