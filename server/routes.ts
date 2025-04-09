import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      // This will be handled by Firebase auth, but we will keep for reference
      res.status(200).json({ message: "Registration successful" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Error registering user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      // This will be handled by Firebase auth, but we will keep for reference
      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Error logging in" });
    }
  });
  
  // Task Endpoints
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const filter = req.query.filter as string || "";
      const searchTerm = req.query.search as string || "";
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const tasks = await storage.getTasksByUserAndFilter(userId, filter, searchTerm);
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Error fetching tasks" });
    }
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = req.body;
      
      if (!taskData || !taskData.userId || !taskData.title) {
        return res.status(400).json({ error: "Task data is incomplete" });
      }
      
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Error creating task" });
    }
  });
  
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.status(200).json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Error fetching task" });
    }
  });
  
  // This endpoint is now handled by the earlier POST /api/tasks implementation
  
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      const validation = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().nullable().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        completed: z.boolean().optional(),
      }).safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedTask = await storage.updateTask(id, validation.data);
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Error updating task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Error deleting task" });
    }
  });
  
  // Category Endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const categories = await storage.getCategoriesByUser(userId);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Error fetching categories" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const validation = z.object({
        name: z.string(),
        color: z.string(),
        description: z.string().optional(),
        userId: z.number()
      }).safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Error creating category" });
    }
  });
  
  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      const validation = z.object({
        name: z.string().optional(),
        color: z.string().optional(),
        description: z.string().optional(),
      }).safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedCategory = await storage.updateCategory(id, validation.data);
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Error updating category" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Error deleting category" });
    }
  });
  
  // User Preferences Endpoints
  app.get("/api/user-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      
      res.status(200).json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Error fetching user preferences" });
    }
  });
  
  app.post("/api/user-preferences", async (req, res) => {
    try {
      const validation = z.object({
        userId: z.number(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        theme: z.string().optional(),
        notifications: z.object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          taskReminders: z.boolean().optional(),
          dailySummary: z.boolean().optional()
        }).optional()
      }).safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const preferences = await storage.createUserPreferences(validation.data);
      res.status(201).json(preferences);
    } catch (error) {
      console.error("Error creating user preferences:", error);
      res.status(500).json({ error: "Error creating user preferences" });
    }
  });
  
  app.patch("/api/user-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      
      const validation = z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        theme: z.string().optional(),
      }).safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedPreferences = await storage.updateUserPreferences(userId, validation.data);
      res.status(200).json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Error updating user preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
