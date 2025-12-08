import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

export default class PollService {
    /**
     * Anket oluştur
     * @param {string} postId - Post ID
     * @param {string} question - Anket sorusu
     * @param {Array<string>} options - Seçenekler listesi (min 2, max 5)
     */
    async createPoll(postId, question, options) {
        // Validasyonlar
        if (!question || question.trim().length < 5) {
            throw new HttpException(400, 'Anket sorusu en az 5 karakter olmalıdır');
        }

        if (!options || options.length < 2) {
            throw new HttpException(400, 'En az 2 seçenek gereklidir');
        }

        if (options.length > 5) {
            throw new HttpException(400, 'En fazla 5 seçenek eklenebilir');
        }

        // Boş seçenek kontrolü
        const validOptions = options.filter((opt) => opt && opt.trim().length > 0);
        if (validOptions.length < 2) {
            throw new HttpException(400, 'En az 2 geçerli seçenek gereklidir');
        }

        // Transaction başlat
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Anket oluştur
            const pollResult = await client.query(
                `INSERT INTO polls (post_id, question) VALUES ($1, $2) RETURNING id, question, created_at`,
                [postId, question.trim()]
            );

            const poll = pollResult.rows[0];

            // Seçenekleri ekle
            for (let i = 0; i < validOptions.length; i++) {
                await client.query(
                    `INSERT INTO poll_options (poll_id, option_text, option_order) VALUES ($1, $2, $3)`,
                    [poll.id, validOptions[i].trim(), i + 1]
                );
            }

            await client.query('COMMIT');

            // Seçenekleri getir
            const optionsResult = await pool.query(
                `SELECT id, option_text, option_order FROM poll_options WHERE poll_id = $1 ORDER BY option_order`,
                [poll.id]
            );

            return {
                id: poll.id,
                question: poll.question,
                created_at: poll.created_at,
                options: optionsResult.rows
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Anket bilgisini post ID'ye göre getir
     * @param {string} postId - Post ID
     * @param {string|null} userId - Kullanıcı ID (oy vermiş mi kontrol için)
     */
    async getPollByPostId(postId, userId = null) {
        // Anket bilgisi
        const pollResult = await pool.query(`SELECT id, question, created_at FROM polls WHERE post_id = $1`, [postId]);

        if (pollResult.rows.length === 0) {
            return null;
        }

        const poll = pollResult.rows[0];

        // Seçenekler ve oy sayıları
        // Her kullanıcının sadece bir oyunu saymak için DISTINCT kullanıyoruz
        const optionsResult = await pool.query(
            `SELECT 
                po.id,
                po.option_text,
                po.option_order,
                COALESCE(
                    (SELECT COUNT(DISTINCT user_id)::INTEGER 
                     FROM poll_votes 
                     WHERE option_id = po.id AND poll_id = $1), 
                    0
                ) as vote_count
            FROM poll_options po
            WHERE po.poll_id = $1
            ORDER BY po.option_order`,
            [poll.id]
        );

        // Toplam oy sayısı - her kullanıcının sadece bir oyunu say
        const totalVotesResult = await pool.query(
            `SELECT COUNT(DISTINCT user_id)::INTEGER as total FROM poll_votes WHERE poll_id = $1`,
            [poll.id]
        );
        const totalVotes = totalVotesResult.rows[0]?.total || 0;

        // Kullanıcı oy vermiş mi?
        let userVote = null;
        if (userId) {
            const voteResult = await pool.query(`SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`, [
                poll.id,
                userId
            ]);

            if (voteResult.rows.length > 0) {
                userVote = voteResult.rows[0].option_id;
            }
        }

        // Yüzdeleri hesapla - yuvarlama hatasını önlemek için son seçeneğe kalan farkı ver
        let optionsWithPercentage = [];
        let accumulatedPercentage = 0;
        
        for (let i = 0; i < optionsResult.rows.length; i++) {
            const opt = optionsResult.rows[i];
            let percentage = 0;
            
            if (totalVotes > 0) {
                if (i === optionsResult.rows.length - 1) {
                    // Son seçenek: kalan farkı al (toplam %100 olması için)
                    percentage = 100 - accumulatedPercentage;
                } else {
                    // Diğer seçenekler: normal hesapla ve yuvarla
                    percentage = Math.round((opt.vote_count / totalVotes) * 100);
                    accumulatedPercentage += percentage;
                }
            }
            
            optionsWithPercentage.push({
                ...opt,
                percentage: Math.max(0, Math.min(100, percentage)) // 0-100 arasında sınırla
            });
        }

        return {
            id: poll.id,
            question: poll.question,
            created_at: poll.created_at,
            options: optionsWithPercentage,
            total_votes: totalVotes,
            user_vote: userVote,
            has_voted: userVote !== null
        };
    }

    /**
     * Oy ver
     * @param {string} pollId - Poll ID
     * @param {number} optionId - Seçenek ID
     * @param {string} userId - Kullanıcı ID
     */
    async vote(pollId, optionId, userId) {
        // Anket var mı kontrol
        const pollResult = await pool.query(`SELECT id, post_id FROM polls WHERE id = $1`, [pollId]);

        if (pollResult.rows.length === 0) {
            throw new HttpException(404, 'Anket bulunamadı');
        }

        // Seçenek bu ankete ait mi kontrol
        const optionResult = await pool.query(`SELECT id FROM poll_options WHERE id = $1 AND poll_id = $2`, [
            optionId,
            pollId
        ]);

        if (optionResult.rows.length === 0) {
            throw new HttpException(400, 'Geçersiz seçenek');
        }

        // Daha önce oy vermiş mi kontrol
        const existingVote = await pool.query(`SELECT id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`, [
            pollId,
            userId
        ]);

        if (existingVote.rows.length > 0) {
            throw new HttpException(400, 'Bu ankete zaten oy verdiniz');
        }

        // Oyu kaydet
        await pool.query(`INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3)`, [
            pollId,
            optionId,
            userId
        ]);

        // Güncel sonuçları döndür
        return await this.getPollByPostId(pollResult.rows[0].post_id, userId);
    }

    /**
     * Kullanıcı bu ankete oy vermiş mi?
     */
    async hasUserVoted(pollId, userId) {
        const result = await pool.query(`SELECT id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`, [
            pollId,
            userId
        ]);

        return result.rows.length > 0;
    }
}
