import { useState } from "react";
import { loginUser } from "../lib/api";
import { useAuthContext } from "../context/auth";
import { loginSchema } from "../../shared/zodSchemas";
import { z } from "zod";

interface FieldErrors {
	username?: string[];
	password?: string[];
}

export function LoginPage() {
	const { login } = useAuthContext();
	const [formData, setFormData] = useState({ username: "", password: "" });
	const [errors, setErrors] = useState<FieldErrors>({});
	const [generalError, setGeneralError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		setErrors({});
		setGeneralError("");
		setIsLoading(true);

		try
		{
			const parsed = loginSchema.safeParse(formData);
			if (!parsed.success)
			{
				const fieldErrors = z.treeifyError(parsed.error);
				setErrors(fieldErrors as FieldErrors);
				return ;
			}
			
			const response = await loginUser(formData.username, formData.password);
			login(response.token, {
				id: response.user.id,
				username: response.user.username,
				isAdmin: response.user.isAdmin
			});
		}
		catch (error)
		{
			const message = error instanceof Error ? error.message: "Login failed";
			setGeneralError(message);
		}
		finally
		{
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		const { name, value } = e.target;
		// setFormData((prev) => {return {...prev, [name]: value}});
		setFormData(prev => ({...prev, [name]: value}));
		if (errors[name as keyof FieldErrors])
		{
			setErrors(prev => ({...prev, [name]: undefined}));
		}
	};

	return (
		<>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-600 p-4">
				<div className="w-full max-w-md bg-gradient-to-br to-black from-gray-600 rounded-lg shadow-xl p-8">
					<h1 className="text-3xl font-bold text-center text-gray-500 mb-8">
						Dashboard Login
					</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						{generalError && (
							<div className="bg-red-50 border border-red-200 rounded-md p-3">
								<p className="text-red-600 text-sm">{generalError}</p>
							</div>
						)}

						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-500 mb-2">
								Username
							</label>
							<input
								id="username"
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								placeholder="Enter username"
								disabled={isLoading}
								autoComplete="username"
								className="w-full px-4 py-2 text-gray-500 bg-gradient-to-br from-black to-gray-600 border border-gray-500 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
							{errors.username && (
								<p className="text-red-600 text-sm mt-1">{errors.username[0]}</p>
							)}
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-500 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter password"
								disabled={isLoading}
								autoComplete="current-password"
								className="w-full px-4 py-2 text-gray-500 bg-gradient-to-br from-black to-gray-600 border border-gray-500 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
							{errors.password && (
								<p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-br from-gray-600 to-black text-gray-400 font-semibold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
