export const toRaw = (amount: string | number, decimals: number) => {
  const dec = Number.isFinite(decimals) ? decimals : 18;
  const [intPart, fracPart = ""] = String(amount).split(".");
  const frac = fracPart.padEnd(dec, "0").slice(0, dec);
  const rawStr = `${intPart.replace(/^0+/, "") || "0"}${frac}`;
  return BigInt(rawStr || "0").toString();
};

export const fromRaw = (raw: string | number, decimals: number) => {
  const dec = Number.isFinite(decimals) ? decimals : 18;
  const num = Number(raw);
  if (!Number.isFinite(num)) return "0";
  const scaled = num / Math.pow(10, dec);
  return scaled.toString().replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
};
