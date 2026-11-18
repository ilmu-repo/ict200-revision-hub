// Generated from the verified ICT200 Week 1 schema and seed.
globalThis.ICT200_THEMEPARK_SQL = {
  "tables": [
    {
      "name": "THEMEPARK",
      "fields": [
        {
          "name": "PARK_CODE",
          "type": "VARCHAR(10)",
          "pk": true
        },
        {
          "name": "PARK_NAME",
          "type": "VARCHAR(35)",
          "pk": false
        },
        {
          "name": "PARK_CITY",
          "type": "VARCHAR(50)",
          "pk": false
        },
        {
          "name": "PARK_COUNTRY",
          "type": "CHAR(2)",
          "pk": false
        }
      ]
    },
    {
      "name": "EMPLOYEE",
      "fields": [
        {
          "name": "EMP_NUM",
          "type": "INT",
          "pk": true
        },
        {
          "name": "EMP_TITLE",
          "type": "VARCHAR(4)",
          "pk": false
        },
        {
          "name": "EMP_LNAME",
          "type": "VARCHAR(15)",
          "pk": false
        },
        {
          "name": "EMP_FNAME",
          "type": "VARCHAR(15)",
          "pk": false
        },
        {
          "name": "EMP_DOB",
          "type": "DATE",
          "pk": false
        },
        {
          "name": "EMP_HIRE_DATE",
          "type": "DATE",
          "pk": false
        },
        {
          "name": "EMP_AREA_CODE",
          "type": "VARCHAR(4)",
          "pk": false
        },
        {
          "name": "EMP_PHONE",
          "type": "VARCHAR(12)",
          "pk": false
        },
        {
          "name": "PARK_CODE",
          "type": "VARCHAR(10)",
          "pk": false,
          "fk": "THEMEPARK"
        }
      ]
    },
    {
      "name": "TICKET",
      "fields": [
        {
          "name": "TICKET_NO",
          "type": "INT",
          "pk": true
        },
        {
          "name": "TICKET_PRICE",
          "type": "DECIMAL(6,2)",
          "pk": false
        },
        {
          "name": "TICKET_TYPE",
          "type": "VARCHAR(10)",
          "pk": false
        },
        {
          "name": "PARK_CODE",
          "type": "VARCHAR(10)",
          "pk": false,
          "fk": "THEMEPARK"
        }
      ]
    },
    {
      "name": "ATTRACTION",
      "fields": [
        {
          "name": "ATTRACT_NO",
          "type": "INT",
          "pk": true
        },
        {
          "name": "ATTRACT_NAME",
          "type": "VARCHAR(35)",
          "pk": false
        },
        {
          "name": "ATTRACT_AGE",
          "type": "SMALLINT UNSIGNED",
          "pk": false
        },
        {
          "name": "ATTRACT_CAPACITY",
          "type": "SMALLINT UNSIGNED",
          "pk": false
        },
        {
          "name": "PARK_CODE",
          "type": "VARCHAR(10)",
          "pk": false,
          "fk": "THEMEPARK"
        }
      ]
    },
    {
      "name": "HOURS",
      "fields": [
        {
          "name": "EMP_NUM",
          "type": "INT",
          "pk": true,
          "fk": "EMPLOYEE"
        },
        {
          "name": "ATTRACT_NO",
          "type": "INT",
          "pk": true,
          "fk": "ATTRACTION"
        },
        {
          "name": "HOURS_PER_ATTRACT",
          "type": "SMALLINT UNSIGNED",
          "pk": false
        },
        {
          "name": "HOUR_RATE",
          "type": "DECIMAL(6,2)",
          "pk": false
        },
        {
          "name": "DATE_WORKED",
          "type": "DATE",
          "pk": true
        }
      ]
    },
    {
      "name": "SALES",
      "fields": [
        {
          "name": "TRANSACTION_NO",
          "type": "INT",
          "pk": true
        },
        {
          "name": "PARK_CODE",
          "type": "VARCHAR(10)",
          "pk": false,
          "fk": "THEMEPARK"
        },
        {
          "name": "SALE_DATE",
          "type": "DATE",
          "pk": false
        }
      ]
    },
    {
      "name": "SALES_LINE",
      "fields": [
        {
          "name": "TRANSACTION_NO",
          "type": "INT",
          "pk": true,
          "fk": "SALES"
        },
        {
          "name": "LINE_NO",
          "type": "SMALLINT UNSIGNED",
          "pk": true
        },
        {
          "name": "TICKET_NO",
          "type": "INT",
          "pk": false,
          "fk": "TICKET"
        },
        {
          "name": "LINE_QTY",
          "type": "SMALLINT UNSIGNED",
          "pk": false
        },
        {
          "name": "LINE_PRICE",
          "type": "DECIMAL(9,2)",
          "pk": false
        }
      ]
    }
  ],
  "seed": "CREATE TABLE THEMEPARKDB.THEMEPARK (\n    PARK_CODE TEXT COLLATE NOCASE NOT NULL,\n    PARK_NAME TEXT COLLATE NOCASE NOT NULL,\n    PARK_CITY TEXT COLLATE NOCASE NOT NULL,\n    PARK_COUNTRY TEXT COLLATE NOCASE NOT NULL,\n    CONSTRAINT PK_THEMEPARK PRIMARY KEY (PARK_CODE)\n);\nCREATE TABLE THEMEPARKDB.EMPLOYEE (\n    EMP_NUM INTEGER NOT NULL,\n    EMP_TITLE TEXT COLLATE NOCASE,\n    EMP_LNAME TEXT COLLATE NOCASE NOT NULL,\n    EMP_FNAME TEXT COLLATE NOCASE NOT NULL,\n    EMP_DOB TEXT NOT NULL,\n    EMP_HIRE_DATE TEXT,\n    EMP_AREA_CODE TEXT COLLATE NOCASE NOT NULL,\n    EMP_PHONE TEXT COLLATE NOCASE NOT NULL,\n    PARK_CODE TEXT COLLATE NOCASE,\n    CONSTRAINT PK_EMPLOYEE PRIMARY KEY (EMP_NUM),\n    CONSTRAINT FK_EMPLOYEE_THEMEPARK\n        FOREIGN KEY (PARK_CODE) REFERENCES THEMEPARK (PARK_CODE)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nCREATE TABLE THEMEPARKDB.TICKET (\n    TICKET_NO INTEGER NOT NULL,\n    TICKET_PRICE NUMERIC NOT NULL DEFAULT 0.00,\n    TICKET_TYPE TEXT COLLATE NOCASE,\n    PARK_CODE TEXT COLLATE NOCASE,\n    CONSTRAINT PK_TICKET PRIMARY KEY (TICKET_NO),\n    CONSTRAINT FK_TICKET_THEMEPARK\n        FOREIGN KEY (PARK_CODE) REFERENCES THEMEPARK (PARK_CODE)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nCREATE TABLE THEMEPARKDB.ATTRACTION (\n    ATTRACT_NO INTEGER NOT NULL,\n    ATTRACT_NAME TEXT COLLATE NOCASE,\n    ATTRACT_AGE INTEGER NOT NULL DEFAULT 0,\n    ATTRACT_CAPACITY INTEGER NOT NULL,\n    PARK_CODE TEXT COLLATE NOCASE,\n    CONSTRAINT PK_ATTRACTION PRIMARY KEY (ATTRACT_NO),\n    CONSTRAINT FK_ATTRACTION_THEMEPARK\n        FOREIGN KEY (PARK_CODE) REFERENCES THEMEPARK (PARK_CODE)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nCREATE TABLE THEMEPARKDB.HOURS (\n    EMP_NUM INTEGER NOT NULL,\n    ATTRACT_NO INTEGER NOT NULL,\n    HOURS_PER_ATTRACT INTEGER NOT NULL,\n    HOUR_RATE NUMERIC NOT NULL,\n    DATE_WORKED TEXT NOT NULL,\n    CONSTRAINT PK_HOURS PRIMARY KEY (EMP_NUM, ATTRACT_NO, DATE_WORKED),\n    CONSTRAINT FK_HOURS_EMPLOYEE\n        FOREIGN KEY (EMP_NUM) REFERENCES EMPLOYEE (EMP_NUM)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT,\n    CONSTRAINT FK_HOURS_ATTRACTION\n        FOREIGN KEY (ATTRACT_NO) REFERENCES ATTRACTION (ATTRACT_NO)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nCREATE TABLE THEMEPARKDB.SALES (\n    TRANSACTION_NO INTEGER NOT NULL,\n    PARK_CODE TEXT COLLATE NOCASE,\n    SALE_DATE TEXT NOT NULL,\n    CONSTRAINT PK_SALES PRIMARY KEY (TRANSACTION_NO),\n    CONSTRAINT FK_SALES_THEMEPARK\n        FOREIGN KEY (PARK_CODE) REFERENCES THEMEPARK (PARK_CODE)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nCREATE TABLE THEMEPARKDB.SALES_LINE (\n    TRANSACTION_NO INTEGER NOT NULL,\n    LINE_NO INTEGER NOT NULL,\n    TICKET_NO INTEGER NOT NULL,\n    LINE_QTY INTEGER NOT NULL DEFAULT 0,\n    LINE_PRICE NUMERIC NOT NULL DEFAULT 0.00,\n    CONSTRAINT PK_SALES_LINE PRIMARY KEY (TRANSACTION_NO, LINE_NO),\n    CONSTRAINT FK_SALES_LINE_SALES\n        FOREIGN KEY (TRANSACTION_NO) REFERENCES SALES (TRANSACTION_NO)\n        ON UPDATE CASCADE\n        ON DELETE CASCADE,\n    CONSTRAINT FK_SALES_LINE_TICKET\n        FOREIGN KEY (TICKET_NO) REFERENCES TICKET (TICKET_NO)\n        ON UPDATE CASCADE\n        ON DELETE RESTRICT\n);\nINSERT INTO THEMEPARKDB.THEMEPARK (PARK_CODE, PARK_NAME, PARK_CITY, PARK_COUNTRY) VALUES\n    ('FR1001', 'FairyLand', 'PARIS', 'FR'),\n    ('NL1202', 'Efling', 'NOORD', 'NL'),\n    ('SP4533', 'AdventurePort', 'BARCELONA', 'SP'),\n    ('SW2323', 'Labyrinthe', 'LAUSANNE', 'SW'),\n    ('UK2622', 'MiniLand', 'WINDSOR', 'UK'),\n    ('UK3452', 'PleasureLand', 'STOKE', 'UK'),\n    ('ZA1342', 'GoldTown', 'JOHANNESBURG', 'ZA');\nINSERT INTO THEMEPARKDB.EMPLOYEE\n    (EMP_NUM, EMP_TITLE, EMP_LNAME, EMP_FNAME, EMP_DOB, EMP_HIRE_DATE,\n     EMP_AREA_CODE, EMP_PHONE, PARK_CODE) VALUES\n    (100, 'Ms',  'Calderdale', 'Emma',    '1972-06-15', '1992-03-15', '0181', '324-9134', 'FR1001'),\n    (101, 'Ms',  'Ricardo',    'Marshel', '1978-03-19', '1996-04-25', '0181', '324-4472', 'UK3452'),\n    (102, 'Mr',  'Arshad',     'Arif',    '1969-11-14', '1990-12-20', '7253', '675-8993', 'FR1001'),\n    (103, 'Ms',  'Roberts',    'Anne',    '1974-10-16', '1994-08-16', '0181', '898-3456', 'UK3452'),\n    (104, 'Mr',  'Denver',     'Enrica',  '1980-11-08', '2001-10-20', '7253', '504-4434', 'ZA1342'),\n    (105, 'Ms',  'Namowa',     'Mirrelle','1990-03-14', '2006-11-08', '0181', '890-3243', 'FR1001'),\n    (106, 'Mrs', 'Smith',      'Gemma',   '1968-02-12', '1989-01-05', '0181', '324-7845', 'ZA1342');\nINSERT INTO THEMEPARKDB.TICKET (TICKET_NO, TICKET_PRICE, TICKET_TYPE, PARK_CODE) VALUES\n    (11001, 24.99, 'Adult',  'SP4533'),\n    (11002, 14.99, 'Child',  'SP4533'),\n    (11003, 10.99, 'Senior', 'SP4533'),\n    (13001, 18.99, 'Child',  'FR1001'),\n    (13002, 34.99, 'Adult',  'FR1001'),\n    (13003, 20.99, 'Senior', 'FR1001'),\n    (67832, 18.56, 'Child',  'ZA1342'),\n    (67833, 28.67, 'Adult',  'ZA1342'),\n    (67855, 12.12, 'Senior', 'ZA1342'),\n    (88567, 22.50, 'Child',  'UK3452'),\n    (88568, 42.10, 'Adult',  'UK3452'),\n    (89720, 10.99, 'Senior', 'UK3452');\nINSERT INTO THEMEPARKDB.ATTRACTION\n    (ATTRACT_NO, ATTRACT_NAME, ATTRACT_AGE, ATTRACT_CAPACITY, PARK_CODE) VALUES\n    (10034, 'ThunderCoaster', 11,  34, 'FR1001'),\n    (10056, 'SpinningTeacups', 4,  62, 'FR1001'),\n    (10067, 'FlightToStars',   11,  24, 'FR1001'),\n    (10078, 'Ant-Trap',        23,  30, 'FR1001'),\n    (10098, 'Carnival',         3, 120, 'FR1001'),\n    (20056, '3D-Lego_Show',     3, 200, 'UK3452'),\n    (30011, 'BlackHole2',      12,  34, 'UK3452'),\n    (30012, 'Pirates',         10,  42, 'UK3452'),\n    (30044, 'UnderSeaWord',     4,  80, 'UK3452'),\n    (98764, 'GoldRush',         5,  80, 'ZA1342'),\n    (10082, NULL,              10,  40, 'ZA1342');\nINSERT INTO THEMEPARKDB.HOURS\n    (EMP_NUM, ATTRACT_NO, HOURS_PER_ATTRACT, HOUR_RATE, DATE_WORKED) VALUES\n    (100, 10034, 6, 6.50, '2007-05-18'),\n    (100, 10034, 6, 6.50, '2007-05-20'),\n    (101, 10034, 6, 6.50, '2007-05-18'),\n    (102, 30012, 3, 5.99, '2007-05-23'),\n    (102, 30044, 6, 5.99, '2007-05-21'),\n    (102, 30044, 3, 5.99, '2007-05-22'),\n    (104, 30011, 6, 7.20, '2007-05-21'),\n    (104, 30012, 6, 7.20, '2007-05-22'),\n    (105, 10078, 3, 8.50, '2007-05-18'),\n    (105, 10098, 3, 8.50, '2007-05-18'),\n    (105, 10098, 6, 8.50, '2007-05-19');\nINSERT INTO THEMEPARKDB.SALES (TRANSACTION_NO, PARK_CODE, SALE_DATE) VALUES\n    (12781, 'FR1001', '2007-05-18'),\n    (12782, 'FR1001', '2007-05-18'),\n    (12783, 'FR1001', '2007-05-18'),\n    (12784, 'FR1001', '2007-05-18'),\n    (12785, 'FR1001', '2007-05-18'),\n    (12786, 'FR1001', '2007-05-18'),\n    (34534, 'UK3452', '2007-05-18'),\n    (34535, 'UK3452', '2007-05-18'),\n    (34536, 'UK3452', '2007-05-18'),\n    (34537, 'UK3452', '2007-05-18'),\n    (34538, 'UK3452', '2007-05-18'),\n    (34539, 'UK3452', '2007-05-18'),\n    (34540, 'UK3452', '2007-05-18'),\n    (34541, 'UK3452', '2007-05-18'),\n    (67589, 'ZA1342', '2007-05-18'),\n    (67590, 'ZA1342', '2007-05-18'),\n    (67591, 'ZA1342', '2007-05-18'),\n    (67592, 'ZA1342', '2007-05-18'),\n    (67593, 'ZA1342', '2007-05-18');\nINSERT INTO THEMEPARKDB.SALES_LINE\n    (TRANSACTION_NO, LINE_NO, TICKET_NO, LINE_QTY, LINE_PRICE) VALUES\n    (12781, 1, 13002, 2,  69.98),\n    (12781, 2, 13001, 1,  14.99),\n    (12782, 1, 13002, 2,  69.98),\n    (12783, 1, 13003, 2,  41.98),\n    (12784, 2, 13001, 1,  14.99),\n    (12785, 1, 13001, 1,  14.99),\n    (12785, 2, 13002, 1,  34.99),\n    (12785, 3, 13002, 4, 139.96),\n    (34534, 1, 88568, 4, 168.40),\n    (34534, 2, 88567, 1,  22.50),\n    (34534, 3, 89720, 2,  21.98),\n    (34535, 1, 88568, 2,  84.20),\n    (34536, 1, 89720, 2,  21.98),\n    (34537, 1, 88568, 2,  84.20),\n    (34537, 2, 88567, 1,  22.50),\n    (34538, 1, 89720, 2,  21.98),\n    (34539, 1, 89720, 2,  21.98),\n    (34539, 2, 88568, 2,  84.20),\n    (34540, 1, 88568, 4, 168.40),\n    (34540, 2, 88567, 1,  22.50),\n    (34540, 3, 89720, 2,  21.98),\n    (34541, 1, 88568, 2,  84.20),\n    (67589, 1, 67833, 2,  57.34),\n    (67589, 2, 67832, 2,  37.12),\n    (67590, 1, 67833, 2,  57.34),\n    (67590, 2, 67832, 2,  37.12),\n    (67591, 1, 67832, 1,  18.56),\n    (67591, 2, 67855, 1,  12.12),\n    (67592, 1, 67833, 4, 114.68),\n    (67593, 1, 67833, 2,  57.34),\n    (67593, 2, 67832, 2,  37.12);",
  "fixture": "\nINSERT INTO THEMEPARKDB.THEMEPARK VALUES\n    ('UK9010','Riverside','YORK','UK'),\n    ('UK9020','Hilltop','LEEDS','UK');\nINSERT INTO THEMEPARKDB.TICKET VALUES\n    (91001,30.00,'Adult','UK9010'),\n    (91002,30.00,'Adult','FR1001'),\n    (91003,8.25,'Child','NL1202');\nINSERT INTO THEMEPARKDB.ATTRACTION VALUES\n    (99001,NULL,7,35,'UK9010'),\n    (99002,'River Boats',4,25,'UK9010');\nINSERT INTO THEMEPARKDB.SALES VALUES (99001,'FR1001','2007-05-21');\nINSERT INTO THEMEPARKDB.SALES_LINE VALUES\n    (99001,1,13001,1,14.99),\n    (99001,2,13001,1,14.99);\n"
};
