# Product Requirements Document (PRD) — VOIC
**Autonomous Hybrid AI Public Speaking & Interview Coach**

---

## 1. Executive Summary & Vision

**VOIC** adalah platform pelatih komunikasi, sidang skripsi, dan wawancara kerja berbasis kecerdasan buatan (*AI-powered speaking coach*) yang memadukan **On-Device Computer Vision (Google MediaPipe)** dan **High-Velocity Cloud Audio Intelligence (Groq Whisper + LLM Rubric Evaluation)**.

Masalah utama yang dihadapi mahasiswa tingkat akhir dan pencari kerja (*job seekers*) adalah kecemasan berbicara di depan umum (*glossophobia*), minimnya kontak mata, penggunaan kata pengisi berlebih (*filler words*), dan ketiadaan ruang latihan yang mampu memberikan evaluasi objektif dan terukur. Layanan pelatihan personal (*human coach*) mahal dan tidak *scalable*, sementara solusi AI yang ada di pasar umumnya lambat, mahal, atau sekadar menganalisis transkrip teks tanpa membedah kinetika wajah dan ritme vokal.

**VOIC memecahkan masalah ini dengan pendekatan hybrid:**
1. **Zero-Latency Visual Telemetry (Client-Side / On-Device):** Google MediaPipe memproses kontak mata, arah tatapan, kestabilan postur kepala, dan ekspresi wajah langsung di peramban/perangkat pengguna tanpa mengirim *video stream* ke server (100% hemat *bandwidth*, ramah privasi, latensi 0 ms).
2. **Ultra-Fast Voice & Content Scoring (Cloud Pipeline):** Audio dikirim pasca-sesi ke Groq (Whisper-large-v3) untuk transkripsi sub-detik ber-timestamp, dianalisis secara algoritmik untuk *filler words* dan WPM (*Words Per Minute*), lalu dievaluasi secara mendalam oleh LLM (Gemini 1.5 Flash / Claude 3.5 Sonnet) menggunakan rubrik penilaian standar sidang akademik dan wawancara industri.

---

## 2. Target Persona & Use Cases

### 2.1 Target Persona

| Persona | Profil & Karakteristik | Pain Point Utama | Kebutuhan Solusi |
| :--- | :--- | :--- | :--- |
| **Mahasiswa Tingkat Akhir ("Rian - 22th")** | Menghadapi Sidang Skripsi / Tesis dalam 2–4 minggu. Cenderung gugup saat diuji dosen *killer*. | Sering menunduk membaca catatan, bicara terlalu cepat (>170 WPM), banyak "anu", "kayak", "hmmm". | Simulasi tanya-jawab sidang, evaluasi kontak mata saat presentasi slide, tips artikulasi argumen ilmiah. |
| **Fresh Graduate / Job Seeker ("Dina - 23th")** | Melamar posisi entry-level di korporat / startup. Menghadapi HR & User Interview. | Jawaban berputar-putar (*rambling*), struktur STAR (*Situation, Task, Action, Result*) berantakan. | Latihan menjawab pertanyaan umum (Tell me about yourself, behavioral questions), deteksi *filler words*. |
| **Young Professional ("Budi - 27th")** | Mempersiapkan presentasi pitching ke manajemen / investor. | Monoton, intonasi datar, kurang memancarkan keyakinan (*authority*). | Metrik pacing vokal, visualisasi fluktuasi ritme suara, *executive presence scorecard*. |

### 2.2 Core Scenarios & User Journeys

```
[ Pilih Skenario & Rubrik ] ──> [ Studio Latihan: Kamera + Mic ] ──> [ Selesai Sesi (1 - 10 Menit) ]
          │                                      │                                      │
          ▼                                      ▼                                      ▼
 (Sidang / Interview HR /            MediaPipe Telemetry HUD               Audio + Telemetry JSON
  Technical / Pitching)             (Eye Contact % & Visual Composure)      dikirim ke Laravel API
                                                                                        │
                                                                                        ▼
[ Rekomendasi Latihan Ulang ] <── [ Dasbor Skor & Deep Rubric ] <── [ Groq Whisper + LLM Evaluation ]
```

---

## 3. Product Scope & Functional Requirements

### 3.1 Modul 1: Studio Latihan Real-Time (*The Hardware Studio*)
* **FR-1.1: Audio-Video Device Access & Calibration:** Memeriksa izin mikrofon dan webcam, menampilkan *waveform visualizer* audio real-time dan preview kamera sebelum sesi dimulai.
* **FR-1.2: On-Device MediaPipe Mesh Telemetry:**
  * Pelacakan *Iris & Gaze Vector* untuk mengukur persentase kontak mata ke lensa kamera vs menunduk / melirik.
  * Pelacakan *Head Pose (Pitch, Yaw, Roll)* untuk mendeteksi kegelisahan (geleng-geleng berlebih, kepala miring).
  * Pengukuran *Blink Rate* dan deteksi senyuman (*Smile/Composure Indicator*).
* **FR-1.3: Telemetry HUD (Heads-Up Display):** Menampilkan metrik minimalis bergaya instrumen audio (bukan pop-up warna-warni mengganggu), memberikan *subtle indicator* jika pengguna kehilangan kontak mata >3 detik.
* **FR-1.4: Telemetry Aggregator:** Menghitung *time-series snapshot* per detik ke dalam format JSON terkompresi di sisi klien.

