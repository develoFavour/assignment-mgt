import { getLogsCollection } from "./db";

type LogLevel = "info" | "success" | "warning" | "error";

interface LogPayload {
    action: string;
    user: string;
    details?: string;
    level?: LogLevel;
}

export async function logEvent({ action, user, details, level = "info" }: LogPayload) {
    try {
        const logsCollection = await getLogsCollection();
        await logsCollection.insertOne({
            action,
            user,
            details,
            level,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error("Failed to log event:", error);
    }
}
