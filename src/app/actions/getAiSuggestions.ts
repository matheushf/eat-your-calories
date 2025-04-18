"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });

// {"ingredients": [{ "foodName": "foodname", "amount": "amount", "grams": "grams", "macronutrients": "macronutrients" }]}
// Remember that 100g of oatmeal has 73g of carbs, 14g of protein and 1g of fat.
// Remember that a medium size banana has 27g of carbs, 1g of protein and 0.3g of fat.

const schema = {
    $defs: {
      Ingredient: {
        properties: {
          foodName: { title: "Food Name", type: "string" },
          amount: { title: "Amount", type: "string" },
          macronutrients: { title: "Macronutrients", type: "string" },
          grams: {
            type: "string",
            title: "Grams",
          },
        },
        required: ["foodName", "amount", "grams"],
        title: "Ingredient",
        type: "object",
      },
    },
    properties: {
      ingredients: {
        items: { $ref: "#/$defs/Ingredient" },
        title: "Ingredients",
        type: "array",
      },
    },
    required: ["ingredients"],
    title: "Recipe",
    type: "object",
  };

export async function getAiSuggestions(macros: {
  time: string;
  carbs: number;
  protein: number;
  fat: number;
}) {
  try {
    const jsonSchema = JSON.stringify(schema, null, 4);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful nutritionist assistant. Knowing it's ${macros.time}, provide food combinations based on macronutrient requirements thinking about cheap, easy to prepare and affordable food.
          Do not suggest oil.
          Pay attention to returning the correct amount of fat, protein and carbs.
          The JSON object must use the schema: ${jsonSchema}`,
        },
        {
          role: "user",
          content: `${macros.carbs > 0 ? macros.carbs + "g" : "any amount"} of carbohydrates, ${macros.protein > 0 ? macros.protein + "g" : "any amount"} of protein, and ${macros.fat > 0 ? macros.fat + "g" : "any amount"} of fat.`,
        },
      ],
      model: "deepseek-r1-distill-llama-70b",
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_completion_tokens: 1024,
      stream: false,
      reasoning_format: "hidden",
    });

    return { suggestions: completion.choices[0].message.content };
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return { error: "Failed to get AI suggestions" };
  }
}
