import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  try {
    await connectionPool.query(
      `insert into assignments (title,content,category,created_at,updated_at,published_at,status)
      values ($1, $2,$3,$4,$5,$6,$7)`,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
        newAssignment.status,
      ]
    );

    if (!newAssignment) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }
    return res.status(201).json({
      message: "Created assignment sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(`select * from assignments`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    const result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment",
      });
    }
    return res.status(200).json({
      data: result.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updatedAssignment = {
    ...req.body,
    updated_at: new Date(),
  };
  try {
    await connectionPool.query(
      `update assignments
      set title =$1,
      content = $2,
      category=$3,
      updated_at=$4
      where assignment_id=$5`,
      [
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
        assignmentIdFromClient,
      ]
    );
    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch {
    if (res.status(500).json)
      return res.status(500).json({
        message:
          "Server could not update assignment because database connection",
      });
    else if (res.status(404).json) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    await connectionPool.query(
      `delete from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
    return res.status(200).json({
      message: "Deleted assignment sucessfully",
    });
  } catch {
    if (res.status(500).json)
      return res.status(500).json({
        message:
          "Server could not delete assignment because database connection",
      });
    else if (res.status(404).json) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
  }
});
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
