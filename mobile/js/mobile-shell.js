function mobileSettingsPage(){
  // Используем ту же функцию, что и в десктопной версии, но добавим переключатель версии
  let html = settingsPage();
  return html;
}
function mobileSettingsAppearanceTab(){
  let forcedVersion = null;
  try { forcedVersion = localStorage.getItem('teacherDiaryV3.forcedVersion'); } catch(e) {}
  let detected = (typeof window.currentVersion === 'function') ? window.currentVersion() : (forcedVersion || 'mobile');
  let versionLabel = detected === 'mobile' ? 'Мобильная версия' : 'Десктопная версия';
  return sCard('Версия интерфейса',
    '<p class="muted small">Сайт автоматически определяет тип устройства и показывает подходящую версию. Вы можете вручную зафиксировать одну из них — тогда при открытии будет использоваться именно она, независимо от экрана.</p>'+
    '<div class="toolbar">'+
    '<button class="'+(forcedVersion === null ? 'primary' : '')+'" onclick="setForcedVersion(null)">Auto (по устройству)</button>'+
    '<button class="'+(forcedVersion === 'mobile' ? 'primary' : '')+'" onclick="setForcedVersion(\'mobile\')">Мобильная</button>'+
    '<button class="'+(forcedVersion === 'desktop' ? 'primary' : '')+'" onclick="setForcedVersion(\'desktop\')">Десктопная</button>'+
    '</div>'+
    '<p class="muted small" style="margin-top:8px">Сейчас определено: <strong>'+versionLabel+'</strong></p>'+
    (forcedVersion ? '<p class="muted small">Принудительно: '+forcedVersion+'</p>' : '')
  );
}
function setForcedVersion(v){
  try {
    if (v === null) localStorage.removeItem('teacherDiaryV3.forcedVersion');
    else localStorage.setItem('teacherDiaryV3.forcedVersion', v);
  } catch(e) {}
  window.location.reload();
}
function toggleColorMode(){D.settings.colorMode=D.settings.colorMode==='dark'?'light':'dark';save();applyTheme();render()}
function mobileNavItems(){
 return ['home','students','search','stats','reports','materials','library','announcements','work','settings','backup'];
}
function mobileNavLabel(v){
 const map={home:'Главная',students:'Ученики',search:'Поиск',stats:'Статистика',reports:'Ведомости',materials:'Материалы',library:'Библиотека уроков',announcements:'Объявления',work:'Работа',settings:'Настройки',backup:'Резервная копия'};
 return map[v]||v;
}
window.mobileScheduleDate=toISO(new Date());
function changeMobileScheduleDate(v){window.mobileScheduleDate=v||toISO(new Date());render()}
function dueLabel(dateStr){
  if(!dateStr)return '—';
  let d=new Date(dateStr+'T12:00:00');
  return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0');
}
function dueColor(dateStr){
  if(!dateStr)return 'var(--muted)';
  let today=toISO(new Date());
  let diff=Math.round((new Date(dateStr+'T12:00:00')-new Date(today+'T12:00:00'))/86400000);
  if(diff<=0)return '#e55353';
  if(diff===1)return '#f0a500';
  return 'var(--muted)';
}
function priorityColor(p){return p==='high'?'#e55353':p==='low'?'#4caf50':'#f0a500'}
function widgetSchedule(){
  let today=toISO(new Date());
  let lessons=activeLessons().filter(l=>l.date===today).sort((a,b)=>(a.lessonNumber||99)-(b.lessonNumber||99)||(a.startTime||'').localeCompare(b.startTime||''));
  let rows=LESSON_TIMES.map(t=>{
    let l=lessons.find(x=>+x.lessonNumber===t.n);
    let cls=l?C(l.classId):null;
    let status=l?lessonStatus(l):'';
    let topic=l?(l.cancelled?'🚫 Отменён':e(l.topic||'(без темы)')):'';
    return '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="'+(l?'openLessonModal(\x27'+l.id+'\x27)':'')+'"><div style="flex:0 0 48px;text-align:center;font-size:12px"><div>'+t.n+'</div><div>'+t.start+'</div><div>'+t.end+'</div></div><div style="flex:1">'+(l?'<div style="font-weight:600">'+e(cls?cls.name:'—')+'</div><div class="small">'+topic+'</div>':'<div class="muted small">—</div>')+'</div></div>';
  }).join('');
  // clubs/meetings omitted for compactness
  let clubs=activeLessons().filter(l=>l.date===today&&!l.lessonNumber&&C(l.classId)&&C(l.classId).type==='club').sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));
  let meetings=D.meetings.filter(m=>m.date===today);
  let extra='';
  extra+='<div style="padding:8px 0;font-weight:600">Кружки / секции</div>';
  if(clubs.length){
    clubs.forEach(l=>{let cls=C(l.classId);extra+='<div style="display:flex;gap:8px;padding:4px 0;cursor:pointer" onclick="openLessonModal(\x27'+l.id+'\x27)"><div style="flex:0 0 48px;text-align:center;font-size:12px">'+(l.startTime||'')+(l.endTime?'–'+l.endTime:'')+'</div><div style="flex:1">'+e(cls?cls.name:'—')+' — '+e(l.topic||'(без темы)')+'</div></div>'});
  } else {
    extra+='<div style="padding:4px 0" class="muted small">Сегодня нет кружков/секций</div>';
  }
  extra+='<div style="padding:8px 0;font-weight:600">Совещания</div>';
  if(meetings.length){
    meetings.forEach(m=>{extra+='<div style="display:flex;gap:8px;padding:4px 0;cursor:pointer" onclick="openEditMeeting(\x27'+m.id+'\x27)"><div style="flex:0 0 48px;text-align:center;font-size:12px">'+(m.time||'')+'</div><div style="flex:1">'+e(m.title)+'</div></div>'});
  } else {
    extra+='<div style="padding:4px 0" class="muted small">Совещаний нет!</div>';
  }
  return '<div class="card"><div class="top"><h2>Расписание на сегодня</h2><button class="primary" onclick="openNewLesson()">＋</button></div>'+rows+extra+'</div>';
}
function dueLabel(dateStr){
  if(!dateStr)return 'скоро';
  let today=toISO(new Date());
  let diff=Math.round((new Date(dateStr+'T12:00:00')-new Date(today+'T12:00:00'))/86400000);
  if(diff<=0)return 'сегодня';
  if(diff===1)return 'завтра';
  if(diff===2)return 'послезавтра';
  return 'скоро';
}
function priorityColor(p){return p==='high'?'#e55353':p==='low'?'#4caf50':'#f0a500'}
function widgetTasks(){
  let items=D.workTasks;
  if(!items.length)return '<div class="card"><div class="top"><h2>Задачи</h2><button class="primary" onclick="openNewWorkTask()">＋</button></div><div class="muted small">Подходящих задач нет.</div></div>';
  return '<div class="card"><div class="top"><h2>Задачи</h2><button class="primary" onclick="openNewWorkTask()">＋</button></div>'+items.map(t=>'<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><input type="checkbox" style="width:auto" '+(t.status==='done'?'checked':'')+' onchange="toggleWorkTaskDone(\''+t.id+'\')"><span style="flex:1'+(t.status==='done'?';text-decoration:line-through;color:var(--muted)':'')+'">'+e(t.title)+'</span><button class="icon-btn" onclick="openEditWorkTask(\''+t.id+'\')">⋯</button></div>').join('')+'</div>';
}
function widgetBirthdays(){
  let items=[];
  D.students.filter(s=>s.status!=='archived'&&s.customFields.birthDate).forEach(s=>{
    let days=bdayDiff(s.customFields.birthDate);
    if((days>=0&&days<=7)||days===-1)items.push({days,html:'<span class="click" onclick="openStudentPage(\x27'+s.id+\x27)">'+studentFio(s)+' <span class="muted small">· '+e(studentClassNames(s))+'</span></span>'});
  });
  (D.colleagues||[]).filter(c=>colleagueField(c,'birthDate')).forEach(c=>{
    let days=bdayDiff(colleagueField(c,'birthDate'));
    if((days>=0&&days<=7)||days===-1)items.push({days,html:'<span class="click" onclick="openColleagueCard(\x27'+c.id+\x27)">'+colleagueFio(c)+' <span class="muted small">· коллега'+(colleagueField(c,'position')?', '+e(colleagueField(c,'position')):'')+'</span></span>'});
  });
  items.sort((a,b)=>{
    if(a.days<0&&b.days>=0)return 1;
    if(a.days>=0&&b.days<0)return -1;
    return a.days-b.days;
  });
  if(items.length>3)items=items.slice(0,3);
  function badgeFor(days){
   if(days===0)return'сегодня! 🎂';
   if(days===1)return'завтра';
   if(days===-1)return'вчера';
   return'через '+days+' дн.';
  }
  return '<div class="card"><h2 style="margin-top:0">🎂 Дни рождения</h2>'+
   (items.length?items.map(x=>'<div class="attrow">'+x.html+'<span class="badge'+(x.days<0?' muted':'')+'">'+badgeFor(x.days)+'</span></div>').join(''):'<div class="muted small">На ближайшую неделю дней рождения нет.</div>')+
   '</div>';
}
function homePage(){
  let widgets=(D.settings.homeWidgets||[]).filter(w=>w.visible&&HOME_WIDGETS[w.key]&&w.key!=='stats'&&w.key!=='schedule'&&w.key!=='todo'&&w.key!=='recent');
  let clock=widgets.find(w=>w.key==='clock');
  let rest=widgets.filter(w=>w.key!=='clock');
  let html='<div class="top"><div><h1>Главная</h1><div class="muted">Личный рабочий кабинет учителя</div></div>'+
   backupReminderBanner();
  if(clock) html+=HOME_WIDGETS.clock.render();
  html+=widgetSchedule();
  html+=widgetTasks();
  rest.forEach(w=>html+=HOME_WIDGETS[w.key].render());
  return html;
}
HOME_WIDGETS.birthdays=widgetBirthdays;
const _origRender=render;
function render(){
 applyTheme();
 let html='<div class="mobile-header"><div class="brand">Дневник учителя</div><div class="actions"><button class="icon-btn" onclick="toggleColorMode()" title="Тема">'+(D.settings.colorMode==='dark'?'🌙':'☀️')+'</button><button class="icon-btn" onclick="toggleMobileMenu()" title="Меню"><div class="hamburger"><span></span><span></span><span></span></div></button></div></div>';
 if(window.mobileMenuOpen){
   html+='<div class="mobile-menu"><div class="menu-header"><div class="brand">Меню</div><button class="icon-btn" onclick="toggleMobileMenu()">✕</button></div>';
   mobileNavItems().forEach(v=>{html+='<button class="navbtn" onclick="goto(\''+v+'\');toggleMobileMenu()">'+mobileNavLabel(v)+'</button>'});
   html+='</div>';
 }
 html+='<main class="main">'+page()+'</main>';
 document.getElementById('app').innerHTML=html;
 initAutosize();
 if(S.view==='home')startClockTicker();
 else if(window._clockInterval){clearInterval(window._clockInterval);window._clockInterval=null}
}
render();
