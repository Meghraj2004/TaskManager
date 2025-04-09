import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";

import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import AddTaskModal from "@/components/add-task-modal";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const { user, loading } = useAuthContext();
  const [_, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  // Fetch tasks for the selected month
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(tasksQuery);
        const tasksList: Task[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasksList.push({
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate ? data.dueDate.toDate() : null,
            priority: data.priority,
            completed: data.completed,
            createdAt: data.createdAt.toDate(),
          });
        });
        
        setTasks(tasksList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    
    fetchTasks();
  }, [user, refreshTasks, currentMonth]);

  // Filter tasks for the selected day
  useEffect(() => {
    if (selectedDay) {
      const filtered = tasks.filter(task => 
        task.dueDate && isSameDay(task.dueDate, selectedDay)
      );
      setDayTasks(filtered);
    } else {
      setDayTasks([]);
    }
  }, [selectedDay, tasks]);

  // Compute days with tasks
  const daysWithTasks = tasks
    .filter(task => task.dueDate)
    .map(task => task.dueDate as Date);

  // Show loading state or redirect if not authenticated
  if (loading || !user) {
    return null;
  }

  const renderTaskCount = (date: Date) => {
    const count = daysWithTasks.filter(taskDate => isSameDay(taskDate, date)).length;
    if (count > 0) {
      return (
        <div className="absolute bottom-1 right-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-medium">
            {count}
          </span>
        </div>
      );
    }
    return null;
  };

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
          {/* Calendar Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Calendar</h1>
              <p className="text-gray-600 mt-1">View and manage your tasks by date</p>
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
          
          {/* Calendar and Tasks Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                className="w-full"
                classNames={{
                  day_today: "bg-blue-50 text-blue-900 font-medium",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                }}
                components={{
                  DayContent: (props) => (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {props.date.getDate()}
                      {renderTaskCount(props.date)}
                    </div>
                  )
                }}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Select a day"}
                </h3>
                {isToday(selectedDay as Date) && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Today
                  </span>
                )}
              </div>
              
              <div className="divide-y divide-gray-200">
                {dayTasks.length === 0 ? (
                  <div className="py-6 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No tasks for this day</p>
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <div key={task.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className={`h-3 w-3 mt-1.5 rounded-full ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <div className="ml-3">
                          <h4 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
          setRefreshTasks(prev => prev + 1);
          setIsAddTaskModalOpen(false);
        }}
      />
    </div>
  );
}