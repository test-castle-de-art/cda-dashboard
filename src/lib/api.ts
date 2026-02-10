import { useState } from "react";
import type { User } from "../context/auth";

const API_URL = import.meta.env.MODE == "development" ? "http://localhost:3000" : "";

interface LoginResponse
{
    token: string;
    user: User
}

interface ErrorResponse
{
    message: string;
    issues?: {
        fieldErrors: Record<string, string[]>;
    };
}

export async function loginUser(username: string, password: string): Promise<LoginResponse>
{
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password})
    });

    const data: LoginResponse | ErrorResponse = await response.json();

    if (!response.ok)
    {
        throw new Error("message" in data ? data.message : "Login failed");
    }

    return data as LoginResponse;
}

export function useAuth()
{
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const login = async (username: string, password: string) =>
    {
        const response = await loginUser(username, password);
        localStorage.setItem("token", response.token);
        setToken(response.token);
    };

    const logout = () =>
    {
        localStorage.removeItem("token");
        setToken(null);
    };

    return { token, login, logout, isAuthenticated: !!token };
}

export function useApiClient()
{
    const token = localStorage.getItem("token");

    return {
        get: async <T,>(endpoint: string): Promise<T> =>
        {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok)
            {
                throw new Error(`API error: ${response.statusText}`);
            }

            return response.json() as Promise<T>;
        },

        post: async <T,>(endpoint: string, body: unknown): Promise<T> =>
        {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!response.ok)
            {
                throw new Error(`API error: ${response.statusText}`);
            }

            return response.json() as Promise<T>;
        },

        delete: async <T,>(endpoint: string): Promise<T> =>
        {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok)
            {
                throw new Error(`API error: ${response.statusText}`);
            }

            return response.json() as Promise<T>;
        }
    };
}