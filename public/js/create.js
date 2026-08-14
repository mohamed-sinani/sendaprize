/* sendaprize, create wizard — surprise gifts for family & loved ones */

const PLACEHOLDERS = {
  spouse: { title: 'For my dearest', from: 'Your loving spouse', message: 'Every day with you is a gift…' },
  parents: { title: 'For my parents', from: 'Your loving child', message: 'Thank you for everything you have always done for me…' },
  family: { title: 'For my family', from: 'Your family', message: 'However far apart we are, you are always in my heart…' },
  friend: { title: 'For a dear friend', from: 'Your friend', message: 'A good friend is one of life\u2019s greatest gifts…' },
  nikah: { title: 'Our wedding invitation', from: 'Your family', message: 'We joyfully invite you to celebrate our new beginning…' },
  baby: { title: 'Welcome, little one', from: 'Your family', message: 'Welcome to the world, little one. May you always know how loved you are…' },
  graduation: { title: 'Congratulations, you graduated!', from: 'Your family', message: 'So proud of you. May this achievement be the start of even greater things…' },
  congratulations: { title: 'Congratulations!', from: 'Your family', message: 'So happy for you! Wishing you every good thing in this new chapter…' },
  nanenane: { title: 'Nane Nane', from: 'Your family', message: 'Thank you for feeding this nation. Wishing you a bountiful harvest…' },
  sabasaba: { title: 'Happy Saba Saba', from: 'Your family', message: 'Proud of you and the work you do. May it keep growing…' },
  union: { title: 'Happy Union Day', from: 'Your family', message: 'Happy Union Day to all Tanzanians, in unity and peace…' },
  independence: { title: 'Happy Independence Day', from: 'Your family', message: 'Proud to be Tanzanian. May our nation grow in unity and peace…' },
  revolution: { title: 'Zanzibar Revolution Day', from: 'Your family', message: 'Salamu za siku hii ya uhuru, kwa ndugu zetu wa Zanzibar…' },
};

const PH_DEFAULTS = {
  family: { title: 'For someone I love', from: 'Your family', message: 'Thinking of you with all my love…' },
  celebration: { title: 'Congratulations!', from: 'Your family', message: 'Wishing you all the best on this special day…' },
  tanzania: { title: 'Happy holiday', from: 'Your family', message: 'Wishing you a happy and joyful day…' },
  world: { title: 'Thinking of you', from: 'Your family', message: 'Thinking of you on this day, with love…' },
};

const MESSAGE_IDEAS = [
  'Every day with you is a gift…',
  'Thank you for everything you have always done for me…',
  'However far apart we are, you are always in my heart…',
  'A good friend is one of life\u2019s greatest gifts…',
  'So proud of you. May this achievement be the start of even greater things…',
  'So happy for you! Wishing you every good thing in this new chapter…',
  'Thinking of you today, and wishing you all the happiness in the world…',
  'I wanted to send you a little reminder of how much you mean to me…',
  'On this special day, I just want you to know how loved you are…',
  'No matter what, I\u2019m always here for you…',
];

const draft = {
  type: localStorage.getItem('ap_type') || 'spouse',
  title: '',
  message: '',
  from: '',
  images: [],
};

let step = 1;
const TOTAL_STEPS = 4;
const SAVE_KEY = 'ap_draft_v1';

function saveDraft() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      type: draft.type, title: draft.title, message: draft.message, from: draft.from,
      images: draft.images, step,
    }));
  } catch (e) { /* storage full — continue without persistence */ }
}

function clearDraft() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function restoreDraft() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) {}
  if (!s) return;
  draft.type = s.type || draft.type;
  draft.title = s.title || '';
  draft.message = s.message || '';
  draft.from = s.from || '';
  draft.images = Array.isArray(s.images) ? s.images : [];
  if (s.step >= 1 && s.step <= TOTAL_STEPS) step = s.step;
}

function updatePlaceholders() {
  const o = OCCASIONS.byKey[draft.type] || {};
  const ph = PLACEHOLDERS[draft.type] || PH_DEFAULTS[o.cat] || PH_DEFAULTS.family;
  $('#fTitle').placeholder = ph.title;
  $('#fFrom').placeholder = ph.from;
  $('#fMessage').placeholder = ph.message;
}

