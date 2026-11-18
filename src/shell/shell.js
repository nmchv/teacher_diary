function render(){
 applyTheme();
 document.getElementById('app').innerHTML=
  '<aside class="side'+(S.sidebarCollapsed?' collapsed':'')+'">'+
   '<div class="brand"><span class="brand-text">Дневник учителя</span><button class="collapse-btn" onclick="toggleSidebar()" title="Свернуть/развернуть">'+(S.sidebarCollapsed?'»':'«')+'</button></div>'+
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
   navBtn('backup','⇩','Резервная копия')+
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
function navBtn(view,icon,label){return '<button class="nav'+(S.view===view?' active':'')+'" onclick="goto(\''+view+'\')">'+icon+' <span class="label">'+label+'</span></button>'}
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
