const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileData, mimeType, masterIngredients } = await req.json();
    if (!fileData) throw new Error("No file provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const names: string[] = Array.isArray(masterIngredients) ? masterIngredients : [];

    const systemPrompt = `You extract structured recipe data from a recipe document (often ChatGPT generated).
Return ONLY JSON matching this shape:
{
  "name": string,
  "description": string,
  "preparation": string,   // numbered steps, keep line breaks with \\n
  "shelf_life": string,
  "storage": string,
  "yield_output": number,  // total finished yield in grams (estimate if not stated, default 1000)
  "calories": number|null, "protein": number|null, "fat": number|null, "carbs": number|null,
  "ingredients": [ { "ingredient_name": string, "quantity": number, "unit": "g"|"ml", "matched": boolean } ]
}
Rules:
- Convert every quantity to grams (g); liquids to ml. Ranges -> take the average. "4 Nos. / 500-550 g" -> 525 g.
- ingredient_name MUST be taken EXACTLY from this master ingredient list when a reasonable match exists (set matched=true):
${names.join("\n")}
- If no match exists, output the ingredient name as written in the document and set matched=false.
- Never invent prices or costs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the recipe from this document as JSON." },
              {
                type: "file",
                file: {
                  filename: fileName || "recipe.pdf",
                  file_data: `data:${mimeType || "application/pdf"};base64,${fileData}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      const status = response.status;
      const message =
        status === 429
          ? "Rate limit reached. Please try again shortly."
          : status === 402
          ? "AI credits exhausted. Please add credits in Lovable."
          : `AI request failed (${status}): ${text}`;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    const cleaned = String(raw).replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ recipe: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
