"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { AISuggestionsSection } from "@/app/tracker/components/AISuggestionsSection";
import { FoodListSection } from "@/app/tracker/components/FoodListSection";

interface FoodItem {
  id: string;
  name: string;
  grams: number;
  period: string;
  is_completed: boolean;
}

interface TrackerClientProps {
  initialFoods: FoodItem[];
  userEmail?: string | null;
}

export default function TrackerClient({
  initialFoods,
  userEmail,
}: TrackerClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return;
      }
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 p-4 bg-background border-b z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Eat Your Calories</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex flex-col gap-2 pb-4 border-b">
                    <p className="text-sm text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium">{userEmail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start px-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-col">
        {/* Desktop Header */}
        <div className="flex justify-end p-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Desktop Title */}
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Eat Your Calories</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-2xl mt-16 sm:mt-0">
        <AISuggestionsSection />
        <FoodListSection initialFoods={initialFoods} />
      </div>
    </>
  );
}
