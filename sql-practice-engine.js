/* Each attempt uses its own in-memory database. Both copies start at the question's stated point. */
(() => {
  const core=globalThis.ICT200_SQL_CORE;
  function open(SQL,ds,task,variant){
    const db=new SQL.Database();
    try{
      db.run("PRAGMA foreign_keys=ON");
      db.create_function("YEAR",v=>v==null?null:Number(String(v).slice(0,4)));
      db.create_function("DATE_FORMAT",(v,format)=>v==null?null:format.replace(/%[Ymd]/g,k=>String(v).slice(...({"%Y":[0,4],"%m":[5,7],"%d":[8,10]}[k]))));
      db.create_function("UCASE",v=>v==null?null:String(v).toUpperCase());
      db.create_function("LCASE",v=>v==null?null:String(v).toLowerCase());
      db.create_function("CONCAT",(...values)=>values.includes(null)?null:values.join(""));
      db.run(ds.schema);
      for(const t of ds.tables){
        const cmd="INSERT INTO "+t.name+" VALUES ("+t.fields.map(()=>"?").join(",")+")";
        for(const row of t.rows)db.run(cmd,row);
      }
      if(variant)db.run(ds.fixture);
      if(task.kind==="CREATE")db.run("DROP TABLE "+task.table);
      if(task.id==="farm-b"){
        db.run("DELETE FROM SALES; DELETE FROM PRODUCT; DELETE FROM STOCK; DELETE FROM ENCLOSURE; INSERT INTO ENCLOSURE VALUES ('A1','Main','North',12)");
      }
      if(task.kind==="SELECT")db.run("PRAGMA query_only=ON");
      return db;
    }catch(e){db.close();throw e;}
  }
  function schemaGrid(db,table){
    const meta=db.exec("PRAGMA table_info("+table+")")[0]?.values||[];
    const fks=db.exec("PRAGMA foreign_key_list("+table+")")[0]?.values||[];
    const unique=db.exec("PRAGMA index_list("+table+")")[0]?.values.filter(r=>r[2] && r[3]!=="pk")||[];
    const indexed=unique.map(r=>db.exec("PRAGMA index_info('"+r[1].replaceAll("'","''")+"')")[0].values.map(i=>String(i[2]).toUpperCase()).sort().join("+"));
    return {columns:["Column","Type","Required","PK","References","Extra unique key"],rows:meta.map(([,name,type,required,,pk])=>[name.toUpperCase(),type.toUpperCase().replace(/\bINTEGER\b/g,"INT").replace(/\s*,\s*/g,","),required||pk?"Yes":"No",pk?"PK":"",fks.filter(r=>r[3].toLowerCase()===name.toLowerCase()).map(r=>(r[2]+"."+r[4]).toUpperCase()).sort().join(", "),indexed.filter(group=>group.split("+").includes(name.toUpperCase())).sort().join(", ")])};
  }
  function run(db,task,source){
    if(task.kind==="SELECT"){
      const input=core.inspect(source);
      const words=source.replace(/'(?:''|[^'])*'|"(?:[^"]|"")*"|\/\*[\s\S]*?\*\/|(?:--|#)[^\n]*/g," ").toUpperCase();
      if(/\bJOIN\b/.test(words) && !/\b(?:LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN\b/.test(words))input.techniques.add("JOIN");
      if(/\bLEFT\s+(?:OUTER\s+)?JOIN\b/.test(words))input.techniques.add("LEFT JOIN");
      const result=core.query(db,input.sql);
      if(task.yearColumn!==undefined)for(const r of result.rows){const i=task.yearColumn;if(/^\d{4}$/.test(String(r[i])))r[i]=Number(r[i]);}
      return {result,input};
    }
    const clean=source.replace(/^\s*(?:(?:--|#)[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*/,"").trim();
    const pattern={CREATE:"CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?",INSERT:"INSERT\\s+INTO\\s+",UPDATE:"UPDATE\\s+"}[task.kind];
    const re=new RegExp("^"+pattern+"(?:`"+task.table+"`|\""+task.table+"\"|"+task.table+")(?=\\s|\\(|$)","i");
    let count=0,affected=0;
    for(const stmt of db.iterateStatements(clean)){
      const sql=stmt.getSQL().trim();
      if(!re.test(sql))throw Error("This exercise needs "+task.kind+" on "+task.table+".");
      if(++count>1 && task.id!=="farm-b")throw Error("Use a single statement for this question.");
      if(task.kind==="INSERT"&&task.id!=="farm-b"&&!/^\s*\(/.test(sql.replace(re,"")))throw Error("Include the list of column names after the table name.");
      while(stmt.step()){} affected+=db.getRowsModified();
    }
    if(!count)throw Error("Enter a statement first.");
    const result=task.kind==="CREATE"?schemaGrid(db,task.table):core.query(db,"SELECT * FROM "+task.table);
    return {result,affected,input:{ordered:false,techniques:new Set()}};
  }
  function grade(SQL,ds,task,source,checking){
    let expected,actual,comparison,affected;
    const start=performance.now();
    for(const variant of (checking?[false,true]:[false])){
      const db=open(SQL,ds,task,variant);
      let student;try{student=run(db,task,source);}finally{db.close();}
      if(!variant){actual=student.result;affected=student.affected;}
      if(!checking)break;
      const ref=open(SQL,ds,task,variant);let model;
      try{model=run(ref,task,task.sql);}finally{ref.close();}
      if(!variant)expected=model.result;
      comparison=core.compare(model.result,student.result,task,student.input.ordered);
      if(comparison.ok && task.technique && !student.input.techniques.has(task.technique))comparison={ok:false,message:"Your rows match. The question also asks you to use "+({subquery:"a subquery",CASE:"a CASE expression"}[task.technique]||task.technique)+"."};
      if(!comparison.ok){if(variant)comparison.message="Your grid matches the first data. Check the rule on a second sample. "+comparison.message;break;}
    }
    return {expected,actual,comparison,affected,elapsed:performance.now()-start};
  }
  globalThis.ICT200_PRACTICE_ENGINE={grade};
})();
