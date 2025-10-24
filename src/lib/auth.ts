import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "palika_access_token";
const REFRESH_TOKEN_KEY = "palika_refresh_token";
const USER_DATA_KEY = "palika_user_data";

export interface LoginCredentials {
  email_address: string;
  password: string;
}

export interface UserData {
  email_address: string;
  user_id: string;
  name: string;
  surname: string;
  palika: string | null;
  is_staff_user: boolean;
  is_system_admin: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  email_address: string;
  user_id: string;
  name: string;
  surname: string;
  palika: string | null;
  is_staff_user: boolean;
  is_system_admin: boolean;
}

const AUTH_API_URL = "https://palika.amigaa.com/auth/v1";

/**
 * Login user with credentials
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${AUTH_API_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Login failed");
    }

    const data: LoginResponse = await response.json();
    
    // Store tokens and user data
    saveAuthData(data);
    
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Save authentication data to cookies
 */
export function saveAuthData(data: LoginResponse): void {
  // Store tokens with secure settings
  Cookies.set(ACCESS_TOKEN_KEY, data.access_token, {
    expires: 7, // 7 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  Cookies.set(REFRESH_TOKEN_KEY, data.refresh_token, {
    expires: 30, // 30 days
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  // Store user data
  const userData: UserData = {
    email_address: data.email_address,
    user_id: data.user_id,
    name: data.name,
    surname: data.surname,
    palika: data.palika,
    is_staff_user: data.is_staff_user,
    is_system_admin: data.is_system_admin,
  };

  Cookies.set(USER_DATA_KEY, JSON.stringify(userData), {
    expires: 7,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Get access token from cookies
 */
export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

/**
 * Get user data from cookies
 */
export function getUserData(): UserData | null {
  const userData = Cookies.get(USER_DATA_KEY);
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !!getUserData();
}

/**
 * Logout user by clearing all auth data
 */
export function logoutUser(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(USER_DATA_KEY);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      // If refresh fails, logout user
      logoutUser();
      return null;
    }

    const data = await response.json();
    
    // Update access token
    Cookies.set(ACCESS_TOKEN_KEY, data.access, {
      expires: 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return data.access;
  } catch (error) {
    console.error("Token refresh error:", error);
    logoutUser();
    return null;
  }
}
