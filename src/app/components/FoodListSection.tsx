"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Pencil, Check, PlusIcon } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  grams: number;
  period: string;
  is_completed: boolean;
}

interface FoodListSectionProps {
  initialFoods: FoodItem[];
}

export function FoodListSection({ initialFoods }: FoodListSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingGrams, setEditingGrams] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState<{[key: string]: { name: string; grams: string }}>({
    morning: { name: '', grams: '' },
    lunch: { name: '', grams: '' },
    afternoon: { name: '', grams: '' },
    dinner: { name: '', grams: '' }
  });
  
  const router = useRouter();
  const supabase = createClient();

  const handleQuickAdd = async (period: string) => {
    const { name, grams } = quickAdd[period.toLowerCase()];
    if (!name || !grams) return;

    const { data: user } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from("food_items").insert([
        {
          name: name,
          grams: parseInt(grams),
          period: period.toLowerCase(),
          is_completed: false,
          user_id: user.user?.id,
        },
      ]);

      if (error) {
        console.error("Error adding food item:", error);
        return;
      }

      setQuickAdd({
        ...quickAdd,
        [period.toLowerCase()]: { name: '', grams: '' }
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateGrams = async (id: string) => {
    try {
      const { error } = await supabase
        .from("food_items")
        .update({ grams: parseInt(editingGrams) })
        .eq("id", id);

      if (error) {
        console.error("Error updating food item:", error);
        return;
      }

      setEditingId(null);
      setEditingGrams("");
      router.refresh();
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

  return (
    <Card className="p-6">
      {["Morning", "Lunch", "Afternoon", "Dinner"].map((mealTime) => (
        <div key={mealTime} className="mb-6 last:mb-0">
          <h2 className="text-lg font-semibold mb-2">{mealTime}</h2>
          <div className="mb-4">
            <form 
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickAdd(mealTime);
              }}
            >
              <Input
                placeholder="Food name"
                value={quickAdd[mealTime.toLowerCase()].name}
                onChange={(e) => setQuickAdd({
                  ...quickAdd,
                  [mealTime.toLowerCase()]: {
                    ...quickAdd[mealTime.toLowerCase()],
                    name: e.target.value
                  }
                })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="g"
                value={quickAdd[mealTime.toLowerCase()].grams}
                onChange={(e) => setQuickAdd({
                  ...quickAdd,
                  [mealTime.toLowerCase()]: {
                    ...quickAdd[mealTime.toLowerCase()],
                    grams: e.target.value
                  }
                })}
                className="w-20"
              />
              <Button type="submit" size="sm">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
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
                    {food.name} - 
                    {editingId === food.id ? (
                      <form 
                        className="inline-flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateGrams(food.id);
                        }}
                      >
                        <Input
                          type="number"
                          value={editingGrams}
                          onChange={(e) => setEditingGrams(e.target.value)}
                          className="w-20 h-6 px-1 py-0 text-sm"
                          autoFocus
                          onBlur={() => {
                            if (editingGrams) {
                              handleUpdateGrams(food.id);
                            } else {
                              setEditingId(null);
                            }
                          }}
                        />
                        <span className="text-sm">g</span>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(food.id);
                          setEditingGrams(food.grams.toString());
                        }}
                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded px-1"
                      >
                        {food.grams}g
                      </button>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (editingId === food.id) {
                        handleUpdateGrams(food.id);
                      } else {
                        setEditingId(food.id);
                        setEditingGrams(food.grams.toString());
                      }
                    }}
                    className={`h-8 w-8 text-muted-foreground ${
                      editingId === food.id 
                        ? "hover:text-green-500" 
                        : "hover:text-primary"
                    }`}
                  >
                    {editingId === food.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {editingId === food.id ? `Save ${food.name}` : `Edit ${food.name}`}
                    </span>
                  </Button>
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
              </div>
            ))}
        </div>
      ))}
    </Card>
  );
} 