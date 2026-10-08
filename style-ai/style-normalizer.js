/*
 * style-normalizer.js
 * Sunoのスタイル（プロンプト）を、統一された英語タグ形式に整理するためのモジュール。
 * ブラウザでは window.StyleNormalizer、Node.js では module.exports として使えます。
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.StyleNormalizer = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Suno独自の構成指示（音楽の特徴ではないので、タグとは分けて保存する）
    const META_PATTERNS = [
        { re: /no\s*intro/i, tag: 'no intro' },
        { re: /immediate\s*vocals?/i, tag: 'immediate vocals' },
        { re: /fast\s*start/i, tag: 'fast start' }
    ];

    // 音楽的な情報を持たないスタイル
    const NO_INFO = new Set([
        'お任せします', 'おまかせ', 'お任せ', 'new', 'unique', 'tiktok',
        'youtube向け', 'youtube', 'tiktok向け', 'random', 'any'
    ]);

    // 日本語 → 英語タグの辞書（長い語から優先して照合する）
    const JA_DICT = {
        'アップテンポ': 'uptempo',
        'スローテンポ': 'slow tempo',
        'ミドルテンポ': 'mid-tempo',
        'スロービート': 'slow beat',
        'ダンスビート': 'dance beat',
        '女性の声': 'female vocals',
        '女性ボーカル': 'female vocals',
        '女性ヴォーカル': 'female vocals',
        '男性の声': 'male vocals',
        '男性ボーカル': 'male vocals',
        '男性ヴォーカル': 'male vocals',
        '少女の声': 'young female vocals',
        '少年の声': 'young male vocals',
        '子供の声': "children's vocals",
        'デュエット': 'duet',
        '合唱': 'choir',
        'コーラス': 'chorus harmonies',
        'ハーモニー': 'vocal harmonies',
        'ささやき': 'whispered vocals',
        'ウィスパー': 'whispered vocals',
        'シンセサイザー': 'synthesizer',
        'シンセベース': 'synth bass',
        'シンセパッド': 'synth pad',
        'シンセ': 'synthesizer',
        'アナログシンセ': 'analog synth',
        'リードシンセ': 'lead synth',
        'ピアノ': 'piano',
        'エレピ': 'electric piano',
        'アコースティックギター': 'acoustic guitar',
        'アコギ': 'acoustic guitar',
        'エレキギター': 'electric guitar',
        'エレキ': 'electric guitar',
        'ギター': 'guitar',
        'ベース': 'bass',
        'ドラムマシン': 'drum machine',
        'ドラム': 'drums',
        'パーカッション': 'percussion',
        'ストリングス': 'strings',
        'バイオリン': 'violin',
        'ヴァイオリン': 'violin',
        'チェロ': 'cello',
        'サックス': 'saxophone',
        'トランペット': 'trumpet',
        'ブラス': 'brass',
        'ホーン': 'horns',
        'フルート': 'flute',
        'オルガン': 'organ',
        'ハープ': 'harp',
        'アコーディオン': 'accordion',
        'ウクレレ': 'ukulele',
        'ベル': 'bells',
        'オルゴール': 'music box',
        'アルペジオ': 'arpeggio',
        'パッド': 'pad',
        '和楽器': 'japanese traditional instruments',
        '三味線': 'shamisen',
        '尺八': 'shakuhachi',
        '太鼓': 'taiko drums',
        '琴': 'koto',
        'オーケストラ': 'orchestral',
        '演歌': 'enka',
        'ラップ': 'rap',
        'バラード': 'ballad',
        'ロック': 'rock',
        'ポップス': 'pop',
        'ポップ': 'pop',
        'ジャズ': 'jazz',
        'ボサノバ': 'bossa nova',
        'シティポップ': 'city pop',
        'アニソン': 'anime song',
        'ボカロ': 'vocaloid style',
        'フォーク': 'folk',
        'ヒップホップ': 'hip hop',
        'レゲエ': 'reggae',
        'メタル': 'metal',
        'パンク': 'punk',
        'ファンク': 'funk',
        'ソウル': 'soul',
        'ゴスペル': 'gospel',
        'ディスコ': 'disco',
        'ハウス': 'house',
        'テクノ': 'techno',
        'トランス': 'trance',
        'アンビエント': 'ambient',
        'エレクトロ': 'electro',
        'ローファイ': 'lo-fi',
        'チル': 'chill',
        'ダンス': 'dance',
        '癒される': 'healing',
        '癒し': 'healing',
        '切ない': 'bittersweet',
        '悲しい': 'sad',
        '明るい': 'bright',
        '元気': 'energetic',
        '爽やか': 'refreshing',
        '透き通った': 'crystal clear',
        '透明感': 'crystal clear',
        'クリア': 'clear',
        '幻想': 'dreamy',
        '浮遊感': 'floating',
        '壮大': 'epic',
        '優しい': 'gentle',
        'やさしい': 'gentle',
        '力強い': 'powerful',
        '感動': 'emotional',
        'エモい': 'emo',
        '懐かしい': 'nostalgic',
        'ノスタルジック': 'nostalgic',
        'レトロ': 'retro',
        '未来': 'futuristic',
        'ダーク': 'dark',
        'かわいい': 'cute',
        '可愛い': 'cute',
        'ノリノリ': 'groovy',
        'ノリ': 'groovy',
        '疾走感': 'driving',
        '激しい': 'intense',
        '静か': 'quiet',
        '穏やか': 'calm',
        '温かい': 'warm',
        '暖かい': 'warm',
        'フェードアウト': 'fade out ending',
        '残響': 'reverb',
        'エフェクト': 'effects',
        'サビ': 'catchy chorus',
        'アコースティック': 'acoustic',
        '神秘的': 'mysterious',
        'ミステリアス': 'mysterious',
        'スロー': 'slow',
        'エモーショナル': 'emotional',
        'クリスマス': 'christmas',
        'メロディック': 'melodic',
        '内省的': 'introspective',
        '前向き': 'positive',
        '女性': 'female vocals',
        '男性': 'male vocals',
        '弦楽器': 'strings',
        '希望': 'hopeful',
        '緊張感': 'tension',
        '高揚感': 'uplifting',
        '失恋': 'heartbreak',
        '恋愛': 'romantic',
        'ロマンチック': 'romantic',
        'メランコリック': 'melancholic',
        'ドラマチック': 'dramatic',
        'ファンタジー': 'fantasy',
        'エレクトロニカ': 'electronica',
        'エレクトロニック': 'electronic',
        'ハードロック': 'hard rock',
        'ソフトロック': 'soft rock',
        '和風': 'japanese style',
        '都会': 'urban',
        '夏': 'summer',
        '冬': 'winter',
        '夜': 'night'
    };

    // 英語の表記揺れ・誤字の修正
    const TYPO = {
        'cill': 'chill',
        'chil': 'chill',
        'dram': 'drums',
        'drum': 'drums',
        'calme': 'calm',
        'lofi': 'lo-fi',
        'lo fi': 'lo-fi',
        'dancebeat': 'dance beat',
        'female vocal': 'female vocals',
        'male vocal': 'male vocals',
        'female voice': 'female vocals',
        'male voice': 'male vocals',
        'jpop': 'j-pop',
        'j pop': 'j-pop',
        'kpop': 'k-pop',
        'k pop': 'k-pop',
        'rnb': 'r&b',
        'r and b': 'r&b',
        'hiphop': 'hip hop',
        'hip-hop': 'hip hop',
        'edm.': 'edm',
        'synthesiser': 'synthesizer',
        'up tempo': 'uptempo',
        'up-tempo': 'uptempo',
        'trip hop': 'trip-hop',
        'triphop': 'trip-hop',
        'female': 'female vocals',
        'male': 'male vocals',
        'vocal': 'vocals',
        'voice': 'vocals',
        'guitars': 'guitar',
        'pads': 'pad',
        'arpeggios': 'arpeggio',
        'melancholy': 'melancholic',
        'synthpop': 'synth-pop',
        'synth pop': 'synth-pop'
    };

    // 意味を持たない語
    const STOP_WORDS = new Set(['yet', 'and', 'with', 'the', 'a', 'an', 'or', 'of', 'in', 'to', 'for', 'but', 'by', 'very', 'more', 'less']);

    // 単語全体で一致させる短い語（"emo" が "emotional" に一致しないようにする）
    const EXACT_WORDS = new Set(['emo', 'oi', 'rap', 'ska', 'trap', 'drill', 'dnb', 'edm', 'world', 'raw', 'pad', 'keys', 'beat', 'clap', 'bell', 'horn', 'house', 'soul', 'clear', 'male', 'female', 'voice', 'vocal', 'warm', 'dark', 'sad', 'cute', 'airy', 'lush', 'sweet', 'slow', 'fast', 'bass', 'drum', 'string']);

    // シンセ系でもジャンルとして扱う語
    const GENRE_FIRST = ['synthwave', 'synth-pop', 'synth pop', 'synth rock', 'chillwave', 'vaporwave', 'drum and bass', 'beat pop'];

    // カテゴリー判定用キーワード（上から順に判定）
    const CATEGORY_KEYWORDS = [
        {
            category: 'tempo',
            words: ['bpm', 'uptempo', 'slow', 'fast', 'mid-tempo', 'upbeat', 'tempo', 'downtempo', 'half-time']
        },
        {
            category: 'vocal',
            words: ['vocal', 'voice', 'singer', 'female', 'male', 'choir', 'chorus harmonies', 'harmonies', 'duet', 'rap verse', 'falsetto', 'whisper', 'crooner']
        },
        {
            category: 'instrument',
            words: ['piano', 'guitar', 'bass', 'drum', 'synth', 'string', 'violin', 'cello', 'sax', 'trumpet', 'brass', 'flute', 'organ', 'pad', 'arpeggi', '808', 'percussion', 'accordion', 'ukulele', 'harp', 'bell', 'music box', 'koto', 'shamisen', 'shakuhachi', 'taiko', 'horn', 'clap', 'beat', 'rhodes', 'keys', 'woodwind', 'orchestra', 'banjo', 'mandolin', 'sitar', 'marimba', 'vibraphone', 'glockenspiel']
        },
        {
            category: 'genre',
            words: ['pop', 'rock', 'electro', 'electronic', 'edm', 'synthwave', 'lo-fi', 'jazz', 'manouche', 'folk', 'indie', 'ballad', 'hip hop', 'rap', 'r&b', 'soul', 'funk', 'disco', 'house', 'techno', 'trance', 'dubstep', 'trip-hop', 'ambient', 'cinematic', 'orchestral', 'metal', 'punk', 'emo', 'country', 'reggae', 'latin', 'bossa', 'city pop', 'enka', 'anime', 'vocaloid', 'lounge', 'dance', 'gospel', 'blues', 'swing', 'chillwave', 'vaporwave', 'drum and bass', 'dnb', 'garage', 'grunge', 'shoegaze', 'acoustic', 'symphonic', 'progressive', 'idol', 'kawaii', 'oi', 'ska', 'trap', 'drill', 'phonk', 'hyperpop', 'bedroom', 'soundtrack', 'classical', 'new age', 'world', 'celtic', 'flamenco', 'tango', 'samba', 'afrobeat', 'kayokyoku']
        },
        {
            category: 'mood',
            words: ['uplifting', 'emotional', 'dark', 'sad', 'happy', 'melanchol', 'dream', 'epic', 'energetic', 'energy', 'calm', 'chill', 'nostalg', 'romantic', 'intimate', 'atmospheric', 'ethereal', 'healing', 'graceful', 'catchy', 'anthemic', 'soulful', 'warm', 'powerful', 'bright', 'gentle', 'bittersweet', 'mysterious', 'hopeful', 'heartfelt', 'aggressive', 'playful', 'cute', 'groovy', 'retro', 'futuristic', 'lush', 'airy', 'sophisticated', 'organic', 'raw', 'intense', 'quiet', 'refreshing', 'crystal', 'clear', 'floating', 'driving', 'dramatic', 'haunting', 'peaceful', 'serene', 'sweet', 'tender', 'triumphant', 'cheerful', 'euphoric', 'dynamic', 'graceful']
        }
    ];

    // 語の途中までしか書いていないキーワード（文章から拾うときに語尾を補う）
    const STEM_WORDS = new Set(['melanchol', 'nostalg', 'dream', 'arpeggi', 'energy', 'manouche', 'bossa', 'orchestra', 'sax', 'string', 'percussion', 'synth', 'electro', 'harmonies']);

    const CATEGORY_ORDER = ['genre', 'vocal', 'instrument', 'mood', 'tempo', 'other'];

    const JA_KEYS_SORTED = Object.keys(JA_DICT).sort(function (a, b) { return b.length - a.length; });
    const JAPANESE_RE = /[ぁ-んァ-ヶ一-龠々ー]/;
    const ASCII_WORDS_RE = /[A-Za-z][A-Za-z0-9&'.\- ]*[A-Za-z0-9]|[A-Za-z]/g;
    const MAX_TAG_LENGTH = 40;
    const DESCRIPTION_MIN_LENGTH = 150;

    function hasJapanese(text) {
        return JAPANESE_RE.test(text);
    }

    // 全角英数字・全角スペースを半角に変換
    function toHalfWidth(text) {
        return text
            .replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); })
            .replace(/　/g, ' ');
    }

    function cleanEnglishTag(text) {
        let tag = text.toLowerCase()
            .replace(/[\[\]{}()"“”]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^[\s.\-:;]+|[\s.\-:;]+$/g, '')
            .trim();
        if (Object.prototype.hasOwnProperty.call(TYPO, tag)) {
            tag = TYPO[tag];
        }
        return tag;
    }

    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // キーワードが語として含まれているか（短い語は単語全体で一致、それ以外は語頭で一致）
    function containsWord(text, word) {
        const pattern = EXACT_WORDS.has(word)
            ? '(^|[^a-z])' + escapeRegExp(word) + 's?($|[^a-z])'
            : '(^|[^a-z])' + escapeRegExp(word);
        return new RegExp(pattern).test(text);
    }

    function categorize(tag) {
        if (/^\d{2,3} bpm$/.test(tag)) {
            return 'tempo';
        }
        for (let g = 0; g < GENRE_FIRST.length; g++) {
            if (tag.indexOf(GENRE_FIRST[g]) !== -1) {
                return 'genre';
            }
        }
        for (let i = 0; i < CATEGORY_KEYWORDS.length; i++) {
            const entry = CATEGORY_KEYWORDS[i];
            for (let j = 0; j < entry.words.length; j++) {
                if (containsWord(tag, entry.words[j])) {
                    return entry.category;
                }
            }
        }
        return 'other';
    }

    // 日本語を含む断片から辞書の語を拾う（長い語を優先し、一度使った部分は消す）
    function extractJapaneseTags(fragment) {
        let rest = fragment;
        const found = [];
        JA_KEYS_SORTED.forEach(function (key) {
            if (rest.indexOf(key) !== -1) {
                found.push(JA_DICT[key]);
                rest = rest.split(key).join('　');
            }
        });
        return found;
    }

    // 文章中から既知の英語キーワードを拾う
    function extractEnglishKeywords(text) {
        const lower = ' ' + text.toLowerCase().replace(/[^a-z0-9&\- ]/g, ' ').replace(/\s+/g, ' ') + ' ';
        const found = [];
        CATEGORY_KEYWORDS.forEach(function (entry) {
            if (entry.category === 'tempo') {
                return;
            }
            entry.words.forEach(function (word) {
                if (word.length < 3) {
                    return;
                }
                const suffix = EXACT_WORDS.has(word) ? 's?' : (STEM_WORDS.has(word) ? '[a-z]*' : '(?:s|es)?');
                const re = new RegExp(' (' + escapeRegExp(word) + suffix + ') ', 'g');
                let match;
                while ((match = re.exec(lower)) !== null) {
                    found.push(cleanEnglishTag(match[1]));
                    re.lastIndex = match.index + 1;
                }
            });
        });
        return found;
    }

    function uniquePush(list, value) {
        if (value && list.indexOf(value) === -1) {
            list.push(value);
        }
    }

    /**
     * 1つのスタイル文字列を整理する
     * @param {string} raw 元のスタイル
     * @returns {object} 整理結果
     */
    function normalizeStyle(raw) {
        const result = {
            raw: raw == null ? '' : String(raw),
            kind: 'tags',
            tags: [],
            meta: [],
            bpm: null,
            description: '',
            unmapped: [],
            categories: { genre: [], vocal: [], instrument: [], mood: [], tempo: [], other: [] }
        };

        let text = toHalfWidth(result.raw).trim();
        if (!text) {
            result.kind = 'empty';
            return result;
        }
        if (NO_INFO.has(text.toLowerCase().replace(/\s+/g, ''))) {
            result.kind = 'no_info';
            return result;
        }

        // メタタグを取り出す
        META_PATTERNS.forEach(function (pattern) {
            if (pattern.re.test(text)) {
                uniquePush(result.meta, pattern.tag);
                text = text.replace(new RegExp('\\[?\\s*' + pattern.re.source + '\\s*\\]?', 'gi'), ' ');
            }
        });

        // BPMを取り出す（「92BPM」「BPM70」「BPM:120-140」「80-90 BPM」の形に対応。範囲は中央値）
        const bpmPatterns = [
            /(\d{2,3})(?:\s*[-~〜]\s*(\d{2,3}))?\s*-?\s*bpm/i,
            /bpm\s*[:：=]?\s*(\d{2,3})(?:\s*[-~〜]\s*(\d{2,3}))?/i
        ];
        bpmPatterns.forEach(function (pattern) {
            const match = text.match(pattern);
            if (match) {
                const low = parseInt(match[1], 10);
                const high = match[2] ? parseInt(match[2], 10) : low;
                const bpm = Math.round((low + high) / 2);
                if (result.bpm === null && bpm >= 40 && bpm <= 220) {
                    result.bpm = bpm;
                }
                text = text.replace(new RegExp(pattern.source, 'gi'), ' ');
            }
        });

        const isDescription = text.length >= DESCRIPTION_MIN_LENGTH && (/[。.]/.test(text) || text.split(/[,、]/).length < 6);
        const rawTags = [];

        if (isDescription) {
            result.kind = 'description';
            result.description = text.replace(/\s+/g, ' ').trim();
            extractJapaneseTags(text).forEach(function (tag) { rawTags.push(tag); });
            extractEnglishKeywords(text).forEach(function (tag) { rawTags.push(tag); });
        } else {
            const pieces = text.replace(/^\s*\[|\]\s*$/g, '').split(/[,、，;；\n\/|・]+/);
            pieces.forEach(function (piece) {
                const fragment = piece.trim().replace(/^\(?\s*(genre|style|mood|vocals?|instruments?|instrumentation|tempo|atmosphere|ムード|ジャンル|リズム|雰囲気)\s*[:：]\s*/i, '');
                if (!fragment) {
                    return;
                }
                if (hasJapanese(fragment)) {
                    const jaTags = extractJapaneseTags(fragment);
                    const asciiWords = fragment.match(ASCII_WORDS_RE) || [];
                    asciiWords.forEach(function (word) {
                        const tag = cleanEnglishTag(word);
                        if (tag.length >= 2 && tag.length <= MAX_TAG_LENGTH) {
                            jaTags.push(tag);
                        }
                    });
                    if (jaTags.length === 0) {
                        uniquePush(result.unmapped, fragment);
                    }
                    jaTags.forEach(function (tag) { rawTags.push(tag); });
                } else {
                    const tag = cleanEnglishTag(fragment);
                    if (!tag) {
                        return;
                    }
                    if (tag.length > MAX_TAG_LENGTH) {
                        // 長い英文の断片は説明文として扱い、キーワードだけ拾う
                        result.description = (result.description ? result.description + ' ' : '') + fragment;
                        extractEnglishKeywords(fragment).forEach(function (keyword) { rawTags.push(keyword); });
                    } else {
                        rawTags.push(tag);
                    }
                }
            });
        }

        rawTags.forEach(function (tag) {
            if (!tag || NO_INFO.has(tag.replace(/\s+/g, '')) || STOP_WORDS.has(tag) || /^[\d\s.\-]+$/.test(tag) || !/[a-z]/.test(tag)) {
                return;
            }
            uniquePush(result.tags, tag);
        });

        // より具体的なボーカルタグがあるときは、単なる "vocals" を外す
        if (result.tags.indexOf('vocals') !== -1 && result.tags.some(function (tag) { return tag !== 'vocals' && /vocals$/.test(tag); })) {
            result.tags.splice(result.tags.indexOf('vocals'), 1);
        }

        if (result.bpm) {
            uniquePush(result.tags, result.bpm + ' bpm');
        }

        result.tags.forEach(function (tag) {
            uniquePush(result.categories[categorize(tag)], tag);
        });

        if (result.tags.length === 0 && result.kind === 'tags') {
            result.kind = result.unmapped.length > 0 ? 'unmapped' : 'no_info';
        }

        return result;
    }

    /**
     * ACE-Step などで使う英語タグ文字列に変換
     */
    function toAceStepTags(normalized) {
        const ordered = [];
        CATEGORY_ORDER.forEach(function (category) {
            normalized.categories[category].forEach(function (tag) {
                uniquePush(ordered, tag);
            });
        });
        return ordered.join(', ');
    }

    // 見出し名から列を探す
    function findColumn(headers, candidates) {
        for (let i = 0; i < candidates.length; i++) {
            for (let j = 0; j < headers.length; j++) {
                if (String(headers[j]).indexOf(candidates[i]) !== -1) {
                    return headers[j];
                }
            }
        }
        return null;
    }

    function normalizeLanguage(value) {
        const text = String(value || '').toLowerCase();
        if (text.indexOf('instrumental') !== -1 || text.indexOf('インスト') !== -1) {
            return 'Instrumental';
        }
        if (text.indexOf('english') !== -1 || text.indexOf('英') !== -1) {
            return 'English';
        }
        if (text.indexOf('japanese') !== -1 || text.indexOf('日本') !== -1) {
            return 'Japanese';
        }
        return text ? String(value) : 'Unknown';
    }

    /**
     * Excelの行（見出しをキーにしたオブジェクトの配列）からライブラリを作る
     */
    function buildLibrary(rows) {
        if (!rows || rows.length === 0) {
            throw new Error('データ行がありません');
        }
        const headers = Object.keys(rows.reduce(function (acc, row) { return Object.assign(acc, row); }, {}));
        const columns = {
            style: findColumn(headers, ['スタイル', 'Style', 'style']),
            title: findColumn(headers, ['曲名（配信時）', '曲名', 'タイトル', 'Title', 'title']),
            language: findColumn(headers, ['言語', 'Language', 'language']),
            status: findColumn(headers, ['状態', 'Status', 'status']),
            link: findColumn(headers, ['Suno のリンク', 'リンク', 'Link', 'URL', 'link']),
            lyrics: findColumn(headers, ['歌詞', 'Lyrics', 'lyrics'])
        };
        if (!columns.style) {
            throw new Error('「スタイル」列が見つかりません。見出し: ' + headers.join(', '));
        }

        const entries = [];
        rows.forEach(function (row, index) {
            const styleRaw = row[columns.style] == null ? '' : String(row[columns.style]);
            const lyricsRaw = columns.lyrics && row[columns.lyrics] != null ? String(row[columns.lyrics]) : '';
            const normalized = normalizeStyle(styleRaw);
            entries.push({
                id: index + 1,
                title: columns.title && row[columns.title] != null ? String(row[columns.title]) : '',
                status: columns.status && row[columns.status] != null ? String(row[columns.status]) : '',
                language: normalizeLanguage(columns.language ? row[columns.language] : ''),
                link: columns.link && row[columns.link] != null ? String(row[columns.link]) : '',
                // 「あり」「インスト」などの印だけの場合は歌詞として扱わない
                lyrics: lyricsRaw.length > 20 ? lyricsRaw : '',
                styleRaw: styleRaw,
                normalized: normalized,
                aceStepTags: toAceStepTags(normalized)
            });
        });

        return {
            version: 1,
            createdAt: new Date().toISOString(),
            columns: columns,
            entries: entries,
            stats: computeStats(entries)
        };
    }

    function countInto(counter, key) {
        counter[key] = (counter[key] || 0) + 1;
    }

    function sortCounter(counter, limit) {
        return Object.keys(counter)
            .map(function (key) { return { name: key, count: counter[key] }; })
            .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); })
            .slice(0, limit || 100000);
    }

    function computeStats(entries) {
        const tagCounter = {};
        const categoryCounters = { genre: {}, vocal: {}, instrument: {}, mood: {}, tempo: {}, other: {} };
        const languageCounter = {};
        const statusCounter = {};
        const kindCounter = {};
        const metaCounter = {};
        const unmappedCounter = {};
        const uniqueStyles = {};
        const bpms = [];
        let withLyrics = 0;

        entries.forEach(function (entry) {
            const normalized = entry.normalized;
            countInto(languageCounter, entry.language);
            countInto(statusCounter, entry.status || '(空欄)');
            countInto(kindCounter, normalized.kind);
            if (entry.styleRaw.trim()) {
                uniqueStyles[entry.styleRaw.trim()] = true;
            }
            if (entry.lyrics) {
                withLyrics++;
            }
            normalized.tags.forEach(function (tag) { countInto(tagCounter, tag); });
            CATEGORY_ORDER.forEach(function (category) {
                normalized.categories[category].forEach(function (tag) {
                    if (category === 'tempo' && /bpm$/.test(tag)) {
                        return;
                    }
                    countInto(categoryCounters[category], tag);
                });
            });
            normalized.meta.forEach(function (meta) { countInto(metaCounter, meta); });
            normalized.unmapped.forEach(function (fragment) { countInto(unmappedCounter, fragment); });
            if (normalized.bpm) {
                bpms.push(normalized.bpm);
            }
        });

        bpms.sort(function (a, b) { return a - b; });
        const median = bpms.length ? bpms[Math.floor(bpms.length / 2)] : null;

        return {
            total: entries.length,
            uniqueStyles: Object.keys(uniqueStyles).length,
            withLyrics: withLyrics,
            languages: sortCounter(languageCounter),
            statuses: sortCounter(statusCounter),
            kinds: sortCounter(kindCounter),
            meta: sortCounter(metaCounter),
            topTags: sortCounter(tagCounter, 80),
            uniqueTagCount: Object.keys(tagCounter).length,
            categories: {
                genre: sortCounter(categoryCounters.genre, 30),
                vocal: sortCounter(categoryCounters.vocal, 30),
                instrument: sortCounter(categoryCounters.instrument, 30),
                mood: sortCounter(categoryCounters.mood, 30),
                tempo: sortCounter(categoryCounters.tempo, 30),
                other: sortCounter(categoryCounters.other, 30)
            },
            unmapped: sortCounter(unmappedCounter, 50),
            bpm: {
                count: bpms.length,
                min: bpms.length ? bpms[0] : null,
                max: bpms.length ? bpms[bpms.length - 1] : null,
                median: median
            }
        };
    }

    return {
        normalizeStyle: normalizeStyle,
        toAceStepTags: toAceStepTags,
        buildLibrary: buildLibrary,
        computeStats: computeStats,
        CATEGORY_ORDER: CATEGORY_ORDER
    };
}));
