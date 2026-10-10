(function () {
  'use strict';
  var KEY = 'easyquizz:v1', TOTAL = 5, TIME = 20;
  var CATS = { acak: 'Acak', umum: 'Umum', web: 'Web', sains: 'Sains' };
  var BANK = [
    { c: 'umum', q: 'Danau vulkanik terbesar di Indonesia berada di provinsi ...', o: ['Sumatera Utara', 'Sulawesi Selatan', 'Jawa Barat', 'Bali'], a: 0 },
    { c: 'umum', q: 'Siapa yang membacakan teks Proklamasi pada 17 Agustus 1945?', o: ['Soekarno', 'Mohammad Hatta', 'Sutan Sjahrir', 'Ki Hajar Dewantara'], a: 0 },
    { c: 'umum', q: 'Lambang sila ketiga Pancasila adalah ...', o: ['Pohon beringin', 'Kepala banteng', 'Rantai', 'Padi dan kapas'], a: 0 },
    { c: 'umum', q: 'Benua dengan wilayah terluas di dunia adalah ...', o: ['Asia', 'Afrika', 'Amerika Utara', 'Eropa'], a: 0 },
    { c: 'umum', q: 'Alat musik angklung berasal dari daerah ...', o: ['Jawa Barat', 'Sumatera Barat', 'Papua', 'Nusa Tenggara Timur'], a: 0 },
    { c: 'umum', q: 'Hasil dari 12 x 12 adalah ...', o: ['144', '124', '122', '154'], a: 0 },
    { c: 'web', q: 'HTML adalah singkatan dari ...', o: ['HyperText Markup Language', 'HighText Machine Language', 'HyperTool Multi Language', 'Home Text Markup Language'], a: 0 },
    { c: 'web', q: 'Properti CSS untuk mengubah warna teks adalah ...', o: ['color', 'font-style', 'text-color', 'background'], a: 0 },
    { c: 'web', q: 'Method JavaScript untuk mengambil elemen berdasarkan id adalah ...', o: ['document.getElementById()', 'document.getId()', 'document.queryId()', 'window.findElement()'], a: 0 },
    { c: 'web', q: 'Tag HTML untuk membuat tautan adalah ...', o: ['<a>', '<link>', '<href>', '<url>'], a: 0 },
    { c: 'web', q: 'LocalStorage menyimpan nilai dalam bentuk ...', o: ['String', 'Boolean saja', 'Array langsung', 'Object langsung'], a: 0 },
    { c: 'web', q: 'Operator yang membandingkan nilai sekaligus tipe data adalah ...', o: ['===', '==', '=', '!='], a: 0 },
    { c: 'sains', q: 'Planet terbesar di tata surya adalah ...', o: ['Jupiter', 'Saturnus', 'Neptunus', 'Bumi'], a: 0 },
    { c: 'sains', q: 'Rumus kimia air adalah ...', o: ['H2O', 'CO2', 'O2', 'NaCl'], a: 0 },
    { c: 'sains', q: 'Gas yang diserap tumbuhan saat fotosintesis adalah ...', o: ['Karbon dioksida', 'Oksigen', 'Nitrogen', 'Hidrogen'], a: 0 },
    { c: 'sains', q: 'Satuan gaya dalam SI adalah ...', o: ['Newton', 'Joule', 'Watt', 'Pascal'], a: 0 },
    { c: 'sains', q: 'Organ yang memompa darah ke seluruh tubuh adalah ...', o: ['Jantung', 'Paru-paru', 'Hati', 'Ginjal'], a: 0 },
    { c: 'sains', q: 'Kecepatan cahaya di ruang hampa sekitar ...', o: ['300.000 km/detik', '30.000 km/detik', '3.000 km/detik', '3.000.000 km/detik'], a: 0 }
  ];

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  var shuffle = function (arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  var fmt = function (ts) { return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); };

  /* ---------- LocalStorage ---------- */
  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    d = d && typeof d === 'object' ? d : {};
    return { best: d.best || {}, history: Array.isArray(d.history) ? d.history : [], theme: d.theme || null };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage penuh atau diblokir */ } }
  var db = load();

  /* ---------- Elemen ---------- */
  var views = { home: $('#view-home'), quiz: $('#view-quiz'), result: $('#view-result') };
  var optBox = $('#options'), fb = $('#q-fb'), nextBtn = $('#next'), bar = $('#prog-bar'), prog = $('#prog');
  var S = { cat: 'acak', list: [], i: 0, score: 0, locked: false, left: TIME, tm: null };

  function show(name) {
    clearInterval(S.tm);
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    window.scrollTo(0, 0);
    var h = views[name].querySelector('h1,h2');
    if (name !== 'home' && h) h.focus({ preventScroll: true });
    if (name === 'home') paintHome();
  }

  /* ---------- Beranda ---------- */
  function paintHome() {
    $$('#cats [data-cat]').forEach(function (b) {
      var s = db.best[b.dataset.cat];
      b.querySelector('.best').textContent = s ? 'Terbaik: ' + s.points : 'Belum dimainkan';
    });
    var ul = $('#history');
    ul.textContent = '';
    if (!db.history.length) ul.append(el('li', 'empty', 'Belum ada riwayat. Mulai satu ronde untuk melihat skormu di sini.'));
    db.history.forEach(function (h) {
      var li = el('li');
      li.append(el('span', 'h-cat', CATS[h.cat] || h.cat), el('span', 'h-sc', h.score + ' dari ' + TOTAL + ' benar'), el('span', 'h-pts', String(h.points)), el('span', 'h-date', fmt(h.date)));
      ul.append(li);
    });
  }

  /* ---------- Kuis ---------- */
  function start(cat) {
    var pool = cat === 'acak' ? BANK : BANK.filter(function (q) { return q.c === cat; });
    S.cat = cat;
    S.list = shuffle(pool).slice(0, TOTAL).map(function (q) {
      return { c: q.c, q: q.q, o: shuffle(q.o.map(function (t, k) { return { t: t, ok: k === q.a }; })) };
    });
    S.i = 0; S.score = 0;
    $('#q-score').textContent = '0';
    bar.style.width = '0%';
    show('quiz');
    render();
  }

  function render() {
    var q = S.list[S.i];
    S.locked = false;
    $('#q-count').textContent = 'Soal ' + (S.i + 1) + ' dari ' + S.list.length;
    $('#q-cat').textContent = 'Kategori ' + CATS[q.c];
    $('#q-text').textContent = q.q;
    prog.setAttribute('aria-valuenow', String(S.i));
    fb.textContent = ''; fb.className = 'feedback';
    nextBtn.hidden = true;
    optBox.textContent = '';
    q.o.forEach(function (opt, k) {
      var li = el('li'), b = el('button', 'opt');
      b.type = 'button';
      b.dataset.i = String(k);
      b.append(el('span', 'key', 'ABCD'.charAt(k)), el('span', 'txt', opt.t), el('span', 'tag'));
      li.append(b);
      optBox.append(li);
    });
    var body = $('#q-body');
    body.classList.remove('enter');
    void body.offsetWidth;
    body.classList.add('enter');
    S.left = TIME; paintTime();
    clearInterval(S.tm);
    S.tm = setInterval(function () { S.left--; paintTime(); if (S.left <= 0) answer(-1); }, 1000);
  }

  function paintTime() {
    $('#q-time').textContent = S.left + ' dtk';
    $('#q-timer').classList.toggle('warn', S.left <= 5);
  }

  function answer(k) {
    if (S.locked) return;
    S.locked = true;
    clearInterval(S.tm);
    var q = S.list[S.i], hit = k >= 0 && q.o[k].ok;
    $$('#options .opt').forEach(function (b, j) {
      b.disabled = true;
      if (q.o[j].ok) { b.classList.add('correct'); b.querySelector('.tag').textContent = 'Benar'; }
      else if (j === k) { b.classList.add('wrong'); b.querySelector('.tag').textContent = 'Salah'; }
    });
    if (hit) S.score++;
    fb.textContent = k < 0 ? 'Waktu habis. Jawaban yang benar ditandai hijau.' : hit ? 'Jawabanmu benar.' : 'Jawabanmu salah. Jawaban yang benar ditandai hijau.';
    fb.className = 'feedback ' + (hit ? 'good' : 'bad');
    $('#q-score').textContent = String(S.score);
    bar.style.width = ((S.i + 1) / S.list.length * 100) + '%';
    prog.setAttribute('aria-valuenow', String(S.i + 1));
    nextBtn.textContent = S.i === S.list.length - 1 ? 'Lihat hasil' : 'Soal berikutnya';
    nextBtn.hidden = false;
    nextBtn.focus();
  }

  function finish() {
    var pts = Math.round(S.score / S.list.length * 100), prev = db.best[S.cat];
    var isNew = pts > 0 && (!prev || pts > prev.points);
    if (isNew) db.best[S.cat] = { points: pts, date: Date.now() };
    db.history.unshift({ cat: S.cat, score: S.score, points: pts, date: Date.now() });
    db.history = db.history.slice(0, 5);
    save();
    $('#r-points').textContent = String(pts);
    $('#r-detail').textContent = S.score + ' dari ' + S.list.length + ' soal dijawab benar. ' +
      (pts >= 80 ? 'Hasil yang kuat.' : pts >= 60 ? 'Cukup baik, coba lagi untuk skor lebih tinggi.' : 'Pelajari lagi lalu ulangi kuisnya.');
    $('#r-new').hidden = !isNew;
    var best = db.best[S.cat];
    $('#r-best').textContent = best ? 'Skor tertinggi kategori ' + CATS[S.cat] + ': ' + best.points : 'Belum ada skor tertinggi di kategori ' + CATS[S.cat] + '.';
    show('result');
  }

  /* ---------- Event ---------- */
  optBox.addEventListener('click', function (e) {          // event delegation untuk pilihan jawaban
    var b = e.target.closest('button[data-i]');
    if (b && optBox.contains(b)) answer(Number(b.dataset.i));
  });
  $('#cats').addEventListener('click', function (e) {      // event delegation untuk kategori
    var b = e.target.closest('[data-cat]');
    if (b) start(b.dataset.cat);
  });
  nextBtn.addEventListener('click', function () {
    if (S.i >= S.list.length - 1) finish(); else { S.i++; render(); }
  });
  $('#play').addEventListener('click', function () { start('acak'); });
  $('#restart').addEventListener('click', function () { start(S.cat); });
  $('#home').addEventListener('click', function () { show('home'); });
  $('#brand').addEventListener('click', function () { show('home'); });
  $('#quit').addEventListener('click', function () { show('home'); });
  $('#reset').addEventListener('click', function () {
    if (!db.history.length && !Object.keys(db.best).length) return;
    if (window.confirm('Hapus semua skor dan riwayat?')) { db.best = {}; db.history = []; save(); paintHome(); }
  });

  /* ---------- Tema ---------- */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#theme').setAttribute('aria-pressed', String(t === 'dark'));
  }
  var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(db.theme || (dark ? 'dark' : 'light'));
  $('#theme').addEventListener('click', function () {
    var t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(t); db.theme = t; save();
  });

  paintHome();
})();
