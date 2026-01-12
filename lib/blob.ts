import { put, del } from "@vercel/blob";

export async function uploadFile(file: File, path: string): Promise<string> {
	const blob = await put(`${path}/${file.name}`, file, {
		access: "private",
	});
	return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
	await del(url);
}

export async function uploadMultipleFiles(
	files: File[],
	basePath: string
): Promise<string[]> {
	const uploadPromises = files.map((file) => uploadFile(file, basePath));
	return Promise.all(uploadPromises);
}
