"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { getAiSuggestions } from "@/app/actions/getAiSuggestions";

interface AISuggestion {
  foodName: string;
  amount: string;
  grams: string;
  macronutrients: string;
}

export function AISuggestionsSection() {
  const [aiPeriod, setAiPeriod] = useState("morning");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleGetAiSuggestions = async () => {
    if (!carbs && !protein && !fat) {
      setAiError("Please fill at least one macronutrient value");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuggestions(null);

    try {
      const { suggestions, error } = await getAiSuggestions({
        time: aiPeriod,
        carbs: parseInt(carbs),
        protein: parseInt(protein),
        fat: parseInt(fat),
      });

      if (error) {
        setAiError(error);
        return;
      }

      if (suggestions) {
        const parsedSuggestions = JSON.parse(suggestions);
        setAiSuggestions(parsedSuggestions.ingredients);
      }
    } catch {
      setAiError("Failed to get suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAiSuggestion = async (suggestion: AISuggestion) => {
    const { data: user } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from("food_items").insert([
        {
          name: suggestion.foodName,
          grams: parseInt(suggestion.grams),
          period: aiPeriod,
          is_completed: false,
          user_id: user.user?.id,
        },
      ]);

      if (error) {
        console.error("Error adding food item:", error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
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

        <div className="flex flex-col flex-1 gap-2">
          <label htmlFor="period" className="text-sm font-medium">
            Period
          </label>
          <Select value={aiPeriod} onValueChange={setAiPeriod}>
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
            "Ask AI"
          )}
        </Button>

        {aiError && <p className="text-sm text-destructive">{aiError}</p>}
        {aiSuggestions && (
          <div className="flex flex-col gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{suggestion.foodName}</span>
                  <span className="text-sm text-muted-foreground">
                    {suggestion.amount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {suggestion.macronutrients}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="text-sm font-medium">
                    {suggestion.grams}
                  </span>
                  <Button
                    onClick={() => handleAddAiSuggestion(suggestion)}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Add to {aiPeriod}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
} 