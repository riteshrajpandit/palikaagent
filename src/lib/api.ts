import axios from "axios";
import { getAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://palika.amigaa.com/api/v1/palika/bot/";

export interface ApiResponse {
  success: boolean;
  answer: string;
}

export async function sendMessageToBot(query: string): Promise<string> {
  try {
    // Get access token from cookies
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      throw new Error("Authentication required. Please login to continue.");
    }

    const response = await axios.post<ApiResponse>(API_URL, {
      query: query,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
        // Handle 401 Unauthorized - token might be expired
        if (error.response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        // Handle 403 Forbidden
        if (error.response.status === 403) {
          throw new Error("Access denied. You don't have permission to perform this action.");
        }
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to get response from bot. Please try again.");
  }
}
