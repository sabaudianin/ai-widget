export interface ParsedReceipt {
  total: string | null; // np. "123.45" (z kropką, po normalizacji)
  date: string | null; // oryginalny string daty z OCR (YYYY-MM-DD lub DD-MM-YYYY itp.)
  nip: string | null; // np. "123-456-78-90"
}

export function parseReceipt(text: string): ParsedReceipt {
  // TOTAL (dwie alternatywy: z poprzedzającym słowem-kluczem lub z walutą po kwocie)
  const totalMatchA = text.match(
    /\b(?:RAZEM|SUMA|TOTAL|DO ZAPŁATY|KWOTA)\s*[:\-]?\s*([0-9]+[.,][0-9]{2})\b/i
  );
  const totalMatchB = text.match(
    /\b([0-9]+[.,][0-9]{2})\s*(PLN|złotych|zł|pln)\b/i
  );
  const totalRaw = totalMatchA?.[1] ?? totalMatchB?.[1] ?? null;
  const total = totalRaw ? totalRaw.replace(",", ".") : null; // normalizacja separatora

  // DATE: YYYY-MM-DD / YYYY.MM.DD / YYYY/MM/DD  lub DD-MM-YYYY / DD.MM.YYYY / DD/MM/YYYY
  const dateMatch =
    text.match(
      /\b(20\d{2}[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01]))\b/
    ) ||
    text.match(
      /\b((0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2}))\b/
    );
  const date = dateMatch?.[0] ?? null;

  // NIP (PL)
  const nipMatch = text.match(
    /\bNIP[:\s-]*([0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{2})\b/i
  );
  const nip = nipMatch?.[1] ?? null;

  return { total, date, nip };
}
