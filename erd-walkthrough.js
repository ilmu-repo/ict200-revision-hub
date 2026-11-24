(() => {
  "use strict";
  const exercises = window.ICT200_ERD.exercises;
  const lessons = {
    clinic: {title:"1 · Clinic appointments", steps:[
      ["Find the three records","Entities","patients, doctors and appointments","What needs its own record?",["Draw PATIENT, DOCTOR and APPOINTMENT.","Give each visit its own APPOINTMENT record."],1],
      ["Put facts in the right box","Attributes and keys","a unique appointment ID, an appointment date and an appointment time","What identifies one visit?",["PATIENT: underline PatientID. Add PatientName and Phone.","DOCTOR: underline DoctorID. Add DoctorName and Specialty.","APPOINTMENT: underline AppointmentID. Add AppointmentDate and AppointmentTime."],2],
      ["Connect each visit to its people","Foreign keys","exactly one patient and is attended by exactly one doctor","Where do the two references belong?",["In APPOINTMENT, add PatientID (FK1) and DoctorID (FK2).","PatientID links to PATIENT.PatientID. DoctorID links to DOCTOR.DoctorID.","Draw two dashed lines. The FKs sit outside the AppointmentID primary key."],3],
      ["Read the ends in both directions","Participation","may be registered before they have any appointments","Can a patient or doctor have zero appointments?",["One appointment needs exactly one patient and exactly one doctor. Put two strokes beside each parent.","One patient or doctor can have zero or many appointments. Put a circle and crow’s foot beside APPOINTMENT on each link."],4],
      ["Check a repeat visit","Final diagram","The same patient may see the same doctor again","Can this diagram store both visits?",["Give a repeat visit a new AppointmentID. The same PatientID and DoctorID can appear again.","A patient with no visits has a PATIENT row and zero APPOINTMENT rows."],5]
    ]},
    roles: {title:"2 · Organisation membership", steps:[
      ["Find the common record and the roles","Entity types","Members may register as volunteers, donors, or both.","What is true of every volunteer and every donor?",["Draw MEMBER as the supertype.","Draw VOLUNTEER and DONOR as subtypes. Both roles can belong to the same member."],1],
      ["Place the shared and role-specific facts","Attributes and keys","one main area of interest","Which facts belong to one role only?",["MEMBER holds MemberID (PK), MemberName and Phone.","VOLUNTEER adds InterestArea. DONOR adds DonationMethod.","Underline MemberID in each subtype. Label it PK and FK1 because it identifies the row and links back to MEMBER."],2],
      ["Decide whether both roles are allowed","Membership","or both","Can the same MemberID appear in both subtypes?",["Both roles are allowed. Put o in the category circle for overlapping membership.","One person can have a VOLUNTEER row and a DONOR row, both with that person’s MemberID."],3],
      ["Decide whether a role is required","Completeness","not registered for either role remains in the organisation's records","Can a member have neither role?",["Neither role is required. Draw one bar for partial completeness.","Keep the MEMBER row even when there are no subtype rows."],4],
      ["Record and check the role choices","Final diagram","whether each member is registered as a volunteer and whether the member is registered as a donor","How can we store two independent answers?",["IsVolunteer is Yes when a VOLUNTEER row exists.","IsDonor is Yes when a DONOR row exists.","Check the four combinations in the table."],5]
    ]},
    "one-role": {title:"3(a) · Exactly one role", steps:[
      ["Start from Exercise 2","Base model","Use the organisation and member details in Exercise 2.","Which parts of the original model still apply?",["Start from the original MEMBER, VOLUNTEER and DONOR diagram.","Keep MemberID and the role-specific attributes. Recheck both rules for policy (a)."],0],
      ["Read the limit on membership","Membership","not allowed to register for both roles","Could a member volunteer and donate?",["A member can take either role, but cannot hold both at once. Put d in the circle for disjoint membership.","A MemberID can appear in at most one subtype."],3],
      ["Read the minimum participation","Completeness","Every member must register","Could a member remain in neither role?",["Every member must have a role. Draw two bars for total completeness.","Together, d and two bars mean exactly one role per member."],4],
      ["Choose the discriminator and check","Final diagram","either a volunteer or a donor","Which single value identifies the role?",["Add one required discriminator, Role, to MEMBER.","Use VOLUNTEER or DONOR as its value. Create the matching subtype row."],5]
    ]},
    "at-least-one": {title:"3(b) · At least one role", steps:[
      ["Return to the original policy","Base model","In a separate policy proposal","Which model is the starting point?",["Start from Exercise 2 again for policy (b).","Keep MEMBER and the two subtype boxes. Read this policy independently of (a)."],0],
      ["Check whether both roles can coexist","Membership","a member may register for both roles","Which category symbol fits?",["Both roles are allowed. Keep o for overlapping membership.","The same MemberID may appear in both VOLUNTEER and DONOR."],3],
      ["Check whether neither role is allowed","Completeness","every member must register","Can both indicators be No?",["Every member must have a role. Draw two bars for total completeness.","Each MEMBER needs at least one subtype row."],4],
      ["Test the two indicators","Final diagram","every member must register as a volunteer or a donor, and a member may register for both roles","Which combinations meet both rules?",["Keep IsVolunteer and IsDonor. At least one must be Yes.","Yes/Yes is allowed. No/No breaks the total completeness rule."],5]
    ]}
  };
  const esc = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const exam = window.ICT200_TURQ;
  lessons[exam.id] = {title:exam.title,steps:exam.steps};
  const palette={
    blue:["#185ABD","#EAF1FD"],green:["#006B58","#E7F5EF"],purple:["#7030A0","#F1EAF8"],
    orange:["#A44200","#FFF0DE"],pink:["#AD1958","#FCE9F1"]
  };
  const rules={
    clinic:[
      ["green","unique appointment ID|unique patient ID|unique doctor ID|appointment date|appointment time|phone number|name|specialty|AppointmentID|PatientID|DoctorID|PatientName|DoctorName|AppointmentDate|AppointmentTime|Phone|FK1|FK2|PK"],
      ["orange","before they have any appointments|exactly one|zero or many|several|no visits"],
      ["purple","may book|may attend|attended by|may see|repeat visit|both links|dashed lines"],
      ["blue","patients?|doctors?|appointments?"]
    ],
    eerd:[
      ["green","unique member ID|phone number|name(?! the membership)|main area of interest|preferred donation method|whether each member is registered|whether the member is registered|MemberID|MemberName|Phone|InterestArea|DonationMethod|IsVolunteer|IsDonor|discriminators?|inherited keys|FK1|PK"],
      ["pink","not registered for either role|every member must register|every member must have a role|neither role is required|partial completeness|total completeness|one bar|two bars|at least one|No/No"],
      ["orange","not allowed to register for both roles|may register for both roles|or both|both roles are allowed|cannot hold both at once|overlapping membership|disjoint membership|exactly one role|at most one|Yes/Yes"],
      ["purple","volunteers?|donors?|subtypes?"],
      ["blue","members?|supertype"]
    ]
  };
  function legend(ex){
    if(ex.type==="mixed") return '<div class="colour-key" aria-label="Colour key">'+[
      ["blue","Entity / supertype"],["green","Attribute / key"],["purple","Relationship / subtype"],
      ["orange","Participation / membership"],["pink","Completeness"]
    ].map(([c,t])=>paint(t,c,t)).join("")+'</div>';
    const entries=ex.type==="erd"?[["blue","Entity"],["green","Attribute or key"],["purple","Relationship"],["orange","Participation"]]:
      [["blue","Supertype"],["purple","Subtype"],["green","Attribute or key"],["orange","Membership"],["pink","Completeness"]];
    return '<div class="colour-key" aria-label="Colour key">'+entries.map(([c,t])=>paint(t,c,t)).join("")+'</div>';
  }
  function paint(t,c,label){
    const [ink,bg]=palette[c];
    return '<mark style="color:'+ink+';background:'+bg+'" title="'+esc(label)+'">'+esc(t)+'</mark>';
  }
  function annotate(value,ex){
    if(ex.type==="mixed"){
      const patterns=[
        ["green","Attribute / key",Object.values(ex.schema).flatMap(s=>Object.keys(s.fields)).concat(["model ID","rental account number","product serial number","IC number","start date","rental period","monthly payment amount","monthly payments","payment package","salary number","bank account number","bank name","water capacity","name","address","phone number","email","occupation","description","ID","PK","FK[123]","discriminator"]).join("|")],
        ["pink","Completeness","must be specified|required package|rules out neither|two bars|total completeness"],
        ["orange","Participation / membership","two payment package options|one agent only|many customers|more than one|cannot use both|exactly one|zero or many|disjoint"],
        ["purple","Relationship / subtype","salary deductions?|auto-debit(?: deductions)?|SALARY_DEDUCTION|AUTO_DEBIT|managed by|rented by|can be rented|may rent|dashed links"],
        ["blue","Entity / supertype","PRODUCT_MODEL|PRODUCT_UNIT|water filter (?:product )?models?|physical unit|customers?|rentals?|agents?"]
      ];
      const matcher = new RegExp("\\b(?:"+patterns.map(a=>"("+a[2]+")").join("|")+")\\b","gi");
      let pos=0,html="";
      for(const m of value.matchAll(matcher)){
        const [col,label]=patterns[m.slice(1).findIndex(Boolean)];
        html+=esc(value.slice(pos,m.index))+paint(m[0],col,label);pos=m.index+m[0].length;
      }
      return html+esc(value.slice(pos));
    }
    const specs=rules[ex.type==="erd"?"clinic":"eerd"];
    const labels=ex.type==="erd"?["Attribute or key","Participation","Relationship","Entity"]:["Attribute or key","Completeness","Membership","Subtype","Supertype"];
    const parts=specs.map(([,pattern])=>"("+pattern+")");
    if(ex.type==="eerd") parts.push("(Role|[do])");
    const re=new RegExp("\\b(?:"+parts.join("|")+")\\b","gi");
    let out="",end=0;
    for(const m of value.matchAll(re)){
      const n=m.slice(1).findIndex(Boolean);
      let term;
      if(n<specs.length) term=paint(m[0],specs[n][0],labels[n]);
      else if(m[0]==="Role") term=paint(m[0],"green","Discriminator");
      else if(m[0]==="d"||m[0]==="o") term=paint(m[0],"orange","Membership");
      else term=esc(m[0]);
      out+=esc(value.slice(end,m.index))+term;end=m.index+m[0].length;
    }
    return out+esc(value.slice(end));
  }
  const svgText = (x,y,value,attrs="") => '<text x="'+x+'" y="'+y+'" '+attrs+'>'+esc(value)+'</text>';
  const stroke = (d,extra="") => '<path d="'+d+'" fill="none" stroke="#28666c" stroke-width="2.6" '+extra+'/>';
  function box(x,y,w,name,fields,fill){
    const height=34+fields.length*23;
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+height+'" fill="#f5f8fa" stroke="#547482"/>'+
      '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" fill="'+fill+'"/>'+
      svgText(x+w/2,y+23,name,'text-anchor="middle" fill="white" font-weight="700"')+
      fields.map(([field,key],i)=>{
        const hierarchy=["MEMBER","VOLUNTEER","DONOR"].includes(name);
        const ink=hierarchy||!key?palette.green[0]:key.includes("PK")&&key.includes("FK")?palette.purple[0]:key==="PK"?palette.blue[0]:palette.orange[0];
        return svgText(x+8,y+53+i*23,key,'font-size="12" font-weight="700" fill="'+ink+'"')+
          svgText(x+62,y+53+i*23,field,(field.length>=15?'font-size="14" ':'')+'fill="'+ink+'" '+(key.includes("PK")?'text-decoration="underline" font-weight="700"':""));
      }).join("");
  }
  function waterDiagram(ex,stage) {
    const coords = {
      PRODUCT_MODEL:[10,10,240,1], PRODUCT_UNIT:[410,10,240,1],
      CUSTOMER:[10,195,240,2], AGENT:[810,195,240,2], RENTAL:[410,195,240,3],
      SALARY_DEDUCTION:[105,518,280,5], AUTO_DEBIT:[685,518,280,5]
    };
    let drawing="";
    const packages=stage===5||stage===6;
    for(const [name,[x,y,w,start]] of Object.entries(coords)){
      if(stage<start || (packages && start<3)) continue;
      let fk=0;
      const fields=Object.entries(ex.schema[name].fields).map(([f,r])=>{
        const key=r==="pk"?"PK":r==="fk"?"FK"+(++fk):r==="pkfk"?"PK FK1":"";
        return [f,key];
      });
      drawing+=box(x,y,w,name,fields,palette[start===5?"purple":"blue"][0]);
    }
    // Draw each connector from the one end to the many end in local coordinates.
    function edge(x,y,angle,length,verb,tx,ty){
      drawing+='<g transform="translate('+x+' '+y+') rotate('+angle+')">'+stroke('M0 0H'+length,'stroke-dasharray="6 4"')+
        stroke('M7 -9v18 M14 -9v18 M'+length+' -9l-15 9 15 9')+
        '<circle cx="'+(length-24)+'" cy="0" r="5" fill="white" stroke="#28666c" stroke-width="2.6"/></g>'+
        svgText(tx,ty,verb,'text-anchor="middle" font-size="15"');
    }
    if(!packages) edge(250,53,0,160,"has units",330,39);
    if(stage>=4 && !packages){
      edge(250,264,0,160,"takes out",330,250);
      edge(810,264,180,160,"manages",730,250);
      edge(530,90,90,105,"appears on",592,146);
    }
    if(stage>=5){
      drawing+=stroke("M530 413V439 M530 465V478 M245 518V478H825V518")+
        '<circle cx="530" cy="452" r="13" stroke="#A44200" stroke-width="2.5" fill="white"/>';
      if(stage>=6){
        drawing+=svgText(530,458,"d",'text-anchor="middle" fill="#A44200" font-weight="bold"')+
          stroke("M508 466h44 M508 471h44",'style="stroke:#AD1958"')+
          svgText(551,457,"PAYMENT_PACKAGE",'fill="#006B58"')+
          svgText(251,507,"Salary deduction",'fill="#006B58"')+
          svgText(819,507,"Auto-debit",'text-anchor="end" fill="#006B58"');
      }
    }
    const height=stage===1?146:stage===2?379:stage<5?427:655;
    const width=stage===1?665:1065;
    const view=stage===5||stage===6?"85 188 900 459":"0 0 "+width+" "+height;
    const desc=["Model identifies a product type. Serial number identifies a unit.",
      "Customer uses IC number. Agent uses agent ID.",
      "Rental uses account number and references customer, unit and agent.",
      "One model has zero or many units. One customer, unit or agent can have zero or many rentals. Each child has exactly one parent on each link.",
      "Salary deduction and auto-debit inherit rental account number as PK and FK1.",
      "Payment package selects exactly one subtype. Disjoint d and two bars mean total completeness."].slice(0,stage).join(" ");
    return '<div class="diagram water-diagram" tabindex="0" aria-label="TurQ Water diagram, scroll horizontally on small screens"><svg viewBox="'+view+'" role="img" aria-label="'+esc(desc)+'" font-family="Arial,sans-serif" font-size="16" fill="#18344b">'+drawing+'</svg></div>';
  }
  function diagram(ex, stage) {
    if(ex.type==="mixed") return waterDiagram(ex,stage);
    let shapes="", description="", height=265;
    if(ex.type==="erd"){
      const positions=[["left",8,36,165],["centre",284,36,222],["right",615,36,173]];
      for(const [pos,x,y,w] of positions){
        const name=ex.answers[0][pos+"Name"].toUpperCase();
        const fields=Object.entries(ex.schema[pos].fields).filter(([,role])=>stage>=2&&(role!=="fk"||stage>=3))
          .map(([f,r])=>[f,r==="pk"?"PK":r==="fk"?(f==="PatientID"?"FK1":"FK2"):""]);
        shapes+=box(x,y,w,name,fields,palette.blue[0]);
      }
      if(stage>=3){
        shapes+=stroke("M173 108H284 M506 108H615",'stroke-dasharray="6 4"')+svgText(199,92,"books")+svgText(531,92,"attends");
      }
      if(stage>=4){
        shapes+=stroke("M180 98v20 M187 98v20 M602 98v20 M609 98v20 M284 99l-16 9 16 9 M506 99l16 9-16 9");
        for(const x of [257,533]) shapes+='<circle cx="'+x+'" cy="108" r="5.5" fill="white" stroke="#28666c" stroke-width="2.5"/>';
        const endLabel='text-anchor="middle" font-size="13"';
        for(const [x,value] of [[183,"(1,1)"],[266,"(0,N)"],[526,"(0,N)"],[602,"(1,1)"]]) shapes+=svgText(x,134,value,endLabel);
      }
      description="Patient, Appointment and Doctor."+ (stage>=2?" The primary keys are PatientID, AppointmentID and DoctorID.":"")+
        (stage>=3?" Appointment has two non-identifying links through PatientID and DoctorID.":"")+
        (stage>=4?" Each appointment has exactly one patient and one doctor. Each patient or doctor can have zero or many appointments.":"");
      height=202;
    }else{
      const model=stage===0?exercises.find(e=>e.id==="roles"):ex;
      const level=stage===0?5:stage;
      const fields = name=>Object.entries(model.fields[name]).filter(([f])=>level>=2&&(level>=3||!["IsVolunteer","IsDonor","Role"].includes(f))).map(([f,r])=>[f,r==="pk"?"PK":r==="pkfk"?"PK FK1":""]);
      const common=fields("member");
      const end=10+34+23*common.length;
      shapes=box(294,10,212,"MEMBER",common,palette.blue[0])+box(70,248,225,"VOLUNTEER",fields("volunteer"),palette.purple[0])+box(502,248,225,"DONOR",fields("donor"),palette.purple[0]);
      height=335;
      if(level>=2){
        shapes+=stroke('M400 '+end+'V170 M400 198V220 M182 248V220H614V248');
        shapes+='<circle cx="400" cy="184" r="14" fill="white" stroke="#a64a14" stroke-width="2.5"/>';
      }
      if(level>=3){
        const disjoint=model.answers[0].category==="d";
        const fieldStyle='font-weight="600" fill="'+palette.green[0]+'"';
        shapes+=svgText(400,190,model.answers[0].category,'text-anchor="middle" fill="'+palette.orange[0]+'" font-weight="bold"');
        if(!disjoint) shapes+=svgText(376,190,"IsVolunteer",'text-anchor="end" '+fieldStyle);
        shapes+=svgText(424,190,disjoint?"Role":"IsDonor",fieldStyle);
        shapes+=svgText(194,241,disjoint?"Role = VOLUNTEER":"IsVolunteer = Yes",fieldStyle)
          +svgText(602,241,disjoint?"Role = DONOR":"IsDonor = Yes",'text-anchor="end" '+fieldStyle);
      }
      if(level>=4) shapes+='<path d="M375 198h50 '+(model.answers[0].bars==="total"?"M375 204h50":"")+'" stroke="#a51958" stroke-width="3"/>';
      description=(stage===0?"Exercise 2 baseline. ":"")+"Member is the supertype. Volunteer and Donor are subtypes."+
        (level>=2?" Both subtypes inherit MemberID as their primary key and foreign key.":"")+
        (level>=3?(model.answers[0].category==="d"?" Disjoint, d. Role selects VOLUNTEER or DONOR.":" Overlapping, o. IsVolunteer and IsDonor select the corresponding roles."):"")+
        (level>=4?(model.answers[0].bars==="total"?" Two bars. Every member needs at least one role.":" One bar. A member may have neither role."):"");
    }
    return '<div class="diagram" tabindex="0" aria-label="Diagram, scroll horizontally on small screens"><svg viewBox="0 0 800 '+height+'" role="img" aria-label="'+esc(description)+'" font-family="Arial,sans-serif" font-size="16" fill="#18344b">'+shapes+'</svg></div>';
  }
  function truth(ex) {
    const a=ex.answers[0];
    return '<table><caption>Test one MemberID</caption><thead><tr><th>Volunteer</th><th>Donor</th><th>Allowed?</th></tr></thead><tbody>'+
      [[0,0],[1,0],[0,1],[1,1]].map(([v,d])=>'<tr><td>'+(v?"Yes":"No")+'</td><td>'+(d?"Yes":"No")+'</td><td>'+((v+d===2&&a.category==="d")||(v+d===0&&a.bars==="total")?"No":"Yes")+'</td></tr>').join("")+'</tbody></table>';
  }
  function source(ex){return [...ex.scenario,...ex.questions];}
  function originalExercise(ex,open){
    const paragraph=t=>'<p>'+annotate(t,ex)+'</p>';
    // The printed TurQ question has an introduction, eight bullets, then a lead-in to (a) and (b).
    const water=ex.id===exam.id;
    const narrative=water?paragraph(ex.scenario[0])+'<ul class="source-rules">'+
      ex.scenario.slice(1,-1).map(t=>'<li>'+paragraph(t)+'</li>').join("")+'</ul>':ex.scenario.map(paragraph).join("");
    const tasks=ex.questions.map(t=>{
      const marks=t.match(/ \(\d+ marks\)$/);
      return marks?'<p>'+annotate(t.slice(0,marks.index),ex)+'<strong class="source-marks">'+esc(marks[0])+'</strong></p>':paragraph(t);
    }).join("");
    return '<details class="source-paper" '+(open?'open':'')+'><summary>Original exercise</summary>'+legend(ex)+
      '<div class="source-body">'+narrative+'</div><section class="source-tasks"><h2>Questions</h2>'+
      (water?paragraph(ex.scenario.at(-1)):'')+tasks+'</section></details>';
  }
  const questions=[
    {section:"Classroom practice",source:"Exercise 1",title:"Clinic appointments",topics:"Entities, keys and Crow’s Foot cardinality",parts:["clinic"]},
    {section:"Classroom practice",source:"Exercise 2",title:"Organisation membership",topics:"Overlapping subtypes and partial completeness",parts:["roles"]},
    {section:"Classroom practice",source:"Exercise 3",title:"Changes to membership policy",topics:"Parts (a) and (b) · Compare two sets of subtype rules",parts:["one-role","at-least-one"]},
    {section:"Past examinations",source:"February 2026 · Part C, Question 1",title:"TurQ Water",topics:"Rental records, payment subtypes and information outputs",parts:[exam.id]}
  ];
  document.querySelector("#collections").innerHTML=[...new Set(questions.map(q=>q.section))].map(section=>
    '<section class="collection"><h2>'+esc(section)+'</h2><ul>'+questions.filter(q=>q.section===section).map(q=>
      '<li><a href="#'+q.parts[0]+'"><span><small>'+esc(q.source)+'</small><strong>'+esc(q.title)+'</strong><span>'+esc(q.topics)+'</span></span><b aria-hidden="true">→</b></a></li>').join("")+'</ul></section>').join("");
  function questionNav(q){
    const i=questions.indexOf(q);
    function link(other,label,cls){
      return other?'<a class="'+cls+'" href="#'+other.parts[0]+'"><small>'+label+'</small><strong>'+esc(other.title)+'</strong></a>':"";
    }
    return '<nav class="question-nav" aria-label="Questions">'+link(questions[i-1],"← Previous question","previous-question")+
      link(questions[i+1],"Next question →","next-question")+'</nav>';
  }
  function stepMenu(ex,index){
    const steps=lessons[ex.id].steps;
    const links=steps.map(([title],i)=>
      '<a href="#'+ex.id+'/'+(i+1)+'" '+(i===index?'aria-current="step"':'')+'><b>'+(i+1)+'</b> '+esc(title)+'</a>').join("");
    const options=steps.map(([title],i)=>
      '<option value="'+(i+1)+'" '+(i===index?'selected':'')+'>'+(i+1)+' · '+esc(title)+'</option>').join("");
    return '<nav class="step-menu" aria-label="Steps for this exercise"><strong>Steps</strong><div class="step-links">'+links+
      '</div><select aria-label="Jump to step">'+options+'</select></nav>';
  }
  function stepHTML(ex,i){
    const steps=lessons[ex.id].steps;
    const [title,label,quote,ask,points,stage]=steps[i];
    return '<article class="step"><small>Step '+(i+1)+' of '+steps.length+'</small><h3 tabindex="-1">'+esc(title)+'</h3><blockquote class="clue"><span class="label">'+esc(label)+'</span> · <q>'+annotate(quote,ex)+'</q></blockquote><p><strong>'+esc(ask)+'</strong></p><ul class="teaching-points">'+points.map(t=>'<li>'+annotate(t,ex)+'</li>').join("")+'</ul>'+diagram(ex,stage)+(stage===5&&ex.type==="eerd"?truth(ex):"")+'</article>';
  }
  function show(){
    const [id,num]=location.hash.slice(1).split("/");
    const ex=exercises.find(e=>e.id===id);
    const root=document.querySelector("#lesson"),library=document.querySelector("#library");
    library.hidden=!!ex;
    root.hidden=!ex;
    document.body.classList.toggle("library-page",!ex);
    if(!ex){
      document.body.classList.remove("printing-exam");
      document.title="ERD and EERD question library · ICT200";
      document.querySelector("header a").href="index.html#erd";
      root.replaceChildren();
      delete root.dataset.case;
      return;
    }
    const lesson=lessons[ex.id],question=questions.find(q=>q.parts.includes(ex.id));
    document.title=question.title+" · ICT200 worked answers";
    document.body.classList.toggle("printing-exam",ex.type==="mixed");
    document.querySelector("header a").href="index.html?exercise="+ex.id+"#erd";
    const index=Math.max(0,Math.min(lesson.steps.length-1,(Number.parseInt(num,10)||1)-1));
    const open=root.dataset.case!==ex.id||root.querySelector("details")?.open||!num;
    root.dataset.case=ex.id;
    const parts=question.parts.length>1?'<nav class="parts" aria-label="Question parts">'+question.parts.map((p,i)=>
      '<a href="#'+p+'" '+(p===id?'aria-current="page"':'')+'>Part ('+String.fromCharCode(97+i)+') · '+esc(lessons[p].title.split(" · ")[1])+'</a>').join("")+'</nav>':"";
    root.innerHTML='<a class="library-back" href="erd-walkthrough.html">← Question library</a><div class="question-title"><small>'+esc(question.section)+' / '+esc(question.source)+'</small><h1 tabindex="-1">'+esc(question.title)+'</h1>'+parts+'</div>'+
      originalExercise(ex,open)+'<div class="reading-layout">'+stepMenu(ex,index)+'<div class="reading-content">'+stepHTML(ex,index)+
      '<div class="controls"><button type="button" id="prev">Previous step</button><button type="button" id="next" class="next">Next step</button></div>'+
      (parts && index===lesson.steps.length-1 && id===question.parts[0]?'<a class="continue-part" href="#'+question.parts[1]+'">Continue to part (b) →</a>':'')+
      questionNav(question)+'</div></div>';
    root.querySelector(".step-menu select").onchange=event=>{location.hash=ex.id+"/"+event.target.value;};
    for(const [key,change] of [["prev",-1],["next",1]]){
      const b=document.getElementById(key); b.disabled=index+change<0||index+change>=lesson.steps.length;
      b.onclick=()=>{location.hash=ex.id+"/"+(index+1+change);};
    }
  }
  window.addEventListener("beforeprint",()=>{
    if(!document.querySelector("#library").hidden) return;
    const current=document.querySelector("#lesson").dataset.case;
    const printable=document.body.classList.contains("printing-exam") ? exercises.filter(e=>e.id===current) : exercises.filter(e=>e.type!=="mixed");
    const sheets=[];
    for(const ex of printable){
      const {title,steps}=lessons[ex.id];
      if(ex.type==="mixed"){
        const head='<section class="sheet exam-sheet"><small>ICT200 · February 2026 · Part C, Question 1 · pp. 12–13</small>';
        const original=source(ex);
        for(const [i,part] of [original.slice(0,6),original.slice(6)].entries())
          sheets.push(head+'<h2>'+esc(title)+'</h2><h3>Original question · '+(i+1)+' of 2</h3>'+legend(ex)+part.map(t=>'<p>'+annotate(t,ex)+'</p>').join("")+'</section>');
        steps.forEach((step,i)=>sheets.push(head+stepHTML(ex,i)+'</section>'));
        sheets.push(head+'<h2>Complete proposed ERD and EERD</h2>'+waterDiagram(ex,7)+'</section>');
        continue;
      }
      sheets.push('<section class="sheet"><small>ICT200 · Short ERD and EERD worked answers</small><h2>'+esc(title)+'</h2><h3>Original exercise</h3>'+legend(ex)+source(ex).map(t=>'<p>'+annotate(t,ex)+'</p>').join("")+'</section>');
      steps.forEach((step,i)=>sheets.push('<section class="sheet"><small>ICT200 · '+esc(title)+'</small>'+stepHTML(ex,i)+'</section>'));
    }
    document.querySelector("#print").innerHTML=sheets.join("");
  });
  function focusStep(){
    const heading=document.querySelector("#lesson .step h3");
    heading.focus({preventScroll:true});
    heading.closest(".step").scrollIntoView({block:"start"});
  }
  window.addEventListener("hashchange",()=>{
    show();
    if(!document.querySelector("#library").hidden) document.querySelector("#library h1").focus();
    else if(location.hash.includes("/")) focusStep();
    else { document.querySelector("#lesson h1").focus({preventScroll:true}); window.scrollTo(0,0); }
  });
  show();
  if(document.querySelector("#library").hidden && location.hash.includes("/")) focusStep();
})();
