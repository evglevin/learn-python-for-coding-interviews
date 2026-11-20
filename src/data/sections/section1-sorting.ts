import type { LessonData } from '../../types/course';

export const SECTION_1_SORTING: LessonData[] = [
  {
    id: 'sort-ascending',
    sectionId: 'sorting',
    title: 'Sort Ascending',
    blocks: [
      {
        type: 'paragraph',
        text: 'In Python, you can sort a list in-place by calling the `.sort()` method directly on the list.',
      },
      {
        type: 'code',
        code: `elements = [5, 3, 6, 2, 1]

elements.sort()

print(elements)  # [1, 2, 3, 5, 6]`,
      },
      {
        type: 'paragraph',
        text: 'By default, `.sort()` arranges elements in *ascending order in-place* and returns `None`. Because it mutates the original list and returns `None`, a common interview mistake is writing `return elements.sort()` — make sure to sort first and then return the list.',
      },
      {
        type: 'paragraph',
        text: 'The `.sort()` method works on any comparable data types, including strings (sorted lexicographically by Unicode code point — e.g. `"Zebra"` comes before `"apple"`, because ASCII uppercase letters precede lowercase ones) and floats.',
      },
      {
        type: 'code',
        code: `fruits = ["grape", "apple", "banana", "orange"]

fruits.sort()

print(fruits)  # ['apple', 'banana', 'grape', 'orange']`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions:',
      functions: [
        {
          signature: 'sort_words(words: List[str]) -> List[str]',
          description: 'Accepts a list of words and returns the list sorted in ascending lexicographical order.',
        },
        {
          signature: 'sort_numbers(numbers: List[int]) -> List[int]',
          description: 'Accepts a list of integers and returns the list sorted in ascending numerical order.',
        },
        {
          signature: 'sort_decimals(numbers: List[float]) -> List[float]',
          description: 'Accepts a list of floating-point numbers and returns the list sorted in ascending order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n), where n is the number of elements in the list.',
      space: 'O(n), because Timsort allocates temporary buffers proportional to n.',
      note: 'Python uses Timsort — a hybrid sorting algorithm derived from merge sort and insertion sort that is stable and excels on partially sorted data.',
    },
    hints: [
      'Remember that `list.sort()` modifies the list in-place and returns `None`.',
      'Call `words.sort()` on one line, then `return words` on the next line.',
      'Interview tip: Always clarify whether you are allowed to mutate the input list in-place before using `.sort()`.',
    ],
    starterCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    pass


def sort_numbers(numbers: List[int]) -> List[int]:
    pass


def sort_decimals(numbers: List[float]) -> List[float]:
    pass


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6]))

print(sort_decimals([3.14, 2.82, 6.433, 7.9, 21.555, 21.554]))
`,
    expectedOutput: `['apple', 'banana', 'blueberry', 'cherry', 'kiwi', 'pear', 'watermelon', 'zucchini']
[1, 2, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 9, 11, 19]
[2.82, 3.14, 6.433, 7.9, 21.554, 21.555]`,
    solutionCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    words.sort()
    return words


def sort_numbers(numbers: List[int]) -> List[int]:
    numbers.sort()
    return numbers


def sort_decimals(numbers: List[float]) -> List[float]:
    numbers.sort()
    return numbers


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6]))

print(sort_decimals([3.14, 2.82, 6.433, 7.9, 21.555, 21.554]))
`,
    solutionExplanation:
      'Each function invokes `.sort()` in-place on the input list and then explicitly returns that list. Because `.sort()` defaults to ascending order, it handles strings, integers, and floats cleanly.',
    testCases: [
      {
        name: 'sort_words basic',
        inputDisplay: 'sort_words(["cherry", "apple", "blueberry", "banana"])',
        expectedDisplay: "['apple', 'banana', 'blueberry', 'cherry']",
        testCode: `
_actual = sort_words(["cherry", "apple", "blueberry", "banana"])
_expected = ['apple', 'banana', 'blueberry', 'cherry']`,
      },
      {
        name: 'sort_numbers with duplicates and negatives',
        inputDisplay: 'sort_numbers([5, -2, 3, -2, 0, 11])',
        expectedDisplay: '[-2, -2, 0, 3, 5, 11]',
        testCode: `
_actual = sort_numbers([5, -2, 3, -2, 0, 11])
_expected = [-2, -2, 0, 3, 5, 11]`,
      },
      {
        name: 'sort_decimals precision',
        inputDisplay: 'sort_decimals([3.14, 2.82, 21.555, 21.554, -0.5])',
        expectedDisplay: '[-0.5, 2.82, 3.14, 21.554, 21.555]',
        testCode: `
_actual = sort_decimals([3.14, 2.82, 21.555, 21.554, -0.5])
_expected = [-0.5, 2.82, 3.14, 21.554, 21.555]`,
      },
      {
        name: 'empty and single-element lists',
        inputDisplay: 'sort_words([]), sort_numbers([42])',
        expectedDisplay: '([], [42])',
        testCode: `
_actual = (sort_words([]), sort_numbers([42]))
_expected = ([], [42])`,
      },
    ],
  },
  {
    id: 'sort-descending',
    sectionId: 'sorting',
    title: 'Sort Descending',
    blocks: [
      {
        type: 'paragraph',
        text: 'To sort a list in **descending** order, pass the keyword argument `reverse=True` to `.sort()`.',
      },
      {
        type: 'code',
        code: `elements = [5, 3, 6, 2, 1]

elements.sort(reverse=True)

print(elements)  # [6, 5, 3, 2, 1]`,
      },
      {
        type: 'paragraph',
        text: 'By default, `reverse` is `False`. Setting `reverse=True` works identically for strings (reverse lexicographical order), integers, and floats without needing a separate `.reverse()` call.',
      },
      {
        type: 'note',
        title: 'Stability with reverse=True',
        text: 'Python’s `sort(reverse=True)` is still **stable**: equal elements keep their original relative order rather than getting reversed.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `reverse=True`:',
      functions: [
        {
          signature: 'sort_words(words: List[str]) -> List[str]',
          description: 'Returns the list of words sorted in descending lexicographical order.',
        },
        {
          signature: 'sort_numbers(numbers: List[int]) -> List[int]',
          description: 'Returns the list of integers sorted from largest to smallest.',
        },
        {
          signature: 'sort_decimals(numbers: List[float]) -> List[float]',
          description: 'Returns the list of decimals sorted from largest to smallest.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n), where n is the number of elements in the list.',
      space: 'O(n) auxiliary space used by Timsort.',
    },
    hints: [
      'Pass `reverse=True` as a keyword argument: `numbers.sort(reverse=True)`.',
      'Don’t forget to return the list after calling `.sort(reverse=True)`.',
    ],
    starterCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    pass


def sort_numbers(numbers: List[int]) -> List[int]:
    pass


def sort_decimals(numbers: List[float]) -> List[float]:
    pass


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6]))

print(sort_decimals([3.14, 2.82, 6.433, 7.9, 21.555, 21.554]))
`,
    expectedOutput: `['zucchini', 'watermelon', 'pear', 'kiwi', 'cherry', 'blueberry', 'banana', 'apple']
[19, 11, 9, 7, 6, 6, 5, 5, 4, 4, 3, 2, 2, 2, 1]
[21.555, 21.554, 7.9, 6.433, 3.14, 2.82]`,
    solutionCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    words.sort(reverse=True)
    return words


def sort_numbers(numbers: List[int]) -> List[int]:
    numbers.sort(reverse=True)
    return numbers


def sort_decimals(numbers: List[float]) -> List[float]:
    numbers.sort(reverse=True)
    return numbers


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6]))

print(sort_decimals([3.14, 2.82, 6.433, 7.9, 21.555, 21.554]))
`,
    solutionExplanation:
      'Passing `reverse=True` to `.sort()` sorts the list in-place in descending order. We then return the sorted list.',
    testCases: [
      {
        name: 'sort_words descending',
        inputDisplay: 'sort_words(["apple", "zucchini", "mango"])',
        expectedDisplay: "['zucchini', 'mango', 'apple']",
        testCode: `
_actual = sort_words(["apple", "zucchini", "mango"])
_expected = ['zucchini', 'mango', 'apple']`,
      },
      {
        name: 'sort_numbers descending with negatives',
        inputDisplay: 'sort_numbers([-10, 4, 0, 4, -2])',
        expectedDisplay: '[4, 4, 0, -2, -10]',
        testCode: `
_actual = sort_numbers([-10, 4, 0, 4, -2])
_expected = [4, 4, 0, -2, -10]`,
      },
      {
        name: 'sort_decimals descending',
        inputDisplay: 'sort_decimals([1.01, 1.1, 1.001])',
        expectedDisplay: '[1.1, 1.01, 1.001]',
        testCode: `
_actual = sort_decimals([1.01, 1.1, 1.001])
_expected = [1.1, 1.01, 1.001]`,
      },
      {
        name: 'empty list edge case',
        inputDisplay: 'sort_numbers([])',
        expectedDisplay: '[]',
        testCode: `
_actual = sort_numbers([])
_expected = []`,
      },
    ],
  },
  {
    id: 'sort-custom',
    sectionId: 'sorting',
    title: 'Sort Custom',
    blocks: [
      {
        type: 'paragraph',
        text: 'Often in coding interviews you need to sort by a derived property — like word length, absolute value, or an interval’s start time. Python lets you pass a `key` function to `.sort()`.',
      },
      {
        type: 'code',
        code: `def get_word_length(word: str) -> int:
    return len(word)

words = ["apple", "banana", "kiwi", "pear", "watermelon"]

words.sort(key=get_word_length)

print(words)  # ['kiwi', 'pear', 'apple', 'banana', 'watermelon']`,
      },
      {
        type: 'paragraph',
        text: 'Python calls the `key` function **once per element** (the *decorate-sort-undecorate* pattern) and compares the returned keys instead of the elements themselves. You can combine `key` with `reverse=True`.',
      },
      {
        type: 'paragraph',
        text: 'You can even pass built-in functions directly as keys — such as `key=len` or `key=abs` — without wrapping them in a helper function!',
      },
      {
        type: 'code',
        code: `nums = [-10, 3, -2, 7]
nums.sort(key=abs)
print(nums)  # [-2, 3, 7, -10]`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using a custom `key` function:',
      functions: [
        {
          signature: 'sort_words(words: List[str]) -> List[str]',
          description: 'Returns the list of words sorted by **length in descending order**. Ties should preserve their original order.',
        },
        {
          signature: 'sort_numbers(numbers: List[int]) -> List[int]',
          description: 'Returns the list of integers sorted by their **absolute value in ascending order**. Ties should preserve their original order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n) comparisons plus n calls to the key function (O(n) if the key is O(1)).',
      space: 'O(n) to store keys and Timsort buffers.',
    },
    hints: [
      'For `sort_words`, you can define a helper `get_length(word)` returning `len(word)` — or pass `len` directly — along with `reverse=True`.',
      'For `sort_numbers`, pass `key=abs` (or a helper returning `abs(n)`) with default ascending order.',
      'Because Timsort is stable, equal keys automatically keep their original relative order!',
    ],
    starterCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    pass


def sort_numbers(numbers: List[int]) -> List[int]:
    pass


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]))
`,
    expectedOutput: `['watermelon', 'blueberry', 'zucchini', 'cherry', 'banana', 'apple', 'kiwi', 'pear']
[1, 2, -2, 2, -3, 4, -4, -5, 5, -6, 6, 7, 9, 11, -19]`,
    solutionCode: `from typing import List


def get_word_length(word: str) -> int:
    return len(word)


def get_abs_value(num: int) -> int:
    return abs(num)


def sort_words(words: List[str]) -> List[str]:
    words.sort(key=get_word_length, reverse=True)
    return words


def sort_numbers(numbers: List[int]) -> List[int]:
    numbers.sort(key=get_abs_value)
    return numbers


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]))
`,
    solutionExplanation:
      'Passing `key=get_word_length` (or `key=len`) with `reverse=True` sorts longest words first while keeping ties in their original relative order. Passing `key=get_abs_value` (or `key=abs`) sorts by magnitude ascending.',
    testCases: [
      {
        name: 'sort_words by length descending with ties',
        inputDisplay: 'sort_words(["fig", "pear", "kiwi", "apple", "plum"])',
        expectedDisplay: "['apple', 'pear', 'kiwi', 'plum', 'fig']",
        testCode: `
