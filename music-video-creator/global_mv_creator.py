#!/usr/bin/env python3
"""
グローバルMVクリエイター
世界中に感動と勇気を届ける音楽ビデオ作成アプリ
"""

import streamlit as st
from global_music_library import GlobalMusicLibrary, PRESET_PROMPTS
from suno_api_client import IntegratedMVCreator
from pathlib import Path
import tempfile


def main():
    st.set_page_config(
        page_title="🌍 Global MV Creator - 世界に感動と勇気を",
        page_icon="🌍",
        layout="wide"
    )

    # カスタムCSS
    st.markdown("""
    <style>
    .big-title {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
    }
    .subtitle {
        text-align: center;
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .preset-card {
        padding: 1rem;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin: 0.5rem 0;
    }
    </style>
    """, unsafe_allow_html=True)

    # ヘッダー
    st.markdown('<div class="big-title">🌍 Global MV Creator</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="subtitle">世界中の人々に感動と勇気を届ける音楽ビデオを作ろう</div>',
        unsafe_allow_html=True
    )

    # サイドバー - API設定
    with st.sidebar:
        st.header("🔑 API設定")

        suno_api_key = st.text_input(
            "Suno API キー",
            type="password",
            help="https://sunoapi.org/api-key"
        )

        st.divider()

        use_ai_image = st.checkbox("AI画像生成を使用", value=False)

        image_api_key = None
        image_provider = "flux"

        if use_ai_image:
            image_provider = st.selectbox(
                "画像生成API",
                ["flux", "dalle", "midjourney"]
            )
            image_api_key = st.text_input(
                f"{image_provider.upper()} APIキー",
                type="password"
            )

        st.divider()

        lipsync_provider = st.selectbox(
            "リップシンク API",
            ["lipdub", "vozo", "higgsfield"],
            format_func=lambda x: {
                "lipdub": "LipDub AI ($0.10/秒)",
                "vozo": "Vozo AI ($0.05/秒)",
                "higgsfield": "Higgsfield (無料)"
            }[x]
        )

        lipsync_api_key = st.text_input(
            "リップシンク APIキー",
            type="password"
        )

        st.divider()

        with st.expander("📖 使い方"):
            st.markdown("""
            ### 🎯 3つの作成方法

            **1. プリセットから選択**
            - 感動と勇気のテーマを選択
            - ワンクリックで生成開始

            **2. カスタム作成**
            - ジャンル・テーマを自由に選択
            - 独自のメッセージを追加

            **3. 完全自由入力**
            - プロンプトを自由に記述
            - 最大限の創造性を発揮

            ### 🌍 対応ジャンル
            - アジア: J-POP, K-POP, C-POP, Bollywood
            - 欧米: Pop, Rock, EDM, Hip Hop
            - ラテン: Latin, Reggaeton
            - アフリカ: Afrobeat
            - その他: Classical, Gospel, Soul, Reggae
            """)

    # メインコンテンツ
    tab1, tab2, tab3 = st.tabs([
        "🎯 プリセット選択",
        "🎨 カスタム作成",
        "✍️ 自由入力"
    ])

    # タブ1: プリセット選択
    with tab1:
        st.header("🎯 感動と勇気のプリセット")
        st.write("世界中の人々に届けたいメッセージを選択してください")

        # プリセットをカテゴリ分け
        categories = {
            "💪 勇気・挑戦": ["courage_anthem", "dream_chase", "resilience_rising", "anime_hero"],
            "🌟 希望・インスピレーション": ["global_hope", "freedom_song", "bollywood_dream"],
            "❤️ 愛・平和": ["love_humanity", "peaceful_world", "unity_celebration"],
            "🎉 喜び・祝祭": ["joyful_celebration", "victory_march", "african_rhythm"],
            "🌏 文化・多様性": ["asian_spirit", "classical_triumph"]
        }

        selected_preset = None

        for category, presets in categories.items():
            with st.expander(category, expanded=True):
                cols = st.columns(2)
                for idx, preset_key in enumerate(presets):
                    if preset_key in PRESET_PROMPTS:
                        preset = PRESET_PROMPTS[preset_key]
                        with cols[idx % 2]:
                            if st.button(
                                preset['name'],
                                key=f"preset_{preset_key}",
                                use_container_width=True
                            ):
                                selected_preset = preset_key
                                st.session_state.selected_preset = preset_key
                            st.caption(preset['description'])

        if 'selected_preset' in st.session_state:
            preset = PRESET_PROMPTS[st.session_state.selected_preset]

            st.success(f"✅ 選択中: {preset['name']}")

            with st.expander("📝 プロンプトプレビュー", expanded=True):
                st.code(preset['prompt'], language="text")

            # 画像アップロード
            uploaded_image = st.file_uploader(
                "🖼️ 歌手/アーティストの画像をアップロード（オプション）",
                type=['png', 'jpg', 'jpeg']
            )

            if st.button("🚀 MVを作成", type="primary", use_container_width=True):
                create_mv(
                    suno_api_key,
                    image_api_key,
                    lipsync_api_key,
                    preset['prompt'],
                    "",  # 画像プロンプトは不要
                    image_provider,
                    lipsync_provider,
                    uploaded_image,
                    use_ai_image
                )

    # タブ2: カスタム作成
    with tab2:
        st.header("🎨 カスタムMV作成")

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("🎵 音楽設定")

            # ジャンル選択
            genre_options = {k: v['name'] for k, v in GlobalMusicLibrary.GENRES.items()}
            selected_genre = st.selectbox(
                "ジャンル",
                options=list(genre_options.keys()),
                format_func=lambda x: genre_options[x]
            )

            # ジャンル説明
            genre_info = GlobalMusicLibrary.GENRES[selected_genre]
            st.info(f"📝 {genre_info['description']}")
            st.caption(f"🎹 楽器: {', '.join(genre_info['instruments'])}")

            # テーマ選択
            theme_options = {k: v['name'] for k, v in GlobalMusicLibrary.THEMES.items()}
            selected_theme = st.selectbox(
                "テーマ",
                options=list(theme_options.keys()),
                format_func=lambda x: theme_options[x]
            )

            # テーマ説明
            theme_info = GlobalMusicLibrary.THEMES[selected_theme]
            st.info(f"🎭 ムード: {theme_info['mood']}")
            st.caption(f"🎶 テンポ: {theme_info['tempo']}")

            # ストーリー選択（オプション）
            story_options = {k: v['name'] for k, v in GlobalMusicLibrary.STORY_TEMPLATES.items()}
            story_options['none'] = "なし"

            selected_story = st.selectbox(
                "ストーリー（オプション）",
                options=['none'] + list(GlobalMusicLibrary.STORY_TEMPLATES.keys()),
                format_func=lambda x: story_options[x] if x != 'none' else "なし"
            )

            # 言語選択
            available_languages = genre_info['languages']
            language_options = {
                lang: GlobalMusicLibrary.get_language_name(lang)
                for lang in available_languages
            }

            selected_language = st.selectbox(
                "言語",
                options=available_languages,
                format_func=lambda x: language_options[x]
            )

            # カスタム詳細
            custom_details = st.text_area(
                "追加の詳細（オプション）",
                placeholder="例: powerful guitar solo, emotional bridge, message of unity",
                height=100
            )

        with col2:
            st.subheader("🖼️ 画像設定")

            if use_ai_image and image_api_key:
                image_prompt = st.text_area(
                    "画像プロンプト",
                    placeholder="例: passionate singer on stage, dramatic lighting, professional photography",
                    height=150
                )
                uploaded_image = None
            else:
                image_prompt = ""
                uploaded_image = st.file_uploader(
                    "画像をアップロード",
                    type=['png', 'jpg', 'jpeg']
                )

        # プロンプト生成
        story_key = selected_story if selected_story != 'none' else None

        generated_prompt = GlobalMusicLibrary.generate_prompt(
            selected_genre,
            selected_theme,
            story_key,
            selected_language,
            custom_details
        )

        st.divider()

        with st.expander("📝 生成されたプロンプト", expanded=True):
            st.code(generated_prompt, language="text")

        if st.button("🚀 カスタムMVを作成", type="primary", use_container_width=True):
            create_mv(
                suno_api_key,
                image_api_key,
                lipsync_api_key,
                generated_prompt,
                image_prompt,
                image_provider,
                lipsync_provider,
                uploaded_image,
                use_ai_image
            )

    # タブ3: 自由入力
    with tab3:
        st.header("✍️ 完全自由入力")

        music_prompt_free = st.text_area(
            "音楽プロンプト",
            placeholder="自由にプロンプトを記述してください...",
            height=200
        )

        col1, col2 = st.columns(2)

        with col1:
            if use_ai_image and image_api_key:
                image_prompt_free = st.text_area(
                    "画像プロンプト（AI生成）",
                    placeholder="画像生成プロンプトを記述...",
                    height=150
                )
                uploaded_image_free = None
            else:
                image_prompt_free = ""
                uploaded_image_free = st.file_uploader(
                    "画像をアップロード",
                    type=['png', 'jpg', 'jpeg'],
                    key="free_upload"
                )

        with col2:
            st.info("""
            💡 **プロンプトのヒント**

            - ジャンルを明確に指定
            - テンポとムードを記述
            - 使用楽器を指定
            - 言語を指定
            - メッセージやテーマを含める

            例:
            "Uplifting pop anthem, 120 BPM,
            guitar and piano, English vocals,
            message of hope and courage,
            professional quality"
            """)

        if st.button("🚀 自由入力MVを作成", type="primary", use_container_width=True):
            create_mv(
                suno_api_key,
                image_api_key,
                lipsync_api_key,
                music_prompt_free,
                image_prompt_free,
                image_provider,
                lipsync_provider,
                uploaded_image_free,
                use_ai_image
            )

    # フッター
    st.divider()
    st.markdown("""
    <div style="text-align: center; color: #666; padding: 2rem;">
        <p><strong>🌍 Global MV Creator</strong> - 世界中に感動と勇気を届けよう</p>
        <p>音楽は国境を越え、言葉の壁を超えて、人々の心に届きます</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
            Repository: <a href="https://github.com/Digitalian-pon/suno-mv-lipsync-project">GitHub</a>
        </p>
    </div>
    """, unsafe_allow_html=True)


