# 🍕 Pizza Cubick — Telegram Mini App + Admin Panel

Loyiha 3 qismdan iborat va **faqat localhost'da** ishlaydi.

| Qism | Papka | Manzil |
|---|---|---|
| Backend (Bot + API) | `backend/` | http://localhost:4000 |
| Mini App (mijozlar) | `miniapp/` | http://localhost:5173 |
| Admin Panel | `admin/` | http://localhost:5174 |

Ma'lumotlar bazasi: **Neon PostgreSQL** (bulutda), ORM: **Prisma**.

---

## 1. Paketlarni o'rnatish

**Eng oson yo'l:** `1-ORNATISH.bat` faylini ikki marta bosing.

**Yoki qo'lda (3 ta alohida terminal):**

```bash
cd D:\delivery\backend
npm install
```

```bash
cd D:\delivery\miniapp
npm install
```

```bash
cd D:\delivery\admin
npm install
```

---

## 2. Baza jadvallarini yaratish va pizzalarni yozish

```bash
cd D:\delivery\backend
npx prisma db push
```

```bash
cd D:\delivery\backend
npm run db:seed
```

Bazani ko'z bilan ko'rish uchun (ixtiyoriy):

```bash
cd D:\delivery\backend
npm run db:studio
```

---

## 3. Ishga tushirish

**Eng oson yo'l:** `2-ISHGA-TUSHIRISH.bat` faylini ikki marta bosing.

**Yoki qo'lda — 3 ta alohida terminal oching:**

1-terminal (Backend + Bot):

```bash
cd D:\delivery\backend
npm run dev
```

2-terminal (Mini App):

```bash
cd D:\delivery\miniapp
npm run dev
```

3-terminal (Admin Panel):

```bash
cd D:\delivery\admin
npm run dev
```

---

## 4. Telegram'ga ulash (avtomatik)

`2-ISHGA-TUSHIRISH.bat` fayli Cloudflare tunnelini o'zi ochadi va manzilni
botga avtomatik ulaydi. Qo'lda hech narsa yozish shart emas.

Tunnelni alohida ishga tushirish kerak bo'lsa:

```bash
cd D:\delivery && node tunnel.js
```

cloudflared o'rnatilmagan bo'lsa:

```bash
winget install Cloudflare.cloudflared
```

---
## Muhim fayllar

- `backend/.env` — bazaga ulanish, bot tokeni, tunnel manzili
- `tunnel.js` — Cloudflare tunnelini ochib botga ulaydi
- `backend/prisma/schema.prisma` — 3 ta jadval: User, Product, Order
- `backend/prisma/seed.js` — boshlang'ich pizzalar
- `miniapp/src/App.jsx` — Mini App'ning asosiy mantiqi
- `admin/src/App.jsx` — Admin Panel
