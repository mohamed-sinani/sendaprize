/* sendaprize — the full occasion directory.
   Shared by the server (require) and the browser (global OCCASIONS). */

(function (root, factory) {
  var mod = factory();
  if (typeof module === 'object' && module.exports) module.exports = mod;
  else root.OCCASIONS = mod;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  var CATS = {
    family: 'Family',
    islamic: 'Islamic',
    celebration: 'Celebrations',
    tanzania: 'Tanzania',
    world: 'World Days',
  };

  var THEMES = {
    health: 'A day for health & wellbeing',
    nature: 'A day for our planet & wildlife',
    people: 'A day for dignity & human rights',
    society: 'A day for social justice & community',
    peace: 'A day for peace & solidarity',
    culture: 'A day for culture & heritage',
    education: 'A day for knowledge & learning',
    science: 'A day for science & discovery',
    sport: 'A day for sport & play',
    food: 'A day for food & nutrition',
    faith: 'A day of faith & remembrance',
  };

  /* lucide icon per occasion. KEY_ICON gives a specific icon where it matters;
     world days fall back to a clean icon per theme. */
  var TH_ICON = {
    health: 'heart-pulse',
    nature: 'leaf',
    people: 'users',
    society: 'scale',
    peace: 'bird',
    culture: 'palette',
    education: 'book-open',
    science: 'flask-conical',
    sport: 'trophy',
    food: 'utensils',
    faith: 'church',
    family: 'users',
  };

  var KEY_ICON = {
    /* family */
    spouse: 'heart',
    parents: 'flower-2',
    family: 'users',
    friend: 'handshake',
    grandparents: 'crown',
    sibling: 'users-round',
    mother: 'flower',
    father: 'tree-deciduous',
    /* islamic */
    ramadan: 'moon',
    laylatulqadr: 'sparkles',
    eidf: 'moon-star',
    arafah: 'hand-heart',
    eida: 'star',
    hajj: 'compass',
    islmyr: 'calendar',
    ashura: 'cloud-moon',
    maulid: 'book-heart',
    isrami: 'rocket',
    hifz: 'book-open-text',
    /* celebrations */
    nikah: 'heart-handshake',
    engagement: 'heart-handshake',
    anniversary: 'heart',
    baby: 'baby',
    aqiqah: 'utensils',
    graduation: 'graduation-cap',
    congratulations: 'party-popper',
    birthday: 'cake',
    retirement: 'tree-palm',
    housewarming: 'house',
    /* tanzania */
    newyear: 'party-popper',
    revolution: 'waves',
    karume: 'award',
    union: 'flag',
    labour: 'hammer',
    sabasaba: 'factory',
    nanenane: 'tractor',
    nyerere: 'book-open',
    independence: 'landmark',
    christmas: 'gift',
    boxingday: 'package',
    goodfriday: 'church',
    eastermonday: 'egg',
    /* world day spot-icons */
    'world-braille-day': 'accessibility',
    'international-day-of-clean-energy': 'zap',
    'world-wetlands-day': 'waves',
    'world-radio-day': 'radio',
    'international-mother-language-day': 'languages',
    'international-women-s-day': 'venus',
    'world-water-day': 'droplets',
    'world-wildlife-day': 'paw-print',
    'international-mother-earth-day': 'globe',
    'world-oceans-day': 'waves',
    'world-food-day': 'salad',
    'world-tourism-day': 'map',
    'world-hearing-day': 'ear',
    'international-day-of-light': 'lightbulb',
    'international-day-of-happiness': 'smile',
    'world-mental-health-day': 'brain',
    'world-aids-day': 'ribbon',
    'international-day-of-persons-with-disabilities': 'accessibility',
    'world-toilet-day': 'toilet',
    'international-day-of-democracy': 'vote',
    'world-bee-day': 'bug',
    'world-tsunami-awareness-day': 'waves',
    'international-day-of-forests': 'trees',
    'world-drowning-prevention-day': 'life-buoy',
    'world-no-tobacco-day': 'cigarette-off',
    'international-day-for-the-elimination-of-violence-against-women': 'heart-crack',
    'world-chess-day': 'target',
    'international-youth-day': 'users-round',
    'world-breastfeeding-week': 'baby',
    'international-day-of-friendship': 'heart',
    'world-bicycle-day': 'bike',
    'international-day-of-play': 'gamepad-2',
    'world-meditation-day': 'flower-2',
    'world-basketball-day': 'trophy',
    'international-volunteer-day': 'hand-heart',
    'international-day-of-charity': 'heart-handshake',
    'world-blood-donor-day': 'droplet',
    'international-day-of-zero-waste': 'recycle',
    'international-day-of-families': 'users',
    'world-science-day-for-peace-and-development': 'flask-conical',
    'international-day-of-yoga': 'flower-2',
    'international-day-of-light': 'lightbulb',
    'international-asteroid-day': 'orbit',
    'international-day-of-sign-languages': 'hand',
    'world-chagas-disease-day': 'bug',
    'world-malaria-day': 'bug',
    'world-tuberculosis-day': 'syringe',
  };

  function iconName(o) {
    if (!o) return 'sparkles';
    return KEY_ICON[o.key] || TH_ICON[o.th] || 'sparkles';
  }

  var REC = [];

  function add(o) {
    o.key = o.key || o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    REC.push(o);
    return o;
  }

  function W(m, d, name, th, note) {
    add({ month: m, day: d, name: name, cat: 'world', th: th, note: note || null });
  }

  /* family */
  add({ key: 'spouse', name: 'For my spouse', cat: 'family', hint: 'Affection & mercy between you' });
  add({ key: 'parents', name: 'For my parents', cat: 'family', hint: 'Kindness that can never be repaid' });
  add({ key: 'family', name: 'For my family', cat: 'family', hint: 'Ties of kinship, kept close' });
  add({ key: 'friend', name: 'For a friend', cat: 'family', hint: 'A kind word, well timed' });
  add({ key: 'grandparents', name: 'For my grandparents', cat: 'family', hint: 'Wisdom & endless love' });
  add({ key: 'sibling', name: 'For my sibling', cat: 'family', hint: 'Together since the start' });
  add({ key: 'mother', name: 'For my mother', cat: 'family', hint: 'A mother\u2019s du\u2019a, always' });
  add({ key: 'father', name: 'For my father', cat: 'family', hint: 'Strength & kindness' });

  /* islamic */
  add({ key: 'ramadan', name: 'Ramadan Kareem', cat: 'islamic', hint: 'A month of mercy & fasting', month: 2, day: 18, note: 'Lunar date' });
  add({ key: 'laylatulqadr', name: 'Laylat al-Qadr', cat: 'islamic', hint: 'The Night of Power', month: 3, day: 14, note: 'Lunar date' });
  add({ key: 'eidf', name: 'Eid al-Fitr', cat: 'islamic', hint: 'A blessed celebration', month: 3, day: 20, note: 'Lunar date' });
  add({ key: 'arafah', name: 'Day of Arafah', cat: 'islamic', hint: 'A day of du\u2019a & forgiveness', month: 5, day: 26, note: 'Lunar date' });
  add({ key: 'eida', name: 'Eid al-Adha', cat: 'islamic', hint: 'A day of gratitude & sacrifice', month: 5, day: 27, note: 'Lunar date' });
  add({ key: 'hajj', name: 'Hajj', cat: 'islamic', hint: 'The sacred journey', month: 5, day: 25, note: 'Lunar date' });
  add({ key: 'islmyr', name: 'Islamic New Year', cat: 'islamic', hint: 'A new Hijri year begins', month: 6, day: 15, note: 'Lunar date' });
  add({ key: 'ashura', name: 'Day of Ashura', cat: 'islamic', hint: 'Fasting & remembrance', month: 6, day: 24, note: 'Lunar date' });
  add({ key: 'maulid', name: 'Maulid (Prophet\u2019s Birthday)', cat: 'islamic', hint: 'The Prophet\u2019s blessed birth', month: 8, day: 26, note: 'Lunar date' });
  add({ key: 'isrami', name: 'Isra & Mi\u2019raj', cat: 'islamic', hint: 'The night journey', month: 1, day: 8, note: 'Lunar date' });
  add({ key: 'hifz', name: 'Quran completed', cat: 'islamic', hint: 'A milestone of iman, celebrated' });

  /* celebrations */
  add({ key: 'nikah', name: 'Wedding invitation', cat: 'celebration', hint: 'A new beginning, blessed' });
  add({ key: 'engagement', name: 'Engagement', cat: 'celebration', hint: 'A promise about to begin' });
  add({ key: 'anniversary', name: 'Anniversary', cat: 'celebration', hint: 'Years of love & mercy' });
  add({ key: 'baby', name: 'Our new baby', cat: 'celebration', hint: 'A welcome from the heart' });
  add({ key: 'aqiqah', name: 'Aqiqah', cat: 'celebration', hint: 'A name & a blessing' });
  add({ key: 'graduation', name: 'Graduation', cat: 'celebration', hint: 'Proud of you, always' });
  add({ key: 'congratulations', name: 'Congratulations', cat: 'celebration', hint: 'Good news, well shared' });
  add({ key: 'birthday', name: 'Birthday', cat: 'celebration', hint: 'Another year of barakah' });
  add({ key: 'retirement', name: 'Retirement', cat: 'celebration', hint: 'A new chapter of rest' });
  add({ key: 'housewarming', name: 'Housewarming', cat: 'celebration', hint: 'A home full of barakah' });

  /* tanzania public holidays */
  add({ key: 'newyear', name: 'New Year\u2019s Day', cat: 'tanzania', hint: 'A fresh beginning', month: 1, day: 1 });
  add({ key: 'revolution', name: 'Zanzibar Revolution Day', cat: 'tanzania', hint: 'A day of freedom', month: 1, day: 12 });
  add({ key: 'karume', name: 'Karume Day', cat: 'tanzania', hint: 'Honouring Abeid Amani Karume', month: 4, day: 7 });
  add({ key: 'union', name: 'Union Day', cat: 'tanzania', hint: 'Tanganyika & Zanzibar, one nation', month: 4, day: 26 });
  add({ key: 'labour', name: 'Labour Day', cat: 'tanzania', hint: 'Workers\u2019 Day', month: 5, day: 1 });
  add({ key: 'sabasaba', name: 'Saba Saba', cat: 'tanzania', hint: 'Industry Day', month: 7, day: 7 });
  add({ key: 'nanenane', name: 'Nane Nane', cat: 'tanzania', hint: 'Farmers\u2019 Day', month: 8, day: 8 });
  add({ key: 'nyerere', name: 'Mwalimu Nyerere Day', cat: 'tanzania', hint: 'Honouring Julius Nyerere', month: 10, day: 14 });
  add({ key: 'independence', name: 'Independence Day', cat: 'tanzania', hint: '9 Desemba, a day of pride', month: 12, day: 9 });
  add({ key: 'christmas', name: 'Christmas Day', cat: 'tanzania', hint: 'A day of giving', month: 12, day: 25 });
  add({ key: 'boxingday', name: 'Boxing Day', cat: 'tanzania', hint: 'The day after Christmas', month: 12, day: 26 });
  add({ key: 'goodfriday', name: 'Good Friday', cat: 'tanzania', hint: 'A day of reflection', month: 4, day: 3 });
  add({ key: 'eastermonday', name: 'Easter Monday', cat: 'tanzania', hint: 'A spring celebration', month: 4, day: 6 });

  /* january world days */
  W(1, 4, 'World Braille Day', 'people');
  W(1, 24, 'International Day of Education', 'education');
  W(1, 26, 'International Day of Clean Energy', 'nature');
  W(1, 27, 'International Holocaust Remembrance Day', 'peace');
  W(1, 28, 'International Day of Peaceful Coexistence', 'peace');
  W(1, 30, 'World Neglected Tropical Diseases Day', 'health');
  W(1, 25, 'World Leprosy Day', 'health', 'Last Sunday of January');

  /* february world days */
  W(2, 1, 'World Interfaith Harmony Week', 'faith', '1\u20137 February (week)');
  W(2, 2, 'World Wetlands Day', 'nature');
  W(2, 4, 'International Day of Human Fraternity', 'peace');
  W(2, 6, 'International Day of Zero Tolerance to FGM', 'people');
  W(2, 10, 'World Pulses Day', 'food');
  W(2, 10, 'International Day of the Arabian Leopard', 'nature');
  W(2, 11, 'International Day of Women and Girls in Science', 'science');
  W(2, 12, 'International Day for the Prevention of Violent Extremism', 'peace');
  W(2, 13, 'World Radio Day', 'culture');
  W(2, 17, 'Global Tourism Resilience Day', 'society');
  W(2, 20, 'World Day of Social Justice', 'society');
  W(2, 21, 'International Mother Language Day', 'culture');

  /* march world days */
  W(3, 1, 'Zero Discrimination Day', 'people');
  W(3, 3, 'World Wildlife Day', 'nature');
  W(3, 3, 'World Hearing Day', 'health');
  W(3, 8, 'International Women\u2019s Day', 'people');
  W(3, 10, 'International Day of Women Judges', 'society');
  W(3, 20, 'International Day of Happiness', 'people');
  W(3, 20, 'French Language Day', 'culture');
  W(3, 21, 'International Day for the Elimination of Racial Discrimination', 'people');
  W(3, 21, 'World Poetry Day', 'culture');
  W(3, 21, 'International Day of Nowruz', 'culture');
  W(3, 21, 'World Down Syndrome Day', 'people');
  W(3, 21, 'International Day of Forests', 'nature');
  W(3, 22, 'World Water Day', 'nature');
  W(3, 23, 'World Meteorological Day', 'science');
  W(3, 24, 'World Tuberculosis Day', 'health');
  W(3, 24, 'International Day for the Right to Truth', 'society');
  W(3, 25, 'International Day of Remembrance of Victims of Slavery', 'peace');
  W(3, 25, 'International Day of Solidarity with Detained and Missing Staff', 'peace');
  W(3, 30, 'International Day of Zero Waste', 'nature');

  /* april world days */
  W(4, 2, 'World Autism Awareness Day', 'people');
  W(4, 4, 'International Day for Mine Awareness', 'peace');
  W(4, 6, 'International Day of Sport for Development and Peace', 'sport');
  W(4, 7, 'World Health Day', 'health');
  W(4, 12, 'International Day of Human Space Flight', 'science');
  W(4, 14, 'World Chagas Disease Day', 'health');
  W(4, 21, 'World Creativity and Innovation Day', 'science');
  W(4, 22, 'International Mother Earth Day', 'nature');
  W(4, 23, 'World Book and Copyright Day', 'education');
  W(4, 23, 'English Language Day', 'culture');
  W(4, 23, 'Spanish Language Day', 'culture');
  W(4, 24, 'World Immunization Week', 'health', '24\u201330 April (week)');
  W(4, 25, 'World Malaria Day', 'health');
  W(4, 26, 'World Intellectual Property Day', 'science');
  W(4, 26, 'International Chernobyl Disaster Remembrance Day', 'peace');
  W(4, 28, 'World Day for Safety and Health at Work', 'society');
  W(4, 29, 'International Day in Memory of Victims of Earthquakes', 'peace');
  W(4, 30, 'International Jazz Day', 'culture');

  /* may world days */
  W(5, 1, 'International Workers\u2019 Day / Labour Day', 'society');
  W(5, 3, 'World Press Freedom Day', 'people');
  W(5, 5, 'World Hand Hygiene Day', 'health');
  W(5, 8, 'World Red Cross and Red Crescent Day', 'people');
  W(5, 12, 'International Nurses Day', 'health');
  W(5, 15, 'International Day of Families', 'family');
  W(5, 16, 'International Day of Light', 'science');
  W(5, 17, 'World Telecommunication and Information Society Day', 'science');
  W(5, 19, 'World Fair Play Day', 'sport');
  W(5, 20, 'World Bee Day', 'nature');
  W(5, 21, 'International Tea Day', 'food');
  W(5, 21, 'World Day for Cultural Diversity', 'culture');
  W(5, 22, 'International Day for Biological Diversity', 'nature');
  W(5, 23, 'International Day to End Obstetric Fistula', 'health');
  W(5, 25, 'World Football Day', 'sport');
  W(5, 25, 'Africa Day', 'society');
  W(5, 29, 'International Day of UN Peacekeepers', 'peace');
  W(5, 30, 'International Day of Potato', 'food');
  W(5, 31, 'World No Tobacco Day', 'health');

  /* june world days */
  W(6, 1, 'Global Day of Parents', 'family');
  W(6, 3, 'World Bicycle Day', 'sport');
  W(6, 4, 'International Day of Innocent Children Victims of Aggression', 'peace');
  W(6, 5, 'World Environment Day', 'nature');
  W(6, 5, 'International Day against Illegal Fishing', 'nature');
  W(6, 6, 'Russian Language Day', 'culture');
  W(6, 7, 'World Food Safety Day', 'health');
  W(6, 8, 'World Oceans Day', 'nature');
  W(6, 10, 'International Day for Dialogue among Civilizations', 'culture');
  W(6, 11, 'International Day of Play', 'sport');
  W(6, 12, 'World Day Against Child Labour', 'people');
  W(6, 13, 'International Albinism Awareness Day', 'people');
  W(6, 14, 'World Blood Donor Day', 'health');
  W(6, 15, 'World Elder Abuse Awareness Day', 'people');
  W(6, 16, 'International Day of Family Remittances', 'society');
  W(6, 17, 'World Day to Combat Desertification and Drought', 'nature');
  W(6, 18, 'Sustainable Gastronomy Day', 'food');
  W(6, 18, 'International Day for Countering Hate Speech', 'people');
  W(6, 19, 'International Day for the Elimination of Sexual Violence in Conflict', 'peace');
  W(6, 20, 'World Refugee Day', 'people');
  W(6, 21, 'International Day of Yoga', 'sport');
  W(6, 23, 'United Nations Public Service Day', 'society');
  W(6, 26, 'International Day Against Drug Abuse and Illicit Trafficking', 'health');
  W(6, 27, 'International Day of Deafblindness', 'people');
  W(6, 30, 'International Asteroid Day', 'science');
  W(6, 30, 'International Day of Parliamentarism', 'society');

  /* july world days */
  W(7, 4, 'International Day of Cooperatives', 'society');
  W(7, 6, 'World Zoonoses Day', 'health');
  W(7, 11, 'World Population Day', 'society');
  W(7, 15, 'World Youth Skills Day', 'education');
  W(7, 18, 'Nelson Mandela International Day', 'peace');
  W(7, 20, 'International Chess Day', 'sport');
  W(7, 25, 'World Drowning Prevention Day', 'health');
  W(7, 28, 'World Hepatitis Day', 'health');
  W(7, 30, 'International Day of Friendship', 'people');
  W(7, 30, 'World Day Against Trafficking in Persons', 'people');

  /* august world days */
  W(8, 1, 'World Breastfeeding Week', 'health', '1\u20137 August (week)');
  W(8, 9, 'International Day of the World\u2019s Indigenous Peoples', 'people');
  W(8, 12, 'International Youth Day', 'people');
  W(8, 19, 'World Humanitarian Day', 'people');
  W(8, 21, 'International Day of Remembrance and Tribute to Victims of Terrorism', 'peace');
  W(8, 23, 'International Day for the Remembrance of the Slave Trade and its Abolition', 'peace');
  W(8, 29, 'International Day against Nuclear Tests', 'peace');
  W(8, 30, 'International Day of the Victims of Enforced Disappearances', 'peace');
  W(8, 31, 'International Day for People of African Descent', 'people');

  /* september world days */
  W(9, 5, 'International Day of Charity', 'society');
  W(9, 7, 'International Day of Clean Air for Blue Skies', 'nature');
  W(9, 8, 'International Literacy Day', 'education');
  W(9, 9, 'International Day to Protect Education from Attack', 'education');
  W(9, 10, 'World Suicide Prevention Day', 'health');
  W(9, 15, 'International Day of Democracy', 'society');
  W(9, 16, 'International Day for the Preservation of the Ozone Layer', 'nature');
  W(9, 17, 'World Patient Safety Day', 'health');
  W(9, 18, 'International Equal Pay Day', 'society');
  W(9, 21, 'International Day of Peace', 'peace');
  W(9, 23, 'International Day of Sign Languages', 'people');
  W(9, 27, 'World Tourism Day', 'society');
  W(9, 28, 'World Rabies Day', 'health');
  W(9, 29, 'International Day of Awareness of Food Loss and Waste', 'food');
  W(9, 30, 'International Translation Day', 'culture');

  /* october world days */
  W(10, 1, 'International Day of Older Persons', 'people');
  W(10, 2, 'International Day of Non-Violence', 'peace');
  W(10, 4, 'World Space Week', 'science', '4\u201310 October (week)');
  W(10, 5, 'World Teachers\u2019 Day', 'education');
  W(10, 9, 'World Post Day', 'society');
  W(10, 10, 'World Mental Health Day', 'health');
  W(10, 11, 'International Day of the Girl Child', 'people');
  W(10, 13, 'International Day for Disaster Risk Reduction', 'peace');
  W(10, 15, 'International Day of Rural Women', 'people');
  W(10, 16, 'World Food Day', 'food');
  W(10, 17, 'International Day for the Eradication of Poverty', 'society');
  W(10, 20, 'World Statistics Day', 'science');
  W(10, 24, 'United Nations Day', 'peace');
  W(10, 24, 'World Development Information Day', 'society');
  W(10, 27, 'World Day for Audiovisual Heritage', 'culture');
  W(10, 31, 'World Cities Day', 'society');

  /* november world days */
  W(11, 2, 'International Day to End Impunity for Crimes against Journalists', 'people');
  W(11, 5, 'World Tsunami Awareness Day', 'nature');
  W(11, 10, 'World Science Day for Peace and Development', 'science');
  W(11, 14, 'World Diabetes Day', 'health');
  W(11, 15, 'World Prematurity Day', 'health');
  W(11, 16, 'International Day for Tolerance', 'peace');
  W(11, 18, 'World Day for the Prevention of and Healing from Child Sexual Exploitation, Abuse and Violence', 'people');
  W(11, 18, 'World AMR Awareness Week', 'health', '18\u201324 November (week)');
  W(11, 19, 'World Toilet Day', 'health');
  W(11, 20, 'World Children\u2019s Day', 'people');
  W(11, 20, 'Africa Industrialization Day', 'society');
  W(11, 21, 'World Television Day', 'culture');
  W(11, 25, 'International Day for the Elimination of Violence against Women', 'people');
  W(11, 29, 'International Day of Solidarity with the Palestinian People', 'peace');

  /* december world days */
  W(12, 1, 'World AIDS Day', 'health');
  W(12, 2, 'International Day for the Abolition of Slavery', 'peace');
  W(12, 3, 'International Day of Persons with Disabilities', 'people');
  W(12, 4, 'International Day of Banks', 'society');
  W(12, 5, 'International Volunteer Day', 'society');
  W(12, 5, 'World Soil Day', 'nature');
  W(12, 7, 'International Civil Aviation Day', 'society');
  W(12, 9, 'International Anti-Corruption Day', 'society');
  W(12, 10, 'Human Rights Day', 'people');
  W(12, 11, 'International Mountain Day', 'nature');
  W(12, 12, 'International Universal Health Coverage Day', 'health');
  W(12, 14, 'International Day against Colonialism', 'peace');
  W(12, 18, 'International Migrants Day', 'people');
  W(12, 18, 'Arabic Language Day', 'culture');
  W(12, 20, 'International Human Solidarity Day', 'peace');
  W(12, 21, 'World Meditation Day', 'sport');
  W(12, 21, 'World Basketball Day', 'sport');
  W(12, 24, 'International Anti-Cybercrime Day', 'society');
  W(12, 27, 'International Day of Epidemic Preparedness', 'health');

  /* module */
  var byKey = {};
  REC.forEach(function (o) { byKey[o.key] = o; });

  function themeHint(o) { return o.th ? THEMES[o.th] : (o.hint || ''); }

  function dateLabel(o) {
    if (o.note) return o.note;
    if (o.month) return MONTHS[o.month - 1].slice(0, 3) + ' ' + o.day;
    return '';
  }

  function filter(list, q, cat) {
    var qq = (q || '').trim().toLowerCase();
    return list.filter(function (o) {
      if (cat && cat !== 'all' && o.cat !== cat) return false;
      if (!qq) return true;
      var hay = (o.name + ' ' + (o.hint || '') + ' ' + themeHint(o) + ' ' + dateLabel(o)).toLowerCase();
      return hay.indexOf(qq) !== -1;
    });
  }

  function cardHTML(o, selectedKey) {
    var d = dateLabel(o);
    return '<div class="type-card' + (o.key === selectedKey ? ' sel' : '') + '" data-key="' + o.key + '">' +
      '<span class="t-ico"><i data-lucide="' + iconName(o) + '"></i></span>' +
      '<h4>' + o.name + '</h4>' +
      '<p>' + (o.hint || themeHint(o)) + '</p>' +
      (d ? '<span class="t-date">' + d + '</span>' : '') +
      '</div>';
  }

  function syncIcons() {
    if (typeof refreshIcons === 'function') refreshIcons();
  }

  /* Browser-only: a compact, curated preview grid (landing page).
     Shows only `keys`, with an optional "see all" CTA. */
  function featuredGrid(el, opts) {
    opts = opts || {};
    var items = (opts.keys || []).map(function (k) { return byKey[k]; }).filter(Boolean);
    var html = '<div class="grid type-grid">' + items.map(function (o) { return cardHTML(o, null); }).join('') + '</div>';
    if (opts.seeAll) {
      html += '<div class="occ-more"><a class="btn btn-ghost btn-lg" href="' + opts.seeAll.href + '"><i data-lucide="search"></i> ' +
        (opts.seeAll.label || 'Browse all occasions') + '</a></div>';
    }
    el.innerHTML = html;
    syncIcons();
    Array.prototype.forEach.call(el.querySelectorAll('.type-card'), function (c) {
      c.addEventListener('click', function () {
        opts.onPick && opts.onPick(c.getAttribute('data-key'));
      });
    });
  }

  /* Browser-only: builds the search bar + category chips + grid into `el`. */
  function picker(el, opts) {
    opts = opts || {};
    var CAT_ORDER = ['family', 'islamic', 'celebration', 'tanzania', 'world'];
    var state = { cat: opts.cat || 'all', q: '', sel: opts.selected || null };

    el.innerHTML =
      '<div class="occ-tools">' +
      '<div class="occ-search"><i data-lucide="search" class="s-ico" aria-hidden="true"></i>' +
      '<input type="search" class="occ-q" placeholder="' + (opts.placeholder || 'Search occasions\u2026') + '" /></div>' +
      '<div class="occ-cats"></div>' +
      '</div>' +
      '<div class="grid type-grid"></div>';

    var qEl = el.querySelector('.occ-q');
    var catsEl = el.querySelector('.occ-cats');
    var grid = el.querySelector('.type-grid');

    function chip(label, key, on) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'occ-cat' + (on ? ' on' : '');
      b.textContent = label;
      b.addEventListener('click', function () {
        state.cat = key;
        state.q = '';
        if (qEl) qEl.value = '';
        renderChips();
        renderGrid();
      });
      catsEl.appendChild(b);
    }

    function renderChips() {
      catsEl.innerHTML = '';
      chip('All', 'all', state.cat === 'all');
      CAT_ORDER.forEach(function (k) { chip(CATS[k], k, state.cat === k); });
    }

    function head(label, icon) {
      return '<div class="cat-head"><i data-lucide="' + icon + '"></i>' + label + '</div>';
    }

    function cards(items) {
      return items.map(function (o) { return cardHTML(o, state.sel); }).join('');
    }

    function monthGroups(items) {
      var html = '';
      MONTHS.forEach(function (m, i) {
        var sub = items.filter(function (o) { return o.month === i + 1; });
        if (!sub.length) return;
        html += head(m, 'globe') + cards(sub);
      });
      return html;
    }

    function renderGrid() {
      var items = filter(REC, state.q, state.cat);
      var html = '';
      if (state.cat === 'world') {
        html = monthGroups(items);
      } else if (state.cat === 'all') {
        CAT_ORDER.forEach(function (c) {
          var sub = items.filter(function (o) { return o.cat === c; });
          if (!sub.length) return;
          if (c === 'world') html += monthGroups(sub);
          else html += head(CATS[c], 'sparkles') + cards(sub);
        });
      } else {
        html = cards(items);
      }
      if (!html) {
        html = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:24px 0">Nothing found for that search.</p>';
      }
      grid.innerHTML = html;
      syncIcons();
      var els = grid.querySelectorAll('.type-card');
      Array.prototype.forEach.call(els, function (c) {
        c.addEventListener('click', function () {
          var key = c.getAttribute('data-key');
          state.sel = key;
          renderGrid();
          opts.onPick && opts.onPick(key);
        });
      });
    }

    if (qEl) qEl.addEventListener('input', function () { state.q = qEl.value; renderGrid(); });
    renderChips();
    renderGrid();
  }

  return { list: REC, byKey: byKey, cats: CATS, months: MONTHS, themes: THEMES, themeHint: themeHint, dateLabel: dateLabel, filter: filter, cardHTML: cardHTML, picker: picker, iconName: iconName, featuredGrid: featuredGrid };
});
