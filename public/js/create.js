/* sendaprize, create wizard */

const TYPES = {
  love: { icon: 'heart', label: 'Love letter' },
  birthday: { icon: 'cake', label: 'Birthday' },
  graduation: { icon: 'graduation-cap', label: 'Graduation' },
  congrats: { icon: 'party-popper', label: 'Congratulations' },
  anonymous: { icon: 'message-circle', label: 'Anonymous message' },
  proposal: { icon: 'gem', label: 'Proposal' },
  baby: { icon: 'baby', label: 'Baby announcement' },
  thankyou: { icon: 'heart-handshake', label: 'Thank you' },
  openwhen: { icon: 'mail-open', label: 'Open when…' },
};

const THEMES = {
  rose: { a: '#ff2d78', b: '#ff5f8f' },
  blush: { a: '#ff7aa8', b: '#ffb3c8' },
  plum: { a: '#b80f5f', b: '#e12168' },
  coral: { a: '#ff5a5f', b: '#ff8a65' },
  gold: { a: '#ff2d78', b: '#ffd9a0' },
  berry: { a: '#9d174d', b: '#ff2d78' },
  candy: { a: '#ff2d78', b: '#ffd3e4' },
  midnight: { a: '#ff2d78', b: '#3a0ca3' },
};

const ANIMS = [
  { key: 'giftbox', label: 'Gift box', icon: 'gift' },
  { key: 'confetti', label: 'Confetti', icon: 'party-popper' },
  { key: 'hearts', label: 'Hearts', icon: 'heart' },
  { key: 'sparkles', label: 'Sparkles', icon: 'sparkles' },
];

const draft = {
  type: localStorage.getItem('ap_type') || 'love',
  theme: 'rose',
  animation: 'giftbox',
  title: '',
  message: '',
  from: '',
  music: '',
  video: '',
  password: '',
  openAt: '',
  images: [],
  voice: null,
  voiceBlob: null,
  voiceExt: 'webm',
};

let step = 1;
const TOTAL_STEPS = 5;

function renderTypes() {
  $('#typePick').innerHTML = Object.entries(TYPES)
    .map(
      ([k, t]) => `
      <div class="type-card ${draft.type === k ? 'sel' : ''}" data-key="${k}">
        <span class="t-ico"><i data-lucide="${t.icon}"></i></span>
        <h4>${t.label}</h4>
      </div>`
    )
    .join('');
  $$('#typePick .type-card').forEach((c) =>
    c.addEventListener('click', () => {
      draft.type = c.dataset.key;
      $$('#typePick .type-card').forEach((x) => x.classList.toggle('sel', x === c));
      updatePreview();
    })
  );
  refreshIcons();
}

function renderThemes() {
  $('#themePick').innerHTML = Object.entries(THEMES)
    .map(
      ([k, t]) => `
      <div class="theme-dot ${draft.theme === k ? 'sel' : ''}" data-key="${k}" title="${k}"
           style="background:linear-gradient(140deg, ${t.a}, ${t.b})"></div>`
    )
    .join('');
  $$('#themePick .theme-dot').forEach((d) =>
    d.addEventListener('click', () => {
      draft.theme = d.dataset.key;
      $$('#themePick .theme-dot').forEach((x) => x.classList.toggle('sel', x === d));
    })
  );
}

function renderAnims() {
  $('#animPick').innerHTML = ANIMS.map(
    (a) => `
    <div class="anim-opt ${draft.animation === a.key ? 'sel' : ''}" data-key="${a.key}">
      <i data-lucide="${a.icon}"></i> ${a.label}
    </div>`
  ).join('');
  $$('#animPick .anim-opt').forEach((d) =>
    d.addEventListener('click', () => {
      draft.animation = d.dataset.key;
      $$('#animPick .anim-opt').forEach((x) => x.classList.toggle('sel', x === d));
    })
  );
  refreshIcons();
}

function updatePreview() {
  $('#pvType').textContent = TYPES[draft.type].label;
  $('#pvTitle').textContent = draft.title || 'Your surprise preview';
  $('#pvFrom').textContent = `from ${draft.from || 'someone who loves you'}`;
  const badges = [];
  if (draft.password) badges.push('Password protected');
  if (draft.openAt) badges.push('Countdown');
  if (draft.images.length) badges.push('Photos');
  if (draft.voiceBlob) badges.push('Voice note');
  if (draft.music) badges.push('Music');
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
  $('#btnNext').innerHTML = last ? '<i data-lucide="sparkles"></i> Create surprise' : 'Continue <i data-lucide="arrow-right"></i>';
  refreshIcons();
  $('#btnBack').style.display = n === 1 || success ? 'none' : '';
  $('#wizActions').style.display = success ? 'none' : '';
}

function validateStep(n) {
  if (n === 3) {
    if (!$('#fMessage').value.trim()) { toast('Write a message to put inside the gift'); return false; }
    if (!$('#fTitle').value.trim()) { toast('Give your surprise a title'); return false; }
  }
  return true;
}

