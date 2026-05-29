import { Course } from '../models/curriculum.model';

export const PYTHON_COURSE: Course = {
  id: 'python',
  name: 'Python',
  tagline: 'Readable, powerful, everywhere — from scripts to AI.',
  icon: '🐍',
  color: '#3776ab',
  runner: 'python',
  modules: [
    // ───────────────────────── BEGINNER ─────────────────────────
    {
      id: 'py-basics',
      title: 'Python Foundations',
      tier: 'beginner',
      icon: '🌱',
      lessons: [
        {
          id: 'py-variables',
          title: 'Variables & Types',
          summary: 'Names, numbers, strings, and booleans in Python.',
          tier: 'beginner',
          minutes: 8,
          xp: 50,
          prerequisites: [],
          content: `
## Variables need no keyword

In Python you simply assign. No \`let\` or \`const\`.

\`\`\`python
name = "Jamil"
score = 0
pi = 3.14159
is_active = True   # note the capital T
\`\`\`

## Core types

| Type | Example |
|------|---------|
| str | \`"hello"\` |
| int | \`42\` |
| float | \`3.14\` |
| bool | \`True\` / \`False\` |
| NoneType | \`None\` |

Check a type with \`type()\`:

\`\`\`python
type(42)        # <class 'int'>
type("hi")      # <class 'str'>
\`\`\`

> 💡 Python is **case-sensitive** and uses \`True\`/\`False\`/\`None\` (capitalized).
`,
          exercise: {
            runner: 'python',
            instructions:
              'Create a variable **language** equal to the string `"Python"` and **year** equal to the integer `2026`.',
            starterCode: '# Declare your variables below\n',
            solution: 'language = "Python"\nyear = 2026',
            tests: [
              { name: 'language is "Python"', assert: 'language == "Python"' },
              { name: 'year is 2026', assert: 'year == 2026' },
              { name: 'year is an int', assert: 'isinstance(year, int)' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which is the correct Python boolean for "true"?',
              options: ['true', 'True', 'TRUE', '1.0'],
              answer: 1,
              explanation: 'Python booleans are capitalized: `True` and `False`.',
            },
            {
              id: 'q2',
              prompt: 'What does `type(3.14)` report?',
              options: ["<class 'int'>", "<class 'float'>", "<class 'number'>", "<class 'str'>"],
              answer: 1,
              explanation: '3.14 has a decimal point, so it is a `float`.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'How do you declare a variable in Python?', back: 'Just assign: `x = 5` — no keyword needed.' },
            { id: 'f2', front: 'Python’s "nothing" value?', back: '`None` (capital N).' },
          ],
        },
        {
          id: 'py-strings',
          title: 'Strings & f-strings',
          summary: 'Build, slice, and format text.',
          tier: 'beginner',
          minutes: 10,
          xp: 60,
          prerequisites: ['py-variables'],
          content: `
## f-strings are the modern way to format

\`\`\`python
name = "Jamil"
greeting = f"Hello, {name}!"   # "Hello, Jamil!"
total = f"{2 + 2} items"        # "4 items"
\`\`\`

## Slicing

\`\`\`python
word = "python"
word[0]     # 'p'
word[-1]    # 'n'  (last char)
word[0:3]   # 'pyt' (start inclusive, end exclusive)
word.upper()# 'PYTHON'
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions:
              'Given **name**, build **message** equal to `"Hi, NAME!"` using an f-string (replace NAME with the value).',
            starterCode: 'name = "Ada"\nmessage = ""  # use an f-string\n',
            solution: 'name = "Ada"\nmessage = f"Hi, {name}!"',
            tests: [{ name: 'message is "Hi, Ada!"', assert: 'message == "Hi, Ada!"' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What does `"python"[1:4]` return?',
              options: ["'pyt'", "'yth'", "'ytho'", "'pyth'"],
              answer: 1,
              explanation: 'Slicing [1:4] takes indexes 1,2,3 → "yth" (end index is exclusive).',
            },
            {
              id: 'q2',
              prompt: 'Which creates an f-string?',
              options: ['"{x}"', "format{x}", 'f"{x}"', '$"{x}"'],
              answer: 2,
              explanation: 'Prefix the string with `f` and embed expressions in `{}`.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'How do you embed a value in a string?', back: 'Use an f-string: `f"value is {x}"`.' },
            { id: 'f2', front: 'What does `s[-1]` give?', back: 'The last character of the string.' },
          ],
        },
        {
          id: 'py-control-flow',
          title: 'Control Flow',
          summary: 'if/elif/else and indentation rules.',
          tier: 'beginner',
          minutes: 11,
          xp: 70,
          prerequisites: ['py-strings'],
          content: `
## Indentation defines blocks

Python uses **indentation** (4 spaces) instead of braces.

\`\`\`python
hour = 9
if hour < 12:
    print("Good morning")
elif hour < 18:
    print("Good afternoon")
else:
    print("Good evening")
\`\`\`

## Comparison & logic

\`\`\`python
x = 5
x == 5 and x > 0   # True
not (x == 5)       # False
x in [1, 5, 9]     # True (membership test)
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions:
              'Write a function **grade(score)** returning `"pass"` if score >= 60 else `"fail"`.',
            starterCode: 'def grade(score):\n    pass  # replace this\n',
            solution: 'def grade(score):\n    return "pass" if score >= 60 else "fail"',
            tests: [
              { name: 'grade(75) is pass', assert: 'grade(75) == "pass"' },
              { name: 'grade(60) is pass', assert: 'grade(60) == "pass"' },
              { name: 'grade(20) is fail', assert: 'grade(20) == "fail"' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'How does Python define a code block?',
              options: ['curly braces {}', 'indentation', 'parentheses ()', 'the "begin" keyword'],
              answer: 1,
              explanation: 'Python uses consistent indentation (typically 4 spaces) to define blocks.',
            },
            {
              id: 'q2',
              prompt: 'What does `3 in [1, 2, 3]` return?',
              options: ['True', 'False', 'error', '3'],
              answer: 0,
              explanation: 'The `in` operator tests membership; 3 is in the list, so True.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'How are blocks defined in Python?', back: 'By indentation, not braces.' },
            { id: 'f2', front: 'Keyword for "else if" in Python?', back: '`elif`' },
          ],
        },
        {
          id: 'py-functions',
          title: 'Functions',
          summary: 'def, parameters, defaults, and return.',
          tier: 'beginner',
          minutes: 12,
          xp: 80,
          prerequisites: ['py-control-flow'],
          content: `
## Defining functions

\`\`\`python
def add(a, b):
    return a + b

add(2, 3)  # 5
\`\`\`

## Default & keyword arguments

\`\`\`python
def greet(name="friend"):
    return f"Hello, {name}"

greet()           # "Hello, friend"
greet(name="Jamil")  # "Hello, Jamil"
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions: 'Write **double(n)** that returns n times 2.',
            starterCode: 'def double(n):\n    pass\n',
            solution: 'def double(n):\n    return n * 2',
            tests: [
              { name: 'double(5) is 10', assert: 'double(5) == 10' },
              { name: 'double(0) is 0', assert: 'double(0) == 0' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'Which keyword defines a function?',
              options: ['function', 'func', 'def', 'lambda'],
              answer: 2,
              explanation: 'Python uses `def` to define a named function.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Keyword to define a function in Python?', back: '`def`' },
          ],
        },
      ],
    },
    {
      id: 'py-collections',
      title: 'Lists, Dicts & Sets',
      tier: 'beginner',
      icon: '📦',
      lessons: [
        {
          id: 'py-lists',
          title: 'Lists',
          summary: 'Ordered, mutable collections.',
          tier: 'beginner',
          minutes: 12,
          xp: 80,
          prerequisites: ['py-functions'],
          content: `
## Lists

\`\`\`python
nums = [10, 20, 30]
nums[0]        # 10
nums.append(40)# [10,20,30,40]
len(nums)      # 4
nums[-1]       # 40
sum(nums)      # 100
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions: 'Given **prices**, set **total** to the sum of the list.',
            starterCode: 'prices = [4, 8, 15, 16, 23, 42]\ntotal = 0  # compute the sum\n',
            solution: 'prices = [4, 8, 15, 16, 23, 42]\ntotal = sum(prices)',
            tests: [{ name: 'total is 108', assert: 'total == 108' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'How do you add an item to the end of a list?',
              options: ['list.add(x)', 'list.push(x)', 'list.append(x)', 'list += x'],
              answer: 2,
              explanation: 'Lists use `.append(x)` to add a single item to the end.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Add to end of a Python list?', back: '`list.append(item)`' },
            { id: 'f2', front: 'Length of a list?', back: '`len(list)`' },
          ],
        },
        {
          id: 'py-dicts',
          title: 'Dictionaries',
          summary: 'Key/value mappings.',
          tier: 'beginner',
          minutes: 12,
          xp: 80,
          prerequisites: ['py-lists'],
          content: `
## Dictionaries map keys to values

\`\`\`python
user = {"name": "Jamil", "level": 3}
user["name"]          # "Jamil"
user["streak"] = 7     # add a key
user.get("missing", 0) # 0 (default if absent)
list(user.keys())      # ['name', 'level', 'streak']
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions: 'Create a dict **book** with key `"title"` = `"Fluent Python"` and `"pages"` = `792`.',
            starterCode: 'book = {}\n',
            solution: 'book = {"title": "Fluent Python", "pages": 792}',
            tests: [
              { name: 'title correct', assert: 'book["title"] == "Fluent Python"' },
              { name: 'pages correct', assert: 'book["pages"] == 792' },
            ],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What does `d.get("x", 0)` do if "x" is missing?',
              options: ['raises KeyError', 'returns None', 'returns 0', 'adds x=0'],
              answer: 2,
              explanation: '`.get` returns the provided default (0) when the key is absent — no error.',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Safely read a possibly-missing dict key?', back: '`d.get(key, default)`' },
          ],
        },
        {
          id: 'py-comprehensions',
          title: 'List Comprehensions',
          summary: 'Build lists in one expressive line.',
          tier: 'beginner',
          minutes: 11,
          xp: 80,
          prerequisites: ['py-dicts'],
          content: `
## Comprehensions

\`\`\`python
nums = [1, 2, 3, 4]
[n * 2 for n in nums]          # [2, 4, 6, 8]
[n for n in nums if n % 2 == 0]# [2, 4]
\`\`\`
`,
          exercise: {
            runner: 'python',
            instructions: 'Use a comprehension to set **squares** to the squares of 1..5 → `[1, 4, 9, 16, 25]`.',
            starterCode: 'squares = []  # use a comprehension over range(1, 6)\n',
            solution: 'squares = [n * n for n in range(1, 6)]',
            tests: [{ name: 'squares correct', assert: 'squares == [1, 4, 9, 16, 25]' }],
          },
          quiz: [
            {
              id: 'q1',
              prompt: 'What does `[n+1 for n in [0,1,2]]` produce?',
              options: ['[0,1,2]', '[1,2,3]', '3', '[1,1,1]'],
              answer: 1,
              explanation: 'Each element has 1 added: [1, 2, 3].',
            },
          ],
          flashcards: [
            { id: 'f1', front: 'Comprehension to double a list?', back: '`[x*2 for x in items]`' },
          ],
        },
      ],
    },

    // ──────────────────────── INTERMEDIATE ───────────────────────
    {
      id: 'py-intermediate',
      title: 'Intermediate Python',
      tier: 'intermediate',
      icon: '⚙️',
      lessons: [
        { id: 'py-tuples-sets', title: 'Tuples & Sets', summary: 'Immutable and unique collections.', tier: 'intermediate', minutes: 10, xp: 80, prerequisites: ['py-comprehensions'], content: '', quiz: [], flashcards: [] },
        { id: 'py-error-handling', title: 'Errors & Exceptions', summary: 'try / except / finally.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['py-tuples-sets'], content: '', quiz: [], flashcards: [] },
        { id: 'py-files', title: 'Files & Context Managers', summary: 'Read & write with `with open`.', tier: 'intermediate', minutes: 12, xp: 90, prerequisites: ['py-error-handling'], content: '', quiz: [], flashcards: [] },
        { id: 'py-modules-pip', title: 'Modules & pip', summary: 'import and the standard library.', tier: 'intermediate', minutes: 10, xp: 80, prerequisites: ['py-files'], content: '', quiz: [], flashcards: [] },
      ],
    },
    {
      id: 'py-oop',
      title: 'Object-Oriented Python',
      tier: 'intermediate',
      icon: '🏗️',
      lessons: [
        { id: 'py-classes', title: 'Classes & Objects', summary: '__init__, self, and methods.', tier: 'intermediate', minutes: 14, xp: 100, prerequisites: ['py-modules-pip'], content: '', quiz: [], flashcards: [] },
        { id: 'py-inheritance', title: 'Inheritance', summary: 'Reuse behavior with subclasses.', tier: 'intermediate', minutes: 12, xp: 100, prerequisites: ['py-classes'], content: '', quiz: [], flashcards: [] },
        { id: 'py-dunder', title: 'Dunder Methods', summary: '__str__, __eq__, and friends.', tier: 'intermediate', minutes: 12, xp: 100, prerequisites: ['py-inheritance'], content: '', quiz: [], flashcards: [] },
      ],
    },

    // ───────────────────────── ADVANCED ─────────────────────────
    {
      id: 'py-advanced',
      title: 'Advanced & Mastery',
      tier: 'advanced',
      icon: '🏆',
      lessons: [
        { id: 'py-generators', title: 'Generators & Iterators', summary: 'Lazy sequences with yield.', tier: 'advanced', minutes: 14, xp: 120, prerequisites: ['py-dunder'], content: '', quiz: [], flashcards: [] },
        { id: 'py-decorators', title: 'Decorators', summary: 'Functions that wrap functions.', tier: 'advanced', minutes: 16, xp: 130, prerequisites: ['py-generators'], content: '', quiz: [], flashcards: [] },
        { id: 'py-typing', title: 'Type Hints', summary: 'Static typing with the typing module.', tier: 'advanced', minutes: 12, xp: 110, prerequisites: ['py-decorators'], content: '', quiz: [], flashcards: [] },
        { id: 'py-async', title: 'async / await', summary: 'Concurrency with asyncio.', tier: 'advanced', minutes: 18, xp: 140, prerequisites: ['py-typing'], content: '', quiz: [], flashcards: [] },
      ],
    },
  ],
};
