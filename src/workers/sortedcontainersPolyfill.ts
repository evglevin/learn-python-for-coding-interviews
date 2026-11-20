/**
 * Pure-Python implementation of `sortedcontainers` (`SortedDict`, `SortedSet`, `SortedList`)
 * installed into Pyodide's virtual filesystem on worker boot so Section 8
 * (`from sortedcontainers import SortedDict, SortedSet`) works immediately offline.
 */
export const SORTEDCONTAINERS_PY = `
import bisect
from collections.abc import MutableMapping, MutableSet, Sequence

class SortedList(Sequence):
    def __init__(self, iterable=None, key=None):
        self._key = key
        self._list = []
        self._keys = []
        if iterable is not None:
            self.update(iterable)

    def _get_key(self, val):
        return self._key(val) if self._key is not None else val

    def add(self, value):
        k = self._get_key(value)
        idx = bisect.bisect_right(self._keys, k)
        self._keys.insert(idx, k)
        self._list.insert(idx, value)

    def update(self, iterable):
        for val in iterable:
            self.add(val)

    def discard(self, value):
        k = self._get_key(value)
        idx = bisect.bisect_left(self._keys, k)
        while idx < len(self._list) and self._keys[idx] == k:
            if self._list[idx] == value:
                del self._list[idx]
                del self._keys[idx]
                return
            idx += 1

    def remove(self, value):
        k = self._get_key(value)
        idx = bisect.bisect_left(self._keys, k)
        while idx < len(self._list) and self._keys[idx] == k:
            if self._list[idx] == value:
                del self._list[idx]
                del self._keys[idx]
                return
            idx += 1
        raise ValueError(f"{value!r} not in list")

    def pop(self, index=-1):
        self._keys.pop(index)
        return self._list.pop(index)

    def clear(self):
        self._list.clear()
        self._keys.clear()

    def bisect_left(self, value):
        return bisect.bisect_left(self._keys, self._get_key(value))

    def bisect_right(self, value):
        return bisect.bisect_right(self._keys, self._get_key(value))

    bisect = bisect_right

    def index(self, value, start=0, stop=None):
        if stop is None:
            stop = len(self._list)
        k = self._get_key(value)
        idx = bisect.bisect_left(self._keys, k, start, stop)
        while idx < stop and self._keys[idx] == k:
            if self._list[idx] == value:
                return idx
            idx += 1
        raise ValueError(f"{value!r} is not in list")

    def count(self, value):
        k = self._get_key(value)
        lo = bisect.bisect_left(self._keys, k)
        hi = bisect.bisect_right(self._keys, k)
        return sum(1 for i in range(lo, hi) if self._list[i] == value)

    def irange(self, minimum=None, maximum=None, inclusive=(True, True), reverse=False):
        lo = 0 if minimum is None else (self.bisect_left(minimum) if inclusive[0] else self.bisect_right(minimum))
        hi = len(self._list) if maximum is None else (self.bisect_right(maximum) if inclusive[1] else self.bisect_left(maximum))
        sl = self._list[lo:hi]
        return iter(reversed(sl) if reverse else sl)

    def islice(self, start=None, stop=None, reverse=False):
        sl = self._list[start:stop]
        return iter(reversed(sl) if reverse else sl)

    def copy(self):
        return SortedList(self._list, key=self._key)

    def __contains__(self, value):
        k = self._get_key(value)
        idx = bisect.bisect_left(self._keys, k)
        while idx < len(self._list) and self._keys[idx] == k:
            if self._list[idx] == value:
                return True
            idx += 1
        return False

    def __getitem__(self, index):
        return self._list[index]

    def __delitem__(self, index):
        del self._list[index]
        del self._keys[index]

    def __len__(self):
        return len(self._list)

    def __iter__(self):
        return iter(self._list)

    def __reversed__(self):
        return reversed(self._list)

    def __eq__(self, other):
        if isinstance(other, SortedList):
            return self._list == other._list
        if isinstance(other, list):
            return self._list == other
        return NotImplemented

    def __repr__(self):
        return f"SortedList({self._list!r})"


class SortedSet(MutableSet):
    def __init__(self, iterable=None, key=None):
        self._key = key
        self._set = set()
        self._list = SortedList(key=key)
        if iterable is not None:
            self.update(iterable)

    def add(self, value):
        if value not in self._set:
            self._set.add(value)
            self._list.add(value)

    def discard(self, value):
        if value in self._set:
            self._set.remove(value)
            self._list.remove(value)

    def remove(self, value):
        if value not in self._set:
            raise KeyError(value)
        self._set.remove(value)
        self._list.remove(value)

    def pop(self, index=-1):
        val = self._list.pop(index)
        self._set.remove(val)
        return val

    def clear(self):
        self._set.clear()
        self._list.clear()

    def update(self, *iterables):
        for it in iterables:
            for val in it:
                self.add(val)

    def union(self, *iterables):
        res = self.copy()
        res.update(*iterables)
        return res

    def intersection(self, *iterables):
        common = set(self._set)
        for it in iterables:
            common.intersection_update(it)
        return SortedSet(common, key=self._key)

    def difference(self, *iterables):
        diff = set(self._set)
        for it in iterables:
            diff.difference_update(it)
        return SortedSet(diff, key=self._key)

    def symmetric_difference(self, other):
        return SortedSet(self._set.symmetric_difference(other), key=self._key)

    def copy(self):
        return SortedSet(self._list, key=self._key)

    def bisect_left(self, value):
        return self._list.bisect_left(value)

    def bisect_right(self, value):
        return self._list.bisect_right(value)

    bisect = bisect_right

    def index(self, value, start=0, stop=None):
        return self._list.index(value, start, stop)

    def count(self, value):
        return 1 if value in self._set else 0

    def irange(self, minimum=None, maximum=None, inclusive=(True, True), reverse=False):
        return self._list.irange(minimum, maximum, inclusive, reverse)

    def islice(self, start=None, stop=None, reverse=False):
        return self._list.islice(start, stop, reverse)

    def __contains__(self, value):
        return value in self._set

    def __getitem__(self, index):
        return self._list[index]

    def __delitem__(self, index):
        if isinstance(index, slice):
            vals = self._list[index]
            del self._list[index]
            for v in vals:
                self._set.remove(v)
        else:
            val = self._list.pop(index)
            self._set.remove(val)

    def __len__(self):
        return len(self._set)

    def __iter__(self):
        return iter(self._list)

    def __reversed__(self):
        return reversed(self._list)

    def __eq__(self, other):
        if isinstance(other, (SortedSet, set, frozenset)):
            return self._set == (other._set if isinstance(other, SortedSet) else other)
        return NotImplemented

    def __or__(self, other):
        return self.union(other)

    def __and__(self, other):
        return self.intersection(other)

    def __sub__(self, other):
        return self.difference(other)

    def __xor__(self, other):
        return self.symmetric_difference(other)

    def __repr__(self):
        return f"SortedSet({list(self._list)!r})"


class _SortedKeysView:
    def __init__(self, sd):
        self._sd = sd
    def __len__(self):
        return len(self._sd._list)
    def __iter__(self):
        return iter(self._sd._list)
    def __reversed__(self):
        return reversed(self._sd._list)
    def __contains__(self, key):
        return key in self._sd._dict
    def __getitem__(self, index):
        return self._sd._list[index]
    def __repr__(self):
        return f"SortedKeysView({list(self._sd._list)!r})"


class _SortedValuesView:
    def __init__(self, sd):
        self._sd = sd
    def __len__(self):
        return len(self._sd._list)
    def __iter__(self):
        for k in self._sd._list:
            yield self._sd._dict[k]
    def __reversed__(self):
        for k in reversed(self._sd._list):
            yield self._sd._dict[k]
    def __getitem__(self, index):
        if isinstance(index, slice):
            return [self._sd._dict[k] for k in self._sd._list[index]]
        return self._sd._dict[self._sd._list[index]]
    def __repr__(self):
        return f"SortedValuesView({list(self)!r})"


class _SortedItemsView:
    def __init__(self, sd):
        self._sd = sd
    def __len__(self):
        return len(self._sd._list)
    def __iter__(self):
        for k in self._sd._list:
            yield (k, self._sd._dict[k])
    def __reversed__(self):
        for k in reversed(self._sd._list):
            yield (k, self._sd._dict[k])
    def __getitem__(self, index):
        if isinstance(index, slice):
            return [(k, self._sd._dict[k]) for k in self._sd._list[index]]
        k = self._sd._list[index]
        return (k, self._sd._dict[k])
    def __repr__(self):
        return f"SortedItemsView({list(self)!r})"


class SortedDict(MutableMapping):
    def __init__(self, *args, **kwargs):
        if args and (args[0] is None or callable(args[0])):
            self._key = args[0]
            args = args[1:]
        else:
            self._key = None
        self._dict = {}
        self._list = SortedList(key=self._key)
        self.update(*args, **kwargs)

    def __setitem__(self, key, value):
        if key not in self._dict:
            self._list.add(key)
        self._dict[key] = value

    def __getitem__(self, key):
        return self._dict[key]

    def __delitem__(self, key):
        del self._dict[key]
        self._list.remove(key)

    def __contains__(self, key):
        return key in self._dict

    def __len__(self):
        return len(self._dict)

    def __iter__(self):
        return iter(self._list)

    def __reversed__(self):
        return reversed(self._list)

    def clear(self):
        self._dict.clear()
        self._list.clear()

    def copy(self):
        sd = SortedDict(self._key)
        for k in self._list:
            sd[k] = self._dict[k]
        return sd

    def keys(self):
        return _SortedKeysView(self)

    def values(self):
        return _SortedValuesView(self)

    def items(self):
        return _SortedItemsView(self)

    def peekitem(self, index=-1):
        key = self._list[index]
        return (key, self._dict[key])

    def popitem(self, index=-1):
        if not self._dict:
            raise KeyError("popitem(): dictionary is empty")
        key = self._list.pop(index)
        val = self._dict.pop(key)
        return (key, val)

    def bisect_left(self, key):
        return self._list.bisect_left(key)

    def bisect_right(self, key):
        return self._list.bisect_right(key)

    bisect = bisect_right

    def index(self, key, start=0, stop=None):
        return self._list.index(key, start, stop)

    def irange(self, minimum=None, maximum=None, inclusive=(True, True), reverse=False):
        return self._list.irange(minimum, maximum, inclusive, reverse)

    def islice(self, start=None, stop=None, reverse=False):
        return self._list.islice(start, stop, reverse)

    def __eq__(self, other):
        if isinstance(other, SortedDict):
            return self._dict == other._dict and list(self._list) == list(other._list)
        if isinstance(other, dict):
            return self._dict == other
        return NotImplemented

    def __repr__(self):
        pairs = ", ".join(f"{k!r}: {self._dict[k]!r}" for k in self._list)
        return f"SortedDict({{{pairs}}})"

__all__ = ["SortedList", "SortedSet", "SortedDict"]
`;
