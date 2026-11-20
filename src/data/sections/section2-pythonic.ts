import type { LessonData } from '../../types/course';

export const SECTION_2_PYTHONIC: LessonData[] = [
  {
    id: 'unpacking',
    sectionId: 'pythonic-code',
    title: 'Unpacking',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python lets you assign elements of a sequence (a list, tuple, or string) directly to multiple variables in a single statement. This is called **unpacking**.',
      },
      {
        type: 'code',
        code: `point = [10, 20, 30]
x, y, z = point
print(x, y, z)  # 10 20 30`,
      },
      {
        type: 'paragraph',
        text: 'Without a starred target, the number of variables on the left must match the number of items on the right — otherwise Python raises a `ValueError`. A **starred target** (`*rest`) collects the remaining items into a list, and by convention `_` names a value you do not need (it is still an ordinary variable).',
      },
      {
        type: 'code',
        code: `first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)  # 1 [2, 3, 4] 5

# Swapping two variables in-place without a temp variable!
a, b = 1, 2
a, b = b, a
print(a, b)  # 2 1`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using Python unpacking:',
      functions: [
        {
          signature: 'sum_3_integers(triplet: List[int]) -> int',
          description: 'Unpacks a 3-element list of integers into three variables and returns their sum.',
        },
        {
          signature: 'compute_volume(box_dimensions: Tuple[int, int, int]) -> int',
          description: 'Unpacks `(width, height, depth)` from a tuple and returns the volume `width * height * depth`.',
        },
        {
          signature: 'split_head_tail(nums: List[int]) -> Tuple[int, List[int], int]',
          description: 'Given a list with at least 2 elements, unpacks and returns `(first, middle_list, last)`.',
        },
      ],
    },
    complexity: {
      time: 'O(1) for fixed-size unpacking; O(n) for starred `*middle` slicing.',
      space: 'O(1) for fixed-size unpacking; O(n) for the `middle` list.',
    },
    hints: [
      'In `sum_3_integers`, write `a, b, c = triplet` and return `a + b + c`.',
      'In `compute_volume`, write `w, h, d = box_dimensions` and return `w * h * d`.',
      'In `split_head_tail`, use starred unpacking: `first, *middle, last = nums`.',
    ],
    starterCode: `from typing import List, Tuple


def sum_3_integers(triplet: List[int]) -> int:
    pass


def compute_volume(box_dimensions: Tuple[int, int, int]) -> int:
    pass


def split_head_tail(nums: List[int]) -> Tuple[int, List[int], int]:
    pass


# do not modify below this line
print(sum_3_integers([1, 2, 3]))
print(sum_3_integers([4, 6, 2]))

print(compute_volume((1, 2, 3)))
print(compute_volume((3, 2, 1)))
print(compute_volume((3, 9, 7)))

print(split_head_tail([10, 20, 30, 40, 50]))
print(split_head_tail([7, 9]))
`,
    expectedOutput: `6
12
6
6
189
(10, [20, 30, 40], 50)
(7, [], 9)`,
    solutionCode: `from typing import List, Tuple


def sum_3_integers(triplet: List[int]) -> int:
    a, b, c = triplet
    return a + b + c


def compute_volume(box_dimensions: Tuple[int, int, int]) -> int:
    width, height, depth = box_dimensions
    return width * height * depth


def split_head_tail(nums: List[int]) -> Tuple[int, List[int], int]:
    first, *middle, last = nums
    return (first, middle, last)


# do not modify below this line
print(sum_3_integers([1, 2, 3]))
print(sum_3_integers([4, 6, 2]))

print(compute_volume((1, 2, 3)))
print(compute_volume((3, 2, 1)))
print(compute_volume((3, 9, 7)))

print(split_head_tail([10, 20, 30, 40, 50]))
print(split_head_tail([7, 9]))
`,
    solutionExplanation:
      'Unpacking replaces verbose indexing like `box_dimensions[0] * box_dimensions[1] * box_dimensions[2]` with descriptive names. Starred unpacking (`first, *middle, last`) cleanly captures zero or more middle elements.',
    testCases: [
      {
        name: 'sum_3_integers',
        inputDisplay: 'sum_3_integers([-5, 10, 3])',
        expectedDisplay: '8',
        testCode: `
_actual = sum_3_integers([-5, 10, 3])
_expected = 8`,
      },
      {
        name: 'compute_volume',
        inputDisplay: 'compute_volume((4, 5, 6))',
        expectedDisplay: '120',
        testCode: `
_actual = compute_volume((4, 5, 6))
_expected = 120`,
      },
      {
        name: 'split_head_tail with multiple middle items',
        inputDisplay: 'split_head_tail([1, 2, 3, 4])',
        expectedDisplay: '(1, [2, 3], 4)',
        testCode: `
_actual = split_head_tail([1, 2, 3, 4])
_expected = (1, [2, 3], 4)`,
      },
      {
        name: 'split_head_tail with 2 elements',
        inputDisplay: 'split_head_tail([8, 9])',
        expectedDisplay: '(8, [], 9)',
        testCode: `
_actual = split_head_tail([8, 9])
_expected = (8, [], 9)`,
      },
    ],
  },
  {
    id: 'loop-unpacking',
    sectionId: 'pythonic-code',
    title: 'Loop Unpacking',
    blocks: [
      {
        type: 'paragraph',
        text: 'Unpacking is especially clean inside `for` loops when iterating over lists of pairs, coordinates, edges `(u, v, weight)`, or intervals `[start, end]`.',
      },
      {
        type: 'code',
        code: `points = [[1, 2], [3, 4], [5, 6]]

for x, y in points:
    print(f"x={x}, y={y}")`,
      },
      {
        type: 'paragraph',
        text: 'Instead of writing `pair[0]` and `pair[1]` everywhere, unpacking right in the loop header makes graph traversal, interval merging, and coordinate math dramatically easier to read and less bug-prone.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using loop unpacking:',
      functions: [
        {
          signature: 'best_student(scores: List[Tuple[str, int]]) -> str',
          description: 'Accepts a non-empty list of `(student_name, score)` tuples and returns the name of the student with the highest score. If there is a tie, return the first student with that highest score.',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n is the number of students.',
      space: 'O(1) extra space.',
    },
    hints: [
      'Iterate with `for name, score in scores:` to unpack each tuple directly.',
      'Initialize `best_name, best_score = scores[0]` (or `best_name, best_score = "", float("-inf")`). Update both only when `score > best_score` so ties keep the first student.',
    ],
    starterCode: `from typing import List, Tuple


def best_student(scores: List[Tuple[str, int]]) -> str:
    pass


# do not modify below this line
print(best_student([("Alice", 90), ("Bob", 80), ("Charlie", 70)]))
print(best_student([("Alice", 90), ("Bob", 80), ("Charlie", 100)]))
print(best_student([("Alice", 90), ("Bob", 100), ("Charlie", 70)]))
print(best_student([("Alice", 90), ("Bob", 90), ("Charlie", 80), ("David", 100)]))
`,
    expectedOutput: `Alice
Charlie
Bob
David`,
    solutionCode: `from typing import List, Tuple


def best_student(scores: List[Tuple[str, int]]) -> str:
    best_name, best_score = scores[0]
    for name, score in scores:
        if score > best_score:
            best_score = score
            best_name = name
    return best_name


# do not modify below this line
print(best_student([("Alice", 90), ("Bob", 80), ("Charlie", 70)]))
print(best_student([("Alice", 90), ("Bob", 80), ("Charlie", 100)]))
print(best_student([("Alice", 90), ("Bob", 100), ("Charlie", 70)]))
print(best_student([("Alice", 90), ("Bob", 90), ("Charlie", 80), ("David", 100)]))
`,
    solutionExplanation:
      'Initializing `best_name, best_score = scores[0]` handles negative scores cleanly as well, and `for name, score in scores:` unpacks every pair without index boilerplate. Using strict `>` preserves the first student on ties.',
    testCases: [
      {
        name: 'highest at end',
        inputDisplay: 'best_student([("Alice", 85), ("Bob", 92)])',
        expectedDisplay: "'Bob'",
        testCode: `
_actual = best_student([("Alice", 85), ("Bob", 92)])
_expected = 'Bob'`,
      },
      {
        name: 'tie preserves first student',
        inputDisplay: 'best_student([("Zoe", 100), ("Max", 100), ("Eli", 95)])',
        expectedDisplay: "'Zoe'",
        testCode: `
_actual = best_student([("Zoe", 100), ("Max", 100), ("Eli", 95)])
_expected = 'Zoe'`,
      },
      {
        name: 'negative scores supported',
        inputDisplay: 'best_student([("A", -50), ("B", -10), ("C", -20)])',
        expectedDisplay: "'B'",
        testCode: `
_actual = best_student([("A", -50), ("B", -10), ("C", -20)])
_expected = 'B'`,
      },
    ],
  },
  {
    id: 'enumerate',
    sectionId: 'pythonic-code',
    title: 'Enumerate',
    blocks: [
      {
        type: 'paragraph',
        text: 'Whenever you need **both the index and the element** while looping over a sequence, prefer Python’s built-in `enumerate()` over `range(len(nums))`.',
      },
      {
        type: 'code',
        code: `nums = [2, 7, 9, 3, 2]

for i, n in enumerate(nums):
    print(i, n)
# 0 2
# 1 7
# 2 9
# ...`,
      },
      {
        type: 'paragraph',
        text: '`enumerate()` yields `(index, value)` pairs lazily without allocating a new list. You can also pass `start=1` if you want 1-based numbering.',
      },
      {
        type: 'note',
        title: 'Interview Classic',
        text: 'Patterns like *Two Sum*, *Sliding Window*, and *Monotonic Stack* almost always pair `for i, num in enumerate(nums):` with a hash map or stack storing indices.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `enumerate()`:',
      functions: [
        {
          signature: 'get_index_of_seven(nums: List[int]) -> int',
          description: 'Returns the index of the **first** occurrence of `7` in `nums`, or `-1` if `7` is not present.',
        },
        {
          signature: 'get_dist_between_sevens(nums: List[int]) -> int',
          description: 'Given a list guaranteed to contain at least two `7`s, returns the index distance between the **first** and **second** occurrence of `7`.',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n is the length of `nums`.',
      space: 'O(1) extra space (`enumerate` is a lazy iterator).',
    },
    hints: [
      'In `get_index_of_seven`, loop `for i, num in enumerate(nums):` and `return i` as soon as `num == 7`. Return `-1` after the loop.',
      'In `get_dist_between_sevens`, store `first_idx = -1`. The first time you see `7`, record `first_idx = i`; the second time, return `i - first_idx`.',
    ],
    starterCode: `from typing import List


def get_index_of_seven(nums: List[int]) -> int:
    pass


def get_dist_between_sevens(nums: List[int]) -> int:
    pass


# do not modify below this line
print(get_index_of_seven([1, 2, 3, 4, 5, 6, 7, 8, 9]))
print(get_index_of_seven([1, 2, 3, 4, 5, 6, 8, 9]))
print(get_index_of_seven([2, 4, 7, 5, 7, 8, 4, 2]))

print(get_dist_between_sevens([1, 2, 7, 4, 5, 6, 7, 8, 9]))
print(get_dist_between_sevens([2, 7, 7, 7, 8]))
print(get_dist_between_sevens([7, 4, 8, 4, 2, 7]))
`,
    expectedOutput: `6
-1
2
4
1
5`,
    solutionCode: `from typing import List


def get_index_of_seven(nums: List[int]) -> int:
    for i, num in enumerate(nums):
        if num == 7:
            return i
    return -1


def get_dist_between_sevens(nums: List[int]) -> int:
    first_seven = -1
    for i, num in enumerate(nums):
        if num == 7:
            if first_seven == -1:
                first_seven = i
            else:
                return i - first_seven
    return -1


# do not modify below this line
print(get_index_of_seven([1, 2, 3, 4, 5, 6, 7, 8, 9]))
print(get_index_of_seven([1, 2, 3, 4, 5, 6, 8, 9]))
print(get_index_of_seven([2, 4, 7, 5, 7, 8, 4, 2]))

print(get_dist_between_sevens([1, 2, 7, 4, 5, 6, 7, 8, 9]))
print(get_dist_between_sevens([2, 7, 7, 7, 8]))
print(get_dist_between_sevens([7, 4, 8, 4, 2, 7]))
`,
    solutionExplanation:
      '`enumerate(nums)` yields `(i, num)` directly. In `get_dist_between_sevens`, we track the first index of `7` with a sentinel `-1`, and return `i - first_seven` on the second occurrence.',
    testCases: [
      {
        name: 'get_index_of_seven present at index 0',
        inputDisplay: 'get_index_of_seven([7, 1, 7])',
        expectedDisplay: '0',
        testCode: `
_actual = get_index_of_seven([7, 1, 7])
_expected = 0`,
      },
      {
        name: 'get_index_of_seven missing',
        inputDisplay: 'get_index_of_seven([1, 2, 3])',
        expectedDisplay: '-1',
        testCode: `
_actual = get_index_of_seven([1, 2, 3])
_expected = -1`,
      },
      {
        name: 'get_dist_between_sevens adjacent',
        inputDisplay: 'get_dist_between_sevens([7, 7])',
        expectedDisplay: '1',
        testCode: `
_actual = get_dist_between_sevens([7, 7])
_expected = 1`,
      },
      {
        name: 'get_dist_between_sevens ignores third 7',
        inputDisplay: 'get_dist_between_sevens([1, 7, 2, 3, 7, 9, 7])',
        expectedDisplay: '3',
        testCode: `
_actual = get_dist_between_sevens([1, 7, 2, 3, 7, 9, 7])
_expected = 3`,
      },
    ],
  },
  {
    id: 'zip',
    sectionId: 'pythonic-code',
    title: 'Zip',
    blocks: [
      {
        type: 'paragraph',
        text: '`zip()` lets you iterate over **multiple iterables in parallel**, yielding tuples of corresponding elements.',
      },
      {
        type: 'code',
        code: `names = ["Alice", "Bob", "Charlie"]
scores = [90, 85, 95]

for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
      },
      {
        type: 'paragraph',
        text: 'If the input iterables have different lengths, `zip()` stops as soon as the **shortest** iterable is exhausted. Like `enumerate()`, `zip()` is lazy and uses O(1) extra memory.',
      },
      {
        type: 'code',
        code: `# Combine two lists into a dictionary in one line:
mapping = dict(zip(["a", "b", "c"], [1, 2, 3]))
print(mapping)  # {'a': 1, 'b': 2, 'c': 3}`,
      },
    ],
    challenge: {
      intro: 'Implement the following function using `zip()`:',
      functions: [
        {
          signature: 'group_names_and_scores(names: List[str], scores: List[int]) -> Dict[str, int]',
          description: 'Accepts two equal-length lists `names` and `scores` and returns a dictionary mapping each name to its corresponding score. If a name appears more than once, its last score wins.',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n is the length of the lists.',
      space: 'O(n) for the returned dictionary.',
    },
    hints: [
      'Loop with `for name, score in zip(names, scores): result[name] = score`.',
      'Even shorter: `return dict(zip(names, scores))` works in a single expression!',
    ],
    starterCode: `from typing import List, Dict


def group_names_and_scores(names: List[str], scores: List[int]) -> Dict[str, int]:
    pass


# do not modify below this line
print(group_names_and_scores(["Alice", "Bob", "Charlie"], [90, 80, 70]))
print(group_names_and_scores(["Jane", "Carol", "Charlie"], [25, 100, 60]))
print(group_names_and_scores(["Doug", "Bob", "Tommy"], [80, 90, 100]))
`,
    expectedOutput: `{'Alice': 90, 'Bob': 80, 'Charlie': 70}
{'Jane': 25, 'Carol': 100, 'Charlie': 60}
{'Doug': 80, 'Bob': 90, 'Tommy': 100}`,
    solutionCode: `from typing import List, Dict


def group_names_and_scores(names: List[str], scores: List[int]) -> Dict[str, int]:
    res = {}
    for name, score in zip(names, scores):
        res[name] = score
    return res


# do not modify below this line
print(group_names_and_scores(["Alice", "Bob", "Charlie"], [90, 80, 70]))
print(group_names_and_scores(["Jane", "Carol", "Charlie"], [25, 100, 60]))
print(group_names_and_scores(["Doug", "Bob", "Tommy"], [80, 90, 100]))
`,
    solutionExplanation:
      '`zip(names, scores)` pairs elements at the same index without needing `range(len(names))`. You can also write `return dict(zip(names, scores))` for an even tighter one-liner.',
    testCases: [
      {
        name: 'basic pairing',
        inputDisplay: 'group_names_and_scores(["Alice", "Bob"], [90, 80])',
        expectedDisplay: "{'Alice': 90, 'Bob': 80}",
        testCode: `
_actual = group_names_and_scores(["Alice", "Bob"], [90, 80])
_expected = {'Alice': 90, 'Bob': 80}`,
      },
      {
        name: 'empty lists',
        inputDisplay: 'group_names_and_scores([], [])',
        expectedDisplay: '{}',
        testCode: `
_actual = group_names_and_scores([], [])
_expected = {}`,
      },
      {
        name: 'single pair',
        inputDisplay: 'group_names_and_scores(["Solo"], [42])',
        expectedDisplay: "{'Solo': 42}",
        testCode: `
_actual = group_names_and_scores(["Solo"], [42])
_expected = {'Solo': 42}`,
      },
    ],
  },
  {
    id: 'inequality',
    sectionId: 'pythonic-code',
    title: 'Inequality',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python supports **chained comparisons**, allowing you to write mathematical range checks naturally without repeating variables or joining them with `and`.',
      },
      {
        type: 'code',
        code: `x = 5

# Instead of: if x > 0 and x < 10:
if 0 < x < 10:
    print("x is strictly between 0 and 10")`,
      },
      {
        type: 'paragraph',
        text: 'Chained comparisons work for any length and any combination of comparison operators (`<`, `<=`, `>`, `>=`, `==`, `!=`). Each middle expression is evaluated **at most once**, and evaluation stops at the first comparison that is `False`.',
      },
      {
        type: 'code',
        code: `# Great for 2D grid bounds checks in DFS/BFS!
if 0 <= row < ROWS and 0 <= col < COLS:
    visit(row, col)`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using chained comparisons:',
      functions: [
        {
          signature: 'is_arr_valid(names: List[str], max_length: int) -> bool',
          description: 'Returns `True` if `names` is non-empty and contains at most `max_length` elements, else `False`.',
        },
        {
          signature: 'in_bounds(r: int, c: int, rows: int, cols: int) -> bool',
          description: 'Returns `True` if `(r, c)` is a valid cell inside a `rows x cols` grid (rows and columns are 0-indexed), else `False`.',
        },
      ],
    },
    complexity: {
      time: 'O(1).',
      space: 'O(1).',
    },
    hints: [
      'In `is_arr_valid`, write `return 0 < len(names) <= max_length`.',
      'In `in_bounds`, write `return 0 <= r < rows and 0 <= c < cols`.',
    ],
    starterCode: `from typing import List


def is_arr_valid(names: List[str], max_length: int) -> bool:
    pass


def in_bounds(r: int, c: int, rows: int, cols: int) -> bool:
    pass


# do not modify below this line
print(is_arr_valid(["Alice", "Bob", "Charlie"], 3))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 2))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 0))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 1))
print(is_arr_valid([], 3))

print(in_bounds(0, 0, 3, 4))
print(in_bounds(2, 3, 3, 4))
print(in_bounds(3, 0, 3, 4))
print(in_bounds(-1, 2, 3, 4))
`,
    expectedOutput: `True
False
False
False
False
True
True
False
False`,
    solutionCode: `from typing import List


def is_arr_valid(names: List[str], max_length: int) -> bool:
    return 0 < len(names) <= max_length


def in_bounds(r: int, c: int, rows: int, cols: int) -> bool:
    return 0 <= r < rows and 0 <= c < cols


# do not modify below this line
print(is_arr_valid(["Alice", "Bob", "Charlie"], 3))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 2))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 0))
print(is_arr_valid(["Alice", "Bob", "Charlie"], 1))
print(is_arr_valid([], 3))

print(in_bounds(0, 0, 3, 4))
print(in_bounds(2, 3, 3, 4))
print(in_bounds(3, 0, 3, 4))
print(in_bounds(-1, 2, 3, 4))
`,
    solutionExplanation:
      'Chained inequalities like `0 < len(names) <= max_length` and `0 <= r < rows` read just like math notation and avoid repeated calls to `len(names)`.',
    testCases: [
      {
        name: 'is_arr_valid boundary cases',
        inputDisplay: 'is_arr_valid(["a"], 1), is_arr_valid([], 0), is_arr_valid(["a", "b"], 1)',
        expectedDisplay: '(True, False, False)',
        testCode: `
_actual = (is_arr_valid(["a"], 1), is_arr_valid([], 0), is_arr_valid(["a", "b"], 1))
_expected = (True, False, False)`,
      },
      {
        name: 'in_bounds valid and invalid coordinates',
        inputDisplay: 'in_bounds(1, 2, 3, 3), in_bounds(0, 3, 3, 3), in_bounds(0, -1, 3, 3)',
        expectedDisplay: '(True, False, False)',
        testCode: `
_actual = (in_bounds(1, 2, 3, 3), in_bounds(0, 3, 3, 3), in_bounds(0, -1, 3, 3))
_expected = (True, False, False)`,
      },
    ],
  },
  {
    id: 'min-max-shortcut',
    sectionId: 'pythonic-code',
    title: 'Min Max Shortcut',
    blocks: [
      {
        type: 'paragraph',
        text: 'In interviews, clamping values or updating running bests is everywhere (dynamic programming, sliding windows, greedy algorithms). Python’s built-in `min()` and `max()` replace multi-line `if/else` blocks cleanly.',
      },
      {
        type: 'code',
        code: `# Instead of:
# if balance < 0:
#     balance = 0
balance = max(0, balance)

# Clamp a value inside [low, high]:
clamped = max(low, min(high, value))`,
      },
      {
        type: 'paragraph',
        text: 'Similarly, updating a running maximum or minimum inside a loop becomes a single readable line:',
      },
      {
        type: 'code',
        code: `best = float("-inf")
for num in nums:
    best = max(best, num)`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `min()` and `max()` shortcuts:',
      functions: [
        {
          signature: 'disallow_negatives(num: int) -> int',
          description: 'Returns `num` if it is non-negative, otherwise returns `0`.',
        },
        {
          signature: 'max_difference(nums: List[int]) -> int',
          description: 'Given a list of at least 2 integers, returns the maximum difference `nums[i + 1] - nums[i]` between any pair of **adjacent** elements.',
        },
      ],
    },
    complexity: {
      time: 'O(1) for `disallow_negatives`; O(n) for `max_difference`.',
      space: 'O(1) extra space.',
    },
    hints: [
      'For `disallow_negatives`, `return max(0, num)`.',
      'For `max_difference`, initialize `best = nums[1] - nums[0]` (or `float("-inf")`) and loop over adjacent indices updating `best = max(best, nums[i + 1] - nums[i])`.',
    ],
    starterCode: `from typing import List


def disallow_negatives(num: int) -> int:
    pass


def max_difference(nums: List[int]) -> int:
    pass


# do not modify below this line
print(disallow_negatives(-2))
print(disallow_negatives(-1))
print(disallow_negatives(0))
print(disallow_negatives(1))
print(disallow_negatives(2))

print(max_difference([1, 2, 3, 4, 5, 6, 7, 8, 9]))
print(max_difference([1, 2, 3, 4, 5, 6, 8, 9]))
print(max_difference([10, 1, 3, 7]))
print(max_difference([2, 4, 7, 5, 7, 8, 4, 2]))
`,
    expectedOutput: `0
0
0
1
2
1
2
4
3`,
    solutionCode: `from typing import List


def disallow_negatives(num: int) -> int:
    return max(0, num)


def max_difference(nums: List[int]) -> int:
    res = nums[1] - nums[0]
    for i in range(len(nums) - 1):
        res = max(res, nums[i + 1] - nums[i])
    return res


# do not modify below this line
print(disallow_negatives(-2))
print(disallow_negatives(-1))
print(disallow_negatives(0))
print(disallow_negatives(1))
print(disallow_negatives(2))

print(max_difference([1, 2, 3, 4, 5, 6, 7, 8, 9]))
print(max_difference([1, 2, 3, 4, 5, 6, 8, 9]))
print(max_difference([10, 1, 3, 7]))
print(max_difference([2, 4, 7, 5, 7, 8, 4, 2]))
`,
    solutionExplanation:
      '`max(0, num)` clamps any negative integer up to `0`. In `max_difference`, initializing `res = nums[1] - nums[0]` ensures even strictly decreasing lists (where all differences are negative) return the correct maximum difference.',
    testCases: [
      {
        name: 'disallow_negatives',
        inputDisplay: 'disallow_negatives(-100), disallow_negatives(0), disallow_negatives(7)',
        expectedDisplay: '(0, 0, 7)',
        testCode: `
_actual = (disallow_negatives(-100), disallow_negatives(0), disallow_negatives(7))
_expected = (0, 0, 7)`,
      },
      {
        name: 'max_difference positive jump',
        inputDisplay: 'max_difference([5, 2, 9, 10])',
        expectedDisplay: '7',
        testCode: `
_actual = max_difference([5, 2, 9, 10])
_expected = 7`,
      },
      {
        name: 'max_difference strictly decreasing (all negative diffs)',
        inputDisplay: 'max_difference([10, 5, 3, -4])',
        expectedDisplay: '-2',
        testCode: `
_actual = max_difference([10, 5, 3, -4])
_expected = -2`,
      },
    ],
  },
];
