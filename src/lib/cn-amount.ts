const CN_DIGITS = ["", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"]

const cnDigit = (d: number) => CN_DIGITS[d] ?? ""

// Split a number into the wan/qian/bai/shi/yuan slots used by the Chinese
// uppercase amount strip; the wan slot holds every digit at the 10000s place and above.
export function cnSlots(n: number) {
  const yuan = n % 10
  const shi = Math.floor(n / 10) % 10
  const bai = Math.floor(n / 100) % 10
  const qian = Math.floor(n / 1000) % 10
  const wan = Math.floor(n / 10000) // 10000s place and above
  return {
    wan: wan > 0 ? String(wan).split("").map(Number).map(cnDigit).join("") : "",
    qian: cnDigit(qian),
    bai: cnDigit(bai),
    shi: cnDigit(shi),
    yuan: cnDigit(yuan),
  }
}
