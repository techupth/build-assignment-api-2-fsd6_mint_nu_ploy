import express from "express";
import "dotenv/config";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  try {
    const results = await connectionPool.query("select * from assignments");
    return res.status(200).json({ data: results.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  try {
    const results = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentId]
    );
    if (!results.rows[0]) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
    return res.status(200).json({ data: results.rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  let assignmentUpdate = { ...req.body, updated_at: new Date() };
  // console.log(assignmentUpdate);
  try {
    const result = await connectionPool.query(
      "update assignments set title=$1,content=$2,category=$3,updated_at=$4 where assignment_id=$5",
      [
        assignmentUpdate.title,
        assignmentUpdate.content,
        assignmentUpdate.category,
        assignmentUpdate.updated_at,
        assignmentId,
      ]
    );
    // console.log(result.rowCount);
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    } else {
      return res
        .status(200)
        .json({ message: "Updated assignment sucessfully" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  try {
    const result = await connectionPool.query(
      "delete from assignments where assignment_id =$1",
      [assignmentId]
    );
    if (result.rowCount === 0) {
      console.log(result);
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    } else {
      return res
        .status(200)
        .json({ message: "Deleted assignment sucessfully" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
