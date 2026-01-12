"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { AlertCircle } from "lucide-react";

interface FileUploadProps {
	onFilesSelected: (files: File[]) => void;
	maxFiles?: number;
	maxSize?: number; // in MB
	accept?: string;
}

export function FileUpload({
	onFilesSelected,
	maxFiles = 5,
	maxSize = 50,
	accept = "*",
}: FileUploadProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState("");
	const [isDragActive, setIsDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const validateFiles = (newFiles: File[]) => {
		setError("");

		if (files.length + newFiles.length > maxFiles) {
			setError(`Maximum ${maxFiles} files allowed`);
			return false;
		}

		for (const file of newFiles) {
			if (file.size > maxSize * 1024 * 1024) {
				setError(`File ${file.name} exceeds ${maxSize}MB limit`);
				return false;
			}
		}

		return true;
	};

	const handleFiles = (newFiles: FileList | null) => {
		if (!newFiles) return;

		const filesArray = Array.from(newFiles);
		if (validateFiles(filesArray)) {
			const updatedFiles = [...files, ...filesArray];
			setFiles(updatedFiles);
			onFilesSelected(updatedFiles);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(e.type === "dragenter" || e.type === "dragover");
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragActive(false);
		handleFiles(e.dataTransfer.files);
	};

	const removeFile = (index: number) => {
		const updatedFiles = files.filter((_, i) => i !== index);
		setFiles(updatedFiles);
		onFilesSelected(updatedFiles);
	};

	return (
		<div className="space-y-4">
			<div
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragActive
						? "border-primary bg-primary/5 scale-[1.02]"
						: "border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-white"
					}`}
			>
				<input
					ref={inputRef}
					type="file"
					multiple
					accept={accept}
					onChange={(e) => handleFiles(e.target.files)}
					className="hidden"
					id="file-upload"
				/>
				<label htmlFor="file-upload" className="cursor-pointer block">
					<div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
						<Upload className="h-6 w-6 text-primary" />
					</div>
					<p className="font-bold text-slate-900">
						Click to upload or drag and drop
					</p>
					<p className="text-xs font-medium text-slate-400 mt-1">
						Up to {maxFiles} files, {maxSize}MB each
					</p>
				</label>
			</div>

			{error && (
				<div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
					<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
					<p>{error}</p>
				</div>
			)}

			{files.length > 0 && (
				<div className="space-y-2">
					<div className="text-sm font-medium">
						Selected Files ({files.length})
					</div>
					<div className="space-y-2">
						{files.map((file, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
							>
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / 1024 / 1024).toFixed(2)}MB
										</p>
									</div>
								</div>
								<button
									onClick={() => removeFile(index)}
									className="p-1.5 hover:bg-destructive/10 rounded transition-colors flex-shrink-0"
								>
									<X className="h-4 w-4 text-destructive" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
