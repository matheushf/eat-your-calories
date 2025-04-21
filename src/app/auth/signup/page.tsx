"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await signup(formData);
    } catch (error) {
      console.log("Signup failed:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
      redirect("/tracker");
    }
  };

  return (
    <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center p-4 sm:p-0">
      <div className="w-full py-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Eat Your Calories 
        </h1>
        <p className="text-gray-400 mb-8">Create your account to get started</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input name="email" type="email" placeholder="Email" required />
          </div>
          <div>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/auth/login" className="text-primary hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
