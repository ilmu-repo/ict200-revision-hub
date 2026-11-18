(() => {
  "use strict";

  // One original data set and one set of business rules for the entire workshop.
  const columns = ["SessionID", "SessionTitle", "TutorID", "TutorName", "ParticipantID", "ParticipantName", "AttendanceStatus"];
  const report = [
    {header: ["S01", "Watercolour Basics", "T07", "Mei Tan"], people: [["P11", "Aina", "Present"], ["P12", "Daniel", "Absent"]]},
    {header: ["S02", "Printmaking", "T07", "Mei Tan"], people: [["P11", "Aina", "Absent"], ["P13", "Suri", "Present"]]}
  ];
  const primaryKey = ["SessionID", "ParticipantID"];
  const repeating = columns.slice(4);
  const rows = report.flatMap(({header, people}) => people.map(person => [...header, ...person]));
  const scenario = "A community arts centre keeps an attendance report for each workshop session. A session has a unique ID, a title and exactly one assigned tutor. Each tutor has a unique ID and one recorded name. A participant has a unique ID and one recorded name, and can appear in many sessions. A participant has at most one attendance record per session. Attendance status belongs to that attendance record. A tutor can be registered before teaching, a session can be scheduled before anyone is listed, and a participant can register with the centre before joining a session.";

  const determinants = {
    session: {label: "SessionID", columns: ["SessionID"]},
    tutor: {label: "TutorID", columns: ["TutorID"]},
    participant: {label: "ParticipantID", columns: ["ParticipantID"]},
    pair: {label: "(SessionID, ParticipantID)", columns: primaryKey}
  };
  const dependencies = [
    {id:"attendance", facts:["AttendanceStatus"], determinant:"pair", type:"full", hint:"Can Aina have different attendance statuses at different sessions? Can participants in the same session have different statuses?"},
    {id:"session", facts:["SessionTitle", "TutorID"], determinant:"session", type:"partial", hint:"The title and assigned tutor are session facts. Ask whether changing the participant changes either fact."},
    {id:"participant", facts:["ParticipantName"], determinant:"participant", type:"partial", hint:"A participant keeps the same recorded name across sessions. Use the smallest determinant for that name."},
    {id:"tutor", facts:["TutorName"], determinant:"tutor", type:"transitive", hint:"Follow the session’s assigned tutor to the tutor’s name. Which field directly identifies the tutor?"}
  ];
  const titles = {full:"Full", partial:"Partial", transitive:"Transitive"};
  const relation = (name, key, fields, fks = []) => ({name, key, fields, fks});
  const attendance = relation("ATTENDANCE", primaryKey, [...primaryKey, "AttendanceStatus"], [
    {field:"SessionID", target:"SESSION"}, {field:"ParticipantID", target:"PARTICIPANT"}
  ]);
  const participant = relation("PARTICIPANT", ["ParticipantID"], ["ParticipantID","ParticipantName"]);
  const schemas = {
    "2nf": [relation("SESSION", ["SessionID"], columns.slice(0,4)),participant,attendance],
    "3nf": [relation("TUTOR", ["TutorID"], ["TutorID","TutorName"]),
      relation("SESSION", ["SessionID"], columns.slice(0,3), [{field:"TutorID",target:"TUTOR"}]),participant,attendance]
  };
  // The displayed connections run Tutor → Session → Attendance ← Participant.
  const links = [
    {id:"teaches", label:"teaches", left:"TUTOR", right:"SESSION", ends:["one","zeroMany"], strength:"dashed",
      hint:"A session has exactly one tutor. A tutor may have zero or many sessions. TutorID is an FK in SESSION, outside its PK."},
    {id:"records", label:"records", left:"SESSION", right:"ATTENDANCE", ends:["one","zeroMany"], strength:"solid",
      hint:"An attendance row belongs to exactly one session. A session may have zero or many rows. SessionID is part of the ATTENDANCE primary key."},
    {id:"belongs", label:"belongs to", left:"ATTENDANCE", right:"PARTICIPANT", ends:["zeroMany","one"], strength:"solid",
      hint:"An attendance row belongs to exactly one participant. A participant may have zero or many rows. ParticipantID is part of the ATTENDANCE primary key."}
  ];
  const stages = [
    {id:"pk", label:"Primary key", title:"Find a key for one attendance row"},
    {id:"dependencies", label:"Dependencies", title:"Find what determines each fact"},
    {id:"unf", label:"UNF", title:"Find the report’s repeating group"},
    {id:"1nf", label:"1NF", title:"Make each row atomic"},
    {id:"2nf", label:"2NF", title:"Remove partial dependencies"},
    {id:"3nf", label:"3NF", title:"Remove the transitive dependency"},
    {id:"erd", label:"Crow’s Foot ERD", title:"Connect the verified 3NF tables"}
  ];
  const key = values => [...new Set(values)].sort().join("|");
  const missing = (expected, actual) => expected.filter(value => !actual.includes(value));

  function checkSet(actual, expected, hint, success) {
    return {ok:key(expected)===key(actual), success, errors:[hint]};
  }

  function checkDependencies(input) {
    const errors = [];
    dependencies.forEach(dep => {
      const item = input[dep.id] || {};
      const facts = dep.facts.join(", ");
      if (item.determinant !== dep.determinant) errors.push({id:dep.id, message:facts + " — revisit the determinant. " + dep.hint});
      else if (item.type !== dep.type) errors.push({id:dep.id, message:facts + " — revisit the dependency type. " + dep.hint});
    });
    return {ok:!errors.length, errors};
  }

  function checkAtomic(input) {
    const correctHeaders = report.flatMap(({people}, index) => people.map(() => String(index)));
    const errors = [];
    if (input.grain !== "attendance") errors.push({id:"grain",message:"Choose a row grain that puts a single participant and a single session on each row."});
    correctHeaders.forEach((header,index) => {
      if ((input.headers || [])[index] !== header) {
        errors.push({id:"row-" + index,message:"Row " + (index+1) + " — match this participant entry to its session in the original report and repeat the session’s header."});
      }
    });
    return {ok:!errors.length, errors};
  }

  function checkTables(stage, drafts) {
    const target = schemas[stage];
    const errors = [];
    const matched = new Map();
    const checked = [];
    drafts.forEach((table, index) => {
      const fields = table.fields || [];
      const primary = table.key || [];
      const id = "table-" + index;
      const label = table.name?.trim() || "Table " + (index+1);
      if (!fields.length || !primary.length) {
        errors.push({id,message:label + " — select its fields and its primary key."});
        return;
      }
      const model = target.find(candidate => key(candidate.key) === key(primary));
      if (!model) {
        errors.push({id,message:label + " — this key does not match a relation at this stage. Check the smallest determinant for the facts that should stay together."});
        return;
      }
      if (matched.has(model.name)) {
        errors.push({id,message:label + " — another table already uses this key. Combine the facts with the same determinant or revise one table’s key."});
      }
      matched.set(model.name,true);
      if (key(fields) !== key(model.fields)) {
        const overlooked = missing(model.fields,fields);
        const extra = missing(fields,model.fields);
        const clues = [];
        if (overlooked.length) clues.push("A required fact or linking ID is missing.");
        if (extra.length) clues.push("Review whether " + extra.join(", ") + " should belong here at this stage.");
        if (stage === "2nf" && model.name === "SESSION") clues.push("Keep tutor details with the session until the 3NF step.");
        if (stage === "3nf" && model.name === "SESSION") clues.push("Keep the tutor’s ID so SESSION can link to TUTOR.");
        errors.push({id,message:label + " — " + clues.join(" ")});
      }
      checked.push({...model, showName:table.name?.trim() || model.name, index});
    });
    if (target.length !== drafts.length) {
      errors.unshift({message:"Review how many groups of facts need their own table at this stage. Combine facts with the same key and separate facts that have a different determinant."});
    }
    const names = checked.map(table => table.showName.toUpperCase());
    if (new Set(names).size !== names.length) errors.push({message:"Give the tables distinct names so their foreign key references are clear."});
    return {ok:!errors.length && checked.length === target.length, errors, checked};
  }

  function checkERD(input, naming) {
    const errors = [];
    links.forEach(link => {
      const picks = input[link.id] || {};
      const label = naming[link.left] + " → " + naming[link.right];
      ["left", "right", "strength"].forEach((part,index) => {
        const expected = index < 2 ? link.ends[index] : link.strength;
        if (picks[part] !== expected) {
          const element = index < 2 ? part + " end" : "line style";
          const issue = picks[part] ? "revise the " : "choose the ";
          errors.push({id:link.id+"-"+part,message:label + " — " + issue + element + ". " + link.hint});
        }
      });
    });
    return {ok:!errors.length, errors};
  }

  function project(fields) {
    const indices = fields.map(field => columns.indexOf(field));
    return Array.from(new Map(rows.map(row => {
      const values = indices.map(index => row[index]);
      return [JSON.stringify(values),values];
    })).values());
  }

  window.ICT200_NORMALIZATION_MODEL = {columns, report, primaryKey, repeating, scenario,
    determinants, dependencies, titles, schemas, links, stages, rows, project, checkSet,
    checkDependencies, checkAtomic, checkTables, checkERD};
})();
