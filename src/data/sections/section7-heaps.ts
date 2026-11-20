import type { LessonData } from '../../types/course';

export const SECTION_7_HEAPS: LessonData[] = [
  {
    id: 'heap-push',
    sectionId: 'heaps',
    title: 'Heap Push',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python’s `heapq` module implements a **min-heap** (priority queue) directly on top of a regular Python `list`. The smallest element is always at index `0` (`heap[0]`).',
      },
      {
        type: 'code',
        code: `import heapq

heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 2)

print(heap[0])  # 1 (smallest element is always at index 0)`,
      },
      {
        type: 'paragraph',
        text: 'Each `heapq.heappush(heap, item)` inserts `item` and restores the min-heap invariant in **O(log n)** time. Note that the underlying list is **not** fully sorted — only the parent ≤ children heap property is maintained, guaranteeing `heap[0]` is the minimum.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `heapq.heappush`:',
      functions: [
        {
          signature: 'heap_push(heap: List[int], value: int) -> int',
          description: 'Pushes `value` onto the min-heap `heap` and returns the **minimum element** currently in the heap (`heap[0]`).',
        },
      ],
    },
    complexity: {
      time: 'O(log n) per `heappush`; O(1) to peek `heap[0]`.',
      space: 'O(1) extra space per push.',
    },
    hints: [
      'Call `heapq.heappush(heap, value)` to insert `value` while preserving the min-heap property.',
      'Return `heap[0]` to peek at the current minimum element.',
    ],
    starterCode: `import heapq
from typing import List


def heap_push(heap: List[int], value: int) -> int:
    pass


# do not modify below this line
print(heap_push([1, 2, 3], 4))
print(heap_push([1, 2, 3], 0))
print(heap_push([1, 2, 3], 2))
print(heap_push([4, 6, 7, 8, 12, 9, 10], 2))
print(heap_push([4, 6, 7, 8, 12, 9, 10], 5))
`,
    expectedOutput: `1
0
1
2
4`,
    solutionCode: `import heapq
from typing import List


def heap_push(heap: List[int], value: int) -> int:
    heapq.heappush(heap, value)
    return heap[0]


# do not modify below this line
print(heap_push([1, 2, 3], 4))
print(heap_push([1, 2, 3], 0))
print(heap_push([1, 2, 3], 2))
print(heap_push([4, 6, 7, 8, 12, 9, 10], 2))
print(heap_push([4, 6, 7, 8, 12, 9, 10], 5))
`,
    solutionExplanation:
      '`heapq.heappush(heap, value)` sifts the new value up to maintain the min-heap property in O(log n), leaving the minimum element at `heap[0]`.',
    testCases: [
      {
        name: 'pushes smaller element to root',
        inputDisplay: 'h = [5, 10, 7]; heap_push(h, 2)',
        expectedDisplay: '2 (and heap property preserved)',
        testCode: `
h = [5, 10, 7]
res = heap_push(h, 2)
_actual = res
_expected = 2
_passed = (res == 2 and len(h) == 4 and h[0] == 2)`,
      },
      {
        name: 'pushes into empty heap',
        inputDisplay: 'heap_push([], 99)',
        expectedDisplay: '99',
        testCode: `
_actual = heap_push([], 99)
_expected = 99`,
      },
    ],
  },
  {
    id: 'heap-pop',
    sectionId: 'heaps',
    title: 'Heap Pop',
    blocks: [
      {
        type: 'paragraph',
        text: '`heapq.heappop(heap)` removes and returns the **smallest** element (`heap[0]`) from the min-heap in **O(log n)** time, then sifts the remaining elements to restore the heap invariant.',
      },
      {
        type: 'code',
        code: `import heapq

heap = []
for val in [4, 1, 7, 3]:
    heapq.heappush(heap, val)

while heap:
    print(heapq.heappop(heap))
# Prints: 1, 3, 4, 7`,
      },
      {
        type: 'paragraph',
        text: 'Repeatedly pushing elements onto a min-heap and popping them all off gives you **Heap Sort** in O(n log n) time!',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `heapq.heappush` and `heapq.heappop`:',
      functions: [
        {
          signature: 'heap_pop(heap: List[int]) -> List[int]',
          description: 'Given a valid min-heap `heap`, repeatedly pops every element off the heap and returns them in ascending sorted order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n) to pop all n elements.',
      space: 'O(n) for the result list.',
    },
    hints: [
      'Create `res = []` and loop `while heap: res.append(heapq.heappop(heap))`.',
    ],
    starterCode: `import heapq
from typing import List


def heap_pop(heap: List[int]) -> List[int]:
    pass


# do not modify below this line
print(heap_pop([1, 2, 3]))
print(heap_pop([1, 3, 2]))
print(heap_pop([6, 7, 8, 12, 9, 10]))
`,
    expectedOutput: `[1, 2, 3]
[1, 2, 3]
[6, 7, 8, 9, 10, 12]`,
    solutionCode: `import heapq
from typing import List


def heap_pop(heap: List[int]) -> List[int]:
    res = []
    while heap:
        res.append(heapq.heappop(heap))
    return res


# do not modify below this line
print(heap_pop([1, 2, 3]))
print(heap_pop([1, 3, 2]))
print(heap_pop([6, 7, 8, 12, 9, 10]))
`,
    solutionExplanation:
      'Because `heapq.heappop(heap)` always extracts the minimum element in O(log n), draining the heap yields all elements in sorted ascending order.',
    testCases: [
      {
        name: 'drains valid min-heap in sorted order',
        inputDisplay: 'heap_pop([2, 5, 4, 9, 6, 8])',
        expectedDisplay: '[2, 4, 5, 6, 8, 9]',
        testCode: `
_actual = heap_pop([2, 5, 4, 9, 6, 8])
_expected = [2, 4, 5, 6, 8, 9]`,
      },
      {
        name: 'empty heap',
        inputDisplay: 'heap_pop([])',
        expectedDisplay: '[]',
        testCode: `
_actual = heap_pop([])
_expected = []`,
      },
    ],
  },
  {
    id: 'heapify',
    sectionId: 'heaps',
    title: 'Heapify',
    blocks: [
      {
        type: 'paragraph',
        text: 'If you already have an unsorted list of `n` elements, pushing them one-by-one takes **O(n log n)** time. Instead, `heapq.heapify(arr)` converts the list into a valid min-heap **in-place in O(n) linear time**!',
      },
      {
        type: 'code',
        code: `import heapq

arr = [9, 4, 7, 1, 3, 6]
heapq.heapify(arr)   # O(n) in-place! Returns None.

print(arr[0])        # 1 (guaranteed minimum)`,
      },
      {
        type: 'note',
        title: 'Why is heapify O(n)?',
        text: 'Half of the nodes in a binary heap are leaves (0 work), a quarter are 1 level above leaves (at most 1 swap), etc. The geometric sum converges to strictly **O(n)** — interviewers love asking this!',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `heapq.heapify`:',
      functions: [
        {
          signature: 'heapify_strings(strings: List[str]) -> List[str]',
          description: 'Converts `strings` into a min-heap in-place using `heapq.heapify` and returns the heapified list.',
        },
        {
          signature: 'heapify_integers(integers: List[int]) -> List[int]',
          description: 'Converts `integers` into a min-heap in-place using `heapq.heapify` and returns the heapified list.',
        },
        {
          signature: 'heap_sort(arr: List[int]) -> List[int]',
          description: 'Uses `heapq.heapify` and `heapq.heappop` to return a new list containing all elements of `arr` sorted in ascending order.',
        },
      ],
    },
    complexity: {
      time: '`heapify_*`: O(n); `heap_sort`: O(n log n).',
      space: '`heapify_*`: O(1) in-place; `heap_sort`: O(n).',
    },
    hints: [
      'Remember `heapq.heapify(arr)` modifies `arr` in-place and returns `None` — just like `list.sort()`.',
      'In `heap_sort`, heapify `arr` first, then pop until empty into a result list.',
    ],
    starterCode: `import heapq
from typing import List


def heapify_strings(strings: List[str]) -> List[str]:
    pass


def heapify_integers(integers: List[int]) -> List[int]:
    pass


def heap_sort(arr: List[int]) -> List[int]:
    pass


# do not modify below this line
print(heapify_strings(["b", "a", "e", "c", "d"]))
print(heapify_integers([3, 4, 5, 1, 2, 6]))
print(heap_sort([6, 4, 3, 1, 2, 5]))
print(heap_sort([10, -2, 7, 3, 3, 0]))
`,
    expectedOutput: `['a', 'b', 'e', 'c', 'd']
[1, 2, 5, 4, 3, 6]
[1, 2, 3, 4, 5, 6]
[-2, 0, 3, 3, 7, 10]`,
    solutionCode: `import heapq
from typing import List


def heapify_strings(strings: List[str]) -> List[str]:
    heapq.heapify(strings)
    return strings


def heapify_integers(integers: List[int]) -> List[int]:
    heapq.heapify(integers)
    return integers


def heap_sort(arr: List[int]) -> List[int]:
    heapq.heapify(arr)
    res = []
    while arr:
        res.append(heapq.heappop(arr))
    return res


# do not modify below this line
print(heapify_strings(["b", "a", "e", "c", "d"]))
print(heapify_integers([3, 4, 5, 1, 2, 6]))
print(heap_sort([6, 4, 3, 1, 2, 5]))
print(heap_sort([10, -2, 7, 3, 3, 0]))
`,
    solutionExplanation:
      '`heapq.heapify` arranges the list into a min-heap in O(n) in-place. Extracting all elements with `heappop` completes heap sort in O(n log n).',
    testCases: [
      {
        name: 'heapify_strings satisfies min-heap property',
        inputDisplay: 'heapify_strings(["d", "b", "a", "c"])',
        expectedDisplay: "Valid min-heap with root 'a'",
        testCode: `
res = heapify_strings(["d", "b", "a", "c"])
_actual = res
_expected = "valid min-heap with root 'a'"
is_heap = all(res[i] <= res[2*i+1] for i in range(len(res)) if 2*i+1 < len(res)) and \\
          all(res[i] <= res[2*i+2] for i in range(len(res)) if 2*i+2 < len(res))
_passed = is_heap and sorted(res) == ['a', 'b', 'c', 'd'] and res[0] == 'a'`,
      },
      {
        name: 'heapify_integers satisfies min-heap property',
        inputDisplay: 'heapify_integers([9, 3, 7, 1, 5])',
        expectedDisplay: 'Valid min-heap with root 1',
        testCode: `
res = heapify_integers([9, 3, 7, 1, 5])
_actual = res
_expected = 'valid min-heap with root 1'
is_heap = all(res[i] <= res[2*i+1] for i in range(len(res)) if 2*i+1 < len(res)) and \\
          all(res[i] <= res[2*i+2] for i in range(len(res)) if 2*i+2 < len(res))
_passed = is_heap and sorted(res) == [1, 3, 5, 7, 9] and res[0] == 1`,
      },
      {
        name: 'heap_sort sorts ascending',
        inputDisplay: 'heap_sort([5, -1, 4, 2, 2])',
        expectedDisplay: '[-1, 2, 2, 4, 5]',
        testCode: `
_actual = heap_sort([5, -1, 4, 2, 2])
_expected = [-1, 2, 2, 4, 5]`,
      },
    ],
  },
  {
    id: 'max-heap',
    sectionId: 'heaps',
    title: 'Max Heap',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python’s `heapq` module only provides a **min-heap** out of the box. The standard interview trick to simulate a **max-heap** for numbers is to **negate every number** when pushing, and **negate it back** when popping!',
      },
      {
        type: 'code',
        code: `import heapq

nums = [4, 2, 9, 1]
max_heap = [-n for n in nums]
heapq.heapify(max_heap)

largest = -heapq.heappop(max_heap)   # 9
second  = -heapq.heappop(max_heap)   # 4`,
      },
      {
        type: 'note',
        title: 'Classic Interview Problems',
        text: 'Negated max-heaps show up constantly in *Last Stone Weight*, *Kth Largest Element*, *Find Median from Data Stream* (two heaps!), and *Task Scheduler*.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using a simulated max-heap:',
      functions: [
        {
          signature: 'get_reverse_sorted(nums: List[int]) -> List[int]',
          description: 'Builds a max-heap from `nums` by negating values, then pops all elements out (negating them back) to return `nums` sorted in **descending** order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log n).',
      space: 'O(n) for the max-heap and output list.',
    },
    hints: [
      'Build `max_heap = [-n for n in nums]` and call `heapq.heapify(max_heap)`.',
      'While `max_heap`, append `-heapq.heappop(max_heap)` to your result list.',
    ],
    starterCode: `import heapq
from typing import List


def get_reverse_sorted(nums: List[int]) -> List[int]:
    pass


# do not modify below this line
print(get_reverse_sorted([1, 2, 3]))
print(get_reverse_sorted([5, 6, 4, 2, 7, 3, 1]))
print(get_reverse_sorted([5, 6, -4, 2, 4, 7, -3, -1]))
`,
    expectedOutput: `[3, 2, 1]
[7, 6, 5, 4, 3, 2, 1]
[7, 6, 5, 4, 2, -1, -3, -4]`,
    solutionCode: `import heapq
from typing import List


def get_reverse_sorted(nums: List[int]) -> List[int]:
    max_heap = [-num for num in nums]
    heapq.heapify(max_heap)
    res = []
    while max_heap:
        res.append(-heapq.heappop(max_heap))
    return res


# do not modify below this line
print(get_reverse_sorted([1, 2, 3]))
print(get_reverse_sorted([5, 6, 4, 2, 7, 3, 1]))
print(get_reverse_sorted([5, 6, -4, 2, 4, 7, -3, -1]))
`,
    solutionExplanation:
      'Negating numbers flips their comparison order so the largest original number becomes the smallest negative number at `max_heap[0]`. Negating again on `heappop` restores the original values in descending order.',
    testCases: [
      {
        name: 'handles positives, zero, and negatives',
        inputDisplay: 'get_reverse_sorted([-10, 0, 5, 5, -2])',
        expectedDisplay: '[5, 5, 0, -2, -10]',
        testCode: `
_actual = get_reverse_sorted([-10, 0, 5, 5, -2])
_expected = [5, 5, 0, -2, -10]`,
      },
      {
        name: 'empty list',
        inputDisplay: 'get_reverse_sorted([])',
        expectedDisplay: '[]',
        testCode: `
_actual = get_reverse_sorted([])
_expected = []`,
      },
    ],
  },
  {
    id: 'custom-heap',
    sectionId: 'heaps',
    title: 'Custom Heap',
    blocks: [
      {
        type: 'paragraph',
        text: 'Unlike `list.sort(key=...)`, `heapq` does **not** accept a `key` parameter. To prioritize elements by a custom key (like distance, frequency, or absolute value), store **tuples** `(priority_key, item)` in the heap!',
      },
      {
        type: 'code',
        code: `import heapq

tasks = [(2, "email"), (1, "bugfix"), (3, "docs")]
heapq.heapify(tasks)

while tasks:
    priority, name = heapq.heappop(tasks)
    print(priority, name)
# 1 bugfix
# 2 email
# 3 docs`,
      },
      {
        type: 'paragraph',
        text: 'Python compares tuples **lexicographically**: first by element `0`, then breaking ties by element `1`, and so on. If element `1` isn’t comparable (like a `TreeNode` in *Merge K Sorted Lists*), insert a unique counter as a tie-breaker: `(priority, tie_breaker, node)`.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using a tuple-based custom heap:',
      functions: [
        {
          signature: 'get_reverse_sorted(nums: List[int]) -> List[int]',
          description: 'Uses a heap of tuples `(-abs(num), num)` (or `(-abs(num), -num, num)`) to return `nums` sorted by **absolute value in descending order**. Break ties in absolute value by placing the smaller actual number first (e.g., `-4` before `4`, matching Python’s tuple ordering `(-abs(num), num)`).',
        },
      ],
    },
    complexity: {
      time: 'O(n log n).',
      space: 'O(n) for the tuple heap and output.',
    },
    hints: [
      'Push tuples of `(-abs(num), num)` into the min-heap!',
      'Wait: when `abs(-4) == abs(4)`, `(-4, -4) < (-4, 4)` so `-4` pops before `4` automatically.',
      'Pop each tuple as `_, num = heapq.heappop(heap)` and append `num` to `res`.',
    ],
    starterCode: `import heapq
from typing import List


def get_reverse_sorted(nums: List[int]) -> List[int]:
    pass


# do not modify below this line
print(get_reverse_sorted([1, -2, 3, -4, 5]))
print(get_reverse_sorted([-5, 5, -2, 2, 0]))
print(get_reverse_sorted([7, -10, 3, -3, 1]))
`,
    expectedOutput: `[5, -4, 3, -2, 1]
[-5, 5, -2, 2, 0]
[-10, 7, -3, 3, 1]`,
    solutionCode: `import heapq
from typing import List


def get_reverse_sorted(nums: List[int]) -> List[int]:
    heap = [(-abs(num), num) for num in nums]
    heapq.heapify(heap)
    res = []
    while heap:
        _, num = heapq.heappop(heap)
        res.append(num)
    return res


# do not modify below this line
print(get_reverse_sorted([1, -2, 3, -4, 5]))
print(get_reverse_sorted([-5, 5, -2, 2, 0]))
print(get_reverse_sorted([7, -10, 3, -3, 1]))
`,
    solutionExplanation:
      'Storing `(-abs(num), num)` in a min-heap orders elements by largest absolute value first, and breaks equal-magnitude ties by placing the smaller value first via tuple comparison.',
    testCases: [
      {
        name: 'sorts by absolute value descending with tuple tie-breaking',
        inputDisplay: 'get_reverse_sorted([4, -4, -1, 9, 0])',
        expectedDisplay: '[9, -4, 4, -1, 0]',
        testCode: `
_actual = get_reverse_sorted([4, -4, -1, 9, 0])
_expected = [9, -4, 4, -1, 0]`,
      },
      {
        name: 'empty and single element',
        inputDisplay: 'get_reverse_sorted([]), get_reverse_sorted([-7])',
        expectedDisplay: '([], [-7])',
        testCode: `
_actual = (get_reverse_sorted([]), get_reverse_sorted([-7]))
_expected = ([], [-7])`,
      },
    ],
  },
  {
    id: 'heap-n-smallest',
    sectionId: 'heaps',
    title: 'Heap N Smallest',
    blocks: [
      {
        type: 'paragraph',
        text: 'Need the `k` smallest items from a dataset without sorting the entire list? Python’s `heapq.nsmallest(n, iterable, key=None)` gives you them directly!',
      },
      {
        type: 'code',
        code: `import heapq

nums = [12, 3, 7, 1, 9, 5]
print(heapq.nsmallest(3, nums))  # [1, 3, 5]

# Works with a custom key too!
words = ["watermelon", "kiwi", "apple", "pear"]
print(heapq.nsmallest(2, words, key=len))  # ['kiwi', 'pear']`,
      },
      {
        type: 'note',
        title: 'How to do it manually with a bounded max-heap (O(n log k))',
        text: 'In interviews, you should know BOTH `heapq.nsmallest(k, nums)` AND the manual pattern: maintain a max-heap of size `k` (push `-x`, pop when `len(heap) > k`), which keeps memory at **O(k)** even for an infinite stream!',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `heapq.nsmallest` (or a min-heap):',
      functions: [
        {
          signature: 'get_min_element(arr: List[int]) -> int',
          description: 'Returns the single smallest element in `arr`.',
        },
        {
          signature: 'get_min_4_elements(arr: List[int]) -> List[int]',
          description: 'Returns a list of the 4 smallest elements in `arr` in ascending order.',
        },
        {
          signature: 'get_min_2_elements(arr: List[int]) -> List[int]',
          description: 'Returns a list of the 2 smallest elements in `arr` in **descending** order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log k) for `heapq.nsmallest(k, arr)` (and O(n) when k = 1).',
      space: 'O(k) extra space.',
    },
    hints: [
      '`heapq.nsmallest(1, arr)[0]` returns the smallest single element.',
      '`heapq.nsmallest(4, arr)` already returns the 4 smallest elements sorted in ascending order.',
      'For `get_min_2_elements`, take `heapq.nsmallest(2, arr)` and reverse it (`[::-1]`).',
    ],
    starterCode: `import heapq
from typing import List


def get_min_element(arr: List[int]) -> int:
    pass


def get_min_4_elements(arr: List[int]) -> List[int]:
    pass


def get_min_2_elements(arr: List[int]) -> List[int]:
    pass


# do not modify below this line
print(get_min_element([1, 2, 3]))
print(get_min_element([3, 2, 1, 4, 6, 2]))
print(get_min_element([1, 9, 7, 3, 2, 1, 4, 6, 2]))

print(get_min_4_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_min_4_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_min_4_elements([1, 2, 3, 4]))

print(get_min_2_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_min_2_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_min_2_elements([1, 2, 3, 4]))
`,
    expectedOutput: `1
1
1
[1, 1, 2, 2]
[1, 1, 1, 1]
[1, 2, 3, 4]
[1, 1]
[1, 1]
[2, 1]`,
    solutionCode: `import heapq
from typing import List


def get_min_element(arr: List[int]) -> int:
    return heapq.nsmallest(1, arr)[0]


def get_min_4_elements(arr: List[int]) -> List[int]:
    return heapq.nsmallest(4, arr)


def get_min_2_elements(arr: List[int]) -> List[int]:
    return heapq.nsmallest(2, arr)[::-1]


# do not modify below this line
print(get_min_element([1, 2, 3]))
print(get_min_element([3, 2, 1, 4, 6, 2]))
print(get_min_element([1, 9, 7, 3, 2, 1, 4, 6, 2]))

print(get_min_4_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_min_4_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_min_4_elements([1, 2, 3, 4]))

print(get_min_2_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_min_2_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_min_2_elements([1, 2, 3, 4]))
`,
    solutionExplanation:
      '`heapq.nsmallest(k, arr)` efficiently returns the `k` smallest elements in ascending order without mutating `arr`. Slicing `[::-1]` reverses the 2-element result into descending order.',
    testCases: [
      {
        name: 'get_min_element with negatives',
        inputDisplay: 'get_min_element([5, -3, 2, -8, 4])',
        expectedDisplay: '-8',
        testCode: `
_actual = get_min_element([5, -3, 2, -8, 4])
_expected = -8`,
      },
      {
        name: 'get_min_4_elements',
        inputDisplay: 'get_min_4_elements([10, 4, 8, 1, 9, 2, 5])',
        expectedDisplay: '[1, 2, 4, 5]',
        testCode: `
_actual = get_min_4_elements([10, 4, 8, 1, 9, 2, 5])
_expected = [1, 2, 4, 5]`,
      },
      {
        name: 'get_min_2_elements descending',
        inputDisplay: 'get_min_2_elements([10, 3, 7, -1, 5])',
        expectedDisplay: '[3, -1]',
        testCode: `
_actual = get_min_2_elements([10, 3, 7, -1, 5])
_expected = [3, -1]`,
      },
    ],
  },
  {
    id: 'heap-n-largest',
    sectionId: 'heaps',
    title: 'Heap N Largest',
    blocks: [
      {
        type: 'paragraph',
        text: 'Symmetrically, `heapq.nlargest(n, iterable, key=None)` returns the `n` **largest** elements in **descending** order without mutating the input.',
      },
      {
        type: 'code',
        code: `import heapq

nums = [12, 3, 7, 1, 9, 5]
print(heapq.nlargest(3, nums))  # [12, 9, 7]

# Top 2 longest words:
words = ["kiwi", "watermelon", "pear", "blueberry"]
print(heapq.nlargest(2, words, key=len))  # ['watermelon', 'blueberry']`,
      },
      {
        type: 'paragraph',
        text: 'Internally, `heapq.nlargest(k, iterable)` maintains a min-heap of size `k` — scanning the iterable in **O(n log k)** time and **O(k)** memory.',
      },
    ],
    challenge: {
      intro: 'Implement the following functions using `heapq.nlargest`:',
      functions: [
        {
          signature: 'get_max_element(arr: List[int]) -> int',
          description: 'Returns the single largest integer in `arr`.',
        },
        {
          signature: 'get_max_4_elements(arr: List[int]) -> List[int]',
          description: 'Returns the 4 largest integers in `arr` in descending order.',
        },
        {
          signature: 'get_max_2_elements(arr: List[int]) -> List[int]',
          description: 'Returns the 2 largest integers in `arr` in **ascending** order.',
        },
      ],
    },
    complexity: {
      time: 'O(n log k) where k is the number of requested elements (O(n) for k = 1).',
      space: 'O(k) extra space.',
    },
    hints: [
      '`heapq.nlargest(1, arr)[0]` returns the largest single element.',
      '`heapq.nlargest(4, arr)` returns the 4 largest elements in descending order.',
      'Reverse `heapq.nlargest(2, arr)` with `[::-1]` to return the 2 largest in ascending order.',
    ],
    starterCode: `import heapq
from typing import List


def get_max_element(arr: List[int]) -> int:
    pass


def get_max_4_elements(arr: List[int]) -> List[int]:
    pass


def get_max_2_elements(arr: List[int]) -> List[int]:
    pass


# do not modify below this line
print(get_max_element([1, 2, 3]))
print(get_max_element([3, 2, 1, 4, 6, 2]))
print(get_max_element([1, 9, 7, 3, 2, 1, 4, 6, 2]))

print(get_max_4_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_max_4_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_max_4_elements([1, 2, 3, 4]))

print(get_max_2_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_max_2_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_max_2_elements([1, 2, 3, 4]))
`,
    expectedOutput: `3
6
9
[9, 7, 6, 4]
[9, 7, 6, 4]
[4, 3, 2, 1]
[7, 9]
[7, 9]
[3, 4]`,
    solutionCode: `import heapq
from typing import List


def get_max_element(arr: List[int]) -> int:
    return heapq.nlargest(1, arr)[0]


def get_max_4_elements(arr: List[int]) -> List[int]:
    return heapq.nlargest(4, arr)


def get_max_2_elements(arr: List[int]) -> List[int]:
    return heapq.nlargest(2, arr)[::-1]


# do not modify below this line
print(get_max_element([1, 2, 3]))
print(get_max_element([3, 2, 1, 4, 6, 2]))
print(get_max_element([1, 9, 7, 3, 2, 1, 4, 6, 2]))

print(get_max_4_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_max_4_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_max_4_elements([1, 2, 3, 4]))

print(get_max_2_elements([1, 9, 7, 3, 2, 1, 4, 6, 2]))
print(get_max_2_elements([1, 9, 7, 2, 1, 3, 2, 1, 4, 6, 2, 1]))
print(get_max_2_elements([1, 2, 3, 4]))
`,
    solutionExplanation:
      '`heapq.nlargest(k, arr)` returns the top `k` elements in descending order in O(n log k) time. Reversing the 2-element list gives ascending order.',
    testCases: [
      {
        name: 'get_max_element with all negatives',
        inputDisplay: 'get_max_element([-10, -3, -25, -4])',
        expectedDisplay: '-3',
        testCode: `
_actual = get_max_element([-10, -3, -25, -4])
_expected = -3`,
      },
      {
        name: 'get_max_4_elements',
        inputDisplay: 'get_max_4_elements([2, 8, 1, 9, 5, 9, 3])',
        expectedDisplay: '[9, 9, 8, 5]',
        testCode: `
_actual = get_max_4_elements([2, 8, 1, 9, 5, 9, 3])
_expected = [9, 9, 8, 5]`,
      },
      {
        name: 'get_max_2_elements ascending',
        inputDisplay: 'get_max_2_elements([10, 4, 25, 17, 1])',
        expectedDisplay: '[17, 25]',
        testCode: `
_actual = get_max_2_elements([10, 4, 25, 17, 1])
_expected = [17, 25]`,
      },
    ],
  },
];
