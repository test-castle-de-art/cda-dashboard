import type React from "react";
import { useAuthContext } from "../context/auth";
import { LoginPage } from "./LoginPage";

export function ProtectedRoute({ children }: { children: React.ReactNode })
{
	const { isAuthenticated } = useAuthContext();
	if (!isAuthenticated)
	{
		return <LoginPage />;
	}

	return <>{children}</>
}