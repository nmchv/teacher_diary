function searchPage(){
 let q=(S.q||'').toLowerCase();
 return '<div class="top"><div><h1>Поиск</h1><div class="muted">Ученики, уроки и материалы одновременно</div></div></div>'+
  '<div class="card"><input autofocus value="'+e(S.q)+'" oninput="S.q=this.value;renderSearchResults()" placeholder="ФИО, тема, план, заметка, файл..."></div>'+
  '<div id="results">'+searchResults(q)+'</div>';
}
function renderSearchResults(){document.getElementById('results').innerHTML=searchResults((S.q||'').toLowerCase())}
function searchResults(q){
 if(!q)return '<div class="card empty">Введите запрос для поиска.</div>';
 let ps=sortStudentsList(D.students.filter(s=>(s.lastName+' '+s.firstName+' '+s.middleName+' '+Object.values(s.customFields||{}).join(' ')).toLowerCase().includes(q)),S.studentSort);
 let ls=activeLessons().filter(l=>(l.topic+' '+Object.values(l.customFields||{}).join(' ')).toLowerCase().includes(q));
 let ms=D.materials.filter(m=>(m.filename+' '+(m.category||'')).toLowerCase().includes(q));
 let mts=D.meetings.filter(m=>(m.title+' '+(m.location||'')+' '+(m.participants||'')+' '+(m.agenda||'')).toLowerCase().includes(q));
 let wts=D.workTasks.filter(t=>(t.title+' '+(t.notes||'')).toLowerCase().includes(q));
 let cls=D.colleagues.filter(c=>(c.lastName+' '+c.firstName+' '+(c.middleName||'')+' '+Object.values(c.customFields||{}).join(' ')).toLowerCase().includes(q));
 return '<div class="card"><h2>Ученики ('+ps.length+')</h2>'+(ps.length?ps.map(s=>'<p class="click" onclick="openStudentPage(\''+s.id+'\')">'+studentFio(s)+' · '+e(studentClassNames(s))+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Уроки ('+ls.length+')</h2>'+(ls.length?ls.map(l=>'<p class="click" onclick="openLessonModal(\''+l.id+'\')">'+fmtDate(l.date)+' · '+e(C(l.classId)?.name||'—')+' · '+e(l.topic||'(без темы)')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Материалы ('+ms.length+')</h2>'+(ms.length?ms.map(m=>'<p>'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">('+e(m.category||'')+')</span> <button onclick="openMaterial(\''+m.id+'\')">Открыть</button></p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Совещания ('+mts.length+')</h2>'+(mts.length?mts.map(m=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'meetings\';render();setTimeout(()=>openEditMeeting(\''+m.id+'\'),0)">'+fmtDate(m.date)+' · '+e(m.title)+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Рабочие задачи ('+wts.length+')</h2>'+(wts.length?wts.map(t=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'tasks\';render();setTimeout(()=>openEditWorkTask(\''+t.id+'\'),0)">'+e(t.title)+(t.dueDate?' · срок: '+fmtDate(t.dueDate):'')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>'+
  '<div class="card"><h2>Коллеги ('+cls.length+')</h2>'+(cls.length?cls.map(c=>'<p class="click" onclick="S.view=\'work\';S.workTab=\'colleagues\';render();setTimeout(()=>openColleagueCard(\''+c.id+'\'),0)">'+colleagueFio(c)+(colleagueField(c,'position')?' · '+e(colleagueField(c,'position')):'')+'</p>').join(''):'<div class="muted small">Ничего не найдено.</div>')+'</div>';
}
