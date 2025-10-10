#!/usr/bin/env python3
"""
Suno API統合アプリケーション起動スクリプト
"""

import sys
import subprocess
from pathlib import Path
import os


def check_dependencies():
    """依存関係の確認"""
    print("📦 依存関係を確認中...")

    try:
        import requests
        import streamlit
        print("✅ 基本パッケージがインストール済み")
        return True
    except ImportError as e:
        print(f"⚠️ 不足しているパッケージ: {e.name}")
        return False


def install_dependencies():
    """依存関係のインストール"""
    print("📦 必要なパッケージをインストール中...")

    requirements_file = Path(__file__).parent / "requirements.txt"

    if requirements_file.exists():
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ])
            print("✅ パッケージのインストールが完了しました")
            return True
        except subprocess.CalledProcessError:
            print("❌ パッケージのインストールに失敗しました")
            return False
    else:
        print("⚠️ requirements.txtが見つかりません")
        return False


def run_streamlit_app():
    """Streamlitアプリ起動"""
    print("🚀 Streamlit版を起動中...")

    script_path = Path(__file__).parent / "integrated_suno_app.py"

    if not script_path.exists():
        print("❌ integrated_suno_app.py が見つかりません")
        return False

    try:
        subprocess.run([sys.executable, "-m", "streamlit", "run", str(script_path)])
        return True
    except KeyboardInterrupt:
        print("\n👋 アプリケーションを終了しました")
        return True
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return False


def run_desktop_app():
    """デスクトップアプリ起動"""
    print("🖥️ デスクトップ版を起動中...")

    script_path = Path(__file__).parent / "suno_desktop_app.py"

    if not script_path.exists():
        print("❌ suno_desktop_app.py が見つかりません")
        return False

    try:
        subprocess.run([sys.executable, str(script_path)])
        return True
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return False


def main():
    """メイン関数"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║    🎵 Suno API 統合 MV Creator 起動ツール              ║
║    楽曲生成 → 画像生成 → リップシンク動画作成           ║
╚═══════════════════════════════════════════════════════════╝
    """)

    # 依存関係確認
    if not check_dependencies():
        print("\n依存関係をインストールしますか？ (y/n): ", end="")
        choice = input().strip().lower()

        if choice == 'y':
            if not install_dependencies():
                print("❌ セットアップに失敗しました")
                sys.exit(1)
        else:
            print("❌ 依存関係が不足しています")
            sys.exit(1)

    # 起動モード選択
    print("\n起動モードを選択してください:")
    print("1. Streamlit Web版（推奨）")
    print("2. デスクトップ版（tkinter）")
    print("3. 終了")

    print("\n選択 (1-3): ", end="")
    choice = input().strip()

    if choice == "1":
        run_streamlit_app()
    elif choice == "2":
        run_desktop_app()
    elif choice == "3":
        print("👋 終了します")
        sys.exit(0)
    else:
        print("❌ 無効な選択です")
        sys.exit(1)


if __name__ == "__main__":
    main()
