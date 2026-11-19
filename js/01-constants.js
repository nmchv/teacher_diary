/* ===================== КОНСТАНТЫ ===================== */
const LS_KEY='teacherDiaryV3';
const LS_KEY_V2='teacherDiaryV2';
const LESSON_TIMES=[{n:1,start:'08:30',end:'09:10'},{n:2,start:'09:20',end:'10:00'},{n:3,start:'10:20',end:'11:00'},{n:4,start:'11:20',end:'12:00'},{n:5,start:'12:10',end:'12:50'},{n:6,start:'13:00',end:'13:40'},{n:7,start:'13:50',end:'14:30'}];
const DAY_NAMES=['Пн','Вт','Ср','Чт','Пт','Сб'];
const THEMES=[{key:'default',c:'#007aff'},{key:'blue',c:'#0a66c2'},{key:'green',c:'#1e8e3e'},{key:'purple',c:'#6f42c1'},{key:'red',c:'#d93025'},{key:'orange',c:'#e8710a'},{key:'teal',c:'#009688'},{key:'pink',c:'#d6336c'},{key:'gray',c:'#5f6368'},
 {key:'maple',c:'#b5451b'},{key:'ice',c:'#3fa9d6'},{key:'mint',c:'#2fbf8f'},{key:'lavender',c:'#8e7ce0'},{key:'gold',c:'#c99a1e'},{key:'burgundy',c:'#7a2048'},{key:'lime',c:'#66a300'},{key:'navy',c:'#1b3a6b'},
 {key:'t-autumn',label:'Осень',c:'#e8710a',c2:'#c0392b',emoji:'🍂',group:'season'},
 {key:'t-winter',label:'Зима',c:'#2f7dd6',c2:'#8ecfff',emoji:'❄️',group:'season'},
 {key:'t-spring',label:'Весна',c:'#e0608c',c2:'#7bd389',emoji:'🌸',group:'season'},
 {key:'t-summer',label:'Лето',c:'#e0a800',c2:'#3fb6ff',emoji:'☀️',group:'season'},
 {key:'c-de',label:'Германия',c:'#cc0000',c2:'#f4c430',emoji:'🇩🇪',group:'country'},
 {key:'c-us',label:'США',c:'#3c3b6e',c2:'#b22234',emoji:'🇺🇸',group:'country'},
 {key:'c-fr',label:'Франция',c:'#0055a4',c2:'#ef4135',emoji:'🇫🇷',group:'country'},
 {key:'sub-geo',label:'География',c:'#1976d2',c2:'#43a047',emoji:'🌍',group:'subject'},
 {key:'sub-phys',label:'Физика',c:'#3f51b5',c2:'#00bcd4',emoji:'⚛️',group:'subject'},
 {key:'sub-chem',label:'Химия',c:'#7b1fa2',c2:'#43a047',emoji:'🧪',group:'subject'},
 {key:'cool-neon',label:'Неон',c:'#d6008a',c2:'#00e5ff',emoji:'⚡',group:'cool'},
 {key:'cool-sunset',label:'Закат',c:'#e05a4e',c2:'#ffc371',emoji:'🌇',group:'cool'},
 {key:'cool-galaxy',label:'Галактика',c:'#6a11cb',c2:'#2575fc',emoji:'🌌',group:'cool'},
 {key:'cool-aurora',label:'Северное сияние',c:'#00b09b',c2:'#845ec2',emoji:'🌈',group:'cool'}];
