/**
 * Zepto Product Sorter (Mobile Version) - v2.0
 * Features:
 * - Floating Action Button (FAB) + Toggle Sort
 * - Removed cloneNode (fixes React Add to Cart bugs)
 * - "HTML Spacing Trick" to prevent text merging
 * - "Read-the-Label" logic for accurate Skincare % parsing
 * - Session preservation (Target Blank + NoOpener fix)
 */

(function () {
  // --- CONFIGURATION ---
  const doc = document;
  const create = (tag) => doc.createElement(tag);
  const select = (selector) => doc.querySelector(selector);
  const selectAll = (selector) => Array.from(doc.querySelectorAll(selector));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- STATE ---
  let CACHED_ITEMS = [];
  let MASTER_GRID = null;
  let SORT_MODE = "DISCOUNT";

  // --- STYLES ---
  const style = create("style");
  style.innerHTML = `
        .z-fab { position: fixed; bottom: 120px; right: 20px; background: #720e9e; color: #fff; padding: 12px; border-radius: 30px; font-family: sans-serif; font-weight: bold; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 999999; display: flex; align-items: center; }
        .z-x { margin-left: 10px; font-size: 18px; opacity: 0.7; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.3); }
        .z-l { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20,0,30,0.9); backdrop-filter: blur(4px); display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 999999; color: #fff; font-family: sans-serif; }
        .z-toggle { position: fixed; bottom: 180px; right: 20px; background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; padding: 8px 16px; border-radius: 20px; font-family: sans-serif; font-weight: bold; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 999999; display: none; }
    `;
  doc.head.appendChild(style);

  // --- UI ELEMENTS ---
  const fab = create("div");
  fab.className = "z-fab";
  fab.innerHTML = '<span>⚡ Sort</span><span class="z-x">×</span>';
  const toggleBtn = create("div");
  toggleBtn.className = "z-toggle";
  toggleBtn.textContent = "% Off ⬇";
  const loader = create("div");
  loader.className = "z-l";
  loader.innerHTML = "<h3>Processing...</h3>";

  doc.body.appendChild(fab);
  doc.body.appendChild(toggleBtn);
  doc.body.appendChild(loader);

  const toggleTurbo = (enable) => {
    let styleTag = doc.getElementById("zt");
    if (enable) {
      if (!styleTag) {
        styleTag = create("style");
        styleTag.id = "zt";
        styleTag.innerHTML =
          "img{visibility:hidden!important}*{transition:none!important;animation:none!important}";
        doc.head.appendChild(styleTag);
      }
    } else if (styleTag) styleTag.remove();
  };

  // --- CORE LOGIC ---
  const applySort = () => {
    if (!MASTER_GRID || !CACHED_ITEMS.length) return;

    if (SORT_MODE === "DISCOUNT") {
      CACHED_ITEMS.sort((a, b) => b.discount - a.discount);
      toggleBtn.textContent = "% Off ⬇";
      toggleBtn.style.background = "#e3f2fd";
      toggleBtn.style.color = "#1565c0";
    } else {
      CACHED_ITEMS.sort((a, b) => a.price - b.price);
      toggleBtn.textContent = "Price ⬆";
      toggleBtn.style.background = "#fff3e0";
      toggleBtn.style.color = "#e65100";
    }

    MASTER_GRID.innerHTML = "";
    const fragment = doc.createDocumentFragment();
    CACHED_ITEMS.forEach((item) => fragment.appendChild(item.element));
    MASTER_GRID.appendChild(fragment);
    window.scrollTo(0, 0);
  };

  fab.onclick = (e) => {
    e.target.className === "z-x"
      ? (fab.remove(), toggleBtn.remove(), loader.remove())
      : startScan();
  };
  toggleBtn.onclick = () => {
    SORT_MODE = SORT_MODE === "DISCOUNT" ? "PRICE" : "DISCOUNT";
    applySort();
  };

  const activateSearch = async () => {
    const input = select('input[type="text"]');
    if (input) {
      input.focus();
      await wait(200);
      const keyEvent = { bubbles: true, key: "Enter", keyCode: 13, which: 13 };
      input.dispatchEvent(new KeyboardEvent("keydown", keyEvent));
      input.dispatchEvent(new KeyboardEvent("keyup", keyEvent));
    }
  };

  const scrollPage = async () => {
    let lastCount = 0,
      unchangedAttempts = 0;
    while (unchangedAttempts < 2) {
      const items = selectAll("a").filter((e) => e.textContent.includes("₹"));
      items.length > 0
        ? items[items.length - 1].scrollIntoView({ block: "center" })
        : window.scrollBy(0, 500);
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
    const allPriceLinks = selectAll("a").filter((e) =>
      e.textContent.includes("₹"),
    );
    if (!allPriceLinks.length) throw "No items";

    const parentVotes = new Map();
    allPriceLinks.forEach((link) => {
      let p = link.parentElement;
      for (let i = 0; i < 4; i++) {
        if (p) {
          parentVotes.set(p, (parentVotes.get(p) || 0) + 1);
          p = p.parentElement;
        }
      }
    });
    MASTER_GRID = [...parentVotes.entries()].sort((a, b) => b[1] - a[1])[0][0];

    const TAG_CLASS = "z-tag";
    let processedItems = [];
    const rawItems = MASTER_GRID
      ? Array.from(MASTER_GRID.querySelectorAll("a"))
      : allPriceLinks;

    for (let i = 0; i < rawItems.length; i++) {
      if ((i & 63) === 0) await wait(0);
      const el = rawItems[i];

      // HTML Spacing Trick
      const tx = el.innerHTML
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .toUpperCase();
      const isBad =
        tx.includes("BANNER") ||
        tx.includes("NOTIFY") ||
        tx.includes("OUT OF STOCK");

      if (tx.includes("₹") && !isBad) {
        let discount = 0,
          finalPrice = 999999;
        const matches = [...tx.matchAll(/₹\s*([\d,.]+)/g)];
        let nums = [];

        matches.forEach((m) => {
          const val = parseFloat(m[1].replace(/[^\d.]/g, ""));
          const ctx = m.input.substring(m.index, m.index + 20).toUpperCase();
          if (
            val > 5 &&
            val < 30000 &&
            !ctx.includes("MONTH") &&
            !ctx.includes("EMI")
          )
            nums.push(val);
        });

        if (nums.length > 0) finalPrice = Math.min(...nums.slice(0, 2));

        const pctMatch = tx.match(/(\d+)\s*%\s*OFF/);
        const saveMatch = tx.match(/SAVE\s*₹\s*([\d,.]+)/);

        if (pctMatch) {
          discount = parseFloat(pctMatch[1]);
        } else if (saveMatch && finalPrice !== 999999) {
          const save = parseFloat(saveMatch[1].replace(/[^\d.]/g, ""));
          discount = (save / (finalPrice + save)) * 100;
        } else if (nums.length >= 2) {
          const mrp = Math.max(nums[0], nums[1]);
          const sp = Math.min(nums[0], nums[1]);
          if (mrp > sp && mrp <= sp * 10) discount = ((mrp - sp) / mrp) * 100;
        }

        const oldTag = el.querySelector("." + TAG_CLASS);
        if (oldTag) oldTag.remove();
        if (discount > 0) {
          const tagDiv = create("div");
          tagDiv.innerHTML =
            Math.round(discount) + "%<div style='font-size:8px'>OFF</div>";
          tagDiv.className = TAG_CLASS;
          tagDiv.style.cssText =
            "position:absolute;top:8px;left:8px;background:#720e9e;color:#fff;font-weight:700;font-size:12px;padding:4px 6px;text-align:center;border-radius:4px;box-shadow:0 2px 4px #0003;z-index:9";
          el.style.position = "relative";
          el.appendChild(tagDiv);
        }

        // SESSION PRESERVATION FIX (Open in New Tab securely)
        const setTarget = (a) => {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        };
        if (el.tagName === "A") setTarget(el);
        else el.querySelectorAll("a").forEach(setTarget);

        processedItems.push({
          element: el,
          discount: discount,
          price: finalPrice,
        });
      }
    }

    if (!processedItems.length) {
      alert("No items found");
      MASTER_GRID.innerHTML = "";
    } else {
      CACHED_ITEMS = processedItems;
      SORT_MODE = "DISCOUNT";
      toggleBtn.style.display = "block";
      applySort();
    }
    toggleTurbo(false);
  };

  const startScan = async () => {
    loader.style.display = "flex";
    toggleBtn.style.display = "none";
    try {
      await activateSearch();
      await wait(2000);
      window.scrollTo(0, 0);
      toggleTurbo(true);
      await scrollPage();
      await processItems();
    } catch (e) {
      toggleTurbo(false);
      alert(e);
    }
    loader.style.display = "none";
  };
})();
