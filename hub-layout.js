(() => {
 const key="ict200-reading-style",menu=document.querySelector(".erd-hub-nav");
 const label=document.createElement("label");label.className="reading-style";
 const title=document.createElement("span");title.textContent="Appearance";
 const select=document.createElement("select");select.setAttribute("aria-label","Reading appearance");
 for(const [id,name] of [["classic","Classic"],["paper","Study paper"],["night","Dark mode"]])select.add(new Option(name,id));
 function apply(id){select.value=["paper","night"].includes(id)?id:"classic";document.documentElement.dataset.look=select.value;}
 try{apply(localStorage.getItem(key));}catch{apply("classic");}
 select.onchange=()=>{apply(select.value);try{localStorage.setItem(key,select.value);}catch{}};
 window.addEventListener("storage",e=>{if(e.key===key)apply(e.newValue);});
 label.append(title,select);menu.append(label);
})();
