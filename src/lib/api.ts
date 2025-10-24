import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://palika.amigaa.com/api/v1/palika/bot/";

export interface ApiResponse {
  success: boolean;
  answer: string;
}

export async function sendMessageToBot(query: string): Promise<string> {
  try {
    const response = await axios.post<ApiResponse>(API_URL, {
      query: query,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data.success && response.data.answer) {
      return response.data.answer;
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error calling bot API:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to get response from bot. Please try again.");
  }
}
