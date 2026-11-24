(() => {
  "use strict";
  const exercises = window.ICT200_ERD.exercises;
  const lessons = {
    clinic: {title:"1 · Clinic appointments", steps:[
      ["Find the three records","Entities","patients, doctors and appointments","What needs its own record?",["Draw PATIENT, DOCTOR and APPOINTMENT.","Give each visit its own APPOINTMENT record."],1],
      ["Put facts in the right box","Attributes and keys","a unique appointment ID, an appointment date and an appointment time","What identifies one visit?",["PATIENT: underline PatientID. Add PatientName and Phone.","DOCTOR: underline DoctorID. Add DoctorName and Specialty.","APPOINTMENT: underline AppointmentID. Add AppointmentDate and AppointmentTime."],2],
      ["Connect each visit to its people","Foreign keys","exactly one patient and is attended by exactly one doctor","Where do the two references belong?",["In APPOINTMENT, add PatientID (FK1) and DoctorID (FK2).","Link each FK to its parent PK. Draw dashed lines because AppointmentID alone identifies each visit."],3],
      ["Read the ends in both directions","Participation","may be registered before they have any appointments","Can a patient or doctor have zero appointments?",["One appointment needs exactly one patient and exactly one doctor. Put two strokes beside each parent.","One patient or doctor can have zero or many appointments. Put a circle and crow’s foot beside APPOINTMENT on each link."],4],
      ["Check a repeat visit","Final diagram","The same patient may see the same doctor again","Can this diagram store both visits?",["Give a repeat visit a new AppointmentID. The same PatientID and DoctorID can appear again.","A patient with no visits has a PATIENT row and zero APPOINTMENT rows."],5]
    ]},
    roles: {title:"2 · Organisation membership", steps:[
      ["Find the common record and the roles","Entity types","Members may register as volunteers, donors, or both.","What is true of every volunteer and every donor?",["Draw MEMBER as the supertype.","Draw VOLUNTEER and DONOR as subtypes. Both roles can belong to the same member."],1],
      ["Place the shared and role-specific facts","Attributes and keys","one main area of interest","Which facts belong to one role only?",["MEMBER holds MemberID (PK), MemberName and Phone.","VOLUNTEER adds InterestArea. DONOR adds DonationMethod.","Underline MemberID in each subtype. Label it PK and FK1 because it identifies the row and links back to MEMBER."],2],
      ["Decide whether both roles are allowed","Membership","or both","Can the same MemberID appear in both subtypes?",["Both roles are allowed. Put o in the category circle for overlapping membership.","A volunteer and a donor can share the same MemberID."],3],
      ["Decide whether a role is required","Completeness","not registered for either role remains in the organisation's records","Can a member have neither role?",["Neither role is required. Draw one bar for partial completeness.","Keep the MEMBER row even when there are no subtype rows."],4],
      ["Record and check the role choices","Final diagram","whether each member is registered as a volunteer and whether the member is registered as a donor","How can we store two independent answers?",["IsVolunteer is Yes when a VOLUNTEER row exists.","IsDonor is Yes when a DONOR row exists.","Check the four combinations in the table."],5]
    ]},
    "one-role": {title:"3(a) · Exactly one role", steps:[
      ["Start from Exercise 2","Base model","Use the organisation and member details in Exercise 2.","Which parts of the original model still apply?",["Start from the original MEMBER, VOLUNTEER and DONOR diagram.","Keep MemberID and the role-specific attributes. Recheck both rules for policy (a)."],0],
      ["Read the limit on membership","Membership","not allowed to register for both roles","Could a member volunteer and donate?",["Both roles are forbidden. Put d in the circle for disjoint membership.","A MemberID can appear in at most one subtype."],3],
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
      ["green","unique member ID|phone number|name|main area of interest|preferred donation method|whether each member is registered|whether the member is registered|MemberID|MemberName|Phone|InterestArea|DonationMethod|IsVolunteer|IsDonor|discriminators?|inherited keys|FK1|PK"],
      ["pink","not registered for either role|every member must register|every member must have a role|neither role is required|partial completeness|total completeness|one bar|two bars|at least one|No/No"],
      ["orange","not allowed to register for both roles|may register for both roles|or both|both roles are allowed|both roles are forbidden|overlapping membership|disjoint membership|exactly one role|at most one|Yes/Yes"],
      ["purple","volunteers?|donors?|subtypes?"],
      ["blue","members?|supertype"]
    ]
  };
  function legend(ex){
    const entries=ex.type==="erd"?[["blue","Entity"],["green","Attribute or key"],["purple","Relationship"],["orange","Participation"]]:
      [["blue","Supertype"],["purple","Subtype"],["green","Attribute or key"],["orange","Membership"],["pink","Completeness"]];
    return '<div class="colour-key" aria-label="Colour key">'+entries.map(([c,t])=>paint(t,c,t)).join("")+'</div>';
  }
  function paint(t,c,label){
    const [ink,bg]=palette[c];
    return '<mark style="color:'+ink+';background:'+bg+'" title="'+esc(label)+'">'+esc(t)+'</mark>';
  }
  function annotate(value,ex){
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
        const ink=hierarchy||!key?palette.green[0]:key==="PK"?palette.blue[0]:palette.orange[0];
        return svgText(x+8,y+53+i*23,key,'font-size="12" font-weight="700" fill="'+ink+'"')+
          svgText(x+62,y+53+i*23,field,'fill="'+ink+'" '+(key.includes("PK")?'text-decoration="underline" font-weight="700"':""));
      }).join("");
  }
  function diagram(ex, stage) {
    let shapes="", height=265;
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
      }
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
    }
    return '<div class="diagram" tabindex="0" aria-label="Diagram, scroll horizontally on small screens"><svg viewBox="0 0 800 '+height+'" role="img" aria-label="'+esc(lessons[ex.id].title+": "+(stage===0?"original membership diagram":stage===5?"completed diagram":"diagram in progress"))+'" font-family="Arial,sans-serif" font-size="16" fill="#18344b">'+shapes+'</svg></div>';
  }
  function truth(ex) {
    const a=ex.answers[0];
    return '<table><caption>Test one MemberID</caption><thead><tr><th>Volunteer</th><th>Donor</th><th>Allowed?</th></tr></thead><tbody>'+
      [[0,0],[1,0],[0,1],[1,1]].map(([v,d])=>'<tr><td>'+(v?"Yes":"No")+'</td><td>'+(d?"Yes":"No")+'</td><td>'+((v+d===2&&a.category==="d")||(v+d===0&&a.bars==="total")?"No":"Yes")+'</td></tr>').join("")+'</tbody></table>';
  }
  function source(ex){return [...ex.scenario,...ex.questions];}
  function stepMenu(ex,index){
    return '<nav class="step-menu" aria-label="Steps for this exercise">'+lessons[ex.id].steps.map(([title],i)=>
      '<a href="#'+ex.id+'/'+(i+1)+'" '+(i===index?'aria-current="step"':'')+'><b>'+(i+1)+'</b> '+esc(title)+'</a>').join("")+'</nav>';
  }
  function stepHTML(ex,i){
    const steps=lessons[ex.id].steps;
    const [title,label,quote,ask,points,stage]=steps[i];
    return '<article class="step"><small>Step '+(i+1)+' of '+steps.length+'</small><h3 tabindex="-1">'+esc(title)+'</h3><blockquote class="clue"><span class="label">'+esc(label)+'</span> · <q>'+annotate(quote,ex)+'</q></blockquote><p><strong>'+esc(ask)+'</strong></p><ul class="teaching-points">'+points.map(t=>'<li>'+annotate(t,ex)+'</li>').join("")+'</ul>'+diagram(ex,stage)+(stage===5&&ex.type==="eerd"?truth(ex):"")+'</article>';
  }
  function show(){
    const [id,num]=location.hash.slice(1).split("/");
    const ex=exercises.find(e=>e.id===id)||exercises[0], lesson=lessons[ex.id];
    const index=Math.max(0,Math.min(lesson.steps.length-1,(Number.parseInt(num,10)||1)-1));
    document.querySelector("#cases").innerHTML=exercises.map(e=>'<a href="#'+e.id+'" '+(e===ex?'aria-current="page"':"")+'>'+esc(lessons[e.id].title)+'</a>').join("");
    const root=document.querySelector("#lesson"), open=root.dataset.case!==ex.id||root.querySelector("details")?.open;
    root.dataset.case=ex.id;
    root.innerHTML='<h2 tabindex="-1">'+esc(lesson.title)+'</h2>'+stepMenu(ex,index)+legend(ex)+'<details '+(open?"open":"")+'><summary>Read the original exercise</summary>'+source(ex).map(t=>'<p>'+annotate(t,ex)+'</p>').join("")+'</details>'+stepHTML(ex,index)+'<div class="controls"><button type="button" id="prev">Previous step</button><button type="button" id="next" class="next">Next step</button></div>';
    for(const [key,change] of [["prev",-1],["next",1]]){
      const b=document.getElementById(key); b.disabled=index+change<0||index+change>=lesson.steps.length;
      b.onclick=()=>{location.hash=ex.id+"/"+(index+1+change);};
    }
  }
  const sheets=[];
  for(const ex of exercises){
    const {title,steps}=lessons[ex.id];
    sheets.push('<section class="sheet"><small>ICT200 · Short ERD and EERD worked answers</small><h2>'+esc(title)+'</h2><h3>Original exercise</h3>'+legend(ex)+source(ex).map(t=>'<p>'+annotate(t,ex)+'</p>').join("")+'</section>');
    steps.forEach((step,i)=>sheets.push('<section class="sheet"><small>ICT200 · '+esc(title)+'</small>'+stepHTML(ex,i)+'</section>'));
  }
  document.querySelector("#print").innerHTML=sheets.join("");
  window.addEventListener("hashchange",()=>{
    const before=document.querySelector("#lesson").dataset.case;
    show();
    document.querySelector(before===document.querySelector("#lesson").dataset.case?".step h3":"#lesson h2").focus();
  });
  show();
})();
