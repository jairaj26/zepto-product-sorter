javascript:(function(){
    /* CONFIG */
    const M=0;
    const doc=document;
    const C=t=>doc.createElement(t);
    const A=(p,c)=>p.appendChild(c);
    const Q=(s,p=doc)=>Array.from(p.querySelectorAll(s));
    const W=ms=>new Promise(r=>setTimeout(r,ms));
    
    /* STATE */
    let CACHED=[];
    let GRID=null;
    let SORT_MODE="DISCOUNT";

    /* STYLES */
    const st=C("style");
    st.innerHTML=`
        .z-fab { position: fixed; bottom: 20px; right: 20px; background: #720e9e; color: #fff; padding: 12px 20px; border-radius: 30px; font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 99999; transition: transform 0.2s; display: flex; align-items: center; cursor: pointer; }
        .z-fab:active { transform: scale(0.95); }
        .z-x { margin-left: 10px; font-size: 18px; opacity: 0.7; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.3); }
        .z-l { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20,0,30,0.9); backdrop-filter: blur(4px); display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 99998; color: #fff; font-family: sans-serif; }
        .z-toggle { position: fixed; bottom: 80px; right: 20px; background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; padding: 8px 16px; border-radius: 20px; font-family: sans-serif; font-weight: bold; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 99999; display: none; cursor: pointer; }
    `;
    doc.head.appendChild(st);

    /* UI ELEMENTS */
    const fab=C("div");
    fab.className="z-fab";
    fab.innerHTML='<span id="z-txt">⚡ Sort</span><span class="z-x">×</span>';
    
    const tog=C("div");
    tog.className="z-toggle";
    tog.textContent="% Off ⬇"; /* FIX: textContent */
    
    const ld=C("div");
    ld.className="z-l";
    ld.innerHTML='<h3>Processing...</h3>';
    
    A(doc.body,fab);
    A(doc.body,tog);
    A(doc.body,ld);

    /* EVENTS */
    fab.onclick=(e)=>{
        if(e.target.className==="z-x"){
            fab.remove();
            tog.remove();
            ld.remove();
            return;
        }
        RUN();
    };

    tog.onclick=()=>{
        TOGGLE();
    };

    /* FUNCTIONS */
    const toggleTurbo=(on)=>{
        let t=document.getElementById("z-turbo");
        if(on){
            if(!t){
                t=C("style");
                t.id="z-turbo";
                t.innerHTML="img{visibility:hidden!important;} *{transition:none!important;animation:none!important;}";
                doc.head.appendChild(t);
            }
        }else{
            if(t)t.remove();
        }
    };

    const TOGGLE=()=>{
        if(SORT_MODE==="DISCOUNT"){
            SORT_MODE="PRICE";
            CACHED.sort((a,b)=>a.price-b.price);
            tog.textContent="Price ⬆"; /* FIX: textContent */
            tog.style.background="#fff3e0"; 
            tog.style.color="#e65100";
        }else{
            SORT_MODE="DISCOUNT";
            CACHED.sort((a,b)=>b.discount-a.discount);
            tog.textContent="% Off ⬇"; /* FIX: textContent */
            tog.style.background="#e3f2fd"; 
            tog.style.color="#1565c0";
        }
        GRID.innerHTML="";
        CACHED.forEach(item=>GRID.appendChild(item.e));
        window.scrollTo(0,0);
    };

    const Tap=async()=>{
        const i=doc.querySelector('input[type="text"]');
        if(!i)return;
        i.focus();
        await W(200);
        const k={bubbles:!0,cancelable:!0,key:"Enter",code:"Enter",keyCode:13,which:13};
        i.dispatchEvent(new KeyboardEvent("keydown",k));
        i.dispatchEvent(new KeyboardEvent("keyup",k));
    };

    const SCR=async()=>{
        let lc=0,u=0;
        while(u<2){
            const it=Q("a").filter(e=>e.textContent.includes("₹"));
            if(it.length>0){
                it[it.length-1].scrollIntoView({behavior:"smooth",block:"center"});
            }else{
                window.scrollBy(0,500);
            }
            await W(2000);
            const nc=Q("a").length;
            if(nc===lc)u++;else{lc=nc;u=0};
        }
    };

    const PROC=async()=>{
        const al=Q("a").filter(e=>e.textContent.includes("₹"));
        if(0===al.length)throw new Error("No items");
        
        const vt=new Map;
        al.forEach(l=>{
            const p=l.parentElement;
            if(p)vt.set(p,(vt.get(p)||0)+1);
            const gp=p?p.parentElement:null;
            if(gp)vt.set(gp,(vt.get(gp)||0)+1);
        });
        
        const sv=[...vt.entries()].sort((a,b)=>b[1]-a[1]);
        const mg=sv[0][0];
        const cl="z-tag";

        const getD=el=>{
            const pContainer=el.closest("div")||el;
            const tx=pContainer.textContent.toUpperCase();
            if(tx.includes("NOTIFY")||tx.includes("OUT OF STOCK"))return null;

            let off=0,mrp=0;
            const cutIdx=el.textContent.search(/(?:₹|Rs)?\s*[\d,.]+\s*OFF/i);
            
            if(cutIdx>-1){
                const cl=el.textContent.substring(0,cutIdx);
                const m=cl.match(/₹\s*[\d,.]+/g);
                if(m&&m.length>=1){
                    const allV=m.map(x=>parseFloat(x.replace(/[^0-9.]/g,"")));
                    const v=allV.sort((a,b)=>b-a);
                    if(v.length>=2){
                        mrp=v[0];
                        off=v[1];
                    }else if(v.length===1){
                        off=v[0];
                    }
                }
            }else{
                const m=el.textContent.match(/₹\s*[\d,.]+/g);
                if(m&&m.length>=1){
                    off=parseFloat(m[0].replace(/[^0-9.]/g,""));
                }
            }
            
            let price=(off>0)?off:999999;
            let discount=0;
            if(mrp>0&&off>0)discount=((mrp-off)/mrp*100);
            return{discount,price};
        };

        let cds=[];
        if(al.some(l=>l.parentElement===mg))cds=al;else cds=al.map(l=>l.parentElement);

        let pd=cds.map(c=>{
            const info=getD(c);
            if(!info)return null;
            const clone=c.cloneNode(!0);
            clone.target="_blank";
            clone.querySelectorAll(".z-t, .z-tag, .my-discount-tag-zs").forEach(t=>t.remove());

            if(info.discount>0){
                const tag=C("div");
                tag.innerHTML=`${Math.round(info.discount)}%<div style="font-size:8px;opacity:0.9">OFF</div>`;
                tag.className=cl;
                tag.style.cssText="position:absolute;top:8px;left:8px;background:#720e9e;color:#fff;font-weight:700;font-size:12px;padding:4px 6px;text-align:center;line-height:1;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:100;display:flex;flex-direction:column;justify-content:center;";
                clone.style.position="relative";
                clone.appendChild(tag);
            }
            return{e:clone,discount:info.discount,price:info.price};
        });

        let fi=pd.filter(i=>i!==null);
        if(fi.length===0){
            alert("No available items found.");
            mg.innerHTML="";
        }else{
            CACHED=fi;
            GRID=mg;
            tog.style.display="block";
            TOGGLE();
        }
        toggleTurbo(false);
    };

    const RUN=async()=>{
        ld.style.display="flex";
        tog.style.display="none"; 
        try{
            await Tap();
            await W(2500);
            window.scrollTo(0,0);
            toggleTurbo(true);
            await SCR();
            await PROC();
        }catch(e){
            toggleTurbo(false);
            alert(e.message);
        }
        ld.style.display="none";
    };
})();