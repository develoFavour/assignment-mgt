#!/usr/bin/env node
/*
  Script: create-admin.mjs (ESM version)
  Inserts an initial admin user into Mongo so you can sign in to the admin dashboard.

  Usage:
    node scripts/create-admin.mjs \
      --email admin@example.com \
      --password MyPass123 \
      --first John \
      --last Doe

  Required envs:
    MONGODB_URI      Mongo connection string
    MONGODB_DB_NAME  (optional) overrides default DB name
*/

import { config as dotenvConfig } from "dotenv";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

// Load .env if present
try {
	dotenvConfig();
} catch {
	// ignore if dotenv not installed or missing
}

// ---------------- CLI parsing ----------------
const args = process.argv.slice(2);
function argv(flag, short) {
	const idx = args.indexOf(flag);
	if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
	if (short) {
		const sIdx = args.indexOf(short);
		if (sIdx !== -1 && sIdx + 1 < args.length) return args[sIdx + 1];
	}
	return undefined;
}

const email = argv("--email", "-e");
const password = argv("--password", "-p");
const firstName = argv("--first", "-f") || "Admin";
const lastName = argv("--last", "-l") || "User";

if (!email || !password) {
	console.error(
		"\nUsage: node scripts/create-admin.mjs --email <EMAIL> --password <PASSWORD> [--first <FIRST_NAME>] [--last <LAST_NAME>]\n"
	);
	process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error("MONGODB_URI is not set in environment");
	process.exit(1);
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const dbName = process.env.MONGODB_DB_NAME || "hallmark-assignment";
	const db = client.db(dbName);
	const users = db.collection("users");

	const existing = await users.findOne({
		role: "admin",
		email: email.toLowerCase(),
	});
	if (existing) {
		console.log(
			`Admin with email ${email} already exists (id: ${existing._id}).`
		);
		process.exit(0);
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const now = new Date();

	const adminDoc = {
		role: "admin",
		email: email.toLowerCase(),
		first_name: firstName,
		last_name: lastName,
		isPasswordSet: true,
		password_hash: passwordHash,
		created_at: now,
	};

	const result = await users.insertOne(adminDoc);
	console.log(`\u2714\uFE0F  Admin user created with id: ${result.insertedId}`);
} catch (err) {
	console.error("Failed to create admin:", err);
	process.exit(1);
} finally {
	await client.close();
}
