#!/usr/bin/env python3
"""
Comprehensive frontend edge case testing for DiffAudit Platform
Focus: Demo-critical flows, edge cases, error states, and UX issues
"""

from playwright.sync_api import sync_playwright, Page, expect
import time
import json

class TestResults:
    def __init__(self):
        self.p0_issues = []
        self.p1_issues = []
        self.p2_issues = []
        self.passed_tests = []

    def add_issue(self, priority, test_name, description, reproduction_steps):
        issue = {
            "test": test_name,
            "description": description,
            "reproduction": reproduction_steps
        }
        if priority == "P0":
            self.p0_issues.append(issue)
        elif priority == "P1":
            self.p1_issues.append(issue)
        else:
            self.p2_issues.append(issue)

    def add_pass(self, test_name):
        self.passed_tests.append(test_name)

    def print_report(self):
        print("\n" + "="*80)
        print("FRONTEND EDGE CASE TESTING REPORT")
        print("="*80)

        print(f"\n✓ PASSED: {len(self.passed_tests)} tests")
        print(f"✗ P0 ISSUES: {len(self.p0_issues)} (must fix before demo)")
        print(f"⚠ P1 ISSUES: {len(self.p1_issues)} (should fix)")
        print(f"ℹ P2 ISSUES: {len(self.p2_issues)} (can defer)")

        if self.p0_issues:
            print("\n" + "="*80)
            print("P0 ISSUES (MUST FIX BEFORE APRIL 19 DEMO)")
            print("="*80)
            for i, issue in enumerate(self.p0_issues, 1):
                print(f"\n{i}. {issue['test']}")
                print(f"   Description: {issue['description']}")
                print(f"   Reproduction: {issue['reproduction']}")

        if self.p1_issues:
            print("\n" + "="*80)
            print("P1 ISSUES (SHOULD FIX)")
            print("="*80)
            for i, issue in enumerate(self.p1_issues, 1):
                print(f"\n{i}. {issue['test']}")
                print(f"   Description: {issue['description']}")
                print(f"   Reproduction: {issue['reproduction']}")

        if self.p2_issues:
            print("\n" + "="*80)
            print("P2 ISSUES (CAN DEFER)")
            print("="*80)
            for i, issue in enumerate(self.p2_issues, 1):
                print(f"\n{i}. {issue['test']}")
                print(f"   Description: {issue['description']}")
                print(f"   Reproduction: {issue['reproduction']}")

results = TestResults()

def test_empty_data_states(page: Page):
    """Test 1: Empty data states - new user experience"""
    print("\n[TEST] Empty data states...")

    try:
        # Navigate to workspace (assuming no auth for demo mode)
        page.goto('http://localhost:3000/workspace')
        page.wait_for_load_state('networkidle')

        # Check for empty state messaging
        content = page.content()

        # Look for empty state indicators
        if "no tasks" in content.lower() or "no audits" in content.lower() or "get started" in content.lower():
            results.add_pass("Empty state messaging present")
        else:
            results.add_issue("P0", "Empty data states",
                            "No clear empty state messaging for new users",
                            "1. Clear all data 2. Visit /workspace 3. No guidance shown")

        # Check for CTA button in empty state
        create_buttons = page.locator('text=/create|new task|start/i').all()
        if len(create_buttons) > 0:
            results.add_pass("Empty state has CTA button")
        else:
            results.add_issue("P1", "Empty state CTA",
                            "Empty state should have prominent 'Create Task' button",
                            "1. Visit /workspace with no data 2. No clear action button")

    except Exception as e:
        results.add_issue("P0", "Empty data states",
                        f"Test failed with error: {str(e)}",
                        "Unable to test empty states")

