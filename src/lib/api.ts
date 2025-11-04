import axios from "axios";
import { getAccessToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://palika.amigaa.com/api/v1";
const API_URL = `${BASE_URL}/palika/bot/`;

export interface ApiResponse {
  success: boolean;
  answer: string;
}

export async function sendMessageToBot(query: string): Promise<string> {
  try {
    // Get access token from cookies (optional for guests)
    const accessToken = getAccessToken();
    
    // Build headers - only include Authorization if token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.post<ApiResponse>(API_URL, {
      query: query,
    }, {
      headers,
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
        // Handle 401 Unauthorized - inform but don't force login
        if (error.response.status === 401) {
          throw new Error("Authentication failed. Some features may be limited.");
        }
        // Handle 403 Forbidden
        if (error.response.status === 403) {
          throw new Error("Access denied. Please login for full access.");
        }
        throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error("No response from server. Please check your connection.");
      }
    }
    
    throw new Error("Failed to get response from bot. Please try again.");
  }
}
