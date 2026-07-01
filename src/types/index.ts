import type {
  User,
  Article,
  Category,
  Tag,
  Comment,
  AdOrder,
  AdSlot,
  Payment,
  ActivityLog,
  Role,
  ArticleStatus,
  AdStatus,
  PaymentStatus,
} from '@prisma/client'

// ═══════════════════════════════════════════════════════════
// RE-EXPORT PRISMA TYPES & ENUMS
// ═══════════════════════════════════════════════════════════

export type {
  User,
  Article,
  Category,
  Tag,
  Comment,
  AdOrder,
  AdSlot,
  Payment,
  ActivityLog,
  Role,
  ArticleStatus,
  AdStatus,
  PaymentStatus,
}

// ═══════════════════════════════════════════════════════════
// USER TYPES
// ═══════════════════════════════════════════════════════════

/**
 * User tanpa password_hash (aman untuk dikirim ke client)
 */
export type SafeUser = Omit<User, 'passwordHash'>

/**
 * User untuk session NextAuth
 */
export type SessionUser = {
  id: string
  nama: string
  email: string
  role: Role
  foto?: string | null
}

/**
 * User untuk ditampilkan di kartu penulis artikel
 */
export type AuthorInfo = Pick<User, 'id' | 'nama' | 'foto' | 'bio'>

/**
 * User dengan statistik (untuk halaman kelola pengguna)
 */
export type UserWithStats = SafeUser & {
  _count: {
    articles: number
  }
  totalViews?: number
}

// ═══════════════════════════════════════════════════════════
// ARTICLE TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Artikel dengan semua relasi (untuk halaman detail)
 */
export type ArticleWithRelations = Article & {
  user: AuthorInfo
  kategori: Category
  tags: {
    tag: Pick<Tag, 'id' | 'nama' | 'slug'>
  }[]
  _count?: {
    comments: number
  }
}

/**
 * Artikel untuk kartu di listing (data minimal)
 */
export type ArticleCard = Pick<
  Article,
  | 'id'
  | 'judul'
  | 'slug'
  | 'ringkasan'
  | 'gambarUtama'
  | 'viewCount'
  | 'readTime'
  | 'publishedAt'
  | 'isHeadline'
  | 'status'
> & {
  kategori: Pick<Category, 'id' | 'nama' | 'slug' | 'warna'>
  user: Pick<User, 'id' | 'nama' | 'foto'>
}

/**
 * Artikel untuk widget "Terpopuler" (data super minimal)
 */
export type ArticlePopular = Pick<
  Article,
  'id' | 'judul' | 'slug' | 'gambarUtama' | 'viewCount' | 'publishedAt'
> & {
  kategori: Pick<Category, 'nama' | 'slug' | 'warna'>
}

/**
 * Artikel untuk hero section beranda
 */
export type ArticleHero = ArticleCard & {
  user: AuthorInfo
}

/**
 * Data untuk form input artikel (create/edit)
 */
export type ArticleInput = {
  judul: string
  ringkasan?: string
  isi: string
  gambarUtama?: string
  altGambar?: string
  kategoriId: string
  tagIds?: string[]
  status?: ArticleStatus
}

/**
 * Data artikel di dashboard kontributor (tabel "tulisan saya")
 */
export type ArticleForDashboard = Pick<
  Article,
  | 'id'
  | 'judul'
  | 'slug'
  | 'status'
  | 'viewCount'
  | 'catatanRevisi'
  | 'publishedAt'
  | 'createdAt'
  | 'updatedAt'
> & {
  kategori: Pick<Category, 'nama' | 'slug' | 'warna'>
}

/**
 * Data artikel di panel admin (tabel review)
 */
