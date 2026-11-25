(() => {
  "use strict";
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const titles=c=>c.walk.map(stage=>stage.title);
  function paper(c,open,colour=true){
    const marks=src=>colour?(globalThis.ICT200_EVIDENCE?.[src]||[]).map(([k,x,y,w,h])=>'<i aria-hidden="true" class="arc-'+k+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"></i>').join(''):'';
    const legend=colour?'<p class="arc-legend"><span class="arc-entity">Entity</span> <span class="arc-attr">Attribute or key</span> <span class="arc-subtype">Relationship or subtype</span> <span class="arc-rule">Participation</span>'+(c.hierarchy.length?' <span class="arc-bars">Completeness</span>':'')+'</p>':"";
    return '<details class="source-paper archive-paper" '+(open?'open':'')+'><summary>Original exercise · '+esc(c.term)+' · '+esc(c.ref)+' · '+(c.pages.length>1?'pp. ':'p. ')+c.pages.map(p=>p[0]).join('–')+'</summary>'+legend+c.images.map((src,i)=>'<a class="source-scan" href="'+src+'" target="_blank" rel="noopener"><img loading="lazy" src="'+src+'" alt="'+esc(c.title)+' · original printed question, page '+c.pages[i][0]+'">'+marks(src)+'</a>').join("")+'</details>';
  }
  const list=items=>'<ul class="teaching-points">'+items.map(x=>'<li>'+x+'</li>').join("")+'</ul>';
  function marked(s,c){
    const names=Object.keys(c.entities),fields=Object.values(c.entities).flat().map(f=>f.name);
    const words=new Map([...fields.map(f=>[f.toLowerCase(),"attr"]),...names.map(n=>[n.toLowerCase(),"entity"]),...names.map(n=>[n.toLowerCase().replaceAll("_"," "),"entity"]),...["disjoint","overlapping","exclusive","exactly one","at least one","multiple","many","optional"].map(w=>[w,"rule"]),...["total","partial","two bars","one bar"].map(w=>[w,"bars"]),["subtype","subtype"]]);
    for(const [, , , ,kids] of c.hierarchy)for(const [name,value] of Object.entries(kids)){words.set(name.toLowerCase(),"subtype");words.set(value.toLowerCase(),"subtype");}
    const patterns=[...words.keys()].sort((a,b)=>b.length-a.length).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
    const rx=new RegExp("\\b("+patterns.join("|")+")\\b","gi");
    let html="",at=0;for(const m of s.matchAll(rx)){html+=esc(s.slice(at,m.index))+'<mark class="arc-'+words.get(m[0].toLowerCase())+'">'+esc(m[0])+'</mark>';at=m.index+m[0].length;}return html+esc(s.slice(at));
  }
  const counts={"1":"exactly one","0..1":"zero or one","0..*":"zero or many","1..*":"one or more"};
  let fixedLayout=true;
  try{fixedLayout=localStorage.getItem("ict200.erd.fixedLayout")!=="off";}catch{}
  const svgCache=new Map();
  function growingDiagram(c,index){
    const cacheKey=c.id+"/"+index;
    if(svgCache.has(cacheKey))return svgCache.get(cacheKey);
    const parse=s=>new DOMParser().parseFromString(s,"image/svg+xml");
    const drawing=parse(c.svg);
    const seen=new Set(), active=new Set();
    for(const stage of c.walk.slice(0,index+1)){
      if(!stage.svg)continue;
      const layer=parse(stage.svg);
      for(const group of layer.querySelectorAll("g.node,g.edge"))seen.add(group.querySelector("title")?.textContent);
      for(const anchor of layer.querySelectorAll("a"))active.add(anchor.getAttribute("xlink:href"));
    }
    for(const group of drawing.querySelectorAll("g.node,g.edge")){
      if(!seen.has(group.querySelector("title")?.textContent))group.remove();
    }
    for(const anchor of drawing.querySelectorAll("a")){
      if(!active.has(anchor.getAttribute("xlink:href")))anchor.remove();
    }
    const result=new XMLSerializer().serializeToString(drawing.documentElement);
    svgCache.set(cacheKey,result);
    return result;
  }
  function bindStepView(root,refresh){
    const toggle=root.querySelector(".arc-fixed-layout");
    if(toggle)toggle.onchange=()=>{
      fixedLayout=toggle.checked;
      try{localStorage.setItem("ict200.erd.fixedLayout",fixedLayout?"on":"off");}catch{}
      refresh();
      root.querySelector(".arc-fixed-layout")?.focus({preventScroll:true});
    };
  }
  function step(c,index){
    const stage = c.walk[index];
    const hasLayout=stage.svg && !c.chen.length;
    const showDiagram=Boolean(stage.svg) || index===c.walk.length-1;
    const layoutControl=hasLayout?'<label class="arc-layout-option"><input type="checkbox" class="arc-fixed-layout" '+(fixedLayout?'checked':'')+'> Keep entities in the same positions</label>':'';
    const drawing = (hasLayout && fixedLayout?growingDiagram(c,index):stage.svg || c.svg).replace(/<a\b[^>]*>/g,"<g>").replaceAll("</a>","</g>").replaceAll(">—</text>","></text>");
    const final = index === c.walk.length-1;
    const clue = stage.clue ? " · "+marked(stage.clue,c) : "";
    const reports = final && c.reports.length ? "<h4>Two information outputs</h4>"+list(c.reports.map(s=>marked(s,c))) : "";
    const evidence = stage.evidence ? "<details><summary>Find these words in the question</summary>"+list(stage.evidence.map(s=>marked(s,c)))+"</details>" : "";
    return '<article class="step"><small>Step '+(index+1)+' of '+c.walk.length+'</small><h3 tabindex="-1">'+esc(stage.title)+'</h3>'+
      '<blockquote class="clue"><span class="label">'+esc(stage.label)+'</span>'+clue+'</blockquote>'+
      '<p><strong>'+esc(stage.ask)+'</strong></p>'+list(stage.points.map(s=>marked(s,c)))+
      layoutControl+(showDiagram?'<div class="arc-figure" tabindex="0" aria-label="'+esc(c.title+" · "+stage.title)+'">'+drawing+'</div>':'')+evidence+reports+'</article>';
  }
  function references(c) {
    const refs = c.links.map(link => [link.child, link.fk, link.parent]);
    for (const [parent, , , , children] of c.hierarchy) {
      for (const child of Object.keys(children)) refs.push([child, c.entities[child][0].name, parent]);
    }
    return refs.map(([child, field, parent]) => ({
      kind:"Referenced key", field:child+"."+field,
      value:parent+"."+c.entities[parent].filter(f=>f.pk).map(f=>f.name).join(" + ")
    }));
  }
  const attempts=new Map();
  function studio(root,c,complete){
    const slots={...c.slots};
    c.links.forEach((l,i)=>l.ends.forEach((v,e)=>slots['end'+i+'_'+e]={value:v,kind:"Cardinality"}));
    const predicates=Object.keys(c.slots).filter(id=>c.slots[id].kind==="Relationship");
    c.links.forEach((l,i)=>{slots["strength"+i]={value:c.entities[l.child].find(f=>f.name===l.fk).pk?"Identifying":"Non-identifying",kind:"Line style"};});
    references(c).forEach((ref,i)=>slots["ref"+i]=ref);
    const kinds=[...new Set(Object.values(slots).map(s=>s.kind))];
    const state=attempts.get(c.id)||{placed:{},kind:kinds[0]};attempts.set(c.id,state);
    let selected="",hints=true;try{hints=localStorage.getItem("ict200.erd.colourHints")!=="off";}catch{}
    state.responses ||= {};
    const checks=c.checks || [];
    const ruleForm=checks.length?'<section class="arc-rules"><h2>'+(c.reading?'Answer the exam question':'Check the business rules')+'</h2>'+checks.map(([question,...choices],i)=>
      '<fieldset><legend>'+esc(question)+'</legend>'+choices.slice().sort((a,b)=>a.localeCompare(b)).map(choice=>
        '<label><input type="radio" name="rule-'+i+'" data-rule="'+i+'" value="'+esc(choice)+'" '+(state.responses[i]===choice?'checked':'')+'> '+esc(choice)+'</label>').join("")+'<small aria-live="polite"></small></fieldset>').join("")+
      '<button type="button" class="button secondary arc-check-rules">Check answers</button><p role="status" class="arc-rule-status"></p></section>':'';
    const decisions=Object.values(c.rules || {});
    const assumptions=decisions.length?'<details class="arc-guidance"><summary>Worked-model assumptions and guidance</summary>'+list(decisions.map(s=>marked(s,c)))+'</details>':'';
    const hintSwitch='<label class="erd-hint-switch"><input type="checkbox" class="arc-toggle"> Colour hints</label>';
    root.innerHTML=(c.reading?hintSwitch:'')+'<h1 class="erd-title">'+esc(c.title)+'</h1>'+paper(c,true)+ruleForm+assumptions+
      (c.reading?'<details class="arc-extension"><summary>Optional diagram practice</summary>':'')+
      '<p class="muted">Choose a tile group. Drag a tile to an outlined space, or select a tile and then its target. Check each group as you build the diagram.</p>'+
      '<div class="erd-workbench erd-individual arc-workbench"><div class="erd-drag-area">'+
      '<section class="erd-palette"><div class="erd-bank-heading"><h4>Tiles</h4>'+(c.reading?'':hintSwitch)+'</div>'+
      '<label class="erd-group-label">Tile group <select class="arc-stage erd-group-select"></select></label>'+
      '<input type="search" class="erd-attribute-search" aria-label="Find an attribute" placeholder="Find an attribute" hidden>'+
      '<div class="arc-bank erd-tiles" aria-label="Answer tiles"></div><p class="erd-no-matches" hidden>No matching attributes.</p>'+
      '<button type="button" class="button secondary arc-jump">Go to a matching target</button></section>'+
      '<div class="erd-board arc-board"></div></div><div class="button-row"><button type="button" class="button arc-check">Check stage</button> '+
      '<button type="button" class="button secondary arc-check-all">Check my diagram</button> '+
      '<button type="button" class="button secondary arc-clear">Clear stage</button></div><p role="status" class="arc-status"></p></div>'+
      (c.reading?'</details>':'')+'<a class="button secondary" href="erd-walkthrough.html#'+c.id+'">View step-by-step worked answer</a>';
    const find=s=>root.querySelector(s),status=find(".arc-status"),menu=find(".arc-stage"),bank=find(".arc-bank"),board=find(".arc-board");
    const ruleScore=()=>checks.filter((q,i)=>state.responses[i]===q[1]).length;
    function finish(){
      if(ruleScore()!==checks.length)return false;
      if(!c.reading && !Object.keys(slots).every(correct))return false;
      complete(c.id);
      return true;
    }
    for(const input of root.querySelectorAll("[data-rule]"))input.onchange=()=>{
      state.responses[input.dataset.rule]=input.value;
      input.closest("fieldset").querySelector("small").textContent="";
      find(".arc-rule-status").textContent="";
    };
    if(checks.length)find(".arc-check-rules").onclick=()=>{
      root.querySelectorAll(".arc-rules fieldset").forEach((box,i)=>{
        box.querySelector("small").textContent=state.responses[i]===checks[i][1]?"Correct.":state.responses[i]?"Review the wording and try again.":"Choose an answer.";
      });
      find(".arc-rule-status").textContent=ruleScore()+" of "+checks.length+" correct. "+(finish()?"Exercise complete.":ruleScore()===checks.length?"Continue with the diagram.":"");
    };
    const workbench=find(".arc-workbench"), search=find(".erd-attribute-search");
    function filterBank(){
      const query=search.hidden?"":search.value.trim().toLowerCase();
      for(const tile of bank.children)tile.hidden=!tile.textContent.toLowerCase().includes(query);
      find(".erd-no-matches").hidden=Array.from(bank.children).some(tile=>!tile.hidden);
    }
    search.oninput=filterBank;
    find(".arc-jump").onclick=()=>{
      const target=board.querySelector('.arc-figure .arc-target:not([data-filled="true"])') || board.querySelector(".arc-figure .arc-target");
      if(target)target.focus();
    };
    kinds.forEach(k=>menu.add(new Option(k,k)));menu.value=state.kind;find(".arc-toggle").checked=hints;
    // Each key cell is followed by its attribute in the diagram. Mark the field the student placed there.
    const fieldsByKey=new Map();
    for(const [id,s] of Object.entries(c.slots)){
      if(s.kind==="Attribute" && s.owner)fieldsByKey.set("s"+(Number(id.slice(1))-1),id);
    }
    function roleAt(id){
      const attr=fieldsByKey.get(id),s=slots[attr];
      if(!s)return slots[id].value;
      const name=state.placed[attr] || s.value;
      return c.entities[s.owner].find(field=>field.name===name)?.role || "—";
    }
    function correct(id){
      const spec=slots[id],value=state.placed[id];
      if(spec.kind==="Key" && spec.owner){
        const role=roleAt(id);
        if(role==="—")return !value || value==="—";
        if(!role.includes("FK"))return value===role;
        if(!value || role.includes("PK")!==value.includes("PK"))return false;
        const fk=value.match(/FK(\d+)/)?.[1];
        const count=c.entities[spec.owner].filter(f=>f.role.includes("FK")).length;
        const uses=Object.entries(slots).filter(([key,s])=>s.owner===spec.owner && s.kind==="Key" && state.placed[key]?.match(/FK(\d+)/)?.[1]===fk).length;
        return !!fk && Number(fk)>=1 && Number(fk)<=count && uses===1;
      }
      if(spec.kind!=="Attribute" || !spec.owner)return value===spec.value;
      const group=Object.entries(slots).filter(([,other])=>other.kind==="Attribute" && other.owner===spec.owner);
      return group.some(([,other])=>other.value===value) && group.filter(([key])=>state.placed[key]===value).length===1;
    }
    function paint(){
      const k=state.kind,entries=Object.entries(slots).filter(([,s])=>s.kind===k);bank.replaceChildren();root.classList.toggle("arc-no-hints",!hints);bank.dataset.kind=k;
      workbench.dataset.hints=hints?"on":"off";
      search.hidden=k!=="Attribute" || entries.length<=10;
      const choices=entries.flatMap(([,s])=>k==="Key"?s.value.split(", "):[s.value]);
      const alternatives={"Key":["—"],"Referenced key":Object.entries(c.entities).filter(([,fields])=>fields.some(f=>f.pk)).map(([name,fields])=>name+"."+fields.filter(f=>f.pk).map(f=>f.name).join(" + ")),"Line style":["Identifying","Non-identifying"],"Cardinality":c.chen.length?["1","M"]:Object.keys(counts),"Completeness":["─","══"],"Subtype rule":["d","o"]};
      const values=[...new Set([...choices,...(alternatives[k]||[])])].sort();
      for(const v of values){const b=document.createElement("button");b.type="button";b.textContent=v;b.draggable=true;
        b.className="erd-tile";
        b.dataset.ink=k==="Key"?(v.includes("FK")?"FK":"PK"):({"Entity":c.hierarchy.some(h=>v in h[4])?"subtype":"entity","Attribute":"attribute","Cardinality":"end","Line style":"line","Relationship":"line","Completeness":"bars","Subtype rule":"category","Subtype value":"attribute"})[k];
        if(k==="Cardinality" && !c.chen.length){const mark={"1":"one","0..1":"zeroOne","0..*":"zeroMany","1..*":"oneMany"}[v];if(mark)b.prepend(ICT200_ERD.makeSymbol(mark));}
        if(k==="Line style")b.prepend(ICT200_ERD.makeSymbol(v==="Identifying"?"solid":"dashed"));
        b.title=counts[v]||v;b.setAttribute("aria-pressed",String(v===selected));b.onclick=()=>{selected=v;paint();status.textContent="Selected "+v+". Choose a target.";};b.ondragstart=e=>{selected=v;e.dataTransfer.setData("text/plain",v);};bank.append(b);}
      filterBank();
      const scrollLeft=board.querySelector(".arc-figure")?.scrollLeft || 0;
      const scrollTop=board.querySelector(".arc-figure")?.scrollTop || 0;
      board.innerHTML='<div class="arc-figure" tabindex="0" aria-label="Scrollable practice diagram"></div>';
      const wrap=board.firstElementChild;wrap.innerHTML=c.svg;
      wrap.querySelectorAll('g.node>title').forEach(t=>t.remove());
      function target(node,id,txt){
        const value=state.placed[id];
        if(txt.tagName==="text" && !node.querySelector("rect,polygon,circle,ellipse")){
          const bounds=txt.getBBox(),r=document.createElementNS("http://www.w3.org/2000/svg","rect");
          r.setAttribute("x",bounds.x-3);r.setAttribute("y",bounds.y-2);
          r.setAttribute("width",Math.max(24,bounds.width+6));r.setAttribute("height",bounds.height+4);
          r.setAttribute("rx","3");txt.before(r);
        }
        txt.textContent=k==="Line style" && value?(value==="Identifying"?"Solid":"Dashed"):value||"?";
        node.classList.add("arc-target");node.setAttribute("role","button");node.setAttribute("tabindex","0");
        node.setAttribute("aria-label",k+" target "+(entries.findIndex(([key])=>key===id)+1)+(value?" · "+value:""));
        node.dataset.slot=id;node.dataset.filled=String(Boolean(value));
        const put=()=>{
          if(!selected){status.textContent="Choose an answer tile first.";return;}
          if(k==="Key" && selected!=="—"){
            const parts=(value||"").split(", ");
            const pk=selected==="PK" || parts.includes("PK");
            const fk=selected.startsWith("FK")?selected:parts.find(v=>v.startsWith("FK"));
            state.placed[id]=[pk?"PK":"",fk].filter(Boolean).join(", ");
          } else state.placed[id]=selected;
          selected="";paint();
          const placedNode=board.querySelector('[data-end-proxy="'+id+'"],[data-slot="'+id+'"]');
          placedNode?.focus({preventScroll:true});
          status.textContent="Placed. Use Check stage to check your choices.";
        };
        node.onclick=e=>{e.preventDefault();put();};node.onkeydown=e=>{if(["Enter"," "].includes(e.key)){e.preventDefault();put();}};node.ondragover=e=>e.preventDefault();node.ondrop=e=>{e.preventDefault();selected=e.dataTransfer.getData("text/plain");if(values.includes(selected))put();};
      }
      if(k==="Referenced key"){
        wrap.replaceChildren();
        wrap.setAttribute("aria-label","Foreign key references");
        for(const [id,spec] of entries){
          const row=document.createElement("p"),button=document.createElement("button");
          row.append(spec.field+" references ",button);
          wrap.append(row);target(button,id,button);
        }
        return;
      }
      wrap.querySelectorAll("title").forEach(n=>n.remove());
      for(const a of wrap.querySelectorAll("a")){const id=(a.getAttribute("xlink:href")||"").slice(1);if(slots[id]?.kind==="Attribute")a.dataset.attributeSlot=id;if(c.links.length && predicates.includes(id))a.closest("g.edge").dataset.relation=predicates.indexOf(id);a.removeAttribute("xlink:href");a.removeAttribute("xlink:title");if(k==="Line style" && predicates.includes(id)){
          const slot="strength"+predicates.indexOf(id),line=a.closest(".edge")?.querySelector("path");
          if(line)line.setAttribute("stroke-dasharray",state.placed[slot]==="Non-identifying"?"5,3":"none");
          const text=a.querySelector("text");if(text)target(a,slot,text);
        }else if(slots[id]?.kind===k){const t=a.querySelector("text");if(t)target(a,id,t);}
        else if(slots[id]){
          const t=a.querySelector("text");
          const spec=slots[id];
          // Keep enough context to identify a destination when the group is attempted first.
          const context=(spec.kind==="Entity" && k!=="Entity") ||
            (k==="Entity" && (spec.kind==="Relationship" || (spec.kind==="Attribute" && (spec.role?.includes("PK") || c.entities[spec.owner]?.find(f=>!f.role)?.name===spec.value)))) ||
            (k==="Key" && spec.kind==="Attribute") || (k==="Attribute" && spec.kind==="Key");
          if(t)t.textContent=state.placed[id] || (context?(spec.kind==="Key"?roleAt(id):spec.value):"·");
        }}
      for(const cell of wrap.querySelectorAll("a[data-attribute-slot]")){
        const keyId="s"+(Number(cell.dataset.attributeSlot.slice(1))-1);
        if(!fieldsByKey.has(keyId))continue;
        const txt=cell.querySelector("text");
        if(!txt)continue;
        const role=state.placed[keyId] || (k==="Key"?"":roleAt(keyId));
        txt.style.textDecoration=txt.textContent!=="?" && role.includes("PK")?"underline":"none";
        if(!cell.classList.contains("arc-target")){
          txt.setAttribute("fill",role.includes("FK")?(role.includes("PK")?"#7030A0":"#A44200"):role.includes("PK")?"#185ABD":"#006B58");
        }
      }
      // Preserve the student's relationship choices between tile groups.
      for(const edge of wrap.querySelectorAll("g.edge[data-relation]")){
        const id=edge.dataset.relation, path=edge.querySelector("path");
        const strength=state.placed["strength"+id];
        if(path)path.setAttribute("stroke-dasharray",strength==="Non-identifying"?"5,3":strength?"none":"2,3");
      }
      if(k==="Attribute"&&Object.values(slots).some(s=>s.owner))board.insertAdjacentHTML("afterbegin","<p>List an entity’s attributes in any order. Place the correct key label beside each one. You may renumber its foreign keys. Match each foreign key to its parent in Referenced key.</p>");
      if(k==="Key")board.insertAdjacentHTML("afterbegin","<p>Drop PK and FK labels beside an attribute. A shared key can take both. Leave ordinary attributes blank. Use the dash tile to clear a key.</p>");
      if(c.links.length){
        for(const edge of wrap.querySelectorAll("g.edge[data-relation]")){
          const index=edge.dataset.relation;
          if(k!=="Cardinality" && [0,1].every(end=>correct("end"+index+"_"+end)))continue;
          edge.querySelectorAll("polygon,ellipse,polyline").forEach(n=>n.style.visibility="hidden");
          const path=edge.querySelector("path"),ns="http://www.w3.org/2000/svg";
          for(const end of [0,1]){
            const point=path.getPointAtLength(end?path.getTotalLength():0),id="end"+edge.dataset.relation+"_"+end;
            const g=document.createElementNS(ns,"g"),rect=document.createElementNS(ns,"rect"),text=document.createElementNS(ns,"text");
            g.setAttribute("transform","translate("+point.x+" "+point.y+")");rect.setAttribute("x","-12");rect.setAttribute("y","-7");rect.setAttribute("width","24");rect.setAttribute("height","14");rect.setAttribute("rx","3");rect.setAttribute("fill","#f6fbff");rect.setAttribute("stroke","#35718d");
            text.setAttribute("text-anchor","middle");text.setAttribute("y","3");text.setAttribute("font-size","9");
            g.append(rect,text);edge.append(g);
            if(k==="Cardinality"){target(g,id,text);delete g.dataset.slot;g.dataset.endProxy=id;}
            else{text.textContent=state.placed[id] || "·";}
          }
        }
      }
      if(k==="Cardinality" && c.links.length){
        const extra=document.createElement("details");extra.className="arc-ends-panel";const summary=document.createElement("summary");summary.textContent="Read each relationship in words";extra.append(summary);
        const section=document.createElement("div");section.className="arc-ends";extra.append(section);board.append(extra);
        c.links.forEach((l,i)=>{for(const [e,label] of [[0,"For one "+l.child+", how many "+l.parent+" records?"],[1,"For one "+l.parent+", how many "+l.child+" records?"]]){const line=document.createElement("p");line.append(label+" ");const b=document.createElement("button");line.append(b);section.append(line);target(b,"end"+i+"_"+e,b);}});
      }
      wrap.scrollLeft=scrollLeft;
      wrap.scrollTop=scrollTop;
    }
    menu.onchange=()=>{state.kind=menu.value;selected="";search.value="";status.textContent="";paint();};
    find(".arc-toggle").onchange=e=>{hints=e.target.checked;try{localStorage.setItem("ict200.erd.colourHints",hints?"on":"off");}catch{}paint();};
    find(".arc-clear").onclick=()=>{for(const [id,s] of Object.entries(slots))if(s.kind===state.kind)delete state.placed[id];selected="";paint();status.textContent="Stage cleared.";};
    find(".arc-check-all").onclick=()=>{
      const ids=Object.keys(slots), missing=ids.filter(id=>!correct(id));
      if(!missing.length){status.textContent=finish()?"All stages complete. Your diagram matches the worked model.":"Diagram complete. Check the business rules above.";return;}
      menu.value=slots[missing[0]].kind;menu.onchange();
      find(".arc-check").click();
      const feedback=status.textContent;
      status.textContent=(ids.length-missing.length)+" of "+ids.length+" diagram targets correct. Review "+menu.value+". "+feedback;
      board.querySelector(".arc-figure .needs-work")?.focus({preventScroll:true});
    };
    find(".arc-check").onclick=()=>{let right=0,total=0;for(const n of board.querySelectorAll("[data-slot]")){const id=n.dataset.slot,ok=correct(id);total++;right+=Number(ok);n.classList.toggle("needs-work",!ok);n.classList.toggle("is-right",ok);n.setAttribute("aria-label",slots[id].kind+" · "+(state.placed[id]||"empty")+" · "+(ok?"correct":"revise"));}
      for(const proxy of board.querySelectorAll("[data-end-proxy]")){
        const ok=correct(proxy.dataset.endProxy);proxy.classList.toggle("needs-work",!ok);proxy.classList.toggle("is-right",ok);
      }
      const advice={"Referenced key":"Trace each foreign key to the primary key of the table it references.","Entity":"Use the identifying attributes to name each box.","Attribute":"Check which entity owns the fact and which fields identify its records.","Key":"Trace the attribute to its parent. A shared key can carry both PK and FK.","Relationship":"Read the verb from the first entity to the second.","Cardinality":"Hold one record fixed and count records at the opposite end.","Line style":"Use a solid line when the parent key helps identify the child.","Subtype rule":"Can one record belong to both subtypes?","Completeness":"Can the supertype have a record in neither subtype?","Subtype value":"Match each discriminator value to its branch."};
      status.textContent=right+" of "+total+" correct. "+(right===total?"Choose another tile group.":advice[state.kind]);
      if(Object.keys(slots).every(correct)){status.textContent=finish()?"All stages complete. Your diagram matches the worked model.":"Diagram complete. Check the business rules above.";}};
    paint();
  }
  globalThis.ICT200_ARCHIVE={paper,step,studio,titles,references,bindStepView};
})();
