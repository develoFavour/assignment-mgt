import { NextResponse } from "next/server";
import { getLogsCollection } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
    const session = await getSession();

    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logsCollection = await getLogsCollection();
        const logs = await logsCollection
            .find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
