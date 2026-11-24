(() => {
  "use strict";
  const bar=document.querySelector(".erd-hub-nav");
  const walker=bar.hasAttribute("data-walkthrough");
  const prefix=walker?"index.html#":"#";
  const trigger=document.createElement("button");
  trigger.type="button";
  trigger.textContent="Main menu";
  trigger.setAttribute("aria-controls","erd-hub-destinations");
  const panel=document.createElement("div");
  panel.id="erd-hub-destinations";
  function link(text,href) {
    const anchor=document.createElement("a");
    anchor.textContent=text;
    anchor.href=href;
    return anchor;
  }
  function group(label,entries) {
    const section=document.createElement("section");
    const title=document.createElement("strong");
    title.textContent=label;
    section.append(title);
    for(const entry of entries) section.append(link(entry.kicker?entry.kicker+" · "+entry.title:entry.title,prefix+entry.id));
    panel.append(section);
  }
  panel.append(link("Revision hub overview",prefix+"home"));
  group("Lecture chapters",window.ICT200_CONTENT.chapters);
  group("Practice studios",window.ICT200_CONTENT.modules);
  panel.append(link("ERD worked-answer library","erd-walkthrough.html"));
  const library=link("Question list",walker?"erd-walkthrough.html":"#erd");
  const context=link(walker?"ERD Studio":"ICT200 Revision Hub",prefix+(walker?"erd":"home"));
  context.className="erd-hub-context";
  bar.append(trigger,panel,library,context);
  function expand(open) {
    panel.hidden=!open;
    trigger.setAttribute("aria-expanded",String(open));
  }
  trigger.onclick=()=>expand(panel.hidden);
  bar.addEventListener("keydown",event=>{
    if(event.key==="Escape" && !panel.hidden) {
      expand(false);
      trigger.focus();
      event.preventDefault();
    }
  });
  bar.addEventListener("focusout",event=>{if(!bar.contains(event.relatedTarget)) expand(false);});
  document.addEventListener("pointerdown",event=>{if(!bar.contains(event.target)) expand(false);});
  panel.addEventListener("click",event=>{
    if(event.target.closest("a")) {expand(false);trigger.focus({preventScroll:true});}
  });
  function sync() {
    const route=location.hash.slice(1);
    const visible=walker || route==="erd" || route.startsWith("erd/");
    bar.hidden=false;
    document.body.classList.toggle("hub-home",!walker && (!route || route==="home"));
    library.hidden=!visible; context.hidden=false;
    expand(false);
    if(!visible) return;
    const libraryOpen=walker ? !window.ICT200_ERD.questions.some(q=>q.parts.includes(route.split("/")[0])) : route==="erd";
    if(libraryOpen) library.setAttribute("aria-current","page");
    else library.removeAttribute("aria-current");
    if(walker) context.href=prefix+"erd"+(libraryOpen?"":"/"+route.split("/")[0]);
  }
  window.addEventListener("hashchange",sync);
  sync();
})();
