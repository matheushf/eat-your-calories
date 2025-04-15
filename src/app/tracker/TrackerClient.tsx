"use client";

import { useState, ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Trash2, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAiSuggestions } from "@/app/actions/getAiSuggestions";

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
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("");
  const [period, setPeriod] = useState("morning");
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAddFood = async () => {
    if (!foodName || !grams || !period) return;
    const { data: user } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from("food_items").insert([
        {
          name: foodName,
          grams: parseInt(grams),
          period: period,
          is_completed: false,
          user_id: user.user?.id,
        },
      ]);

      if (error) {
        console.error("Error adding food item:", error);
        return;
      }

      // Refresh the page to get the latest data
      router.refresh();

      // Clear form
      setFoodName("");
      setGrams("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleFoodCompletion = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from("food_items")
        .update({ is_completed: !isCompleted })
        .eq("id", id);

      if (error) {
        console.error("Error updating food item:", error);
        return;
      }

      // Refresh the page to get the latest data
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase.from("food_items").delete().eq("id", id);

      if (error) {
        console.error("Error deleting food item:", error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setDeletingId(null);
    }
  };

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

  const handleGetAiSuggestions = async () => {
    if (!carbs || !protein || !fat) {
      setAiError("Please fill in all macronutrient values");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuggestions(null);

    try {
      const { suggestions, error } = await getAiSuggestions({
        carbs: parseInt(carbs),
        protein: parseInt(protein),
        fat: parseInt(fat),
      });

      if (error) {
        setAiError(error);
        return;
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      setAiError("Failed to get suggestions");
    } finally {
      setAiLoading(false);
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
        {/* Add Food Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Food</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1 gap-2">
              <label htmlFor="foodName" className="text-sm font-medium">
                Food name
              </label>
              <Input
                id="foodName"
                placeholder="Food name"
                value={foodName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFoodName(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="grams" className="text-sm font-medium">
                Grams
              </label>
              <Input
                id="grams"
                placeholder="Grams"
                type="number"
                value={grams}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setGrams(e.target.value)
                }
              />
            </div>

            <div className="flex flex-col flex-1 gap-2">
              <label htmlFor="period" className="text-sm font-medium">
                Period
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[8rem]">
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddFood} className="w-full">
            Add Food
          </Button>
        </Card>

        {/* AI Suggestions Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Get AI Suggestions</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="carbs" className="text-sm font-medium">
                  Carbohydrates (g)
                </label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="e.g., 50"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="protein" className="text-sm font-medium">
                  Protein (g)
                </label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="e.g., 30"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="fat" className="text-sm font-medium">
                  Fat (g)
                </label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="e.g., 20"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleGetAiSuggestions}
              disabled={aiLoading}
              className="w-full"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting suggestions...
                </>
              ) : (
                "Get AI ideas"
              )}
            </Button>

            {aiError && <p className="text-sm text-destructive">{aiError}</p>}
            {aiSuggestions && (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {aiSuggestions}
                </pre>
              </div>
            )}
          </div>
        </Card>

        {/* Food List Card */}
        <Card className="p-6">
          {["Morning", "Lunch", "Afternoon", "Dinner"].map((mealTime) => (
            <div key={mealTime} className="mb-6 last:mb-0">
              <h2 className="text-lg font-semibold mb-2">{mealTime}</h2>
              {initialFoods
                .filter(
                  (food) => food.period.toLowerCase() === mealTime.toLowerCase()
                )
                .map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between gap-2 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={food.is_completed}
                        onCheckedChange={() =>
                          toggleFoodCompletion(food.id, food.is_completed)
                        }
                      />
                      <span className={food.is_completed ? "line-through" : ""}>
                        {food.name} - {food.grams}g
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFood(food.id)}
                      disabled={deletingId === food.id}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === food.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {deletingId === food.id
                          ? "Deleting..."
                          : `Delete ${food.name}`}
                      </span>
                    </Button>
                  </div>
                ))}
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
