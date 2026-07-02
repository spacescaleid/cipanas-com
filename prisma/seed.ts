// prisma/seed.ts

import { PrismaClient, Role, ArticleStatus, AdPosition, AdOrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "id" });
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/** Paragraf dummy konten artikel */
function dummyContent(title: string): string {
  return `<h2>${title}</h2>
<p>Cipanas, sebuah kawasan yang terkenal dengan alam pegunungannya yang sejuk dan indah, 
kembali menjadi sorotan. Warga setempat menyambut berbagai perkembangan terbaru dengan 
antusias dan harapan besar untuk kemajuan daerah.</p>

<p>Berbagai program pembangunan infrastruktur terus digenjot oleh pemerintah daerah demi 
meningkatkan kesejahteraan masyarakat. Jalan-jalan diperbaiki, fasilitas umum ditingkatkan, 
dan akses internet diperluas hingga ke pelosok desa.</p>

<h3>Dampak bagi Masyarakat</h3>
<p>Masyarakat Cipanas merasakan manfaat langsung dari berbagai program tersebut. Petani 
kian mudah memasarkan hasil pertanian mereka, pelaku UMKM semakin terhubung dengan 
pasar digital, dan generasi muda mendapat akses pendidikan yang lebih luas.</p>

<p>"Kami berharap perkembangan ini terus berlanjut dan merata ke seluruh pelosok wilayah," 
ujar salah seorang warga yang ditemui di Pasar Cipanas, Senin (${new Date().toLocaleDateString("id-ID")}).</p>

<h3>Rencana ke Depan</h3>
<p>Pemerintah daerah telah menyusun roadmap pembangunan jangka menengah yang mencakup 
sektor pariwisata, pertanian modern, dan ekonomi kreatif. Diharapkan dalam lima tahun 
ke depan, Cipanas dapat menjadi destinasi unggulan di Jawa Barat.</p>`;
}

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Mulai seeding database...\n");

  // ── 1. Bersihkan data lama (urutan penting karena ada FK) ──────────────────
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.adOrder.deleteMany();
  await prisma.adSlot.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Data lama dihapus.");

  // ── 2. Users ───────────────────────────────────────────────────────────────
  const superAdminPassword = await hashPassword("superadmin123");
  const adminPassword = await hashPassword("admin123");
  const contributorPassword = await hashPassword("contributor123");

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin Cipanas",
      email: "superadmin@cipanas.com",
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
      bio: "Pengelola utama portal berita Cipanas.com",
      image: "https://picsum.photos/seed/superadmin/200/200",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Redaksi",
      email: "admin@cipanas.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      bio: "Admin redaksi yang bertanggung jawab atas konten portal berita.",
      image: "https://picsum.photos/seed/admin/200/200",
    },
  });

  const contributor = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@cipanas.com",
      passwordHash: contributorPassword,
      role: Role.CONTRIBUTOR,
      bio: "Jurnalis lepas yang meliput berbagai peristiwa di kawasan Cipanas dan sekitarnya.",
      image: "https://picsum.photos/seed/budi/200/200",
    },
  });

  console.log("👥 Users dibuat:");
  console.log(`   • ${superAdmin.name} (${superAdmin.email}) — ${superAdmin.role}`);
  console.log(`   • ${admin.name} (${admin.email}) — ${admin.role}`);
  console.log(`   • ${contributor.name} (${contributor.email}) — ${contributor.role}`);

  // ── 3. Categories ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Berita Utama" },
    { name: "Politik & Pemerintahan" },
    { name: "Ekonomi & Bisnis" },
    { name: "Olahraga" },
    { name: "Hiburan & Gaya Hidup" },
  ];

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.create({
        data: { name: c.name, slug: makeSlug(c.name) },
      })
    )
  );

  console.log(`\n📂 ${categories.length} Kategori dibuat:`);
  categories.forEach((c) => console.log(`   • ${c.name} (/${c.slug})`));

  // ── 4. Articles ────────────────────────────────────────────────────────────
  type ArticleSeed = {
    title: string;
    authorId: string;
    categoryIndex: number;
    status: ArticleStatus;
    viewCount: number;
    revisionNote?: string;
    daysAgo: number;
  };

  const articleSeeds: ArticleSeed[] = [
    // PUBLISHED — dari admin/contributor
    {
      title: "Cipanas Raih Penghargaan Desa Wisata Terbaik 2024",
      authorId: contributor.id,
      categoryIndex: 0,
      status: ArticleStatus.PUBLISHED,
      viewCount: 1520,
      daysAgo: 2,
    },
    {
      title: "Bupati Cianjur Resmikan Jembatan Baru di Kawasan Cipanas",
      authorId: contributor.id,
      categoryIndex: 1,
      status: ArticleStatus.PUBLISHED,
      viewCount: 980,
      daysAgo: 4,
    },
    {
      title: "UMKM Cipanas Tembus Pasar Ekspor Berkat Program Digitalisasi",
      authorId: contributor.id,
      categoryIndex: 2,
      status: ArticleStatus.PUBLISHED,
      viewCount: 743,
      daysAgo: 6,
    },
    {
      title: "Tim Sepak Bola Cipanas FC Lolos ke Semifinal Piala Bupati",
      authorId: contributor.id,
      categoryIndex: 3,
      status: ArticleStatus.PUBLISHED,
      viewCount: 1102,
      daysAgo: 7,
    },
    {
      title: "Festival Kuliner Cipanas 2024 Hadirkan 150 Stan Makanan Tradisional",
      authorId: contributor.id,
      categoryIndex: 4,
      status: ArticleStatus.PUBLISHED,
      viewCount: 2304,
      daysAgo: 3,
    },
    {
      title: "Pembangunan Jalan Lingkar Cipanas Targetkan Selesai Akhir Tahun",
      authorId: contributor.id,
      categoryIndex: 1,
      status: ArticleStatus.PUBLISHED,
      viewCount: 614,
      daysAgo: 10,
    },
    {
      title: "Petani Cipanas Adopsi Teknologi Smart Farming untuk Tingkatkan Hasil Panen",
      authorId: contributor.id,
      categoryIndex: 2,
      status: ArticleStatus.PUBLISHED,
      viewCount: 489,
      daysAgo: 14,
    },
    // PENDING — menunggu review
    {
      title: "Rencana Pembangunan Gedung Olahraga Modern di Cipanas",
      authorId: contributor.id,
      categoryIndex: 3,
      status: ArticleStatus.PENDING,
      viewCount: 0,
      daysAgo: 1,
    },
    {
      title: "Komunitas Seni Cipanas Gelar Pameran Lukisan Tahunan",
      authorId: contributor.id,
      categoryIndex: 4,
      status: ArticleStatus.PENDING,
      viewCount: 0,
      daysAgo: 0,
    },
    // DRAFT
    {
      title: "Potensi Wisata Alam Cipanas yang Belum Banyak Dikenal",
      authorId: contributor.id,
      categoryIndex: 0,
      status: ArticleStatus.DRAFT,
      viewCount: 0,
      daysAgo: 0,
    },
    {
      title: "Wawancara Eksklusif: Tokoh Muda Cipanas Berbicara Soal Masa Depan",
      authorId: contributor.id,
      categoryIndex: 0,
      status: ArticleStatus.DRAFT,
      viewCount: 0,
      daysAgo: 0,
    },
    // REVISION
    {
      title: "Kontroversi Pembebasan Lahan untuk Proyek Strategis Nasional",
      authorId: contributor.id,
      categoryIndex: 1,
      status: ArticleStatus.REVISION,
      viewCount: 0,
      revisionNote:
        "Mohon tambahkan sumber resmi dari Dinas Pertanahan dan konfirmasi dari pihak terdampak.",
      daysAgo: 2,
    },
    // REJECTED
    {
      title: "Informasi Tidak Terverifikasi Soal Perubahan Batas Wilayah",
      authorId: contributor.id,
      categoryIndex: 1,
      status: ArticleStatus.REJECTED,
      viewCount: 0,
      revisionNote:
        "Artikel ditolak karena mengandung informasi yang tidak dapat diverifikasi dan berpotensi menyesatkan pembaca.",
      daysAgo: 5,
    },
    // Published dari admin
    {
      title: "Peningkatan Layanan Kesehatan di Puskesmas Cipanas",
      authorId: admin.id,
      categoryIndex: 0,
      status: ArticleStatus.PUBLISHED,
      viewCount: 876,
      daysAgo: 8,
    },
    {
      title: "Program Beasiswa Daerah Buka Pendaftaran untuk Pelajar Cipanas",
      authorId: admin.id,
      categoryIndex: 0,
      status: ArticleStatus.PUBLISHED,
      viewCount: 1893,
      daysAgo: 5,
    },
  ];

  const imageSeeds = [
    "https://picsum.photos/seed/news1/800/450",
    "https://picsum.photos/seed/news2/800/450",
    "https://picsum.photos/seed/news3/800/450",
    "https://picsum.photos/seed/news4/800/450",
    "https://picsum.photos/seed/news5/800/450",
    "https://picsum.photos/seed/news6/800/450",
    "https://picsum.photos/seed/news7/800/450",
    "https://picsum.photos/seed/news8/800/450",
    "https://picsum.photos/seed/news9/800/450",
    "https://picsum.photos/seed/news10/800/450",
    "https://picsum.photos/seed/news11/800/450",
    "https://picsum.photos/seed/news12/800/450",
    "https://picsum.photos/seed/news13/800/450",
    "https://picsum.photos/seed/news14/800/450",
    "https://picsum.photos/seed/news15/800/450",
  ];

  const articles = await Promise.all(
    articleSeeds.map((seed, i) => {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - seed.daysAgo);

      const publishedAt =
        seed.status === ArticleStatus.PUBLISHED ? createdAt : null;

      return prisma.article.create({
        data: {
          title: seed.title,
          slug: makeSlug(seed.title),
          content: dummyContent(seed.title),
          coverImage: imageSeeds[i % imageSeeds.length],
          authorId: seed.authorId,
          categoryId: categories[seed.categoryIndex].id,
          status: seed.status,
          revisionNote: seed.revisionNote ?? null,
          viewCount: seed.viewCount,
          publishedAt,
          createdAt,
          updatedAt: createdAt,
        },
      });
    })
  );

  console.log(`\n📰 ${articles.length} Artikel dibuat:`);
  const byStatus = articles.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  Object.entries(byStatus).forEach(([status, count]) =>
    console.log(`   • ${status}: ${count} artikel`)
  );

  // ── 5. Comments (untuk artikel published) ─────────────────────────────────
  const publishedArticles = articles.filter(
    (a) => a.status === ArticleStatus.PUBLISHED
  );

  const commentData = [
    {
      name: "Andi Wijaya",
      content: "Informasi yang sangat bermanfaat! Terima kasih Cipanas.com.",
    },
    {
      name: "Siti Rahayu",
      content: "Semoga Cipanas semakin maju dan berkembang.",
    },
    {
      name: "Deni Pratama",
      content: "Berita yang bagus. Kapan ada liputan soal wisata alam Cipanas?",
    },
    {
      name: "Rini Kusuma",
      content: "Wah keren banget! Bangga jadi warga Cipanas.",
    },
  ];

  for (const article of publishedArticles.slice(0, 5)) {
    for (const comment of commentData.slice(0, 2)) {
      await prisma.comment.create({
        data: {
          articleId: article.id,
          name: comment.name,
          content: comment.content,
          status: "APPROVED",
        },
      });
    }
  }

  console.log(`\n💬 Komentar dummy dibuat untuk ${Math.min(5, publishedArticles.length)} artikel pertama.`);

  // ── 6. Ad Slots ────────────────────────────────────────────────────────────
  const adSlots = await Promise.all([
    prisma.adSlot.create({
      data: {
        position: AdPosition.HEADER,
        size: "728x90",
        pricePerDay: 150000,
      },
    }),
    prisma.adSlot.create({
      data: {
        position: AdPosition.SIDEBAR,
        size: "300x250",
        pricePerDay: 100000,
      },
    }),
    prisma.adSlot.create({
      data: {
        position: AdPosition.INLINE,
        size: "600x200",
        pricePerDay: 75000,
      },
    }),
    prisma.adSlot.create({
      data: {
        position: AdPosition.FOOTER,
        size: "728x90",
        pricePerDay: 50000,
      },
    }),
  ]);

  console.log(`\n📢 ${adSlots.length} Ad Slot dibuat:`);
  adSlots.forEach((s) =>
    console.log(
      `   • ${s.position} (${s.size}) — Rp ${Number(s.pricePerDay).toLocaleString("id-ID")}/hari`
    )
  );

  // ── 7. Ad Orders & Payments ────────────────────────────────────────────────
  const now = new Date();
  const inFuture = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };
  const inPast = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // Order 1: ACTIVE (sudah bayar, sudah approve, sedang tayang di header)
  const activeOrder = await prisma.adOrder.create({
    data: {
      advertiserName: "Toko Oleh-Oleh Cipanas Asri",
      email: "cipanasasri@gmail.com",
      slotId: adSlots[0].id, // HEADER
      mediaUrl: "https://picsum.photos/seed/ad1/728/90",
      targetUrl: "https://tokocipanasasri.example.com",
      startDate: inPast(3),
      endDate: inFuture(27),
      status: AdOrderStatus.ACTIVE,
      totalPrice: 150000 * 30, // 30 hari
    },
  });

  await prisma.payment.create({
    data: {
      adOrderId: activeOrder.id,
      amount: 150000 * 30,
      method: "bank_transfer",
      gatewayStatus: "settlement",
      paymentRef: "TRX-20240101-001",
    },
  });

  // Order 2: PENDING_APPROVAL (sudah bayar, menunggu admin)
  const pendingApprovalOrder = await prisma.adOrder.create({
    data: {
      advertiserName: "Hotel Cipanas Grand",
      email: "marketing@cipanasgrand.example.com",
      slotId: adSlots[1].id, // SIDEBAR
      mediaUrl: "https://picsum.photos/seed/ad2/300/250",
      targetUrl: "https://cipanasgrand.example.com",
      startDate: inFuture(2),
      endDate: inFuture(16),
      status: AdOrderStatus.AWAITING_CREATIVE,
      totalPrice: 100000 * 14, // 14 hari
    },
  });

  await prisma.payment.create({
    data: {
      adOrderId: pendingApprovalOrder.id,
      amount: 100000 * 14,
      method: "qris",
      gatewayStatus: "settlement",
      paymentRef: "TRX-20240102-002",
    },
  });

  // Order 3: PENDING_PAYMENT (belum bayar)
  await prisma.adOrder.create({
    data: {
      advertiserName: "Restoran Sunda Cipanas",
      email: "sundacipanas@gmail.com",
      slotId: adSlots[3].id, // FOOTER
      mediaUrl: "https://picsum.photos/seed/ad3/728/90",
      targetUrl: "https://restosunda.example.com",
      startDate: inFuture(7),
      endDate: inFuture(21),
      status: AdOrderStatus.PENDING_PAYMENT,
      totalPrice: 50000 * 14, // 14 hari
    },
  });

  // Order 4: EXPIRED (sudah selesai)
  const expiredOrder = await prisma.adOrder.create({
    data: {
      advertiserName: "Event Organizer Puncak",
      email: "eo.puncak@gmail.com",
      slotId: adSlots[2].id, // INLINE
      mediaUrl: "https://picsum.photos/seed/ad4/600/200",
      targetUrl: "https://eopuncak.example.com",
      startDate: inPast(17),
      endDate: inPast(3),
      status: AdOrderStatus.EXPIRED,
      totalPrice: 75000 * 14,
    },
  });

  await prisma.payment.create({
    data: {
      adOrderId: expiredOrder.id,
      amount: 75000 * 14,
      method: "virtual_account",
      gatewayStatus: "settlement",
      paymentRef: "TRX-20231220-003",
    },
  });

  console.log(`\n🛒 4 Ad Order dibuat:`);
  console.log(`   • ACTIVE     : ${activeOrder.advertiserName}`);
  console.log(`   • PENDING_APPROVAL: ${pendingApprovalOrder.advertiserName}`);
  console.log(`   • PENDING_PAYMENT : Restoran Sunda Cipanas`);
  console.log(`   • EXPIRED    : ${expiredOrder.advertiserName}`);

  // ── 8. Activity Logs ───────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "PUBLISH_ARTICLE",
        target: articles[0].id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        action: "PUBLISH_ARTICLE",
        target: articles[1].id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        action: "REJECT_ARTICLE",
        target: articles[12].id, // artikel rejected
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        action: "REQUEST_REVISION",
        target: articles[11].id, // artikel revision
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: superAdmin.id,
        action: "ACTIVATE_AD_ORDER",
        target: activeOrder.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`\n📋 5 Activity Log dibuat.\n`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("✅ Seeding selesai!\n");
  console.log("═══════════════════════════════════════════");
  console.log("AKUN LOGIN UNTUK TESTING:");
  console.log("═══════════════════════════════════════════");
  console.log("Super Admin : superadmin@cipanas.com / superadmin123");
  console.log("Admin       : admin@cipanas.com / admin123");
  console.log("Contributor : budi@cipanas.com / contributor123");
  console.log("═══════════════════════════════════════════");
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });