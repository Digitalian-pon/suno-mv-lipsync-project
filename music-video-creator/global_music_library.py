#!/usr/bin/env python3
"""
グローバル音楽ライブラリ
世界中の音楽ジャンルと感動・勇気を与えるテーマのプロンプトテンプレート
"""

class GlobalMusicLibrary:
    """世界の音楽ジャンルとテーマのライブラリ"""

    # 世界の音楽ジャンル
    GENRES = {
        # アジア
        "jpop": {
            "name": "J-POP（日本）",
            "description": "明るくキャッチーな日本のポップミュージック",
            "languages": ["ja"],
            "instruments": ["シンセサイザー", "エレキギター", "ドラム"]
        },
        "kpop": {
            "name": "K-POP（韓国）",
            "description": "ダイナミックで洗練された韓国のポップミュージック",
            "languages": ["ko"],
            "instruments": ["EDMビート", "シンセ", "パーカッション"]
        },
        "bollywood": {
            "name": "ボリウッド（インド）",
            "description": "情熱的でカラフルなインド映画音楽",
            "languages": ["hi", "en"],
            "instruments": ["タブラ", "シタール", "バイオリン"]
        },
        "cpop": {
            "name": "C-POP（中国）",
            "description": "メロディアスな中国のポップミュージック",
            "languages": ["zh"],
            "instruments": ["二胡", "ピアノ", "現代楽器"]
        },

        # 欧米
        "pop": {
            "name": "Pop（世界）",
            "description": "キャッチーで親しみやすいポップミュージック",
            "languages": ["en"],
            "instruments": ["ギター", "ベース", "ドラム", "シンセ"]
        },
        "rock": {
            "name": "Rock（ロック）",
            "description": "力強く情熱的なロックミュージック",
            "languages": ["en"],
            "instruments": ["エレキギター", "ベース", "ドラム"]
        },
        "ballad": {
            "name": "Ballad（バラード）",
            "description": "感動的でエモーショナルなバラード",
            "languages": ["en", "ja", "ko"],
            "instruments": ["ピアノ", "ストリングス", "アコースティックギター"]
        },
        "edm": {
            "name": "EDM（エレクトロニック）",
            "description": "エネルギッシュなエレクトロニックダンスミュージック",
            "languages": ["en", "instrumental"],
            "instruments": ["シンセサイザー", "ドラムマシン", "ベース"]
        },
        "hiphop": {
            "name": "Hip Hop（ヒップホップ）",
            "description": "リズミカルでストーリー性のあるヒップホップ",
            "languages": ["en", "es", "fr"],
            "instruments": ["ビート", "サンプリング", "ベース"]
        },

        # ラテン・アフリカ
        "latin": {
            "name": "Latin（ラテン）",
            "description": "情熱的でリズミカルなラテン音楽",
            "languages": ["es", "pt"],
            "instruments": ["ギター", "トランペット", "パーカッション", "マラカス"]
        },
        "reggaeton": {
            "name": "Reggaeton（レゲトン）",
            "description": "グルーヴィーなラテンアーバン音楽",
            "languages": ["es"],
            "instruments": ["デンボウビート", "シンセ", "ベース"]
        },
        "afrobeat": {
            "name": "Afrobeat（アフロビート）",
            "description": "活気あふれるアフリカのリズム",
            "languages": ["en", "yo", "ig"],
            "instruments": ["ドラム", "パーカッション", "ホーン"]
        },

        # クラシック・伝統
        "classical": {
            "name": "Classical（クラシック）",
            "description": "荘厳で美しいクラシック音楽",
            "languages": ["instrumental"],
            "instruments": ["オーケストラ", "ピアノ", "バイオリン"]
        },
        "folk": {
            "name": "Folk（フォーク）",
            "description": "心温まる伝統的なフォーク音楽",
            "languages": ["en", "各国語"],
            "instruments": ["アコースティックギター", "ハーモニカ", "バンジョー"]
        },

        # その他
        "gospel": {
            "name": "Gospel（ゴスペル）",
            "description": "魂を揺さぶる感動的なゴスペル",
            "languages": ["en"],
            "instruments": ["ピアノ", "オルガン", "コーラス"]
        },
        "soul": {
            "name": "Soul（ソウル）",
            "description": "深い感情を込めたソウルミュージック",
            "languages": ["en"],
            "instruments": ["ベース", "ドラム", "ホーン", "ピアノ"]
        },
        "reggae": {
            "name": "Reggae（レゲエ）",
            "description": "リラックスした平和なレゲエ",
            "languages": ["en"],
            "instruments": ["ギター", "ベース", "ドラム", "キーボード"]
        },
        "anime": {
            "name": "Anime（アニメソング）",
            "description": "希望と冒険に満ちたアニメ音楽",
            "languages": ["ja"],
            "instruments": ["オーケストラ", "ロック楽器", "シンセ"]
        }
    }

    # 感動と勇気を与えるテーマ
    THEMES = {
        "hope": {
            "name": "Hope（希望）",
            "keywords": ["希望", "明るい未来", "新しい始まり", "光", "夢"],
            "mood": "uplifting, hopeful, bright",
            "tempo": "medium-fast (100-130 BPM)"
        },
        "courage": {
            "name": "Courage（勇気）",
            "keywords": ["勇気", "挑戦", "戦い", "強さ", "立ち向かう"],
            "mood": "powerful, brave, determined",
            "tempo": "medium-fast (110-140 BPM)"
        },
        "inspiration": {
            "name": "Inspiration（インスピレーション）",
            "keywords": ["インスピレーション", "創造", "可能性", "変化", "成長"],
            "mood": "inspiring, motivational, energetic",
            "tempo": "medium (90-120 BPM)"
        },
        "unity": {
            "name": "Unity（団結）",
            "keywords": ["団結", "一体感", "共に", "絆", "つながり"],
            "mood": "warm, together, harmonious",
            "tempo": "medium (95-115 BPM)"
        },
        "peace": {
            "name": "Peace（平和）",
            "keywords": ["平和", "調和", "愛", "優しさ", "癒し"],
            "mood": "peaceful, calm, gentle",
            "tempo": "slow-medium (70-100 BPM)"
        },
        "victory": {
            "name": "Victory（勝利）",
            "keywords": ["勝利", "達成", "成功", "栄光", "triumph"],
            "mood": "triumphant, celebratory, powerful",
            "tempo": "fast (120-150 BPM)"
        },
        "freedom": {
            "name": "Freedom（自由）",
            "keywords": ["自由", "解放", "飛躍", "限界なし", "夢の実現"],
            "mood": "liberating, soaring, expansive",
            "tempo": "medium-fast (110-135 BPM)"
        },
        "love": {
            "name": "Love（愛）",
            "keywords": ["愛", "思いやり", "情熱", "heart", "感情"],
            "mood": "emotional, heartfelt, passionate",
            "tempo": "slow-medium (70-110 BPM)"
        },
        "resilience": {
            "name": "Resilience（回復力）",
            "keywords": ["回復", "再起", "不屈", "perseverance", "強さ"],
            "mood": "resilient, strong, rising",
            "tempo": "medium (100-125 BPM)"
        },
        "joy": {
            "name": "Joy（喜び）",
            "keywords": ["喜び", "幸せ", "楽しさ", "celebration", "笑顔"],
            "mood": "joyful, happy, upbeat",
            "tempo": "fast (120-140 BPM)"
        }
    }

    # 感動的なストーリーテンプレート
    STORY_TEMPLATES = {
        "overcoming_adversity": {
            "name": "逆境を乗り越える",
            "structure": "困難 → 挑戦 → 成長 → 勝利",
            "description": "人生の困難を乗り越え、強くなる物語"
        },
        "chasing_dreams": {
            "name": "夢を追いかける",
            "structure": "夢 → 努力 → 挫折 → 達成",
            "description": "夢に向かって走り続ける情熱的な物語"
        },
        "finding_self": {
            "name": "自分を見つける",
            "structure": "迷い → 探求 → 発見 → 目覚め",
            "description": "本当の自分を見つける旅の物語"
        },
        "unity_strength": {
            "name": "団結の力",
            "structure": "分断 → 理解 → 協力 → 勝利",
            "description": "人々が団結して困難を乗り越える物語"
        },
        "hope_renewal": {
            "name": "希望の再生",
            "structure": "絶望 → 光 → 再起 → 新生",
            "description": "希望を失った人が再び立ち上がる物語"
        }
    }

    @classmethod
    def generate_prompt(cls, genre_key, theme_key, story_key=None, language="en", custom_details=""):
        """
        音楽プロンプトを自動生成

        Args:
            genre_key: ジャンルキー
            theme_key: テーマキー
            story_key: ストーリーキー（オプション）
            language: 言語コード
            custom_details: カスタム詳細

        Returns:
            生成されたプロンプト
        """
        genre = cls.GENRES.get(genre_key, cls.GENRES["pop"])
        theme = cls.THEMES.get(theme_key, cls.THEMES["hope"])

        # 基本プロンプト構築
        prompt_parts = []

        # ジャンル
        prompt_parts.append(f"{genre['name']} style music")

        # テーマとムード
        prompt_parts.append(f"theme of {theme['name']}")
        prompt_parts.append(f"mood: {theme['mood']}")
        prompt_parts.append(f"tempo: {theme['tempo']}")

        # 楽器
        instruments = ", ".join(genre['instruments'])
        prompt_parts.append(f"instruments: {instruments}")

        # ストーリー
        if story_key and story_key in cls.STORY_TEMPLATES:
            story = cls.STORY_TEMPLATES[story_key]
            prompt_parts.append(f"story: {story['description']}")

        # 言語
        if language in genre['languages']:
            prompt_parts.append(f"language: {language} vocals")
        elif "instrumental" in genre['languages']:
            prompt_parts.append("instrumental version")
        else:
            prompt_parts.append(f"language: English vocals")

        # カスタム詳細
        if custom_details:
            prompt_parts.append(custom_details)

        # 感動を高める要素
        prompt_parts.append("emotional, inspiring, professional quality")

        return ", ".join(prompt_parts)

    @classmethod
    def get_genre_suggestions(cls, theme_key):
        """テーマに最適なジャンルを提案"""
        suggestions = {
            "hope": ["pop", "ballad", "gospel", "anime"],
            "courage": ["rock", "edm", "hiphop", "anime"],
            "inspiration": ["pop", "soul", "gospel", "classical"],
            "unity": ["folk", "reggae", "gospel", "world"],
            "peace": ["ballad", "folk", "classical", "reggae"],
            "victory": ["rock", "edm", "hiphop", "anime"],
            "freedom": ["rock", "reggae", "folk", "edm"],
            "love": ["ballad", "soul", "pop", "rnb"],
            "resilience": ["rock", "hiphop", "soul", "anime"],
            "joy": ["pop", "latin", "afrobeat", "kpop"]
        }

        return suggestions.get(theme_key, ["pop", "rock", "ballad"])

    @classmethod
    def get_language_name(cls, code):
        """言語コードから言語名を取得"""
        languages = {
            "en": "English（英語）",
            "ja": "Japanese（日本語）",
            "ko": "Korean（韓国語）",
            "zh": "Chinese（中国語）",
            "es": "Spanish（スペイン語）",
            "pt": "Portuguese（ポルトガル語）",
            "fr": "French（フランス語）",
            "de": "German（ドイツ語）",
            "it": "Italian（イタリア語）",
            "hi": "Hindi（ヒンディー語）",
            "ar": "Arabic（アラビア語）",
            "ru": "Russian（ロシア語）",
            "instrumental": "Instrumental（インストゥルメンタル）"
        }
        return languages.get(code, code)


