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

  var REC = [];

  function add(o) {
    o.key = o.key || o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    REC.push(o);
    return o;
  }

  function W(m, d, name, ico, th, note) {
    add({ month: m, day: d, name: name, cat: 'world', ico: ico, th: th, note: note || null });
  }

  /* ---------- family ---------- */
  add({ key: 'spouse', name: 'For my spouse', cat: 'family', ico: '\u2764\ufe0f', hint: 'Affection & mercy between you' });
  add({ key: 'parents', name: 'For my parents', cat: 'family', ico: '\ud83d\udc90', hint: 'Kindness that can never be repaid' });
  add({ key: 'family', name: 'For my family', cat: 'family', ico: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66', hint: 'Ties of kinship, kept close' });
  add({ key: 'friend', name: 'For a friend', cat: 'family', ico: '\ud83e\udd1d', hint: 'A kind word, well timed' });
  add({ key: 'grandparents', name: 'For my grandparents', cat: 'family', ico: '\ud83d\udc74', hint: 'Wisdom & endless love' });
  add({ key: 'sibling', name: 'For my sibling', cat: 'family', ico: '\ud83d\udc6b', hint: 'Together since the start' });
  add({ key: 'mother', name: 'For my mother', cat: 'family', ico: '\ud83c\udf37', hint: 'A mother\u2019s du\u2019a, always' });
  add({ key: 'father', name: 'For my father', cat: 'family', ico: '\ud83c\udf33', hint: 'Strength & kindness' });

  /* ---------- islamic ---------- */
  add({ key: 'ramadan', name: 'Ramadan Kareem', cat: 'islamic', ico: '\ud83c\udf19', hint: 'A month of mercy & fasting', month: 2, day: 18, note: 'Lunar date' });
  add({ key: 'laylatulqadr', name: 'Laylat al-Qadr', cat: 'islamic', ico: '\u2728', hint: 'The Night of Power', month: 3, day: 14, note: 'Lunar date' });
  add({ key: 'eidf', name: 'Eid al-Fitr', cat: 'islamic', ico: '\ud83d\udd4c', hint: 'A blessed celebration', month: 3, day: 20, note: 'Lunar date' });
  add({ key: 'arafah', name: 'Day of Arafah', cat: 'islamic', ico: '\ud83d\udd4b', hint: 'A day of du\u2019a & forgiveness', month: 5, day: 26, note: 'Lunar date' });
  add({ key: 'eida', name: 'Eid al-Adha', cat: 'islamic', ico: '\ud83d\udc11', hint: 'A day of gratitude & sacrifice', month: 5, day: 27, note: 'Lunar date' });
  add({ key: 'hajj', name: 'Hajj', cat: 'islamic', ico: '\ud83d\udd4b', hint: 'The sacred journey', month: 5, day: 25, note: 'Lunar date' });
  add({ key: 'islmyr', name: 'Islamic New Year', cat: 'islamic', ico: '\ud83c\udf19', hint: 'A new Hijri year begins', month: 6, day: 15, note: 'Lunar date' });
  add({ key: 'ashura', name: 'Day of Ashura', cat: 'islamic', ico: '\ud83e\udd32', hint: 'Fasting & remembrance', month: 6, day: 24, note: 'Lunar date' });
  add({ key: 'maulid', name: 'Maulid (Prophet\u2019s Birthday)', cat: 'islamic', ico: '\ud83c\udf39', hint: 'The Prophet\u2019s blessed birth', month: 8, day: 26, note: 'Lunar date' });
  add({ key: 'isrami', name: 'Isra & Mi\u2019raj', cat: 'islamic', ico: '\ud83c\udf0c', hint: 'The night journey', month: 1, day: 8, note: 'Lunar date' });
  add({ key: 'hifz', name: 'Quran completed', cat: 'islamic', ico: '\ud83d\udcd6', hint: 'A milestone of iman, celebrated' });

  /* ---------- celebrations ---------- */
  add({ key: 'nikah', name: 'Wedding invitation', cat: 'celebration', ico: '\ud83d\udc8d', hint: 'A new beginning, blessed' });
  add({ key: 'engagement', name: 'Engagement', cat: 'celebration', ico: '\ud83d\udc9e', hint: 'A promise about to begin' });
  add({ key: 'anniversary', name: 'Anniversary', cat: 'celebration', ico: '\ud83d\udc9d', hint: 'Years of love & mercy' });
  add({ key: 'baby', name: 'Our new baby', cat: 'celebration', ico: '\ud83d\udc76', hint: 'A welcome from the heart' });
  add({ key: 'aqiqah', name: 'Aqiqah', cat: 'celebration', ico: '\ud83c\udf7d\ufe0f', hint: 'A name & a blessing' });
  add({ key: 'graduation', name: 'Graduation', cat: 'celebration', ico: '\ud83c\udf93', hint: 'Proud of you, always' });
  add({ key: 'congratulations', name: 'Congratulations', cat: 'celebration', ico: '\ud83c\udf89', hint: 'Good news, well shared' });
  add({ key: 'birthday', name: 'Birthday', cat: 'celebration', ico: '\ud83c\udf82', hint: 'Another year of barakah' });
  add({ key: 'retirement', name: 'Retirement', cat: 'celebration', ico: '\ud83c\udf34', hint: 'A new chapter of rest' });
  add({ key: 'housewarming', name: 'Housewarming', cat: 'celebration', ico: '\ud83c\udfe1', hint: 'A home full of barakah' });

  /* ---------- tanzania public holidays ---------- */
  add({ key: 'newyear', name: 'New Year\u2019s Day', cat: 'tanzania', ico: '\ud83c\udf86', hint: 'A fresh beginning', month: 1, day: 1 });
  add({ key: 'revolution', name: 'Zanzibar Revolution Day', cat: 'tanzania', ico: '\ud83c\udf0a', hint: 'A day of freedom', month: 1, day: 12 });
  add({ key: 'karume', name: 'Karume Day', cat: 'tanzania', ico: '\ud83d\udd4a\ufe0f', hint: 'Honouring Abeid Amani Karume', month: 4, day: 7 });
  add({ key: 'union', name: 'Union Day', cat: 'tanzania', ico: '\ud83c\uddf9\ud83c\uddff', hint: 'Tanganyika & Zanzibar, one nation', month: 4, day: 26 });
  add({ key: 'labour', name: 'Labour Day', cat: 'tanzania', ico: '\ud83d\udd27', hint: 'Workers\u2019 Day', month: 5, day: 1 });
  add({ key: 'sabasaba', name: 'Saba Saba', cat: 'tanzania', ico: '\ud83c\udfed', hint: 'Industry Day', month: 7, day: 7 });
  add({ key: 'nanenane', name: 'Nane Nane', cat: 'tanzania', ico: '\ud83d\ude9c', hint: 'Farmers\u2019 Day', month: 8, day: 8 });
  add({ key: 'nyerere', name: 'Mwalimu Nyerere Day', cat: 'tanzania', ico: '\ud83d\udcdc', hint: 'Honouring Julius Nyerere', month: 10, day: 14 });
  add({ key: 'independence', name: 'Independence Day', cat: 'tanzania', ico: '\ud83c\uddf9\ud83c\uddff', hint: '9 Desemba, a day of pride', month: 12, day: 9 });
  add({ key: 'christmas', name: 'Christmas Day', cat: 'tanzania', ico: '\ud83c\udf84', hint: 'A day of giving', month: 12, day: 25 });
  add({ key: 'boxingday', name: 'Boxing Day', cat: 'tanzania', ico: '\ud83c\udf81', hint: 'The day after Christmas', month: 12, day: 26 });
  add({ key: 'goodfriday', name: 'Good Friday', cat: 'tanzania', ico: '\u271d\ufe0f', hint: 'A day of reflection', month: 4, day: 3 });
  add({ key: 'eastermonday', name: 'Easter Monday', cat: 'tanzania', ico: '\ud83d\udc23', hint: 'A spring celebration', month: 4, day: 6 });

  /* ---------- january world days ---------- */
  W(1, 4, 'World Braille Day', '\ud83d\udc41\ufe0f', 'people');
  W(1, 24, 'International Day of Education', '\ud83c\udf93', 'education');
  W(1, 26, 'International Day of Clean Energy', '\u267b\ufe0f', 'nature');
  W(1, 27, 'International Holocaust Remembrance Day', '\ud83d\udd4a\ufe0f', 'peace');
  W(1, 28, 'International Day of Peaceful Coexistence', '\ud83e\udd1d', 'peace');
  W(1, 30, 'World Neglected Tropical Diseases Day', '\ud83e\ude7a', 'health');
  W(1, 25, 'World Leprosy Day', '\ud83e\udd1d', 'health', 'Last Sunday of January');

  /* ---------- february world days ---------- */
  W(2, 1, 'World Interfaith Harmony Week', '\ud83d\udd4c', 'faith', '1\u20137 February (week)');
  W(2, 2, 'World Wetlands Day', '\ud83e\udd86', 'nature');
  W(2, 4, 'International Day of Human Fraternity', '\ud83e\udd1d', 'peace');
  W(2, 6, 'International Day of Zero Tolerance to FGM', '\ud83d\udc9c', 'people');
  W(2, 10, 'World Pulses Day', '\ud83e\udec1', 'food');
  W(2, 10, 'International Day of the Arabian Leopard', '\ud83d\udc06', 'nature');
  W(2, 11, 'International Day of Women and Girls in Science', '\ud83d\udd2c', 'science');
  W(2, 12, 'International Day for the Prevention of Violent Extremism', '\ud83d\udee1\ufe0f', 'peace');
  W(2, 13, 'World Radio Day', '\ud83d\udcfb', 'culture');
  W(2, 17, 'Global Tourism Resilience Day', '\ud83c\udf0d', 'society');
  W(2, 20, 'World Day of Social Justice', '\u2696\ufe0f', 'society');
  W(2, 21, 'International Mother Language Day', '\ud83d\udde3\ufe0f', 'culture');

  /* ---------- march world days ---------- */
  W(3, 1, 'Zero Discrimination Day', '\ud83d\udeab', 'people');
  W(3, 3, 'World Wildlife Day', '\ud83d\udc3e', 'nature');
  W(3, 3, 'World Hearing Day', '\ud83d\udc42', 'health');
  W(3, 8, 'International Women\u2019s Day', '\ud83c\udf37', 'people');
  W(3, 10, 'International Day of Women Judges', '\u2696\ufe0f', 'society');
  W(3, 20, 'International Day of Happiness', '\ud83d\ude0a', 'people');
  W(3, 20, 'French Language Day', '\ud83c\uddeb\ud83c\uddf7', 'culture');
  W(3, 21, 'International Day for the Elimination of Racial Discrimination', '\ud83e\udd1d', 'people');
  W(3, 21, 'World Poetry Day', '\ud83d\udcdd', 'culture');
  W(3, 21, 'International Day of Nowruz', '\ud83c\udf38', 'culture');
  W(3, 21, 'World Down Syndrome Day', '\ud83e\udde6', 'people');
  W(3, 21, 'International Day of Forests', '\ud83c\udf32', 'nature');
  W(3, 22, 'World Water Day', '\ud83d\udca7', 'nature');
  W(3, 23, 'World Meteorological Day', '\ud83c\udf26\ufe0f', 'science');
  W(3, 24, 'World Tuberculosis Day', '\ud83e\udec1', 'health');
  W(3, 24, 'International Day for the Right to Truth', '\ud83d\uddfd\ufe0f', 'society');
  W(3, 25, 'International Day of Remembrance of Victims of Slavery', '\ud83d\udd6f\ufe0f', 'peace');
  W(3, 25, 'International Day of Solidarity with Detained and Missing Staff', '\u26d3\ufe0f', 'peace');
  W(3, 30, 'International Day of Zero Waste', '\u267b\ufe0f', 'nature');

  /* ---------- april world days ---------- */
  W(4, 2, 'World Autism Awareness Day', '\ud83e\udde9', 'people');
  W(4, 4, 'International Day for Mine Awareness', '\ud83e\udde8', 'peace');
  W(4, 6, 'International Day of Sport for Development and Peace', '\ud83c\udfc5', 'sport');
  W(4, 7, 'World Health Day', '\ud83c\udfe5', 'health');
  W(4, 12, 'International Day of Human Space Flight', '\ud83d\ude80', 'science');
  W(4, 14, 'World Chagas Disease Day', '\ud83e\udd9f', 'health');
  W(4, 21, 'World Creativity and Innovation Day', '\ud83d\udca1', 'science');
  W(4, 22, 'International Mother Earth Day', '\ud83c\udf0d', 'nature');
  W(4, 23, 'World Book and Copyright Day', '\ud83d\udcda', 'education');
  W(4, 23, 'English Language Day', '\ud83c\uddec\ud83c\udde7', 'culture');
  W(4, 23, 'Spanish Language Day', '\ud83c\uddea\ud83c\uddf8', 'culture');
  W(4, 24, 'World Immunization Week', '\ud83d\udc89', 'health', '24\u201330 April (week)');
  W(4, 25, 'World Malaria Day', '\ud83e\udd9f', 'health');
  W(4, 26, 'World Intellectual Property Day', '\ud83e\udde0', 'science');
  W(4, 26, 'International Chernobyl Disaster Remembrance Day', '\u2622\ufe0f', 'peace');
  W(4, 28, 'World Day for Safety and Health at Work', '\ud83e\uddbd', 'society');
  W(4, 29, 'International Day in Memory of Victims of Earthquakes', '\ud83e\udeeb', 'peace');
  W(4, 30, 'International Jazz Day', '\ud83c\udfb7', 'culture');

  /* ---------- may world days ---------- */
  W(5, 1, 'International Workers\u2019 Day / Labour Day', '\ud83d\udd27', 'society');
  W(5, 3, 'World Press Freedom Day', '\ud83d\udde0\ufe0f', 'people');
  W(5, 5, 'World Hand Hygiene Day', '\ud83e\uddfc', 'health');
  W(5, 8, 'World Red Cross and Red Crescent Day', '\ud83d\udd4a\ufe0f', 'people');
  W(5, 12, 'International Nurses Day', '\ud83d\udc69\u200d\u2695\ufe0f', 'health');
  W(5, 15, 'International Day of Families', '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67', 'family');
  W(5, 16, 'International Day of Light', '\ud83d\udca1', 'science');
  W(5, 17, 'World Telecommunication and Information Society Day', '\ud83d\udce1', 'science');
  W(5, 19, 'World Fair Play Day', '\ud83e\udd1d', 'sport');
  W(5, 20, 'World Bee Day', '\ud83d\udc1d', 'nature');
  W(5, 21, 'International Tea Day', '\ud83c\udf75', 'food');
  W(5, 21, 'World Day for Cultural Diversity', '\ud83c\udfad', 'culture');
  W(5, 22, 'International Day for Biological Diversity', '\ud83e\udd8b', 'nature');
  W(5, 23, 'International Day to End Obstetric Fistula', '\ud83e\udd30', 'health');
  W(5, 25, 'World Football Day', '\u26bd', 'sport');
  W(5, 25, 'Africa Day', '\ud83c\udf0d', 'society');
  W(5, 29, 'International Day of UN Peacekeepers', '\ud83c\udf96\ufe0f', 'peace');
  W(5, 30, 'International Day of Potato', '\ud83e\udd54', 'food');
  W(5, 31, 'World No Tobacco Day', '\ud83d\udead', 'health');

  /* ---------- june world days ---------- */
  W(6, 1, 'Global Day of Parents', '\ud83d\udc6a', 'family');
  W(6, 3, 'World Bicycle Day', '\ud83d\udeb2', 'sport');
  W(6, 4, 'International Day of Innocent Children Victims of Aggression', '\ud83d\udd4a\ufe0f', 'peace');
  W(6, 5, 'World Environment Day', '\ud83c\udf33', 'nature');
  W(6, 5, 'International Day against Illegal Fishing', '\ud83d\udc1f', 'nature');
  W(6, 6, 'Russian Language Day', '\ud83c\uddf7\ud83c\uddfa', 'culture');
  W(6, 7, 'World Food Safety Day', '\ud83e\udd57', 'health');
  W(6, 8, 'World Oceans Day', '\ud83c\udf0a', 'nature');
  W(6, 10, 'International Day for Dialogue among Civilizations', '\ud83c\udfdb\ufe0f', 'culture');
  W(6, 11, 'International Day of Play', '\ud83e\uddf8', 'sport');
  W(6, 12, 'World Day Against Child Labour', '\ud83d\udc76', 'people');
  W(6, 13, 'International Albinism Awareness Day', '\ud83e\udd0d', 'people');
  W(6, 14, 'World Blood Donor Day', '\ud83e\ude78', 'health');
  W(6, 15, 'World Elder Abuse Awareness Day', '\ud83e\uddd3', 'people');
  W(6, 16, 'International Day of Family Remittances', '\ud83d\udcb8', 'society');
  W(6, 17, 'World Day to Combat Desertification and Drought', '\ud83c\udfdc\ufe0f', 'nature');
  W(6, 18, 'Sustainable Gastronomy Day', '\ud83c\udf72', 'food');
  W(6, 18, 'International Day for Countering Hate Speech', '\ud83d\udeab', 'people');
  W(6, 19, 'International Day for the Elimination of Sexual Violence in Conflict', '\ud83d\udd4a\ufe0f', 'peace');
  W(6, 20, 'World Refugee Day', '\ud83c\udfd5\ufe0f', 'people');
  W(6, 21, 'International Day of Yoga', '\ud83e\uddd8', 'sport');
  W(6, 23, 'United Nations Public Service Day', '\ud83c\udfe2', 'society');
  W(6, 26, 'International Day Against Drug Abuse and Illicit Trafficking', '\ud83d\udeab', 'health');
  W(6, 27, 'International Day of Deafblindness', '\ud83d\udc50', 'people');
  W(6, 30, 'International Asteroid Day', '\u2604\ufe0f', 'science');
  W(6, 30, 'International Day of Parliamentarism', '\ud83c\udfdb\ufe0f', 'society');

  /* ---------- july world days ---------- */
  W(7, 4, 'International Day of Cooperatives', '\ud83e\udd1d', 'society');
  W(7, 6, 'World Zoonoses Day', '\ud83d\udc3e', 'health');
  W(7, 11, 'World Population Day', '\ud83c\udf10', 'society');
  W(7, 15, 'World Youth Skills Day', '\ud83d\udee0\ufe0f', 'education');
  W(7, 18, 'Nelson Mandela International Day', '\u270a', 'peace');
  W(7, 20, 'International Chess Day', '\u265f\ufe0f', 'sport');
  W(7, 25, 'World Drowning Prevention Day', '\ud83c\udfca', 'health');
  W(7, 28, 'World Hepatitis Day', '\ud83e\udda0', 'health');
  W(7, 30, 'International Day of Friendship', '\ud83d\udc9b', 'people');
  W(7, 30, 'World Day Against Trafficking in Persons', '\u26d3\ufe0f', 'people');

  /* ---------- august world days ---------- */
  W(8, 1, 'World Breastfeeding Week', '\ud83c\udf7c', 'health', '1\u20137 August (week)');
  W(8, 9, 'International Day of the World\u2019s Indigenous Peoples', '\ud83c\udff9', 'people');
  W(8, 12, 'International Youth Day', '\ud83e\uddd2', 'people');
  W(8, 19, 'World Humanitarian Day', '\ud83e\udd32', 'people');
  W(8, 21, 'International Day of Remembrance and Tribute to Victims of Terrorism', '\ud83d\udd6f\ufe0f', 'peace');
  W(8, 23, 'International Day for the Remembrance of the Slave Trade and its Abolition', '\u26d3\ufe0f', 'peace');
  W(8, 29, 'International Day against Nuclear Tests', '\u2622\ufe0f', 'peace');
  W(8, 30, 'International Day of the Victims of Enforced Disappearances', '\ud83d\udd4a\ufe0f', 'peace');
  W(8, 31, 'International Day for People of African Descent', '\ud83c\udf0d', 'people');

  /* ---------- september world days ---------- */
  W(9, 5, 'International Day of Charity', '\ud83d\udc9d', 'society');
  W(9, 7, 'International Day of Clean Air for Blue Skies', '\ud83d\udca8', 'nature');
  W(9, 8, 'International Literacy Day', '\ud83d\udcd6', 'education');
  W(9, 9, 'International Day to Protect Education from Attack', '\ud83d\udee1\ufe0f', 'education');
  W(9, 10, 'World Suicide Prevention Day', '\ud83d\udc9a', 'health');
  W(9, 15, 'International Day of Democracy', '\ud83d\uddf3\ufe0f', 'society');
  W(9, 16, 'International Day for the Preservation of the Ozone Layer', '\ud83d\udef0\ufe0f', 'nature');
  W(9, 17, 'World Patient Safety Day', '\ud83c\udfe5', 'health');
  W(9, 18, 'International Equal Pay Day', '\u2696\ufe0f', 'society');
  W(9, 21, 'International Day of Peace', '\ud83d\udd4a\ufe0f', 'peace');
  W(9, 23, 'International Day of Sign Languages', '\u270b', 'people');
  W(9, 27, 'World Tourism Day', '\ud83e\uddf3', 'society');
  W(9, 28, 'World Rabies Day', '\ud83d\udc15', 'health');
  W(9, 29, 'International Day of Awareness of Food Loss and Waste', '\ud83c\udf4e', 'food');
  W(9, 30, 'International Translation Day', '\ud83c\udf10', 'culture');

  /* ---------- october world days ---------- */
  W(10, 1, 'International Day of Older Persons', '\ud83e\uddd3', 'people');
  W(10, 2, 'International Day of Non-Violence', '\u262e\ufe0f', 'peace');
  W(10, 4, 'World Space Week', '\ud83e\ude90', 'science', '4\u201310 October (week)');
  W(10, 5, 'World Teachers\u2019 Day', '\ud83c\udf4e', 'education');
  W(10, 9, 'World Post Day', '\u2709\ufe0f', 'society');
  W(10, 10, 'World Mental Health Day', '\ud83e\udde0', 'health');
  W(10, 11, 'International Day of the Girl Child', '\ud83d\udc67', 'people');
  W(10, 13, 'International Day for Disaster Risk Reduction', '\ud83d\udee1\ufe0f', 'peace');
  W(10, 15, 'International Day of Rural Women', '\ud83d\udc69\u200d\ud83c\udf3e', 'people');
  W(10, 16, 'World Food Day', '\ud83c\udf5e', 'food');
  W(10, 17, 'International Day for the Eradication of Poverty', '\ud83e\udd32', 'society');
  W(10, 20, 'World Statistics Day', '\ud83d\udcca', 'science');
  W(10, 24, 'United Nations Day', '\ud83c\uddfa\ud83c\uddf3', 'peace');
  W(10, 24, 'World Development Information Day', '\ud83d\udcc8', 'society');
  W(10, 27, 'World Day for Audiovisual Heritage', '\ud83c\udf9e\ufe0f', 'culture');
  W(10, 31, 'World Cities Day', '\ud83c\udfd9\ufe0f', 'society');

  /* ---------- november world days ---------- */
  W(11, 2, 'International Day to End Impunity for Crimes against Journalists', '\ud83d\udcf0', 'people');
  W(11, 5, 'World Tsunami Awareness Day', '\ud83c\udf0a', 'nature');
  W(11, 10, 'World Science Day for Peace and Development', '\ud83d\udd2d', 'science');
  W(11, 14, 'World Diabetes Day', '\ud83e\ude78', 'health');
  W(11, 15, 'World Prematurity Day', '\ud83d\udc76', 'health');
  W(11, 16, 'International Day for Tolerance', '\ud83e\udd1d', 'peace');
  W(11, 18, 'World Day for the Prevention of and Healing from Child Sexual Exploitation, Abuse and Violence', '\ud83d\udd4a\ufe0f', 'people');
  W(11, 18, 'World AMR Awareness Week', '\ud83d\udc8a', 'health', '18\u201324 November (week)');
  W(11, 19, 'World Toilet Day', '\ud83d\udebb', 'health');
  W(11, 20, 'World Children\u2019s Day', '\ud83e\uddd2', 'people');
  W(11, 20, 'Africa Industrialization Day', '\ud83c\udfed', 'society');
  W(11, 21, 'World Television Day', '\ud83d\udcfa', 'culture');
  W(11, 25, 'International Day for the Elimination of Violence against Women', '\ud83d\udc9c', 'people');
  W(11, 29, 'International Day of Solidarity with the Palestinian People', '\ud83c\uddf5\ud83c\uddf8', 'peace');

  /* ---------- december world days ---------- */
  W(12, 1, 'World AIDS Day', '\ud83c\udf97\ufe0f', 'health');
  W(12, 2, 'International Day for the Abolition of Slavery', '\u26d3\ufe0f', 'peace');
  W(12, 3, 'International Day of Persons with Disabilities', '\u267f', 'people');
  W(12, 4, 'International Day of Banks', '\ud83c\udfe6', 'society');
  W(12, 5, 'International Volunteer Day', '\ud83d\ude4c', 'society');
  W(12, 5, 'World Soil Day', '\ud83c\udf31', 'nature');
  W(12, 7, 'International Civil Aviation Day', '\u2708\ufe0f', 'society');
  W(12, 9, 'International Anti-Corruption Day', '\ud83d\udeab', 'society');
  W(12, 10, 'Human Rights Day', '\u270a', 'people');
  W(12, 11, 'International Mountain Day', '\ud83c\udfd4\ufe0f', 'nature');
  W(12, 12, 'International Universal Health Coverage Day', '\ud83e\ude7a', 'health');
  W(12, 14, 'International Day against Colonialism', '\ud83c\udf0d', 'peace');
  W(12, 18, 'International Migrants Day', '\ud83e\uddf3', 'people');
  W(12, 18, 'Arabic Language Day', '\ud83c\uddf8\ud83c\udde6', 'culture');
  W(12, 20, 'International Human Solidarity Day', '\ud83e\udd1d', 'peace');
  W(12, 21, 'World Meditation Day', '\ud83e\uddd8', 'sport');
  W(12, 21, 'World Basketball Day', '\ud83c\udfc0', 'sport');
  W(12, 24, 'International Anti-Cybercrime Day', '\ud83d\udcbb', 'society');
  W(12, 27, 'International Day of Epidemic Preparedness', '\ud83e\udda0', 'health');

  /* ---------- module ---------- */
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
      '<span class="t-ico emoji">' + o.ico + '</span>' +
      '<h4>' + o.name + '</h4>' +
      '<p>' + (o.hint || themeHint(o)) + '</p>' +
      (d ? '<span class="t-date">' + d + '</span>' : '') +
      '</div>';
  }

  /* Browser-only: builds the search bar + category chips + grid into `el`. */
  function picker(el, opts) {
    opts = opts || {};
    var CAT_ORDER = ['family', 'islamic', 'celebration', 'tanzania', 'world'];
    var state = { cat: opts.cat || 'all', q: '', sel: opts.selected || null };

    el.innerHTML =
      '<div class="occ-tools">' +
      '<div class="occ-search"><span class="s-ico">\ud83d\udd0d</span>' +
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

    function head(label) {
      return '<div class="cat-head">' + label + '</div>';
    }

    function cards(items) {
      return items.map(function (o) { return cardHTML(o, state.sel); }).join('');
    }

    function monthGroups(items) {
      var html = '';
      MONTHS.forEach(function (m, i) {
        var sub = items.filter(function (o) { return o.month === i + 1; });
        if (!sub.length) return;
        html += head('\ud83c\udf0d ' + m) + cards(sub);
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
          else html += head('\u2728 ' + CATS[c]) + cards(sub);
        });
      } else {
        html = cards(items);
      }
      if (!html) {
        html = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:24px 0">Nothing found for that search.</p>';
      }
      grid.innerHTML = html;
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

  return { list: REC, byKey: byKey, cats: CATS, months: MONTHS, themes: THEMES, themeHint: themeHint, dateLabel: dateLabel, filter: filter, cardHTML: cardHTML, picker: picker };
});
