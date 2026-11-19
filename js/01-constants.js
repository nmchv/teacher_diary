/* ===================== КОНСТАНТЫ ===================== */
const LS_KEY='teacherDiaryV3';
const LS_KEY_V2='teacherDiaryV2';
const LESSON_TIMES=[{n:1,start:'08:30',end:'09:10'},{n:2,start:'09:20',end:'10:00'},{n:3,start:'10:20',end:'11:00'},{n:4,start:'11:20',end:'12:00'},{n:5,start:'12:10',end:'12:50'},{n:6,start:'13:00',end:'13:40'},{n:7,start:'13:50',end:'14:30'}];
const DAY_NAMES=['Пн','Вт','Ср','Чт','Пт','Сб'];
const ASSISTANT_CHARACTERS={
 dog:{emoji:'🐶',name:'Пёс-Помощник'},
 wizard:{emoji:'🧙',name:'Волшебник'},
 cat:{emoji:'🐱',name:'Кот-Наблюдатель'},
 owl:{emoji:'🦉',name:'Сова-Эксперт'},
 robot:{emoji:'🤖',name:'Робот-Ассистент'},
 fox:{emoji:'🦊',name:'Лис-Хитрец'}
};
const ASSISTANT_TIPS=[
 'Совет: в «Настройки» можно переключить светлую и тёмную тему одной кнопкой.',
 'Не забудьте иногда делать резервную копию — она сохраняет вообще все данные, включая файлы материалов.',
 'В режиме «Начать урок» удобно быстро отмечать посещаемость и ставить баллы, не открывая карточки учеников по одному.',
 'В «Библиотеке уроков» можно сохранить готовый план и потом быстро поставить его в расписание сразу нескольким классам.',
 'Совет: используйте поиск (⌕) — он ищет сразу по ученикам, классам и коллегам.',
 'В разделе «Работа» удобно вести встречи, задачи и список того, что нужно обсудить с коллегами.',
 'Загляните в «Статистику» — там можно посмотреть распределение оценок и посещаемость по четвертям.',
 'Меня можно перетащить в любое удобное место экрана — просто зажмите и потяните.',
 'Хотите, чтобы я поменьше мешал? Отключите меня, спрячьте частично или сделайте подсказки реже в Настройках.'
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
