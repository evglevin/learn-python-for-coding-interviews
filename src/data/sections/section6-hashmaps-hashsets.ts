import type { LessonData } from '../../types/course';

export const SECTION_6_HASHMAPS_HASHSETS: LessonData[] = [
  {
    id: 'hash-map-basics',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Hash Map Basics',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python’s `dict` is a hash map providing **O(1)** average-case insertion, lookup, update, and deletion. In Python 3.7+, dictionaries also preserve **insertion order**.',
      },
      {
        type: 'code',
        code: `counts = {}

counts["apple"] = 3            # insert / update
val = counts["apple"]          # lookup -> 3 (KeyError if missing)
safe = counts.get("pear", 0)   # safe lookup -> 0 if missing
exists = "apple" in counts     # O(1) membership check -> True
counts.pop("apple", None)      # remove safely (no KeyError if missing)`,
      },
      {
        type: 'note',
        title: 'Most important data structure in interviews',
        text: 'A huge number of coding interview problems are solved by optimizing an O(n²) brute-force loop down to O(n), trading extra space for O(1) average-case lookups with a `dict`.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using Python dictionaries:',
      functions: [
        {
          signature: 'build_hash_map(keys: List[str], values: List[int]) -> Dict[str, int]',
          description: 'Given two equal-length lists, creates and returns a dictionary mapping each key in `keys` to its corresponding value in `values`. If a key appears more than once, its last value wins.',
        },
        {
          signature: 'get_values(hash_map: Dict[str, int], keys: List[str]) -> List[int]',
          description: 'Returns a list of values from `hash_map` corresponding to each key in `keys`. If a key is not present in `hash_map`, use `0` as the default.',
        },
      ],
    },
    complexity: {
      time: 'O(n) for `build_hash_map`; O(k) for `get_values` where k = len(keys).',
      space: 'O(n) for the dictionary / O(k) for the returned values list.',
    },
    hints: [
      'Use `zip(keys, values)` to pair up keys and values when building the dictionary.',
      'In `get_values`, use `hash_map.get(k, 0)` so missing keys default to `0` instead of raising `KeyError`.',
    ],
    starterCode: `from typing import List, Dict


def build_hash_map(keys: List[str], values: List[int]) -> Dict[str, int]:
    pass


def get_values(hash_map: Dict[str, int], keys: List[str]) -> List[int]:
    pass


# do not modify below this line
print(build_hash_map(["Alice", "Bob", "Charlie"], [90, 80, 70]))
print(build_hash_map(["Jane", "Carol", "Charlie"], [25, 100, 60]))

print(get_values({"Alice": 90, "Bob": 80, "Charlie": 70}, ["Alice", "Bob", "Charlie"]))
print(get_values({"Alice": 90, "Bob": 80, "Charlie": 70}, ["Alice", "David", "Bob"]))
`,
    expectedOutput: `{'Alice': 90, 'Bob': 80, 'Charlie': 70}
{'Jane': 25, 'Carol': 100, 'Charlie': 60}
[90, 80, 70]
[90, 0, 80]`,
    solutionCode: `from typing import List, Dict


def build_hash_map(keys: List[str], values: List[int]) -> Dict[str, int]:
    return dict(zip(keys, values))


def get_values(hash_map: Dict[str, int], keys: List[str]) -> List[int]:
    return [hash_map.get(key, 0) for key in keys]


# do not modify below this line
print(build_hash_map(["Alice", "Bob", "Charlie"], [90, 80, 70]))
print(build_hash_map(["Jane", "Carol", "Charlie"], [25, 100, 60]))

print(get_values({"Alice": 90, "Bob": 80, "Charlie": 70}, ["Alice", "Bob", "Charlie"]))
print(get_values({"Alice": 90, "Bob": 80, "Charlie": 70}, ["Alice", "David", "Bob"]))
`,
    solutionExplanation:
      '`dict(zip(keys, values))` builds the map concisely in O(n) time, and `hash_map.get(key, 0)` avoids `KeyError` on missing lookups.',
    testCases: [
      {
        name: 'build_hash_map basic',
        inputDisplay: 'build_hash_map(["x", "y"], [1, 2])',
        expectedDisplay: "{'x': 1, 'y': 2}",
        testCode: `
_actual = build_hash_map(["x", "y"], [1, 2])
_expected = {'x': 1, 'y': 2}`,
      },
      {
        name: 'get_values handles missing keys with 0',
        inputDisplay: 'get_values({"a": 5, "b": 10}, ["b", "z", "a"])',
        expectedDisplay: '[10, 0, 5]',
        testCode: `
_actual = get_values({"a": 5, "b": 10}, ["b", "z", "a"])
_expected = [10, 0, 5]`,
      },
    ],
  },
  {
    id: 'default-dict',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Default Dict',
    blocks: [
      {
        type: 'paragraph',
        text: 'When counting frequencies or building adjacency lists (`node -> list of neighbors`), checking `if key not in d:` before every update gets repetitive. `collections.defaultdict` automatically initializes missing keys using a factory function!',
      },
      {
        type: 'code',
        code: `from collections import defaultdict

# Frequency map (missing keys start at int() -> 0)
freq = defaultdict(int)
for ch in "banana":
    freq[ch] += 1
print(dict(freq))  # {'b': 1, 'a': 3, 'n': 2}

# Grouping / adjacency list (missing keys start at list() -> [])
groups = defaultdict(list)
groups["fruit"].append("apple")
groups["fruit"].append("pear")`,
      },
      {
        type: 'note',
        title: 'Be careful when reading from a defaultdict',
        text: 'Accessing `d[missing_key]` with brackets **inserts** the key with the default value! To check membership without inserting, use `key in d`; to read a value without inserting, use `d.get(key, fallback)`.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `collections.defaultdict`:',
      functions: [
        {
          signature: 'count_chars(s: str) -> Dict[str, int]',
          description: 'Counts the frequency of each character in `s` and returns the counts as a dictionary.',
        },
        {
          signature: 'nested_list_to_dict(nums: List[List[int]]) -> Dict[int, List[int]]',
          description: 'Each inner list starts with a key followed by zero or more values (`[key, v1, v2, ...]`). Groups all values under their respective keys (preserving order across inner lists) and returns the dictionary. A key with no values still appears, mapped to an empty list.',
        },
      ],
    },
    complexity: {
      time: 'O(n) for `count_chars`; O(total elements) for `nested_list_to_dict`.',
      space: 'O(k) unique characters / O(total elements).',
    },
    hints: [
      'Use `counts = defaultdict(int)` for `count_chars` and do `counts[c] += 1`.',
      'Use `groups = defaultdict(list)` for `nested_list_to_dict`: unpack `key, *vals = sublist` (or `sublist[0]` and `sublist[1:]`) and `groups[key].extend(vals)`.',
      'A `defaultdict` is a subclass of `dict`, so you can return it directly — or return `dict(groups)` if you want a plain `dict`.',
    ],
    starterCode: `from typing import List, Dict
from collections import defaultdict


def count_chars(s: str) -> Dict[str, int]:
    pass


def nested_list_to_dict(nums: List[List[int]]) -> Dict[int, List[int]]:
    pass


# do not modify below this line
print(dict(count_chars("hello")))
print(dict(count_chars("helloworld")))
print(dict(count_chars("areallylongstringwhyareyoureadingthishahalol")))

print(dict(nested_list_to_dict([[1, 2, 3], [4, 5, 6], [1, 4]])))
print(dict(nested_list_to_dict([[1, 2, 3, 4], [4, 5, 6, 7], [1, 4, 5, 6]])))
print(dict(nested_list_to_dict([[5, 2, 3, 4, 5], [4, 5, 6, 7, 8], [5, 6, 7, 8, 9]])))
`,
    expectedOutput: `{'h': 1, 'e': 1, 'l': 2, 'o': 1}
{'h': 1, 'e': 1, 'l': 3, 'o': 2, 'w': 1, 'r': 1, 'd': 1}
{'a': 6, 'r': 4, 'e': 3, 'l': 5, 'y': 3, 'o': 3, 'n': 3, 'g': 3, 's': 2, 't': 2, 'i': 3, 'w': 1, 'h': 4, 'u': 1, 'd': 1}
{1: [2, 3, 4], 4: [5, 6]}
{1: [2, 3, 4, 4, 5, 6], 4: [5, 6, 7]}
{5: [2, 3, 4, 5, 6, 7, 8, 9], 4: [5, 6, 7, 8]}`,
    solutionCode: `from typing import List, Dict
from collections import defaultdict


def count_chars(s: str) -> Dict[str, int]:
    counts = defaultdict(int)
    for char in s:
        counts[char] += 1
    return counts


def nested_list_to_dict(nums: List[List[int]]) -> Dict[int, List[int]]:
    output = defaultdict(list)
    for sublist in nums:
        key, *vals = sublist
        output[key].extend(vals)
    return output


# do not modify below this line
print(dict(count_chars("hello")))
print(dict(count_chars("helloworld")))
print(dict(count_chars("areallylongstringwhyareyoureadingthishahalol")))

print(dict(nested_list_to_dict([[1, 2, 3], [4, 5, 6], [1, 4]])))
print(dict(nested_list_to_dict([[1, 2, 3, 4], [4, 5, 6, 7], [1, 4, 5, 6]])))
print(dict(nested_list_to_dict([[5, 2, 3, 4, 5], [4, 5, 6, 7, 8], [5, 6, 7, 8, 9]])))
`,
    solutionExplanation:
      '`defaultdict(int)` defaults unseen keys to `0`, while `defaultdict(list)` defaults unseen keys to a fresh `[]`. Both eliminate repetitive key-existence checks.',
    testCases: [
      {
        name: 'count_chars basic and empty',
        inputDisplay: 'count_chars("aabbc"), count_chars("")',
        expectedDisplay: "({'a': 2, 'b': 2, 'c': 1}, {})",
        testCode: `
_actual = (dict(count_chars("aabbc")), dict(count_chars("")))
_expected = ({'a': 2, 'b': 2, 'c': 1}, {})`,
      },
      {
        name: 'nested_list_to_dict merges repeated keys',
        inputDisplay: 'nested_list_to_dict([[2, 10], [3, 20, 30], [2, 40]])',
        expectedDisplay: '{2: [10, 40], 3: [20, 30]}',
        testCode: `
_actual = dict(nested_list_to_dict([[2, 10], [3, 20, 30], [2, 40]]))
_expected = {2: [10, 40], 3: [20, 30]}`,
      },
      {
        name: 'nested_list_to_dict keeps keys with no values',
        inputDisplay: 'nested_list_to_dict([[7], [3, 1], [7, 2]])',
        expectedDisplay: '{7: [2], 3: [1]}',
        testCode: `
_actual = dict(nested_list_to_dict([[7], [3, 1], [7, 2]]))
_expected = {7: [2], 3: [1]}`,
      },
      {
        name: 'nested_list_to_dict key alone maps to empty list',
        inputDisplay: 'nested_list_to_dict([[5]])',
        expectedDisplay: '{5: []}',
        testCode: `
_actual = dict(nested_list_to_dict([[5]]))
_expected = {5: []}`,
      },
    ],
  },
  {
    id: 'counter',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Counter',
    blocks: [
      {
        type: 'paragraph',
        text: '`collections.Counter` is a specialized dictionary built specifically for counting hashable elements in one line. It is a favorite for **Valid Anagram**, **Top K Frequent Elements**, and **Sliding Window** problems.',
      },
      {
        type: 'code',
        code: `from collections import Counter

c = Counter("banana")
print(c)               # Counter({'a': 3, 'n': 2, 'b': 1})
print(c["z"])          # 0 (missing keys return 0 without inserting!)
print(c.most_common(2))  # [('a', 3), ('n', 2)]

# Combine two Counters cleanly:
c1 = Counter("abc")
c2 = Counter("bcd")
print(c1 + c2)         # Counter({'b': 2, 'c': 2, 'a': 1, 'd': 1})`,
      },
      {
        type: 'paragraph',
        text: 'You can also update an existing `Counter` in-place with `c.update(iterable)` or check if two strings are anagrams simply via `Counter(s) == Counter(t)`.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `collections.Counter`:',
      functions: [
        {
          signature: 'count_chars(word1: str, word2: str) -> Counter',
          description: 'Returns a `Counter` containing the combined character frequencies of both `word1` and `word2`.',
        },
        {
          signature: 'top_k_frequent(nums: List[int], k: int) -> List[int]',
          description: 'Returns a list of the `k` most frequent distinct integers in `nums` (or all of them, if there are fewer than `k`), ordered from most frequent to least frequent. Ties keep the order in which the numbers first appear in `nums` (this is exactly how `most_common` orders equal counts).',
        },
      ],
    },
    complexity: {
      time: 'O(n + m) for `count_chars`; O(n + u log k) for `top_k_frequent` — O(n) to count, then O(u log k) for `most_common(k)` (just O(u) when k = 1), where u is the number of unique values.',
      space: 'O(u) where u is the number of unique items.',
    },
    hints: [
      'In `count_chars`, either `return Counter(word1) + Counter(word2)` or create `c = Counter(word1); c.update(word2); return c`.',
      'In `top_k_frequent`, `Counter(nums).most_common(k)` returns `[(val, count), ...]`, so extract `[val for val, _ in Counter(nums).most_common(k)]`.',
    ],
    starterCode: `from typing import List
from collections import Counter


def count_chars(word1: str, word2: str) -> Counter:
    pass


def top_k_frequent(nums: List[int], k: int) -> List[int]:
    pass


# do not modify below this line
print(count_chars("hello", "world"))
print(count_chars("hello", "worldhello"))
print(count_chars("areallylongstring", "heyhowareyou"))

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
print(top_k_frequent([4, 4, 4, 4, 2, 2, 5, 5, 5], 2))
`,
    expectedOutput: `Counter({'l': 3, 'o': 2, 'h': 1, 'e': 1, 'w': 1, 'r': 1, 'd': 1})
Counter({'l': 5, 'o': 3, 'h': 2, 'e': 2, 'w': 1, 'r': 1, 'd': 1})
Counter({'a': 3, 'r': 3, 'e': 3, 'l': 3, 'y': 3, 'o': 3, 'n': 2, 'g': 2, 'h': 2, 's': 1, 't': 1, 'i': 1, 'w': 1, 'u': 1})
[1, 2]
[4, 5]`,
    solutionCode: `from typing import List
from collections import Counter


def count_chars(word1: str, word2: str) -> Counter:
    counter = Counter(word1)
    counter.update(word2)
    return counter


def top_k_frequent(nums: List[int], k: int) -> List[int]:
    return [num for num, _ in Counter(nums).most_common(k)]


# do not modify below this line
print(count_chars("hello", "world"))
print(count_chars("hello", "worldhello"))
print(count_chars("areallylongstring", "heyhowareyou"))

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))
print(top_k_frequent([4, 4, 4, 4, 2, 2, 5, 5, 5], 2))
`,
    solutionExplanation:
      '`Counter(word1)` followed by `counter.update(word2)` merges frequencies in O(n + m) time. `Counter(nums).most_common(k)` uses `heapq.nlargest` internally, so after the O(n) counting pass it retrieves the top `k` of the u unique values in O(u log k) time for `k ≥ 2` (O(u) for `k = 1`).',
    testCases: [
      {
        name: 'count_chars combines both words',
        inputDisplay: 'count_chars("aab", "bcc")',
        expectedDisplay: "Counter({'a': 2, 'b': 2, 'c': 2})",
        testCode: `
from collections import Counter
_actual = count_chars("aab", "bcc")
_expected = Counter({'a': 2, 'b': 2, 'c': 2})
_passed = isinstance(_actual, Counter) and _actual == _expected
if not _passed:
    _message = 'Expected a Counter with the combined counts.'`,
      },
      {
        name: 'top_k_frequent returns k most frequent in order',
        inputDisplay: 'top_k_frequent([5, 5, 5, 1, 1, 9, 9, 9, 9], 2)',
        expectedDisplay: '[9, 5]',
        testCode: `
_actual = top_k_frequent([5, 5, 5, 1, 1, 9, 9, 9, 9], 2)
_expected = [9, 5]`,
      },
      {
        name: 'top_k_frequent breaks ties by first appearance',
        inputDisplay: 'top_k_frequent([5, 9, 3, 5, 9, 3], 1)',
        expectedDisplay: '[5]',
        testCode: `
_actual = top_k_frequent([5, 9, 3, 5, 9, 3], 1)
_expected = [5]`,
      },
    ],
  },
  {
    id: 'dict-comprehension',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Dict Comprehension',
    blocks: [
      {
        type: 'paragraph',
        text: 'Just like list comprehensions, Python supports **dictionary comprehensions** to build dictionaries cleanly in a single expression: `{key_expr: value_expr for item in iterable if condition}`.',
      },
      {
        type: 'code',
        code: `nums = [1, 2, 3, 4]
squares = {n: n * n for n in nums}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16}

# Invert a dict (values must be unique and hashable)
original = {"a": 1, "b": 2}
inverted = {v: k for k, v in original.items()}
print(inverted)  # {1: 'a', 2: 'b'}`,
      },
    ],
    challenge: {
      intro: 'Implement the following function using a dictionary comprehension:',
      functions: [
        {
          signature: 'num_to_index(nums: List[int]) -> Dict[int, int]',
          description: 'Given a list of unique integers `nums`, returns a dictionary mapping each integer to its index in `nums`.',
        },
      ],
    },
    complexity: {
      time: 'O(n).',
      space: 'O(n).',
    },
    hints: [
      'Pair `enumerate(nums)` with a dict comprehension: `{num: i for i, num in enumerate(nums)}`.',
    ],
    starterCode: `from typing import List, Dict


def num_to_index(nums: List[int]) -> Dict[int, int]:
    pass


# do not modify below this line
print(num_to_index([1, 2, 3, 4, 5, 6, 7, 8]))
print(num_to_index([8, 7, 6, 5, 4, 3, 2, 1]))
print(num_to_index([0, 3, 2, 4, 5, 1]))
`,
    expectedOutput: `{1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7}
{8: 0, 7: 1, 6: 2, 5: 3, 4: 4, 3: 5, 2: 6, 1: 7}
{0: 0, 3: 1, 2: 2, 4: 3, 5: 4, 1: 5}`,
    solutionCode: `from typing import List, Dict


def num_to_index(nums: List[int]) -> Dict[int, int]:
    return {num: i for i, num in enumerate(nums)}


# do not modify below this line
print(num_to_index([1, 2, 3, 4, 5, 6, 7, 8]))
print(num_to_index([8, 7, 6, 5, 4, 3, 2, 1]))
print(num_to_index([0, 3, 2, 4, 5, 1]))
`,
    solutionExplanation:
      'Combining `enumerate(nums)` with a dict comprehension maps every value to its position in one readable O(n) line — super useful for problems like *Construct Binary Tree from Preorder and Inorder Traversal*!',
    testCases: [
      {
        name: 'basic mapping',
        inputDisplay: 'num_to_index([10, 20, 30])',
        expectedDisplay: '{10: 0, 20: 1, 30: 2}',
        testCode: `
_actual = num_to_index([10, 20, 30])
_expected = {10: 0, 20: 1, 30: 2}`,
      },
      {
        name: 'empty list',
        inputDisplay: 'num_to_index([])',
        expectedDisplay: '{}',
        testCode: `
_actual = num_to_index([])
_expected = {}`,
      },
    ],
  },
  {
    id: 'dict-items',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Dict Items',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python dictionaries provide three view methods for iteration: `.keys()`, `.values()`, and `.items()`. When you need both keys and values, `.items()` combined with tuple unpacking is cleaner and faster than looking up `d[k]` on every step.',
      },
      {
        type: 'code',
        code: `scores = {"Alice": 90, "Bob": 85, "Charlie": 95}

for name, score in scores.items():
    print(f"{name} -> {score}")

# Convert items directly to a list of (key, value) tuples:
pairs = list(scores.items())`,
      },
    ],
    challenge: {
      intro: 'Implement the following function using `.items()`:',
      functions: [
        {
          signature: 'get_dict_items(age_dict: Dict[str, int]) -> List[Tuple[str, int]]',
          description: 'Iterates over `age_dict` and returns a list of `(name, age)` tuples.',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n is the number of entries in `age_dict`.',
      space: 'O(n) for the returned list.',
    },
    hints: [
      'Loop `for name, age in age_dict.items(): res.append((name, age))` or simply `return list(age_dict.items())`.',
    ],
    starterCode: `from typing import Dict, List, Tuple


def get_dict_items(age_dict: Dict[str, int]) -> List[Tuple[str, int]]:
    pass


# do not modify below this line
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35}))
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}))
print(get_dict_items({'Bob': 30, 'David': 40, 'Charlie': 35, 'Alice': 25, 'Eve': 45}))
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40, 'Eve': 45, 'Frank': 50}))
`,
    expectedOutput: `[('Alice', 25), ('Bob', 30), ('Charlie', 35)]
[('Alice', 25), ('Bob', 30), ('Charlie', 35), ('David', 40)]
[('Bob', 30), ('David', 40), ('Charlie', 35), ('Alice', 25), ('Eve', 45)]
[('Alice', 25), ('Bob', 30), ('Charlie', 35), ('David', 40), ('Eve', 45), ('Frank', 50)]`,
    solutionCode: `from typing import Dict, List, Tuple


def get_dict_items(age_dict: Dict[str, int]) -> List[Tuple[str, int]]:
    return [(name, age) for name, age in age_dict.items()]


# do not modify below this line
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35}))
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}))
print(get_dict_items({'Bob': 30, 'David': 40, 'Charlie': 35, 'Alice': 25, 'Eve': 45}))
print(get_dict_items({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40, 'Eve': 45, 'Frank': 50}))
`,
    solutionExplanation:
      '`.items()` yields `(key, value)` pairs in insertion order, and unpacking them into `(name, age)` (or calling `list(age_dict.items())`) builds the exact tuple list in O(n) time.',
    testCases: [
      {
        name: 'returns list of (key, value) tuples preserving order',
        inputDisplay: "get_dict_items({'z': 1, 'a': 2})",
        expectedDisplay: "[('z', 1), ('a', 2)]",
        testCode: `
_actual = get_dict_items({'z': 1, 'a': 2})
_expected = [('z', 1), ('a', 2)]`,
      },
      {
        name: 'empty dict',
        inputDisplay: 'get_dict_items({})',
        expectedDisplay: '[]',
        testCode: `
_actual = get_dict_items({})
_expected = []`,
      },
    ],
  },
  {
    id: 'hash-set-basics',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Hash Set Basics',
    blocks: [
      {
        type: 'paragraph',
        text: 'A Python `set` is an unordered collection of **unique** hashable elements with **O(1)** average-case `.add()`, `.remove()`, `.discard()`, and `in` membership checks.',
      },
      {
        type: 'code',
        code: `seen = set()       # IMPORTANT: {} creates an empty dict, NOT a set!
seen.add(1)        # {1}
seen.add(2)        # {1, 2}
seen.add(1)        # {1, 2} (duplicates ignored)

2 in seen          # True in O(1)
seen.discard(99)   # Safe removal (no KeyError if missing)
seen.remove(1)     # Raises KeyError if missing`,
      },
      {
        type: 'paragraph',
        text: 'Sets are indispensable for *Contains Duplicate*, *Longest Consecutive Sequence*, *Graph Visited Tracking*, and set algebra (`a & b` intersection, `a | b` union, `a - b` difference).',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `set`:',
      functions: [
        {
          signature: 'build_hash_set(keys: List[str]) -> Set[str]',
          description: 'Creates and returns a set containing all unique strings from `keys`.',
        },
        {
          signature: 'check_keys(hash_set: Set[str], keys: List[str]) -> List[bool]',
          description: 'Returns a list of booleans indicating whether each key in `keys` exists in `hash_set`.',
        },
      ],
    },
    complexity: {
      time: 'O(n) for `build_hash_set`; O(k) for `check_keys`.',
      space: 'O(n) for the set; O(k) for the boolean result list.',
    },
    hints: [
      'You can construct a set directly via `set(keys)` or add items in a loop with `s.add(k)`.',
      'For `check_keys`, use `[k in hash_set for k in keys]`.',
    ],
    starterCode: `from typing import List, Set


def build_hash_set(keys: List[str]) -> Set[str]:
    pass


def check_keys(hash_set: Set[str], keys: List[str]) -> List[bool]:
    pass


# do not modify below this line
output1 = build_hash_set(["Alice", "Bob", "Charlie"])
print(type(output1))
print(sorted(list(output1)))

output2 = build_hash_set(["XY", "XX", "YY", "XY", "YX"])
print(type(output2))
print(sorted(list(output2)))

print(check_keys({"Alice", "Bob", "Charlie"}, ["Alice", "Bob", "Charlie", "David"]))
print(check_keys({"a", "b", "c"}, ["a", "d", "c"]))
print(check_keys({"a", "c"}, ["d", "c"]))
`,
    expectedOutput: `<class 'set'>
['Alice', 'Bob', 'Charlie']
<class 'set'>
['XX', 'XY', 'YX', 'YY']
[True, True, True, False]
[True, False, True]
[False, True]`,
    solutionCode: `from typing import List, Set


def build_hash_set(keys: List[str]) -> Set[str]:
    return set(keys)


def check_keys(hash_set: Set[str], keys: List[str]) -> List[bool]:
    return [key in hash_set for key in keys]


# do not modify below this line
output1 = build_hash_set(["Alice", "Bob", "Charlie"])
print(type(output1))
print(sorted(list(output1)))

output2 = build_hash_set(["XY", "XX", "YY", "XY", "YX"])
print(type(output2))
print(sorted(list(output2)))

print(check_keys({"Alice", "Bob", "Charlie"}, ["Alice", "Bob", "Charlie", "David"]))
print(check_keys({"a", "b", "c"}, ["a", "d", "c"]))
print(check_keys({"a", "c"}, ["d", "c"]))
`,
    solutionExplanation:
      '`set(keys)` deduplicates an iterable of hashable items in O(n) average time, and `key in hash_set` checks membership in O(1) average time.',
    testCases: [
      {
        name: 'build_hash_set deduplicates and returns set',
        inputDisplay: 'build_hash_set(["a", "b", "a", "c"])',
        expectedDisplay: "{'a', 'b', 'c'}",
        testCode: `
res = build_hash_set(["a", "b", "a", "c"])
_actual = res
_expected = {'a', 'b', 'c'}
_passed = isinstance(res, set) and res == _expected`,
      },
      {
        name: 'check_keys returns boolean list',
        inputDisplay: 'check_keys({"x", "y"}, ["x", "z", "y"])',
        expectedDisplay: '[True, False, True]',
        testCode: `
_actual = check_keys({"x", "y"}, ["x", "z", "y"])
_expected = [True, False, True]`,
      },
    ],
  },
  {
    id: 'set-comprehension',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Set Comprehension',
    blocks: [
      {
        type: 'paragraph',
        text: '**Set comprehensions** look just like list comprehensions, except wrapped in curly braces `{...}` (with no `:` colon). They automatically eliminate duplicates.',
      },
      {
        type: 'code',
        code: `nums = [1, 2, 2, 3, 4, 4, 5]
unique_evens = {x for x in nums if x % 2 == 0}
print(unique_evens)  # {2, 4}`,
      },
      {
        type: 'paragraph',
        text: 'Set comprehensions are great for building a lookup set of doubled values, normalized strings, or transformed coordinates in one clean expression.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using a set comprehension:',
      functions: [
        {
          signature: 'double_nums(nums: List[int]) -> Set[int]',
          description: 'Returns a set containing every number in `nums` multiplied by `2`.',
        },
      ],
    },
    complexity: {
      time: 'O(n).',
      space: 'O(n).',
    },
    hints: [
      'Write `return {num * 2 for num in nums}`.',
    ],
    starterCode: `from typing import List, Set


def double_nums(nums: List[int]) -> Set[int]:
    pass


# do not modify below this line
output1 = double_nums([1, 2, 3])
print(type(output1))
print(sorted(list(output1)))

output2 = double_nums([4, -2, 0, 7])
print(type(output2))
print(sorted(list(output2)))

output3 = double_nums([10, 20, 30, 40, 50])
print(type(output3))
print(sorted(list(output3)))
`,
    expectedOutput: `<class 'set'>
[2, 4, 6]
<class 'set'>
[-4, 0, 8, 14]
<class 'set'>
[20, 40, 60, 80, 100]`,
    solutionCode: `from typing import List, Set


def double_nums(nums: List[int]) -> Set[int]:
    return {num * 2 for num in nums}


# do not modify below this line
output1 = double_nums([1, 2, 3])
print(type(output1))
print(sorted(list(output1)))

output2 = double_nums([4, -2, 0, 7])
print(type(output2))
print(sorted(list(output2)))

output3 = double_nums([10, 20, 30, 40, 50])
print(type(output3))
print(sorted(list(output3)))
`,
    solutionExplanation:
      '`{num * 2 for num in nums}` transforms and deduplicates the input into a `set` in a single expression.',
    testCases: [
      {
        name: 'double_nums with duplicates and negatives',
        inputDisplay: 'double_nums([-3, 0, 2, 2, 5])',
        expectedDisplay: '{-6, 0, 4, 10}',
        testCode: `
res = double_nums([-3, 0, 2, 2, 5])
_actual = res
_expected = {-6, 0, 4, 10}
_passed = isinstance(res, set) and res == _expected`,
      },
      {
        name: 'empty list returns empty set',
        inputDisplay: 'double_nums([])',
        expectedDisplay: 'set()',
        testCode: `
res = double_nums([])
_actual = res
_expected = set()
_passed = isinstance(res, set) and res == set()`,
      },
    ],
  },
  {
    id: 'tuple-keys',
    sectionId: 'hashmaps-and-hashsets',
    title: 'Tuple Keys',
    blocks: [
      {
        type: 'paragraph',
        text: 'Keys in a `dict` and elements in a `set` must be **hashable**. Immutable built-ins like `int`, `str`, and tuples of hashable values are hashable; mutable containers like `list`, `dict`, and `set` are not. Using a list as a set element or a dict key raises `TypeError: unhashable type: \'list\'` (lists are fine as dict *values*).',
      },
      {
        type: 'code',
        code: `# BAD: TypeError: unhashable type: 'list'
# visited.add([row, col])

# GOOD: Convert to a tuple!
visited = set()
visited.add((row, col))

# Memoization with tuple state keys:
memo = {}
memo[(i, remaining)] = answer`,
      },
      {
        type: 'note',
        title: 'Classic Interview Use Cases',
        text: 'Tuple keys unlock **2D Grid BFS/DFS visited sets** `(r, c)`, **Group Anagrams** (`tuple(count_of_26_letters)`), and **Top-Down DP memoization** `(idx, state)`.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using tuple elements inside a set:',
      functions: [
        {
          signature: 'grid_to_set(grid: List[List[int]]) -> Set[Tuple[int, int]]',
          description: 'Given a 2D binary grid of `0`s and `1`s, returns a set of `(row, col)` tuples for every cell whose value is `1`.',
        },
      ],
    },
    complexity: {
      time: 'O(rows * cols).',
      space: 'O(rows * cols) in the worst case when all cells are `1`.',
    },
    hints: [
      'Loop over rows `r` and columns `c` (using `enumerate` or `range(len(grid))`), and whenever `grid[r][c] == 1`, add `(r, c)` to your set.',
      'You can even do this in one nested set comprehension: `{(r, c) for r in range(len(grid)) for c in range(len(grid[r])) if grid[r][c] == 1}`.',
    ],
    starterCode: `from typing import List, Set, Tuple


def grid_to_set(grid: List[List[int]]) -> Set[Tuple[int, int]]:
    pass


# do not modify below this line
output1 = grid_to_set([[1, 0, 1], [0, 1, 0], [1, 0, 1]])
print(type(output1))
print(sorted(list(output1)))

output2 = grid_to_set([[1, 0, 0], [0, 0, 0]])
print(type(output2))
print(sorted(list(output2)))

output3 = grid_to_set([[1, 1, 1], [1, 1, 1]])
print(type(output3))
print(sorted(list(output3)))

output4 = grid_to_set([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
print(type(output4))
print(sorted(list(output4)))
`,
    expectedOutput: `<class 'set'>
[(0, 0), (0, 2), (1, 1), (2, 0), (2, 2)]
<class 'set'>
[(0, 0)]
<class 'set'>
[(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
<class 'set'>
[]`,
    solutionCode: `from typing import List, Set, Tuple


def grid_to_set(grid: List[List[int]]) -> Set[Tuple[int, int]]:
    res = set()
    for r in range(len(grid)):
        for c in range(len(grid[r])):
            if grid[r][c] == 1:
                res.add((r, c))
    return res


# do not modify below this line
output1 = grid_to_set([[1, 0, 1], [0, 1, 0], [1, 0, 1]])
print(type(output1))
print(sorted(list(output1)))

output2 = grid_to_set([[1, 0, 0], [0, 0, 0]])
print(type(output2))
print(sorted(list(output2)))

output3 = grid_to_set([[1, 1, 1], [1, 1, 1]])
print(type(output3))
print(sorted(list(output3)))

output4 = grid_to_set([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
print(type(output4))
print(sorted(list(output4)))
`,
    solutionExplanation:
      'Storing `(r, c)` tuples in a `set` lets us check whether any grid cell is marked in O(1) time without modifying the input grid.',
    testCases: [
      {
        name: 'extracts all 1-coordinates as tuples',
        inputDisplay: 'grid_to_set([[0, 1], [1, 0]])',
        expectedDisplay: '{(0, 1), (1, 0)}',
        testCode: `
res = grid_to_set([[0, 1], [1, 0]])
_actual = res
_expected = {(0, 1), (1, 0)}
_passed = isinstance(res, set) and res == _expected`,
      },
      {
        name: 'all zeros returns empty set',
        inputDisplay: 'grid_to_set([[0, 0], [0, 0]])',
        expectedDisplay: 'set()',
        testCode: `
res = grid_to_set([[0, 0], [0, 0]])
_actual = res
_expected = set()
_passed = isinstance(res, set) and res == set()`,
      },
    ],
  },
];
