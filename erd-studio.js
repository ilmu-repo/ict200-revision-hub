(() => {
  "use strict";

  const groups = {
    entity: "Entities",
    attribute: "Attributes",
    key: "Key roles",
    end: "Crow’s Foot ends",
    line: "Relationship lines",
    category: "Subtype membership",
    bars: "Completeness"
  };
  const hintPreference = "ict200.erd.colourHints";
  let colourHints = true;
  try { colourHints = localStorage.getItem(hintPreference) !== "off"; } catch {}
  const subtypeTiles = new Set(["volunteer","donor","SALARY_DEDUCTION","AUTO_DEBIT"]);
  function inkFor(id) {
    if (subtypeTiles.has(id)) return "subtype";
    if (id === "PK" || id === "FK") return id;
    return tiles[id].kind;
  }

  const tiles = {
    patient: {kind: "entity", label: "PATIENT"},
    doctor: {kind: "entity", label: "DOCTOR"},
    appointment: {kind: "entity", label: "APPOINTMENT"},
    one: {kind: "end", label: "Exactly one", mark: "one"},
    zeroOne: {kind: "end", label: "Zero or one", mark: "zeroOne"},
    zeroMany: {kind: "end", label: "Zero or many", mark: "zeroMany"},
    oneMany: {kind: "end", label: "One or many", mark: "oneMany"},
    solid: {kind: "line", label: "Identifying", mark: "solid"},
    dashed: {kind: "line", label: "Non-identifying", mark: "dashed"},
    member: {kind: "entity", label: "MEMBER"},
    volunteer: {kind: "entity", label: "VOLUNTEER"},
    donor: {kind: "entity", label: "DONOR"},
    d: {kind: "category", label: "Disjoint", mark: "d"},
    o: {kind: "category", label: "Overlapping", mark: "o"},
    partial: {kind: "bars", label: "Partial completeness", mark: "partial"},
    total: {kind: "bars", label: "Total completeness", mark: "total"}
  };

  const clinicAttributes = ["AppointmentDate","AppointmentID","AppointmentTime",
    "DoctorID","DoctorName","PatientID","PatientName","Phone","Specialty"];
  const membershipAttributes = ["DonationMethod","InterestArea","IsDonor","IsVolunteer","MemberID","MemberName","Phone","Role"];
  const keyRoles = ["PK","FK"];
  for (const id of [...clinicAttributes,...membershipAttributes]) tiles[id] = {kind:"attribute",label:id};
  for (const id of keyRoles) tiles[id] = {kind:"key",label:id};

  const memberScenario = "A community organisation records all its members. Each member has a unique member ID, a name and a phone number. Members may register as volunteers, donors, or both. A member who has not registered for either role remains in the organisation's records. For each volunteer, the organisation records one main area of interest. For each donor, it records one preferred donation method. The database must also record whether each member is registered as a volunteer and whether the member is registered as a donor.";
  const memberTask = "Draw an Extended Entity Relationship Diagram (EERD). Show the supertype, subtypes, attributes, underlined primary keys, numbered foreign keys and subtype discriminators. Use the appropriate membership and completeness symbols.";
  const memberExplain = "Name the membership and completeness constraints. Support each decision with words from the scenario.";
  const policyTask = "Use the organisation and member details in Exercise 2. Treat (a) and (b) as separate alternatives to the original policy. For each part, redraw the specialization section of the EERD, show the subtype discriminator or discriminators, name both constraints, and explain the change.";
  const policyA = "The organisation changes its registration policy. Every member must register as either a volunteer or a donor. A member is not allowed to register for both roles.";
  const policyB = "In a separate policy proposal, every member must register as a volunteer or a donor, and a member may register for both roles.";
  const slot = (id, kind, label, hint) => ({id, kind, label, hint});
  const clinicSlots = [
    slot("leftName", "entity", "Entity that books", "Who books an appointment?"),
    slot("centreName", "entity", "Entity between the two links", "Which record has its own ID and connects the person who books with the person who attends?"),
    slot("rightName", "entity", "Entity that attends", "Who attends the appointment as the care provider?"),
    slot("booksParent", "end", "‘Books’ end at the entity that books", "For one appointment, how many patients are required?"),
    slot("booksChild", "end", "‘Books’ end at the middle entity", "For one patient, can there be no appointments? Can there be several?"),
    slot("attendsChild", "end", "‘Attends’ end at the middle entity", "For one doctor, can there be no appointments? Can there be several?"),
    slot("attendsParent", "end", "‘Attends’ end at the entity that attends", "For one appointment, how many doctors are required?"),
    slot("booksLine", "line", "‘Books’ line", "Is PatientID part of the appointment’s primary key, or only a foreign key?"),
    slot("attendsLine", "line", "‘Attends’ line", "Is DoctorID part of the appointment’s primary key, or only a foreign key?")
  ];
  const clinicSchema = {
    left:{label:"Entity that books", fields:{PatientID:"pk",PatientName:"regular",Phone:"regular"}},
    centre:{label:"Middle entity", fields:{AppointmentID:"pk",PatientID:"fk",DoctorID:"fk",AppointmentDate:"regular",AppointmentTime:"regular"}},
    right:{label:"Entity that attends", fields:{DoctorID:"pk",DoctorName:"regular",Specialty:"regular"}}
  };
  const memberSlots = [
    slot("centreName", "entity", "Supertype name", "Which entity includes everyone, regardless of their role?"),
    slot("leftName", "entity", "Left subtype name", "Choose one of the two roles for this branch."),
    slot("rightName", "entity", "Right subtype name", "Choose the other role for this branch."),
    slot("category", "category", "Category circle", "Can a member belong to both subtypes under this policy?"),
    slot("bars", "bars", "Completeness bars", "Can a member stay on record with neither role under this policy?")
  ];
  function specialization(id, title, policyPart, category, bars, discriminatorFields, explanation) {
    const answer = {centreName: "member", category, bars};
    const fields = {
      member:{MemberID:"pk",MemberName:"regular",Phone:"regular",...Object.fromEntries(discriminatorFields.map(name=>[name,"regular"]))},
      volunteer:{MemberID:"pkfk",InterestArea:"regular"},
      donor:{MemberID:"pkfk",DonationMethod:"regular"}
    };
    return {
      id, title, type: "eerd", scenario:[memberScenario], slots:memberSlots, fields,
      questions:policyPart ? [policyTask,`(${policyPart}) ${policyPart==="a" ? policyA : policyB}`] : [memberTask,memberExplain],
      palette:["donor","member","volunteer",...membershipAttributes,...keyRoles,"d","o","total","partial"],
      answers: [
        {...answer, leftName:"volunteer", rightName:"donor"},
        {...answer, leftName:"donor", rightName:"volunteer"}
      ],
      explanation
    };
  }
  const exercises = [
    {
      id:"clinic", type:"erd", title:"Clinic appointments", slots:clinicSlots, schema:clinicSchema,
      scenario:["A clinic keeps records of its patients, doctors and appointments. Each patient has a unique patient ID, a name and a phone number. Each doctor has a unique doctor ID, a name and a specialty. Patients and doctors may be registered before they have any appointments. A patient may book several appointments, and a doctor may attend several appointments. Each appointment is for exactly one patient and is attended by exactly one doctor. Each appointment has a unique appointment ID, an appointment date and an appointment time. The same patient may see the same doctor again on a different date or at a different time."],
      questions:["Draw an Entity Relationship Diagram (ERD) using Crow's Foot notation. Show all entities and attributes. Underline primary keys, label foreign keys as FK1, FK2 and so on within each entity, and show minimum and maximum participation. Use the appropriate identifying or non-identifying relationship lines."],
      palette:["doctor","appointment","patient",...clinicAttributes,...keyRoles,"zeroOne","oneMany","one","zeroMany","solid","dashed"],
      answers:[{
        leftName:"patient", centreName:"appointment", rightName:"doctor", booksParent:"one", booksChild:"zeroMany",
        attendsChild:"zeroMany", attendsParent:"one", booksLine:"dashed", attendsLine:"dashed"
      }],
      explanation:"Each appointment refers to exactly one patient and one doctor. Each parent may have zero or many appointments. Both links are dashed because PatientID and DoctorID are foreign keys outside the AppointmentID primary key."
    },
    specialization("roles", "Organisation membership", null,
      "o", "partial", ["IsVolunteer","IsDonor"], "The o circle permits both roles. One horizontal bar permits a member with neither role. IsVolunteer and IsDonor record the two independent choices."),
    specialization("one-role", "Policy A", "a",
      "d", "total", ["Role"], "The d circle rules out both roles and two horizontal bars rule out neither. The required Role field holds VOLUNTEER or DONOR."),
    specialization("at-least-one", "Policy B", "b",
      "o", "total", ["IsVolunteer","IsDonor"], "The o circle permits both roles and two horizontal bars require at least one. At least one of IsVolunteer and IsDonor must be Yes.")
  ];

  const exam = window.ICT200_TURQ;
  const names = Object.keys(exam.schema);
  const examFields = [...new Set(Object.values(exam.schema).flatMap(model => Object.keys(model.fields)))].sort();
  for (const name of names) tiles[name] = {kind:"entity",label:name};
  for (const name of examFields) tiles[name] = {kind:"attribute",label:name};
  const examAnswer = {category:"d",bars:"total"};
  const examSlots = names.map(name => {
    examAnswer[name+"Name"] = name;
    return slot(name+"Name","entity",exam.schema[name].label,"Which record holds these facts?");
  });
  exam.links.forEach(([parent,child,verb,field],i) => {
    const prefix = "link"+i;
    const label = exam.schema[parent].label+" "+verb+" ("+exam.schema[child].label+")";
    for (const [suffix,kind,value,hint] of [
      ["Parent","end","one","Count the parents for one child in this model."],
      ["Child","end","zeroMany","Allow registration before a related record exists. Can there be several later?"],
      ["Line","line","dashed","Does "+field+" form part of the child's primary key?"]
    ]) {
      examSlots.push(slot(prefix+suffix,kind,label+" · "+suffix,hint));
      examAnswer[prefix+suffix] = value;
    }
  });
  examSlots.push(slot("category","category","Package membership","Can the same account use both options?"),
    slot("bars","bars","Package completeness","May an account omit its package?"));
  exercises.push({...exam, slots:examSlots, answers:[examAnswer],
    palette:[...names.slice().sort(),...examFields,...keyRoles,"one","zeroMany","zeroOne","oneMany","solid","dashed","d","o","partial","total"],
    explanation:"All seven records, four ordinary relationships and the package hierarchy match the proposed model. For part (b), compare your two information outputs with the final walkthrough step."});
  const attempts = new Map();
  const attributes = new Map();
  const positions = ["left","centre","right"];
  const branchLabels = {left:"Left subtype", centre:"Supertype", right:"Right subtype"};
  const requested = new URLSearchParams(location.search).get("exercise");
  let active = exercises.find(item=>item.id===requested)?.id || exercises[0].id;

  function evaluate(exercise, placed, byEntity) {
    const candidate = answer => {
      const schema = exercise.schema || Object.fromEntries(positions.map(position => [
        position,{label:branchLabels[position],fields:exercise.fields[answer[position+"Name"]]}
      ]));
      const fields = evaluateAttributes(schema,byEntity);
      // An explicitly chosen branch name takes precedence over its current attributes.
      const score = exercise.slots.filter(({id}) => placed[id] === answer[id]).length * (fields.totalAttributes + 1) + fields.correctAttributes;
      return {answer,fields,score};
    };
    const candidates = exercise.answers.map(candidate);
    const best = candidates.reduce((a,b) => b.score>a.score ? b : a);
    const slots = exercise.slots.map(spec => ({
      ...spec, state: placed[spec.id] === best.answer[spec.id] ? "correct" : placed[spec.id] ? "revise" : "missing"
    }));
    return {slots,fields:best.fields};
  }

  function evaluateAttributes(schema, byEntity) {
    const errors = [];
    const marks = new Map();
    let correctAttributes = 0, totalAttributes = 0, correctKeys = 0, totalKeys = 0;
    for (const [position, model] of Object.entries(schema)) {
      const actual = byEntity[position];
      const expected = Object.entries(model.fields);
      totalAttributes += expected.length;
      totalKeys += expected.reduce((sum,[,role])=>sum+(role==="pkfk" ? 2 : role==="regular" ? 0 : 1),0);
      const missing = expected.filter(([name]) => !actual.has(name)).map(([name]) => name);
      if (missing.length) errors.push({label:model.label + " · missing attributes", hint:"Add " + missing.join(", ") + "."});
      actual.forEach((roles, name) => {
        const expectedRole = model.fields[name];
        const id = position + ":" + name;
        if (!expectedRole) {
          marks.set(id,"revise");
          errors.push({label:model.label + " · " + name, hint:"This attribute belongs in a different entity. Check whose fact it describes."});
          return;
        }
        correctAttributes++;
        const expectsPK = expectedRole === "pk" || expectedRole === "pkfk";
        const expectsFK = expectedRole === "fk" || expectedRole === "pkfk";
        const correct = roles.includes("PK") === expectsPK && roles.includes("FK") === expectsFK;
        marks.set(id,correct?"correct":"revise");
        correctKeys += Number(expectsPK && roles.includes("PK")) + Number(expectsFK && roles.includes("FK"));
        if (!correct) {
          const clue = expectedRole === "regular" ? "This is a descriptive attribute. Remove the key label." :
            expectedRole === "pk" ? "This identifier uniquely identifies a row in this entity. Mark it as the PK." :
              expectedRole === "fk" ? "This ID references a parent entity. Mark it as an FK." :
                "This subtype inherits its identifier. It identifies the subtype row and references its supertype, so it needs both a PK and an FK label.";
          errors.push({label:model.label + " · " + name + " key role",hint:clue});
        }
      });
    }
    return {errors,marks,correctAttributes,totalAttributes,correctKeys,totalKeys};
  }

  function mount(parent, {completed, saveComplete}) {
    const el = (tag, className, value) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (value !== undefined) element.textContent = value;
      return element;
    };
    const button = (className, label) => {
      const element = el("button", className, label);
      element.type = "button";
      return element;
    };
    const container = el("section", "card card-pad erd-builder");
    const heading = el("h2", null, "Build the diagram");
    heading.id = "erd-builder-heading";
    container.setAttribute("aria-labelledby", heading.id);
    const nav = el("div", "erd-exercise-list");
    nav.setAttribute("role", "group");
    nav.setAttribute("aria-label", "Diagram exercises");
    const workspace = el("div", "erd-workspace");
    container.append(heading, nav, workspace);
    parent.append(container);

    function openExercise() {
      const exercise = exercises.find(item => item.id === active);
      if (!attempts.has(active)) attempts.set(active, {});
      const placed = attempts.get(active);
      const boardPositions = exercise.schema ? Object.keys(exercise.schema) : positions;
      if (!attributes.has(active)) attributes.set(active,Object.fromEntries(boardPositions.map(id=>[id,new Map()])));
      const byEntity = attributes.get(active);
      const entityLabel = position => exercise.schema?.[position].label || branchLabels[position];
      const specs = new Map(exercise.slots.map(item => [item.id, item]));
      const slotButtons = new Map();
      const paletteButtons = new Map();
      const attributeZones = new Map();
      const fieldTargets = new Map();
      let selectedTile = "";
      let selectedSlot = "";
      let selectedAttribute = null;
      let currentGroup = "entity";
      let dragging = null;
      let outcome = [];
      let fieldOutcome = null;
      let updateBranchLabels = () => {};

      workspace.replaceChildren();
      const title = el("h3", "erd-title", exercise.title);
      const mixed = exercise.type === "mixed";
      const scenario = el(mixed ? "details" : "div", "erd-scenario");
      if (mixed) scenario.append(el("summary",null,"Read the full exam question and practice assumptions"));
      exercise.scenario.forEach(paragraph => scenario.append(el("p", null, paragraph)));
      exercise.questions.forEach(paragraph=>scenario.append(el("p","erd-task",paragraph)));
      if (exercise.assumptions) scenario.append(el("p",null,"Practice assumptions · "+exercise.assumptions));
      const instructions = el("p", "muted",
        "Drag names and symbols to their slots. Drag attributes into an entity, then drop PK or FK onto the attribute. FK labels number themselves. You can also select a tile and its destination with a tap or Enter.");
      const palette = el("section", "erd-palette");
      const paletteHeader = el("div","erd-bank-heading");
      const hintLabel = el("label","erd-hint-switch");
      const hintSwitch = el("input");
      hintSwitch.type = "checkbox";
      hintSwitch.checked = colourHints;
      hintLabel.append(hintSwitch,document.createTextNode("Colour hints"));
      paletteHeader.append(el("h4",null,"Tiles"),hintLabel);
      palette.append(paletteHeader);
      const groupLabel = el("label","erd-group-label","Tile group");
      const groupNav = el("select","erd-group-select");
      const availableGroups = Object.keys(groups).filter(kind => exercise.palette.some(id => tiles[id].kind === kind));
      availableGroups.forEach(kind => groupNav.add(new Option(groups[kind],kind)));
      groupLabel.append(groupNav);
      const search = el("input","erd-attribute-search");
      search.type = "search";
      search.placeholder = "Find an attribute";
      search.setAttribute("aria-label","Find an attribute");
      const searchable = exercise.palette.filter(id=>tiles[id].kind==="attribute").length > 10;
      groupNav.addEventListener("change", () => {
        currentGroup = groupNav.value;
        selectedSlot = selectedTile = "";
        selectedAttribute = null;
        search.value = "";
        update();
      });
      const paletteContent = el("div", "erd-tiles");
      const noMatches = el("p","erd-no-matches","No matching attributes.");
      noMatches.setAttribute("role","status");
      search.addEventListener("input",()=>{
        selectedTile = "";
        update();
      });
      const targetActions = el("div", "erd-tool-row erd-target-actions");
      const toSlot = button("button secondary", "Go to a slot");
      const clear = button("button ghost", "Clear selected slot");
      const selection = el("p", "erd-selection");
      selection.setAttribute("role", "status");
      targetActions.append(toSlot, clear);
      palette.append(groupLabel,search,paletteContent,noMatches,targetActions,selection);
      const board = el("div", "erd-board " + (mixed ? "erd-board-exam" : exercise.type === "erd" ? "erd-board-relations" : "erd-board-hierarchy"));
      board.setAttribute("role", "group");
      board.setAttribute("aria-label", "Diagram");
      const controls = el("div", "button-row");
      const check = button("button", "Check my diagram");
      const reset = button("button secondary", "Reset diagram");
      const feedback = el("div", "erd-feedback");
      feedback.hidden = true;
      feedback.setAttribute("role", "status");
      controls.append(check, reset);
      const workbench = el("div","erd-workbench erd-individual");
      workbench.dataset.hints = colourHints ? "on" : "off";
      hintSwitch.addEventListener("change",()=>{
        colourHints = hintSwitch.checked;
        workbench.dataset.hints = colourHints ? "on" : "off";
        try { localStorage.setItem(hintPreference,workbench.dataset.hints); } catch {}
      });
      const dragArea = el("div","erd-drag-area");
      dragArea.append(palette,board);
      workbench.append(dragArea,controls,feedback);
      const walkthrough = el("a", "button secondary", "View step-by-step worked answer");
      walkthrough.href = "erd-walkthrough.html#"+exercise.id;
      workspace.append(title, scenario, walkthrough, instructions, workbench);

      function tileLabel(tile) {
        return tile.label;
      }
      function tileContent(element, tile, visualOnly = false) {
        if (tile.mark) element.append(makeSymbol(tile.mark));
        if (!visualOnly || !tile.mark) {
          element.append(el("span", "erd-tile-label", tile.label));
        }
      }
      function placementMessage() {
        const base = Object.keys(placed).length + " of " + exercise.slots.length + " diagram slots filled.";
        const actual = Object.values(byEntity).reduce((sum,values)=>sum+values.size,0);
        return base + " " + actual + " attributes placed.";
      }
      function place(spec, tileId, sourceSlot) {
        if (!exercise.palette.includes(tileId) || tiles[tileId].kind !== spec.kind) {
          selection.textContent = "Choose a " + groups[spec.kind].toLowerCase() + " tile for this slot.";
          return false;
        }
        if (sourceSlot && sourceSlot !== spec.id) {
          if (placed[spec.id]) placed[sourceSlot] = placed[spec.id];
          else delete placed[sourceSlot];
        }
        // Entity-name tiles appear once, unless a slot swap already moved the other name.
        if (spec.kind === "entity") {
          const previous = Object.keys(placed).find(id => id !== spec.id && placed[id] === tileId);
          if (previous) delete placed[previous];
        }
        placed[spec.id] = tileId;
        selectedTile = "";
        selectedSlot = "";
        selectedAttribute = null;
        clearFeedback();
        update(tileLabel(tiles[tileId]) + " placed. " + placementMessage());
        return true;
      }
      function clearDrag() {
        dragging = null;
        workbench.querySelectorAll(".erd-drag-target,.erd-drop-hover").forEach(node=>node.classList.remove("erd-drag-target","erd-drop-hover"));
      }
      function startDrag(event, id, origin = {}) {
        event.stopPropagation();
        dragging = {id,...origin};
        event.dataTransfer.setData("text/plain",id);
        event.dataTransfer.effectAllowed = origin.slot || origin.entity ? "move" : "copy";
        workbench.querySelectorAll("[data-accept]").forEach(node=>{
          node.classList.toggle("erd-drag-target",node.dataset.accept===tiles[id].kind);
        });
      }
      function dropTarget(target, kind, onDrop) {
        target.dataset.accept = kind;
        target.addEventListener("dragover", event => {
          if (!dragging || tiles[dragging.id].kind !== kind) return;
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = dragging.slot || dragging.entity ? "move" : "copy";
          target.classList.add("erd-drop-hover");
        });
        target.addEventListener("dragleave", event => {
          if (!(event.relatedTarget instanceof Node) || !target.contains(event.relatedTarget)) target.classList.remove("erd-drop-hover");
        });
        target.addEventListener("drop", event => {
          if (!dragging || tiles[dragging.id].kind !== kind) return;
          event.preventDefault();
          event.stopPropagation();
          const payload = dragging;
          clearDrag();
          onDrop(payload);
        });
      }
      function addSlot(id, className, placeholder) {
        const spec = specs.get(id);
        const target = button("erd-slot " + className);
        target.dataset.slot = id;
        target.addEventListener("click", () => {
          if (selectedTile && tiles[selectedTile].kind === spec.kind) {
            place(spec, selectedTile);
          } else if (placed[id]) {
            selectedTile = "";
            selectedAttribute = null;
            if (selectedSlot === id) selectedSlot = "";
            else selectedSlot = id;
            update();
          } else {
            selection.textContent = "Select a tile from the bank, then select this slot.";
          }
        });
        dropTarget(target,spec.kind,payload=>{if(place(spec,payload.id,payload.slot)) target.focus({preventScroll:true});});
        target.addEventListener("dragstart",event=>{
          if (placed[id]) startDrag(event,placed[id],{slot:id});
        });
        target.addEventListener("dragend",clearDrag);
        slotButtons.set(id, {target, placeholder});
        return target;
      }
      function entity(prefix, style) {
        const card = el("div", "erd-entity " + style);
        const rows = el("div","erd-attribute-rows");
        const drop = button("erd-slot erd-attribute-drop","Add attribute");
        drop.dataset.entity = prefix;
        drop.setAttribute("aria-label","Add attribute: " + entityLabel(prefix));
        drop.addEventListener("click",()=>{
          const source = selectedAttribute;
          const chosen = selectedTile;
          if (source) placeAttribute(prefix,source.id,source.entity);
          else if (chosen && tiles[chosen].kind === "attribute") placeAttribute(prefix,chosen);
          else selection.textContent = "Select an attribute from the bank or a placed attribute to move.";
        });
        dropTarget(card,"attribute",payload=>placeAttribute(prefix,payload.id,payload.entity));
        card.append(addSlot(prefix + "Name", "erd-name-slot", "Entity name"),rows,drop);
        attributeZones.set(prefix,{card,rows,drop});
        return card;
      }
      function placeAttribute(entityId, name, source) {
        const destination = byEntity[entityId];
        if (destination.has(name)) {
          selection.textContent = name + " is already in this entity.";
          return;
        }
        const roles = source ? byEntity[source].get(name) || [] : [];
        if (source) byEntity[source].delete(name);
        destination.set(name,roles);
        finishChange(name + (source ? " moved. " : " added. "));
        fieldTargets.get(entityId + ":" + name)?.focus({preventScroll:true});
      }
      function finishChange(message) {
        selectedAttribute = null;
        selectedTile = "";
        selectedSlot = "";
        clearFeedback();
        update(message + placementMessage());
      }
      function placeKey(entityId, name, role, origin) {
        if (origin?.entity && (origin.entity !== entityId || origin.field !== name)) {
          const previous = byEntity[origin.entity].get(origin.field);
          if (previous) byEntity[origin.entity].set(origin.field,previous.filter(value=>value!==role));
        }
        const previous = byEntity[entityId].get(name);
        byEntity[entityId].set(name,keyRoles.filter(value => value === role || previous.includes(value)));
        finishChange(role + " assigned to " + name + ". ");
        fieldTargets.get(entityId + ":" + name)?.focus({preventScroll:true});
      }
      function paintAttributes() {
        fieldTargets.clear();
        attributeZones.forEach(({card,rows,drop},entityId)=>{
          const acceptsAttributes = Boolean(selectedAttribute || (selectedTile && tiles[selectedTile].kind==="attribute"));
          card.classList.toggle("erd-attribute-target",acceptsAttributes);
          drop.classList.toggle("erd-accepts",acceptsAttributes);
          rows.replaceChildren();
          let fkNumber = 0;
          byEntity[entityId].forEach((roles,name)=>{
            const id = entityId + ":" + name;
            const row = el("div","erd-attribute-row");
            row.dataset.attribute = name;
            row.dataset.ink = roles.includes("PK") ? (roles.includes("FK") ? "subtype" : "PK") : roles.includes("FK") ? "FK" : "attribute";
            row.dataset.attributeEntity = entityId;
            row.dataset.result = fieldOutcome?.marks.get(id) || "";
            const field = button("erd-attribute-name" + (roles.includes("PK") ? " erd-underlined" : ""),name);
            const badges = roles.map(role => role==="FK" ? "FK"+(++fkNumber) : role);
            field.setAttribute("aria-label",name + " in " + entityLabel(entityId) +
              (badges.length ? ", " + badges.join(", ") : ""));
            const activeAttribute = selectedAttribute?.id === name && selectedAttribute.entity === entityId;
            field.setAttribute("aria-pressed",String(activeAttribute));
            field.draggable = true;
            field.addEventListener("dragstart",event=>startDrag(event,name,{entity:entityId}));
            field.addEventListener("dragend",clearDrag);
            field.addEventListener("click",()=>{
              const role = selectedTile;
              if (role && tiles[role].kind==="key") {
                placeKey(entityId,name,role);
                return;
              }
              selectedTile = "";
              selectedSlot = "";
              selectedAttribute = activeAttribute ? null : {id:name,entity:entityId};
              update();
              fieldTargets.get(id)?.focus({preventScroll:true});
            });
            fieldTargets.set(id,field);
            row.append(field);
            const chips = el("div","erd-key-chips");
            roles.forEach((role,index)=>{
              const badge = badges[index];
              const chip = button("erd-key-chip " + (role==="PK" ? "erd-primary" : "erd-foreign"),badge + " ×");
              chip.setAttribute("aria-label","Remove " + badge + " from " + name + " in " + entityLabel(entityId));
              chip.draggable = true;
              chip.addEventListener("dragstart",event=>startDrag(event,role,{entity:entityId,field:name}));
              chip.addEventListener("dragend",clearDrag);
              chip.addEventListener("click",()=>{
                byEntity[entityId].set(name,roles.filter(value=>value!==role));
                finishChange(role + " removed. ");
                fieldTargets.get(id)?.focus({preventScroll:true});
              });
              chips.append(chip);
            });
            const remove = button("erd-remove-attribute","×");
            remove.setAttribute("aria-label","Remove " + name + " from " + entityLabel(entityId));
            remove.addEventListener("click",()=>{
              byEntity[entityId].delete(name);
              finishChange(name + " removed. ");
              drop.focus({preventScroll:true});
            });
            row.append(chips,remove);
            row.classList.toggle("erd-key-target",Boolean(selectedTile && tiles[selectedTile].kind==="key"));
            dropTarget(row,"key",payload=>placeKey(entityId,name,payload.id,payload));
            rows.append(row);
          });
        });
      }
      function link(verb, from, to, label = verb) {
          const connector = el("div", "erd-connector");
          const row = el("div", "erd-link-row");
          const line = addSlot(verb + "Line", "erd-line-slot", "Line");
          row.append(addSlot(from, "erd-end-slot erd-first-end", "End"),
            line, addSlot(to, "erd-end-slot erd-last-end", "End"));
          connector.append(el("span", "erd-verb", label), row);
          return connector;
      }
      if (exercise.type === "erd") {
        board.append(entity("left", ""), link("books", "booksParent", "booksChild"), entity("centre", ""),
          link("attends", "attendsChild", "attendsParent", "is attended by"), entity("right", ""));
      } else {
        const [centreId,leftId,rightId] = mixed ? ["RENTAL","SALARY_DEDUCTION","AUTO_DEBIT"] : ["centre","left","right"];
        const canvas = mixed ? el("div","exam-canvas") : board;
        if (mixed) {
          board.tabIndex = 0;
          board.setAttribute("aria-label","TurQ Water diagram. Scroll sideways to reach all entities on a narrow screen.");
          board.append(canvas);
          for (const id of ["PRODUCT_MODEL","PRODUCT_UNIT","CUSTOMER","AGENT"]) {
            const card = entity(id,"");
            card.prepend(el("strong","erd-verb",entityLabel(id)));
            card.style.gridArea = id;
            card.dataset.record=id;
            canvas.append(card);
          }
          exercise.links.forEach(([parent,child,verb],i)=>{
            const id = "link"+i;
            const connector=link(id,id+"Parent",id+"Child",verb);
            connector.style.gridArea=id;
            connector.dataset.from=parent;
            connector.dataset.to=child;
            // AGENT sits to the right of RENTAL. Its one-end belongs on the right.
            if (parent==="AGENT") connector.classList.add("exam-reverse");
            if (parent==="PRODUCT_UNIT") connector.classList.add("exam-vertical");
            canvas.append(connector);
          });
        }
        const hierarchy = el("div", "erd-hierarchy");
        const categoryRow = el("div", "erd-category-row");
        const leftLabel = el("span", "erd-discriminator-label");
        const rightLabel = el("span", "erd-discriminator-label");
        categoryRow.append(leftLabel, addSlot("category", "erd-category-slot", "Circle"), rightLabel);
        const branch = el("div", "erd-branch");
        branch.setAttribute("aria-hidden", "true");
        const subtypes = el("div", "erd-subtypes");
        const voluntaryRole = el("span", "erd-role-value");
        const donorRole = el("span", "erd-role-value");
        const left = entity(leftId, "erd-subtype");
        const right = entity(rightId, "erd-subtype");
        left.prepend(voluntaryRole);
        right.prepend(donorRole);
        subtypes.append(left,right);
        const supertype = entity(centreId, "erd-supertype");
        if (mixed) {
          supertype.prepend(el("strong","erd-verb",entityLabel(centreId)));
          supertype.style.gridArea=centreId;
          supertype.dataset.record=centreId;
          canvas.append(supertype);
        } else hierarchy.append(supertype);
        hierarchy.append(el("div", "erd-stem"), categoryRow,
          addSlot("bars", "erd-bars-slot", "Bars"), branch, subtypes);
        canvas.append(hierarchy);
        updateBranchLabels = () => {
          if (mixed) {
            const hasPackage = byEntity.RENTAL.has("PAYMENT_PACKAGE");
            rightLabel.textContent = hasPackage ? "PAYMENT_PACKAGE" : "";
            for (const [id,target] of [[leftId,voluntaryRole],[rightId,donorRole]]) {
              const branch = placed[id+"Name"];
              const value = {SALARY_DEDUCTION:"Salary deduction",AUTO_DEBIT:"Auto-debit"}[branch];
              target.textContent = hasPackage && value ? "PAYMENT_PACKAGE = "+value : entityLabel(id);
            }
            return;
          }
          const name = side => placed[side + "Name"];
          const flag = side => name(side) === "volunteer" ? "IsVolunteer" : name(side) === "donor" ? "IsDonor" : "";
          const supertypeFields = byEntity.centre;
          leftLabel.textContent = supertypeFields.has(flag("left")) ? flag("left") : "";
          rightLabel.textContent = supertypeFields.has("Role") ? "Role" : supertypeFields.has(flag("right")) ? flag("right") : "";
          const role = side => supertypeFields.has("Role") && ["volunteer","donor"].includes(name(side)) ? "Role = " + tiles[name(side)].label : "";
          voluntaryRole.textContent = role("left");
          donorRole.textContent = role("right");
        };
      }
      exercise.palette.forEach(id => {
        const tile = tiles[id];
        const piece = button("erd-tile");
        piece.draggable = true;
        piece.dataset.tile = id;
        piece.dataset.ink = inkFor(id);
        piece.setAttribute("aria-label", tileLabel(tile));
        tileContent(piece, tile);
        piece.addEventListener("click", () => {
          selectedSlot = "";
          selectedAttribute = null;
          selectedTile = selectedTile === id ? "" : id;
          update();
        });
        piece.addEventListener("dragstart", event => startDrag(event,id));
        piece.addEventListener("dragend",clearDrag);
        paletteButtons.set(id, piece);
        paletteContent.append(piece);
      });

      function update(message) {
        groupNav.value = currentGroup;
        search.hidden = currentGroup !== "attribute" || !searchable;
        const term = search.hidden ? "" : search.value.trim().replaceAll(" ","_").toLowerCase();
        let visibleTiles = 0;
        paletteButtons.forEach((piece, id) => {
          piece.hidden = tiles[id].kind !== currentGroup || !tiles[id].label.toLowerCase().includes(term);
          if (!piece.hidden) visibleTiles++;
          piece.setAttribute("aria-pressed", String(selectedTile === id));
        });
        noMatches.hidden = visibleTiles !== 0;
        slotButtons.forEach(({target, placeholder}, id) => {
          const spec = specs.get(id);
          const tile = tiles[placed[id]];
          const result = outcome.find(item => item.id === id);
          target.replaceChildren();
          if (tile) tileContent(target, tile, true);
          else target.append(el("span", null, placeholder));
          target.dataset.filled = String(Boolean(tile));
          target.dataset.ink = tile ? inkFor(placed[id]) : spec.kind;
          target.draggable = Boolean(tile);
          target.dataset.result = result?.state || "";
          target.setAttribute("aria-pressed", String(selectedSlot === id));
          target.setAttribute("aria-label", spec.label + ": " + (tile ? tileLabel(tile) : "empty") + (result ? ". " + result.state : ""));
          target.classList.toggle("erd-accepts", Boolean(selectedTile && tiles[selectedTile].kind === spec.kind));
          if (result) target.append(el("small", "erd-slot-status", {correct:"Correct", revise:"Retry", missing:"Missing"}[result.state]));
        });
        paintAttributes();
        updateBranchLabels();
        clear.disabled = !selectedSlot || !placed[selectedSlot];
        toSlot.disabled = !selectedTile && !selectedAttribute;
        selection.textContent = message || (selectedSlot ? "Selected slot: " + specs.get(selectedSlot).label :
          selectedAttribute ? "Selected " + selectedAttribute.id + ". Choose an entity to move it to." :
          selectedTile ? "Selected tile: " + tileLabel(tiles[selectedTile]) + ". Choose a highlighted slot." :
            placementMessage());
      }
      function clearFeedback() {
        outcome = [];
        fieldOutcome = null;
        feedback.replaceChildren();
        feedback.hidden = true;
      }
      toSlot.addEventListener("click", () => {
        (board.querySelector(".erd-key-target .erd-attribute-name") ||
          board.querySelector(".erd-accepts[data-filled='false']") || board.querySelector(".erd-accepts"))?.focus();
      });
      clear.addEventListener("click", () => {
        const target = slotButtons.get(selectedSlot).target;
        delete placed[selectedSlot];
        clearFeedback();
        update("Slot cleared. Choose a tile to try again.");
        target.focus();
      });
      reset.addEventListener("click", () => {
        Object.keys(placed).forEach(id => delete placed[id]);
        Object.values(byEntity).forEach(collection=>collection.clear());
        selectedTile = "";
        selectedSlot = "";
        selectedAttribute = null;
        currentGroup = "entity";
        search.value = "";
        clearFeedback();
        update("Diagram cleared.");
      });
      check.addEventListener("click", () => {
        const result = evaluate(exercise, placed, byEntity);
        outcome = result.slots;
        fieldOutcome = result.fields;
        const remaining = outcome.filter(item => item.state !== "correct");
        const right = outcome.length - remaining.length;
        const fieldErrors = fieldOutcome.errors;
        const incomplete = remaining.length || fieldErrors.length;
        const fieldScore = " " + fieldOutcome.correctAttributes + "/" + fieldOutcome.totalAttributes +
          " attributes and " + fieldOutcome.correctKeys + "/" + fieldOutcome.totalKeys + " key roles correct.";
        feedback.replaceChildren(el("strong", null, right + " of " + outcome.length + " diagram slots correct." + fieldScore));
        feedback.className = "erd-feedback feedback " + (incomplete ? "bad" : "good");
        feedback.hidden = false;
        if (incomplete) {
          const list = el("ul", "erd-feedback-list");
          remaining.forEach(item => {
            const entry = el("li");
            entry.append(el("b", null, item.label + " · " + (item.state === "missing" ? "Missing" : "Retry")),
              el("span", null, item.hint));
            list.append(entry);
          });
          fieldErrors.forEach(item=>{
            const entry = el("li");
            entry.append(el("b",null,item.label),el("span",null,item.hint));
            list.append(entry);
          });
          feedback.append(list);
        } else {
          feedback.append(el("p", null, exercise.explanation));
          saveComplete(exercise.id);
          updateNav();
        }
        update();
      });
      update();
    }

    const buttons = exercises.map(exercise => {
      const option = button("erd-filter");
      option.addEventListener("click", () => {
        active = exercise.id;
        updateNav();
        openExercise();
      });
      nav.append(option);
      return [exercise, option];
    });
    function updateNav() {
      buttons.forEach(([exercise, option]) => {
        option.textContent = exercise.title + (completed(exercise.id) ? " ✓" : "");
        option.setAttribute("aria-pressed", String(exercise.id === active));
        option.setAttribute("aria-label", exercise.title + (completed(exercise.id) ? ", completed" : ""));
      });
    }
    updateNav();
    openExercise();
  }

  function makeSymbol(mark) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 52 26");
    svg.setAttribute("class", "erd-symbol");
    svg.setAttribute("aria-hidden", "true");
    function draw(tag, attrs) {
      const shape = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => shape.setAttribute(key, value));
      svg.append(shape);
      return shape;
    }
    const line = (d, dashed = false) => draw("path", {d, fill:"none", stroke:"currentColor", "stroke-width":2,
      "stroke-linecap":"round", ...(dashed ? {"stroke-dasharray":"6 5"} : {})});
    if (mark === "solid" || mark === "dashed") {
      line("M2 13H50", mark === "dashed");
    } else if (mark === "d" || mark === "o") {
      draw("circle", {cx:26, cy:13, r:11, fill:"white", stroke:"currentColor", "stroke-width":2});
      draw("text", {x:26, y:17, "text-anchor":"middle", fill:"currentColor", "font-size":14, "font-weight":700}).textContent = mark;
    } else if (mark === "partial" || mark === "total") {
      line(mark === "total" ? "M10 9H42 M10 17H42" : "M10 13H42");
    } else {
      line("M4 13H49");
      if (mark === "zeroOne" || mark === "zeroMany") {
        draw("circle", {cx:21, cy:13, r:5, fill:"white", stroke:"currentColor", "stroke-width":2});
      } else {
        line("M21 6V20");
      }
      if (mark === "zeroMany" || mark === "oneMany") line("M49 5L34 13L49 21");
      else line("M37 6V20");
    }
    return svg;
  }

  window.ICT200_ERD = {exercises, mount, makeSymbol};
})();
