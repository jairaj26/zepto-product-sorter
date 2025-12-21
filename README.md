# Zepto Product Sorter

I built this tool because one of the main issues Zepto users face is finding good offers. There is no way to sort items by discount since, unlike Swiggy or BigBasket, Zepto doesn't have a default sorting option.

Zepto also removed the discount percentage tag from their interface, so it was extremely tiresome to guess or calculate how much discount a product actually had.

This is a Javascript bookmarklet that injects a sorting panel into the Zepto website to solve these problems. **Now available for both PC and Mobile!**

## 🚀 How to Install

> **Note:** Zepto uses strict security (Content Security Policy) that blocks external scripts. You must paste the full code below directly into your bookmark.

### 💻 For PC / Laptop (Chrome, Edge, Brave)

1.  Create a new bookmark in your browser.
2.  Name it **"Zepto PC Sort"**.
3.  **Copy the code block below** and paste it into the URL field:

```javascript
javascript:(function(){const C=["Atta","Rice","Oil","Ghee","Dal","Masala","Packaged Foods","Tea","Coffee","Biscuits","Dairy","Sweets","Snacks","Skincare","Cleaning"];const d=document;const c=t=>d.createElement(t);const q=s=>d.querySelector(s);const qa=s=>Array.from(d.querySelectorAll(s));let CA=[],MG=null,SM="DISC";const st=c("style");st.innerHTML=".z-dock{position:fixed;z-index:99999;background:#fff;padding:10px;padding-top:40px;font-family:sans-serif;border-radius:12px;border:1px solid #eee;top:100px;right:20px;width:150px;box-shadow:0 0 20px #00000020;transition:height 0.2s}.z-list{max-height:60vh;overflow-y:auto;padding-right:2px}.z-dock.min .z-list{display:none}.z-btn{display:block;width:100%;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:8px;margin-bottom:6px;cursor:pointer;font-size:12px;font-weight:600;color:#495057;text-align:left}.z-btn:hover{background:#ff3269;color:#fff}.z-btn.act{background:#720e9e;color:#fff}.z-btn.man{background:#f3e5f5;color:#7b1fa2;text-align:center;margin-bottom:10px;border-bottom:2px solid #e1bee7}.z-head-btn{position:absolute;top:8px;width:24px;height:24px;background:#eee;color:#333;border-radius:50%;text-align:center;line-height:24px;font-size:14px;cursor:pointer;font-weight:bold}.z-close{right:8px}.z-min{right:36px}.z-sort-pill{position:absolute;top:8px;left:8px;background:#e3f2fd;color:#1565c0;border:1px solid #90caf9;font-size:10px;font-weight:bold;padding:4px 8px;border-radius:12px;cursor:pointer;display:none;z-index:100}.z-ld{position:fixed;top:0;left:0;width:100%;height:100%;background:#000000d0;z-index:99998;display:none;flex-direction:column;justify-content:center;align-items:center;color:#fff}";d.head.appendChild(st);const dk=c("div");dk.className="z-dock";const x=c("div");x.className="z-head-btn z-close";x.innerText="✕";x.onclick=()=>dk.remove();dk.appendChild(x);const m=c("div");m.className="z-head-btn z-min";m.innerText="−";m.onclick=()=>{dk.classList.toggle("min");m.innerText=dk.classList.contains("min")?"+":"−"};dk.appendChild(m);const stb=c("div");stb.className="z-sort-pill";stb.innerText="% Off ⬇";stb.onclick=()=>{SM=SM==="DISC"?"PRICE":"DISC";SORT()};dk.appendChild(stb);const ld=c("div");ld.className="z-ld";ld.innerText="Loading...";d.body.appendChild(dk);d.body.appendChild(ld);const w=ms=>new Promise(r=>setTimeout(r,ms));const msg=t=>ld.innerText=t;const TT=o=>{let t=d.getElementById("zt");if(o){if(!t){t=c("style");t.id="zt";t.innerHTML="img{visibility:hidden!important}*{transition:none!important;animation:none!important}";d.head.appendChild(t)}}else if(t)t.remove()};const SORT=()=>{if(!MG||!CA.length)return;if(SM==="DISC"){CA.sort((a,b)=>b.d-a.d);stb.innerText="% Off ⬇"}else{CA.sort((a,b)=>a.p-b.p);stb.innerText="Price ⬆"}MG.innerHTML="";/*FRAGMENT BATCHING*/const f=d.createDocumentFragment();CA.forEach(x=>f.appendChild(x.e));MG.appendChild(f);window.scrollTo({top:MG.getBoundingClientRect().top+window.scrollY-130,behavior:"auto"})};const PROC=async()=>{msg("Sorting...");await w(100);const al=qa("a").filter(e=>e.textContent.includes("₹"));if(!al.length)throw"No items";const vt=new Map;al.forEach(l=>{let p=l.parentElement;for(let i=0;i<4;i++){if(p){vt.set(p,(vt.get(p)||0)+1);p=p.parentElement}}});const sv=[...vt.entries()].sort((a,b)=>b[1]-a[1]);MG=sv[0][0];const tg="z-tag";let pr=[];const raw=MG?Array.from(MG.querySelectorAll("a")):al;for(let i=0;i<raw.length;i++){/*URL SAFE BATCHING*/if((i&63)===0)await w(0);const el=raw[i];const tx=el.textContent.toUpperCase();if(tx.includes("₹")&&!tx.includes("BANNER")&&!tx.includes("NOTIFY")&&!tx.includes("OUT OF STOCK")){let d=0,p=9e5;const cutIdx=el.textContent.search(/(?:₹|Rs)?\s*[\d,.]+\s*OFF/i);if(cutIdx>-1){const cl=el.textContent.substring(0,cutIdx);const m=cl.match(/₹\s*[\d,.]+/g);if(m&&m.length>=1){const allV=m.map(x=>parseFloat(x.replace(/[^0-9.]/g,"")));const v=allV.sort((a,b)=>b-a);if(v.length>=2){const mrp=v[0];const o=v[1];p=o;if(mrp>0)d=((mrp-o)/mrp*100)}else if(v.length===1){p=v[0]}}}else{const m=el.textContent.match(/₹\s*[\d,.]+/g);if(m&&m.length>=1){p=parseFloat(m[0].replace(/[^0-9.]/g,""))}}const ot=el.querySelector("."+tg);if(ot)ot.remove();if(d>0){const t=c("div");t.innerHTML=Math.round(d)+"%<div style='font-size:9px'>OFF</div>";t.className=tg;t.style.cssText="position:absolute;top:10px;left:10px;background:#720e9e;color:#fff;font-weight:700;font-size:13px;padding:4px 6px;text-align:center;border-radius:4px;z-index:10";el.style.position="relative";el.appendChild(t)}pr.push({e:el,d:d,p:p})}}if(!pr.length){alert("No items found");MG.innerHTML=""}else{CA=pr;SM="DISC";stb.style.display="block";SORT()}TT(0)};const AUTO=async(cat,b)=>{MG=null;CA=[];ld.style.display="flex";b.classList.add("act");b.innerText="...";try{let sb=q('input[type="text"]');if(!sb){const ic=q('a[href*="search"]');if(ic){ic.click();await w(1500);sb=q('input[type="text"]')}}if(!sb)throw"No Search";qa("a").filter(e=>e.textContent.includes("₹")).forEach(e=>e.remove());msg("Search: "+cat);if(sb){const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;const k={bubbles:!0,key:"Enter",keyCode:13,which:13};sb.focus();set.call(sb,"");sb.dispatchEvent(new Event("input",{bubbles:!0}));await w(200);sb.dispatchEvent(new KeyboardEvent("keydown",k));sb.dispatchEvent(new KeyboardEvent("keyup",k));await w(1000);set.call(sb,cat);sb.dispatchEvent(new Event("input",{bubbles:!0}));await w(500);sb.dispatchEvent(new KeyboardEvent("keydown",k));sb.dispatchEvent(new KeyboardEvent("keyup",k));await w(2500)}else{throw"Input Locked"}window.scrollTo(0,0);TT(1);msg("Loading...");let lc=0,u=0;while(u<2){const it=qa("a").filter(e=>e.textContent.includes("₹"));if(it.length){it[it.length-1].scrollIntoView({block:"start"});await w(1500);window.scrollBy(0,-150)}else{window.scrollBy(0,500)}await w(2000);const nc=qa("a").length;if(nc===lc)u++;else{lc=nc;u=0}}await PROC()}catch(e){TT(0);alert(e)}ld.style.display="none";b.classList.remove("act");b.innerText=cat};const MAN=async(b)=>{MG=null;CA=[];ld.style.display="flex";b.innerText="...";try{let sb=q('input[type="text"]');if(sb&&sb.value.length>0){msg("Refreshing...");sb.focus();const k={bubbles:!0,key:"Enter",keyCode:13,which:13};sb.dispatchEvent(new KeyboardEvent("keydown",k));sb.dispatchEvent(new KeyboardEvent("keyup",k));await w(1500)}TT(1);let lc=0,u=0;while(u<2){const it=qa("a").filter(e=>e.textContent.includes("₹"));if(it.length){it[it.length-1].scrollIntoView({block:"start"});await w(1500);window.scrollBy(0,-150)}else{window.scrollBy(0,500)}await w(2000);const nc=qa("a").length;if(nc===lc)u++;else{lc=nc;u=0}}await PROC()}catch(e){TT(0);alert(e)}ld.style.display="none";b.innerText="⚡ Sort Page"};const mb=c("button");mb.className="z-btn man";mb.innerText="⚡ Sort Page";mb.onclick=()=>MAN(mb);dk.appendChild(mb);const lst=c("div");lst.className="z-list";C.forEach(x=>{const b=c("button");b.className="z-btn";b.innerText=x;b.onclick=()=>AUTO(x,b);lst.appendChild(b)});dk.appendChild(lst)})();
```