_actual = sort_words(["fig", "pear", "kiwi", "apple", "plum"])
_expected = ['apple', 'pear', 'kiwi', 'plum', 'fig']`,
      },
      {
        name: 'sort_numbers by absolute value preserving ties',
        inputDisplay: 'sort_numbers([-3, 3, -1, 1, 0, -2])',
        expectedDisplay: '[0, -1, 1, -2, -3, 3]',
        testCode: `
_actual = sort_numbers([-3, 3, -1, 1, 0, -2])
_expected = [0, -1, 1, -2, -3, 3]`,
      },
      {
        name: 'single and empty lists',
        inputDisplay: 'sort_words([]), sort_numbers([-7])',
        expectedDisplay: '([], [-7])',
        testCode: `
_actual = (sort_words([]), sort_numbers([-7]))
_expected = ([], [-7])`,
      },
    ],
  },
  {
    id: 'sort-lambda',
    sectionId: 'sorting',
    title: 'Sort Lambda',
    blocks: [
      {
        type: 'paragraph',
        text: 'Defining a separate `def` helper for a one-line sorting key can feel verbose during a timed interview. Python provides **lambda functions** — anonymous single-expression functions written inline.',
      },
      {
        type: 'code',
        code: `words = ["apple", "banana", "kiwi", "pear", "watermelon"]

