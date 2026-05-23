export const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size <= 0) return [];
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
};
