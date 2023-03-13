const generateShiftTable = (pattern: string) => {
  const shift: { [key: string]: number } = {};
  for (let i = 0; i < pattern.length - 1; i++) {
    shift[pattern[i]] = Math.max(1, pattern.length - i - 1);
  }
  const lastChar = pattern[pattern.length - 1];
  if (shift[lastChar] === undefined) {
    shift[lastChar] = pattern.length;
  }
  return shift;
};

/**
 * grep uses Boyer's Moore under the hood to quickly find matching patterns.
 */
function boyerMooreSearch(source: string, pattern: string) {
  const shiftTable = generateShiftTable(pattern);
  const maxOffset = source.length - pattern.length;
  const patternLastIndex = pattern.length - 1;
  let offset = 0;
  while (offset <= maxOffset) {
    let scanIndex = 0;
    while (
      scanIndex < pattern.length &&
      pattern[scanIndex] == source[scanIndex + offset]
    ) {
      if (scanIndex === patternLastIndex) return offset;
      scanIndex++;
    }

    const badMatch = source[offset + patternLastIndex];
    let shift = shiftTable[badMatch];
    if (shift) {
      offset += shift;
    } else {
      offset += 1;
    }
  }
  return -1;
}

export default boyerMooreSearch;
