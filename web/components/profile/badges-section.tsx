import { BadgeData } from "@/lib/types/profile";
import { BadgeDisplay, BadgeProgressBar } from "@/components/badges";

interface BadgesSectionProps {
  badgeData: BadgeData | null;
}

export default function BadgesSection({ badgeData }: BadgesSectionProps) {
  if (!badgeData) return null;

  return (
    <div className="mb-8">
      <p className="text-xs text-muted-foreground mb-3">Rozetlerim</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Yorum Rozetleri */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💬</span>
            <div>
              <p className="text-xs font-medium">Yorum</p>
              <p className="text-[10px] text-muted-foreground">{badgeData.stats.commentCount} yorum</p>
            </div>
          </div>
          <BadgeDisplay type="comment" badges={badgeData.badges.comment} />
          <div className="mt-3 pt-3 border-t border-border">
            <BadgeProgressBar type="comment" progress={badgeData.next?.comment || null} />
          </div>
        </div>

        {/* Gönderi Rozetleri */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-xs font-medium">Gönderi</p>
              <p className="text-[10px] text-muted-foreground">{badgeData.stats.postCount} gönderi</p>
            </div>
          </div>
          <BadgeDisplay type="post" badges={badgeData.badges.post} />
          <div className="mt-3 pt-3 border-t border-border">
            <BadgeProgressBar type="post" progress={badgeData.next?.post || null} />
          </div>
        </div>
      </div>
    </div>
  );
}
