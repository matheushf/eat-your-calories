"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await login(formData);
    } catch (error) {
      console.log("Login failed:", error);
      toast.error("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
      redirect("/tracker");
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
