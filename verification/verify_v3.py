import os
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        mock_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="file://{os.getcwd()}/assets/immersive-theme.css">
            <style>
                body {{ background: #000; color: #fff; margin: 0; padding: 20px; }}
                #ui-layer {{ position: relative; width: 800px; height: 600px; background: #222; overflow: hidden; }}
            </style>
        </head>
        <body>
            <div id="ui-layer">
                <button class="immersive-hotspot--pill immersive-hotspot--pulse" style="left: 50%; top: 50%; position: absolute;" aria-label="Enter store">
                    <span class="immersive-hotspot-label">Enter store</span>
                </button>
            </div>
        </body>
        </html>
        """
        with open("verification/mock.html", "w") as f:
            f.write(mock_html)

        page.goto(f"file://{os.getcwd()}/verification/mock.html")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/v3_hotspot.png")

        page.hover(".immersive-hotspot--pill")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/v3_hotspot_hover.png")

        print("v3 verification screenshots captured.")
        browser.close()

if __name__ == "__main__":
    verify()
