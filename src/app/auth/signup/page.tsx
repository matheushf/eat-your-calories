"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/app/actions/auth";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await signup(formData);
      toast.success("Please check your email to verify your account.");
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
      redirect("/auth/verify");
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            name="name"
            type="text"
            placeholder="Name"
            required
          />
        </div>
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
} 