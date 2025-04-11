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

interface FoodItem {
  id: string;
  name: string;
  grams: number;
  period: string;
  is_completed: boolean;
}

interface TrackerClientProps {
  initialFoods: FoodItem[];
}

export default function TrackerClient({ initialFoods }: TrackerClientProps) {
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("");
  const [period, setPeriod] = useState("morning");
  const router = useRouter();
  const supabase = createClient();

  const handleAddFood = async () => {
    if (!foodName || !grams || !period) return;
    const { data: user } = await supabase.auth.getUser();
    
    try {
      const { error } = await supabase
        .from('food_items')
        .insert([{
          name: foodName,
          grams: parseInt(grams),
          period: period,
          is_completed: false,
          user_id: user.user?.id
        }]);

      if (error) {
        console.error('Error adding food item:', error);
        return;
      }

      // Refresh the page to get the latest data
      router.refresh();
      
      // Clear form
      setFoodName("");
      setGrams("");
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFoodCompletion = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ is_completed: !isCompleted })
        .eq('id', id);

      if (error) {
        console.error('Error updating food item:', error);
        return;
      }

      // Refresh the page to get the latest data
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Eat Your Calories</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Food</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Food name"
            value={foodName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFoodName(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Grams"
            type="number"
            value={grams}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGrams(e.target.value)}
            className="w-24"
          />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddFood}>Add</Button>
        </div>
      </Card>

      <Card className="p-6">
        {["Morning", "Lunch", "Afternoon", "Dinner"].map((mealTime) => (
          <div key={mealTime} className="mb-6 last:mb-0">
            <h2 className="text-lg font-semibold mb-2">{mealTime}</h2>
            {initialFoods
              .filter((food) => food.period.toLowerCase() === mealTime.toLowerCase())
              .map((food) => (
                <div key={food.id} className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={food.is_completed}
                    onCheckedChange={() => toggleFoodCompletion(food.id, food.is_completed)}
                  />
                  <span className={food.is_completed ? "line-through" : ""}>
                    {food.name} {food.grams}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </Card>
    </div>
  );
} 