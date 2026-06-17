#!/usr/bin/env python3
"""
gen-proj-codes.py —— 把 chatbox/ 项目的真实源码打包到 proj-step-N/codes.js
用法：
    python3 gen-proj-codes.py

修改下面的 STEPS 字典即可重新生成。
"""
import json
import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]              # mobile2026/
CHATBOX = REPO / "chatbox"
TUTORIAL = REPO / "vue3" / "src" / "tutorial" / "src"

# language by extension
def lang_for(p: str) -> str:
    if p.endswith(".vue"):  return "vue"
    if p.endswith(".json"): return "json"
    if p.endswith(".html"): return "html"
    if p.endswith(".css"):  return "css"
    if p.endswith(".env") or p.endswith(".env.development") or p.endswith(".env.production"): return "env"
    return "js"


# 每节展示哪些 chatbox 真实文件（按顺序）
# key: step number; value: [(display_name, relative_path_under_chatbox), ...]
STEPS = {
    1: [
        ("server/package.json",      "server/package.json"),
        ("server/server.js",         "server/server.js"),
        ("web/package.json",         "web/package.json"),
        ("web/vite.config.js",       "web/vite.config.js"),
        ("web/index.html",           "web/index.html"),
        ("web/src/main.js",          "web/src/main.js"),
        ("web/src/App.vue",          "web/src/App.vue"),
    ],
    2: [
        ("server/db.js",             "server/db.js"),
    ],
    3: [
        ("server/config.js",                 "server/config.js"),
        ("server/routes/auth.js",            "server/routes/auth.js"),
        ("server/middleware/requireAuth.js", "server/middleware/requireAuth.js"),
    ],
    4: [
        ("web/.env.development",       "web/.env.development"),
        ("web/.env.production",        "web/.env.production"),
        ("web/src/api/request.js",     "web/src/api/request.js"),
        ("web/src/api/auth.js",        "web/src/api/auth.js"),
        ("web/src/api/conversations.js","web/src/api/conversations.js"),
        ("web/src/api/messages.js",    "web/src/api/messages.js"),
        ("web/src/api/settings.js",    "web/src/api/settings.js"),
    ],
    5: [
        ("web/src/stores/auth.js",   "web/src/stores/auth.js"),
        ("web/src/router/index.js",  "web/src/router/index.js"),
        ("web/src/main.js",          "web/src/main.js"),
        ("web/src/App.vue",          "web/src/App.vue"),
    ],
    6: [
        ("web/src/views/LoginView.vue",    "web/src/views/LoginView.vue"),
        ("web/src/views/RegisterView.vue", "web/src/views/RegisterView.vue"),
        ("web/src/components/Logo.vue",    "web/src/components/Logo.vue"),
        ("web/src/assets/global.css",      "web/src/assets/global.css"),
    ],
    7: [
        ("web/src/views/ChatView.vue",                "web/src/views/ChatView.vue"),
        ("web/src/components/ConversationList.vue",   "web/src/components/ConversationList.vue"),
        ("web/src/components/MessageBubble.vue",      "web/src/components/MessageBubble.vue"),
        ("web/src/components/MessageInput.vue",       "web/src/components/MessageInput.vue"),
        ("web/src/components/UserMenu.vue",           "web/src/components/UserMenu.vue"),
        ("web/src/stores/conversations.js",           "web/src/stores/conversations.js"),
    ],
    8: [
        ("server/llm/index.js",              "server/llm/index.js"),
        ("server/llm/mock.js",               "server/llm/mock.js"),
        ("server/llm/openai.js",             "server/llm/openai.js"),
        ("server/llm/claude.js",             "server/llm/claude.js"),
        ("server/routes/messages.js",        "server/routes/messages.js"),
        ("server/routes/settings.js",        "server/routes/settings.js"),
        ("server/middleware/rateLimit.js",   "server/middleware/rateLimit.js"),
        ("web/src/views/SettingsView.vue",   "web/src/views/SettingsView.vue"),
        ("web/src/stores/settings.js",       "web/src/stores/settings.js"),
    ],
}


def main():
    for step, files in STEPS.items():
        out_dir = TUTORIAL / f"proj-step-{step}"
        out_dir.mkdir(parents=True, exist_ok=True)
        items = []
        for display, rel in files:
            full = CHATBOX / rel
            if not full.exists():
                print(f"⚠️  missing: {full}")
                continue
            content = full.read_text(encoding="utf-8")
            items.append({
                "name": display,
                "lang": lang_for(rel),
                "code": content
            })

        # 删旧的 codes.js（如果有）
        old_js = out_dir / "codes.js"
        if old_js.exists():
            old_js.unlink()

        out_path = out_dir / "codes.json"
        out_path.write_text(
            json.dumps(items, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"✓ wrote {out_path.relative_to(REPO)}  ({len(items)} files)")


if __name__ == "__main__":
    main()
