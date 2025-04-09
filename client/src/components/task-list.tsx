import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Task } from "@/types";
import TaskItem from "./task-item";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TaskListProps {
  filter: string;
  searchTerm: string;
  refreshKey?: number;
}

export default function TaskList({ filter, searchTerm, refreshKey = 0 }: TaskListProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch tasks from Firebase
  const fetchTasks = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    
    try {
      // Remove the composite query temporarily to prevent the error
      const taskQuery = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid)
        // We removed orderBy to fix the Firebase index issue
      );
      
      const querySnapshot = await getDocs(taskQuery);
      const fetchedTasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTasks.push({
          id: doc.id,
          title: data.title,
          description: data.description || "",
          priority: data.priority,
          completed: data.completed,
          userId: data.userId,
          dueDate: data.dueDate ? new Date(data.dueDate.toDate()) : null,
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        });
      });
      
      // Sort manually by creation date (newest first) since we can't use orderBy
      fetchedTasks.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setTasks(fetchedTasks);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: error.message || "An error occurred while fetching your tasks.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks when user, filter, or refreshKey changes
  useEffect(() => {
    fetchTasks();
  }, [user, refreshKey]);

  useEffect(() => {
    // Filter tasks based on the selected filter and search term
    let result = [...tasks];
    
    // Apply filter
    if (filter === "today") {
      result = result.filter(task => {
        if (!task.dueDate) return false;
        const today = new Date();
        return (
          task.dueDate.getDate() === today.getDate() &&
          task.dueDate.getMonth() === today.getMonth() &&
          task.dueDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (filter === "upcoming") {
      result = result.filter(task => {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return task.dueDate >= today && !task.completed;
      });
    } else if (filter === "completed") {
      result = result.filter(task => task.completed);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(task => {
        return (
          task.title.toLowerCase().includes(search) ||
          (task.description && task.description.toLowerCase().includes(search))
        );
      });
    }
    
    // Apply sort
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as string] - priorityOrder[b.priority as string];
      } else if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
    
    setFilteredTasks(result);
  }, [tasks, filter, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full max-w-[250px]" />
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {filter === "completed" ? "Completed Tasks" : "Active Tasks"}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="h-8 w-[130px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks found</p>
            {searchTerm && <p className="text-sm mt-1">Try changing your search term</p>}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} onTaskUpdated={fetchTasks} />
          ))
        )}
      </div>
      
      {filteredTasks.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredTasks.length}</span> {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
