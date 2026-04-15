#!/usr/bin/env python3
"""
Manual frontend testing - capture screenshots and check key flows
"""

from playwright.sync_api import sync_playwright
import sys

def main():
    print("Starting frontend manual testing...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Collect console messages
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        try:
            # Test 1: Homepage
            print("\n[1/10] Testing homepage...")
            page.goto('http://localhost:3000/', wait_until='networkidle')
            page.screenshot(path='/tmp/test_01_homepage.png', full_page=True)
            print("  Screenshot: /tmp/test_01_homepage.png")

            # Test 2: Workspace empty state
            print("\n[2/10] Testing workspace...")
            page.goto('http://localhost:3000/workspace', wait_until='networkidle')
            page.screenshot(path='/tmp/test_02_workspace.png', full_page=True)
            print("  Screenshot: /tmp/test_02_workspace.png")

            # Test 3: Audits page
            print("\n[3/10] Testing audits page...")
            page.goto('http://localhost:3000/workspace/audits', wait_until='networkidle')
            page.screenshot(path='/tmp/test_03_audits.png', full_page=True)
            print("  Screenshot: /tmp/test_03_audits.png")

            # Test 4: Create task form
            print("\n[4/10] Testing create task form...")
            page.goto('http://localhost:3000/workspace/audits/new', wait_until='networkidle')
            page.screenshot(path='/tmp/test_04_create_form.png', full_page=True)
            print("  Screenshot: /tmp/test_04_create_form.png")

            # Test 5: Mobile view
            print("\n[5/10] Testing mobile responsiveness (375px)...")
            page.set_viewport_size({'width': 375, 'height': 667})
            page.goto('http://localhost:3000/workspace', wait_until='networkidle')
            page.screenshot(path='/tmp/test_05_mobile.png', full_page=True)
            print("  Screenshot: /tmp/test_05_mobile.png")

            # Check for horizontal scroll
            scroll_width = page.evaluate('document.documentElement.scrollWidth')
            client_width = page.evaluate('document.documentElement.clientWidth')
            if scroll_width > client_width + 5:
                print(f"  WARNING: Horizontal scroll detected ({scroll_width}px > {client_width}px)")

            # Reset viewport
            page.set_viewport_size({'width': 1280, 'height': 720})

            # Test 6: Dark mode
            print("\n[6/10] Testing dark mode...")
            page.goto('http://localhost:3000/workspace', wait_until='networkidle')

            # Try to find and click theme toggle
            theme_selectors = [
                'button:has-text("Dark")',
                'button:has-text("Light")',
                '[aria-label*="theme" i]',
                '[class*="theme"]'
            ]

            theme_found = False
            for selector in theme_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        page.locator(selector).first.click()
                        page.wait_for_timeout(500)
                        theme_found = True
                        break
                except:
                    continue

            if theme_found:
                page.screenshot(path='/tmp/test_06_dark_mode.png', full_page=True)
                print("  Screenshot: /tmp/test_06_dark_mode.png")
            else:
                print("  WARNING: Theme toggle not found")

            # Test 7: Language switching
            print("\n[7/10] Testing language switching...")
            page.goto('http://localhost:3000/workspace', wait_until='networkidle')

            lang_selectors = [
                'button:has-text("English")',
                'button:has-text("中文")',
                '[class*="language"]'
            ]

            lang_found = False
            for selector in lang_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        page.locator(selector).first.click()
                        page.wait_for_timeout(500)
                        lang_found = True
                        break
                except:
                    continue

            if lang_found:
                page.screenshot(path='/tmp/test_07_language.png', full_page=True)
                print("  Screenshot: /tmp/test_07_language.png")
            else:
                print("  WARNING: Language toggle not found")

            # Test 8: Form validation
            print("\n[8/10] Testing form validation...")
            page.goto('http://localhost:3000/workspace/audits/new', wait_until='networkidle')

            # Try to find submit button
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Create")',
                'button:has-text("Submit")',
                'button:has-text("Next")'
            ]

            for selector in submit_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        page.locator(selector).first.click()
                        page.wait_for_timeout(500)
                        page.screenshot(path='/tmp/test_08_validation.png', full_page=True)
                        print("  Screenshot: /tmp/test_08_validation.png")
                        break
                except:
                    continue

            # Test 9: Long content
            print("\n[9/10] Testing long content...")
            page.goto('http://localhost:3000/workspace/audits/new', wait_until='networkidle')

            # Find first text input
            inputs = page.locator('input[type="text"], textarea')
            if inputs.count() > 0:
                long_text = "A" * 200
                inputs.first.fill(long_text)
                page.wait_for_timeout(300)
                page.screenshot(path='/tmp/test_09_long_content.png', full_page=True)
                print("  Screenshot: /tmp/test_09_long_content.png")

            # Test 10: Console errors
            print("\n[10/10] Checking console logs...")
            page.goto('http://localhost:3000/workspace', wait_until='networkidle')
            page.wait_for_timeout(2000)

            errors = [log for log in console_logs if '[error]' in log.lower()]
            warnings = [log for log in console_logs if '[warning]' in log.lower()]

            if errors:
                print(f"  ERRORS FOUND: {len(errors)}")
                for err in errors[:3]:
                    print(f"    {err}")
            else:
                print("  No console errors")

            if warnings:
                print(f"  WARNINGS FOUND: {len(warnings)}")
                for warn in warnings[:3]:
                    print(f"    {warn}")

            print("\n" + "="*80)
            print("MANUAL TESTING COMPLETE")
            print("="*80)
            print("\nScreenshots saved to /tmp/test_*.png")
            print("Review screenshots for visual issues, layout breaks, and UX problems")

        except Exception as e:
            print(f"\nERROR: {e}")
            return 1
        finally:
            context.close()
            browser.close()

    return 0

if __name__ == "__main__":
    sys.exit(main())
