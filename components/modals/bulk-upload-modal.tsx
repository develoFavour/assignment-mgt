"use client";

import { useState, useRef } from "react";
import {
    X,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ArrowRight,
    Loader2,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Papa from "papaparse";
import { toast } from "sonner";

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newUsers: any[]) => void;
}

type Step = "upload" | "mapping" | "review" | "processing";

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [step, setStep] = useState<Step>("upload");
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({
        first_name: "",
        last_name: "",
        email: "",
        matric_number: "",
        role: "",
        level: ""
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const requiredFields = ["email", "first_name", "last_name", "role"];
    const fieldLabels: Record<string, string> = {
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email Address",
        matric_number: "ID / Matric Number",
        role: "System Role (student/lecturer)",
        level: "Level (100/200/etc)"
    };

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    toast.error("CSV file is empty");
                    return;
                }
                const firstRow = results.data[0] as Record<string, any>;
                setCsvData(results.data);
                setHeaders(Object.keys(firstRow));

                // Try to auto-map
                const newMapping = { ...mapping };
                const csvHeaders = Object.keys(firstRow);

                csvHeaders.forEach(header => {
                    const h = header.toLowerCase().replace(/[^a-z0-9]/g, "");
                    if (h.includes("email")) newMapping.email = header;
                    if (h.includes("firstname") || (h === "first")) newMapping.first_name = header;
                    if (h.includes("lastname") || (h === "last")) newMapping.last_name = header;
                    if (h.includes("matric") || h.includes("id") || h.includes("number")) newMapping.matric_number = header;
                    if (h.includes("role")) newMapping.role = header;
                    if (h.includes("level")) newMapping.level = header;
                });

                setMapping(newMapping);
                setStep("mapping");
            },
            error: (err) => {
                toast.error("Failed to parse CSV: " + err.message);
            }
        });
    };

    const handleProcess = async () => {
        setIsProcessing(true);
        setStep("processing");

        const formattedUsers = csvData.map(row => ({
            email: row[mapping.email],
            first_name: row[mapping.first_name],
            last_name: row[mapping.last_name],
            matric_number: row[mapping.matric_number],
            role: (row[mapping.role]?.toLowerCase() || "student") as "student" | "lecturer",
            level: row[mapping.level] ? parseInt(row[mapping.level]) : 100
        }));

        try {
            const res = await fetch("/api/admin/users/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users: formattedUsers })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`Successfully imported ${data.results.success} users`);
                if (data.results.failed > 0) {
                    toast.warning(`${data.results.failed} entries failed. Check console for details.`);
                    console.error("Bulk upload failures:", data.results.errors);
                }
                onSuccess(data.users);
                onClose();
            } else {
                toast.error(data.error || "Failed to process bulk upload");
                setStep("review");
            }
        } catch (err) {
            toast.error("An error occurred during processing");
            setStep("review");
        } finally {
            setIsProcessing(false);
        }
    };

    const isMappingValid = requiredFields.every(field => mapping[field] !== "");

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Provisioning</h2>
                            <p className="text-slate-500 text-sm font-medium">Sync multiple accounts via CSV registry.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {step === "upload" && (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                                <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="h-10 w-10 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Select CSV Registry</h3>
                                <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">
                                    Upload your standard member directory in CSV format.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex gap-4">
                                <div className="p-2 rounded-xl bg-white text-slate-400 shrink-0 h-fit">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">CSV Requirements</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        File must contain headers. Essential fields include Full Name, Institutional Email, and Role (student/lecturer).
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "mapping" && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Schema Key Mapping</h3>
                                <div className="grid gap-4">
                                    {Object.keys(fieldLabels).map((field) => (
                                        <div key={field} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-slate-900 leading-none">
                                                    {fieldLabels[field]}
                                                    {requiredFields.includes(field) && <span className="text-red-500 ml-1">*</span>}
                                                </div>
                                            </div>
                                            <div className="w-48">
                                                <select
                                                    value={mapping[field]}
                                                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                                                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                >
                                                    <option value="">Select CSV Column</option>
                                                    {headers.map(h => (
                                                        <option key={h} value={h}>{h}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("upload")}
                                    className="h-14 flex-1 rounded-2xl font-bold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep("review")}
                                    disabled={!isMappingValid}
                                    className="h-14 flex-[2] rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 gap-2"
                                >
                                    Review Data
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "review" && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Integrity Check</h3>
                                    <div className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                                        {csvData.length} Entries Detected
                                    </div>
                                </div>
                                <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-60 overflow-y-auto bg-slate-50/50">
                                    <table className="w-full text-left text-[10px]">
                                        <thead className="bg-white border-b border-slate-100 sticky top-0">
                                            <tr>
                                                <th className="p-3 font-black text-slate-400 uppercase">First Name</th>
                                                <th className="p-3 font-black text-slate-400 uppercase">Last Name</th>
                                                <th className="p-3 font-black text-slate-400 uppercase">Email</th>
                                                <th className="p-3 font-black text-slate-400 uppercase">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {csvData.slice(0, 10).map((row, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-slate-700">{row[mapping.first_name]}</td>
                                                    <td className="p-3 font-bold text-slate-700">{row[mapping.last_name]}</td>
                                                    <td className="p-3 font-bold text-slate-700">{row[mapping.email]}</td>
                                                    <td className="p-3 font-bold text-slate-700 uppercase">{row[mapping.role] || "student"}</td>
                                                </tr>
                                            ))}
                                            {csvData.length > 10 && (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-slate-400 font-bold italic">
                                                        And {csvData.length - 10} more entries...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("mapping")}
                                    className="h-14 flex-1 rounded-2xl font-bold"
                                >
                                    Modify Mapping
                                </Button>
                                <Button
                                    onClick={handleProcess}
                                    className="h-14 flex-[2] rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-200 gap-2 hover:bg-emerald-700"
                                >
                                    Confirm & Provision
                                    <CheckCircle2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                <Upload className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Merging Data...</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                    We&apos;re currently generating accounts and dispatching welcome packets to all {csvData.length} members.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