function typeFromText(val) {
  const v = (val || '').trim();
  if (!v) return { key: 'spouse', name: 'For my spouse', o: null };
  const match = OCCASIONS.list.find((o) => o.name.toLowerCase() === v.toLowerCase());
  if (match) return { key: match.key, name: match.name, o: match };
  return { key: v, name: v, o: null };
}

function renderTypes() {
  const input = $('#occInput');
  const list = $('#occList');
  let active = -1;

  const POPULAR = ['spouse', 'parents', 'friend', 'family', 'birthday', 'graduation', 'baby', 'nikah']
    .map((k) => OCCASIONS.byKey[k]).filter(Boolean);

  function markActive() {
    Array.prototype.forEach.call(list.querySelectorAll('.occ-item'), (el, i) =>
      el.classList.toggle('sel', i === active));
  }

  function scrollActive() {
    const el = list.querySelectorAll('.occ-item')[active];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function showList(items, note) {
    if (!items.length && !note) { list.style.display = 'none'; return; }
    list.innerHTML =
      items.map((o) =>
        '<button type="button" class="occ-item" data-key="' + o.key + '">' +
        '<span class="t-ico"><i data-lucide="' + OCCASIONS.iconName(o) + '"></i></span>' +
        '<span style="flex:1"><b>' + o.name + '</b>' +
        (o.hint ? '<span class="hint">' + o.hint + '</span>' : '') +
        '</span></button>').join('') +
      (note ? '<div class="occ-empty">' + note + '</div>' : '');
    list.style.display = 'block';
    active = -1;
    markActive();
    refreshIcons();
  }

  function renderSuggestions() {
    const v = input.value.trim();
    if (!v) { showList(POPULAR, ''); return; }
    const q = v.toLowerCase();
    const items = OCCASIONS.list
      .filter((o) => (o.name + ' ' + (o.hint || '')).toLowerCase().indexOf(q) !== -1)
      .slice(0, 8);
    const known = typeFromText(v);
    const note = items.length
      ? (known.o ? '' : 'No exact match — your own words will be used.')
      : 'No suggestions found — your own words will be used.';
    showList(items, note);
  }

  function pick(o) {
    input.value = o.name;
    draft.type = o.key;
    hide();
    updatePlaceholders();
    updatePreview();
    saveDraft();
  }

  function hide() { list.style.display = 'none'; }

  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);

  list.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.occ-item');
    if (!item) return;
    e.preventDefault();
    pick(OCCASIONS.byKey[item.dataset.key]);
  });

  list.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.occ-item');
    if (!item) return;
    active = Array.prototype.indexOf.call(list.querySelectorAll('.occ-item'), item);
    markActive();
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.occ-item');
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); markActive(); scrollActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); markActive(); scrollActive(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && items[active]) { pick(OCCASIONS.byKey[items[active].dataset.key]); return; }
      hide();
      const t = typeFromText(input.value);
      draft.type = t.key;
      updatePlaceholders();
      updatePreview();
      saveDraft();
    } else if (e.key === 'Escape') { hide(); }
  });

  input.addEventListener('blur', () => setTimeout(() => {
    const t = typeFromText(input.value);
    draft.type = t.key;
    updatePlaceholders();
    updatePreview();
    saveDraft();
    hide();
  }, 150));

  const cur = OCCASIONS.byKey[draft.type];
  input.value = cur ? cur.name : draft.type;
}

function updatePreview() {
  $('#pvType').textContent = (OCCASIONS.byKey[draft.type] || {}).name || draft.type || 'For my spouse';
  $('#pvTitle').textContent = draft.title || 'Your surprise preview';
  $('#pvFrom').textContent = `from ${draft.from || 'someone who loves you'}`;
  const msgEl = $('#pvMsg');
  const hasMsg = draft.message && draft.message.trim();
  msgEl.textContent = draft.message || '';
  msgEl.style.display = hasMsg ? '' : 'none';
  $('#pvThumbs').innerHTML = draft.images
    .map((i) => `<div class="th"><img src="${i.dataUrl}" alt="" /></div>`)
    .join('');
  const badges = [];
  if (draft.images.length) badges.push('Photos');
  const el = $('#pvBadges');
  if (badges.length) { el.style.display = 'inline-flex'; el.textContent = badges.join(' · '); }
  else el.style.display = 'none';
}

