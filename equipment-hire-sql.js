// Equipment Hire practice paper, worked solutions and their validated sample rows.
globalThis.ICT200_HIRE_SQL = {
  "schema": "CREATE TABLE VENUE (\n    VenueCode VARCHAR(6) COLLATE NOCASE PRIMARY KEY, VenueName VARCHAR(40) COLLATE NOCASE NOT NULL, Town VARCHAR(40) COLLATE NOCASE NOT NULL\n);\nCREATE TABLE EQUIPMENT (\n    EquipmentCode VARCHAR(8) COLLATE NOCASE PRIMARY KEY, EquipmentName VARCHAR(40) COLLATE NOCASE NOT NULL,\n    Category VARCHAR(15) COLLATE NOCASE NOT NULL, DailyRate DECIMAL(8,2) NOT NULL, VenueCode VARCHAR(6) COLLATE NOCASE NOT NULL,\n    FOREIGN KEY (VenueCode) REFERENCES VENUE(VenueCode)\n);\nCREATE TABLE BORROWER (\n    BorrowerID INT PRIMARY KEY, BorrowerName VARCHAR(40) COLLATE NOCASE NOT NULL, PhoneNumber VARCHAR(20) COLLATE NOCASE NOT NULL\n);\nCREATE TABLE HIRE (\n    HireID INT PRIMARY KEY, BorrowerID INT NOT NULL, HireDate DATE NOT NULL, HireStatus VARCHAR(15) COLLATE NOCASE NOT NULL,\n    FOREIGN KEY (BorrowerID) REFERENCES BORROWER(BorrowerID)\n);\nCREATE TABLE HIRE_LINE (\n    HireID INT NOT NULL,\n    LineNo SMALLINT UNSIGNED NOT NULL,\n    EquipmentCode VARCHAR(8) COLLATE NOCASE NOT NULL,\n    Units SMALLINT UNSIGNED NOT NULL,\n    LineCharge DECIMAL(9,2) NOT NULL,\n    PRIMARY KEY (HireID, LineNo),\n    FOREIGN KEY (HireID)\n        REFERENCES HIRE (HireID),\n    FOREIGN KEY (EquipmentCode)\n        REFERENCES EQUIPMENT (EquipmentCode)\n);",
  "tables": [
    {
      "name": "VENUE",
      "fields": [
        {
          "name": "VenueCode",
          "type": "VARCHAR(6)",
          "pk": true
        },
        {
          "name": "VenueName",
          "type": "VARCHAR(40)"
        },
        {
          "name": "Town",
          "type": "VARCHAR(40)"
        }
      ],
      "rows": [
        [
          "V01",
          "Lakeside Court",
          "Kota Kinabalu"
        ],
        [
          "V02",
          "Hillview Hall",
          "Papar"
        ]
      ]
    },
    {
      "name": "EQUIPMENT",
      "fields": [
        {
          "name": "EquipmentCode",
          "type": "VARCHAR(8)",
          "pk": true
        },
        {
          "name": "EquipmentName",
          "type": "VARCHAR(40)"
        },
        {
          "name": "Category",
          "type": "VARCHAR(15)"
        },
        {
          "name": "DailyRate",
          "type": "DECIMAL(8,2)"
        },
        {
          "name": "VenueCode",
          "type": "VARCHAR(6)",
          "fk": "VENUE.VenueCode"
        }
      ],
      "rows": [
        [
          "E01",
          "Shuttle Racket",
          "Court",
          8,
          "V01"
        ],
        [
          "E02",
          "Training Net",
          "Court",
          12,
          "V01"
        ],
        [
          "E03",
          "Folding Goal",
          "Field",
          25,
          "V02"
        ],
        [
          "E04",
          "Field Cone Set",
          "Field",
          25,
          "V02"
        ],
        [
          "E05",
          "Timing Kit",
          "Track",
          25,
          "V02"
        ],
        [
          "E06",
          "Relay Baton Set",
          "Track",
          6,
          "V02"
        ],
        [
          "E07",
          "Court Marker",
          "Court",
          8,
          "V01"
        ]
      ]
    },
    {
      "name": "BORROWER",
      "fields": [
        {
          "name": "BorrowerID",
          "type": "INT",
          "pk": true
        },
        {
          "name": "BorrowerName",
          "type": "VARCHAR(40)"
        },
        {
          "name": "PhoneNumber",
          "type": "VARCHAR(20)"
        }
      ],
      "rows": [
        [
          101,
          "Borrower A",
          "0000000001"
        ],
        [
          102,
          "Borrower B",
          "0000000002"
        ],
        [
          103,
          "Borrower C",
          "0000000003"
        ]
      ]
    },
    {
      "name": "HIRE",
      "fields": [
        {
          "name": "HireID",
          "type": "INT",
          "pk": true
        },
        {
          "name": "BorrowerID",
          "type": "INT",
          "fk": "BORROWER.BorrowerID"
        },
        {
          "name": "HireDate",
          "type": "DATE"
        },
        {
          "name": "HireStatus",
          "type": "VARCHAR(15)"
        }
      ],
      "rows": [
        [
          301,
          101,
          "2025-11-12",
          "COMPLETED"
        ],
        [
          302,
          102,
          "2026-01-02",
          "COMPLETED"
        ],
        [
          303,
          102,
          "2026-01-02",
          "CANCELLED"
        ],
        [
          304,
          101,
          "2026-02-04",
          "BOOKED"
        ],
        [
          305,
          102,
          "2026-02-04",
          "BOOKED"
        ],
        [
          306,
          102,
          "2026-01-31",
          "BOOKED"
        ],
        [
          307,
          101,
          "2026-01-02",
          "BOOKED"
        ],
        [
          308,
          101,
          "2026-01-01",
          "COMPLETED"
        ]
      ]
    },
    {
      "name": "HIRE_LINE",
      "fields": [
        {
          "name": "HireID",
          "type": "INT",
          "pk": true,
          "fk": "HIRE.HireID"
        },
        {
          "name": "LineNo",
          "type": "SMALLINT UNSIGNED",
          "pk": true
        },
        {
          "name": "EquipmentCode",
          "type": "VARCHAR(8)",
          "fk": "EQUIPMENT.EquipmentCode"
        },
        {
          "name": "Units",
          "type": "SMALLINT UNSIGNED"
        },
        {
          "name": "LineCharge",
          "type": "DECIMAL(9,2)"
        }
      ],
      "rows": [
        [
          301,
          1,
          "E01",
          2,
          16
        ],
        [
          301,
          2,
          "E02",
          1,
          12
        ],
        [
          302,
          1,
          "E03",
          4,
          100
        ],
        [
          302,
          2,
          "E01",
          3,
          24
        ],
        [
          303,
          1,
          "E04",
          5,
          125
        ],
        [
          304,
          1,
          "E06",
          2,
          12
        ],
        [
          303,
          2,
          "E01",
          9,
          72
        ]
      ]
    }
  ],
  "fixture": "INSERT INTO VENUE VALUES ('V09','Valley Hall','Papar');\nINSERT INTO EQUIPMENT VALUES ('E08','Marker Pair','Field',11.99,'V09'),('E09','Practice Pole','Field',24.99,'V09'),('E10','Spare Net','Court',25.01,'V01');\nINSERT INTO HIRE_LINE VALUES (301,3,'E04',1,25.00),(304,2,'E10',1,25.01);",
  "exercises": [
    {
      "id": "hire-c",
      "part": "c",
      "marks": 5,
      "title": "List equipment and its venue",
      "prompt": "Write an SQL statement to list every equipment type with the name of the venue where it is stored. The report must display EquipmentCode, EquipmentName and VenueName.",
      "sql": "SELECT E.EquipmentCode, E.EquipmentName, V.VenueName\nFROM EQUIPMENT AS E\nINNER JOIN VENUE AS V\n    ON E.VenueCode = V.VenueCode;",
      "explanation": "VenueCode is stored in both tables. The join matches those codes so each equipment type appears with the venue name from VENUE.",
      "hint": "Which code in EQUIPMENT points to the venue that stores it?"
    },
    {
      "id": "hire-e",
      "part": "e",
      "marks": 12,
      "title": "Find equipment with no completed hire",
      "prompt": "Write an SQL statement to list equipment types with no hire line on any COMPLETED hire. Use a subquery. Include equipment with no hire lines and equipment hired only on BOOKED or CANCELLED hires. The report must display EquipmentCode, EquipmentName and DailyRate. Sort by DailyRate from highest to lowest, then by EquipmentCode in ascending order.",
      "sql": "SELECT E.EquipmentCode, E.EquipmentName, E.DailyRate\nFROM EQUIPMENT AS E\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM HIRE_LINE AS L\n    INNER JOIN HIRE AS H\n        ON L.HireID = H.HireID\n    WHERE L.EquipmentCode = E.EquipmentCode\n        AND H.HireStatus = 'COMPLETED'\n)\nORDER BY E.DailyRate DESC, E.EquipmentCode ASC;",
      "explanation": "For each equipment type, the subquery looks for a hire line with the same EquipmentCode on a completed hire. NOT EXISTS keeps the equipment when there is no match. Equipment with no hire lines or with only bookings and cancellations stays in the list.",
      "hint": "E04 appears on a cancelled hire, and E05 has no hire lines. Should both appear in your report? Check E01 too: it has a cancellation and a completed hire.",
      "ordered": true,
      "technique": "subquery"
    },
    {
      "id": "hire-i",
      "part": "i",
      "marks": 7,
      "title": "Classify equipment by daily rate",
      "prompt": "Write an SQL statement to classify every equipment type by daily rate. The report must display EquipmentCode, EquipmentName and a calculated column under the alias RateBand. Use a CASE expression to apply the labels shown below. DailyRate always has a value.",
      "sql": "SELECT EquipmentCode,\n       EquipmentName,\n       CASE\n           WHEN DailyRate >= 25.00 THEN 'Premium'\n           WHEN DailyRate >= 12.00 THEN 'Standard'\n           ELSE 'Budget'\n       END AS RateBand\nFROM EQUIPMENT;",
      "explanation": "CASE checks each WHEN from top to bottom and uses the first match. Rates of 25.00 and above become Premium. Rates of at least 12.00 that reach the second check become Standard. ELSE gives the remaining rates the Budget label.",
      "hint": "Check the equipment costing exactly 12.00 and 25.00. Which band includes each boundary?",
      "technique": "CASE",
      "aliases": {
        "2": "RATEBAND"
      },
      "bands": [
        [
          "25.00 or more",
          "Premium"
        ],
        [
          "At least 12.00 and below 25.00",
          "Standard"
        ],
        [
          "Below 12.00",
          "Budget"
        ]
      ]
    }
  ]
};
