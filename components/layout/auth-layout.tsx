import type { ReactNode } from "react";
import Image from "next/image";

export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen w-full flex bg-background">
			{/* Left Side: Illustration & Branding (Hidden on mobile) */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/20">
				<div className="absolute inset-0 z-0">
					<Image
						src="/auth-hero.png"
						alt="University Portal Background"
						fill
						className="object-cover opacity-90 transition-transform duration-1000 my-auto"
						style={{ objectPosition: 'center' }}
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
				</div>

				<div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
					<div className="flex items-center gap-3 mb-8">
						<div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
							<div className="h-6 w-6 rounded-lg bg-white" />
						</div>
						<div className="flex flex-col">
							<span className="text-xl font-black tracking-tighter uppercase leading-none">Hallmark</span>
							<span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">University</span>
						</div>
					</div>
					<h2 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
						Ready to start your <br /> success story?
					</h2>
					<p className="text-xl text-white/80 font-medium max-w-sm leading-relaxed">
						Sign in to your portal and start managing your academic excellence today.
					</p>
				</div>
			</div>

			{/* Right Side: Auth Form */}
			<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-20 relative bg-white dark:bg-background">
				<div className="w-full max-w-[440px] z-10 py-12">
					{children}
				</div>

				<div className="absolute bottom-10 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-bold">
					Official University System &bull; Secured with TLS 1.3
				</div>
			</div>
		</div>
	);
}

