export interface User {
	_id?: string;
	role: "student" | "lecturer" | "admin";
	email: string;
	matric_number?: string;
	lecturer_number?: string;
	first_name: string;
	last_name: string;
	password_hash?: string;
	isPasswordSet: boolean;
	level?: number; // For students: 100, 200, 300, 400
	created_at?: Date;
	updated_at?: Date;
}

export interface Course {
	_id?: string;
	course_code: string;
	course_name: string;
	course_description?: string;
	level: number; // 100, 200, 300, 400
	lecturer_id: string;
	semester: string; // "1" or "2"
	created_at?: Date;
}

export interface StudentEnrollment {
	_id?: string;
	student_id: string;
	course_id: string;
	level: number;
	enrolled_at?: Date;
	is_active?: boolean;
}

export interface Assignment {
	_id?: string;
	course_id: string;
	title: string;
	description: string;
	deadline: Date;
	file_url?: string;
	created_by: string; // lecturer_id
	late_submission: {
		accept_late: boolean;
		cutoff_days: number;
		penalty_percent: number;
	};
	created_at?: Date;
}

export interface Submission {
	_id?: string;
	assignment_id: string;
	student_id: string;
	file_urls: string[];
	submitted_at: Date;
	is_late: boolean;
	hours_late: number;
	status: "submitted" | "graded";
}

export interface Grade {
	_id?: string;
	submission_id: string;
	assignment_id: string;
	student_id: string;
	score: number;
	feedback?: string;
	graded_by: string;
	penalty_applied: number;
	final_score: number;
	graded_at: Date;
}

export interface Session {
	userId: string;
	role: "student" | "lecturer" | "admin";
	email: string;
}
