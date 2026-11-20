import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { StateField, type EditorState } from '@codemirror/state';
import { showTooltip, type Tooltip } from '@codemirror/view';

type ParamDef = {
  name: string;
  detail?: string;
  info?: string;
  kwOnly?: boolean;
};

type CallableDef = {
  label: string;
  detail: string;
  info: string;
  type?: Completion['type'];
  params?: ParamDef[];
};

const SORT_PARAMS: ParamDef[] = [
  { name: 'key', detail: 'Callable | None = None', info: 'Function of one argument used to extract a comparison key from each element.', kwOnly: true },
  { name: 'reverse', detail: 'bool = False', info: 'If True, sort elements in descending order.', kwOnly: true },
];

const LIST_METHODS: CallableDef[] = [
  { label: 'sort', detail: '(key=None, reverse=False) -> None', info: 'Sort the list in-place in ascending order.', params: SORT_PARAMS },
  { label: 'append', detail: '(x) -> None', info: 'Add an item to the end of the list in O(1) amortized time.', params: [{ name: 'x', detail: 'T' }] },
  { label: 'pop', detail: '(index=-1) -> T', info: 'Remove and return item at index (default last, O(1)).', params: [{ name: 'index', detail: 'int = -1' }] },
  { label: 'extend', detail: '(iterable) -> None', info: 'Append all items from iterable to the end of the list.', params: [{ name: 'iterable', detail: 'Iterable[T]' }] },
  { label: 'insert', detail: '(index, object) -> None', info: 'Insert object before index in O(n) time.', params: [{ name: 'index', detail: 'int' }, { name: 'object', detail: 'T' }] },
  { label: 'remove', detail: '(value) -> None', info: 'Remove the first occurrence of value (raises ValueError if missing).', params: [{ name: 'value', detail: 'T' }] },
  { label: 'index', detail: '(value, start=0, stop=...) -> int', info: 'Return index of first occurrence of value.', params: [{ name: 'value', detail: 'T' }, { name: 'start', detail: 'int = 0' }, { name: 'stop', detail: 'int' }] },
  { label: 'count', detail: '(value) -> int', info: 'Return the number of times value appears in the list.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'copy', detail: '() -> list', info: 'Return a shallow copy of the list.' },
  { label: 'reverse', detail: '() -> None', info: 'Reverse the elements of the list in-place.' },
  { label: 'clear', detail: '() -> None', info: 'Remove all items from the list.' },
];

const DICT_METHODS: CallableDef[] = [
  { label: 'get', detail: '(key, default=None)', info: 'Return value for key if present, else default.', params: [{ name: 'key', detail: 'K' }, { name: 'default', detail: 'V | None = None' }] },
  { label: 'items', detail: '() -> ItemsView', info: 'Return a view of (key, value) pairs.' },
  { label: 'keys', detail: '() -> KeysView', info: 'Return a view of the dictionary keys.' },
  { label: 'values', detail: '() -> ValuesView', info: 'Return a view of the dictionary values.' },
  { label: 'pop', detail: '(key, default=...)', info: 'Remove key and return its value (or default if given).', params: [{ name: 'key', detail: 'K' }, { name: 'default', detail: 'V' }] },
  { label: 'setdefault', detail: '(key, default=None)', info: 'Return value of key; if missing, insert key with default.', params: [{ name: 'key', detail: 'K' }, { name: 'default', detail: 'V | None = None' }] },
  { label: 'update', detail: '(other) -> None', info: 'Update dictionary with key/value pairs from other.', params: [{ name: 'other', detail: 'Mapping | Iterable' }] },
  { label: 'copy', detail: '() -> dict', info: 'Return a shallow copy of the dictionary.' },
  { label: 'clear', detail: '() -> None', info: 'Remove all items from the dictionary.' },
  { label: 'popitem', detail: '() -> tuple', info: 'Remove and return the last inserted (key, value) pair.' },
];

const COUNTER_METHODS: CallableDef[] = [
  { label: 'most_common', detail: '(n=None) -> list[tuple]', info: 'Return the n most common elements and their counts.', params: [{ name: 'n', detail: 'int | None = None' }] },
  { label: 'update', detail: '(iterable) -> None', info: 'Add counts from an iterable or another mapping.', params: [{ name: 'iterable', detail: 'Iterable | Mapping' }] },
  { label: 'subtract', detail: '(iterable) -> None', info: 'Subtract counts from an iterable or mapping.', params: [{ name: 'iterable', detail: 'Iterable | Mapping' }] },
  { label: 'elements', detail: '() -> Iterator', info: 'Return iterator repeating each element as many times as its count.' },
  { label: 'total', detail: '() -> int', info: 'Return the sum of all counts.' },
  ...DICT_METHODS,
];

const SET_METHODS: CallableDef[] = [
  { label: 'add', detail: '(elem) -> None', info: 'Add element to the set in O(1) average time.', params: [{ name: 'elem', detail: 'T' }] },
  { label: 'discard', detail: '(elem) -> None', info: 'Remove element if present (no error if absent).', params: [{ name: 'elem', detail: 'T' }] },
  { label: 'remove', detail: '(elem) -> None', info: 'Remove element (raises KeyError if absent).', params: [{ name: 'elem', detail: 'T' }] },
  { label: 'pop', detail: '() -> T', info: 'Remove and return an arbitrary set element.' },
  { label: 'update', detail: '(*others) -> None', info: 'Add elements from all other iterables.' },
  { label: 'union', detail: '(*others) -> set', info: 'Return a new set with elements from this set and all others.' },
  { label: 'intersection', detail: '(*others) -> set', info: 'Return a new set with elements common to all sets.' },
  { label: 'difference', detail: '(*others) -> set', info: 'Return a new set with elements not in the others.' },
  { label: 'symmetric_difference', detail: '(other) -> set', info: 'Return elements in either set, but not both.', params: [{ name: 'other', detail: 'Iterable[T]' }] },
  { label: 'issubset', detail: '(other) -> bool', info: 'Test whether every element in this set is in other.', params: [{ name: 'other', detail: 'Iterable[T]' }] },
  { label: 'issuperset', detail: '(other) -> bool', info: 'Test whether every element in other is in this set.', params: [{ name: 'other', detail: 'Iterable[T]' }] },
  { label: 'copy', detail: '() -> set', info: 'Return a shallow copy of the set.' },
  { label: 'clear', detail: '() -> None', info: 'Remove all elements from the set.' },
];

const DEQUE_METHODS: CallableDef[] = [
  { label: 'append', detail: '(x) -> None', info: 'Add x to the right side of the deque in O(1).', params: [{ name: 'x', detail: 'T' }] },
  { label: 'appendleft', detail: '(x) -> None', info: 'Add x to the left side of the deque in O(1).', params: [{ name: 'x', detail: 'T' }] },
  { label: 'pop', detail: '() -> T', info: 'Remove and return an element from the right side in O(1).' },
  { label: 'popleft', detail: '() -> T', info: 'Remove and return an element from the left side in O(1).' },
  { label: 'extend', detail: '(iterable) -> None', info: 'Extend the right side of the deque.', params: [{ name: 'iterable', detail: 'Iterable[T]' }] },
  { label: 'extendleft', detail: '(iterable) -> None', info: 'Extend the left side of the deque (reverses iterable order).', params: [{ name: 'iterable', detail: 'Iterable[T]' }] },
  { label: 'rotate', detail: '(n=1) -> None', info: 'Rotate the deque n steps to the right (negative rotates left).', params: [{ name: 'n', detail: 'int = 1' }] },
  { label: 'reverse', detail: '() -> None', info: 'Reverse the elements of the deque in-place.' },
  { label: 'count', detail: '(x) -> int', info: 'Count occurrences of x in the deque.', params: [{ name: 'x', detail: 'T' }] },
  { label: 'clear', detail: '() -> None', info: 'Remove all elements from the deque.' },
  { label: 'copy', detail: '() -> deque', info: 'Create a shallow copy of the deque.' },
];

const STR_METHODS: CallableDef[] = [
  { label: 'split', detail: '(sep=None, maxsplit=-1) -> list[str]', info: 'Split string into a list of substrings.', params: [{ name: 'sep', detail: 'str | None = None' }, { name: 'maxsplit', detail: 'int = -1' }] },
  { label: 'join', detail: '(iterable) -> str', info: 'Concatenate iterable of strings using this string as separator.', params: [{ name: 'iterable', detail: 'Iterable[str]' }] },
  { label: 'strip', detail: '(chars=None) -> str', info: 'Remove leading and trailing whitespace (or chars).', params: [{ name: 'chars', detail: 'str | None = None' }] },
  { label: 'lstrip', detail: '(chars=None) -> str', info: 'Remove leading whitespace (or chars).', params: [{ name: 'chars', detail: 'str | None = None' }] },
  { label: 'rstrip', detail: '(chars=None) -> str', info: 'Remove trailing whitespace (or chars).', params: [{ name: 'chars', detail: 'str | None = None' }] },
  { label: 'lower', detail: '() -> str', info: 'Return a lowercased copy of the string.' },
  { label: 'upper', detail: '() -> str', info: 'Return an uppercased copy of the string.' },
  { label: 'replace', detail: '(old, new, count=-1) -> str', info: 'Return copy with occurrences of old replaced by new.', params: [{ name: 'old', detail: 'str' }, { name: 'new', detail: 'str' }, { name: 'count', detail: 'int = -1' }] },
  { label: 'startswith', detail: '(prefix) -> bool', info: 'Return True if string starts with prefix.', params: [{ name: 'prefix', detail: 'str' }] },
  { label: 'endswith', detail: '(suffix) -> bool', info: 'Return True if string ends with suffix.', params: [{ name: 'suffix', detail: 'str' }] },
  { label: 'find', detail: '(sub) -> int', info: 'Return lowest index where sub is found, or -1.', params: [{ name: 'sub', detail: 'str' }] },
  { label: 'count', detail: '(sub) -> int', info: 'Return count of non-overlapping occurrences of sub.', params: [{ name: 'sub', detail: 'str' }] },
  { label: 'isdigit', detail: '() -> bool', info: 'Return True if all characters are digits.' },
  { label: 'isalpha', detail: '() -> bool', info: 'Return True if all characters are alphabetic.' },
  { label: 'isalnum', detail: '() -> bool', info: 'Return True if all characters are alphanumeric.' },
];

const IRANGE_PARAMS: ParamDef[] = [
  { name: 'minimum', detail: 'K | None = None' },
  { name: 'maximum', detail: 'K | None = None' },
  { name: 'inclusive', detail: 'tuple[bool, bool] = (True, True)' },
  { name: 'reverse', detail: 'bool = False' },
];

const ISLICE_PARAMS: ParamDef[] = [
  { name: 'start', detail: 'int | None = None' },
  { name: 'stop', detail: 'int | None = None' },
  { name: 'reverse', detail: 'bool = False' },
];

const SORTED_DICT_METHODS: CallableDef[] = [
  { label: 'peekitem', detail: '(index=-1) -> tuple', info: 'Return (key, value) at sorted index without removing.', params: [{ name: 'index', detail: 'int = -1' }] },
  { label: 'popitem', detail: '(index=-1) -> tuple', info: 'Remove and return (key, value) at sorted index.', params: [{ name: 'index', detail: 'int = -1' }] },
  { label: 'bisect_left', detail: '(key) -> int', info: 'Return insertion index for key to keep keys sorted (left).', params: [{ name: 'key', detail: 'K' }] },
  { label: 'bisect_right', detail: '(key) -> int', info: 'Return insertion index for key to keep keys sorted (right).', params: [{ name: 'key', detail: 'K' }] },
  { label: 'irange', detail: '(minimum=None, maximum=None, inclusive=(True, True), reverse=False)', info: 'Iterate over keys between minimum and maximum.', params: IRANGE_PARAMS },
  { label: 'islice', detail: '(start=None, stop=None, reverse=False)', info: 'Iterate over a slice of sorted keys.', params: ISLICE_PARAMS },
  { label: 'index', detail: '(key) -> int', info: 'Return sorted position of key.', params: [{ name: 'key', detail: 'K' }] },
  ...DICT_METHODS.filter((m) => m.label !== 'popitem'),
];

const SORTED_SET_METHODS: CallableDef[] = [
  { label: 'add', detail: '(value) -> None', info: 'Add value in sorted order in O(log n).', params: [{ name: 'value', detail: 'T' }] },
  { label: 'discard', detail: '(value) -> None', info: 'Remove value if present in O(log n).', params: [{ name: 'value', detail: 'T' }] },
  { label: 'remove', detail: '(value) -> None', info: 'Remove value (raises KeyError if missing).', params: [{ name: 'value', detail: 'T' }] },
  { label: 'pop', detail: '(index=-1) -> T', info: 'Remove and return element at sorted index.', params: [{ name: 'index', detail: 'int = -1' }] },
  { label: 'bisect_left', detail: '(value) -> int', info: 'Return index of first element >= value.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'bisect_right', detail: '(value) -> int', info: 'Return index of first element > value.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'irange', detail: '(minimum=None, maximum=None, inclusive=(True, True), reverse=False)', info: 'Iterate values between minimum and maximum.', params: IRANGE_PARAMS },
  { label: 'islice', detail: '(start=None, stop=None, reverse=False)', info: 'Iterate over a slice of values.', params: ISLICE_PARAMS },
  { label: 'index', detail: '(value) -> int', info: 'Return sorted index of value.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'count', detail: '(value) -> int', info: 'Return 1 if value in set, else 0.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'update', detail: '(*iterables) -> None', info: 'Add all elements from iterables.' },
  { label: 'union', detail: '(*iterables) -> SortedSet', info: 'Return union as a SortedSet.' },
  { label: 'intersection', detail: '(*iterables) -> SortedSet', info: 'Return intersection as a SortedSet.' },
  { label: 'difference', detail: '(*iterables) -> SortedSet', info: 'Return difference as a SortedSet.' },
  { label: 'clear', detail: '() -> None', info: 'Remove all elements.' },
  { label: 'copy', detail: '() -> SortedSet', info: 'Return a shallow copy.' },
];

const TUPLE_METHODS: CallableDef[] = [
  { label: 'count', detail: '(value) -> int', info: 'Return number of occurrences of value.', params: [{ name: 'value', detail: 'T' }] },
  { label: 'index', detail: '(value, start=0, stop=...) -> int', info: 'Return first index of value.', params: [{ name: 'value', detail: 'T' }, { name: 'start', detail: 'int = 0' }] },
];

const MODULE_MEMBERS: Record<string, CallableDef[]> = {
  heapq: [
    { label: 'heappush', detail: '(heap, item) -> None', info: 'Push item onto min-heap in O(log n).', type: 'function', params: [{ name: 'heap', detail: 'list' }, { name: 'item', detail: 'T' }] },
    { label: 'heappop', detail: '(heap) -> T', info: 'Pop and return smallest item from min-heap in O(log n).', type: 'function', params: [{ name: 'heap', detail: 'list' }] },
    { label: 'heapify', detail: '(x) -> None', info: 'Transform list x into a min-heap in-place in O(n).', type: 'function', params: [{ name: 'x', detail: 'list' }] },
    { label: 'nsmallest', detail: '(n, iterable, key=None) -> list', info: 'Return list with the n smallest elements.', type: 'function', params: [{ name: 'n', detail: 'int' }, { name: 'iterable', detail: 'Iterable' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'nlargest', detail: '(n, iterable, key=None) -> list', info: 'Return list with the n largest elements.', type: 'function', params: [{ name: 'n', detail: 'int' }, { name: 'iterable', detail: 'Iterable' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'heappushpop', detail: '(heap, item) -> T', info: 'Push item then pop and return smallest item.', type: 'function', params: [{ name: 'heap', detail: 'list' }, { name: 'item', detail: 'T' }] },
    { label: 'heapreplace', detail: '(heap, item) -> T', info: 'Pop and return smallest item, then push new item.', type: 'function', params: [{ name: 'heap', detail: 'list' }, { name: 'item', detail: 'T' }] },
  ],
  collections: [
    { label: 'deque', detail: '(iterable=(), maxlen=None)', info: 'Double-ended queue with O(1) append/pop at both ends.', type: 'class', params: [{ name: 'iterable', detail: 'Iterable = ()' }, { name: 'maxlen', detail: 'int | None = None' }] },
    { label: 'defaultdict', detail: '(default_factory)', info: 'Dict subclass that calls factory for missing keys.', type: 'class', params: [{ name: 'default_factory', detail: 'Callable' }] },
    { label: 'Counter', detail: '(iterable=None)', info: 'Dict subclass for counting hashable objects.', type: 'class', params: [{ name: 'iterable', detail: 'Iterable | Mapping' }] },
    { label: 'OrderedDict', detail: '()', info: 'Dict subclass with order-rearrangement methods.', type: 'class' },
  ],
  sortedcontainers: [
    { label: 'SortedDict', detail: '(*args, **kwargs)', info: 'Dictionary that maintains keys in sorted order.', type: 'class' },
    { label: 'SortedSet', detail: '(iterable=None, key=None)', info: 'Set that maintains unique values in sorted order.', type: 'class', params: [{ name: 'iterable', detail: 'Iterable = None' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'SortedList', detail: '(iterable=None, key=None)', info: 'List that maintains values in sorted order.', type: 'class', params: [{ name: 'iterable', detail: 'Iterable = None' }, { name: 'key', detail: 'Callable | None = None' }] },
  ],
  copy: [
    { label: 'deepcopy', detail: '(x)', info: 'Return a deep copy of x (including nested objects).', type: 'function', params: [{ name: 'x', detail: 'Any' }] },
    { label: 'copy', detail: '(x)', info: 'Return a shallow copy of x.', type: 'function', params: [{ name: 'x', detail: 'Any' }] },
  ],
  math: [
    { label: 'inf', detail: 'float', info: 'Floating-point positive infinity.', type: 'constant' },
    { label: 'sqrt', detail: '(x) -> float', info: 'Return the square root of x.', type: 'function', params: [{ name: 'x', detail: 'float' }] },
    { label: 'isqrt', detail: '(n) -> int', info: 'Return integer square root of non-negative integer n.', type: 'function', params: [{ name: 'n', detail: 'int' }] },
    { label: 'floor', detail: '(x) -> int', info: 'Return largest integer <= x.', type: 'function', params: [{ name: 'x', detail: 'float' }] },
    { label: 'ceil', detail: '(x) -> int', info: 'Return smallest integer >= x.', type: 'function', params: [{ name: 'x', detail: 'float' }] },
    { label: 'gcd', detail: '(*integers) -> int', info: 'Return greatest common divisor.', type: 'function' },
  ],
  bisect: [
    { label: 'bisect_left', detail: '(a, x, lo=0, hi=len(a), key=None) -> int', info: 'Locate left insertion point for x in sorted list a.', type: 'function', params: [{ name: 'a', detail: 'Sequence' }, { name: 'x', detail: 'T' }, { name: 'lo', detail: 'int = 0' }, { name: 'hi', detail: 'int' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'bisect_right', detail: '(a, x, lo=0, hi=len(a), key=None) -> int', info: 'Locate right insertion point for x in sorted list a.', type: 'function', params: [{ name: 'a', detail: 'Sequence' }, { name: 'x', detail: 'T' }, { name: 'lo', detail: 'int = 0' }, { name: 'hi', detail: 'int' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'insort_left', detail: '(a, x, lo=0, hi=len(a), key=None) -> None', info: 'Insert x into sorted list a keeping it sorted.', type: 'function', params: [{ name: 'a', detail: 'list' }, { name: 'x', detail: 'T' }, { name: 'lo', detail: 'int = 0' }, { name: 'hi', detail: 'int' }, { name: 'key', detail: 'Callable | None = None' }] },
    { label: 'insort_right', detail: '(a, x, lo=0, hi=len(a), key=None) -> None', info: 'Insert x into sorted list a after existing entries.', type: 'function', params: [{ name: 'a', detail: 'list' }, { name: 'x', detail: 'T' }, { name: 'lo', detail: 'int = 0' }, { name: 'hi', detail: 'int' }, { name: 'key', detail: 'Callable | None = None' }] },
  ],
};

const TYPE_METHODS: Record<string, CallableDef[]> = {
  list: LIST_METHODS,
  dict: DICT_METHODS,
  defaultdict: DICT_METHODS,
  counter: COUNTER_METHODS,
  set: SET_METHODS,
  deque: DEQUE_METHODS,
  str: STR_METHODS,
  tuple: TUPLE_METHODS,
  sorteddict: SORTED_DICT_METHODS,
  sortedset: SORTED_SET_METHODS,
};

const ALL_COMMON_METHODS: CallableDef[] = (() => {
  const seen = new Set<string>();
  const combined: CallableDef[] = [];
  for (const list of [
    LIST_METHODS,
    DICT_METHODS,
    SET_METHODS,
    DEQUE_METHODS,
    STR_METHODS,
    COUNTER_METHODS,
    SORTED_DICT_METHODS,
    SORTED_SET_METHODS,
  ]) {
    for (const item of list) {
      if (!seen.has(item.label)) {
        seen.add(item.label);
        combined.push(item);
      }
    }
  }
  return combined;
})();

const PYTHON_BUILTINS: CallableDef[] = [
  { label: 'sorted', type: 'function', detail: '(iterable, key=None, reverse=False) -> list', info: 'Return a new sorted list from iterable.', params: [{ name: 'iterable', detail: 'Iterable' }, ...SORT_PARAMS] },
  { label: 'len', type: 'function', detail: '(s) -> int', info: 'Return the number of items in a container.', params: [{ name: 's', detail: 'Sized' }] },
  { label: 'range', type: 'function', detail: '(start, stop, step=1)', info: 'Return an immutable sequence of integers.', params: [{ name: 'start', detail: 'int' }, { name: 'stop', detail: 'int' }, { name: 'step', detail: 'int = 1' }] },
  { label: 'enumerate', type: 'function', detail: '(iterable, start=0)', info: 'Yield (index, item) pairs from iterable.', params: [{ name: 'iterable', detail: 'Iterable' }, { name: 'start', detail: 'int = 0' }] },
  { label: 'zip', type: 'function', detail: '(*iterables, strict=False)', info: 'Iterate over multiple iterables in parallel.', params: [{ name: 'strict', detail: 'bool = False', kwOnly: true }] },
  { label: 'min', type: 'function', detail: '(iterable | *args, key=None, default=...)', info: 'Return the smallest item.', params: [{ name: 'key', detail: 'Callable | None = None', kwOnly: true }, { name: 'default', detail: 'T', kwOnly: true }] },
  { label: 'max', type: 'function', detail: '(iterable | *args, key=None, default=...)', info: 'Return the largest item.', params: [{ name: 'key', detail: 'Callable | None = None', kwOnly: true }, { name: 'default', detail: 'T', kwOnly: true }] },
  { label: 'abs', type: 'function', detail: '(x)', info: 'Return the absolute value of a number.', params: [{ name: 'x', detail: 'int | float' }] },
  { label: 'sum', type: 'function', detail: '(iterable, start=0)', info: 'Return the sum of items in iterable.', params: [{ name: 'iterable', detail: 'Iterable' }, { name: 'start', detail: 'int = 0' }] },
  { label: 'print', type: 'function', detail: '(*values, sep=" ", end="\\n")', info: 'Print values to standard output.', params: [{ name: 'sep', detail: 'str = " "', kwOnly: true }, { name: 'end', detail: 'str = "\\n"', kwOnly: true }, { name: 'flush', detail: 'bool = False', kwOnly: true }] },
  { label: 'list', type: 'class', detail: '(iterable=())', info: 'Construct a new list.' },
  { label: 'dict', type: 'class', detail: '(mapping | iterable)', info: 'Construct a new dictionary.' },
  { label: 'set', type: 'class', detail: '(iterable=())', info: 'Construct a new set of unique elements.' },
  { label: 'tuple', type: 'class', detail: '(iterable=())', info: 'Construct an immutable tuple.' },
  { label: 'int', type: 'class', detail: '(x=0, base=10)', info: 'Convert value to an integer.', params: [{ name: 'x', detail: 'str | int = 0' }, { name: 'base', detail: 'int = 10' }] },
  { label: 'float', type: 'class', detail: '(x=0.0)', info: 'Convert value to a floating-point number (e.g. float("inf")).' },
  { label: 'str', type: 'class', detail: '(obj="")', info: 'Return string representation of obj.' },
  { label: 'bool', type: 'class', detail: '(x=False)', info: 'Convert value to a boolean.' },
  { label: 'reversed', type: 'function', detail: '(seq)', info: 'Return a reverse iterator over a sequence.' },
  { label: 'all', type: 'function', detail: '(iterable) -> bool', info: 'Return True if all elements are truthy.' },
  { label: 'any', type: 'function', detail: '(iterable) -> bool', info: 'Return True if any element is truthy.' },
  { label: 'isinstance', type: 'function', detail: '(obj, classinfo) -> bool', info: 'Check if obj is an instance of classinfo.' },
  { label: 'type', type: 'function', detail: '(obj)', info: 'Return the type of obj.' },
  { label: 'map', type: 'function', detail: '(func, *iterables)', info: 'Apply func to every item of iterable.' },
  { label: 'filter', type: 'function', detail: '(func, iterable)', info: 'Yield items where func(item) is truthy.' },
  { label: 'ord', type: 'function', detail: '(c) -> int', info: 'Return Unicode code point for a one-character string.' },
  { label: 'chr', type: 'function', detail: '(i) -> str', info: 'Return one-character string for Unicode code point i.' },
  { label: 'round', type: 'function', detail: '(number, ndigits=None)', info: 'Return number rounded to ndigits precision.', params: [{ name: 'number', detail: 'float' }, { name: 'ndigits', detail: 'int | None = None' }] },
  { label: 'divmod', type: 'function', detail: '(a, b) -> (q, r)', info: 'Return quotient and remainder tuple.' },
  { label: 'pow', type: 'function', detail: '(base, exp, mod=None)', info: 'Return base to the power exp (optionally modulo mod).', params: [{ name: 'base', detail: 'int | float' }, { name: 'exp', detail: 'int | float' }, { name: 'mod', detail: 'int | None = None' }] },
  // Common imported classes so calls like deque(..., maxlen=...) get parameter hints too
  { label: 'deque', type: 'class', detail: '(iterable=(), maxlen=None)', info: 'Double-ended queue from collections.', params: [{ name: 'iterable', detail: 'Iterable = ()' }, { name: 'maxlen', detail: 'int | None = None' }] },
  { label: 'defaultdict', type: 'class', detail: '(default_factory)', info: 'Dict with automatic default values from collections.', params: [{ name: 'default_factory', detail: 'Callable' }] },
  { label: 'Counter', type: 'class', detail: '(iterable=None)', info: 'Frequency counter dict from collections.', params: [{ name: 'iterable', detail: 'Iterable | Mapping' }] },
  { label: 'SortedDict', type: 'class', detail: '(*args, **kwargs)', info: 'Sorted dictionary from sortedcontainers.' },
  { label: 'SortedSet', type: 'class', detail: '(iterable=None, key=None)', info: 'Sorted set from sortedcontainers.', params: [{ name: 'iterable', detail: 'Iterable = None' }, { name: 'key', detail: 'Callable | None = None' }] },
];

const BUILTIN_MAP = new Map<string, CallableDef>(
  PYTHON_BUILTINS.map((b) => [b.label, b])
);

const PYTHON_KEYWORDS: Completion[] = [
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not',
  'and', 'or', 'True', 'False', 'None', 'pass', 'break', 'continue',
  'lambda', 'import', 'from', 'as', 'class', 'try', 'except', 'finally',
  'with', 'yield', 'raise', 'del', 'is', 'assert', 'global', 'nonlocal',
].map((kw) => ({ label: kw, type: 'keyword', boost: -1 }));

function normalizeTypeName(rawType: string): string | null {
  const base = rawType.split('[')[0].trim().toLowerCase();
  if (base === 'list') return 'list';
  if (base === 'dict') return 'dict';
  if (base === 'defaultdict') return 'defaultdict';
  if (base === 'counter') return 'counter';
  if (base === 'set') return 'set';
  if (base === 'deque') return 'deque';
  if (base === 'str') return 'str';
  if (base === 'tuple') return 'tuple';
  if (base === 'sorteddict') return 'sorteddict';
  if (base === 'sortedset') return 'sortedset';
  return null;
}

interface AnalyzedDoc {
  varTypes: Map<string, string>;
  locals: Set<string>;
  userFunctions: Map<string, CallableDef>;
}

function analyzeDocument(docText: string): AnalyzedDoc {
  const varTypes = new Map<string, string>();
  const locals = new Set<string>();
  const userFunctions = new Map<string, CallableDef>();

  // 1. Parameter & variable annotations
  const annotRegex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]*\])?)/g;
  let match: RegExpExecArray | null;
  while ((match = annotRegex.exec(docText)) !== null) {
    const [, name, rawType] = match;
    locals.add(name);
    const norm = normalizeTypeName(rawType);
    if (norm) varTypes.set(name, norm);
  }

  // 2. Assignments
  const assignRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/gm;
  while ((match = assignRegex.exec(docText)) !== null) {
    const [, name, rhsRaw] = match;
    locals.add(name);
    const rhs = rhsRaw.trim();
    if (rhs.startsWith('[') || rhs.startsWith('list(') || rhs.startsWith('sorted(')) {
      varTypes.set(name, 'list');
    } else if (rhs.startsWith('defaultdict(')) {
      varTypes.set(name, 'defaultdict');
    } else if (rhs.startsWith('Counter(')) {
      varTypes.set(name, 'counter');
    } else if (rhs.startsWith('SortedDict(')) {
      varTypes.set(name, 'sorteddict');
    } else if (rhs.startsWith('SortedSet(')) {
      varTypes.set(name, 'sortedset');
    } else if (rhs.startsWith('deque(')) {
      varTypes.set(name, 'deque');
    } else if (rhs.startsWith('set(')) {
      varTypes.set(name, 'set');
    } else if (rhs.startsWith('{') || rhs.startsWith('dict(')) {
      if (rhs === '{}' || rhs.includes(':') || rhs.startsWith('dict(')) {
        varTypes.set(name, 'dict');
      } else {
        varTypes.set(name, 'set');
      }
    } else if (rhs.startsWith('"') || rhs.startsWith("'") || rhs.startsWith('f"') || rhs.startsWith("f'") || rhs.startsWith('str(')) {
      varTypes.set(name, 'str');
    } else if (rhs.startsWith('(') || rhs.startsWith('tuple(')) {
      varTypes.set(name, 'tuple');
    }
  }

  // 3. Function definitions (collect params for keyword-arg completion & signature help)
  const defRegex = /\bdef\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)(?:\s*->\s*([^:\n]+))?/g;
  while ((match = defRegex.exec(docText)) !== null) {
    const [, fnName, rawParams, rawReturn] = match;
    locals.add(fnName);
    const parsedParams: ParamDef[] = [];
    for (const part of rawParams.split(',')) {
      const trimmed = part.trim();
      if (!trimmed || trimmed === '*' || trimmed === '/') continue;
      const [nameAndType, defaultVal] = trimmed.split('=');
      const [rawName, rawType] = nameAndType.split(':');
      const pName = rawName.trim().replace(/^\*+/, '');
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(pName)) {
        locals.add(pName);
        if (pName !== 'self' && pName !== 'cls') {
          const detailParts: string[] = [];
          if (rawType) detailParts.push(rawType.trim());
          if (defaultVal) detailParts.push(`= ${defaultVal.trim()}`);
          parsedParams.push({
            name: pName,
            detail: detailParts.join(' ') || undefined,
          });
        }
      }
    }
    const sigDetail = `(${rawParams.trim()})${rawReturn ? ` -> ${rawReturn.trim()}` : ''}`;
    userFunctions.set(fnName, {
      label: fnName,
      detail: sigDetail,
      info: `User-defined function ${fnName}`,
      type: 'function',
      params: parsedParams,
    });
  }

  const importRegex = /\b(?:import|from\s+[A-Za-z0-9_.]+\s+import)\s+([^\n#]+)/g;
  while ((match = importRegex.exec(docText)) !== null) {
    for (const part of match[1].split(',')) {
      const alias = part.split(/\bas\b/).pop()?.trim();
      if (alias && /^[A-Za-z_][A-Za-z0-9_]*$/.test(alias)) {
        locals.add(alias);
      }
    }
  }

  const forRegex = /\bfor\s+([A-Za-z_][A-Za-z0-9_,\s*]*)\s+in\b/g;
  while ((match = forRegex.exec(docText)) !== null) {
    for (const v of match[1].split(',')) {
      const cleaned = v.trim().replace(/^\*+/, '');
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(cleaned) && cleaned !== '_') {
        locals.add(cleaned);
      }
    }
  }

  return { varTypes, locals, userFunctions };
}

function isInsideCommentOrString(lineBefore: string): boolean {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < lineBefore.length; i++) {
    const ch = lineBefore[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === '#') {
      return true;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
    } else if (!inSingle && ch === '"') {
      inDouble = !inDouble;
    }
  }
  return inSingle || inDouble;
}

interface CallContext {
  openParenPos: number;
  receiver: string | null;
  callee: string;
  argIndex: number;
  usedKwargs: Set<string>;
  inKeywordValue: boolean;
}

/**
 * Finds the innermost unclosed function/method call surrounding `pos`.
 */
function findEnclosingCall(docText: string, pos: number): CallContext | null {
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let openParenPos = -1;

  // Walk backward from pos to find the innermost unclosed '('
  for (let i = pos - 1; i >= 0; i--) {
    const ch = docText[i];
    // Handle quotes (approximate backward scan)
    if (ch === "'" && !inDouble && docText[i - 1] !== '\\') {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle && docText[i - 1] !== '\\') {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;

    if (ch === ')') parenDepth++;
    else if (ch === '(') {
      if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
        openParenPos = i;
        break;
      }
      if (parenDepth > 0) parenDepth--;
    } else if (ch === ']') bracketDepth++;
    else if (ch === '[' && bracketDepth > 0) bracketDepth--;
    else if (ch === '}') braceDepth++;
    else if (ch === '{' && braceDepth > 0) braceDepth--;
  }

  if (openParenPos === -1) return null;

  // Extract callee before '(' — ignore `def foo(` declarations
  const beforeParen = docText.slice(Math.max(0, openParenPos - 80), openParenPos);
  if (/\b(?:def|class)\s+[A-Za-z_][A-Za-z0-9_]*\s*$/.test(beforeParen)) {
    return null;
  }

  const calleeMatch = beforeParen.match(/(?:([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*)?([A-Za-z_][A-Za-z0-9_]*)\s*$/);
  if (!calleeMatch) return null;

  const receiver = calleeMatch[1] ?? null;
  const callee = calleeMatch[2];

  // Parse top-level arguments between openParenPos + 1 and pos
  const inside = docText.slice(openParenPos + 1, pos);
  let depth = 0;
  let sQuote = false;
  let dQuote = false;
  let argIndex = 0;
  let currentArgStart = 0;
  const usedKwargs = new Set<string>();

  const recordKwarg = (segment: string) => {
    const m = segment.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/);
    if (m) usedKwargs.add(m[1]);
  };

  for (let i = 0; i < inside.length; i++) {
    const ch = inside[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (!dQuote && ch === "'") {
      sQuote = !sQuote;
      continue;
    }
    if (!sQuote && ch === '"') {
      dQuote = !dQuote;
      continue;
    }
    if (sQuote || dQuote) continue;

    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      recordKwarg(inside.slice(currentArgStart, i));
      argIndex++;
      currentArgStart = i + 1;
    }
  }

  const currentArgText = inside.slice(currentArgStart);
  const inKeywordValue = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=(?!=)/.test(currentArgText);

  return {
    openParenPos,
    receiver,
    callee,
    argIndex,
    usedKwargs,
    inKeywordValue,
  };
}

function resolveCallable(call: CallContext, analyzed: AnalyzedDoc): CallableDef | null {
  if (call.receiver) {
    if (MODULE_MEMBERS[call.receiver]) {
      return MODULE_MEMBERS[call.receiver].find((m) => m.label === call.callee) ?? null;
    }
    const inferredType = analyzed.varTypes.get(call.receiver);
    if (inferredType && TYPE_METHODS[inferredType]) {
      const found = TYPE_METHODS[inferredType].find((m) => m.label === call.callee);
      if (found) return found;
    }
    return ALL_COMMON_METHODS.find((m) => m.label === call.callee) ?? null;
  }

  return analyzed.userFunctions.get(call.callee) ?? BUILTIN_MAP.get(call.callee) ?? null;
}

function toCompletions(defs: CallableDef[], boost = 0): Completion[] {
  return defs.map((m) => ({
    label: m.label,
    type: m.type ?? 'method',
    detail: m.detail,
    info: m.info,
    boost,
  }));
}

export function pythonCompletionSource(
  context: CompletionContext
): CompletionResult | null {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (
    nodeBefore.name === 'Comment' ||
    nodeBefore.name === 'String' ||
    nodeBefore.name === 'FormatString'
  ) {
    return null;
  }

  const line = context.state.doc.lineAt(context.pos);
  const lineBefore = line.text.slice(0, context.pos - line.from);
  if (isInsideCommentOrString(lineBefore)) {
    return null;
  }

  const docText = context.state.doc.toString();
  const analyzed = analyzeDocument(docText);

  // Case 1: Member / dot completion (`words.`, `words.sor`, `heapq.heap`)
  const memberMatch = context.matchBefore(/([A-Za-z_][A-Za-z0-9_]*)\.[A-Za-z0-9_]*/);
  if (memberMatch) {
    const dotIndex = memberMatch.text.indexOf('.');
    const receiver = memberMatch.text.slice(0, dotIndex);
    const from = memberMatch.from + dotIndex + 1;

    if (MODULE_MEMBERS[receiver]) {
      return {
        from,
        options: toCompletions(MODULE_MEMBERS[receiver], 2),
        validFor: /^[A-Za-z0-9_]*$/,
      };
    }

    const inferredType = analyzed.varTypes.get(receiver);
    if (inferredType && TYPE_METHODS[inferredType]) {
      return {
        from,
        options: toCompletions(TYPE_METHODS[inferredType], 2),
        validFor: /^[A-Za-z0-9_]*$/,
      };
    }

    return {
      from,
      options: toCompletions(ALL_COMMON_METHODS, 0),
      validFor: /^[A-Za-z0-9_]*$/,
    };
  }

  // Case 2: Inside a call — collect keyword parameter suggestions (`key=`, `reverse=`, etc.)
  const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
  const callCtx = findEnclosingCall(docText, context.pos);
  const paramOptions: Completion[] = [];

  if (callCtx && !callCtx.inKeywordValue) {
    const callable = resolveCallable(callCtx, analyzed);
    if (callable?.params) {
      for (const param of callable.params) {
        if (callCtx.usedKwargs.has(param.name)) continue;
        paramOptions.push({
          label: `${param.name}=`,
          type: 'property',
          detail: param.detail ?? 'parameter',
          info: param.info ?? `Keyword argument "${param.name}" of ${callable.label}()`,
          boost: 10,
        });
      }
    }
  }

  if (!word && !context.explicit) return null;

  const from = word ? word.from : context.pos;
  const options: Completion[] = [...paramOptions];
  const seen = new Set<string>(paramOptions.map((p) => p.label));

  for (const name of analyzed.locals) {
    if (!seen.has(name)) {
      seen.add(name);
      const inferred = analyzed.varTypes.get(name);
      const userFn = analyzed.userFunctions.get(name);
      options.push({
        label: name,
        type: userFn ? 'function' : 'variable',
        detail: userFn ? userFn.detail : inferred,
        boost: 3,
      });
    }
  }

  for (const b of PYTHON_BUILTINS) {
    if (!seen.has(b.label)) {
      seen.add(b.label);
      options.push({
        label: b.label,
        type: b.type ?? 'function',
        detail: b.detail,
        info: b.info,
        boost: 1,
      });
    }
  }

  for (const kw of PYTHON_KEYWORDS) {
    if (!seen.has(kw.label)) {
      seen.add(kw.label);
      options.push(kw);
    }
  }

  return {
    from,
    options,
    validFor: /^[A-Za-z0-9_]*$/,
  };
}

/**
 * Live Signature Help Tooltip: displays the function/method signature
 * (e.g. `sort(key=None, reverse=False) -> None`) above the cursor whenever
 * the user is typing arguments inside `(...)`.
 */
function buildSignatureTooltip(state: EditorState): Tooltip | null {
  const sel = state.selection.main;
  if (!sel.empty) return null;

  const pos = sel.head;
  const line = state.doc.lineAt(pos);
  const lineBefore = line.text.slice(0, pos - line.from);
  if (isInsideCommentOrString(lineBefore)) return null;

  const docText = state.doc.toString();
  const callCtx = findEnclosingCall(docText, pos);
  if (!callCtx) return null;

  const analyzed = analyzeDocument(docText);
  const callable = resolveCallable(callCtx, analyzed);
  if (!callable) return null;

  return {
    pos: callCtx.openParenPos,
    above: true,
    strictSide: false,
    arrow: false,
    create() {
      const dom = document.createElement('div');
      dom.className = 'cm-signature-tooltip';

      const sigLine = document.createElement('div');
      sigLine.className = 'cm-signature-line';

      const nameEl = document.createElement('span');
      nameEl.className = 'cm-signature-name';
      nameEl.textContent = callable.label;
      sigLine.appendChild(nameEl);

      const detailEl = document.createElement('span');
      detailEl.className = 'cm-signature-params';
      detailEl.textContent = callable.detail;
      sigLine.appendChild(detailEl);

      dom.appendChild(sigLine);

      if (callable.info) {
        const desc = document.createElement('div');
        desc.className = 'cm-signature-doc';
        desc.textContent = callable.info;
        dom.appendChild(desc);
      }

      return { dom };
    },
  };
}

export const pythonSignatureHelp = StateField.define<Tooltip | null>({
  create(state) {
    return buildSignatureTooltip(state);
  },
  update(value, tr) {
    if (!tr.docChanged && !tr.selection) return value;
    return buildSignatureTooltip(tr.state);
  },
  provide: (f) => showTooltip.from(f),
});
