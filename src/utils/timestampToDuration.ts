export const timestampToDuration = (timestamp: number): string => {
  const dt = new Date(timestamp);
  const units = [
    ["Y", dt.getUTCFullYear() - 1970],
    ["M", dt.getUTCMonth()],
    ["D", dt.getUTCDate() - 1],
    ["T", null],
    ["H", dt.getUTCHours()],
    ["M", dt.getUTCMinutes()],
    ["S", dt.getUTCSeconds()],
  ];

  let str = units.reduce((acc, [k, v]) => {
    if (v) {
      acc += v + k!.toString();
    } else if (k === "T") {
      acc += k;
    }
    return acc;
  }, "");

  str = str.endsWith("T") ? str.slice(0, -1) : str;
  return `P${str}`;
};
