import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TaskItemProps {
  task: Task;
  onTaskUpdated: () => void;
}

export default function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const formatDueDate = (date: Date | null) => {
    if (!date) return 'No due date';
    
    if (isToday(date)) {
      return 'Due Today';
    } else if (isTomorrow(date)) {
      return 'Due Tomorrow';
    } else if (isYesterday(date)) {
      return 'Due Yesterday';
    } else {
      return `Due ${format(date, 'MMM d, yyyy')}`;
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleTaskCompletion = async () => {
    if (!task.id) return;
    
    setIsUpdating(true);
    
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        completed: !task.completed
      });
      
      onTaskUpdated();
      
      toast({
        title: task.completed ? "Task reopened" : "Task completed",
        description: task.completed ? "Task has been reopened." : "Task has been marked as complete."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message || "An error occurred while updating the task."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task.id) return;
    
    setIsDeleting(true);
    
    try {
      const taskRef = doc(db, "tasks", task.id);
      await deleteDoc(taskRef);
      
      onTaskUpdated();
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Task deleted",
        description: "The task has been permanently deleted."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message || "An error occurred while deleting the task."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-start p-4 hover:bg-gray-50 transition duration-150 ${task.completed ? 'bg-gray-50' : ''}`}>
      <div className="flex-shrink-0 pt-1">
        <div 
          className={`h-5 w-5 rounded-full border-2 ${task.completed ? 'border-green-500 bg-green-500' : 'border-primary'} flex items-center justify-center cursor-pointer hover:bg-blue-50`}
          onClick={toggleTaskCompletion}
        >
          {task.completed && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isUpdating && (
            <span className="absolute -ml-1 -mt-1 h-5 w-5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span>
            </span>
          )}
        </div>
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              task.completed 
              ? 'bg-green-100 text-green-800' 
              : getPriorityClass(task.priority)
            }`}>
              {task.completed ? 'Completed' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <div className="flex items-center space-x-1">
              {!task.completed && (
                <button className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
              <button 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p className={`mt-1 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
          {task.description || "No description provided."}
        </p>
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              and remove it from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTask();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
