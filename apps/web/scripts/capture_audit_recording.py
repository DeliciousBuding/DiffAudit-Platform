from pathlib import Path
import os
import shutil
from playwright.sync_api import sync_playwright


def capture_recording(session_cookie: str) -> None:
    session_cookie = session_cookie.strip()
    recordings_dir = Path("public/recordings")
    recordings_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=str(recordings_dir),
            record_video_size={"width": 1280, "height": 720},
        )
        context.add_cookies(
            [
                {
                    "name": "diffaudit_session",
                    "value": session_cookie,
                    "url": "http://localhost:3000",
                }
            ]
        )
        page = context.new_page()
        page.goto("http://localhost:3000/workspace/audits", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.wait_for_selector("button:has-text('Create job')", timeout=20000)
        page.wait_for_timeout(2000)
        create_button = page.get_by_role("button", name="Create job").first
        if create_button.count() == 0:
            create_button = page.get_by_text("Create job").first
        create_button.click()
        page.wait_for_selector("role=status", timeout=20000)
        page.wait_for_timeout(3000)
        context.close()
        browser.close()

    recorded_files = sorted(recordings_dir.glob("*.webm"), key=os.path.getmtime)
    if not recorded_files:
        raise SystemExit("Playwright recording did not produce a webm file.")

    target = recordings_dir / "audits-demo.webm"
    latest = recorded_files[-1]
    if target.exists():
        target.unlink()
    shutil.move(str(latest), str(target))


if __name__ == "__main__":
    token = os.environ.get("DIFFAUDIT_SESSION")
    if not token:
        raise SystemExit("Please set DIFFAUDIT_SESSION to a valid session token.")

    capture_recording(token)
