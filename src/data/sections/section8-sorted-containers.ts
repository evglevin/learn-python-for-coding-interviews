import type { Lesson } from '../../types/course';

export const SECTION_8_SORTED_CONTAINERS: Lesson[] = [
  {
    id: 'sorted-dict-basics',
    index: 38,
    sectionId: 'sorted-dicts-and-sets',
    title: 'Sorted Dict Basics',
    blocks: [
      {
        type: 'paragraph',
        text: 'Unlike C++ (`std::map`) or Java (`TreeMap`), Python’s standard library does not include a balanced-tree sorted map. Instead, coding platforms (LeetCode, HackerRank, and this local environment!) provide the `sortedcontainers` library, which includes `SortedDict`.',
      },
      {
        type: 'code',
        code: `from sortedcontainers import SortedDict

sd = SortedDict({"c": 3, "a": 1, "b": 2})
print(list(sd.keys()))   # ['a', 'b', 'c']  (always sorted!)

sd["d"] = 4              # O(log n) insert
del sd["b"]              # O(log n) delete
sd.pop("a")              # O(log n) pop key -> returns 1

print(sd.peekitem(0))    # ('c', 3)  smallest key-value pair
print(sd.peekitem(-1))   # ('d', 4)  largest key-value pair
print(sd.popitem(0))     # removes & returns ('c', 3)`,
      },
      {
        type: 'paragraph',
        text: '`SortedDict` also supports binary search over sorted keys (`sd.bisect_left(key)`, `sd.bisect_right(key)`) and indexing (`sd.keys()[0]`, `sd.keys()[-1]`) in **O(log n)** time — making it ideal for *My Calendar*, *Stock Price Fluctuation*, and *Range Module* problems.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `SortedDict`:',
      functions: [
        {
          signature: 'remove_keys(sorted_dict: SortedDict[str, int], keys: List[str]) -> SortedDict[str, int]',
          description: 'Removes every key in `keys` from `sorted_dict` (ignoring any key that is not present) and returns the updated `SortedDict`.',
        },
        {
          signature: 'get_values_before_target(sorted_dict: SortedDict[str, int], target: str) -> List[int]',
          description: 'Iterates over `sorted_dict` in sorted key order and returns a list of values for all keys strictly less than `target` (stop as soon as you reach a key `>= target`).',
        },
      ],
    },
    complexity: {
      time: '`remove_keys`: O(k log n); `get_values_before_target`: O(m) where m is the number of keys before `target`.',
      space: 'O(m) for the returned values list.',
    },
    hints: [
      'In `remove_keys`, use `sorted_dict.pop(key, None)` (or `if key in sorted_dict: del sorted_dict[key]`).',
      'In `get_values_before_target`, because iterating over `sorted_dict.items()` yields keys in ascending order, you can `break` as soon as `key >= target` (or use `sorted_dict.bisect_left(target)`!).',
    ],
    starterCode: `from typing import List
from sortedcontainers import SortedDict


def remove_keys(sorted_dict: SortedDict, keys: List[str]) -> SortedDict:
    pass


def get_values_before_target(sorted_dict: SortedDict, target: str) -> List[int]:
    pass


# do not modify below this line
print(remove_keys(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35}), ['Bob']))
print(remove_keys(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), ['Bob', 'David', 'Eve']))

print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35}), 'Bob'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'David'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'Charlie'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'Alice'))
`,
    expectedOutput: `SortedDict({'Alice': 25, 'Charlie': 35})
SortedDict({'Alice': 25, 'Charlie': 35})
[25]
[25, 30, 35]
[25, 30]
[]`,
    solutionCode: `from typing import List
from sortedcontainers import SortedDict


def remove_keys(sorted_dict: SortedDict, keys: List[str]) -> SortedDict:
    for key in keys:
        sorted_dict.pop(key, None)
    return sorted_dict


def get_values_before_target(sorted_dict: SortedDict, target: str) -> List[int]:
    res = []
    for key, val in sorted_dict.items():
        if key >= target:
            break
        res.append(val)
    return res


# do not modify below this line
print(remove_keys(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35}), ['Bob']))
print(remove_keys(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), ['Bob', 'David', 'Eve']))

print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35}), 'Bob'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'David'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'Charlie'))
print(get_values_before_target(SortedDict({'Alice': 25, 'Bob': 30, 'Charlie': 35, 'David': 40}), 'Alice'))
`,
    solutionExplanation:
      '`sorted_dict.pop(key, None)` removes keys safely in O(log n). Iterating `sorted_dict.items()` visits keys in sorted order, letting us terminate early with `break` as soon as `key >= target`.',
    testCases: [
      {
        name: 'remove_keys ignores absent keys and preserves sorted order',
        inputDisplay: "remove_keys(SortedDict({'c': 3, 'a': 1, 'b': 2}), ['b', 'z'])",
        expectedDisplay: "SortedDict({'a': 1, 'c': 3})",
        testCode: `
from sortedcontainers import SortedDict
res = remove_keys(SortedDict({'c': 3, 'a': 1, 'b': 2}), ['b', 'z'])
_actual = list(res.items())
_expected = [('a', 1), ('c', 3)]`,
      },
      {
        name: 'get_values_before_target stops before target',
        inputDisplay: "get_values_before_target(SortedDict({'d': 4, 'a': 1, 'c': 3, 'b': 2}), 'c')",
        expectedDisplay: '[1, 2]',
        testCode: `
from sortedcontainers import SortedDict
_actual = get_values_before_target(SortedDict({'d': 4, 'a': 1, 'c': 3, 'b': 2}), 'c')
_expected = [1, 2]`,
      },
      {
        name: 'get_values_before_target target larger than all keys',
        inputDisplay: "get_values_before_target(SortedDict({'a': 1, 'b': 2}), 'z')",
        expectedDisplay: '[1, 2]',
        testCode: `
from sortedcontainers import SortedDict
_actual = get_values_before_target(SortedDict({'a': 1, 'b': 2}), 'z')
_expected = [1, 2]`,
      },
    ],
  },
  {
    id: 'sorted-set-basics',
    index: 39,
    sectionId: 'sorted-dicts-and-sets',
    title: 'Sorted Set Basics',
    blocks: [
      {
        type: 'paragraph',
        text: '`SortedSet` from `sortedcontainers` is Python’s equivalent to C++ `std::set` or Java `TreeSet`: it stores **unique elements in sorted order** with O(log n) insertion, deletion, binary search, and **O(log n) indexing** (`ss[0]`, `ss[-1]`, `ss[k]`)!',
      },
      {
        type: 'code',
        code: `from sortedcontainers import SortedSet

ss = SortedSet([5, 1, 3, 3, 2])
print(ss)                # SortedSet([1, 2, 3, 5])

ss.add(4)                # O(log n)
ss.discard(2)            # O(log n) safe delete
print(ss[0], ss[-1])     # 1 5 (min and max!)
print(ss.bisect_left(3)) # 1 (index of first element >= 3)
ss.pop(0)                # removes & returns smallest element -> 1`,
      },
      {
        type: 'note',
        title: 'Why SortedSet beats a Heap in some problems',
        text: 'A heap only supports O(log n) removal of the *minimum* element. When an interview problem requires **arbitrary deletion**, **finding the predecessor/successor** (`bisect_left`), or **querying both min and max** dynamically, `SortedSet` is the cleanest tool in Python.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `SortedSet`:',
      functions: [
        {
          signature: 'get_first_three(sorted_set: SortedSet, nums1: List[int], nums2: List[int]) -> List[int]',
          description: '1. Adds every number in `nums1` to `sorted_set`.\n2. Removes every number in `nums2` from `sorted_set` (ignoring any number not present).\n3. Returns a list containing the **first 3** smallest elements remaining in `sorted_set` (or fewer if `len(sorted_set) < 3`).',
        },
      ],
    },
    complexity: {
      time: 'O((n1 + n2) log m), where m is the size of `sorted_set`.',
      space: 'O(m) for the `SortedSet`.',
    },
    hints: [
      'Loop over `nums1` calling `sorted_set.add(num)` (or `sorted_set.update(nums1)`).',
      'Loop over `nums2` calling `sorted_set.discard(num)` so missing values do not raise `KeyError`.',
      'Slice `list(sorted_set[:3])` (or `sorted_set[:3]`) to grab up to the first 3 smallest elements!',
    ],
    starterCode: `from typing import List
from sortedcontainers import SortedSet


def get_first_three(sorted_set: SortedSet, nums1: List[int], nums2: List[int]) -> List[int]:
    pass


# do not modify below this line
print(get_first_three(SortedSet(), [1, 2, 3], [4]))
print(get_first_three(SortedSet([1, 4, 7, 2, 8, 9]), [10], [1, 7, 2]))
print(get_first_three(SortedSet([1, 2, 3, 7]), [], [4, 5, 6]))
print(get_first_three(SortedSet([1, 2, 3, 4, 5, 6, 7, 8, 9]), [10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9]))
`,
    expectedOutput: `[1, 2, 3]
[4, 8, 9]
[1, 2, 3]
[10, 11, 12]`,
    solutionCode: `from typing import List
from sortedcontainers import SortedSet


def get_first_three(sorted_set: SortedSet, nums1: List[int], nums2: List[int]) -> List[int]:
    for num in nums1:
        sorted_set.add(num)
    for num in nums2:
        sorted_set.discard(num)
    return list(sorted_set[:3])


# do not modify below this line
print(get_first_three(SortedSet(), [1, 2, 3], [4]))
print(get_first_three(SortedSet([1, 4, 7, 2, 8, 9]), [10], [1, 7, 2]))
print(get_first_three(SortedSet([1, 2, 3, 7]), [], [4, 5, 6]))
print(get_first_three(SortedSet([1, 2, 3, 4, 5, 6, 7, 8, 9]), [10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9]))
`,
    solutionExplanation:
      '`sorted_set.add()` inserts in sorted order while deduplicating, `sorted_set.discard()` removes safely without errors if missing, and `list(sorted_set[:3])` returns up to the 3 smallest elements.',
    testCases: [
      {
        name: 'adds, discards, and returns first 3',
        inputDisplay: 'get_first_three(SortedSet([5, 1, 9]), [2, 2, 0], [1, 99])',
        expectedDisplay: '[0, 2, 5]',
        testCode: `
from sortedcontainers import SortedSet
_actual = get_first_three(SortedSet([5, 1, 9]), [2, 2, 0], [1, 99])
_expected = [0, 2, 5]`,
      },
      {
        name: 'fewer than 3 elements remaining',
        inputDisplay: 'get_first_three(SortedSet([1, 2]), [3], [1, 3])',
        expectedDisplay: '[2]',
        testCode: `
from sortedcontainers import SortedSet
_actual = get_first_three(SortedSet([1, 2]), [3], [1, 3])
_expected = [2]`,
      },
    ],
  },
];
