"""Functional checks for the static site; requires Playwright and Chromium.

Run after starting a local server:
    python tests/smoke.py --url http://127.0.0.1:8000
"""

import argparse
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(url: str, chromium: str) -> None:
    errors = []
    failed_requests = []
    checks = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=chromium, headless=True, args=["--no-sandbox"]
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000},
            accept_downloads=True,
            reduced_motion="reduce",
        )
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.on(
            "requestfailed",
            lambda request: failed_requests.append(
                f"{request.url}: {request.failure}"
            ),
        )
        page.goto(url, wait_until="networkidle")
        assert "shahbaz furniture" in page.title().lower(), "Page title has the wrong brand"
        assert "wood peeker" not in page.locator("body").inner_text().lower(), (
            "Previous brand remains in the rendered page"
        )
        font_status = page.evaluate("""async () => {
            const regular = await document.fonts.load('400 16px Nastaliq', 'آپ کا گھر');
            const semibold = await document.fonts.load('600 16px Nastaliq', 'شاہباز');
            await document.fonts.ready;
            return {
                regular: regular.length > 0 && regular.every(font => font.status === 'loaded'),
                semibold: semibold.length > 0 && semibold.every(font => font.status === 'loaded'),
                applied: getComputedStyle(document.querySelector('.hero-urdu')).fontFamily,
            };
        }""")
        assert font_status["regular"] and font_status["semibold"], (
            f"Urdu font did not load: {font_status}"
        )
        assert "Nastaliq" in font_status["applied"], "Urdu heading has the wrong font"
        checks.append("Shahbaz Furniture branding and both local Urdu font weights")
        expect(page.locator(".product-card")).to_have_count(6)

        for category, count in [
            ("interiors", 2), ("dining", 1), ("living", 1),
            ("bedroom", 1), ("office", 1), ("all", 6),
        ]:
            button = page.locator(f"#collection-filters [data-filter='{category}']")
            button.click()
            expect(page.locator(".product-card")).to_have_count(count)
            expect(button).to_have_attribute("aria-pressed", "true")
            expect(page.locator("#collection-filters [aria-pressed='true']")).to_have_count(1)
            expect(page.locator("#collection-count")).to_have_text(
                f"{count} {'piece' if count == 1 else 'pieces'}"
            )
        checks.append("collection filters and accessible active states")

        products = [
            ("gather-table", "Dastarkhwan Dining Table", "dining"),
            ("everyday-chair", "Mehfil Living Collection", "living"),
            ("haven-bed", "Sukoon Bedroom", "bedroom"),
            ("welcome-door", "Dehleez Entrance Door", "interiors"),
            ("tailored-kitchen", "Ghar Kitchen Cabinetry", "interiors"),
            ("focus-desk", "Kaam Writing Desk", "office"),
        ]
        product_dialog = page.locator("#product-dialog")
        for product_id, title, category in products:
            opener = page.locator(f".product-image-button[data-id='{product_id}']")
            opener.click()
            expect(product_dialog).to_be_visible()
            expect(page.locator("#product-dialog-title")).to_have_text(title)
            expect(page.locator("#product-dialog-features li")).to_have_count(3)
            page.wait_for_function(
                "document.querySelector('#product-dialog-image').naturalWidth > 0"
            )
            page.keyboard.press("Escape")
            expect(product_dialog).not_to_be_visible()
            expect(opener).to_be_focused()

            opener.click()
            product_dialog.locator("[data-close-dialog]").click()
            expect(product_dialog).not_to_be_visible()
            expect(opener).to_be_focused()

            opener.click()
            page.locator("#product-dialog-inquire").click()
            expect(product_dialog).not_to_be_visible()
            expect(page.locator("#inquiry-category")).to_have_value(category)
            assert title in page.locator("#inquiry-message").input_value()
            expect(page.locator("#inquiry-name")).to_be_focused()
        checks.append("all six product dialogs, Escape, close, focus return and inquiry prefill")

        expect(page.locator(".product-urdu[lang='ur'][dir='rtl']")).to_have_count(6)
        title_button = page.locator(".product-title-button").first
        title_button.click()
        expect(product_dialog).to_be_visible()
        expect(page.locator("#product-dialog-title")).to_have_text("Dastarkhwan Dining Table")
        page.keyboard.press("Escape")
        expect(title_button).to_be_focused()
        checks.append("Urdu product labels and clickable product titles")

        # Clicking outside the modal must close it, too.
        opener = page.locator(".product-image-button").first
        opener.click()
        page.mouse.click(3, 3)
        expect(product_dialog).not_to_be_visible()
        expect(opener).to_be_focused()
        checks.append("dialog backdrop dismissal")

        form = page.locator("#inquiry-form")
        form.evaluate("form => form.reset()")
        form.locator("[type='submit']").click()
        assert not form.evaluate("form => form.checkValidity()"), "Empty form accepted"
        expect(page.locator("#inquiry-dialog")).not_to_be_visible()

        wood_selected = page.locator(".wood-select").count() > 0
        if wood_selected:
            for wood in ["Sheesham", "Deodar", "Ash"]:
                wood_button = page.locator(f".wood-select[data-wood='{wood}']")
                wood_button.click()
                expect(wood_button).to_have_attribute("aria-pressed", "true")
                expect(page.locator(".wood-select[aria-pressed='true']")).to_have_count(1)
                expect(page.locator("#inquiry-wood")).to_have_value(wood)
                expect(page.locator("#wood-selection-status")).to_have_text(
                    f"Selected: {wood}. Include your preferred finish in the inquiry."
                )
            page.locator(".wood-select[data-wood='Ash']").click()
            expect(page.locator(".wood-select[aria-pressed='true']")).to_have_count(0)
            expect(page.locator("#inquiry-wood")).to_have_value("")
            page.locator(".wood-select[data-wood='Sheesham']").click()
            checks.append("optional wood selection, switching, clearing and form prefill")

        page.locator("#inquiry-name").fill('Ayesha <script>alert("test")</script>')
        page.locator("#inquiry-phone").fill("0300 1234567")
        page.locator("#inquiry-city").fill("Lahore")
        page.locator("#inquiry-category").select_option("custom")
        project_message = 'A wooden shelf, 120 cm wide. <img src=x onerror="alert(1)">'
        page.locator("#inquiry-message").fill(project_message)
        page.locator("#inquiry-phone").fill("not a number")
        assert not form.evaluate("form => form.checkValidity()"), "Invalid phone accepted"
        page.locator("#inquiry-phone").fill("0300 1234567")
        assert form.evaluate("form => form.checkValidity()"), "Valid inquiry rejected"
        submit = form.locator("[type='submit']")
        submit.click()
        expect(page.locator("#inquiry-dialog")).to_be_visible()
        summary = page.locator("#inquiry-summary")
        expect(summary).to_contain_text("SHAHBAZ FURNITURE — PROJECT INQUIRY")
        expect(summary).to_contain_text(project_message)
        expect(summary).to_contain_text('Ayesha <script>alert("test")</script>')
        expect(summary.locator("script, img")).to_have_count(0)
        if wood_selected:
            expect(summary).to_contain_text("Preferred wood: Sheesham")
        expect(page.locator("#inquiry-form-status")).to_have_text(
            "Inquiry prepared. Review it before sharing."
        )
        summary_text = summary.inner_text()
        checks.append("required-field validation and safe inquiry preview")

        context.grant_permissions(["clipboard-read", "clipboard-write"])
        page.locator("#copy-inquiry").click()
        expect(page.locator("#inquiry-action-status")).to_contain_text("Inquiry copied")
        assert page.evaluate("navigator.clipboard.readText()") == summary_text

        # Exercise the selection fallback used when Clipboard API is unavailable.
        page.evaluate(
            "Object.defineProperty(navigator, 'clipboard', {value: undefined, configurable: true})"
        )
        page.locator("#copy-inquiry").click()
        expect(page.locator("#inquiry-action-status")).to_contain_text("Inquiry copied")
        expect(page.locator("#copy-inquiry")).to_be_focused()
        with page.expect_download() as download_event:
            page.locator("#download-inquiry").click()
        download = download_event.value
        assert download.suggested_filename == "shahbaz-furniture-project-inquiry.txt"
        assert Path(download.path()).read_text(encoding="utf-8") == summary_text
        page.locator("#inquiry-dialog [data-close-dialog]").click()
        expect(page.locator("#inquiry-dialog")).not_to_be_visible()
        expect(submit).to_be_focused()
        checks.append("clipboard API, copy fallback, complete TXT download and focus return")

        # Force lazy images into view and ensure every image decodes successfully.
        for image in page.locator("main img").all():
            image.scroll_into_view_if_needed()
            expect(image).to_be_visible()
            image.evaluate("image => image.decode().catch(() => {})")
        broken_images = page.locator("img").evaluate_all(
            "images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)"
        )
        assert not broken_images, f"Images failed to load: {broken_images}"
        assert page.evaluate(
            "document.documentElement.scrollWidth <= window.innerWidth"
        ), "Desktop layout overflows horizontally"
        checks.append("all images loaded and desktop layout contained")

        # One FAQ remains open after a different FAQ is selected.
        faqs = page.locator(".faq-list details")
        faqs.nth(0).locator("summary").click()
        expect(faqs.nth(0)).to_have_attribute("open", "")
        faqs.nth(1).locator("summary").click()
        expect(faqs.nth(1)).to_have_attribute("open", "")
        expect(faqs.nth(0)).not_to_have_attribute("open", "")
        checks.append("FAQ accordion behavior")

        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("window.scrollTo(0, 0)")
        menu = page.locator("#menu-toggle")
        nav = page.locator("#site-nav")
        expect(menu).to_be_visible()
        expect(nav).not_to_be_visible()
        menu.click()
        expect(menu).to_have_attribute("aria-expanded", "true")
        expect(nav).to_be_visible()
        nav.locator("a[href='#collection']").click()
        expect(menu).to_have_attribute("aria-expanded", "false")
        expect(nav).not_to_be_visible()
        menu.click()
        page.keyboard.press("Escape")
        expect(menu).to_have_attribute("aria-expanded", "false")
        expect(nav).not_to_be_visible()
        expect(menu).to_be_focused()
        assert page.evaluate(
            "document.documentElement.scrollWidth <= window.innerWidth"
        ), "Mobile layout overflows horizontally"
        checks.append("mobile menu, anchor close, Escape and contained layout")

        page.evaluate("window.scrollTo(0, 1200)")
        expect(page.locator("#back-to-top")).to_be_visible()
        page.locator("#back-to-top").click()
        page.wait_for_function("window.scrollY === 0")
        expect(page.locator("#back-to-top")).not_to_be_visible()
        checks.append("back-to-top behavior")

        for width in [320, 360, 375, 390, 680, 768, 1024, 1440]:
            page.set_viewport_size({"width": width, "height": 900})
            layout = page.evaluate("""() => {
                const heading = document.querySelector('#hero-title');
                return {
                    pageWidth: document.documentElement.scrollWidth,
                    viewportWidth: window.innerWidth,
                    headingScrollWidth: heading.scrollWidth,
                    headingClientWidth: heading.clientWidth,
                };
            }""")
            assert layout["pageWidth"] <= layout["viewportWidth"], (
                f"Horizontal page overflow at {width}px: {layout}"
            )
            assert layout["headingScrollWidth"] <= layout["headingClientWidth"] + 1, (
                f"Hero heading clips at {width}px: {layout}"
            )
        checks.append("page and hero fit at eight widths from 320px to 1440px")

        assert not errors, f"Browser errors: {errors}"
        assert not failed_requests, f"Failed network requests: {failed_requests}"
        checks.append("zero console errors, page errors or failed requests")
        browser.close()

    for check in checks:
        print(f"PASS {check}")
    print(f"\n{len(checks)} functional groups passed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()
    run(args.url, args.chromium)
