// src/utils/normalizeName.js

export default function normalizeName(name) {
  if (!name) return "";

  return name
    .toLowerCase()
    .replace(/[\.\-']/g, "")   // remove punctuation
    .replace(/\s+/g, "")      // remove spaces
    .trim();
}


