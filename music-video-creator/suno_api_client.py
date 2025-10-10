#!/usr/bin/env python3
"""
Suno API 統合クライアント
楽曲生成、画像生成、リップシンク動画作成を1つのワークフローで処理
"""

import requests
import time
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any, List
import base64


class SunoAPIClient:
    """Suno API クライアント - 楽曲生成特化"""

    def __init__(self, api_key: str):
        """
        初期化

        Args:
            api_key: SunoAPI キー (https://sunoapi.org/api-key から取得)
        """
        self.api_key = api_key
        self.base_url = "https://api.sunoapi.org"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def generate_music(self,
                      prompt: str,
                      model: str = "v5",
                      make_instrumental: bool = False,
                      duration: int = 120,
                      callback_url: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        楽曲生成

        Args:
            prompt: 楽曲生成プロンプト（日本語対応）
            model: モデル名 (v3.5, v4, v4.5, v4.5-plus, v5)
            make_instrumental: インストゥルメンタル版を生成
            duration: 楽曲の長さ（秒）
            callback_url: コールバックURL（オプション）

        Returns:
            生成タスク情報（task_id含む）
        """
        endpoint = f"{self.base_url}/v1/music/generate"

        payload = {
            "prompt": prompt,
            "model": model,
            "make_instrumental": make_instrumental,
            "duration": duration
        }

        if callback_url:
            payload["callback_url"] = callback_url

        try:
            response = requests.post(endpoint, headers=self.headers, json=payload, timeout=30)
            response.raise_for_status()

            data = response.json()
            return data

        except requests.exceptions.RequestException as e:
            print(f"❌ 楽曲生成エラー: {str(e)}")
            return None

    def generate_lyrics(self, prompt: str) -> Optional[str]:
        """
        歌詞生成

        Args:
            prompt: 歌詞生成プロンプト

        Returns:
            生成された歌詞
        """
        endpoint = f"{self.base_url}/v1/lyrics/generate"

        payload = {"prompt": prompt}

        try:
            response = requests.post(endpoint, headers=self.headers, json=payload, timeout=30)
            response.raise_for_status()

            data = response.json()
            return data.get("lyrics", "")

        except requests.exceptions.RequestException as e:
            print(f"❌ 歌詞生成エラー: {str(e)}")
            return None

    def check_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        タスクステータス確認

        Args:
            task_id: タスクID

        Returns:
            タスク情報（status, progress, audio_url等）
        """
        endpoint = f"{self.base_url}/v1/task/{task_id}"

        try:
            response = requests.get(endpoint, headers=self.headers, timeout=10)
            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"❌ ステータス確認エラー: {str(e)}")
            return None

    def wait_for_completion(self, task_id: str, max_wait: int = 300,
                           progress_callback: Optional[callable] = None) -> Optional[str]:
        """
        楽曲生成完了まで待機

        Args:
            task_id: タスクID
            max_wait: 最大待機時間（秒）
            progress_callback: 進行状況コールバック関数

        Returns:
            音声ファイルのURL
        """
        start_time = time.time()

        while time.time() - start_time < max_wait:
            status_data = self.check_task_status(task_id)

            if not status_data:
                time.sleep(5)
                continue

            status = status_data.get("status", "unknown")
            progress = status_data.get("progress", 0)

            if progress_callback:
                progress_callback(status, progress)

            if status == "completed":
                audio_url = status_data.get("audio_url")
                return audio_url

            elif status == "failed":
                error = status_data.get("error", "Unknown error")
                print(f"❌ 生成失敗: {error}")
                return None

            time.sleep(10)

        print("❌ タイムアウト: 楽曲生成に時間がかかりすぎています")
        return None

    def download_audio(self, audio_url: str, output_path: str) -> bool:
        """
        音声ファイルのダウンロード

        Args:
            audio_url: 音声ファイルのURL
            output_path: 保存先パス

        Returns:
            ダウンロード成功フラグ
        """
        try:
            response = requests.get(audio_url, stream=True, timeout=300)
            response.raise_for_status()

            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            print(f"✅ 音声ダウンロード完了: {output_path}")
            return True

        except Exception as e:
            print(f"❌ ダウンロードエラー: {str(e)}")
            return False

    def check_credits(self) -> Optional[Dict[str, Any]]:
        """
        クレジット残高確認

        Returns:
            クレジット情報
        """
        endpoint = f"{self.base_url}/v1/account/credits"

        try:
            response = requests.get(endpoint, headers=self.headers, timeout=10)
            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as e:
            print(f"❌ クレジット確認エラー: {str(e)}")
            return None