4.  Go to Zepto, search for a category (e.g., "Biscuits"), and click the bookmark!

### 📱 For Mobile (Android/iOS)

1.  Create a new bookmark in your mobile browser.
2.  Name it **"Zepto Mobile"**.
3.  **Copy the code block below** and paste it into the URL field:

```javascript
javascript:(function(){const M=0;const doc=document;const C=t=>doc.createElement(t);const A=(p,c)=>p.appendChild(c);const Q=(s,p=doc)=>Array.from(p.querySelectorAll(s));const W=ms=>new Promise(r=>setTimeout(r,ms));let CACHED=[];let GRID=null;let SORT_MODE="DISCOUNT";const st=C("style");st.innerHTML=".z-fab{position:fixed;bottom:20px;right:20px;background:#720e9e;color:#fff;padding:12px 20px;border-radius:30px;font-family:sans-serif;font-weight:bold;box-shadow:0 4px 15px rgba(0,0,0,0.3);z-index:99999;transition:transform 0.2s;display:flex;align-items:center;cursor:pointer}.z-fab:active{transform:scale(0.95)}.z-x{margin-left:10px;font-size:18px;opacity:0.7;padding-left:10px;border-left:1px solid rgba(255,255,255,0.3)}.z-l{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(20,0,30,0.9);backdrop-filter:blur(4px);display:none;flex-direction:column;justify-content:center;align-items:center;z-index:99998;color:#fff;font-family:sans-serif}.z-toggle{position:fixed;bottom:80px;right:20px;background:#e3f2fd;color:#1565c0;border:1px solid #90caf9;padding:8px 16px;border-radius:20px;font-family:sans-serif;font-weight:bold;font-size:12px;box-shadow:0 4px 10px rgba(0,0,0,0.2);z-index:99999;display:none;cursor:pointer}";doc.head.appendChild(st);const fab=C("div");fab.className="z-fab";fab.innerHTML='<span id="z-txt">⚡ Sort</span><span class="z-x">×</span>';const tog=C("div");tog.className="z-toggle";tog.textContent="% Off ⬇";const ld=C("div");ld.className="z-l";ld.innerHTML='<h3>Processing...</h3>';A(doc.body,fab);A(doc.body,tog);A(doc.body,ld);fab.onclick=(e)=>{if(e.target.className==="z-x"){fab.remove();tog.remove();ld.remove();return}RUN()};tog.onclick=()=>{TOGGLE()};const toggleTurbo=(on)=>{let t=document.getElementById("z-turbo");if(on){if(!t){t=C("style");t.id="z-turbo";t.innerHTML="img{visibility:hidden!important;} *{transition:none!important;animation:none!important;}";doc.head.appendChild(t)}}else{if(t)t.remove()}};const TOGGLE=()=>{if(SORT_MODE==="DISCOUNT"){SORT_MODE="PRICE";CACHED.sort((a,b)=>a.price-b.price);tog.textContent="Price ⬆";tog.style.background="#fff3e0";tog.style.color="#e65100"}else{SORT_MODE="DISCOUNT";CACHED.sort((a,b)=>b.discount-a.discount);tog.textContent="% Off ⬇";tog.style.background="#e3f2fd";tog.style.color="#1565c0"}GRID.innerHTML="";CACHED.forEach(item=>GRID.appendChild(item.e));window.scrollTo(0,0)};const Tap=async()=>{const i=doc.querySelector('input[type="text"]');if(!i)return;i.focus();await W(200);const k={bubbles:!0,cancelable:!0,key:"Enter",code:"Enter",keyCode:13,which:13};i.dispatchEvent(new KeyboardEvent("keydown",k));i.dispatchEvent(new KeyboardEvent("keyup",k))};const SCR=async()=>{let lc=0,u=0;while(u<2){const it=Q("a").filter(e=>e.textContent.includes("₹"));if(it.length>0){it[it.length-1].scrollIntoView({behavior:"smooth",block:"center"})}else{window.scrollBy(0,500)}await W(2000);const nc=Q("a").length;if(nc===lc)u++;else{lc=nc;u=0}}};const PROC=async()=>{const al=Q("a").filter(e=>e.textContent.includes("₹"));if(0===al.length)throw new Error("No items");const vt=new Map;al.forEach(l=>{const p=l.parentElement;if(p)vt.set(p,(vt.get(p)||0)+1);const gp=p?p.parentElement:null;if(gp)vt.set(gp,(vt.get(gp)||0)+1)});const sv=[...vt.entries()].sort((a,b)=>b[1]-a[1]);const mg=sv[0][0];const cl="z-tag";const getD=el=>{const pContainer=el.closest("div")||el;const tx=pContainer.textContent.toUpperCase();if(tx.includes("NOTIFY")||tx.includes("OUT OF STOCK"))return null;let off=0,mrp=0;const cutIdx=el.textContent.search(/(?:₹|Rs)?\s*[\d,.]+\s*OFF/i);if(cutIdx>-1){const cl=el.textContent.substring(0,cutIdx);const m=cl.match(/₹\s*[\d,.]+/g);if(m&&m.length>=1){const allV=m.map(x=>parseFloat(x.replace(/[^0-9.]/g,"")));const v=allV.sort((a,b)=>b-a);if(v.length>=2){mrp=v[0];off=v[1]}else if(v.length===1){off=v[0]}}}else{const m=el.textContent.match(/₹\s*[\d,.]+/g);if(m&&m.length>=1){off=parseFloat(m[0].replace(/[^0-9.]/g,""))}}let price=(off>0)?off:999999;let discount=0;if(mrp>0&&off>0)discount=((mrp-off)/mrp*100);return{discount,price}};let cds=[];if(al.some(l=>l.parentElement===mg))cds=al;else cds=al.map(l=>l.parentElement);let pd=cds.map(c=>{const info=getD(c);if(!info)return null;const clone=c.cloneNode(!0);clone.target="_blank";clone.querySelectorAll(".z-t, .z-tag, .my-discount-tag-zs").forEach(t=>t.remove());if(info.discount>0){const tag=C("div");tag.innerHTML=`${Math.round(info.discount)}%<div style="font-size:8px;opacity:0.9">OFF</div>`;tag.className=cl;tag.style.cssText="position:absolute;top:8px;left:8px;background:#720e9e;color:#fff;font-weight:700;font-size:12px;padding:4px 6px;text-align:center;line-height:1;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:100;display:flex;flex-direction:column;justify-content:center;";clone.style.position="relative";clone.appendChild(tag)}return{e:clone,discount:info.discount,price:info.price}});let fi=pd.filter(i=>i!==null);if(fi.length===0){alert("No available items found.");mg.innerHTML=""}else{CACHED=fi;GRID=mg;tog.style.display="block";TOGGLE()}toggleTurbo(false)};const RUN=async()=>{ld.style.display="flex";tog.style.display="none";try{await Tap();await W(2500);window.scrollTo(0,0);toggleTurbo(true);await SCR();await PROC()}catch(e){toggleTurbo(false);alert(e.message)}ld.style.display="none"};})();
```

