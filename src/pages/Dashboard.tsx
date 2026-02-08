import { useState, useEffect } from "react";
import { useApiClient } from "../lib/api";

interface Project
{
	id: string;
	name: string;
}

interface WorkLog
{
	id: string;
	userId: string;
	projectId: string;
	workDate: string;
	hours: number;
	notes: string | null;
	project?: Project;
}


export function Dashboard()
{
	const client = useApiClient();
	const [isLoading, setIsLoading] = useState(false);
	const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [error, setError] = useState<string>("");
	const [formData, setFormData] = useState({
		projectId: "",
		workDate: new Date().toISOString().split("T")[0],
		hours: "",
		notes: ""
	});
	
	useEffect(() =>
	{
		const testProject: Project = {id: "123", name: "test"}
		const testProjects: Project[] = [];
		testProjects.push(testProject);
		setProjects(testProjects);
		const testLogs: WorkLog[] = [];
		const testEntry: WorkLog = {id: "1", userId: "1", projectId: "1", workDate: "1", hours: 1, notes: null, project: testProject };
		testLogs.push(testEntry);
		setWorkLogs(testLogs);
	}, []);

	const fetchData = async () =>
	{
		try
		{
			setIsLoading(true);
			const [logs, projectsList] = await Promise.all([
				client.get<WorkLog[]>("/api/workLogs"),
				client.get<Project[]>("/api/projects")
			]);
			setWorkLogs(logs);
			setProjects(projectsList);
			setError("");
		}
		catch (err)
		{
			setError(err instanceof Error ? err.message : "Failed to load data");
		}
		finally
		{
			setIsLoading(false);
		}
	};

	const handleAddWorkLog = async () =>
	{

	};

	const handleDeleteWorkLog = async (id: string) =>
	{
		if (!confirm("Are you sure you want to delete this entry?"))
			return ;
		
		try
		{
			await client.delete(`/api/workLogs/${id}`);
			await fetchData();
		}
		catch (err)
		{
			setError(err instanceof Error ? err.message : "Failed to delete work log");
		}
	};

	return (
		<main className="w-full text-gray-500 p-8">
			<h1 className="text-4xl font-bold pb-8 text-center">Work hours</h1>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
					<p className="text-red-600">{error}</p>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2 bg-gradient-to-br from-gray-700 to-black rounded-lg shadow-lg p-6">
					<h2 className="text-2xl font-bold text-gray-500 mb-4">Work Hours Log</h2>
					{isLoading ? (
						<p className="text-gray-600">Loading...</p>
					) : workLogs.length == 0 ? (
						<p className="text-gray-600">No work logs yet</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-md sm:text-lg md:text-lg lg:text-xl">
								<thead className="border-b border-gray-500">
									<tr>
										<th className="pb-2 font-semibold text-gray-500">Date</th>
										<th className="pb-2 font-semibold text-gray-500">Project</th>
										<th className="pb-2 font-semibold text-gray-500">Hours</th>
										<th className="pb-2 font-semibold text-gray-500">Notes</th>
										<th className="pb-2 font-semibold text-gray-500">Action</th>
									</tr>
								</thead>
								<tbody>
									{workLogs.map((log) => (
										<tr key={log.id} className="border-b border-gray-600 hover:border-gray-500">
											<td className="py-3">{log.workDate}</td>
											<td className="py-3">{log.project?.name || "[Missing project name]"}</td>
											<td className="py-3">{log.hours}h</td>
											<td className="py-3">{log.notes || "-"}</td>
											<td className="py-3">
												<button
													onClick={() => handleDeleteWorkLog(log.id)}
													className="text-red-600/50 hover:text-red-700 font-semibold"
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

				<div className="bg-gradient-to-br from-gray-700 to-black rounded-lg shadow-lg p-6">
					<h2 className="text-2xl font-bold text-gray-500 mb-4">Add log</h2>
					<form onSubmit={handleAddWorkLog} className="space-y-4">
						<article>
							<label htmlFor="project_id" className="block text-md sm:text-lg md:text-lg lg:text-xlfont-medium text-gray-500 mb-1">
								Project
							</label>
							<select
								id="project_id"
								value={formData.projectId}
								onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
								className="w-full px-3 py-2 text-gray-400 bg-gray-700 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							>
								<option value="" className="bg-gray-700">Select a project</option>
								{projects.map((project) => (
									<option key={project.id} value={project.name} className="bg-gray-700">
										{project.name}
									</option>
								))}
							</select>
						</article>

						<article>
							<label htmlFor="work_date" className="block text-md sm:text-lg md:text-lg lg:text-xlfont-medium text-gray-500 mb-1">
								Date
							</label>
							<input
								id="work_date"
								type="date"
								value={formData.workDate}
								onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
								className="w-full px-3 py-2 text-gray-400 bg-gray-700 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
						</article>

						<article>
							<label htmlFor="hours" className="block text-md sm:text-lg md:text-lg lg:text-xlfont-medium text-gray-500 mb-1">
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
								placeholder="e.g. 8,5"
								className="w-full px-3 py-2 text-gray-400 bg-gray-700 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
						</article>

						<article>
							<label htmlFor="notes" className="block text-md sm:text-lg md:text-lg lg:text-xlfont-medium text-gray-500 mb-1">
								Notes
							</label>
							<textarea
								id="notes"
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder="Notes..."
								className="w-full px-3 py-2 text-gray-400 bg-gray-700 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={3}
							/>
						</article>

						<button
							type="submit"
							className="w-full bg-gradient-to-br from-gray-700 to-black text-gray-400 font-semibold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
						>
							Add log
						</button>
					</form>
				</div>
			</div>
		</main>
	)
}
