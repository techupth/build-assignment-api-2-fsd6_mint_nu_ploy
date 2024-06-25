import express from "express";
import connectionPool from "./utils/db.mjs";
import "dotenv/config";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`select * from assignments`);
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: results.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
  } catch (error) {
    res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  if ((result = [])) {
    return res
      .status(404)
      .json({ message: "Server could not find a requested assignment" });
  }
  return res.status(200).json({
    data: result.rows,
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const updatePost = { ...req.body };
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `update assignments set title=$1, content = $2,category = $3 where assignment_id = $4`,
      [
        updatePost.title,
        updatePost.content,
        updatePost.category,
        assignmentIdFromClient,
      ]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to update",
    });
  }
  return res.status(200).json({ message: "Updated assignment sucessfully" });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  let result;
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    result = await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to delete",
    });
  }
  return res.status(200).json({ message: "Deleted assignment sucessfully" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
