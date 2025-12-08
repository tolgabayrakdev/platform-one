"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PollOption {
    id: number;
    option_text: string;
    option_order: number;
    vote_count: number;
    percentage: number;
}

interface Poll {
    id: string;
    question: string;
    created_at: string;
    options: PollOption[];
    total_votes: number;
    user_vote: number | null;
    has_voted: boolean;
}

interface PollCardProps {
    postId: string;
    poll: Poll;
    isAuthenticated: boolean;
    onVote?: (poll: Poll) => void;
}

export default function PollCard({ postId, poll, isAuthenticated, onVote }: PollCardProps) {
    const [voting, setVoting] = useState(false);
    const [currentPoll, setCurrentPoll] = useState<Poll>(poll);

    // Poll prop'u değiştiğinde state'i güncelle
    useEffect(() => {
        setCurrentPoll(poll);
    }, [poll]);

    async function handleVote(optionId: number) {
        if (!isAuthenticated) {
            toast.error("Oy vermek için giriş yapmalısınız");
            return;
        }

        if (currentPoll.has_voted) {
            toast.error("Bu ankete zaten oy verdiniz");
            return;
        }

        setVoting(true);

        try {
            const res = await fetch(`/api/polls/${postId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ optionId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Oy verilemedi");
            }

            const data = await res.json();
            setCurrentPoll(data.poll);
            onVote?.(data.poll);
            toast.success("Oyunuz kaydedildi!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(message);
        } finally {
            setVoting(false);
        }
    }

    return (
        <div className="mt-2 space-y-1.5">
            {/* Seçenekler */}
            {currentPoll.options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => !currentPoll.has_voted && isAuthenticated && handleVote(option.id)}
                    disabled={voting || currentPoll.has_voted || !isAuthenticated}
                    className="w-full relative overflow-hidden rounded-md bg-muted/30 disabled:cursor-default hover:bg-muted/50 transition-colors"
                >
                    {/* Progress bar - sadece arka plan */}
                    <div
                        className="absolute inset-y-0 left-0 rounded-md transition-all duration-500 ease-out z-0"
                        style={{
                            width: `${option.percentage}%`,
                            backgroundColor: currentPoll.user_vote === option.id
                                ? 'hsl(142 76% 36%)' // Yeşil
                                : 'hsl(215 20% 65%)' // Gri
                        }}
                    />

                    {/* İçerik - progress bar'ın üstünde */}
                    <div className="relative z-10 flex items-center justify-between px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            {currentPoll.user_vote === option.id && (
                                <span 
                                    className="text-xs font-bold"
                                    style={{
                                        color: option.percentage > 20 ? 'white' : 'inherit',
                                        textShadow: option.percentage > 20 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                                    }}
                                >
                                    ✓
                                </span>
                            )}
                            <span 
                                className="text-xs font-medium"
                                style={{
                                    color: option.percentage > 20 ? 'white' : 'inherit',
                                    textShadow: option.percentage > 20 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                                }}
                            >
                                {option.option_text}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                            <span style={{
                                color: option.percentage > 50 ? 'white' : 'inherit',
                                textShadow: option.percentage > 50 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                            }}>
                                {option.vote_count} oy
                            </span>
                            <span 
                                className="font-bold min-w-[28px] text-right"
                                style={{
                                    color: option.percentage > 50 ? 'white' : 'inherit',
                                    textShadow: option.percentage > 50 ? '0 1px 2px rgba(0,0,0,0.4)' : 'none'
                                }}
                            >
                                {option.percentage}%
                            </span>
                        </div>
                    </div>
                </button>
            ))}

            {/* Alt bilgi */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                <span>{currentPoll.total_votes} oy</span>
                {!isAuthenticated && <span>Oy vermek için giriş yapın</span>}
                {isAuthenticated && !currentPoll.has_voted && <span>Oy vermek için seçin</span>}
                {currentPoll.has_voted && <span className="text-green-600">✓ Oy verildi</span>}
            </div>
        </div>
    );
}
