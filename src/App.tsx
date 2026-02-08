import { AuthProvider, useAuthContext } from "./context/auth";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./pages/ProtectedRoute";

function AppContent()
{
	const { logout } = useAuthContext();

	return (
		<>
			<ProtectedRoute>
				<div className="min-h-screen bg-gradient-to-br from-black to-gray-600 overflow-visible">
					<nav className="text-gray-500">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
							<div className="flex justify-between items-center">
								<h1 className="text-2xl font-bold">CDA Dashboard</h1>
								<button
									onClick={logout}
									className="px-4 py-2 bg-white/20 text-gray-900 hover:bg-white/30 rounded-lg transition-colors duration-200 font-medium"
								>
									Logout
								</button>
							</div>
						</div>
					</nav>
					<main className="overflow-y-auto">
						<Dashboard />
					</main>
				</div>
			</ProtectedRoute>
		</>
	);
}

function App()
{
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
