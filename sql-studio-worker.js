/* global importScripts, initSqlJs, ICT200_THEMEPARK_SQL, ICT200_SQL_EXERCISES, ICT200_SQL_CORE */
importScripts("vendor/sqljs/sql-wasm.js","themepark-sql-data.js","equipment-hire-sql.js","sql-studio-content.js","sql-studio-core.js");

const engine = initSqlJs({locateFile:file=>new URL("vendor/sqljs/"+file,self.location.href).href});

function openDatabase(SQL, dataset, secondSample = false) {
  const db = new SQL.Database();
  try {
    db.run("PRAGMA foreign_keys=ON;");
    if (dataset===ICT200_HIRE_SQL) {
      db.run(dataset.schema);
      for (const table of dataset.tables) {
        const insert="INSERT INTO "+table.name+" VALUES ("+table.fields.map(()=>"?").join(",")+")";
        for(const row of table.rows) db.run(insert,row);
      }
    } else {
      db.run("ATTACH DATABASE ':memory:' AS THEMEPARKDB;");
      db.run(dataset.seed);
    }
    if(secondSample) db.run(dataset.fixture);
    db.run("PRAGMA query_only=ON;");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

self.onmessage = async ({data}) => {
  const hire=ICT200_HIRE_SQL.exercises.find(item=>item.id===data.exercise);
  const exercise = hire || ICT200_SQL_EXERCISES.find(item=>item.id===data.exercise);
  const dataset=hire ? ICT200_HIRE_SQL : ICT200_THEMEPARK_SQL;
  if (!exercise) return;
  let base, checkCopy;
  try {
    const SQL = await engine;
    const input = ICT200_SQL_CORE.inspect(data.sql.trim());
    base = openDatabase(SQL,dataset);
    const start = performance.now();
    const actual = ICT200_SQL_CORE.query(base,input.sql);
    const elapsed = performance.now()-start;
    const response = {actual,elapsed};
    if (data.check) {
      const expected = ICT200_SQL_CORE.query(base,exercise.sql);
      const comparison = ICT200_SQL_CORE.compare(expected,actual,exercise,input.ordered);
      response.expected = expected;
      response.comparison = comparison;
      if (comparison.ok && exercise.technique && !input.techniques.has(exercise.technique)) {
        response.comparison={ok:false,message:"Your Result Grid matches. This part also asks you to use "+
          (exercise.technique==="CASE"?"a CASE expression to choose the rate band.":"a subquery to find the equipment to leave out.")};
      }
      if (response.comparison.ok) {
        checkCopy = openDatabase(SQL,dataset,true);
        const variantExpected = ICT200_SQL_CORE.query(checkCopy,exercise.sql);
        const variantActual = ICT200_SQL_CORE.query(checkCopy,input.sql);
        const variant = ICT200_SQL_CORE.compare(variantExpected,variantActual,exercise,input.ordered);
        if (!variant.ok) response.comparison = {ok:false,message:"Your grid matches the lab rows. The query gave a different result on a second sample, so check that it follows the rule for new rows too. " + variant.message};
      }
    }
    self.postMessage({id:data.id,...response});
  } catch (error) {
    const message = String(error.message || error);
    let feedback = message;
    if (/no such (table|column)/i.test(message)) {
      feedback = message + ". Check the table and column names in Schemas.";
    } else if (/no such function/i.test(message)) {
      feedback = message + ". Try a function used in this exercise, or test the expression in Workbench.";
    } else if (/readonly/i.test(message)) {
      feedback = "The practice data is read-only. Use SELECT to retrieve rows.";
    }
    self.postMessage({id:data.id,error:feedback});
  } finally {
    checkCopy?.close();
    base?.close();
  }
};
