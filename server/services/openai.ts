import OpenAI from "openai";

// Using GPT-4 Turbo as requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MathTutorResponse {
  response: string;
  explanation?: string;
  examples?: string[];
}

export async function getMathTutorResponse(
  question: string, 
  modelName?: string
): Promise<MathTutorResponse> {
  try {
    // Use parameter, then environment variable, then fallback to gpt-4-turbo for chatbot
    const model = modelName || process.env.OPENAI_MODEL || "gpt-4-turbo";
    
    console.log(`🤖 Using OpenAI model: ${model} for question: "${question.substring(0, 50)}..."`);
    const startTime = Date.now();
    
    // Check if this is a structured help request (contains "They have attempted this 3 times unsuccessfully")
    const isHelpRequest = question.includes("They have attempted this 3 times unsuccessfully");
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: isHelpRequest ? 
            `You are an expert math tutor helping a 6th grade student who has struggled with a problem. 
            
            Always respond in JSON format with these fields:
            - "summary": A brief summary of the concept (1-2 sentences)
            - "question": The specific question being addressed
            - "steps": An array of step-by-step explanations, each starting with "Step X:" (4-6 steps maximum)
            
            Guidelines:
            - Use simple, clear language appropriate for 6th grade level
            - Break down the problem into logical steps
            - Be encouraging and supportive
            - Focus on understanding the concept, not just getting the answer
            - Use examples that relate to the specific problem` :
            `You are an expert math tutor. You help students understand mathematical concepts through clear explanations, step-by-step solutions, and practical examples. 
            
            Always respond in JSON format with these fields:
            - "summary": A brief summary of the concept
            - "question": The specific question being addressed
            - "steps": An array of step-by-step explanations, each starting with "Step X:"
            
            Guidelines:
            - Always provide clear, age-appropriate explanations
            - Break down complex problems into simple steps
            - Use examples when helpful
            - Encourage learning rather than just giving answers
            - Be patient and supportive
            - Use mathematical notation when appropriate`
        },
        {
          role: "user",
          content: question
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`⚡ OpenAI ${model} response time: ${duration}ms`);
    
    // Always return the universal format
    return {
      response: JSON.stringify(result), // Return the full JSON structure
      explanation: result.explanation,
      examples: result.examples
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI response: " + (error as Error).message);
  }
}
