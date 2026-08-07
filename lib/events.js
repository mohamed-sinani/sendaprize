const { eventId, nowIso } = require('./ids');

const EVENT_TYPES = [
  'USER_CREATED',
  'LOGIN',
  'SURPRISE_CREATED',
  'SURPRISE_VIEWED',
  'SURPRISE_OPENED',
  'SURPRISE_SHARED',
  'SURPRISE_REACTED',
  'MESSAGE_UPDATED',
  'IMAGE_ADDED',
  'VOICE_ADDED',
  'PASSWORD_CREATED',
  'QR_GENERATED',
  'HEARTBEAT',
];

function makeEvent(type, user, target, extra = {}) {
  return {
    ...extra,
    id: eventId(),
    type,
    user: user || 'anonymous',
    target: target || null,
    time: nowIso(),
  };
}

const TYPE_EMOJI = {
  USER_CREATED: '👤',
  LOGIN: '🔑',
  SURPRISE_CREATED: '🎁',
  SURPRISE_VIEWED: '👀',
  SURPRISE_OPENED: '📦',
  SURPRISE_SHARED: '📤',
  SURPRISE_REACTED: '💖',
  MESSAGE_UPDATED: '✏️',
  IMAGE_ADDED: '🖼️',
  VOICE_ADDED: '🎙️',
  PASSWORD_CREATED: '🔒',
  QR_GENERATED: '🔳',
  HEARTBEAT: '💓',
};

function eventLabel(type) {
  return `${TYPE_EMOJI[type] || '📌'} ${type}`;
}

module.exports = { EVENT_TYPES, makeEvent, eventLabel };