# プリセットプロンプト集
PRESET_PROMPTS = {
    "global_hope": {
        "name": "🌍 世界に希望を（Global Hope）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "pop", "hope", "hope_renewal", "en",
            "uplifting melody, universal message, inspiring lyrics about overcoming darkness"
        ),
        "description": "世界中の人々に希望を届ける普遍的なメッセージ"
    },

    "courage_anthem": {
        "name": "💪 勇気の賛歌（Courage Anthem）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "rock", "courage", "overcoming_adversity", "en",
            "powerful guitar, epic drums, anthem-like, motivational lyrics"
        ),
        "description": "挑戦する人々を応援する力強い賛歌"
    },

    "unity_celebration": {
        "name": "🤝 団結の祝祭（Unity Celebration）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "afrobeat", "unity", "unity_strength", "en",
            "celebratory rhythm, diverse instruments, message of togetherness"
        ),
        "description": "文化を超えた団結を祝う音楽"
    },

    "dream_chase": {
        "name": "✨ 夢追い人（Dream Chaser）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "edm", "inspiration", "chasing_dreams", "en",
            "soaring synth, building energy, message about pursuing dreams"
        ),
        "description": "夢を追いかける全ての人への応援歌"
    },

    "peaceful_world": {
        "name": "🕊️ 平和な世界（Peaceful World）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "folk", "peace", None, "en",
            "gentle acoustic, harmonious vocals, message of peace and love"
        ),
        "description": "世界平和を願う優しい音楽"
    },

    "victory_march": {
        "name": "🏆 勝利の行進（Victory March）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "orchestral", "victory", None, "instrumental",
            "triumphant horns, powerful drums, epic orchestration"
        ),
        "description": "達成と勝利を祝う荘厳な音楽"
    },

    "freedom_song": {
        "name": "🦅 自由の歌（Freedom Song）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "gospel", "freedom", None, "en",
            "soulful vocals, uplifting choir, message of liberation and breaking chains"
        ),
        "description": "自由と解放を歌う魂の音楽"
    },

    "love_humanity": {
        "name": "❤️ 人類への愛（Love for Humanity）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "soul", "love", None, "en",
            "heartfelt vocals, emotional depth, universal message of compassion"
        ),
        "description": "全人類への愛を歌う感動的な音楽"
    },

    "resilience_rising": {
        "name": "🌅 再起の朝（Rising Again）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "hiphop", "resilience", "hope_renewal", "en",
            "strong beat, powerful lyrics, message of rising from failure"
        ),
        "description": "挫折から立ち上がる力強いメッセージ"
    },

    "joyful_celebration": {
        "name": "🎉 喜びの祝祭（Joyful Celebration）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "latin", "joy", None, "es",
            "festive rhythm, dancing beat, celebration of life and happiness"
        ),
        "description": "人生の喜びを祝う陽気な音楽"
    },

    "asian_spirit": {
        "name": "🎌 アジアの魂（Asian Spirit）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "kpop", "courage", "chasing_dreams", "ko",
            "modern K-pop production, powerful choreography feel, inspirational message"
        ),
        "description": "アジアから世界へ届ける勇気の歌"
    },

    "african_rhythm": {
        "name": "🌍 アフリカの鼓動（African Heartbeat）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "afrobeat", "joy", "unity_strength", "en",
            "traditional percussion, modern production, celebration of community"
        ),
        "description": "アフリカのリズムで団結を祝う"
    },

    "bollywood_dream": {
        "name": "🇮🇳 ボリウッドの夢（Bollywood Dream）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "bollywood", "hope", "chasing_dreams", "hi",
            "colorful orchestration, dramatic vocals, cinematic feel, message of dreams coming true"
        ),
        "description": "夢の実現を歌うボリウッドスタイル"
    },

    "anime_hero": {
        "name": "⚔️ アニメヒーロー（Anime Hero）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "anime", "courage", "overcoming_adversity", "ja",
            "epic anime opening style, heroic melody, message of never giving up"
        ),
        "description": "ヒーローの旅を描くアニメソング"
    },

    "classical_triumph": {
        "name": "🎻 クラシック凱旋（Classical Triumph）",
        "prompt": GlobalMusicLibrary.generate_prompt(
            "classical", "victory", None, "instrumental",
            "full orchestra, majestic composition, celebration of human achievement"
        ),
        "description": "人類の偉業を讃えるクラシック"
    }
}


if __name__ == "__main__":
    # テスト実行
    print("🌍 グローバル音楽ライブラリ - テストモード\n")

    print("=== プリセットプロンプト ===")
    for key, preset in list(PRESET_PROMPTS.items())[:3]:
        print(f"\n{preset['name']}")
        print(f"説明: {preset['description']}")
        print(f"プロンプト: {preset['prompt'][:100]}...")

    print("\n\n=== カスタムプロンプト生成 ===")
    custom = GlobalMusicLibrary.generate_prompt(
        "rock", "courage", "overcoming_adversity", "en",
        "epic guitar solo, powerful drums, anthem for the brave"
    )
    print(f"生成されたプロンプト:\n{custom}")

    print("\n\n=== ジャンル提案 ===")
    suggestions = GlobalMusicLibrary.get_genre_suggestions("hope")
    print(f"「希望」テーマに最適なジャンル: {suggestions}")