class ImageGenerationClient:
    """画像生成クライアント (Midjourney/DALL-E/Flux対応)"""

    def __init__(self, api_key: str, provider: str = "flux"):
        """
        初期化

        Args:
            api_key: 画像生成APIキー
            provider: プロバイダー名 (midjourney, dalle, flux)
        """
        self.api_key = api_key
        self.provider = provider

        # プロバイダー別設定
        self.provider_config = {
            "flux": {
                "url": "https://api.replicate.com/v1/predictions",
                "model": "black-forest-labs/flux-1.1-pro"
            },
            "dalle": {
                "url": "https://api.openai.com/v1/images/generations",
                "model": "dall-e-3"
            },
            "midjourney": {
                "url": "https://api.thenextleg.io/v2/imagine",
                "model": "midjourney"
            }
        }

    def generate_image(self, prompt: str, width: int = 1024, height: int = 1024) -> Optional[str]:
        """
        画像生成

        Args:
            prompt: 画像生成プロンプト
            width: 幅
            height: 高さ

        Returns:
            画像URL
        """
        config = self.provider_config.get(self.provider)

        if not config:
            print(f"❌ サポートされていないプロバイダー: {self.provider}")
            return None

        # Flux/Replicate の場合
        if self.provider == "flux":
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "version": "flux-1.1-pro",
                "input": {
                    "prompt": prompt,
                    "width": width,
                    "height": height,
                    "num_outputs": 1
                }
            }

            try:
                response = requests.post(config["url"], headers=headers, json=payload, timeout=30)
                response.raise_for_status()

                data = response.json()
                prediction_id = data.get("id")

                # 生成完了まで待機
                image_url = self._wait_for_image_completion(prediction_id, headers)
                return image_url

            except Exception as e:
                print(f"❌ 画像生成エラー: {str(e)}")
                return None

        return None

    def _wait_for_image_completion(self, prediction_id: str, headers: dict, max_wait: int = 120) -> Optional[str]:
        """画像生成完了まで待機"""
        start_time = time.time()

        while time.time() - start_time < max_wait:
            try:
                response = requests.get(
                    f"https://api.replicate.com/v1/predictions/{prediction_id}",
                    headers=headers,
                    timeout=10
                )
                response.raise_for_status()

                data = response.json()
                status = data.get("status")

                if status == "succeeded":
                    output = data.get("output")
                    if isinstance(output, list) and len(output) > 0:
                        return output[0]
                    return output

                elif status == "failed":
                    print(f"❌ 画像生成失敗: {data.get('error')}")
                    return None

                time.sleep(5)

            except Exception as e:
                print(f"❌ ステータス確認エラー: {str(e)}")
                time.sleep(5)

        return None


class LipSyncAPIClient:
    """リップシンク動画生成クライアント"""

    def __init__(self, api_key: str, provider: str = "lipdub"):
        """
        初期化

        Args:
            api_key: リップシンクAPIキー
            provider: プロバイダー名 (lipdub, vozo, higgsfield)
        """
        self.api_key = api_key
        self.provider = provider

        self.provider_config = {
            'lipdub': {
                'url': 'https://api.lipdub.ai/v1/lipsync',
                'name': 'LipDub AI',
                'cost_per_sec': 0.10,
                'quality': '★★★★★'
            },
            'vozo': {
                'url': 'https://api.vozo.ai/v1/lipsync',
                'name': 'Vozo AI',
                'cost_per_sec': 0.05,
                'quality': '★★★★☆'
            },
            'higgsfield': {
                'url': 'https://api.higgsfield.ai/lipsync',
                'name': 'Higgsfield',
                'cost_per_sec': 0.0,
                'quality': '★★★☆☆'
            }
        }

    def generate_lipsync_video(self, image_path: str, audio_path: str,
                              resolution: str = "1080p",
                              enhance_face: bool = True) -> Optional[str]:
        """
        リップシンク動画生成

        Args:
            image_path: 画像ファイルパス
            audio_path: 音声ファイルパス
            resolution: 解像度
            enhance_face: 顔強化

        Returns:
            ジョブID
        """
        config = self.provider_config.get(self.provider)

        if not config:
            print(f"❌ サポートされていないプロバイダー: {self.provider}")
            return None

        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            with open(image_path, "rb") as img_file, open(audio_path, "rb") as audio_file:
                files = {
                    "image": img_file,
                    "audio": audio_file
                }
                data = {
                    "language": "ja",
                    "resolution": resolution,
                    "enhance_face": enhance_face,
                    "output_format": "mp4"
                }

                response = requests.post(
                    config['url'],
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=30
                )

                if response.status_code != 200:
                    print(f"❌ API エラー: {response.text}")
                    return None

                job_data = response.json()
                job_id = job_data.get("job_id")

                return job_id

        except Exception as e:
            print(f"❌ リクエストエラー: {str(e)}")
            return None

    def check_status(self, job_id: str, progress_callback: Optional[callable] = None) -> Optional[str]:
        """
        生成ステータス監視

        Args:
            job_id: ジョブID
            progress_callback: 進行状況コールバック

        Returns:
            動画URL
        """
        config = self.provider_config.get(self.provider)
        status_url = f"{config['url']}/{job_id}/status"
        headers = {"Authorization": f"Bearer {self.api_key}"}

        for attempt in range(60):  # 最大10分待機
            try:
                resp = requests.get(status_url, headers=headers, timeout=10)
                data = resp.json()
                status = data.get("status", "unknown")
                progress = data.get("progress", 0)

                if progress_callback:
                    progress_callback(status, progress)

                if status == "completed":
                    video_url = data.get("video_url")
                    return video_url

                elif status == "failed":
                    error_msg = data.get("error", "不明なエラー")
                    print(f"❌ 生成に失敗: {error_msg}")
                    return None

                time.sleep(10)

            except Exception as e:
                print(f"⚠️ ステータス確認エラー: {str(e)}")
                time.sleep(5)

        print("❌ タイムアウト")
        return None

    def download_video(self, video_url: str, output_path: str) -> bool:
        """動画ダウンロード"""
        try:
            response = requests.get(video_url, stream=True, timeout=300)
            response.raise_for_status()

            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            print(f"✅ 動画ダウンロード完了: {output_path}")
            return True

        except Exception as e:
            print(f"❌ ダウンロードエラー: {str(e)}")
            return False


