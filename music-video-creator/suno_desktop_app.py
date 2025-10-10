#!/usr/bin/env python3
"""
Suno API統合 デスクトップアプリケーション
楽曲生成・画像生成・リップシンク動画作成をGUIで実行
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import os
import sys
import threading
from pathlib import Path
import json


class SunoIntegratedApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🎵 Suno API 統合 MV Creator")
        self.root.geometry("1100x800")
        self.root.configure(bg='#f0f0f0')

        # API設定
        self.suno_api_key = tk.StringVar()
        self.image_api_key = tk.StringVar()
        self.lipsync_api_key = tk.StringVar()

        # プロンプト
        self.music_prompt = tk.StringVar()
        self.image_prompt = tk.StringVar()

        # オプション
        self.image_provider = tk.StringVar(value="flux")
        self.lipsync_provider = tk.StringVar(value="lipdub")
        self.music_model = tk.StringVar(value="v5")
        self.music_duration = tk.IntVar(value=120)
        self.make_instrumental = tk.BooleanVar(value=False)
        self.use_ai_image = tk.BooleanVar(value=False)

        # 状態
        self.progress_var = tk.DoubleVar()
        self.status_text = tk.StringVar(value="準備完了")

        # ファイルパス
        self.uploaded_image = tk.StringVar()
        self.generated_audio = tk.StringVar()
        self.output_dir = tk.StringVar(value=str(Path.home() / "Desktop" / "suno_output"))

        self.setup_ui()

    def setup_ui(self):
        """UIセットアップ"""
        # メインフレーム
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # タイトル
        title_label = ttk.Label(
            main_frame,
            text="🎵 Suno API 統合 MV Creator",
            font=('Arial', 20, 'bold')
        )
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 10))

        subtitle_label = ttk.Label(
            main_frame,
            text="楽曲生成 → 画像生成 → リップシンク動画作成を1つのワークフローで実行",
            font=('Arial', 10)
        )
        subtitle_label.grid(row=1, column=0, columnspan=3, pady=(0, 20))

        # タブ作成
        notebook = ttk.Notebook(main_frame)
        notebook.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))

        # タブ1: API設定
        api_frame = ttk.Frame(notebook, padding="10")
        notebook.add(api_frame, text="🔑 API設定")
        self.setup_api_tab(api_frame)

        # タブ2: 楽曲生成
        music_frame = ttk.Frame(notebook, padding="10")
        notebook.add(music_frame, text="🎵 楽曲生成")
        self.setup_music_tab(music_frame)

        # タブ3: 画像設定
        image_frame = ttk.Frame(notebook, padding="10")
        notebook.add(image_frame, text="🖼️ 画像設定")
        self.setup_image_tab(image_frame)

        # タブ4: 動画作成
        video_frame = ttk.Frame(notebook, padding="10")
        notebook.add(video_frame, text="🎬 動画作成")
        self.setup_video_tab(video_frame)

        # 進行状況バー
        progress_frame = ttk.LabelFrame(main_frame, text="進行状況", padding="10")
        progress_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(10, 0))

        ttk.Progressbar(
            progress_frame,
            variable=self.progress_var,
            length=800
        ).grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 5))

        status_label = ttk.Label(progress_frame, textvariable=self.status_text)
        status_label.grid(row=1, column=0, sticky=tk.W)

        # リサイズ設定
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(2, weight=1)

    def setup_api_tab(self, parent):
        """API設定タブ"""
        # Suno API
        ttk.Label(parent, text="Suno API（楽曲生成）", font=('Arial', 12, 'bold')).grid(
            row=0, column=0, sticky=tk.W, pady=(0, 5)
        )
        ttk.Label(parent, text="APIキー:").grid(row=1, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Entry(parent, textvariable=self.suno_api_key, width=50, show="*").grid(
            row=1, column=1, sticky=(tk.W, tk.E), pady=5
        )
        ttk.Label(
            parent,
            text="https://sunoapi.org/api-key から取得",
            foreground="blue"
        ).grid(row=2, column=1, sticky=tk.W)

        # 画像生成API
        ttk.Label(parent, text="画像生成API（オプション）", font=('Arial', 12, 'bold')).grid(
            row=3, column=0, sticky=tk.W, pady=(20, 5)
        )

        ttk.Label(parent, text="プロバイダー:").grid(row=4, column=0, sticky=tk.W, padx=(20, 0))
        provider_combo = ttk.Combobox(
            parent,
            textvariable=self.image_provider,
            values=["flux", "dalle", "midjourney"],
            state="readonly",
            width=20
        )
        provider_combo.grid(row=4, column=1, sticky=tk.W, pady=5)

        ttk.Label(parent, text="APIキー:").grid(row=5, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Entry(parent, textvariable=self.image_api_key, width=50, show="*").grid(
            row=5, column=1, sticky=(tk.W, tk.E), pady=5
        )

        # リップシンクAPI
        ttk.Label(parent, text="リップシンクAPI", font=('Arial', 12, 'bold')).grid(
            row=6, column=0, sticky=tk.W, pady=(20, 5)
        )

        ttk.Label(parent, text="プロバイダー:").grid(row=7, column=0, sticky=tk.W, padx=(20, 0))
        lipsync_combo = ttk.Combobox(
            parent,
            textvariable=self.lipsync_provider,
            values=["lipdub", "vozo", "higgsfield"],
            state="readonly",
            width=20
        )
        lipsync_combo.grid(row=7, column=1, sticky=tk.W, pady=5)

        ttk.Label(parent, text="APIキー:").grid(row=8, column=0, sticky=tk.W, padx=(20, 0))
        ttk.Entry(parent, textvariable=self.lipsync_api_key, width=50, show="*").grid(
            row=8, column=1, sticky=(tk.W, tk.E), pady=5
        )

        # 設定保存/読込
        button_frame = ttk.Frame(parent)
        button_frame.grid(row=9, column=0, columnspan=2, pady=(20, 0))

        ttk.Button(button_frame, text="設定を保存", command=self.save_config).grid(
            row=0, column=0, padx=5
        )
        ttk.Button(button_frame, text="設定を読込", command=self.load_config).grid(
            row=0, column=1, padx=5
        )

    def setup_music_tab(self, parent):
        """楽曲生成タブ"""
        ttk.Label(parent, text="楽曲プロンプト（日本語対応）", font=('Arial', 11, 'bold')).grid(
            row=0, column=0, sticky=tk.W, pady=(0, 5)
        )

        music_text = scrolledtext.ScrolledText(parent, width=70, height=8, wrap=tk.WORD)
        music_text.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        music_text.insert(tk.END, "例: 明るくポップなJ-POPソング、女性ボーカル、テンポ120BPM")

        # プロンプトを変数に保存
        def update_music_prompt(event=None):
            self.music_prompt.set(music_text.get("1.0", tk.END).strip())

        music_text.bind("<KeyRelease>", update_music_prompt)

        # 設定
        settings_frame = ttk.LabelFrame(parent, text="生成設定", padding="10")
        settings_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(10, 10))

        ttk.Label(settings_frame, text="モデル:").grid(row=0, column=0, sticky=tk.W)
        ttk.Combobox(
            settings_frame,
            textvariable=self.music_model,
            values=["v5", "v4.5-plus", "v4.5", "v4", "v3.5"],
            state="readonly",
            width=15
        ).grid(row=0, column=1, sticky=tk.W, padx=(10, 0))

        ttk.Label(settings_frame, text="長さ（秒）:").grid(row=0, column=2, sticky=tk.W, padx=(20, 0))
        ttk.Spinbox(
            settings_frame,
            from_=30,
            to=480,
            increment=30,
            textvariable=self.music_duration,
            width=10
        ).grid(row=0, column=3, sticky=tk.W, padx=(10, 0))

        ttk.Checkbutton(
            settings_frame,
            text="インストゥルメンタル版",
            variable=self.make_instrumental
        ).grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=(10, 0))

        # 生成ボタン
        ttk.Button(
            parent,
            text="🎵 楽曲生成開始",
            command=self.generate_music,
            width=30
        ).grid(row=3, column=0, columnspan=2, pady=(20, 0))

    def setup_image_tab(self, parent):
        """画像設定タブ"""
        # モード選択
        ttk.Label(parent, text="画像取得方法", font=('Arial', 11, 'bold')).grid(
            row=0, column=0, sticky=tk.W, pady=(0, 10)
        )

        mode_frame = ttk.Frame(parent)
        mode_frame.grid(row=1, column=0, sticky=tk.W, pady=(0, 20))

        ttk.Radiobutton(
            mode_frame,
            text="既存の画像をアップロード",
            variable=self.use_ai_image,
            value=False
        ).grid(row=0, column=0, sticky=tk.W)

        ttk.Radiobutton(
            mode_frame,
            text="AI画像生成",
            variable=self.use_ai_image,
            value=True
        ).grid(row=1, column=0, sticky=tk.W, pady=(5, 0))

        # 画像アップロード
        upload_frame = ttk.LabelFrame(parent, text="画像アップロード", padding="10")
        upload_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        ttk.Entry(upload_frame, textvariable=self.uploaded_image, width=50).grid(
            row=0, column=0, sticky=(tk.W, tk.E)
        )
        ttk.Button(upload_frame, text="選択", command=self.select_image).grid(
            row=0, column=1, padx=(10, 0)
        )

        # AI画像生成
        ai_frame = ttk.LabelFrame(parent, text="AI画像生成", padding="10")
        ai_frame.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        ttk.Label(ai_frame, text="画像プロンプト:").grid(row=0, column=0, sticky=tk.W)

        image_text = scrolledtext.ScrolledText(ai_frame, width=60, height=6, wrap=tk.WORD)
        image_text.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(5, 10))
        image_text.insert(
            tk.END,
            "例: 美しい女性歌手、ポップスター、スタジオ照明、プロフェッショナル、高品質"
        )

        def update_image_prompt(event=None):
            self.image_prompt.set(image_text.get("1.0", tk.END).strip())

        image_text.bind("<KeyRelease>", update_image_prompt)

        ttk.Button(
            ai_frame,
            text="🎨 画像生成開始",
            command=self.generate_image,
            width=25
        ).grid(row=2, column=0)

    def setup_video_tab(self, parent):
        """動画作成タブ"""
        # 素材確認
        status_frame = ttk.LabelFrame(parent, text="素材確認", padding="10")
        status_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 20))

        self.audio_status = ttk.Label(status_frame, text="❌ 音声: 未生成", foreground="red")
        self.audio_status.grid(row=0, column=0, sticky=tk.W, pady=5)

        self.image_status = ttk.Label(status_frame, text="❌ 画像: 未設定", foreground="red")
        self.image_status.grid(row=1, column=0, sticky=tk.W, pady=5)

        # 出力設定
        output_frame = ttk.LabelFrame(parent, text="出力設定", padding="10")
        output_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 20))

        ttk.Label(output_frame, text="出力ディレクトリ:").grid(row=0, column=0, sticky=tk.W)
        ttk.Entry(output_frame, textvariable=self.output_dir, width=40).grid(
            row=1, column=0, sticky=(tk.W, tk.E), pady=5
        )
        ttk.Button(output_frame, text="選択", command=self.select_output_dir).grid(
            row=1, column=1, padx=(10, 0)
        )

        # 生成ボタン
        ttk.Button(
            parent,
            text="🚀 リップシンク動画作成",
            command=self.generate_video,
            width=30
        ).grid(row=2, column=0, pady=(20, 0))

        # 統合生成ボタン
        ttk.Button(
            parent,
            text="⚡ 全自動生成（楽曲+画像+動画）",
            command=self.full_auto_generation,
            width=30
        ).grid(row=3, column=0, pady=(10, 0))

    def select_image(self):
        """画像選択"""
        file_path = filedialog.askopenfilename(
            title="画像を選択",
            filetypes=[("画像ファイル", "*.png *.jpg *.jpeg"), ("すべて", "*.*")]
        )
        if file_path:
            self.uploaded_image.set(file_path)
            self.update_status()
            messagebox.showinfo("成功", f"画像を選択しました:\n{Path(file_path).name}")

    def select_output_dir(self):
        """出力ディレクトリ選択"""
        dir_path = filedialog.askdirectory(title="出力フォルダを選択")
        if dir_path:
            self.output_dir.set(dir_path)

    def update_status(self):
        """ステータス更新"""
        # 音声ステータス
        if self.generated_audio.get():
            self.audio_status.config(
                text=f"✅ 音声: {Path(self.generated_audio.get()).name}",
                foreground="green"
            )
        else:
            self.audio_status.config(text="❌ 音声: 未生成", foreground="red")

        # 画像ステータス
        if self.uploaded_image.get():
            self.image_status.config(
                text=f"✅ 画像: {Path(self.uploaded_image.get()).name}",
                foreground="green"
            )
        else:
            self.image_status.config(text="❌ 画像: 未設定", foreground="red")

    def generate_music(self):
        """楽曲生成"""
        if not self.suno_api_key.get():
            messagebox.showerror("エラー", "Suno APIキーを入力してください")
            return

        if not self.music_prompt.get():
            messagebox.showerror("エラー", "楽曲プロンプトを入力してください")
            return

        thread = threading.Thread(target=self.generate_music_thread)
        thread.daemon = True
        thread.start()

    def generate_music_thread(self):
        """楽曲生成スレッド"""
        try:
            from suno_api_client import SunoAPIClient

            self.status_text.set("🎵 楽曲生成中...")
            self.progress_var.set(10)

            client = SunoAPIClient(self.suno_api_key.get())
            music_task = client.generate_music(
                prompt=self.music_prompt.get(),
                model=self.music_model.get(),
                make_instrumental=self.make_instrumental.get(),
                duration=self.music_duration.get()
            )

            if not music_task:
                messagebox.showerror("エラー", "楽曲生成の開始に失敗しました")
                return

            task_id = music_task.get("task_id")
            self.progress_var.set(30)

            # 完了待機
            audio_url = client.wait_for_completion(task_id)

            if audio_url:
                self.progress_var.set(80)

                # ダウンロード
                output_dir = Path(self.output_dir.get())
                output_dir.mkdir(parents=True, exist_ok=True)
                audio_path = output_dir / f"music_{task_id}.mp3"

                if client.download_audio(audio_url, str(audio_path)):
                    self.generated_audio.set(str(audio_path))
                    self.update_status()
                    self.progress_var.set(100)
                    self.status_text.set("✅ 楽曲生成完了！")
                    messagebox.showinfo("成功", f"楽曲を生成しました:\n{audio_path}")
            else:
                messagebox.showerror("エラー", "楽曲生成に失敗しました")

        except Exception as e:
            messagebox.showerror("エラー", f"楽曲生成エラー:\n{str(e)}")
        finally:
            self.progress_var.set(0)

    def generate_image(self):
        """画像生成"""
        if not self.image_api_key.get():
            messagebox.showerror("エラー", "画像生成APIキーを入力してください")
            return

        if not self.image_prompt.get():
            messagebox.showerror("エラー", "画像プロンプトを入力してください")
            return

        thread = threading.Thread(target=self.generate_image_thread)
        thread.daemon = True
        thread.start()

    def generate_image_thread(self):
        """画像生成スレッド"""
        try:
            from suno_api_client import ImageGenerationClient
            import requests

            self.status_text.set("🎨 画像生成中...")
            self.progress_var.set(10)

            client = ImageGenerationClient(
                self.image_api_key.get(),
                self.image_provider.get()
            )

            image_url = client.generate_image(self.image_prompt.get())

            if image_url:
                self.progress_var.set(80)

                # ダウンロード
                response = requests.get(image_url, timeout=60)

                output_dir = Path(self.output_dir.get())
                output_dir.mkdir(parents=True, exist_ok=True)
                image_path = output_dir / "generated_image.png"

                with open(image_path, "wb") as f:
                    f.write(response.content)

                self.uploaded_image.set(str(image_path))
                self.update_status()
                self.progress_var.set(100)
                self.status_text.set("✅ 画像生成完了！")
                messagebox.showinfo("成功", f"画像を生成しました:\n{image_path}")
            else:
                messagebox.showerror("エラー", "画像生成に失敗しました")

        except Exception as e:
            messagebox.showerror("エラー", f"画像生成エラー:\n{str(e)}")
        finally:
            self.progress_var.set(0)

    def generate_video(self):
        """動画生成"""
        if not self.lipsync_api_key.get():
            messagebox.showerror("エラー", "リップシンクAPIキーを入力してください")
            return

        if not self.generated_audio.get():
            messagebox.showerror("エラー", "先に楽曲を生成してください")
            return

        if not self.uploaded_image.get():
            messagebox.showerror("エラー", "先に画像をアップロードまたは生成してください")
            return

        thread = threading.Thread(target=self.generate_video_thread)
        thread.daemon = True
        thread.start()

    def generate_video_thread(self):
        """動画生成スレッド"""
        try:
            from suno_api_client import LipSyncAPIClient

            self.status_text.set("🎬 リップシンク動画生成中...")
            self.progress_var.set(10)

            client = LipSyncAPIClient(
                self.lipsync_api_key.get(),
                self.lipsync_provider.get()
            )

            job_id = client.generate_lipsync_video(
                self.uploaded_image.get(),
                self.generated_audio.get()
            )

            if not job_id:
                messagebox.showerror("エラー", "動画生成の開始に失敗しました")
                return

            self.progress_var.set(30)

            # 完了待機
            video_url = client.check_status(job_id)

            if video_url:
                self.progress_var.set(80)

                # ダウンロード
                output_dir = Path(self.output_dir.get())
                output_dir.mkdir(parents=True, exist_ok=True)
                video_path = output_dir / f"mv_{job_id}.mp4"

                if client.download_video(video_url, str(video_path)):
                    self.progress_var.set(100)
                    self.status_text.set("✅ 動画生成完了！")
                    messagebox.showinfo("成功", f"動画を生成しました:\n{video_path}")
            else:
                messagebox.showerror("エラー", "動画生成に失敗しました")

        except Exception as e:
            messagebox.showerror("エラー", f"動画生成エラー:\n{str(e)}")
        finally:
            self.progress_var.set(0)

    def full_auto_generation(self):
        """全自動生成"""
        if not all([self.suno_api_key.get(), self.lipsync_api_key.get()]):
            messagebox.showerror("エラー", "必要なAPIキーを入力してください")
            return

        if not self.music_prompt.get():
            messagebox.showerror("エラー", "楽曲プロンプトを入力してください")
            return

        if not self.use_ai_image.get() and not self.uploaded_image.get():
            messagebox.showerror("エラー", "画像をアップロードするか、AI画像生成を有効にしてください")
            return

        thread = threading.Thread(target=self.full_auto_generation_thread)
        thread.daemon = True
        thread.start()

    def full_auto_generation_thread(self):
        """全自動生成スレッド"""
        try:
            from suno_api_client import IntegratedMVCreator

            self.status_text.set("⚡ 全自動生成開始...")

            creator = IntegratedMVCreator(
                suno_api_key=self.suno_api_key.get(),
                image_api_key=self.image_api_key.get() if self.use_ai_image.get() else None,
                lipsync_api_key=self.lipsync_api_key.get(),
                image_provider=self.image_provider.get(),
                lipsync_provider=self.lipsync_provider.get()
            )

            def progress_callback(status, progress):
                self.status_text.set(f"⚡ {status}")
                self.progress_var.set(progress)

            video_path = creator.create_complete_mv(
                music_prompt=self.music_prompt.get(),
                image_prompt=self.image_prompt.get() if self.use_ai_image.get() else "",
                output_dir=self.output_dir.get(),
                progress_callback=progress_callback
            )

            if video_path:
                messagebox.showinfo("成功", f"MVを作成しました:\n{video_path}")
            else:
                messagebox.showerror("エラー", "MV作成に失敗しました")

        except Exception as e:
            messagebox.showerror("エラー", f"全自動生成エラー:\n{str(e)}")
        finally:
            self.progress_var.set(0)
            self.status_text.set("準備完了")

    def save_config(self):
        """設定保存"""
        config = {
            "suno_api_key": self.suno_api_key.get(),
            "image_provider": self.image_provider.get(),
            "lipsync_provider": self.lipsync_provider.get(),
            "music_model": self.music_model.get(),
            "output_dir": self.output_dir.get()
        }

        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON", "*.json")],
            initialfile="suno_config.json"
        )

        if file_path:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)

            messagebox.showinfo("成功", "設定を保存しました")

    def load_config(self):
        """設定読込"""
        file_path = filedialog.askopenfilename(
            filetypes=[("JSON", "*.json"), ("すべて", "*.*")]
        )

        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)

                self.suno_api_key.set(config.get("suno_api_key", ""))
                self.image_provider.set(config.get("image_provider", "flux"))
                self.lipsync_provider.set(config.get("lipsync_provider", "lipdub"))
                self.music_model.set(config.get("music_model", "v5"))
                self.output_dir.set(config.get("output_dir", str(Path.home() / "Desktop" / "suno_output")))

                messagebox.showinfo("成功", "設定を読み込みました")

            except Exception as e:
                messagebox.showerror("エラー", f"設定の読み込みに失敗:\n{str(e)}")


def main():
    """メイン関数"""
    print("Suno API統合デスクトップアプリ起動中...")

    root = tk.Tk()

    # スタイル設定
    style = ttk.Style()
    try:
        style.theme_use('clam')
    except:
        style.theme_use('default')

    app = SunoIntegratedApp(root)

    print("アプリケーションが起動しました")

    root.mainloop()


if __name__ == "__main__":
    main()
