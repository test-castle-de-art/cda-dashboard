import { useEffect, useState } from "react";
import { useApiClient } from "../lib/api";
import { useAuthContext } from "../context/auth";

interface Project {
	id: string;
	name: string;
}

interface WorkLog {
	id: string;
	user_id: string;
	project_id: string;
	work_date: string;
	hours: number;
	notes: string | null;
	project?: Project;
}

export function Dashboard() {
	const { logout } = useAuthContext();
	const client = useApiClient();
	const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");
	const [formData, setFormData] = useState({
		project_id: "",
		work_date: new Date().toISOString().split("T")[0],
		hours: "",
		notes: ""
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const [logs, projectsList] = await Promise.all([
				client.get<WorkLog[]>("/api/work-logs"),
				client.get<Project[]>("/api/projects")
			]);
			setWorkLogs(logs);
			setProjects(projectsList);
			setError("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddWorkLog = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData.project_id || !formData.hours || !formData.work_date) {
			setError("Please fill in all required fields");
			return;
		}

		try {
			await client.post("/api/work-logs", {
				project_id: formData.project_id,
				work_date: formData.work_date,
				hours: parseFloat(formData.hours),
				notes: formData.notes || null
			});
			setFormData({
				project_id: "",
				work_date: new Date().toISOString().split("T")[0],
				hours: "",
				notes: ""
			});
			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add work log");
		}
	};

	const handleDeleteWorkLog = async (id: string) => {
		if (!confirm("Are you sure you want to delete this entry?")) return;

		try {
			await client.delete(`/api/work-logs/${id}`);
			await fetchData();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete work log");
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold text-white">Work Hours Dashboard</h1>
					<button
						onClick={logout}
						className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
					>
						Logout
					</button>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Work Hours Log</h2>
							{isLoading ? (
								<p className="text-gray-600">Loading...</p>
							) : workLogs.length === 0 ? (
								<p className="text-gray-600">No work logs yet. Add one below!</p>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead className="border-b border-gray-200">
											<tr>
												<th className="pb-3 font-semibold text-gray-700">Date</th>
												<th className="pb-3 font-semibold text-gray-700">Project</th>
												<th className="pb-3 font-semibold text-gray-700">Hours</th>
												<th className="pb-3 font-semibold text-gray-700">Notes</th>
												<th className="pb-3 font-semibold text-gray-700">Action</th>
											</tr>
										</thead>
										<tbody>
											{workLogs.map((log) => (
												<tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
													<td className="py-3">{log.work_date}</td>
													<td className="py-3">{log.project?.name || "Unknown"}</td>
													<td className="py-3">{log.hours}h</td>
													<td className="py-3 text-gray-600">{log.notes || "-"}</td>
													<td className="py-3">
														<button
															onClick={() => handleDeleteWorkLog(log.id)}
															className="text-red-600 hover:text-red-800 font-semibold"
														>
															Delete
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">Add Work Hours</h2>
						<form onSubmit={handleAddWorkLog} className="space-y-4">
							<div>
								<label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
									Project
								</label>
								<select
									id="project_id"
									value={formData.project_id}
									onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								>
									<option value="">Select a project</option>
									{projects.map((project) => (
										<option key={project.id} value={project.id}>
											{project.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="work_date" className="block text-sm font-medium text-gray-700 mb-1">
									Date
								</label>
								<input
									id="work_date"
									type="date"
									value={formData.work_date}
									onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
									Hours
								</label>
								<input
									id="hours"
									type="number"
									step="0.5"
									min="0"
									max="24"
									value={formData.hours}
									onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
									placeholder="e.g., 8.5"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
									Notes (optional)
								</label>
								<textarea
									id="notes"
									value={formData.notes}
									onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
									placeholder="Add any notes..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									rows={3}
								/>
							</div>

							<button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
							>
								Add Work Hours
							</button>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
