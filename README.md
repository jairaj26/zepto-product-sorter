# Zepto Product Sorter

I built this tool because one of the main issues Zepto users face is finding good offers. There is no way to sort items by discount since, unlike Swiggy or BigBasket, Zepto doesn't have a default sorting option.

Zepto also removed the discount percentage tag from their interface, so it was extremely tiresome to guess or calculate how much discount a product actually had.

This is a Javascript bookmarklet that injects a sorting panel into the Zepto website to solve these problems. **Now available for both PC and Mobile!**

## 🚀 How to Install (Auto-Updating)

We use a "Loader" method. This means you only install a tiny script once. Whenever I update the code to fix bugs (like the recent 4700BC/Rice pricing issues), your bookmark updates automatically!

### 💻 For PC / Laptop (Chrome, Edge, Brave)

1.  Create a new bookmark in your browser.
2.  Name it **"Zepto PC Sort"**.
3.  In the URL field, paste this code:
    ```javascript
    javascript:(function(){var s=document.createElement('script');s.src='[https://cdn.jsdelivr.net/gh/jairaj26/zepto-product-sorter/zepto-pc.js?'+Math.random();document.body.appendChild(s](https://cdn.jsdelivr.net/gh/jairaj26/zepto-product-sorter/zepto-pc.js?'+Math.random();document.body.appendChild(s));})();
    ```
4.  Go to Zepto, search for a category (e.g., "Biscuits"), and click the bookmark!

### 📱 For Mobile (Android/iOS)

1.  Create a new bookmark in your mobile browser.
2.  Name it **"Zepto Mobile"**.
3.  In the URL/Address field, paste this code:
    ```javascript
    javascript:(function(){var s=document.createElement('script');s.src='[https://cdn.jsdelivr.net/gh/jairaj26/zepto-product-sorter/zepto-mobile.js?'+Math.random();document.body.appendChild(s](https://cdn.jsdelivr.net/gh/jairaj26/zepto-product-sorter/zepto-mobile.js?'+Math.random();document.body.appendChild(s));})();
    ```
4.  **How to run on Mobile:** * Open Zepto website.
    * Tap the Address Bar.
    * Type "Zepto Mobile" (the name of your bookmark).
    * Tap the bookmark when it appears in the suggestions.

---

## 🌟 Features

* **Sort by Discount:** Automatically reorders the product grid to show the highest "Real Discount" (Percentage Off) at the top.
* **Restores Discount Tags:** Calculates and displays the exact discount percentage (e.g., "40% OFF") on every product card.
* **Smart Price Detection:** Uses "Guillotine Logic" to strictly separate prices from brand names (fixes bugs where brand numbers like "921 Rice" or "4700BC" were confused for prices).
* **Split Controls (Mobile):** Separate buttons for Scanning and Toggling (Price Low-High vs Discount High-Low).
* **Turbo Mode:** Temporarily hides images while scrolling to prevent lag on older computers/phones.
* **Auto-Scroll:** Automatically loads all items in the category so you don't have to scroll manually.
* **Safety Switch:** Automatically detects items with 0% discount and prevents calculation errors.

## 📂 Files

* **`zepto-pc.js`**: The production code for Desktop browsers. Includes the sidebar UI and category buttons.
* **`zepto-mobile.js`**: The production code for Mobile browsers. Includes the Floating Action Button (FAB) and touch-friendly UI.
* **`source-pc.js` and `source-mobile.js`**: The un-minified, readable code (for developers who want to learn how it works).

## 🛠️ How I Built It (The Engineering Journey)

I spent about a month reverse-engineering Zepto's frontend to build this. What started as a simple "sort" script turned into a complex engineering challenge due to Zepto's dynamic architecture. Here were the main hurdles:

1.  ** The "Dirty Data" Challenge 🧹**
* Zepto's product cards are unstructured. A simple number scraper would fail miserably because:
* Brand Confusion: Brands like "24 Mantra", "921 Rice", or "4700BC" were often mistaken for prices (e.g., the script thought "4700" was the MRP, showing a 99% discount).
* Unit Noise: Weights like "500g" or "100ml" often appeared before the price.

The Solution: 
I implemented "Guillotine Logic." The script actively hunts for the "OFF" tag and physically chops the text string at that exact point. It strictly ignores any number that appears after the discount tag, instantly solving the brand name bug.

2. **Performance vs. Accuracy (The textContent War) ⚡**
* Initially, I used innerText to read prices because it ignores hidden HTML elements. However, this caused * Layout Thrashing, making the browser freeze on older phones because it forced a layout recalculation for every single item.

The Solution: 
I rewrote the core logic to use textContent (which is instant/zero-lag) but added a "Greedy Regex" cleaner to manually strip out the hidden metadata and "ghost" symbols that innerText used to handle for us. This resulted in a 10x speed boost on mobile.

3. **The Nested Grid Nightmare 🕸️**
* Unlike simple websites, Zepto uses a deeply nested V2 Grid layout where the actual product cards are buried under 10+ layers of divs. A standard selector would often grab the wrong container, breaking the sort.

The Solution: 
I built a "Voting System." The script scans all product links, traces their parents, and "votes" on which container holds the most items. The winner is identified as the Master Grid, ensuring the script works even if Zepto changes their class names.

4. **Browser Limits & 429 Errors 🛡️**
* Loading 500+ items at once would often crash the browser tab or get my IP rate-limited (HTTP 429) by Zepto's server.

The Solution:
* Turbo Mode: The script temporarily hides all images (visibility: hidden) during the scan. This frees up massive amounts of RAM and GPU, preventing crashes.
* Safe Scrolling: I implemented a human-like scroll throttle that pauses every few seconds to respect server limits.

5. **Mobile UX 📱**
* Running this on a phone was tricky because standard bookmarklets are hard to control on touchscreens.

The Solution: 
I built a custom Floating Action Button (FAB) interface. I also separated the "Scan" logic from the "Sort" logic into a split-control system, allowing users to toggle between Price Low-High and Discount High-Low instantly without reloading the page.

## ⚠️ Disclaimer

This is a personal learning project and is not affiliated with Zepto. Original concept inspired by a community script. Completely re-engineered with Turbo Mode, Safe-Scrolling, and Mobile support.