def create_mv(suno_key, image_key, lipsync_key, music_prompt, image_prompt,
              image_provider, lipsync_provider, uploaded_image, use_ai):
    """MV作成処理"""

    if not suno_key:
        st.error("❌ Suno APIキーを入力してください")
        return

    if not lipsync_key:
        st.error("❌ リップシンクAPIキーを入力してください")
        return

    if not music_prompt:
        st.error("❌ 音楽プロンプトを入力してください")
        return

    if not use_ai and not uploaded_image:
        st.error("❌ 画像をアップロードするか、AI画像生成を有効にしてください")
        return

    try:
        with st.spinner("🎬 MVを作成中..."):
            # 画像の準備
            image_path = None

            if uploaded_image:
                # アップロード画像を保存
                temp_dir = Path("temp")
                temp_dir.mkdir(exist_ok=True)
                image_path = temp_dir / uploaded_image.name

                with open(image_path, "wb") as f:
                    f.write(uploaded_image.getbuffer())

                st.info(f"✅ 画像保存: {image_path.name}")

            # 統合クリエイター
            creator = IntegratedMVCreator(
                suno_api_key=suno_key,
                image_api_key=image_key if use_ai else None,
                lipsync_api_key=lipsync_key,
                image_provider=image_provider,
                lipsync_provider=lipsync_provider
            )

            # 進行状況表示
            progress_bar = st.progress(0)
            status_text = st.empty()

            def progress_callback(status, progress):
                progress_bar.progress(min(progress, 100))
                status_text.text(f"⏳ {status}: {progress}%")

            # MV作成
            output_dir = Path("output")
            output_dir.mkdir(exist_ok=True)

            if use_ai and image_key:
                # 完全自動生成
                video_path = creator.create_complete_mv(
                    music_prompt=music_prompt,
                    image_prompt=image_prompt,
                    output_dir=str(output_dir),
                    progress_callback=progress_callback
                )
            else:
                # 既存画像使用
                from suno_api_client import SunoAPIClient, LipSyncAPIClient

                # 楽曲生成
                status_text.text("🎵 楽曲生成中...")
                progress_bar.progress(10)

                suno_client = SunoAPIClient(suno_key)
                music_task = suno_client.generate_music(music_prompt)

                if not music_task:
                    st.error("❌ 楽曲生成失敗")
                    return

                task_id = music_task.get("task_id")
                progress_bar.progress(30)

                audio_url = suno_client.wait_for_completion(task_id, progress_callback)

                if not audio_url:
                    st.error("❌ 楽曲生成失敗")
                    return

                # 音声ダウンロード
                audio_path = output_dir / f"music_{task_id}.mp3"
                suno_client.download_audio(audio_url, str(audio_path))

                progress_bar.progress(60)

                # リップシンク動画
                status_text.text("🎬 リップシンク動画生成中...")

                lipsync_client = LipSyncAPIClient(lipsync_key, lipsync_provider)
                job_id = lipsync_client.generate_lipsync_video(str(image_path), str(audio_path))

                if not job_id:
                    st.error("❌ 動画生成失敗")
                    return

                video_url = lipsync_client.check_status(job_id, progress_callback)

                if not video_url:
                    st.error("❌ 動画生成失敗")
                    return

                # 動画ダウンロード
                video_path = output_dir / f"mv_{job_id}.mp4"
                lipsync_client.download_video(video_url, str(video_path))

            if video_path and Path(video_path).exists():
                progress_bar.progress(100)
                status_text.text("✅ 完了！")

                st.success("🎉 MVが完成しました！")

                # 動画プレビュー
                st.video(str(video_path))

                # ダウンロードボタン
                with open(video_path, "rb") as f:
                    st.download_button(
                        "📥 MVをダウンロード",
                        f.read(),
                        file_name=Path(video_path).name,
                        mime="video/mp4",
                        use_container_width=True
                    )

                st.balloons()
            else:
                st.error("❌ MV作成に失敗しました")

    except Exception as e:
        st.error(f"❌ エラー: {str(e)}")


if __name__ == "__main__":
    main()
