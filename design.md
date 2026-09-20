# Design System & Anti-Slop Directive — VOIC
**Aesthetic: Luminous Cold Precision — Light Studio & Jade-to-Blue Gradient**
*(Inspired by Braun Precision Instruments, Clean Laboratory Aesthetics, and Luminous Jade-to-Blue Telemetry)*

---

## 0. Design Read & Configuration Dials

> **Design Read:**  
> *"Reading this as: Web-first AI public speaking & interview practice platform (VOIC) for students & job seekers, with a luminous Light Studio / Precision Hardware language, leaning toward Tailwind v4 + Inertia React + Geist / technical typography + real-time canvas telemetry + Jade-to-Blue gradient accents, strictly anti-slop."*

### The Three Dials
* **`DESIGN_VARIANCE: 7`** — Asymmetric technical layout, clean light studio grid, deliberate telemetry rhythm over predictable center-aligned cards.
* **`MOTION_INTENSITY: 5`** — Tactile hardware feedback, crisp spring transitions (`stiffness: 120, damping: 18`), dynamic audio oscilloscopes; zero floaty AI loops.
* **`VISUAL_DENSITY: 6`** — Studio cockpit density; high-information readability, clean telemetry metrics, crisp hairlines, generous breathing room for high-impact typography.

---

## 1. Anti-Slop Discipline (Strict Prohibitions)

Untuk memastikan antarmuka VOIC tidak tampak seperti *template AI generik* (*AI slop*), aturan berikut bersifat **wajib dan tanpa kompromi**:

| No | Cliché / AI Slop Tell | Aturan Ketat VOIC (Solusi & Standar) |
| :---: | :--- | :--- |
| **1** | **AI-Purple / Lila Glow Gradients** | **Dilarang keras.** Tidak boleh ada tombol bercahaya ungu, blur mesh ungu, atau teks gradien cyan-ke-ungu. Basis warna adalah *cold graphite* dan *matte black*, dengan satu aksen fungsional: **Radar Amber (`#F59E0B`)** khas lampu instrumen studio rekaman. |
| **2** | **Hero Tengah dengan 3 Kartu Identik** | **Dilarang layout 3 kartu berjejer rata dengan ikon di tengah.** Gunakan layout asimetris, *split-screen*, atau bento grid dengan ritme hierarki visual nyata (kombinasi osiloskop interaktif, HUD crosshair, dan modul telemetri data). |
| **3** | **Div-Based Fake Screenshots** | **Dilarang membuat screenshot tiruan menggunakan elemen `<div>` bergaris.** Gunakan antarmuka fungsional nyata: *real-time Canvas Web Audio waveform*, viewport kamera terintegrasi, dan tabel metrik interaktif. |
| **4** | **Placeholder Sebagai Label Form** | **Dilarang menjadikan placeholder sebagai label.** Label wajib berada di atas input dengan tipografi monospaced yang jelas. Helper text dan error text diletakkan di posisi semantik yang terstandarisasi. |
| **5** | **Eyebrow di Setiap Section** | **Maksimal 1 eyebrow per 3 section.** Tidak boleh ada label huruf kapital kecil (*small-caps uppercase tracking*) di atas setiap judul section. Biarkan judul berbicara sendiri melalui skala tipografis yang kuat. |
| **6** | **Font Serif Mewah Generik (Fraunces / Instrument Serif)** | **Dilarang menggunakan font serif default AI.** VOIC adalah instrumen presisi teknik. Gunakan kombinasi sans-serif berkarakter tinggi (**Geist** atau **Cabinet Grotesk**) dipadukan dengan **Geist Mono / JetBrains Mono** untuk data telemetri. |
| **7** | **Animasi Tanpa Tujuan (*Motion Slop*)** | **Dilarang animasi melayang (*floating blobs*) atau infinite pulse pada kartu statis.** Semua gerakan harus memiliki motivasi fisik (*tactile button press*, *spring response*, *live audio response*, *scrubbing sync*). |
| **8** | **Theme Inconsistency** | **Page Theme Lock.** VOIC mengadopsi tema gelap studio industrial (*Cold Dark Monochrome*). Seluruh section mengalir dalam satu kesatuan palet tanpa peralihan mendadak ke warna krem/beige. |

---

## 2. Color Calibration & Design Tokens
VOIC mengadopsi palet **Luminous Light Studio & Jade Gradient Blue**. Kanvas terang berlatar slate dingin dipadukan dengan aksen gradasi **Jade / Emerald (`#059669` / `#0D9488`) menuju Azure / Sapphire Blue (`#0284C7` / `#2563EB`)**.

### 2.1 Color Palette Table

```
Base: Crisp Studio Canvas (#f8fafc) ──> Pure Instrument White (#ffffff)
Accent: Jade-to-Blue Gradient (from #059669 via #0284c7 to #2563eb)
Text: Deep Slate Charcoal (#0f172a) & Medium Steel (#475569)
```

| Token Name | Hex Code | Tailwind v4 Equivalent | Peruntukan & Penggunaan |
| :--- | :--- | :--- | :--- |
| `--surface-canvas` | `#f8fafc` | `bg-slate-50` | Latar belakang kanvas utama aplikasi (Light) |
| `--surface-panel` | `#ffffff` | `bg-white` | Latar belakang panel kartu dan modul instrumen |
| `--surface-elevated`| `#f1f5f9` | `bg-slate-100` | State hover, dropdown, dan bilah instrumen sekunder |
| `--border-hairline` | `#e2e8f0` | `border-slate-200` | Garis batas presisi 1px antar modul instrumen |
| `--border-focus` | `#0d9488` | `border-teal-600` | Garis batas aktif saat input menerima fokus |
| `--accent-gradient` | `linear-gradient` | `from-teal-600 to-blue-600` | **Aksen Utama:** Tombol primer, progress bar, badge terpilih |
| `--signal-record` | `#ef4444` | `bg-red-500` | Indikator visual sesi perekaman kamera/mic aktif |
| `--text-primary` | `#0f172a` | `text-slate-900` | Tipografi judul dan nilai data utama |
| `--text-secondary` | `#475569` | `text-slate-600` | Penjelasan, label instrumen, dan transkrip pendukung |
| `--text-tertiary` | `#94a3b8` | `text-slate-400` | Timestamp audio, metadata non-kritis, satuan metrik |

