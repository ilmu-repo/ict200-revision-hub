/* February 2026, Part C, Question 1, pp. 12–13. Shared by the studio and the worked answer. */
(() => {
  const scenario = [
    "You have been assigned a project to develop a database for a new water filter rental service company from Turkey, namely TurQ Water. The database will be used to record rental water filter transactions. The database information is as follows:",
    "The company produces several types of water filter models. Product information is currently recorded manually, including model ID, name, description, and water capacity.",
    "Every customer interested in renting a water filter must provide personal information such as name, IC number, address, phone number, email, and occupation.",
    "Each water filter product model can be rented by many customers, and a customer may rent more than one water filter.",
    "For each rental, the rental account number and product serial number must be recorded as key information. In addition, the rental start date, rental period, monthly payment amount, and payment package must be specified. Each rental is managed by one agent only.",
    "Every agent working for the company has details such as ID, name, phone number, email, and address recorded. Agents are required to secure as many new customers as possible, as their information is linked to each rental for commission purposes.",
    "Each rental offers two payment package options: salary deduction and auto-debit from the customer’s bank account.",
    "For salary deductions, employer details such as name, address, and salary number must be provided.",
    "For auto-debit deductions, bank details such as bank name and bank account number must be provided.",
    "Based on the project information, answer the following questions."
  ];
  const questions = [
    "a) Illustrate an Entity Relationship Diagram (ERD) based on the given information using Crow's Foot notation. Show all entities, attributes, relationships and connectivities. (16 marks)",
    "b) Produce TWO (2) examples of information that can be generated from the Customer Rental Management System using this database. (4 marks)"
  ];
  // The labels describe the board positions. Repeated field names refer to separate columns.
  const schema = {
    PRODUCT_MODEL:{label:"Catalogue entry",fields:{MODEL_ID:"pk",MODEL_NAME:"regular",DESCRIPTION:"regular",WATER_CAPACITY:"regular"}},
    PRODUCT_UNIT:{label:"Physical item",fields:{SERIAL_NO:"pk",MODEL_ID:"fk"}},
    CUSTOMER:{label:"Person taking the contract",fields:{IC_NO:"pk",NAME:"regular",ADDRESS:"regular",PHONE:"regular",EMAIL:"regular",OCCUPATION:"regular"}},
    AGENT:{label:"Person managing the contract",fields:{AGENT_ID:"pk",NAME:"regular",PHONE:"regular",EMAIL:"regular",ADDRESS:"regular"}},
    RENTAL:{label:"Contract",fields:{RENTAL_ACCOUNT_NO:"pk",IC_NO:"fk",SERIAL_NO:"fk",AGENT_ID:"fk",START_DATE:"regular",RENTAL_PERIOD:"regular",MONTHLY_PAYMENT:"regular",PAYMENT_PACKAGE:"regular"}},
    SALARY_DEDUCTION:{label:"Payroll branch",fields:{RENTAL_ACCOUNT_NO:"pkfk",EMPLOYER_NAME:"regular",EMPLOYER_ADDRESS:"regular",SALARY_NO:"regular"}},
    AUTO_DEBIT:{label:"Bank branch",fields:{RENTAL_ACCOUNT_NO:"pkfk",BANK_NAME:"regular",BANK_ACCOUNT_NO:"regular"}}
  };
  const links = [
    ["PRODUCT_MODEL","PRODUCT_UNIT","has units","MODEL_ID"],
    ["CUSTOMER","RENTAL","takes out","IC_NO"],
    ["PRODUCT_UNIT","RENTAL","appears on","SERIAL_NO"],
    ["AGENT","RENTAL","manages","AGENT_ID"]
  ];
  const assumptions = "For this worked model, each account covers one customer and one physical unit. A unit belongs to one model and can be rented again later. Allow a model, unit, customer or agent to be registered before its first related record. Take the required payment package to mean one choice per rental.";
  const steps = [
    ["Separate the model from the unit","Product identity","rental account number and product serial number","If two filters are the same model, how can we tell them apart?",[
      "PRODUCT_MODEL stores MODEL_ID, MODEL_NAME, DESCRIPTION and WATER_CAPACITY. Underline MODEL_ID.",
      "Give each physical PRODUCT_UNIT its own SERIAL_NO. Its MODEL_ID references PRODUCT_MODEL.MODEL_ID. One model may describe many units."
    ],1],
    ["Identify the two people","People and identifiers","name, IC number, address, phone number, email, and occupation","Whose details belong in each record?",[
      "CUSTOMER uses IC_NO as its PK. Add NAME, ADDRESS, PHONE, EMAIL and OCCUPATION.",
      "AGENT uses AGENT_ID as its PK. Add NAME, PHONE, EMAIL and ADDRESS. A shared name or phone number cannot reliably identify a person."
    ],2],
    ["Give each rental its own account","Transaction","the rental start date, rental period, monthly payment amount, and payment package must be specified","Which facts can change when the same filter is rented again?",[
      "RENTAL uses RENTAL_ACCOUNT_NO as its PK. Add START_DATE, RENTAL_PERIOD, MONTHLY_PAYMENT and PAYMENT_PACKAGE.",
      "Store IC_NO (FK1), SERIAL_NO (FK2) and AGENT_ID (FK3) on RENTAL. They point to CUSTOMER.IC_NO, PRODUCT_UNIT.SERIAL_NO and AGENT.AGENT_ID.",
      "This model assumes one customer and one unit per account. A later rental of that unit gets a new account number."
    ],3],
    ["Read all four relationships","Cardinality","Each rental is managed by one agent only.","For one rental, how many agents? For one agent, how many rentals?",[
      "Every RENTAL needs exactly one CUSTOMER, PRODUCT_UNIT and AGENT. Each PRODUCT_UNIT needs exactly one PRODUCT_MODEL.",
      "Read back: one customer, unit or agent can have zero or many rentals. One model can have zero or many units. Zero is an assumption that allows registration before use.",
      "Draw four dashed links. Each child has its own PK. Rentals let many customers rent the same model and one customer rent several filters."
    ],4],
    ["Split the payment details","Subtype attributes","For salary deductions, employer details such as name, address, and salary number must be provided.","Which facts apply to just one payment package?",[
      "RENTAL is the supertype. SALARY_DEDUCTION adds EMPLOYER_NAME, EMPLOYER_ADDRESS and SALARY_NO.",
      "AUTO_DEBIT adds BANK_NAME and BANK_ACCOUNT_NO. Both subtypes inherit RENTAL_ACCOUNT_NO as their PK and FK1 pointing to RENTAL.RENTAL_ACCOUNT_NO."
    ],5],
    ["Choose the circle and bars","Membership and completeness","payment package must be specified","Can one rental have both packages? Can it have neither?",[
      "Interpret the two payment package options as alternatives. One rental cannot use both: draw d for disjoint. The required package rules out neither: draw two bars for total completeness.",
      "PAYMENT_PACKAGE is the discriminator in RENTAL. Label each branch with its matching value. A salary-only or debit-only account passes. Both together or neither fails."
    ],6],
    ["Give two information outputs","Part (b)","Produce TWO (2) examples of information","What could staff find out from the records?",[
      "Agent workload: group active rental accounts by AGENT_ID and NAME. Show the count and sum of MONTHLY_PAYMENT for each agent to support commission review. A commission rate is not given.",
      "Renewals due: list accounts ending in the next 30 days, with customer NAME, PHONE and unit SERIAL_NO. Calculate the end date from START_DATE and RENTAL_PERIOD so staff can contact the customer."
    ],7]
  ];
  window.ICT200_TURQ = {id:"turq-water",title:"February 2026 · TurQ Water",type:"mixed",scenario,questions,schema,links,assumptions,steps};
})();