4.  **How to run on Mobile:**
    * Open Zepto website.
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
* **`source-pc.js` & `source-mobile.js`**: The un-minified, readable source code (for developers who want to learn how the logic works).

## 🛠️ How I Built It (The Engineering Journey)

I spent about a month reverse-engineering Zepto's frontend to build this. What started as a simple "sort" script turned into a complex engineering challenge due to Zepto's dynamic architecture. Here were the main hurdles:

### 1. The "Dirty Data" Challenge 🧹
Zepto's product cards are unstructured. A simple number scraper would fail miserably because:
* **Brand Confusion:** Brands like **"24 Mantra"**, **"921 Rice"**, or **"4700BC"** were often mistaken for prices (e.g., the script thought "4700" was the MRP, showing a 99% discount).
* **Unit Noise:** Weights like "500g" or "100ml" often appeared before the price.

**The Solution:**
I implemented **"Guillotine Logic."** The script actively hunts for the "OFF" tag and *physically chops* the text string at that exact point. It strictly ignores any number that appears after the discount tag, instantly solving the brand name bug.

### 2. Performance vs. Accuracy (The `textContent` War) ⚡
Initially, I used `innerText` to read prices because it ignores hidden HTML elements. However, this caused **Layout Thrashing**, making the browser freeze on older phones because it forced a layout recalculation for every single item.

