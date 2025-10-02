const pool = require("../config/db");

// Create Branch
const createBranch = async (req, res) => {
  try {
    const { name, address } = req.body;
    const result = await pool.query(
      "INSERT INTO branches (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
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
    const { name, address } = req.body;
    const result = await pool.query(
      "UPDATE branches SET name=$1, address=$2 WHERE id=$3 RETURNING *",
      [name, address, id]
    );
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