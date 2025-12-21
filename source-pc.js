/*
 * Zepto Product Sorter (PC Version) - v1.2
 * * Features:
 * - Sidebar UI with Category shortcuts
 * - "Guillotine" Logic to fix 4700BC/Rice pricing bugs
 * - Safety Switch for 0% discount items
 * - "Re-Search" logic to clear ghost items (Enter key simulation)
 * - DocumentFragment batching to prevent freeze
 * - URL Safe Bitwise Throttle (i & 63)
 */

(function () {
    // --- CONFIGURATION ---
    const CATEGORIES = ["Atta", "Rice", "Oil", "Ghee", "Dal", "Masala", "Packaged Foods", "Tea", "Coffee", "Biscuits", "Dairy", "Sweets", "Snacks", "Skincare", "Cleaning"];
    
    // --- STATE MANAGEMENT ---
    let CACHED_ITEMS = [];
    let MASTER_GRID = null;
    let SORT_MODE = "DISCOUNT"; // 'DISCOUNT' or 'PRICE'

    // --- DOM HELPERS ---
    const doc = document;
    const create = (tag) => doc.createElement(tag);
    const select = (selector) => doc.querySelector(selector);
    const selectAll = (selector) => Array.from(doc.querySelectorAll(selector));
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- STYLES ---
    const style = create("style");
    style.innerHTML = `
        .z-dock { position: fixed; z-index: 99999; background: #fff; padding: 10px; padding-top: 40px; font-family: sans-serif; border-radius: 12px; border: 1px solid #eee; top: 100px; right: 20px; width: 150px; box-shadow: 0 0 20px #00000020; transition: height 0.2s; }
        .z-list { max-height: 60vh; overflow-y: auto; padding-right: 2px; }
        .z-dock.min .z-list { display: none; }
        .z-btn { display: block; width: 100%; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 8px; margin-bottom: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #495057; text-align: left; }
        .z-btn:hover { background: #ff3269; color: #fff; }
        .z-btn.active { background: #720e9e; color: #fff; }
        .z-btn.manual { background: #f3e5f5; color: #7b1fa2; text-align: center; margin-bottom: 10px; border-bottom: 2px solid #e1bee7; }
        .z-head-btn { position: absolute; top: 8px; width: 24px; height: 24px; background: #eee; color: #333; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; cursor: pointer; font-weight: bold; }
        .z-close { right: 8px; }
        .z-min { right: 36px; }
        .z-sort-pill { position: absolute; top: 8px; left: 8px; background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 12px; cursor: pointer; display: none; z-index: 100; }
        .z-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000000d0; z-index: 99998; display: none; flex-direction: column; justify-content: center; align-items: center; color: #fff; }
    `;
    doc.head.appendChild(style);

    // --- UI CONSTRUCTION ---
    const dock = create("div");
    dock.className = "z-dock";

    const closeBtn = create("div");
    closeBtn.className = "z-head-btn z-close";
    closeBtn.innerText = "✕";
    closeBtn.onclick = () => dock.remove();
    dock.appendChild(closeBtn);

    const minBtn = create("div");
    minBtn.className = "z-head-btn z-min";
    minBtn.innerText = "−";
    minBtn.onclick = () => {
        dock.classList.toggle("min");
        minBtn.innerText = dock.classList.contains("min") ? "+" : "−";
    };
    dock.appendChild(minBtn);

    const sortPill = create("div");
    sortPill.className = "z-sort-pill";
    sortPill.innerText = "% Off ⬇";
    sortPill.onclick = () => {
        SORT_MODE = (SORT_MODE === "DISCOUNT") ? "PRICE" : "DISCOUNT";
        applySort();
    };
    dock.appendChild(sortPill);

    const loader = create("div");
    loader.className = "z-loader";
    loader.innerText = "Loading...";
    doc.body.appendChild(dock);
    doc.body.appendChild(loader);

    const updateMsg = (text) => loader.innerText = text;

    // --- CORE LOGIC ---

    const toggleTurbo = (enable) => {
        let styleTag = doc.getElementById("zt-turbo");
        if (enable) {
            if (!styleTag) {
                styleTag = create("style");
                styleTag.id = "zt-turbo";
                styleTag.innerHTML = "img{visibility:hidden!important} *{transition:none!important;animation:none!important}";
                doc.head.appendChild(styleTag);
            }
        } else if (styleTag) {
            styleTag.remove();
        }
    };

    const applySort = () => {
        if (!MASTER_GRID || !CACHED_ITEMS.length) return;

        if (SORT_MODE === "DISCOUNT") {
            CACHED_ITEMS.sort((a, b) => b.discount - a.discount);
            sortPill.innerText = "% Off ⬇";
        } else {
            CACHED_ITEMS.sort((a, b) => a.price - b.price);
            sortPill.innerText = "Price ⬆";
        }

        MASTER_GRID.innerHTML = "";
        
        // Use DocumentFragment for batch insertion (Prevents Freeze)
        const fragment = doc.createDocumentFragment();
        CACHED_ITEMS.forEach(item => fragment.appendChild(item.element));
        MASTER_GRID.appendChild(fragment);
        
        // Scroll to top of grid
        const yOffset = MASTER_GRID.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: yOffset, behavior: "auto" });
    };

    const processItems = async () => {
        updateMsg("Sorting...");
        await wait(100);

        const allPriceLinks = selectAll("a").filter(e => e.textContent.includes("₹"));
        if (!allPriceLinks.length) throw "No items found";

        // Find the main grid container by voting
        const parentVotes = new Map();
        allPriceLinks.forEach(link => {
            let parent = link.parentElement;
            for (let i = 0; i < 4; i++) {
                if (parent) {
                    parentVotes.set(parent, (parentVotes.get(parent) || 0) + 1);
                    parent = parent.parentElement;
                }
            }
        });
        
        const sortedParents = [...parentVotes.entries()].sort((a, b) => b[1] - a[1]);
        MASTER_GRID = sortedParents[0][0];

        const TAG_CLASS = "z-tag";
        let processedItems = [];

        // Determine list of items to process
        const rawItems = MASTER_GRID ? Array.from(MASTER_GRID.querySelectorAll("a")) : allPriceLinks;

        for (let i = 0; i < rawItems.length; i++) {
            // Anti-Freeze Throttle: Pause every 64 items
            // We use (i & 63) instead of % to avoid URL encoding bugs (The "iP" Error)
            if ((i & 63) === 0) await wait(0);

            const el = rawItems[i];
            const text = el.textContent.toUpperCase();
            
            // Skip utility links
            if (!text.includes("₹") || text.includes("BANNER") || text.includes("NOTIFY") || text.includes("OUT OF STOCK")) continue;

            let discount = 0;
            let finalPrice = 999999;

            // --- GUILLOTINE LOGIC ---
            // 1. Look for "OFF" pattern
            const cutIndex = el.textContent.search(/(?:₹|Rs)?\s*[\d,.]+\s*OFF/i);

            if (cutIndex > -1) {
                // 2. Chop text BEFORE the "OFF" tag to ignore Brand Names/Weights
                const cleanText = el.textContent.substring(0, cutIndex);
                
                // 3. Extract prices
                const matches = cleanText.match(/₹\s*[\d,.]+/g);
                if (matches && matches.length >= 1) {
                    const values = matches.map(x => parseFloat(x.replace(/[^0-9.]/g, ""))).sort((a, b) => b - a);
                    
                    if (values.length >= 2) {
                        const mrp = values[0];
                        const sellingPrice = values[1];
                        finalPrice = sellingPrice;
                        if (mrp > 0) discount = ((mrp - sellingPrice) / mrp * 100);
                    } else if (values.length === 1) {
                        finalPrice = values[0];
                    }
                }
            } else {
                // --- SAFETY SWITCH ---
                // No "OFF" tag found? Assume 0% discount.
                const matches = el.textContent.match(/₹\s*[\d,.]+/g);
                if (matches && matches.length >= 1) {
                    finalPrice = parseFloat(matches[0].replace(/[^0-9.]/g, ""));
                }
            }

            // Remove old tags
            const oldTag = el.querySelector("." + TAG_CLASS);
            if (oldTag) oldTag.remove();

            // Add new tag
            if (discount > 0) {
                const tag = create("div");
                tag.innerHTML = Math.round(discount) + "%<div style='font-size:9px'>OFF</div>";
                tag.className = TAG_CLASS;
                tag.style.cssText = "position:absolute;top:10px;left:10px;background:#720e9e;color:#fff;font-weight:700;font-size:13px;padding:4px 6px;text-align:center;border-radius:4px;z-index:10";
                el.style.position = "relative";
                el.appendChild(tag);
            }

            processedItems.push({ element: el, discount: discount, price: finalPrice });
        }

        if (!processedItems.length) {
            alert("No items found");
            MASTER_GRID.innerHTML = "";
        } else {
            CACHED_ITEMS = processedItems;
            SORT_MODE = "DISCOUNT";
            sortPill.style.display = "block";
            applySort();
        }
        
        toggleTurbo(false);
    };

    const runAutoScroll = async (category, btn) => {
        MASTER_GRID = null; // Reset Cache
        CACHED_ITEMS = [];

        loader.style.display = "flex";
        btn.classList.add("active");
        btn.innerText = "...";

        try {
            // Find Search Box (renamed var to 'sb' to avoid 'i' conflict)
            let sb = select('input[type="text"]');
            if (!sb) {
                const searchIcon = select('a[href*="search"]');
                if (searchIcon) {
                    searchIcon.click();
                    await wait(1500);
                    sb = select('input[type="text"]');
                }
            }
            if (!sb) throw "Search box not found";

            // Clear previous items
            selectAll("a").filter(e => e.textContent.includes("₹")).forEach(e => e.remove());
            
            updateMsg("Search: " + category);

            // React Input Hack
            const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            const enterKey = { bubbles: true, key: "Enter", keyCode: 13, which: 13 };

            // 1. Clear Input
            sb.focus();
            setNativeValue.call(sb, "");
            sb.dispatchEvent(new Event("input", { bubbles: true }));
            await wait(200);
            sb.dispatchEvent(new KeyboardEvent("keydown", enterKey));
            sb.dispatchEvent(new KeyboardEvent("keyup", enterKey));
            await wait(1000);

            // 2. Type Category
            setNativeValue.call(sb, category);
            sb.dispatchEvent(new Event("input", { bubbles: true }));
            await wait(500);
            
            // 3. Press Enter
            sb.dispatchEvent(new KeyboardEvent("keydown", enterKey));
            sb.dispatchEvent(new KeyboardEvent("keyup", enterKey));
            await wait(2500);

            // 4. Scroll Loop
            window.scrollTo(0, 0);
            toggleTurbo(true);
            updateMsg("Loading items...");

            let lastCount = 0;
            let unchangedAttempts = 0;
            
            while (unchangedAttempts < 2) {
                const items = selectAll("a").filter(e => e.textContent.includes("₹"));
                if (items.length) {
                    items[items.length - 1].scrollIntoView({ block: "start" });
                    await wait(1500);
                    window.scrollBy(0, -150);
                } else {
                    window.scrollBy(0, 500);
                }
                
                await wait(2000);
                const newCount = selectAll("a").length;
                
                if (newCount === lastCount) unchangedAttempts++;
                else {
                    lastCount = newCount;
                    unchangedAttempts = 0;
                }
            }

            await processItems();

        } catch (e) {
            toggleTurbo(false);
            alert(e);
        }

        loader.style.display = "none";
        btn.classList.remove("active");
        btn.innerText = category;
    };

    const runManualSort = async (btn) => {
        MASTER_GRID = null;
        CACHED_ITEMS = [];

        loader.style.display = "flex";
        btn.innerText = "...";
        try {
            // "RE-SEARCH" FIX: Force refresh grid if search text exists
            let sb = select('input[type="text"]');
            if (sb && sb.value.length > 0) {
                updateMsg("Refreshing...");
                sb.focus();
                const k = { bubbles: true, key: "Enter", keyCode: 13, which: 13 };
                sb.dispatchEvent(new KeyboardEvent("keydown", k));
                sb.dispatchEvent(new KeyboardEvent("keyup", k));
                await wait(1500);
            }

            toggleTurbo(true);
            // Quick Scroll
            let lastCount = 0;
            let unchangedAttempts = 0;
            while (unchangedAttempts < 2) {
                const items = selectAll("a").filter(e => e.textContent.includes("₹"));
                if (items.length) {
                    items[items.length - 1].scrollIntoView({ block: "start" });
                    await wait(1500);
                    window.scrollBy(0, -150);
                } else {
                    window.scrollBy(0, 500);
                }
                await wait(2000);
                const newCount = selectAll("a").length;
                if (newCount === lastCount) unchangedAttempts++;
                else {
                    lastCount = newCount;
                    unchangedAttempts = 0;
                }
            }
            await processItems();
        } catch (e) {
            toggleTurbo(false);
            alert(e);
        }
        loader.style.display = "none";
        btn.innerText = "⚡ Sort Page";
    };

    // --- RENDER SIDEBAR ---
    const manualBtn = create("button");
    manualBtn.className = "z-btn man";
    manualBtn.innerText = "⚡ Sort Page";
    manualBtn.onclick = () => runManualSort(manualBtn);
    dock.appendChild(manualBtn);

    const listContainer = create("div");
    listContainer.className = "z-list";
    
    CATEGORIES.forEach(cat => {
        const btn = create("button");
        btn.className = "z-btn";
        btn.innerText = cat;
        btn.onclick = () => runAutoScroll(cat, btn);
        listContainer.appendChild(btn);
    });
    
    dock.appendChild(listContainer);

})();
