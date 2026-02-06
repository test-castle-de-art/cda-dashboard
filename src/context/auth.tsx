import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface AuthContextType
{
	token: string |  null;
	isAuthenticated: boolean;
	login: (token: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode })
{
	const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

	const login = (newToken: string) =>
	{
		localStorage.setItem("token", newToken);
		setToken(newToken);
	};

	const logout = () =>
	{
		localStorage.removeItem("token");
		setToken(null);
	};

	return (
		<AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
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
