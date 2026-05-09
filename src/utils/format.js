export function fmtMoney(amount) {
  return '$' + Math.round(amount).toLocaleString('en-US');
}

export function fmtAmount(amount) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
