/**
 * Zepto Product Sorter (Mobile Version) - v1
 * * Features:
 * - Floating Action Button (FAB)
 * - Separate "Toggle" button for sorting
 * - "Guillotine" Logic & Safety Switch
 * - Pure textContent optimization for speed
 */

(function () {
    // --- CONFIGURATION ---
    const doc = document;
    const create = (tag) => doc.createElement(tag);
    const append = (parent, child) => parent.appendChild(child);
    const selectAll = (selector) => Array.from(doc.querySelectorAll(selector));
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- STATE ---
    let CACHED_ITEMS = [];
    let MASTER_GRID = null;
    let SORT_MODE = "DISCOUNT";

    // --- STYLES ---
    const style = create("style");
    style.innerHTML = `
        .z-fab { position: fixed; bottom: 20px; right: 20px; background: #720e9e; color: #fff; padding: 12px 20px; border-radius: 30px; font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 99999; transition: transform 0.2s; display: flex; align-items: center; cursor: pointer; }
        .z-fab:active { transform: scale(0.95); }
        .z-x { margin-left: 10px; font-size: 18px; opacity: 0.7; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.3); }
        .z-l { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20,0,30,0.9); backdrop-filter: blur(4px); display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 99998; color: #fff; font-family: sans-serif; }
        .z-toggle { position: fixed; bottom: 80px; right: 20px; background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; padding: 8px 16px; border-radius: 20px; font-family: sans-serif; font-weight: bold; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 99999; display: none; cursor: pointer; }
    `;
    doc.head.appendChild(style);

    // --- UI ELEMENTS ---
    const fab = create("div");
    fab.className = "z-fab";
    fab.innerHTML = '<span id="z-txt">⚡ Sort</span><span class="z-x">×</span>';

    const toggleBtn = create("div");
    toggleBtn.className = "z-toggle";
    toggleBtn.textContent = "% Off ⬇";

    const loader = create("div");
    loader.className = "z-l";
    loader.innerHTML = '<h3>Processing...</h3>';

    append(doc.body, fab);
    append(doc.body, toggleBtn);
    append(doc.body, loader);

    // --- EVENT LISTENERS ---
    fab.onclick = (e) => {
        if (e.target.className === "z-x") {
            fab.remove();
            toggleBtn.remove();
            loader.remove();
            return;
        }
        startScan();
    };

    toggleBtn.onclick = () => {
        applyToggle();
    };

    // --- CORE LOGIC ---

    const toggleTurbo = (enable) => {
        let styleTag = doc.getElementById("z-turbo");
        if (enable) {
            if (!styleTag) {
                styleTag = create("style");
                styleTag.id = "z-turbo";
                styleTag.innerHTML = "img{visibility:hidden!important;} *{transition:none!important;animation:none!important;}";
                doc.head.appendChild(styleTag);
            }
        } else if (styleTag) {
            styleTag.remove();
        }
    };

    const applyToggle = () => {
        if (SORT_MODE === "DISCOUNT") {
            SORT_MODE = "PRICE";
            CACHED_ITEMS.sort((a, b) => a.price - b.price);
            toggleBtn.textContent = "Price ⬆";
            toggleBtn.style.background = "#fff3e0";
            toggleBtn.style.color = "#e65100";
        } else {
            SORT_MODE = "DISCOUNT";
            CACHED_ITEMS.sort((a, b) => b.discount - a.discount);
            toggleBtn.textContent = "% Off ⬇";
            toggleBtn.style.background = "#e3f2fd";
            toggleBtn.style.color = "#1565c0";
        }
        
        MASTER_GRID.innerHTML = "";
        CACHED_ITEMS.forEach(item => MASTER_GRID.appendChild(item.element));
        window.scrollTo(0, 0);
    };

    const activateSearch = async () => {
        const input = doc.querySelector('input[type="text"]');
        if (!input) return;
        
        input.focus();
        await wait(200);
        const keyEvent = { bubbles: true, cancelable: true, key: "Enter", code: "Enter", keyCode: 13, which: 13 };
        input.dispatchEvent(new KeyboardEvent("keydown", keyEvent));
        input.dispatchEvent(new KeyboardEvent("keyup", keyEvent));
    };

    const scrollPage = async () => {
        let lastCount = 0;
        let unchangedAttempts = 0;
        
        while (unchangedAttempts < 2) {
            const items = selectAll("a").filter(e => e.textContent.includes("₹"));
            
            if (items.length > 0) {
                items[items.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
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
    };

    const processItems = async () => {
        const allPriceLinks = selectAll("a").filter(e => e.textContent.includes("₹"));
        if (allPriceLinks.length === 0) throw new Error("No items");

        // Identify Main Grid
        const parentVotes = new Map();
        allPriceLinks.forEach(link => {
            const parent = link.parentElement;
            if (parent) parentVotes.set(parent, (parentVotes.get(parent) || 0) + 1);
            
            const grandParent = parent ? parent.parentElement : null;
            if (grandParent) parentVotes.set(grandParent, (parentVotes.get(grandParent) || 0) + 1);
        });

        const sortedVotes = [...parentVotes.entries()].sort((a, b) => b[1] - a[1]);
        const gridContainer = sortedVotes[0][0];
        const TAG_CLASS = "z-tag";

        const extractData = (el) => {
            const container = el.closest("div") || el;
            const text = container.textContent.toUpperCase();
            
            if (text.includes("NOTIFY") || text.includes("OUT OF STOCK")) return null;

            let discount = 0;
            let finalPrice = 999999;
            let mrp = 0;

            // --- SAFETY SWITCH ---
            // Only calculate discount if "OFF" exists in text
            const cutIndex = el.textContent.search(/(?:₹|Rs)?\s*[\d,.]+\s*OFF/i);

            if (cutIndex > -1) {
                // --- GUILLOTINE LOGIC ---
                // Chop text before "OFF" to ignore trailing numbers
                const cleanText = el.textContent.substring(0, cutIndex);
                const matches = cleanText.match(/₹\s*[\d,.]+/g);
                
                if (matches && matches.length >= 1) {
                    const values = matches.map(x => parseFloat(x.replace(/[^0-9.]/g, "")));
                    // Sort High to Low
                    const sortedValues = values.sort((a, b) => b - a);
                    
                    if (sortedValues.length >= 2) {
                        mrp = sortedValues[0];
                        finalPrice = sortedValues[1];
                    } else if (sortedValues.length === 1) {
                        finalPrice = sortedValues[0];
                    }
                }
            } else {
                // No "OFF" tag -> 0% Discount
                const matches = el.textContent.match(/₹\s*[\d,.]+/g);
                if (matches && matches.length >= 1) {
                    finalPrice = parseFloat(matches[0].replace(/[^0-9.]/g, ""));
                }
            }

            if (mrp > 0 && finalPrice > 0) {
                discount = ((mrp - finalPrice) / mrp * 100);
            } else {
                finalPrice = (finalPrice > 0) ? finalPrice : 999999;
            }

            return { discount, price: finalPrice };
        };

        // Filter valid items inside the grid
        let candidateElements = [];
        if (allPriceLinks.some(l => l.parentElement === gridContainer)) {
            candidateElements = allPriceLinks;
        } else {
            candidateElements = allPriceLinks.map(l => l.parentElement);
        }

        let processedData = candidateElements.map(c => {
            const info = extractData(c);
            if (!info) return null;

            const clone = c.cloneNode(true);
            clone.target = "_blank";
            clone.querySelectorAll(".z-t, .z-tag, .my-discount-tag-zs").forEach(t => t.remove());

            if (info.discount > 0) {
                const tag = create("div");
                tag.innerHTML = `${Math.round(info.discount)}%<div style="font-size:8px;opacity:0.9">OFF</div>`;
                tag.className = TAG_CLASS;
                tag.style.cssText = "position:absolute;top:8px;left:8px;background:#720e9e;color:#fff;font-weight:700;font-size:12px;padding:4px 6px;text-align:center;line-height:1;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:100;display:flex;flex-direction:column;justify-content:center;";
                clone.style.position = "relative";
                clone.appendChild(tag);
            }
            return { element: clone, discount: info.discount, price: info.price };
        });

        let finalItems = processedData.filter(i => i !== null);

        if (finalItems.length === 0) {
            alert("No available items found.");
            gridContainer.innerHTML = "";
        } else {
            CACHED_ITEMS = finalItems;
            MASTER_GRID = gridContainer;
            toggleBtn.style.display = "block";
            applyToggle(); // Initial sort
        }
        
        toggleTurbo(false);
    };

    const startScan = async () => {
        loader.style.display = "flex";
        toggleBtn.style.display = "none";
        
        try {
            await activateSearch();
            await wait(2500);
            window.scrollTo(0, 0);
            toggleTurbo(true);
            await scrollPage();
            await processItems();
        } catch (e) {
            toggleTurbo(false);
            alert(e.message);
        }
        
        loader.style.display = "none";
    };

})();
