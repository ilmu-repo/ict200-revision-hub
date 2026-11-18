/* global importScripts, initSqlJs, ICT200_THEMEPARK_SQL, ICT200_SQL_EXERCISES, ICT200_SQL_CORE */
importScripts("vendor/sqljs/sql-wasm.js","themepark-sql-data.js","sql-studio-content.js","sql-studio-core.js");

const engine = initSqlJs({locateFile:file=>new URL("vendor/sqljs/"+file,self.location.href).href});

function openDatabase(SQL, extra = "") {
  const db = new SQL.Database();
  try {
    db.run("ATTACH DATABASE ':memory:' AS THEMEPARKDB; PRAGMA foreign_keys=ON;");
    db.run(ICT200_THEMEPARK_SQL.seed + extra);
    db.run("PRAGMA query_only=ON;");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

self.onmessage = async ({data}) => {
  const exercise = ICT200_SQL_EXERCISES.find(item=>item.id===data.exercise);
  if (!exercise) return;
  let base, checkCopy;
  try {
    const SQL = await engine;
    const input = ICT200_SQL_CORE.inspect(data.sql.trim());
    base = openDatabase(SQL);
    const start = performance.now();
    const actual = ICT200_SQL_CORE.query(base,input.sql);
    const elapsed = performance.now()-start;
    const response = {actual,elapsed};
    if (data.check) {
      const expected = ICT200_SQL_CORE.query(base,exercise.sql);
      const comparison = ICT200_SQL_CORE.compare(expected,actual,exercise,input.ordered);
      response.expected = expected;
      response.comparison = comparison;
      if (comparison.ok) {
        checkCopy = openDatabase(SQL,ICT200_THEMEPARK_SQL.fixture);
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