### 3.2 Modul 2: Voice & Transcription Engine
* **FR-2.1: In-Browser Audio Recorder:** Merekam audio vokal pengguna dalam format WebM/Opus terkompresi (sample rate 48kHz, mono) untuk efisiensi transfer data.
* **FR-2.2: Cloud Audio Dispatch via Laravel 12 Queue:** Mengunggah rekaman audio dan paket JSON telemetri visual segera setelah tombol *End Session* ditekan.
* **FR-2.3: Groq Whisper-Large-v3 STT:** Menghasilkan transkrip lengkap dengan *word-level timestamps* dalam waktu <1 detik untuk rekaman durasi 3–5 menit.
* **FR-2.4: Algorithmic Filler Word & Pacing Processor:**
  * Menghitung frekuensi *filler words* berbasis kamus multibahasa (ID: "anu", "kayak", "apa ya", "hmmm", "eung", "seperti itu"; EN: "um", "uh", "like", "you know", "basically").
  * Menghitung dinamika WPM (*Words Per Minute*) per interval 15 detik untuk mendeteksi *rush* atau *dead pauses*.

### 3.3 Modul 3: LLM Rubric Evaluation & Action Plan
* **FR-3.1: Scenario-Specific Rubric Evaluation:** Memasukkan transkrip + metrik vokal/wajah ke LLM (Gemini 1.5 Flash) dengan prompt rubrik spesifik:
  * *Sidang Skripsi:* Ketepatan metodologis, kejelasan argumentasi, ketenangan menghadapi counter-argumen, formalitas bahasa.
  * *Job Interview:* Penerapan metode STAR, kejelasan nilai tambah (*value proposition*), kesopanan profesional.
* **FR-3.2: Comprehensive Scorecard Breakdown:**
  * **Overall Presence Score** (0–100).
  * **Sub-Scores:** Visual Composure (Eye Contact, Stability), Vocal Delivery (Pacing, Filler Words), Argument Quality (Structure, Relevance).
* **FR-3.3: Actionable Drill & Improvement Suggestions:** Memberikan maksimal 3 poin perbaikan konkret dan kalimat alternatif yang direvisi (*rewritten response*).

### 3.4 Modul 4: Session Review & Analytics Dashboard
* **FR-4.1: Synchronized Playback & Scrubbing:** Memungkinkan pengguna memutar ulang rekaman audio dengan transkrip yang tersorot (*karaoke-style*) dan grafik kontak mata yang sinkron pada *timestamp* yang sama.
* **FR-4.2: Filler Word Heatmap:** Menandai kata pengisi langsung pada teks transkrip dengan visual *tactile highlight*.
* **FR-4.3: Historical Progress Tracking:** Membandingkan skor rata-rata sesi pengguna dari waktu ke waktu untuk melihat tren peningkatan rasa percaya diri.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Latency
* **Client-Side FPS:** Google MediaPipe Face Mesh harus berjalan stabil pada minimal **25–30 FPS** di peramban desktop standar (Chrome/Edge/Firefox) tanpa menyebabkan *UI freeze* (wajib menggunakan Web Worker / OffscreenCanvas).
* **Audio Upload Payload:** Ukuran audio WebM/Opus maksimal 1.2 MB per 2 menit rekaman.
* **Evaluation Pipeline Speed:** Waktu total dari penekanan tombol *End Session* hingga hasil analisis muncul di layar maksimal **< 4.5 detik** (Groq Whisper ~0.8s, Algorithmic Engine ~0.1s, Gemini 1.5 Flash ~2.5s).

### 4.2 Security, Privacy & Compliance
* **Zero Video Server Storage:** Video webcam **tidak pernah** diunggah ke server backend. Seluruh pemrosesan visual terjadi 100% *on-device*. Server hanya menerima angka metrik matematis (vektor arah tatap dan persentase).
* **Audio Lifecycle Policy:** Rekaman audio disimpan di penyimpanan aman (*encrypted S3/local storage*) dan secara otomatis dapat dihapus permanen oleh pengguna kapan saja (*user-controlled data retention*).
* **Auth & Session Guard:** Autentikasi menggunakan Laravel Sanctum dengan perlindungan CSRF dan rate limiting ketat pada endpoint AI.

### 4.3 Design Integrity (Anti-Slop Directives)
* Desain antarmuka wajib mengadopsi estetika **Cold Luxury & Hardware Aesthetic** (terinspirasi Teenage Engineering, Dieter Rams, dan instrumen audio presisi).
* Dilarang keras menggunakan *AI Slop clichés*: dilarang gradien ungu/violet melayang, dilarang hero text terpusat dengan 3 kartu identik, dilarang placeholder tanpa label, dilarang fake-screenshot divs.
* Antarmuka berfokus pada visualisasi telemetri data fungsional: osiloskop audio nyata, crosshair kontak mata presisi, dan tipografi teknis berkarakter tinggi (*Geist* & *Geist Mono*).

---

## 5. Success Metrics & Key Performance Indicators (KPIs)

1. **Evaluation Turnaround Time:** Rata-rata waktu evaluasi < 5 detik.
2. **Eye-Contact Accuracy:** Korelasi akurasi deteksi tatapan MediaPipe > 90% pada berbagai kondisi pencahayaan ruangan.
3. **Filler Word Detection Precision:** Presisi deteksi kata pengisi bahasa Indonesia & Inggris > 92%.
4. **User Confidence Gain:** Peningkatan rata-rata skor performa pengguna sebesar minimal 25% setelah 5 kali sesi latihan.
