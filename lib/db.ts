import { MongoClient, type Db, type Collection } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
	client: MongoClient;
	db: Db;
}> {
	if (cachedClient && cachedDb) {
		return { client: cachedClient, db: cachedDb };
	}

	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error("MONGODB_URI environment variable is not set");
	}

	const client = new MongoClient(uri);
	await client.connect();

	const db = client.db(process.env.MONGODB_DB_NAME || "hallmark-assignment");
	cachedClient = client;
	cachedDb = db;

	return { client, db };
}

// Collection getters
export async function getUsersCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("users");
}

export async function getCoursesCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("courses");
}

export async function getStudentEnrollmentsCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("student_enrollments");
}

export async function getAssignmentsCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("assignments");
}

export async function getSubmissionsCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("submissions");
}

export async function getGradesCollection(): Promise<Collection> {
	const { db } = await connectToDatabase();
	return db.collection("grades");
}
