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
  '<div class="card"><h2>Общая ведомость (оценки + посещаемость)</h2><p class="muted small">Один файл на все выбранные классы и кружки: по каждому — своя таблица со всеми уроками за всё время, ученики внутри — по алфавиту, классы — по возрастанию (5 → 11). Замечания о поведении печатаются отдельным списком под таблицей каждого класса.</p>'+
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
 let body='<h1>Общая ведомость оценок и посещаемости</h1>';
 classes.forEach(c=>{
  let ps=sortStudentsList(peopleGroup(c.id),S.studentSort).filter(s=>includeHS||!s.homeschool);
  let ls=groupLessons(c.id).filter(l=>!l.cancelled).sort((a,b)=>a.date.localeCompare(b.date));
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

