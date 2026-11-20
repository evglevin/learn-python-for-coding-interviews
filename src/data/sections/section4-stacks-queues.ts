import type { Lesson } from '../../types/course';

export const SECTION_4_STACKS_QUEUES: Lesson[] = [
  {
    id: 'stack-push-and-pop',
    index: 17,
    sectionId: 'stacks-and-queues',
    title: 'Stack Push and Pop',
    blocks: [
      {
        type: 'paragraph',
        text: 'Python doesn’t need a separate `Stack` class — a regular Python `list` is the idiomatic **LIFO (Last-In, First-Out)** stack because both `.append()` (push) and `.pop()` (pop) operate on the end of the list in **O(1)** time.',
      },
      {
        type: 'code',
        code: `stack = []

stack.append(10)  # push -> [10]
stack.append(20)  # push -> [10, 20]

top = stack[-1]   # peek -> 20
val = stack.pop() # pop  -> 20, stack is now [10]

is_empty = len(stack) == 0  # or: not stack`,
      },
      {
        type: 'paragraph',
        text: 'Stacks power *Valid Parentheses*, *Iterative DFS*, *Monotonic Stack* (Next Greater Element, Daily Temperatures), and *Expression Evaluation*.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using stack operations:',
      functions: [
        {
          signature: 'reverse_list(arr: List[int]) -> List[int]',
          description: 'Reverses `arr` by pushing/popping elements like a stack and returns the reversed list (without using `arr.reverse()` or `arr[::-1]`).',
        },
      ],
    },
    complexity: {
      time: 'O(n), where n = len(arr).',
      space: 'O(n) for the output list.',
    },
    hints: [
      'Create an empty list `res = []`.',
      'While `arr` is non-empty (`while arr:`), call `res.append(arr.pop())`.',
      'Return `res`!',
    ],
    starterCode: `from typing import List


def reverse_list(arr: List[int]) -> List[int]:
    pass


# do not modify below this line
print(reverse_list([1, 2, 3]))
print(reverse_list([3, 2, 1, 4, 6, 2]))
print(reverse_list([1, 9, 7, 3, 2, 1, 4, 6, 2]))
`,
    expectedOutput: `[3, 2, 1]
[2, 6, 4, 1, 2, 3]
[2, 6, 4, 1, 2, 3, 7, 9, 1]`,
    solutionCode: `from typing import List


def reverse_list(arr: List[int]) -> List[int]:
    res = []
    while arr:
        res.append(arr.pop())
    return res


# do not modify below this line
print(reverse_list([1, 2, 3]))
print(reverse_list([3, 2, 1, 4, 6, 2]))
print(reverse_list([1, 9, 7, 3, 2, 1, 4, 6, 2]))
`,
    solutionExplanation:
      'Because `.pop()` removes from the top (end) of the stack in O(1) time and `.append()` pushes onto `res` in O(1) time, draining `arr` into `res` reverses the sequence in O(n) total time.',
    testCases: [
      {
        name: 'basic reversal',
        inputDisplay: 'reverse_list([1, 2, 3, 4])',
        expectedDisplay: '[4, 3, 2, 1]',
        testCode: `
_actual = reverse_list([1, 2, 3, 4])
_expected = [4, 3, 2, 1]`,
      },
      {
        name: 'single element and empty list',
        inputDisplay: 'reverse_list([42]), reverse_list([])',
        expectedDisplay: '([42], [])',
        testCode: `
_actual = (reverse_list([42]), reverse_list([]))
_expected = ([42], [])`,
      },
    ],
  },
  {
    id: 'queue-enqueue-and-dequeue',
    index: 18,
    sectionId: 'stacks-and-queues',
    title: 'Queue Enqueue and Dequeue',
    blocks: [
      {
        type: 'paragraph',
        text: 'Never use a plain `list` as a queue (`list.pop(0)` is **O(n)**!). Instead, Python’s `collections.deque` (doubly-linked list of blocks) gives you **O(1)** enqueue at the right and **O(1)** dequeue at the left.',
      },
      {
        type: 'code',
        code: `from collections import deque

queue = deque()

queue.append(1)      # enqueue at back -> deque([1])
queue.append(2)      # enqueue at back -> deque([1, 2])
first = queue.popleft()  # dequeue from front -> 1`,
      },
      {
        type: 'note',
        title: 'BFS Essential',
        text: 'Every Breadth-First Search (tree level-order traversal, shortest path in an unweighted graph/grid) uses `collections.deque` with `.append()` and `.popleft()`.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `collections.deque`:',
      functions: [
        {
          signature: 'rotate_list(arr: List[int], k: int) -> Deque[int]',
          description: 'Converts `arr` into a `deque`, rotates it to the **left** `k` times by repeatedly popping from the left and appending to the right, and returns the resulting `deque`.',
        },
      ],
    },
    complexity: {
      time: 'O(n + k), where n = len(arr) to build the deque and k O(1) rotations (or O(n) if you reduce `k % len(arr)`).',
      space: 'O(n) for the deque.',
    },
    hints: [
      'Initialize `queue = deque(arr)`.',
      'If `queue` is empty, return it immediately.',
      'Loop `k` times (or `k % len(queue)` times): `queue.append(queue.popleft())`.',
    ],
    starterCode: `from typing import List, Deque
from collections import deque


def rotate_list(arr: List[int], k: int) -> Deque[int]:
    pass


# do not modify below this line
print(rotate_list([1, 2, 3, 4, 5], 0))
print(rotate_list([1, 2, 3, 4, 5], 1))
print(rotate_list([1, 2, 3, 4, 5], 2))
print(rotate_list([1, 2, 3, 4, 5], 3))
print(rotate_list([1, 2, 3, 4, 5], 4))
print(rotate_list([1, 2, 3, 4, 5], 5))
`,
    expectedOutput: `deque([1, 2, 3, 4, 5])
deque([2, 3, 4, 5, 1])
deque([3, 4, 5, 1, 2])
deque([4, 5, 1, 2, 3])
deque([5, 1, 2, 3, 4])
deque([1, 2, 3, 4, 5])`,
    solutionCode: `from typing import List, Deque
from collections import deque


def rotate_list(arr: List[int], k: int) -> Deque[int]:
    queue = deque(arr)
    if not queue:
        return queue
    for _ in range(k % len(queue)):
        queue.append(queue.popleft())
    return queue


# do not modify below this line
print(rotate_list([1, 2, 3, 4, 5], 0))
print(rotate_list([1, 2, 3, 4, 5], 1))
print(rotate_list([1, 2, 3, 4, 5], 2))
print(rotate_list([1, 2, 3, 4, 5], 3))
print(rotate_list([1, 2, 3, 4, 5], 4))
print(rotate_list([1, 2, 3, 4, 5], 5))
`,
    solutionExplanation:
      'Moving an element from the front to the back with `queue.append(queue.popleft())` takes O(1) per step. Reducing `k % len(queue)` also keeps large `k` values instant.',
    testCases: [
      {
        name: 'rotate by 2 returns deque',
        inputDisplay: 'rotate_list([1, 2, 3, 4, 5], 2)',
        expectedDisplay: 'deque([3, 4, 5, 1, 2])',
        testCode: `
from collections import deque
res = rotate_list([1, 2, 3, 4, 5], 2)
_actual = res
_expected = deque([3, 4, 5, 1, 2])
_passed = isinstance(res, deque) and res == _expected`,
      },
      {
        name: 'k larger than length',
        inputDisplay: 'rotate_list([10, 20, 30], 7)',
        expectedDisplay: 'deque([20, 30, 10])',
        testCode: `
from collections import deque
_actual = rotate_list([10, 20, 30], 7)
_expected = deque([20, 30, 10])`,
      },
      {
        name: 'empty list edge case',
        inputDisplay: 'rotate_list([], 3)',
        expectedDisplay: 'deque([])',
        testCode: `
from collections import deque
_actual = rotate_list([], 3)
_expected = deque([])`,
      },
    ],
  },
  {
    id: 'double-ended-queue',
    index: 19,
    sectionId: 'stacks-and-queues',
    title: 'Double Ended Queue',
    blocks: [
      {
        type: 'paragraph',
        text: '`deque` stands for **Double-Ended Queue**: it supports O(1) insertions and deletions at **both** ends!',
      },
      {
        type: 'code',
        code: `from collections import deque

dq = deque([2, 3])
dq.append(4)       # add right -> deque([2, 3, 4])
dq.appendleft(1)   # add left  -> deque([1, 2, 3, 4])

dq.pop()           # pop right -> 4
dq.popleft()       # pop left  -> 1

# Peek either end in O(1):
front, back = dq[0], dq[-1]`,
      },
      {
        type: 'paragraph',
        text: 'Double-ended queues are essential for **Sliding Window Maximum** (monotonic deque), **0-1 BFS**, and **Palindrome Checking**.',
      },
    ],
    challenge: {
      intro: 'Implement the following function using `deque` operations on the **right** end and **left** end:',
      functions: [
        {
          signature: 'rotate_list(arr: List[int], k: int) -> Deque[int]',
          description: 'Converts `arr` into a `deque` and rotates it to the **right** `k` times (popping from the right and pushing onto the left). Returns the resulting `deque`.',
        },
      ],
    },
    complexity: {
      time: 'O(n + (k mod n)).',
      space: 'O(n).',
    },
    hints: [
      'Pop from the back with `dq.pop()` and insert at the front with `dq.appendleft(...)`.',
      'Watch out for empty lists before doing `k % len(dq)`.',
      'Bonus fact: `deque` even has a built-in `dq.rotate(k)` method that rotates right by `k` in C!',
    ],
    starterCode: `from typing import List, Deque
from collections import deque


def rotate_list(arr: List[int], k: int) -> Deque[int]:
    pass


# do not modify below this line
print(rotate_list([1, 2, 3, 4, 5], 0))
print(rotate_list([1, 2, 3, 4, 5], 1))
print(rotate_list([1, 2, 3, 4, 5], 2))
print(rotate_list([1, 2, 3, 4, 5], 3))
print(rotate_list([1, 2, 3, 4, 5], 4))
print(rotate_list([1, 2, 3, 4, 5], 5))
`,
    expectedOutput: `deque([1, 2, 3, 4, 5])
deque([5, 1, 2, 3, 4])
deque([4, 5, 1, 2, 3])
deque([3, 4, 5, 1, 2])
deque([2, 3, 4, 5, 1])
deque([1, 2, 3, 4, 5])`,
    solutionCode: `from typing import List, Deque
from collections import deque


def rotate_list(arr: List[int], k: int) -> Deque[int]:
    dq = deque(arr)
    if not dq:
        return dq
    for _ in range(k % len(dq)):
        dq.appendleft(dq.pop())
    return dq


# do not modify below this line
print(rotate_list([1, 2, 3, 4, 5], 0))
print(rotate_list([1, 2, 3, 4, 5], 1))
print(rotate_list([1, 2, 3, 4, 5], 2))
print(rotate_list([1, 2, 3, 4, 5], 3))
print(rotate_list([1, 2, 3, 4, 5], 4))
print(rotate_list([1, 2, 3, 4, 5], 5))
`,
    solutionExplanation:
      'To rotate right, each step removes the rightmost element (`dq.pop()`) and places it at the front (`dq.appendleft(...)`), both in O(1) time.',
    testCases: [
      {
        name: 'rotate right by 2',
        inputDisplay: 'rotate_list([1, 2, 3, 4, 5], 2)',
        expectedDisplay: 'deque([4, 5, 1, 2, 3])',
        testCode: `
from collections import deque
res = rotate_list([1, 2, 3, 4, 5], 2)
_actual = res
_expected = deque([4, 5, 1, 2, 3])
_passed = isinstance(res, deque) and res == _expected`,
      },
      {
        name: 'rotate right with k > len(arr)',
        inputDisplay: 'rotate_list([10, 20, 30], 4)',
        expectedDisplay: 'deque([30, 10, 20])',
        testCode: `
from collections import deque
_actual = rotate_list([10, 20, 30], 4)
_expected = deque([30, 10, 20])`,
      },
      {
        name: 'empty list',
        inputDisplay: 'rotate_list([], 2)',
        expectedDisplay: 'deque([])',
        testCode: `
from collections import deque
_actual = rotate_list([], 2)
_expected = deque([])`,
      },
    ],
  },
];
