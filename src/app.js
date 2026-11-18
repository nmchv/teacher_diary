/*
 * =============================================================================
 * Дневник учителя — единый файл приложения (bundle)
 * =============================================================================
 * Этот файл объединяет все 28 модулей из src/ в правильном порядке загрузки:
 *
 *  1. core/00-constants.js   — константы, LESSON_TIMES, DAY_NAMES, тема интерфейса, поля по умолчанию
 *  2. core/01-utils.js       — утилиты (uid, e, C, L, P, M, timeToMin, toISO, mondayOf и др.)
 *  3. core/02-storage.js     — хранилище (D, loadData, save, repairMissingLessonTimes)
 *  4. core/03-files.js       — IndexedDB файловое хранилище
 *  5. core/04-charts.js      — SVG-диаграммы и статистика
 *  6. core/05-state.js       — состояние приложения (объект S)
 *  7. theme/theme.js         — темы оформления
 *  8. assistant/assistant.js — виртуальный ассистент
 *  9. shell/shell.js         — оболочка, отрисовка, навигация (render, page, navBtn, goto)
 * 10. lessons/status.js      — статусы уроков
 * 11. lessons/modal.js       — модальное окно урока
 * 12. lessons/duplicate.js   — дублирование урока
 * 13. lessons/print.js       — печать урока и табеля
 * 14. lessons/lifecycle.js   — отмена/архивация/восстановление уроков
 * 15. home/home.js           — главная страница, виджеты, расписание недели
 * 16. classes/classes.js     — страница класса, расписание, рассадка, openClass
 * 17. present/present.js     — режим урока (оценки, посещаемость, баллы, поведение)
 * 18. students/students.js   — список учеников
 * 19. announcements/announcements.js — объявления
 * 20. work/work.js           — раздел «Работа» (коллеги, встречи, документы, архив)
 * 21. search/search.js       — поиск по урокам и оценкам
 * 22. stats/stats.js         — статистика
 * 23. materials/materials.js — материалы
 * 24. library/library.js     — библиотека уроков
 * 25. reports/reports.js     — сводные ведомости
 * 26. settings/settings.js   — настройки
 * 27. backup/backup.js       — резервное копирование
 * 28. boot/boot.js           — инициализация приложения (boot())
 *
 * Подключение: <script src="src/app.js"></script>
 * =============================================================================
 */
const LS_KEY='teacherDiaryV3';
const LS_KEY_V2='teacherDiaryV2';
const LESSON_TIMES=[{n:1,start:'08:30',end:'09:10'},{n:2,start:'09:20',end:'10:00'},{n:3,start:'10:20',end:'11:00'},{n:4,start:'11:20',end:'12:00'},{n:5,start:'12:10',end:'12:50'},{n:6,start:'13:00',end:'13:40'},{n:7,start:'13:50',end:'14:30'}];
const DAY_NAMES=['Пн','Вт','Ср','Чт','Пт','Сб'];
const FONT_FAMILIES={
 system:'"Manrope Variable","Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
 rounded:'"Trebuchet MS","Verdana",sans-serif',
 classic:'Georgia,"Times New Roman",serif',
 mono:'"SF Mono","Consolas","Courier New",monospace'
};
const FONT_LABELS={system:'Manrope',rounded:'Скруглённый',classic:'Классический',mono:'Моноширинный'};
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
const GRADE_OPTIONS_DEFAULT=['5','4/5','4','3/4','3','2/3','2','долг'];
const LIBRARY_GRADE_LEVELS_DEFAULT=['1','2','3','4','5','6','7','8','9','10','11'];
const GRADE_COMMENT_TEMPLATES_DEFAULT=['Активно работал(а) на уроке','Отличная работа','Не был(а) готов(а) к уроку','Не сдал(а) работу','Требуется пересдача','Нужна доп. консультация'];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const e=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nl2br=x=>e(x).replace(/\n/g,'<br>');
function richTextView(val){
 if(!val)return'';
 if(/<[a-z][^>]*>/i.test(val))return val;
 return nl2br(val);
}
const C=i=>D.classes.find(x=>x.id===i);
const L=i=>D.lessons.find(x=>x.id===i);
const P=i=>D.students.find(x=>x.id===i);
const M=i=>D.materials.find(x=>x.id===i);
function parseClassName(name){
 let m=String(name||'').match(/^\s*(\d+)\s*(.*)$/);
 if(m)return{number:+m[1],letter:m[2].trim()};
 return{number:null,letter:String(name||'').trim()};
}
function compareClasses(a,b){
 let an=a.gradeNumber,bn=b.gradeNumber;
 if(an!=null&&bn!=null&&an!==bn)return an-bn;
 if(an!=null&&bn==null)return -1;
 if(an==null&&bn!=null)return 1;
 return (a.gradeLetter||a.name||'').localeCompare(b.gradeLetter||b.name||'','ru')||(a.name||'').localeCompare(b.name||'','ru');
}
function sortedClasses(list){return [...list].sort(compareClasses)}
function clubsSidebarHtml(){
 let clubs=sortedClasses(D.classes.filter(c=>c.type==='club'));
 if(!clubs.length)return '<div class="small muted label" style="padding:6px 8px">Кружков пока нет</div>';
 let byParent={};
 clubs.forEach(c=>{if(c.parentClubId){(byParent[c.parentClubId]=byParent[c.parentClubId]||[]).push(c)}});
 let clubIds=new Set(clubs.map(c=>c.id));
 let row=(c,indent)=>'<div class="classrow" style="padding-left:'+(indent*14)+'px"><button class="label" onclick="openClass(\''+c.id+'\')">'+(indent?'↳ ':'')+e(c.name)+'</button><button class="label" onclick="event.stopPropagation();openEditClass(\''+c.id+'\')">⋯</button></div>';
 let html='';
 clubs.filter(c=>!c.parentClubId||!clubIds.has(c.parentClubId)).forEach(c=>{
  html+=row(c,0);
  (byParent[c.id]||[]).forEach(g=>html+=row(g,1));
 });
 return html;
}
function classOptionsHtml(selectedId){
 let classes=sortedClasses(D.classes.filter(c=>c.type!=='club'));
 let clubs=sortedClasses(D.classes.filter(c=>c.type==='club'));
 let opt=c=>'<option value="'+c.id+'"'+(c.id===selectedId?' selected':'')+'>'+e(c.name)+'</option>';
 let html='';
 if(classes.length)html+='<optgroup label="Классы">'+classes.map(opt).join('')+'</optgroup>';
 if(clubs.length)html+='<optgroup label="Кружки">'+clubs.map(opt).join('')+'</optgroup>';
 return html;
}
function activeLessons(){return D.lessons.filter(l=>!l.archived)}
function purgeOldArchivedLessons(){
 let today=toISO(new Date());
 D.lessons=D.lessons.filter(l=>{
  if(!l.archived)return true;
  return daysBetween(l.archivedAt||today,today)<30;
 });
}
function fmtDate(x){if(!x)return'—';let d=new Date(x+'T12:00:00');if(isNaN(d))return'—';return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()}
function fmtDateShort(x){let d=new Date(x+'T12:00:00');return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')}
function age(x){if(!x)return'—';let b=new Date(x+'T12:00:00'),n=new Date(),a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()==b.getMonth()&&n.getDate()<b.getDate()))a--;return a>=0&&a<130?a:'—'}
function toISO(d){return d.toISOString().slice(0,10)}
function mondayOf(dateStr){let d=new Date(dateStr+'T12:00:00');let day=d.getDay();let diff=(day===0?-6:1-day);d.setDate(d.getDate()+diff);return toISO(d)}
function addDays(dateStr,n){let d=new Date(dateStr+'T12:00:00');d.setDate(d.getDate()+n);return toISO(d)}
function weekDates(monday){return (D.settings.showSaturday?[0,1,2,3,4,5]:[0,1,2,3,4]).map(i=>addDays(monday,i))}
function dayIndexOfDate(dateStr){let d=new Date(dateStr+'T12:00:00');let day=d.getDay();return day===0?6:day-1} // 0=Пн..4=Пт,5=Сб,6=Вс
function timeFor(n){let t=LESSON_TIMES.find(x=>x.n===+n);return t?{start:t.start,end:t.end}:{start:'',end:''}}
function fieldDefs(entity){return D.settings.fields[entity]}
function visibleFields(entity){return fieldDefs(entity).filter(f=>f.visible).sort((a,b)=>0)}
function fieldByKey(entity,key){return fieldDefs(entity).find(f=>f.key===key)}
function people(cid){return D.students.filter(s=>(s.classIds||[]).includes(cid)&&s.status!=='archived').sort((a,b)=>(a.lastName+a.firstName).localeCompare(b.lastName+b.firstName,'ru'))}
function groupIds(cid){let out=[cid],q=[cid];while(q.length){let par=q.shift();D.classes.forEach(c=>{if(c.parentClubId===par&&!out.includes(c.id)){out.push(c.id);q.push(c.id)}})}return out}
function hasChildGroups(cid){return groupIds(cid).length>1}
function groupLessons(cid){let ids=groupIds(cid);return activeLessons().filter(l=>ids.includes(l.classId))}
function peopleGroup(cid){let ids=groupIds(cid);return D.students.filter(s=>s.status!=='archived'&&(s.classIds||[]).some(i=>ids.includes(i))).sort((a,b)=>(a.lastName+a.firstName).localeCompare(b.lastName+b.firstName,'ru'))}
function attendablePeople(cid){return people(cid).filter(s=>!s.homeschool)}
function studentClassObjs(s){return (s.classIds||[]).map(id=>C(id)).filter(Boolean)}
function studentClassNames(s){let cs=studentClassObjs(s);return cs.length?cs.map(c=>c.name+(c.subject?' ('+c.subject+')':'')).join(', '):'Без класса'}
function studentFio(s){return e(s.lastName)+' '+e(s.firstName)+(s.middleName?' '+e(s.middleName):'')}
function avg(nums){if(!nums.length)return null;return nums.reduce((a,b)=>a+b,0)/nums.length}
function round2(n){return n===null||n===undefined?'—':Math.round(n*100)/100}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function timeToMin(t){if(!t)return null;let p=String(t).split(':');let h=+p[0],m=+p[1];if(isNaN(h)||isNaN(m))return null;return h*60+m}
function richToolbarHtml(domId){
 return '<div class="richtext-toolbar">'+
  '<button type="button" title="Жирный" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'bold\')"><b>Ж</b></button>'+
  '<button type="button" title="Курсив" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'italic\')"><i>К</i></button>'+
  '<button type="button" title="Подчёркнутый" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'underline\')"><u>Ч</u></button>'+
  '<button type="button" title="Список" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'insertUnorderedList\')">☰</button>'+
  '<button type="button" title="Очистить форматирование" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'removeFormat\')">✕</button>'+
  '</div>';
}
function richExec(domId,cmd){let el=document.getElementById(domId);if(!el)return;el.focus();document.execCommand(cmd,false,null)}
function customFieldInput(domId,f,val){
 val=val===undefined||val===null?'':val;
 if(f.type==='longtext'){
  let content=/<[a-z][^>]*>/i.test(val)?val:nl2br(val);
  return '<div class="richtext-wrap">'+richToolbarHtml(domId)+'<div id="'+domId+'" class="richtext-edit" contenteditable="true">'+content+'</div></div>';
 }
 if(f.type==='number')return '<input id="'+domId+'" type="number" value="'+e(val)+'">';
 if(f.type==='date')return '<input id="'+domId+'" type="date" value="'+e(val)+'">';
 if(f.type==='boolean')return '<select id="'+domId+'"><option value="">—</option><option value="yes"'+(val==='yes'?' selected':'')+'>Да</option><option value="no"'+(val==='no'?' selected':'')+'>Нет</option></select>';
 if(f.type==='select')return '<select id="'+domId+'"><option value="">—</option>'+(f.options||[]).map(o=>'<option value="'+e(o)+'"'+(val===o?' selected':'')+'>'+e(o)+'</option>').join('')+'</select>';
 if(f.type==='colleagueLink')return '<select id="'+domId+'"><option value="">— не назначен —</option>'+D.colleagues.map(c=>'<option value="'+c.id+'"'+(val===c.id?' selected':'')+'>'+e(colleagueFioPlain(c))+(colleagueField(c,'position')?' — '+e(colleagueField(c,'position')):'')+'</option>').join('')+'</select>';
 return '<input id="'+domId+'" value="'+e(val)+'">';
}
function readFieldValue(f,el){
 if(!el)return'';
 if(f.type==='longtext'){let h=el.innerHTML;return (h==='<br>'||h==='<div><br></div>')?'':h}
 return el.value;
}
function customFieldView(f,val){
 if(!val&&val!==0)return'';
 if(f.type==='date')return fmtDate(val);
 if(f.type==='boolean')return val==='yes'?'Да':val==='no'?'Нет':'';
 if(f.type==='colleagueLink'){let col=D.colleagues.find(x=>x.id===val);return col?colleagueFioPlain(col):''}
 return val;
}
function defaultData(){
 return {version:3,classes:[],students:[],lessons:[],materials:[],scheduleBlocks:[],lessonTemplates:[],announcements:[],
  meetings:[],workTasks:[],colleagues:[],
  settings:{colorMode:'dark',academicYear:'2026–2027',
   lastBackupAt:null,backupReminder:{lastShown:null},
   fontFamily:'system',radius:1,sidebarStyle:'solid',
   assistant:{enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true},
   fields:{student:STUDENT_FIELDS_DEFAULT(),class:CLASS_FIELDS_DEFAULT(),lesson:LESSON_FIELDS_DEFAULT(),colleague:COLLEAGUE_FIELDS_DEFAULT()}}};
}

function seedDemoData(){
 let initials=(D.classes||[]).some(c=>c.demo)||(D.students||[]).some(x=>x.demo);
 if(initials)return false;
 let today=toISO(new Date());
 let nowDate=new Date();
 let y=nowDate.getMonth()+1>=8?nowDate.getFullYear():nowDate.getFullYear()-1;
 let upcomingBd=addDays(today,3).slice(5);

 let c6={id:'demo-class-6a',type:'class',name:'6А',gradeNumber:6,gradeLetter:'А',parentClubId:null,subject:'География',academicYear:D.settings.academicYear,customFields:{},demo:true};
 let c7={id:'demo-class-7b',type:'class',name:'7Б',gradeNumber:7,gradeLetter:'Б',parentClubId:null,subject:'География',academicYear:D.settings.academicYear,customFields:{},demo:true};
 let c8={id:'demo-class-8a',type:'class',name:'8А',gradeNumber:8,gradeLetter:'А',parentClubId:null,subject:'География',academicYear:D.settings.academicYear,customFields:{},demo:true};
 let club={id:'demo-class-club',type:'club',name:'Юный географ',gradeNumber:null,gradeLetter:'',parentClubId:null,subject:'География',academicYear:D.settings.academicYear,customFields:{},demo:true};
 let demoClasses=[c6,c7,c8,club];

 let col1={id:'demo-col-1',lastName:'Сидорова',firstName:'Елена',middleName:'Викторовна',customFields:{position:'Заместитель директора по УВР',phone:'+7 900 111-22-33',email:'sidorova@school.ru',notes:'Курирует предметы естественно-научного цикла.'},demo:true};
 let col2={id:'demo-col-2',lastName:'Орлова',firstName:'Ирина',middleName:'Сергеевна',customFields:{position:'Классный руководитель 6А, учитель русского языка',phone:'+7 900 222-33-44',email:'orlova@school.ru',notes:''},demo:true};
 let col3={id:'demo-col-3',lastName:'Громов',firstName:'Павел',middleName:'Андреевич',customFields:{position:'Учитель физики',phone:'',email:'gromov@school.ru',notes:'Проводит совместные уроки по теме «Атмосфера».'},demo:true};
 c6.customFields.headTeacher=col2.id;

 function st(id,last,first,middle,classIds,birth,nick,notes){
  return {id,lastName:last,firstName:first,middleName:middle||'',classIds,customFields:{birthDate:birth,nickname:nick||'',notes:notes||''},status:'active',demo:true};
 }
 let students=[
  st('demo-s-1','Иванова','Мария','Алексеевна',[c6.id],'2013-'+upcomingBd,'Маша','Активно отвечает, любит карты.'),
  st('demo-s-2','Петров','Артём','Игоревич',[c6.id],'2013-03-14','Артём','Нужно напоминать про домашнее задание.'),
  st('demo-s-3','Соколова','Дарья','Викторовна',[c6.id],'2013-07-22','Даша','Сильная в работе с контурными картами.'),
  st('demo-s-4','Кузнецов','Максим','Олегович',[c6.id],'2013-11-05','Макс',''),
  st('demo-s-5','Лебедева','Анна','Павловна',[c6.id],'2013-09-30','Аня',''),
  st('demo-s-6','Смирнов','Илья','Дмитриевич',[c7.id],'2012-02-18','Илья',''),
  st('demo-s-7','Волкова','Софья','Андреевна',[c7.id],'2012-06-11','Соня','Хорошо работает в группе.'),
  st('demo-s-8','Морозов','Даниил','Сергеевич',[c7.id],'2012-12-03','Даня',''),
  st('demo-s-9','Павлова','Екатерина','Максимовна',[c7.id],'2012-04-27','Катя',''),
  st('demo-s-10','Новиков','Кирилл','Евгеньевич',[c8.id],'2011-05-19','Кирилл',''),
  st('demo-s-11','Фёдорова','Полина','Артёмовна',[c8.id],'2011-08-08','Поля','Интересуется климатологией.'),
  st('demo-s-12','Егоров','Матвей','Романович',[c8.id],'2011-10-25','Матвей',''),
  st('demo-s-13','Захарова','Алиса','Ильинична',[c8.id],'2011-01-16','Алиса','')
 ];
 students[10].classIds.push(club.id);
 students[5].classIds.push(club.id);
 students[0].classIds.push(club.id);

 let topics=[
  {topic:'Географическая оболочка и её свойства',plan:'Повторить строение географической оболочки, разобрать примеры взаимосвязей.',hw:'§4, вопросы 1–3'},
  {topic:'Литосферные плиты и рельеф',plan:'Работа с картой строения земной коры, обозначить крупные плиты.',hw:'Контурная карта: подписать плиты'},
  {topic:'Климатообразующие факторы',plan:'Обсудить широту, рельеф и океанические течения.',hw:'§7, составить схему факторов'},
  {topic:'Атмосферные фронты и циклоны',plan:'Разобрать синоптическую карту, найти циклон и антициклон.',hw:'§9, выписать определения'},
  {topic:'Воды суши: реки и озёра',plan:'Сравнить режимы рек разных климатических поясов.',hw:'Нанести на карту 5 крупных рек'},
  {topic:'Природные зоны мира',plan:'Групповая работа: описать одну природную зону по плану.',hw:'Подготовить мини-сообщение'},
  {topic:'Население и урбанизация',plan:'Обсудить динамику численности населения и крупнейшие города.',hw:'§12, таблица «Города-миллионеры»'},
  {topic:'Практикум: работа с климатограммами',plan:'Научиться читать климатограммы и определять тип климата.',hw:'Достроить 2 климатограммы'},
  {topic:'Контрольная работа по разделу',plan:'Проверить знания по изученному разделу.',hw:'Повторить записи в тетради'}
 ];
 let counters={};
 function nextTopic(cid){
  let i=counters[cid]||0;counters[cid]=i+1;return topics[i%topics.length];
 }
 function lessonStudents(cid){
  if(cid===c6.id)return students.slice(0,5);
  if(cid===c7.id)return students.slice(5,9);
  if(cid===c8.id)return students.slice(9,13);
  return students.filter(s=>s.classIds.includes(club.id));
 }
 let lessonSeq=0;
 let lessons=[];
 function addLesson(cfg,num,date,isPast,lessonIndex){
  let t=nextTopic(cfg.id);
  let lesson={id:'demo-lesson-'+(++lessonSeq),demo:true,date,lessonNumber:num===null?null:num,
   startTime:num===null?'15:00':timeFor(num).start,endTime:num===null?'16:00':timeFor(num).end,
   classId:cfg.id,topic:t.topic,customFields:{planText:t.plan,homework:t.hw},attendance:{},grades:{},materialIds:[]};
  if(isPast){
   let ps=lessonStudents(cfg.id);
   ps.forEach((s,i)=>{
    let absent=(lessonIndex+i)%11===0;
    lesson.attendance[s.id]=absent?'н':'п';
    if(!absent&&(lessonIndex+i)%3!==0){
     let vals=['5','4','5','4/5','4','3/4'];
     lesson.grades[s.id]={value:vals[(lessonIndex+i)%vals.length],comment:(lessonIndex+i)%7===0?'Активная работа на уроке':''};
    }
   });
   if(lessonIndex%4===0)lesson.customFields.doneWhat='Успели разобрать теорию и выполнить тренировочное задание.';
   if(lessonIndex%5===0)lesson.customFields.notes='Обратить внимание на темп работы класса.';
   if(lessonIndex%7===0&&ps.length)lesson.behaviorNotes={[ps[0].id]:'Отвлекался(ась) в начале урока, затем включился(ась) в работу.'};
   if(lessonIndex%3===0)lesson.manuallyCompleted=true;
   if(lessonIndex===2)lesson.manualStatus='yellow';
  }
  lessons.push(lesson);
 }
 let configs=[
  {id:c6.id,slots:[[1,1],[3,2],[5,3]]},
  {id:c7.id,slots:[[2,2],[4,3]]},
  {id:c8.id,slots:[[1,3],[4,1]]},
  {id:club.id,slots:[[3,null]]}
 ];
 let idx=0;
 for(let off=-42;off<=14;off++){
  let date=addDays(today,off);
  let dow=new Date(date+'T12:00:00').getDay();
  configs.forEach(cfg=>{
   cfg.slots.forEach(slot=>{
    if(dow===slot[0]){
     addLesson(cfg,slot[1],date,off<0,idx++);
    }
   });
  });
 }
 let cancelledLesson=lessons.find(l=>l.classId===c8.id&&l.date<today);
 if(cancelledLesson){cancelledLesson.cancelled=true;cancelledLesson.topic='Урок отменён: школьная олимпиада';}

 let meetings=[
  {id:'demo-meeting-1',demo:true,title:'Педсовет: итоги первой четверти',date:addDays(today,3),time:'15:30',location:'Актовый зал',participants:'Педагогический коллектив',agenda:'Успеваемость, посещаемость, план работы на следующую четверть.'},
  {id:'demo-meeting-2',demo:true,title:'Родительское собрание 6А',date:addDays(today,8),time:'18:00',location:'Каб. 204',participants:'Родители учеников 6А, классный руководитель',agenda:'Итоги четверти, подготовка к контрольной работе.'}
 ];
 let tasks=[
  {id:'demo-task-1',demo:true,title:'Подготовить контрольную для 7Б',dueDate:addDays(today,2),priority:'high',status:'todo',notes:'Включить задания по климатограммам.'},
  {id:'demo-task-2',demo:true,title:'Проверить рабочие тетради 6А',dueDate:addDays(today,1),priority:'med',status:'todo',notes:''},
  {id:'demo-task-3',demo:true,title:'Сдать отчёт по успеваемости завучу',dueDate:addDays(today,5),priority:'high',status:'todo',notes:'Форма лежит в общем диске.'},
  {id:'demo-task-4',demo:true,title:'Обновить КТП по географии',dueDate:'',priority:'low',status:'done',notes:''}
 ];
 let announcements=[
  {id:'demo-ann-1',demo:true,text:'Принести контурные карты и цветные карандаши к практической работе.'},
  {id:'demo-ann-2',demo:true,text:'Повторить определения по теме «Атмосфера» перед контрольной.'}
 ];
 let templates=[
  {id:'demo-tpl-1',demo:true,name:'Стандартный комбинированный урок',gradeNumber:6,topic:'Новая тема',fields:{planText:'Организационный момент → проверка домашнего задания → объяснение нового материала → закрепление → итоги.',homework:'§, вопросы устно'}},
  {id:'demo-tpl-2',demo:true,name:'Урок-практикум с картами',gradeNumber:7,topic:'Практическая работа',fields:{planText:'Инструктаж → работа в парах с атласом → оформление результатов → защита выводов.',homework:'Дооформить работу'}}
 ];
 let materials=[
  {id:'demo-mat-1',demo:true,filename:'Презентация «Климат Африки»',category:'6А',gradeNumber:6,isLink:true,url:'https://ru.wikipedia.org/wiki/Климат',mimeType:'',size:0,createdAt:new Date().toISOString()},
  {id:'demo-mat-2',demo:true,filename:'Справочник «Природные зоны мира»',category:'7Б',gradeNumber:7,isLink:true,url:'https://ru.wikipedia.org/wiki/Природная_зона',mimeType:'',size:0,createdAt:new Date().toISOString()}
 ];
 let quarters=[
  {id:'demo-q-1',demo:true,name:'1 четверть',startDate:y+'-09-01',endDate:y+'-10-25'},
  {id:'demo-q-2',demo:true,name:'2 четверть',startDate:y+'-11-05',endDate:y+'-12-28'},
  {id:'demo-q-3',demo:true,name:'3 четверть',startDate:(y+1)+'-01-12',endDate:(y+1)+'-03-20'},
  {id:'demo-q-4',demo:true,name:'4 четверть',startDate:(y+1)+'-04-01',endDate:(y+1)+'-05-25'}
 ];

 D.classes=(D.classes||[]).concat(demoClasses);
 D.students=(D.students||[]).concat(students);
 D.lessons=(D.lessons||[]).concat(lessons);
 D.meetings=(D.meetings||[]).concat(meetings);
 D.workTasks=(D.workTasks||[]).concat(tasks);
 D.colleagues=(D.colleagues||[]).concat([col1,col2,col3]);
 D.announcements=(D.announcements||[]).concat(announcements);
 D.lessonTemplates=(D.lessonTemplates||[]).concat(templates);
 D.materials=(D.materials||[]).concat(materials);
 D.settings.quarters=(D.settings.quarters||[]).concat(quarters);
 D.demoSeed=true;
 save();
 return true;
}
function hasDemoData(){
 return ['classes','students','lessons','meetings','workTasks','colleagues','announcements','lessonTemplates','materials'].some(k=>(D[k]||[]).some(x=>x.demo))||(D.settings.quarters||[]).some(q=>q.demo);
}
function demoSettingsCardHtml(){
 if(hasDemoData()){
  let counts=[['classes','класс'],['students','ученик'],['lessons','урок']].map(x=>{
   let n=(D[x[0]]||[]).filter(v=>v.demo).length;
   let word=x[1];
   if(x[0]==='classes')word=n===1?'класс':(n<5?'класса':'классов');
   if(x[0]==='students')word=n===1?'ученик':(n<5?'ученика':'учеников');
   if(x[0]==='lessons')word=n===1?'урок':(n<5?'урока':'уроков');
   return n+' '+word;
  }).join(', ');
  return sCard('Демонстрационные данные','<p class="muted small">В дневнике сейчас есть тестовые записи: '+counts+'. Они показывают, как выглядят расписание, оценки, посещаемость, отчёты и библиотека. Ваши собственные записи при удалении тестовых данных останутся.</p><div class="toolbar"><button class="danger" onclick="removeDemoData()">Удалить тестовые данные</button></div>');
 }
 return sCard('Демонстрационные данные','<p class="muted small">Можно добавить примеры — классы, учеников, уроки, оценки и отчёты, чтобы посмотреть, как всё работает. Примеры добавляются к текущим записям, а удалить их можно одной кнопкой.</p><div class="toolbar"><button class="primary" onclick="loadDemoData()">Заполнить тестовыми данными</button></div>');
}
function loadDemoData(){
 if(seedDemoData())render();
}
function removeDemoData(){
 if(!confirm('Удалить все демонстрационные данные? Ваши собственные записи, классы и уроки останутся.'))return;
 let keepClassIds=new Set();
 (D.students||[]).filter(x=>!x.demo).forEach(s=>(s.classIds||[]).forEach(id=>keepClassIds.add(id)));
 (D.lessons||[]).filter(x=>!x.demo).forEach(l=>{if(l.classId)keepClassIds.add(l.classId)});
 (D.classes||[]).forEach(c=>{if(c.demo&&keepClassIds.has(c.id))delete c.demo});
 let demoColIds=new Set((D.colleagues||[]).filter(x=>x.demo).map(x=>x.id));
 (D.classes||[]).filter(c=>!c.demo).forEach(c=>{
  if(c.customFields&&demoColIds.has(c.customFields.headTeacher))delete c.customFields.headTeacher;
 });
 ['students','lessons','meetings','workTasks','colleagues','announcements','lessonTemplates','materials'].forEach(k=>{
  D[k]=(D[k]||[]).filter(x=>!x.demo);
 });
 D.classes=(D.classes||[]).filter(x=>!x.demo);
 D.settings.quarters=(D.settings.quarters||[]).filter(q=>!q.demo);
 D.demoSeed=false;
 save();
 if(S.classId&&!C(S.classId)){S.classId=null;S.view='home'}
 if(S.studentId&&!P(S.studentId)){S.studentId=null;S.view='home'}
 render();
}

let D=null;
let skipDemoSeed=false;
function loadData(){
 let raw=localStorage.getItem(LS_KEY);
 if(raw){try{D=JSON.parse(raw)}catch(e){D=defaultData()}}
 else{
  D=defaultData();
  migrateFromV2();
  if(!skipDemoSeed&&!(D.classes||[]).length&&!(D.students||[]).length&&!(D.lessons||[]).length)seedDemoData();
 }
 if(!D.settings)D.settings={colorMode:'dark',academicYear:'2026–2027',fields:{student:STUDENT_FIELDS_DEFAULT(),class:CLASS_FIELDS_DEFAULT(),lesson:LESSON_FIELDS_DEFAULT(),colleague:COLLEAGUE_FIELDS_DEFAULT()}};
 if(!D.materials)D.materials=[];
 if(!D.scheduleBlocks)D.scheduleBlocks=[];
 if(!D.lessonTemplates)D.lessonTemplates=[];
 if(!D.announcements)D.announcements=[];
 if(!D.settings.presentLayout)D.settings.presentLayout={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
 if(!D.settings.presentLayoutClub)D.settings.presentLayoutClub={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
 [D.settings.presentLayout,D.settings.presentLayoutClub].forEach(layout=>{
  if(layout&&!layout.left.includes('behavior')&&!layout.right.includes('behavior'))layout.right.push('behavior');
 });
 if(!D.settings.gradeScale)D.settings.gradeScale=[...GRADE_OPTIONS_DEFAULT];
 if(!D.settings.gradeCommentTemplates)D.settings.gradeCommentTemplates=[...GRADE_COMMENT_TEMPLATES_DEFAULT];
 if(!D.settings.libraryGradeLevels)D.settings.libraryGradeLevels=[...LIBRARY_GRADE_LEVELS_DEFAULT];
 if(D.settings.showSaturday===undefined)D.settings.showSaturday=true;
 if(!D.settings.colorMode)D.settings.colorMode='dark';
 if(D.settings.lastBackupAt===undefined)D.settings.lastBackupAt=null;
 if(!D.settings.backupReminder)D.settings.backupReminder={lastShown:null};
 D.students.forEach(s=>{if(!s.classIds){s.classIds=s.classId?[s.classId]:[];delete s.classId}});
 D.classes.forEach(c=>{if(!c.type)c.type='class'});
 D.classes.forEach(c=>{if(c.gradeNumber===undefined){let p=parseClassName(c.name);c.gradeNumber=p.number;c.gradeLetter=p.letter}});
 if(!D.documents)D.documents=[];
 if(!D.settings.quarters)D.settings.quarters=[];
 if(!D.todos)D.todos=[];
 if(!D.meetings)D.meetings=[];
 if(!D.workTasks)D.workTasks=[];
 if(D.todos.length){
  D.todos.forEach(t=>D.workTasks.push({id:t.id||uid(),title:t.text,dueDate:'',priority:'med',status:t.done?'done':'todo',notes:''}));
  D.todos=[];
 }
 if(!D.colleagues)D.colleagues=[];
 if(!D.settings.fields.colleague)D.settings.fields.colleague=COLLEAGUE_FIELDS_DEFAULT();
 D.colleagues.forEach(c=>{
  if(!c.customFields){
   c.customFields={position:c.position||'',birthDate:c.birthDate||'',phone:c.phone||'',email:c.email||'',notes:c.notes||''};
   delete c.position;delete c.birthDate;delete c.phone;delete c.email;delete c.notes;
  }
 });
 let headTeacherField=D.settings.fields.class.find(f=>f.key==='headTeacher');
 if(headTeacherField&&headTeacherField.type!=='colleagueLink')headTeacherField.type='colleagueLink';
 if(!D.settings.fields.student.find(f=>f.key==='nickname'))D.settings.fields.student.unshift({key:'nickname',label:'Никнейм (как называть в рассадке)',type:'text',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpNumber'))D.settings.fields.lesson.unshift({key:'ktpNumber',label:'№ по КТП',type:'number',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpDate'))D.settings.fields.lesson.splice(1,0,{key:'ktpDate',label:'Дата по КТП',type:'date',system:false,visible:true});
 if(!D.settings.homeWidgets)D.settings.homeWidgets=[{key:'clock',visible:true},{key:'schedule',visible:true},{key:'stats',visible:true},{key:'todo',visible:true},{key:'birthdays',visible:true},{key:'recent',visible:true}];
 if(!D.settings.teacherName)D.settings.teacherName='';
 if(!D.settings.pointsThreshold)D.settings.pointsThreshold=5;
 if(D.settings.fontFamily===undefined)D.settings.fontFamily='system';
 if(D.settings.radius===undefined)D.settings.radius=1;
 if(D.settings.sidebarStyle===undefined)D.settings.sidebarStyle='solid';
 if(!D.settings.assistant)D.settings.assistant={enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true};
 if(D.settings.assistant.peeked===undefined)D.settings.assistant.peeked=false;
 if(D.settings.assistant.motivation===undefined)D.settings.assistant.motivation=true;
 D.materials.forEach(m=>{if(m.gradeNumber===undefined)m.gradeNumber=null});
}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(D))}
function migrateFromV2(){
 try{
  let rawV2=localStorage.getItem(LS_KEY_V2);
  if(!rawV2)return;
  let V2=JSON.parse(rawV2);
  let filesV2=JSON.parse(localStorage.getItem(LS_KEY_V2+'_files')||'[]');
  let classIdMap={};
  (V2.classes||[]).forEach(c=>{
   let nc={id:c.id,name:c.name,subject:c.subject||'',academicYear:c.year||D.settings.academicYear,customFields:{}};
   D.classes.push(nc);classIdMap[c.id]=c.id;
  });
  (V2.students||[]).forEach(s=>{
   D.students.push({id:s.id,lastName:s.last||'',firstName:s.first||'',middleName:s.middle||'',
    classIds:s.classId?[s.classId]:[],status:s.active===false?'archived':'active',
    customFields:{birthDate:s.birth||'',developmentFeatures:s.dev||'',learningFeatures:s.learn||'',
     strengths:s.strength||'',difficulties:s.diff||'',notes:s.notes||''}});
  });
  (V2.lessons||[]).forEach(l=>{
   let attendance={};
   (D.students.filter(s=>(s.classIds||[]).includes(l.classId))).forEach(s=>{attendance[s.id]=(l.absent||[]).includes(s.id)?'н':'+'});
   let grades={};
   (V2.grades||[]).filter(g=>g.lessonId===l.id).forEach(g=>{grades[g.studentId]={value:g.value,comment:g.comment||''}});
   let materialIds=[];
   filesV2.filter(f=>f.lessonId===l.id).forEach(f=>{
    let mid=uid();
    D.materials.push({id:mid,filename:f.name,category:'Из версии 2',mimeType:'',size:0,createdAt:new Date().toISOString(),legacyData:f.data});
    materialIds.push(mid);
   });
   D.lessons.push({id:l.id,date:l.date,lessonNumber:null,startTime:'',endTime:'',classId:l.classId,topic:l.topic||'',
    customFields:{planText:l.plan||'',stages:l.planned||'',doneWhat:l.done||'',notDone:l.notdone||'',
     homework:l.hw||'',workedWell:l.good||'',difficult:l.hard||'',notes:l.notes||''},
    attendance:l.after?attendance:{},grades,materialIds});
  });
  save();
 }catch(err){console.error('Ошибка миграции из v2:',err)}
}
function repairMissingLessonTimes(){
 let fixed=0;
 D.lessons.forEach(l=>{
  if(l.lessonNumber&&(!l.startTime||!l.endTime)){
   let t=timeFor(l.lessonNumber);
   if(!l.startTime&&t.start)l.startTime=t.start;
   if(!l.endTime&&t.end)l.endTime=t.end;
   fixed++;
  }
 });
 if(fixed)save();
 return fixed;
}
const FILES_DB='teacherDiaryV3Files',FILES_STORE='files';
let _dbp=null;
function openFilesDB(){
 if(_dbp)return _dbp;
 _dbp=new Promise((res,rej)=>{
  let rq=indexedDB.open(FILES_DB,1);
  rq.onupgradeneeded=()=>{rq.result.createObjectStore(FILES_STORE,{keyPath:'id'})};
  rq.onsuccess=()=>res(rq.result);
  rq.onerror=()=>rej(rq.error);
 });
 return _dbp;
}
async function fileStorePut(id,blob){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).put({id,blob});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function fileStoreGet(id){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readonly');let rq=tx.objectStore(FILES_STORE).get(id);rq.onsuccess=()=>res(rq.result?rq.result.blob:null);rq.onerror=()=>rej(rq.error)})}
async function fileStoreDelete(id){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).delete(id);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function fileStoreAll(){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readonly');let rq=tx.objectStore(FILES_STORE).getAll();rq.onsuccess=()=>res(rq.result||[]);rq.onerror=()=>rej(rq.error)})}
async function fileStoreClear(){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).clear();tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
function blobToBase64(blob){return new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob)})}
function base64ToBlob(dataUrl){return fetch(dataUrl).then(r=>r.blob())}
function svgBarChart(data,opts){
 opts=opts||{};
 if(!data.length||!data.some(d=>d.value>0))return '<div class="muted small">Пока нет данных для графика.</div>';
 let w=opts.width||320,h=opts.height||170,pad=30;
 let max=opts.maxValue||Math.max(1,...data.map(d=>d.value));
 let bw=(w-pad*2)/data.length;
 let bars=data.map((d,i)=>{
  let bh=max?Math.round((d.value/max)*(h-pad*2)):0;
  let bwid=bw*0.62,x=pad+i*bw+(bw-bwid)/2,y=h-pad-bh;
  let clickable=d.onclick&&d.value>0;
  return (clickable?'<g onclick="'+d.onclick+'" style="cursor:pointer">':'<g>')+
   (clickable?'<rect x="'+x.toFixed(1)+'" y="'+pad+'" width="'+bwid.toFixed(1)+'" height="'+(h-pad*2)+'" fill="transparent"><title>Показать подробности</title></rect>':'')+
   '<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+bwid.toFixed(1)+'" height="'+bh+'" fill="'+(d.color||'var(--accent)')+'" rx="4"></rect>'+
   '<text x="'+(x+bwid/2).toFixed(1)+'" y="'+(h-pad+16)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+e(d.label)+'</text>'+
   (d.value?'<text x="'+(x+bwid/2).toFixed(1)+'" y="'+(y-5)+'" text-anchor="middle" font-size="11" fill="var(--ink)">'+d.value+'</text>':'')+
   '</g>';
 }).join('');
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto"><line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" stroke="var(--border)"/>'+bars+'</svg>';
}
function svgLineChart(points,opts){
 opts=opts||{};
 if(points.length<2)return '<div class="muted small">Недостаточно данных для графика (нужно минимум 2 урока с оценками за выбранный период).</div>';
 let w=opts.width||520,h=opts.height||160,pad=28;
 let maxY=opts.maxY||5,minY=opts.minY||1;
 let n=points.length;
 let xStep=(w-pad*2)/(n-1);
 let scaleY=v=>h-pad-((v-minY)/((maxY-minY)||1))*(h-pad*2);
 let coords=points.map((p,i)=>[pad+i*xStep,scaleY(p.y)]);
 let path=coords.map((c,i)=>(i===0?'M':'L')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
 let strokeColor=opts.mono?'#111':'var(--accent)';
 let textColor=opts.mono?'#333':'var(--muted)';
 let dots=coords.map(c=>'<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="3.2" fill="'+strokeColor+'"></circle>').join('');
 let showLabels=n<=14;
 let labels=showLabels?points.map((p,i)=>'<text x="'+coords[i][0].toFixed(1)+'" y="'+(h-7)+'" font-size="9" text-anchor="middle" fill="'+textColor+'">'+e(p.label||'')+'</text>').join(''):'';
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto"><path d="'+path+'" fill="none" stroke="'+strokeColor+'" stroke-width="2.2"/>'+dots+labels+'</svg>';
}
function svgPrintTrendChart(points,opts){
 opts=opts||{};
 if(!points||points.length<2)return '<p class="muted">Недостаточно данных для графика (нужно минимум 2 урока с оценками).</p>';
 let w=opts.width||520,h=opts.height||150,pad=34;
 let maxY=5,minY=2;
 let n=points.length;
 let xStep=n>1?(w-pad*2)/(n-1):0;
 let scaleY=v=>h-pad-((Math.max(minY,Math.min(maxY,v))-minY)/(maxY-minY))*(h-pad*2);
 let coords=points.map((p,i)=>[pad+i*xStep,scaleY(p.y)]);
 let path=coords.map((c,i)=>(i===0?'M':'L')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
 let grid='';
 for(let v=2;v<=5;v++){
  let y=scaleY(v);
  grid+='<line x1="'+pad+'" y1="'+y.toFixed(1)+'" x2="'+(w-pad)+'" y2="'+y.toFixed(1)+'" stroke="#cccccc" stroke-width="1" stroke-dasharray="2,2"/>'+
   '<text x="'+(pad-8)+'" y="'+(y+3).toFixed(1)+'" font-size="10" text-anchor="end" fill="#555555">'+v+'</text>';
 }
 let dotsAndLabels=coords.map((c,i)=>
  '<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="4.5" fill="#000000" stroke="#ffffff" stroke-width="1.2"></circle>'+
  '<text x="'+c[0].toFixed(1)+'" y="'+(c[1]-9).toFixed(1)+'" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">'+e(String(points[i].y))+'</text>'
 ).join('');
 let showAxisLabels=n<=16;
 let axisLabels=showAxisLabels?points.map((p,i)=>'<text x="'+coords[i][0].toFixed(1)+'" y="'+(h-9)+'" font-size="9" text-anchor="middle" fill="#000000">'+e(p.label||'')+'</text>').join(''):'';
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto;background:#ffffff">'+grid+'<path d="'+path+'" fill="none" stroke="#000000" stroke-width="2.2"/>'+dotsAndLabels+axisLabels+'</svg>';
}
function donutChart(present,absent,size,onclick){
 size=size||110;
 let total=present+absent;
 let pct=total?Math.round(present/total*100):0;
 let deg=total?Math.round(present/total*360):0;
 let wrapAttrs=onclick?' onclick="'+onclick+'" style="cursor:pointer" title="Показать, кто и когда отсутствовал"':'';
 return '<div'+wrapAttrs+'><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'+
  '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:conic-gradient(var(--accent) '+deg+'deg, var(--border) 0deg);display:flex;align-items:center;justify-content:center;flex:0 0 auto">'+
  '<div style="width:'+Math.round(size*0.62)+'px;height:'+Math.round(size*0.62)+'px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-weight:700">'+(total?pct+'%':'—')+'</div></div>'+
  '<div class="small"><div><span class="dot" style="background:var(--accent)"></span>Присутствовали: '+present+'</div><div><span class="dot" style="background:var(--border)"></span>Отсутствовали: '+absent+'</div></div></div></div>';
}
function donutChartPct(pct,size,onclick){
 size=size||110;
 let deg=pct===null?0:Math.round(pct*3.6);
 let wrapAttrs=onclick?' onclick="'+onclick+'" style="cursor:pointer" title="Показать, кто и когда отсутствовал"':'';
 return '<div'+wrapAttrs+'><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'+
  '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:conic-gradient(var(--accent) '+deg+'deg, var(--border) 0deg);display:flex;align-items:center;justify-content:center;flex:0 0 auto">'+
  '<div style="width:'+Math.round(size*0.62)+'px;height:'+Math.round(size*0.62)+'px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-weight:700">'+(pct===null?'—':Math.round(pct*10)/10+'%')+'</div></div>'+
  '<div class="small muted">Средняя посещаемость по урокам</div></div></div>';
}
function avgAttendancePctPerLesson(ls){
 let pcts=[];
 ls.forEach(l=>{
  let vals=Object.values(l.attendance||{});
  if(vals.length){let present=vals.filter(v=>v!=='н').length;pcts.push(present/vals.length*100)}
 });
 return pcts.length?avg(pcts):null;
}
function gradeBarColor(v){
 let n=gradeNumericValue(v);
 if(n===null)return'#8a8aa3';
 return n>=4?'#2fa84f':n>=3?'#e8a800':'#e64c3c';
}
function gradeDistData(vals,scope,scopeId,from,to){
 let scale=(D.settings.gradeScale&&D.settings.gradeScale.length)?D.settings.gradeScale:GRADE_OPTIONS_DEFAULT;
 let counts={};
 vals.forEach(v=>{counts[v]=(counts[v]||0)+1});
 let mk=scope?(v=>"showGradeBreakdown('"+scope+"','"+(scopeId||'')+"','"+String(v).replace(/'/g,"\\'")+"','"+(from||'')+"','"+(to||'')+"')"):null;
 let bars=scale.map(v=>({label:v,value:counts[v]||0,color:gradeBarColor(v),onclick:mk?mk(v):null}));
 Object.keys(counts).forEach(v=>{if(!scale.includes(v))bars.push({label:v,value:counts[v],color:'#999',onclick:mk?mk(v):null})});
 return bars;
}
function gradeBreakdownRows(scope,scopeId,gradeValue,from,to){
 let ls=activeLessons().filter(l=>!l.cancelled&&(!from||l.date>=from)&&(!to||l.date<=to));
 if(scope==='class'){let gi=groupIds(scopeId);ls=ls.filter(l=>gi.includes(l.classId))}
 let rows=[];
 ls.forEach(l=>{
  Object.keys(l.grades||{}).forEach(sid=>{
   if(scope==='student'&&sid!==scopeId)return;
   let g=l.grades[sid];
   if(g&&g.value===gradeValue){
    rows.push({date:l.date,student:P(sid),cls:C(l.classId),topic:l.topic,comment:g.comment,lessonId:l.id});
   }
  });
 });
 rows.sort((a,b)=>b.date.localeCompare(a.date));
 return rows;
}
function showGradeBreakdown(scope,scopeId,gradeValue,from,to){
 let rows=gradeBreakdownRows(scope,scopeId,gradeValue,from,to);
 setModalHtml('Оценка «'+gradeValue+'» — кому и когда',
  rows.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Ученик</th><th>Урок</th><th>Коммент.</th></tr>'+
   rows.map(r=>'<tr class="click" onclick="closeModal();openLessonModal(\''+r.lessonId+'\')"><td>'+fmtDate(r.date)+'</td><td>'+e(r.cls?r.cls.name:'—')+'</td><td>'+(r.student?studentFio(r.student):'—')+'</td><td>'+e(r.topic||'(без темы)')+'</td><td class="muted">'+e(r.comment||'')+'</td></tr>').join('')+'</table>'
  :'<div class="empty">За выбранный период таких оценок не найдено.</div>');
}
function attendanceBreakdownRows(scope,scopeId,from,to){
 let ls=activeLessons().filter(l=>!l.cancelled&&(!from||l.date>=from)&&(!to||l.date<=to));
 if(scope==='class'){let gi=groupIds(scopeId);ls=ls.filter(l=>gi.includes(l.classId))}
 let rows=[];
 ls.forEach(l=>{
  Object.keys(l.attendance||{}).forEach(sid=>{
   if(scope==='student'&&sid!==scopeId)return;
   if(l.attendance[sid]==='н'){
    rows.push({date:l.date,student:P(sid),cls:C(l.classId),topic:l.topic,lessonId:l.id});
   }
  });
 });
 rows.sort((a,b)=>b.date.localeCompare(a.date));
 return rows;
}
function showAttendanceBreakdown(scope,scopeId,from,to){
 let rows=attendanceBreakdownRows(scope,scopeId,from,to);
 setModalHtml('Пропуски — кто и когда',
  rows.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Ученик</th><th>Урок</th></tr>'+
   rows.map(r=>'<tr class="click" onclick="closeModal();openLessonModal(\''+r.lessonId+'\')"><td>'+fmtDate(r.date)+'</td><td>'+e(r.cls?r.cls.name:'—')+'</td><td>'+(r.student?studentFio(r.student):'—')+'</td><td>'+e(r.topic||'(без темы)')+'</td></tr>').join('')+'</table>'
  :'<div class="empty">За выбранный период пропусков не найдено.</div>');
}
let S={view:'home',classId:null,studentId:null,tab:'lessons',q:'',weekStart:mondayOf(toISO(new Date())),
 sidebarCollapsed:false,studentSort:'fio',statsFilter:{period:'all',classId:'',studentId:'',from:'',to:'',sortClasses:'name',sortStudents:'fio'},
 lessonModal:null /* {id, mode:'view'|'edit', draft} */, materialsCategory:'',
 chartPeriods:{student:{period:'all',from:'',to:''},class:{period:'all',from:'',to:''}},
 recentFilter:{classId:'',status:'',sort:'date_desc',limit:10},
 workTab:'meetings',selectedStudentIds:new Set(),libraryClassFilter:'',
 reportsSelClasses:new Set(),reportsLessonDates:{},reportsFullPeriod:'all',reportsFullFrom:'',reportsFullTo:'',reportsPlanPeriod:'',reportsPlanFrom:'',reportsPlanTo:'',reportsPlanOpts:{num:true,topic:true,hw:true,plan:false,extra:false,cancelled:false},reportsComment:'',reportsIncludeHomeschool:true,classPrintIncludeHomeschool:true};
function resolvePeriodRange(periodKey,customFrom,customTo){
 let today=toISO(new Date());
 if(periodKey==='month')return{from:addDays(today,-30),to:today};
 if(periodKey==='custom')return{from:customFrom||'0000-01-01',to:customTo||'9999-12-31'};
 if(periodKey==='quarter_approx')return{from:addDays(today,-63),to:today};
 let q=(D.settings.quarters||[]).find(x=>x.id===periodKey);
 if(q)return{from:q.startDate,to:q.endDate};
 return{from:'0000-01-01',to:'9999-12-31'};
}
function periodOptionsList(){
 let opts=[['all','Весь период']];
 (D.settings.quarters||[]).forEach(q=>opts.push([q.id,q.name]));
 if(!(D.settings.quarters||[]).length)opts.push(['quarter_approx','Четверть (~9 нед., приблизительно)']);
 opts.push(['month','Месяц']);
 opts.push(['custom','Произвольный']);
 return opts;
}
function chartPeriodRange(scope){
 let cp=S.chartPeriods[scope];
 return resolvePeriodRange(cp.period,cp.from,cp.to);
}
function setChartPeriod(scope,period){S.chartPeriods[scope].period=period;render()}
function setChartCustomDate(scope,which,val){S.chartPeriods[scope][which]=val;render()}
function periodPickerHtml(scope){
 let cp=S.chartPeriods[scope];
 let opts=periodOptionsList();
 return '<div class="toolbar" style="margin-bottom:12px">'+
  opts.map(o=>'<button class="'+(cp.period===o[0]?'primary':'')+'" onclick="setChartPeriod(\''+scope+'\',\''+o[0]+'\')">'+e(o[1])+'</button>').join('')+
  (cp.period==='custom'?'<input type="date" value="'+e(cp.from)+'" onchange="setChartCustomDate(\''+scope+'\',\'from\',this.value)" style="width:150px;flex:0">&nbsp;–&nbsp;<input type="date" value="'+e(cp.to)+'" onchange="setChartCustomDate(\''+scope+'\',\'to\',this.value)" style="width:150px;flex:0">':'')+
  (!(D.settings.quarters||[]).length?'<div class="muted small" style="width:100%;margin-top:4px">Настройте точные границы четвертей в Настройки → Расписание, чтобы фильтровать по ним точно.</div>':'')+
  '</div>';
}
function accentInkFor(hex){
 let h=String(hex||'').replace('#','');
 if(h.length===3)h=h.split('').map(x=>x+x).join('');
 if(h.length!==6||!/^[0-9a-f]{6}$/i.test(h))return '';
 let r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
 let lum=(0.2126*r+0.7152*g+0.0722*b)/255;
 return lum>0.5?'#06080c':'#ffffff';
}
function applyTheme(){
 let isDark=D.settings.colorMode==='dark';
 let accent=isDark?'#5b8def':'#2c5fd0';
 document.documentElement.style.setProperty('--accent',accent);
 document.documentElement.style.setProperty('--accent2',accent);
 document.documentElement.style.setProperty('--accent-ink',accentInkFor(accent)||(isDark?'#06080c':'#ffffff'));
 document.documentElement.classList.toggle('dark',isDark);
 let themeMeta=document.querySelector('meta[name="theme-color"]');
 if(themeMeta)themeMeta.setAttribute('content',isDark?'#08090b':'#f5f7fa');
 document.documentElement.classList.toggle('compact',!!D.settings.compact);
 document.documentElement.style.setProperty('--font-family',FONT_FAMILIES[D.settings.fontFamily]||FONT_FAMILIES.system);
 document.documentElement.style.setProperty('--r',D.settings.radius===undefined?1:D.settings.radius);
 document.documentElement.classList.toggle('sidebar-gradient',D.settings.sidebarStyle==='gradient');
}
function setFont(v){D.settings.fontFamily=v;save();applyTheme()}
function setRadius(v){D.settings.radius=(+v);save();document.documentElement.style.setProperty('--r',D.settings.radius)}
function setSidebarStyle(v){D.settings.sidebarStyle=v;save();applyTheme()}
function assistantSettings(){if(!D.settings.assistant)D.settings.assistant={enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true};return D.settings.assistant}
let assistantTimer=null,assistantPos=null;
function initAssistant(){
 let a=assistantSettings();
 let wrap=document.getElementById('assistant-wrap');
 if(!a.enabled){wrap.classList.add('hidden');document.getElementById('assistant-toggle').classList.add('show');return}
 document.getElementById('assistant-toggle').classList.remove('show');
 wrap.classList.remove('hidden');
 wrap.classList.toggle('peeked',!!a.peeked);
 renderAssistantChar();
 if(assistantTimer)clearInterval(assistantTimer);
 assistantTimer=setInterval(assistantAutoTip,Math.max(3,a.freq||20)*60000);
}
function renderAssistantChar(collapsedBubble){
 let a=assistantSettings();
 let ch=ASSISTANT_CHARACTERS[a.character]||ASSISTANT_CHARACTERS.dog;
 let wrap=document.getElementById('assistant-wrap');
 wrap.classList.toggle('peeked',!!a.peeked);
 let charOnclick=a.peeked?'assistantUnpeek()':'assistantSpeak()';
 let charTitle=a.peeked?'Выглядывает — нажмите, чтобы показать снова':(e(ch.name)+' — нажмите за советом');
 wrap.innerHTML=(collapsedBubble?'<div class="assistant-bubble" id="assistant-bubble">'+collapsedBubble+'</div>':'')+
  '<div class="assistant-char" id="assistant-char" title="'+charTitle+'" onclick="'+charOnclick+'">'+ch.emoji+'</div>';
 makeAssistantDraggable();
}
function pickTip(){
 if(shouldShowBackupReminder())return{text:'🗄 Давно не было резервной копии. Загляните в раздел «Резервная копия», это займёт пару секунд.',kind:'tip'};
 let a=assistantSettings();
 let useMotivation=a.motivation!==false&&Math.random()<0.35;
 if(useMotivation)return{text:ASSISTANT_MOTIVATION[Math.floor(Math.random()*ASSISTANT_MOTIVATION.length)],kind:'motivation'};
 return{text:ASSISTANT_TIPS[Math.floor(Math.random()*ASSISTANT_TIPS.length)],kind:'tip'};
}
function assistantSpeak(forcedText,forcedKind){
 let a=assistantSettings();
 if(a.peeked){a.peeked=false;save()}
 let picked=forcedText?{text:forcedText,kind:forcedKind||'tip'}:pickTip();
 let text=picked.text,kind=picked.kind;
 let ch=ASSISTANT_CHARACTERS[a.character]||ASSISTANT_CHARACTERS.dog;
 let wrap=document.getElementById('assistant-wrap');
 wrap.classList.remove('peeked');
 wrap.classList.toggle('assistant-motivation',kind==='motivation');
 let label=kind==='motivation'?'💛 '+e(ch.name):e(ch.name);
 wrap.innerHTML='<div class="assistant-bubble" id="assistant-bubble"><b>'+label+'</b><br>'+e(text)+
  '<div class="abtn-row"><button onclick="assistantSpeak()">Другой совет</button><button onclick="assistantMotivate()">💛 Поддержка</button><button onclick="assistantHideBubble()">Спасибо!</button></div>'+
  '<div class="abtn-row"><button onclick="assistantPeek()">🫥 Спрятать частично</button><button onclick="assistantHide()">Отключить</button><button onclick="assistantShowSettings()">⚙</button></div></div>'+
  '<div class="assistant-char talk" id="assistant-char" title="Нажмите за советом" onclick="assistantSpeak()">'+ch.emoji+'</div>';
 makeAssistantDraggable();
 a.lastTipAt=toISO(new Date());save();
}
function assistantMotivate(){assistantSpeak(ASSISTANT_MOTIVATION[Math.floor(Math.random()*ASSISTANT_MOTIVATION.length)],'motivation')}
function assistantHideBubble(){renderAssistantChar()}
function assistantAutoTip(){
 let a=assistantSettings();
 if(!a.enabled||a.peeked)return;
 assistantSpeak();
}
function assistantHide(){D.settings.assistant.enabled=false;save();initAssistant()}
function assistantShow(){D.settings.assistant.enabled=true;D.settings.assistant.peeked=false;save();initAssistant();assistantSpeak('Я снова здесь! Чем могу помочь?')}
function assistantPeek(){let a=assistantSettings();a.peeked=true;save();renderAssistantChar()}
function assistantUnpeek(){let a=assistantSettings();a.peeked=false;save();assistantSpeak('Я тут, если понадоблюсь!')}
function assistantShowSettings(){S.view='settings';S.settingsTab='appearance';render()}
function makeAssistantDraggable(){
 let el=document.getElementById('assistant-char');
 if(!el)return;
 let wrap=document.getElementById('assistant-wrap');
 let dragging=false,startX,startY,origRight,origBottom;
 el.onmousedown=function(ev){
  ev.preventDefault();dragging=true;
  let r=wrap.getBoundingClientRect();
  startX=ev.clientX;startY=ev.clientY;
  origRight=window.innerWidth-r.right;origBottom=window.innerHeight-r.bottom;
  document.onmousemove=function(ev2){
   if(!dragging)return;
   let dx=ev2.clientX-startX,dy=ev2.clientY-startY;
   wrap.style.right=Math.max(4,origRight-dx)+'px';
   wrap.style.bottom=Math.max(4,origBottom-dy)+'px';
  };
  document.onmouseup=function(){dragging=false;document.onmousemove=null;document.onmouseup=null};
 };
}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function shouldShowBackupReminder(){
 let today=toISO(new Date());
 let last=D.settings.lastBackupAt;
 let daysSinceBackup=last?daysBetween(last,today):Infinity;
 if(daysSinceBackup<7)return false;
 let lastShown=D.settings.backupReminder&&D.settings.backupReminder.lastShown;
 let daysSinceShown=lastShown?daysBetween(lastShown,today):Infinity;
 return daysSinceShown>=7;
}
function dismissBackupReminder(){D.settings.backupReminder={lastShown:toISO(new Date())};save();render()}
function backupReminderBanner(){
 if(!shouldShowBackupReminder())return'';
 let last=D.settings.lastBackupAt;
 return '<div class="notice" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 12px;flex-wrap:nowrap">'+
  '<span style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📦 '+(last?'Копия от '+fmtDate(last)+' — пора обновить':'Резервная копия ещё не создавалась')+'</span>'+
  '<span style="display:flex;gap:6px;flex:0 0 auto;white-space:nowrap"><button class="primary" style="padding:5px 10px;font-size:12px" onclick="goto(\'backup\')">Сделать копию</button><button style="padding:5px 10px;font-size:12px" onclick="dismissBackupReminder()">Позже</button></span></div>';
}
function render(){
 applyTheme();
 document.getElementById('app').innerHTML=
  '<aside class="side'+(S.sidebarCollapsed?' collapsed':'')+'">'+
   '<div class="brand"><span class="brand-text">Дневник учителя</span>'+
    '<span style="display:flex;gap:4px">'+
     '<button class="collapse-btn theme-btn" onclick="toggleColorMode()" title="Сменить тему" aria-label="Сменить тему"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6"/></svg></button>'+
     '<button class="collapse-btn" onclick="toggleSidebar()" title="Свернуть/развернуть">'+(S.sidebarCollapsed?'»':'«')+'</button>'+
    '</span></div>'+
   navBtn('home','⌂','Главная')+
   /* navBtn('fullschedule','📅','Расписание')+ — временно скрыто по просьбе пользователя, страница fullSchedulePage() и логика сохранены в коде */
   navBtn('students','◎','Ученики')+
   navBtn('search','⌕','Поиск')+
   navBtn('stats','▤','Статистика')+
   navBtn('reports','⎙','Ведомости')+
   navBtn('materials','⊞','Материалы')+
   navBtn('library','▦','Библиотека уроков')+
   navBtn('announcements','◇','Объявления')+
   navBtn('work','▣','Работа')+
   navBtn('settings','⚙','Настройки')+
   navBtn('backup','↓','Резервная копия')+
   '<div class="classes"><div class="classes-head"><span class="label">Классы</span><button onclick="openNewClass(\'class\')">＋</button></div>'+
   '<div class="classlist">'+sortedClasses(D.classes.filter(c=>c.type!=='club')).map(c=>'<div class="classrow"><button class="label" onclick="openClass(\''+c.id+'\')">'+e(c.name)+'</button><button class="label" onclick="event.stopPropagation();openEditClass(\''+c.id+'\')">⋯</button></div>').join('')+
   (D.classes.filter(c=>c.type!=='club').length?'':'<div class="small muted label" style="padding:6px 8px">Классов пока нет</div>')+
   '</div></div>'+
   '<div class="classes"><div class="classes-head"><span class="label">Кружки / секции</span><button onclick="openNewClass(\'club\')">＋</button></div>'+
   '<div class="classlist">'+clubsSidebarHtml()+'</div></div>'+
  '</aside><main class="main">'+page()+'</main>';
 initAutosize();
 if(S.lessonModal)renderLessonModal();
 if(S.view==='home')startClockTicker();
 else if(window._clockInterval){clearInterval(window._clockInterval);window._clockInterval=null}
 if(S.view==='work'&&S.workTab==='colleagues')initColumnResize('colleagues-table','colleagueColWidths');
}
function navBtn(view,icon,label){return '<button class="nav'+(S.view===view?' active':'')+'" onclick="goto(\''+view+'\')"><span class="nav-ico" aria-hidden="true">'+icon+'</span> <span class="label">'+label+'</span></button>'}
function toggleColorMode(){setColorMode(D.settings.colorMode==='dark'?'light':'dark')}
function toggleSidebar(){S.sidebarCollapsed=!S.sidebarCollapsed;render()}
function goto(v){S.view=v;render()}
function page(){
 if(S.view==='students')return studentsPage();
 if(S.view==='student')return studentPage();
 if(S.view==='class')return classPage();
 if(S.view==='search')return searchPage();
 if(S.view==='stats')return statsPage();
 if(S.view==='reports')return reportsPage();
 if(S.view==='materials')return materialsPage();
 if(S.view==='library')return lessonLibraryPage();
 if(S.view==='announcements')return announcementsPage();
 if(S.view==='fullschedule')return fullSchedulePage();
 if(S.view==='work')return workPage();
 if(S.view==='settings')return settingsPage();
 if(S.view==='backup')return backupPage();
 return homePage();
}
function stat(n,t){return '<div class="card"><div class="stat">'+n+'</div><div class="muted small">'+t+'</div></div>'}
function initAutosize(){
 document.querySelectorAll('textarea.autosize').forEach(t=>{
  t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px';
  t.oninput=()=>{t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px'};
 });
}
function lessonHasOccurred(l){
 let todayStr=toISO(new Date());
 if(l.date<todayStr)return true;
 if(l.date>todayStr)return false;
 let endMin=timeToMin(l.endTime);
 if(endMin===null)return true;
 let now=new Date();
 return (now.getHours()*60+now.getMinutes())>=endMin;
}
function lessonStatus(l){
 if(l.cancelled)return'cancelled';
 if(l.manualStatus)return l.manualStatus;
 if(l.manuallyCompleted)return'green';
 let plan=(l.customFields&&l.customFields.planText||'').trim();
 if(plan)return'blue';
 return'red';
}
function lessonHasActivity(l){return lessonStatus(l)!=='red'||Object.keys(l.attendance||{}).length||Object.keys(l.grades||{}).length}
function statusLabel(s){return s==='green'?'Заполнен':s==='yellow'?'Частично подготовлен':s==='blue'?'Подготовлен':s==='cancelled'?'Отменён':'Не подготовлен'}
function setLessonManualStatus(id,val){
 let l=L(id);if(!l)return;
 l.manualStatus=val||null;
 if(val==='green')l.manuallyCompleted=true;else if(l.manuallyCompleted&&val!=='green')l.manuallyCompleted=false;
 save();
 if(S.lessonModal)renderModalOnly();else render();
}
function lessonStatusPicker(l){
 return '<select onchange="setLessonManualStatus(\''+l.id+'\',this.value)" style="width:auto;display:inline-block;font-weight:600">'+
  '<option value=""'+(!l.manualStatus?' selected':'')+'>Авто (по плану)</option>'+
  '<option value="red"'+(l.manualStatus==='red'?' selected':'')+'>🔴 Не подготовлено</option>'+
  '<option value="yellow"'+(l.manualStatus==='yellow'?' selected':'')+'>🟡 Частично подготовлено</option>'+
  '<option value="blue"'+(l.manualStatus==='blue'?' selected':'')+'>🔵 Подготовлено</option>'+
  '<option value="green"'+(l.manualStatus==='green'?' selected':'')+'>🟢 Заполнено</option>'+
  '</select>';
}
function findBlock(dateStr,lessonNumber){
 return D.scheduleBlocks.find(b=>{
  if(dateStr<b.startDate||dateStr>b.endDate)return false;
  if(!b.lessonNumbers||!b.lessonNumbers.length)return true;
  return lessonNumber&&b.lessonNumbers.includes(+lessonNumber);
 })||null;
}
function checkNotBlocked(dateStr,lessonNumber){
 let b=findBlock(dateStr,lessonNumber);
 if(b){alert('Нельзя создать урок в это время. Этот период заблокирован: «'+b.reason+'».');return false}
 return true;
}
const LESSON_KNOWN_KEYS=['planText','stages','homework','doneWhat','notDone','workedWell','difficult','notes'];
function openLessonModal(id){S.lessonModal={id,mode:'view',draft:null};renderModalOnly()}
function quickCreateLesson(date,n){
 if(!D.classes.length){alert('Сначала создайте класс.');return}
 if(!checkNotBlocked(date,n))return;
 openQuickPicker(date,n);
}
function openQuickPicker(date,n){
 let t=timeFor(n);
 let opts=sortedClasses(D.classes.filter(c=>c.type!=='club')).map(c=>'<option value="'+c.id+'">'+e(c.name)+'</option>').join('');
 setModalHtml('Новый урок','<div class="notice">'+fmtDate(date)+' · '+DAY_NAMES[dayIndexOfDate(date)]+' · '+n+'-й урок ('+t.start+'–'+t.end+')</div>'+
  (opts?'<label>Класс</label><select id="qc-class">'+opts+'</select>':'<div class="notice">У вас нет классов (кружки создаются через «＋ Новый урок» — у них свободное время, не привязанное к сетке).</div>')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="quickCreateConfirm(\''+date+'\','+n+')" '+(opts?'':'disabled')+'>Создать</button><button onclick="closeModal()">Отмена</button></div>');
}
function quickCreateConfirm(date,n){
 let classId=document.getElementById('qc-class').value;
 let t=timeFor(n);
 let l={id:uid(),date,lessonNumber:n,startTime:t.start,endTime:t.end,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]};
 D.lessons.push(l);save();closeModal();openLessonModal(l.id);
}
function openNewLesson(presetClassId){
 if(!D.classes.length){alert('Сначала создайте класс.');return}
 let today=toISO(new Date());
 let selClass=presetClassId?C(presetClassId):D.classes[0];
 let isClub=selClass&&selClass.type==='club';
 setModalHtml('Новый урок',
  '<label>Дата</label><input id="nl-date" type="date" value="'+today+'">'+
  '<label>Класс</label><select id="nl-class" onchange="toggleNewLessonFields()">'+classOptionsHtml(presetClassId)+'</select>'+
  '<div id="nl-period-block" style="display:'+(isClub?'none':'block')+'">'+
   '<label>№ урока</label><select id="nl-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'">'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select>'+
   '<label>Время (можно изменить)</label><div class="row"><input id="nl-start" value="'+LESSON_TIMES[0].start+'"><input id="nl-end" value="'+LESSON_TIMES[0].end+'"></div>'+
  '</div>'+
  '<div id="nl-freetime-block" style="display:'+(isClub?'block':'none')+'">'+
   '<div class="notice">Это кружок/секция — время не привязано к сетке уроков.</div>'+
   '<label>Время начала</label><input id="nl-free-start" placeholder="15:00">'+
   '<label>Время окончания</label><input id="nl-free-end" placeholder="16:00">'+
  '</div>'+
  '<label>Тема (необязательно)</label><input id="nl-topic">'+
  '<label>План урока</label><textarea id="nl-plan" class="autosize"></textarea>'+
  '<label>Запланированные этапы</label><textarea id="nl-stages" class="autosize"></textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="createLessonFull()">Создать</button><button onclick="closeModal()">Отмена</button></div>');
 document.getElementById('nl-num').onchange=e2=>{let t=timeFor(e2.target.value);document.getElementById('nl-start').value=t.start;document.getElementById('nl-end').value=t.end};
 initAutosize();
}
function toggleNewLessonFields(){
 let cid=document.getElementById('nl-class').value;
 let cls=C(cid);
 let isClub=cls&&cls.type==='club';
 document.getElementById('nl-period-block').style.display=isClub?'none':'block';
 document.getElementById('nl-freetime-block').style.display=isClub?'block':'none';
}
function createLessonFull(){
 let date=document.getElementById('nl-date').value,classId=document.getElementById('nl-class').value;
 if(!date||!classId){alert('Заполните дату и класс.');return}
 let cls=C(classId);
 let isClub=cls&&cls.type==='club';
 let lessonNumber=null,startTime='',endTime='';
 if(isClub){
  startTime=document.getElementById('nl-free-start').value.trim();
  endTime=document.getElementById('nl-free-end').value.trim();
  if(!startTime){alert('Укажите время начала.');return}
  if(!checkNotBlocked(date,null))return;
 }else{
  let num=document.getElementById('nl-num').value;
  if(!num){alert('Укажите номер урока.');return}
  if(!checkNotBlocked(date,num))return;
  lessonNumber=+num;
  startTime=document.getElementById('nl-start').value;endTime=document.getElementById('nl-end').value;
 }
 let l={id:uid(),date,lessonNumber,startTime,endTime,
  classId,topic:document.getElementById('nl-topic').value.trim(),
  customFields:{planText:document.getElementById('nl-plan').value,stages:document.getElementById('nl-stages').value},
  attendance:{},grades:{},materialIds:[]};
 D.lessons.push(l);save();closeModal();openLessonModal(l.id);
}
function setModalHtml(title,body,wide){
 document.getElementById('modal').innerHTML='<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal'+(wide?' wide':'')+'"><div class="top"><h2>'+title+'</h2><button class="closebtn" onclick="closeModal()">×</button></div>'+body+'</div></div>';
}
function closeModal(){S.lessonModal=null;document.getElementById('modal').innerHTML=''}
function renderModalOnly(){
 document.getElementById('modal').innerHTML='';
 renderLessonModal();
}
function renderLessonModal(){
 if(!S.lessonModal)return;
 let l=L(S.lessonModal.id);
 if(!l){S.lessonModal=null;return}
 let cls=C(l.classId);
 let title=e(l.topic||'Урок без темы');
 let sub=e(cls?cls.name:'—')+' · '+fmtDate(l.date)+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+(l.startTime?' · '+l.startTime+'–'+l.endTime:'');
 let body=S.lessonModal.mode==='edit'?lessonEditBody(l):lessonViewBody(l);
 document.getElementById('modal').innerHTML='<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal wide">'+
  '<div class="top"><div><h2>'+title+'</h2><div class="muted small">'+sub+'</div></div><button class="closebtn" onclick="closeModal()">×</button></div>'+
  body+'</div></div>';
 initAutosize();
}
function lessonField(l,key){return (l.customFields&&l.customFields[key])||''}
function fLabel(entity,key,fallback){let f=fieldByKey(entity,key);return f?e(f.label):fallback}
function lessonViewBody(l){
 let st=lessonStatus(l);
 let ps=people(l.classId);
 let att=l.attendance||{},grades=l.grades||{};
 let hasAttendance=Object.keys(att).length>0;
 let occurred=lessonHasOccurred(l);
 let prep=section(fLabel('lesson','planText','План урока'),lessonField(l,'planText'))+section(fLabel('lesson','stages','Запланированные этапы'),lessonField(l,'stages'));
 let attHtml=(hasAttendance||occurred)?'<div class="checks">'+ps.map(s=>{let v=att[s.id];if(v===undefined){if(!occurred)return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge">—</span></div>';v='+'}return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge '+(v==='н'?'red':'green')+'">'+v+'</span></div>'}).join('')+'</div>':'<div class="muted small">Посещаемость ещё не отмечена.</div>';
 let gradesHtml=Object.keys(grades).length?'<table class="table">'+ps.filter(s=>grades[s.id]).map(s=>'<tr><td>'+studentFio(s)+'</td><td>'+gradeViewHtml(grades[s.id])+'</td><td class="muted">'+e(grades[s.id].comment||'')+'</td></tr>').join('')+'</table>':'<div class="muted small">Оценок пока нет.</div>';
 let behaviorNotes=l.behaviorNotes||{};
 let behaviorViewHtml=Object.keys(behaviorNotes).length?'<table class="table">'+ps.filter(s=>behaviorNotes[s.id]).map(s=>'<tr><td>'+studentFio(s)+'</td><td>'+e(behaviorNotes[s.id])+'</td></tr>').join('')+'</table>':'<div class="muted small">Заметок о поведении пока нет.</div>';
 let homeworkVal=lessonField(l,'homework');
 let results=section(fLabel('lesson','doneWhat','Что успели'),lessonField(l,'doneWhat'))+
  section(fLabel('lesson','notDone','Что не успели'),lessonField(l,'notDone'))+
  section(fLabel('lesson','workedWell','Что сработало лучше'),lessonField(l,'workedWell'))+
  section(fLabel('lesson','difficult','Что было сложным'),lessonField(l,'difficult'))+
  section(fLabel('lesson','notes','Заметки'),lessonField(l,'notes'))+
  extraLessonFieldsView(l);
 return '<div style="margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+statusBadge(l)+lessonStatusPicker(l)+(l.flagPractice?' <span class="badge blue">🧪 Практическая работа</span>':'')+(l.flagTest?' <span class="badge red">📝 Контрольная/проверочная</span>':'')+'</div>'+
  (l.announcementText?'<div class="notice" style="background:#eef2ff;border-color:#5b6fe6;color:#2a3499;font-weight:600;margin-bottom:10px">📣 '+richTextView(l.announcementText)+'</div>':'')+
  '<div class="field-view">'+
  (prep?detailsBlock('Подготовка к уроку',prep,false):'')+
  (homeworkVal?detailsBlock(fLabel('lesson','homework','Домашнее задание'),richTextView(homeworkVal),true):'')+
  detailsBlock('Посещаемость',attHtml,false)+
  detailsBlock('Оценки',gradesHtml,false)+
  detailsBlock('Заметки о поведении',behaviorViewHtml,false)+
  (results?detailsBlock('Итоги урока',results,false):'')+
  detailsBlock('Материалы',lessonMaterialsView(l),false)+
  '</div>'+
  '<div class="toolbar" style="margin-top:16px"><button onclick="startLessonPresent(\''+l.id+'\')">▶ Начать урок</button><button onclick="startEditLesson()">Редактировать</button><button onclick="openPrintLessonOptions(\''+l.id+'\')">🖨 Печать</button><button onclick="copyLessonResultsText(\''+l.id+'\')">📋 Копировать результаты</button><button onclick="openDuplicateLesson(\''+l.id+'\')">⧉ Дублировать</button>'+(l.cancelled?'<button onclick="restoreCancelledLesson(\''+l.id+'\')">↩ Урок всё же состоялся</button>':'<button onclick="cancelLesson(\''+l.id+'\')">🚫 Урок отменён</button>')+'<button class="danger" onclick="archiveLessonConfirm(\''+l.id+'\')">🗄 Архивировать урок</button></div>';
}
function sCard(title,bodyHtml,open,sub){
 return '<details class="card collapsible"'+(open?' open':'')+'><summary><h2>'+title+(sub?'<span class="sc-sub">'+sub+'</span>':'')+'</h2></summary><div class="cbody">'+bodyHtml+'</div></details>';
}
function detailsBlock(label,contentHtml,open){
 if(!contentHtml)return'';
 return '<details class="dblock"'+(open?' open':'')+'><summary>'+e(label)+'</summary><div class="dbody">'+contentHtml+'</div></details>';
}
function section(label,val){if(!val)return'';return '<h3>'+label+'</h3><div class="val">'+richTextView(val)+'</div>'}
function extraLessonFieldsView(l){
 let extra=D.settings.fields.lesson.filter(f=>f.visible&&!LESSON_KNOWN_KEYS.includes(f.key));
 return extra.map(f=>section(e(f.label),customFieldView(f,lessonField(l,f.key)))).join('');
}
function lessonMaterialsView(l){
 let ids=l.materialIds||[];
 if(!ids.length)return '<div class="muted small">Материалы не прикреплены.</div>';
 return '<div class="materials-list">'+ids.map(mid=>{let m=M(mid);if(!m)return'';return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+'</span><button onclick="openMaterial(\''+m.id+'\')">Открыть</button></div>'}).join('')+'</div>';
}
function matIcon(name){let ext=(name.split('.').pop()||'').toLowerCase();if(['png','jpg','jpeg','gif','webp'].includes(ext))return'🖼';if(['doc','docx'].includes(ext))return'📄';if(['ppt','pptx'].includes(ext))return'📊';if(ext==='pdf')return'📕';return'📎'}
function matIconOf(m){return m.isLink?'🔗':matIcon(m.filename)}
function startEditLesson(){
 let l=L(S.lessonModal.id);
 S.lessonModal.mode='edit';
 S.lessonModal.draft=JSON.parse(JSON.stringify(l));
 renderModalOnly();
}
function gradeInputHtml(domId,current,extraAttrs){
 extraAttrs=extraAttrs||'';
 let listId=domId+'-list';
 let scale=(D.settings.gradeScale&&D.settings.gradeScale.length)?D.settings.gradeScale:GRADE_OPTIONS_DEFAULT;
 return '<input list="'+listId+'" id="'+domId+'" '+extraAttrs+' value="'+e(current||'')+'" placeholder="5" style="width:70px;flex:0 0 70px">'+
  '<datalist id="'+listId+'">'+scale.map(v=>'<option value="'+e(v)+'">').join('')+'</datalist>';
}
function commentInputHtml(domId,current,extraAttrs){
 extraAttrs=extraAttrs||'';
 let listId=domId+'-list';
 let tpls=D.settings.gradeCommentTemplates||GRADE_COMMENT_TEMPLATES_DEFAULT;
 return '<input list="'+listId+'" id="'+domId+'" '+extraAttrs+' value="'+e(current||'')+'" placeholder="Комментарий">'+
  '<datalist id="'+listId+'">'+tpls.map(v=>'<option value="'+e(v)+'">').join('')+'</datalist>';
}
function gradeNumericValue(v){
 if(v===undefined||v===null||v==='')return null;
 if(v==='долг')return null;
 let s=String(v);
 if(s.includes('/')){let p=s.split('/').map(Number);if(p.length===2&&!isNaN(p[0])&&!isNaN(p[1]))return(p[0]+p[1])/2}
 let n=+s;return isNaN(n)?null:n;
}
function parsePts(v){let n=parseFloat(String(v==null?'':v).replace(',','.').trim());return isNaN(n)||n<0?null:n}
function fmtPts(n){return String(Math.round(+n*100)/100).replace('.',',')}
function gradePointsText(g){
 if(!g||g.points==null||g.points==='')return '';
 return fmtPts(g.points)+(g.max?'/'+fmtPts(g.max):' б.');
}
function gradeText(g){
 if(!g)return '';
 let t=(g.value!==undefined&&g.value!==null)?String(g.value):'';
 let pt=gradePointsText(g);
 return pt?(t?t+' ('+pt+')':pt):t;
}
function gradeViewHtml(g){
 let pt=gradePointsText(g);
 return '<b>'+e(g.value||'')+'</b>'+(pt?(g.value?' <span class="muted small">'+e(pt)+'</span>':'<b>'+e(pt)+'</b>'):'');
}
function buildGrade(value,comment,pointsRaw,maxRaw){
 let g={value:value,comment:comment};
 let pt=parsePts(pointsRaw);
 if(pt!==null){g.points=pt;let m=parsePts(maxRaw);if(m)g.max=m}
 return g;
}
function readGradesFromForm(classId,keepCommentOnly){
 let out={};
 let mEl=document.getElementById('le-gmax');
 let max=mEl?mEl.value:'';
 people(classId).forEach(st=>{
  let gi=document.querySelector('[data-g="'+st.id+'"]');
  if(!gi)return;
  let v=gi.value.trim();
  let c=((document.querySelector('[data-c="'+st.id+'"]')||{}).value||'').trim();
  let pi=document.querySelector('[data-p="'+st.id+'"]');
  let pts=pi?pi.value:'';
  if(v||parsePts(pts)!==null)out[st.id]=buildGrade(v,c,pts,max);
  else if(keepCommentOnly&&c)out[st.id]={value:'',comment:c};
 });
 return out;
}
function readGradeMaxToDraft(d){
 let mEl=document.getElementById('le-gmax');if(!mEl)return;
 let m=parsePts(mEl.value);
 if(m)d.gradeMax=m;else delete d.gradeMax;
}
function applyBulkComment(){
 let inp=document.getElementById('le-bulk');
 let txt=inp?inp.value.trim():'';
 if(!txt){alert('Сначала впишите общий комментарий к работе.');return}
 let over=document.getElementById('le-bulk-over');over=over&&over.checked;
 let n=0;
 document.querySelectorAll('[data-c]').forEach(c=>{if(over||!c.value.trim()){c.value=txt;n++}});
 let note=document.getElementById('le-bulk-note');
 if(note)note.textContent='Комментарий проставлен: '+n+' уч. Он сохранится у тех, кому вы поставите оценку или баллы.';
}
function checkPointsInput(inp){
 let mEl=document.getElementById('le-gmax');
 let max=mEl?parsePts(mEl.value):null,pt=parsePts(inp.value);
 inp.style.borderColor=(max&&pt!==null&&pt>max)?'#c0392b':'';
}
function updateGradeMaxLabels(){
 let mEl=document.getElementById('le-gmax');
 let max=mEl?parsePts(mEl.value):null;
 document.querySelectorAll('.gmax-lbl').forEach(el=>el.textContent=max?'/ '+fmtPts(max):'');
 document.querySelectorAll('[data-p]').forEach(checkPointsInput);
}
function lessonEditBody(l){
 let d=S.lessonModal.draft;
 let ps=attendablePeople(d.classId);
 let att=d.attendance||{};
 let grades=d.grades||{};
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let isClub=C(d.classId)&&C(d.classId).type==='club';
 let occurred=lessonHasOccurred(d);
 let attHtml='<div class="checks">'+ps.map(s=>{let v=att[s.id];if(v===undefined&&!occurred)return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge" title="Урок ещё не проведён">—</span></div>';v=v||'+';return '<div class="attrow"><span>'+studentFio(s)+'</span><button type="button" class="attbtn '+(v==='н'?'absent':'present')+'" data-att="'+s.id+'" onclick="toggleAttBtn(this)">'+v+'</button></div>'}).join('')+'</div>';
 let gmaxVal=d.gradeMax!=null?d.gradeMax:((Object.values(grades).find(x=>x&&x.max)||{}).max||'');
 let gradesHtml='<div class="gbulk"><div class="small muted" style="margin-bottom:4px">Работа целиком — общие параметры для всех учеников</div>'+
  '<label style="margin-top:0">Общий комментарий к работе</label>'+commentInputHtml('le-bulk','','placeholder="Напр.: Контрольная № 3 «Дроби»"')+
  '<div class="row" style="margin-top:6px"><button type="button" onclick="applyBulkComment()">Применить ко всем</button><label class="attrow" style="cursor:pointer;margin:0;gap:8px"><span class="small">заменять уже заполненные</span><input type="checkbox" id="le-bulk-over" style="width:auto"></label></div>'+
  '<div id="le-bulk-note" class="small muted" style="margin-top:4px"></div>'+
  '<label>Максимум баллов за работу</label><input id="le-gmax" inputmode="decimal" value="'+e(gmaxVal===''?'':fmtPts(gmaxVal))+'" placeholder="Напр. 20" style="max-width:140px" oninput="updateGradeMaxLabels()"></div>'+
  '<div class="grades ghead"><span>Ученик</span><span>Оценка</span><span>Баллы</span><span>Комментарий</span></div>'+
  ps.map(s=>{let g=grades[s.id]||{};return '<div class="grades"><span>'+studentFio(s)+'</span>'+gradeInputHtml('g_'+s.id,g.value,'data-g="'+s.id+'"')+
   '<div class="ptcell"><input inputmode="decimal" data-p="'+s.id+'" value="'+(g.points!=null?e(fmtPts(g.points)):'')+'" placeholder="баллы" oninput="checkPointsInput(this)"><span class="small muted gmax-lbl">'+(gmaxVal!==''?'/ '+e(fmtPts(gmaxVal)):'')+'</span></div>'+
   commentInputHtml('c_'+s.id,g.comment,'data-c="'+s.id+'"')+'</div>'}).join('');
 let behaviorNotes=d.behaviorNotes||{};
 let behaviorHtml='<div class="checks">'+ps.map(s=>'<div class="attrow"><span>'+studentFio(s)+'</span><input type="text" data-bn="'+s.id+'" value="'+e(behaviorNotes[s.id]||'')+'" placeholder="Не влияет на оценку" style="max-width:240px"></div>').join('')+'</div>';
 return '<label>Дата</label><input id="le-date" type="date" value="'+e(d.date)+'">'+
  '<label>Класс</label><select id="le-class" onchange="toggleLessonEditFields()">'+classOptionsHtml(d.classId)+'</select>'+
  '<div id="le-period-block" style="display:'+(isClub?'none':'block')+'"><label>№ урока</label><select id="le-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'"'+(+d.lessonNumber===t.n?' selected':'')+'>'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select></div>'+
  '<label>Время</label><div class="row"><input id="le-start" value="'+e(d.startTime||'')+'"><input id="le-end" value="'+e(d.endTime||'')+'"></div>'+
  (isClub?'<div class="muted small" style="margin-top:-8px;margin-bottom:8px">Кружок/секция — время свободное, не привязано к сетке уроков.</div>':'')+
  '<label>Тема</label><input id="le-topic" value="'+e(d.topic)+'">'+
  '<label style="display:flex;align-items:center;gap:6px;margin-top:12px"><input type="checkbox" id="le-practice" '+(d.flagPractice?'checked':'')+' style="width:auto"> 🧪 Практическая работа</label>'+
  '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="le-test" '+(d.flagTest?'checked':'')+' style="width:auto"> 📝 Контрольная / проверочная работа</label>'+
  (D.lessonTemplates.length?'<label>Применить шаблон</label><select onchange="if(this.value){syncDraftFromForm();applyTemplateToDraft(this.value)};this.value=\'\'"><option value="">— выбрать шаблон —</option>'+D.lessonTemplates.map(t=>'<option value="'+t.id+'">'+e(t.name)+'</option>').join('')+'</select>':'')+
  lf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('lf_'+f.key,f,d.customFields[f.key])).join('')+
  detailsBlock('Посещаемость',attHtml,true)+
  detailsBlock('Оценки',gradesHtml,true)+
  detailsBlock('Материалы',lessonMaterialsEdit(d),true)+
  '<div class="toolbar" style="margin-top:16px"><button class="primary" onclick="saveLessonEdit()">Сохранить</button><button onclick="cancelEditLesson()">Отмена</button></div>';
}
function toggleLessonEditFields(){
 let cid=document.getElementById('le-class').value;
 let isClub=C(cid)&&C(cid).type==='club';
 document.getElementById('le-period-block').style.display=isClub?'none':'block';
}
function toggleAttBtn(btn){let v=btn.textContent.trim();let nv=v==='н'?'+':'н';btn.textContent=nv;btn.className='attbtn '+(nv==='н'?'absent':'present')}
function syncDraftFromForm(){
 let d=S.lessonModal&&S.lessonModal.draft;if(!d)return;
 let el;
 if(el=document.getElementById('le-date'))d.date=el.value;
 if(el=document.getElementById('le-class'))d.classId=el.value;
 if(el=document.getElementById('le-num'))d.lessonNumber=(C(d.classId)&&C(d.classId).type==='club')?null:+el.value;
 if(el=document.getElementById('le-start'))d.startTime=el.value;
 if(el=document.getElementById('le-end'))d.endTime=el.value;
 if(el=document.getElementById('le-topic'))d.topic=el.value;
 if(el=document.getElementById('le-practice'))d.flagPractice=el.checked;
 if(el=document.getElementById('le-test'))d.flagTest=el.checked;
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let e2=document.getElementById('lf_'+f.key);if(e2)d.customFields[f.key]=readFieldValue(f,e2)});
 let attendance={};document.querySelectorAll('[data-att]').forEach(b=>{attendance[b.dataset.att]=b.textContent.trim()});
 if(Object.keys(attendance).length)d.attendance=attendance;
 d.grades=readGradesFromForm(d.classId,true);readGradeMaxToDraft(d);
 let behaviorNotes={};document.querySelectorAll('[data-bn]').forEach(inp=>{let v=inp.value.trim();if(v)behaviorNotes[inp.dataset.bn]=v});
 if(Object.keys(behaviorNotes).length)d.behaviorNotes=behaviorNotes;
}
function lessonMaterialsEdit(d){
 let ids=d.materialIds||[];
 return '<div class="materials-list" id="le-mats">'+ids.map(mid=>{let m=M(mid);if(!m)return'';return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+'</span><button onclick="removeMaterialFromDraft(\''+mid+'\')">Убрать</button></div>'}).join('')+'</div>'+
  '<div class="toolbar" style="margin-top:8px"><button onclick="document.getElementById(\'le-upload\').click()">Загрузить файл</button><input id="le-upload" type="file" multiple hidden onchange="uploadMaterialsToDraft(this)"><button onclick="pickFromLibrary()">Выбрать из библиотеки</button><button onclick="syncDraftFromForm();openAddLinkToLesson()">🔗 Добавить ссылку</button></div>';
}
function openAddLinkToLesson(){
 let cls=C(S.lessonModal.draft.classId);
 setModalHtml('Добавить ссылку к уроку',
  '<label>Название</label><input id="lm-name" placeholder="Видео по теме">'+
  '<label>Ссылка (URL)</label><input id="lm-url" placeholder="https://...">'+
  '<label>Категория</label><input id="lm-cat" value="'+e(cls?cls.name:'')+'">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveLinkAndAttach()">Добавить</button><button onclick="renderModalOnly()">Отмена</button></div>');
}
function saveLinkAndAttach(){
 let name=document.getElementById('lm-name').value.trim();
 let url=document.getElementById('lm-url').value.trim();
 if(!name||!url){alert('Укажите название и ссылку.');return}
 if(!/^https?:\/\//i.test(url))url='https://'+url;
 let mid=uid();
 D.materials.push({id:mid,filename:name,category:document.getElementById('lm-cat').value.trim()||'Без категории',isLink:true,url,mimeType:'',size:0,createdAt:new Date().toISOString()});
 let d=S.lessonModal.draft;
 d.materialIds=d.materialIds||[];d.materialIds.push(mid);
 save();renderModalOnly();
}
function removeMaterialFromDraft(mid){syncDraftFromForm();let d=S.lessonModal.draft;d.materialIds=(d.materialIds||[]).filter(x=>x!==mid);renderModalOnly()}
async function uploadMaterialsToDraft(input){
 syncDraftFromForm();
 let d=S.lessonModal.draft;
 for(let f of input.files){
  let mid=uid();
  await fileStorePut(mid,f);
  D.materials.push({id:mid,filename:f.name,category:C(d.classId)?C(d.classId).name:'Без категории',mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
  d.materialIds=d.materialIds||[];d.materialIds.push(mid);
 }
 save();renderModalOnly();
}
function pickFromLibrary(){
 syncDraftFromForm();
 let d=S.lessonModal.draft;
 let avail=D.materials.filter(m=>!(d.materialIds||[]).includes(m.id));
 setModalHtml('Выбрать из библиотеки',avail.length?
  '<div class="materials-list">'+avail.map(m=>'<label class="m" style="cursor:pointer"><span style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="pfl-cb" value="'+m.id+'" style="width:auto">'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">('+e(m.category||'')+')</span></span></label>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:12px"><button class="primary" onclick="addSelectedFromLibrary()">Добавить выбранные</button><button onclick="renderModalOnly()">Отмена</button></div>'
  :'<div class="empty">В библиотеке нет файлов.</div><div class="toolbar" style="margin-top:12px"><button onclick="renderModalOnly()">Закрыть</button></div>');
}
function addSelectedFromLibrary(){
 let d=S.lessonModal.draft;
 let ids=[...document.querySelectorAll('.pfl-cb')].filter(cb=>cb.checked).map(cb=>cb.value);
 if(!ids.length){alert('Выберите хотя бы один материал.');return}
 d.materialIds=d.materialIds||[];
 ids.forEach(mid=>{if(!d.materialIds.includes(mid))d.materialIds.push(mid)});
 renderModalOnly();
}
async function downloadMaterial(mid){
 let m=M(mid);if(!m)return;
 if(m.isLink){window.open(m.url,'_blank');return}
 let blob=m.legacyData?await base64ToBlob(m.legacyData):await fileStoreGet(mid);
 if(!blob){alert('Файл не найден в хранилище.');return}
 let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=m.filename;a.click();URL.revokeObjectURL(url);
}
async function openMaterial(mid){
 let m=M(mid);if(!m)return;
 if(m.isLink){window.open(m.url,'_blank');return}
 let blob=m.legacyData?await base64ToBlob(m.legacyData):await fileStoreGet(mid);
 if(!blob){alert('Файл не найден в хранилище.');return}
 let type=m.mimeType||blob.type||'';
 let ext=(m.filename.split('.').pop()||'').toLowerCase();
 let url=URL.createObjectURL(blob);
 if(type.startsWith('image/')){
  setModalHtml(m.filename,'<div style="text-align:center"><img src="'+url+'" style="max-width:100%;max-height:70vh;border-radius:8px"></div><div class="toolbar" style="margin-top:14px;justify-content:center"><button onclick="downloadMaterial(\''+mid+'\')">⬇ Скачать</button><button onclick="closeModal()">Закрыть</button></div>');
  return;
 }
 if(type==='application/pdf'||ext==='pdf'){
  window.open(url,'_blank');
  return;
 }
 if(type.startsWith('text/')||['txt','md','csv'].includes(ext)){
  let text=await blob.text();
  setModalHtml(m.filename,'<pre style="white-space:pre-wrap;max-height:70vh;overflow:auto;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px">'+e(text)+'</pre><div class="toolbar" style="margin-top:14px"><button onclick="downloadMaterial(\''+mid+'\')">⬇ Скачать</button><button onclick="closeModal()">Закрыть</button></div>');
  return;
 }
 alert('Этот тип файла браузер не может показать прямо в приложении (нужна программа вроде Word/PowerPoint/Excel) — сейчас он будет скачан.');
 downloadMaterial(mid);
}
function saveLessonEdit(){
 let d=S.lessonModal.draft;
 let date=document.getElementById('le-date').value,classId=document.getElementById('le-class').value;
 let cls=C(classId);
 let isClub=cls&&cls.type==='club';
 let numEl=document.getElementById('le-num');
 let num=numEl?numEl.value:null;
 let origLesson=L(d.id);
 if(isClub){
  if(!checkNotBlocked(date,null))return;
 }else{
  if(!num){alert('Укажите номер урока.');return}
  if(date!==origLesson.date||+num!==+origLesson.lessonNumber){
   if(!checkNotBlocked(date,num))return;
  }
 }
 d.date=date;d.classId=classId;d.lessonNumber=isClub?null:+num;
 d.startTime=document.getElementById('le-start').value;d.endTime=document.getElementById('le-end').value;
 d.topic=document.getElementById('le-topic').value.trim();
 d.flagPractice=document.getElementById('le-practice').checked;
 d.flagTest=document.getElementById('le-test').checked;
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{
  let el=document.getElementById('lf_'+f.key);if(el)d.customFields[f.key]=readFieldValue(f,el);
 });
 let attendance={};
 document.querySelectorAll('[data-att]').forEach(b=>{attendance[b.dataset.att]=b.textContent.trim()});
 d.attendance=attendance;
 let grades=readGradesFromForm(d.classId,false);
 if(Object.values(grades).some(g=>g.max&&g.points>g.max)&&!confirm('У некоторых учеников баллов больше максимума. Сохранить всё равно?'))return;
 d.grades=grades;readGradeMaxToDraft(d);
 let behaviorNotes={};
 document.querySelectorAll('[data-bn]').forEach(inp=>{let v=inp.value.trim();if(v)behaviorNotes[inp.dataset.bn]=v});
 d.behaviorNotes=behaviorNotes;
 let idx=D.lessons.findIndex(x=>x.id===d.id);
 D.lessons[idx]=d;
 save();
 S.lessonModal.mode='view';S.lessonModal.draft=null;
 renderModalOnly();
 if(S.view==='home'||S.view==='class')render();
}
function cancelEditLesson(){S.lessonModal.mode='view';S.lessonModal.draft=null;renderModalOnly()}
function openDuplicateLesson(id){
 let l=L(id);
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let fieldsHtml='<label>Что скопировать</label><div class="checks" style="max-height:190px">'+
  '<div class="attrow"><span>Тема</span><input type="checkbox" id="dup-f-topic" checked style="width:auto"></div>'+
  lf.map(f=>'<div class="attrow"><span>'+e(f.label)+'</span><input type="checkbox" class="dup-f" data-key="'+f.key+'" '+(['planText','stages','homework'].includes(f.key)?'checked':'')+' style="width:auto"></div>').join('')+
  '<div class="attrow"><span>Материалы</span><input type="checkbox" id="dup-f-materials" checked style="width:auto"></div>'+
  '</div><div class="muted small">Посещаемость и оценки никогда не копируются — для нового урока они начинаются заново.</div>';
 let classesHtml='<label style="margin-top:14px">В какие классы и на какое время скопировать</label><table class="table"><tr><th></th><th>Класс</th><th>Дата</th><th>№ урока</th></tr>'+
  sortedClasses(D.classes.filter(c=>c.type===C(l.classId).type)).map(c=>'<tr><td><input type="checkbox" class="dup-c" data-class="'+c.id+'" style="width:auto"></td><td>'+e(c.name)+'</td><td><input type="date" class="dup-date" data-class="'+c.id+'" value="'+e(l.date)+'"></td><td><select class="dup-num" data-class="'+c.id+'">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'" '+(t.n===+l.lessonNumber?'selected':'')+'>'+t.n+'</option>').join('')+'</select></td></tr>').join('')+
  '</table>';
 setModalHtml('Дублировать урок'+(D.classes.length>1?' на параллель':''),fieldsHtml+classesHtml+'<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmDuplicateLesson(\''+id+'\')">Создать уроки</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmDuplicateLesson(sourceId){
 let l=L(sourceId);
 let copyTopic=document.getElementById('dup-f-topic').checked;
 let copyMaterials=document.getElementById('dup-f-materials').checked;
 let fieldKeys=[...document.querySelectorAll('.dup-f')].filter(x=>x.checked).map(x=>x.dataset.key);
 let created=0,skipped=[];
 document.querySelectorAll('.dup-c').forEach(cb=>{
  if(!cb.checked)return;
  let classId=cb.dataset.class;
  let date=document.querySelector('.dup-date[data-class="'+classId+'"]').value;
  let num=+document.querySelector('.dup-num[data-class="'+classId+'"]').value;
  let blk=findBlock(date,num);
  if(blk){skipped.push(C(classId).name+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(C(classId).name+' — слот уже занят');return}
  let t=timeFor(num);
  let nl={id:uid(),date,lessonNumber:num,startTime:t.start,endTime:t.end,classId,topic:copyTopic?l.topic:'',
   customFields:{},attendance:{},grades:{},materialIds:copyMaterials?[...(l.materialIds||[])]:[]};
  fieldKeys.forEach(k=>nl.customFields[k]=l.customFields[k]);
  D.lessons.push(nl);created++;
 });
 save();closeModal();
 alert('Создано уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
function openPrintWindow(title,bodyHtml){
 let w=window.open('','_blank');
 if(!w){alert('Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для печати.');return}
 let todayStr=fmtDate(toISO(new Date()));
 w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+e(title)+'</title><style>'+
  'body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#111;max-width:900px;margin:0 auto}'+
  'h1{font-size:21px;margin-bottom:2px}h3{font-size:14px;margin:16px 0 6px}'+
  'table{width:100%;border-collapse:collapse;margin-top:6px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12.5px}'+
  '.muted{color:#666}.toolbar{text-align:right;margin-bottom:16px}'+
  '.pfooter{margin-top:26px;padding-top:12px;border-top:1px solid #ccc;font-size:13px;color:#333}'+
  '@media print{.toolbar{display:none};.pfooter{position:fixed;bottom:14px;left:28px;right:28px}}'+
  '@page{margin:16mm}'+
  '</style></head><body><div class="toolbar"><button onclick="window.print()">🖨 Печать / Сохранить в PDF</button>'+
  '<div class="muted" style="text-align:right;font-size:11.5px;margin-top:6px">Совет: в диалоге печати отключите опцию «Верхние и нижние колонтитулы» браузера — дата уже указана в самом документе ниже.</div></div>'+
  bodyHtml+
  '<div class="pfooter">Дата составления: '+todayStr+'</div>'+
  '</body></html>');
 w.document.close();
}
function teacherSurname(){let n=(D.settings.teacherName||'').trim();return n?n.split(/\s+/)[0]:''}
function printDocTitle(subjects,fallback){
 let ts=teacherSurname();
 let subj=(subjects||[]).filter(Boolean);
 let left=subj.length?[...new Set(subj)].join(', '):fallback;
 return ts?left+' — '+ts:left;
}
function studentFioPlain(s){return s.lastName+' '+s.firstName+(s.middleName?' '+s.middleName:'')}
function openPrintLessonOptions(id){
 let l=L(id);
 let lf=D.settings.fields.lesson.filter(f=>f.visible&&!['planText'].includes(f.key));
 setModalHtml('Что напечатать',
  '<label class="attrow"><span>План урока</span><input type="checkbox" id="po-plan" checked style="width:auto"></label>'+
  '<label class="attrow"><span>Домашнее задание</span><input type="checkbox" id="po-hw" checked style="width:auto"></label>'+
  '<label class="attrow"><span>Остальные заполненные поля урока</span><input type="checkbox" id="po-extra" checked style="width:auto"></label>'+
  '<label class="attrow"><span>Таблица результатов (оценки/посещаемость)</span><input type="checkbox" id="po-results" checked style="width:auto"></label>'+
  '<label class="attrow"><span>— в т.ч. комментарии к оценкам</span><input type="checkbox" id="po-comments" checked style="width:auto"></label>'+
  '<label class="attrow"><span>— в т.ч. заметки о поведении</span><input type="checkbox" id="po-behavior" checked style="width:auto"></label>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="openPrintLesson(\''+id+'\')">🖨 Печать</button><button onclick="closeModal()">Отмена</button></div>');
}
function openPrintLesson(id){
 let opts={plan:true,hw:true,extra:true,results:true,comments:true,behavior:true};
 if(document.getElementById('po-plan')){
  opts={plan:document.getElementById('po-plan').checked,hw:document.getElementById('po-hw').checked,
   extra:document.getElementById('po-extra').checked,results:document.getElementById('po-results').checked,
   comments:document.getElementById('po-comments').checked,behavior:document.getElementById('po-behavior')?document.getElementById('po-behavior').checked:true};
 }
 let l=L(id),cls=C(l.classId),ps=people(l.classId);
 let grades=l.grades||{},att=l.attendance||{},behaviorNotes=l.behaviorNotes||{};
 let body='<h1>'+e(l.topic||'Урок без темы')+'</h1><p class="muted">'+e(cls?cls.name:'—')+' · '+fmtDate(l.date)+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+'</p>'+
  (opts.plan&&lessonField(l,'planText')?'<h3>'+fLabel('lesson','planText','План урока')+'</h3><p>'+richTextView(lessonField(l,'planText'))+'</p>':'')+
  (opts.hw&&lessonField(l,'homework')?'<h3>'+fLabel('lesson','homework','Домашнее задание')+'</h3><p>'+richTextView(lessonField(l,'homework'))+'</p>':'')+
  (opts.extra?extraLessonFieldsView(l):'')+
  (opts.results?'<h3>Результаты</h3><table><tr><th>Ученик</th><th>Оценка</th>'+(opts.comments?'<th>Комментарий</th>':'')+'<th>Присутствие</th>'+(opts.behavior?'<th>Заметка о поведении</th>':'')+'</tr>'+
   ps.map(s=>{let g=grades[s.id],a=att[s.id],bn=behaviorNotes[s.id];return '<tr><td>'+studentFio(s)+'</td><td>'+(g?e(gradeText(g)||'—'):'—')+'</td>'+(opts.comments?'<td>'+e(g&&g.comment||'')+'</td>':'')+'<td>'+(a?(a==='н'?'Отсутствовал':'Присутствовал'):'—')+'</td>'+(opts.behavior?'<td>'+e(bn||'')+'</td>':'')+'</tr>'}).join('')+
   '</table>':'');
 openPrintWindow(printDocTitle([cls&&cls.subject],'Урок'),body);
 closeModal();
}
function openPrintStudentOptions(id){
 let s=P(id);
 let sf=D.settings.fields.student.filter(f=>f.visible&&f.key!=='birthDate');
 setModalHtml('Что напечатать',
  '<label class="attrow"><span>Дата рождения</span><input type="checkbox" id="po-birth" checked style="width:auto"></label>'+
  '<label class="attrow"><span>Сводная статистика (средняя, посещаемость, пропуски)</span><input type="checkbox" id="po-summary" checked style="width:auto"></label>'+
  '<label class="attrow"><span>График динамики оценок (чёрно-белый)</span><input type="checkbox" id="po-chart" checked style="width:auto"></label>'+
  sf.map(f=>'<label class="attrow"><span>'+e(f.label)+'</span><input type="checkbox" class="po-cf" data-key="'+f.key+'" style="width:auto"></label>').join('')+
  '<div class="section-sep"></div>'+
  '<label class="attrow"><span>История: тема урока</span><input type="checkbox" id="po-topic" checked style="width:auto"></label>'+
  '<label class="attrow"><span>История: комментарии к оценкам</span><input type="checkbox" id="po-comments" checked style="width:auto"></label>'+
  '<label class="attrow"><span>История: посещаемость</span><input type="checkbox" id="po-attendance" checked style="width:auto"></label>'+
  '<label class="attrow"><span>История: заметки о поведении</span><input type="checkbox" id="po-behavior" checked style="width:auto"></label>'+
  '<label class="attrow"><span>Только уроки с оценками (скрыть остальные)</span><input type="checkbox" id="po-onlygraded" style="width:auto"></label>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="openPrintStudent(\''+id+'\')">🖨 Печать</button><button onclick="closeModal()">Отмена</button></div>');
}
function openPrintStudent(id){
 let opts={birth:true,summary:true,chart:true,cfKeys:[],topic:true,comments:true,attendance:true,behavior:true,onlyGraded:false};
 if(document.getElementById('po-birth')){
  opts={birth:document.getElementById('po-birth').checked,summary:document.getElementById('po-summary').checked,
   chart:document.getElementById('po-chart').checked,
   cfKeys:[...document.querySelectorAll('.po-cf')].filter(x=>x.checked).map(x=>x.dataset.key),
   topic:document.getElementById('po-topic').checked,comments:document.getElementById('po-comments').checked,
   attendance:document.getElementById('po-attendance').checked,behavior:document.getElementById('po-behavior')?document.getElementById('po-behavior').checked:true,onlyGraded:document.getElementById('po-onlygraded').checked};
 }
 let s=P(id);
 let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled).sort((a,b)=>a.date.localeCompare(b.date));
 let st=studentStats(id);
 let trendPoints=ls.filter(l=>(l.grades||{})[id]&&gradeNumericValue(l.grades[id].value)!==null).map(l=>({y:gradeNumericValue(l.grades[id].value),label:fmtDateShort(l.date)}));
 let rowsSrc=ls.filter(l=>opts.onlyGraded?(l.grades||{})[id]:((l.grades||{})[id]||(l.attendance||{})[id]||(l.behaviorNotes||{})[id]));
 let rows=rowsSrc.map(l=>{
  let g=(l.grades||{})[id],a=(l.attendance||{})[id],bn=(l.behaviorNotes||{})[id];
  return '<tr><td>'+fmtDate(l.date)+'</td>'+(opts.topic?'<td>'+e(l.topic||'(без темы)')+'</td>':'')+'<td>'+(g?e(gradeText(g)||'—'):'—')+'</td>'+(opts.comments?'<td>'+e(g&&g.comment||'')+'</td>':'')+(opts.attendance?'<td>'+(a?(a==='н'?'Н':'П'):'—')+'</td>':'')+(opts.behavior?'<td>'+e(bn||'')+'</td>':'')+'</tr>';
 }).join('');
 let colCount=1+(opts.topic?1:0)+1+(opts.comments?1:0)+(opts.attendance?1:0)+(opts.behavior?1:0);
 let sf=D.settings.fields.student.filter(f=>f.visible&&opts.cfKeys.includes(f.key));
 let body='<h1>'+studentFio(s)+'</h1><p class="muted">'+e(studentClassNames(s))+(opts.birth?' · дата рождения: '+fmtDate(s.customFields.birthDate):'')+'</p>'+
  (opts.summary?'<p>Средняя оценка: <b>'+round2(st.avgGrade)+'</b> &nbsp;·&nbsp; Посещаемость: <b>'+(st.attendancePct===null?'—':st.attendancePct+'%')+'</b> &nbsp;·&nbsp; Пропусков: <b>'+st.absences+'</b>'+(opts.behavior?' &nbsp;·&nbsp; Заметок о поведении: <b>'+st.behaviorCount+'</b>':'')+'</p>':'')+
  (opts.chart?'<h3>Динамика оценок</h3>'+svgPrintTrendChart(trendPoints,{width:560,height:170}):'')+
  sf.map(f=>section(f.label,customFieldView(f,s.customFields[f.key]))).join('')+
  '<h3>История оценок'+(opts.attendance?' и посещаемости':'')+'</h3><table><tr><th>Дата</th>'+(opts.topic?'<th>Тема</th>':'')+'<th>Оценка</th>'+(opts.comments?'<th>Комментарий</th>':'')+(opts.attendance?'<th>Присутствие</th>':'')+(opts.behavior?'<th>Заметка о поведении</th>':'')+'</tr>'+(rows||'<tr><td colspan="'+colCount+'" class="muted">Нет данных</td></tr>')+'</table>';
 openPrintWindow(printDocTitle(studentClassObjs(s).map(c=>c.subject),'Табель'),body);
 closeModal();
}
function copyLessonResultsText(id){
 let l=L(id),cls=C(l.classId),ps=people(l.classId);
 let grades=l.grades||{};
 let lines=[];
 lines.push('Урок: '+(l.topic||'(без темы)')+' — '+(cls?cls.name:'—')+', '+fmtDate(l.date));
 if(lessonField(l,'planText'))lines.push('Задания/план: '+lessonField(l,'planText'));
 D.settings.fields.lesson.filter(f=>f.visible&&!LESSON_KNOWN_KEYS.includes(f.key)).forEach(f=>{let v=lessonField(l,f.key);if(v)lines.push(f.label+': '+v)});
 lines.push('');lines.push('Результаты:');
 let any=false;
 ps.forEach(s=>{let g=grades[s.id];if(g){any=true;lines.push('- '+studentFioPlain(s)+': '+gradeText(g)+(g.comment?' — '+g.comment:''))}});
 if(!any)lines.push('(оценок пока нет)');
 copyTextToClipboard(lines.join('\n'));
}
function copyTextToClipboard(text){
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(text).then(()=>alert('Скопировано в буфер обмена.')).catch(()=>fallbackCopy(text));
 }else fallbackCopy(text);
}
function fallbackCopy(text){
 let ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
 try{document.execCommand('copy')}catch(err){}
 document.body.removeChild(ta);alert('Скопировано в буфер обмена.');
}
function cancelLesson(id){
 let l=L(id);if(!l)return;
 if(l.cancelled){alert('Этот урок уже отменён.');return}
 if(!confirm('Отметить урок как отменённый?\n\nОн останется в расписании (будет закрашен серым) вместе со своей темой, планом, домашним заданием и заметками, но не будет учитываться в статистике. Ничего не будет автоматически перенесено на другие уроки — при необходимости перенесите план на следующий урок вручную.'))return;
 l.cancelled=true;
 save();closeModal();render();
}
function restoreCancelledLesson(id){
 let l=L(id);if(!l)return;
 if(!confirm('Отметить, что урок всё же состоялся? Тема/план и т.д. НЕ вернутся автоматически на прежнее место — при необходимости перенесите их обратно вручную.'))return;
 l.cancelled=false;
 save();closeModal();render();
}
function archiveLessonConfirm(id){
 if(!confirm('Архивировать урок? Он исчезнет из расписания и статистики, но не удалится сразу — хранится в архиве 30 дней и потом удаляется автоматически. Восстановить можно в любой момент в разделе «Работа → Архив уроков».'))return;
 let l=L(id);if(!l)return;
 l.archived=true;l.archivedAt=toISO(new Date());
 save();closeModal();render();
}
function restoreLessonFromArchive(id){
 let l=L(id);if(!l)return;
 l.archived=false;delete l.archivedAt;
 save();render();
}
function purgeLessonForever(id){
 if(!confirm('Удалить урок навсегда, минуя архив? Это действие необратимо.'))return;
 D.lessons=D.lessons.filter(x=>x.id!==id);
 save();render();
}
function stripTime(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function bdayDiff(dateStr){
 if(!dateStr)return null;
 let b=new Date(dateStr+'T12:00:00');
 let today=stripTime(new Date());
 let y=today.getFullYear();
 let cands=[new Date(y-1,b.getMonth(),b.getDate()),new Date(y,b.getMonth(),b.getDate()),new Date(y+1,b.getMonth(),b.getDate())];
 let diffs=cands.map(c=>Math.round((c-today)/86400000));
 return diffs.reduce((best,d)=>Math.abs(d)<Math.abs(best)?d:best);
}
function classHasBirthdayToday(classId){
 return D.students.some(s=>s.status!=='archived'&&(s.classIds||[]).includes(classId)&&s.customFields.birthDate&&bdayDiff(s.customFields.birthDate)===0);
}
function fmtClockTime(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function fmtClockDate(d){let s=d.toLocaleDateString('ru-RU',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)}
function widgetClock(){
 return '<div class="card home-clock-card" style="text-align:center;padding:22px"><div id="live-clock" style="font-size:44px;font-weight:700;letter-spacing:1px;font-variant-numeric:tabular-nums">'+fmtClockTime(new Date())+'</div><div class="muted" style="margin-top:4px">'+fmtClockDate(new Date())+'</div></div>';
}
function startClockTicker(){
 if(window._clockInterval){clearInterval(window._clockInterval);window._clockInterval=null}
 window._clockInterval=setInterval(()=>{
  let el=document.getElementById('live-clock');
  if(!el){clearInterval(window._clockInterval);window._clockInterval=null;return}
  el.textContent=fmtClockTime(new Date());
 },30000);
}
function widgetSchedule(){
 let dates=weekDates(S.weekStart);
 let title=fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+' '+new Date(dates[dates.length-1]+'T12:00:00').getFullYear();
 return '<div class="card">'+
  '<div class="weeknav"><button onclick="shiftWeek(-1)">‹ Предыдущая неделя</button><span class="wk-title">'+title+'</span><button onclick="shiftWeek(1)">Следующая неделя ›</button><button onclick="curWeek()">Текущая неделя</button></div>'+
  scheduleTable(dates)+
  '</div>';
}
function fullSchedulePage(){
 let dates=weekDates(S.weekStart);
 let title=fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+' '+new Date(dates[dates.length-1]+'T12:00:00').getFullYear();
 return '<div class="top"><div><h1>Расписание</h1><div class="muted">Полное расписание недели: уроки, кружки/секции и совещания</div></div>'+
  '<div class="toolbar"><button onclick="openBulkCreateWeek()">＋ Быстро заполнить неделю</button><button class="primary" onclick="openNewLesson()">＋ Новый урок</button></div></div>'+
  '<div class="card">'+
   '<div class="weeknav"><button onclick="shiftWeek(-1)">‹ Предыдущая неделя</button><span class="wk-title">'+title+'</span><button onclick="shiftWeek(1)">Следующая неделя ›</button><button onclick="curWeek()">Текущая неделя</button></div>'+
   scheduleTable(dates)+
  '</div>';
}
function openBulkCreateWeek(){
 let dates=weekDates(S.weekStart);
 let dayLabels=dates.map((d,i)=>DAY_NAMES[i]+' '+fmtDateShort(d));
 setModalHtml('Быстро заполнить неделю',
  '<div class="notice">Создаёт пустые уроки без темы — просто занимают место в расписании. Тему и план вы позже впишете сами или подставите урок из библиотеки.</div>'+
  '<label>Класс</label><select id="bc-class">'+classOptionsHtml(null)+'</select>'+
  '<label>№ урока</label><select id="bc-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'">'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select>'+
  '<label>Дни ('+fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+')</label>'+
  '<div class="checks">'+dates.map((d,i)=>'<label class="attrow" style="cursor:pointer"><span>'+e(dayLabels[i])+'</span><input type="checkbox" class="bc-day" data-date="'+d+'" checked style="width:auto"></label>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmBulkCreateWeek()">Создать</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmBulkCreateWeek(){
 let classId=document.getElementById('bc-class').value;
 let num=+document.getElementById('bc-num').value;
 let cls=C(classId);
 if(cls&&cls.type==='club'){alert('Быстрое заполнение недели работает только для обычных классов — у кружков свободное время, создайте их уроки вручную.');return}
 let time=timeFor(num);
 let created=0,skipped=[];
 document.querySelectorAll('.bc-day:checked').forEach(cb=>{
  let date=cb.dataset.date;
  let blk=findBlock(date,num);
  if(blk){skipped.push(fmtDate(date)+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(fmtDate(date)+' — слот уже занят');return}
  D.lessons.push({id:uid(),date,lessonNumber:num,startTime:time.start,endTime:time.end,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]});
  created++;
 });
 save();closeModal();
 alert('Создано пустых уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
function widgetStats(){
 let planned=activeLessons().filter(l=>lessonStatus(l)==='red').length;
 let done=activeLessons().filter(l=>lessonStatus(l)==='green').length;
 let needsWork=activeLessons().filter(l=>lessonStatus(l)==='blue').length;
 return '<div class="grid">'+stat(D.classes.length,'Классов')+stat(D.students.filter(s=>s.status!=='archived').length,'Учеников')+
  stat(D.lessons.length,'Всего уроков')+stat(done,'🟢 Заполнено')+stat(needsWork,'🔵 Нужна рефлексия')+stat(planned,'🔴 Не подготовлено')+'</div>';
}
function widgetTasks(){
 S.homeTaskFilter=S.homeTaskFilter||{priority:'',status:'open',sort:'due'};
 let f=S.homeTaskFilter;
 let items=D.workTasks.filter(t=>(!f.priority||t.priority===f.priority)&&(f.status==='open'?t.status!=='done':f.status==='done'?t.status==='done':true));
 let sorters={
  due:(a,b)=>(a.dueDate||'9999-99-99').localeCompare(b.dueDate||'9999-99-99'),
  priority:(a,b)=>({high:0,med:1,low:2}[b.priority||'med'])-({high:0,med:1,low:2}[a.priority||'med']),
  title:(a,b)=>a.title.localeCompare(b.title,'ru')
 };
 items=[...items].sort(sorters[f.sort]||sorters.due);
 let today=toISO(new Date());
 return '<div class="card"><div class="top"><h2 style="margin-top:0">✅ Задачи</h2><a href="#" class="small" onclick="event.preventDefault();S.view=\'work\';S.workTab=\'tasks\';render()">Все задачи →</a></div>'+
  '<div class="row" style="margin-bottom:8px"><input id="todo-input" placeholder="Новая задача..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();addQuickTask()}"><button class="primary" style="flex:0" onclick="addQuickTask()">Добавить</button></div>'+
  '<div class="toolbar" style="margin-bottom:8px">'+
   '<select onchange="S.homeTaskFilter.status=this.value;render()"><option value="open"'+(f.status==='open'?' selected':'')+'>Незавершённые</option><option value="done"'+(f.status==='done'?' selected':'')+'>Завершённые</option><option value="all"'+(f.status==='all'?' selected':'')+'>Все</option></select>'+
   '<select onchange="S.homeTaskFilter.priority=this.value;render()"><option value="">Любой приоритет</option><option value="high"'+(f.priority==='high'?' selected':'')+'>Высокий</option><option value="med"'+(f.priority==='med'?' selected':'')+'>Средний</option><option value="low"'+(f.priority==='low'?' selected':'')+'>Низкий</option></select>'+
   '<select onchange="S.homeTaskFilter.sort=this.value;render()"><option value="due"'+(f.sort==='due'?' selected':'')+'>По сроку</option><option value="priority"'+(f.sort==='priority'?' selected':'')+'>По приоритету</option><option value="title"'+(f.sort==='title'?' selected':'')+'>По названию</option></select>'+
  '</div>'+
  (items.length?'<div class="checks">'+items.map(t=>{let overdue=t.dueDate&&t.dueDate<today&&t.status!=='done';return '<div class="attrow"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;margin:0"><input type="checkbox" style="width:auto" '+(t.status==='done'?'checked':'')+' onchange="toggleWorkTaskDone(\''+t.id+'\')"><span style="'+(t.status==='done'?'text-decoration:line-through;color:var(--muted)':'')+'">'+e(t.title)+'</span>'+(t.dueDate?' <span class="small '+(overdue?'danger':'muted')+'">· '+fmtDate(t.dueDate)+(overdue?' ⚠':'')+'</span>':'')+' <span class="badge '+priorityBadgeClass(t.priority)+'">'+priorityLabel(t.priority)+'</span></label><button onclick="deleteWorkTask(\''+t.id+'\')">✕</button></div>'}).join('')+'</div>':'<div class="muted small">Подходящих задач нет.</div>')+
  '</div>';
}
function addQuickTask(){
 let inp=document.getElementById('todo-input');
 let text=inp.value.trim();if(!text)return;
 D.workTasks.push({id:uid(),title:text,dueDate:'',priority:'med',status:'todo',notes:''});
 save();render();
}
function widgetBirthdays(){
 let items=[];
 D.students.filter(s=>s.status!=='archived'&&s.customFields.birthDate).forEach(s=>{
  let days=bdayDiff(s.customFields.birthDate);
  if(days>=-3&&days<=14)items.push({days,html:'<span class="click" onclick="openStudentPage(\''+s.id+'\')">'+studentFio(s)+' <span class="muted small">· '+e(studentClassNames(s))+'</span></span>'});
 });
 (D.colleagues||[]).filter(c=>colleagueField(c,'birthDate')).forEach(c=>{
  let days=bdayDiff(colleagueField(c,'birthDate'));
  if(days>=-3&&days<=14)items.push({days,html:'<span class="click" onclick="openColleagueCard(\''+c.id+'\')">'+colleagueFio(c)+' <span class="muted small">· коллега'+(colleagueField(c,'position')?', '+e(colleagueField(c,'position')):'')+'</span></span>'});
 });
 items.sort((a,b)=>a.days-b.days);
 function badgeFor(days){
  if(days===0)return'сегодня! 🎂';
  if(days===1)return'завтра';
  if(days>1)return'через '+days+' дн.';
  if(days===-1)return'вчера';
  return days+' дн. назад';
 }
 return '<div class="card"><h2 style="margin-top:0">🎂 Дни рождения</h2>'+
  (items.length?items.map(x=>'<div class="attrow">'+x.html+'<span class="badge'+(x.days<0?' muted':'')+'">'+badgeFor(x.days)+'</span></div>').join(''):'<div class="muted small">Ни сегодня, ни в ближайшие 2 недели, ни за последние 3 дня дней рождения нет (ни у учеников, ни у коллег).</div>')+
  '</div>';
}
const HOME_WIDGETS={
 clock:{label:'Часы и дата',render:widgetClock},
 schedule:{label:'Расписание недели',render:widgetSchedule},
 stats:{label:'Быстрые показатели',render:widgetStats},
 todo:{label:'Задачи',render:widgetTasks},
 birthdays:{label:'Ближайшие дни рождения',render:widgetBirthdays},
 recent:{label:'Последние уроки',render:recentLessonsCard}
};
function openHomeConfig(){
 let widgets=D.settings.homeWidgets;
 setModalHtml('Настроить главную страницу',
  '<div class="muted small" style="margin-bottom:10px">Выберите, что показывать на главной, и в каком порядке — как конструктор.</div>'+
  widgets.map((w,i)=>{let meta=HOME_WIDGETS[w.key];if(!meta)return'';return '<div class="fieldrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveHomeWidget('+i+',-1)">↑</button><button '+(i===widgets.length-1?'disabled':'')+' onclick="moveHomeWidget('+i+',1)">↓</button></span><span class="fname">'+e(meta.label)+'</span><label style="display:flex;align-items:center;gap:5px;margin:0;flex:0"><input type="checkbox" style="width:auto" '+(w.visible?'checked':'')+' onchange="toggleHomeWidget(\''+w.key+'\')"> показывать</label></div>'}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();render()">Готово</button></div>');
}
function moveHomeWidget(i,dir){let arr=D.settings.homeWidgets;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();openHomeConfig()}
function toggleHomeWidget(key){let w=D.settings.homeWidgets.find(x=>x.key===key);w.visible=!w.visible;save();openHomeConfig()}
function homePage(){
 return '<div class="top"><div><h1>Главная</h1><div class="muted">Личный рабочий кабинет учителя</div></div>'+
  '<div class="toolbar"><button onclick="openHomeConfig()">⚙ Настроить главную</button><button class="primary" onclick="openNewLesson()">＋ Новый урок</button></div></div>'+
  backupReminderBanner()+
  (D.settings.homeWidgets||[]).filter(w=>w.visible&&HOME_WIDGETS[w.key]).map(w=>HOME_WIDGETS[w.key].render()).join('');
}
function recentLessonsCard(){
 S.recentFilter=S.recentFilter||{classId:'',status:'',sort:'date_desc',limit:10};
 let f=S.recentFilter;
 let ls=activeLessons().filter(l=>(!f.classId||groupIds(f.classId).includes(l.classId))&&(!f.status||lessonStatus(l)===f.status));
 let sorters={
  date_desc:(a,b)=>b.date.localeCompare(a.date),
  date_asc:(a,b)=>a.date.localeCompare(b.date),
  class:(a,b)=>(C(a.classId)?.name||'').localeCompare(C(b.classId)?.name||'','ru'),
  status:(a,b)=>({red:0,blue:1,green:2}[lessonStatus(a)])-({red:0,blue:1,green:2}[lessonStatus(b)])
 };
 ls=[...ls].sort(sorters[f.sort]||sorters.date_desc);
 let total=ls.length;
 ls=ls.slice(0,f.limit);
 return '<div class="card"><div class="top"><h2>Последние уроки</h2></div>'+
  '<div class="toolbar" style="margin-bottom:10px">'+
   '<select onchange="S.recentFilter.classId=this.value;render()"><option value="">Все классы</option>'+classOptionsHtml(f.classId)+'</select>'+
   '<select onchange="S.recentFilter.status=this.value;render()"><option value="">Любой статус</option><option value="red"'+(f.status==='red'?' selected':'')+'>🔴 Не подготовлено</option><option value="blue"'+(f.status==='blue'?' selected':'')+'>🔵 Нужна рефлексия</option><option value="green"'+(f.status==='green'?' selected':'')+'>🟢 Заполнено</option></select>'+
   '<select onchange="S.recentFilter.sort=this.value;render()"><option value="date_desc"'+(f.sort==='date_desc'?' selected':'')+'>Сначала новые</option><option value="date_asc"'+(f.sort==='date_asc'?' selected':'')+'>Сначала старые</option><option value="class"'+(f.sort==='class'?' selected':'')+'>По классу</option><option value="status"'+(f.sort==='status'?' selected':'')+'>По статусу</option></select>'+
  '</div>'+
  (ls.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Тема</th><th>Статус</th></tr>'+
   ls.map(l=>'<tr class="click" onclick="openLessonModal(\''+l.id+'\')"><td>'+fmtDate(l.date)+'</td><td>'+e(C(l.classId)?.name||'—')+'</td><td>'+e(l.topic||'(без темы)')+'</td><td>'+statusBadge(l)+'</td></tr>').join('')+
   '</table>'+(total>f.limit?'<div class="toolbar" style="margin-top:8px"><button onclick="S.recentFilter.limit+=10;render()">Показать ещё ('+(total-f.limit)+')</button></div>':''):'<div class="empty">Уроков по этим условиям не найдено.</div>')+
  '</div>';
}
function statusBadge(l){let s=lessonStatus(l);return '<span class="badge '+s+'"><span class="dot '+s+'"></span>'+statusLabel(s)+'</span>'}
function shiftWeek(dir){S.weekStart=addDays(S.weekStart,7*dir);render()}
function curWeek(){S.weekStart=mondayOf(toISO(new Date()));render()}
function scheduleTable(dates){
 let todayStr=toISO(new Date());
 let now=new Date();
 let nowMinutes=now.getHours()*60+now.getMinutes();
 let todayIndex=dates.indexOf(todayStr);
 function nowMarkerRow(){
  return '<tr class="now-row"><td class="numcol"></td>'+dates.map((d,i)=>'<td>'+(i===todayIndex?'<div class="now-line" title="Сейчас"></div>':'')+'</td>').join('')+'</tr>';
 }
 let periodRows=LESSON_TIMES.map(t=>({t,startMin:timeToMin(t.start),endMin:timeToMin(t.end)}));
 let rowsHtml='';
 if(todayIndex>=0&&periodRows.length&&nowMinutes<periodRows[0].startMin)rowsHtml+=nowMarkerRow();
 periodRows.forEach((pr,idx)=>{
  let t=pr.t;
  let cells=dates.map((d,di)=>{
   let isToday=di===todayIndex;
   let isPast=(d<todayStr)||(isToday&&nowMinutes>=pr.endMin);
   let blk=findBlock(d,t.n);
   let tdClass=isToday?' class="today-col"':'';
   if(blk)return '<td'+tdClass+'><div class="cell blocked'+(isPast?' cell-past':'')+'">'+e(blk.reason).toUpperCase()+'</div></td>';
   let l=activeLessons().find(x=>x.date===d&&+x.lessonNumber===t.n);
   if(l){let st=lessonStatus(l);let cls=C(l.classId);
    let flags=(l.flagPractice?'🧪':'')+(l.flagTest?'📝':'');
    let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
    return '<td'+tdClass+'><div class="cell st-'+st+(isPast?' cell-past':'')+'" onclick="openLessonModal(\''+l.id+'\')"><span class="cls">'+e(cls?cls.name:'—')+(flags?' '+flags:'')+cake+'</span><span>'+(l.cancelled?'🚫 Отменён':e(l.topic||'(без темы)'))+'</span></div></td>';
   }
   return '<td'+tdClass+'><div class="cell empty-cell'+(isPast?' cell-past':'')+'" onclick="quickCreateLesson(\''+d+'\','+t.n+')">+</div></td>';
  }).join('');
  rowsHtml+='<tr><td class="numcol">'+t.n+'<br><span class="small">'+t.start+'–'+t.end+'</span></td>'+cells+'</tr>';
  if(todayIndex>=0){
   let nextStart=idx+1<periodRows.length?periodRows[idx+1].startMin:null;
   if(nowMinutes>=pr.endMin&&(nextStart===null||nowMinutes<nextStart))rowsHtml+=nowMarkerRow();
  }
 });
 let clubsRow='<tr><td class="numcol" style="font-size:10.5px">Кружки / секции</td>'+dates.map((d,di)=>{
  let isToday=di===todayIndex;
  let items=activeLessons().filter(x=>x.date===d&&!x.lessonNumber&&C(x.classId)&&C(x.classId).type==='club').sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));
  if(!items.length)return '<td'+(isToday?' class="today-col"':'')+'></td>';
  return '<td'+(isToday?' class="today-col"':'')+' style="vertical-align:top;padding:4px"><div style="display:flex;flex-direction:column;gap:3px">'+
   items.map(l=>{let cls=C(l.classId);let st=lessonStatus(l);let isPast=(d<todayStr)||(isToday&&l.endTime&&nowMinutes>=timeToMin(l.endTime));
    let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
    return '<div class="cell st-'+st+(isPast?' cell-past':'')+'" style="padding:4px 6px;font-size:11px" onclick="openLessonModal(\''+l.id+'\')"><b>'+e(l.startTime||'')+(l.endTime?'–'+e(l.endTime):'')+'</b> '+e(cls?cls.name:'')+cake+' — '+e(l.topic||'(без темы)')+'</div>';
   }).join('')+
   '</div></td>';
 }).join('')+'</tr>';
 let meetingsRow='<tr><td class="numcol" style="font-size:10.5px">Совещания</td>'+dates.map((d,di)=>{
  let isToday=di===todayIndex;
  let ms=D.meetings.filter(m=>m.date===d);
  if(!ms.length)return '<td'+(isToday?' class="today-col"':'')+'></td>';
  return '<td'+(isToday?' class="today-col"':'')+' style="vertical-align:top;padding:4px"><div style="display:flex;flex-direction:column;gap:3px">'+
   ms.map(m=>'<div class="meeting-chip" onclick="openEditMeeting(\''+m.id+'\')">🗓 '+(m.time?e(m.time)+' ':'')+e(m.title)+'</div>').join('')+
   '</div></td>';
 }).join('')+'</tr>';
 let header='<tr><th class="numcol">№</th>'+dates.map((d,i)=>'<th'+(i===todayIndex?' class="today-col"':'')+'>'+DAY_NAMES[i]+' '+fmtDateShort(d)+(i===todayIndex?'<br><span class="badge blue" style="font-size:9px">СЕГОДНЯ</span>':'')+'</th>').join('')+'</tr>';
 return '<div style="overflow-x:auto"><table class="sched" style="min-width:760px">'+header+rowsHtml+clubsRow+meetingsRow+'</table></div>';
}
function openNewClass(presetType){
 let isClub=presetType==='club';
 setModalHtml('Новый класс',
  '<label>Тип</label><select id="c-type" onchange="toggleClassTypeFields()"><option value="class"'+(!isClub?' selected':'')+'>Класс (урок)</option><option value="club"'+(isClub?' selected':'')+'>Кружок / секция</option></select>'+
  '<div id="c-fields-class" style="display:'+(isClub?'none':'block')+'"><div class="row"><div><label>Номер класса</label><input id="c-gradenum" type="number" min="1" max="11" placeholder="6"></div><div><label>Литера</label><input id="c-gradeletter" placeholder="А"></div></div></div>'+
  '<div id="c-fields-club" style="display:'+(isClub?'block':'none')+'"><label>Название кружка / группы</label><input id="c-clubname" placeholder="Робототехника — группа 1">'+
   '<label>Родительский кружок (необязательно — если это группа внутри кружка)</label><select id="c-parentclub"><option value="">— это отдельный кружок —</option>'+D.classes.filter(x=>x.type==='club').map(x=>'<option value="'+x.id+'">'+e(x.name)+'</option>').join('')+'</select></div>'+
  '<label>Предмет</label><input id="c-subj" value="География">'+
  '<label>Учебный год</label><input id="c-year" value="'+e(D.settings.academicYear)+'">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewClass()">Создать</button><button onclick="closeModal()">Отмена</button></div>');
}
function toggleClassTypeFields(){
 let isClub=document.getElementById('c-type').value==='club';
 document.getElementById('c-fields-class').style.display=isClub?'none':'block';
 document.getElementById('c-fields-club').style.display=isClub?'block':'none';
}
function saveNewClass(){
 let type=document.getElementById('c-type').value;
 let name,gradeNumber=null,gradeLetter='',parentClubId=null;
 if(type==='club'){
  name=document.getElementById('c-clubname').value.trim();
  if(!name){alert('Укажите название кружка.');return}
  parentClubId=document.getElementById('c-parentclub').value||null;
 }else{
  let num=document.getElementById('c-gradenum').value.trim();
  let letter=document.getElementById('c-gradeletter').value.trim();
  if(!num){alert('Укажите номер класса.');return}
  gradeNumber=+num;gradeLetter=letter;
  name=num+letter;
 }
 D.classes.push({id:uid(),type,name,gradeNumber,gradeLetter,parentClubId,subject:document.getElementById('c-subj').value.trim(),academicYear:document.getElementById('c-year').value.trim(),customFields:{}});
 save();closeModal();render();
}
function openEditClass(id){
 let c=C(id);
 let cf=D.settings.fields.class.filter(f=>f.visible);
 let isClub=c.type==='club';
 setModalHtml('Редактировать класс',
  '<label>Тип</label><select id="c-type" onchange="toggleClassTypeFields()"><option value="class"'+(!isClub?' selected':'')+'>Класс (урок)</option><option value="club"'+(isClub?' selected':'')+'>Кружок / секция</option></select>'+
  '<div id="c-fields-class" style="display:'+(isClub?'none':'block')+'"><div class="row"><div><label>Номер класса</label><input id="c-gradenum" type="number" min="1" max="11" value="'+(c.gradeNumber||'')+'"></div><div><label>Литера</label><input id="c-gradeletter" value="'+e(c.gradeLetter||'')+'"></div></div></div>'+
  '<div id="c-fields-club" style="display:'+(isClub?'block':'none')+'"><label>Название кружка / группы</label><input id="c-clubname" value="'+e(isClub?c.name:'')+'">'+
   '<label>Родительский кружок (необязательно — если это группа внутри кружка)</label><select id="c-parentclub"><option value="">— это отдельный кружок —</option>'+D.classes.filter(x=>x.type==='club'&&x.id!==c.id).map(x=>'<option value="'+x.id+'"'+(c.parentClubId===x.id?' selected':'')+'>'+e(x.name)+'</option>').join('')+'</select></div>'+
  '<label>Предмет</label><input id="c-subj" value="'+e(c.subject)+'">'+
  '<label>Учебный год</label><input id="c-year" value="'+e(c.academicYear)+'">'+
  cf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('cf_'+f.key,f,c.customFields[f.key])).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditClass(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteClassConfirm(\''+id+'\')">Удалить класс</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveEditClass(id){
 let c=C(id);
 c.type=document.getElementById('c-type').value;
 if(c.type==='club'){
  let name=document.getElementById('c-clubname').value.trim();
  if(!name){alert('Укажите название кружка.');return}
  c.name=name;c.gradeNumber=null;c.gradeLetter='';
  c.parentClubId=document.getElementById('c-parentclub').value||null;
 }else{
  let num=document.getElementById('c-gradenum').value.trim();
  let letter=document.getElementById('c-gradeletter').value.trim();
  if(!num){alert('Укажите номер класса.');return}
  c.gradeNumber=+num;c.gradeLetter=letter;c.name=num+letter;
  c.parentClubId=null;
 }
 c.subject=document.getElementById('c-subj').value.trim();
 c.academicYear=document.getElementById('c-year').value.trim();
 D.settings.fields.class.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('cf_'+f.key);if(el)c.customFields[f.key]=readFieldValue(f,el)});
 save();closeModal();render();
}
function deleteClassConfirm(id){
 if(!confirm('Удалить класс и все его уроки? Ученики не удалятся — они просто отвяжутся от этого класса (если учатся ещё где-то, останутся там). Действие необратимо.'))return;
 D.lessons=D.lessons.filter(l=>l.classId!==id);
 D.students.forEach(s=>{s.classIds=(s.classIds||[]).filter(cid=>cid!==id)});
 D.classes.forEach(c=>{if(c.parentClubId===id)c.parentClubId=null});
 D.classes=D.classes.filter(c=>c.id!==id);
 save();closeModal();S.view='home';render();
}
function classStats(cid){
 let ls=groupLessons(cid).filter(l=>!l.cancelled);
 let ps=peopleGroup(cid);
 let gradeVals=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{let n=gradeNumericValue(g.value);if(n!==null)gradeVals.push(n)}));
 let attendancePct=avgAttendancePctPerLesson(ls);
 let absencesCount=0;ls.forEach(l=>Object.values(l.attendance||{}).forEach(v=>{if(v==='н')absencesCount++}));
 return {
  studentsCount:ps.length,lessonsCount:ls.length,
  planned:ls.filter(l=>lessonStatus(l)==='red').length,
  partial:ls.filter(l=>lessonStatus(l)==='yellow').length,
  prepared:ls.filter(l=>lessonStatus(l)==='blue').length,
  done:ls.filter(l=>lessonStatus(l)==='green').length,
  avgGrade:avg(gradeVals),gradesCount:gradeVals.length,
  attendancePct:attendancePct===null?null:Math.round(attendancePct*10)/10,
  absences:absencesCount
 };
}
function homeroomTeacherLine(c){
 let f=D.settings.fields.class.find(x=>x.type==='colleagueLink');
 if(!f)return'';
 let colId=c.customFields[f.key];
 if(!colId)return'';
 let col=D.colleagues.find(x=>x.id===colId);
 if(!col)return'';
 return ' · '+e(f.label)+': <span class="click" onclick="openColleagueCard(\''+col.id+'\')">'+colleagueFio(col)+(colleagueField(col,'position')?' · '+e(colleagueField(col,'position')):'')+' →</span>';
}
function classPage(){
 let c=C(S.classId);
 if(!c)return '<div class="empty">Класс не найден.</div>';
 let ps=peopleGroup(c.id);
 let ls=groupLessons(c.id).sort((a,b)=>b.date.localeCompare(a.date));
 let st=classStats(c.id);
 let groupNote=hasChildGroups(c.id)?'<div class="small muted" style="margin-top:4px">Общие данные: уроки, ученики и статистика всех групп кружка ('+groupIds(c.id).slice(1).map(id=>e(C(id).name)).join(', ')+')</div>':'';
 let cf=D.settings.fields.class.filter(f=>f.visible);
 return '<div class="top"><div><h1>'+e(c.name)+' '+(c.type==='club'?'<span class="badge blue">Кружок</span>':'')+'</h1><div class="muted">'+e(c.subject)+' · '+e(c.academicYear)+homeroomTeacherLine(c)+'</div>'+groupNote+'</div>'+
  '<div class="toolbar"><button onclick="openEditClass(\''+c.id+'\')">Редактировать</button><button class="primary" onclick="openNewLesson(\''+c.id+'\')">＋ Новый урок</button></div></div>'+
  '<div class="grid">'+stat(st.studentsCount,'Учеников')+stat(st.lessonsCount,'Уроков')+stat(round2(st.avgGrade),'Средняя оценка')+stat(st.attendancePct===null?'—':st.attendancePct+'%','Посещаемость')+
   stat('🔴 '+st.planned+' 🟡 '+st.partial+' 🔵 '+st.prepared+' 🟢 '+st.done,'Статусы уроков')+'</div>'+
  classChartsCard(c.id,ls)+
  '<div class="tabs">'+[['lessons','Уроки'],['students','Ученики'],['grades','Оценки'],['seating','Рассадка'],['timetable','Расписание класса'],['info','Карточка класса']].map(x=>'<button class="'+(S.tab===x[0]?'active':'')+'" onclick="S.tab=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  (S.tab==='lessons'?classLessonsTab(ls):S.tab==='students'?classStudentsTab(c,ps):S.tab==='grades'?classGradesTab(c,ps,ls):S.tab==='seating'?classSeatingTab(c):S.tab==='timetable'?classTimetableTab(c):classInfoTab(c,cf));
}
function classTimetableTab(c){
 c.timetable=c.timetable||{};
 let days=D.settings.showSaturday?['Пн','Вт','Ср','Чт','Пт','Сб']:['Пн','Вт','Ср','Чт','Пт'];
 let rows=LESSON_TIMES.map(t=>{
  let cells=days.map((d,di)=>{
   let key=di+'_'+t.n;
   let val=c.timetable[key]||'';
   return '<td class="click" style="min-width:100px;text-align:center" onclick="editTimetableCell(\''+c.id+'\',\''+key+'\')">'+(val?e(val):'<span class="muted small">+</span>')+'</td>';
  }).join('');
  return '<tr><td class="numcol">'+t.n+'<br><span class="small">'+t.start+'–'+t.end+'</span></td>'+cells+'</tr>';
 }).join('');
 return classRecurringScheduleSection(c)+
  '<div class="card"><h2>Расписание класса</h2><p class="muted small">Отдельная таблица только для этого класса — можно вписать полное расписание по всем предметам (не только по вашим урокам). Заполняется вручную, кликните по ячейке.</p>'+
  '<table class="sched"><tr><th class="numcol">№</th>'+days.map(d=>'<th>'+d+'</th>').join('')+'</tr>'+rows+'</table></div>';
}
function classRecurringScheduleSection(c){
 c.recurringSlots=c.recurringSlots||[];
 let isClub=c.type==='club';
 let dayNames=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
 let sorted=[...c.recurringSlots].sort((a,b)=>a.day-b.day||(a.period||0)-(b.period||0)||(a.startTime||'').localeCompare(b.startTime||''));
 return '<div class="card"><h2>Периодичность '+(isClub?'занятий':'уроков')+' (авторасстановка)</h2>'+
  '<p class="muted small">Укажите, по каким дням '+(isClub?'обычно проходит это занятие':'у вас обычно проходит этот класс')+' — а затем одним нажатием проставьте пустые '+(isClub?'занятия':'уроки')+' (без темы) на всю выбранную четверть.</p>'+
  (sorted.length?'<table class="table"><tr><th>День</th><th>'+(isClub?'Время':'№ урока')+'</th><th></th></tr>'+
   sorted.map(slot=>{let idx=c.recurringSlots.indexOf(slot);let timeLabel=isClub?(e(slot.startTime||'')+'–'+e(slot.endTime||'')):(slot.period+' ('+timeFor(slot.period).start+'–'+timeFor(slot.period).end+')');return '<tr><td>'+dayNames[slot.day]+'</td><td>'+timeLabel+'</td><td><button class="danger" onclick="removeRecurringSlot(\''+c.id+'\','+idx+')">Удалить</button></td></tr>'}).join('')+'</table>':'<div class="empty">Периодичность пока не задана.</div>')+
  '<div class="toolbar" style="margin-top:10px"><button onclick="openAddRecurringSlot(\''+c.id+'\')">＋ Добавить день'+(isClub?'/время':'/урок')+'</button>'+(sorted.length?'<button class="primary" onclick="openApplyRecurringToQuarter(\''+c.id+'\')">📅 Проставить '+(isClub?'занятия':'уроки')+' на четверть</button>':'')+'</div>'+
  '</div>';
}
function openAddRecurringSlot(classId){
 let c=C(classId);
 let isClub=c&&c.type==='club';
 setModalHtml('Добавить день'+(isClub?' и время':' и урок'),
  '<label>День недели</label><select id="rs-day"><option value="0">Понедельник</option><option value="1">Вторник</option><option value="2">Среда</option><option value="3">Четверг</option><option value="4">Пятница</option>'+(D.settings.showSaturday?'<option value="5">Суббота</option>':'')+'</select>'+
  (isClub?
   '<label>Время начала</label><input id="rs-start" type="time" value="15:00">'+
   '<label>Время окончания</label><input id="rs-end" type="time" value="15:40">'
   :
   '<label>№ урока</label><select id="rs-period">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'">'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select>'
  )+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveRecurringSlot(\''+classId+'\')">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveRecurringSlot(classId){
 let c=C(classId);
 c.recurringSlots=c.recurringSlots||[];
 let day=+document.getElementById('rs-day').value;
 if(c.type==='club'){
  let startTime=document.getElementById('rs-start').value,endTime=document.getElementById('rs-end').value;
  if(!startTime||!endTime){alert('Укажите время начала и окончания.');return}
  if(c.recurringSlots.some(s=>s.day===day&&s.startTime===startTime)){alert('Такой день и время уже добавлены.');closeModal();return}
  c.recurringSlots.push({day,startTime,endTime});
 }else{
  let period=+document.getElementById('rs-period').value;
  if(c.recurringSlots.some(s=>s.day===day&&s.period===period)){alert('Такой день и урок уже добавлены.');closeModal();return}
  c.recurringSlots.push({day,period});
 }
 save();closeModal();render();
}
function removeRecurringSlot(classId,idx){
 let c=C(classId);
 c.recurringSlots.splice(idx,1);
 save();render();
}
function openApplyRecurringToQuarter(classId){
 let quarters=D.settings.quarters||[];
 if(!quarters.length){alert('Сначала настройте границы четвертей: Настройки → Расписание / блокировки → «Четверти учебного года».');return}
 setModalHtml('Проставить уроки на четверть',
  '<label>Четверть</label><select id="rq-quarter">'+quarters.map(q=>'<option value="'+q.id+'">'+e(q.name)+' ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+')</option>').join('')+'</select>'+
  '<div class="notice">Уроки будут созданы пустыми (без темы) на каждую дату четверти, попадающую под заданную периодичность. Занятые или заблокированные слоты будут пропущены.</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmApplyRecurringToQuarter(\''+classId+'\')">Создать уроки</button><button onclick="closeModal()">Отмена</button></div>');
}
function confirmApplyRecurringToQuarter(classId){
 let c=C(classId);
 let isClub=c.type==='club';
 let qid=document.getElementById('rq-quarter').value;
 let q=(D.settings.quarters||[]).find(x=>x.id===qid);
 if(!q)return;
 let created=0,skipped=0;
 let cur=q.startDate;
 while(cur<=q.endDate){
  let dayIdx=dayIndexOfDate(cur);
  if(dayIdx<=5){
   (c.recurringSlots||[]).filter(s=>s.day===dayIdx).forEach(slot=>{
    if(isClub){
     let blk=findBlock(cur,null);
     if(blk){skipped++;return}
     if(activeLessons().find(x=>x.date===cur&&!x.lessonNumber&&x.classId===classId&&x.startTime===slot.startTime)){skipped++;return}
     D.lessons.push({id:uid(),date:cur,lessonNumber:null,startTime:slot.startTime,endTime:slot.endTime,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]});
     created++;
    }else{
     let blk=findBlock(cur,slot.period);
     if(blk){skipped++;return}
     if(activeLessons().find(x=>x.date===cur&&+x.lessonNumber===slot.period)){skipped++;return}
     let time=timeFor(slot.period);
     D.lessons.push({id:uid(),date:cur,lessonNumber:slot.period,startTime:time.start,endTime:time.end,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]});
     created++;
    }
   });
  }
  cur=addDays(cur,1);
 }
 save();closeModal();
 alert('Создано пустых '+(isClub?'занятий':'уроков')+': '+created+(skipped?'. Пропущено (заняты/заблокированы): '+skipped:''));
 render();
}
function editTimetableCell(classId,key){
 let c=C(classId);
 c.timetable=c.timetable||{};
 let cur=c.timetable[key]||'';
 let val=prompt('Предмет / занятие:',cur);
 if(val===null)return;
 if(val.trim())c.timetable[key]=val.trim();else delete c.timetable[key];
 save();render();
}
function classLessonsTab(ls){
 let multi=ls.some(l=>l.classId!==S.classId);
 let chronological=[...ls].sort((a,b)=>a.date.localeCompare(b.date)||(a.lessonNumber||0)-(b.lessonNumber||0));
 let seqById={};
 chronological.forEach((l,i)=>{seqById[l.id]=i+1});
 return '<div class="card"><div class="top"><h2>Уроки</h2><div class="toolbar"><button onclick="openPrintQuarterPlanOptions(\''+S.classId+'\')">🖨 Печать плана на четверть</button></div></div>'+(ls.length?'<table class="table"><tr><th>№ по классу</th><th>Дата</th>'+(multi?'<th>Группа</th>':'')+'<th>Тема</th><th>№ по КТП</th><th>Дата по КТП</th><th>Статус</th></tr>'+
  ls.map(l=>{
   let ktpNum=l.customFields&&l.customFields.ktpNumber;
   let ktpDate=l.customFields&&l.customFields.ktpDate;
   let behind=ktpDate&&l.date>ktpDate;
   let ktpDateCell=ktpDate?fmtDate(ktpDate)+(behind?' <span class="danger small">⚠ отстаём</span>':''):'—';
   return '<tr class="click" onclick="openLessonModal(\''+l.id+'\')"><td>'+seqById[l.id]+'</td><td>'+fmtDate(l.date)+'</td>'+(multi?'<td>'+e(C(l.classId)?C(l.classId).name:'—')+'</td>':'')+'<td>'+e(l.topic||'(без темы)')+'</td><td>'+(ktpNum||'—')+'</td><td>'+ktpDateCell+'</td><td>'+statusBadge(l)+'</td></tr>';
  }).join('')+'</table>':'<div class="empty">Уроков пока нет.</div>')+'</div>';
}
function openPrintQuarterPlanOptions(classId){
 let quarters=D.settings.quarters||[];
 let today=toISO(new Date());
 setModalHtml('Печать плана уроков',
  (quarters.length?
   '<label>Период</label><select id="pq-quarter" onchange="document.getElementById(\'pq-custom-wrap\').style.display=this.value===\'custom\'?\'\':\'none\'">'+
    quarters.map(q=>'<option value="'+q.id+'">'+e(q.name)+' ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+')</option>').join('')+
    '<option value="custom">Свой период…</option></select>'
   :'<div class="notice">Четверти пока не настроены (Настройки → Расписание/блокировки → «Четверти учебного года») — укажите даты вручную.</div>')+
  '<div id="pq-custom-wrap" style="'+(quarters.length?'display:none':'')+'"><label>С какой даты</label><input type="date" id="pq-from" value="'+e(today)+'"><label>По какую дату</label><input type="date" id="pq-to" value="'+e(today)+'"></div>'+
  '<div class="notice" style="margin-top:12px">Выберите, что включить в табличку:</div>'+
  '<label class="attrow" style="cursor:pointer"><span>№ урока по расписанию</span><input type="checkbox" id="pq-num" checked style="width:auto"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>Тема урока</span><input type="checkbox" id="pq-topic" checked style="width:auto"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>Домашнее задание</span><input type="checkbox" id="pq-hw" checked style="width:auto"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>План урока</span><input type="checkbox" id="pq-plan" style="width:auto"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>Остальные заполненные поля урока</span><input type="checkbox" id="pq-extra" style="width:auto"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>Включать отменённые уроки</span><input type="checkbox" id="pq-cancelled" style="width:auto"></label>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="printQuarterPlan(\''+classId+'\')">🖨 Печать</button><button onclick="closeModal()">Отмена</button></div>');
}
function printQuarterPlan(classId){
 let c=C(classId);if(!c)return;
 let quarters=D.settings.quarters||[];
 let from,to,periodLabel;
 let qSel=document.getElementById('pq-quarter');
 if(qSel&&qSel.value!=='custom'){
  let q=quarters.find(x=>x.id===qSel.value);
  if(!q)return;
  from=q.startDate;to=q.endDate;periodLabel=q.name+' ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+')';
 }else{
  from=document.getElementById('pq-from').value;to=document.getElementById('pq-to').value;
  if(!from||!to){alert('Укажите обе даты периода.');return}
  periodLabel=fmtDate(from)+' – '+fmtDate(to);
 }
 let opts={num:document.getElementById('pq-num').checked,topic:document.getElementById('pq-topic').checked,hw:document.getElementById('pq-hw').checked,plan:document.getElementById('pq-plan').checked,extra:document.getElementById('pq-extra').checked,cancelled:document.getElementById('pq-cancelled').checked};
 closeModal();
 let body='<h1>План уроков — '+e(c.name)+'</h1><p class="muted">'+e(c.subject)+' · '+e(periodLabel)+'</p>'+quarterPlanTableHtml(c,from,to,opts);
 openPrintWindow(printDocTitle([c.subject],'План уроков — '+c.name),body);
}
function classStudentsTab(c,ps){
 let sorted=sortStudentsList(ps,S.studentSort);
 return '<div class="card"><div class="top"><h2>Ученики класса</h2><div class="toolbar"><button onclick="openMassAdd(\''+c.id+'\')">＋ Массово</button><button class="primary" onclick="openNewStudent(\''+c.id+'\')">＋ Добавить ученика</button></div></div>'+
  '<div class="toolbar" style="margin-bottom:10px">'+studentSortSelect('setStudentSort')+'<button class="danger" onclick="deleteSelectedStudents()" '+(S.selectedStudentIds.size?'':'disabled')+'>Удалить выбранных ('+S.selectedStudentIds.size+')</button><button class="danger" onclick="deleteAllStudentsInTable(\'class-student-table\')">Удалить всех в списке</button></div>'+studentTable(sorted,'class-student-table')+'</div>';
}
const QUARTER_MIN_GRADES=3;
function resolveGradesQuarter(){
 let qs=D.settings.quarters||[];
 let cur=S.gradesQuarter;
 if(cur==='all')return 'all';
 if(cur&&qs.find(q=>q.id===cur))return cur;
 let today=toISO(new Date());
 let q=qs.find(x=>x.startDate<=today&&today<=x.endDate);
 return q?q.id:'all';
}
function setGradesQuarter(v){S.gradesQuarter=v;render()}
function quarterAvgForStudent(sid,lessons){
 let vals=[];
 lessons.forEach(l=>{let g=(l.grades||{})[sid];if(g){let n=gradeNumericValue(g.value);if(n!==null)vals.push(n)}});
 return {count:vals.length,avg:avg(vals)};
}
function classGradesTab(c,ps,ls){
 let qs=D.settings.quarters||[];
 let qSel=resolveGradesQuarter();
 let q=qSel==='all'?null:qs.find(x=>x.id===qSel);
 let lsAsc=[...ls].filter(l=>!l.cancelled&&(!q||(l.date>=q.startDate&&l.date<=q.endDate))).sort((a,b)=>a.date.localeCompare(b.date));
 let sorted=sortStudentsList(ps,S.studentSort);
 let multiG=lsAsc.some(l=>l.classId!==c.id);
 let hasHS=ps.some(s=>s.homeschool);
 let avgLabel=q?'Четвертная':'Средняя';
 let quarterSelect=qs.length?'<label style="margin:0;flex:0"><span class="small muted">Период:</span><select onchange="setGradesQuarter(this.value)">'+qs.map(x=>'<option value="'+x.id+'"'+(qSel===x.id?' selected':'')+'>'+e(x.name)+'</option>').join('')+'<option value="all"'+(qSel==='all'?' selected':'')+'>Весь период</option></select></label>':'';
 let noQuarterNote=!qs.length?'<div class="notice">Четверти не настроены (Настройки → Расписание / блокировки → «Четверти учебного года»), поэтому показана общая средняя за весь период. После настройки четвертей здесь появится выбор четверти и четвертная оценка (минимум '+QUARTER_MIN_GRADES+' оценки за четверть).</div>':'';
 let hint=q?'<div class="muted small" style="margin-bottom:8px">Четвертная оценка — среднее всех оценок за период «'+e(q.name)+'» ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+'). Считается, если за четверть есть минимум '+QUARTER_MIN_GRADES+' оценки; иначе показывается «—».</div>':'';
 let toolbar='<div class="top"><h2>Оценки</h2><div class="toolbar">'+quarterSelect+studentSortSelect('setStudentSort')+
  (hasHS?'<label class="attrow" style="cursor:pointer;margin:0 6px"><span class="small">🏠 с дом. обучением</span><input type="checkbox" '+(S.classPrintIncludeHomeschool?'checked':'')+' onchange="S.classPrintIncludeHomeschool=this.checked;render()" style="width:auto"></label>':'')+
  '<button onclick="openPrintClassGrades(\''+c.id+'\')">🖨 Печать ведомости</button></div></div>';
 if(!ls.filter(l=>!l.cancelled).length)return '<div class="card empty">Уроков пока нет.</div>';
 if(!lsAsc.length)return '<div class="card">'+toolbar+noQuarterNote+'<div class="empty">В выбранном периоде уроков нет.</div></div>';
 return '<div class="card" style="overflow:auto">'+toolbar+noQuarterNote+hint+'<table class="table"><tr><th>Ученик</th>'+lsAsc.map(l=>'<th>'+fmtDateShort(l.date)+(multiG&&C(l.classId)?'<br><span class="muted small">'+e(C(l.classId).name)+'</span>':'')+'</th>').join('')+'<th style="border-left:2px solid var(--border)">'+avgLabel+'</th></tr>'+
  sorted.map(s=>{
   let r=quarterAvgForStudent(s.id,lsAsc);
   let enough=!q||r.count>=QUARTER_MIN_GRADES;
   let cell;
   if(r.avg!==null&&enough)cell='<b>'+round2(r.avg)+'</b> <span class="muted small" title="Оценок в расчёте">('+r.count+')</span>';
   else cell='<span class="muted" title="Для четвертной нужно минимум '+QUARTER_MIN_GRADES+' оценки, сейчас: '+r.count+'">— <span class="small">('+r.count+' из '+QUARTER_MIN_GRADES+')</span></span>';
   return '<tr><td>'+studentFio(s)+'</td>'+lsAsc.map(l=>{let g=(l.grades||{})[s.id];let a=(l.attendance||{})[s.id];return '<td>'+(g?e(gradeText(g)):(a==='н'?'Н':''))+'</td>'}).join('')+'<td style="border-left:2px solid var(--border);white-space:nowrap">'+cell+'</td></tr>';
  }).join('')+
  '</table></div>';
}
function classChartsCard(classId,_ls){
 let range=chartPeriodRange('class');
 let ls=groupLessons(classId).filter(l=>!l.cancelled&&l.date>=range.from&&l.date<=range.to).sort((a,b)=>a.date.localeCompare(b.date));
 let distVals=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{if(g.value)distVals.push(g.value)}));
 let attPct=avgAttendancePctPerLesson(ls);
 let trendPoints=ls.filter(l=>Object.values(l.grades||{}).some(g=>gradeNumericValue(g.value)!==null)).map(l=>({y:avg(Object.values(l.grades).map(g=>gradeNumericValue(g.value)).filter(n=>n!==null)),label:fmtDateShort(l.date)}));
 return periodPickerHtml('class')+
  '<div class="card"><h3 style="margin-top:0">Динамика средней оценки по урокам</h3>'+svgLineChart(trendPoints,{width:680,height:190})+'</div>'+
  '<div class="card"><h3 style="margin-top:0">Распределение оценок <span class="muted small">(нажмите на столбец, чтобы увидеть кому и когда)</span></h3>'+svgBarChart(gradeDistData(distVals,'class',classId,range.from,range.to),{width:900,height:260})+'</div>'+
  '<div class="card"><h3 style="margin-top:0">Посещаемость <span class="muted small">(нажмите, чтобы увидеть кто и когда пропускал)</span></h3>'+donutChartPct(attPct,140,"showAttendanceBreakdown('class','"+classId+"','"+range.from+"','"+range.to+"')")+'</div>';
}
function classFieldSectionHtml(f,val){
 if(f.type==='colleagueLink'){
  if(!val)return'';
  let col=D.colleagues.find(x=>x.id===val);
  if(!col)return'';
  return '<h3>'+e(f.label)+'</h3><div class="val"><span class="click" onclick="openColleagueCard(\''+col.id+'\')">'+colleagueFio(col)+(colleagueField(col,'position')?' · '+e(colleagueField(col,'position')):'')+' →</span></div>';
 }
 return section(f.label,customFieldView(f,val));
}
function classInfoTab(c,cf){
 return '<div class="card field-view"><h2>Карточка класса</h2><div class="grid"><div><b>Название</b><br>'+e(c.name)+'</div><div><b>Предмет</b><br>'+e(c.subject)+'</div><div><b>Учебный год</b><br>'+e(c.academicYear)+'</div></div>'+
  cf.map(f=>classFieldSectionHtml(f,c.customFields[f.key])).join('')+'</div>';
}
function openClass(id){S.view='class';S.classId=id;S.tab='lessons';render()}

/* ===================== РАССАДКА ===================== */
function studentFioShort(s){return e(s.lastName)+' '+e(s.firstName)}
function seatDisplayName(s){
 let nick=s.customFields&&s.customFields.nickname&&s.customFields.nickname.trim();
 return nick?e(nick):studentFioShort(s);
}
function isAbsentOnLesson(l,sid){return !!l&&(l.attendance||{})[sid]==='н'}
function seatingGridHtml(c,editable,att){
 let seating=c.seating;
 let grid='<div class="seat-grid">';
 for(let r=0;r<seating.rows;r++){
  grid+='<div class="seat-row">';
  for(let col=0;col<seating.cols;col++){
   grid+='<div class="seat-desk">';
   for(let s=0;s<seating.seatsPerDesk;s++){
    let key=r+'_'+col+'_'+s;
    let sid=seating.seats[key];
    let student=sid?P(sid):null;
    let cls='seat-box '+(student?'filled':'empty')+(student&&att&&att[student.id]==='н'?' absent':'');
    grid+='<div class="'+cls+'"'+(editable?' onclick="openSeatPicker(\''+c.id+'\',\''+key+'\')"':'')+'>'+(student?seatDisplayName(student):'+')+'</div>';
   }
   grid+='</div>';
  }
  grid+='</div>';
 }
 grid+='<div class="muted small" style="text-align:center;margin-top:8px">— доска —</div>';
 grid+='</div>';
 return grid;
}
function classSeatingTab(c){
 if(!c.seating)return '<div class="card"><div class="empty">Рассадка для этого класса ещё не создана.<br><span class="small">Кабинеты и предметы у вас разные — поэтому схема настраивается отдельно для каждого класса.</span></div><div class="toolbar" style="justify-content:center;margin-top:10px"><button class="primary" onclick="openSeatingConfig(\''+c.id+'\')">＋ Добавить рассадку</button></div></div>';
 let ps=people(c.id);
 let seatedIds=new Set(Object.values(c.seating.seats));
 let unseated=ps.filter(s=>!seatedIds.has(s.id));
 return '<div class="card"><div class="top"><h2>Рассадка</h2><div class="toolbar"><button onclick="openSeatingConfig(\''+c.id+'\')">Изменить схему</button><button class="danger" onclick="deleteSeating(\''+c.id+'\')">Удалить рассадку</button></div></div>'+
  seatingGridHtml(c,true)+
  (unseated.length?'<div class="muted small" style="margin-top:14px">Ещё не рассажены: '+unseated.map(s=>studentFio(s)).join(', ')+'</div>':'')+
  '</div>';
}
function openSeatingConfig(classId){
 let c=C(classId);
 let cur=c.seating||{rows:5,cols:3,seatsPerDesk:2};
 setModalHtml('Настройка рассадки',
  '<div class="notice">Например: 5 рядов по 3 парты, по 2 человека за партой.</div>'+
  '<label>Количество рядов</label><input id="sc-rows" type="number" min="1" max="12" value="'+cur.rows+'">'+
  '<label>Парт в ряду</label><input id="sc-cols" type="number" min="1" max="12" value="'+cur.cols+'">'+
  '<label>Мест за партой</label><input id="sc-seats" type="number" min="1" max="4" value="'+cur.seatsPerDesk+'">'+
  (c.seating?'<div class="notice">Изменение схемы очистит текущую рассадку учеников по местам.</div>':'')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveSeatingConfig(\''+classId+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveSeatingConfig(classId){
 let c=C(classId);
 let rows=Math.max(1,+document.getElementById('sc-rows').value||1);
 let cols=Math.max(1,+document.getElementById('sc-cols').value||1);
 let seatsPerDesk=Math.max(1,+document.getElementById('sc-seats').value||1);
 c.seating={rows,cols,seatsPerDesk,seats:{}};
 save();closeModal();render();
}
function deleteSeating(classId){
 if(!confirm('Удалить схему рассадки для этого класса?'))return;
 C(classId).seating=null;save();render();
}
function openSeatPicker(classId,seatKey){
 let c=C(classId);
 let seated=new Set(Object.values(c.seating.seats));
 let currentId=c.seating.seats[seatKey];
 let available=people(classId).filter(s=>s.id===currentId||!seated.has(s.id));
 setModalHtml('Кто сидит на этом месте?',
  (available.length?'<div class="checks">'+available.map(s=>'<div class="attrow click" onclick="assignSeat(\''+classId+'\',\''+seatKey+'\',\''+s.id+'\')"><span>'+studentFio(s)+'</span>'+(s.id===currentId?'<span class="badge blue">сейчас здесь</span>':'')+'</div>').join('')+'</div>':'<div class="muted small">Все ученики класса уже рассажены.</div>')+
  (currentId?'<div class="toolbar" style="margin-top:10px"><button class="danger" onclick="assignSeat(\''+classId+'\',\''+seatKey+'\',\'\')">Убрать с места</button><button onclick="closeModal()">Отмена</button></div>':'<div class="toolbar" style="margin-top:10px"><button onclick="closeModal()">Отмена</button></div>'));
}
function assignSeat(classId,seatKey,studentId){
 let c=C(classId);
 if(studentId)c.seating.seats[seatKey]=studentId; else delete c.seating.seats[seatKey];
 save();closeModal();render();
}
function presentName(s){
 let nick=s.customFields&&s.customFields.nickname&&String(s.customFields.nickname).trim();
 return nick?e(nick):studentFio(s);
}
function presentNamePlain(s){
 let nick=s.customFields&&s.customFields.nickname&&String(s.customFields.nickname).trim();
 return nick||studentFioPlain(s);
}
function fmtPresentClock(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0')}
function startLessonPresent(id){
 closeModal();
 S.lessonPresentId=id;
 renderPresentMode();
 let aw=document.getElementById('assistant-wrap');if(aw)aw.style.display='none';
 let at=document.getElementById('assistant-toggle');if(at)at.style.display='none';
}
function closeLessonPresent(){
 S.lessonPresentId=null;
 if(window._presentInterval){clearInterval(window._presentInterval);window._presentInterval=null}
 document.getElementById('present').innerHTML='';
 let aw=document.getElementById('assistant-wrap');if(aw)aw.style.display='';
 let at=document.getElementById('assistant-toggle');if(at)at.style.display='';
}
function whoGradeCounts(g){return !!g&&(gradeNumericValue(g.value)!==null||(g.points!=null&&g.points!==''))}
function studentGradedLessonsForClass(sid,classId){
 return groupLessons(classId).filter(l=>!l.cancelled&&whoGradeCounts((l.grades||{})[sid])).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
}
function studentGradesCountForClass(sid,classId){return studentGradedLessonsForClass(sid,classId).length}
function widgetWhoToAsk(cls,lessonId){
 let l0=L(lessonId);
 let all=l0?presentEligiblePeople(l0):attendablePeople(cls.id);
 if(!all.length)return'';
 let done=x=>l0&&(((l0.grades||{})[x.id])||((l0.asked||{})[x.id]));
 let ps=all.filter(x=>!done(x));
 if(!ps.length)return '<div class="card"><h3 style="margin-top:0">Кого спросить сегодня</h3><div class="muted small">Все присутствующие уже спрошены на этом уроке ✓</div></div>';
 let withData=ps.map(x=>({s:x,gradesCount:studentGradesCountForClass(x.id,cls.id),lastAsked:x.lastAskedAt||'0000-01-01'}));
 let byGrades=[...withData].sort((a,b)=>a.gradesCount-b.gradesCount||a.lastAsked.localeCompare(b.lastAsked));
 let reqA=byGrades[0];
 let byAsked=[...withData].filter(x=>x.s.id!==reqA.s.id).sort((a,b)=>a.lastAsked.localeCompare(b.lastAsked)||a.gradesCount-b.gradesCount);
 let reqB=byAsked.length?byAsked[0]:null;
 let rest=withData.filter(x=>x.s.id!==reqA.s.id&&(!reqB||x.s.id!==reqB.s.id));
 S.askRandom=S.askRandom||{};
 let randomPick=rest.find(x=>x.s.id===S.askRandom[lessonId])||null;
 if(!randomPick&&rest.length){randomPick=rest[Math.floor(Math.random()*rest.length)];S.askRandom[lessonId]=randomPick.s.id}
 if(!randomPick)delete S.askRandom[lessonId];
 function row(item,label,reroll){
  if(!item)return'';
  let sid=item.s.id;
  let graded=studentGradedLessonsForClass(sid,cls.id);
  let recent=graded.slice(-4).map(x=>e(x.grades[sid].value!==''&&x.grades[sid].value!=null?x.grades[sid].value:gradePointsText(x.grades[sid]))).join(', ');
  let args='\''+sid+'\',\''+lessonId+'\'';
  return '<div style="padding:9px 0;border-bottom:1px solid var(--border)">'+
   '<div style="display:flex;justify-content:space-between;gap:6px"><span title="'+e(studentFioPlain(item.s))+'"><b>'+presentName(item.s)+'</b> <span class="muted small">· '+label+'</span></span>'+(reroll?'<button title="Выбрать другого" onclick="S.askRandom[\''+lessonId+'\']=null;renderPresentMode()">🔄</button>':'')+'</div>'+
   '<div class="muted small">Оценок по предмету: '+graded.length+(recent?' · последние: '+recent:'')+'</div>'+
   '<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">'+gradeInputHtml('wa-g-'+sid,'')+
   '<input id="wa-c-'+sid+'" placeholder="Комментарий" style="flex:1;min-width:110px" onkeydown="if(event.key===\'Enter\')saveWhoGrade('+args+')">'+
   '<button class="primary" onclick="saveWhoGrade('+args+')">Поставить</button>'+
   '<button title="Спросил(а), без оценки" onclick="markWhoAsked('+args+')">без оценки</button>'+
   '<button title="Оценка с баллами" onclick="openQuickGradePopup('+args+')">⋯</button></div></div>';
 }
 return '<div class="card"><h3 style="margin-top:0">Кого спросить сегодня</h3>'+
  row(reqA,'меньше всего оценок')+
  (reqB?row(reqB,reqB.lastAsked!=='0000-01-01'?'давно не спрашивали (с '+fmtDate(reqB.lastAsked)+')':'ни разу не отмечен(а) как спрошен(а)'):'')+
  (randomPick?row(randomPick,'случайный вариант',true):'')+
  '</div>';
}
function saveWhoGrade(sid,lessonId){
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий.');renderPresentMode();return}
 let val=(document.getElementById('wa-g-'+sid)||{}).value;val=(val||'').trim();
 let comment=((document.getElementById('wa-c-'+sid)||{}).value||'').trim();
 if(!val){alert('Выберите или впишите оценку.');return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,'','');
 let st=P(sid);if(st)st.lastAskedAt=toISO(new Date());
 save();renderPresentMode();
}
function markWhoAsked(sid,lessonId){
 let l=L(lessonId);if(!l)return;
 l.asked=l.asked||{};l.asked[sid]=true;
 let st=P(sid);if(st)st.lastAskedAt=toISO(new Date());
 save();renderPresentMode();
}
function markAsked(sid){
 let s=P(sid);if(s){s.lastAskedAt=toISO(new Date());save();renderPresentMode()}
}
function openQuickGradePopup(sid,lessonId){
 let s=P(sid);if(!s)return;
 let old=document.getElementById('quick-grade-popup');if(old)old.remove();
 let l=L(lessonId);
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий на этом уроке.');return}
 let cur=l&&(l.grades||{})[sid];
 let popup=document.createElement('div');
 popup.id='quick-grade-popup';
 popup.className='modalbg';
 popup.style.zIndex='75';
 popup.innerHTML='<div class="modal" style="max-width:380px"><div class="top"><h2>'+presentName(s)+'</h2><button class="closebtn" onclick="closeQuickGradePopup()">×</button></div>'+
  '<label>Оценка (можно выбрать или вписать своё число)</label>'+gradeInputHtml('qg-grade',cur?cur.value:'')+
  '<label>Баллы (необязательно)</label><div class="row"><input id="qg-points" inputmode="decimal" placeholder="баллы" value="'+(cur&&cur.points!=null?e(fmtPts(cur.points)):'')+'" style="width:100px"><span>из</span><input id="qg-max" inputmode="decimal" placeholder="макс." value="'+e(cur&&cur.max?fmtPts(cur.max):(l&&l.gradeMax?fmtPts(l.gradeMax):''))+'" style="width:100px"></div>'+
  '<label>Комментарий</label><input id="qg-comment" value="'+(cur?e(cur.comment||''):'')+'" placeholder="Необязательно">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveQuickGrade(\''+sid+'\',\''+lessonId+'\')">Сохранить оценку</button></div>'+
  '<div class="toolbar" style="margin-top:6px"><button onclick="markAskedFromPopup(\''+sid+'\')">Просто отметить (без оценки)</button><button onclick="closeQuickGradePopup()">Отмена</button></div>'+
  '</div>';
 document.body.appendChild(popup);
 popup.onclick=function(ev){if(ev.target===popup)closeQuickGradePopup()};
}
function closeQuickGradePopup(){let el=document.getElementById('quick-grade-popup');if(el)el.remove()}
function saveQuickGrade(sid,lessonId){
 let gradeEl=document.getElementById('qg-grade');
 let val=gradeEl.value;
 let pts=document.getElementById('qg-points').value,mx=document.getElementById('qg-max').value;
 if(!val&&parsePts(pts)===null){alert('Выберите оценку или укажите баллы.');return}
 let comment=document.getElementById('qg-comment').value.trim();
 let l=L(lessonId);
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий — оценку поставить нельзя.');closeQuickGradePopup();renderPresentMode();return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,pts,mx);
 if(!l.gradeMax&&parsePts(mx)&&parsePts(pts)!==null)l.gradeMax=parsePts(mx);
 let s=P(sid);if(s)s.lastAskedAt=toISO(new Date());
 save();
 closeQuickGradePopup();
 renderPresentMode();
}
function markAskedFromPopup(sid){
 let s=P(sid);if(s){s.lastAskedAt=toISO(new Date())}
 if(S.lessonPresentId){let l=L(S.lessonPresentId);if(l){l.asked=l.asked||{};l.asked[sid]=true}}
 save();
 closeQuickGradePopup();
 renderPresentMode();
}
function presentEligiblePeople(l){return attendablePeople(l.classId).filter(s=>(l.attendance||{})[s.id]!=='н')}
function presentGradeForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 return '<div class="card"><h3 style="margin-top:0">Выставить оценку</h3>'+
  '<label>Ученик</label><select id="pg-student">'+ps.map(s=>'<option value="'+s.id+'">'+e(presentNamePlain(s))+((l.grades||{})[s.id]?' — уже: '+gradeText(l.grades[s.id]):'')+'</option>').join('')+'</select>'+
  '<label>Оценка (можно выбрать или вписать своё число)</label>'+gradeInputHtml('pg-grade','')+
  '<label>Баллы (необязательно)</label><div class="row"><input id="pg-points" inputmode="decimal" placeholder="баллы" style="width:100px"><span>из</span><input id="pg-max" inputmode="decimal" placeholder="макс." value="'+e(l.gradeMax?fmtPts(l.gradeMax):'')+'" style="width:100px"></div>'+
  '<label>Комментарий</label><input id="pg-comment" placeholder="Необязательно">'+
  '<div class="toolbar" style="margin-top:10px"><button class="primary" onclick="savePresentGrade(\''+l.id+'\')">Сохранить оценку</button></div>'+
  '</div>';
}
function presentAttendanceForm(l){
 let ps=attendablePeople(l.classId);
 if(!ps.length)return'';
 let att=l.attendance||{};
 return '<div class="card"><h3 style="margin-top:0">Посещаемость</h3><div class="checks">'+ps.map(s=>{let v=att[s.id]||'+';return '<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+'</span><button type="button" class="attbtn '+(v==='н'?'absent':'present')+'" onclick="togglePresentAttendance(\''+l.id+'\',\''+s.id+'\',this)">'+v+'</button></div>'}).join('')+'</div></div>';
}
function togglePresentAttendance(lessonId,sid,btn){
 let l=L(lessonId);if(!l)return;
 l.attendance=l.attendance||{};
 let cur=l.attendance[sid]||'+';
 let nv=cur==='н'?'+':'н';
 if(nv==='н'){
  let hasGrade=!!(l.grades&&l.grades[sid]),hasNote=!!(l.behaviorNotes&&l.behaviorNotes[sid]);
  if(hasGrade||hasNote){
   let st=P(sid);
   if(!confirm((st?presentNamePlain(st):'Ученик')+': на этом уроке уже есть '+(hasGrade&&hasNote?'оценка и замечание':hasGrade?'оценка':'замечание')+'. Отметить отсутствие и удалить их?'))return;
   if(hasGrade)delete l.grades[sid];
   if(hasNote)delete l.behaviorNotes[sid];
  }
 }
 l.attendance[sid]=nv;
 save();
 renderPresentMode();
}
function getStudentPoints(sid,classId){let s=P(sid);return (s&&s.pointsByClass&&s.pointsByClass[classId])||0}
function addStudentPoint(sid,classId,delta){
 let s=P(sid);if(!s)return;
 s.pointsByClass=s.pointsByClass||{};
 s.pointsByClass[classId]=Math.max(0,(s.pointsByClass[classId]||0)+delta);
 save();
}
function presentPointsForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 let threshold=D.settings.pointsThreshold||5;
 let hint='За короткие ответы, которых недостаточно для оценки. Обмен на оценку доступен от '+threshold+' баллов (порог настраивается в Настройках → Внешний вид).';
 return '<div class="card"><h3 style="margin-top:0">Накопительные баллы <span class="muted small" style="font-weight:400;cursor:help" title="'+hint.replace(/"/g,'&quot;')+'">ⓘ</span></h3><div class="checks">'+
  ps.map(s=>{let pts=getStudentPoints(s.id,l.classId);return '<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+' <span class="badge">'+pts+' б.</span></span><span class="toolbar" style="flex:0;gap:4px"><button class="ptbtn" onclick="addStudentPoint(\''+s.id+'\',\''+l.classId+'\',1);renderPresentMode()">+1</button><button class="ptbtn" onclick="addStudentPoint(\''+s.id+'\',\''+l.classId+'\',-1);renderPresentMode()">−1</button>'+(pts>=threshold?'<button class="ptbtn primary" title="Обменять на оценку" onclick="exchangePointsForGrade(\''+s.id+'\',\''+l.classId+'\',\''+l.id+'\')">Обменять</button>':'')+'</span></div>'}).join('')+
  '</div></div>';
}
function setBehaviorNote(lessonId,sid,val){
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){renderPresentMode();return}
 l.behaviorNotes=l.behaviorNotes||{};
 val=val.trim();
 if(val)l.behaviorNotes[sid]=val;else delete l.behaviorNotes[sid];
 save();
}
function presentBehaviorForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 let notes=l.behaviorNotes||{};
 return '<div class="card"><h3 style="margin-top:0">Заметки о поведении <span class="muted small" style="font-weight:400;cursor:help" title="Не влияет на средний балл — просто заметка, не оценка">ⓘ</span></h3><div class="checks">'+
  ps.map(s=>'<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+'</span><input type="text" value="'+e(notes[s.id]||'')+'" placeholder="Заметка…" style="max-width:190px" onchange="setBehaviorNote(\''+l.id+'\',\''+s.id+'\',this.value)"></div>').join('')+
  '</div></div>';
}
function exchangePointsForGrade(sid,classId,lessonId){
 let threshold=D.settings.pointsThreshold||5;
 let pts=getStudentPoints(sid,classId);
 if(pts<threshold){alert('Недостаточно баллов: нужно '+threshold+', сейчас '+pts+'.');return}
 let val=prompt('Какую оценку поставить за накопленные баллы?','5');
 if(!val)return;
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий на этом уроке.');return}
 l.grades=l.grades||{};
 l.grades[sid]={value:val.trim(),comment:'Обмен накопленных баллов ('+threshold+' б.)'};
 addStudentPoint(sid,classId,-threshold);
 save();
 renderPresentMode();
}
function savePresentGrade(lessonId){
 let l=L(lessonId);if(!l)return;
 let sidEl=document.getElementById('pg-student'),gradeEl=document.getElementById('pg-grade');
 if(!sidEl||!gradeEl)return;
 let sid=sidEl.value,val=gradeEl.value;
 let pts=document.getElementById('pg-points').value,mx=document.getElementById('pg-max').value;
 if(!val&&parsePts(pts)===null){alert('Выберите оценку или укажите баллы.');return}
 let comment=document.getElementById('pg-comment').value.trim();
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий — оценку поставить нельзя.');renderPresentMode();return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,pts,mx);
 if(!l.gradeMax&&parsePts(mx)&&parsePts(pts)!==null)l.gradeMax=parsePts(mx);
 let s=P(sid);if(s)s.lastAskedAt=toISO(new Date());
 save();
 renderPresentMode();
}
function lessonTimeInfo(l,now){
 let st=l.startTime,et=l.endTime;
 if((!st||!et)&&l.lessonNumber){let t=timeFor(l.lessonNumber);st=st||t.start;et=et||t.end}
 let startMin=timeToMin(st),endMin=timeToMin(et);
 if(startMin===null||endMin===null)return null;
 let nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
 return{startMin,endMin,elapsed:nowMin-startMin,remaining:endMin-nowMin};
}
function fmtMinutes(n){return Math.max(0,Math.round(n))}
function minToTimeStr(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0')}
function presentTimeInfoText(l){
 let info=lessonTimeInfo(l,new Date());
 if(!info)return 'Время урока не задано';
 let range=minToTimeStr(info.startMin)+'–'+minToTimeStr(info.endMin);
 if(info.elapsed<0)return range+' · до начала: '+fmtMinutes(-info.elapsed)+' мин';
 if(info.remaining>0)return range+' · прошло: '+fmtMinutes(info.elapsed)+' мин · осталось: '+fmtMinutes(info.remaining)+' мин';
 return range+' · урок завершён '+fmtMinutes(-info.remaining)+' мин назад';
}
const PRESENT_BLOCKS={
 plan:{label:'План урока'},
 extra:{label:'Доп. поля урока'},
 homework:{label:'Домашнее задание'},
 whoToAsk:{label:'Кого спросить'},
 grade:{label:'Оценки'},
 attendance:{label:'Посещаемость'},
 points:{label:'Баллы'},
 behavior:{label:'Заметки о поведении'},
 seating:{label:'Рассадка'}
};
function presentBlockHtml(key,l,cls,extra){
 switch(key){
  case 'plan':return lessonField(l,'planText')?'<div class="card"><h3 style="margin-top:0">'+fLabel('lesson','planText','План урока')+'</h3><div class="val">'+richTextView(lessonField(l,'planText'))+'</div></div>':'<div class="card muted small">План урока не заполнен.</div>';
  case 'extra':return extra?'<div class="card">'+extra+'</div>':'';
  case 'homework':return lessonField(l,'homework')?'<div class="card"><h3 style="margin-top:0">'+fLabel('lesson','homework','Домашнее задание')+'</h3><div class="val">'+richTextView(lessonField(l,'homework'))+'</div></div>':'';
  case 'whoToAsk':return cls?widgetWhoToAsk(cls,l.id):'';
  case 'grade':return cls?presentGradeForm(l):'';
  case 'attendance':return cls?presentAttendanceForm(l):'';
  case 'points':return cls?presentPointsForm(l):'';
  case 'behavior':return cls?presentBehaviorForm(l):'';
  case 'seating':return cls&&cls.seating?'<div class="card present-seat"><h3 style="margin-top:0">Рассадка · '+e(cls.name)+'</h3>'+seatingGridHtml(cls,false,l.attendance||{})+'</div>':'<div class="card muted small">Рассадка для этого класса не настроена.</div>';
  default:return'';
 }
}
function presentLayoutKey(kind){return kind==='club'?'presentLayoutClub':'presentLayout'}
function openPresentLayoutConfig(kind){
 if(!kind){
  let l=S.lessonPresentId?L(S.lessonPresentId):null;
  let cls=l?C(l.classId):null;
  kind=(cls&&cls.type==='club')?'club':'lesson';
 }
 let layout=D.settings[presentLayoutKey(kind)];
 let colHtml=(arr,side)=>arr.map((k,i)=>{let meta=PRESENT_BLOCKS[k];if(!meta)return'';return '<div class="fieldrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="movePresentBlock(\''+kind+'\',\''+side+'\','+i+',-1)">↑</button><button '+(i===arr.length-1?'disabled':'')+' onclick="movePresentBlock(\''+kind+'\',\''+side+'\','+i+',1)">↓</button></span><span class="fname">'+e(meta.label)+'</span><button onclick="movePresentBlockSide(\''+kind+'\',\''+side+'\','+i+')">'+(side==='left'?'→ в правую колонку':'← в левую колонку')+'</button></div>'}).join('');
 setModalHtml('Настроить режим урока',
  '<div class="tabs" style="margin-bottom:10px"><button class="'+(kind==='lesson'?'active':'')+'" onclick="openPresentLayoutConfig(\'lesson\')">Для уроков</button><button class="'+(kind==='club'?'active':'')+'" onclick="openPresentLayoutConfig(\'club\')">Для кружков</button></div>'+
  '<div class="muted small" style="margin-bottom:10px">Расположите блоки в удобном порядке — как конструктор. Слева — широкая колонка, справа — узкая. У уроков и у кружков — свои отдельные наборы.</div>'+
  '<h3 style="margin:6px 0">Левая колонка (широкая)</h3>'+(colHtml(layout.left,'left')||'<div class="muted small">Пусто.</div>')+
  '<h3 style="margin:14px 0 6px">Правая колонка (узкая)</h3>'+(colHtml(layout.right,'right')||'<div class="muted small">Пусто.</div>')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();renderPresentMode()">Готово</button></div>');
}
function movePresentBlock(kind,side,i,dir){
 let arr=D.settings[presentLayoutKey(kind)][side];let j=i+dir;if(j<0||j>=arr.length)return;
 [arr[i],arr[j]]=[arr[j],arr[i]];save();openPresentLayoutConfig(kind);
}
function movePresentBlockSide(kind,side,i){
 let layout=D.settings[presentLayoutKey(kind)];
 let other=side==='left'?'right':'left';
 let [item]=layout[side].splice(i,1);
 layout[other].push(item);
 save();openPresentLayoutConfig(kind);
}
function presentReminderHtml(l){
 let info=lessonTimeInfo(l,new Date());
 if(info&&info.remaining>0&&info.remaining<=5)return '⏰ До конца урока осталось '+fmtMinutes(info.remaining)+' мин.!';
 return '';
}
function renderPresentMode(){
 let box=document.getElementById('present');
 if(!S.lessonPresentId){box.innerHTML='';return}
 let l=L(S.lessonPresentId);
 if(!l){S.lessonPresentId=null;box.innerHTML='';return}
 let prevOverlay=box.querySelector('.present-overlay');
 let scrollTop=prevOverlay?prevOverlay.scrollTop:0;
 let cls=C(l.classId);
 let extra=extraLessonFieldsView(l);
 let reminderText=presentReminderHtml(l);
 let kind=(cls&&cls.type==='club')?'club':'lesson';
 let layout=D.settings[presentLayoutKey(kind)]||{left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
 box.innerHTML='<div class="present-overlay"><div class="present-top">'+
  '<div><h1 style="margin-bottom:2px">'+e(l.topic||'Урок без темы')+'</h1><div class="muted">'+e(cls?cls.name:'—')+' · '+fmtDate(l.date)+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+'</div></div>'+
  '<div style="display:flex;align-items:center;gap:16px"><div><div id="present-clock" class="present-clock">'+fmtPresentClock(new Date())+'</div><div class="muted small present-time-info">'+fmtClockDate(new Date())+'</div><div id="present-time-info" class="muted small present-time-info">'+presentTimeInfoText(l)+'</div></div><button onclick="openPresentLayoutConfig()" title="Настроить расположение блоков">⚙</button><button class="danger" onclick="closeLessonPresent()">Завершить</button></div>'+
  '</div>'+
  (l.announcementText?'<div class="present-reminder-wrap"><div class="notice" style="background:#eef2ff;border-color:#5b6fe6;color:#2a3499;font-weight:600">📣 '+richTextView(l.announcementText)+'</div></div>':'')+
  '<div class="present-reminder-wrap"><div id="present-reminder" class="notice" style="background:#ffe1e1;border-color:#e64c3c;color:#9c1c1c;font-weight:700;text-align:center;'+(reminderText?'':'display:none')+'">'+reminderText+'</div></div>'+
  '<div class="present-grid"><div>'+
   layout.left.map(k=>presentBlockHtml(k,l,cls,extra)).join('')+
  '</div>'+
  '<div>'+
   layout.right.map(k=>presentBlockHtml(k,l,cls,extra)).join('')+
  '</div>'+
  '</div></div>';
 let newOverlay=box.querySelector('.present-overlay');
 if(newOverlay)newOverlay.scrollTop=scrollTop;
 startPresentClockTicker();
}
function startPresentClockTicker(){
 if(window._presentInterval){clearInterval(window._presentInterval);window._presentInterval=null}
 window._presentInterval=setInterval(()=>{
  let clockEl=document.getElementById('present-clock');
  if(!clockEl){clearInterval(window._presentInterval);window._presentInterval=null;return}
  clockEl.textContent=fmtPresentClock(new Date());
  let l=S.lessonPresentId?L(S.lessonPresentId):null;
  if(!l)return;
  let infoEl=document.getElementById('present-time-info');
  if(infoEl)infoEl.innerHTML=presentTimeInfoText(l);
  let remEl=document.getElementById('present-reminder');
  if(remEl){
   let txt=presentReminderHtml(l);
   remEl.innerHTML=txt;
   remEl.style.display=txt?'':'none';
  }
 },1000);
}
const STUDENT_SORT_OPTIONS=[['fio','По фамилии'],['avg','По среднему баллу'],['att','По посещаемости'],['grades','По кол-ву оценок'],['absences','По пропускам'],['age','По возрасту'],['class','По классу']];
function sortStudentsList(list,key){
 key=key||'fio';
 let rows=list.map(s=>({s,st:studentStats(s.id)}));
 let sorters={
  fio:(a,b)=>(a.s.lastName+a.s.firstName).localeCompare(b.s.lastName+b.s.firstName,'ru'),
  avg:(a,b)=>(b.st.avgGrade||0)-(a.st.avgGrade||0),
  att:(a,b)=>(b.st.attendancePct||0)-(a.st.attendancePct||0),
  grades:(a,b)=>b.st.gradesCount-a.st.gradesCount,
  absences:(a,b)=>b.st.absences-a.st.absences,
  age:(a,b)=>(+age(b.s.customFields.birthDate)||0)-(+age(a.s.customFields.birthDate)||0),
  class:(a,b)=>studentClassNames(a.s).localeCompare(studentClassNames(b.s),'ru')
 };
 rows.sort(sorters[key]||sorters.fio);
 return rows.map(r=>r.s);
}
function studentSortSelect(onchangeFn){
 let key=S.studentSort||'fio';
 return '<label style="margin:0;flex:0"><span class="small muted">Сортировка:</span><select onchange="'+onchangeFn+'(this.value)">'+
  STUDENT_SORT_OPTIONS.map(o=>'<option value="'+o[0]+'"'+(key===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></label>';
}
function setStudentSort(key){S.studentSort=key;if(S.view==='students')renderStudentsList();else render()}
function studentTable(a,tableId){
 tableId=tableId||'student-table';
 if(!a.length)return '<div class="empty">Ученики не найдены.</div>';
 let statsMap=new Map(a.map(s=>[s.id,studentStats(s.id)]));
 let baseline=avg([...statsMap.values()].map(st=>st.avgGrade).filter(x=>x!==null));
 return '<table class="table" id="'+tableId+'"><tr><th style="width:26px"><input type="checkbox" style="width:auto" onchange="toggleSelectAllStudents(\''+tableId+'\',this.checked)" title="Выбрать всех"></th><th>ФИО</th><th>Класс</th><th>Возраст</th><th>Средняя</th><th>Посещаемость</th><th>Статус</th><th></th></tr>'+
  a.map(s=>{let st=statsMap.get(s.id);let info=studentBadgeInfo(st,baseline);let rowClass='click'+(info.top?' row-top':'')+(info.attention?' row-attention':'');
   return '<tr class="'+rowClass+'" onclick="openStudentPage(\''+s.id+'\')"><td onclick="event.stopPropagation()"><input type="checkbox" class="student-select" data-sid="'+s.id+'" style="width:auto" '+(S.selectedStudentIds.has(s.id)?'checked':'')+' onchange="toggleStudentSelect(\''+s.id+'\')"></td><td><b>'+studentFio(s)+'</b>'+studentBadgeHtml(st,baseline)+'</td><td>'+e(studentClassNames(s))+'</td><td>'+age(s.customFields.birthDate)+'</td><td>'+round2(st.avgGrade)+'</td><td>'+(st.attendancePct===null?'—':st.attendancePct+'%')+'</td><td><span class="badge '+(s.status==='archived'?'red':'green')+'">'+(s.status==='archived'?'Архив':'Активен')+'</span></td><td><button onclick="event.stopPropagation();openEditStudent(\''+s.id+'\')">Изменить</button></td></tr>';
  }).join('')+
  '</table>'+
  '<div class="badge-legend"><span>🏆 — средняя заметно выше остальных в этом списке</span><span>❗ — стоит обратить внимание: низкая средняя, много пропусков или замечаний о поведении</span></div>';
}
function toggleStudentSelect(sid){
 if(S.selectedStudentIds.has(sid))S.selectedStudentIds.delete(sid);else S.selectedStudentIds.add(sid);
 render();
}
function toggleSelectAllStudents(tableId,checked){
 let table=document.getElementById(tableId);
 if(!table)return;
 table.querySelectorAll('.student-select').forEach(cb=>{
  let sid=cb.dataset.sid;
  if(checked)S.selectedStudentIds.add(sid);else S.selectedStudentIds.delete(sid);
 });
 render();
}
function removeStudentsBulk(ids,label){
 if(!ids.length){alert('Список пуст.');return}
 if(!confirm('Удалить '+label+' ('+ids.length+' чел.)? Рекомендуется использовать архив вместо полного удаления. Действие необратимо.'))return;
 let idSet=new Set(ids);
 D.students=D.students.filter(s=>!idSet.has(s.id));
 D.lessons.forEach(l=>{idSet.forEach(id=>{if(l.attendance)delete l.attendance[id];if(l.grades)delete l.grades[id];if(l.behaviorNotes)delete l.behaviorNotes[id]})});
 S.selectedStudentIds=new Set();
 save();render();
}
function deleteSelectedStudents(){
 removeStudentsBulk([...S.selectedStudentIds],'выбранных учеников');
}
function deleteAllStudentsInTable(tableId){
 let table=document.getElementById(tableId);
 if(!table)return;
 let ids=[...table.querySelectorAll('.student-select')].map(cb=>cb.dataset.sid);
 removeStudentsBulk(ids,'ВСЕХ учеников из этого списка');
}
function studentsPage(){
 let q=(S.q||'').toLowerCase();
 let showArchived=S.showArchived;
 let all=D.students.filter(s=>showArchived?true:s.status!=='archived');
 let filtered=sortStudentsList(all.filter(s=>(s.lastName+' '+s.firstName+' '+s.middleName).toLowerCase().includes(q)),S.studentSort);
 return '<div class="top"><div><h1>Ученики</h1><div class="muted">Единый список и персональные карточки</div></div>'+
  '<div class="toolbar"><button onclick="openMassAdd()">＋ Массовое добавление</button><button class="primary" onclick="openNewStudent()">＋ Новый ученик</button></div></div>'+
  '<div class="card"><div class="row"><input placeholder="Поиск по ФИО" value="'+e(S.q)+'" oninput="S.q=this.value;renderStudentsList()">'+
   studentSortSelect('setStudentSort')+
   '<label style="display:flex;align-items:center;gap:6px;margin:0;flex:0"><input type="checkbox" style="width:auto" '+(showArchived?'checked':'')+' onchange="S.showArchived=this.checked;render()"> показать архив</label></div></div>'+
  '<div class="card"><div class="toolbar"><button class="danger" onclick="deleteSelectedStudents()" '+(S.selectedStudentIds.size?'':'disabled')+'>Удалить выбранных ('+S.selectedStudentIds.size+')</button><button class="danger" onclick="deleteAllStudentsInTable(\'student-table\')">Удалить всех в списке</button></div></div>'+
  '<div id="st"><div class="card">'+studentTable(filtered,'student-table')+'</div></div>'+
  '<div class="card"><a href="#" onclick="event.preventDefault();goto(\'search\')" class="click">Искать также по урокам и материалам →</a></div>';
}
function renderStudentsList(){
 let q=(S.q||'').toLowerCase();
 let all=D.students.filter(s=>S.showArchived?true:s.status!=='archived');
 let list=sortStudentsList(all.filter(s=>(s.lastName+' '+s.firstName+' '+s.middleName).toLowerCase().includes(q)),S.studentSort);
 document.getElementById('st').innerHTML='<div class="card">'+studentTable(list,'student-table')+'</div>';
}
function openStudentPage(id){S.view='student';S.studentId=id;render()}
function studentStats(sid){
 let s=P(sid);
 let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled);
 let gradeVals=[];ls.forEach(l=>{let g=(l.grades||{})[sid];if(g){let n=gradeNumericValue(g.value);if(n!==null)gradeVals.push(n)}});
 let attTotal=0,attPresent=0,absences=0;
 ls.forEach(l=>{let v=(l.attendance||{})[sid];if(v){attTotal++;if(v==='н')absences++;else attPresent++}});
 let behaviorCount=0;ls.forEach(l=>{if((l.behaviorNotes||{})[sid])behaviorCount++});
 return {lessonsCount:ls.length,gradesCount:gradeVals.length,avgGrade:avg(gradeVals),attTotal,absences,attendancePct:attTotal?Math.round(attPresent/attTotal*1000)/10:null,gradeVals,behaviorCount};
}
function studentPage(){
 let s=P(S.studentId);
 if(!s)return '<div class="empty">Ученик не найден.</div>';
 let clsNames=studentClassNames(s);
 let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)).sort((a,b)=>b.date.localeCompare(a.date));
 let st=studentStats(s.id);
 let baseline=avg(D.students.filter(x=>x.status!=='archived').map(x=>studentStats(x.id).avgGrade).filter(x=>x!==null));
 let badgeInfo=studentBadgeInfo(st,baseline);
 let sf=D.settings.fields.student.filter(f=>f.visible);
 return '<div class="top"><div><button onclick="goto(\'students\')">← Все ученики</button><h1>'+studentFio(s)+studentBadgeHtml(st,baseline)+'</h1><div class="muted">'+e(clsNames)+' · '+age(s.customFields.birthDate)+' лет'+(s.status==='archived'?' · <span class="badge red">Архив</span>':'')+(s.homeschool?' · <span class="badge blue">🏠 Домашнее/семейное обучение</span>':'')+'</div>'+
  (badgeInfo.reasons.length?'<div class="small muted" style="margin-top:4px">'+(badgeInfo.top?'🏆 ':'')+(badgeInfo.attention?'❗ ':'')+e(badgeInfo.reasons.join(' · '))+'</div>':'')+'</div>'+
  '<div class="toolbar"><button class="primary" onclick="openEditStudent(\''+s.id+'\')">Редактировать</button><button onclick="openPrintStudentOptions(\''+s.id+'\')">🖨 Печать табеля</button><button onclick="toggleHomeschool(\''+s.id+'\')">🏠 '+(s.homeschool?'Снять «домашнее обучение»':'Отметить «домашнее обучение»')+'</button>'+
  (s.status==='archived'?'<button onclick="restoreStudent(\''+s.id+'\')">Восстановить из архива</button>':'<button onclick="archiveStudent(\''+s.id+'\')">В архив</button>')+'</div></div>'+
  '<div class="grid">'+stat(st.gradesCount,'Оценок')+stat(round2(st.avgGrade),'Средняя оценка')+stat(st.attendancePct===null?'—':st.attendancePct+'%','Посещаемость')+stat(st.absences,'Пропусков')+stat(st.behaviorCount,'Заметок о поведении')+'</div>'+
  '<div class="card field-view"><h2>Карточка ученика</h2><div class="grid"><div><b>ФИО</b><br>'+studentFio(s)+'</div><div><b>Дата рождения</b><br>'+fmtDate(s.customFields.birthDate)+' · '+age(s.customFields.birthDate)+' лет</div><div><b>Классы</b><br>'+e(clsNames)+'</div></div>'+
  sf.filter(f=>f.key!=='birthDate').map(f=>section(f.label,customFieldView(f,s.customFields[f.key]))).join('')+'</div>'+
  studentChartsCard(s.id,ls)+
  '<div class="card"><h2>История уроков</h2>'+(ls.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Тема</th><th>Оценка</th><th>Присутствие</th><th>Заметка о поведении</th></tr>'+
   ls.map(l=>{let g=(l.grades||{})[s.id];let a=(l.attendance||{})[s.id];let bn=(l.behaviorNotes||{})[s.id];return '<tr class="click" onclick="openLessonModal(\''+l.id+'\')"'+(l.cancelled?' style="opacity:.5"':'')+'><td>'+fmtDate(l.date)+'</td><td>'+e(C(l.classId)?.name||'—')+'</td><td>'+(l.cancelled?'🚫 Отменён':e(l.topic||'(без темы)'))+'</td><td>'+(g?e(gradeText(g)||'—'):'—')+'</td><td>'+(a?(a==='н'?'Отсутствовал':'Присутствовал'):'—')+'</td><td class="muted">'+(bn?e(bn):'—')+'</td></tr>'}).join('')+'</table>':'<div class="empty">Уроков пока нет.</div>')+'</div>';
}
function studentChartsCard(sid,lsDesc){
 let range=chartPeriodRange('student');
 let ls=[...lsDesc].filter(l=>!l.cancelled&&l.date>=range.from&&l.date<=range.to).sort((a,b)=>a.date.localeCompare(b.date));
 let distVals=[];let attPresent=0,attTotal=0;
 let trendPoints=[];
 ls.forEach(l=>{
  let g=(l.grades||{})[sid];if(g&&g.value){distVals.push(g.value);let n=gradeNumericValue(g.value);if(n!==null)trendPoints.push({y:n,label:fmtDateShort(l.date)})}
  let a=(l.attendance||{})[sid];if(a){attTotal++;if(a!=='н')attPresent++}
 });
 return periodPickerHtml('student')+
  '<div class="card"><h3 style="margin-top:0">Динамика оценок</h3>'+svgLineChart(trendPoints,{width:680,height:190})+'</div>'+
  '<div class="card"><h3 style="margin-top:0">Распределение оценок <span class="muted small">(нажмите на столбец, чтобы увидеть когда)</span></h3>'+svgBarChart(gradeDistData(distVals,'student',sid,range.from,range.to),{width:900,height:260})+'</div>'+
  '<div class="card"><h3 style="margin-top:0">Посещаемость <span class="muted small">(нажмите, чтобы увидеть какие уроки пропущены)</span></h3>'+donutChart(attPresent,attTotal-attPresent,140,"showAttendanceBreakdown('student','"+sid+"','"+range.from+"','"+range.to+"')")+'</div>';
}
function studentFormFields(s){
 let sf=D.settings.fields.student.filter(f=>f.visible);
 return sf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('sf_'+f.key,f,s.customFields?s.customFields[f.key]:''));
}
function classCheckboxes(selectedIds){
 selectedIds=selectedIds||[];
 if(!D.classes.length)return '<div class="muted small">Классов пока нет.</div>';
 return '<div class="checks" style="max-height:160px">'+D.classes.map(c=>'<label class="attrow" style="cursor:pointer"><span>'+e(c.name)+(c.subject?' <span class="muted small">('+e(c.subject)+')</span>':'')+'</span><input type="checkbox" class="s-classcheck" value="'+c.id+'" '+(selectedIds.includes(c.id)?'checked':'')+' style="width:auto"></label>').join('')+'</div>';
}
function readCheckedClassIds(){return [...document.querySelectorAll('.s-classcheck')].filter(x=>x.checked).map(x=>x.value)}
function openNewStudent(classId){
 setModalHtml('Новый ученик',
  '<label>Фамилия</label><input id="s-last">'+
  '<label>Имя</label><input id="s-first">'+
  '<label>Отчество</label><input id="s-mid">'+
  '<label>Классы (можно выбрать несколько — например, если ученик учится у вас по разным предметам)</label>'+classCheckboxes(classId?[classId]:[])+
  '<label class="attrow" style="cursor:pointer;margin-top:12px"><span>🏠 Домашнее / семейное обучение</span><input type="checkbox" id="s-homeschool" style="width:auto"></label>'+
  '<p class="muted small" style="margin-top:-6px">Ученик числится в классе, но на уроки не ходит — приходит только на аттестацию. Не будет появляться в посещаемости, оценках и заметках о поведении в режиме урока.</p>'+
  studentFormFields({customFields:{}}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewStudent()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveNewStudent(){
 let last=document.getElementById('s-last').value.trim(),first=document.getElementById('s-first').value.trim();
 if(!last||!first){alert('Заполните фамилию и имя.');return}
 let s={id:uid(),lastName:last,firstName:first,middleName:document.getElementById('s-mid').value.trim(),classIds:readCheckedClassIds(),status:'active',homeschool:document.getElementById('s-homeschool').checked,customFields:{}};
 D.settings.fields.student.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('sf_'+f.key);if(el)s.customFields[f.key]=readFieldValue(f,el)});
 D.students.push(s);save();closeModal();render();
}
function openEditStudent(id){
 let s=P(id);
 S.editReturnCtx={view:S.view,classId:S.classId,studentId:S.studentId,tab:S.tab,workTab:S.workTab};
 setModalHtml('Редактировать ученика',
  '<label>Фамилия</label><input id="s-last" value="'+e(s.lastName)+'">'+
  '<label>Имя</label><input id="s-first" value="'+e(s.firstName)+'">'+
  '<label>Отчество</label><input id="s-mid" value="'+e(s.middleName)+'">'+
  '<label>Классы (можно выбрать несколько)</label>'+classCheckboxes(s.classIds)+
  '<label class="attrow" style="cursor:pointer;margin-top:12px"><span>🏠 Домашнее / семейное обучение</span><input type="checkbox" id="s-homeschool" '+(s.homeschool?'checked':'')+' style="width:auto"></label>'+
  '<p class="muted small" style="margin-top:-6px">Ученик числится в классе, но на уроки не ходит — приходит только на аттестацию. Не будет появляться в посещаемости, оценках и заметках о поведении в режиме урока.</p>'+
  studentFormFields(s).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditStudent(\''+id+'\')">Сохранить</button><button class="danger" onclick="removeStudentConfirm(\''+id+'\')">Удалить ученика</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveEditStudent(id){
 let s=P(id);
 s.lastName=document.getElementById('s-last').value.trim();s.firstName=document.getElementById('s-first').value.trim();s.middleName=document.getElementById('s-mid').value.trim();
 s.classIds=readCheckedClassIds();
 s.homeschool=document.getElementById('s-homeschool').checked;
 D.settings.fields.student.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('sf_'+f.key);if(el)s.customFields[f.key]=readFieldValue(f,el)});
 save();closeModal();
 if(S.editReturnCtx){Object.assign(S,S.editReturnCtx);S.editReturnCtx=null}
 render();
}
function toggleHomeschool(id){
 let s=P(id);if(!s)return;
 s.homeschool=!s.homeschool;
 save();render();
}
function removeStudentConfirm(id){
 if(!confirm('Полностью удалить ученика и всю его историю? Рекомендуется вместо этого использовать «Архив». Действие необратимо.'))return;
 D.students=D.students.filter(s=>s.id!==id);
 D.lessons.forEach(l=>{if(l.attendance)delete l.attendance[id];if(l.grades)delete l.grades[id];if(l.behaviorNotes)delete l.behaviorNotes[id]});
 save();closeModal();goto('students');
}
function archiveStudent(id){P(id).status='archived';save();render()}
function restoreStudent(id){P(id).status='active';save();render()}
function openMassAdd(presetClassId){
 setModalHtml('Массовое добавление',
  '<div class="notice">По одному ученику на строку — просто ФИО, без знаков препинания. Первое слово будет фамилией, второе — именем, остальное — отчеством.</div>'+
  '<label>Классы для всех учеников из списка</label>'+classCheckboxes(presetClassId?[presetClassId]:[]).replace(/class="s-classcheck"/g,'class="mass-classcheck"')+
  '<label>Список ФИО (по одному на строку)</label>'+
  '<textarea id="mass-text" class="autosize" style="min-height:180px" placeholder="Иванов Иван Петрович\nПетрова Мария\nСидоров Алексей Николаевич" oninput="massAddPreview()"></textarea>'+
  '<div id="mass-preview" class="small muted" style="margin-top:8px"></div>'+
  '<div class="toolbar" style="margin-top:12px"><button class="primary" onclick="doMassAdd()">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function parseFio(line){
 let parts=line.trim().split(/\s+/).filter(Boolean);
 if(!parts.length)return null;
 return {lastName:parts[0]||'',firstName:parts[1]||'',middleName:parts.slice(2).join(' ')};
}
function massAddPreview(){
 let box=document.getElementById('mass-preview');if(!box)return;
 let lines=document.getElementById('mass-text').value.split(/\n/).map(x=>x.trim()).filter(Boolean);
 if(!lines.length){box.innerHTML='';return}
 box.innerHTML='Будет добавлено: '+lines.length+' чел. Например: '+lines.slice(0,3).map(l=>{let p=parseFio(l);return p?('«'+p.lastName+' '+p.firstName+(p.middleName?' '+p.middleName:'')+'»'):''}).join(', ')+(lines.length>3?'…':'');
}
function doMassAdd(){
 let classIds=[...document.querySelectorAll('.mass-classcheck')].filter(x=>x.checked).map(x=>x.value);
 let text=document.getElementById('mass-text').value;
 let count=0;
 text.split(/\n/).map(x=>x.trim()).filter(Boolean).forEach(line=>{
  let p=parseFio(line);
  if(!p||!p.lastName||!p.firstName)return;
  D.students.push({id:uid(),lastName:p.lastName,firstName:p.firstName,middleName:p.middleName,classIds:[...classIds],status:'active',customFields:{}});
  count++;
 });
 save();closeModal();alert('Добавлено учеников: '+count);goto('students');
}
function announcementsPage(){
 return '<div class="top"><div><h1>Объявления</h1><div class="muted">Сохраните текст один раз и расставьте его сразу на нужные уроки или на всю неделю — он появится вверху режима урока и будет оставаться там, пока вы сами не уберёте его на этой странице.</div></div>'+
  '<button class="primary" onclick="openAddAnnouncement()">＋ Новое объявление</button></div>'+
  (D.announcements.length?D.announcements.map(a=>{
   let activeCount=a.text?activeLessons().filter(l=>l.announcementText===a.text).length:0;
   return '<div class="card"><div class="val" style="margin-bottom:10px">'+richTextView(a.text)+'</div>'+
    (activeCount?'<div class="muted small" style="margin-bottom:8px">Сейчас стоит на уроках: '+activeCount+'</div>':'')+
    '<div class="toolbar" style="flex-wrap:wrap"><button class="primary" style="flex:1;min-width:200px" onclick="openPlaceAnnouncement(\''+a.id+'\')">📅 Расставить / убрать по урокам</button><button style="flex:1;min-width:200px" onclick="openPlaceAnnouncementNearest(\''+a.id+'\')">📌 Разместить на ближайшие уроки</button><button onclick="openEditAnnouncement(\''+a.id+'\')">Изменить</button><button class="danger" onclick="deleteAnnouncement(\''+a.id+'\')">Удалить</button></div></div>';
  }).join(''):'<div class="card empty">Объявлений пока нет. Например: «Принести учебники к контрольной работе» — сохраните такой текст один раз, а затем сразу расставьте его на несколько уроков или на всю неделю.</div>');
}
function openAddAnnouncement(){
 setModalHtml('Новое объявление',
  '<label>Текст объявления</label>'+customFieldInput('an-text',{type:'longtext'},'')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveAnnouncement()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function saveAnnouncement(){
 let text=readFieldValue({type:'longtext'},document.getElementById('an-text'));
 if(!text){alert('Введите текст объявления.');return}
 D.announcements.push({id:uid(),text});
 save();closeModal();render();
}
function openEditAnnouncement(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 setModalHtml('Объявление',
  '<label>Текст объявления</label>'+customFieldInput('an-text',{type:'longtext'},a.text)+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditAnnouncement(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteAnnouncement(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function saveEditAnnouncement(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 a.text=readFieldValue({type:'longtext'},document.getElementById('an-text'));
 save();closeModal();render();
}
function deleteAnnouncement(id){
 if(!confirm('Удалить объявление из библиотеки? С уроков, где оно уже расставлено, текст сам не пропадёт — уберите его там при необходимости на странице «Объявления» (кнопка «Расставить / убрать по урокам»).'))return;
 D.announcements=D.announcements.filter(a=>a.id!==id);
 save();closeModal();render();
}
function openPlaceAnnouncement(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 let today=toISO(new Date());
 let end=addDays(today,14);
 let ls=activeLessons().filter(l=>l.date>=today&&l.date<=end).sort((x,y)=>x.date.localeCompare(y.date)||(+x.lessonNumber||0)-(+y.lessonNumber||0));
 if(!ls.length){setModalHtml('Расставить объявление','<div class="empty">В ближайшие 2 недели уроков не найдено.</div><div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>');return}
 let weekStart=mondayOf(today),weekEnd=addDays(weekStart,6);
 let rows=ls.map(l=>{let cls=C(l.classId);return '<label class="attrow" style="cursor:pointer"><span style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="an-lesson-cb" data-id="'+l.id+'" data-date="'+l.date+'" style="width:auto" '+(l.announcementText===a.text?'checked':'')+'><span>'+fmtDateShort(l.date)+' · '+e(cls?cls.name:'—')+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+' — '+e(l.topic||'(без темы)')+'</span></span></label>';
  }).join('');
 setModalHtml('Расставить объявление',
  '<div class="notice" style="margin-bottom:10px">'+richTextView(a.text)+'</div>'+
  '<div class="muted small" style="margin-bottom:8px">Отмеченные уроки получат объявление, снятые галочки — потеряют его (если оно там стояло). Само объявление в режиме урока убрать нельзя — только здесь.</div>'+
  '<div class="toolbar" style="margin-bottom:8px;flex-wrap:wrap"><button onclick="toggleAnnouncementRange(\''+weekStart+'\',\''+weekEnd+'\')">Отметить текущую неделю</button><button onclick="toggleAnnouncementAll(true)">Отметить все ('+ls.length+')</button><button onclick="toggleAnnouncementAll(false)">Снять все</button></div>'+
  '<div class="checks" style="max-height:360px">'+rows+'</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmPlaceAnnouncement(\''+id+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function toggleAnnouncementRange(from,to){
 document.querySelectorAll('.an-lesson-cb').forEach(cb=>{let d=cb.dataset.date;cb.checked=(d>=from&&d<=to)});
}
function toggleAnnouncementAll(val){
 document.querySelectorAll('.an-lesson-cb').forEach(cb=>{cb.checked=val});
}
function confirmPlaceAnnouncement(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 let cbs=[...document.querySelectorAll('.an-lesson-cb')];
 if(!cbs.length)return;
 cbs.forEach(cb=>{
  let l=L(cb.dataset.id);if(!l)return;
  if(cb.checked)l.announcementText=a.text;
  else if(l.announcementText===a.text)l.announcementText='';
 });
 save();closeModal();
 if(S.lessonPresentId)renderPresentMode();
 render();
}
function nearestUpcomingLessonForClass(classId,fromDate){
 let ls=activeLessons().filter(l=>l.classId===classId&&!l.cancelled&&l.date>=fromDate).sort((a,b)=>a.date.localeCompare(b.date)||(+a.lessonNumber||0)-(+b.lessonNumber||0));
 return ls[0]||null;
}
function openPlaceAnnouncementNearest(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 let today=toISO(new Date());
 if(!D.classes.length){setModalHtml('Разместить на ближайшие уроки','<div class="empty">Сначала добавьте классы.</div><div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>');return}
 let rows=D.classes.map(c=>{
  let l=nearestUpcomingLessonForClass(c.id,today);
  let info=l?fmtDateShort(l.date)+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+' — '+e(l.topic||'(без темы)')+(l.announcementText===a.text?' <span class="muted small">(уже стоит)</span>':''):'<span class="muted small">ближайших уроков не найдено</span>';
  return '<label class="attrow" style="cursor:pointer'+(l?'':';opacity:.55')+'"><span style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="an-nearest-cb" data-class="'+c.id+'" style="width:auto" '+(l&&l.announcementText!==a.text?'checked':'')+' '+(l?'':'disabled')+'><span><b>'+e(c.name)+'</b><br><span class="muted small">'+info+'</span></span></span></label>';
 }).join('');
 setModalHtml('Разместить на ближайшие уроки',
  '<div class="notice" style="margin-bottom:10px">'+richTextView(a.text)+'</div>'+
  '<div class="muted small" style="margin-bottom:8px">Для каждого отмеченного класса объявление встанет только на его ближайший предстоящий урок — удобно, если уроки этого класса повторяются несколько раз в неделю и дублировать не нужно.</div>'+
  '<div class="toolbar" style="margin-bottom:8px;flex-wrap:wrap"><button onclick="toggleAnnouncementNearestAll(true)">Отметить все классы</button><button onclick="toggleAnnouncementNearestAll(false)">Снять все</button></div>'+
  '<div class="checks" style="max-height:360px">'+rows+'</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmPlaceAnnouncementNearest(\''+id+'\')">Разместить</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function toggleAnnouncementNearestAll(val){
 document.querySelectorAll('.an-nearest-cb:not(:disabled)').forEach(cb=>{cb.checked=val});
}
function confirmPlaceAnnouncementNearest(id){
 let a=D.announcements.find(x=>x.id===id);if(!a)return;
 let today=toISO(new Date());
 let cbs=[...document.querySelectorAll('.an-nearest-cb')].filter(cb=>cb.checked);
 if(!cbs.length){closeModal();return}
 let count=0;
 cbs.forEach(cb=>{
  let l=nearestUpcomingLessonForClass(cb.dataset.class,today);
  if(l){l.announcementText=a.text;count++}
 });
 save();closeModal();
 if(S.lessonPresentId)renderPresentMode();
 render();
 alert('Объявление размещено на ближайший урок в классах: '+count+'.');
}
function workPage(){
 let tab=S.workTab||'meetings';
 return '<div class="top"><div><h1>Работа</h1><div class="muted">Отдельное пространство для административных дел: совещания, задачи, коллеги, документы</div></div></div>'+
  '<div class="tabs">'+[['meetings','Совещания'],['tasks','Задачи'],['colleagues','Коллеги'],['documents','Документы'],['lessonarchive','Архив уроков']].map(x=>'<button class="'+(tab===x[0]?'active':'')+'" onclick="S.workTab=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  (tab==='meetings'?workMeetingsTab():tab==='tasks'?workTasksTab():tab==='colleagues'?workColleaguesTab():tab==='documents'?workDocumentsTab():workLessonArchiveTab());
}
function workLessonArchiveTab(){
 let archived=D.lessons.filter(l=>l.archived).sort((a,b)=>(b.archivedAt||'').localeCompare(a.archivedAt||''));
 let today=toISO(new Date());
 return '<div class="card"><h2>Архив уроков</h2><p class="muted small">Заархивированные уроки скрыты из расписания и статистики. Автоматически удаляются через 30 дней после архивации — либо восстановите, либо удалите навсегда сами.</p>'+
  (archived.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Тема</th><th>В архиве с</th><th>Осталось дней</th><th></th></tr>'+
   archived.map(l=>{let cls=C(l.classId);let daysLeft=Math.max(0,30-daysBetween(l.archivedAt||today,today));return '<tr><td>'+fmtDate(l.date)+'</td><td>'+e(cls?cls.name:'—')+'</td><td>'+e(l.topic||'(без темы)')+'</td><td>'+fmtDate(l.archivedAt)+'</td><td>'+daysLeft+'</td><td><button onclick="restoreLessonFromArchive(\''+l.id+'\')">Восстановить</button> <button class="danger" onclick="purgeLessonForever(\''+l.id+'\')">Удалить навсегда</button></td></tr>'}).join('')+'</table>':'<div class="empty">Архив пуст.</div>')+
  '</div>';
}
function workDocumentsTab(){
 S.docFilter=S.docFilter||{category:'',sort:'date_desc'};
 let f=S.docFilter;
 let cats=[...new Set(D.documents.map(d=>d.category||'Без категории'))].sort((a,b)=>a.localeCompare(b,'ru'));
 let docs=D.documents.filter(d=>!f.category||(d.category||'Без категории')===f.category);
 let sorters={
  date_desc:(a,b)=>b.createdAt.localeCompare(a.createdAt),
  date_asc:(a,b)=>a.createdAt.localeCompare(b.createdAt),
  name:(a,b)=>a.filename.localeCompare(b.filename,'ru'),
  category:(a,b)=>(a.category||'').localeCompare(b.category||'','ru')
 };
 docs=[...docs].sort(sorters[f.sort]||sorters.date_desc);
 return '<div class="card"><div class="top"><h2>Документы</h2><div class="toolbar"><button onclick="document.getElementById(\'doc-upload\').click()">＋ Загрузить файл</button><input id="doc-upload" type="file" multiple hidden onchange="uploadDocument(this)"></div></div>'+
  '<p class="muted small">Планы, отчёты и другая документация — отдельно от материалов, которые вы используете прямо на уроках.</p>'+
  '<div class="toolbar" style="margin-bottom:10px">'+
   '<select onchange="S.docFilter.category=this.value;render()"><option value="">Все категории</option>'+cats.map(c=>'<option value="'+e(c)+'"'+(f.category===c?' selected':'')+'>'+e(c)+'</option>').join('')+'</select>'+
   '<select onchange="S.docFilter.sort=this.value;render()"><option value="date_desc"'+(f.sort==='date_desc'?' selected':'')+'>Сначала новые</option><option value="date_asc"'+(f.sort==='date_asc'?' selected':'')+'>Сначала старые</option><option value="name"'+(f.sort==='name'?' selected':'')+'>По названию</option><option value="category"'+(f.sort==='category'?' selected':'')+'>По категории</option></select>'+
  '</div>'+
  (docs.length?'<div class="materials-list">'+docs.map(d=>'<div class="m"><span>'+matIcon(d.filename)+' '+e(d.filename)+' <span class="muted small">'+(d.category?'· '+e(d.category)+' ':'')+'· '+fmtDate(d.createdAt.slice(0,10))+'</span></span><span class="toolbar" style="flex:0"><button onclick="downloadDocument(\''+d.id+'\')">Открыть</button><button onclick="renameDocumentCategory(\''+d.id+'\')">Категория</button><button class="danger" onclick="deleteDocumentConfirm(\''+d.id+'\')">Удалить</button></span></div>').join('')+'</div>':'<div class="empty">Документов пока нет.</div>')+
  '</div>';
}
async function uploadDocument(input){
 for(let f of input.files){
  let did=uid();
  await fileStorePut(did,f);
  D.documents.push({id:did,filename:f.name,category:'Без категории',mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
 }
 save();render();
}
async function downloadDocument(id){
 let d=D.documents.find(x=>x.id===id);if(!d)return;
 let blob=await fileStoreGet(id);
 if(!blob){alert('Файл не найден в хранилище.');return}
 let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=d.filename;a.click();URL.revokeObjectURL(url);
}
function renameDocumentCategory(id){
 let d=D.documents.find(x=>x.id===id);
 let nv=prompt('Категория документа:',d.category||'');
 if(nv!==null){d.category=nv.trim()||'Без категории';save();render()}
}
function deleteDocumentConfirm(id){
 if(!confirm('Удалить документ?'))return;
 D.documents=D.documents.filter(x=>x.id!==id);
 fileStoreDelete(id).catch(()=>{});
 save();render();
}
function workMeetingsTab(){
 let ms=[...D.meetings].sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
 let today=toISO(new Date());
 let upcoming=ms.filter(m=>m.date>=today),past=ms.filter(m=>m.date<today).reverse();
 return '<div class="card"><div class="top"><h2>Предстоящие совещания</h2><button class="primary" onclick="openNewMeeting()">＋ Новое совещание</button></div>'+
  (upcoming.length?meetingsTable(upcoming):'<div class="empty">Предстоящих совещаний нет.</div>')+'</div>'+
  (past.length?'<div class="card"><h3 style="margin-top:0">Прошедшие</h3>'+meetingsTable(past)+'</div>':'');
}
function meetingsTable(list){
 return '<table class="table"><tr><th>Дата</th><th>Время</th><th>Тема</th><th>Место/формат</th><th>Участники</th><th></th></tr>'+
  list.map(m=>'<tr class="click" onclick="openEditMeeting(\''+m.id+'\')"><td>'+fmtDate(m.date)+'</td><td>'+e(m.time||'—')+'</td><td>'+e(m.title)+'</td><td>'+e(m.location||'—')+'</td><td>'+e(m.participants||'—')+'</td><td><button onclick="event.stopPropagation();deleteMeeting(\''+m.id+'\')">Удалить</button></td></tr>').join('')+
  '</table>';
}
function openNewMeeting(){
 setModalHtml('Новое совещание',
  '<label>Тема</label><input id="mt-title" placeholder="Педсовет">'+
  '<label>Дата</label><input id="mt-date" type="date" value="'+e(toISO(new Date()))+'">'+
  '<label>Время</label><input id="mt-time" placeholder="15:30">'+
  '<label>Место / формат</label><input id="mt-loc" placeholder="Каб. 204 / Zoom">'+
  '<label>Участники</label><input id="mt-part" placeholder="Завуч, кл. руководители 5-х классов">'+
  '<label>Повестка / заметки</label><textarea id="mt-agenda" class="autosize"></textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewMeeting()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveNewMeeting(){
 let title=document.getElementById('mt-title').value.trim(),date=document.getElementById('mt-date').value;
 if(!title||!date){alert('Укажите тему и дату.');return}
 D.meetings.push({id:uid(),title,date,time:document.getElementById('mt-time').value.trim(),
  location:document.getElementById('mt-loc').value.trim(),participants:document.getElementById('mt-part').value.trim(),
  agenda:document.getElementById('mt-agenda').value});
 save();closeModal();render();
}
function openEditMeeting(id){
 let m=D.meetings.find(x=>x.id===id);
 setModalHtml('Совещание',
  '<label>Тема</label><input id="mt-title" value="'+e(m.title)+'">'+
  '<label>Дата</label><input id="mt-date" type="date" value="'+e(m.date)+'">'+
  '<label>Время</label><input id="mt-time" value="'+e(m.time||'')+'">'+
  '<label>Место / формат</label><input id="mt-loc" value="'+e(m.location||'')+'">'+
  '<label>Участники</label><input id="mt-part" value="'+e(m.participants||'')+'">'+
  '<label>Повестка / заметки</label><textarea id="mt-agenda" class="autosize">'+e(m.agenda||'')+'</textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditMeeting(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteMeeting(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveEditMeeting(id){
 let m=D.meetings.find(x=>x.id===id);
 m.title=document.getElementById('mt-title').value.trim();m.date=document.getElementById('mt-date').value;
 m.time=document.getElementById('mt-time').value.trim();m.location=document.getElementById('mt-loc').value.trim();
 m.participants=document.getElementById('mt-part').value.trim();m.agenda=document.getElementById('mt-agenda').value;
 save();closeModal();render();
}
function deleteMeeting(id){if(!confirm('Удалить совещание?'))return;D.meetings=D.meetings.filter(x=>x.id!==id);save();closeModal();render()}
function priorityLabel(p){return {low:'Низкий',high:'Высокий'}[p]||'Средний'}
function priorityBadgeClass(p){return p==='high'?'red':p==='low'?'':'blue'}
function workTasksTab(){
 let today=toISO(new Date());
 let ts=[...D.workTasks].sort((a,b)=>{
  let sa=a.status==='done'?1:0,sb=b.status==='done'?1:0;
  if(sa!==sb)return sa-sb;
  return (a.dueDate||'9999-99-99').localeCompare(b.dueDate||'9999-99-99');
 });
 return '<div class="card"><div class="top"><h2>Рабочие задачи</h2><button class="primary" onclick="openNewWorkTask()">＋ Новая задача</button></div>'+
  (ts.length?'<table class="table"><tr><th></th><th>Задача</th><th>Срок</th><th>Приоритет</th><th></th></tr>'+
   ts.map(t=>{
    let overdue=t.dueDate&&t.dueDate<today&&t.status!=='done';
    return '<tr class="click" onclick="openEditWorkTask(\''+t.id+'\')"><td onclick="event.stopPropagation()"><input type="checkbox" style="width:auto" '+(t.status==='done'?'checked':'')+' onchange="toggleWorkTaskDone(\''+t.id+'\')"></td>'+
     '<td style="'+(t.status==='done'?'text-decoration:line-through;color:var(--muted)':'')+'">'+e(t.title)+'</td>'+
     '<td'+(overdue?' style="color:#c00;font-weight:700"':'')+'>'+(t.dueDate?fmtDate(t.dueDate):'—')+(overdue?' ⚠':'')+'</td>'+
     '<td><span class="badge '+priorityBadgeClass(t.priority)+'">'+priorityLabel(t.priority)+'</span></td>'+
     '<td><button onclick="event.stopPropagation();deleteWorkTask(\''+t.id+'\')">Удалить</button></td></tr>';
   }).join('')+'</table>':'<div class="empty">Задач пока нет.</div>')+
  '</div>';
}
function openNewWorkTask(){
 setModalHtml('Новая задача',
  '<label>Задача</label><input id="wt-title" placeholder="Сдать отчёт по успеваемости">'+
  '<label>Срок</label><input id="wt-due" type="date">'+
  '<label>Приоритет</label><select id="wt-pri"><option value="low">Низкий</option><option value="med" selected>Средний</option><option value="high">Высокий</option></select>'+
  '<label>Заметки</label><textarea id="wt-notes" class="autosize"></textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewWorkTask()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveNewWorkTask(){
 let title=document.getElementById('wt-title').value.trim();
 if(!title){alert('Укажите задачу.');return}
 D.workTasks.push({id:uid(),title,dueDate:document.getElementById('wt-due').value,priority:document.getElementById('wt-pri').value,status:'todo',notes:document.getElementById('wt-notes').value});
 save();closeModal();render();
}
function openEditWorkTask(id){
 let t=D.workTasks.find(x=>x.id===id);
 setModalHtml('Задача',
  '<label>Задача</label><input id="wt-title" value="'+e(t.title)+'">'+
  '<label>Срок</label><input id="wt-due" type="date" value="'+e(t.dueDate||'')+'">'+
  '<label>Приоритет</label><select id="wt-pri"><option value="low"'+(t.priority==='low'?' selected':'')+'>Низкий</option><option value="med"'+(t.priority!=='low'&&t.priority!=='high'?' selected':'')+'>Средний</option><option value="high"'+(t.priority==='high'?' selected':'')+'>Высокий</option></select>'+
  '<label>Статус</label><select id="wt-status"><option value="todo"'+(t.status==='todo'?' selected':'')+'>Не начата</option><option value="progress"'+(t.status==='progress'?' selected':'')+'>В работе</option><option value="done"'+(t.status==='done'?' selected':'')+'>Готово</option></select>'+
  '<label>Заметки</label><textarea id="wt-notes" class="autosize">'+e(t.notes||'')+'</textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditWorkTask(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteWorkTask(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveEditWorkTask(id){
 let t=D.workTasks.find(x=>x.id===id);
 t.title=document.getElementById('wt-title').value.trim();t.dueDate=document.getElementById('wt-due').value;
 t.priority=document.getElementById('wt-pri').value;t.status=document.getElementById('wt-status').value;
 t.notes=document.getElementById('wt-notes').value;
 save();closeModal();render();
}
function toggleWorkTaskDone(id){let t=D.workTasks.find(x=>x.id===id);if(t){t.status=t.status==='done'?'todo':'done';save();render()}}
function deleteWorkTask(id){if(!confirm('Удалить задачу?'))return;D.workTasks=D.workTasks.filter(x=>x.id!==id);save();closeModal();render()}
function colleagueFio(c){return e(c.lastName)+' '+e(c.firstName)+(c.middleName?' '+e(c.middleName):'')}
function colleagueFioPlain(c){return (c.lastName+' '+c.firstName+(c.middleName?' '+c.middleName:'')).trim()}
function colleagueField(c,key){return (c.customFields&&c.customFields[key])||''}
function colleagueFormFields(c){
 let cf=D.settings.fields.colleague.filter(f=>f.visible);
 return cf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('clf_'+f.key,f,c.customFields?c.customFields[f.key]:''));
}
function workColleaguesTab(){
 let cf=D.settings.fields.colleague.filter(f=>f.visible);
 S.colleagueSort=S.colleagueSort||'fio';
 let cs=[...D.colleagues];
 if(S.colleagueSort==='fio'){cs.sort((a,b)=>(a.lastName+a.firstName).localeCompare(b.lastName+b.firstName,'ru'))}
 else{
  let sf=fieldByKey('colleague',S.colleagueSort);
  if(sf)cs.sort((a,b)=>String(customFieldView(sf,a.customFields[sf.key])||'').localeCompare(String(customFieldView(sf,b.customFields[sf.key])||''),'ru'));
 }
 let sortOptions='<option value="fio"'+(S.colleagueSort==='fio'?' selected':'')+'>ФИО</option>'+cf.map(f=>'<option value="'+f.key+'"'+(S.colleagueSort===f.key?' selected':'')+'>'+e(f.label)+'</option>').join('');
 return '<div class="card"><div class="top"><h2>Коллеги</h2><div class="toolbar"><select onchange="S.colleagueSort=this.value;render()">'+sortOptions+'</select><button class="primary" onclick="openNewColleague()">＋ Добавить коллегу</button></div></div>'+
  '<div class="muted small" style="margin-bottom:6px">Подсказка: границы столбцов таблицы можно перетаскивать мышью, чтобы менять ширину.</div>'+
  '<div style="overflow-x:auto">'+
  (cs.length?'<table class="table restable" id="colleagues-table"><tr><th>ФИО</th>'+cf.map(f=>'<th>'+e(f.label)+'</th>').join('')+'<th style="width:90px"></th></tr>'+
   cs.map(c=>'<tr class="click" onclick="openColleagueCard(\''+c.id+'\')"><td>'+colleagueFio(c)+'</td>'+cf.map(f=>'<td>'+(customFieldView(f,c.customFields[f.key])?richTextView(customFieldView(f,c.customFields[f.key])):'—')+'</td>').join('')+'<td><button onclick="event.stopPropagation();openEditColleague(\''+c.id+'\')">✎</button> <button onclick="event.stopPropagation();deleteColleague(\''+c.id+'\')">✕</button></td></tr>').join('')+'</table>':'<div class="empty">Коллеги пока не добавлены.</div>')+
  '</div></div>';
}
function initColumnResize(tableId,stateKey){
 let table=document.getElementById(tableId);
 if(!table||!table.rows.length)return;
 S[stateKey]=S[stateKey]||{};
 let widths=S[stateKey];
 let headerRow=table.rows[0];
 for(let idx=0;idx<headerRow.cells.length;idx++){
  let th=headerRow.cells[idx];
  if(widths[idx]){
   for(let r=0;r<table.rows.length;r++){let cell=table.rows[r].cells[idx];if(cell)cell.style.width=widths[idx]+'px'}
  }
  if(idx===headerRow.cells.length-1)continue;
  let handle=document.createElement('div');
  handle.className='col-resizer';
  th.appendChild(handle);
  handle.addEventListener('mousedown',function(ev){
   ev.preventDefault();ev.stopPropagation();
   let startX=ev.clientX,startWidth=th.offsetWidth;
   function onMove(e2){
    let newWidth=Math.max(50,startWidth+(e2.clientX-startX));
    for(let r=0;r<table.rows.length;r++){let cell=table.rows[r].cells[idx];if(cell)cell.style.width=newWidth+'px'}
   }
   function onUp(e2){
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onUp);
    widths[idx]=Math.max(50,startWidth+(e2.clientX-startX));
   }
   document.addEventListener('mousemove',onMove);
   document.addEventListener('mouseup',onUp);
  });
 }
}
function openNewColleague(){
 setModalHtml('Новый коллега',
  '<label>Фамилия</label><input id="cl-last">'+
  '<label>Имя</label><input id="cl-first">'+
  '<label>Отчество</label><input id="cl-mid">'+
  colleagueFormFields({customFields:{}}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewColleague()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveNewColleague(){
 let last=document.getElementById('cl-last').value.trim(),first=document.getElementById('cl-first').value.trim();
 if(!last||!first){alert('Заполните фамилию и имя.');return}
 let c={id:uid(),lastName:last,firstName:first,middleName:document.getElementById('cl-mid').value.trim(),customFields:{}};
 D.settings.fields.colleague.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('clf_'+f.key);if(el)c.customFields[f.key]=readFieldValue(f,el)});
 D.colleagues.push(c);save();closeModal();render();
}
function openColleagueCard(id){
 let c=D.colleagues.find(x=>x.id===id);
 if(!c)return;
 let cf=D.settings.fields.colleague.filter(f=>f.visible);
 let body='<div class="field-view">'+(cf.map(f=>f.type==='colleagueLink'?'':section(f.label,customFieldView(f,c.customFields[f.key]))).join('')||'<div class="muted small">Дополнительных данных пока нет.</div>')+'</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="openEditColleague(\''+id+'\')">Редактировать</button><button onclick="closeModal()">Закрыть</button></div>';
 setModalHtml(colleagueFio(c),body);
}
function openEditColleague(id){
 let c=D.colleagues.find(x=>x.id===id);
 if(!c)return;
 setModalHtml('Коллега',
  '<label>Фамилия</label><input id="cl-last" value="'+e(c.lastName)+'">'+
  '<label>Имя</label><input id="cl-first" value="'+e(c.firstName)+'">'+
  '<label>Отчество</label><input id="cl-mid" value="'+e(c.middleName||'')+'">'+
  colleagueFormFields(c).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditColleague(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteColleague(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>');
 initAutosize();
}
function saveEditColleague(id){
 let c=D.colleagues.find(x=>x.id===id);
 c.lastName=document.getElementById('cl-last').value.trim();c.firstName=document.getElementById('cl-first').value.trim();
 c.middleName=document.getElementById('cl-mid').value.trim();
 D.settings.fields.colleague.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('clf_'+f.key);if(el)c.customFields[f.key]=readFieldValue(f,el)});
 save();closeModal();render();
}
function deleteColleague(id){
 if(!confirm('Удалить коллегу? Ссылки на него (например, «классный руководитель» у классов) тоже будут очищены.'))return;
 D.classes.forEach(cl=>{Object.keys(cl.customFields||{}).forEach(k=>{let fd=fieldByKey('class',k);if(fd&&fd.type==='colleagueLink'&&cl.customFields[k]===id)cl.customFields[k]=''})});
 D.colleagues=D.colleagues.filter(x=>x.id!==id);
 save();closeModal();render();
}
function searchPage(){
 let q=(S.q||'').toLowerCase();
 return '<div class="top"><div><h1>Поиск</h1><div class="muted">Ученики, уроки и материалы одновременно</div></div></div>'+
  '<div class="card"><input autofocus value="'+e(S.q)+'" oninput="S.q=this.value;renderSearchResults()" placeholder="ФИО, тема, план, заметка, файл..."></div>'+
  '<div id="results">'+searchResults(q)+'</div>';
}
function renderSearchResults(){document.getElementById('results').innerHTML=searchResults((S.q||'').toLowerCase())}
function searchResults(q){
 if(!q)return '<div class="card empty">Введите запрос для поиска.</div>';
 let ps=sortStudentsList(D.students.filter(s=>(s.lastName+' '+s.firstName+' '+s.middleName+' '+Object.values(s.customFields||{}).join(' ')).toLowerCase().includes(q)),S.studentSort);
 let ls=activeLessons().filter(l=>(l.topic+' '+Object.values(l.customFields||{}).join(' ')).toLowerCase().includes(q));
 let ms=D.materials.filter(m=>(m.filename+' '+(m.category||'')).toLowerCase().includes(q));
 let mts=D.meetings.filter(m=>(m.title+' '+(m.location||'')+' '+(m.participants||'')+' '+(m.agenda||'')).toLowerCase().includes(q));
 let wts=D.workTasks.filter(t=>(t.title+' '+(t.notes||'')).toLowerCase().includes(q));
 let cls=D.colleagues.filter(c=>(c.lastName+' '+c.firstName+' '+(c.middleName||'')+' '+Object.values(c.customFields||{}).join(' ')).toLowerCase().includes(q));
 return '<div class="card"><h2>Ученики ('+ps.length+')</h2>'+(ps.length?ps.map(s=>'<p class="click" onclick="openStudentPage(\''+s.id+'\')">'+studentFio(s)+' · '+e(studentClassNames(s))+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Уроки ('+ls.length+')</h2>'+(ls.length?ls.map(l=>'<p class="click" onclick="openLessonModal(\''+l.id+'\')">'+fmtDate(l.date)+' · '+e(C(l.classId)?.name||'—')+' · '+e(l.topic||'(без темы)')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Материалы ('+ms.length+')</h2>'+(ms.length?ms.map(m=>'<p>'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">('+e(m.category||'')+')</span> <button onclick="openMaterial(\''+m.id+'\')">Открыть</button></p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Совещания ('+mts.length+')</h2>'+(mts.length?mts.map(m=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'meetings\';render();setTimeout(()=>openEditMeeting(\''+m.id+'\'),0)">'+fmtDate(m.date)+' · '+e(m.title)+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Рабочие задачи ('+wts.length+')</h2>'+(wts.length?wts.map(t=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'tasks\';render();setTimeout(()=>openEditWorkTask(\''+t.id+'\'),0)">'+e(t.title)+(t.dueDate?' · срок: '+fmtDate(t.dueDate):'')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Коллеги ('+cls.length+')</h2>'+(cls.length?cls.map(c=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'colleagues\';render();setTimeout(()=>openColleagueCard(\''+c.id+'\'),0)">'+colleagueFio(c)+(colleagueField(c,'position')?' · '+e(colleagueField(c,'position')):'')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>';
}
function periodRange(){
 let f=S.statsFilter;
 let now=new Date();
 if(f.period==='month'){let from=new Date(now.getFullYear(),now.getMonth(),1);return{from:toISO(from),to:toISO(now)}}
 if(f.period==='year'){let y=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1;return{from:y+'-09-01',to:toISO(now)}}
 if(f.period==='custom')return{from:f.from||'0000-01-01',to:f.to||'9999-12-31'};
 let q=(D.settings.quarters||[]).find(x=>x.id===f.period);
 if(q)return{from:q.startDate,to:q.endDate};
 return{from:'0000-01-01',to:'9999-12-31'};
}
function filteredLessons(){
 let f=S.statsFilter,r=periodRange();
 return activeLessons().filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to&&(!f.classId||groupIds(f.classId).includes(l.classId)));
}
function assistantStatsAnalysis(){
 let r=periodRange();
 let ls=filteredLessons();
 if(!ls.length)return[{tone:'info',icon:'💤',text:'Пока нет данных за выбранный период — как только появятся уроки с оценками и посещаемостью, я смогу сделать выводы.',chips:[]}];
 let notes=[];
 let classRows=D.classes.map(c=>{
  let cls_ls=groupLessons(c.id).filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];cls_ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}));
  let attPct=avgAttendancePctPerLesson(cls_ls);
  let behaviorCount=0;cls_ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
  return{c,avg:avg(gv),att:attPct,behaviorCount,lessonsCount:cls_ls.length};
 }).filter(x=>x.lessonsCount>0);
 if(classRows.length>1){
  let withAvg=classRows.filter(x=>x.avg!==null);
  if(withAvg.length>1){
   let best=[...withAvg].sort((a,b)=>b.avg-a.avg)[0];
   let worst=[...withAvg].sort((a,b)=>a.avg-b.avg)[0];
   if(best.c.id!==worst.c.id&&(best.avg-worst.avg)>=0.7){
    notes.push({tone:'info',icon:'📊',text:'Заметная разница между классами: в «'+e(best.c.name)+'» средняя оценка '+round2(best.avg)+', а в «'+e(worst.c.name)+'» — '+round2(worst.avg)+'. Возможно, стоит присмотреться, что помогает в одном классе и чего не хватает в другом.',
     chips:[{kind:'class',id:best.c.id,label:best.c.name+' · '+round2(best.avg)},{kind:'class',id:worst.c.id,label:worst.c.name+' · '+round2(worst.avg)}]});
   }
  }
  let lowAtt=classRows.filter(x=>x.att!==null&&x.att<75);
  if(lowAtt.length)notes.push({tone:'warn',icon:'📉',text:'Посещаемость ниже 75% в классах: '+lowAtt.map(x=>e(x.c.name)).join(', ')+'. Возможно, стоит выяснить причину пропусков.',
   chips:lowAtt.map(x=>({kind:'class',id:x.c.id,label:x.c.name}))});
  let highBeh=classRows.filter(x=>x.behaviorCount>=3).sort((a,b)=>b.behaviorCount-a.behaviorCount);
  if(highBeh.length)notes.push({tone:'warn',icon:'⚠️',text:'Больше всего заметок о поведении накопилось в классах: '+highBeh.slice(0,3).map(x=>e(x.c.name)+' ('+x.behaviorCount+')').join(', ')+'.',
   chips:highBeh.slice(0,3).map(x=>({kind:'class',id:x.c.id,label:x.c.name+' ('+x.behaviorCount+')'}))});
 }
 let students=D.students.filter(s=>s.status!=='archived');
 let studentRows=students.map(s=>{
  let sls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];sls.forEach(l=>{let g=(l.grades||{})[s.id];if(g){let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}});
  let at=0,ap=0;sls.forEach(l=>{let v=(l.attendance||{})[s.id];if(v){at++;if(v!=='н')ap++}});
  let behaviorCount=0;sls.forEach(l=>{if((l.behaviorNotes||{})[s.id])behaviorCount++});
  return{s,avg:avg(gv),attPct:at?ap/at*100:null,absences:at-ap,behaviorCount,lessonsCount:sls.length};
 }).filter(x=>x.lessonsCount>0);
 let allAvg=avg(studentRows.map(x=>x.avg).filter(x=>x!==null));
 if(allAvg){
  let strong=studentRows.filter(x=>x.avg!==null&&x.avg-allAvg>=1).sort((a,b)=>b.avg-a.avg).slice(0,3);
  if(strong.length)notes.push({tone:'good',icon:'⭐',text:'Стабильно выше среднего по оценкам: '+strong.map(x=>studentFio(x.s)).join(', ')+'.',
   chips:strong.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' · '+round2(x.avg)}))});
  let weak=studentRows.filter(x=>x.avg!==null&&allAvg-x.avg>=1).sort((a,b)=>a.avg-b.avg).slice(0,3);
  if(weak.length)notes.push({tone:'warn',icon:'🤝',text:'Возможно, нужна дополнительная поддержка: '+weak.map(x=>studentFio(x.s)).join(', ')+' — их средняя заметно ниже общей по выборке.',
   chips:weak.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' · '+round2(x.avg)}))});
 }
 let manyAbs=studentRows.filter(x=>x.absences>=3).sort((a,b)=>b.absences-a.absences).slice(0,3);
 if(manyAbs.length)notes.push({tone:'alert',icon:'🚪',text:'Много пропусков за период: '+manyAbs.map(x=>studentFio(x.s)+' ('+x.absences+')').join(', ')+'.',
 chips:manyAbs.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' ('+x.absences+')'}))});
 let manyBeh=studentRows.filter(x=>x.behaviorCount>=2).sort((a,b)=>b.behaviorCount-a.behaviorCount).slice(0,3);
 if(manyBeh.length)notes.push({tone:'alert',icon:'❗',text:'Несколько заметок о поведении подряд: '+manyBeh.map(x=>studentFio(x.s)+' ('+x.behaviorCount+')').join(', ')+' — возможно, стоит поговорить лично.',
 chips:manyBeh.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' ('+x.behaviorCount+')'}))});
 if(!notes.length)notes.push({tone:'good',icon:'✅',text:'Пока ничего тревожного не вижу — картина по оценкам, посещаемости и поведению выглядит ровно за выбранный период.',chips:[]});
 return notes;
}
function statsAssistantCard(){
 let ch=ASSISTANT_CHARACTERS[assistantSettings().character]||ASSISTANT_CHARACTERS.dog;
 let notes=assistantStatsAnalysis();
 return '<div class="card" style="border-color:var(--accent)"><div class="top"><h2>'+ch.emoji+' Заметки ассистента</h2><button onclick="render()">↻ Обновить</button></div>'+
  '<p class="muted small">Автоматические наблюдения по текущим фильтрам — нажмите на имя ученика или класс, чтобы сразу открыть профиль.</p>'+
  '<div class="insight-list">'+notes.map(n=>
   '<div class="insight-item tone-'+n.tone+'"><div class="insight-icon">'+(n.icon||'💡')+'</div><div class="insight-body"><div class="insight-text">'+n.text+'</div>'+
   (n.chips&&n.chips.length?'<div class="insight-chips">'+n.chips.map(c=>'<span class="chip-link" onclick="'+(c.kind==='class'?'openClass':'openStudentPage')+'(\''+c.id+'\')">'+(c.kind==='class'?'🏫 ':'🧑 ')+e(c.label)+'</span>').join('')+'</div>':'')+
   '</div></div>').join('')+
  '</div></div>';
}
function statsPage(){
 let f=S.statsFilter;
 let r=periodRange();
 let ls=filteredLessons();
 let gradeVals=[];let distVals=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{if(!g.value)return;distVals.push(g.value);let n=gradeNumericValue(g.value);if(n!==null)gradeVals.push(n)}));
 let attPct=avgAttendancePctPerLesson(ls);
 let absencesCount=0;ls.forEach(l=>Object.values(l.attendance||{}).forEach(v=>{if(v==='н')absencesCount++}));
 let behaviorCount=0;ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
 let planned=ls.filter(l=>lessonStatus(l)==='red').length,partial=ls.filter(l=>lessonStatus(l)==='yellow').length,prepared=ls.filter(l=>lessonStatus(l)==='blue').length,done=ls.filter(l=>lessonStatus(l)==='green').length;
 let activeStudents=D.students.filter(s=>s.status!=='archived').length,archivedStudents=D.students.filter(s=>s.status==='archived').length;
 let scope=f.classId?'class':'global',scopeId=f.classId||'';
 return '<div class="top"><div><h1>Статистика</h1><div class="muted">Показатели учителя, классов и учеников</div></div></div>'+
  statsFilterBar()+
  '<div class="card"><h2>Мои показатели</h2><div class="grid">'+
   stat(ls.length,'Всего уроков')+stat(done,'Заполнено полностью')+stat(partial,'Частично подготовлено')+stat(prepared,'Требуют рефлексии')+stat(planned,'Не подготовлено')+
   stat(round2(avg(gradeVals)),'Средняя оценка')+stat(attPct===null?'—':Math.round(attPct*10)/10+'%','Общая посещаемость')+
   stat(gradeVals.length,'Оценок выставлено')+stat(absencesCount,'Пропусков')+stat(behaviorCount,'Заметок о поведении')+
   stat(D.classes.length,'Классов')+stat(activeStudents,'Активных учеников')+stat(archivedStudents,'Архивных учеников')+
  '</div></div>'+
  statsAssistantCard()+
  '<div class="card"><h2 style="margin-top:0">Распределение оценок <span class="muted small">(нажмите на столбец, чтобы увидеть кому и когда)</span></h2>'+svgBarChart(gradeDistData(distVals,scope,scopeId,r.from,r.to),{width:900,height:260})+'</div>'+
  '<div class="card"><h2 style="margin-top:0">Посещаемость <span class="muted small">(нажмите, чтобы увидеть кто и когда пропускал)</span></h2>'+donutChartPct(attPct,140,"showAttendanceBreakdown('"+scope+"','"+scopeId+"','"+r.from+"','"+r.to+"')")+'</div>'+
  behaviorLeaderboardCard()+
  statsClassesCard()+statsStudentsCard();
}
function statsFilterBar(){
 let f=S.statsFilter;
 let quarterOpts=(D.settings.quarters||[]).map(q=>['<option value="'+q.id+'"'+(f.period===q.id?' selected':'')+'>'+e(q.name)+'</option>']).map(x=>x[0]).join('');
 return '<div class="card"><div class="row">'+
  '<div><label>Период</label><select onchange="S.statsFilter.period=this.value;render()">'+
   [['all','Весь период'],['year','Текущий учебный год']].map(o=>'<option value="'+o[0]+'"'+(f.period===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+
   quarterOpts+
   [['month','Месяц'],['custom','Произвольный период']].map(o=>'<option value="'+o[0]+'"'+(f.period===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  '<div><label>Класс</label><select onchange="S.statsFilter.classId=this.value;render()"><option value="">Все классы</option>'+classOptionsHtml(f.classId)+'</select></div>'+
  (f.period==='custom'?'<div><label>С</label><input type="date" value="'+e(f.from)+'" onchange="S.statsFilter.from=this.value;render()"></div><div><label>По</label><input type="date" value="'+e(f.to)+'" onchange="S.statsFilter.to=this.value;render()"></div>':'')+
  '</div></div>';
}
function statsClassesCard(){
 let f=S.statsFilter,r=periodRange();
 let rows=D.classes.map(c=>{
  let ls=groupLessons(c.id).filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}));
  let attPct=avgAttendancePctPerLesson(ls);
  let behaviorCount=0;ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
  return {c,studentsCount:peopleGroup(c.id).length,lessonsCount:ls.length,avgGrade:avg(gv),attendancePct:attPct===null?null:Math.round(attPct*10)/10,behaviorCount,
   planned:ls.filter(l=>lessonStatus(l)==='red').length,partial:ls.filter(l=>lessonStatus(l)==='yellow').length,prepared:ls.filter(l=>lessonStatus(l)==='blue').length,done:ls.filter(l=>lessonStatus(l)==='green').length};
 });
 let sortKey=S.statsFilter.sortClasses;
 let sorters={name:(a,b)=>compareClasses(a.c,b.c),avg:(a,b)=>(b.avgGrade||0)-(a.avgGrade||0),att:(a,b)=>(b.attendancePct||0)-(a.attendancePct||0),students:(a,b)=>b.studentsCount-a.studentsCount,lessons:(a,b)=>b.lessonsCount-a.lessonsCount};
 rows.sort(sorters[sortKey]||sorters.name);
 return '<div class="card"><div class="top"><h2>Статистика по классам</h2><select onchange="S.statsFilter.sortClasses=this.value;render()">'+
  [['name','По названию'],['avg','По средней оценке'],['att','По посещаемости'],['students','По кол-ву учеников'],['lessons','По кол-ву уроков']].map(o=>'<option value="'+o[0]+'"'+(sortKey===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  '<div class="grid">'+rows.map(r=>'<div class="card click" onclick="openClass(\''+r.c.id+'\')"><b>'+e(r.c.name)+'</b><div class="small muted">'+r.studentsCount+' учеников</div><div>Средняя: '+round2(r.avgGrade)+'</div><div>Посещаемость: '+(r.attendancePct===null?'—':r.attendancePct+'%')+'</div><div>Уроков: '+r.lessonsCount+'</div><div class="small muted">Заметок о поведении: '+r.behaviorCount+'</div><div class="small">🔴'+r.planned+' 🟡'+r.partial+' 🔵'+r.prepared+' 🟢'+r.done+'</div></div>').join('')+
  (rows.length?'':'<div class="empty">Классов пока нет.</div>')+'</div></div>';
}
function studentBadgeInfo(metrics,baseline){
 let reasons=[];let top=false,attention=false;
 let avgGrade=metrics.avgGrade,absences=metrics.absences||0,behaviorCount=metrics.behaviorCount||0;
 if(avgGrade!==null&&baseline!==null){
  if(avgGrade-baseline>=1){top=true;reasons.push('средняя выше группы на '+round2(avgGrade-baseline));}
  if(baseline-avgGrade>=1){attention=true;reasons.push('средняя ниже группы на '+round2(baseline-avgGrade));}
 }
 if(absences>=3){attention=true;reasons.push('пропусков: '+absences);}
 if(behaviorCount>=2){attention=true;reasons.push('замечаний о поведении: '+behaviorCount);}
 return {top,attention,reasons};
}
function studentBadgeHtml(metrics,baseline){
 let info=studentBadgeInfo(metrics,baseline);
 let out='';
 if(info.top)out+='<span class="stbadge" title="Высокий результат: '+e(info.reasons.join(', '))+'">🏆</span>';
 if(info.attention)out+='<span class="stbadge" title="Стоит обратить внимание: '+e(info.reasons.join(', '))+'">❗</span>';
 return out;
}
function statsStudentsCard(){
 let f=S.statsFilter,r=periodRange();
 let students=D.students.filter(s=>s.status!=='archived'&&(!f.classId||(s.classIds||[]).some(i=>groupIds(f.classId).includes(i))));
 let rows=students.map(s=>{
  let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];ls.forEach(l=>{let g=(l.grades||{})[s.id];if(g){let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}});
  let at=0,ap=0;ls.forEach(l=>{let v=(l.attendance||{})[s.id];if(v){at++;if(v!=='н')ap++}});
  let behaviorCount=0;ls.forEach(l=>{if((l.behaviorNotes||{})[s.id])behaviorCount++});
  return {s,avgGrade:avg(gv),gradesCount:gv.length,attendancePct:at?Math.round(ap/at*1000)/10:null,absences:at-ap,behaviorCount};
 });
 let sortKey=S.statsFilter.sortStudents;
 let sorters={fio:(a,b)=>(a.s.lastName+a.s.firstName).localeCompare(b.s.lastName+b.s.firstName,'ru'),avg:(a,b)=>(b.avgGrade||0)-(a.avgGrade||0),att:(a,b)=>(b.attendancePct||0)-(a.attendancePct||0),grades:(a,b)=>b.gradesCount-a.gradesCount,absences:(a,b)=>b.absences-a.absences};
 rows.sort(sorters[sortKey]||sorters.fio);
 let baseline=avg(rows.map(r=>r.avgGrade).filter(x=>x!==null));
 return '<div class="card"><div class="top"><h2>Статистика по ученикам</h2><select onchange="S.statsFilter.sortStudents=this.value;render()">'+
  [['fio','По ФИО'],['avg','По средней оценке'],['att','По посещаемости'],['grades','По кол-ву оценок'],['absences','По кол-ву пропусков']].map(o=>'<option value="'+o[0]+'"'+(sortKey===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  (rows.length?'<table class="table"><tr><th>Ученик</th><th>Класс</th><th>Средняя</th><th>Оценок</th><th>Посещаемость</th><th>Пропусков</th><th>Заметок о поведении</th></tr>'+
   rows.map(r=>{let info=studentBadgeInfo(r,baseline);let rowClass='click'+(info.top?' row-top':'')+(info.attention?' row-attention':'');
    return '<tr class="'+rowClass+'" onclick="openStudentPage(\''+r.s.id+'\')"><td>'+studentFio(r.s)+studentBadgeHtml(r,baseline)+'</td><td>'+e(studentClassNames(r.s))+'</td><td>'+round2(r.avgGrade)+'</td><td>'+r.gradesCount+'</td><td>'+(r.attendancePct===null?'—':r.attendancePct+'%')+'</td><td>'+r.absences+'</td><td>'+r.behaviorCount+'</td></tr>';
   }).join('')+'</table>'+
   '<div class="badge-legend"><span>🏆 — средняя заметно выше остальных в этом списке</span><span>❗ — стоит обратить внимание: низкая средняя, много пропусков или замечания о поведении</span></div>'
   :'<div class="empty">Учеников пока нет.</div>')+'</div>';
}
function studentInitials(s){return ((s.lastName||'')[0]||'')+((s.firstName||'')[0]||'')}
function behaviorLeaderboardData(){
 let ls=filteredLessons();
 let map={};
 ls.forEach(l=>{
  let bn=l.behaviorNotes||{};
  Object.keys(bn).forEach(sid=>{
   let txt=(bn[sid]||'').trim();if(!txt)return;
   let s=P(sid);if(!s)return;
   if(!map[sid])map[sid]={s,count:0,items:[]};
   map[sid].count++;
   map[sid].items.push({date:l.date,cls:C(l.classId),note:txt,lessonId:l.id});
  });
 });
 let rows=Object.values(map).sort((a,b)=>b.count-a.count||(a.s.lastName+a.s.firstName).localeCompare(b.s.lastName+b.s.firstName,'ru'));
 rows.forEach(r=>r.items.sort((a,b)=>b.date.localeCompare(a.date)));
 return rows;
}
function behaviorLeaderboardCard(){
 let rows=behaviorLeaderboardData();
 if(!rows.length)return '<div class="card"><h2 style="margin-top:0">🧭 Замечания о поведении</h2><div class="muted small">За выбранный период замечаний о поведении нет.</div></div>';
 let top=rows.slice(0,12);
 return '<div class="card"><h2 style="margin-top:0">🧭 Рейтинг замечаний о поведении <span class="muted small">(нажмите на ученика, чтобы увидеть список)</span></h2>'+
  '<div class="rank-list">'+top.map((r,i)=>
   '<div class="rank-row'+(i<3?' top'+(i+1):'')+'" onclick="showBehaviorDetail(\''+r.s.id+'\')"><div class="rank-pos">'+(i+1)+'</div><div class="rank-avatar">'+e(studentInitials(r.s))+'</div><div><div class="rank-name">'+studentFio(r.s)+'</div><div class="rank-sub">'+e(studentClassNames(r.s))+'</div></div><div class="rank-count">'+r.count+'</div></div>'
  ).join('')+
  (rows.length>top.length?'<div class="muted small" style="margin-top:6px">И ещё '+(rows.length-top.length)+' учеников с замечаниями.</div>':'')+
  '</div></div>';
}
function showBehaviorDetail(sid){
 let rows=behaviorLeaderboardData();
 let r=rows.find(x=>x.s.id===sid);
 if(!r)return;
 setModalHtml(studentFio(r.s)+' — замечания о поведении',
  '<div class="muted small" style="margin-bottom:10px">Всего за выбранный период: <b>'+r.count+'</b></div>'+
  '<div style="overflow:auto"><table class="table"><tr><th>Дата</th><th>Класс</th><th>Замечание</th></tr>'+
  r.items.map(it=>'<tr class="click" onclick="closeModal();openLessonModal(\''+it.lessonId+'\')"><td>'+fmtDate(it.date)+'</td><td>'+(it.cls?e(it.cls.name):'—')+'</td><td>'+e(it.note)+'</td></tr>').join('')+
  '</table></div><div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();openStudentPage('+"'"+sid+"'"+')">Открыть профиль ученика</button><button onclick="closeModal()">Закрыть</button></div>',true);
}
function setMaterialsGradeFilter(v){S.materialsGradeFilter=v;render()}
function materialCardHtml(m){
 return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">'+(m.isLink?'ссылка':m.size?Math.round(m.size/1024)+' КБ':'')+(m.category?' · '+e(m.category):'')+'</span></span><span class="toolbar" style="flex:0"><button onclick="openMaterial(\''+m.id+'\')">'+(m.isLink?'Перейти':'Открыть')+'</button><button onclick="openEditMaterial(\''+m.id+'\')">Изменить</button><button class="danger" onclick="deleteMaterialConfirm(\''+m.id+'\')">Удалить</button></span></div>';
}
function materialsPage(){
 let filter=S.materialsGradeFilter||'';
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 let gradeOpts=levels.map(n=>'<option value="'+e(n)+'"'+(filter===String(n)?' selected':'')+'>'+e(n)+'-е классы</option>').join('');
 let filterHtml='<select onchange="setMaterialsGradeFilter(this.value)" style="width:auto;display:inline-block"><option value=""'+(filter===''?' selected':'')+'>Все параллели</option><option value="__none__"'+(filter==='__none__'?' selected':'')+'>Без параллели</option>'+gradeOpts+'</select>';
 let top='<div class="top"><div><h1>Материалы</h1><div class="muted">Общая библиотека файлов и ссылок, сгруппированная по тем же параллелям, что и «Библиотека уроков» — удобно прикреплять к конкретной параллели</div></div>'+
  '<div class="toolbar"><button onclick="document.getElementById(\'lib-upload\').click()">＋ Загрузить файл</button><input id="lib-upload" type="file" multiple hidden onchange="uploadToLibrary(this)"><button onclick="openAddLinkMaterial()">🔗 Добавить ссылку</button></div></div>';
 if(!D.materials.length)return top+'<div class="card empty">В библиотеке пока нет файлов и ссылок.</div>';
 let groups={};
 D.materials.forEach(m=>{let key=(m.gradeNumber===null||m.gradeNumber===undefined||m.gradeNumber==='')?'__none__':String(m.gradeNumber);(groups[key]=groups[key]||[]).push(m)});
 let sections=[];
 levels.forEach(n=>{
  let key=String(n);
  if(!groups[key])return;
  if(filter&&filter!==key)return;
  sections.push({title:n+'-е классы',items:groups[key]});
  delete groups[key];
 });
 if(!filter){
  Object.keys(groups).forEach(key=>{
   if(key==='__none__')return;
   sections.push({title:key+' (параллель убрана из настроек)',items:groups[key]});
  });
 }
 if(groups.__none__&&(!filter||filter==='__none__')){
  sections.push({title:'Без параллели',items:groups.__none__});
 }
 let body=sections.length?sections.map(sec=>{
  let cats={};
  sec.items.forEach(m=>{let cat=m.category||'Без категории';(cats[cat]=cats[cat]||[]).push(m)});
  let catNames=Object.keys(cats).sort((a,b)=>a.localeCompare(b,'ru'));
  return '<h3 style="margin:18px 0 8px">'+e(sec.title)+' <span class="muted small">('+sec.items.length+')</span></h3>'+
   catNames.map(cat=>'<div class="card"><div class="tree-cat">'+e(cat)+'</div><div class="materials-list">'+cats[cat].map(materialCardHtml).join('')+'</div></div>').join('');
 }).join(''):'<div class="card empty">В этой параллели пока нет материалов.</div>';
 return top+'<div class="toolbar" style="margin-bottom:6px">Параллель: '+filterHtml+'</div>'+body;
}
function materialGradeOptionsHtml(selected){
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 return '<option value="">— без параллели —</option>'+levels.map(n=>'<option value="'+e(n)+'"'+(String(selected)===String(n)?' selected':'')+'>'+e(n)+'</option>').join('');
}
function openAddLinkMaterial(presetCategory,presetGrade){
 setModalHtml('Добавить ссылку',
  '<label>Название</label><input id="lm-name" placeholder="Видео по теме «Атмосфера»">'+
  '<label>Ссылка (URL)</label><input id="lm-url" placeholder="https://...">'+
  '<label>Параллель (папка в библиотеке материалов)</label><select id="lm-grade">'+materialGradeOptionsHtml(presetGrade||'')+'</select>'+
  '<label>Категория</label><input id="lm-cat" value="'+e(presetCategory||'')+'" placeholder="Например, название класса или темы">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveLinkMaterial()">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveLinkMaterial(){
 let name=document.getElementById('lm-name').value.trim();
 let url=document.getElementById('lm-url').value.trim();
 if(!name||!url){alert('Укажите название и ссылку.');return}
 if(!/^https?:\/\//i.test(url))url='https://'+url;
 let mid=uid();
 let gradeVal=document.getElementById('lm-grade')?document.getElementById('lm-grade').value:'';
 D.materials.push({id:mid,filename:name,category:document.getElementById('lm-cat').value.trim()||'Без категории',gradeNumber:gradeVal||null,isLink:true,url,mimeType:'',size:0,createdAt:new Date().toISOString()});
 save();closeModal();render();
 return mid;
}
async function uploadToLibrary(input){
 for(let f of input.files){
  let mid=uid();
  await fileStorePut(mid,f);
  D.materials.push({id:mid,filename:f.name,category:'Без категории',gradeNumber:null,mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
 }
 save();render();
}
function openEditMaterial(mid){
 let m=D.materials.find(x=>x.id===mid);if(!m)return;
 setModalHtml('Изменить материал',
  '<label>Название</label><input id="em-name" value="'+e(m.filename)+'">'+
  '<label>Параллель (папка в библиотеке материалов)</label><select id="em-grade">'+materialGradeOptionsHtml(m.gradeNumber||'')+'</select>'+
  '<label>Категория</label><input id="em-cat" value="'+e(m.category||'')+'" placeholder="Например, название класса или темы">'+
  (m.isLink?'<label>Ссылка (URL)</label><input id="em-url" value="'+e(m.url||'')+'">':'')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditMaterial(\''+mid+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveEditMaterial(mid){
 let m=D.materials.find(x=>x.id===mid);if(!m)return;
 let name=document.getElementById('em-name').value.trim();
 if(!name){alert('Укажите название.');return}
 m.filename=name;
 m.category=document.getElementById('em-cat').value.trim()||'Без категории';
 m.gradeNumber=document.getElementById('em-grade').value||null;
 if(m.isLink){
  let url=document.getElementById('em-url').value.trim();
  if(url){if(!/^https?:\/\//i.test(url))url='https://'+url;m.url=url}
 }
 save();closeModal();render();
}
function deleteMaterialConfirm(mid){
 if(!confirm('Удалить файл из библиотеки? Он также будет убран из всех уроков, где использовался.'))return;
 D.lessons.forEach(l=>{if(l.materialIds)l.materialIds=l.materialIds.filter(x=>x!==mid)});
 D.materials=D.materials.filter(m=>m.id!==mid);
 fileStoreDelete(mid).catch(()=>{});
 save();render();
}
function gradeOptionsHtml(selected){
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 return levels.map(n=>'<option value="'+e(n)+'"'+(String(selected)===String(n)?' selected':'')+'>'+e(n)+'</option>').join('');
}
function templateCardHtml(t){
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let details=lf.map(f=>section(f.label,t.fields[f.key])).join('');
 return '<div class="card"><details class="dblock" style="margin:0"><summary><span><b>'+e(t.name)+'</b>'+(t.topic?' <span class="muted small">· '+e(t.topic)+'</span>':'')+'</span></summary>'+
  '<div class="dbody">'+(details||'<div class="muted small">Поля пока не заполнены.</div>')+'</div></details>'+
  '<div class="toolbar" style="margin-top:12px;flex-wrap:wrap"><button class="primary" style="flex:1;min-width:200px" onclick="openPlaceTemplateInSchedule(\''+t.id+'\')">📅 Разместить в расписании</button><button style="flex:1;min-width:120px" onclick="openEditTemplate(\''+t.id+'\')">Изменить</button><button class="danger" style="flex:1;min-width:120px" onclick="deleteTemplate(\''+t.id+'\')">Удалить</button></div>'+
  '</div>';
}
function setLibraryGradeFilter(v){S.libraryClassFilter=v;render()}
function lessonLibraryPage(){
 let filter=S.libraryClassFilter||'';
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 let gradeOpts=levels.map(n=>'<option value="'+e(n)+'"'+(filter===String(n)?' selected':'')+'>'+e(n)+'-е классы</option>').join('');
 let filterHtml='<select onchange="setLibraryGradeFilter(this.value)" style="width:auto;display:inline-block"><option value=""'+(filter===''?' selected':'')+'>Все параллели</option><option value="__none__"'+(filter==='__none__'?' selected':'')+'>Без параллели</option>'+gradeOpts+'</select>';
 if(!D.lessonTemplates.length){
  return '<div class="top"><div><h1>Библиотека уроков</h1><div class="muted">Составьте урок заранее (тема, план, домашнее задание и т.д.), а потом сразу расставьте его по расписанию — в том числе одновременно на несколько параллельных классов</div></div>'+
   '<button class="primary" onclick="openAddTemplate()">＋ Новый урок в библиотеку</button></div>'+
   '<div class="card empty">В библиотеке пока нет уроков.</div>';
 }
 let groups={};
 D.lessonTemplates.forEach(t=>{let key=(t.gradeNumber===null||t.gradeNumber===undefined||t.gradeNumber==='')?'__none__':String(t.gradeNumber);(groups[key]=groups[key]||[]).push(t)});
 let sections=[];
 levels.forEach(n=>{
  let key=String(n);
  if(!groups[key])return;
  if(filter&&filter!==key)return;
  sections.push({title:n+'-е классы',items:groups[key]});
  delete groups[key];
 });
 if(!filter){
  Object.keys(groups).forEach(key=>{
   if(key==='__none__')return;
   sections.push({title:key+' (параллель убрана из настроек)',items:groups[key]});
  });
 }
 if(groups.__none__&&(!filter||filter==='__none__')){
  sections.push({title:'Без параллели',items:groups.__none__});
 }
 let body=sections.length?sections.map(sec=>
  '<h3 style="margin:18px 0 8px">'+e(sec.title)+' <span class="muted small">('+sec.items.length+')</span></h3>'+
  sec.items.map(templateCardHtml).join('')
 ).join(''):'<div class="card empty">В этой папке пока нет уроков.</div>';
 return '<div class="top"><div><h1>Библиотека уроков</h1><div class="muted">Составьте урок заранее (тема, план, домашнее задание и т.д.), а потом сразу расставьте его по расписанию — в том числе одновременно на несколько параллельных классов</div></div>'+
  '<button class="primary" onclick="openAddTemplate()">＋ Новый урок в библиотеку</button></div>'+
  '<div class="toolbar" style="margin-bottom:6px">Параллель: '+filterHtml+'</div>'+
  body;
}
function templateFormFields(t){
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 return lf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('t-lf_'+f.key,f,t.fields?t.fields[f.key]:''));
}
function openAddTemplate(){
 setModalHtml('Новый урок в библиотеку',
  '<label>Название (для себя, в списке библиотеки)</label><input id="t-name" placeholder="Стандартный урок географии">'+
  '<label>Параллель (папка в библиотеке)</label><select id="t-grade"><option value="">— без параллели —</option>'+gradeOptionsHtml('')+'</select>'+
  '<label>Тема урока</label><input id="t-topic" placeholder="Атмосфера Земли">'+
  templateFormFields({fields:{}}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveTemplate()">Сохранить в библиотеку</button><button onclick="closeModal()">Отмена</button></div>',true);
 initAutosize();
}
function saveTemplate(){
 let name=document.getElementById('t-name').value.trim();
 if(!name){alert('Укажите название.');return}
 let fields={};
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('t-lf_'+f.key);if(el)fields[f.key]=readFieldValue(f,el)});
 let gradeVal=document.getElementById('t-grade').value;
 D.lessonTemplates.push({id:uid(),name,gradeNumber:gradeVal||null,topic:document.getElementById('t-topic').value.trim(),fields});
 save();closeModal();render();
}
function openEditTemplate(id){
 let t=D.lessonTemplates.find(x=>x.id===id);if(!t)return;
 setModalHtml('Урок в библиотеке',
  '<label>Название (для себя, в списке библиотеки)</label><input id="t-name" value="'+e(t.name)+'">'+
  '<label>Параллель (папка в библиотеке)</label><select id="t-grade"><option value="">— без параллели —</option>'+gradeOptionsHtml(t.gradeNumber||'')+'</select>'+
  '<label>Тема урока</label><input id="t-topic" value="'+e(t.topic||'')+'">'+
  templateFormFields(t).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditTemplate(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteTemplate(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>',true);
 initAutosize();
}
function saveEditTemplate(id){
 let t=D.lessonTemplates.find(x=>x.id===id);if(!t)return;
 t.name=document.getElementById('t-name').value.trim();
 let gradeVal=document.getElementById('t-grade').value;
 t.gradeNumber=gradeVal||null;
 t.topic=document.getElementById('t-topic').value.trim();
 let fields={};
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('t-lf_'+f.key);if(el)fields[f.key]=readFieldValue(f,el)});
 t.fields=fields;
 save();closeModal();render();
}
function deleteTemplate(id){if(!confirm('Удалить урок из библиотеки?'))return;D.lessonTemplates=D.lessonTemplates.filter(t=>t.id!==id);save();closeModal();render()}
function applyTemplateToDraft(tid){
 let t=D.lessonTemplates.find(x=>x.id===tid);if(!t)return;
 let d=S.lessonModal.draft;
 let topicIsEmpty=!d.topic||!String(d.topic).trim();
 if(t.topic&&topicIsEmpty)d.topic=t.topic;
 d.customFields=d.customFields||{};
 Object.keys(t.fields||{}).forEach(k=>{
  let cur=d.customFields[k];
  let isEmpty=cur===undefined||cur===null||cur===''||(Array.isArray(cur)&&cur.length===0);
  if(isEmpty)d.customFields[k]=t.fields[k];
 });
 renderModalOnly();
}
function openPlaceTemplateInSchedule(templateId){
 let t=D.lessonTemplates.find(x=>x.id===templateId);if(!t)return;
 let today=toISO(new Date());
 let classesHtml='<label>В какие классы и на какое время поставить урок «'+e(t.name)+'»</label><table class="table"><tr><th></th><th>Класс</th><th>Дата</th><th>№ урока</th></tr>'+
  sortedClasses(D.classes.filter(c=>c.type!=='club')).map(c=>'<tr><td><input type="checkbox" class="tpl-c" data-class="'+c.id+'" style="width:auto"></td><td>'+e(c.name)+'</td><td><input type="date" class="tpl-date" data-class="'+c.id+'" value="'+today+'"></td><td><select class="tpl-num" data-class="'+c.id+'">'+LESSON_TIMES.map(x=>'<option value="'+x.n+'">'+x.n+'</option>').join('')+'</select></td></tr>').join('')+
  '</table>';
 setModalHtml('Разместить урок в расписании',classesHtml+'<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmPlaceTemplate(\''+templateId+'\')">Создать уроки</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmPlaceTemplate(templateId){
 let t=D.lessonTemplates.find(x=>x.id===templateId);if(!t)return;
 let created=0,skipped=[];
 document.querySelectorAll('.tpl-c').forEach(cb=>{
  if(!cb.checked)return;
  let classId=cb.dataset.class;
  let date=document.querySelector('.tpl-date[data-class="'+classId+'"]').value;
  let num=+document.querySelector('.tpl-num[data-class="'+classId+'"]').value;
  let blk=findBlock(date,num);
  if(blk){skipped.push(C(classId).name+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(C(classId).name+' — слот уже занят');return}
  let time=timeFor(num);
  let nl={id:uid(),date,lessonNumber:num,startTime:time.start,endTime:time.end,classId,topic:t.topic||'',
   customFields:{...t.fields},attendance:{},grades:{},materialIds:[]};
  D.lessons.push(nl);created++;
 });
 save();closeModal();
 alert('Создано уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
/* ===================== СВОДНЫЕ ВЕДОМОСТИ (НЕСКОЛЬКО КЛАССОВ) ===================== */
function reportsClassList(){return sortedClasses(D.classes.filter(c=>c.type!=='club')).concat(sortedClasses(D.classes.filter(c=>c.type==='club')))}
/* если выбран и кружок, и его подгруппа — подгруппа уже входит в кружок, второй раз её не печатаем */
function reportsDedupe(list){
 let ids=new Set(list.map(c=>c.id));
 return list.filter(c=>{let p=c.parentClubId,guard=0;while(p&&guard++<20){if(ids.has(p))return false;let pc=C(p);p=pc?pc.parentClubId:null}return true});
}
function reportsSelectedClasses(){return reportsClassList().filter(c=>S.reportsSelClasses.has(c.id))}
function toggleReportClass(id){if(S.reportsSelClasses.has(id))S.reportsSelClasses.delete(id);else S.reportsSelClasses.add(id);render()}
function selectAllReportClasses(){S.reportsSelClasses=new Set(reportsClassList().map(c=>c.id));render()}
function clearReportClasses(){S.reportsSelClasses=new Set();render()}
function setReportLessonDate(id,v){S.reportsLessonDates[id]=v}
function reportClassChip(c){
 let on=S.reportsSelClasses.has(c.id);
 return '<label class="rp-chip'+(on?' on':'')+'"><input type="checkbox" '+(on?'checked':'')+' onchange="toggleReportClass(\''+c.id+'\')"><span class="rp-name">'+e(c.name)+'</span>'+(c.subject?'<span class="rp-sub">'+e(c.subject)+'</span>':'')+'</label>';
}
function reportGradeKey(c){return c.type==='club'?'club':(c.gradeNumber==null?'other':String(c.gradeNumber))}
function toggleReportGrade(k){
 let list=reportsClassList().filter(c=>reportGradeKey(c)===k);
 let all=list.every(c=>S.reportsSelClasses.has(c.id));
 list.forEach(c=>{if(all)S.reportsSelClasses.delete(c.id);else S.reportsSelClasses.add(c.id)});
 render();
}
function reportClassPicker(classes){
 let groups={},order=[];
 classes.forEach(c=>{let k=reportGradeKey(c);if(!groups[k]){groups[k]=[];order.push(k)}groups[k].push(c)});
 return '<div class="rp-table">'+order.map(k=>{
  let list=groups[k],all=list.every(c=>S.reportsSelClasses.has(c.id));
  return '<div class="rp-row"><button class="rp-head'+(all?' on':'')+'" onclick="toggleReportGrade(\''+k+'\')" title="'+(k==='club'?'Выбрать / снять все кружки':'Выбрать / снять всю параллель')+'">'+(k==='other'?'…':k==='club'?'Кр.':k)+'</button><div class="rp-cells">'+list.map(reportClassChip).join('')+'</div></div>';
 }).join('')+'</div>';
}
function commentMatches(comment,query){
 let norm=x=>String(x||'').toLowerCase().replace(/ё/g,'е');
 let c=norm(comment),toks=norm(query).split(/\s+/).filter(Boolean);
 return toks.length>0&&toks.every(t=>c.includes(t));
}
function collectCommentRows(classes,q){
 let out=[];
 let includeHS=S.reportsIncludeHomeschool!==false;
 classes.forEach(c=>{
  let ps=sortStudentsList(people(c.id),S.studentSort).filter(s=>includeHS||!s.homeschool);
  let ls=activeLessons().filter(l=>l.classId===c.id&&!l.cancelled).sort((a,b)=>a.date.localeCompare(b.date));
  let rows=[];
  ps.forEach(st=>{ls.forEach(l=>{let g=(l.grades||{})[st.id];if(g&&commentMatches(g.comment,q))rows.push({s:st,l,g,bn:((l.behaviorNotes||{})[st.id]||'').trim()})})});
  if(rows.length)out.push({c,rows});
 });
 return out;
}
function commentReportPreviewHtml(){
 let q=(S.reportsComment||'').trim();
 if(!q)return '<div class="muted small">Начните вводить — здесь сразу появятся найденные оценки. Достаточно фрагмента (например, «диагност» или «12 баллов»).</div>';
 let classes=reportsSelectedClasses();
 if(!classes.length)return '<div class="muted small">Выберите классы выше.</div>';
 let groups=collectCommentRows(classes,q);
 let flat=[];groups.forEach(g=>g.rows.forEach(r=>flat.push({c:g.c,r})));
 if(!flat.length)return '<div class="muted small">Ничего не найдено.</div>';
 let LIM=30;
 return '<div class="small" style="margin-bottom:6px"><b>Найдено оценок: '+flat.length+'</b>'+(flat.length>LIM?' <span class="muted">(показаны первые '+LIM+', в печать попадут все)</span>':'')+'</div>'+
  '<div style="overflow:auto"><table class="table"><tr><th>Класс</th><th>Ученик</th><th>Дата</th><th>Оценка</th><th>Комментарий</th></tr>'+
  flat.slice(0,LIM).map(x=>'<tr class="click" onclick="openLessonModal(\''+x.r.l.id+'\')"><td>'+e(x.c.name)+'</td><td>'+studentFio(x.r.s)+'</td><td>'+fmtDate(x.r.l.date)+'</td><td>'+e(gradeText(x.r.g))+'</td><td class="muted">'+e(x.r.g.comment||'')+'</td></tr>').join('')+'</table></div>';
}
function updateCommentReportPreview(){let el=document.getElementById('report-comment-preview');if(el)el.innerHTML=commentReportPreviewHtml()}
function printBehaviorSection(ps,ls){
 let rows=[];
 ps.forEach(st=>{ls.forEach(l=>{let bn=((l.behaviorNotes||{})[st.id]||'').trim();if(bn)rows.push({s:st,l,bn})})});
 if(!rows.length)return '';
 return '<h3 style="font-size:13px;margin-top:12px">Замечания о поведении</h3><table><tr><th>Ученик</th><th>Дата</th><th>Замечание</th></tr>'+
  rows.map(r=>'<tr><td>'+studentFio(r.s)+'</td><td>'+fmtDate(r.l.date)+'</td><td>'+e(r.bn)+'</td></tr>').join('')+'</table>';
}
function reportsPeriodChoices(){
 let qs=(D.settings.quarters||[]).filter(q=>q.startDate&&q.endDate).slice().sort((a,b)=>a.startDate.localeCompare(b.startDate));
 let quarters=qs.map(q=>({id:q.id,name:q.name,startDate:q.startDate,endDate:q.endDate}));
 let halves=[];
 if(qs.length>=2){
  let mid=Math.ceil(qs.length/2);
  [qs.slice(0,mid),qs.slice(mid)].forEach((g,i)=>{
   if(!g.length)return;
   halves.push({id:'half-'+(i+1),name:(i+1)+' полугодие',startDate:g[0].startDate,endDate:g[g.length-1].endDate});
  });
 } else {
  let m=(D.settings.academicYear||'').match(/(\d{4})/);
  if(m){let y=+m[1];halves=[
   {id:'half-1',name:'1 полугодие',startDate:y+'-09-01',endDate:y+'-12-31'},
   {id:'half-2',name:'2 полугодие',startDate:(y+1)+'-01-01',endDate:(y+1)+'-05-31'}
  ]}
 }
 return {quarters,halves};
}
function reportsFullPeriodResolve(){
 let c=reportsPeriodChoices(),all=[...c.quarters,...c.halves];
 let per=S.reportsFullPeriod||'all';
 if(per!=='all'&&per!=='custom'&&!all.find(x=>x.id===per))per='all';
 S.reportsFullPeriod=per;
 return {per,choices:all};
}
function reportsFullPeriodInfo(){
 let {per,choices}=reportsFullPeriodResolve();
 if(per==='all')return{per,from:'',to:'',label:'Весь период'};
 if(per==='custom')return{per,from:S.reportsFullFrom||'',to:S.reportsFullTo||'',label:'Свой период'};
 let p=choices.find(x=>x.id===per)||{name:'Весь период',startDate:'',endDate:''};
 return{per,from:p.startDate,to:p.endDate,label:p.name};
}
function reportsFullRangeLabel(info){
 info=info||reportsFullPeriodInfo();
 if(!info.from&&!info.to)return info.label;
 return info.label+' · '+(info.from?fmtDate(info.from):'начало')+' – '+(info.to?fmtDate(info.to):'сегодня');
}
function setReportsFullPeriod(v){
 S.reportsFullPeriod=v;
 if(v==='custom'){
  let today=toISO(new Date());
  if(!S.reportsFullFrom)S.reportsFullFrom=addDays(today,-63);
  if(!S.reportsFullTo)S.reportsFullTo=today;
 }
 render();
}
function setReportsFullDate(which,v){
 if(which==='from')S.reportsFullFrom=v;else S.reportsFullTo=v;
 render();
}
function reportsFullPeriodControlsHtml(){
 let info=reportsFullPeriodInfo(),c=reportsPeriodChoices();
 let btn=(id,label)=>'<button class="'+(info.per===id?'active':'')+'" onclick="setReportsFullPeriod(\''+id+'\')">'+e(label)+'</button>';
 let rangeBtn=[['all','Весь период'],...c.quarters.map(q=>[q.id,q.name]),...c.halves.map(h=>[h.id,h.name]),['custom','Свой период…']]
  .map(x=>btn(x[0],x[1])).join('');
 let lessons=0;
 reportsDedupe(reportsSelectedClasses()).forEach(cl=>{
  lessons+=groupLessons(cl.id).filter(l=>!l.cancelled&&(!info.from||l.date>=info.from)&&(!info.to||l.date<=info.to)).length;
 });
 return '<div class="tabs">'+rangeBtn+'</div>'+
  (info.per==='custom'?'<div class="rp-dates" style="margin-bottom:10px"><div class="rp-date"><b>С какой даты</b><input type="date" value="'+e(S.reportsFullFrom||'')+'" onchange="setReportsFullDate(\'from\',this.value)"></div><div class="rp-date"><b>По какую дату</b><input type="date" value="'+e(S.reportsFullTo||'')+'" onchange="setReportsFullDate(\'to\',this.value)"></div></div>':'')+
  '<div class="toolbar" style="margin-bottom:12px"><span class="badge blue">'+e(reportsFullRangeLabel(info))+'</span><span class="muted small">уроков в выбранных классах: '+lessons+'</span></div>';
}
function reportsPage(){
 let classes=reportsClassList();
 if(!classes.length)return '<div class="top"><div><h1>Ведомости</h1></div></div><div class="card empty">Классов пока нет.</div>';
 let selected=reportsSelectedClasses();
 let n=selected.length;
 return '<div class="top"><div><h1>Ведомости</h1><div class="muted">Сводная печать оценок, посещаемости и планов уроков сразу по нескольким классам и кружкам.</div></div></div>'+
  '<div class="card"><h2>1. Выберите классы и кружки</h2><div class="toolbar" style="margin-bottom:10px"><button onclick="selectAllReportClasses()">Выбрать все</button><button onclick="clearReportClasses()">Снять выбор</button></div>'+
  '<div class="muted small" style="margin-bottom:8px">Нажмите на класс или кружок, чтобы отметить его. Кнопка с цифрой слева выбирает всю параллель сразу, «Кр.» — все кружки.</div>'+reportClassPicker(classes)+
  '<label class="attrow" style="cursor:pointer;margin-top:12px"><span>🏠 Включать учеников на домашнем/семейном обучении в печать</span><input type="checkbox" '+(S.reportsIncludeHomeschool?'checked':'')+' onchange="S.reportsIncludeHomeschool=this.checked" style="width:auto"></label>'+
  '</div>'+
  '<div class="card"><h2>Общая ведомость (оценки + посещаемость)</h2><p class="muted small">Один файл на все выбранные классы и кружки: по каждому — своя таблица с уроками за выбранный период, ученики внутри — по алфавиту, классы — по возрастанию (5 → 11). Замечания о поведении печатаются отдельным списком под таблицей каждого класса.</p>'+
  reportsFullPeriodControlsHtml()+
  '<div class="toolbar"><button class="primary" '+(n?'':'disabled')+' onclick="openPrintFullReport()">🖨 Напечатать общую ведомость'+(n?' ('+n+')':'')+'</button></div></div>'+
  '<div class="card"><h2>План уроков на четверть</h2><p class="muted small">Один файл на все выбранные классы и кружки: для каждого — своя таблица с датами, темами и домашними заданиями за выбранный период. Список колонок можно настроить ниже.</p>'+reportsPlanControlsHtml()+
  '<div class="toolbar" style="margin-top:10px"><button class="primary" '+(n?'':'disabled')+' onclick="openPrintQuarterPlanReport()">🖨 Напечатать план на четверть'+(n?' ('+n+')':'')+'</button></div></div>'+
  '<div class="card"><h2>Ведомость по одному уроку во всех классах</h2><p class="muted small">Например, входная контрольная прошла во всех классах, но в разные дни — укажите дату для каждого класса, и получите одну сводную ведомость с оценками, посещаемостью и замечаниями о поведении.</p>'+
  (n?'<div class="rp-dates">'+selected.map(c=>'<div class="rp-date"><b>'+e(c.name)+'</b><input type="date" value="'+e(S.reportsLessonDates[c.id]||'')+'" onchange="setReportLessonDate(\''+c.id+'\',this.value)"></div>').join('')+'</div>':'<div class="muted small">Сначала выберите классы выше.</div>')+
  '<div class="toolbar" style="margin-top:10px"><button class="primary" '+(n?'':'disabled')+' onclick="openPrintLessonReport()">🖨 Напечатать ведомость по дате</button></div></div>'+
  '<div class="card"><h2>Ведомость по комментарию</h2><p class="muted small">Ищет по фрагменту текста, регистр не важен: можно ввести часть слова, несколько слов (найдутся комментарии, где есть все они) или число баллов. Ниже сразу видно, что найдётся.</p>'+
  '<label>Комментарий (или его часть)</label>'+commentInputHtml('report-comment',S.reportsComment||'',' style="max-width:320px" oninput="S.reportsComment=this.value;updateCommentReportPreview()"')+
  '<div id="report-comment-preview" style="margin-top:10px">'+commentReportPreviewHtml()+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><button class="primary" '+(n?'':'disabled')+' onclick="openPrintCommentReport()">🖨 Напечатать ведомость по комментарию</button></div></div>';
}
function openPrintFullReport(){
 let classes=reportsDedupe(reportsSelectedClasses());
 if(!classes.length){alert('Выберите хотя бы один класс или кружок.');return}
 let includeHS=S.reportsIncludeHomeschool!==false;
 let info=reportsFullPeriodInfo();
 let body='<h1>Общая ведомость оценок и посещаемости</h1><p class="muted">Период: '+e(reportsFullRangeLabel(info))+'</p>';
 classes.forEach(c=>{
  let ps=sortStudentsList(peopleGroup(c.id),S.studentSort).filter(s=>includeHS||!s.homeschool);
  let ls=groupLessons(c.id).filter(l=>!l.cancelled&&(!info.from||l.date>=info.from)&&(!info.to||l.date<=info.to)).sort((a,b)=>a.date.localeCompare(b.date));
  let multi=ls.some(l=>l.classId!==c.id);
  body+='<h3>'+e(c.name)+(c.type==='club'?' (кружок)':'')+(c.subject?' · '+e(c.subject):'')+'</h3>';
  if(!ls.length){body+='<p class="muted">Занятий пока нет.</p>';return}
  body+='<table><tr><th>Ученик</th>'+ls.map(l=>'<th>'+fmtDateShort(l.date)+(multi&&C(l.classId)?'<br><span class="muted" style="font-weight:400">'+e(C(l.classId).name)+'</span>':'')+'</th>').join('')+'</tr>'+
   ps.map(s=>'<tr><td>'+studentFio(s)+'</td>'+ls.map(l=>{let g=(l.grades||{})[s.id];let a=(l.attendance||{})[s.id];return '<td>'+(g?e(gradeText(g)):(a==='н'?'Н':''))+'</td>'}).join('')+'</tr>').join('')+
   '</table>'+printBehaviorSection(ps,ls);
 });
 openPrintWindow(printDocTitle(classes.map(c=>c.subject),'Общая ведомость'),body);
}
/* ---- План уроков на четверть через страницу «Ведомости» ---- */
function reportsPlanResolvePeriod(){
 let quarters=D.settings.quarters||[],today=toISO(new Date());
 let per=S.reportsPlanPeriod;
 if(!per||(per!=='custom'&&!quarters.find(q=>q.id===per)))per=(quarters.find(q=>q.startDate<=today&&today<=q.endDate)||quarters[0]||{id:'custom'}).id;
 S.reportsPlanPeriod=per;
 return per;
}
function setReportsPlanPeriod(v){S.reportsPlanPeriod=v;render()}
function setReportsPlanOpt(k,v){S.reportsPlanOpts[k]=v}
function reportsPlanControlsHtml(){
 let quarters=D.settings.quarters||[],today=toISO(new Date());
 let per=reportsPlanResolvePeriod(),o=S.reportsPlanOpts;
 let chk=(k,label)=>'<label class="attrow" style="cursor:pointer"><span>'+label+'</span><input type="checkbox" '+(o[k]?'checked':'')+' onchange="setReportsPlanOpt(\''+k+'\',this.checked)" style="width:auto"></label>';
 return (quarters.length?
   '<label>Период</label><select onchange="setReportsPlanPeriod(this.value)">'+quarters.map(q=>'<option value="'+q.id+'"'+(per===q.id?' selected':'')+'>'+e(q.name)+' ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+')</option>').join('')+'<option value="custom"'+(per==='custom'?' selected':'')+'>Свой период…</option></select>'
   :'<div class="notice">Четверти пока не настроены (Настройки → Расписание/блокировки → «Четверти учебного года») — укажите даты вручную.</div>')+
  (per==='custom'?'<div class="rp-dates" style="margin-top:8px"><div class="rp-date"><b>С какой даты</b><input type="date" value="'+e(S.reportsPlanFrom||today)+'" onchange="S.reportsPlanFrom=this.value"></div><div class="rp-date"><b>По какую дату</b><input type="date" value="'+e(S.reportsPlanTo||today)+'" onchange="S.reportsPlanTo=this.value"></div></div>':'')+
  '<div class="notice" style="margin-top:12px">Что включить в таблицу:</div>'+
  chk('num','№ урока по расписанию')+chk('topic','Тема урока')+chk('hw','Домашнее задание')+chk('plan','План урока')+chk('extra','Остальные заполненные поля урока')+chk('cancelled','Включать отменённые уроки');
}
function quarterPlanTableHtml(c,from,to,opts){
 let ls=groupLessons(c.id).filter(l=>l.date>=from&&l.date<=to&&(opts.cancelled||!l.cancelled)).sort((a,b)=>a.date.localeCompare(b.date)||(a.lessonNumber||0)-(b.lessonNumber||0));
 if(!ls.length)return '<p class="muted">Уроков за выбранный период нет.</p>';
 let multi=ls.some(l=>l.classId!==c.id);
 let extraFields=opts.extra?D.settings.fields.lesson.filter(f=>f.visible&&!LESSON_KNOWN_KEYS.includes(f.key)&&!['ktpNumber','ktpDate','planText','homework'].includes(f.key)):[];
 let colLabels=['Дата'];
 if(multi)colLabels.push('Группа');
 if(opts.num)colLabels.push('№ урока');
 if(opts.topic)colLabels.push('Тема');
 if(opts.hw)colLabels.push('Домашнее задание');
 if(opts.plan)colLabels.push('План урока');
 extraFields.forEach(f=>colLabels.push(f.label));
 return '<table><tr>'+colLabels.map(cl=>'<th>'+e(cl)+'</th>').join('')+'</tr>'+
  ls.map(l=>{
   let cells=[fmtDate(l.date)+(l.cancelled?' <span class="muted">(отменён)</span>':'')];
   if(multi)cells.push(e(C(l.classId)?C(l.classId).name:'—'));
   if(opts.num)cells.push(l.lessonNumber||'—');
   if(opts.topic)cells.push(e(l.topic||'—'));
   if(opts.hw)cells.push(richTextView(lessonField(l,'homework'))||'—');
   if(opts.plan)cells.push(richTextView(lessonField(l,'planText'))||'—');
   extraFields.forEach(f=>{let v=lessonField(l,f.key);cells.push(v?richTextView(v):'—')});
   return '<tr>'+cells.map(v=>'<td>'+v+'</td>').join('')+'</tr>';
  }).join('')+'</table>';
}
function openPrintQuarterPlanReport(){
 let classes=reportsDedupe(reportsSelectedClasses());
 if(!classes.length){alert('Выберите хотя бы один класс или кружок.');return}
 let quarters=D.settings.quarters||[];
 let per=reportsPlanResolvePeriod(),from,to,periodLabel;
 if(per!=='custom'){
  let q=quarters.find(x=>x.id===per);
  from=q.startDate;to=q.endDate;periodLabel=q.name+' ('+fmtDate(q.startDate)+' – '+fmtDate(q.endDate)+')';
 }else{
  from=S.reportsPlanFrom||toISO(new Date());to=S.reportsPlanTo||toISO(new Date());
  if(from>to){alert('Дата «с» позже даты «по». Исправьте период.');return}
  periodLabel=fmtDate(from)+' – '+fmtDate(to);
 }
 let body='<h1>План уроков</h1><p class="muted">'+e(periodLabel)+'</p>';
 classes.forEach(c=>{
  body+='<h3>'+e(c.name)+(c.type==='club'?' (кружок)':'')+(c.subject?' · '+e(c.subject):'')+'</h3>'+quarterPlanTableHtml(c,from,to,S.reportsPlanOpts);
 });
 openPrintWindow(printDocTitle(classes.map(c=>c.subject),'План уроков'),body);
}
function openPrintLessonReport(){
 let classes=reportsSelectedClasses();
 if(!classes.length){alert('Выберите хотя бы один класс.');return}
 let includeHS=S.reportsIncludeHomeschool!==false;
 let body='<h1>Сводная ведомость по уроку</h1>';
 classes.forEach(c=>{
  let date=S.reportsLessonDates[c.id];
  body+='<h3>'+e(c.name)+(c.subject?' · '+e(c.subject):'')+(date?' · '+fmtDate(date):'')+'</h3>';
  if(!date){body+='<p class="muted">Дата не указана.</p>';return}
  let l=activeLessons().find(x=>x.classId===c.id&&x.date===date&&!x.cancelled);
  if(!l){body+='<p class="muted">Урок на эту дату не найден.</p>';return}
  let ps=sortStudentsList(people(c.id),S.studentSort).filter(s=>includeHS||!s.homeschool);
  let grades=l.grades||{},att=l.attendance||{};
  let bnotes=l.behaviorNotes||{};
  let hasBn=ps.some(s=>(bnotes[s.id]||'').trim());
  body+='<table><tr><th>Ученик</th><th>Оценка</th><th>Посещение</th>'+(hasBn?'<th>Замечание о поведении</th>':'')+'</tr>'+
   ps.map(s=>{let g=grades[s.id],a=att[s.id];return '<tr><td>'+studentFio(s)+'</td><td>'+(g?e(gradeText(g)):'')+'</td><td>'+(a?(a==='н'?'Н':'П'):'')+'</td>'+(hasBn?'<td>'+e(bnotes[s.id]||'')+'</td>':'')+'</tr>'}).join('')+
   '</table>';
 });
 openPrintWindow(printDocTitle(classes.map(c=>c.subject),'Ведомость по уроку'),body);
}
function openPrintCommentReport(){
 let classes=reportsSelectedClasses();
 if(!classes.length){alert('Выберите хотя бы один класс.');return}
 let input=document.getElementById('report-comment');
 let commentText=input?input.value.trim():(S.reportsComment||'').trim();
 if(!commentText){alert('Введите комментарий или его часть.');return}
 let body='<h1>Ведомость по комментарию — «'+e(commentText)+'»</h1>';
 let groups=collectCommentRows(classes,commentText);
 groups.forEach(g=>{
  let hasBn=g.rows.some(r=>r.bn);
  body+='<h3>'+e(g.c.name)+(g.c.subject?' · '+e(g.c.subject):'')+'</h3><table><tr><th>Ученик</th><th>Дата</th><th>Оценка</th><th>Комментарий</th>'+(hasBn?'<th>Замечание о поведении</th>':'')+'</tr>'+
   g.rows.map(r=>'<tr><td>'+studentFio(r.s)+'</td><td>'+fmtDate(r.l.date)+'</td><td>'+e(gradeText(r.g))+'</td><td>'+e(r.g.comment||'')+'</td>'+(hasBn?'<td>'+e(r.bn)+'</td>':'')+'</tr>').join('')+
   '</table>';
 });
 if(!groups.length)body+='<p class="muted">Учеников с таким комментарием не найдено.</p>';
 openPrintWindow(printDocTitle(classes.map(c=>c.subject),'Ведомость по комментарию'),body);
}
function openPrintClassGrades(classId){
 let c=C(classId),includeHS=S.classPrintIncludeHomeschool!==false,ps=sortStudentsList(peopleGroup(classId),S.studentSort).filter(s=>includeHS||!s.homeschool);
 let ls=groupLessons(classId).filter(l=>!l.cancelled).sort((a,b)=>a.date.localeCompare(b.date));
 let multi=ls.some(l=>l.classId!==classId);
 let body='<h1>Ведомость оценок — '+e(c.name)+'</h1>'+
  (ls.length?'<table><tr><th>Ученик</th>'+ls.map(l=>'<th>'+fmtDateShort(l.date)+(multi&&C(l.classId)?'<br><span class="muted" style="font-weight:400">'+e(C(l.classId).name)+'</span>':'')+'</th>').join('')+'</tr>'+
   ps.map(s=>'<tr><td>'+studentFio(s)+'</td>'+ls.map(l=>{let g=(l.grades||{})[s.id];let a=(l.attendance||{})[s.id];return '<td>'+(g?e(gradeText(g)):(a==='н'?'Н':''))+'</td>'}).join('')+'</tr>').join('')+'</table>'+printBehaviorSection(ps,ls):'<p class="muted">Уроков пока нет.</p>');
 openPrintWindow(printDocTitle([c.subject],'Ведомость — '+c.name),body);
}
function copyLessonResultsText(id){
 let l=L(id),cls=C(l.classId),ps=people(l.classId);
 let grades=l.grades||{};
 let lines=[];
 lines.push('Урок: '+(l.topic||'(без темы)')+' — '+(cls?cls.name:'—')+', '+fmtDate(l.date));
 if(lessonField(l,'planText'))lines.push('Задания/план: '+lessonField(l,'planText'));
 D.settings.fields.lesson.filter(f=>f.visible&&!LESSON_KNOWN_KEYS.includes(f.key)).forEach(f=>{let v=lessonField(l,f.key);if(v)lines.push(f.label+': '+v)});
 lines.push('');lines.push('Результаты:');
 let any=false;
 ps.forEach(s=>{let g=grades[s.id];if(g){any=true;lines.push('- '+studentFioPlain(s)+': '+gradeText(g)+(g.comment?' — '+g.comment:''))}});
 if(!any)lines.push('(оценок пока нет)');
 copyTextToClipboard(lines.join('\n'));
}
function copyTextToClipboard(text){
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(text).then(()=>alert('Скопировано в буфер обмена.')).catch(()=>fallbackCopy(text));
 }else fallbackCopy(text);
}
function fallbackCopy(text){
 let ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
 try{document.execCommand('copy')}catch(err){}
 document.body.removeChild(ta);alert('Скопировано в буфер обмена.');
}
function settingsPage(){
 let tab=S.settingsTab||'fields';
 return '<div class="top"><div><h1>Настройки</h1><div class="muted small">Версия 5.0</div></div></div>'+
  '<div class="tabs">'+[['fields','Поля'],['appearance','Внешний вид'],['schedule','Расписание / блокировки']].map(x=>'<button class="'+(tab===x[0]?'active':'')+'" onclick="S.settingsTab=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  (tab==='fields'?settingsFieldsTab():tab==='appearance'?settingsAppearanceTab():settingsScheduleTab());
}
function settingsFieldsTab(){
 let sub=S.fieldsSub||'student';
 return '<div class="tabs">'+[['student','Поля учеников'],['class','Поля классов'],['lesson','Поля уроков'],['colleague','Поля коллег']].map(x=>'<button class="'+(sub===x[0]?'active':'')+'" onclick="S.fieldsSub=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  '<div class="card">'+fieldsEditor(sub)+'</div>';
}
function fieldsEditor(entity){
 let fields=D.settings.fields[entity];
 return '<div>'+fields.map((f,i)=>'<div class="fieldrow">'+
  '<span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveField(\''+entity+'\','+i+',-1)">↑</button><button '+(i===fields.length-1?'disabled':'')+' onclick="moveField(\''+entity+'\','+i+',1)">↓</button></span>'+
  '<span class="fname">'+e(f.label)+' <small>('+fieldTypeLabel(f.type)+(f.system?', системное':'')+')</small></span>'+
  '<label style="display:flex;align-items:center;gap:5px;margin:0;flex:0"><input type="checkbox" style="width:auto" '+(f.visible?'checked':'')+' onchange="toggleFieldVisible(\''+entity+'\',\''+f.key+'\')"> видимо</label>'+
  '<button onclick="renameField(\''+entity+'\',\''+f.key+'\')">Переименовать</button>'+
  (f.system?'':'<button class="danger" onclick="deleteField(\''+entity+'\',\''+f.key+'\')">Удалить</button>')+
  '</div>').join('')+
  '</div><div class="toolbar" style="margin-top:14px"><button class="primary" onclick="openAddField(\''+entity+'\')">＋ Добавить поле</button></div>';
}
function fieldTypeLabel(t){return {text:'короткий текст',longtext:'длинный текст',number:'число',date:'дата',boolean:'да/нет',select:'выбор из списка',colleagueLink:'коллега (ссылка)'}[t]||t}
function moveField(entity,i,dir){
 let arr=D.settings.fields[entity];let j=i+dir;if(j<0||j>=arr.length)return;
 [arr[i],arr[j]]=[arr[j],arr[i]];save();render();
}
function toggleFieldVisible(entity,key){
 let f=fieldByKey(entity,key);f.visible=!f.visible;save();render();
}
function renameField(entity,key){
 let f=fieldByKey(entity,key);
 let nv=prompt('Новое название поля:',f.label);
 if(nv&&nv.trim()){f.label=nv.trim();save();render()}
}
function deleteField(entity,key){
 if(!confirm('Удалить пользовательское поле? Введённые данные в этом поле будут скрыты.'))return;
 D.settings.fields[entity]=D.settings.fields[entity].filter(f=>f.key!==key);save();render();
}
function openAddField(entity){
 setModalHtml('Новое поле',
  '<label>Название</label><input id="nf-label">'+
  '<label>Тип</label><select id="nf-type"><option value="text">Короткий текст</option><option value="longtext">Длинный текст</option><option value="number">Число</option><option value="date">Дата</option><option value="boolean">Да/нет</option><option value="select">Выбор из списка</option><option value="colleagueLink">Коллега (ссылка на карточку)</option></select>'+
  '<div id="nf-opts-wrap" style="display:none"><label>Варианты (через запятую)</label><input id="nf-opts"></div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewField(\''+entity+'\')">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
 document.getElementById('nf-type').onchange=e2=>{document.getElementById('nf-opts-wrap').style.display=e2.target.value==='select'?'block':'none'};
}
function saveNewField(entity){
 let label=document.getElementById('nf-label').value.trim();
 if(!label){alert('Укажите название поля.');return}
 let type=document.getElementById('nf-type').value;
 let options=type==='select'?document.getElementById('nf-opts').value.split(',').map(x=>x.trim()).filter(Boolean):undefined;
 D.settings.fields[entity].push({key:'custom_'+uid(),label,type,system:false,visible:true,options});
 save();closeModal();render();
}
function settingsAppearanceTab(){
 return sCard('Профиль','<label>Ваше ФИО (используется в заголовках печатных отчётов)</label><input id="teacher-name" value="'+e(D.settings.teacherName||'')+'" placeholder="Иванова Мария Петровна" onchange="setTeacherName(this.value)">')+
  sCard('Параллели в библиотеке уроков и материалах','<p class="muted small">Список папок-параллелей для группировки и фильтра в разделах «Библиотека уроков» и «Материалы». Уберите лишние или добавьте свои — например «10А спецкласс».</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.libraryGradeLevels||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveGradeLevel('+i+',-1)">↑</button><button '+(i===(D.settings.libraryGradeLevels.length-1)?'disabled':'')+' onclick="moveGradeLevel('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeGradeLevel('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-grade-level" placeholder="например, 10" style="max-width:200px"><button onclick="addGradeLevel()">＋ Добавить параллель</button></div>')+
  sCard('Шкала оценок','<p class="muted small">Значения, которые предлагаются при выставлении оценки, и категории в диаграмме «Распределение оценок». Порядок — как в списке ниже.</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.gradeScale||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveGradeScale('+i+',-1)">↑</button><button '+(i===(D.settings.gradeScale.length-1)?'disabled':'')+' onclick="moveGradeScale('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeGradeScale('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-grade-scale" placeholder="например, 3/4 или зачёт" style="max-width:200px"><button onclick="addGradeScale()">＋ Добавить значение</button></div>')+
  sCard('Шаблоны комментариев к оценкам','<p class="muted small">Варианты, которые подсказываются при вводе комментария к оценке. Можно всегда напечатать и свой текст — эти варианты лишь ускоряют ввод повторяющихся формулировок.</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.gradeCommentTemplates||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveCommentTemplate('+i+',-1)">↑</button><button '+(i===(D.settings.gradeCommentTemplates.length-1)?'disabled':'')+' onclick="moveCommentTemplate('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeCommentTemplate('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-comment-template" placeholder="например, Не сдал(а) работу" style="max-width:260px"><button onclick="addCommentTemplate()">＋ Добавить вариант</button></div>')+
  sCard('Накопительная система баллов','<label>Порог обмена баллов на оценку</label><input type="number" min="1" value="'+(D.settings.pointsThreshold||5)+'" style="max-width:120px" onchange="setPointsThreshold(this.value)"><p class="muted small">Используется в режиме «Начать урок» — баллы можно ставить за короткие ответы, а по достижении порога обменять на полноценную оценку.</p>')+
  sCard('Тема','<p class="muted small">Интерфейс использует две темы — тёмную и светлую. Переключить их можно также кнопкой ☀ в шапке бокового меню.</p><div class="toolbar">'+
   '<button data-color-mode="light" class="'+(D.settings.colorMode!=='dark'?'primary':'')+'" onclick="setColorMode(\'light\')">☀ Светлая</button>'+
   '<button data-color-mode="dark" class="'+(D.settings.colorMode==='dark'?'primary':'')+'" onclick="setColorMode(\'dark\')">🌙 Тёмная</button>'+
   '</div>')+
  sCard('Плотность интерфейса','<div class="toolbar">'+
   '<button class="'+(D.settings.compact?'':'primary')+'" onclick="setCompact(false)">Обычная</button>'+
   '<button class="'+(D.settings.compact?'primary':'')+'" onclick="setCompact(true)">Компактная</button>'+
   '</div>')+
  sCard('Шрифт интерфейса','<div class="toolbar">'+
   Object.keys(FONT_LABELS).map(k=>'<button class="'+((D.settings.fontFamily||'system')===k?'primary':'')+'" style="font-family:'+FONT_FAMILIES[k]+'" onclick="setFont(\''+k+'\')">'+FONT_LABELS[k]+'</button>').join('')+
   '</div>')+
  sCard('Скругление углов','<div class="toolbar">'+
   [['0','Острые'],['0.6','Слегка'],['1','Обычные'],['1.6','Скруглённые'],['2.2','Максимум']].map(o=>'<button class="'+((String(D.settings.radius===undefined?1:D.settings.radius))===o[0]?'primary':'')+'" onclick="setRadius('+o[0]+')">'+o[1]+'</button>').join('')+
   '</div>')+
  sCard('Стиль боковой панели','<div class="toolbar">'+
   '<button class="'+(D.settings.sidebarStyle!=='gradient'?'primary':'')+'" onclick="setSidebarStyle(\'solid\')">Сплошная</button>'+
   '<button class="'+(D.settings.sidebarStyle==='gradient'?'primary':'')+'" onclick="setSidebarStyle(\'gradient\')">Градиент (в акцентный цвет)</button>'+
   '</div>')+
  sCard('🐾 Ассистент','<p class="muted small">Помощник, как в старых версиях Windows — время от времени подскажет полезную мелочь или скажет пару тёплых слов. Можно перетаскивать по экрану, кликнуть — новый совет.</p>'+
   '<label class="attrow" style="cursor:pointer"><span>Показывать ассистента</span><input type="checkbox" '+(assistantSettings().enabled?'checked':'')+' style="width:auto" onchange="setAssistantEnabled(this.checked)"></label>'+
   '<label class="attrow" style="cursor:pointer"><span>Поддерживающие и мотивационные сообщения</span><input type="checkbox" '+(assistantSettings().motivation!==false?'checked':'')+' style="width:auto" onchange="setAssistantMotivation(this.checked)"></label>'+
   '<div style="margin-top:10px"><label>Персонаж</label><div class="toolbar">'+
   Object.keys(ASSISTANT_CHARACTERS).map(k=>'<button class="'+(assistantSettings().character===k?'primary':'')+'" onclick="setAssistantChar(\''+k+'\')">'+ASSISTANT_CHARACTERS[k].emoji+' '+ASSISTANT_CHARACTERS[k].name+'</button>').join('')+
   '</div></div>'+
   '<div style="margin-top:10px"><label>Как часто напоминать о себе</label><div class="toolbar">'+
   [[10,'10 мин'],[20,'20 мин'],[40,'40 мин'],[60,'1 час']].map(o=>'<button class="'+(assistantSettings().freq===o[0]?'primary':'')+'" onclick="setAssistantFreq('+o[0]+')">'+o[1]+'</button>').join('')+
   '</div></div>'+
   '<p class="muted small" style="margin-top:10px">Кнопка «🫥 Спрятать частично» у ассистента оставляет его выглядывающим с края экрана — нажмите на него снова, чтобы вернуть полностью. Чтобы выключить совсем — снимите галочку выше или нажмите «Отключить» в его подсказке.</p>'+
   '<div class="toolbar" style="margin-top:12px;flex-wrap:wrap"><button class="primary" onclick="assistantSpeak()">Спросить совет прямо сейчас</button><button onclick="assistantMotivate()">💛 Попросить поддержку</button><button onclick="assistantPeek()">🫥 Спрятать частично</button></div>');
}
function setAssistantEnabled(v){assistantSettings().enabled=v;if(v)assistantSettings().peeked=false;save();initAssistant()}
function setAssistantMotivation(v){assistantSettings().motivation=v;save()}
function setAssistantChar(k){assistantSettings().character=k;save();initAssistant();render()}
function setAssistantFreq(n){assistantSettings().freq=n;save();initAssistant();render()}
function addGradeScale(){
 let el=document.getElementById('new-grade-scale');
 let v=el.value.trim();
 if(!v)return;
 D.settings.gradeScale=D.settings.gradeScale||[];
 if(!D.settings.gradeScale.includes(v))D.settings.gradeScale.push(v);
 save();render();
}
function removeGradeScale(i){D.settings.gradeScale.splice(i,1);save();render()}
function moveGradeScale(i,dir){let arr=D.settings.gradeScale;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function addCommentTemplate(){
 let el=document.getElementById('new-comment-template');
 let v=el.value.trim();
 if(!v)return;
 D.settings.gradeCommentTemplates=D.settings.gradeCommentTemplates||[];
 if(!D.settings.gradeCommentTemplates.includes(v))D.settings.gradeCommentTemplates.push(v);
 save();render();
}
function removeCommentTemplate(i){D.settings.gradeCommentTemplates.splice(i,1);save();render()}
function moveCommentTemplate(i,dir){let arr=D.settings.gradeCommentTemplates;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function addGradeLevel(){
 let el=document.getElementById('new-grade-level');
 let v=el.value.trim();
 if(!v)return;
 D.settings.libraryGradeLevels=D.settings.libraryGradeLevels||[];
 if(!D.settings.libraryGradeLevels.includes(v))D.settings.libraryGradeLevels.push(v);
 save();render();
}
function removeGradeLevel(i){D.settings.libraryGradeLevels.splice(i,1);save();render()}
function moveGradeLevel(i,dir){let arr=D.settings.libraryGradeLevels;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function setColorMode(m){
 if(D.settings.colorMode===m)return;
 D.settings.colorMode=m;save();
 let root=document.documentElement;
 root.classList.add('theme-anim');
 clearTimeout(window._themeAnimTimer);
 applyTheme();
 document.querySelectorAll('[data-color-mode]').forEach(b=>b.classList.toggle('primary',b.dataset.colorMode===m));
 window._themeAnimTimer=setTimeout(()=>root.classList.remove('theme-anim'),500);
}
function setTeacherName(v){D.settings.teacherName=v.trim();save()}
function setPointsThreshold(v){D.settings.pointsThreshold=Math.max(1,+v||5);save()}
function setCompact(v){D.settings.compact=v;save();render()}
function settingsScheduleTab(){
 return sCard('Дни недели в расписании',
  '<label class="attrow" style="cursor:pointer"><span>Показывать субботу как учебный день</span><input type="checkbox" '+(D.settings.showSaturday?'checked':'')+' style="width:auto" onchange="toggleShowSaturday(this.checked)"></label>'+
  '<p class="muted small">Если выключить — суббота уберётся из недельного расписания, свободной таблицы «Расписание класса» и списка дней для авторасстановки.</p>')+
  sCard('Четверти учебного года',
  '<p class="muted small">Задайте границы четвертей один раз — тогда в статистике и на графиках оценок можно будет точно фильтровать «по четверти» вместо приблизительного периода.</p>'+
  '<div class="toolbar" style="margin-bottom:10px"><button class="primary" onclick="openAddQuarter()">＋ Добавить четверть</button></div>'+
  (D.settings.quarters.length?'<table class="table"><tr><th>Название</th><th>С</th><th>По</th><th></th></tr>'+
   D.settings.quarters.map(q=>'<tr><td>'+e(q.name)+'</td><td>'+fmtDate(q.startDate)+'</td><td>'+fmtDate(q.endDate)+'</td><td><button onclick="openEditQuarter(\''+q.id+'\')">Изменить</button> <button class="danger" onclick="deleteQuarter(\''+q.id+'\')">Удалить</button></td></tr>').join('')+'</table>':'<div class="empty">Четверти пока не заданы.</div>'))+
  sCard('Блокировки расписания (каникулы, выходные)',
  '<div class="toolbar" style="margin-bottom:10px"><button class="primary" onclick="openAddBlock()">＋ Добавить блокировку</button></div>'+
  (D.scheduleBlocks.length?'<table class="table"><tr><th>Причина</th><th>С</th><th>По</th><th>Уроки</th><th></th></tr>'+
   D.scheduleBlocks.map(b=>'<tr><td>'+e(b.reason)+'</td><td>'+fmtDate(b.startDate)+'</td><td>'+fmtDate(b.endDate)+'</td><td>'+(b.lessonNumbers&&b.lessonNumbers.length?b.lessonNumbers.join(', '):'весь день')+'</td><td><button class="danger" onclick="deleteBlock(\''+b.id+'\')">Удалить</button></td></tr>').join('')+'</table>':'<div class="empty">Блокировок пока нет.</div>'));
}
function toggleShowSaturday(val){D.settings.showSaturday=val;save();render()}
function openAddQuarter(){
 setModalHtml('Новая четверть',
  '<label>Название</label><input id="q-name" placeholder="1 четверть">'+
  '<label>С</label><input id="q-start" type="date">'+
  '<label>По</label><input id="q-end" type="date">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewQuarter()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveNewQuarter(){
 let name=document.getElementById('q-name').value.trim(),start=document.getElementById('q-start').value,end=document.getElementById('q-end').value;
 if(!name||!start||!end){alert('Заполните название и обе даты.');return}
 D.settings.quarters.push({id:uid(),name,startDate:start,endDate:end});
 save();closeModal();render();
}
function openEditQuarter(id){
 let q=D.settings.quarters.find(x=>x.id===id);
 setModalHtml('Четверть',
  '<label>Название</label><input id="q-name" value="'+e(q.name)+'">'+
  '<label>С</label><input id="q-start" type="date" value="'+e(q.startDate)+'">'+
  '<label>По</label><input id="q-end" type="date" value="'+e(q.endDate)+'">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditQuarter(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteQuarter(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveEditQuarter(id){
 let q=D.settings.quarters.find(x=>x.id===id);
 q.name=document.getElementById('q-name').value.trim();q.startDate=document.getElementById('q-start').value;q.endDate=document.getElementById('q-end').value;
 save();closeModal();render();
}
function deleteQuarter(id){if(!confirm('Удалить четверть?'))return;D.settings.quarters=D.settings.quarters.filter(x=>x.id!==id);save();closeModal();render()}
function openAddBlock(){
 setModalHtml('Новая блокировка расписания',
  '<label>Название/причина</label><input id="b-reason" placeholder="Каникулы">'+
  '<label>С</label><input id="b-start" type="date">'+
  '<label>По</label><input id="b-end" type="date">'+
  '<label>Номера уроков (через запятую, пусто = весь день)</label><input id="b-nums" placeholder="1,2,3">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveBlock()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveBlock(){
 let reason=document.getElementById('b-reason').value.trim(),start=document.getElementById('b-start').value,end=document.getElementById('b-end').value||start;
 if(!reason||!start){alert('Укажите название и дату.');return}
 let numsRaw=document.getElementById('b-nums').value.trim();
 let nums=numsRaw?numsRaw.split(',').map(x=>+x.trim()).filter(Boolean):[];
 D.scheduleBlocks.push({id:uid(),reason,startDate:start,endDate:end,lessonNumbers:nums});
 save();closeModal();render();
}
function deleteBlock(id){if(!confirm('Удалить блокировку?'))return;D.scheduleBlocks=D.scheduleBlocks.filter(b=>b.id!==id);save();render()}
function backupPage(){
 return '<div class="top"><div><h1>Резервная копия</h1><div class="muted">Полный экспорт и импорт всех данных, включая файлы материалов</div></div></div>'+
  '<div class="card"><h2>Экспорт</h2><p class="muted">Создаёт файл со всеми классами, учениками (включая архив), уроками, оценками, посещаемостью, пользовательскими полями, настройками, расписанием/блокировками, шаблонами и библиотекой материалов.</p>'+
   '<p class="small muted">'+(D.settings.lastBackupAt?'Последняя копия: '+fmtDate(D.settings.lastBackupAt):'Резервная копия ещё не создавалась.')+'</p>'+
   '<button class="primary" onclick="doBackup()">⇩ Скачать резервную копию</button></div>'+
  '<div class="card"><h2>Импорт</h2><div class="notice">Импорт полностью заменит текущие данные приложения.</div><button onclick="document.getElementById(\'restore-input\').click()">⇧ Восстановить из файла</button><input id="restore-input" type="file" accept=".json" hidden onchange="doRestore(this)"></div>'+
  demoSettingsCardHtml()+
  '<div class="card danger-zone"><h2>Удаление данных</h2><p class="muted">Полностью удаляет все записи дневника: классы, учеников, уроки, оценки, посещаемость, материалы, задачи, совещания, объявления, настройки и загруженные файлы. Действие необратимо — при необходимости сначала скачайте резервную копию.</p>'+
  '<div class="toolbar"><button class="danger" onclick="deleteAllData()">Удалить все данные</button></div></div>';
}
async function deleteAllData(){
 if(!confirm('Удалить ВСЕ данные дневника? Классы, ученики, уроки, оценки, материалы, настройки и файлы будут удалены безвозвратно.'))return;
 let typed=prompt('Это действие нельзя отменить. Введите слово УДАЛИТЬ, чтобы продолжить:');
 if((typed||'').trim().toUpperCase()!=='УДАЛИТЬ')return;
 try{
  await fileStoreClear();
 }catch(err){console.error(err)}
 [LS_KEY,LS_KEY_V2,LS_KEY_V2+'_files'].forEach(k=>{try{localStorage.removeItem(k)}catch(err){}});
 skipDemoSeed=true;
 D=null;
 loadData();
 skipDemoSeed=false;
 S.view='home';S.classId=null;S.studentId=null;S.lessonModal=null;S.tab='lessons';
 S.selectedStudentIds=new Set();S.reportsSelClasses=new Set();
 save();
 render();
 alert('Все данные дневника удалены.');
}
async function doBackup(){
 let files=await fileStoreAll();
 let filesEncoded=[];
 for(let f of files){filesEncoded.push({id:f.id,data:await blobToBase64(f.blob)})}
 D.settings.lastBackupAt=toISO(new Date());
 D.settings.backupReminder={lastShown:toISO(new Date())};
 save();
 let payload={exportedAt:new Date().toISOString(),app:'teacher-diary',version:3,D,files:filesEncoded};
 let blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
 let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Дневник-учителя-backup-'+D.settings.lastBackupAt+'.json';a.click();URL.revokeObjectURL(url);
 render();
}
function doRestore(input){
 let f=input.files[0];if(!f)return;
 if(!confirm('Импорт заменит все текущие данные приложения. Продолжить?'))return;
 let r=new FileReader();
 r.onload=async()=>{
  try{
   let payload=JSON.parse(r.result);
   D=payload.D;
   if(!D.materials)D.materials=[];
   if(!D.scheduleBlocks)D.scheduleBlocks=[];
   if(!D.lessonTemplates)D.lessonTemplates=[];
   if(!D.announcements)D.announcements=[];
   if(!D.todos)D.todos=[];
   if(!D.meetings)D.meetings=[];
   if(!D.workTasks)D.workTasks=[];
   if(D.todos.length){
    D.todos.forEach(t=>D.workTasks.push({id:t.id||uid(),title:t.text,dueDate:'',priority:'med',status:t.done?'done':'todo',notes:''}));
    D.todos=[];
   }
   if(!D.colleagues)D.colleagues=[];
   if(!D.settings.fields.colleague)D.settings.fields.colleague=COLLEAGUE_FIELDS_DEFAULT();
   if(!D.settings.fields.student.find(f=>f.key==='nickname'))D.settings.fields.student.unshift({key:'nickname',label:'Никнейм (как называть в рассадке)',type:'text',system:false,visible:true});
   if(!D.settings.fields.lesson.find(f=>f.key==='ktpNumber'))D.settings.fields.lesson.unshift({key:'ktpNumber',label:'№ по КТП',type:'number',system:false,visible:true});
   if(!D.settings.fields.lesson.find(f=>f.key==='ktpDate'))D.settings.fields.lesson.splice(1,0,{key:'ktpDate',label:'Дата по КТП',type:'date',system:false,visible:true});
   if(!D.settings.homeWidgets)D.settings.homeWidgets=[{key:'clock',visible:true},{key:'schedule',visible:true},{key:'stats',visible:true},{key:'todo',visible:true},{key:'birthdays',visible:true},{key:'recent',visible:true}];
   if(!D.settings.presentLayout)D.settings.presentLayout={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
   if(!D.settings.presentLayoutClub)D.settings.presentLayoutClub={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
   [D.settings.presentLayout,D.settings.presentLayoutClub].forEach(layout=>{
    if(layout&&!layout.left.includes('behavior')&&!layout.right.includes('behavior'))layout.right.push('behavior');
   });
   if(!D.settings.gradeScale)D.settings.gradeScale=[...GRADE_OPTIONS_DEFAULT];
   if(!D.settings.gradeCommentTemplates)D.settings.gradeCommentTemplates=[...GRADE_COMMENT_TEMPLATES_DEFAULT];
   if(!D.settings.libraryGradeLevels)D.settings.libraryGradeLevels=[...LIBRARY_GRADE_LEVELS_DEFAULT];
   if(D.settings.showSaturday===undefined)D.settings.showSaturday=true;
   D.students.forEach(s=>{if(!s.classIds){s.classIds=s.classId?[s.classId]:[];delete s.classId}});
   D.classes.forEach(c=>{if(!c.type)c.type='class'});
   D.classes.forEach(c=>{if(c.gradeNumber===undefined){let p=parseClassName(c.name);c.gradeNumber=p.number;c.gradeLetter=p.letter}});
   if(!D.documents)D.documents=[];
   if(!D.settings.quarters)D.settings.quarters=[];
   save();
   await fileStoreClear();
   for(let fe of (payload.files||[])){
    let blob=await base64ToBlob(fe.data);
    await fileStorePut(fe.id,blob);
   }
   alert('Данные успешно восстановлены.');
   S.view='home';render();
  }catch(err){alert('Не удалось прочитать файл резервной копии.');console.error(err)}
 };
 r.readAsText(f);
}
function boot(){
 loadData();
 purgeOldArchivedLessons();
 repairMissingLessonTimes();
 render();
 initAssistant();
}

boot();