export type ArticleForReview = ArticleWithRelations & {
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════
// CATEGORY TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Kategori dengan jumlah artikel
 */
export type CategoryWithCount = Category & {
  _count: {
    articles: number
  }
}

/**
 * Input untuk create/edit kategori
 */
export type CategoryInput = {
  nama: string
  slug?: string
  deskripsi?: string
  warna?: string
}

// ═══════════════════════════════════════════════════════════
// TAG TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Tag dengan jumlah artikel
 */
export type TagWithCount = Tag & {
  _count: {
    articles: number
  }
}

// ═══════════════════════════════════════════════════════════
// COMMENT TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Komentar untuk ditampilkan (tanpa email)
 */
export type CommentPublic = Pick<
  Comment,
  'id' | 'nama' | 'isi' | 'createdAt'
>

/**
 * Input komentar dari user
 */
export type CommentInput = {
  nama: string
  email?: string
  isi: string
  articleId: string
}

// ═══════════════════════════════════════════════════════════
// AD (IKLAN) TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Ad slot dengan jumlah pesanan
 */
export type AdSlotWithStats = AdSlot & {
  _count?: {
    orders: number
  }
  activeOrdersCount?: number
}

/**
 * Ad order dengan detail slot & payment (untuk admin & user tracking)
 */
export type AdOrderWithDetails = AdOrder & {
  slot: AdSlot
  payment: Payment | null
}

/**
 * Ad order lengkap untuk panel admin
 */
export type AdOrderForAdmin = AdOrder & {
  slot: AdSlot
  payment: Pick<
    Payment,
    'id' | 'jumlah' | 'metode' | 'statusGateway' | 'paidAt' | 'paymentRef'
  > | null
}

/**
 * Iklan aktif yang siap tayang (untuk render di frontend)
 */
export type ActiveAd = {
  id: string
  materiUrl: string
  linkTujuan: string
  slot: {
    id: string
    namaPosisi: string
    ukuran: string
  }
}

/**
 * Input form pemesanan iklan
 */
export type AdOrderInput = {
  namaPengiklan: string
  email: string
  telepon?: string
  slotId: string
  linkTujuan: string
  materiUrl?: string
  tanggalMulai: string // ISO date string
  tanggalSelesai: string
  durasiHari: number
}

/**
 * Kalkulasi harga iklan
 */
export type AdPricing = {
  slotId: string
  slotName: string
  hargaPerHari: number
  durasiHari: number
  totalBayar: number
}

// ═══════════════════════════════════════════════════════════
// PAYMENT TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Response dari Midtrans/Xendit payment gateway
 */
export type PaymentResponse = {
  success: boolean
  paymentRef?: string
  snapToken?: string
  redirectUrl?: string
  message?: string
}

/**
 * Webhook payload dari payment gateway
 */
export type PaymentWebhookPayload = {
  order_id: string
  transaction_status: string
  payment_type?: string
  gross_amount?: string
  transaction_id?: string
  fraud_status?: string
  signature_key?: string
}

// ═══════════════════════════════════════════════════════════
// ACTIVITY LOG TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Activity log dengan info user
 */
export type ActivityLogWithUser = ActivityLog & {
  user: Pick<User, 'id' | 'nama' | 'email' | 'role'>
}

/**
 * Jenis aksi yang di-log (untuk audit trail)
 */
export type ActivityAction =
  | 'CREATE_ARTICLE'
  | 'UPDATE_ARTICLE'
  | 'DELETE_ARTICLE'
  | 'PUBLISH_ARTICLE'
  | 'UNPUBLISH_ARTICLE'
  | 'REJECT_ARTICLE'
  | 'REQUEST_REVISION'
  | 'SET_HEADLINE'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'UPDATE_USER_ROLE'
  | 'BLOCK_USER'
  | 'ACTIVATE_USER'
  | 'APPROVE_AD'
  | 'REJECT_AD'
  | 'UPDATE_AD_SLOT_PRICE'
  | 'LOGIN'
  | 'LOGOUT'

// ═══════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Response API standar (success)
 */
export type ApiSuccessResponse<T = unknown> = {
  success: true
  data: T
  message?: string
}

/**
 * Response API standar (error)
 */
export type ApiErrorResponse = {
  success: false
  error: string
  message?: string
  details?: Record<string, string[]>
}

/**
 * Union type untuk semua response API
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Response pagination
 */
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: PaginationMeta
}

// ═══════════════════════════════════════════════════════════
// FILTER & QUERY PARAMS TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Query params untuk listing artikel
 */
export type ArticleQuery = {
  page?: number
  limit?: number
  kategori?: string
  tag?: string
  status?: ArticleStatus
  search?: string
  sort?: 'terbaru' | 'terpopuler' | 'terlama'
  userId?: string
  featured?: boolean
}

/**
 * Query params untuk listing user (admin)
 */
export type UserQuery = {
  page?: number
  limit?: number
  role?: Role
  search?: string
  isActive?: boolean
}

/**
 * Query params untuk listing ad order (admin)
 */
