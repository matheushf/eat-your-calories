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
import { createClient } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export function AddFoodSection() {
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("");
  const [period, setPeriod] = useState("morning");
  const router = useRouter();
  const supabase = createClient();

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

      router.refresh();
      setFoodName("");
      setGrams("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
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
  );
} 