def test_loading_states(page: Page):
    """Test 2: Loading states - verify all async operations show indicators"""
    print("\n[TEST] Loading states...")

    try:
        page.goto('http://localhost:3000/workspace/audits')

        # Check for loading indicators during initial load
        # Look for skeleton loaders or loading text
        page.wait_for_timeout(100)  # Brief moment to catch loading state

        content = page.content()
        has_loading = "loading" in content.lower() or "skeleton" in content or "animate-pulse" in content

        if has_loading:
            results.add_pass("Loading indicators present")
        else:
            results.add_issue("P1", "Loading states",
                            "No visible loading indicators during data fetch",
                            "1. Visit /workspace/audits 2. No loading feedback shown")

        # Wait for content to load
        page.wait_for_load_state('networkidle')

    except Exception as e:
        results.add_issue("P1", "Loading states",
                        f"Test failed: {str(e)}",
                        "Unable to verify loading states")

def test_form_validation(page: Page):
    """Test 3: Form validation - test with invalid/edge case inputs"""
    print("\n[TEST] Form validation...")

    try:
        # Test create task form
        page.goto('http://localhost:3000/workspace/audits/new')
        page.wait_for_load_state('networkidle')

        # Try to submit empty form
        submit_buttons = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")').all()

        if len(submit_buttons) > 0:
            # Check if form has validation
            inputs = page.locator('input[required], input[type="text"], input[type="number"]').all()

            if len(inputs) > 0:
                # Try submitting without filling required fields
                submit_buttons[0].click()
                page.wait_for_timeout(500)

                # Check for validation messages
                content = page.content()
                has_validation = "required" in content.lower() or "invalid" in content.lower() or "error" in content.lower()

                if has_validation:
                    results.add_pass("Form validation present")
                else:
                    results.add_issue("P0", "Form validation",
                                    "Form allows submission without required fields",
                                    "1. Visit /workspace/audits/new 2. Click submit without filling 3. No validation shown")
            else:
                results.add_pass("No required inputs found")

    except Exception as e:
        results.add_issue("P1", "Form validation",
                        f"Test failed: {str(e)}",
                        "Unable to test form validation")

def test_mobile_responsiveness(page: Page):
    """Test 4: Mobile responsiveness - test at 375px width"""
    print("\n[TEST] Mobile responsiveness (375px)...")

    try:
        # Set mobile viewport
        page.set_viewport_size({"width": 375, "height": 667})

        # Test key pages
        pages_to_test = [
            'http://localhost:3000/',
            'http://localhost:3000/workspace',
            'http://localhost:3000/workspace/audits'
        ]

        for url in pages_to_test:
            page.goto(url)
            page.wait_for_load_state('networkidle')

            # Check for horizontal scrollbar
            scroll_width = page.evaluate('document.documentElement.scrollWidth')
            client_width = page.evaluate('document.documentElement.clientWidth')

            if scroll_width > client_width + 5:  # 5px tolerance
                results.add_issue("P1", "Mobile responsiveness",
                                f"Horizontal scroll on {url}",
                                f"1. Resize to 375px 2. Visit {url} 3. Horizontal scroll appears")
            else:
                results.add_pass(f"No horizontal scroll on {url}")

        # Reset viewport
        page.set_viewport_size({"width": 1280, "height": 720})

    except Exception as e:
        results.add_issue("P1", "Mobile responsiveness",
                        f"Test failed: {str(e)}",
                        "Unable to test mobile layout")