export type AdOrderQuery = {
  page?: number
  limit?: number
  status?: AdStatus
  search?: string
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATISTICS TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Statistik untuk dashboard kontributor
 */
export type ContributorStats = {
  totalArticles: number
  totalPublished: number
  totalDraft: number
  totalPending: number
  totalRejected: number
  totalViews: number
  viewsThisMonth: number
  viewsLastMonth: number
  articlesLast7Days: Array<{
    date: string
    count: number
  }>
  viewsLast30Days: Array<{
    date: string
    views: number
  }>
}

/**
 * Statistik untuk dashboard admin
 */
export type AdminStats = {
  totalArticles: number
  totalPublished: number
  totalPending: number
  totalContributors: number
  totalActiveContributors: number
  totalViews: number
  totalCategories: number
  adRevenueThisMonth: number
  adRevenueLastMonth: number
  activeAdsCount: number
  pendingAdsCount: number
  articlesLast30Days: Array<{
    date: string
    count: number
  }>
  revenueLast6Months: Array<{
    month: string
    revenue: number
  }>
  topCategories: Array<{
    nama: string
    slug: string
    articleCount: number
    totalViews: number
  }>
  topContributors: Array<{
    id: string
    nama: string
    foto: string | null
    articleCount: number
    totalViews: number
  }>
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Notifikasi untuk kontributor
 */
export type Notification = {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  link?: string
  isRead: boolean
  createdAt: Date
}

// ═══════════════════════════════════════════════════════════
// UPLOAD TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Response dari upload gambar
 */
export type UploadResponse = {
  success: boolean
  url?: string
  publicId?: string
  width?: number
  height?: number
  format?: string
  error?: string
}

// ═══════════════════════════════════════════════════════════
// SEARCH TYPES
// ═══════════════════════════════════════════════════════════

/**
 * Hasil pencarian gabungan
 */
export type SearchResult = {
  articles: ArticleCard[]
  categories: Category[]
  tags: Tag[]
  totalResults: number
}

// ═══════════════════════════════════════════════════════════
// AD SLOT POSITION CONSTANTS
// ═══════════════════════════════════════════════════════════

/**
 * Posisi slot iklan yang tersedia
 */
export const AD_POSITIONS = {
  HEADER_BANNER: 'Header Banner',
  SIDEBAR_RIGHT: 'Sidebar Kanan',
  NATIVE_INLINE: 'Native Inline Artikel',
  FOOTER_BANNER: 'Footer Banner',
  BEFORE_ARTICLE: 'Sebelum Artikel',
  AFTER_ARTICLE: 'Setelah Artikel',
} as const

export type AdPosition = (typeof AD_POSITIONS)[keyof typeof AD_POSITIONS]

/**
 * Ukuran iklan standar
 */
export const AD_SIZES = {
  LEADERBOARD: '728x90',
  MEDIUM_RECTANGLE: '300x250',
  LARGE_RECTANGLE: '336x280',
  WIDE_SKYSCRAPER: '160x600',
  HALF_PAGE: '300x600',
  MOBILE_BANNER: '320x100',
  NATIVE: '600x200',
} as const

export type AdSize = (typeof AD_SIZES)[keyof typeof AD_SIZES]

// ═══════════════════════════════════════════════════════════
// STATUS LABEL HELPERS (untuk UI)
// ═══════════════════════════════════════════════════════════

/**
 * Label bahasa Indonesia untuk status artikel
 */
export const ARTICLE_STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Menunggu Review',
  REVISION: 'Perlu Revisi',
  PUBLISHED: 'Tayang',
  REJECTED: 'Ditolak',
  UNPUBLISHED: 'Dicabut',
}

/**
 * Warna badge untuk setiap status artikel
 */
export const ARTICLE_STATUS_COLOR: Record<ArticleStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  UNPUBLISHED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

/**
 * Label bahasa Indonesia untuk status iklan
 */
export const AD_STATUS_LABEL: Record<AdStatus, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PENDING_APPROVAL: 'Menunggu Approval',
  ACTIVE: 'Aktif',
  EXPIRED: 'Kedaluwarsa',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
}

/**
 * Warna badge untuk setiap status iklan
 */
export const AD_STATUS_COLOR: Record<AdStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  PENDING_APPROVAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

/**
 * Label untuk role user
 */
export const ROLE_LABEL: Record<Role, string> = {
  VISITOR: 'Pengunjung',
  CONTRIBUTOR: 'Kontributor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
}

/**
 * Warna badge untuk setiap role
 */
export const ROLE_COLOR: Record<Role, string> = {
  VISITOR: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  CONTRIBUTOR: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  ADMIN: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

// ═══════════════════════════════════════════════════════════
// FORM STATE TYPES (untuk useActionState / react-hook-form)
// ═══════════════════════════════════════════════════════════

/**
 * State untuk form dengan validasi
 */
export type FormState<T = unknown> = {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
  data?: T
}

// ═══════════════════════════════════════════════════════════
// SORT & VIEW OPTIONS
// ═══════════════════════════════════════════════════════════

export type SortOption = {
  value: 'terbaru' | 'terpopuler' | 'terlama'
  label: string
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terpopuler', label: 'Terpopuler' },
  { value: 'terlama', label: 'Terlama' },
]

export type ViewMode = 'grid' | 'list'

// ═══════════════════════════════════════════════════════════
// THEME TYPES
// ═══════════════════════════════════════════════════════════

export type Theme = 'light' | 'dark' | 'system'