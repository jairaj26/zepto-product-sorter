/**
 * Zepto Product Sorter (PC Version) - v2.0
 * Features:
 * - Sidebar UI with Category shortcuts
 * - "HTML Spacing Trick" to prevent text merging
 * - "Read-the-Label" logic (reads native % OFF first)
 * - Safe-Scrolling & DocumentFragment batching
 * - Session preservation (Target Blank + NoOpener fix)
 */

(function () {
  // --- CONFIGURATION ---
  const CATEGORIES = [
    "Atta",
    "Rice",
    "Oil",
    "Ghee",
    "Dal",
    "Masala",
    "Packaged Foods",
    "Tea",
    "Coffee",
    "Biscuits",
    "Dairy",
    "Sweets",
    "Snacks",
    "Skincare",
    "Cleaning",
  ];

  // --- STATE MANAGEMENT ---
  let CACHED_ITEMS = [];
  let MASTER_GRID = null;
  let SORT_MODE = "DISCOUNT"; // 'DISCOUNT' or 'PRICE'

  // --- DOM HELPERS ---
  const doc = document;
  const create = (tag) => doc.createElement(tag);
  const select = (selector) => doc.querySelector(selector);
  const selectAll = (selector) => Array.from(doc.querySelectorAll(selector));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- STYLES ---
  const style = create("style");
  style.innerHTML = `
        .z-dock { position: fixed; z-index: 99999; background: #fff; padding: 10px; padding-top: 40px; font-family: sans-serif; border-radius: 12px; border: 1px solid #eee; top: 100px; right: 20px; width: 150px; box-shadow: 0 0 20px #00000020; transition: height 0.2s; }
        .z-list { max-height: 60vh; overflow-y: auto; padding-right: 2px; }
        .z-dock.min .z-list { display: none; }
        .z-btn { display: block; width: 100%; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 8px; margin-bottom: 6px; cursor: pointer; font-size: 12px; font-weight: 600; color: #495057; text-align: left; }
        .z-btn:hover { background: #ff3269; color: #fff; }
        .z-btn.act { background: #720e9e; color: #fff; }
        .z-btn.man { background: #f3e5f5; color: #7b1fa2; text-align: center; margin-bottom: 10px; border-bottom: 2px solid #e1bee7; }
        .z-head-btn { position: absolute; top: 8px; width: 24px; height: 24px; background: #eee; color: #333; border-radius: 50%; text-align: center; line-height: 24px; font-size: 14px; cursor: pointer; font-weight: bold; }
        .z-close { right: 8px; }
        .z-min { right: 36px; }
        .z-sort-pill { position: absolute; top: 8px; left: 8px; background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 12px; cursor: pointer; display: none; z-index: 100; }
        .z-ld { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000000d0; z-index: 99998; display: none; flex-direction: column; justify-content: center; align-items: center; color: #fff; }
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
    SORT_MODE = SORT_MODE === "DISCOUNT" ? "PRICE" : "DISCOUNT";
    applySort();
  };
  dock.appendChild(sortPill);
  const loader = create("div");
  loader.className = "z-ld";
  loader.innerText = "Loading...";
  doc.body.appendChild(dock);
  doc.body.appendChild(loader);

  const updateMsg = (t) => (loader.innerText = t);

  // --- TURBO MODE (Hides images to prevent lag) ---
  const toggleTurbo = (o) => {
    let t = doc.getElementById("zt");
    if (o) {
      if (!t) {
        t = create("style");
        t.id = "zt";
        t.innerHTML =
          "img{visibility:hidden!important}*{transition:none!important;animation:none!important}";
        doc.head.appendChild(t);
      }
    } else if (t) t.remove();
  };

  // --- CORE SORTING ---
  const applySort = () => {
    if (!MASTER_GRID || !CACHED_ITEMS.length) return;
    if (SORT_MODE === "DISCOUNT") {
      CACHED_ITEMS.sort((a, b) => b.d - a.d);
      sortPill.innerText = "% Off ⬇";
    } else {
      CACHED_ITEMS.sort((a, b) => a.p - b.p);
      sortPill.innerText = "Price ⬆";
    }

    MASTER_GRID.innerHTML = "";
    const fragment = doc.createDocumentFragment();
    CACHED_ITEMS.forEach((x) => fragment.appendChild(x.e));
    MASTER_GRID.appendChild(fragment);
    window.scrollTo({
      top: MASTER_GRID.getBoundingClientRect().top + window.scrollY - 130,
      behavior: "auto",
    });
  };

  // --- DATA EXTRACTION ---
  const processItems = async () => {
    updateMsg("Sorting...");
    await wait(50);
    const al = selectAll("a").filter((e) => e.textContent.includes("₹"));
    if (!al.length) throw "No items";

    // Identify Main Grid
    const parentVotes = new Map();
    al.forEach((l) => {
      let p = l.parentElement;
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
      : al;

    for (let i = 0; i < rawItems.length; i++) {
      if ((i & 63) === 0) await wait(0); // URL-Safe Throttle
      const el = rawItems[i];

      // HTML SPACING TRICK: Prevents numbers from merging (e.g., ₹49953% OFF)
      const tx = el.innerHTML
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .toUpperCase();
      const isBad =
        tx.includes("BANNER") ||
        tx.includes("NOTIFY") ||
        tx.includes("OUT OF STOCK");

      if (tx.includes("₹") && !isBad) {
        let d = 0,
          p = 999999;
        const matches = [...tx.matchAll(/₹\s*([\d,.]+)/g)];
        let nums = [];

        // Filter valid prices
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

        if (nums.length > 0) p = Math.min(...nums.slice(0, 2));

        // READ-THE-LABEL LOGIC
        const pctMatch = tx.match(/(\d+)\s*%\s*OFF/);
        const saveMatch = tx.match(/SAVE\s*₹\s*([\d,.]+)/);

        if (pctMatch) {
          d = parseFloat(pctMatch[1]);
        } else if (saveMatch && p !== 999999) {
          const save = parseFloat(saveMatch[1].replace(/[^\d.]/g, ""));
          d = (save / (p + save)) * 100;
        } else if (nums.length >= 2) {
          const mrp = Math.max(nums[0], nums[1]);
          const sp = Math.min(nums[0], nums[1]);
          if (mrp > sp && mrp <= sp * 10) d = ((mrp - sp) / mrp) * 100;
        }

        // Inject Tag
        const oldTag = el.querySelector("." + TAG_CLASS);
        if (oldTag) oldTag.remove();
        if (d > 0) {
          const tagDiv = create("div");
          tagDiv.innerHTML =
            Math.round(d) + "%<div style='font-size:9px'>OFF</div>";
          tagDiv.className = TAG_CLASS;
          tagDiv.style.cssText =
            "position:absolute;top:10px;left:10px;background:#720e9e;color:#fff;font-weight:700;font-size:13px;padding:4px 6px;text-align:center;border-radius:4px;z-index:10";
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

        processedItems.push({ e: el, d: d, p: p });
      }
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
    toggleTurbo(0);
  };

  // --- SCROLL AUTOMATION ---
  const scrollAndLoad = async () => {
    window.scrollTo(0, 0);
    toggleTurbo(1);
    updateMsg("Loading...");
    let lastCount = 0,
      unchangedAttempts = 0;
    while (unchangedAttempts < 2) {
      const items = selectAll("a").filter((e) => e.textContent.includes("₹"));
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
  };

  const runAutoMode = async (cat, btn) => {
    MASTER_GRID = null;
    CACHED_ITEMS = [];
    loader.style.display = "flex";
    btn.classList.add("act");
    btn.innerText = "...";
    try {
      let sb = select('input[type="text"]');
      if (!sb) {
        const searchIcon = select('a[href*="search"]');
        if (searchIcon) {
          searchIcon.click();
          await wait(1500);
          sb = select('input[type="text"]');
        }
      }
      if (!sb) throw "No Search";

      selectAll("a")
        .filter((e) => e.textContent.includes("₹"))
        .forEach((e) => e.remove());
      updateMsg("Search: " + cat);

      if (sb) {
        const setNativeValue = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set;
        const keyEvent = { bubbles: !0, key: "Enter", keyCode: 13, which: 13 };
        sb.focus();
        setNativeValue.call(sb, "");
        sb.dispatchEvent(new Event("input", { bubbles: !0 }));
        await wait(200);
        sb.dispatchEvent(new KeyboardEvent("keydown", keyEvent));
        sb.dispatchEvent(new KeyboardEvent("keyup", keyEvent));
        await wait(1000);
        setNativeValue.call(sb, cat);
        sb.dispatchEvent(new Event("input", { bubbles: !0 }));
        await wait(500);
        sb.dispatchEvent(new KeyboardEvent("keydown", keyEvent));
        sb.dispatchEvent(new KeyboardEvent("keyup", keyEvent));
        await wait(2500);
      } else {
        throw "Input Locked";
      }

      await scrollAndLoad();
      await processItems();
    } catch (e) {
      toggleTurbo(0);
      alert(e);
    }
    loader.style.display = "none";
    btn.classList.remove("act");
    btn.innerText = cat;
  };

  const runManualMode = async (btn) => {
    MASTER_GRID = null;
    CACHED_ITEMS = [];
    loader.style.display = "flex";
    btn.innerText = "...";
    try {
      let sb = select('input[type="text"]');
      if (sb && sb.value.length > 0) {
        updateMsg("Refreshing...");
        sb.focus();
        const k = { bubbles: !0, key: "Enter", keyCode: 13, which: 13 };
        sb.dispatchEvent(new KeyboardEvent("keydown", k));
        sb.dispatchEvent(new KeyboardEvent("keyup", k));
        await wait(1500);
      }
      await scrollAndLoad();
      await processItems();
    } catch (e) {
      toggleTurbo(0);
      alert(e);
    }
    loader.style.display = "none";
    btn.innerText = "⚡ Sort Page";
  };

  // --- INITIALIZE UI ---
  const manualBtn = create("button");
  manualBtn.className = "z-btn man";
  manualBtn.innerText = "⚡ Sort Page";
  manualBtn.onclick = () => runManualMode(manualBtn);
  dock.appendChild(manualBtn);
  const listContainer = create("div");
  listContainer.className = "z-list";
  CATEGORIES.forEach((cat) => {
    const btn = create("button");
    btn.className = "z-btn";
    btn.innerText = cat;
    btn.onclick = () => runAutoMode(cat, btn);
    listContainer.appendChild(btn);
  });
  dock.appendChild(listContainer);
})();
