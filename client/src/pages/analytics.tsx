import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";

import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Task } from "@/types";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuthContext();
  const [_, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      setLoading(true);
      
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);

  // Show loading state or redirect if not authenticated
  if (authLoading || !user || loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  // Prepare chart data
  const priorityData = [
    { name: 'High', value: highPriorityTasks, color: '#EF4444' },
    { name: 'Medium', value: mediumPriorityTasks, color: '#F59E0B' },
    { name: 'Low', value: lowPriorityTasks, color: '#10B981' }
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'Pending', value: totalTasks - completedTasks, color: '#3B82F6' }
  ].filter(item => item.value > 0);
  
  // Daily task data (last 7 days)
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  });

  const dailyTasksData = last7Days.map(day => {
    const dayTasks = tasks.filter(task => task.createdAt && isSameDay(task.createdAt, day));
    const completedDayTasks = dayTasks.filter(task => task.completed);
    
    return {
      name: format(day, 'E'),
      date: format(day, 'MMM dd'),
      total: dayTasks.length,
      completed: completedDayTasks.length,
    };
  });

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
          {/* Analytics Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics & Insights</h1>
            <p className="text-gray-600 mt-1">Track your task management performance and productivity</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completionRate}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{highPriorityTasks}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution by Priority</CardTitle>
                <CardDescription>Breakdown of tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {priorityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No task data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
                <CardDescription>Completed vs. pending tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No task data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Daily Activity */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Task creation and completion over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dailyTasksData.some(d => d.total > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTasksData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => {
                          const dataPoint = dailyTasksData.find(d => d.name === label);
                          return dataPoint ? dataPoint.date : label;
                        }}
                      />
                      <Legend />
                      <Bar name="Created Tasks" dataKey="total" fill="#3B82F6" />
                      <Bar name="Completed Tasks" dataKey="completed" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No recent activity data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav onOpenNewTaskModal={() => {}} />
    </div>
  );
}