### 2.2 Shape & Radius Consistency Lock
* **Aturan Konsistensi Radius:** Seluruh elemen interaktif dan wadah modul menggunakan radius teknis yang seragam: **`rounded-md` (6px)** untuk tombol dan input, **`rounded-lg` (8px)** untuk kontainer panel studio.
* **Dilarang Mencampur Radius:** Dilarang tombol *full-pill* berbentuk kapsul di samping kotak bersudut tajam.

---

## 3. Typography Hierarchy & Architecture

Sistem tipografi VOIC memancarkan presisi teknis laboratorium audio:

### 3.1 Font Stack
* **Primary Sans (Display & Body):** `Geist` (atau alternatif: `Instrument Sans`, `Cabinet Grotesk`, `Inter Display`).
* **Technical Monospace (Telemetry, Timestamps, WPM, Counters):** `Geist Mono` (atau `JetBrains Mono`).

### 3.2 Typographic Hierarchy Scale

| Elemen | Skala Font & Tailwind Class | Weight | Tracking & Leading |
| :--- | :--- | :--- | :--- |
| **Studio H1 (Display)** | `text-4xl md:text-5xl lg:text-6xl` | `font-semibold` | `tracking-tight leading-none` |
| **Panel Header (H2)** | `text-xl md:text-2xl` | `font-medium` | `tracking-tight leading-tight text-zinc-100` |
| **Telemetry Readout** | `font-mono text-3xl md:text-4xl` | `font-bold` | `tracking-tight text-amber-500` |
| **Instrument Label** | `font-mono text-[11px] uppercase` | `font-medium` | `tracking-widest text-zinc-400` |
| **Body / Feedback Text**| `text-sm md:text-base` | `font-normal` | `leading-relaxed text-zinc-300 max-w-[65ch]` |
| **Transcript Stream** | `text-base md:text-lg` | `font-normal` | `leading-loose text-zinc-200` |
| **Timecode Display** | `font-mono text-xs` | `font-normal` | `tabular-nums text-zinc-500` |

---

## 4. Component Design Patterns: The Hardware Studio

### 4.1 The Viewfinder HUD (Camera Overlay)
* Viewfinder kamera dilengkapi garis bidik visual (*viewfinder crosshair*) berpresisi tinggi:
  * Sudut kurung 1px pada keempat pojok (`border-t-2 border-l-2 border-zinc-500 w-3 h-3`).
  * Garis horizontal tengah tipis dengan indikator kontak mata (*Iris Vector Target*).
  * Indikator status di pojok kiri atas: `REC [●] 00:02:34` dengan font monospaced tabular.
  * Skor kontak mata waktu nyata di pojok kanan atas: `EYE CONTACT: 88%` dengan aksen amber.

### 4.2 The Real-Time Waveform Oscilloscope (Canvas)
* Bukan animasi CSS acak! Menggunakan `<canvas>` yang membaca *Frequency / Time Domain Data* dari `AnalyserNode` browser secara langsung.
* Visualisasi berbentuk garis gelombang presisi tinggi (*green phosphor* atau *amber monochrome*), merefleksikan dinamika vokal pengguna secara autentik saat berbicara.

### 4.3 Tactile Hardware Controls
* **Primary Trigger Button (Record / End Session):**
  * Warna: `bg-amber-500 text-zinc-950 font-semibold`.
  * Efek Taktil: Pada `:hover`, `bg-amber-400`. Pada `:active`, `translate-y-[1px] scale-[0.98]` untuk sensasi sentuhan saklar mekanikal perangkat keras.
* **Secondary Utility Button:**
  * Warna: `bg-zinc-900 text-zinc-200 border border-zinc-800`.
  * Efek Taktil: `:hover:border-zinc-700 :active:translate-y-[1px]`.
* **Telemetry Gauges (WPM & Filler Meter):**
  * Desain meteran horizontal bertingkat (*segmented LED bar graph style*) bukan progress bar bulat generik.

### 4.4 Synchronized Transcript & Audio Scrubber
* Bilah audio dirancang menyerupai *waveform scrubbing rack* pada DAW (Digital Audio Workstation).
* Kata-kata pada transkrip memiliki status:
  * `Normal:` `text-zinc-400`
  * `Current Spoken Word:` `text-amber-400 font-medium bg-amber-500/10 px-1 rounded`
  * `Filler Word Flagged:` `text-red-400 line-through decoration-red-500/50 bg-red-500/10 px-1 rounded`

---

## 5. Motion Guidelines & Physics Calibration

1. **Spring Physics Standard:**
   ```typescript
   export const hardwareSpring = {
     type: "spring",
     stiffness: 140,
     damping: 20,
     mass: 0.8
   };
   ```
2. **Reduced Motion Respect:**
   Setiap animasi UI wajib mematuhi media query `prefers-reduced-motion: reduce`. Saat aktif, transisi langsung dialihkan ke *instant opacity cut* tanpa transformasi posisi atau skala.
3. **No Unmotivated Motion:**
   Setiap transisi wajib merepresentasikan perubahan status yang nyata (e.g., inisialisasi mic, transmisi data selesai, pergeseran scrubber audio).
