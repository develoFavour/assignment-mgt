"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
    variant?: "default" | "destructive";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading,
    variant = "destructive",
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
                isOpen ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl transition-all duration-300 transform",
                    isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-8">
                    <div
                        className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center mb-6",
                            variant === "destructive" ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"
                        )}
                    >
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <h3 className="text-xl font-black text-foreground tracking-tight mb-2">
                        {title}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        {description}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="rounded-2xl h-12 flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={variant}
                            onClick={onConfirm}
                            className={cn(
                                "rounded-2xl h-12 flex-1 font-bold",
                                variant === "destructive" ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200" : ""
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Confirm Action"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
