import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import TaskFilters from "@/components/task-filters";
import TaskCategories from "@/components/task-categories";
import TaskList from "@/components/task-list";
import AddTaskModal from "@/components/add-task-modal";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, loading } = useAuthContext();
  const [_, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    const fetchTaskCategories = async () => {
      if (!user) return;
      
      try {
        // Fetch tasks to determine counts
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(tasksQuery);
        const tasks = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            ...data,
            id: doc.id
          };
        });
        
        // Calculate category counts
        const importantCount = tasks.filter(task => (task as any).priority === "high").length;
        const inProgressCount = tasks.filter(task => !(task as any).completed).length;
        const completedCount = tasks.filter(task => (task as any).completed).length;
        
        // Set categories
        setCategories([
          {
            id: "important",
            name: "Important",
            color: "#3B82F6", // primary blue
            description: "High priority tasks that need attention",
            count: importantCount
          },
          {
            id: "in-progress",
            name: "In Progress",
            color: "#8B5CF6", // purple
            description: "Tasks you're currently working on",
            count: inProgressCount
          },
          {
            id: "completed",
            name: "Completed",
            color: "#10B981", // green
            description: "Tasks you've successfully completed",
            count: completedCount
          }
        ]);
      } catch (error) {
        console.error("Error fetching task categories:", error);
      }
    };
    
    fetchTaskCategories();
  }, [user, isAddTaskModalOpen, refreshTasks]);

  // Show loading state or redirect if not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          {user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 bg-gray-50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Tasks</h1>
              <p className="text-gray-600 mt-1">Manage and organize your tasks efficiently</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={() => setIsAddTaskModalOpen(true)} 
                className="inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Task
              </Button>
            </div>
          </div>
          
          {/* Task Filters */}
          <TaskFilters 
            activeFilter={activeFilter} 
            setActiveFilter={setActiveFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          
          {/* Task Categories */}
          <TaskCategories categories={categories} />
          
          {/* Task List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <TaskList 
              filter={activeFilter} 
              searchTerm={searchTerm} 
              refreshKey={refreshTasks}
            />
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav onOpenNewTaskModal={() => setIsAddTaskModalOpen(true)} />
      
      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={() => {
          setRefreshTasks(prev => prev + 1); // Increment to trigger refresh
          setIsAddTaskModalOpen(false);
        }}
      />
    </div>
  );
}
