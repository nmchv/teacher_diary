/* ===================== СТАТИСТИКА ===================== */
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
  '<div class="card"><h2 style="margin-top:0">Мои показатели</h2><div class="mgrid">'+
   mstat(ls.length,'Всего уроков')+mstat(planned,'Не подготовлено')+mstat(partial,'Частично подготовлено')+
   mstat(D.classes.length,'Классов')+mstat(activeStudents,'Учеников')+
   mstat(gradeVals.length,'Оценок выставлено')+mstat(round2(avg(gradeVals)),'Средняя оценка')+
   mstat(absencesCount,'Пропусков')+mstat(attPct===null?'—':Math.round(attPct*10)/10+'%','Посещаемость')+
   mstat(behaviorCount,'Заметок о поведении')+
  '</div></div>'+
  statsAssistantCard()+
   '<div class="card"><h2 style="margin-top:0">Распределение оценок</h2>'+svgBarChart(gradeDistData(distVals,scope,scopeId,r.from,r.to),{width:900,height:380})+'</div>'+
   behaviorLeaderboardCard()+
   statsClassesCard()+studentsLeaderboardCard();
}
function mstat(n,t){return '<div class="mstat"><div class="mv">'+n+'</div><div class="ml">'+t+'</div></div>'}
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
  let sortDir=S.statsFilter.sortDirClasses==='desc'?-1:1;
  let sorters={name:(a,b)=>compareClasses(a.c,b.c)*sortDir,avg:(a,b)=>((a.avgGrade||0)-(b.avgGrade||0))*sortDir,att:(a,b)=>((a.attendancePct||0)-(b.attendancePct||0))*sortDir,lessons:(a,b)=>(a.lessonsCount-b.lessonsCount)*sortDir};
  rows.sort(sorters[sortKey]||sorters.name);
  return '<div class="card"><div class="top"><h2 style="margin:0 0 10px">Статистика по классам</h2><select class="sort-select" onchange="S.statsFilter.sortClasses=this.value;render()">'+
   [['name','По алфавиту'],['avg','По среднему баллу'],['att','По посещаемости'],['lessons','По количеству уроков']].map(o=>'<option value="'+o[0]+'"'+(sortKey===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+
   '<button class="sort-dir-btn" onclick="S.statsFilter.sortDirClasses=S.statsFilter.sortDirClasses===\'asc\'?\'desc\':\'asc\';render()">'+(S.statsFilter.sortDirClasses==='asc'?'↑':'↓')+'</button></div>'+
   (rows.length?'<table class="table stats-classes-table"><tr><th class="click">Класс</th><th>Учеников</th><th>Средняя</th><th>Посещаемость</th><th>Уроков</th><th>Заметок о поведении</th></tr>'+
   rows.map(r=>'<tr class="click" onclick="openClass(\''+r.c.id+'\')"><td><b>'+e(r.c.name)+'</b></td><td>'+r.studentsCount+'</td><td>'+round2(r.avgGrade)+'</td><td>'+(r.attendancePct===null?'—':r.attendancePct+'%')+'</td><td>'+r.lessonsCount+'</td><td>'+r.behaviorCount+'</td></tr>').join('')+'</table>':'<div class="empty">Классов пока нет.</div>')+'</div>';
}
function studentsLeaderboardCard(){
 let f=S.statsFilter,r=periodRange();
 let students=D.students.filter(s=>s.status!=='archived'&&(!f.classId||(s.classIds||[]).some(i=>groupIds(f.classId).includes(i))));
 let rows=students.map(s=>{
  let ls=activeLessons().filter(l=>(s.classIds||[]).includes(l.classId)&&!l.cancelled&&l.date>=r.from&&l.date<=r.to);
  let gv=[];ls.forEach(l=>{let g=(l.grades||{})[s.id];if(g){let n=gradeNumericValue(g.value);if(n!==null)gv.push(n)}});
  let at=0,ap=0;ls.forEach(l=>{let v=(l.attendance||{})[s.id];if(v){at++;if(v!=='н')ap++}});
  return {s,avgGrade:avg(gv),gradesCount:gv.length,attendancePct:at?Math.round(ap/at*1000)/10:null,absences:at-ap,lessonsCount:ls.length};
 }).filter(x=>x.lessonsCount>0);
 if(!rows.length)return '<div class="card"><h2 style="margin-top:0">Рейтинг учеников</h2><div class="muted small">Недостаточно данных для рейтинга.</div></div>';
 let topAll=[...rows].filter(x=>x.avgGrade!==null).sort((a,b)=>(b.avgGrade||0)-(a.avgGrade||0)).slice(0,3);
 let lowAll=[...rows].filter(x=>x.avgGrade!==null).sort((a,b)=>(a.avgGrade||0)-(b.avgGrade||0)).slice(0,3);
 let lowAtt=[...rows].filter(x=>x.attendancePct!==null).sort((a,b)=>(a.attendancePct||0)-(b.attendancePct||0)).slice(0,3);
 let parallels={};
 D.classes.filter(c=>c.type!=='club').forEach(c=>{
  let m=c.name.match(/^(\d+)/);
  if(!m)return;
  let g=m[1];
  if(!parallels[g])parallels[g]=[];
  parallels[g].push(c);
 });
 let parallelCards=[];
 Object.keys(parallels).sort((a,b)=>+a-+b).forEach(g=>{
  let cls=parallels[g];
  let clsIds=cls.map(c=>c.id);
  let brows=rows.filter(x=>(x.s.classIds||[]).some(i=>clsIds.includes(i))&&x.avgGrade!==null);
  if(!brows.length)return;
  let top=[...brows].sort((a,b)=>(b.avgGrade||0)-(a.avgGrade||0)).slice(0,3);
  parallelCards.push(leaderboardCardHtml('Параллель '+g+' — лучшие',top,'avg'));
 });
 return '<div class="card"><div class="top"><h2 style="margin:0 0 10px">Рейтинг учеников</h2></div>'+
   leaderboardCardHtml('Высокие средние баллы (все классы)',topAll,'avg',true)+
   leaderboardCardHtml('Низкие средние баллы',lowAll,'avg',true)+
   leaderboardCardHtml('Низкая посещаемость',lowAtt,'att',true)+
   '<div class="lb-row-wrap">'+parallelCards.join('')+'</div>'+
  '</div>';
}
 function leaderboardCardHtml(title,rows,type,wide){
 if(!rows.length)return '';
 let wc=wide?' lb-card-wide':'';
 let items=rows.map((r,i)=>{
  let val=type==='att'?(r.attendancePct===null?'—':r.attendancePct+'%'):round2(r.avgGrade);
  let sid=r.s.id;
  if(wide){
   return '<div class="lb-row"><div class="lb-pos">'+(i+1)+'</div><div class="lb-name click" onclick="openStudentPage(\''+sid+'\')">'+studentFio(r.s)+'</div><div class="lb-cls">'+e(studentClassNames(r.s))+'</div><div class="lb-val">'+val+'</div></div>'
  }
  return '<div class="lb-row small"><div class="lb-info"><div class="lb-name click" onclick="openStudentPage(\''+sid+'\')">'+studentFio(r.s)+'</div><div class="lb-cls">'+studentRegularClasses(r.s)+'</div></div><div class="lb-val click" onclick="openStudentPage(\''+sid+'\')">'+val+'</div></div>'
 }).join('');
 return '<div class="lb-card'+wc+'"><div class="lb-title">'+title+'</div><div class="lb-list">'+items+'</div></div>';
}
function studentRegularClasses(s){
 let cs=(s.classIds||[]).map(id=>C(id)).filter(Boolean).filter(c=>c.type!=='club');
 return cs.length?cs.map(c=>c.name).join(', '):'—';
}
function openClass(id){S.view='class';S.classId=id;S.tab='lessons';render()}
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
 let top=rows.slice(0,10);
 return   '<div class="card"><div class="top"><h2 style="margin:0 0 10px">🧭 Рейтинг замечаний о поведении</h2><button onclick="showAllBehavior()" class="primary small-btn">Все ученики</button></div>'+
  '<div class="rank-list">'+top.map((r,i)=>
   '<div class="rank-row'+(i<3?' top'+(i+1):'')+'" onclick="showBehaviorDetail(\''+r.s.id+'\')"><div class="rank-pos">'+(i+1)+'</div><div class="rank-avatar">'+e(studentInitials(r.s))+'</div><div><div class="rank-name">'+studentFio(r.s)+'</div><div class="rank-sub">'+e(studentClassNames(r.s))+'</div></div><div class="rank-count">'+r.count+'</div></div>'
  ).join('')+
  '</div></div>';
 }
function showAllBehavior(){
 let rows=behaviorLeaderboardData();
 setModalHtml('Все ученики с замечаниями о поведении',
  '<div class="muted small" style="margin-bottom:10px">Всего за выбранный период: <b>'+rows.length+'</b> учеников</div>'+
  '<div style="overflow:auto"><table class="table"><tr><th>Ученик</th><th>Класс</th><th>Кол-во замечаний</th></tr>'+
  rows.map(r=>'<tr class="click" onclick="closeModal();showBehaviorDetail(\''+r.s.id+'\')"><td>'+studentFio(r.s)+'</td><td>'+e(studentClassNames(r.s))+'</td><td>'+r.count+'</td></tr>').join('')+
  '</table></div><div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);
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

