#!/usr/bin/env node
/*
  Script: list-temp-passwords.mjs
  Lists all users with their temporary passwords for admin distribution
  
  Usage:
    node scripts/list-temp-passwords.mjs
*/

import { config as dotenvConfig } from "dotenv";
import { MongoClient } from "mongodb";

// Load .env if present
try {
	dotenvConfig();
} catch {
	// ignore if dotenv not installed or missing
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

	// Find users with temporary passwords
	const usersWithTempPasswords = await users
		.find({
			isPasswordSet: false,
			temp_password_hash: { $exists: true },
		})
		.project({
			email: 1,
			role: 1,
			matric_number: 1,
			lecturer_number: 1,
			first_name: 1,
			last_name: 1,
			created_at: 1,
		})
		.sort({ created_at: -1 })
		.toArray();

	if (usersWithTempPasswords.length === 0) {
		console.log("✅ No users with temporary passwords found.");
		process.exit(0);
	}

	console.log("\n📋 Users with Temporary Passwords:");
	console.log("=".repeat(80));

	for (const user of usersWithTempPasswords) {
		console.log(`\n👤 ${user.first_name} ${user.last_name}`);
		console.log(`   Email: ${user.email}`);
		console.log(`   Role: ${user.role}`);
		if (user.matric_number) console.log(`   Matric: ${user.matric_number}`);
		if (user.lecturer_number)
			console.log(`   Lecturer ID: ${user.lecturer_number}`);
		console.log(`   Created: ${user.created_at.toLocaleString()}`);
		console.log(`   Status: Needs password setup`);
	}

	console.log("\n" + "=".repeat(80));
	console.log(`📊 Total users needing setup: ${usersWithTempPasswords.length}`);
	console.log(
		"\n💡 To generate temporary passwords for new users, use the admin dashboard."
	);
	console.log(
		"   Users will receive their temp passwords when created by administrators."
	);
} catch (err) {
	console.error("Failed to list temporary passwords:", err);
	process.exit(1);
} finally {
	await client.close();
}
