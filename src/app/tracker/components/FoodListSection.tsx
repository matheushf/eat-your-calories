"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { Loader2, PlusIcon } from "lucide-react";
import { FoodListItem } from "./FoodListItem";

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
  const [editingName, setEditingName] = useState<string>("");
  const [editingGrams, setEditingGrams] = useState<string>("");
  const [editingUnit, setEditingUnit] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState<{[key: string]: { name: string; grams: string; unit: string }}>({
    morning: { name: '', grams: '', unit: '' },
    lunch: { name: '', grams: '', unit: '' },
    afternoon: { name: '', grams: '', unit: '' },
    dinner: { name: '', grams: '', unit: '' }
  });
  const [addingPeriod, setAddingPeriod] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleQuickAdd = async (period: string) => {
    const { name, grams, unit } = quickAdd[period.toLowerCase()];
    if (!name || (!grams && !unit)) return;

    setAddingPeriod(period.toLowerCase());
    const { data: user } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from("food_items").insert([
        {
          name: name,
          grams: grams ? parseInt(grams) : null,
          unit: unit || null,
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
        [period.toLowerCase()]: { name: '', grams: '', unit: '' }
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setAddingPeriod(null);
    }
  };

  const handleUpdateFood = async (id: string, updates: { name?: string; grams?: number | null; unit?: string | null }) => {
    try {
      const { error } = await supabase
        .from("food_items")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating food item:", error);
        return;
      }

      setEditingId(null);
      setEditingName("");
      setEditingGrams("");
      setEditingUnit("");
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
                className="w-30 sm:flex-1"
              />
              <Input
                placeholder="unit"
                value={quickAdd[mealTime.toLowerCase()].unit}
                onChange={(e) => {
                  setQuickAdd({
                    ...quickAdd,
                    [mealTime.toLowerCase()]: {
                      ...quickAdd[mealTime.toLowerCase()],
                      unit: e.target.value,
                      grams: ''
                    }
                  });
                }}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="grams"
                value={quickAdd[mealTime.toLowerCase()].grams}
                onChange={(e) => {
                  setQuickAdd({
                    ...quickAdd,
                    [mealTime.toLowerCase()]: {
                      ...quickAdd[mealTime.toLowerCase()],
                      grams: e.target.value,
                      unit: ''
                    }
                  });
                }}
                className="w-20"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={addingPeriod === mealTime.toLowerCase()}
              >
                {addingPeriod === mealTime.toLowerCase() ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
          {initialFoods
            .filter(
              (food) => food.period.toLowerCase() === mealTime.toLowerCase()
            )
            .map((food) => (
              <FoodListItem
                key={food.id}
                food={food}
                editingId={editingId}
                editingName={editingName}
                editingGrams={editingGrams}
                editingUnit={editingUnit}
                deletingId={deletingId}
                onToggleComplete={toggleFoodCompletion}
                onDelete={handleDeleteFood}
                onUpdate={handleUpdateFood}
                setEditingId={setEditingId}
                setEditingName={setEditingName}
                setEditingGrams={setEditingGrams}
                setEditingUnit={setEditingUnit}
              />
            ))}
        </div>
      ))}
    </Card>
  );
} 