'use server'

import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });


export async function getAiSuggestions(macros: {
  carbs: number;
  protein: number;
  fat: number;
}) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful nutritionist assistant. Provide food suggestions based on macronutrient requirements."
        },
        {
          role: "user",
          content: `Suggest 3 food combinations that would provide approximately: ${macros.carbs}g of carbohydrates, ${macros.protein}g of protein, and ${macros.fat}g of fat. Format the response as a bulleted list with the name and approximate portion of each food item.`
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });

    return { suggestions: completion.choices[0].message.content };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { error: 'Failed to get AI suggestions' };
  }
} 