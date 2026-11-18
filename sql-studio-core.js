(() => {
  "use strict";

  // Ignore comments and quoted text while locating statement boundaries and
  // the final query's ORDER BY. The database parser validates the SQL itself.
  function inspect(source) {
    if (!source || source.length > 5000 || source.includes("\0")) {
      throw Error("Enter one SELECT statement of up to 5,000 characters.");
    }
    const top = [];
    let sql = "", depth = 0, ended = false;
    for (let i=0; i<source.length;) {
      const c = source[i];
      if (/\s/.test(c)) {sql+=c; i++; continue;}
      if (c==="#" || source.startsWith("--",i)) {
        const boundary = source.indexOf("\n",i);
        const end = boundary===-1 ? source.length : boundary;
        sql += "-- " + source.slice(i+(c==="#"?1:2),end);
        i=end;
        continue;
      }
      if (source.startsWith("/*",i)) {
        const end = source.indexOf("*/",i+2);
        if (end===-1) throw Error("Close the block comment with */.");
        if (source[i+2]==="!") throw Error("Run a SELECT statement without executable MySQL comments in this studio.");
        sql += source.slice(i,end+2);
        i=end+2;
        continue;
      }
      if (ended) throw Error("Run one SELECT statement at a time.");
      if (c==="'" || c==='"' || c==="`" || c==="[") {
        const close = c==="[" ? "]" : c;
        let end=i+1;
        while (end<source.length) {
          if (source[end]!==close) {end++;continue;}
          if (source[end+1]===close && c!=="[") {end+=2;continue;}
          break;
        }
        if (end===source.length) throw Error("Close the quoted value or identifier.");
        sql+=source.slice(i,end+1);
        if (depth===0) top.push("quoted");
        i=end+1;
        continue;
      }
      if (c===";") ended=true;
      if (c==="(") depth++;
      if (c===")") depth--;
      const word=/^[A-Za-z_][A-Za-z0-9_$]*/.exec(source.slice(i))?.[0];
      if (word) {
        if (depth===0) top.push(word.toUpperCase());
        sql+=word;
        i+=word.length;
      } else {
        sql+=c;
        i++;
      }
    }
    if (top[0]==="USE") throw Error("THEMEPARKDB is already selected. Run your SELECT statement.");
    if (!["SELECT","WITH"].includes(top[0])) throw Error("This studio runs read-only SELECT queries. Enter a SELECT, with an optional WITH clause.");
    return {sql,ordered:top.some((word,i)=>word==="ORDER" && top[i+1]==="BY")};
  }

  function query(db, sql) {
    const stmt = db.prepare(sql);
    try {
      const columns = stmt.getColumnNames();
      if (!columns.length) throw Error("Enter a read-only query that returns a result grid.");
      if (columns.length>24) throw Error("Select up to 24 columns in this studio.");
      const rows = [];
      while (stmt.step()) {
        if (rows.length>=500) throw Error("The grid limit is 500 rows. Add a LIMIT or narrow the filter.");
        rows.push(stmt.get().map(value => {
          if (typeof value === "string" && value.length>4000) throw Error("A value in the result is too long to display.");
          if (ArrayBuffer.isView(value)) throw Error("This studio displays numbers, text and NULL values.");
          return value;
        }));
      }
      return {columns,rows};
    } finally {
      stmt.free();
    }
  }

  // SQL results can contain identical rows. Compare a multiset so DISTINCT
  // cannot pass when the exercise asks for one row per underlying record.
  const rowKey = row => JSON.stringify(row.map(value=>typeof value==="number" ? Number(value.toFixed(9)) : value));
  function frequencies(rows) {
    const counts=new Map();
    rows.map(rowKey).forEach(key=>counts.set(key,(counts.get(key)||0)+1));
    return counts;
  }
  function difference(expected,actual) {
    const needed = frequencies(expected);
    const given = frequencies(actual);
    let missing=0,extra=0;
    for (const [key,count] of needed) missing+=Math.max(count-(given.get(key)||0),0);
    for (const [key,count] of given) extra+=Math.max(count-(needed.get(key)||0),0);
    return {missing,extra};
  }

  function compare(expected, actual, exercise, ordered) {
    if (actual.columns.length!==expected.columns.length) {
      return {ok:false, message:`Your grid has ${actual.columns.length} column(s). The task asks for ${expected.columns.length}. Check the SELECT list.`};
    }
    for (const [index, name] of Object.entries(exercise.aliases || {})) {
      if (actual.columns[index].toUpperCase()!==name) return {ok:false,message:`Name column ${Number(index)+1} ${name} using AS.`};
    }
    const {missing,extra} = difference(expected.rows,actual.rows);
    if (missing || extra) {
      const permutation = expected.columns.map(name=>actual.columns.findIndex(column=>column.toUpperCase()===name.toUpperCase()));
      if (permutation.every(index=>index>=0) && new Set(permutation).size===permutation.length && permutation.some((index,i)=>index!==i)) {
        const reordered=actual.rows.map(row=>permutation.map(index=>row[index]));
        const delta=difference(expected.rows,reordered);
        if (!delta.missing && !delta.extra) return {ok:false,message:"The values are right. Put the columns in the order requested."};
      }
      return {ok:false,message:`Your grid has ${actual.rows.length} row(s). The expected grid has ${expected.rows.length}. ${missing} expected row(s) are missing and ${extra} returned row(s) are extra or different.`};
    }
    if (exercise.ordered && !ordered) {
      return {ok:false,message:"The rows match. Add ORDER BY to guarantee the requested sort order."};
    }
    if (exercise.ordered && expected.rows.some((row,i)=>rowKey(row)!==rowKey(actual.rows[i]))) {
      return {ok:false,message:"The rows match, but their order differs. Check ORDER BY, its directions, and any tie-breaker."};
    }
    return {ok:true,message:"Your result matches the expected grid."};
  }

  globalThis.ICT200_SQL_CORE = {inspect,query,compare};
})();
