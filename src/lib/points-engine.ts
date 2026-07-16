// Points recognition engine v0.1
// Rules: H code counts, X code excluded, title keywords excluded, small transfers subtracted, etc.

const EXCLUDE_KEYWORDS = ['特价', '促销', '瑕疵', '不退不换', '微瑕'];
const SMALL_TRANSFER_KEYWORDS = ['打款', '转账', '补差', '差价'];
const BENCHMARK_DATE = new Date('2022-01-01');

interface OrderItem {
  title: string;
  code?: string;      // outer_iid / outer_sku_id
  amount: number;      // in 分 (cents)
}

interface CalcInput {
  paidAt: string;
  remark?: string;
  items: OrderItem[];
}

interface CalcResult {
  validAmount: number;        // cents
  meowcoin: number;
  calcStatus: 'COUNTED' | 'EXCLUDED';
  excludeReason?: string;
  items: Array<OrderItem & { rule: string }>;
}

export function calculatePoints(input: CalcInput): CalcResult {
  const { paidAt, remark, items } = input;
  const resultItems: CalcResult['items'] = [];

  // E1: Order date check
  if (new Date(paidAt) < BENCHMARK_DATE) {
    return { validAmount: 0, meowcoin: 0, calcStatus: 'EXCLUDED', excludeReason: 'E1_ORDER_DATE_BEFORE_2022', items: [] };
  }

  // E2: Remark contains "不算积分"
  if (remark && remark.includes('不算积分')) {
    return { validAmount: 0, meowcoin: 0, calcStatus: 'EXCLUDED', excludeReason: 'E2_REMARK_NOT_COUNTED', items: [] };
  }

  // E3: Remark contains P+digits
  if (remark && /P\d+/.test(remark)) {
    return { validAmount: 0, meowcoin: 0, calcStatus: 'EXCLUDED', excludeReason: 'E3_REMARK_P_DIGITS', items: [] };
  }

  let validAmount = 0;

  for (const item of items) {
    const code = (item.code || '').toUpperCase();

    // I5: Small transfer
    if (SMALL_TRANSFER_KEYWORDS.some(kw => item.title.includes(kw))) {
      validAmount -= item.amount;
      resultItems.push({ ...item, rule: 'SMALL_TRANSFER' });
      continue;
    }

    // I3: Title keywords
    if (EXCLUDE_KEYWORDS.some(kw => item.title.includes(kw))) {
      resultItems.push({ ...item, rule: 'EXCLUDED_TITLE' });
      continue;
    }

    // I2: X code
    if (code.startsWith('X')) {
      resultItems.push({ ...item, rule: 'EXCLUDED_X' });
      continue;
    }

    // I1: H code → count
    if (code.startsWith('H')) {
      validAmount += item.amount;
      resultItems.push({ ...item, rule: 'COUNTED_H' });
      continue;
    }

    // I4: Other code → not counted
    resultItems.push({ ...item, rule: 'NOT_COUNTED' });
  }

  const meowcoin = validAmount > 0 ? Math.ceil(validAmount / 100) : 0;

  return {
    validAmount,
    meowcoin,
    calcStatus: meowcoin > 0 ? 'COUNTED' : 'EXCLUDED',
    excludeReason: meowcoin === 0 ? 'NO_VALID_ITEMS' : undefined,
    items: resultItems,
  };
}
