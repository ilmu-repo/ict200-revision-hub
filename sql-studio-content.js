// Original tasks aligned with the ICT200 SELECT labs.
globalThis.ICT200_SQL_EXERCISES = [
  {
    id: "ticket-columns", topic: "SELECT", title: "Choose columns from TICKET",
    prompt: "Show the ticket number, ticket type and ticket price for every ticket. Return the columns in that order.",
    sql: "SELECT TICKET_NO, TICKET_TYPE, TICKET_PRICE\nFROM TICKET;",
    hint: "List the three requested fields in SELECT and use TICKET in FROM.",
    explanation: "SELECT decides which columns appear in the grid and in what order."
  },
  {
    id: "adult-tickets", topic: "WHERE and ORDER BY", title: "List adult tickets costing at least 25.00",
    prompt: "Show TICKET_NO and TICKET_PRICE for adult tickets costing at least 25.00. Sort from highest to lowest price. For equal prices, show the higher ticket number first.",
    sql: "SELECT TICKET_NO, TICKET_PRICE\nFROM TICKET\nWHERE TICKET_TYPE = 'Adult'\n    AND TICKET_PRICE >= 25.00\nORDER BY TICKET_PRICE DESC, TICKET_NO DESC;",
    ordered: true,
    hint: "Use both conditions together. Include the boundary price and sort by price before ticket number.",
    explanation: "WHERE filters the tickets and ORDER BY applies the two sorting rules in order."
  },
  {
    id: "unnamed-attractions", topic: "NULL", title: "Find attractions missing a name",
    prompt: "Show ATTRACT_NO and PARK_CODE for attractions whose name has not been recorded.",
    sql: "SELECT ATTRACT_NO, PARK_CODE\nFROM ATTRACTION\nWHERE ATTRACT_NAME IS NULL;",
    hint: "A missing database value is NULL. Use the SQL test for a missing value.",
    explanation: "IS NULL finds missing values in ATTRACT_NAME."
  },
  {
    id: "park-tickets", topic: "JOIN", title: "Match tickets to UK parks",
    prompt: "Show PARK_NAME, TICKET_NO and TICKET_TYPE for tickets at parks in country UK. Sort by ticket number, lowest first.",
    sql: "SELECT P.PARK_NAME, T.TICKET_NO, T.TICKET_TYPE\nFROM THEMEPARK AS P\nJOIN TICKET AS T\n    ON P.PARK_CODE = T.PARK_CODE\nWHERE P.PARK_COUNTRY = 'UK'\nORDER BY T.TICKET_NO;",
    ordered: true,
    hint: "Match each ticket to its park with PARK_CODE. The country belongs to THEMEPARK.",
    explanation: "The join links ticket details to park details through PARK_CODE."
  },
  {
    id: "sale-lines", topic: "JOIN and duplicates", title: "List every ticket line sold at FairyLand",
    prompt: "For sales recorded at FairyLand (FR1001), show TICKET_NO and LINE_QTY. Return one row per sale line, even when two lines show the same values.",
    sql: "SELECT L.TICKET_NO, L.LINE_QTY\nFROM SALES_LINE AS L\nJOIN SALES AS S\n    ON L.TRANSACTION_NO = S.TRANSACTION_NO\nWHERE S.PARK_CODE = 'FR1001';",
    hint: "Find the park on SALES and link to SALES_LINE using TRANSACTION_NO. Keep repeated rows when they represent separate lines.",
    explanation: "The sale header gives the park. Each matching sale line contributes a row to the grid."
  },
  {
    id: "ticket-counts", topic: "LEFT JOIN and GROUP BY", title: "Count ticket records for every park",
    prompt: "Show PARK_CODE, PARK_NAME and the number of ticket records for each park, including parks with zero tickets. Name the count column TICKET_COUNT and sort by park code in ascending order.",
    sql: "SELECT P.PARK_CODE, P.PARK_NAME, COUNT(T.TICKET_NO) AS TICKET_COUNT\nFROM THEMEPARK AS P\nLEFT JOIN TICKET AS T\n    ON P.PARK_CODE = T.PARK_CODE\nGROUP BY P.PARK_CODE, P.PARK_NAME\nORDER BY P.PARK_CODE;",
    ordered: true, aliases: {2: "TICKET_COUNT"},
    hint: "Keep all parks, including unmatched parks. Count non-NULL ticket numbers for each park.",
    explanation: "A LEFT JOIN keeps parks with no tickets. COUNT(TICKET_NO) returns zero for those parks."
  },
  {
    id: "above-average", topic: "Subquery", title: "Find tickets above the average price",
    prompt: "Show TICKET_NO and TICKET_PRICE for tickets priced above the average price of all tickets. Sort by ticket number in ascending order.",
    sql: "SELECT TICKET_NO, TICKET_PRICE\nFROM TICKET\nWHERE TICKET_PRICE > (\n    SELECT AVG(TICKET_PRICE)\n    FROM TICKET\n)\nORDER BY TICKET_NO;",
    ordered: true,
    hint: "Calculate the average over all tickets. Compare each ticket price to that value with a strict greater-than test.",
    explanation: "The inner SELECT returns a single average that the outer SELECT uses for comparison."
  }
];
