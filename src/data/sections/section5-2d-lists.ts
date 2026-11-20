import type { LessonData } from '../../types/course';

export const SECTION_5_2D_LISTS: LessonData[] = [
  {
    id: 'multi-dimensional-list',
    sectionId: '2d-lists',
    title: 'Multi-Dimensional List',
    blocks: [
      {
        type: 'paragraph',
        text: 'A **2-D list** (list of lists) represents matrices, game boards, adjacency lists, and 2D DP tables. Elements are accessed with `grid[row][col]`.',
      },
      {
        type: 'code',
        code: `grid = [
    [1, 2, 3],
    [4, 5, 6],
]

rows = len(grid)       # 2
cols = len(grid[0])    # 3
print(grid[1][2])      # 6`,
      },
      {
        type: 'paragraph',
        text: 'A 2-D list does not even have to be rectangular — each inner list can have its own length (jagged arrays, like graph adjacency lists). Iterating `for row in nested_list:` followed by `for val in row:` works for any shape.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions on nested lists:',
      functions: [
        {
          signature: 'find_max_in_each_list(nested_arr: List[List[int]]) -> List[int]',
          description: 'Given a list of non-empty integer lists, returns a list containing the maximum integer from each inner list.',
        },
        {
          signature: 'flatten(nested_arr: List[List[int]]) -> List[int]',
          description: 'Flattens a 2D list of integers into a single 1D list preserving row-by-row order.',
        },
      ],
    },
    complexity: {
      time: 'O(N), where N is the total number of elements across all inner lists.',
      space: 'O(R) for `find_max_in_each_list` (R = number of rows); O(N) for `flatten`.',
    },
    hints: [
      'For `find_max_in_each_list`, Python’s built-in `max(inner)` finds the max of each row cleanly: `[max(arr) for arr in nested_arr]`.',
      'For `flatten`, iterate `for row in nested_arr: for val in row: res.append(val)`.',
    ],
    starterCode: `from typing import List


def find_max_in_each_list(nested_arr: List[List[int]]) -> List[int]:
    pass


def flatten(nested_arr: List[List[int]]) -> List[int]:
    pass


# do not modify below this line
print(find_max_in_each_list([[1, 2], [3, 4, 2]]))
print(find_max_in_each_list([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]))
print(find_max_in_each_list([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))

print(flatten([[1, 2], [3, 4, 5], [], [6]]))
`,
    expectedOutput: `[2, 4]
[4, 8, 12]
[3, 6, 9]
[1, 2, 3, 4, 5, 6]`,
    solutionCode: `from typing import List


def find_max_in_each_list(nested_arr: List[List[int]]) -> List[int]:
    return [max(arr) for arr in nested_arr]


def flatten(nested_arr: List[List[int]]) -> List[int]:
    res = []
    for row in nested_arr:
        for val in row:
            res.append(val)
    return res


# do not modify below this line
print(find_max_in_each_list([[1, 2], [3, 4, 2]]))
print(find_max_in_each_list([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]))
print(find_max_in_each_list([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))

print(flatten([[1, 2], [3, 4, 5], [], [6]]))
`,
    solutionExplanation:
      'Iterating row-by-row handles both rectangular matrices and jagged 2D lists cleanly. Built-in `max(arr)` handles negative numbers automatically.',
    testCases: [
      {
        name: 'find_max_in_each_list with negatives',
        inputDisplay: 'find_max_in_each_list([[-5, -1, -9], [0], [3, 2]])',
        expectedDisplay: '[-1, 0, 3]',
        testCode: `
_actual = find_max_in_each_list([[-5, -1, -9], [0], [3, 2]])
_expected = [-1, 0, 3]`,
      },
      {
        name: 'flatten jagged and empty inner lists',
        inputDisplay: 'flatten([[], [1], [2, 3], []])',
        expectedDisplay: '[1, 2, 3]',
        testCode: `
_actual = flatten([[], [1], [2, 3], []])
_expected = [1, 2, 3]`,
      },
    ],
  },
  {
    id: '2d-grid',
    sectionId: '2d-lists',
    title: '2D Grid',
    blocks: [
      {
        type: 'paragraph',
        text: 'Initializing a 2D grid in Python hides one of the **most famous interview traps**: multiplying a list of lists copies the *reference* to the same inner row!',
      },
      {
        type: 'code',
        code: `# BUGGY! All 3 rows are the EXACT same list object!
bad_grid = [[0] * 3] * 3
bad_grid[0][0] = 9
print(bad_grid)  # [[9, 0, 0], [9, 0, 0], [9, 0, 0]]  <-- OOPS!

# CORRECT! Each row is freshly allocated:
good_grid = []
for _ in range(3):
    good_grid.append([0] * 3)
good_grid[0][0] = 9
print(good_grid)  # [[9, 0, 0], [0, 0, 0], [0, 0, 0]]`,
      },
      {
        type: 'paragraph',
        text: 'Inside each row, `[value] * cols` is totally fine when `value` is immutable (like `0`, `False`, or `""`), as long as every row is created in its own loop iteration.',
      },
    ],
    challenge: {
      intro: 'Implement the following function cleanly without row-aliasing bugs:',
      functions: [
        {
          signature: 'create_grid(rows: int, cols: int, value: int) -> List[List[int]]',
          description: 'Creates and returns an independent `rows x cols` 2D grid where every cell starts initialized to `value`. Modifying one cell must NOT affect any other row.',
        },
      ],
    },
    complexity: {
      time: 'O(rows * cols).',
      space: 'O(rows * cols).',
    },
    hints: [
      'Avoid `[[value] * cols] * rows` — that causes every row to point to the same list in memory.',
      'Build `grid = []`, then loop `for _ in range(rows): grid.append([value] * cols)`.',
    ],
    starterCode: `from typing import List


def create_grid(rows: int, cols: int, value: int) -> List[List[int]]:
    pass


# do not modify below this line
grid = create_grid(3, 4, 0)
grid[0][0] = 1
print(grid)

print(create_grid(2, 3, 5))
print(create_grid(3, 2, -1))
`,
    expectedOutput: `[[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
[[5, 5, 5], [5, 5, 5]]
[[-1, -1], [-1, -1], [-1, -1]]`,
    solutionCode: `from typing import List


def create_grid(rows: int, cols: int, value: int) -> List[List[int]]:
    grid = []
    for _ in range(rows):
        grid.append([value] * cols)
    return grid


# do not modify below this line
grid = create_grid(3, 4, 0)
grid[0][0] = 1
print(grid)

print(create_grid(2, 3, 5))
print(create_grid(3, 2, -1))
`,
    solutionExplanation:
      'Appending a fresh `[value] * cols` on every iteration guarantees each row is a distinct list object in memory.',
    testCases: [
      {
        name: 'creates grid with right dimensions and values',
        inputDisplay: 'create_grid(2, 4, 7)',
        expectedDisplay: '[[7, 7, 7, 7], [7, 7, 7, 7]]',
        testCode: `
_actual = create_grid(2, 4, 7)
_expected = [[7, 7, 7, 7], [7, 7, 7, 7]]`,
      },
      {
        name: 'rows are independent (no aliasing bug)',
        inputDisplay: 'g = create_grid(3, 3, 0); g[0][1] = 9',
        expectedDisplay: 'g[1][1] == 0 and g[2][1] == 0',
        testCode: `
g = create_grid(3, 3, 0)
g[0][1] = 9
_actual = g
_expected = [[0, 9, 0], [0, 0, 0], [0, 0, 0]]
if g[1][1] != 0 or g[0] is g[1]:
    _passed = False
    _message = 'Rows share the same list reference! Never use [[val] * cols] * rows.'`,
      },
      {
        name: 'zero rows edge case',
        inputDisplay: 'create_grid(0, 5, 1)',
        expectedDisplay: '[]',
        testCode: `
_actual = create_grid(0, 5, 1)
_expected = []`,
      },
    ],
  },
  {
    id: 'nested-list-comprehension',
    sectionId: '2d-lists',
    title: 'Nested List Comprehension',
    blocks: [
      {
        type: 'paragraph',
        text: 'The most Pythonic way to initialize a 2D grid — or build a 2D DP table in an interview — is a **nested list comprehension**:',
      },
      {
        type: 'code',
        code: `rows, cols = 3, 4

# Idiomatic 2D grid initialization (every row is independent!)
grid = [[0 for _ in range(cols)] for _ in range(rows)]

# Or slightly shorter:
grid = [[0] * cols for _ in range(rows)]`,
      },
      {
        type: 'paragraph',
        text: 'You can also compute cell values from both `r` and `c` directly:',
      },
      {
        type: 'code',
        code: `# Multiplication table
table = [[r * c for c in range(1, 4)] for r in range(1, 4)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using nested list comprehensions:',
      functions: [
        {
          signature: 'create_grid(rows: int, cols: int, value: int) -> List[List[int]]',
          description: 'Returns an independent `rows x cols` grid filled with `value` using a nested list comprehension.',
        },
        {
          signature: 'create_identity_matrix(n: int) -> List[List[int]]',
          description: 'Returns an `n x n` identity matrix where diagonal cells (`r == c`) are `1` and all other cells are `0`.',
        },
      ],
    },
    complexity: {
      time: 'O(rows * cols) for `create_grid`; O(n²) for `create_identity_matrix`.',
      space: 'O(rows * cols) / O(n²).',
    },
    hints: [
      'For `create_grid`: `return [[value for _ in range(cols)] for _ in range(rows)]`.',
      'For `create_identity_matrix`: `return [[1 if r == c else 0 for c in range(n)] for r in range(n)]`.',
    ],
    starterCode: `from typing import List


def create_grid(rows: int, cols: int, value: int) -> List[List[int]]:
    pass


def create_identity_matrix(n: int) -> List[List[int]]:
    pass


# do not modify below this line
print(create_grid(2, 3, 0))
print(create_grid(3, 2, 1))
print(create_grid(4, 4, 4))

print(create_identity_matrix(3))
print(create_identity_matrix(1))
`,
    expectedOutput: `[[0, 0, 0], [0, 0, 0]]
[[1, 1], [1, 1], [1, 1]]
[[4, 4, 4, 4], [4, 4, 4, 4], [4, 4, 4, 4], [4, 4, 4, 4]]
[[1, 0, 0], [0, 1, 0], [0, 0, 1]]
[[1]]`,
    solutionCode: `from typing import List


def create_grid(rows: int, cols: int, value: int) -> List[List[int]]:
    return [[value for _ in range(cols)] for _ in range(rows)]


def create_identity_matrix(n: int) -> List[List[int]]:
    return [[1 if r == c else 0 for c in range(n)] for r in range(n)]


# do not modify below this line
print(create_grid(2, 3, 0))
print(create_grid(3, 2, 1))
print(create_grid(4, 4, 4))

print(create_identity_matrix(3))
print(create_identity_matrix(1))
`,
    solutionExplanation:
      'Nested comprehensions evaluate the inner comprehension once per row, guaranteeing independent rows while staying compact and readable.',
    testCases: [
      {
        name: 'create_grid independent rows',
        inputDisplay: 'g = create_grid(2, 2, 5); g[0][0] = 9',
        expectedDisplay: '[[9, 5], [5, 5]]',
        testCode: `
g = create_grid(2, 2, 5)
g[0][0] = 9
_actual = g
_expected = [[9, 5], [5, 5]]`,
      },
      {
        name: 'create_identity_matrix 4x4',
        inputDisplay: 'create_identity_matrix(4)',
        expectedDisplay: '4x4 identity matrix',
        testCode: `
_actual = create_identity_matrix(4)
_expected = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
]`,
      },
    ],
  },
];
