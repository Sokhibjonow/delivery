# 🍕 Pizza Cubick — Telegram Mini App + Admin Panel

Loyiha 3 qismdan iborat va **faqat localhost'da** ishlaydi.

| Qism | Papka | Manzil |
|---|---|---|
| Backend (Bot + API) | `backend/` | http://localhost:4000 |
| Mini App (mijozlar) | `miniapp/` | http://localhost:5173 |
| Admin Panel | `admin/` | http://localhost:5174 |

Ma'lumotlar bazasi: **Neon PostgreSQL** (bulutda), ORM: **Prisma**.

---

## Tez ishga tushirish

| Fayl | Vazifasi |
|---|---|
| `1-ORNATISH.bat` | Paketlarni o'rnatish (bir marta) |
| `2-ISHGA-TUSHIRISH.bat` | Hammasini ishga tushirish |
| `3-TOXTATISH.bat` | Hammasini to'xtatish |

**Admin paneldagi parol:** `backend/.env` faylidagi `ADMIN_PASSWORD` (boshlang'ich: `admin123`)

---

## 1. Paketlarni o'rnatish

```bash
cd D:\delivery\backend && npm install
```

```bash
cd D:\delivery\miniapp && npm install
```

```bash
cd D:\delivery\admin && npm install
```

---

## 2. Baza jadvallarini yaratish va boshlang'ich ma'lumot

```bash
cd D:\delivery\backend && npx prisma db push
```

```bash
cd D:\delivery\backend && npm run db:seed
```

Bazani ko'z bilan ko'rish (ixtiyoriy):

```bash
cd D:\delivery\backend && npm run db:studio
```

---

## 3. Ishga tushirish

3 ta alohida terminal:

```bash
cd D:\delivery\backend && npm run dev
```

```bash
cd D:\delivery\miniapp && npm run dev
```

```bash
cd D:\delivery\admin && npm run dev
```

---

## 4. Telegram'ga ulash (avtomatik)

`2-ISHGA-TUSHIRISH.bat` Cloudflare tunnelini o'zi ochadi va manzilni botga
avtomatik ulaydi. Qo'lda hech narsa yozish shart emas.

Tunnelni alohida ishga tushirish:

```bash
cd D:\delivery && node tunnel.js
```

cloudflared o'rnatilmagan bo'lsa:

```bash
winget install Cloudflare.cloudflared
```

---

## Imkoniyatlar

### Mini App (mijozlar uchun)
- Onboarding (3 slayd, faqat bir marta)
- Bosh sahifa: Stories, hero vidjet, ommabop pizzalar
- Katalog: qidiruv, kategoriya filtri, ❤️ sevimlilar
- Mahsulot oynasi: **o'lcham tanlash** (25/30/35 sm) va **qo'shimchalar**
- Savatcha: ichimlik taklifi, **promokod**, yetkazib berish narxi, minimal summa
- Telefon raqamni Telegram'dan bir tugma bilan olish
- Profil: **buyurtma kuzatuvi** (4 bosqich) va sevimlilar
- Ish vaqtidan tashqarida buyurtma qabul qilinmaydi

### Admin Panel
- **Parol himoyasi**
- Buyurtmalar: 5 xil holat, filtr, hisob tafsiloti, **Excel eksport**
- Mahsulotlar CRUD + o'lchamlar tahrirlagichi
- Qo'shimchalar CRUD
- Promokodlar CRUD
- Mijozlar bazasi (buyurtmalar soni, sarflangan summa, VIP belgisi)
- **Reklama yuborish** — barcha mijozlarga bot orqali
- Sozlamalar: ish vaqti, yetkazish narxi, bepul yetkazish chegarasi

### Bot
- `/start` — Mini App tugmasi
- Buyurtma qabul qilinganda tafsilotli chek
- **Har bir holat o'zgarganda mijozga xabar**
- Telefon raqamni saqlash (📞 tugmasi)
- Adminga yangi buyurtma bildirishnomasi

---

## Muhim fayllar

- `backend/.env` — baza, bot tokeni, admin paroli, tunnel manzili
- `backend/prisma/schema.prisma` — jadvallar
- `backend/prisma/seed.js` — boshlang'ich mahsulotlar, qo'shimchalar, promokodlar
- `tunnel.js` — Cloudflare tunnelini ochib botga ulaydi
- `miniapp/src/App.jsx` — Mini App mantiqi
- `admin/src/App.jsx` — Admin Panel

---

## Boshlang'ich promokodlar

| Kod | Chegirma | Shart |
|---|---|---|
| `PIZZA10` | 10% | cheklovsiz |
| `YANGI20` | 20 000 so'm | 100 000 so'mdan yuqori |
