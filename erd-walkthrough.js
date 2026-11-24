(() => {
  "use strict";
  const exercises = window.ICT200_ERD.exercises;
  const lessons = {
    clinic: {title:"1 · Clinic appointments", steps:[
      ["Find the three records","Entities","patients, doctors and appointments","What needs its own record?","Draw PATIENT, DOCTOR and APPOINTMENT. An appointment is an event with its own date and time. The clinic is the setting for these records.",1],
      ["Put facts in the right box","Attributes and keys","a unique appointment ID, an appointment date and an appointment time","What identifies one visit?","Underline AppointmentID. Put the date and time with the appointment. Underline PatientID and DoctorID in their own entities. A phone number describes a patient. A specialty describes a doctor.",2],
      ["Connect each visit to its people","Foreign keys","exactly one patient and is attended by exactly one doctor","Where do the two references belong?","Add PatientID (FK1) and DoctorID (FK2) to APPOINTMENT. Both refer to a parent PK. Draw two dashed, non-identifying links because AppointmentID identifies the visit on its own.",3],
      ["Read the ends in both directions","Participation","may be registered before they have any appointments","Can a patient or doctor have zero appointments?","Yes. Each may also have several. Put the circle and crow’s foot beside APPOINTMENT on both links. Each appointment needs exactly one patient and one doctor. Put two short strokes beside each parent.",4],
      ["Check a repeat visit","Final diagram","The same patient may see the same doctor again","Can this diagram store both visits?","Yes. Two APPOINTMENT rows can have the same PatientID and DoctorID but different AppointmentID values. Try one patient with no visits as well. Both situations fit the completed diagram.",5]
    ]},
    roles: {title:"2 · Organisation membership", steps:[
      ["Find the common record and the roles","Entity types","Members may register as volunteers, donors, or both.","What is true of every volunteer and every donor?","Each is a member. Draw MEMBER above VOLUNTEER and DONOR. A member keeps one identity even when they take both roles.",1],
      ["Place the shared and role-specific facts","Attributes and keys","one main area of interest","Which facts belong to one role only?","MemberID, MemberName and Phone belong in MEMBER. Put InterestArea in VOLUNTEER and DonationMethod in DONOR. In each subtype, MemberID is both its PK and FK1 to MEMBER.MemberID. This is how the role refers to the same person.",2],
      ["Decide whether both roles are allowed","Membership","or both","Can the same MemberID appear in both subtypes?","Yes. Put o in the category circle for overlapping membership. One person can volunteer and donate at the same time.",3],
      ["Decide whether a role is required","Completeness","not registered for either role remains in the organisation's records","Can a member have neither role?","Yes. Draw one horizontal bar below the category circle for partial completeness. A MEMBER row can exist on its own.",4],
      ["Record and check the role choices","Final diagram","whether each member is registered as a volunteer and whether the member is registered as a donor","How can we store two independent answers?","Use two Yes/No discriminators in MEMBER. IsVolunteer is Yes when the volunteer row exists. IsDonor is Yes when the donor row exists. Test the four combinations below.",5]
    ]},
    "one-role": {title:"3(a) · Exactly one role", steps:[
      ["Start from Exercise 2","Base model","Use the organisation and member details in Exercise 2.","Which parts of the original model still apply?","Start with the original overlapping, partial hierarchy. Keep the member details, both subtypes and their inherited keys. Now apply policy (a).",0],
      ["Read the limit on membership","Membership","not allowed to register for both roles","Could a member volunteer and donate?","No. Put d in the category circle for disjoint membership. One MemberID can occur in at most one subtype. The completeness rule is the next decision.",3],
      ["Read the minimum participation","Completeness","Every member must register","Could a member remain in neither role?","No. Draw two horizontal bars for total completeness. At least one role is required. Together with disjoint membership, this gives exactly one role.",4],
      ["Choose the discriminator and check","Final diagram","either a volunteer or a donor","Which single value identifies the role?","Use one required Role value in MEMBER, either VOLUNTEER or DONOR. The value must agree with the subtype row. The revised policy permits exactly two of the four combinations.",5]
    ]},
    "at-least-one": {title:"3(b) · At least one role", steps:[
      ["Return to the original policy","Base model","In a separate policy proposal","Which model is the starting point?","Start again from Exercise 2. Its MEMBER has two independent role indicators. Read policy (b) as a separate proposal.",0],
      ["Check whether both roles can coexist","Membership","a member may register for both roles","Which category symbol fits?","Keep o for overlapping membership. The same MemberID may have a volunteer row and a donor row.",3],
      ["Check whether neither role is allowed","Completeness","every member must register","Can both indicators be No?","No. Change the original single bar to two horizontal bars for total completeness. Every MEMBER needs at least one subtype row.",4],
      ["Test the two indicators","Final diagram","every member must register as a volunteer or a donor, and a member may register for both roles","Which combinations meet both rules?","Keep IsVolunteer and IsDonor. At least one must be Yes. A member can volunteer, donate, or do both. Both subtype rows use that same MemberID.",5]
    ]}
  };
  const esc = value => String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const colors = {"Membership":["#974310","#fff0df"],"Completeness":["#a51958","#fde9f2"],"Attributes and keys":["#006854","#e2f6ec"],"Foreign keys":["#91450a","#fff0df"],"Participation":["#006854","#e2f6ec"]};
  const color = label => colors[label] || ["#185789","#e5f2fe"];
  const svgText = (x,y,value,attrs="") => '<text x="'+x+'" y="'+y+'" '+attrs+'>'+esc(value)+'</text>';
  const stroke = (d,extra="") => '<path d="'+d+'" fill="none" stroke="#28666c" stroke-width="2.6" '+extra+'/>';
  function box(x,y,w,name,fields,fill){
    const height=34+fields.length*23;
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+height+'" fill="#f5f8fa" stroke="#547482"/>'+
      '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="34" fill="'+fill+'"/>'+
      svgText(x+w/2,y+23,name,'text-anchor="middle" fill="white" font-weight="700"')+
      fields.map(([field,key],i)=>svgText(x+8,y+53+i*23,key,'font-size="12" font-weight="700" fill="#805017"')+
        svgText(x+62,y+53+i*23,field,key.includes("PK")?'text-decoration="underline" font-weight="700"':"")).join("");
  }
  function diagram(ex, stage) {
    let shapes="", height=265;
    if(ex.type==="erd"){
      const positions=[["left",8,36,165],["centre",284,36,222],["right",615,36,173]];
      for(const [pos,x,y,w] of positions){
        const name=ex.answers[0][pos+"Name"].toUpperCase();
        const fields=Object.entries(ex.schema[pos].fields).filter(([,role])=>stage>=2&&(role!=="fk"||stage>=3))
          .map(([f,r])=>[f,r==="pk"?"PK":r==="fk"?(f==="PatientID"?"FK1":"FK2"):""]);
        shapes+=box(x,y,w,name,fields,"#153a52");
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
      const fields = name=>Object.entries(model.fields[name]).filter(([f])=>level>=2&&(level>=5||!["IsVolunteer","IsDonor","Role"].includes(f))).map(([f,r])=>[f,r==="pk"?"PK":r==="pkfk"?"PK FK1":""]);
      const common=fields("member");
      const end=10+34+23*common.length;
      shapes=box(294,10,212,"MEMBER",common,"#185789")+box(70,248,225,"VOLUNTEER",fields("volunteer"),"#66328a")+box(502,248,225,"DONOR",fields("donor"),"#66328a");
      height=335;
      if(level>=2){
        shapes+=stroke('M400 '+end+'V170 M400 198V220 M182 248V220H614V248');
        shapes+='<circle cx="400" cy="184" r="14" fill="white" stroke="#a64a14" stroke-width="2.5"/>';
      }
      if(level>=3)shapes+=svgText(400,190,model.answers[0].category,'text-anchor="middle" fill="#974310" font-weight="bold"');
      if(level>=4) shapes+='<path d="M375 198h50 '+(model.answers[0].bars==="total"?"M375 204h50":"")+'" stroke="#a51958" stroke-width="3"/>';
      if(level===5&&model.id==="one-role")shapes+=svgText(207,242,"Role = VOLUNTEER",'font-size="13"')+svgText(475,242,"Role = DONOR",'font-size="13"');
    }
    return '<div class="diagram" tabindex="0" aria-label="Diagram, scroll horizontally on small screens"><svg viewBox="0 0 800 '+height+'" role="img" aria-label="'+esc(lessons[ex.id].title+": "+(stage===0?"original membership diagram":stage===5?"completed diagram":"diagram in progress"))+'" font-family="Arial,sans-serif" font-size="16" fill="#18344b">'+shapes+'</svg></div>';
  }
  function truth(ex) {
    const a=ex.answers[0];
    return '<table><caption>Test one MemberID</caption><thead><tr><th>Volunteer</th><th>Donor</th><th>Allowed?</th></tr></thead><tbody>'+
      [[0,0],[1,0],[0,1],[1,1]].map(([v,d])=>'<tr><td>'+(v?"Yes":"No")+'</td><td>'+(d?"Yes":"No")+'</td><td>'+((v+d===2&&a.category==="d")||(v+d===0&&a.bars==="total")?"No":"Yes")+'</td></tr>').join("")+'</tbody></table>';
  }
  function source(ex){return [...ex.scenario,...ex.questions];}
  function stepHTML(ex,i){
    const steps=lessons[ex.id].steps;
    const [title,label,quote,ask,answer,stage]=steps[i], [accent,tint]=color(label);
    return '<article class="step" style="--accent:'+accent+';--tint:'+tint+'"><small>Step '+(i+1)+' of '+steps.length+'</small><h3 tabindex="-1">'+esc(title)+'</h3><blockquote class="clue"><span class="label">'+esc(label)+'</span> · <mark>'+esc(quote)+'</mark></blockquote><p><strong>'+esc(ask)+'</strong></p><p>'+esc(answer)+'</p>'+diagram(ex,stage)+(stage===5&&ex.type==="eerd"?truth(ex):"")+'</article>';
  }
  function show(){
    const [id,num]=location.hash.slice(1).split("/");
    const ex=exercises.find(e=>e.id===id)||exercises[0], lesson=lessons[ex.id];
    const index=Math.max(0,Math.min(lesson.steps.length-1,(Number.parseInt(num,10)||1)-1));
    document.querySelector("#cases").innerHTML=exercises.map(e=>'<a href="#'+e.id+'" '+(e===ex?'aria-current="page"':"")+'>'+esc(lessons[e.id].title)+'</a>').join("");
    const root=document.querySelector("#lesson"), open=root.dataset.case===ex.id&&root.querySelector("details")?.open;
    root.dataset.case=ex.id;
    const quote=lesson.steps[index][2];
    root.innerHTML='<h2>'+esc(lesson.title)+'</h2><details '+(open?"open":"")+'><summary>Read the original exercise</summary>'+source(ex).map(t=>'<p>'+esc(t).replace(esc(quote),'<mark>'+esc(quote)+'</mark>')+'</p>').join("")+'</details>'+stepHTML(ex,index)+'<div class="controls"><button type="button" id="prev">Previous step</button><button type="button" id="next" class="next">Next step</button></div>';
    for(const [key,change] of [["prev",-1],["next",1]]){
      const b=document.getElementById(key); b.disabled=index+change<0||index+change>=lesson.steps.length;
      b.onclick=()=>{location.hash=ex.id+"/"+(index+1+change);};
    }
  }
  const sheets=[];
  for(const ex of exercises){
    const {title,steps}=lessons[ex.id];
    sheets.push('<section class="sheet"><small>ICT200 · Short ERD and EERD worked answers</small><h2>'+esc(title)+'</h2><h3>Original exercise</h3>'+source(ex).map(t=>'<p>'+esc(t)+'</p>').join("")+'</section>');
    steps.forEach((step,i)=>sheets.push('<section class="sheet"><small>ICT200 · '+esc(title)+'</small>'+stepHTML(ex,i)+'</section>'));
  }
  document.querySelector("#print").innerHTML=sheets.join("");
  window.addEventListener("hashchange",()=>{show();document.querySelector(".step h3").focus();});
  show();
})();
