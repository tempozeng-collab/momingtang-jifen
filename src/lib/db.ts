// In-memory store for demo — no external database needed
import bcrypt from 'bcryptjs';

const pw = bcrypt.hashSync('Test1234!', 10);
const adminPw = bcrypt.hashSync('Admin123!', 10);

let users: any[] = [
  { id: 1, phone: '13800000001', password_hash: pw, nickname: '墨名堂·花间喵', tier: 'BAIXIAO', total_meowcoin: 2500, used_meowcoin: 300, frozen_meowcoin: 0, wu_jing: 0, public_tier: null, last_login_at: null, created_at: '2025-01-01' },
];
let admins: any[] = [
  { id: 1, username: 'admin', password_hash: adminPw, display_name: '掌事大人', role: 'SUPER_ADMIN', is_active: true },
];
let ledger: any[] = [
  { id: 1, user_id: 1, direction: 'IN', type: 'ORDER_SYNC', amount: 1200, balance_before: 0, balance_after: 1200, available_before: 0, available_after: 1200, ref_type: 'ORDER', ref_id: 'T20231001', meta: '{"platform":"淘宝","desc":"宋制旋裙"}', created_at: '2023-01-15' },
  { id: 2, user_id: 1, direction: 'IN', type: 'ORDER_SYNC', amount: 800, balance_before: 1200, balance_after: 2000, available_before: 1200, available_after: 2000, ref_type: 'ORDER', ref_id: 'T20231115', meta: '{"platform":"淘宝","desc":"唐制齐胸"}', created_at: '2023-11-15' },
  { id: 3, user_id: 1, direction: 'IN', type: 'ORDER_SYNC', amount: 500, balance_before: 2000, balance_after: 2500, available_before: 2000, available_after: 2500, ref_type: 'ORDER', ref_id: 'T20240320', meta: '{"platform":"抖音","desc":"明制披风"}', created_at: '2024-03-20' },
];
let bindings: any[] = [{ id: 1, user_id: 1, platform: '淘宝', platform_user_id: 'tb_user_001', bound_at: '2023-01-10' }, { id: 2, user_id: 1, platform: '抖音', platform_user_id: 'dy_user_001', bound_at: '2024-03-01' }];
let tags: any[] = [{ id: 1, name: '玄喵', color: '#1A1A2E', description: '隐藏阶位·邀请制' }];
let tagAssignments: any[] = [];
let orders: any[] = [
  { id: 1, platform: '淘宝', order_id: 'T20231001', user_id: 1, paid_at: '2023-01-15', status: 'TRADE_FINISHED', raw_amount: 120000, valid_amount: 120000, meowcoin_earned: 1200, calc_status: 'COUNTED', exclude_reason: null, items_json: [{ title: '宋制旋裙 真丝汉服', code: 'H10001', amount: 120000, rule: 'COUNTED_H' }] },
  { id: 2, platform: '淘宝', order_id: 'T20231115', user_id: 1, paid_at: '2023-11-15', status: 'TRADE_FINISHED', raw_amount: 80000, valid_amount: 80000, meowcoin_earned: 800, calc_status: 'COUNTED', exclude_reason: null, items_json: [{ title: '唐制齐胸 真丝', code: 'H10002', amount: 80000, rule: 'COUNTED_H' }] },
  { id: 3, platform: '抖音', order_id: 'DY20240320', user_id: 1, paid_at: '2024-03-20', status: 'TRADE_FINISHED', raw_amount: 50000, valid_amount: 50000, meowcoin_earned: 500, calc_status: 'COUNTED', exclude_reason: null, items_json: [{ title: '明制披风 真丝', code: 'H20001', amount: 50000, rule: 'COUNTED_H' }] },
  { id: 4, platform: '淘宝', order_id: 'T20240501', user_id: 1, paid_at: '2024-05-01', status: 'TRADE_FINISHED', raw_amount: 9900, valid_amount: 0, meowcoin_earned: 0, calc_status: 'EXCLUDED', exclude_reason: 'EXCLUDED_TITLE', items_json: [{ title: '特价款 汉服体验', code: 'H30001', amount: 9900, rule: 'EXCLUDED_TITLE' }] },
];
let nextId = 100;

function id() { return nextId++; }

export const db = {
  users: {
    findByPhone: (phone: string) => users.find(u => u.phone === phone) || null,
    findById: (id: number) => users.find(u => u.id === id) || null,
    create: (u: any) => { const r = { ...u, id: id(), created_at: new Date().toISOString() }; users.push(r); return r; },
    update: (id: number, fields: any) => { const u = users.find(ux => ux.id === id); if (u) Object.assign(u, fields); return u; },
    findWithTags: () => users.map(u => ({ ...u, tags: tagAssignments.filter(ta => ta.user_id === u.id).map(ta => tags.find(t => t.id === ta.tag_id)?.name).filter(Boolean).join(',') })),
  },
  adminUsers: {
    findByUsername: (username: string) => admins.find(a => a.username === username && a.is_active) || null,
  },
  meowcoinLedger: {
    findByUserId: (uid: number) => ledger.filter(l => l.user_id === uid).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20),
    insert: (e: any) => { ledger.push({ ...e, id: id() }); },
  },
  platformBindings: { findByUserId: (uid: number) => bindings.filter(b => b.user_id === uid) },
  userTags: { findByName: (name: string) => tags.find(t => t.name === name) || null },
  userTagAssignments: {
    findByUserAndTag: (uid: number, tid: number) => tagAssignments.find(ta => ta.user_id === uid && ta.tag_id === tid) || null,
    remove: (uid: number, tid: number) => { tagAssignments = tagAssignments.filter(ta => !(ta.user_id === uid && ta.tag_id === tid)); },
    insert: (a: any) => { tagAssignments.push({ ...a, id: id() }); },
    hasXuan: (uid: number) => tagAssignments.some(ta => ta.user_id === uid && tags.find(t => t.id === ta.tag_id && t.name === '玄喵')),
  },
  platformOrders: {
    findByUserId: (uid: number) => orders.filter(o => o.user_id === uid).sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()),
    findAllWithUser: () => orders.map(o => ({ ...o, user_nickname: users.find(u => u.id === o.user_id)?.nickname || null })),
  },
  stats: () => ({
    total_users: users.length, total_meowcoin: users.reduce((s, u) => s + Number(u.total_meowcoin), 0),
    counted_orders: orders.filter(o => o.calc_status === 'COUNTED').length,
    excluded_orders: orders.filter(o => o.calc_status === 'EXCLUDED').length,
  }),
};