function setupFields() {
  ['fTitle', 'fFrom', 'fMessage', 'fMusic', 'fVideo', 'fPassword'].forEach((id) => {
    const el = document.getElementById(id);
    const key = id === 'fTitle' ? 'title' : id === 'fFrom' ? 'from' : id === 'fMessage' ? 'message' : id === 'fMusic' ? 'music' : id === 'fVideo' ? 'video' : 'password';
    el.addEventListener('input', () => {
      draft[key] = el.value;
      if (id === 'fTitle' || id === 'fFrom') updatePreview();
    });
  });
  $('#fOpenAt').addEventListener('change', (e) => {
    draft.openAt = e.target.value ? new Date(e.target.value).toISOString() : '';
    updatePreview();
  });
}

function setupImages() {
  const zone = $('#imgZone');
  const input = $('#imgInput');
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    for (const file of input.files) {
      if (draft.images.length >= 6) { toast('Up to 6 photos per surprise'); break; }
      compressImage(file).then(({ dataUrl, ext }) => draft.images.push({ dataUrl, ext }));
    }
    input.value = '';
    renderThumbs();
    updatePreview();
  });
}

function renderThumbs() {
  $('#imgThumbs').innerHTML = draft.images
    .map(
      (img, i) => `
      <div class="th">
        <img src="${img.dataUrl}" />
        <button class="x" data-i="${i}"><i data-lucide="x"></i></button>
      </div>`
    )
    .join('');
  $$('#imgThumbs .x').forEach((b) =>
    b.addEventListener('click', () => {
      draft.images.splice(Number(b.dataset.i), 1);
      renderThumbs();
      updatePreview();
    })
  );
  refreshIcons();
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
        const dataUrl = canvas.toDataURL(mime, 0.82).split(',')[1];
        resolve({ dataUrl, ext });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setupVoice() {
  const zone = $('#voiceZone');
  let recorder = null;
  let chunks = [];
  let recording = false;

  zone.addEventListener('click', () => {
    if (recording) {
      recorder.stop();
      return;
    }
    if (draft.voiceBlob) {
      draft.voiceBlob = null;
      draft.voice = null;
      zone.classList.remove('sel');
      $('#voiceLabel').textContent = 'Record a voice note';
      $('#voiceNote').textContent = 'Tap to record, tap again to stop';
      $('#micIcon').innerHTML = '<i data-lucide="mic"></i>';
      refreshIcons();
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        recording = true;
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const fr = new FileReader();
          fr.onload = () => {
            draft.voice = fr.result.split(',')[1];
            draft.voiceBlob = blob;
            zone.classList.add('sel');
            $('#voiceLabel').textContent = 'Voice note recorded';
            $('#voiceNote').textContent = 'Tap again to remove it';
            $('#micIcon').innerHTML = '<i data-lucide="volume-2"></i>';
            refreshIcons();
            updatePreview();
          };
          fr.readAsDataURL(blob);
          recording = false;
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        $('#voiceLabel').textContent = 'Recording…';
        $('#voiceNote').textContent = 'Tap to stop';
        $('#micIcon').innerHTML = '<i data-lucide="mic"></i>';
        refreshIcons();
      })
      .catch(() => toast('Microphone access was blocked'));
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
  btn.innerHTML = '<span class="spinner"></span> Wrapping your gift…';
  try {
    const creatorId = await ensureUser();
    const res = await api('/api/surprise', {
      method: 'POST',
      body: {
        type: draft.type,
        title: draft.title,
        message: draft.message,
        from: draft.from,
        theme: draft.theme,
        animation: draft.animation,
        music: draft.music || null,
        video: draft.video || null,
        password: draft.password || null,
        openAt: draft.openAt || null,
        creatorId,
      },
    });

    const code = res.code;
    for (const img of draft.images) {
      await api('/api/media', {
        method: 'POST',
        body: { code, kind: 'image', data: img.dataUrl, ext: img.ext },
      });
    }
    if (draft.voice) {
      await api('/api/media', {
        method: 'POST',
        body: { code, kind: 'audio', data: draft.voice, ext: draft.voiceExt },
      });
    }

    const qr = await api(`/api/surprise/${code}/qr`, { method: 'POST' });
    showSuccess(code, qr.qrUrl);
  } catch (e) {
    toast(e.message);
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="sparkles"></i> Create surprise';
    refreshIcons();
  }
}

function showSuccess(code, qrUrl) {
  const link = `${location.origin}/s/${code}`;
  $('#shareLink').value = link;
  $('#qrImg').src = qrUrl;
  showStep(TOTAL_STEPS + 1);
  burstConfetti();
  startHeartRain(10);
  $('#copyLinkBtn').addEventListener('click', () => copyText(link, 'Link copied!'));
  $('#shareWa').addEventListener('click', () => {
    const text = `You have a surprise waiting for you ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
}

/* ---- boot ---- */
renderTypes();
renderThemes();
renderAnims();
setupFields();
setupImages();
setupVoice();
updatePreview();
refreshIcons();
showStep(1);

$('#btnBack').addEventListener('click', () => showStep(step - 1));
$('#btnNext').addEventListener('click', () => {
  if (step < TOTAL_STEPS) {
    if (!validateStep(step)) return;
    showStep(step + 1);
  } else if (step === TOTAL_STEPS) {
    createSurprise();
  }
});
