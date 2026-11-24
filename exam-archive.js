(() => {
  "use strict";
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const titles=c=>c.chen.length?["Read the original diagram","Identify the Chen symbols","Complete the answer"]:["Read the business rules","Identify entities and keys","Connect the records",...(c.hierarchy.length?["Draw the subtype hierarchy"]:[]),"Check the complete answer"];
  function paper(c,open,colour=true){
    const marks=src=>colour?(globalThis.ICT200_EVIDENCE?.[src]||[]).map(([k,x,y,w,h])=>'<i aria-hidden="true" class="arc-'+k+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"></i>').join(''):'';
    const legend=colour?'<p class="arc-legend"><span class="arc-entity">Entity</span> <span class="arc-attr">Attribute or key</span> <span class="arc-subtype">Relationship or subtype</span> <span class="arc-rule">Participation</span></p>':"";
    return '<details class="source-paper archive-paper" '+(open?'open':'')+'><summary>Original exercise · '+esc(c.term)+' · '+esc(c.ref)+'</summary>'+legend+c.images.map((src,i)=>'<a class="source-scan" href="'+src+'" target="_blank" rel="noopener"><img loading="lazy" src="'+src+'" alt="'+esc(c.title)+' · original printed question, page '+c.pages[i][0]+'">'+marks(src)+'</a>').join("")+'</details>';
  }
  const list=items=>'<ul class="teaching-points">'+items.map(x=>'<li>'+x+'</li>').join("")+'</ul>';
  function marked(s,c){
    const names=Object.keys(c.entities),fields=Object.values(c.entities).flat().map(f=>f.name);
    const words=new Map([...fields.map(f=>[f.toLowerCase(),"attr"]),...names.map(n=>[n.toLowerCase(),"entity"]),...names.map(n=>[n.toLowerCase().replaceAll("_"," "),"entity"]),...["disjoint","total","exclusive","subtype","exactly one","at least one","multiple","many","optional"].map(w=>[w,"rule"])]);
    for(const [, , , ,kids] of c.hierarchy)for(const [name,value] of Object.entries(kids)){words.set(name.toLowerCase(),"subtype");words.set(value.toLowerCase(),"subtype");}
    const rx=new RegExp("\\b("+[...words.keys()].sort((a,b)=>b.length-a.length).join("|")+")\\b","gi");
    let html="",at=0;for(const m of s.matchAll(rx)){html+=esc(s.slice(at,m.index))+'<mark class="arc-'+words.get(m[0].toLowerCase())+'">'+esc(m[0])+'</mark>';at=m.index+m[0].length;}return html+esc(s.slice(at));
  }
  function figure(c){return '<div class="arc-figure" tabindex="0" aria-label="Scrollable worked diagram">'+c.svg.replace(/<a\b[^>]*>/g,"<g>").replaceAll("</a>","</g>")+'</div>';}
  const counts={"1":"exactly one","0..1":"zero or one","0..*":"zero or many","1..*":"one or more"};
  function step(c,i){
    const t=titles(c),title=t[i];let body;
    if(i===0) body=(c.clues.length?list(c.clues.map(s=>marked(s,c))):"")+list(c.notes.slice(0,1).map(s=>marked(s,c)));
    else if(i===t.length-1) body=figure(c)+list(c.notes.map(s=>marked(s,c)))+(c.reports.length?"<h4>Two information outputs</h4>"+list(c.reports.map(esc)):"");
    else if(c.chen.length) body=figure(c)+list(c.notes.map(esc));
    else if(i===1) body=list(Object.entries(c.entities).map(([n,fields])=>'<strong class="'+(c.hierarchy.some(h=>n in h[4])?"arc-subtype":"arc-entity")+'">'+esc(n)+'</strong> · '+fields.map(f=>'<span class="arc-attr">'+esc(f.name)+'</span>'+(f.role?' <b class="arc-key">'+esc(f.role)+'</b>':'')).join(", ")));
    else if(i===2) body=c.links.length?list(c.links.map(l=>'<strong>'+l.parent+' → '+l.child+'</strong> · '+esc(l.verb)+'<br>Each '+l.child+' refers to '+counts[l.ends[0]]+' '+l.parent+'. Each '+l.parent+' can link to '+counts[l.ends[1]]+' '+l.child+' record(s). FK in '+l.child+' · '+l.fk+'.')):'<p>The question asks for entities and attributes only.</p>';
    else body=list(c.hierarchy.map(([p,d,k,total,kids])=>'<strong>'+p+'</strong> uses '+d+'. Draw '+k+' for '+(k==='d'?'disjoint':'overlapping')+' and '+(total==='total'?'two bars for total':'one bar for partial')+' completeness. '+Object.entries(kids).map(([a,b])=>esc(b)+' → '+a).join(' · ')))+list(c.notes.filter(s=>/subtype|categor|exclusive|disjoint|discriminator/i.test(s)).map(s=>marked(s,c)));
    return '<article class="step"><small>Step '+(i+1)+' of '+t.length+'</small><h3 tabindex="-1">'+title+'</h3>'+body+'</article>';
  }
  const attempts=new Map();
  function studio(root,c,complete){
    const slots={...c.slots};
    c.links.forEach((l,i)=>l.ends.forEach((v,e)=>slots['end'+i+'_'+e]={value:v,kind:"Cardinality"}));
    const kinds=[...new Set(Object.values(slots).map(s=>s.kind))];
    const state=attempts.get(c.id)||{placed:{},kind:kinds[0]};attempts.set(c.id,state);
    let selected="",hints=true;try{hints=localStorage.getItem("ict200.erd.colourHints")!=="off";}catch{}
    root.innerHTML='<h1>'+esc(c.title)+'</h1>'+paper(c,false,false)+'<p>Choose a stage. Drag a tile to a question mark, or select the tile and then its target. The other parts of the diagram stay visible for reference.</p><label>Stage <select class="arc-stage"></select></label> <label><input type="checkbox" class="arc-toggle"> Colour hints</label><div class="arc-bank" aria-label="Answer tiles"></div><div class="arc-board"></div><button type="button" class="button arc-check">Check stage</button> <button type="button" class="button secondary arc-clear">Clear stage</button><p role="status" class="arc-status"></p><a href="erd-walkthrough.html#'+c.id+'">Read the worked answer</a>';
    const find=s=>root.querySelector(s),status=find(".arc-status"),menu=find(".arc-stage"),bank=find(".arc-bank"),board=find(".arc-board");
    kinds.forEach(k=>menu.add(new Option(k,k)));menu.value=state.kind;find(".arc-toggle").checked=hints;
    function correct(id){
      const spec=slots[id],value=state.placed[id];
      if(spec.kind!=="Attribute" || !spec.owner)return value===spec.value;
      const group=Object.entries(slots).filter(([,other])=>other.owner===spec.owner && other.role===spec.role);
      return group.some(([,other])=>other.value===value) && group.filter(([key])=>state.placed[key]===value).length===1;
    }
    function paint(){
      const k=state.kind,entries=Object.entries(slots).filter(([,s])=>s.kind===k);bank.replaceChildren();root.classList.toggle("arc-no-hints",!hints);bank.dataset.kind=k;
      const values=[...new Set([...entries.map(([,s])=>s.value),...(k==="Cardinality"?Object.keys(counts):k==="Completeness"?["─","══"]:k==="Subtype rule"?["d","o"]:[])])].sort();
      for(const v of values){const b=document.createElement("button");b.type="button";b.textContent=v;b.draggable=true;
        if(k==="Cardinality" && !c.chen.length){const mark={"1":"one","0..1":"zeroOne","0..*":"zeroMany","1..*":"oneMany"}[v];if(mark)b.prepend(ICT200_ERD.makeSymbol(mark));}
        b.title=counts[v]||v;b.setAttribute("aria-pressed",String(v===selected));b.onclick=()=>{selected=v;paint();status.textContent="Selected "+v+". Choose a target.";};b.ondragstart=e=>{selected=v;e.dataTransfer.setData("text/plain",v);};bank.append(b);}
      board.innerHTML='<div class="arc-figure" tabindex="0" aria-label="Scrollable practice diagram"></div>';
      const wrap=board.firstElementChild;wrap.innerHTML=c.svg;
      wrap.querySelectorAll('g.node>title').forEach(t=>t.remove());
      function target(node,id,txt){
        const value=state.placed[id];txt.textContent=value||"?";node.classList.add("arc-target");node.setAttribute("role","button");node.setAttribute("tabindex","0");node.setAttribute("aria-label",k+" target "+(entries.findIndex(([key])=>key===id)+1)+(value?" · "+value:""));node.dataset.slot=id;
        const put=()=>{if(!selected){status.textContent="Choose an answer tile first.";return;}state.placed[id]=selected;selected="";paint();status.textContent="Placed. Use Check stage to check your choices.";};
        node.onclick=e=>{e.preventDefault();put();};node.onkeydown=e=>{if(["Enter"," "].includes(e.key)){e.preventDefault();put();}};node.ondragover=e=>e.preventDefault();node.ondrop=e=>{e.preventDefault();selected=e.dataTransfer.getData("text/plain");if(values.includes(selected))put();};
      }
      wrap.querySelectorAll("title").forEach(n=>n.remove());
      for(const a of wrap.querySelectorAll("a")){const id=(a.getAttribute("xlink:href")||"").slice(1);a.removeAttribute("xlink:href");a.removeAttribute("xlink:title");if(slots[id]?.kind===k){const t=a.querySelector("text");if(t)target(a,id,t);}}
      if(k==="Attribute"&&Object.values(slots).some(s=>s.owner))board.insertAdjacentHTML("afterbegin","<p>Attributes with the same key role can appear in any order within their entity.</p>");
      if(k==="Cardinality"&&c.links.length){
        wrap.querySelectorAll("g.edge polygon,g.edge ellipse,g.edge polyline").forEach(n=>n.style.visibility="hidden");
        const section=document.createElement("div");section.className="arc-ends";board.prepend(section);
        c.links.forEach((l,i)=>{for(const [e,label] of [[0,"For one "+l.child+", how many "+l.parent+" records?"],[1,"For one "+l.parent+", how many "+l.child+" records?"]]){const line=document.createElement("p");line.append(label+" ");const b=document.createElement("button");line.append(b);section.append(line);target(b,"end"+i+"_"+e,b);}});
      }
    }
    menu.onchange=()=>{state.kind=menu.value;selected="";status.textContent="";paint();};
    find(".arc-toggle").onchange=e=>{hints=e.target.checked;try{localStorage.setItem("ict200.erd.colourHints",hints?"on":"off");}catch{}paint();};
    find(".arc-clear").onclick=()=>{for(const [id,s] of Object.entries(slots))if(s.kind===state.kind)delete state.placed[id];selected="";paint();status.textContent="Stage cleared.";};
    find(".arc-check").onclick=()=>{let right=0,total=0;for(const n of board.querySelectorAll("[data-slot]")){const id=n.dataset.slot,ok=correct(id);total++;right+=Number(ok);n.classList.toggle("needs-work",!ok);n.classList.toggle("is-right",ok);n.setAttribute("aria-label",slots[id].kind+" · "+(state.placed[id]||"empty")+" · "+(ok?"correct":"revise"));}
      status.textContent=right+" of "+total+" correct. "+(right===total?"Choose another stage.":"Check the marked targets against the original question.");
      if(Object.keys(slots).every(correct)){complete(c.id);status.textContent="All stages complete. Your diagram matches the worked model.";}};
    paint();
  }
  globalThis.ICT200_ARCHIVE={paper,step,studio,titles};
})();
