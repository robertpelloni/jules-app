from playwright.sync_api import sync_playwright, expect
import time

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        try:
            print("Navigating to home...")
            page.goto("http://localhost:3002")
            time.sleep(10) # Wait for hydration
            page.screenshot(path="verification_home.png")
            print("Home screenshot taken.")

            # Check for version number
            content = page.content()
            if "v0.4.0" in content:
                print("Version v0.4.0 found on page.")
            else:
                print("WARNING: Version v0.4.0 NOT found on page.")

            # Open New Session Dialog
            print("Opening New Session Dialog...")
            try:
                page.wait_for_selector("button:has-text('New Session')", state='visible', timeout=10000)
                page.get_by_role("button", name="New Session").click()
                time.sleep(2)
                page.screenshot(path="verification_new_session.png")
                print("New Session screenshot taken.")
                page.reload()
                time.sleep(5)
            except Exception as e:
                print(f"New Session Dialog failed: {e}")

            # Navigate to Board View
            print("Navigating to Board...")
            try:
                # Wait for board button
                page.wait_for_selector("button:has-text('Board')", state='visible', timeout=5000)
                page.get_by_role("button", name="Board").click()
                time.sleep(2)
                page.screenshot(path="verification_board.png")
                print("Board screenshot taken.")
            except Exception as e:
                print(f"Board navigation failed: {e}")

            # Navigate to System Page
            print("Navigating to System Page...")
            page.goto("http://localhost:3002/system")
            time.sleep(5)
            page.screenshot(path="verification_system.png")
            print("System screenshot taken.")

        except Exception as e:
            print(f"General Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
