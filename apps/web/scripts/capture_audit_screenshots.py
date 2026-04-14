from playwright.sync_api import sync_playwright


def capture_screenshots(session_cookie: str) -> None:
    session_cookie = session_cookie.strip()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
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
        page.screenshot(
            path="public/screenshots/audits-recommended-running.png",
            full_page=True,
        )
        create_button = page.get_by_role("button", name="Create job").first
        if create_button.count() == 0:
            create_button = page.get_by_text("Create job").first
        create_button.click()
        page.wait_for_selector("role=status", timeout=20000)
        page.wait_for_timeout(3000)
        page.screenshot(
            path="public/screenshots/audits-running-job.png",
            full_page=True,
        )
        browser.close()


if __name__ == "__main__":
    import os

    token = os.environ.get("DIFFAUDIT_SESSION")
    if not token:
        raise SystemExit("Please set DIFFAUDIT_SESSION to a valid session token.")

    capture_screenshots(token)
