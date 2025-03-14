import { ComplexRuleMode } from "../types";

export function isValidHttpUrl(urlString: string) {
  let url;
  try {
    url = new URL(urlString);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function toCamelCase(str: string) {
  return str.replace(/\s(.)/g, ($1) => $1.toUpperCase());
}

export function toPascalCase(str: string) {
  return str.replace(/(\w)(\w*)/g, (g0, g1, g2) => {
    return g1.toUpperCase() + g2.toLowerCase();
  });
}
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateExpression(
  selected: string[],
  mode: ComplexRuleMode,
  custom?: string
): string {
  return mode === "custom"
    ? custom ?? selected.join(" && ")
    : selected.join(` ${mode} `);
}
