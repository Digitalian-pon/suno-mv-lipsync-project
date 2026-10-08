# 🎼 Style AI Creator（第1段階：あなたのスタイルAI）

自分で書いてきたスタイル指定（`suno_styles.xlsx`）を読み込み、その傾向をもとに、
Claude / Gemini で「あなたらしい新曲のスタイル＋歌詞」を生成するツールです。

自分で書いたスタイル（プロンプト）だけを使い、Sunoの音源や出力は一切使いません。

## 全体の計画

| 段階 | 内容 | 状態 |
|---|---|---|
| 第1段階 | スタイル（文章）から、好みに合ったプロンプトと歌詞を生成 | ✅ このツール |
| 第2段階 | 生成したプロンプトと歌詞で、オープンソースの音楽AI（ACE-Step）に曲を作らせる | これから |
| 第3段階 | 気に入った曲だけで LoRA 学習し、「あなたの音」に育てる | これから |

## 使い方

1. サーバーを起動: `npm run pm2:start`（または `npm start`）
2. ブラウザで開く
   - Android: `termux-open http://localhost:3000/style-ai-creator.html`
   - PC: `http://<AndroidのIP>:3000/style-ai-creator.html`
   - AI完全生成版の画面上部のリンクからも開けます
3. **1. API設定**: Claude または Gemini のAPIキーを入れて保存（AI完全生成版と同じキーを共有します）
4. **2. スタイルライブラリ**: Googleドライブの `suno_styles.xlsx` を選択
   - 「スタイル」「言語」「曲名」「状態」の列を自動で見つけ、英語タグに整理します
   - 「整理結果をCSVで保存」で、元のスタイル → 英語タグの対応をExcelで確認できます
   - 「英語タグに変換できなかった日本語」に出た語は、`style-normalizer.js` の `JA_DICT` に追加すると変換されます
5. **3. 生成設定**: 言語・曲数・見本の選び方・テーマを決めて「生成」
6. **4. 生成結果**: 気に入った曲に ⭐ を付け、「⭐をACE-Step用JSONで保存」で第2段階用に書き出します

## データの扱い

- 読み込んだスタイルと生成結果は、**その端末のブラウザ（localStorage）にだけ**保存されます
- AIに送るのは、集計した傾向と、ランダムに選んだ見本（15〜50件）だけです
- `.gitignore` で `*.xlsx` / 音源 / 書き出しファイルをリポジトリに含めないようにしています

## 歌詞について

`suno_styles.xlsx` には歌詞の列がないため、今はスタイルだけを見本にして、歌詞はAIが新しく作ります。
**ご自身で書いた歌詞**があれば、Excelに「歌詞」列を追加すると見本として使われます
（「あり」「インスト」のような短い印は歌詞として扱いません）。
Sunoに自動生成させた歌詞は「Sunoの出力」にあたる可能性があるため、入れないでください。

## ファイル

- `style-ai-creator.html` … 画面（ルートに配置）
- `style-ai/style-normalizer.js` … スタイル整理ロジック（ブラウザ / Node.js 両対応）
- `api-server.js` … `/api/claude` と `/api/gemini` で `model` と `maxTokens` を指定可能

## 書き出しJSONの形式（第2段階で使用）

```json
[
  {
    "title": "日本語タイトル",
    "title_en": "English title",
    "language": "Japanese",
    "tags": "j-pop, lo-fi, female vocals, piano, nostalgic, 92 bpm",
    "lyrics": "[verse]\n...\n[chorus]\n...",
    "bpm": 92,
    "key": "A minor",
    "style_prompt": "あなたの書き方に寄せたスタイル指定",
    "concept": "曲のテーマ",
    "favorite": true,
    "created_at": "2026-10-08T00:00:00.000Z",
    "model": "claude-haiku-4-5"
  }
]
```