const THEME_GROUP_LABELS={season:'Сезонные',country:'Страны',subject:'Школьные предметы',cool:'Яркие темы'};
const FONT_FAMILIES={
 system:'-apple-system,BlinkMacSystemFont,"SF Pro Text",Arial,sans-serif',
 rounded:'"Trebuchet MS","Verdana",sans-serif',
 classic:'Georgia,"Times New Roman",serif',
 mono:'"SF Mono","Consolas","Courier New",monospace'
};
const FONT_LABELS={system:'Системный',rounded:'Скруглённый',classic:'Классический',mono:'Моноширинный'};
const SEASON_LABELS={auto:'Авто (по месяцу)',none:'Выключено',autumn:'🍂 Осень',winter:'❄️ Зима',spring:'🌸 Весна',summer:'☀️ Лето'};
const ASSISTANT_CHARACTERS={
 dog:{emoji:'🐶',name:'Пёс-Помощник'},
 wizard:{emoji:'🧙',name:'Волшебник'},
 cat:{emoji:'🐱',name:'Кот-Наблюдатель'},
 owl:{emoji:'🦉',name:'Сова-Эксперт'},
 robot:{emoji:'🤖',name:'Робот-Ассистент'},
 fox:{emoji:'🦊',name:'Лис-Хитрец'}
};
const ASSISTANT_TIPS=[
 'Совет: в «Настройках → Внешний вид» можно подобрать акцентный цвет, сезонное оформление и скругление углов под своё настроение.',
 'Не забудьте иногда делать резервную копию — она сохраняет вообще все данные, включая файлы материалов.',
 'В режиме «Начать урок» удобно быстро отмечать посещаемость и ставить баллы, не открывая карточки учеников по одному.',
 'В «Библиотеке уроков» можно сохранить готовый план и потом быстро поставить его в расписание сразу нескольким классам.',
 'Совет: используйте поиск (⌕) — он ищет сразу по ученикам, классам и коллегам.',
 'В разделе «Работа» удобно вести встречи, задачи и список того, что нужно обсудить с коллегами.',
 'Загляните в «Статистику» — там можно посмотреть распределение оценок и посещаемость по четвертям.',
 'Если сменить сезонное оформление на «Авто», я сам подберу тему по текущему месяцу — осень, зима, весна или лето.',
 'Меня можно перетащить в любое удобное место экрана — просто зажмите и потяните.',
 'Хотите, чтобы я поменьше мешал? Отключите меня, спрячьте частично или сделайте подсказки реже в Настройках → Внешний вид → Ассистент.'
];
const ASSISTANT_MOTIVATION=[
 'Вы делаете важное дело — даже один хорошо проведённый урок сегодня на что-то повлияет.',
 'Не всегда заметно сразу, но вы уже на многое повлияли в жизни своих учеников.',
 'Если день выдался тяжёлым — это нормально. Дайте себе передышку, вы её заслужили.',
 'Маленький прогресс — тоже прогресс. И у ваших учеников, и у вас самих.',
 'Спасибо, что стараетесь — это видно по тому, как аккуратно у вас всё здесь записано 🙂',
 'Помните: отдых — тоже часть хорошей работы. Не забывайте о себе.',
 'Даже если сегодня что-то не получилось — завтра будет новый урок и новый шанс.',
 'Вы справляетесь лучше, чем кажется в конце длинного дня.',
 'Ваша забота о деталях — оценки, посещаемость, заметки — уже говорит о том, что вы внимательный учитель.',
 'Один трудный класс или один трудный день не определяют вас как учителя. Вы больше, чем это.'
];
function seasonTip(){return 'Хотите другое оформление? В Настройках можно включить осеннюю листву, зимний снег или весенние лепестки ✨'}
const STUDENT_FIELDS_DEFAULT=()=>[
 {key:'nickname',label:'Никнейм (как называть в рассадке)',type:'text',system:false,visible:true},
 {key:'birthDate',label:'Дата рождения',type:'date',system:false,visible:true},
 {key:'developmentFeatures',label:'Особенности развития',type:'longtext',system:false,visible:true},
 {key:'learningFeatures',label:'Особенности обучения',type:'longtext',system:false,visible:true},
 {key:'strengths',label:'Сильные стороны',type:'longtext',system:false,visible:true},
 {key:'difficulties',label:'Трудности',type:'longtext',system:false,visible:true},
 {key:'notes',label:'Информация и примечания',type:'longtext',system:false,visible:true}
];
const CLASS_FIELDS_DEFAULT=()=>[
 {key:'headTeacher',label:'Классный руководитель',type:'colleagueLink',system:false,visible:true},
 {key:'features',label:'Особенности класса',type:'longtext',system:false,visible:true},
 {key:'notes',label:'Примечания',type:'longtext',system:false,visible:true},
 {key:'observations',label:'Педагогические наблюдения',type:'longtext',system:false,visible:true}
];
const LESSON_FIELDS_DEFAULT=()=>[
 {key:'ktpNumber',label:'№ по КТП',type:'number',system:false,visible:true},
 {key:'ktpDate',label:'Дата по КТП',type:'date',system:false,visible:true},
 {key:'planText',label:'План урока',type:'longtext',system:false,visible:true},
 {key:'stages',label:'Запланированные этапы',type:'longtext',system:false,visible:true},
 {key:'doneWhat',label:'Что успели',type:'longtext',system:false,visible:true},
 {key:'notDone',label:'Что не успели',type:'longtext',system:false,visible:true},
 {key:'homework',label:'Домашнее задание',type:'longtext',system:false,visible:true},
 {key:'workedWell',label:'Что сработало лучше',type:'longtext',system:false,visible:true},
 {key:'difficult',label:'Что было сложным',type:'longtext',system:false,visible:true},
 {key:'notes',label:'Заметки',type:'longtext',system:false,visible:true}
];
const COLLEAGUE_FIELDS_DEFAULT=()=>[
 {key:'position',label:'Должность / предмет',type:'text',system:false,visible:true},
 {key:'birthDate',label:'Дата рождения',type:'date',system:false,visible:true},
 {key:'phone',label:'Телефон',type:'text',system:false,visible:true},
 {key:'email',label:'Email',type:'text',system:false,visible:true},
 {key:'notes',label:'Заметки',type:'longtext',system:false,visible:true}
];

