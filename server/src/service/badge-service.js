import pool from '../config/database.js';

// Rozet kazanım eşikleri
const BADGE_THRESHOLDS = {
    comment: {
        bronze: 5,
        silver: 25,
        gold: 100,
        platinum: 500,
        diamond: 1000
    },
    post: {
        bronze: 2,
        silver: 10,
        gold: 50,
        platinum: 200,
        diamond: 500
    }
};

// Rozet seviyeleri sırası
const BADGE_LEVELS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// Rozet gösterim bilgileri
const BADGE_INFO = {
    bronze: { name: 'Bronz', emoji: '🥉', color: '#CD7F32' },
    silver: { name: 'Gümüş', emoji: '🥈', color: '#C0C0C0' },
    gold: { name: 'Altın', emoji: '🥇', color: '#FFD700' },
    platinum: { name: 'Platin', emoji: '💎', color: '#E5E4E2' },
    diamond: { name: 'Elmas', emoji: '💠', color: '#B9F2FF' }
};

export default class BadgeService {
    /**
     * Kullanıcının yorum ve gönderi sayısını getir
     */
    async getUserStats(userId) {
        const [commentsResult, postsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [userId]),
            pool.query('SELECT COUNT(*) FROM posts WHERE user_id = $1', [userId])
        ]);

        return {
            commentCount: parseInt(commentsResult.rows[0].count),
            postCount: parseInt(postsResult.rows[0].count)
        };
    }

    /**
     * Kullanıcının mevcut rozetlerini getir
     */
    async getUserBadges(userId) {
        const result = await pool.query(
            `SELECT badge_type, badge_level, earned_at 
             FROM user_badges 
             WHERE user_id = $1 
             ORDER BY badge_type, earned_at DESC`,
            [userId]
        );

        // İstatistikleri de ekle
        const stats = await this.getUserStats(userId);

        // Rozetleri tipine göre grupla
        const badges = {
            comment: [],
            post: []
        };

        result.rows.forEach((row) => {
            const badgeInfo = BADGE_INFO[row.badge_level];
            badges[row.badge_type].push({
                level: row.badge_level,
                name: badgeInfo.name,
                emoji: badgeInfo.emoji,
                color: badgeInfo.color,
                earned_at: row.earned_at
            });
        });

        // En yüksek rozeti bul
        const getHighestBadge = (badgeList) => {
            if (badgeList.length === 0) return null;
            const levels = badgeList.map((b) => b.level);
            for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
                if (levels.includes(BADGE_LEVELS[i])) {
                    return badgeList.find((b) => b.level === BADGE_LEVELS[i]);
                }
            }
            return null;
        };

        return {
            stats,
            badges,
            highest: {
                comment: getHighestBadge(badges.comment),
                post: getHighestBadge(badges.post)
            },
            thresholds: BADGE_THRESHOLDS
        };
    }

    /**
     * Rozet kontrolü yap ve hak edilen rozetleri ver
     * @returns {Array} Yeni kazanılan rozetler
     */
    async checkAndAwardBadges(userId) {
        const stats = await this.getUserStats(userId);
        const newBadges = [];

        // Mevcut rozetleri al
        const existingBadges = await pool.query(
            'SELECT badge_type, badge_level FROM user_badges WHERE user_id = $1',
            [userId]
        );

        const existingSet = new Set(existingBadges.rows.map((b) => `${b.badge_type}:${b.badge_level}`));

        // Yorum rozetlerini kontrol et
        for (const level of BADGE_LEVELS) {
            const threshold = BADGE_THRESHOLDS.comment[level];
            const key = `comment:${level}`;

            if (stats.commentCount >= threshold && !existingSet.has(key)) {
                await pool.query(
                    `INSERT INTO user_badges (user_id, badge_type, badge_level) 
                     VALUES ($1, 'comment', $2)
                     ON CONFLICT (user_id, badge_type, badge_level) DO NOTHING`,
                    [userId, level]
                );

                newBadges.push({
                    type: 'comment',
                    level,
                    ...BADGE_INFO[level]
                });
            }
        }

        // Gönderi rozetlerini kontrol et
        for (const level of BADGE_LEVELS) {
            const threshold = BADGE_THRESHOLDS.post[level];
            const key = `post:${level}`;

            if (stats.postCount >= threshold && !existingSet.has(key)) {
                await pool.query(
                    `INSERT INTO user_badges (user_id, badge_type, badge_level) 
                     VALUES ($1, 'post', $2)
                     ON CONFLICT (user_id, badge_type, badge_level) DO NOTHING`,
                    [userId, level]
                );

                newBadges.push({
                    type: 'post',
                    level,
                    ...BADGE_INFO[level]
                });
            }
        }

        return newBadges;
    }

    /**
     * Bir sonraki rozet için gereken bilgiyi getir
     */
    async getNextBadgeProgress(userId) {
        const stats = await this.getUserStats(userId);
        const badges = await this.getUserBadges(userId);

        const getNextBadge = (type, count, currentBadges) => {
            const currentLevels = currentBadges.map((b) => b.level);
            for (const level of BADGE_LEVELS) {
                if (!currentLevels.includes(level)) {
                    const threshold = BADGE_THRESHOLDS[type][level];
                    return {
                        level,
                        ...BADGE_INFO[level],
                        threshold,
                        current: count,
                        remaining: threshold - count,
                        progress: Math.min(100, Math.round((count / threshold) * 100))
                    };
                }
            }
            return null; // Tüm rozetler kazanıldı
        };

        return {
            comment: getNextBadge('comment', stats.commentCount, badges.badges.comment),
            post: getNextBadge('post', stats.postCount, badges.badges.post)
        };
    }
}
