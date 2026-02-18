import puter from "@heyputer/puter.js";
import type { AIModel } from "../types";

/**
 * AI Service — wraps Puter.js AI chat for all AI operations
 *
 * Puter.js handles authentication and API keys automatically.
 * Users pay through their own Puter account (User-Pays model).
 * No API keys needed from the developer side.
 */

// Default model — Gemini 2.0 Flash is free and fast
let currentModel: string = "gemini-2.0-flash";

/**
 * Set the AI model to use
 */
export const setAIModel = (model: AIModel): void => {
  currentModel = model;
};

/**
 * Get the current AI model
 */
export const getAIModel = (): string => currentModel;

/**
 * Send a chat completion request via Puter.js
 * Returns the text response from the AI model
 */
export const chatCompletion = async (prompt: string): Promise<string> => {
  try {
    const response = await puter.ai.chat(prompt, {
      model: currentModel,
    });

    // Puter.js response can be a string or an object with message.content
    if (typeof response === "string") {
      return response;
    }

    if (response?.message?.content) {
      const content = response.message.content;
      return typeof content === "string" ? content : JSON.stringify(content);
    }

    // Fallback: try to extract text from response
    if ((response as Record<string, unknown>)?.text) {
      return String((response as Record<string, unknown>).text);
    }

    // If response is an object, stringify it
    return typeof response === "object" ? JSON.stringify(response) : String(response);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`AI request failed: ${errMsg}`);
  }
};

/**
 * Send a streaming chat completion via Puter.js
 * Calls onChunk for each piece of text as it arrives
 */
export const chatCompletionStream = async (
  prompt: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const response = await puter.ai.chat(prompt, {
      model: currentModel,
      stream: true,
    });

    let fullText = "";

    for await (const part of response) {
      const chunk = part?.text || "";
      fullText += chunk;
      onChunk(chunk);
    }

    return fullText;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`AI streaming failed: ${errMsg}`);
  }
};

/**
 * Check if Puter.js is available and the user is signed in
 */
export const checkPuterStatus = (): boolean => {
  try {
    return typeof puter !== "undefined" && !!puter.ai;
  } catch {
    return false;
  }
};
