export async function GET() {
  return Response.json({ message: '✅ Demo 数据已内置，无需初始化。直接登录即可。', demoPhone: '13800000001', demoPassword: 'Test1234!', adminUser: 'admin', adminPassword: 'Admin123!' });
}
