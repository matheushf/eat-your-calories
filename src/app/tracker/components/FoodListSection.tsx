"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { FoodListItem } from "./FoodListItem";
import { quickAddFood, updateFood, toggleFoodCompletion, deleteFood } from "@/app/actions/food";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
  const router = useRouter();
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

  const handleQuickAdd = async (period: string) => {
    const { name, grams, unit } = quickAdd[period.toLowerCase()];
    if (!name || (!grams && !unit)) return;

    try {
      setAddingPeriod(period.toLowerCase());
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('grams', grams);
      formData.append('unit', unit);
      formData.append('period', period.toLowerCase());
      
      await quickAddFood(formData);
      
      setQuickAdd({
        ...quickAdd,
        [period.toLowerCase()]: { name: '', grams: '', unit: '' }
      });
      
      router.refresh();
      toast.success('Food added successfully');
    } catch (error) {
      console.error('Failed to add food:', error);
      toast.error('Failed to add food');
    } finally {
      setAddingPeriod(null);
    }
  };

  const handleUpdateFood = async (id: string, updates: { name?: string; grams?: number | null; unit?: string | null }) => {
    try {
      await updateFood(id, updates);
      setEditingId(null);
      setEditingName("");
      setEditingGrams("");
      setEditingUnit("");
      router.refresh();
      toast.success('Food updated successfully');
    } catch (error) {
      console.error('Failed to update food:', error);
      toast.error('Failed to update food');
    }
  };

  const handleToggleCompletion = async (id: string, isCompleted: boolean) => {
    try {
      await toggleFoodCompletion(id, isCompleted);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle food completion:', error);
      toast.error('Failed to update food');
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteFood(id);
      router.refresh();
      toast.success('Food deleted successfully');
    } catch (error) {
      console.error('Failed to delete food:', error);
      toast.error('Failed to delete food');
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
                onToggleComplete={handleToggleCompletion}
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