words.sort(key=lambda word: len(word))

print(words)  # ['kiwi', 'pear', 'apple', 'banana', 'watermelon']`,
      },
      {
        type: 'paragraph',
        text: 'A lambda has the syntax `lambda arguments: expression`. Lambdas shine when sorting **tuples or multi-field items**, where you can even return a tuple as the sort key to specify tie-breakers!',
      },
      {
        type: 'code',
        code: `# Sort intervals by start ascending, then end descending
intervals = [(1, 3), (1, 5), (2, 4)]
intervals.sort(key=lambda x: (x[0], -x[1]))
print(intervals)  # [(1, 5), (1, 3), (2, 4)]`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `lambda` key functions:',
      functions: [
        {
          signature: 'sort_words(words: List[str]) -> List[str]',
          description: 'Returns the list of words sorted by **length descending** (preserving original order on ties).',
        },
        {
          signature: 'sort_numbers(numbers: List[int]) -> List[int]',
          description: 'Returns the list of numbers sorted by **absolute value ascending** (preserving original order on ties).',
        },
        {
          signature: 'sort_intervals(intervals: List[List[int]]) -> List[List[int]]',
          description: 'Sorts `[start, end]` intervals by `start` ascending, and breaks ties by `end` descending.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n), where n is the number of elements.',
      space: 'O(n) for sorting keys and Timsort buffers.',
    },
    hints: [
      'For `sort_words`: `words.sort(key=lambda w: len(w), reverse=True)`.',
      'For `sort_numbers`: `numbers.sort(key=lambda n: abs(n))`.',
      'For `sort_intervals`: return a 2-tuple `(interval[0], -interval[1])` from the lambda so Python sorts ascending by `start` and descending by `end`!',
    ],
    starterCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    pass


def sort_numbers(numbers: List[int]) -> List[int]:
    pass


def sort_intervals(intervals: List[List[int]]) -> List[List[int]]:
    pass


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]))