**The Solution:**
I rewrote the core logic to use `textContent` (which is instant/zero-lag) but added a **"Greedy Regex"** cleaner to manually strip out the hidden metadata and "ghost" symbols that `innerText` used to handle for us. This resulted in a **10x speed boost** on mobile.

### 3. The Nested Grid Nightmare 🕸️
Unlike simple websites, Zepto uses a deeply nested V2 Grid layout where the actual product cards are buried under 10+ layers of `div`s. A standard selector would often grab the wrong container, breaking the sort.

**The Solution:**
I built a **"Voting System."** The script scans all product links, traces their parents, and "votes" on which container holds the most items. The winner is identified as the Master Grid, ensuring the script works even if Zepto changes their class names.

### 4. Browser Limits & 429 Errors 🛡️
Loading 500+ items at once would often crash the browser tab or get my IP rate-limited (HTTP 429) by Zepto's server.

**The Solution:**
* **Turbo Mode:** The script temporarily hides all images (`visibility: hidden`) during the scan. This frees up massive amounts of RAM and GPU, preventing crashes.
* **Safe Scrolling:** I implemented a human-like scroll throttle that pauses every few seconds to respect server limits.

### 5. Mobile UX 📱
Running this on a phone was tricky because standard bookmarklets are hard to control on touchscreens.

**The Solution:**
I built a custom **Floating Action Button (FAB)** interface. I also separated the "Scan" logic from the "Sort" logic into a split-control system, allowing users to toggle between **Price Low-High** and **Discount High-Low** instantly without reloading the page.

## ⚠️ Disclaimer

This is a personal learning project and is not affiliated with Zepto. Original concept inspired by a community script. Completely re-engineered with Turbo Mode, Safe-Scrolling, and Mobile support.
