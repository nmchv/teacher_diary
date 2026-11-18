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
