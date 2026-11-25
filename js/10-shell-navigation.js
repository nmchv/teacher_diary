/* ===================== ОБОЛОЧКА / НАВИГАЦИЯ ===================== */
let altNav=false;
let sideOpen=false;
function toggleAltNav(){altNav=!altNav;render();}
function render(){
  const navs =
   navBtn('home','⌂','Главная')+
   /* navBtn('fullschedule','📅','Расписание')+ — временно скрыто по просьбе пользователя, страница fullSchedulePage() и логика сохранены в коде */
   navBtn('students','☺','Ученики')+
   navBtn('search','⌕','Поиск')+
   navBtn('stats','▤','Статистика')+
   navBtn('reports','🖨','Ведомости')+
   navBtn('materials','📎','Материалы')+
   navBtn('library','📚','Библиотека уроков')+
   navBtn('announcements','📣','Объявления')+
   navBtn('work','💼','Работа')+
   navBtn('settings','⚙','Настройки')+
   navBtn('backup','⇩','Резервная копия');
  document.getElementById('app').innerHTML=
  '<aside class="side'+(altNav?' alt-active':'')+'">'+
   '<button class="navmode'+(altNav?' active':'')+'" onclick="toggleAltNav()" title="Классы и группы" aria-label="Классы и группы">'+
    '<span class="navmode-icon">🗂</span>'+
    '<span class="navmode-label">Классы и группы</span>'+
   '</button>'+
   '<div class="altbackdrop"></div>'+
   '<div class="altwrap">'+
    '<div class="altgrid">'+navs+'</div>'+
    '<div class="altclasses">'+classesSidebar()+'</div>'+
   '</div>'+
   '<div class="navicons">'+navs+'</div>'+
   '</aside><main class="main">'+page()+'</main>';
  const side=document.querySelector('.side');
  if(side){
    if(sideOpen)side.classList.add('side-open');
    side.onmousedown=function(){sideOpen=true;side.classList.add('side-open');document.body.classList.add('sidebar-open');};
    side.onmouseleave=function(){sideOpen=false;side.classList.remove('side-open');document.body.classList.remove('sidebar-open');};
  }
  document.body.classList.toggle('sidebar-open', sideOpen);
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
   html+='<div class="classes-head">'+title+' <button onclick="openNewClass(\''+kind+'\')">＋</button></div>';
   html+='<table class="classtable"><tbody>';
   list.forEach(c=>html+='<tr><td><button class="label" onclick="openClass(\''+c.id+'\')">'+e(c.name)+'</button></td><td><button class="label" onclick="event.stopPropagation();openEditClass(\''+c.id+'\')">⋯</button></td></tr>');
   html+='</tbody></table>';
  };
  sec('Классы','class');
  sec('Кружки / секции','club');
  return html||'<div class="small muted" style="padding:6px 8px">Классов и кружков пока нет</div>';
}
function navBtn(view,icon,label){return '<button class="nav'+(S.view===view?' active':'')+'" onclick="goto(\''+view+'\')"><span class="icon">'+icon+'</span><span class="label">'+label+'</span></button>'}
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