function renderProgress() {
  $('#progress').innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) =>
    `<div class="p ${i + 1 <= step ? 'on' : ''}"></div>`
  ).join('');
}

function showStep(n) {
  step = n;
  $$('.wizard-step').forEach((s) => (s.style.display = 'none'));
  const target = $(`.wizard-step[data-step="${n}"]`);
  target.style.display = 'block';
  target.style.animation = 'none';
  void target.offsetWidth;
  target.style.animation = 'fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both';
  renderProgress();
  updatePreview();

  const last = n === TOTAL_STEPS;
  const success = n === TOTAL_STEPS + 1;
  $('#btnNext').innerHTML = last ? '<i data-lucide="sparkles"></i> Wrap your surprise' : 'Continue <i data-lucide="arrow-right"></i>';
  refreshIcons();
  $('#btnBack').style.display = n === 1 || success ? 'none' : '';
  $('#wizActions').style.display = success ? 'none' : '';
  saveDraft();
}

function validateStep(n) {
  if (n === 2) {
    if (!$('#fMessage').value.trim()) { toast('Write a message to put inside the surprise'); return false; }
    if (!$('#fTitle').value.trim()) { toast('Give your surprise a title'); return false; }
  }
  return true;
}

function setupMessageSuggestions() {
  const ta = $('#fMessage');
  const list = $('#msgList');
  let active = -1;

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  function markActive() {
    Array.prototype.forEach.call(list.querySelectorAll('.occ-item'), (el, i) =>
      el.classList.toggle('sel', i === active));
  }

  function render() {
    const v = ta.value.trim().toLowerCase();
    const items = MESSAGE_IDEAS.filter((m) => m.toLowerCase().indexOf(v) !== -1).slice(0, 6);
    if (!items.length) { list.style.display = 'none'; return; }
    list.innerHTML = items.map((m) =>
      '<button type="button" class="occ-item msg" data-text="' + esc(m) + '">' +
      '<span class="t-ico"><i data-lucide="quote"></i></span>' +
      '<span style="flex:1"><b>' + m + '</b></span></button>').join('');
    list.style.display = 'block';
    active = -1;
    markActive();
    refreshIcons();
  }

  function fill(m) {
    ta.value = m;
    draft.message = m;
    list.style.display = 'none';
    ta.focus();
    saveDraft();
  }

  ta.addEventListener('focus', render);
  ta.addEventListener('input', render);

  list.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.occ-item');
    if (!item) return;
    e.preventDefault();
    fill(item.dataset.text);
  });

  list.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.occ-item');
    if (!item) return;
    active = Array.prototype.indexOf.call(list.querySelectorAll('.occ-item'), item);
    markActive();
  });

  ta.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.occ-item');
    if (e.key === 'ArrowDown' && list.style.display === 'block') {
      e.preventDefault(); active = Math.min(active + 1, items.length - 1); markActive();
      items[active] && items[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' && list.style.display === 'block') {
      e.preventDefault(); active = Math.max(active - 1, 0); markActive();
      items[active] && items[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active >= 0 && items[active]) {
      e.preventDefault();
      fill(items[active].dataset.text);
    } else if (e.key === 'Escape') {
      list.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combobox') && list.style.display === 'block') list.style.display = 'none';
  });
}

function setupFields() {
  ['fTitle', 'fFrom', 'fMessage'].forEach((id) => {
    const el = document.getElementById(id);
    const key = id === 'fTitle' ? 'title' : id === 'fFrom' ? 'from' : 'message';
    el.addEventListener('input', () => {
      draft[key] = el.value;
      if (id === 'fTitle' || id === 'fFrom') updatePreview();
      saveDraft();
    });
  });
}

function setupImages() {
  const zone = $('#imgZone');
  const input = $('#imgInput');
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const files = [...input.files];
    input.value = '';
    const added = [];
    for (const file of files) {
      if (draft.images.length + added.length >= 6) { toast('Up to 6 photos per surprise'); break; }
      added.push(await compressImage(file));
    }
    draft.images.push(...added);
    renderThumbs();
    updatePreview();
    saveDraft();
  });
  renderImgZone();
}

