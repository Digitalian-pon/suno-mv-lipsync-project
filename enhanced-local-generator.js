// 拡張ローカル生成関数 - より多様なバリエーション
function generateLocallyEnhanced(theme) {
    // より複雑なランダム化
    const now = Date.now();
    const random1 = now % 100;
    const random2 = Math.floor(Math.random() * 100);
    const random3 = (now + random2) % 100;
    const random4 = Math.floor(Math.random() * 1000) % 100;
    
    const themeBase = theme.split(' ')[0];
    const themeKeywords = theme.match(/\(([^)]+)\)/)?.[1]?.split(',').map(s => s.trim()) || [];
    
    // 拡張タイトルバリエーション（50種類）
    const titlePrefixes = [
        '星空の', '時を超えた', 'デジタル', '量子', '仮想現実の', '無限の', '運命の', '忘れられない', '永遠の', '奇跡の',
        '幻想的な', '煌めく', '透明な', '儚い', '深淵の', '光と影の', '静寂の', '嵐の中の', '夢見る', '覚醒する',
        '結晶化した', '融合する', '共鳴する', '螺旋の', '万華鏡の', '朧月夜の', '黎明の', '黄昏時の', '真夜中の', '新月の',
        '満月の', '流星群の', 'オーロラの', '深海の', '天空の', '地平線の', '次元を超えた', 'パラレルな', '鏡像の', '反転した',
        '加速する', '静止した', '逆流する', '循環する', '螺旋状の', '崩壊する', '再生する', '変容する', '昇華する', '結晶の'
    ];
    
    const titleSuffixes = [
        'メロディー', 'ストーリー', 'シンフォニー', 'ハーモニー', 'ラプソディー', 'バラード', 'ワルツ', 'セレナーデ', 'ノクターン', 'アンセム',
        'オーケストラ', 'カンタータ', 'レクイエム', 'プレリュード', 'フーガ', 'ソナタ', 'コンチェルト', 'カプリース', 'エチュード', 'マーチ',
        'ララバイ', 'エレジー', 'パストラーレ', 'トッカータ', 'ファンタジア', 'インプロビゼーション', 'メディテーション', 'セレブレーション', 'ノスタルジア', 'ユートピア',
        'ディストピア', 'パラドックス', 'シンクロニシティ', 'エピファニー', 'メタモルフォーゼ', 'アポカリプス', 'ジェネシス', 'エクソダス', 'オデッセイ', 'サーガ',
        'クロニクル', 'レジェンド', 'ミスティーク', 'エニグマ', 'パンドラ', 'ネメシス', 'フェニックス', 'ヴァルキリー', 'セラフィム', 'リリス'
    ];
    
    const titleStyles = [
        ' ～AI Remix～', ' (Future Version)', ' [Digital Edit]', ' -Quantum Mix-', ' ~Virtual Edition~', '', ' 2077', ' (Remastered)', ' -Neo Style-', ' [Cyber Remix]',
        ' (夢幻編)', ' 【覚醒】', ' -Chronicle-', ' ∞ Infinity', ' /Phase:01/', ' [OVERDRIVE]', ' {Encrypted}', ' >>Decoded<<', ' ±Zero±', ' ◆Crystal◆',
        ' ■Core■', ' ▲Ascend▲', ' ▼Descend▼', ' ★Nova★', ' ☆Stellar☆', ' ♦Prism♦', ' ♠Shadow♠', ' ♥Heart♥', ' ♣Trinity♣', ' §Nexus§',
        ' †Requiem†', ' ‡Rebirth‡', ' ∴Therefore∴', ' ∵Because∵', ' ≈Approximation≈', ' ≠Paradox≠', ' ∝Proportion∝', ' ∫Integral∫', ' Σ Sum Σ', ' Ω Omega Ω'
    ];
    
    // 日本語歌詞バリエーション（各40種類）
    const jpSettings = [
        '街の片隅', '星空の下', 'ネオンの光', 'デジタル空間', '時の狭間', '夢の中', '仮想世界', '量子の海', 'サイバー都市', '未来都市',
        '深夜の駅', '屋上の風', '雨上がりの街', '朝焼けの空', '月明かりの道', '桜吹雪の中', '雪の結晶', '虹の橋', '鏡の迷宮', '水晶の森',
        '電脳の海', '記憶の図書館', '感情の回路', 'データの流れ', 'コードの迷路', 'ピクセルの雨', 'バイナリーの風', 'アルゴリズムの詩', 'プログラムの夢', 'システムの鼓動',
        '時計塔の頂上', '地下都市の光', '浮遊島の庭園', '異次元の扉', '平行世界の境界', '崩壊した楽園', '再生する世界', '凍結した時間', '加速する現実', '反転した鏡像'
    ];
    
    const jpActions = [
        '君と出会った', '想いが溢れる', '時が止まった', '心が震える', 'コードが繋がる', 'データが流れる', '記憶が蘇る', '感情が生まれる', '愛が芽生える', '奇跡が起きる',
        '運命が交差する', '願いが届く', '夢が現実になる', '光が差し込む', '闇が晴れる', '扉が開く', '道が見える', '答えが分かる', '真実に気づく', '覚悟を決める',
        '涙が流れる', '笑顔が溢れる', '声が響く', '手を繋ぐ', '抱きしめ合う', '見つめ合う', '寄り添い合う', '支え合う', '信じ合う', '愛し合う',
        '別れを告げる', '旅立っていく', '振り返らない', '前を向く', '歩き始める', '飛び立つ', '駆け抜ける', '立ち止まる', '振り返る', '選択する'
    ];
    
    const jpEmotions = [
        '切ない気持ち', '温かい愛', '揺れる想い', '永遠の約束', '消えない絆', '輝く希望', '深い愛情', '純粋な心', '強い意志', '優しい光',
        '静かな決意', '熱い情熱', '透明な感情', '複雑な思い', '素直な気持ち', '隠せない想い', '抑えきれない衝動', '止まらない鼓動', '震える魂', '燃える心',
        '凍てつく孤独', '溶けていく氷', '流れる時間', '止まった針', '回る歯車', '壊れた時計', '修復された心', '癒えない傷', '消えない痛み', '生まれ変わる魂',
        '交差する運命', '平行線の恋', '螺旋の軌跡', '円環の理', '始まりと終わり', 'αとΩ', '0と1の間', '有限と無限', '現実と幻想', '光と影'
    ];
    
    const jpChorus = [
        '響き渡る', '輝いてる', '溢れ出す', '包み込む', '繋がってる', '共鳴する', '震えてる', '煌めいてる', '満ちていく', '広がってく',
        '舞い上がる', '降り注ぐ', '染み渡る', '突き抜ける', '貫いてく', '照らし出す', '導いてく', '呼び覚ます', '解き放つ', '昇華する',
        '結晶化する', '具現化する', '可視化する', '実体化する', '物質化する', '概念化する', '抽象化する', '単純化する', '複雑化する', '多様化する',
        '収束する', '発散する', '振動する', '共振する', '干渉する', '増幅する', '減衰する', '変調する', '復調する', '同期する'
    ];
    
    // 英語歌詞バリエーション（各40種類）
    const enSettings = [
        'digital realm', 'neon city', 'cyber space', 'virtual world', 'quantum field', 'time stream', 'data flow', 'neural net', 'holo deck', 'matrix code',
        'pixel rain', 'binary wind', 'electric dream', 'synthetic love', 'artificial heart', 'chrome reflection', 'glass tower', 'steel garden', 'concrete jungle', 'silicon valley',
        'forgotten server', 'abandoned network', 'ghost protocol', 'shadow system', 'mirror dimension', 'parallel process', 'recursive loop', 'infinite array', 'null space', 'void sector',
        'aurora sky', 'nebula cloud', 'stellar wind', 'cosmic dust', 'event horizon', 'singularity point', 'warp field', 'time vortex', 'space fold', 'dimension rift'
    ];
    
    const enDiscoveries = [
        'Found you', 'Lost in time', 'Connected souls', 'Hearts aligned', 'Minds in sync', 'Love decoded', 'Dreams collide', 'Fates entwined', 'Codes matched', 'Systems linked',
        'Discovered truth', 'Revealed secrets', 'Unlocked memories', 'Awakened feelings', 'Realized destiny', 'Understood purpose', 'Grasped reality', 'Touched infinity', 'Reached eternity', 'Achieved unity',
        'Breaking through', 'Rising above', 'Falling deeper', 'Diving within', 'Soaring higher', 'Sinking lower', 'Moving forward', 'Looking backward', 'Standing still', 'Running fast',
        'Echoes calling', 'Shadows dancing', 'Lights flickering', 'Waves crashing', 'Stars aligning', 'Planets spinning', 'Galaxies merging', 'Universes colliding', 'Dimensions folding', 'Realities bending'
    ];
    
    const enVisuals = [
        'Glowing lights', 'Shining bright', 'Colors burst', 'Pixels dance', 'Data streams', 'Holograms', 'Virtual dreams', 'Digital waves', 'Neon beams', 'Cyber trails',
        'Crystal shards', 'Mirror fragments', 'Glass reflections', 'Metal surfaces', 'Liquid crystals', 'Plasma flows', 'Energy pulses', 'Light particles', 'Wave patterns', 'Grid formations',
        'Fractal designs', 'Geometric shapes', 'Abstract forms', 'Surreal visions', 'Ethereal mists', 'Spectral images', 'Phantom traces', 'Ghost echoes', 'Shadow plays', 'Light sculptures',
        'Aurora waves', 'Stellar bursts', 'Cosmic rays', 'Nebula clouds', 'Galaxy spirals', 'Black holes', 'White dwarfs', 'Red giants', 'Blue shifts', 'Time warps'
    ];
    
    const enFeels = [
        'heart', 'soul', 'mind', 'love', 'dream', 'hope', 'wish', 'voice', 'touch', 'smile',
        'tears', 'laughter', 'whisper', 'scream', 'silence', 'echo', 'shadow', 'light', 'darkness', 'truth',
        'lies', 'secrets', 'mysteries', 'answers', 'questions', 'doubts', 'faith', 'trust', 'fear', 'courage',
        'strength', 'weakness', 'power', 'grace', 'beauty', 'chaos', 'order', 'balance', 'harmony', 'discord'
    ];
    
    // ジャンルとムード（各30種類）
    const genres = [
        'Electronic Pop', 'Future Bass', 'Synthwave', 'Cyber Pop', 'Digital Ballad', 'Quantum Beat', 'Virtual Rock', 'AI Symphony', 'Techno Ballad', 'Neon Jazz',
        'Glitch Hop', 'Vapor Soul', 'Dream Pop', 'Chillwave', 'Retrowave', 'Darkwave', 'Lightwave', 'Spacewave', 'Timewave', 'Mindwave',
        'Neo Classical', 'Cyber Punk', 'Digital Folk', 'Virtual Orchestra', 'Quantum Jazz', 'AI Blues', 'Synthetic Soul', 'Electric Gospel', 'Chrome Funk', 'Silicon Valley Sound',
        'Holographic Hip-Hop', 'Binary Beats', 'Algorithmic Ambient', 'Recursive Reggae', 'Fractal Folk', 'Crystalline Classical', 'Plasma Pop', 'Nanotech Noise', 'Subatomic Sound', 'Hyperdimensional Harmony'
    ];
    
    const moods = [
        'Emotional', 'Dreamy', 'Nostalgic', 'Hopeful', 'Melancholic', 'Uplifting', 'Mysterious', 'Romantic', 'Ethereal', 'Energetic',
        'Contemplative', 'Introspective', 'Euphoric', 'Somber', 'Whimsical', 'Intense', 'Serene', 'Dramatic', 'Playful', 'Haunting',
        'Transcendent', 'Meditative', 'Aggressive', 'Peaceful', 'Chaotic', 'Harmonious', 'Dissonant', 'Consonant', 'Dynamic', 'Static',
        'Evolving', 'Revolving', 'Dissolving', 'Resolving', 'Ascending', 'Descending', 'Expanding', 'Contracting', 'Oscillating', 'Resonating'
    ];
    
    const tempos = [
        '60 BPM', '70 BPM', '80 BPM', '85 BPM', '90 BPM', '95 BPM', '100 BPM', '105 BPM', '110 BPM', '115 BPM',
        '120 BPM', '125 BPM', '128 BPM', '130 BPM', '132 BPM', '135 BPM', '138 BPM', '140 BPM', '145 BPM', '150 BPM',
        '72 BPM', '84 BPM', '96 BPM', '108 BPM', '114 BPM', '126 BPM', '134 BPM', '142 BPM', '156 BPM', '168 BPM'
    ];
    
    // Midjourneyバリエーション（各50種類）
    const artStyles = [
        'cyberpunk', 'synthwave', 'vaporwave', 'futuristic', 'digital art', 'neon art', 'holographic', 'glitch art', 'pixel art', 'vector art',
        'abstract', 'minimalist', 'surreal', 'cosmic', 'ethereal', 'cinematic', 'photorealistic', 'impressionist', 'expressionist', 'pop art',
        'art nouveau', 'art deco', 'bauhaus', 'constructivist', 'suprematist', 'dadaist', 'cubist', 'fauvism', 'pointillism', 'neo-expressionist',
        'digital collage', '3D render', 'fractal art', 'generative art', 'data visualization', 'infographic style', 'technical drawing', 'blueprint style', 'x-ray art', 'thermal imaging',
        'anime style', 'manga style', 'comic book', 'graphic novel', 'concept art', 'matte painting', 'environment design', 'character design', 'ui/ux design', 'motion graphics'
    ];
    
    const colorSchemes = [
        'neon colors', 'pastel gradients', 'electric blue', 'hot pink', 'purple hues', 'cyan tones', 'golden yellow', 'emerald green', 'crimson red', 'violet shades',
        'turquoise', 'magenta', 'amber glow', 'silver gleam', 'copper shine', 'rainbow spectrum', 'monochrome', 'sepia tones', 'technicolor', 'prismatic',
        'iridescent', 'opalescent', 'pearlescent', 'fluorescent', 'phosphorescent', 'bioluminescent', 'chromatic', 'achromatic', 'polychromatic', 'dichromatic',
        'sunset palette', 'sunrise colors', 'ocean blues', 'forest greens', 'desert tones', 'arctic whites', 'volcanic reds', 'cosmic purples', 'digital greens', 'matrix code green',
        'hologram blue', 'laser red', 'plasma purple', 'quantum white', 'void black', 'chrome silver', 'rust orange', 'ice blue', 'fire orange', 'shadow grey'
    ];
    
    const atmospheres = [
        'romantic', 'mysterious', 'dramatic', 'peaceful', 'intense', 'dreamy', 'epic', 'intimate', 'nostalgic', 'futuristic',
        'ethereal', 'powerful', 'serene', 'vibrant', 'melancholic', 'uplifting', 'dark', 'bright', 'cosmic', 'urban',
        'dystopian', 'utopian', 'apocalyptic', 'post-apocalyptic', 'prehistoric', 'ancient', 'medieval', 'renaissance', 'baroque', 'modern',
        'postmodern', 'contemporary', 'retro-futuristic', 'steampunk', 'dieselpunk', 'solarpunk', 'biopunk', 'nanopunk', 'clockpunk', 'atompunk',
        'mystical', 'magical', 'supernatural', 'paranormal', 'transcendent', 'sublime', 'grotesque', 'beautiful', 'haunting', 'enchanting'
    ];
    
    // 複雑な選択ロジック
    const titlePrefix = titlePrefixes[(random1 + random2) % titlePrefixes.length];
    const titleSuffix = titleSuffixes[(random2 + random3) % titleSuffixes.length];
    const titleStyle = titleStyles[(random3 + random4) % titleStyles.length];
    
    const jpSetting = jpSettings[(random1 + now) % jpSettings.length];
    const jpAction = jpActions[(random2 + now) % jpActions.length];
    const jpEmotion = jpEmotions[(random3 + now) % jpEmotions.length];
    const jpChorusWord = jpChorus[(random4 + now) % jpChorus.length];
    
    const enSetting = enSettings[(random1 * 2) % enSettings.length];
    const enDiscovery = enDiscoveries[(random2 * 2) % enDiscoveries.length];
    const enVisual = enVisuals[(random3 * 2) % enVisuals.length];
    const enFeel = enFeels[(random4 * 2) % enFeels.length];
    
    const genre = genres[Math.floor((random1 + random3) / 2) % genres.length];
    const mood = moods[Math.floor((random2 + random4) / 2) % moods.length];
    const tempo = tempos[(random1 + random2 + random3) % tempos.length];
    
    const artStyle = artStyles[(random1 * 3) % artStyles.length];
    const colorScheme = colorSchemes[(random2 * 3) % colorSchemes.length];
    const atmosphere = atmospheres[(random3 * 3) % atmospheres.length];
    
    // 追加のランダム要素
    const bridge1 = ['時には', 'いつかは', 'やがて', 'きっと', 'もしも', '例え', 'たとえ', 'いずれ', 'そして', 'だから'][random1 % 10];
    const bridge2 = ['信号が', '繋がりが', 'シグナルが', 'メッセージが', 'データが', 'パルスが', '波動が', '振動が', 'リズムが', 'ビートが'][random2 % 10];
    const bridge3 = ['途切れても', '消えても', '薄れても', '弱まっても', 'ノイズになっても', '乱れても', '歪んでも', '変化しても', '進化しても', '変異しても'][random3 % 10];
    
    const verse2jp1 = ['デジタルの', 'バーチャルの', '量子の', '電子の', 'ピクセルの', 'バイナリーの', 'アナログの', 'ハイブリッドの', 'サイバーの', 'ニューラルの'][random4 % 10];
    const verse2jp2 = ['海を越えて', '空を飛んで', '次元を超えて', '時を駆けて', '光になって', '風になって', '波になって', '粒子になって', 'データになって', 'コードになって'][random1 % 10];
    
    const outro1 = ['永遠に', '無限に', '果てしなく', 'どこまでも', 'いつまでも', '変わらずに', '色褪せずに', '輝き続けて', '響き続けて', '生き続けて'][random2 % 10];
    const outro2 = ['この場所で', 'この時間で', 'この空間で', 'この次元で', 'この世界で', 'この宇宙で', 'この現実で', 'この夢で', 'この愛で', 'この歌で'][random3 % 10];
    
    // 歌詞構造のバリエーション
    const lyricsJP = `[Intro]
${jpSetting}に${themeBase}の音が流れる

[Verse 1]
${jpSetting}で${jpAction}
${jpEmotion}が胸を締め付ける
${themeBase}が心に響いて
新しい世界が${['始まる', '開かれる', '広がる', '生まれる', '目覚める'][random1 % 5]}

[Pre-Chorus]
${verse2jp1}${verse2jp2}
君の${['声', '姿', '笑顔', '温もり', '記憶'][random2 % 5]}を${['探してる', '追いかける', '求めてる', '呼んでる', '待ってる'][random3 % 5]}

[Chorus]
${themeBase}が${jpChorusWord}夜に
${['君と僕の', '二人だけの', '私たちの', '運命の', '奇跡の'][random4 % 5]}物語を${['描こう', '紡ごう', '創ろう', '歌おう', '刻もう'][random1 % 5]}
${mood}な${['絆', '想い', '愛', '夢', '希望'][random2 % 5]}で${['結ばれて', '繋がって', '包まれて', '満たされて', '輝いて'][random3 % 5]}
${['未来', '明日', '永遠', '無限', '新世界'][random4 % 5]}への扉を${['開こう', '越えよう', '進もう', '飛び立とう', '駆け抜けよう'][random1 % 5]}

[Verse 2]
${['時を超えた', '次元を越えた', '空間を超えた', '距離を越えた', '限界を超えた'][random2 % 5]}想いが
${['コード', 'メロディー', 'リズム', 'ハーモニー', 'シンフォニー'][random3 % 5]}となって${['流れてく', '響いてく', '伝わってく', '広がってく', '続いてく'][random4 % 5]}
${['バーチャル', 'デジタル', 'リアル', 'アナログ', 'ハイブリッド'][random1 % 5]}でも${['本物の', '確かな', '真実の', '純粋な', '永遠の'][random2 % 5]}
${['愛', '絆', '心', '魂', '感情'][random3 % 5]}が${['ここにある', '生きている', '脈打ってる', '輝いてる', '存在する'][random4 % 5]}

[Pre-Chorus 2]
${jpEmotion}が${['溢れて', '高まって', '深まって', '強まって', '募って'][random1 % 5]}
${['もう', 'きっと', 'やっと', 'ついに', 'とうとう'][random2 % 5]}${['止められない', '戻れない', '逃げられない', '忘れられない', '離れられない'][random3 % 5]}

[Chorus]
${themeBase}が${jpChorusWord}夜に
${['君と僕の', '二人だけの', '私たちの', '運命の', '奇跡の'][random4 % 5]}物語を${['描こう', '紡ごう', '創ろう', '歌おう', '刻もう'][random1 % 5]}
${mood}な${['絆', '想い', '愛', '夢', '希望'][random2 % 5]}で${['結ばれて', '繋がって', '包まれて', '満たされて', '輝いて'][random3 % 5]}
${['未来', '明日', '永遠', '無限', '新世界'][random4 % 5]}への扉を${['開こう', '越えよう', '進もう', '飛び立とう', '駆け抜けよう'][random1 % 5]}

[Bridge]
${bridge1}${bridge2}${bridge3}
${['君への', '愛する', '大切な', '忘れない', '変わらない'][random4 % 5]}${['想い', '気持ち', '愛情', '記憶', '約束'][random1 % 5]}は${['消えない', '褪せない', '変わらない', '永遠だ', '不滅だ'][random2 % 5]}
${jpEmotion}が
${outro1}${['響き続ける', '輝き続ける', '生き続ける', '流れ続ける', '繋がり続ける'][random3 % 5]}
${themeBase}は
${outro2}

[Outro]
Forever and beyond
${['君と共に', '愛と共に', '夢と共に', '希望と共に', '永遠に'][random4 % 5]}`;
    
    const lyricsEN = `[Intro]
${enVisual} illuminate the ${enSetting}

[Verse 1]
${enDiscovery} in the ${enSetting} tonight
${enVisual} paint the ${colorScheme} ${['sky', 'space', 'void', 'realm', 'dimension'][random1 % 5]}
Your ${enFeel} ${['calling out', 'reaching out', 'singing out', 'crying out', 'breaking through'][random2 % 5]} to me
In this ${atmosphere} ${['symphony', 'harmony', 'melody', 'rhapsody', 'orchestra'][random3 % 5]}

[Pre-Chorus]
Through the ${['digital', 'virtual', 'quantum', 'cyber', 'neural'][random4 % 5]} ${['maze', 'haze', 'phase', 'wave', 'space'][random1 % 5]}
I can ${['see', 'feel', 'hear', 'sense', 'find'][random2 % 5]} your ${['face', 'grace', 'trace', 'embrace', 'place'][random3 % 5]}

[Chorus]
${themeBase} ${mood} and ${['free', 'wild', 'pure', 'true', 'real'][random4 % 5]}
${['Dancing', 'Flying', 'Soaring', 'Floating', 'Gliding'][random1 % 5]} through ${['eternity', 'infinity', 'destiny', 'reality', 'divinity'][random2 % 5]}
With ${genre} in our ${['hearts', 'souls', 'minds', 'dreams', 'lives'][random3 % 5]}
We'll ${['never be', 'always be', 'forever be', 'eternally be', 'infinitely be'][random4 % 5]} ${['apart', 'alone', 'afraid', 'lost', 'broken'][random1 % 5]}

[Verse 2]
${enVisual} ${['flow', 'stream', 'cascade', 'surge', 'pulse'][random2 % 5]} through the ${['digital', 'virtual', 'electric', 'synthetic', 'artificial'][random3 % 5]} ${['space', 'place', 'race', 'chase', 'embrace'][random4 % 5]}
Your ${enFeel} I ${['can't', 'won't', 'couldn't', 'shouldn't', 'wouldn't'][random1 % 5]} ${['replace', 'erase', 'displace', 'misplace', 'deface'][random2 % 5]}
In this ${['world', 'realm', 'domain', 'universe', 'dimension'][random3 % 5]} of ${['ones and zeros', 'light and shadow', 'time and space', 'love and code', 'heart and soul'][random4 % 5]}
We're the ${['ultimate', 'infinite', 'eternal', 'immortal', 'invincible'][random1 % 5]} ${['heroes', 'lovers', 'dreamers', 'believers', 'creators'][random2 % 5]}

[Pre-Chorus 2]
${['Even when', 'Even if', 'Even though', 'Even as', 'Even while'][random3 % 5]} the ${['signal', 'connection', 'link', 'bond', 'thread'][random4 % 5]} ${['fades', 'breaks', 'bends', 'shifts', 'drifts'][random1 % 5]}
Our ${['love', 'bond', 'link', 'soul', 'heart'][random2 % 5]} ${['transcends', 'ascends', 'extends', 'defends', 'amends'][random3 % 5]}

[Chorus]
${themeBase} ${mood} and ${['free', 'wild', 'pure', 'true', 'real'][random4 % 5]}
${['Dancing', 'Flying', 'Soaring', 'Floating', 'Gliding'][random1 % 5]} through ${['eternity', 'infinity', 'destiny', 'reality', 'divinity'][random2 % 5]}
With ${genre} in our ${['hearts', 'souls', 'minds', 'dreams', 'lives'][random3 % 5]}
We'll ${['never be', 'always be', 'forever be', 'eternally be', 'infinitely be'][random4 % 5]} ${['apart', 'alone', 'afraid', 'lost', 'broken'][random1 % 5]}

[Bridge]
Sometimes the ${['signals', 'pixels', 'data', 'codes', 'waves'][random2 % 5]} ${['fade away', 'drift away', 'float away', 'wash away', 'blow away'][random3 % 5]}
But our ${['love', 'hope', 'dream', 'faith', 'trust'][random4 % 5]} is ${['here to stay', 'here to play', 'here today', 'on display', 'here always'][random1 % 5]}
${themeBase} will ${['always', 'forever', 'never', 'ever', 'eternally'][random2 % 5]} be
Our ${atmosphere} ${['destiny', 'legacy', 'memory', 'harmony', 'symphony'][random3 % 5]}

[Outro]
In this ${['endless', 'timeless', 'boundless', 'limitless', 'infinite'][random4 % 5]} ${['space', 'place', 'grace', 'embrace', 'trace'][random1 % 5]}
We'll ${['find', 'keep', 'hold', 'save', 'make'][random2 % 5]} our ${['way', 'day', 'say', 'play', 'stay'][random3 % 5]}
${['Forever', 'Together', 'Whenever', 'Wherever', 'However'][random4 % 5]} we ${['may', 'say', 'stay', 'play', 'pray'][random1 % 5]}`;
    
    // スタイルプロンプトのバリエーション
    const additionalStyles = [
        ', Female Vocals', ', Male Vocals', ', Duet', ', Vocoder', ', Auto-tuned',
        ', Orchestra', ', Acoustic', ', Electronic', ', Hybrid', ', Experimental',
        ', Ambient', ', Epic', ', Minimal', ', Maximal', ', Complex'
    ];
    
    const additionalMoods = [
        ', Building', ', Climactic', ', Atmospheric', ', Cinematic', ', Dynamic',
        ', Evolving', ', Layered', ', Textured', ', Polished', ', Raw'
    ];
    
    const stylePrompt = `${genre}, ${mood}, ${tempo}${additionalStyles[random1 % additionalStyles.length]}${additionalMoods[random2 % additionalMoods.length]}`;
    
    // Midjourneyプロンプトのバリエーション
    const additionalElements = [
        ', album cover', ', concert poster', ', single artwork', ', EP cover', ', vinyl design',
        ', CD artwork', ', digital release', ', streaming cover', ', playlist image', ', promotional art'
    ];
    
    const lightingEffects = [
        ', volumetric lighting', ', rim lighting', ', backlighting', ', soft lighting', ', dramatic lighting',
        ', neon glow', ', lens flare', ', light rays', ', god rays', ', atmospheric haze'
    ];
    
    const cameraAngles = [
        ', wide angle', ', close up', ', aerial view', ', low angle', ', dutch angle',
        ', bird\'s eye view', ', worm\'s eye view', ', profile view', ', three-quarter view', ', dynamic angle'
    ];
    
    const midjourneyPrompt = `${themeBase}, ${artStyle}, ${colorScheme}, ${atmosphere}${additionalElements[random3 % additionalElements.length]}${lightingEffects[random4 % lightingEffects.length]}${cameraAngles[random1 % cameraAngles.length]}, highly detailed, 8k resolution`;
    
    return {
        title: `${titlePrefix}${themeBase}${titleSuffix}${titleStyle}`,
        lyricsJP: lyricsJP,
        lyricsEN: lyricsEN,
        stylePrompt: stylePrompt,
        midjourneyPrompt: midjourneyPrompt
    };
}