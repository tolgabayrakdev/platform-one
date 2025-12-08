"use client";

interface Badge {
    level: string;
    name: string;
    emoji: string;
    color: string;
    earned_at?: string;
}

interface BadgeDisplayProps {
    type: 'comment' | 'post';
    badges: Badge[];
    highest?: Badge | null;
    compact?: boolean;
}

interface BadgeProgress {
    level: string;
    name: string;
    emoji: string;
    threshold: number;
    current: number;
    remaining: number;
    progress: number;
}

interface BadgeProgressBarProps {
    type: 'comment' | 'post';
    progress: BadgeProgress | null;
}

// Tek rozet gösterimi
export function BadgeIcon({ badge, size = "md" }: { badge: Badge; size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-5 h-5 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-12 h-12 text-lg"
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
            style={{ backgroundColor: badge.color + "33" }}
            title={`${badge.name} Rozeti`}
        >
            <span>{badge.emoji}</span>
        </div>
    );
}

// Kullanıcının en yüksek rozetlerini göster
export function UserBadges({
    commentBadge,
    postBadge
}: {
    commentBadge: Badge | null;
    postBadge: Badge | null
}) {
    if (!commentBadge && !postBadge) {
        return null;
    }

    return (
        <div className="flex items-center gap-1">
            {postBadge && (
                <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: postBadge.color + "22" }}
                    title={`${postBadge.name} Gönderi Rozeti`}
                >
                    <span>{postBadge.emoji}</span>
                    <span className="text-[10px]" style={{ color: postBadge.color }}>📝</span>
                </div>
            )}
            {commentBadge && (
                <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: commentBadge.color + "22" }}
                    title={`${commentBadge.name} Yorum Rozeti`}
                >
                    <span>{commentBadge.emoji}</span>
                    <span className="text-[10px]" style={{ color: commentBadge.color }}>💬</span>
                </div>
            )}
        </div>
    );
}

// Rozet listesi gösterimi
export function BadgeDisplay({ type, badges, highest, compact = false }: BadgeDisplayProps) {
    if (badges.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                Henüz {type === 'comment' ? 'yorum' : 'gönderi'} rozeti yok
            </p>
        );
    }

    if (compact && highest) {
        return <BadgeIcon badge={highest} />;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <div
                    key={badge.level}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                    style={{ backgroundColor: badge.color + "22", color: badge.color }}
                >
                    <span>{badge.emoji}</span>
                    <span className="font-medium">{badge.name}</span>
                </div>
            ))}
        </div>
    );
}

// Sonraki rozet için ilerleme çubuğu
export function BadgeProgressBar({ type, progress }: BadgeProgressBarProps) {
    if (!progress) {
        return (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>✨</span>
                <span>{type === 'comment' ? 'Tüm yorum' : 'Tüm gönderi'} rozetleri kazanıldı!</span>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    Sonraki: {progress.emoji} {progress.name}
                </span>
                <span className="text-muted-foreground">
                    {progress.current}/{progress.threshold}
                </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                        width: `${progress.progress}%`,
                        backgroundColor: "#FFD700"
                    }}
                />
            </div>
            <p className="text-[10px] text-muted-foreground">
                {progress.remaining} {type === 'comment' ? 'yorum' : 'gönderi'} daha
            </p>
        </div>
    );
}

// Yeni rozet kazanım bildirimi
export function BadgeEarnedToast({ badge }: { badge: { type: string; level: string; name: string; emoji: string } }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
                <p className="font-medium">Yeni Rozet Kazandın!</p>
                <p className="text-sm text-muted-foreground">
                    {badge.name} {badge.type === 'comment' ? 'Yorum' : 'Gönderi'} Rozeti
                </p>
            </div>
        </div>
    );
}
