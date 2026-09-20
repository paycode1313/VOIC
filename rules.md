# Engineering & Architecture Rules — VOIC
**Code Standards, Quality Governance & Anti-Slop Enforcement**

---

## 1. Anti-Slop Pre-Flight Checklist (Mandatory Before Shipping)

Setiap komponen UI atau fitur frontend yang dibuat **wajib lolos seluruh poin verifikasi mekanis** berikut sebelum dianggap selesai:

* [ ] **No AI-Purple:** Tidak ada warna `#8b5cf6`, `#a855f7`, `purple-500`, atau gradien violet/neon generik.
* [ ] **Single Accent Color Lock:** Seluruh halaman terkunci pada aksen **Radar Amber (`#F59E0B` / `amber-500`)**. Tidak ada komponen acak yang menggunakan warna biru/hijau/merah muda kecuali indikator kritis sistem (*Signal Red* untuk tombol record aktif).
* [ ] **Typography Check:** Menggunakan `Geist` untuk display/body dan `Geist Mono` untuk data telemetri. Font serif seperti `Fraunces` atau `Instrument Serif` **dilarang total**.
* [ ] **CTA Button Wrap Ban:** Teks tombol aksi utama (CTA) **harus muat dalam satu baris** pada tampilan desktop. Dilarang teks tombol terpotong menjadi 2–3 baris.
* [ ] **Button Contrast Check:** Seluruh tombol memenuhi kontras rasio minimal WCAG AA (4.5:1). Dilarang tombol teks putih di atas latar putih atau teks abu-abu pudar tak terbaca.
* [ ] **Hero Stack Discipline:** Bagian hero maksimal terdiri dari 4 elemen teks (Eyebrow opsional, Headline max 2 baris, Subteks max 20 kata, dan max 2 tombol CTA).
* [ ] **Eyebrow Restraint:** Maksimal 1 eyebrow per 3 section halaman.
* [ ] **Authentic Assets Only:** Osiloskop audio wajib dirender menggunakan Web Audio API + HTML5 Canvas nyata; dilarang menggunakan animasi CSS divs tiruan (*fake screenshots/fake waves*).
* [ ] **Mobile Viewport Stability:** Dilarang menggunakan `h-screen` pada hero/studio viewport; wajib menggunakan `min-h-[100dvh]` untuk mencegah lonjakan layout pada Safari iOS.

---

## 2. Frontend Engineering Directives (Inertia.js + React + Tailwind v4)

### 2.1 State Management & Continuous Stream Rules
* **DILARANG menggunakan `useState` untuk event berkelanjutan:**
  * Koordinat tatapan mata (*gaze vector*), data volume desibel mikrofon (*decibel meter*), dan pergerakan kursor mouse **dilarang keras** disimpan di dalam `useState`. Menyimpan nilai frekuensi tinggi dalam `useState` memicu re-render seluruh pohon komponen React 60 kali per detik dan menyebabkan penurunan drastis performa di perangkat seluler.
  * **Solusi Wajib:** Gunakan `useRef` yang diakses langsung oleh loop `requestAnimationFrame`, atau gunakan *Motion values* (`useMotionValue` / `useTransform`).
* **Interactivity Leaf Isolation:**
  Setiap komponen yang menangani loop animasi, listener canvas audio, atau interaksi pointer wajib diisolasi sebagai komponen daun (*leaf component*) terpisah agar komponen layout induk tetap bersih dan stabil.
* **Responsive Layout Rules:**
  * Dilarang menggunakan kalkulasi persentase flexbox manual seperti `w-[calc(33%-1rem)]`. Wajib menggunakan **CSS Grid** (`grid grid-cols-1 md:grid-cols-3 gap-6`).
  * Deklarasikan secara eksplisit perilaku *collapse* mobile pada setiap layout multi-kolom (`< 768px`).

