VEXUS AI Prompt Vault Pro — V2.2 PostgreSQL / Render Ready

مهم:
- هذه النسخة لا تستعمل SQLite لتخزين حسابات المستخدمين.
- البيانات الدائمة موجودة في PostgreSQL عبر DATABASE_URL.
- يمكن للسيرفر أن ينام على استضافة مجانية، لكن حسابات المستخدمين وPro والـPrompts تبقى في قاعدة البيانات.

للتشغيل المحلي:
1) ثبّت Node.js 20+.
2) أنشئ PostgreSQL وأضف DATABASE_URL في .env.
3) npm install
4) node backend/seed.js
5) npm start
6) افتح http://localhost:8787

لـRender:
- أنشئ PostgreSQL Database.
- أنشئ Web Service من هذا المشروع.
- Build Command: npm install
- Start Command: npm start
- أضف DATABASE_URL وJWT_SECRET وباقي الأسرار في Environment Variables.
- لا تستخدم DB_PATH القديم.
