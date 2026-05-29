import { Course } from '../models/curriculum.model';

// Shared demo schema used across the beginner SQL exercises.
const SHOP_SCHEMA = `
CREATE TABLE customers (id INTEGER, name TEXT, city TEXT);
INSERT INTO customers VALUES (1,'Jamil','Austin'),(2,'Mei','Seattle'),(3,'Ravi','Austin'),(4,'Lena','Boston');
CREATE TABLE orders (id INTEGER, customer_id INTEGER, product TEXT, amount REAL);
INSERT INTO orders VALUES
 (1,1,'Keyboard',79.0),(2,1,'Mouse',25.0),(3,2,'Monitor',299.0),
 (4,3,'Laptop',1200.0),(5,3,'Mouse',25.0),(6,4,'Webcam',60.0),(7,2,'Keyboard',79.0);
`;

export const SQL_COURSE: Course = {
  id: 'sql',
  name: 'SQL',
  tagline: 'Ask your data anything — the universal language of databases.',
  icon: '🗄️',
  color: '#e38c00',
  runner: 'sql',
  modules: [
    // ───────────────────────── BEGINNER ─────────────────────────
    {
      id: 'sql-basics',
      title: 'Querying Data',
      tier: 'beginner',
      icon: '🌱',
      lessons: [
        {
          id: 'sql-select',
          title: 'SELECT Basics',
          summary: 'Pull columns and rows out of a table.',
          tier: 'beginner',
          minutes: 9,
          xp: 50,
          prerequisites: [],
          content: `
## SELECT chooses columns

\`\`\`sql
SELECT name, city FROM customers;
SELECT * FROM customers;   -- all columns
\`\`\`

The result is a **table** of rows. \`*\` means "every column".

In the playground you have a \`customers\` table:

| id | name | city |
|----|------|------|
| 1 | Jamil | Austin |
| 2 | Mei | Seattle |
| … | … | … |
`,
          exercise: {
            runner: 'sql',
            setupSql: SHOP_SCHEMA,
            instructions: 'Select the **name** and **city** columns of every row in `customers`.',
            starterCode: '-- Write your query\nSELECT ',
            solution: 'SELECT name, city FROM customers;',
            tests: [{ name: 'returns name & city for all customers', assert: 'SELECT name, city FROM customers;' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which query returns every column of the `customers` table?',
              options: ['SELECT all FROM customers;', 'SELECT * FROM customers;', 'GET * FROM customers;', 'SELECT columns customers;'],
              answer: 1,
              explanation: '`SELECT * FROM table;` returns all columns.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What does `SELECT *` mean?', back: 'Return every column of the table.' },
          ],
        },
        {
          id: 'sql-where',
          title: 'Filtering with WHERE',
          summary: 'Keep only the rows you care about.',
          tier: 'beginner',
          minutes: 11,
          xp: 60,
          prerequisites: ['sql-select'],
          content: `
## WHERE filters rows

\`\`\`sql
SELECT * FROM customers WHERE city = 'Austin';
SELECT * FROM orders WHERE amount > 100;
SELECT * FROM orders WHERE product = 'Mouse' AND amount < 50;
\`\`\`

Common operators: \`=\`, \`<>\` (not equal), \`<\`, \`>\`, \`<=\`, \`>=\`, \`AND\`, \`OR\`,
\`IN (...)\`, \`LIKE 'A%'\` (pattern match).
`,
          exercise: {
            runner: 'sql',
            setupSql: SHOP_SCHEMA,
            instructions: "Select all columns from `customers` who live in `'Austin'`.",
            starterCode: 'SELECT * FROM customers WHERE ',
            solution: "SELECT * FROM customers WHERE city = 'Austin';",
            tests: [{ name: 'returns only Austin customers', assert: "SELECT * FROM customers WHERE city = 'Austin';" }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which clause filters which rows are returned?',
              options: ['FILTER', 'WHERE', 'HAVING', 'ONLY'],
              answer: 1,
              explanation: '`WHERE` filters individual rows before grouping.',
            },
            {
              id: 'q2',
              prompt: "What does `WHERE name LIKE 'J%'` match?",
              options: ['names equal to J', 'names ending in J', 'names starting with J', 'names containing %'],
              answer: 2,
              explanation: '`%` is a wildcard for any sequence, so `J%` matches names starting with J.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Clause to filter rows?', back: '`WHERE condition`' },
            { id: 'f2', front: 'SQL "not equal" operator?', back: '`<>` (or `!=` in many engines).' },
          ],
        },
        {
          id: 'sql-order-limit',
          title: 'ORDER BY & LIMIT',
          summary: 'Sort results and take the top N.',
          tier: 'beginner',
          minutes: 9,
          xp: 60,
          prerequisites: ['sql-where'],
          content: `
## Sorting and limiting

\`\`\`sql
SELECT * FROM orders ORDER BY amount DESC;   -- highest first
SELECT * FROM orders ORDER BY amount ASC LIMIT 3; -- 3 cheapest
\`\`\`

\`ASC\` = ascending (default), \`DESC\` = descending.
`,
          exercise: {
            runner: 'sql',
            setupSql: SHOP_SCHEMA,
            instructions: 'Return the **product** and **amount** of the 3 most expensive orders (highest amount first).',
            starterCode: 'SELECT product, amount FROM orders\n',
            solution: 'SELECT product, amount FROM orders ORDER BY amount DESC LIMIT 3;',
            tests: [{ name: 'top 3 by amount desc', assert: 'SELECT product, amount FROM orders ORDER BY amount DESC LIMIT 3;' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which sorts results from highest to lowest?',
              options: ['ORDER BY x ASC', 'ORDER BY x DESC', 'SORT x DOWN', 'GROUP BY x'],
              answer: 1,
              explanation: '`DESC` sorts in descending order (largest first).',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Limit results to N rows?', back: '`LIMIT N`' },
            { id: 'f2', front: 'Sort descending?', back: '`ORDER BY column DESC`' },
          ],
        },
      ],
    },
    {
      id: 'sql-aggregate',
      title: 'Aggregating & Joining',
      tier: 'beginner',
      icon: '📊',
      lessons: [
        {
          id: 'sql-aggregates',
          title: 'COUNT, SUM & GROUP BY',
          summary: 'Summarize many rows into totals.',
          tier: 'beginner',
          minutes: 13,
          xp: 80,
          prerequisites: ['sql-order-limit'],
          content: `
## Aggregate functions

\`\`\`sql
SELECT COUNT(*) FROM orders;        -- how many orders
SELECT SUM(amount) FROM orders;     -- total revenue
SELECT AVG(amount) FROM orders;     -- average order
\`\`\`

## GROUP BY buckets rows

\`\`\`sql
SELECT customer_id, SUM(amount) AS spent
FROM orders
GROUP BY customer_id;
\`\`\`

Each group collapses into one summary row. Use \`AS\` to name a computed column.
`,
          exercise: {
            runner: 'sql',
            setupSql: SHOP_SCHEMA,
            instructions:
              'For each `customer_id`, return the customer_id and their total spend aliased as **spent**, using GROUP BY.',
            starterCode: 'SELECT customer_id, \nFROM orders\n',
            solution: 'SELECT customer_id, SUM(amount) AS spent FROM orders GROUP BY customer_id;',
            tests: [{ name: 'total spend per customer', assert: 'SELECT customer_id, SUM(amount) AS spent FROM orders GROUP BY customer_id;' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which function counts rows?',
              options: ['SUM()', 'TOTAL()', 'COUNT()', 'ROWS()'],
              answer: 2,
              explanation: '`COUNT(*)` counts the number of rows.',
            },
            {
              id: 'q2',
              prompt: 'What does GROUP BY do?',
              options: ['sorts rows', 'collapses rows into groups for aggregation', 'joins tables', 'deletes duplicates'],
              answer: 1,
              explanation: 'GROUP BY buckets rows so aggregates are computed per group.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Sum a column?', back: '`SELECT SUM(col) FROM t;`' },
            { id: 'f2', front: 'Alias a column?', back: 'Use `AS`, e.g. `SUM(amount) AS spent`.' },
          ],
        },
        {
          id: 'sql-joins',
          title: 'JOINs',
          summary: 'Combine rows across related tables.',
          tier: 'beginner',
          minutes: 15,
          xp: 90,
          prerequisites: ['sql-aggregates'],
          content: `
## INNER JOIN connects tables

\`\`\`sql
SELECT customers.name, orders.product
FROM orders
JOIN customers ON customers.id = orders.customer_id;
\`\`\`

Rows are matched where the **join condition** is true. \`INNER JOIN\` (the
default \`JOIN\`) keeps only matching rows; \`LEFT JOIN\` also keeps unmatched
rows from the left table.
`,
          exercise: {
            runner: 'sql',
            setupSql: SHOP_SCHEMA,
            instructions:
              'Join `orders` to `customers` and return each customer **name** with the **product** they ordered.',
            starterCode: 'SELECT customers.name, orders.product\nFROM orders\nJOIN customers ON ',
            solution:
              'SELECT customers.name, orders.product FROM orders JOIN customers ON customers.id = orders.customer_id;',
            tests: [{ name: 'name + product joined', assert: 'SELECT customers.name, orders.product FROM orders JOIN customers ON customers.id = orders.customer_id;' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'An INNER JOIN returns…',
              options: ['all rows from both tables', 'only rows with a match in both tables', 'only left table rows', 'no rows'],
              answer: 1,
              explanation: 'INNER JOIN keeps only rows where the join condition matches in both tables.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What does ON specify in a JOIN?', back: 'The condition that matches rows between the tables.' },
            { id: 'f2', front: 'LEFT JOIN vs INNER JOIN?', back: 'LEFT keeps all left rows (NULLs for no match); INNER keeps only matches.' },
          ],
        },
      ],
    },

    // ──────────────────────── INTERMEDIATE ───────────────────────
    {
      id: 'sql-intermediate',
      title: 'Intermediate SQL',
      tier: 'intermediate',
      icon: '⚙️',
      lessons: [
        { id: 'sql-having', title: 'HAVING & Filtering Groups', summary: 'Filter aggregated results.', tier: 'intermediate', minutes: 10, xp: 80, prerequisites: ['sql-joins'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-subqueries', title: 'Subqueries', summary: 'Queries inside queries.', tier: 'intermediate', minutes: 13, xp: 90, prerequisites: ['sql-having'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-joins-advanced', title: 'LEFT / RIGHT / Self Joins', summary: 'Master every join type.', tier: 'intermediate', minutes: 14, xp: 100, prerequisites: ['sql-subqueries'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-case', title: 'CASE Expressions', summary: 'Conditional logic in SQL.', tier: 'intermediate', minutes: 10, xp: 80, prerequisites: ['sql-joins-advanced'], content: '', quiz: [], flashcards: [] },
      ],
    },
    {
      id: 'sql-modify',
      title: 'Changing Data',
      tier: 'intermediate',
      icon: '✏️',
      lessons: [
        { id: 'sql-insert-update', title: 'INSERT, UPDATE, DELETE', summary: 'Modify rows safely.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['sql-case'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-create-table', title: 'CREATE TABLE & Types', summary: 'Design schemas and constraints.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['sql-insert-update'], content: '', quiz: [], flashcards: [] },
      ],
    },

    // ───────────────────────── ADVANCED ─────────────────────────
    {
      id: 'sql-advanced',
      title: 'Advanced & Mastery',
      tier: 'advanced',
      icon: '🏆',
      lessons: [
        { id: 'sql-indexes', title: 'Indexes & Performance', summary: 'Make queries fast.', tier: 'advanced', minutes: 16, xp: 120, prerequisites: ['sql-create-table'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-window', title: 'Window Functions', summary: 'ROW_NUMBER, RANK, running totals.', tier: 'advanced', minutes: 18, xp: 140, prerequisites: ['sql-indexes'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-cte', title: 'CTEs & Recursion', summary: 'WITH clauses and recursive queries.', tier: 'advanced', minutes: 16, xp: 130, prerequisites: ['sql-window'], content: '', quiz: [], flashcards: [] },
        { id: 'sql-transactions', title: 'Transactions & ACID', summary: 'Keep data consistent.', tier: 'advanced', minutes: 14, xp: 120, prerequisites: ['sql-cte'], content: '', quiz: [], flashcards: [] },
      ],
    },
  ],
};
