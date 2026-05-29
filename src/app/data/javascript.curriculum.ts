import { Course } from '../models/curriculum.model';

export const JAVASCRIPT_COURSE: Course = {
  id: 'javascript',
  name: 'JavaScript',
  tagline: 'The language of the web — build anything, run it everywhere.',
  icon: '🟨',
  color: '#f7df1e',
  runner: 'js',
  modules: [
    // ───────────────────────── BEGINNER ─────────────────────────
    {
      id: 'js-basics',
      title: 'Getting Started',
      tier: 'beginner',
      icon: '🌱',
      lessons: [
        {
          id: 'js-variables',
          title: 'Variables & Data Types',
          summary: 'Store and label values with let, const, and var.',
          tier: 'beginner',
          minutes: 8,
          xp: 50,
          prerequisites: [],
          content: `
## Variables are labeled boxes

A **variable** is a named container for a value. In modern JavaScript you create
them with \`let\` (can change) or \`const\` (cannot be reassigned).

\`\`\`js
let score = 0;        // a number we can update later
const name = "Jamil"; // a constant — reassigning it throws an error
score = 10;           // ✅ allowed
\`\`\`

> 💡 **Rule of thumb:** reach for \`const\` by default. Only use \`let\` when you
> *know* the value will change. Avoid \`var\` in new code.

## The core data types

| Type | Example | Notes |
|------|---------|-------|
| String | \`"hello"\` | text, in quotes |
| Number | \`42\`, \`3.14\` | one number type for ints & floats |
| Boolean | \`true\` / \`false\` | yes/no values |
| Null | \`null\` | intentional "nothing" |
| Undefined | \`undefined\` | a value never assigned |

Use \`typeof\` to inspect a type:

\`\`\`js
typeof "hi";   // "string"
typeof 7;      // "number"
typeof true;   // "boolean"
\`\`\`
`,
          exercise: {
            runner: 'js',
            instructions:
              'Create a `const` named **language** set to the string `"JavaScript"`, and a `let` named **year** set to the number `2026`.',
            starterCode: '// Declare your variables below\n\n',
            solution: 'const language = "JavaScript";\nlet year = 2026;',
            tests: [
              { name: 'language equals "JavaScript"', assert: 'language === "JavaScript"' },
              { name: 'year equals 2026', assert: 'year === 2026' },
              { name: 'year is a number', assert: 'typeof year === "number"' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which keyword creates a value that cannot be reassigned?',
              options: ['var', 'let', 'const', 'def'],
              answer: 2,
              explanation: '`const` declares a constant binding — reassigning it throws a TypeError.',
            },
            {
              id: 'q2',
              prompt: 'What does `typeof "hello"` return?',
              options: ['"text"', '"string"', '"String"', '"char"'],
              answer: 1,
              explanation: 'The `typeof` operator returns the lowercase string "string" for text values.',
            },
            {
              id: 'q3',
              prompt: 'Which value represents an intentional "nothing"?',
              code: 'let x = ___;',
              options: ['undefined', '0', 'null', 'NaN'],
              answer: 2,
              explanation: '`null` is the explicit "no value" you assign on purpose; `undefined` is the default for unassigned variables.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'When should you prefer `const`?', back: 'By default — whenever the binding will not be reassigned.' },
            { id: 'f2', front: 'What does `typeof` do?', back: 'Returns a string naming the operand’s type, e.g. "number".' },
            { id: 'f3', front: 'Difference between null and undefined?', back: '`null` is an intentional empty value; `undefined` means never assigned.' },
          ],
        },
        {
          id: 'js-operators',
          title: 'Operators & Expressions',
          summary: 'Do math, compare values, and combine booleans.',
          tier: 'beginner',
          minutes: 9,
          xp: 50,
          prerequisites: ['js-variables'],
          content: `
## Arithmetic

\`\`\`js
10 + 3;  // 13
10 - 3;  // 7
10 * 3;  // 30
10 / 3;  // 3.333...
10 % 3;  // 1   (remainder / "modulo")
2 ** 8;  // 256 (exponent)
\`\`\`

## Comparison — always use \`===\`

\`\`\`js
5 === 5;    // true  (strict equality, no type coercion)
5 === "5";  // false (different types)
5 == "5";   // true  ⚠️ loose equality coerces — avoid it
3 < 5;      // true
\`\`\`

> ⚠️ Prefer \`===\` and \`!==\`. The loose \`==\` does surprising type coercion.

## Logical operators

\`\`\`js
true && false; // false  (AND — both must be true)
true || false; // true   (OR — at least one true)
!true;         // false  (NOT)
\`\`\`
`,
          exercise: {
            runner: 'js',
            instructions:
              'Set **isEven** to a boolean that is `true` when the number `num` is even. Use the modulo operator `%`.',
            starterCode: 'const num = 18;\nlet isEven = /* your expression */ false;\n',
            solution: 'const num = 18;\nlet isEven = num % 2 === 0;',
            tests: [
              { name: '18 is detected as even', assert: 'isEven === true' },
              { name: 'isEven is a boolean', assert: 'typeof isEven === "boolean"' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What is the value of `10 % 4`?',
              options: ['2', '2.5', '0', '40'],
              answer: 0,
              explanation: '`%` gives the remainder of 10 ÷ 4, which is 2.',
            },
            {
              id: 'q2',
              prompt: 'Which comparison is `true`?',
              options: ['5 === "5"', '5 !== 6', '"a" === "A"', '1 === 2'],
              answer: 1,
              explanation: '`5 !== 6` is true. Strict equality treats different types or values as not equal.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What does `%` do?', back: 'Returns the remainder of a division (modulo).' },
            { id: 'f2', front: 'Why prefer `===` over `==`?', back: '`===` checks value AND type with no coercion, avoiding surprises.' },
          ],
        },
        {
          id: 'js-conditionals',
          title: 'Conditionals: if / else',
          summary: 'Make decisions and branch your code.',
          tier: 'beginner',
          minutes: 10,
          xp: 60,
          prerequisites: ['js-operators'],
          content: `
## Branching with if / else

\`\`\`js
const hour = 9;

if (hour < 12) {
  console.log("Good morning!");
} else if (hour < 18) {
  console.log("Good afternoon!");
} else {
  console.log("Good evening!");
}
\`\`\`

## Ternary — a compact if/else expression

\`\`\`js
const age = 20;
const label = age >= 18 ? "adult" : "minor";
\`\`\`

## Truthy & falsy

These values are **falsy**: \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`.
Everything else is **truthy**.

\`\`\`js
if (username) {
  // runs only if username is a non-empty string
}
\`\`\`
`,
          exercise: {
            runner: 'js',
            instructions:
              'Write a function **grade(score)** that returns `"pass"` when score is 60 or above, otherwise `"fail"`.',
            starterCode: 'function grade(score) {\n  // your code\n}\n',
            solution: 'function grade(score) {\n  return score >= 60 ? "pass" : "fail";\n}',
            tests: [
              { name: '75 is a pass', assert: 'grade(75) === "pass"' },
              { name: '60 is a pass (boundary)', assert: 'grade(60) === "pass"' },
              { name: '40 is a fail', assert: 'grade(40) === "fail"' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which of these is a *falsy* value?',
              options: ['"0"', '[]', '0', '"false"'],
              answer: 2,
              explanation: 'The number `0` is falsy. The strings "0" and "false" and an empty array are all truthy.',
            },
            {
              id: 'q2',
              prompt: 'What does `5 > 3 ? "yes" : "no"` evaluate to?',
              options: ['"no"', '"yes"', 'true', 'undefined'],
              answer: 1,
              explanation: 'The condition `5 > 3` is true, so the ternary returns the first branch, "yes".',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Name three falsy values.', back: '`0`, `""`, `null` (also `undefined`, `NaN`, `false`).' },
            { id: 'f2', front: 'Syntax of a ternary?', back: '`condition ? valueIfTrue : valueIfFalse`' },
          ],
        },
        {
          id: 'js-functions',
          title: 'Functions',
          summary: 'Package reusable logic with parameters and return values.',
          tier: 'beginner',
          minutes: 12,
          xp: 70,
          prerequisites: ['js-conditionals'],
          content: `
## Declaring functions

\`\`\`js
function add(a, b) {
  return a + b;
}
add(2, 3); // 5
\`\`\`

## Arrow functions

A shorter syntax, very common in modern code:

\`\`\`js
const add = (a, b) => a + b;     // implicit return
const greet = (name) => {
  return "Hi " + name;
};
\`\`\`

## Default parameters

\`\`\`js
const greet = (name = "friend") => "Hello, " + name;
greet();        // "Hello, friend"
greet("Jamil"); // "Hello, Jamil"
\`\`\`

> 💡 A function that doesn't \`return\` anything gives back \`undefined\`.
`,
          exercise: {
            runner: 'js',
            instructions:
              'Write an arrow function **double** that takes a number `n` and returns `n` multiplied by 2.',
            starterCode: 'const double = /* your arrow function */;\n',
            solution: 'const double = (n) => n * 2;',
            tests: [
              { name: 'double(5) is 10', assert: 'double(5) === 10' },
              { name: 'double(0) is 0', assert: 'double(0) === 0' },
              { name: 'double is a function', assert: 'typeof double === "function"' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What does `const f = x => x * x; f(4)` return?',
              options: ['8', '16', 'undefined', '4'],
              answer: 1,
              explanation: 'The arrow function squares its input: 4 * 4 = 16.',
            },
            {
              id: 'q2',
              prompt: 'A function with no `return` statement returns…',
              options: ['null', '0', 'undefined', 'an error'],
              answer: 2,
              explanation: 'Without an explicit return, a function evaluates to `undefined`.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Arrow function with implicit return?', back: '`const add = (a, b) => a + b;`' },
            { id: 'f2', front: 'What does a function return with no return statement?', back: '`undefined`' },
          ],
        },
      ],
    },
    {
      id: 'js-collections',
      title: 'Arrays & Objects',
      tier: 'beginner',
      icon: '📦',
      lessons: [
        {
          id: 'js-arrays',
          title: 'Arrays & Array Methods',
          summary: 'Store ordered lists and transform them with map/filter.',
          tier: 'beginner',
          minutes: 14,
          xp: 80,
          prerequisites: ['js-functions'],
          content: `
## Arrays hold ordered lists

\`\`\`js
const nums = [10, 20, 30];
nums[0];        // 10  (zero-indexed)
nums.length;    // 3
nums.push(40);  // add to end -> [10,20,30,40]
\`\`\`

## The big three: map, filter, reduce

\`\`\`js
const nums = [1, 2, 3, 4];

nums.map(n => n * 2);        // [2, 4, 6, 8]
nums.filter(n => n % 2 === 0); // [2, 4]
nums.reduce((sum, n) => sum + n, 0); // 10
\`\`\`

\`map\` transforms every item, \`filter\` keeps items that pass a test, and
\`reduce\` boils the whole array down to a single value.
`,
          exercise: {
            runner: 'js',
            instructions:
              'Given the array `prices`, create **total** equal to the sum of all prices using `reduce`.',
            starterCode: 'const prices = [4, 8, 15, 16, 23, 42];\nconst total = /* use reduce */;\n',
            solution: 'const prices = [4, 8, 15, 16, 23, 42];\nconst total = prices.reduce((s, n) => s + n, 0);',
            tests: [{ name: 'total is 108', assert: 'total === 108' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What does `[1,2,3].map(n => n + 1)` produce?',
              options: ['[1,2,3]', '[2,3,4]', '6', '[1,2,3,1]'],
              answer: 1,
              explanation: '`map` returns a new array with the function applied to each item: [2,3,4].',
            },
            {
              id: 'q2',
              prompt: 'Which method keeps only items that pass a test?',
              options: ['map', 'reduce', 'filter', 'forEach'],
              answer: 2,
              explanation: '`filter` returns a new array of items for which the callback returns true.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What does `.map()` return?', back: 'A new array with the callback applied to every element.' },
            { id: 'f2', front: 'What does `.reduce()` do?', back: 'Reduces an array to a single value via an accumulator.' },
            { id: 'f3', front: 'Arrays are indexed starting at…?', back: '0 (zero-indexed).' },
          ],
        },
        {
          id: 'js-objects',
          title: 'Objects',
          summary: 'Model real things with key/value pairs.',
          tier: 'beginner',
          minutes: 12,
          xp: 80,
          prerequisites: ['js-arrays'],
          content: `
## Objects map keys to values

\`\`\`js
const user = {
  name: "Jamil",
  level: 3,
  active: true,
};

user.name;        // "Jamil"  (dot access)
user["level"];    // 3        (bracket access)
user.streak = 7;  // add a new property
\`\`\`

## Destructuring

Pull properties into variables in one line:

\`\`\`js
const { name, level } = user;
\`\`\`

## Iterating

\`\`\`js
Object.keys(user);   // ["name", "level", "active", "streak"]
Object.values(user); // ["Jamil", 3, true, 7]
\`\`\`
`,
          exercise: {
            runner: 'js',
            instructions:
              'Create an object **book** with a `title` of `"Eloquent JS"` and `pages` of `472`. Then set **count** to the number of keys on the object.',
            starterCode: 'const book = /* your object */;\nconst count = /* number of keys */;\n',
            solution: 'const book = { title: "Eloquent JS", pages: 472 };\nconst count = Object.keys(book).length;',
            tests: [
              { name: 'title is correct', assert: 'book.title === "Eloquent JS"' },
              { name: 'pages is 472', assert: 'book.pages === 472' },
              { name: 'count is 2', assert: 'count === 2' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'How do you read the `name` property of `user`?',
              options: ['user->name', 'user.name', 'user::name', 'name(user)'],
              answer: 1,
              explanation: 'Dot notation `user.name` (or bracket notation `user["name"]`) reads a property.',
            },
            {
              id: 'q2',
              prompt: 'What does `Object.keys({a:1, b:2})` return?',
              options: ['[1, 2]', '2', '["a", "b"]', '{a, b}'],
              answer: 2,
              explanation: '`Object.keys` returns an array of the object’s property names.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Two ways to access object properties?', back: 'Dot (`obj.key`) and bracket (`obj["key"]`).' },
            { id: 'f2', front: 'What is destructuring?', back: 'Extracting properties into variables: `const { a } = obj;`' },
          ],
        },
        {
          id: 'js-loops',
          title: 'Loops',
          summary: 'Repeat work with for and for…of.',
          tier: 'beginner',
          minutes: 10,
          xp: 70,
          prerequisites: ['js-objects'],
          content: `
## The classic for loop

\`\`\`js
for (let i = 0; i < 3; i++) {
  console.log(i); // 0, 1, 2
}
\`\`\`

## for…of iterates values

\`\`\`js
const colors = ["red", "green", "blue"];
for (const c of colors) {
  console.log(c);
}
\`\`\`

## while

\`\`\`js
let n = 3;
while (n > 0) {
  n--;
}
\`\`\`
`,
          exercise: {
            runner: 'js',
            instructions:
              'Write a function **sumTo(n)** that returns the sum of all integers from 1 to n (inclusive) using a loop.',
            starterCode: 'function sumTo(n) {\n  // your loop\n}\n',
            solution: 'function sumTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) total += i;\n  return total;\n}',
            tests: [
              { name: 'sumTo(5) is 15', assert: 'sumTo(5) === 15' },
              { name: 'sumTo(10) is 55', assert: 'sumTo(10) === 55' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'How many times does `for (let i = 0; i < 4; i++)` run?',
              options: ['3', '4', '5', 'forever'],
              answer: 1,
              explanation: 'i takes the values 0,1,2,3 — four iterations.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What does `for...of` iterate over?', back: 'The values of an iterable (like array elements).' },
          ],
        },
      ],
    },

    // ──────────────────────── INTERMEDIATE ───────────────────────
    {
      id: 'js-modern',
      title: 'Modern JavaScript',
      tier: 'intermediate',
      icon: '⚙️',
      lessons: [
        {
          id: 'js-scope-closures',
          title: 'Scope & Closures',
          summary: 'Understand how variables live and are captured.',
          tier: 'intermediate',
          minutes: 14,
          xp: 90,
          prerequisites: ['js-loops'],
          content: `
## Closures capture their surroundings

A **closure** is a function that remembers the variables from where it was created.

\`\`\`js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
next(); // 1
next(); // 2
\`\`\`

The inner arrow function "closes over" \`count\`, keeping it alive between calls.
`,
          exercise: {
            runner: 'js',
            instructions:
              'Complete **makeAdder(x)** so it returns a function that adds `x` to its argument. Example: `makeAdder(3)(4)` is `7`.',
            starterCode: 'function makeAdder(x) {\n  // return a function\n}\n',
            solution: 'function makeAdder(x) {\n  return (y) => x + y;\n}',
            tests: [
              { name: 'makeAdder(3)(4) is 7', assert: 'makeAdder(3)(4) === 7' },
              { name: 'makeAdder(10)(-2) is 8', assert: 'makeAdder(10)(-2) === 8' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'A closure gives a function access to…',
              options: ['only global variables', 'variables from its defining scope', 'nothing', 'the DOM only'],
              answer: 1,
              explanation: 'A closure retains access to variables from the scope in which it was created.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'What is a closure?', back: 'A function bundled with references to the variables of its surrounding scope.' },
          ],
        },
        { id: 'js-destructuring-spread', title: 'Destructuring & Spread', summary: 'Unpack and clone data elegantly.', tier: 'intermediate', minutes: 10, xp: 80, prerequisites: ['js-scope-closures'], content: '', quiz: [], flashcards: [] },
        { id: 'js-array-mastery', title: 'Array Method Mastery', summary: 'find, some, every, sort, flat and chaining.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['js-destructuring-spread'], content: '', quiz: [], flashcards: [] },
      ],
    },
    {
      id: 'js-async',
      title: 'Asynchronous JavaScript',
      tier: 'intermediate',
      icon: '⏳',
      lessons: [
        { id: 'js-callbacks', title: 'Callbacks & the Event Loop', summary: 'How JS does one thing at a time.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['js-array-mastery'], content: '', quiz: [], flashcards: [] },
        { id: 'js-promises', title: 'Promises', summary: 'then, catch, and chaining async work.', tier: 'intermediate', minutes: 14, xp: 100, prerequisites: ['js-callbacks'], content: '', quiz: [], flashcards: [] },
        { id: 'js-async-await', title: 'async / await', summary: 'Write async code that reads like sync.', tier: 'intermediate', minutes: 12, xp: 100, prerequisites: ['js-promises'], content: '', quiz: [], flashcards: [] },
        { id: 'js-fetch', title: 'Fetching Data from APIs', summary: 'Talk to the network with fetch().', tier: 'intermediate', minutes: 12, xp: 100, prerequisites: ['js-async-await'], content: '', quiz: [], flashcards: [] },
      ],
    },

    // ───────────────────────── ADVANCED ─────────────────────────
    {
      id: 'js-advanced',
      title: 'Advanced & Mastery',
      tier: 'advanced',
      icon: '🏆',
      lessons: [
        { id: 'js-prototypes', title: 'Prototypes & Classes', summary: 'How JS objects inherit behavior.', tier: 'advanced', minutes: 16, xp: 120, prerequisites: ['js-fetch'], content: '', quiz: [], flashcards: [] },
        { id: 'js-modules', title: 'ES Modules', summary: 'import / export and code organization.', tier: 'advanced', minutes: 12, xp: 110, prerequisites: ['js-prototypes'], content: '', quiz: [], flashcards: [] },
        { id: 'js-this', title: 'The "this" Keyword', summary: 'Master binding, call, apply, bind.', tier: 'advanced', minutes: 14, xp: 120, prerequisites: ['js-modules'], content: '', quiz: [], flashcards: [] },
        { id: 'js-patterns', title: 'Patterns & Performance', summary: 'Debounce, memoize, and write fast code.', tier: 'advanced', minutes: 18, xp: 140, prerequisites: ['js-this'], content: '', quiz: [], flashcards: [] },
      ],
    },
  ],
};
