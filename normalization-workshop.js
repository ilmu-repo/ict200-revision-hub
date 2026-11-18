(() => {
  "use strict";

  const model = window.ICT200_NORMALIZATION_MODEL;
  const STORAGE = "ict200-normalization-drafts-v1";
  const sizeLimit = 7;

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE));
      if (saved && typeof saved === "object" && saved.drafts && typeof saved.drafts === "object") {
        return {active:saved.active,drafts:saved.drafts,verified:Array.isArray(saved.verified) ? saved.verified : []};
      }
    } catch (_) { /* A fresh attempt also works without storage. */ }
    return {active:0, drafts:{}, verified:[]};
  }
  function save(state) {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch (_) { /* Draft stays open. */ }
  }
  function clearSaved() {
    try { localStorage.removeItem(STORAGE); } catch (_) { /* Storage can be unavailable. */ }
  }
  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function button(label, className = "button") {
    const element = el("button", className, label);
    element.type = "button";
    return element;
  }
  function select(label, entries, value, onChange) {
    const field = el("select", "norm-select");
    field.setAttribute("aria-label", label);
    field.add(new Option("Choose…", ""));
    entries.forEach(([id,text]) => field.add(new Option(text,id)));
    field.value = entries.some(([id]) => id === value) ? value : "";
    field.addEventListener("change", () => onChange(field.value));
    return field;
  }
  function pair(label, input, className = "norm-control") {
    const wrapper = el("label",className);
    wrapper.append(el("span", "norm-control-label", label),input);
    return wrapper;
  }
  function table(headers, rows, caption) {
    const wrap = el("div", "norm-table-wrap");
    wrap.tabIndex = 0;
    wrap.setAttribute("role","region");
    wrap.setAttribute("aria-label",caption);
    const result = el("table", "norm-table");
    result.append(el("caption", null, caption));
    const head = el("thead");
    const hrow = el("tr");
    headers.forEach(label => {
      const th = el("th",null,label);
      th.scope = "col";
      hrow.append(th);
    });
    head.append(hrow);
    const body = el("tbody");
    rows.forEach(values => {
      const tr = el("tr");
      values.forEach(value => {
        const td = el("td");
        if (value instanceof Node) td.append(value);
        else td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
    result.append(head,body);
    wrap.append(result);
    return wrap;
  }
  function displayReport() {
    const participants = people => {
      const list = el("ul", "norm-report-entries");
      people.forEach(entry => list.append(el("li",null,entry.join(" · "))));
      return list;
    };
    return table([...model.columns.slice(0,4), "ParticipantID · ParticipantName · AttendanceStatus"],
      model.report.map(({header,people}) => [...header, participants(people)]), "Original session attendance report");
  }
  function editSet(values, value, selected) {
    if (selected && !values.includes(value)) values.push(value);
    if (!selected && values.includes(value)) values.splice(values.indexOf(value),1);
  }
  function signature(record, names) {
    const labels = record.fields.map(field => {
      const fk = record.fks.findIndex(link => link.field === field);
      const roles = [record.key.includes(field) ? "PK" : "", fk >= 0 ? "FK" + (fk+1) : ""].filter(Boolean);
      return roles.length ? field + " (" + roles.join(", ") + ")" : field;
    });
    const result = table(labels, model.project(record.fields), record.showName);
    if (record.fks.length) {
      const references = record.fks.map(({field,target},i) => "FK" + (i+1) + " " + field + " → " + names[target] + "." + field);
      result.append(el("p","norm-reference",references.join(" · ")));
    }
    return result;
  }

  function mount(parent, {completed, complete, resetProgress}) {
    let state = load();
    const {stages, columns} = model;
    const isOpen = index => stages.slice(0,index).every(step => completed(step.id));
    let active = Number.isInteger(state.active) && stages[state.active] && isOpen(state.active) ? state.active : 0;
    const section = el("section","card card-pad norm-workshop");
    const title = el("h2",null,"Build a normalized database");
    const introduction = el("p","muted","Work through the arts centre’s attendance report. Check each step to open the next one.");
    const ref = el("details","norm-source");
    ref.open = active === 0;
    const summary = el("summary",null,"Business rules and original report");
    ref.append(summary,el("p",null,model.scenario),displayReport());
    const stageNav = el("nav","norm-stage-list");
    stageNav.setAttribute("aria-label","Normalization stages");
    const navButtons = stages.map((step,index) => {
      const control = button(step.label,"norm-step-button");
      control.dataset.normStage = step.id;
      control.addEventListener("click",() => activate(index));
      stageNav.append(control);
      return control;
    });
    const progress = el("p","norm-step-progress");
    const area = el("div","norm-step-area");
    const reset = button("Reset workshop","button ghost");
    reset.addEventListener("click",() => {
      if (!window.confirm("Clear this workshop’s answers and completed steps in this browser?")) return;
      clearSaved();
      resetProgress();
      state = load();
      activate(0);
    });
    section.append(title,introduction,ref,stageNav,progress,area,reset);
    parent.append(section);

    function activate(index) {
      if (!stages[index] || !isOpen(index)) return;
      active = index;
      state.active = index;
      save(state);
      ref.open = false;
      draw();
      area.querySelector("h3")?.focus();
    }
    function paintNav() {
      navButtons.forEach((control,index) => {
        const step = stages[index];
        const done = completed(step.id);
        control.disabled = !isOpen(index);
        control.textContent = index+1 + ". " + step.label + (done ? " ✓" : "");
        control.setAttribute("aria-label",step.label + (done ? ", complete" : control.disabled ? ", locked" : ""));
        if (index === active) control.setAttribute("aria-current","step");
        else control.removeAttribute("aria-current");
      });
      const done = stages.filter(step => completed(step.id)).length;
      progress.textContent = done + " of " + stages.length + " steps complete";
    }
    function nameMap(relations) {
      return Object.fromEntries(relations.map(entry => [entry.name,entry.showName]));
    }
    function draw() {
      paintNav();
      area.replaceChildren();
      const step = stages[active];
      const stepTitle = el("h3",null,step.title);
      stepTitle.tabIndex = -1;
      const prompt = el("p","norm-prompt");
      const interaction = el("div","norm-interaction");
      const controls = el("div","button-row norm-actions");
      const check = button("Check this step");
      const next = button(stages[active+1] ? "Next: " + stages[active+1].label : "Review from the start","button secondary");
      const feedback = el("div","feedback norm-feedback");
      feedback.setAttribute("role","status");
      feedback.hidden = true;
      const verified = el("div","norm-verified");
      next.hidden = !completed(step.id);
      next.addEventListener("click", () => activate(active+1 < stages.length ? active+1 : 0));
      controls.append(check,next);
      area.append(stepTitle,prompt,interaction,controls,feedback,verified);
      const tracked = new Map();
      function track(id,element) {
        if (!tracked.has(id)) tracked.set(id,[]);
        tracked.get(id).push(element);
      }
      function saveEdit() {
        save(state);
        feedback.hidden = true;
        next.hidden = true;
        verified.replaceChildren();
        tracked.forEach(items => items.forEach(item => item.removeAttribute("aria-invalid")));
      }
      const getDraft = fallback => state.drafts[step.id] ?? (state.drafts[step.id] = fallback);
      let inspect;
      let showResult = () => {};

      function fieldChoices(values) {
        const group = el("fieldset","norm-field-choices");
        group.append(el("legend","sr-only","Choose attributes"));
        columns.forEach(field => {
          const input = el("input");
          input.type = "checkbox";
          input.checked = values.includes(field);
          input.addEventListener("change",() => {editSet(values,field,input.checked);saveEdit();});
          const label = el("label","norm-field-choice");
          label.append(input,el("span",null,field));
          group.append(label);
        });
        interaction.append(group);
      }

      if (step.id === "pk" || step.id === "unf") {
        const values = getDraft([]);
        const pk = step.id === "pk";
        prompt.textContent = pk ? "Imagine one row for each attendance entry. Select the smallest set of fields that identifies that row across all sessions." :
          "Look at the original report. Select the fields that repeat together within a single session.";
        fieldChoices(values);
        inspect = () => model.checkSet(values, pk ? model.primaryKey : model.repeating,
          pk ? "Try Aina’s two entries. Could ParticipantID alone identify one? Could SessionID alone distinguish different participants in the same session? Select only what you need." :
            "The first four facts are recorded once for a session. Look for the facts that occur once for each entry in that session’s list.",
          pk ? "SessionID and ParticipantID together form one composite PK. Each alone can repeat." :
            "ParticipantID, ParticipantName and AttendanceStatus repeat together. UNF keeps that group inside the session record.");
        if (!pk) showResult = () => verified.append(el("p","norm-schema","UNF: REPORT(SessionID, SessionTitle, TutorID, TutorName, {ParticipantID, ParticipantName, AttendanceStatus})"));
      } else if (step.id === "dependencies") {
        const draft = getDraft({});
        prompt.textContent = "For each set of facts, choose its smallest direct determinant and the dependency type. Use the composite PK for full and partial dependencies. For TutorName, follow the direct link through the non-key field.";
        const options = Object.entries(model.determinants).map(([id,item]) => [id,item.label]);
        const types = Object.entries(model.titles);
        const grid = el("div","norm-dependencies");
        model.dependencies.forEach(dep => {
          const value = draft[dep.id] ?? (draft[dep.id] = {});
          const row = el("fieldset","norm-dependency");
          row.append(el("legend",null,dep.facts.join(", ")));
          const determinant = select("Determinant for " + dep.facts.join(", "),options,value.determinant,pick => {
            value.determinant = pick;saveEdit();
          });
          const kind = select("Dependency type for " + dep.facts.join(", "),types,value.type,pick => {
            value.type = pick;saveEdit();
          });
          track(dep.id,determinant);
          track(dep.id,kind);
          row.append(pair("Determined by",determinant),pair("Dependency type",kind));
          grid.append(row);
        });
        interaction.append(grid);
        inspect = () => model.checkDependencies(draft);
        showResult = () => {
          const list = el("ul","norm-dependency-answer");
          model.dependencies.forEach(dep => list.append(el("li","norm-dep-" + dep.type,
            model.titles[dep.type] + " · " + model.determinants[dep.determinant].label + " → " + dep.facts.join(", "))));
          verified.append(list,el("p",null,"SessionID → TutorID → TutorName. TutorName is also reachable from SessionID, which is part of the original key. Follow the TutorID link to see what remains to remove after 2NF."));
        };
      } else if (step.id === "1nf") {
        const draft = getDraft({grain:"", headers:[]});
        prompt.textContent = "Choose what one row represents. Then match each participant entry to its session to repeat the correct header fields.";
        const grain = select("One row represents",[
          ["session","One session and its whole participant list"],
          ["attendance","One participant in one session"],
          ["participant","One participant across all sessions"]
        ],draft.grain,value => {draft.grain=value;saveEdit();});
        track("grain",grain);
        interaction.append(pair("One row represents",grain));
        const headers = model.report.map(({header},i) => [String(i),header[0] + " · " + header[1]]);
        let i = 0;
        const data = model.report.flatMap(({people}) => people.map(entry => {
          const index = i++;
          const pick = select("Session header for row " + (index+1),headers,draft.headers[index],value => {
            draft.headers[index]=value;saveEdit();
          });
          track("row-" + index,pick);
          return [index+1,pick,...entry];
        }));
        interaction.append(table(["Row","Session header",...columns.slice(4)],data,"Expand the repeating group"));
        inspect = () => model.checkAtomic(draft);
        showResult = () => verified.append(
          el("p","norm-schema","1NF key: (SessionID, ParticipantID)"),
          table(columns,model.rows,"Atomic attendance rows")
        );
      } else if (step.id === "2nf" || step.id === "3nf") {
        const draft = getDraft({tables:[{name:"",fields:[],key:[]}]});
        prompt.textContent = step.id === "2nf" ?
          "Build tables that remove the partial dependencies. Keep any remaining transitive fact at this stage." :
          "Build the complete 3NF answer. Separate the facts that depend on a non-key field and keep the IDs needed to link the tables.";
        const help = el("p","muted","Select the fields and PK for each table. You can choose any table order and give the tables your own distinct names. After checking, the workshop will show the numbered FKs.");
        const group = el("div","norm-table-builder");
        const add = button("Add table","button secondary");
        function addTable() {
          draft.tables.push({name:"", fields:[],key:[]});
          saveEdit();
          paintTables();
          group.querySelector("fieldset:last-child .norm-name")?.focus();
        }
        add.addEventListener("click",addTable);
        function paintTables() {
          group.replaceChildren();
          draft.tables.forEach((current,index) => {
            const set = el("fieldset","norm-relation");
            const label = "Table " + (index+1);
            set.append(el("legend",null,label));
            const name = el("input","norm-name");
            name.type = "text";
            name.maxLength = 28;
            name.value = current.name;
            name.addEventListener("input",() => {current.name=name.value;saveEdit();});
            set.append(pair("Name (optional)",name));
            const fields = el("div","norm-attribute-grid");
            fields.append(el("span",null,"Field"),el("span",null,"Include"),el("span",null,"PK"));
            columns.forEach(field => {
              const include = el("input");
              const pk = el("input");
              include.type = pk.type = "checkbox";
              include.checked = current.fields.includes(field);
              pk.checked = current.key.includes(field);
              include.setAttribute("aria-label",label + " include " + field);
              pk.setAttribute("aria-label",label + " PK " + field);
              include.addEventListener("change",() => {
                editSet(current.fields,field,include.checked);
                if (!include.checked) {
                  editSet(current.key,field,false);pk.checked=false;
                }
                saveEdit();
              });
              pk.addEventListener("change",() => {
                editSet(current.key,field,pk.checked);
                if (pk.checked) {
                  editSet(current.fields,field,true);include.checked=true;
                }
                saveEdit();
              });
              fields.append(el("span","norm-attribute-name",field),include,pk);
            });
            set.append(fields);
            if (draft.tables.length>1) {
              const remove = button("Remove table","button ghost");
              remove.setAttribute("aria-label","Remove " + label);
              remove.addEventListener("click",() => {
                draft.tables.splice(index,1);saveEdit();paintTables();add.focus();
              });
              set.append(remove);
            }
            group.append(set);
            tracked.set("table-" + index,[set]);
          });
          add.disabled = draft.tables.length >= sizeLimit;
        }
        paintTables();
        interaction.append(help,group,add);
        inspect = () => model.checkTables(step.id,draft.tables);
        showResult = result => {
          const names = nameMap(result.checked);
          if (step.id === "3nf") {
            state.verified = result.checked;
            save(state);
          }
          result.checked.forEach(record => verified.append(signature(record,names)));
        };
      } else {
        prompt.textContent = "Finish the Crow’s Foot ERD using your checked 3NF tables. For each relationship, choose the symbol at both entity ends and choose a solid or dashed line.";
        const draft = getDraft({});
        const records = state.verified.length === 4 ? state.verified : model.schemas["3nf"].map(record => ({...record,showName:record.name}));
        const names = nameMap(records);
        const board = el("div","norm-erd-board erd-board");
        board.setAttribute("role","group");
        board.setAttribute("aria-label","Crow’s Foot diagram based on the checked 3NF tables");
        const byName = new Map(records.map(record => [record.name,record]));
        const path = ["TUTOR","SESSION","ATTENDANCE","PARTICIPANT"];
        const ends = [["one","Exactly one"],["zeroOne","Zero or one"],["zeroMany","Zero or many"],["oneMany","One or many"]];
        const types = [["solid","Identifying (solid)"],["dashed","Non-identifying (dashed)"]];
        const symbol = window.ICT200_ERD.makeSymbol;
        const marks = [];
        path.forEach((name,index) => {
          const record = byName.get(name);
          const box = el("section","erd-entity norm-erd-entity");
          box.append(el("h4",null,names[name]));
          record.fields.forEach(field => {
            const row = el("span","erd-field" + (record.key.includes(field) ? " erd-pk" : ""));
            const fki = record.fks.findIndex(link => link.field === field);
            if (record.key.includes(field)) row.append(el("small","erd-key-tag","PK"));
            if (fki>=0) row.append(el("small","erd-key-tag","FK"+(fki+1)));
            row.append(el("span","erd-field-name",field));
            box.append(row);
          });
          board.append(box);
          if (index>=model.links.length) return;
          const link = model.links[index];
          const connector = el("div","norm-connector");
          const pieces = el("div","norm-link-marks");
          ["left","strength","right"].forEach(part => {
            const place = el("span","norm-mark norm-mark-" + part);
            pieces.append(place);
            marks.push({link:link.id,part,place});
          });
          connector.append(el("span","erd-verb",link.label),pieces);
          board.append(connector);
        });
        function paintMarks() {
          marks.forEach(({link,part,place}) => {
            const value = draft[link]?.[part];
            place.replaceChildren(value ? symbol(value) : el("span","norm-mark-blank","?"));
          });
        }
        const options = el("div","norm-link-options");
        model.links.forEach(link => {
          const current = draft[link.id] ?? (draft[link.id]={});
          const group = el("fieldset","norm-link-fieldset");
          const label = names[link.left] + " " + link.label + " " + names[link.right];
          group.append(el("legend",null,label));
          [["left",names[link.left] + " end",ends],["right",names[link.right] + " end",ends],["strength","Line style",types]].forEach(([part,caption,values]) => {
            const input = select(label + ": " + caption,values,current[part],value => {
              current[part]=value;saveEdit();paintMarks();
            });
            track(link.id+"-"+part,input);
            group.append(pair(caption,input));
          });
          options.append(group);
        });
        paintMarks();
        interaction.append(board,options);
        inspect = () => model.checkERD(draft,names);
        showResult = () => verified.append(el("p","norm-schema","Workshop complete. The links match the PKs, FKs and participation rules of the checked 3NF schema."));
      }

      const success = {
        dependencies:"The determinants and dependency types match the report rules.",
        "1nf":"Each row now contains a single participant in a single session. Session data is repeated where needed.",
        "2nf":"Session and participant facts now have their own keys. The tutor name still follows TutorID in SESSION.",
        "3nf":"Tutor facts now have their own table. The tutor’s ID remains in the session table as a foreign key.",
        erd:"All three relationships are correct."
      };
      check.addEventListener("click",() => {
        const result = inspect();
        tracked.forEach(items => items.forEach(item => item.removeAttribute("aria-invalid")));
        feedback.replaceChildren();
        verified.replaceChildren();
        feedback.hidden=false;
        feedback.className = "feedback norm-feedback " + (result.ok ? "good" : "bad");
        if (result.ok) {
          complete(step.id);
          paintNav();
          feedback.append(el("strong",null,"Correct. "),document.createTextNode(result.success || success[step.id]));
          showResult(result);
          next.hidden=false;
        } else {
          feedback.append(el("strong",null,"Review this step and try again."));
          const list = el("ul");
          result.errors.forEach(error => {
            list.append(el("li",null,error.message || error));
            (tracked.get(error.id) || []).forEach(item => item.setAttribute("aria-invalid","true"));
          });
          feedback.append(list);
          next.hidden=true;
        }
      });
    }
    draw();
  }

  window.ICT200_NORMALIZATION = {mount, clearSaved, stages:model.stages};
})();
