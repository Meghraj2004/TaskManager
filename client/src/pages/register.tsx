import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthContext();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setPasswordError("");
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      setLocation("/dashboard");
    } catch (error) {
      // Error is handled in the register function
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full space-y-8 p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">TaskFlow</h1>
          <p className="mt-2 text-sm text-gray-600">Create your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <Label htmlFor="name" className="sr-only">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-t-md rounded-b-none"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="reg-email" className="sr-only">Email address</Label>
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="reg-password" className="sr-only">Password</Label>
              <Input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="sr-only">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-t-none rounded-b-md"
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-sm text-red-600 mt-1">{passwordError}</p>
          )}

          <div>
            <Button 
              type="submit" 
              className="relative w-full group" 
              disabled={isLoading}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  </svg>
                )}
              </span>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account? 
              <Link href="/login" className="ml-1 font-medium text-primary hover:text-blue-700">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
