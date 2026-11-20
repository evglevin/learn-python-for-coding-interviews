import type { LessonData } from '../../types/course';

export const SECTION_3_LISTS: LessonData[] = [
  {
    id: 'resizable-list-part-1',
    sectionId: 'lists',
    title: 'Resizable List Part 1',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python lists are **dynamic arrays** under the hood. Knowing the time complexity of their mutation methods is essential for avoiding hidden `O(n²)` bottlenecks in coding interviews.',
      },
      {
        type: 'code',
        code: `arr = [1, 2, 3]

arr.append(4)     # O(1) amortized -> [1, 2, 3, 4]
arr.pop()         # O(1)           -> [1, 2, 3]
arr.insert(1, 99) # O(n)           -> [1, 99, 2, 3]`,
      },
      {
        type: 'list',
        items: [
          '`.append(x)` adds `x` to the end in **O(1)** amortized time.',
          '`.pop()` removes and returns the last element in **O(1)** time. Calling `.pop(i)` at an arbitrary index `i` is **O(n)** because subsequent elements must shift left.',
          '`.insert(i, x)` inserts `x` before index `i` in **O(n)** time because elements from `i` onward shift right.',
        ],
      },
    ],
    challenge: {
      intro: 'Implement the following list operations:',
      functions: [
        {
          signature: 'append_elements(arr1: List[int], arr2: List[int]) -> List[int]',
          description: 'Appends every element of `arr2` onto the end of `arr1` and returns `arr1`.',
        },
        {
          signature: 'pop_n(arr: List[int], n: int) -> List[int]',
          description: 'Removes the last `n` elements from `arr` and returns `arr`. If `n >= len(arr)`, returns an empty list `[]`.',
        },
        {
          signature: 'insert_at(arr: List[int], index: int, element: int) -> List[int]',
          description: 'Inserts `element` at `index` in `arr` and returns `arr`. If `index >= len(arr)`, appends `element` to the end.',
        },
      ],
    },
    complexity: {
      time: '`append_elements`: O(m) where m = len(arr2); `pop_n`: O(min(n, len(arr))); `insert_at`: O(len(arr)).',
      space: 'O(1) extra space (modifies input list in-place).',
    },
    hints: [
      'In `append_elements`, loop through `arr2` and call `arr1.append(x)` (or `arr1.extend(arr2)`).',
      'In `pop_n`, loop `while n > 0 and arr:` calling `arr.pop()` and decrementing `n`.',
      'Python’s `arr.insert(index, element)` already appends to the end when `index >= len(arr)`!',
    ],
    starterCode: `from typing import List


def append_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    pass


def pop_n(arr: List[int], n: int) -> List[int]:
    pass


def insert_at(arr: List[int], index: int, element: int) -> List[int]:
    pass


# do not modify below this line
print(append_elements([1, 2, 3], [4, 5, 6]))
print(append_elements([4, 3], [4, 5, 3]))

print(pop_n([1, 2, 3, 4, 5], 2))
print(pop_n([1, 2, 3, 4, 5], 6))
print(pop_n([1, 2, 3, 4, 5], 5))

print(insert_at([1, 2, 3, 4, 5], 2, 6))
print(insert_at([1, 2, 3, 4], 6, 5))
`,
    expectedOutput: `[1, 2, 3, 4, 5, 6]
[4, 3, 4, 5, 3]
[1, 2, 3]
[]
[]
[1, 2, 6, 3, 4, 5]
[1, 2, 3, 4, 5]`,
    solutionCode: `from typing import List


def append_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    for num in arr2:
        arr1.append(num)
    return arr1


def pop_n(arr: List[int], n: int) -> List[int]:
    while n > 0 and len(arr) > 0:
        arr.pop()
        n -= 1
    return arr


def insert_at(arr: List[int], index: int, element: int) -> List[int]:
    if index >= len(arr):
        arr.append(element)
    else:
        arr.insert(index, element)
    return arr


# do not modify below this line
print(append_elements([1, 2, 3], [4, 5, 6]))
print(append_elements([4, 3], [4, 5, 3]))

print(pop_n([1, 2, 3, 4, 5], 2))
print(pop_n([1, 2, 3, 4, 5], 6))
print(pop_n([1, 2, 3, 4, 5], 5))

print(insert_at([1, 2, 3, 4, 5], 2, 6))
print(insert_at([1, 2, 3, 4], 6, 5))
`,
    solutionExplanation:
      'Using `.append()` and `.pop()` at the tail of a list runs in O(1) amortized time. Checking `len(arr) > 0` prevents an `IndexError` when `n` exceeds the list length.',
    testCases: [
      {
        name: 'append_elements basic and empty',
        inputDisplay: 'append_elements([1], [2, 3]), append_elements([], [9])',
        expectedDisplay: '([1, 2, 3], [9])',
        testCode: `
_actual = (append_elements([1], [2, 3]), append_elements([], [9]))
_expected = ([1, 2, 3], [9])`,
      },
      {
        name: 'pop_n partial, exact, and overflow',
        inputDisplay: 'pop_n([1, 2, 3], 1), pop_n([1, 2], 5), pop_n([1, 2], 0)',
        expectedDisplay: '([1, 2], [], [1, 2])',
        testCode: `
_actual = (pop_n([1, 2, 3], 1), pop_n([1, 2], 5), pop_n([1, 2], 0))
_expected = ([1, 2], [], [1, 2])`,
      },
      {
        name: 'insert_at start, middle, and past end',
        inputDisplay: 'insert_at([2, 3], 0, 1), insert_at([1, 3], 1, 2), insert_at([1, 2], 10, 3)',
        expectedDisplay: '([1, 2, 3], [1, 2, 3], [1, 2, 3])',
        testCode: `
_actual = (insert_at([2, 3], 0, 1), insert_at([1, 3], 1, 2), insert_at([1, 2], 10, 3))
_expected = ([1, 2, 3], [1, 2, 3], [1, 2, 3])`,
      },
    ],
  },
  {
    id: 'resizable-list-part-2',
    sectionId: 'lists',
    title: 'Resizable List Part 2',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python lists also provide several handy built-in methods for searching, extending, and removing values — all of which scan linearly in **O(n)** time.',
      },
      {
        type: 'code',
        code: `nums = [1, 2, 3, 2, 4]

nums.index(2)     # 1 (index of FIRST occurrence; raises ValueError if missing)
nums.remove(2)    # removes FIRST occurrence -> [1, 3, 2, 4]
nums.extend([5, 6])  # appends all items from iterable -> [1, 3, 2, 4, 5, 6]`,
      },
      {
        type: 'note',
        title: 'Watch out for O(n) inside loops',
        text: 'Calling `x in my_list`, `my_list.index(x)`, or `my_list.remove(x)` inside a loop makes your solution **O(n²)**. When you need fast membership checks or deletions, reach for a `set` or `dict` instead.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions:',
      functions: [
        {
          signature: 'append_elements(arr1: List[int], arr2: List[int]) -> List[int]',
          description: 'Extends `arr1` in-place with all elements from `arr2` and returns `arr1`.',
        },
        {
          signature: 'remove_elements(arr1: List[int], arr2: List[int]) -> List[int]',
          description: 'For each value in `arr2`, removes its **first** occurrence from `arr1` if it exists in `arr1`. Returns `arr1`.',
        },
      ],
    },
    complexity: {
      time: '`append_elements`: O(m); `remove_elements`: O(n * m) using list `.remove()`.',
      space: 'O(1) extra space.',
    },
    hints: [
      'Use `arr1.extend(arr2)` for `append_elements`.',
      'In `remove_elements`, guard `arr1.remove(x)` with `if x in arr1:` so missing values do not raise a `ValueError`.',
    ],
    starterCode: `from typing import List


def append_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    pass


def remove_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    pass


# do not modify below this line
print(append_elements([1, 2, 3], [4, 5, 6]))
print(append_elements([4, 3], [4, 5, 3]))

print(remove_elements([1, 2, 3, 4, 5], [2, 4, 6]))
print(remove_elements([1, 2, 3, 4, 5], [2, 3, 4, 5, 5]))
print(remove_elements([1, 7, 2, 3, 4, 5], [6, 7, 8, 2]))
`,
    expectedOutput: `[1, 2, 3, 4, 5, 6]
[4, 3, 4, 5, 3]
[1, 3, 5]
[1]
[1, 3, 4, 5]`,
    solutionCode: `from typing import List


def append_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    arr1.extend(arr2)
    return arr1


def remove_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    for num in arr2:
        if num in arr1:
            arr1.remove(num)
    return arr1


# do not modify below this line
print(append_elements([1, 2, 3], [4, 5, 6]))
print(append_elements([4, 3], [4, 5, 3]))

print(remove_elements([1, 2, 3, 4, 5], [2, 4, 6]))
print(remove_elements([1, 2, 3, 4, 5], [2, 3, 4, 5, 5]))
print(remove_elements([1, 7, 2, 3, 4, 5], [6, 7, 8, 2]))
`,
    solutionExplanation:
      '`.extend()` appends an entire iterable in-place in C speed. Checking `if num in arr1:` before `arr1.remove(num)` safely ignores missing values and removes only one copy per occurrence in `arr2`.',
    testCases: [
      {
        name: 'append_elements extends in-place',
        inputDisplay: 'append_elements([1, 2], [3, 4])',
        expectedDisplay: '[1, 2, 3, 4]',
        testCode: `
a = [1, 2]
res = append_elements(a, [3, 4])
_actual = res
_expected = [1, 2, 3, 4]`,
      },
      {
        name: 'remove_elements handles duplicates and missing elements',
        inputDisplay: 'remove_elements([1, 2, 2, 3], [2, 99])',
        expectedDisplay: '[1, 2, 3]',
        testCode: `
_actual = remove_elements([1, 2, 2, 3], [2, 99])
_expected = [1, 2, 3]`,
      },
      {
        name: 'remove_elements removes duplicate twice when present twice in arr2',
        inputDisplay: 'remove_elements([2, 2, 3], [2, 2, 2])',
        expectedDisplay: '[3]',
        testCode: `
_actual = remove_elements([2, 2, 3], [2, 2, 2])
_expected = [3]`,
      },
    ],
  },
  {
    id: 'list-concat',
    sectionId: 'lists',
    title: 'List Concat',
    blocks: [
      {
        type: 'paragraph',
        text: 'You can concatenate two lists into a **brand-new list** using the `+` operator — without modifying either original list.',
      },
      {
        type: 'code',
        code: `arr1 = [1, 2, 3]
arr2 = [4, 5, 6]

combined = arr1 + arr2
print(combined)  # [1, 2, 3, 4, 5, 6]
print(arr1)      # [1, 2, 3] (unchanged)
print(arr2)      # [4, 5, 6] (unchanged)`,
      },
      {
        type: 'note',
        title: '+ vs .extend() vs +=',
        text: '`arr1 + arr2` allocates a new list of size `len(arr1) + len(arr2)` (O(n + m) time & space). By contrast, `arr1.extend(arr2)` (or `arr1 += arr2`) mutates `arr1` in-place in O(m) time. Never do `res = res + [x]` inside a loop — that is O(n²)!',
      },
    ],
    challenge: {
      intro: 'Implement the following function **without modifying `arr1` or `arr2`**:',
      functions: [
        {
          signature: 'combine_elements(arr1: List[int], arr2: List[int]) -> List[int]',
          description: 'Returns a new list containing all elements of `arr1` followed by all elements of `arr2`, leaving both input lists untouched.',
        },
      ],
    },
    complexity: {
      time: 'O(n + m), where n = len(arr1) and m = len(arr2).',
      space: 'O(n + m) for the newly created list.',
    },
    hints: [
      'Simply `return arr1 + arr2` (or `return [*arr1, *arr2]`).',
      'Do not use `arr1.extend(arr2)` because that mutates `arr1`!',
    ],
    starterCode: `from typing import List


def combine_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    pass


# do not modify below this line
arr1 = [1, 3, 5]
arr2 = [4, 6, 8]

print(combine_elements(arr1, arr2))
print(arr1)
print(arr2)
`,
    expectedOutput: `[1, 3, 5, 4, 6, 8]
[1, 3, 5]
[4, 6, 8]`,
    solutionCode: `from typing import List


def combine_elements(arr1: List[int], arr2: List[int]) -> List[int]:
    return arr1 + arr2


# do not modify below this line
arr1 = [1, 3, 5]
arr2 = [4, 6, 8]

print(combine_elements(arr1, arr2))
print(arr1)
print(arr2)
`,
    solutionExplanation:
      'The `+` operator creates and returns a new list containing the elements of `arr1` followed by `arr2`, keeping both originals intact.',
    testCases: [
      {
        name: 'combines lists without mutating inputs',
        inputDisplay: 'a = [1, 2]; b = [3, 4]; combine_elements(a, b)',
        expectedDisplay: '[1, 2, 3, 4] with a, b unchanged',
        testCode: `
a = [1, 2]
b = [3, 4]
res = combine_elements(a, b)
_actual = (res, a, b)
_expected = ([1, 2, 3, 4], [1, 2], [3, 4])
if a != [1, 2] or b != [3, 4]:
    _passed = False
    _message = 'Input lists must not be mutated!'`,
      },
      {
        name: 'empty list concatenation',
        inputDisplay: 'combine_elements([], [5, 6])',
        expectedDisplay: '[5, 6]',
        testCode: `
_actual = combine_elements([], [5, 6])
_expected = [5, 6]`,
      },
    ],
  },
  {
    id: 'list-initialization',
    sectionId: 'lists',
    title: 'List Initialization',
    blocks: [
      {
        type: 'paragraph',
        text: 'Dynamic programming tables, frequency buckets, and visited arrays constantly require pre-allocating a list of size `n` filled with a default value. Python makes this a one-liner with list repetition (`*`):',
      },
      {
        type: 'code',
        code: `dp = [0] * 5
print(dp)  # [0, 0, 0, 0, 0]

visited = [False] * 4
print(visited)  # [False, False, False, False]`,
      },
      {
        type: 'note',
        title: 'Only use * with immutable values!',
        text: '`[0] * n` is completely safe for ints, floats, strings, booleans, and `None`. Never use `[[]] * n` for lists of lists — every slot would alias the *same* inner list! (We will cover the right way in Section 5.)',
      },
    ],
    challenge: {
      intro: 'Implement the following function:',
      functions: [
        {
          signature: 'create_list_with_value(size: int, index: int, value: int) -> List[int]',
          description: 'Creates a list of length `size` initialized to all `0`s, sets the element at `index` to `value`, and returns the list.',
        },
      ],
    },
    complexity: {
      time: 'O(size).',
      space: 'O(size).',
    },
    hints: [
      'Allocate the zero-filled list using `arr = [0] * size`.',
      'Then update `arr[index] = value` and return `arr`.',
    ],
    starterCode: `from typing import List


def create_list_with_value(size: int, index: int, value: int) -> List[int]:
    pass


# do not modify below this line
print(create_list_with_value(5, 3, 7))
print(create_list_with_value(1, 0, 5))
print(create_list_with_value(10, 9, 9))
print(create_list_with_value(10, 9, 0))
`,
    expectedOutput: `[0, 0, 0, 7, 0]
[5]
[0, 0, 0, 0, 0, 0, 0, 0, 0, 9]
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]`,
    solutionCode: `from typing import List


def create_list_with_value(size: int, index: int, value: int) -> List[int]:
    arr = [0] * size
    arr[index] = value
    return arr


# do not modify below this line
print(create_list_with_value(5, 3, 7))
print(create_list_with_value(1, 0, 5))
print(create_list_with_value(10, 9, 9))
print(create_list_with_value(10, 9, 0))
`,
    solutionExplanation:
      '`[0] * size` pre-allocates a list of `size` zeros in a single fast C operation, and `arr[index] = value` sets the target slot in O(1) time.',
    testCases: [
      {
        name: 'middle index update',
        inputDisplay: 'create_list_with_value(5, 2, 42)',
        expectedDisplay: '[0, 0, 42, 0, 0]',
        testCode: `
_actual = create_list_with_value(5, 2, 42)
_expected = [0, 0, 42, 0, 0]`,
      },
      {
        name: 'single element list',
        inputDisplay: 'create_list_with_value(1, 0, -3)',
        expectedDisplay: '[-3]',
        testCode: `
_actual = create_list_with_value(1, 0, -3)
_expected = [-3]`,
      },
      {
        name: 'last index update',
        inputDisplay: 'create_list_with_value(4, 3, 9)',
        expectedDisplay: '[0, 0, 0, 9]',
        testCode: `
_actual = create_list_with_value(4, 3, 9)
_expected = [0, 0, 0, 9]`,
      },
    ],
  },
  {
    id: 'list-clone',
    sectionId: 'lists',
    title: 'List Clone',
    blocks: [
      {
        type: 'paragraph',
        text: 'In Python, writing `b = a` does **not** copy a list — it creates a second reference pointing to the exact same list object. Mutating `b` will silently mutate `a`, a classic bug in backtracking (`res.append(path)` instead of `res.append(path.copy())`)!',
      },
      {
        type: 'code',
        code: `original = [1, 2, 3]

# Four ways to make a shallow copy:
c1 = original.copy()
c2 = original[:]
c3 = list(original)

c1.append(4)
print(original)  # [1, 2, 3] (safe!)
print(c1)        # [1, 2, 3, 4]`,
      },
      {
        type: 'paragraph',
        text: 'For **nested lists** (like a 2D matrix), a shallow copy still shares references to the inner rows. Use `copy.deepcopy()` (or a nested comprehension) when you need an independent copy of nested mutable structures.',
      },
      {
        type: 'code',
        code: `import copy

grid = [[1, 2], [3, 4]]
deep = copy.deepcopy(grid)
deep[0][0] = 99
print(grid[0][0])  # 1 (untouched!)`,
      },
    ],
    challenge: {
      intro: 'Implement the following function **without modifying the original `arr`**:',
      functions: [
        {
          signature: 'remove_element(arr: List[int], element: int) -> List[int]',
          description: 'Returns a **new list** with the first occurrence of `element` removed (if present), leaving the original `arr` completely unmodified.',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n = len(arr).',
      space: 'O(n) for the cloned list.',
    },
    hints: [
      'First clone the list with `new_arr = arr.copy()` (or `arr[:]`).',
      'Then check `if element in new_arr: new_arr.remove(element)` and return `new_arr`.',
    ],
    starterCode: `from typing import List


def remove_element(arr: List[int], element: int) -> List[int]:
    pass


# do not modify below this line
arr = [1, 3, 5, 7, 9]

print(remove_element(arr, 3))
print(arr)
print(remove_element(arr, 9))
print(arr)
print(remove_element(arr, 1))
print(arr)
`,
    expectedOutput: `[1, 5, 7, 9]
[1, 3, 5, 7, 9]
[1, 3, 5, 7]
[1, 3, 5, 7, 9]
[3, 5, 7, 9]
[1, 3, 5, 7, 9]`,
    solutionCode: `from typing import List


def remove_element(arr: List[int], element: int) -> List[int]:
    new_arr = arr.copy()
    if element in new_arr:
        new_arr.remove(element)
    return new_arr


# do not modify below this line
arr = [1, 3, 5, 7, 9]

print(remove_element(arr, 3))
print(arr)
print(remove_element(arr, 9))
print(arr)
print(remove_element(arr, 1))
print(arr)
`,
    solutionExplanation:
      'Cloning via `arr.copy()` creates an independent list so calling `.remove(element)` never alters the caller’s original array.',
    testCases: [
      {
        name: 'removes element without mutating original',
        inputDisplay: 'a = [10, 20, 30]; remove_element(a, 20)',
        expectedDisplay: '[10, 30] and a remains [10, 20, 30]',
        testCode: `
a = [10, 20, 30]
res = remove_element(a, 20)
_actual = (res, a)
_expected = ([10, 30], [10, 20, 30])
if a != [10, 20, 30]:
    _passed = False
    _message = 'Original list was mutated! Clone it first.'`,
      },
      {
        name: 'element missing still returns a fresh copy',
        inputDisplay: 'a = [1, 2]; res = remove_element(a, 99)',
        expectedDisplay: '[1, 2] and res is not a',
        testCode: `
a = [1, 2]
res = remove_element(a, 99)
_actual = res
_expected = [1, 2]
_passed = (res == [1, 2] and res is not a)
if not _passed:
    _message = 'Expected a cloned list even when element is absent.'`,
      },
    ],
  },
  {
    id: 'list-comprehension',
    sectionId: 'lists',
    title: 'List Comprehension',
    blocks: [
      {
        type: 'paragraph',
        text: '**List comprehensions** are one of Python’s superpowers — letting you transform and filter sequences in a single concise, fast expression.',
      },
      {
        type: 'code',
        code: `nums = [1, 2, 3, 4, 5]

# Transform every item
squares = [x * x for x in nums]           # [1, 4, 9, 16, 25]

# Filter with an if-clause
evens = [x for x in nums if x % 2 == 0]   # [2, 4]

# Transform with a conditional expression
labels = ["even" if x % 2 == 0 else "odd" for x in nums]`,
      },
      {
        type: 'paragraph',
        text: 'General syntax: `[expression for item in iterable if condition]`. Comprehensions run faster than an equivalent `for` + `.append()` loop because the loop executes inside CPython’s bytecode engine.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using list comprehensions:',
      functions: [
        {
          signature: 'create_list_of_odds(n: int) -> List[int]',
          description: 'Returns a list of all odd integers from `1` up to and including `n` in ascending order.',
        },
        {
          signature: 'filter_and_square_evens(nums: List[int]) -> List[int]',
          description: 'Returns a list containing the squares (`x * x`) of all even integers in `nums`, preserving their order.',
        },
      ],
    },
    complexity: {
      time: 'O(n).',
      space: 'O(n) for the output list.',
    },
    hints: [
      'For `create_list_of_odds(n)`, iterate over `range(1, n + 1)` with `if i % 2 == 1` (or step by 2: `[i for i in range(1, n + 1, 2)]`).',
      'For `filter_and_square_evens(nums)`, write `[x * x for x in nums if x % 2 == 0]`.',
    ],
    starterCode: `from typing import List


def create_list_of_odds(n: int) -> List[int]:
    pass


def filter_and_square_evens(nums: List[int]) -> List[int]:
    pass


# do not modify below this line
print(create_list_of_odds(1))
print(create_list_of_odds(5))
print(create_list_of_odds(6))
print(create_list_of_odds(10))

print(filter_and_square_evens([1, 2, 3, 4, 5, 6]))
print(filter_and_square_evens([-4, -3, 0, 2, 5]))
`,
    expectedOutput: `[1]
[1, 3, 5]
[1, 3, 5]
[1, 3, 5, 7, 9]
[4, 16, 36]
[16, 0, 4]`,
    solutionCode: `from typing import List


def create_list_of_odds(n: int) -> List[int]:
    return [i for i in range(1, n + 1) if i % 2 == 1]


def filter_and_square_evens(nums: List[int]) -> List[int]:
    return [x * x for x in nums if x % 2 == 0]


# do not modify below this line
print(create_list_of_odds(1))
print(create_list_of_odds(5))
print(create_list_of_odds(6))
print(create_list_of_odds(10))

print(filter_and_square_evens([1, 2, 3, 4, 5, 6]))
print(filter_and_square_evens([-4, -3, 0, 2, 5]))
`,
    solutionExplanation:
      'Both functions combine iteration, filtering (`if ...`), and expression mapping cleanly inside a single list comprehension.',
    testCases: [
      {
        name: 'create_list_of_odds various n',
        inputDisplay: 'create_list_of_odds(0), create_list_of_odds(7)',
        expectedDisplay: '([], [1, 3, 5, 7])',
        testCode: `
_actual = (create_list_of_odds(0), create_list_of_odds(7))
_expected = ([], [1, 3, 5, 7])`,
      },
      {
        name: 'filter_and_square_evens with negatives and zero',
        inputDisplay: 'filter_and_square_evens([-2, 1, 0, 3, 4])',
        expectedDisplay: '[4, 0, 16]',
        testCode: `
_actual = filter_and_square_evens([-2, 1, 0, 3, 4])
_expected = [4, 0, 16]`,
      },
      {
        name: 'filter_and_square_evens all odd',
        inputDisplay: 'filter_and_square_evens([1, 3, 5])',
        expectedDisplay: '[]',
        testCode: `
_actual = filter_and_square_evens([1, 3, 5])
_expected = []`,
      },
    ],
  },
];
