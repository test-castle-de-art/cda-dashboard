import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export interface User
{
	id: string;
	username: string;
	isAdmin: boolean;
}

interface AuthContextType
{
	token: string |  null;
	user: User | null;
	isAuthenticated: boolean;
	login: (token: string, user: User) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode })
{
	const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
	const [user, setUser] = useState<User | null>(() =>
	{
		const stored = localStorage.getItem("user");
		return stored ? JSON.parse(stored) : null;
	});

	const login = (newToken: string, newUser: User) =>
	{
		localStorage.setItem("token", newToken);
		localStorage.setItem("user", JSON.stringify(newUser));
		setToken(newToken);
		setUser(newUser);
	};

	const logout = () =>
	{
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setToken(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext()
{
	const context = useContext(AuthContext);
	if (!context)
	{
		throw new Error("useAuthContext() must be used within AuthProvider");
	}
	return context;
}
