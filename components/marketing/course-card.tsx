import { ArrowUpRight, BookOpen, Clock3, GraduationCap } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CourseCardProps = {
	code: string;
	title: string;
	school: string;
	level: string;
	units: string;
	description: string;
};

export function CourseCard({
	code,
	title,
	school,
	level,
	units,
	description,
}: CourseCardProps) {
	return (
		<Card className="h-full rounded-[28px] border-slate-200 bg-white py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60">
			<CardHeader className="space-y-5 px-6 pb-5 pt-6">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-3">
						<Badge className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary hover:bg-primary/10">
							{school}
						</Badge>
						<div className="space-y-2">
							<CardTitle className="text-2xl font-black tracking-tight text-slate-900">
								{code}
							</CardTitle>
							<CardDescription className="text-sm font-medium leading-relaxed text-slate-500">
								{title}
							</CardDescription>
						</div>
					</div>
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
						<BookOpen className="h-5 w-5" />
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-5 px-6 pb-6">
				<p className="text-sm font-medium leading-7 text-slate-500">
					{description}
				</p>
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
						<div className="flex items-center gap-2 text-slate-400">
							<GraduationCap className="h-4 w-4" />
							<span className="text-[10px] font-black uppercase tracking-[0.18em]">
								Level
							</span>
						</div>
						<p className="mt-3 text-sm font-black text-slate-900">{level}</p>
					</div>
					<div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
						<div className="flex items-center gap-2 text-slate-400">
							<Clock3 className="h-4 w-4" />
							<span className="text-[10px] font-black uppercase tracking-[0.18em]">
								Credit Units
							</span>
						</div>
						<p className="mt-3 text-sm font-black text-slate-900">{units}</p>
					</div>
				</div>
			</CardContent>

			<CardFooter className="mt-auto px-6 pb-6"></CardFooter>
		</Card>
	);
}
