import { getSupabase, getAdminClient } from './supabase';

const s = () => getSupabase();
const a = () => getAdminClient();

export const db = {
  users: {
    async findByPhone(phone: string) {
      const { data, error } = await s().from('users').select('*').eq('phone', phone).maybeSingle();
      if (error) throw new Error(`DB: ${error.message}`);
      return data;
    },
    async findById(id: number) {
      const { data, error } = await s().from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`DB: ${error.message}`);
      return data;
    },
    async create(user: Record<string, any>) {
      const { data, error } = await a().from('users').insert(user).select().maybeSingle();
      if (error) throw new Error(`DB create: ${error.message}`);
      return data;
    },
    async update(id: number, fields: Record<string, any>) {
      const { data, error } = await a().from('users').update(fields).eq('id', id).select().maybeSingle();
      if (error) throw new Error(`DB update: ${error.message}`);
      return data;
    },
    async findWithTags() {
      const { data: users, error } = await s().from('users').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(`DB: ${error.message}`);
      if (!users) return [];
      const result = [];
      for (const u of users) {
        const { data: tags } = await s().from('user_tag_assignments').select('tag_id').eq('user_id', u.id);
        if (tags && tags.length > 0) {
          const tagIds = tags.map((t: any) => t.tag_id);
          const { data: tagNames } = await s().from('user_tags').select('name').in('id', tagIds);
          (u as any).tags = (tagNames || []).map((t: any) => t.name).join(',');
        } else { (u as any).tags = ''; }
        result.push(u);
      }
      return result;
    },
  },

  adminUsers: {
    async findByUsername(username: string) {
      const { data, error } = await s().from('admin_users').select('*').eq('username', username).eq('is_active', true).maybeSingle();
      if (error) throw new Error(`DB: ${error.message}`);
      return data;
    },
  },

  meowcoinLedger: {
    async findByUserId(userId: number, limit = 20) {
      const { data, error } = await s().from('meowcoin_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
      if (error) throw new Error(`DB: ${error.message}`);
      return data || [];
    },
    async insert(entry: Record<string, any>) {
      const { data, error } = await a().from('meowcoin_ledger').insert(entry).select().maybeSingle();
      if (error) throw new Error(`DB insert: ${error.message}`);
      return data;
    },
  },

  platformBindings: {
    async findByUserId(userId: number) {
      const { data, error } = await s().from('platform_bindings').select('*').eq('user_id', userId);
      if (error) throw new Error(`DB: ${error.message}`);
      return data || [];
    },
  },

  userTags: {
    async findByName(name: string) {
      const { data, error } = await s().from('user_tags').select('*').eq('name', name).maybeSingle();
      if (error) throw new Error(`DB: ${error.message}`);
      return data;
    },
  },

  userTagAssignments: {
    async findByUserAndTag(userId: number, tagId: number) {
      const { data, error } = await s().from('user_tag_assignments').select('*').eq('user_id', userId).eq('tag_id', tagId).maybeSingle();
      if (error) throw new Error(`DB: ${error.message}`);
      return data;
    },
    async remove(userId: number, tagId: number) {
      await a().from('user_tag_assignments').delete().eq('user_id', userId).eq('tag_id', tagId);
    },
    async insert(assignment: Record<string, any>) {
      const { error } = await a().from('user_tag_assignments').insert(assignment);
      if (error) throw new Error(`DB insert: ${error.message}`);
    },
    async hasXuan(userId: number) {
      const { data: tags } = await s().from('user_tag_assignments').select('tag_id').eq('user_id', userId);
      if (!tags || !tags.length) return false;
      const tagIds = tags.map((t: any) => t.tag_id);
      const { data } = await s().from('user_tags').select('id').eq('name', '玄喵').in('id', tagIds);
      return (data || []).length > 0;
    },
  },

  platformOrders: {
    async findByUserId(userId: number) {
      const { data, error } = await s().from('platform_orders').select('*').eq('user_id', userId).order('paid_at', { ascending: false });
      if (error) throw new Error(`DB: ${error.message}`);
      return data || [];
    },
    async findAllWithUser() {
      const { data, error } = await s().from('platform_orders').select('*').order('paid_at', { ascending: false });
      if (error) throw new Error(`DB: ${error.message}`);
      if (!data) return [];
      const result = [];
      for (const o of data) {
        const { data: u } = o.user_id ? await s().from('users').select('nickname').eq('id', o.user_id).maybeSingle() : { data: null };
        result.push({ ...o, user_nickname: u?.nickname || null });
      }
      return result;
    },
  },

  async stats() {
    const { count: totalUsers } = await s().from('users').select('*', { count: 'exact', head: true });
    const { data: mcData } = await s().from('users').select('total_meowcoin');
    const totalMC = (mcData || []).reduce((s: number, u: any) => s + Number(u.total_meowcoin), 0);
    const { count: counted } = await s().from('platform_orders').select('*', { count: 'exact', head: true }).eq('calc_status', 'COUNTED');
    const { count: excluded } = await s().from('platform_orders').select('*', { count: 'exact', head: true }).eq('calc_status', 'EXCLUDED');
    return { total_users: totalUsers, total_meowcoin: totalMC, counted_orders: counted, excluded_orders: excluded };
  },
};