class IntegratedMVCreator:
    """統合MV作成システム - 楽曲生成からリップシンク動画まで一括処理"""

    def __init__(self,
                 suno_api_key: str,
                 image_api_key: Optional[str] = None,
                 lipsync_api_key: Optional[str] = None,
                 image_provider: str = "flux",
                 lipsync_provider: str = "lipdub"):
        """
        初期化

        Args:
            suno_api_key: Suno APIキー
            image_api_key: 画像生成APIキー（オプション）
            lipsync_api_key: リップシンクAPIキー
            image_provider: 画像生成プロバイダー
            lipsync_provider: リップシンクプロバイダー
        """
        self.suno_client = SunoAPIClient(suno_api_key)
        self.image_client = ImageGenerationClient(image_api_key, image_provider) if image_api_key else None
        self.lipsync_client = LipSyncAPIClient(lipsync_api_key, lipsync_provider)

    def create_complete_mv(self,
                          music_prompt: str,
                          image_prompt: str,
                          output_dir: str = "output",
                          progress_callback: Optional[callable] = None) -> Optional[str]:
        """
        完全なMV作成ワークフロー

        Args:
            music_prompt: 楽曲生成プロンプト
            image_prompt: 画像生成プロンプト
            output_dir: 出力ディレクトリ
            progress_callback: 進行状況コールバック

        Returns:
            最終動画のパス
        """
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # ステップ1: 楽曲生成
        if progress_callback:
            progress_callback("音楽生成中", 0)

        print("🎵 楽曲生成を開始...")
        music_task = self.suno_client.generate_music(music_prompt)

        if not music_task:
            print("❌ 楽曲生成に失敗しました")
            return None

        task_id = music_task.get("task_id")
        audio_url = self.suno_client.wait_for_completion(task_id, progress_callback=progress_callback)

        if not audio_url:
            print("❌ 楽曲生成に失敗しました")
            return None

        # 音声ダウンロード
        audio_path = output_path / "generated_music.mp3"
        if not self.suno_client.download_audio(audio_url, str(audio_path)):
            return None

        # ステップ2: 画像生成（オプション）
        image_path = None

        if self.image_client:
            if progress_callback:
                progress_callback("画像生成中", 30)

            print("🎨 画像生成を開始...")
            image_url = self.image_client.generate_image(image_prompt)

            if image_url:
                image_path = output_path / "generated_image.png"

                # 画像ダウンロード
                response = requests.get(image_url, timeout=60)
                with open(image_path, 'wb') as f:
                    f.write(response.content)

                print(f"✅ 画像保存完了: {image_path}")

        # ステップ3: リップシンク動画生成
        if not image_path:
            print("⚠️ 画像がありません。既存の画像をアップロードしてください。")
            return str(audio_path)

        if progress_callback:
            progress_callback("リップシンク動画生成中", 60)

        print("🎬 リップシンク動画生成を開始...")
        job_id = self.lipsync_client.generate_lipsync_video(
            str(image_path),
            str(audio_path)
        )

        if not job_id:
            print("❌ リップシンク動画生成に失敗しました")
            return str(audio_path)

        video_url = self.lipsync_client.check_status(job_id, progress_callback)

        if not video_url:
            print("❌ リップシンク動画生成に失敗しました")
            return str(audio_path)

        # 動画ダウンロード
        video_path = output_path / "final_mv.mp4"
        if self.lipsync_client.download_video(video_url, str(video_path)):
            if progress_callback:
                progress_callback("完了", 100)

            print(f"✅ MV作成完了: {video_path}")
            return str(video_path)

        return None


if __name__ == "__main__":
    # テスト実行
    print("Suno API 統合クライアント - テストモード")
    print("実際の使用にはAPIキーが必要です")