def test_dark_mode_consistency(page: Page):
    """Test 5: Dark mode consistency - check all interactive states"""
    print("\n[TEST] Dark mode consistency...")

    try:
        page.goto('http://localhost:3000/workspace')
        page.wait_for_load_state('networkidle')

        # Look for theme toggle
        theme_buttons = page.locator('button:has-text("theme"), button[aria-label*="theme" i], [class*="theme"]').all()

        if len(theme_buttons) > 0:
            # Try to toggle dark mode
            theme_buttons[0].click()
            page.wait_for_timeout(500)

            # Check if dark mode applied
            html_class = page.locator('html').get_attribute('class') or ''
            body_class = page.locator('body').get_attribute('class') or ''

            if 'dark' in html_class or 'dark' in body_class:
                results.add_pass("Dark mode toggle works")

                # Take screenshot for manual review
                page.screenshot(path='/tmp/dark_mode_test.png', full_page=True)
                print("   Screenshot saved: /tmp/dark_mode_test.png")
            else:
                results.add_issue("P1", "Dark mode",
                                "Dark mode toggle doesn't apply dark class",
                                "1. Click theme toggle 2. Dark mode not applied")
        else:
            results.add_issue("P2", "Dark mode",
                            "No theme toggle button found",
                            "1. Visit /workspace 2. No theme toggle visible")

    except Exception as e:
        results.add_issue("P1", "Dark mode",
                        f"Test failed: {str(e)}",
                        "Unable to test dark mode")

def test_language_switching(page: Page):
    """Test 6: Language switching - verify no layout breaks"""
    print("\n[TEST] Language switching (zh-CN <-> en-US)...")

    try:
        page.goto('http://localhost:3000/workspace')
        page.wait_for_load_state('networkidle')

        # Look for language picker
        lang_buttons = page.locator('button:has-text("English"), button:has-text("中文"), [class*="language"]').all()

        if len(lang_buttons) > 0:
            # Get initial layout
            initial_height = page.evaluate('document.documentElement.scrollHeight')

            # Click language toggle
            lang_buttons[0].click()
            page.wait_for_timeout(500)

            # Check if language changed
            content = page.content()

            # Get new layout
            new_height = page.evaluate('document.documentElement.scrollHeight')

            # Check for major layout shifts (more than 20% change)
            height_diff = abs(new_height - initial_height) / initial_height

            if height_diff > 0.2:
                results.add_issue("P1", "Language switching",
                                f"Major layout shift detected ({height_diff*100:.1f}% height change)",
                                "1. Visit /workspace 2. Switch language 3. Layout breaks")
            else:
                results.add_pass("Language switch without major layout breaks")
        else:
            results.add_issue("P2", "Language switching",
                            "No language picker found",
                            "1. Visit /workspace 2. No language toggle visible")

    except Exception as e:
        results.add_issue("P1", "Language switching",
                        f"Test failed: {str(e)}",
                        "Unable to test language switching")

def test_keyboard_navigation(page: Page):
    """Test 7: Keyboard navigation - tab through interactive elements"""
    print("\n[TEST] Keyboard navigation...")

    try:
        page.goto('http://localhost:3000/workspace')
        page.wait_for_load_state('networkidle')

        # Tab through elements
        for i in range(10):
            page.keyboard.press('Tab')
            page.wait_for_timeout(100)

            # Check if focus is visible
            focused = page.evaluate('''
                () => {
                    const el = document.activeElement;
                    if (!el || el === document.body) return null;
                    const styles = window.getComputedStyle(el);
                    return {
                        tag: el.tagName,
                        outline: styles.outline,
                        boxShadow: styles.boxShadow
                    };
                }
            ''')

            if focused and (focused['outline'] != 'none' or 'ring' in focused['boxShadow']):
                results.add_pass("Focus indicators visible")
                break
        else:
            results.add_issue("P1", "Keyboard navigation",
                            "Focus indicators not visible or missing",
                            "1. Visit /workspace 2. Press Tab 3. No visible focus ring")

    except Exception as e:
        results.add_issue("P1", "Keyboard navigation",
                        f"Test failed: {str(e)}",
                        "Unable to test keyboard navigation")

