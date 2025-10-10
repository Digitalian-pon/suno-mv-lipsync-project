#!/usr/bin/env python3
"""
Suno API 統合アプリケーション
楽曲生成 → 画像生成（オプション） → リップシンク動画作成
すべてを1つのワークフローで処理
"""

import streamlit as st
import os
from pathlib import Path
import tempfile
from suno_api_client import IntegratedMVCreator, SunoAPIClient, LipSyncAPIClient


def progress_update(status: str, progress: int):
    """進行状況更新"""
    st.session_state.current_status = status
    st.session_state.current_progress = progress


def create_app():
    st.set_page_config(
        page_title="🎵 Suno API 統合 MV Creator",
        page_icon="🎵",
        layout="wide"
    )

    # セッション状態の初期化
    if 'current_status' not in st.session_state:
        st.session_state.current_status = "準備完了"
    if 'current_progress' not in st.session_state:
        st.session_state.current_progress = 0

    # ヘッダー
    st.markdown("""
    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; text-align: center; margin-bottom: 2rem;">
        <h1>🎵 Suno API 統合 MV Creator</h1>
        <p>楽曲生成 → 画像生成 → リップシンク動画作成を1つのAPIで完結</p>
    </div>
    """, unsafe_allow_html=True)

    # サイドバー - API設定
    with st.sidebar:
        st.header("🔑 API設定")

        # Suno API設定
        st.subheader("1️⃣ Suno API (楽曲生成)")
        suno_api_key = st.text_input(
            "Suno APIキー",
            type="password",
            help="https://sunoapi.org/api-key から取得"
        )

        if suno_api_key:
            # クレジット確認
            try:
                suno_client = SunoAPIClient(suno_api_key)
                credits = suno_client.check_credits()
                if credits:
                    st.success(f"✅ 残高: {credits.get('credits', 'N/A')} クレジット")
            except:
                st.warning("⚠️ クレジット確認不可")

        # 画像生成API設定
        st.subheader("2️⃣ 画像生成 (オプション)")
        use_image_generation = st.checkbox("AI画像生成を使用", value=False)

        image_api_key = None
        image_provider = "flux"

        if use_image_generation:
            image_provider = st.selectbox(
                "画像生成プロバイダー",
                ["flux", "dalle", "midjourney"]
            )

            image_api_key = st.text_input(
                f"{image_provider.upper()} APIキー",
                type="password"
            )

        # リップシンクAPI設定
        st.subheader("3️⃣ リップシンク API")
        lipsync_provider = st.selectbox(
            "リップシンクプロバイダー",
            ["lipdub", "vozo", "higgsfield"],
            format_func=lambda x: {
                "lipdub": "LipDub AI ($0.10/秒) ★★★★★",
                "vozo": "Vozo AI ($0.05/秒) ★★★★☆",
                "higgsfield": "Higgsfield (無料) ★★★☆☆"
            }[x]
        )

        lipsync_api_key = st.text_input(
            "リップシンク APIキー",
            type="password"
        )

        st.divider()

        # 使用方法
        with st.expander("📖 使用方法"):
            st.markdown("""
            ### 基本ワークフロー

            **モード1: フル自動生成**
            1. 楽曲プロンプト入力
            2. 画像プロンプト入力
            3. すべて自動生成

            **モード2: 既存素材使用**
            1. 既存の画像をアップロード
            2. 楽曲プロンプト入力
            3. 楽曲生成 + リップシンク

            **モード3: 楽曲のみ生成**
            1. 楽曲プロンプト入力
            2. Suno APIで楽曲生成のみ

            ### 必要なAPIキー
            - **Suno API**: 必須（楽曲生成）
            - **画像生成API**: オプション
            - **リップシンクAPI**: 必須（動画作成時）
            """)

    # メインコンテンツ
    tab1, tab2, tab3 = st.tabs(["🎵 楽曲生成", "🖼️ 画像設定", "🎬 動画作成"])

    # タブ1: 楽曲生成
    with tab1:
        st.header("🎵 楽曲生成設定")

        col1, col2 = st.columns([2, 1])

        with col1:
            music_prompt = st.text_area(
                "楽曲プロンプト（日本語対応）",
                placeholder="例: 明るくポップなJ-POPソング、女性ボーカル、テンポ120BPM",
                height=150,
                help="生成したい楽曲の内容を詳しく記述してください"
            )

            lyrics_prompt = st.text_area(
                "歌詞プロンプト（オプション）",
                placeholder="例: 夏の思い出、海辺の恋愛、青春をテーマにした歌詞",
                height=100,
                help="歌詞の内容を指定する場合に入力"
            )

        with col2:
            model = st.selectbox(
                "モデル",
                ["v5", "v4.5-plus", "v4.5", "v4", "v3.5"],
                help="v5が最新・最高品質"
            )

            duration = st.slider(
                "楽曲の長さ（秒）",
                min_value=30,
                max_value=480,
                value=120,
                step=30
            )

            make_instrumental = st.checkbox("インストゥルメンタル版")

        # 楽曲生成ボタン
        if st.button("🎵 楽曲生成", type="primary", use_container_width=True):
            if not suno_api_key:
                st.error("❌ Suno APIキーを入力してください")
            elif not music_prompt:
                st.error("❌ 楽曲プロンプトを入力してください")
            else:
                with st.spinner("🎵 楽曲生成中..."):
                    try:
                        suno_client = SunoAPIClient(suno_api_key)

                        # 楽曲生成
                        music_task = suno_client.generate_music(
                            prompt=music_prompt,
                            model=model,
                            make_instrumental=make_instrumental,
                            duration=duration
                        )

                        if music_task:
                            task_id = music_task.get("task_id")
                            st.success(f"✅ タスク開始: {task_id}")

                            # 進行状況バー
                            progress_bar = st.progress(0)
                            status_text = st.empty()

                            def update_progress(status, prog):
                                progress_bar.progress(min(prog, 100))
                                status_text.text(f"⏳ {status}: {prog}%")

                            # 完了待機
                            audio_url = suno_client.wait_for_completion(
                                task_id,
                                progress_callback=update_progress
                            )

                            if audio_url:
                                st.success("✅ 楽曲生成完了！")

                                # ダウンロード
                                output_dir = Path("output")
                                output_dir.mkdir(exist_ok=True)
                                audio_path = output_dir / f"music_{task_id}.mp3"

                                if suno_client.download_audio(audio_url, str(audio_path)):
                                    st.session_state.generated_audio = str(audio_path)

                                    # 音声プレーヤー
                                    st.audio(str(audio_path))

                                    # ダウンロードボタン
                                    with open(audio_path, "rb") as f:
                                        st.download_button(
                                            "📥 楽曲をダウンロード",
                                            f.read(),
                                            file_name=f"suno_music_{task_id}.mp3",
                                            mime="audio/mp3"
                                        )

                                    st.balloons()
                            else:
                                st.error("❌ 楽曲生成に失敗しました")
                        else:
                            st.error("❌ タスク開始に失敗しました")

                    except Exception as e:
                        st.error(f"❌ エラー: {str(e)}")

    # タブ2: 画像設定
    with tab2:
        st.header("🖼️ 画像設定")

        image_mode = st.radio(
            "画像取得方法",
            ["既存の画像をアップロード", "AI画像生成（要APIキー）"],
            horizontal=True
        )

        if image_mode == "既存の画像をアップロード":
            uploaded_image = st.file_uploader(
                "🖼️ 歌手画像をアップロード",
                type=['png', 'jpg', 'jpeg'],
                help="Midjourneyなどで作成した画像"
            )

            if uploaded_image:
                st.image(uploaded_image, caption="アップロードされた画像", width=400)

                # 一時保存
                temp_dir = Path("temp")
                temp_dir.mkdir(exist_ok=True)
                image_path = temp_dir / uploaded_image.name

                with open(image_path, "wb") as f:
                    f.write(uploaded_image.getbuffer())

                st.session_state.image_path = str(image_path)
                st.success(f"✅ 画像保存完了: {image_path.name}")

        else:
            if not use_image_generation or not image_api_key:
                st.warning("⚠️ サイドバーで画像生成APIを有効化し、APIキーを入力してください")
            else:
                image_prompt = st.text_area(
                    "画像生成プロンプト",
                    placeholder="例: 美しい女性歌手、ポップスター、スタジオ照明、プロフェッショナル、高品質",
                    height=100
                )

                col1, col2 = st.columns(2)
                with col1:
                    width = st.selectbox("幅", [512, 768, 1024, 1536], index=2)
                with col2:
                    height = st.selectbox("高さ", [512, 768, 1024, 1536], index=2)

                if st.button("🎨 画像生成", use_container_width=True):
                    if not image_prompt:
                        st.error("❌ 画像プロンプトを入力してください")
                    else:
                        with st.spinner("🎨 画像生成中..."):
                            try:
                                from suno_api_client import ImageGenerationClient

                                image_client = ImageGenerationClient(image_api_key, image_provider)
                                image_url = image_client.generate_image(image_prompt, width, height)

                                if image_url:
                                    st.success("✅ 画像生成完了！")
                                    st.image(image_url, caption="生成された画像", width=400)

                                    # 画像ダウンロード
                                    import requests
                                    response = requests.get(image_url, timeout=60)

                                    temp_dir = Path("temp")
                                    temp_dir.mkdir(exist_ok=True)
                                    image_path = temp_dir / "generated_image.png"

                                    with open(image_path, "wb") as f:
                                        f.write(response.content)

                                    st.session_state.image_path = str(image_path)
                                else:
                                    st.error("❌ 画像生成に失敗しました")

                            except Exception as e:
                                st.error(f"❌ エラー: {str(e)}")

    # タブ3: 動画作成
    with tab3:
        st.header("🎬 リップシンク動画作成")

        # 素材確認
        has_audio = 'generated_audio' in st.session_state
        has_image = 'image_path' in st.session_state

        col1, col2 = st.columns(2)

        with col1:
            if has_audio:
                st.success(f"✅ 音声: {Path(st.session_state.generated_audio).name}")
                st.audio(st.session_state.generated_audio)
            else:
                st.warning("⚠️ 音声未生成")

        with col2:
            if has_image:
                st.success(f"✅ 画像: {Path(st.session_state.image_path).name}")
                st.image(st.session_state.image_path, width=300)
            else:
                st.warning("⚠️ 画像未設定")

        st.divider()

        # 動画設定
        st.subheader("⚙️ 動画設定")

        col3, col4 = st.columns(2)

        with col3:
            resolution = st.selectbox("解像度", ["1080p", "720p", "4K"])
            enhance_face = st.checkbox("顔強化", value=True)

        with col4:
            output_format = st.selectbox("出力形式", ["mp4", "mov", "avi"])

        # 動画生成ボタン
        if st.button("🚀 リップシンク動画作成", type="primary", use_container_width=True):
            if not lipsync_api_key:
                st.error("❌ リップシンクAPIキーを入力してください")
            elif not has_audio:
                st.error("❌ 先に楽曲を生成してください")
            elif not has_image:
                st.error("❌ 先に画像をアップロードまたは生成してください")
            else:
                with st.spinner("🎬 リップシンク動画生成中..."):
                    try:
                        lipsync_client = LipSyncAPIClient(lipsync_api_key, lipsync_provider)

                        # リップシンク生成
                        job_id = lipsync_client.generate_lipsync_video(
                            st.session_state.image_path,
                            st.session_state.generated_audio,
                            resolution=resolution,
                            enhance_face=enhance_face
                        )

                        if job_id:
                            st.success(f"✅ ジョブ開始: {job_id}")

                            # 進行状況
                            progress_bar = st.progress(0)
                            status_text = st.empty()

                            def update_lipsync_progress(status, prog):
                                progress_bar.progress(min(prog, 100))
                                status_text.text(f"⏳ {status}: {prog}%")

                            # 完了待機
                            video_url = lipsync_client.check_status(
                                job_id,
                                progress_callback=update_lipsync_progress
                            )

                            if video_url:
                                st.success("✅ 動画生成完了！")

                                # ダウンロード
                                output_dir = Path("output")
                                output_dir.mkdir(exist_ok=True)
                                video_path = output_dir / f"mv_{job_id}.mp4"

                                if lipsync_client.download_video(video_url, str(video_path)):
                                    st.video(str(video_path))

                                    # ダウンロードボタン
                                    with open(video_path, "rb") as f:
                                        st.download_button(
                                            "📥 動画をダウンロード",
                                            f.read(),
                                            file_name=f"suno_mv_{job_id}.mp4",
                                            mime="video/mp4"
                                        )

                                    st.balloons()
                            else:
                                st.error("❌ 動画生成に失敗しました")
                        else:
                            st.error("❌ ジョブ開始に失敗しました")

                    except Exception as e:
                        st.error(f"❌ エラー: {str(e)}")

    # フッター
    st.divider()
    st.markdown("""
    <div style="text-align: center; color: #666; padding: 1rem;">
        <p>🎵 Suno API 統合 MV Creator | Powered by Suno API, LipDub/Vozo/Higgsfield</p>
        <p>Repository: <a href="https://github.com/Digitalian-pon/suno-mv-lipsync-project">GitHub</a></p>
    </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    create_app()
