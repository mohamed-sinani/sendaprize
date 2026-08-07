/* sendaprize, create wizard — surprise gifts for family & loved ones */

const PLACEHOLDERS = {
  spouse: { title: 'For my dearest', from: 'Your loving spouse', message: 'I thank Allah for you every day…' },
  parents: { title: 'For my parents', from: 'Your loving child', message: 'May Allah reward you for everything you have done for me…' },
  family: { title: 'For my family', from: 'Your family', message: 'However far apart we are, you are always in my heart…' },
  friend: { title: 'For a dear friend', from: 'Your friend', message: 'A good friend is a blessing from Allah…' },
  nikah: { title: 'Our wedding invitation', from: 'Your family', message: 'In the name of Allah, we joyfully invite you to celebrate our new beginning…' },
  baby: { title: 'Welcome, little one', from: 'Your family', message: 'Every child is a trust from Allah. May he be a comfort to his parents…' },
  hifz: { title: 'Quran completed', from: 'Your family', message: 'May the Quran intercede for you and be your companion…' },
  graduation: { title: 'MashaAllah, you graduated!', from: 'Your family', message: 'Alhamdulillah! May this achievement be the beginning of even greater good…' },
  congratulations: { title: 'Congratulations!', from: 'Your family', message: 'Mabarak! May Allah bless you in this new chapter…' },
  eidf: { title: 'Eid al-Fitr Mubarak!', from: 'Your family', message: 'May Allah accept our fasting and prayers, and fill this day with peace…' },
  eida: { title: 'Eid al-Adha Mubarak!', from: 'Your family', message: 'May Allah accept our sacrifice and fill your home with barakah…' },
  ramadan: { title: 'Ramadan Kareem!', from: 'Your family', message: 'May this month bring us closer to Allah and to one another…' },
  maulid: { title: 'Maulid Mubarak', from: 'Your family', message: 'May we follow the blessed example of the Prophet ﷺ…' },
  nanenane: { title: 'Nane Nane Mubarak', from: 'Your family', message: 'Thank you for feeding this nation. May Allah bless your harvest…' },
  sabasaba: { title: 'Saba Saba Mubarak', from: 'Your family', message: 'Proud of you and the work you do. May it keep growing…' },
  union: { title: 'Union Day Mubarak', from: 'Your family', message: 'Happy Union Day to all Tanzanians, in unity and peace…' },
  independence: { title: 'Happy Independence Day', from: 'Your family', message: 'Proud to be Tanzanian. May our nation grow in unity and peace…' },
  revolution: { title: 'Zanzibar Revolution Day', from: 'Your family', message: 'Salamu za siku hii ya uhuru, kwa ndugu zetu wa Zanzibar…' },
};

const PH_DEFAULTS = {
  family: { title: 'For someone I love', from: 'Your family', message: 'Thinking of you with love and du’a…' },
  islamic: { title: 'A blessed day', from: 'Your family', message: 'May Allah bless you on this special day…' },
  celebration: { title: 'Congratulations!', from: 'Your family', message: 'Wishing you all the blessings of this day…' },
  tanzania: { title: 'Happy holiday', from: 'Your family', message: 'Wishing you a blessed and happy day…' },
  world: { title: 'Thinking of you', from: 'Your family', message: 'Thinking of you on this day, with love and du’a…' },
};

const draft = {
  type: localStorage.getItem('ap_type') || 'spouse',
  title: '',
  message: '',
  from: '',
  password: '',
  openAt: '',
  images: [],
  voice: null,
  voiceBlob: null,
  voiceExt: 'webm',
};

let step = 1;
const TOTAL_STEPS = 5;

function updatePlaceholders() {
  const o = OCCASIONS.byKey[draft.type] || {};
  const ph = PLACEHOLDERS[draft.type] || PH_DEFAULTS[o.cat] || PH_DEFAULTS.family;
  $('#fTitle').placeholder = ph.title;
  $('#fFrom').placeholder = ph.from;
  $('#fMessage').placeholder = ph.message;
}

function renderTypes() {
  OCCASIONS.picker($('#typePick'), {
    selected: draft.type,
    placeholder: 'Search occasions…',
    onPick: (key) => {
      draft.type = key;
      updatePlaceholders();
      updatePreview();
    },
  });
}

function updatePreview() {
  $('#pvType').textContent = (OCCASIONS.byKey[draft.type] || {}).name || 'For my spouse';
  $('#pvTitle').textContent = draft.title || 'Your surprise preview';
  $('#pvFrom').textContent = `from ${draft.from || 'someone who loves you'}`;
  const badges = [];
  if (draft.password) badges.push('Sealed with a secret');
  if (draft.openAt) badges.push('Opens at a set time');
  if (draft.images.length) badges.push('Photos');
  if (draft.voiceBlob) badges.push('Voice note');
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
}

function validateStep(n) {
  if (n === 3) {
    if (!$('#fMessage').value.trim()) { toast('Write a message to put inside the surprise'); return false; }
    if (!$('#fTitle').value.trim()) { toast('Give your surprise a title'); return false; }
  }
  return true;
}

function setupFields() {
  ['fTitle', 'fFrom', 'fMessage', 'fPassword'].forEach((id) => {
    const el = document.getElementById(id);
    const key = id === 'fTitle' ? 'title' : id === 'fFrom' ? 'from' : id === 'fMessage' ? 'message' : 'password';
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
    btn.innerHTML = '<i data-lucide="sparkles"></i> Wrap your surprise';
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
    const text = `A surprise is waiting for you ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
}

/* boot */
renderTypes();
updatePlaceholders();
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