### 2.2 Client-Side MediaPipe Optimization
* Google MediaPipe Face Mesh harus dieksekusi dengan mode `runningMode: "VIDEO"` dan jika memungkinkan didelegasikan ke *Web Worker*.
* Jika frame rate perangkat pengguna turun di bawah 20 FPS, kurangi frekuensi inferensi landmark visual (misal: proses 1 frame setiap 2 tick) agar proses perekaman audio vokal tetap lancar tanpa *audio stutter*.

---

## 3. Backend Engineering Directives (Laravel 12)

### 3.1 Coding Standards & Typing
* Setiap file PHP wajib diawali dengan:
  ```php
  <?php

  declare(strict_types=1);
  ```
* Seluruh parameter metode, *return types*, dan properti kelas wajib memiliki deklarasi tipe data yang ketat (*strict type hinting*).

### 3.2 Thin Controllers & Form Requests
* Controller hanya bertugas menerima HTTP request, memanggil aksi layanan (*Service Action*), dan mengembalikan response JSON / Inertia render.
* Validasi input wajib ditempatkan pada kelas `Illuminate\Foundation\Http\FormRequest` tersendiri, misalnya: `StoreSessionRequest.php`.

### 3.3 Asynchronous Queue Processing
* **Dilarang memanggil API eksternal secara sinkron di controller:**
  Panggilan ke Groq API (Whisper STT) dan Gemini/Claude API (LLM Rubric Evaluation) **wajib** dikirim ke antrean (*Redis Queue*) menggunakan job asynchronous: `ProcessSessionEvaluationJob`.
* Setiap job wajib menyertakan konfigurasi ketahanan:
  ```php
  public int $tries = 3;
  public int $timeout = 60;
  public array $backoff = [2, 10, 30]; // Exponential backoff saat rate limit
  ```

### 3.4 Service Architecture Structure
Pemisahan logika domain ke dalam struktur direktori:
```
app/
├── Http/
│   ├── Controllers/
│   │   └── PracticeSessionController.php
│   └── Requests/
│       └── StoreSessionRequest.php
├── Jobs/
│   └── ProcessSessionEvaluationJob.php
├── Services/
│   ├── Audio/
│   │   ├── GroqWhisperService.php
│   │   └── Contracts/TranscriptionServiceInterface.php
│   ├── Analytics/
│   │   ├── SpeechMetricAnalyzer.php
│   │   └── FillerWordDictionary.php
│   └── AI/
│       ├── LLMRubricEvaluator.php
│       └── Prompts/RubricPromptBuilder.php
```

---

## 4. Security, API Quotas & Storage Policies

1. **Storage Cleanup Policy:**
   File rekaman audio sementara (*temporary chunks*) yang gagal diproses atau sesi yang dibatalkan oleh pengguna harus otomatis dibersihkan oleh cron job Laravel mingguan (`php artisan session:prune-orphaned-audio`).
2. **Signed Audio Streaming URLs:**
   File audio sesi latihan tidak boleh dapat diunduh secara publik tanpa otentikasi. Pemutaran audio di dasbor review harus menggunakan *Laravel Signed Temporary URLs* dengan masa kedaluwarsa 60 menit.
3. **API Key Isolation:**
   Seluruh kunci API (`GROQ_API_KEY`, `GEMINI_API_KEY`) wajib disimpan dalam file `.env` dan diakses melalui `config('services.groq.key')`; dilarang mengakses `env()` langsung di dalam kode aplikasi.

---

## 5. Testing & Verification Standards

* **Unit Testing:**
  * Wajib membuat unit test untuk `SpeechMetricAnalyzerTest` guna memverifikasi keakuratan ekstraksi *filler words* bahasa Indonesia ("anu", "kayak", "seperti itu", "hmmm") dan bahasa Inggris ("um", "uh", "you know") serta perhitungan WPM.
* **Feature Testing:**
  * Wajib membuat feature test untuk alur upload audio dan dispatching job: `PracticeSessionLifecycleTest`.
  * External API (Groq & Gemini) wajib di-mock (*Http::fake()*) dalam seluruh automated test suite agar test dapat berjalan cepat dan offline tanpa menghabiskan kuota token API.
