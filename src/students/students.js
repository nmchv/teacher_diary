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
