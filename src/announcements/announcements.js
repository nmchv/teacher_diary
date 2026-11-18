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
