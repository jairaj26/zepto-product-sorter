# Zepto Product Sorter

I built this tool because one of the main issues Zepto users face is finding good offers. There is no way to sort items by discount since, unlike Swiggy or BigBasket, Zepto doesn't have a default sorting option.

Zepto also removed the discount percentage tag from their interface, so it was extremely tiresome to guess or calculate how much discount a product actually had.

This is a Javascript bookmarklet that injects a sorting panel into the Zepto website to solve these problems.

## 🌟 Features
* **Sort by Discount:** Automatically reorders the product grid to show the highest "Real Discount" (Percentage Off) at the top.
* **Restores Discount Tags:** Calculates and displays the exact discount percentage (e.g., "40% OFF") on every product card.
* **Turbo Mode (Fast Loading):** Temporarily hides images while scrolling to prevent lag on older computers.
* **Auto-Scroll:** Automatically loads all items in the category so you don't have to scroll manually.
* **Safe Mode:** Scrolls at a human-like speed to avoid getting blocked by Zepto's server (prevents HTTP 429 errors).

## 📂 Files
1. **`source-code.js`**: The readable, formatted code. Useful for developers who want to understand the logic.
2. **`zepto-sorter.js`**: The minified bookmarklet code. Create a bookmark in your browser and paste this into the URL field to use the tool.

## 🛠️ How I built it
I spent about a month engineering this. The biggest technical challenge was handling Zepto's new V2 nested grid layout and preventing browser freeze when calculating math for hundreds of items. I solved this by implementing a "Deep Scan" DOM traversal and switching to `textContent` reading for zero-lag performance.

## ⚠️ Disclaimer
This is a personal learning project and is not affiliated with Zepto.
*Original concept inspired by a community script. Completely re-engineered with Turbo Mode, Safe-Scrolling, and a React-friendly UI.*
