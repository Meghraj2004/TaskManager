import { type User, type Task, type Category, type UserPreferences } from "@shared/schema";
import { 
  getFirestore, collection, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp,
  serverTimestamp, DocumentData
} from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

// Define the interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: number, user: Partial<any>): Promise<User | undefined>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByUserAndFilter(userId: string, filter: string, searchTerm: string): Promise<Task[]>;
  createTask(task: any): Promise<Task>;
  updateTask(id: number, task: Partial<any>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoriesByUser(userId: number): Promise<Category[]>;
  createCategory(category: any): Promise<Category>;
  updateCategory(id: number, category: Partial<any>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: any): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<any>): Promise<UserPreferences | undefined>;
}

// Firebase Storage Implementation
export class FirebaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Since we're using Firebase Auth, this is likely not needed
      return undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Since we're using Firebase Auth, this is likely not needed
      return undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Since we're using Firebase Auth, this is likely not needed
      return undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(insertUser: any): Promise<User> {
    try {
      // Since we're using Firebase Auth, this is likely not needed
      return {} as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<any>): Promise<User | undefined> {
    try {
      // Since we're using Firebase Auth, this is likely not needed
      return {} as User;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    try {
      const taskDoc = await getDoc(doc(firebaseDb, "tasks", id.toString()));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        return {
          ...taskData,
          id: taskDoc.id,
          dueDate: taskData.dueDate ? taskData.dueDate.toDate() : null,
          createdAt: taskData.createdAt.toDate()
        } as unknown as Task;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting task:", error);
      return undefined;
    }
  }
  
  async getTasksByUser(userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(firebaseDb, "tasks"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          createdAt: data.createdAt.toDate()
        } as unknown as Task;
      });
    } catch (error) {
      console.error("Error getting tasks by user:", error);
      return [];
    }
  }
  
  async getTasksByUserAndFilter(userId: string, filter: string, searchTerm: string): Promise<Task[]> {
    try {
      // Base query
      let q = query(
        collection(firebaseDb, "tasks"),
        where("userId", "==", userId)
      );
      
      // Get all tasks for this user - we'll filter in memory
      // This is because Firebase doesn't support complex queries with multiple conditions
      const querySnapshot = await getDocs(q);
      
      // Convert to tasks with proper date handling
      let tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        } as unknown as Task;
      });
      
      // Apply filters in memory
      if (filter === 'completed') {
        tasks = tasks.filter(task => task.completed);
      } else if (filter === 'incomplete') {
        tasks = tasks.filter(task => !task.completed);
      } else if (filter === 'high-priority') {
        tasks = tasks.filter(task => task.priority === 'high');
      } else if (filter === 'medium-priority') {
        tasks = tasks.filter(task => task.priority === 'medium');
      } else if (filter === 'low-priority') {
        tasks = tasks.filter(task => task.priority === 'low');
      } else if (filter === 'due-today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        tasks = tasks.filter(task => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      }
      
      // Apply search if provided
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(term) || 
          (task.description && task.description.toLowerCase().includes(term))
        );
      }
      
      // Sort by created date descending
      return tasks.sort((a, b) => {
        // Handle null or undefined createdAt
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error getting filtered tasks:", error);
      return [];
    }
  }
  
  async createTask(task: any): Promise<Task> {
    try {
      // Add timestamp fields
      const taskData = {
        ...task,
        createdAt: serverTimestamp(),
        dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null
      };
      
      const docRef = await addDoc(collection(firebaseDb, "tasks"), taskData);
      
      // Return the created task
      return {
        ...task,
        id: docRef.id,
        createdAt: new Date()
      } as unknown as Task;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
  
  async updateTask(id: number, taskData: Partial<any>): Promise<Task | undefined> {
    try {
      const taskRef = doc(firebaseDb, "tasks", id.toString());
      
      // Handle date fields
      const updateData = { ...taskData };
      if (updateData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(updateData.dueDate));
      }
      
      await updateDoc(taskRef, updateData);
      
      // Return the updated task by getting it
      return this.getTask(id);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
  
  async deleteTask(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(firebaseDb, "tasks", id.toString()));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  }
  
  // Category methods - simplified for compatibility
  async getCategory(id: number): Promise<Category | undefined> {
    return undefined;
  }
  
  async getCategoriesByUser(userId: number): Promise<Category[]> {
    return [];
  }
  
  async createCategory(category: any): Promise<Category> {
    return {} as Category;
  }
  
  async updateCategory(id: number, categoryData: Partial<any>): Promise<Category | undefined> {
    return undefined;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return true;
  }
  
  // User preferences methods - using Firebase document directly
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    try {
      const prefsSnap = await getDoc(doc(firebaseDb, "userPreferences", userId.toString()));
      if (prefsSnap.exists()) {
        return prefsSnap.data() as UserPreferences;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return undefined;
    }
  }
  
  async createUserPreferences(preferences: any): Promise<UserPreferences> {
    try {
      const userPrefsRef = doc(firebaseDb, "userPreferences", preferences.userId.toString());
      await updateDoc(userPrefsRef, preferences);
      return preferences as UserPreferences;
    } catch (error) {
      console.error("Error creating user preferences:", error);
      throw error;
    }
  }
  
  async updateUserPreferences(userId: number, preferencesData: Partial<any>): Promise<UserPreferences | undefined> {
    try {
      const userPrefsRef = doc(firebaseDb, "userPreferences", userId.toString());
      await updateDoc(userPrefsRef, preferencesData);
      
      // Return updated preferences
      const updatedSnap = await getDoc(userPrefsRef);
      if (updatedSnap.exists()) {
        return updatedSnap.data() as UserPreferences;
      }
      return undefined;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }
}

// Export a singleton instance of the storage
export const storage = new FirebaseStorage();
