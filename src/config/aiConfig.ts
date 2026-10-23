export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_GEMINI_API_KEY_HERE";
export const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const IS_API_KEY_CONFIGURED = 
  Boolean(GEMINI_API_KEY) && 
  GEMINI_API_KEY !== "PASTE_YOUR_GEMINI_API_KEY_HERE" && 
  !GEMINI_API_KEY.includes("PASTE_YOUR");
