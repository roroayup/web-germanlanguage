# Deutsch A1 — Study with ru

Aplikasi belajar bahasa Jerman level **A1**: landing page, flashcard spaced repetition,
latihan der/die/das, latihan konjugasi, ringkasan tata bahasa, latihan mendengar, dan kuis
campuran. Tanpa akun dan tanpa backend. Semuanya berjalan di browser, dan progres disimpan
di perangkat.

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · React Router 7 · Web Speech API · localStorage

## Menjalankan

```bash
npm install
npm run dev            # http://localhost:3002
npm run build          # validasi data + bundle produksi → dist/
npm run preview        # sajikan hasil build di :4173
npm run lint
npm run data:validate  # cek konten di src/data/ saja
```

## Fitur

| Halaman | Route | Isi |
| --- | --- | --- |
| Beranda | `/` | Landing page, streak, dan jumlah kata yang dikuasai |
| Vokabeln | `/vokabeln` | Flashcard 265 kata + 59 kata kerja, filter per topik, daftar kata |
| Artikel-Trainer | `/artikel` | Tebak der/die/das untuk 175 kata benda, dengan petunjuk akhiran dan pengecualiannya |
| Konjugation | `/konjugation` | Ketik bentuk Präsens/Perfekt, plus tabel konjugasi yang bisa dicari |
| Grammatik | `/grammatik` | 14 topik A1 dengan tabel, contoh berpengucapan, dan latihan |
| Hören | `/hoeren` | 59 kalimat: mode pilih arti atau dikte, kecepatan lambat/normal |
| Quiz | `/quiz` | Kuis campuran 5 jenis soal, riwayat 20 kuis terakhir |
| Fortschritt | `/fortschritt` | Statistik, progres per mode dan topik, daftar "sering salah", export/import/reset |

Topik kosakata (15): Begrüßung, Zahlen, Zeit, Familie, Essen & Trinken, Wohnen, Stadt &
Verkehr, Einkaufen & Kleidung, Arbeit & Lernen, Freizeit, Körper & Gesundheit, Wetter,
Reisen, Farben & Eigenschaften, Wichtige Wörter.

## Struktur

```
src/
  data/        konten JSON, satu-satunya sumber materi
               topics · vocabulary · verbs · grammar · sentences
  lib/         logika murni tanpa React
               srs.js (Leitner) · quiz.js · normalize.js (cek jawaban & umlaut)
               german.js (pronomen, Perfekt, warna gender, petunjuk artikel)
               speech.js · storage.js · shuffle.js · site.js
  hooks/       useProgress · useSpeech · useSession · useTheme · useReveal
  context/     ProgressProvider, satu-satunya store progres
  components/
    ui/        primitif tampilan (Button, Card, Segmented, ArticleTag, Icon, …)
    layout/    Navbar, BottomNav, Footer, PageShell
    features/  komponen per mode latihan (drill, summary, AnswerInput, …)
  pages/       satu file per route
scripts/
  validate-data.mjs   dijalankan otomatis sebelum build
```

## Menambah materi

Semua materi ada di `src/data/`. Tambahkan baris baru, lalu jalankan `npm run data:validate`.

**Kosakata** (`vocabulary.json`):

```json
{"id":"v-loeffel","de":"Löffel","article":"der","plural":"Löffel","pos":"noun",
 "meaning":"sendok","example":"Ich brauche einen Löffel.","exampleMeaning":"Saya butuh sendok.","topic":"essen"}
```

- `pos`: `noun` · `adj` · `adv` · `phrase` · `number` · `question` · `conj`
- `article` dan `plural` hanya untuk `noun` (`plural: null` jika tidak ada bentuk jamak;
  tambahkan `"pluralOnly": true` untuk kata seperti *die Eltern*)
- `topic` harus salah satu id di `topics.json`

**Kata kerja** (`verbs.json`): isi keenam bentuk `present` (`ich du er wir ihr sie`), `aux`
(`haben`/`sein`) dan `partizip`. Untuk kata kerja trennbar, tambahkan `"separable": true,
"prefix": "auf"` dan tulis bentuknya terpisah (`"stehe auf"`).

**Latihan grammar**: jawaban yang benar boleh selalu ditaruh di urutan pertama
(`"answer": 0`), karena aplikasi mengacak pilihannya.

Validator menolak build jika ada kata benda tanpa artikel atau huruf kapital, topik yang tidak
dikenal, bentuk trennbar yang awalannya tidak terpisah, baris tabel yang lebarnya tidak cocok,
dan id ganda.

## Keputusan desain

- **Warna = gender.** der biru, die merah, das hijau, konsisten di semua halaman, supaya
  ingatan visual ikut membantu menghafal artikel.
- **Jawaban ketik yang pemaaf, tetapi jujur.** `ae/oe/ue/ss` diterima sebagai `ä/ö/ü/ß`, dan
  huruf kapital serta tanda baca tidak dianggap salah. Setiap kelonggaran diberi catatan ejaan
  yang benar. Lihat `lib/normalize.js`.
- **Audio tanpa file audio.** Kalimat dibacakan oleh suara `de-DE` di perangkat. Jika
  perangkat tidak punya suara Jerman, tombol audio disembunyikan, dan latihan Hören berubah
  menjadi latihan membaca disertai petunjuk cara memasang suara.
- **Spaced repetition per mode.** Kunci progres diberi namespace (`card:`, `artikel:`,
  `konj:`, `hoeren:`, `grammatik:`), sehingga hafal arti kata dan hafal artikelnya dilacak
  terpisah.
- **Petunjuk artikel yang tidak menyesatkan.** Aturan akhiran dibedakan antara "selalu"
  (-ung, -chen) dan "biasanya" (-e). Jika kata melanggar aturan, aplikasi menyebutnya
  pengecualian, bukan diam saja.
- **Ringan di awal.** Landing page hanya memuat `topics.json`. Setiap mode latihan di-split
  dan membawa JSON-nya sendiri.
- **Mode gelap** lewat token warna semantik di `index.css`. Komponen tidak perlu varian
  `dark:`, dan tema diterapkan sebelum render pertama supaya tidak berkedip.
- **Aksesibel.** Navigasi keyboard (1/2/3, Spasi, Enter), `lang="de"` pada teks Jerman, dan
  semua animasi dimatikan saat `prefers-reduced-motion`.

## Deploy ke Firebase Hosting

`firebase.json` sudah dikonfigurasi: SPA rewrites (supaya refresh di `/vokabeln` tetap
jalan), cache panjang untuk aset ber-hash, dan `no-cache` untuk `index.html`.

Live di **https://deutsch-mit-ru.web.app** (project `portfolio-german`, site `deutsch-mit-ru`).
Repo sudah terhubung lewat `.firebaserc` dan `"site"` di `firebase.json`, jadi update cukup:

```bash
npm run build && firebase deploy --only hosting
```