print(sort_intervals([[1, 4], [2, 5], [1, 8], [2, 3], [0, 2]]))
`,
    expectedOutput: `['watermelon', 'blueberry', 'zucchini', 'cherry', 'banana', 'apple', 'kiwi', 'pear']
[1, 2, -2, 2, -3, 4, -4, -5, 5, -6, 6, 7, 9, 11, -19]
[[0, 2], [1, 8], [1, 4], [2, 5], [2, 3]]`,
    solutionCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    words.sort(key=lambda word: len(word), reverse=True)
    return words


def sort_numbers(numbers: List[int]) -> List[int]:
    numbers.sort(key=lambda num: abs(num))
    return numbers


def sort_intervals(intervals: List[List[int]]) -> List[List[int]]:
    intervals.sort(key=lambda interval: (interval[0], -interval[1]))
    return intervals


# do not modify below this line
print(sort_words(["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]))

print(sort_numbers([1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]))

print(sort_intervals([[1, 4], [2, 5], [1, 8], [2, 3], [0, 2]]))
`,
    solutionExplanation:
      'Lambdas let us express custom sort criteria cleanly inline. Returning a tuple `(interval[0], -interval[1])` is a classic interview trick for multi-key sorting with mixed ascending/descending directions.',
    testCases: [
      {
        name: 'sort_words lambda',
        inputDisplay: 'sort_words(["a", "ccc", "bb", "ddd"])',
        expectedDisplay: "['ccc', 'ddd', 'bb', 'a']",
        testCode: `
_actual = sort_words(["a", "ccc", "bb", "ddd"])
_expected = ['ccc', 'ddd', 'bb', 'a']`,
      },
      {
        name: 'sort_numbers lambda',
        inputDisplay: 'sort_numbers([3, -1, 2, -3, 0])',
        expectedDisplay: '[0, -1, 2, 3, -3]',
        testCode: `
_actual = sort_numbers([3, -1, 2, -3, 0])
_expected = [0, -1, 2, 3, -3]`,
      },
      {
        name: 'sort_intervals multi-key tie breaking',
        inputDisplay: 'sort_intervals([[3, 5], [1, 2], [1, 9], [1, 4], [3, 10]])',
        expectedDisplay: '[[1, 9], [1, 4], [1, 2], [3, 10], [3, 5]]',
        testCode: `
_actual = sort_intervals([[3, 5], [1, 2], [1, 9], [1, 4], [3, 10]])
_expected = [[1, 9], [1, 4], [1, 2], [3, 10], [3, 5]]`,
      },
    ],
  },
  {
    id: 'sorted-copy',
    sectionId: 'sorting',
    title: 'Sorted Copy',
    blocks: [
      {
        type: 'paragraph',
        text: 'Unlike `.sort()`, which mutates a list in-place, Python’s built-in `sorted()` function returns a **brand-new sorted list** while leaving the original list untouched.',
      },
      {
        type: 'code',
        code: `words = ["kiwi", "pear", "apple", "banana"]

sorted_words = sorted(words)

print(sorted_words)  # ['apple', 'banana', 'kiwi', 'pear']
print(words)         # ['kiwi', 'pear', 'apple', 'banana']  (unchanged!)`,
      },
      {
        type: 'paragraph',
        text: '`sorted()` accepts the exact same optional `key` and `reverse` arguments as `.sort()`, and works on **any iterable** — lists, tuples, strings, sets, and dictionary keys.',
      },
      {
        type: 'code',
        code: `nums = [5, -2, 8, -1]
print(sorted(nums, key=abs, reverse=True))  # [8, 5, -2, -1]
print(nums)                                 # [5, -2, 8, -1]`,
      },
    ],
    challenge: {
      intro: 'Implement the following functions **without modifying the original input lists**:',
      functions: [
        {
          signature: 'sort_words(words: List[str]) -> List[str]',
          description: 'Returns a new list of words sorted in ascending lexicographical order without mutating `words`.',
        },
        {
          signature: 'sort_numbers(numbers: List[int]) -> List[int]',
          description: 'Returns a new list of numbers sorted by absolute value in descending order without mutating `numbers`.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n), where n is the number of elements.',
      space: 'O(n) for the newly allocated sorted list.',
    },
    hints: [
      'Use `sorted(words)` instead of `words.sort()` so the input list stays unchanged.',
      'For `sort_numbers`, combine `key=abs` and `reverse=True`: `return sorted(numbers, key=abs, reverse=True)`.',
    ],
    starterCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    pass


def sort_numbers(numbers: List[int]) -> List[int]:
    pass


# do not modify below this line
original_words = ["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]

print(original_words)
print(sort_words(original_words))
print(original_words)

original_numbers = [1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]

print(original_numbers)
print(sort_numbers(original_numbers))
print(original_numbers)
`,
    expectedOutput: `['cherry', 'apple', 'blueberry', 'banana', 'watermelon', 'zucchini', 'kiwi', 'pear']
['apple', 'banana', 'blueberry', 'cherry', 'kiwi', 'pear', 'watermelon', 'zucchini']
['cherry', 'apple', 'blueberry', 'banana', 'watermelon', 'zucchini', 'kiwi', 'pear']
[1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]
[-19, 11, 9, 7, -6, 6, -5, 5, 4, -4, -3, 2, -2, 2, 1]
[1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]`,
    solutionCode: `from typing import List


def sort_words(words: List[str]) -> List[str]:
    return sorted(words)


def sort_numbers(numbers: List[int]) -> List[int]:
    return sorted(numbers, key=abs, reverse=True)


# do not modify below this line
original_words = ["cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"]

print(original_words)
print(sort_words(original_words))
print(original_words)

original_numbers = [1, -5, -3, 2, 4, 11, -19, 9, -2, 5, -6, 7, -4, 2, 6]

print(original_numbers)
print(sort_numbers(original_numbers))
print(original_numbers)
`,
    solutionExplanation:
      '`sorted()` builds and returns a fresh sorted list while preserving the original input list intact, making it safe whenever callers still rely on the original order.',
    testCases: [
      {
        name: 'sort_words returns sorted copy without mutating input',
        inputDisplay: 'orig = ["c", "a", "b"]; res = sort_words(orig)',
        expectedDisplay: "res=['a', 'b', 'c'], orig unchanged",
        testCode: `
orig = ["c", "a", "b"]
res = sort_words(orig)
_actual = (res, orig)
_expected = (['a', 'b', 'c'], ['c', 'a', 'b'])
if orig != ['c', 'a', 'b']:
    _passed = False
    _message = 'Original list was mutated! Use sorted() instead of .sort().'`,
      },
      {
        name: 'sort_numbers by abs descending without mutating input',
        inputDisplay: 'orig = [2, -5, 1, 5, -3]; res = sort_numbers(orig)',
        expectedDisplay: 'res=[-5, 5, -3, 2, 1], orig unchanged',
        testCode: `
orig = [2, -5, 1, 5, -3]
res = sort_numbers(orig)
_actual = (res, orig)
_expected = ([-5, 5, -3, 2, 1], [2, -5, 1, 5, -3])
if orig != [2, -5, 1, 5, -3]:
    _passed = False
    _message = 'Original list was mutated! Use sorted() instead of .sort().'`,
      },
      {
        name: 'empty list returns new list',
        inputDisplay: 'orig = []; res = sort_words(orig)',
        expectedDisplay: 'res == [] and res is not orig',
        testCode: `
orig = []
res = sort_words(orig)
_actual = res
_expected = []
_passed = (res == [] and res is not orig)
if not _passed:
    _message = 'Expected a new list object (use sorted()).'`,
      },
    ],
  },
];