def test_long_content(page: Page):
    """Test 8: Long content - test with very long strings"""
    print("\n[TEST] Long content handling...")

    try:
        page.goto('http://localhost:3000/workspace/audits/new')
        page.wait_for_load_state('networkidle')

        # Find text inputs
        inputs = page.locator('input[type="text"], textarea').all()

        if len(inputs) > 0:
            # Test with very long string
            long_string = "A" * 500

            inputs[0].fill(long_string)
            page.wait_for_timeout(300)

            # Check if layout broke
            has_overflow = page.evaluate('''
                () => {
                    const elements = document.querySelectorAll('*');
                    for (let el of elements) {
                        if (el.scrollWidth > el.clientWidth + 10) {
                            return true;
                        }
                    }
                    return false;
                }
            ''')

            if has_overflow:
                results.add_issue("P1", "Long content",
                                "Long text causes layout overflow",
                                "1. Visit create form 2. Enter 500 char string 3. Layout breaks")
            else:
                results.add_pass("Long content handled correctly")

    except Exception as e:
        results.add_issue("P2", "Long content",
                        f"Test failed: {str(e)}",
                        "Unable to test long content")

def test_rapid_interactions(page: Page):
    """Test 9: Rapid interactions - click buttons rapidly"""
    print("\n[TEST] Rapid interactions...")

    try:
        page.goto('http://localhost:3000/workspace')
        page.wait_for_load_state('networkidle')

        # Find clickable buttons
        buttons = page.locator('button:not([disabled])').all()

        if len(buttons) > 0:
            # Rapidly click first button
            for i in range(5):
                buttons[0].click()
                page.wait_for_timeout(50)

            page.wait_for_timeout(500)

            # Check console for errors
            console_errors = []
            page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

            page.wait_for_timeout(1000)

            if console_errors:
                results.add_issue("P1", "Rapid interactions",
                                f"Console errors on rapid clicks: {console_errors[0]}",
                                "1. Visit /workspace 2. Rapidly click buttons 3. Console errors appear")
            else:
                results.add_pass("No errors on rapid interactions")

    except Exception as e:
        results.add_issue("P2", "Rapid interactions",
                        f"Test failed: {str(e)}",
                        "Unable to test rapid interactions")

def test_console_errors(page: Page):
    """Test 10: Console errors - check for warnings and errors"""
    print("\n[TEST] Console errors and warnings...")

    console_messages = []

    def handle_console(msg):
        if msg.type in ['error', 'warning']:
            console_messages.append({
                'type': msg.type,
                'text': msg.text
            })

    page.on('console', handle_console)

    try:
        # Test multiple pages
        pages_to_test = [
            'http://localhost:3000/',
            'http://localhost:3000/workspace',
            'http://localhost:3000/workspace/audits',
            'http://localhost:3000/workspace/audits/new'
        ]

        for url in pages_to_test:
            page.goto(url)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)

        # Filter out known acceptable warnings
        real_errors = [msg for msg in console_messages
                      if 'favicon' not in msg['text'].lower()
                      and 'download' not in msg['text'].lower()]

        if real_errors:
            for msg in real_errors[:3]:  # Show first 3
                results.add_issue("P0" if msg['type'] == 'error' else "P1",
                                "Console errors",
                                f"{msg['type'].upper()}: {msg['text'][:100]}",
                                f"Visit pages and check console")
        else:
            results.add_pass("No console errors or warnings")

    except Exception as e:
        results.add_issue("P1", "Console errors",
                        f"Test failed: {str(e)}",
                        "Unable to monitor console")

def main():
    print("="*80)
    print("DIFFAUDIT PLATFORM - COMPREHENSIVE EDGE CASE TESTING")
    print("Focus: Demo-critical flows for April 19, 2026")
    print("="*80)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Run all tests
        test_console_errors(page)
        test_empty_data_states(page)
        test_loading_states(page)
        test_form_validation(page)
        test_mobile_responsiveness(page)
        test_dark_mode_consistency(page)
        test_language_switching(page)
        test_keyboard_navigation(page)
        test_long_content(page)
        test_rapid_interactions(page)

        browser.close()

    # Print final report
    results.print_report()

    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80)

    # Return exit code based on P0 issues
    return 1 if results.p0_issues else 0

if __name__ == "__main__":
    exit(main())
