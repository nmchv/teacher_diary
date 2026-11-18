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
