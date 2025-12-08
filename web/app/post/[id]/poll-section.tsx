"use client";

import PollCard from "@/components/poll-card";

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

interface PollSectionProps {
    postId: string;
    poll: Poll;
    isAuthenticated: boolean;
}

export default function PollSection({ postId, poll, isAuthenticated }: PollSectionProps) {
    return (
        <PollCard
            postId={postId}
            poll={poll}
            isAuthenticated={isAuthenticated}
        />
    );
}
