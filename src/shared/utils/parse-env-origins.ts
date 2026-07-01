export function ParseEnvOrigins(...values: (string | undefined)[]) {
  // Mảng chứa kết quả
  const out: string[] = [];

  for (const v of values) {
    if (!v) continue;

    for (const part of v.split(',')) {
      //Bo khoang trang
      const s = part.trim();

      if (s) {
        out.push(s);
      }
    }
  }

  return [...new Set(out)];
}
