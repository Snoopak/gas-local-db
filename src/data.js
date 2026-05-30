// Каталог шаблонів

const catalogTemplates = [
  { tpl: 'RGC METERING GM-А {s}', sizes: ['G2,5', 'G4'], manufacturer: 'ТМ RGC METERING', group: 'ТМ RGC METERING' },
  { tpl: 'BASE Q {s}', sizes: ['G1.6', 'G2.5', 'G4', 'G6'], manufacturer: 'ТОВ "ГрідВі"', group: 'ГрідВі' },
  { tpl: 'GALLUS 2000-U {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ЗАТ "Шлюмберже УкрГаз метерс компані"', group: 'Галлус' },
  { tpl: 'GALLUS 2000 {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'Фірма "Actaris SAS", Франція', group: 'Галлус' },
  { tpl: 'GALLUS-2 {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'Itron France / Actaris SAS, Франція', group: 'Галлус' },
  { tpl: 'Pietro Fiorentini RS/2.4 {s}', sizes: ['G4', 'G6'], manufacturer: 'Pietro Fiorentini S.p.A. (Italy)', group: 'PF' },
  { tpl: 'Pietro Fiorentini RS/2001 AL {s}', sizes: ['G1.6'], manufacturer: 'Pietro Fiorentini S.p.A. (Italy)', group: 'PF' },
  { tpl: 'Pietro Fiorentini RS/2001 LA {s}', sizes: ['G2.5', 'G4'], manufacturer: 'Pietro Fiorentini S.p.A. (Italy)', group: 'PF' },
  { tpl: 'SAMGAS RS/1.2 LA {s}', sizes: ['G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'SAMGAS RS/2.4 G6', sizes: [''], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'SAMGAS RS/2001 AL {s}', sizes: ['G1.6', 'G2.5'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'SAMGAS RS/2001 LA {s}', sizes: ['G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'SAMGAS RS/5 G6', sizes: [''], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'САМГАЗ {s}', sizes: ['G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'Самгаз G6 {s}', sizes: ['RS/2.4', 'RS/5'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' }, // Тут змінюється не розмір, а модель
  { tpl: 'Самгаз RS/2001-1 LA {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'Самгаз RS/2001-2 {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'Самгаз RS/2001-21 {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'Самгаз RS/2001-22 {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'Самгаз ВК-G6', sizes: ['G6'], manufacturer: 'ТОВ-фірма "САМГАЗ-РІВНЕ"', group: 'Самгаз' },
  { tpl: 'BK-{s}', sizes: ['G1.6', 'G1.6T', 'G1.6М', 'G1.6МT', 'G2.5', 'G2.5T', 'G2.5МT', 'G4', 'G4T', 'G4МT', 'G6', 'G6T', 'G6МT'], manufacturer: 'Фірма Elster s.r.o, Словаччина', group: 'ВК, ВКЕТ' },
  { tpl: 'BK2.5T G2.5', sizes: [''], manufacturer: 'Фірма Elster s.r.o, Словаччина', group: 'ВК, ВКЕТ' },
  { tpl: 'OКТАВА {s}', sizes: ['G1.6-1', 'G2.5-1', 'G4', 'G6'], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'OКТАВА-M G4', sizes: [''], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'OКТАВА-А G6-1', sizes: [''], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'OКТАВА-А1 G4/G6', sizes: [''], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'OКТАВА-А1Е G4/G6', sizes: [''], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'GF-1 OKTAVA {s}', sizes: ['G1.6', 'G 2.5', 'G4', 'G6'], manufacturer: 'ДП завод "Генератор", м.Київ', group: 'Октава' },
  { tpl: 'MESURA A{s}', sizes: ['G2.5', 'G4'], manufacturer: 'MESURA METERING S.R.L', group: 'Месура' },
  { tpl: 'BP {s}', sizes: ['G2.5', 'G4'], manufacturer: 'ДП "Жулянський машинобуд. з-д Візар"', group: 'Візар' },
  { tpl: 'BІЗАР {s}', sizes: ['G4', 'G6'], manufacturer: 'ДП "Жулянський машинобуд. з-д Візар"', group: 'Візар' },
  { tpl: 'GMBP VIZAR {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ДП "Жулянський машинобуд. з-д Візар"', group: 'Візар' },
  { tpl: 'MKM G4', sizes: [''], manufacturer: 'ДП "Жулянський машинобуд. з-д Візар"', group: 'Візар' },
  { tpl: 'BK {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'Фірма "PREMAGAS s.r.o.", Словаччина', group: 'Премагаз' },
  { tpl: 'MКМ {s}', sizes: ['G1.6', 'G2.5', 'G4', 'G6'], manufacturer: 'Фірма "PREMAGAS s.r.o.", Словаччина', group: 'Премагаз' },
  { tpl: 'PG {s}', sizes: ['G4', 'G6'], manufacturer: 'Фірма "PREMAGAS s.r.o.", Словаччина', group: 'Премагаз' },
  { tpl: 'BK-U G1.6', sizes: ['G1.6'], manufacturer: 'СП "Премагаз Кромшрьодор-Україна", м.Лубни', group: 'Премагаз' },
  { tpl: 'MKM-U {s}', sizes: ['G4', 'G6'], manufacturer: 'СП "Премагаз Кромшрьодор-Україна", м.Лубни', group: 'Премагаз' },
  { tpl: 'MKM-UM G4', sizes: ['G4'], manufacturer: 'ВАТ "Мукачівприлад"', group: 'Премагаз' },
  { tpl: 'MAGNOL G4', sizes: [''], manufacturer: 'Фірма COMPTEURS MAGNOL S.A., Франція', group: 'Магнол' },
  { tpl: '{s} РЛ "Промприлад"', sizes: ['G2.5', 'G4', 'G6'], manufacturer: 'ВАТ "Івано-Франківський завод Промприлад"', group: 'РЛ' },
  { tpl: 'G2.5 РЛ "Темпо"', sizes: [''], manufacturer: 'ІВФ "Темпо", м. Івано-Франківськ', group: 'РЛ' },
  { tpl: 'G4 ЕГЛ', sizes: [''], manufacturer: 'ВАТ "Ямпільський приладобудівничий завод"', group: 'РЛ' },
  { tpl: 'GMS ARSENAL {s}', sizes: ['G2.5', 'G4'], manufacturer: 'ДП завод "Арсенал", м. Київ', group: 'РЛ' },
  { tpl: 'NPM {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ЗАТ "Газдевайс", Росія', group: 'Газдевайс' },
  { tpl: 'NPMT {s}', sizes: ['G1.6', 'G4'], manufacturer: 'ЗАТ "Газдевайс", Росія', group: 'Газдевайс' },
  { tpl: 'AMG10', sizes: [''], manufacturer: 'Фірма APATOR METRIX S.A., Польща', group: 'Метрікс' },
  { tpl: 'METRIX-U {s}', sizes: ['G1.6', 'G2.5', 'G4', 'G6'], manufacturer: 'Фірма APATOR METRIX S.A., Польща', group: 'Метрікс' },
  { tpl: 'UG G4', sizes: ['G4'], manufacturer: 'Фірма APATOR METRIX S.A., Польща', group: 'Метрікс' },
  { tpl: 'UG Т {s}', sizes: ['G1.6', 'G4'], manufacturer: 'Фірма APATOR METRIX S.A., Польща', group: 'Метрікс' },
  { tpl: 'MGM-UA {s}', sizes: ['G1.6', 'G2.5', 'G4'], manufacturer: 'ТОВ "Енергозберігаючі системи", м.Київ', group: 'Інші' },
  { tpl: 'ArmoGaz QK 2000 G4', sizes: ['G4'], manufacturer: 'ООО "Армагаз", м.Запоріжжя', group: 'Інші' },
  { tpl: 'GS G4', sizes: ['G4'], manufacturer: 'Gas Souzan, Іран', group: 'Інші' },
  { tpl: 'Elster Instromet {s}', sizes: ['G2.5', 'G4', 'G6'], manufacturer: 'Фірма "Instromet N.V.", Голландія', group: 'Інші' },
  { tpl: 'OКТАГАЗ АF-1 G4', sizes: ['G4'], manufacturer: 'Фірма Schlumberger Industrias, м.Київ', group: 'Інші' },
  { tpl: 'KALEKALIP {s}', sizes: ['G4'], manufacturer: 'СУТП ТОВ "Калекаліп Україна", м.Харків', group: 'Інші' },
];

export const METER_CATALOG = catalogTemplates.flatMap(({ tpl, sizes, manufacturer, group }) => 
  sizes.map(size => ({
    brand: tpl.replace('{s}', size).trim(),
    manufacturer,
    group
  }))
);

export const METER_SIZES = ['G1.6', 'G2.5', 'G4', 'G4-2', 'G6', 'G10'];
export const METER_SUBTYPE = ['Мембранний', 'Роторний'];
export const METER_LOCATION = ['1 - (Д<=1) Не в опал. приміщенні', '2 - (Д>1) Не в опал. приміщенні', '3 - (ОП<=0.5) В опал. приміщенні', '4 - (0.5<ОП<=1.5) В опал. приміщенні', '5 - (ОП>1.5) В опал. приміщенні', '6 - (ТК) З елементами термокомпенсації', '7 - (ТК 15 град.  директ. звед) В опал. приміщенні', '8 - (ТК 0 град. директ. звед) Не в опал.приміщенні', '9 - Коректор'];
export const METER_OWNERSHIP = ['Абонент', 'ПАТ (іП)', 'ПАТ (ОФ)', 'ПАТ (ПРИЄДН)', 'ПАТ (ЗАМіНА)'];
export const SERVICE_ORG = ['Основний', 'Підмінний'];

export const METER_MANUFACTURER = [...new Set(METER_CATALOG.map(m => m.manufacturer))].sort();
export const METER_GROUP = [...new Set(METER_CATALOG.map(m => m.group))].sort();



