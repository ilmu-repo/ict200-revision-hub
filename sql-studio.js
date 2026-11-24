(() => {
  "use strict";

  const themepark=window.ICT200_SQL_EXERCISES;
  const sets=window.ICT200_SQL_SETS;
  const exercises=[...themepark,...Object.values(sets).flatMap(s=>s.exercises)];
  const STORAGE = "ict200-sql-drafts-v1";
  const priceColumns = new Set(["TICKET_PRICE","LINE_PRICE","HOUR_RATE","DAILYRATE","LINECHARGE"]);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className=className;
    if (text!==undefined) node.textContent=text;
    return node;
  }
  function button(text, className = "button") {
    const control = element("button",className,text);
    control.type="button";
    return control;
  }
  function load() {
    try {
      const result = JSON.parse(localStorage.getItem(STORAGE));
      if (result && typeof result.drafts==="object" && result.drafts!==null) return result;
    } catch (_) { /* Use a fresh attempt when storage is unavailable. */ }
    return {active:exercises[0].id,drafts:{}};
  }
  function save(state) {
    try { localStorage.setItem(STORAGE,JSON.stringify(state)); } catch (_) { /* Keep the current draft open. */ }
  }
  function clearSaved() {
    try { localStorage.removeItem(STORAGE); } catch (_) { /* Storage is unavailable. */ }
  }

  function schemas(dataset,name,exercise) {
    const details = element("details","sql-schemas");
    details.append(element("summary",null,dataset.schema?"View tables and sample rows":"Schemas · "+name));
    const list = element("div","sql-schema-list");
    dataset.tables.forEach(table=>{
      if(exercise?.kind==="CREATE" && table.name===exercise.table)return;
      if(exercise?.id==="farm-b")table={...table,rows:table.name==="ENCLOSURE"?[["A1","Main","North",12]]:table.name==="CUSTOMER"?table.rows:[]};
      const entry = element("details","sql-schema-table");
      const fields = element("ul");
      table.fields.forEach(field=>{
        const row = element("li",null,field.name + " · " + field.type);
        if (field.pk) row.append(element("span","sql-schema-key","PK"));
        if (field.fk) row.append(element("span","sql-schema-key","FK → "+field.fk));
        fields.append(row);
      });
      entry.append(element("summary",null,table.name),fields);
      if(table.rows) entry.append(grid({columns:table.fields.map(f=>f.name),rows:table.rows},table.name+" sample rows"));
      list.append(entry);
    });
    details.append(list);
    return details;
  }

  function grid(result, title) {
    const region = element("div","sql-grid");
    region.tabIndex=0;
    region.setAttribute("role","region");
    region.setAttribute("aria-label",title);
    const table = element("table");
    const caption = element("caption",null,title);
    const head = element("thead");
    const headers = element("tr");
    result.columns.forEach(name=>{
      const heading = element("th",null,name);
      heading.scope="col";
      headers.append(heading);
    });
    head.append(headers);
    const body = element("tbody");
    result.rows.forEach(data=>{
      const row = element("tr");
      data.forEach((value,index)=>{
        const display = value===null ? "NULL" : typeof value==="number" && priceColumns.has(result.columns[index].toUpperCase()) ?
          value.toFixed(2) : String(value);
        row.append(element("td",value===null?"sql-null":null,display));
      });
      body.append(row);
    });
    if (!result.rows.length) {
      const row = element("tr");
      const blank = element("td","muted","No rows returned");
      blank.colSpan=result.columns.length;
      row.append(blank);
      body.append(row);
    }
    table.append(caption,head,body);
    region.append(table);
    return region;
  }

  function disclosure(label,...children) {
    const node=element("details","sql-schemas");
    node.append(element("summary",null,label),...children);
    return node;
  }
  function workedQuery(sql) {
    const code=element("pre","sql-worked");
    const tokens=sql.match(/--[^\n]*|#[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*(?:'|$)|"(?:""|[^"])*(?:"|$)|[A-Za-z_][\w$]*|\d+(?:\.\d+)?|\s+|./g)||[];
    for(const token of tokens){
      let style="";
      if(/^(?:--|#|\/\*)/.test(token))style="comment";
      else if(/^['"]/.test(token))style="string";
      else if(/^\d/.test(token))style="number";
      else if(/^(SELECT|FROM|INNER|OUTER|LEFT|RIGHT|CROSS|JOIN|USING|ON|AS|WHERE|NOT|EXISTS|AND|OR|ORDER|GROUP|BY|HAVING|LIMIT|DESC|ASC|CASE|WHEN|THEN|ELSE|END|IN|IS|NULL|BETWEEN|LIKE|DISTINCT|CREATE|TABLE|PRIMARY|FOREIGN|KEY|REFERENCES|INSERT|INTO|VALUES|UPDATE|SET|WITH|INT|VARCHAR|DATE|DECIMAL|UNSIGNED|SMALLINT)$/i.test(token))style="keyword";
      else if(/^(COUNT|SUM|AVG|MIN|MAX|DATE_FORMAT|YEAR|CONCAT|UPPER|LOWER|ROUND|LENGTH)$/i.test(token))style="function";
      else if(/^[a-z_]/i.test(token))style="identifier";
      code.append(style?element("span","sql-"+style,token):document.createTextNode(token));
    }
    return code;
  }
  function reviewClue(task,actual,expected) {
    if(actual.columns.length!==3 || actual.columns[0].toLowerCase()!=="equipmentcode") return task.hint;
    const values=new Map(actual.rows.map(row=>[row[0],row[2]]));
    if(task.id==="hire-e") {
      if(values.has("E01")) return "Your grid includes E01. It has both a cancellation and a completed hire. Which one decides whether E01 stays in this report?";
      if(!values.has("E04")) return "E04 is missing. Its only hire was cancelled. Check whether your subquery removes equipment on every hire or only on completed hires.";
      if(!values.has("E05")) return "E05 has no hire lines. Start from EQUIPMENT so you can include an equipment type even when it has never been hired.";
    }
    if(task.id==="hire-i"){
      for(const [id,rate] of [["E02","12.00"],["E03","25.00"]]){
        const band=expected.rows.find(row=>row[0]===id)?.[2];
        if(values.has(id) && values.get(id)!==band) return id+" costs "+rate+". Your grid labels it "+String(values.get(id))+". Check which WHEN condition includes that exact rate.";
      }
    }
    return task.hint;
  }
  function mount(parent, {completed, complete, setId}) {
    const state = load();
    const set=setId || Object.keys(sets).find(k=>sets[k].exercises.some(t=>t.id===state.active)) || "themepark";
    const dataset=sets[set] || window.ICT200_THEMEPARK_SQL;
    const guided=Boolean(sets[set]);
    const tasks=guided?dataset.exercises:themepark;
    let current=tasks.find(task=>task.id===state.active) || tasks.find(task=>task.id===state.last?.[set]) || tasks[0];
    let worker = null, request = 0, timer = null, running = false;
    const section = element("section","card card-pad sql-studio");
    const heading = element("h2",null,guided?dataset.name+" · Guided practice":"THEMEPARKDB SQL Studio");
    const menu=element("nav","sql-set-nav");
    menu.setAttribute("aria-label","SQL practice sets");
    for(const [id,label] of [["themepark","THEMEPARKDB skills"],...Object.entries(sets).map(([k,v])=>[k,v.name])]){
      const link=element("a",null,label);
      link.href="#sql/"+id;
      if(id===set) link.setAttribute("aria-current","page");
      menu.append(link);
    }
    const status = element("p","sql-studio-progress");
    const options = element("select","sql-exercise-select");
    const selectLabel = element("label","sql-select-label","Practice exercise");
    selectLabel.append(options);
    const task = element("div","sql-task");
    const title = element("h3");
    const prompt = element("p");
    const conditions=element("div");
    task.append(title,prompt,conditions);
    const editor = element("textarea","sql-editor");
    editor.setAttribute("aria-label","SQL query");
    editor.spellcheck=false;editor.wrap="off";
    editor.setAttribute("autocapitalize","off");
    editor.setAttribute("autocorrect","off");
    editor.maxLength=5000;
    editor.placeholder="SELECT …";
    const editorLabel = element("label","sql-editor-label","SQL query");
    const frame=element("div","sql-edit-frame");
    const highlight=element("pre","sql-highlight");highlight.setAttribute("aria-hidden","true");
    frame.append(highlight,editor);editorLabel.append(frame);
    function recolour(){highlight.replaceChildren(...workedQuery(editor.value+"\n").childNodes);highlight.scrollTop=editor.scrollTop;highlight.scrollLeft=editor.scrollLeft;}
    editor.addEventListener("scroll",()=>{highlight.scrollTop=editor.scrollTop;highlight.scrollLeft=editor.scrollLeft;});
    editor.addEventListener("input",recolour);
    const run = button("Run query","button secondary");
    const check = button("Check answer");
    const reset = button("Reset query","button ghost");
    const controls = element("div","button-row");
    controls.append(run,check,reset);
    const actionLabel = element("h3",null,"Action Output");
    const action = element("p","sql-action");
    action.setAttribute("role","status");
    const feedback = element("div","feedback sql-feedback");
    feedback.setAttribute("role","status");
    feedback.hidden=true;
    const results = element("div","sql-grids");
    const references=element("aside","sql-references");
    references.setAttribute("aria-label","Database reference");
    if(guided) {
      const diagram=element("img");
      diagram.src=dataset.diagram;
      diagram.alt="Crow’s Foot diagram for "+dataset.name+". Table names, keys and references are also listed under View tables and sample rows.";
      const full=element("a",null,"Open full-size ERD");
      full.href=diagram.src; full.target="_blank"; full.rel="noopener";
      references.append(disclosure("View Crow’s Foot ERD",diagram,full));
    }
    let tableReference;
    const questionArea=element("div",guided?"sql-guided-question":null);
    questionArea.append(task,references);
    const support=element("div","sql-guidance");
    section.append(menu,heading,element("p","muted",guided?
      dataset.scenario+" Each run starts with fresh sample rows. Check answer tests your SQL. For written justifications, compare your explanation with the worked PDF.":
      "Practise SELECT on a browser copy of the Week 1 lab data. Use MySQL Workbench for lab setup and data changes."),
      status,selectLabel,questionArea,editorLabel,controls,actionLabel,action,feedback,results,support);
    if(guided){
      const downloads=element("div","sql-downloads");
      for(const [file,label] of [["questions","Download questions (PDF)"],["answers","Download worked answers (PDF)"]]){
        const a=element("a",null,label);a.href="sql-papers/"+set+"-"+file+".pdf";a.download="";downloads.append(a);
      }
      heading.after(downloads);
    }
    parent.append(section);

    function paintOptions() {
      options.replaceChildren();
      tasks.forEach((exercise,i) => options.add(new Option((guided?"("+exercise.part+") ":i+1+". "+exercise.topic+" — ")+exercise.title+(completed(exercise.id)?" ✓":""),exercise.id)));
      options.value=current.id;
      status.textContent=tasks.filter(exercise=>completed(exercise.id)).length + " of " + tasks.length + " SQL exercises complete";
    }
    function clearOutput(message) {
      action.textContent=message;
      action.dataset.error="false";
      feedback.hidden=true;
      feedback.replaceChildren();
      results.replaceChildren();
    }
    function stop() {
      clearTimeout(timer);
      worker?.terminate();
      worker=null;
      running=false;
      run.disabled=false;
      check.disabled=false;
      editor.readOnly=false;
    }
    function open(exercise) {
      if (running) stop();
      current=exercise;
      tableReference?.remove();
      tableReference=schemas(dataset,guided?dataset.name:"THEMEPARKDB",exercise);
      references.append(tableReference);
      title.textContent=guided?"("+exercise.part+") "+exercise.title+" · "+exercise.marks+" marks":exercise.title;
      prompt.textContent=exercise.prompt;
      conditions.replaceChildren();
      if(exercise.kind==="CREATE")conditions.append(element("p",null,"Open View Crow’s Foot ERD to see the required keys."));
      if(exercise.reference)conditions.append(grid({columns:exercise.reference[0],rows:exercise.reference[1]},"Given information"));
      support.replaceChildren();
      if(guided) support.append(disclosure("Show a hint",element("p",null,exercise.hint)),
        disclosure("Show worked answer",workedQuery(exercise.sql),element("p",null,exercise.explanation)));
      editor.value=typeof state.drafts[exercise.id]==="string" ? state.drafts[exercise.id] : "";
      editor.placeholder=exercise.kind && exercise.kind!=="SELECT" ? exercise.kind+" …" : "SELECT …";
      recolour();
      state.active=exercise.id;
      state.last={...state.last,[set]:exercise.id};
      save(state);
      paintOptions();
      clearOutput("Run your query to see its result.");
    }
    options.addEventListener("change",()=>open(exercises.find(item=>item.id===options.value)));
    editor.addEventListener("input",()=>{
      state.drafts[current.id]=editor.value;
      save(state);
      clearOutput("Query edited. Run it to update the grid.");
    });
    reset.addEventListener("click",()=>{
      if (running) stop();
      delete state.drafts[current.id];
      save(state);
      editor.value="";recolour();
      clearOutput("Query reset.");
      editor.focus();
    });
    function finish(data) {
      clearTimeout(timer);
      running=false;
      run.disabled=false;
      check.disabled=false;
      editor.readOnly=false;
      if (data.error) {
        action.dataset.error="true";
        action.textContent=data.error;
        return;
      }
      const count = data.actual.rows.length;
      action.textContent=data.affected!==undefined?(current.kind==="CREATE"?"Table created. Compare its columns and keys below.":data.affected+" row(s) affected. The grid shows the table after the change."):`Done. ${count} ${count===1?"row":"rows"} returned in ${data.elapsed.toFixed(1)} ms.`;
      results.append(grid(data.actual,"Your Result Grid"));
      if (!data.expected) return;
      results.append(grid(data.expected,"Expected Result Grid"));
      feedback.hidden=false;
      feedback.className="feedback sql-feedback "+(data.comparison.ok?"good":"bad");
      feedback.append(element("strong",null,data.comparison.message));
      feedback.append(element("p",null,data.comparison.ok ? current.explanation : reviewClue(current,data.actual,data.expected)));
      if (data.comparison.ok) {
        complete(current.id);
        paintOptions();
      }
    }
    function execute(grade) {
      if (running) return;
      if (!editor.value.trim()) {
        clearOutput("Write your SQL statement first.");
        editor.focus();
        return;
      }
      if (location.protocol==="file:") {
        clearOutput("Open the hosted hub or serve this folder over HTTP to run queries.");
        return;
      }
      const id=++request;
      clearOutput("Running query…");
      running=true;
      run.disabled=true;
      check.disabled=true;
      editor.readOnly=true;
      try {
        if (!worker) {
          worker=new Worker(new URL("sql-studio-worker.js",document.baseURI));
          worker.onmessage=({data})=>{if (data.id===request && running) finish(data);};
          worker.onerror=()=>{
            stop();
            finish({error:"The query engine could not start. Reload the hub and try again."});
          };
        }
        timer=setTimeout(()=>{
          stop();
          finish({error:"The query took too long. Narrow the filter, check your join, or add a LIMIT and try again."});
        },6000);
        worker.postMessage({id,sql:editor.value,exercise:current.id,check:grade});
      } catch (_) {
        stop();
        finish({error:"The query engine is unavailable. Reload the hub and try again."});
      }
    }
    run.addEventListener("click",()=>execute(false));
    check.addEventListener("click",()=>execute(true));
    editor.addEventListener("keydown",event=>{
      if ((event.ctrlKey || event.metaKey) && event.key==="Enter") {event.preventDefault();execute(false);}
    });
    open(current);
    return stop;
  }

  window.ICT200_SQL_STUDIO={exercises,mount,clearSaved};
})();
