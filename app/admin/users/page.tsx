"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Plus,
	Upload,
	Trash2,
	Search,
	UserPlus,
	Mail,
	Users,
	ShieldCheck,
	Filter,
	MoreVertical,
	CheckCircle2,
	Clock,
	X
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function UsersPage() {
	const router = useRouter();
	const { session } = useAuthStore();
	const { sidebarOpen } = useUIStore();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	// Filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [showAddForm, setShowAddForm] = useState(false);

	// Modal states
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		role: "student" as const,
		first_name: "",
		last_name: "",
		matric_number: "",
		level: 100,
	});

	useEffect(() => {
		if (session && session.role !== "admin") {
			router.push("/");
		}
	}, [session, router]);

	const fetchUsers = async () => {
		try {
			const res = await fetch("/api/admin/users");
			const data = await res.json();
			if (res.ok) {
				setUsers(data.users || []);
			} else {
				toast.error(data.error || "Failed to load users");
			}
		} catch (err) {
			toast.error("Network error while loading users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session?.role === "admin") {
			fetchUsers();
		}
	}, [session]);

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			const matchesSearch =
				`${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(user.matric_number || "").toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = roleFilter === "all" || user.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [users, searchTerm, roleFilter]);

	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault();
		const promise = fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		}).then(async (res) => {
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to add user");

			setUsers([...users, data.user]);
			setShowAddForm(false);
			setFormData({
				email: "",
				role: "student",
				first_name: "",
				last_name: "",
				matric_number: "",
				level: 100,
			});
			return data;
		});

		toast.promise(promise, {
			loading: 'Provisioning new account...',
			success: 'User added successfully. Welcome email sent.',
			error: (err) => err.message,
		});
	};

	const handleDeleteConfirm = async () => {
		if (!userToDelete) return;

		setIsDeleting(true);
		try {
			const res = await fetch(`/api/admin/users/${userToDelete}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setUsers(users.filter((u) => u._id !== userToDelete));
				toast.success("User successfully removed from system");
				setIsDeleteModalOpen(false);
			} else {
				toast.error("Failed to remove user");
			}
		} catch (err) {
			toast.error("An error occurred during deletion");
		} finally {
			setIsDeleting(false);
			setUserToDelete(null);
		}
	};

	if (!session || session.role !== "admin") return null;

	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			<Header />
			<Sidebar />

			<main className={cn(
				"pt-20 px-4 pb-12 transition-all duration-300 min-h-screen",
				sidebarOpen ? "lg:pl-[280px]" : "lg:pl-24"
			)}>
				<div className="max-w-7xl mx-auto space-y-8">

					{/* Header Section */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
								<Users className="h-4 w-4" />
								Identity Management
							</div>
							<h1 className="text-4xl font-black tracking-tight text-slate-900">Directory.</h1>
							<p className="text-slate-500 font-medium">Manage and audit institutional access for students and faculty.</p>
						</div>

						<div className="flex items-center gap-3">
							<Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-slate-200 shadow-sm gap-2 font-bold hover:bg-slate-50 transition-all">
								<Upload className="h-4 w-4" />
								Import CSV
							</Button>
							<Button
								onClick={() => setShowAddForm(true)}
								className="h-12 px-6 rounded-2xl bg-primary shadow-lg shadow-primary/20 gap-2 font-bold hover:scale-[1.02] transition-all"
							>
								<Plus className="h-4 w-4" />
								Add New Member
							</Button>
						</div>
					</div>

					{/* Stats/Quick Glance */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{ label: "Total Users", value: users.length, icon: Users, color: "bg-blue-500" },
							{ label: "Active", value: users.filter(u => u.isPasswordSet).length, icon: CheckCircle2, color: "bg-emerald-500" },
							{ label: "Pending", value: users.filter(u => !u.isPasswordSet).length, icon: Clock, color: "bg-amber-500" },
							{ label: "Administrative", value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: "bg-slate-800" },
						].map((stat, i) => (
							<div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
								<div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white", stat.color)}>
									<stat.icon className="h-6 w-6" />
								</div>
								<div>
									<div className="text-2xl font-black text-slate-900 leading-none">{stat.value}</div>
									<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
								</div>
							</div>
						))}
					</div>

					{/* Add User Modal-form Overlay */}
					{showAddForm && (
						<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
							<div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddForm(false)} />
							<div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
								<div className="p-8">
									<div className="flex items-center justify-between mb-8">
										<div className="flex items-center gap-3">
											<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
												<UserPlus className="h-6 w-6" />
											</div>
											<div>
												<h2 className="text-2xl font-black text-slate-900 tracking-tight">Provision Member</h2>
												<p className="text-slate-500 text-sm font-medium">Create a new institutional profile.</p>
											</div>
										</div>
										<button onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
											<X className="h-5 w-5" />
										</button>
									</div>

									<form onSubmit={handleAddUser} className="space-y-6">
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
												<Input
													placeholder="e.g. John"
													className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
													value={formData.first_name}
													onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
													required
												/>
											</div>
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
												<Input
													placeholder="e.g. Doe"
													className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
													value={formData.last_name}
													onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
													required
												/>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
											<div className="relative">
												<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
												<Input
													placeholder="name@university.edu"
													type="email"
													className="h-12 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
													value={formData.email}
													onChange={(e) => setFormData({ ...formData, email: e.target.value })}
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ID Number</label>
												<Input
													placeholder="Matric or Lecturer ID"
													className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
													value={formData.matric_number}
													onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
													required
												/>
											</div>
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">System Role</label>
												<select
													value={formData.role}
													onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
													className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
												>
													<option value="student">Student</option>
													<option value="lecturer">Lecturer</option>
													<option value="admin">Administrator</option>
												</select>
											</div>
										</div>

										{formData.role === "student" && (
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Level</label>
												<div className="flex gap-2">
													{[100, 200, 300, 400].map((lvl) => (
														<button
															key={lvl}
															type="button"
															onClick={() => setFormData({ ...formData, level: lvl })}
															className={cn(
																"flex-1 h-12 rounded-xl text-sm font-black transition-all border-2",
																formData.level === lvl
																	? "border-primary bg-primary/5 text-primary"
																	: "border-slate-50 bg-slate-50 text-slate-400 hover:bg-slate-100"
															)}
														>
															{lvl}L
														</button>
													))}
												</div>
											</div>
										)}

										<div className="pt-4 flex gap-3">
											<Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="h-14 flex-1 rounded-2xl font-bold">
												Discard
											</Button>
											<Button type="submit" className="h-14 flex-[2] rounded-2xl bg-primary font-black shadow-xl shadow-primary/20">
												Generate Account
											</Button>
										</div>
									</form>
								</div>
							</div>
						</div>
					)}

					{/* Directory Table */}
					<div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">

						{/* Table Toolbar */}
						<div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="relative w-full sm:w-80 group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
								<Input
									placeholder="Filter by name, email, or ID..."
									className="pl-11 h-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
								{["all", "student", "lecturer", "admin"].map((role) => (
									<button
										key={role}
										onClick={() => setRoleFilter(role)}
										className={cn(
											"px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
											roleFilter === role
												? "bg-white text-primary shadow-sm"
												: "text-slate-400 hover:text-slate-600"
										)}
									>
										{role}
									</button>
								))}
							</div>
						</div>

						{/* Table Content */}
						<div className="overflow-x-auto min-h-[400px]">
							{loading ? (
								<div className="flex flex-col items-center justify-center py-32 space-y-4">
									<LoadingSpinner size="lg" />
									<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Identity Data...</p>
								</div>
							) : filteredUsers.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-32 text-center">
									<div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
										<Filter className="h-8 w-8 text-slate-200" />
									</div>
									<h3 className="text-xl font-black text-slate-900 tracking-tight">No Matches.</h3>
									<p className="text-slate-500 font-medium">Try adjusting your search criteria or filters.</p>
								</div>
							) : (
								<table className="w-full">
									<thead>
										<tr className="bg-slate-50/50">
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional ID</th>
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
											<th className="text-right py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50">
										{filteredUsers.map((user) => (
											<tr key={user._id} className="group hover:bg-slate-50/30 transition-colors">
												<td className="py-5 px-8">
													<div className="flex items-center gap-4">
														<div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
															{user.first_name[0]}{user.last_name[0]}
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-bold text-slate-900 leading-tight">
																{user.first_name} {user.last_name}
															</span>
															<span className="text-[11px] font-medium text-slate-400">
																{user.email}
															</span>
														</div>
													</div>
												</td>
												<td className="py-5 px-8">
													<div className="flex flex-col">
														<span className="text-xs font-black text-slate-700 tracking-wider uppercase">
															{user.matric_number || user.lecturer_number}
														</span>
														<div className="flex items-center gap-2 mt-1">
															<span className={cn(
																"px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
																user.role === 'admin' ? "bg-slate-800 text-white" : "bg-primary/10 text-primary"
															)}>
																{user.role}
															</span>
															{user.role === 'student' && (
																<span className="text-[9px] font-bold text-slate-400">{user.level}L</span>
															)}
														</div>
													</div>
												</td>
												<td className="py-5 px-8">
													<div className={cn(
														"inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold",
														user.isPasswordSet
															? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50"
															: "bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50"
													)}>
														{user.isPasswordSet ? (
															<>
																<CheckCircle2 className="h-3 w-3" />
																Active Account
															</>
														) : (
															<>
																<Clock className="h-3 w-3" />
																Awaiting Sync
															</>
														)}
													</div>
												</td>
												<td className="py-5 px-8 text-right">
													<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															onClick={() => {
																setUserToDelete(user._id || null);
																setIsDeleteModalOpen(true);
															}}
															className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
															title="Remove Member"
														>
															<Trash2 className="h-4 w-4" />
														</button>
														<button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all shadow-sm">
															<MoreVertical className="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>

				<ConfirmationModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteConfirm}
					title="Remove Institutional Member?"
					description="This action is irreversible. All academic records, submissions, and access credentials associated with this user will be purged from the university database."
					isLoading={isDeleting}
				/>
			</main>
		</div>
	);
}
