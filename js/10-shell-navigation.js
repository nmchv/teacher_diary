/* ===================== ОБОЛОЧКА / НАВИГАЦИЯ ===================== */
let altNav=false;
let sideOpen=false;
let sideTimer=null;
/* Скрытый пункт «Расписание»: ['fullschedule','…','Расписание'] — временно убран по просьбе пользователя,
   страница fullSchedulePage() и логика сохранены в коде */
const NAV_ITEMS=[
 ['home','Главная'],['students','Ученики'],['search','Поиск'],['stats','Статистика'],['reports','Ведомости'],
 ['materials','Материалы'],['library','Библиотека уроков'],['planning','Планирование уроков'],['announcements','Объявления'],['work','Работа'],
 ['settings','Настройки'],['backup','Резервная копия']
];
function toggleAltNav(){altNav=!altNav;syncSidebar();}
function setSideOpen(open,delay){
  clearTimeout(sideTimer);
  const apply=()=>{
    sideOpen=open;
    const side=document.querySelector('.side');
    if(side)side.classList.toggle('side-open',open);
    document.body.classList.toggle('sidebar-open',open);
  };
  if(delay)sideTimer=setTimeout(apply,delay);else apply();
}
/* Каркас создаётся один раз: панель не пересоздаётся при переходах,
   поэтому анимации не обрываются и не проигрываются заново. */
function buildShell(){
  const app=document.getElementById('app');
  if(app.querySelector('.side'))return;
  app.innerHTML=
  '<aside class="side" aria-label="Разделы">'+
   '<div class="side-stage">'+
    '<nav class="side-pane side-rail">'+NAV_ITEMS.map(n=>navBtn(n[0],n[1])).join('')+'</nav>'+
    '<div class="side-pane side-groups">'+
     '<nav class="side-grid">'+NAV_ITEMS.map(n=>navBtn(n[0],n[1])).join('')+'</nav>'+
     '<div class="side-classes"></div>'+
    '</div>'+
   '</div>'+
   '<div class="side-foot">'+
    '<button type="button" class="nav navmode" onclick="toggleAltNav()" aria-pressed="false" aria-label="Классы и группы" title="Классы и группы">'+
     icon('classes')+'<span class="label">Классы и группы</span>'+
    '</button>'+
   '</div>'+
  '</aside><main class="main"></main>';
  const side=app.querySelector('.side');
  side.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')setSideOpen(true,90)});
  side.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse')setSideOpen(false,160)});
  /* касание: первый тап по свёрнутой панели раскрывает её; тап по кнопке «Классы и группы» тоже */
  side.addEventListener('click',ev=>{if(!sideOpen&&(ev.target.closest('.navmode')||!ev.target.closest('button')))setSideOpen(true)});
  side.addEventListener('focusin',ev=>{if(ev.target.matches(':focus-visible'))setSideOpen(true)});
  side.addEventListener('focusout',ev=>{if(!side.contains(ev.relatedTarget)&&!side.matches(':hover'))setSideOpen(false)});
  document.addEventListener('pointerdown',ev=>{if(sideOpen&&!side.contains(ev.target))setSideOpen(false)});
}
function syncSidebar(){
  const side=document.querySelector('.side');
  if(!side)return;
  side.classList.toggle('alt-active',altNav);
  side.classList.toggle('side-open',sideOpen);
  side.querySelectorAll('[data-view]').forEach(b=>{
    const on=b.dataset.view===S.view;
    b.classList.toggle('active',on);
    if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  const mode=side.querySelector('.navmode');
  mode.classList.toggle('on',altNav);
  mode.setAttribute('aria-pressed',String(altNav));
  const list=side.querySelector('.side-classes');
  const html=classesSidebar();
  if(list._html!==html){list.innerHTML=html;list._html=html}
}
function render(){
  buildShell();
  syncSidebar();
  const main=document.querySelector('.main');
  main.innerHTML=page();
  if(main._view!==S.view){main.scrollTop=0;main._view=S.view}
  initAutosize();
  if(S.lessonModal)renderLessonModal();
  if(S.view==='home')startClockTicker();
  else if(window._clockInterval){clearInterval(window._clockInterval);window._clockInterval=null}
  if(S.view==='work'&&S.workTab==='colleagues')initColumnResize('colleagues-table','colleagueColWidths');
}
function classesSidebar(){
  let html='',sec=(title,kind)=>{
   let list=sortedClasses(D.classes.filter(c=>c.type===kind));
   if(!list.length)return;
   html+='<div class="classes-head">'+title+' <button type="button" onclick="openNewClass(\''+kind+'\')" aria-label="Добавить" title="Добавить">'+icon('plus')+'</button></div>';
   html+='<table class="classtable"><tbody>';
   list.forEach(c=>html+='<tr><td><button class="label" onclick="openClass(\''+c.id+'\')">'+e(c.name)+'</button></td><td><button class="label" onclick="event.stopPropagation();openEditClass(\''+c.id+'\')" aria-label="Изменить" title="Изменить">'+icon('more')+'</button></td></tr>');
   html+='</tbody></table>';
  };
  sec('Классы','class');
  sec('Кружки / секции','club');
  return html||'<div class="small muted" style="padding:6px 8px">Классов и кружков пока нет</div>';
}
function navBtn(view,label){return '<button type="button" class="nav" data-view="'+view+'" onclick="goto(\''+view+'\')" aria-label="'+label+'" title="'+label+'">'+icon(view)+'<span class="label">'+label+'</span></button>'}
function goto(v){S.view=v;render()}
function page(){
 if(S.view==='classes')return '<div class="card" style="max-width:640px;margin:0 auto">'+classesSidebar()+'</div>';
 if(S.view==='students')return studentsPage();
 if(S.view==='student')return studentPage();
 if(S.view==='class')return classPage();
 if(S.view==='search')return searchPage();
 if(S.view==='stats')return statsPage();
 if(S.view==='reports')return reportsPage();
 if(S.view==='materials')return materialsPage();
 if(S.view==='library')return lessonLibraryPage();
  if(S.view==='planning')return planningPage();
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

