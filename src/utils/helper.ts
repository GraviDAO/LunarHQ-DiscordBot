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
