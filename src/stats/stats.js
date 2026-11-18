function periodRange(){
 let f=S.statsFilter;
 let now=new Date();
 if(f.period==='month'){let from=new Date(now.getFullYear(),now.getMonth(),1);return{from:toISO(from),to:toISO(now)}}
 if(f.period==='year'){let y=now.getMonth()>=7?now.getFullYear():now.getFullYear()-1;return{from:y+'-09-01',to:toISO(now)}}
 if(f.period==='custom')return{from:f.from||'0000-01-01',to:f.to||'9999-12-31'};
 let q=(D.settings.quarters||[]).find(x=>x.id===f.period);
 if(q)return{from:q.startDate,to:q.endDate};
 return{from:'0000-01-01',to:'9999-12-31'};
}
function filteredLessons(){
 let f=S.statsFilter,r=periodRange();
 return activeLessons().filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to&&(!f.classId||groupIds(f.classId).includes(l.classId)));
}
function assistantStatsAnalysis(){
 let r=periodRange();
 let ls=filteredLessons();
 if(!ls.length)return[{tone:'info',icon:'💤',text:'Пока нет данных за выбранный период — как только появятся уроки с оценками и посещаемостью, я смогу сделать выводы.',chips:[]}];
 let notes=[];
 let classRows=D.classes.map(c=>{
  let cls_ls=groupLessons(c.id).filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];cls_ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}));
  let attPct=avgAttendancePctPerLesson(cls_ls);
  let behaviorCount=0;cls_ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
  return{c,avg:avg(gv),att:attPct,behaviorCount,lessonsCount:cls_ls.length};
 }).filter(x=>x.lessonsCount>0);
 if(classRows.length>1){
  let withAvg=classRows.filter(x=>x.avg!==null);
  if(withAvg.length>1){
   let best=[...withAvg].sort((a,b)=>b.avg-a.avg)[0];
   let worst=[...withAvg].sort((a,b)=>a.avg-b.avg)[0];
   if(best.c.id!==worst.c.id&&(best.avg-worst.avg)>=0.7){
    notes.push({tone:'info',icon:'📊',text:'Заметная разница между классами: в «'+e(best.c.name)+'» средняя оценка '+round2(best.avg)+', а в «'+e(worst.c.name)+'» — '+round2(worst.avg)+'. Возможно, стоит присмотреться, что помогает в одном классе и чего не хватает в другом.',
     chips:[{kind:'class',id:best.c.id,label:best.c.name+' · '+round2(best.avg)},{kind:'class',id:worst.c.id,label:worst.c.name+' · '+round2(worst.avg)}]});
   }
  }
  let lowAtt=classRows.filter(x=>x.att!==null&&x.att<75);
  if(lowAtt.length)notes.push({tone:'warn',icon:'📉',text:'Посещаемость ниже 75% в классах: '+lowAtt.map(x=>e(x.c.name)).join(', ')+'. Возможно, стоит выяснить причину пропусков.',
   chips:lowAtt.map(x=>({kind:'class',id:x.c.id,label:x.c.name}))});
  let highBeh=classRows.filter(x=>x.behaviorCount>=3).sort((a,b)=>b.behaviorCount-a.behaviorCount);
  if(highBeh.length)notes.push({tone:'warn',icon:'⚠️',text:'Больше всего заметок о поведении накопилось в классах: '+highBeh.slice(0,3).map(x=>e(x.c.name)+' ('+x.behaviorCount+')').join(', ')+'.',
   chips:highBeh.slice(0,3).map(x=>({kind:'class',id:x.c.id,label:x.c.name+' ('+x.behaviorCount+')'}))});
 }
 let students=D.students.filter(s=>s.status!=='archived');
 let studentRows=students.map(s=>{
  let sls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];sls.forEach(l=>{let g=(l.grades||{})[s.id];if(g){let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}});
  let at=0,ap=0;sls.forEach(l=>{let v=(l.attendance||{})[s.id];if(v){at++;if(v!=='н')ap++}});
  let behaviorCount=0;sls.forEach(l=>{if((l.behaviorNotes||{})[s.id])behaviorCount++});
  return{s,avg:avg(gv),attPct:at?ap/at*100:null,absences:at-ap,behaviorCount,lessonsCount:sls.length};
 }).filter(x=>x.lessonsCount>0);
 let allAvg=avg(studentRows.map(x=>x.avg).filter(x=>x!==null));
 if(allAvg){
  let strong=studentRows.filter(x=>x.avg!==null&&x.avg-allAvg>=1).sort((a,b)=>b.avg-a.avg).slice(0,3);
  if(strong.length)notes.push({tone:'good',icon:'⭐',text:'Стабильно выше среднего по оценкам: '+strong.map(x=>studentFio(x.s)).join(', ')+'.',
   chips:strong.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' · '+round2(x.avg)}))});
  let weak=studentRows.filter(x=>x.avg!==null&&allAvg-x.avg>=1).sort((a,b)=>a.avg-b.avg).slice(0,3);
  if(weak.length)notes.push({tone:'warn',icon:'🤝',text:'Возможно, нужна дополнительная поддержка: '+weak.map(x=>studentFio(x.s)).join(', ')+' — их средняя заметно ниже общей по выборке.',
   chips:weak.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' · '+round2(x.avg)}))});
 }
 let manyAbs=studentRows.filter(x=>x.absences>=3).sort((a,b)=>b.absences-a.absences).slice(0,3);
 if(manyAbs.length)notes.push({tone:'alert',icon:'🚪',text:'Много пропусков за период: '+manyAbs.map(x=>studentFio(x.s)+' ('+x.absences+')').join(', ')+'.',
 chips:manyAbs.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' ('+x.absences+')'}))});
 let manyBeh=studentRows.filter(x=>x.behaviorCount>=2).sort((a,b)=>b.behaviorCount-a.behaviorCount).slice(0,3);
 if(manyBeh.length)notes.push({tone:'alert',icon:'❗',text:'Несколько заметок о поведении подряд: '+manyBeh.map(x=>studentFio(x.s)+' ('+x.behaviorCount+')').join(', ')+' — возможно, стоит поговорить лично.',
 chips:manyBeh.map(x=>({kind:'student',id:x.s.id,label:studentFioPlain(x.s)+' ('+x.behaviorCount+')'}))});
 if(!notes.length)notes.push({tone:'good',icon:'✅',text:'Пока ничего тревожного не вижу — картина по оценкам, посещаемости и поведению выглядит ровно за выбранный период.',chips:[]});
 return notes;
}
function statsAssistantCard(){
 let ch=ASSISTANT_CHARACTERS[assistantSettings().character]||ASSISTANT_CHARACTERS.dog;
 let notes=assistantStatsAnalysis();
 return '<div class="card" style="border-color:var(--accent)"><div class="top"><h2>'+ch.emoji+' Заметки ассистента</h2><button onclick="render()">↻ Обновить</button></div>'+
  '<p class="muted small">Автоматические наблюдения по текущим фильтрам — нажмите на имя ученика или класс, чтобы сразу открыть профиль.</p>'+
  '<div class="insight-list">'+notes.map(n=>
   '<div class="insight-item tone-'+n.tone+'"><div class="insight-icon">'+(n.icon||'💡')+'</div><div class="insight-body"><div class="insight-text">'+n.text+'</div>'+
   (n.chips&&n.chips.length?'<div class="insight-chips">'+n.chips.map(c=>'<span class="chip-link" onclick="'+(c.kind==='class'?'openClass':'openStudentPage')+'(\''+c.id+'\')">'+(c.kind==='class'?'🏫 ':'🧑 ')+e(c.label)+'</span>').join('')+'</div>':'')+
   '</div></div>').join('')+
  '</div></div>';
}
function statsPage(){
 let f=S.statsFilter;
 let r=periodRange();
 let ls=filteredLessons();
 let gradeVals=[];let distVals=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{if(!g.value)return;distVals.push(g.value);let n=gradeNumericValue(g.value);if(n!==null)gradeVals.push(n)}));
 let attPct=avgAttendancePctPerLesson(ls);
 let absencesCount=0;ls.forEach(l=>Object.values(l.attendance||{}).forEach(v=>{if(v==='н')absencesCount++}));
 let behaviorCount=0;ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
 let planned=ls.filter(l=>lessonStatus(l)==='red').length,partial=ls.filter(l=>lessonStatus(l)==='yellow').length,prepared=ls.filter(l=>lessonStatus(l)==='blue').length,done=ls.filter(l=>lessonStatus(l)==='green').length;
 let activeStudents=D.students.filter(s=>s.status!=='archived').length,archivedStudents=D.students.filter(s=>s.status==='archived').length;
 let scope=f.classId?'class':'global',scopeId=f.classId||'';
 return '<div class="top"><div><h1>Статистика</h1><div class="muted">Показатели учителя, классов и учеников</div></div></div>'+
  statsFilterBar()+
  '<div class="card"><h2>Мои показатели</h2><div class="grid">'+
   stat(ls.length,'Всего уроков')+stat(done,'Заполнено полностью')+stat(partial,'Частично подготовлено')+stat(prepared,'Требуют рефлексии')+stat(planned,'Не подготовлено')+
   stat(round2(avg(gradeVals)),'Средняя оценка')+stat(attPct===null?'—':Math.round(attPct*10)/10+'%','Общая посещаемость')+
   stat(gradeVals.length,'Оценок выставлено')+stat(absencesCount,'Пропусков')+stat(behaviorCount,'Заметок о поведении')+
   stat(D.classes.length,'Классов')+stat(activeStudents,'Активных учеников')+stat(archivedStudents,'Архивных учеников')+
  '</div></div>'+
  statsAssistantCard()+
  '<div class="card"><h2 style="margin-top:0">Распределение оценок <span class="muted small">(нажмите на столбец, чтобы увидеть кому и когда)</span></h2>'+svgBarChart(gradeDistData(distVals,scope,scopeId,r.from,r.to),{width:900,height:260})+'</div>'+
  '<div class="card"><h2 style="margin-top:0">Посещаемость <span class="muted small">(нажмите, чтобы увидеть кто и когда пропускал)</span></h2>'+donutChartPct(attPct,140,"showAttendanceBreakdown('"+scope+"','"+scopeId+"','"+r.from+"','"+r.to+"')")+'</div>'+
  behaviorLeaderboardCard()+
  statsClassesCard()+statsStudentsCard();
}
function statsFilterBar(){
 let f=S.statsFilter;
 let quarterOpts=(D.settings.quarters||[]).map(q=>['<option value="'+q.id+'"'+(f.period===q.id?' selected':'')+'>'+e(q.name)+'</option>']).map(x=>x[0]).join('');
 return '<div class="card"><div class="row">'+
  '<div><label>Период</label><select onchange="S.statsFilter.period=this.value;render()">'+
   [['all','Весь период'],['year','Текущий учебный год']].map(o=>'<option value="'+o[0]+'"'+(f.period===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+
   quarterOpts+
   [['month','Месяц'],['custom','Произвольный период']].map(o=>'<option value="'+o[0]+'"'+(f.period===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  '<div><label>Класс</label><select onchange="S.statsFilter.classId=this.value;render()"><option value="">Все классы</option>'+classOptionsHtml(f.classId)+'</select></div>'+
  (f.period==='custom'?'<div><label>С</label><input type="date" value="'+e(f.from)+'" onchange="S.statsFilter.from=this.value;render()"></div><div><label>По</label><input type="date" value="'+e(f.to)+'" onchange="S.statsFilter.to=this.value;render()"></div>':'')+
  '</div></div>';
}
function statsClassesCard(){
 let f=S.statsFilter,r=periodRange();
 let rows=D.classes.map(c=>{
  let ls=groupLessons(c.id).filter(l=>!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];ls.forEach(l=>Object.values(l.grades||{}).forEach(g=>{let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}));
  let attPct=avgAttendancePctPerLesson(ls);
  let behaviorCount=0;ls.forEach(l=>{behaviorCount+=Object.keys(l.behaviorNotes||{}).length});
  return {c,studentsCount:peopleGroup(c.id).length,lessonsCount:ls.length,avgGrade:avg(gv),attendancePct:attPct===null?null:Math.round(attPct*10)/10,behaviorCount,
   planned:ls.filter(l=>lessonStatus(l)==='red').length,partial:ls.filter(l=>lessonStatus(l)==='yellow').length,prepared:ls.filter(l=>lessonStatus(l)==='blue').length,done:ls.filter(l=>lessonStatus(l)==='green').length};
 });
 let sortKey=S.statsFilter.sortClasses;
 let sorters={name:(a,b)=>compareClasses(a.c,b.c),avg:(a,b)=>(b.avgGrade||0)-(a.avgGrade||0),att:(a,b)=>(b.attendancePct||0)-(a.attendancePct||0),students:(a,b)=>b.studentsCount-a.studentsCount,lessons:(a,b)=>b.lessonsCount-a.lessonsCount};
 rows.sort(sorters[sortKey]||sorters.name);
 return '<div class="card"><div class="top"><h2>Статистика по классам</h2><select onchange="S.statsFilter.sortClasses=this.value;render()">'+
  [['name','По названию'],['avg','По средней оценке'],['att','По посещаемости'],['students','По кол-ву учеников'],['lessons','По кол-ву уроков']].map(o=>'<option value="'+o[0]+'"'+(sortKey===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  '<div class="grid">'+rows.map(r=>'<div class="card click" onclick="openClass(\''+r.c.id+'\')"><b>'+e(r.c.name)+'</b><div class="small muted">'+r.studentsCount+' учеников</div><div>Средняя: '+round2(r.avgGrade)+'</div><div>Посещаемость: '+(r.attendancePct===null?'—':r.attendancePct+'%')+'</div><div>Уроков: '+r.lessonsCount+'</div><div class="small muted">Заметок о поведении: '+r.behaviorCount+'</div><div class="small">🔴'+r.planned+' 🟡'+r.partial+' 🔵'+r.prepared+' 🟢'+r.done+'</div></div>').join('')+
  (rows.length?'':'<div class="empty">Классов пока нет.</div>')+'</div></div>';
}
function studentBadgeInfo(metrics,baseline){
 let reasons=[];let top=false,attention=false;
 let avgGrade=metrics.avgGrade,absences=metrics.absences||0,behaviorCount=metrics.behaviorCount||0;
 if(avgGrade!==null&&baseline!==null){
  if(avgGrade-baseline>=1){top=true;reasons.push('средняя выше группы на '+round2(avgGrade-baseline));}
  if(baseline-avgGrade>=1){attention=true;reasons.push('средняя ниже группы на '+round2(baseline-avgGrade));}
 }
 if(absences>=3){attention=true;reasons.push('пропусков: '+absences);}
 if(behaviorCount>=2){attention=true;reasons.push('замечаний о поведении: '+behaviorCount);}
 return {top,attention,reasons};
}
function studentBadgeHtml(metrics,baseline){
 let info=studentBadgeInfo(metrics,baseline);
 let out='';
 if(info.top)out+='<span class="stbadge" title="Высокий результат: '+e(info.reasons.join(', '))+'">🏆</span>';
 if(info.attention)out+='<span class="stbadge" title="Стоит обратить внимание: '+e(info.reasons.join(', '))+'">❗</span>';
 return out;
}
function statsStudentsCard(){
 let f=S.statsFilter,r=periodRange();
 let students=D.students.filter(s=>s.status!=='archived'&&(!f.classId||(s.classIds||[]).some(i=>groupIds(f.classId).includes(i))));
 let rows=students.map(s=>{
  let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];ls.forEach(l=>{let g=(l.grades||{})[s.id];if(g){let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}});
  let at=0,ap=0;ls.forEach(l=>{let v=(l.attendance||{})[s.id];if(v){at++;if(v!=='н')ap++}});
  let behaviorCount=0;ls.forEach(l=>{if((l.behaviorNotes||{})[s.id])behaviorCount++});
  return {s,avgGrade:avg(gv),gradesCount:gv.length,attendancePct:at?Math.round(ap/at*1000)/10:null,absences:at-ap,behaviorCount};
 });
 let sortKey=S.statsFilter.sortStudents;
 let sorters={fio:(a,b)=>(a.s.lastName+a.s.firstName).localeCompare(b.s.lastName+b.s.firstName,'ru'),avg:(a,b)=>(b.avgGrade||0)-(a.avgGrade||0),att:(a,b)=>(b.attendancePct||0)-(a.attendancePct||0),grades:(a,b)=>b.gradesCount-a.gradesCount,absences:(a,b)=>b.absences-a.absences};
 rows.sort(sorters[sortKey]||sorters.fio);
 let baseline=avg(rows.map(r=>r.avgGrade).filter(x=>x!==null));
 return '<div class="card"><div class="top"><h2>Статистика по ученикам</h2><select onchange="S.statsFilter.sortStudents=this.value;render()">'+
  [['fio','По ФИО'],['avg','По средней оценке'],['att','По посещаемости'],['grades','По кол-ву оценок'],['absences','По кол-ву пропусков']].map(o=>'<option value="'+o[0]+'"'+(sortKey===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
  (rows.length?'<table class="table"><tr><th>Ученик</th><th>Класс</th><th>Средняя</th><th>Оценок</th><th>Посещаемость</th><th>Пропусков</th><th>Заметок о поведении</th></tr>'+
   rows.map(r=>{let info=studentBadgeInfo(r,baseline);let rowClass='click'+(info.top?' row-top':'')+(info.attention?' row-attention':'');
    return '<tr class="'+rowClass+'" onclick="openStudentPage(\''+r.s.id+'\')"><td>'+studentFio(r.s)+studentBadgeHtml(r,baseline)+'</td><td>'+e(studentClassNames(r.s))+'</td><td>'+round2(r.avgGrade)+'</td><td>'+r.gradesCount+'</td><td>'+(r.attendancePct===null?'—':r.attendancePct+'%')+'</td><td>'+r.absences+'</td><td>'+r.behaviorCount+'</td></tr>';
   }).join('')+'</table>'+
   '<div class="badge-legend"><span>🏆 — средняя заметно выше остальных в этом списке</span><span>❗ — стоит обратить внимание: низкая средняя, много пропусков или замечания о поведении</span></div>'
   :'<div class="empty">Учеников пока нет.</div>')+'</div>';
}
function studentInitials(s){return ((s.lastName||'')[0]||'')+((s.firstName||'')[0]||'')}
function behaviorLeaderboardData(){
 let ls=filteredLessons();
 let map={};
 ls.forEach(l=>{
  let bn=l.behaviorNotes||{};
  Object.keys(bn).forEach(sid=>{
   let txt=(bn[sid]||'').trim();if(!txt)return;
   let s=P(sid);if(!s)return;
   if(!map[sid])map[sid]={s,count:0,items:[]};
   map[sid].count++;
   map[sid].items.push({date:l.date,cls:C(l.classId),note:txt,lessonId:l.id});
  });
 });
 let rows=Object.values(map).sort((a,b)=>b.count-a.count||(a.s.lastName+a.s.firstName).localeCompare(b.s.lastName+b.s.firstName,'ru'));
 rows.forEach(r=>r.items.sort((a,b)=>b.date.localeCompare(a.date)));
 return rows;
}
function behaviorLeaderboardCard(){
 let rows=behaviorLeaderboardData();
 if(!rows.length)return '<div class="card"><h2 style="margin-top:0">🧭 Замечания о поведении</h2><div class="muted small">За выбранный период замечаний о поведении нет.</div></div>';
 let top=rows.slice(0,12);
 return '<div class="card"><h2 style="margin-top:0">🧭 Рейтинг замечаний о поведении <span class="muted small">(нажмите на ученика, чтобы увидеть список)</span></h2>'+
  '<div class="rank-list">'+top.map((r,i)=>
   '<div class="rank-row'+(i<3?' top'+(i+1):'')+'" onclick="showBehaviorDetail(\''+r.s.id+'\')"><div class="rank-pos">'+(i+1)+'</div><div class="rank-avatar">'+e(studentInitials(r.s))+'</div><div><div class="rank-name">'+studentFio(r.s)+'</div><div class="rank-sub">'+e(studentClassNames(r.s))+'</div></div><div class="rank-count">'+r.count+'</div></div>'
  ).join('')+
  (rows.length>top.length?'<div class="muted small" style="margin-top:6px">И ещё '+(rows.length-top.length)+' учеников с замечаниями.</div>':'')+
  '</div></div>';
}
function showBehaviorDetail(sid){
 let rows=behaviorLeaderboardData();
 let r=rows.find(x=>x.s.id===sid);
 if(!r)return;
 setModalHtml(studentFio(r.s)+' — замечания о поведении',
  '<div class="muted small" style="margin-bottom:10px">Всего за выбранный период: <b>'+r.count+'</b></div>'+
  '<div style="overflow:auto"><table class="table"><tr><th>Дата</th><th>Класс</th><th>Замечание</th></tr>'+
  r.items.map(it=>'<tr class="click" onclick="closeModal();openLessonModal(\''+it.lessonId+'\')"><td>'+fmtDate(it.date)+'</td><td>'+(it.cls?e(it.cls.name):'—')+'</td><td>'+e(it.note)+'</td></tr>').join('')+
  '</table></div><div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();openStudentPage('+"'"+sid+"'"+')">Открыть профиль ученика</button><button onclick="closeModal()">Закрыть</button></div>',true);
}
