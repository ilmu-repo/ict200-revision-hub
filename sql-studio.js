(() => {
  "use strict";

  const exercises = window.ICT200_SQL_EXERCISES;
  const STORAGE = "ict200-sql-drafts-v1";
  const priceColumns = new Set(["TICKET_PRICE","LINE_PRICE","HOUR_RATE"]);

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

  function schemas() {
    const details = element("details","sql-schemas");
    details.append(element("summary",null,"Schemas · THEMEPARKDB"));
    const list = element("div","sql-schema-list");
    window.ICT200_THEMEPARK_SQL.tables.forEach(table=>{
      const entry = element("details","sql-schema-table");
      const fields = element("ul");
      table.fields.forEach(field=>{
        const row = element("li",null,field.name + " · " + field.type);
        if (field.pk) row.append(element("span","sql-schema-key","PK"));
        if (field.fk) row.append(element("span","sql-schema-key","FK → "+field.fk));
        fields.append(row);
      });
      entry.append(element("summary",null,table.name),fields);
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

  function mount(parent, {completed, complete}) {
    const state = load();
    let current = exercises.find(item=>item.id===state.active) || exercises[0];
    let worker = null, request = 0, timer = null, running = false;
    const section = element("section","card card-pad sql-studio");
    const heading = element("h2",null,"THEMEPARKDB SQL Studio");
    const status = element("p","sql-studio-progress");
    const options = element("select","sql-exercise-select");
    const selectLabel = element("label","sql-select-label","Practice exercise");
    selectLabel.append(options);
    const task = element("div","sql-task");
    const title = element("h3");
    const prompt = element("p");
    task.append(title,prompt);
    const editor = element("textarea","sql-editor");
    editor.setAttribute("aria-label","SQL query");
    editor.spellcheck=false;
    editor.setAttribute("autocapitalize","off");
    editor.setAttribute("autocorrect","off");
    editor.maxLength=5000;
    editor.placeholder="SELECT …";
    const editorLabel = element("label","sql-editor-label","SQL query");
    editorLabel.append(editor);
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
    section.append(heading,element("p","muted",
      "Practise SELECT on a browser copy of the Week 1 lab data. This studio supports the syntax used in these exercises. Use MySQL Workbench for lab setup, data changes and other MySQL functions."),
      status,selectLabel,task,schemas(),editorLabel,controls,actionLabel,action,feedback,results);
    parent.append(section);

    function paintOptions() {
      options.replaceChildren();
      exercises.forEach((exercise,i) => options.add(new Option(`${i+1}. ${exercise.topic} — ${exercise.title}${completed(exercise.id)?" ✓":""}`,exercise.id)));
      options.value=current.id;
      status.textContent=exercises.filter(exercise=>completed(exercise.id)).length + " of " + exercises.length + " SQL exercises complete";
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
      title.textContent=exercise.title;
      prompt.textContent=exercise.prompt;
      editor.value=typeof state.drafts[exercise.id]==="string" ? state.drafts[exercise.id] : "";
      state.active=exercise.id;
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
      editor.value="";
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
      action.textContent=`Done. ${count} ${count===1?"row":"rows"} returned in ${data.elapsed.toFixed(1)} ms.`;
      results.append(grid(data.actual,"Your Result Grid"));
      if (!data.expected) return;
      results.append(grid(data.expected,"Expected Result Grid"));
      feedback.hidden=false;
      feedback.className="feedback sql-feedback "+(data.comparison.ok?"good":"bad");
      feedback.append(element("strong",null,data.comparison.message));
      feedback.append(element("p",null,data.comparison.ok ? current.explanation : current.hint));
      if (data.comparison.ok) {
        complete(current.id);
        paintOptions();
      }
    }
    function execute(grade) {
      if (running) return;
      if (!editor.value.trim()) {
        clearOutput("Write a SELECT query first.");
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