function renderImgZone() {
  const n = draft.images.length;
  const zone = $('#imgZone');
  const note = $('#imgNote');
  const count = $('#imgCount');
  $('#imgZone .mz-ico').innerHTML = '<i data-lucide="' + (n > 0 ? 'images' : 'image') + '"></i>';
  zone.classList.toggle('has-media', n > 0);
  note.textContent = n > 0 ? 'Tap to add more' : 'Tap to choose images (max 6MB each)';
  count.textContent = n > 0 ? (n === 1 ? '1 photo' : n + ' photos') + ' attached' : '';
  refreshIcons();
}

function renderThumbs() {
  const n = draft.images.length;
  let html = draft.images
    .map(
      (img, i) => `
      <div class="th">
        <img src="${img.dataUrl}" alt="" />
        <button class="x" data-i="${i}" aria-label="Remove photo"><i data-lucide="x"></i></button>
      </div>`
    )
    .join('');
  if (n && n < 6) html += `<button type="button" class="th add" id="addMoreThumb" aria-label="Add more photos"><i data-lucide="plus"></i></button>`;
  $('#imgThumbs').innerHTML = html;
  $$('#imgThumbs .x').forEach((b) =>
    b.addEventListener('click', () => {
      draft.images.splice(Number(b.dataset.i), 1);
      renderThumbs();
      updatePreview();
      saveDraft();
    })
  );
  const addMore = $('#addMoreThumb');
  if (addMore) addMore.addEventListener('click', () => $('#imgInput').click());
  refreshIcons();
  renderImgZone();
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400;
        let { width, height } = img;
        if (width > max) { height = (height * max) / width; width = max; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const ext = file.name.match(/\.(png|gif)$/i) ? 'png' : 'jpg';
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, 0.82);
        resolve({ dataUrl, ext });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function ensureUser() {
  let id = localStorage.getItem('ap_user');
  const data = await api('/api/user', { method: 'POST', body: { id: id || null, name: id ? undefined : 'Creator' } });
  if (!id) localStorage.setItem('ap_user', data.id);
  return data.id;
}

async function createSurprise() {
  const btn = $('#btnNext');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Wrapping your surprise…';
  try {
    const creatorId = await ensureUser();
    const res = await api('/api/surprise', {
      method: 'POST',
      body: {
        type: draft.type,
        title: draft.title,
        message: draft.message,
        from: draft.from,
        creatorId,
      },
    });

    const code = res.code;
    for (const img of draft.images) {
      await api('/api/media', {
        method: 'POST',
        body: { code, kind: 'image', data: img.dataUrl.split(',')[1], ext: img.ext },
      });
    }

    const qr = await api(`/api/surprise/${code}/qr`, { method: 'POST' });
    showSuccess(code, qr.qrUrl);
  } catch (e) {
    toast(e.message);
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="sparkles"></i> Wrap your surprise';
    refreshIcons();
  }
}

function showSuccess(code, qrUrl) {
  const link = `${location.origin}/s/${code}`;
  $('#shareLink').value = link;
  $('#shareLink').size = Math.max(link.length, 12);
  $('#qrImg').src = qrUrl;
  showStep(TOTAL_STEPS + 1);
  clearDraft();
  burstConfetti();
  startHeartRain(10);
  $('#copyLinkBtn').addEventListener('click', () => copyText(link, 'Link copied!'));
  $('#shareWa').addEventListener('click', () => {
    const text = `A surprise is waiting for you ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
}

/* boot */
restoreDraft();
renderTypes();
updatePlaceholders();
setupFields();
setupMessageSuggestions();
setupImages();
$('#fTitle').value = draft.title;
$('#fFrom').value = draft.from;
$('#fMessage').value = draft.message;
renderThumbs();
updatePreview();
refreshIcons();
showStep(step);

window.addEventListener('beforeunload', saveDraft);

$('#btnBack').addEventListener('click', () => showStep(step - 1));
$('#btnNext').addEventListener('click', () => {
  if (step < TOTAL_STEPS) {
    if (!validateStep(step)) return;
    showStep(step + 1);
  } else if (step === TOTAL_STEPS) {
    createSurprise();
  }
});
