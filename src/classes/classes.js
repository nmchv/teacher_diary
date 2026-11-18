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
