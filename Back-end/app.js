// Importing express
const express = require('express');
// Enabling CORS
const cors = require("cors")

// Creating an express application
const app = express();

// Using CORS
app.use(cors());

// Convert JSON

// Mongoose
require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected!!"))
.catch((err) => console.error("Mongo connection error:", err));

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    dateCreated: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false }
});

taskSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
    }
})

// User Profile schema //new section 
const userProfileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String },
}, { timestamps: true });

userProfileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
// Convert to json
app.use(express.json());

// POST or update user profile (upsert)
app.post("/api/profile", async (req, res) => {
  const { fullName, email, bio } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: "Full Name and Email are required" });
  }
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { email },
      { fullName, bio },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ message: "Profile saved", profile });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Server error saving profile" });
  }
});

// Optional: GET profile by email
app.get("/api/profile/:email", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});


//end of new section 



// Optional indexes
taskSchema.index({ dueDate: 1 });
taskSchema.index({ dateCreated: 1 });

const Task = mongoose.model("Task", taskSchema);



// Define a route for the homepage
app.get('/todos', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
      //  res.status(500).json({ error: 'failed to fetch todos' });
      res.send(error.message)
    }
});


// POST
app.post("/todos", async (req, res) => {
 try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
 } catch (error) {
    res.status(400).json({ error: 'Failed to create todo' });
 }
});

// PATCH

app.patch("/todos/:id", async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { isCompleted: req.body.isCompleted },
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ error: 'Todo not found' });
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update todo' });
    }
});

// DELETE REQUEST

app.delete("/todos/:id", async (req, res) => {
  try {
     const deleted = await Task.findByIdAndDelete(req.params.id);
     if (!deleted) return res.status(404).json({ error: 'todo not found' });
     res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete todo' });
  }
});

// PUT Request
app.put("/todos/:id", async (req, res) => {
 try {
    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Todo not found' });
    res.json(updatedTask);
 } catch (error) {
    res.status(400).json({ error: 'Failed to update todo' });
 }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Yay you did it, it's running on http://localhost:${port}`);
})



