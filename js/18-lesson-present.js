/* ===================== РЕЖИМ «ТЕКУЩИЙ УРОК» ===================== */
function fmtPresentClock(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0')}
function startLessonPresent(id){
 closeModal();
 S.lessonPresentId=id;
 renderPresentMode();
 let aw=document.getElementById('assistant-wrap');if(aw)aw.style.display='none';
 let at=document.getElementById('assistant-toggle');if(at)at.style.display='none';
}
function closeLessonPresent(){
 S.lessonPresentId=null;
 if(window._presentInterval){clearInterval(window._presentInterval);window._presentInterval=null}
 document.getElementById('present').innerHTML='';
 let aw=document.getElementById('assistant-wrap');if(aw)aw.style.display='';
 let at=document.getElementById('assistant-toggle');if(at)at.style.display='';
}
function whoGradeCounts(g){return !!g&&(gradeNumericValue(g.value)!==null||(g.points!=null&&g.points!==''))}
function studentGradedLessonsForClass(sid,classId){
 return groupLessons(classId).filter(l=>!l.cancelled&&whoGradeCounts((l.grades||{})[sid])).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
}
function studentGradesCountForClass(sid,classId){return studentGradedLessonsForClass(sid,classId).length}
function widgetWhoToAsk(cls,lessonId){
 let l0=L(lessonId);
 let all=l0?presentEligiblePeople(l0):attendablePeople(cls.id);
 if(!all.length)return'';
 let done=x=>l0&&(((l0.grades||{})[x.id])||((l0.asked||{})[x.id]));
 let ps=all.filter(x=>!done(x));
 if(!ps.length)return '<div class="card"><h3 style="margin-top:0">Кого спросить сегодня</h3><div class="muted small">Все присутствующие уже спрошены на этом уроке ✓</div></div>';
 let withData=ps.map(s=>{let g=studentGradedLessonsForClass(s.id,cls.id);let last=g.length?g[g.length-1]:null;return {s:s,gradesCount:g.length,lastAsked:last?last.date:'0000-01-01'}});
 let byGrades=[...withData].sort((a,b)=>a.gradesCount-b.gradesCount||a.lastAsked.localeCompare(b.lastAsked));
 let reqA=byGrades[0];
 let byAsked=[...withData].filter(x=>x.s.id!==reqA.s.id).sort((a,b)=>a.lastAsked.localeCompare(b.lastAsked)||a.gradesCount-b.gradesCount);
 let reqB=byAsked.length?byAsked[0]:null;
 let rest=withData.filter(x=>x.s.id!==reqA.s.id&&(!reqB||x.s.id!==reqB.s.id));
 S.askRandom=S.askRandom||{};
 let randomPick=rest.find(x=>x.s.id===S.askRandom[lessonId])||null;
 if(!randomPick&&rest.length){randomPick=rest[Math.floor(Math.random()*rest.length)];S.askRandom[lessonId]=randomPick.s.id}
 if(!randomPick)delete S.askRandom[lessonId];
 function statsHtml(sid){
  let qs=D.settings.quarters||[],today=toISO(new Date());
  let q=qs.find(x=>x.startDate<=today&&today<=x.endDate);
  let lessons=studentGradedLessonsForClass(sid,cls.id);
  if(q)lessons=lessons.filter(l=>l.date>=q.startDate&&l.date<=q.endDate);
  let vals=lessons.map(l=>gradeNumericValue((l.grades||{})[sid].value)).filter(v=>v!==null);
  let avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2).replace('.',','):'—';
  let last=lessons.slice(-3).map(x=>{let v=(x.grades||{})[sid];return e(v&&v.value!==''&&v.value!=null?v.value:gradePointsText(v));}).join(', ');
  return'<span class="wta-left">'+'<span class="wta-count muted small">Оценок: '+lessons.length+'</span>'+(avg!=='—'?'<span class="wta-avg muted small">· Ср. балл: '+avg+'</span>':'')+'</span>'+(last?'<span class="wta-recent muted small">· Последние: '+last+'</span>':'');
 }
 function studentRow(item,label,canReroll){
  if(!item)return'';
  let sid=item.s.id;
  let args='\''+sid+'\',\''+lessonId+'\'';
  let rerollBtn=canReroll?'<button class="wta-reroll" title="Сменить ученика" onclick="S.askRandom[\''+lessonId+'\']=null;renderPresentMode()">↻ Сменить</button>':'';
  return '<div class="wta-student"><div class="wta-head"><span class="wta-name" title="'+e(studentFioShort(item.s))+'">'+e(studentFioShort(item.s))+'</span><span class="wta-label muted small">· '+label+'</span></div><div class="wta-stats">'+statsHtml(sid)+'</div><div class="wta-form">'+gradeInputHtml('wa-g-'+sid,'')+'<input id="wa-c-'+sid+'" placeholder="Комментарий…" style="flex:1;min-width:160px" onkeydown="if(event.key===\'Enter\')saveWhoGrade('+args+')"></div><div class="wta-actions"><button class="wta-save" onclick="saveWhoGrade('+args+')">✓ Выставить</button><button class="wta-ask" title="Спросил(а), без оценки" onclick="markWhoAsked('+args+')">Без оценки</button>'+rerollBtn+'</div></div>';
 }
 return '<div class="card"><h3 style="margin-top:0">Кого спросить сегодня</h3>'+
  studentRow(reqA,'меньше всего оценок')+
  (reqB?studentRow(reqB,reqB.lastAsked!=='0000-01-01'?'давно не спрашивали ('+fmtDate(reqB.lastAsked).slice(0,5)+')':'давно не спрашивали (без оценок)'):'')+
  (randomPick?studentRow(randomPick,'случайный вариант',true):'')+
  '</div>';
}
function saveWhoGrade(sid,lessonId){
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий.');renderPresentMode();return}
 let val=(document.getElementById('wa-g-'+sid)||{}).value;val=(val||'').trim();
 let comment=((document.getElementById('wa-c-'+sid)||{}).value||'').trim();
 if(!val){alert('Выберите или впишите оценку.');return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,'','');
 let st=P(sid);if(st)st.lastAskedAt=toISO(new Date());
 save();renderPresentMode();
}
function markWhoAsked(sid,lessonId){
 let l=L(lessonId);if(!l)return;
 l.asked=l.asked||{};l.asked[sid]=true;
 let st=P(sid);if(st)st.lastAskedAt=toISO(new Date());
 save();renderPresentMode();
}
function markAsked(sid){
 let s=P(sid);if(s){s.lastAskedAt=toISO(new Date());save();renderPresentMode()}
}
function openQuickGradePopup(sid,lessonId){
 let s=P(sid);if(!s)return;
 let old=document.getElementById('quick-grade-popup');if(old)old.remove();
 let l=L(lessonId);
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий на этом уроке.');return}
 let cur=l&&(l.grades||{})[sid];
 let popup=document.createElement('div');
 popup.id='quick-grade-popup';
 popup.className='modalbg';
 popup.style.zIndex='75';
 popup.innerHTML='<div class="modal" style="max-width:380px"><div class="top"><h2>'+presentName(s)+'</h2><button class="closebtn" onclick="closeQuickGradePopup()">×</button></div>'+
  '<label>Оценка (можно выбрать или вписать своё число)</label>'+gradeInputHtml('qg-grade',cur?cur.value:'')+
  '<label>Баллы (необязательно)</label><div class="row"><input id="qg-points" inputmode="decimal" placeholder="баллы" value="'+(cur&&cur.points!=null?e(fmtPts(cur.points)):'')+'" style="width:100px"><span>из</span><input id="qg-max" inputmode="decimal" placeholder="макс." value="'+e(cur&&cur.max?fmtPts(cur.max):(l&&l.gradeMax?fmtPts(l.gradeMax):''))+'" style="width:100px"></div>'+
  '<label>Комментарий</label><input id="qg-comment" value="'+(cur?e(cur.comment||''):'')+'" placeholder="Необязательно">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveQuickGrade(\''+sid+'\',\''+lessonId+'\')">Сохранить оценку</button></div>'+
  '<div class="toolbar" style="margin-top:6px"><button onclick="markAskedFromPopup(\''+sid+'\')">Просто отметить (без оценки)</button><button onclick="closeQuickGradePopup()">Отмена</button></div>'+
  '</div>';
 document.body.appendChild(popup);
 popup.onclick=function(ev){if(ev.target===popup)closeQuickGradePopup()};
}
function closeQuickGradePopup(){let el=document.getElementById('quick-grade-popup');if(el)el.remove()}
function saveQuickGrade(sid,lessonId){
 let gradeEl=document.getElementById('qg-grade');
 let val=gradeEl.value;
 let pts=document.getElementById('qg-points').value,mx=document.getElementById('qg-max').value;
 if(!val&&parsePts(pts)===null){alert('Выберите оценку или укажите баллы.');return}
 let comment=document.getElementById('qg-comment').value.trim();
 let l=L(lessonId);
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий — оценку поставить нельзя.');closeQuickGradePopup();renderPresentMode();return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,pts,mx);
 if(!l.gradeMax&&parsePts(mx)&&parsePts(pts)!==null)l.gradeMax=parsePts(mx);
 let s=P(sid);if(s)s.lastAskedAt=toISO(new Date());
 save();
 closeQuickGradePopup();
 renderPresentMode();
}
function markAskedFromPopup(sid){
 let s=P(sid);if(s){s.lastAskedAt=toISO(new Date())}
 if(S.lessonPresentId){let l=L(S.lessonPresentId);if(l){l.asked=l.asked||{};l.asked[sid]=true}}
 save();
 closeQuickGradePopup();
 renderPresentMode();
}
function presentEligiblePeople(l){return attendablePeople(l.classId).filter(s=>(l.attendance||{})[s.id]!=='н')}
function presentGradeForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 return '<div class="card pga-card"><h3 style="margin-top:0">Выставить оценку</h3>'+
  '<div class="pga-row"><label class="pga-label">Ученик</label><select id="pg-student">'+ps.map(s=>'<option value="'+s.id+'">'+e(presentNamePlain(s))+((l.grades||{})[s.id]?' — уже: '+gradeText(l.grades[s.id]):'')+'</option>').join('')+'</select></div>'+
  '<div class="pga-row"><label class="pga-label">Оценка</label><div class="pga-grade-wrap">'+gradeInputHtml('pg-grade','')+'<div class="pga-points"><input id="pg-points" inputmode="decimal" placeholder="баллы" style="width:80px"><span>из</span><input id="pg-max" inputmode="decimal" placeholder="макс." value="'+e(l.gradeMax?fmtPts(l.gradeMax):'')+'" style="width:80px"></div></div></div>'+
  '<div class="pga-row"><label class="pga-label">Комментарий</label><input id="pg-comment" placeholder="Необязательно"></div>'+
  '<div class="pga-toolbar"><button class="pga-save" onclick="savePresentGrade(\''+l.id+'\')">Сохранить оценку</button></div>'+
  '</div>';
}
function presentAttendanceForm(l){
 let ps=attendablePeople(l.classId);
 if(!ps.length)return'';
 let att=l.attendance||{};
 return '<div class="card"><h3 style="margin-top:0">Посещаемость</h3><div class="checks">'+ps.map(s=>{let v=att[s.id]||'+';return '<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+'</span><button type="button" class="attbtn '+(v==='н'?'absent':'present')+'" onclick="togglePresentAttendance(\''+l.id+'\',\''+s.id+'\',this)">'+v+'</button></div>'}).join('')+'</div></div>';
}
function togglePresentAttendance(lessonId,sid,btn){
 let l=L(lessonId);if(!l)return;
 l.attendance=l.attendance||{};
 let cur=l.attendance[sid]||'+';
 let nv=cur==='н'?'+':'н';
 if(nv==='н'){
  let hasGrade=!!(l.grades&&l.grades[sid]),hasNote=!!(l.behaviorNotes&&l.behaviorNotes[sid]);
  if(hasGrade||hasNote){
   let st=P(sid);
   if(!confirm((st?presentNamePlain(st):'Ученик')+': на этом уроке уже есть '+(hasGrade&&hasNote?'оценка и замечание':hasGrade?'оценка':'замечание')+'. Отметить отсутствие и удалить их?'))return;
   if(hasGrade)delete l.grades[sid];
   if(hasNote)delete l.behaviorNotes[sid];
  }
 }
 l.attendance[sid]=nv;
 save();
 if(btn){btn.textContent=nv;btn.className='attbtn '+(nv==='н'?'absent':'present');}
}
function getStudentPoints(sid,classId){let s=P(sid);return (s&&s.pointsByClass&&s.pointsByClass[classId])||0}
function addStudentPoint(sid,classId,delta){
 let s=P(sid);if(!s)return;
 s.pointsByClass=s.pointsByClass||{};
 s.pointsByClass[classId]=Math.max(0,(s.pointsByClass[classId]||0)+delta);
 save();
}
function presentPointsForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 let threshold=D.settings.pointsThreshold||5;
 let hint='За короткие ответы, которых недостаточно для оценки. Обмен на оценку доступен от '+threshold+' баллов (порог настраивается в Настройках → Внешний вид).';
 return '<div class="card"><h3 style="margin-top:0">Накопительные баллы <span class="muted small" style="font-weight:400;cursor:help" title="'+hint.replace(/"/g,'&quot;')+'">ⓘ</span></h3><div class="checks">'+
  ps.map(s=>{let pts=getStudentPoints(s.id,l.classId);return '<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+' <span class="badge">'+pts+' б.</span></span><span class="toolbar" style="flex:0;gap:4px"><button class="ptbtn" onclick="addStudentPoint(\''+s.id+'\',\''+l.classId+'\',1);renderPresentMode()">+1</button><button class="ptbtn" onclick="addStudentPoint(\''+s.id+'\',\''+l.classId+'\',-1);renderPresentMode()">−1</button>'+(pts>=threshold?'<button class="ptbtn primary" title="Обменять на оценку" onclick="exchangePointsForGrade(\''+s.id+'\',\''+l.classId+'\',\''+l.id+'\')">Обменять</button>':'')+'</span></div>'}).join('')+
  '</div></div>';
}
function setBehaviorNote(lessonId,sid,val){
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){renderPresentMode();return}
 l.behaviorNotes=l.behaviorNotes||{};
 val=val.trim();
 if(val)l.behaviorNotes[sid]=val;else delete l.behaviorNotes[sid];
 save();
}
function presentBehaviorForm(l){
 let ps=presentEligiblePeople(l);
 if(!ps.length)return'';
 let notes=l.behaviorNotes||{};
 return '<div class="card"><h3 style="margin-top:0">Заметки о поведении <span class="muted small" style="font-weight:400;cursor:help" title="Не влияет на средний балл — просто заметка, не оценка">ⓘ</span></h3><div class="checks">'+
  ps.map(s=>'<div class="attrow"><span title="'+e(studentFioPlain(s))+'">'+presentName(s)+'</span><input type="text" value="'+e(notes[s.id]||'')+'" placeholder="Заметка…" style="max-width:190px" onchange="setBehaviorNote(\''+l.id+'\',\''+s.id+'\',this.value)"></div>').join('')+
  '</div></div>';
}
function exchangePointsForGrade(sid,classId,lessonId){
 let threshold=D.settings.pointsThreshold||5;
 let pts=getStudentPoints(sid,classId);
 if(pts<threshold){alert('Недостаточно баллов: нужно '+threshold+', сейчас '+pts+'.');return}
 let val=prompt('Какую оценку поставить за накопленные баллы?','5');
 if(!val)return;
 let l=L(lessonId);if(!l)return;
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий на этом уроке.');return}
 l.grades=l.grades||{};
 l.grades[sid]={value:val.trim(),comment:'Обмен накопленных баллов ('+threshold+' б.)'};
 addStudentPoint(sid,classId,-threshold);
 save();
 renderPresentMode();
}
function savePresentGrade(lessonId){
 let l=L(lessonId);if(!l)return;
 let sidEl=document.getElementById('pg-student'),gradeEl=document.getElementById('pg-grade');
 if(!sidEl||!gradeEl)return;
 let sid=sidEl.value,val=gradeEl.value;
 let pts=document.getElementById('pg-points').value,mx=document.getElementById('pg-max').value;
 if(!val&&parsePts(pts)===null){alert('Выберите оценку или укажите баллы.');return}
 let comment=document.getElementById('pg-comment').value.trim();
 if(isAbsentOnLesson(l,sid)){alert('Ученик отмечен как отсутствующий — оценку поставить нельзя.');renderPresentMode();return}
 l.grades=l.grades||{};
 l.grades[sid]=buildGrade(val,comment,pts,mx);
 if(!l.gradeMax&&parsePts(mx)&&parsePts(pts)!==null)l.gradeMax=parsePts(mx);
 let s=P(sid);if(s)s.lastAskedAt=toISO(new Date());
 save();
 renderPresentMode();
}
function lessonTimeInfo(l,now){
 let st=l.startTime,et=l.endTime;
 if((!st||!et)&&l.lessonNumber){let t=timeFor(l.lessonNumber);st=st||t.start;et=et||t.end}
 let startMin=timeToMin(st),endMin=timeToMin(et);
 if(startMin===null||endMin===null)return null;
 let nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
 return{startMin,endMin,elapsed:nowMin-startMin,remaining:endMin-nowMin};
}
function fmtMinutes(n){return Math.max(0,Math.round(n))}
function minToTimeStr(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0')}
function presentTimeInfoText(l){
 let info=lessonTimeInfo(l,new Date());
 if(!info)return 'Время урока не задано';
 let range=minToTimeStr(info.startMin)+'–'+minToTimeStr(info.endMin);
 if(info.elapsed<0)return range+' · до начала: '+fmtMinutes(-info.elapsed)+' мин';
 if(info.remaining>0)return range+' · прошло: '+fmtMinutes(info.elapsed)+' мин · осталось: '+fmtMinutes(info.remaining)+' мин';
 return range+' · урок завершён '+fmtMinutes(-info.remaining)+' мин назад';
}
const PRESENT_BLOCKS={
 plan:{label:'План урока'},
 extra:{label:'Доп. поля урока'},
 homework:{label:'Домашнее задание'},
 whoToAsk:{label:'Кого спросить'},
 grade:{label:'Оценки'},
 attendance:{label:'Посещаемость'},
 points:{label:'Баллы'},
 behavior:{label:'Заметки о поведении'},
 seating:{label:'Рассадка'}
};
function presentBlockHtml(key,l,cls,extra){
 switch(key){
  case 'plan':return lessonField(l,'planText')?'<div class="card"><h3 style="margin-top:0">'+fLabel('lesson','planText','План урока')+'</h3><div class="val">'+richTextView(lessonField(l,'planText'))+'</div></div>':'<div class="card muted small">План урока не заполнен.</div>';
  case 'extra':return extra?'<div class="card">'+extra+'</div>':'';
  case 'homework':return lessonField(l,'homework')?'<div class="card"><h3 style="margin-top:0">'+fLabel('lesson','homework','Домашнее задание')+'</h3><div class="val">'+richTextView(lessonField(l,'homework'))+'</div></div>':'';
  case 'whoToAsk':return cls?widgetWhoToAsk(cls,l.id):'';
  case 'grade':return cls?presentGradeForm(l):'';
  case 'attendance':return cls?presentAttendanceForm(l):'';
  case 'points':return cls?presentPointsForm(l):'';
  case 'behavior':return cls?presentBehaviorForm(l):'';
  case 'seating':return cls&&cls.seating?'<div class="card present-seat"><h3 style="margin-top:0">Рассадка · '+e(cls.name)+'</h3>'+seatingGridHtml(cls,false,l.attendance||{})+'</div>':'<div class="card muted small">Рассадка для этого класса не настроена.</div>';
  default:return'';
 }
}
function presentLayoutKey(kind){return kind==='club'?'presentLayoutClub':'presentLayout'}
function openPresentLayoutConfig(kind){
 if(!kind){
  let l=S.lessonPresentId?L(S.lessonPresentId):null;
  let cls=l?C(l.classId):null;
  kind=(cls&&cls.type==='club')?'club':'lesson';
 }
 let layout=D.settings[presentLayoutKey(kind)];
 let colHtml=(arr,side)=>arr.map((k,i)=>{let meta=PRESENT_BLOCKS[k];if(!meta)return'';return '<div class="fieldrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="movePresentBlock(\''+kind+'\',\''+side+'\','+i+',-1)">↑</button><button '+(i===arr.length-1?'disabled':'')+' onclick="movePresentBlock(\''+kind+'\',\''+side+'\','+i+',1)">↓</button></span><span class="fname">'+e(meta.label)+'</span><button onclick="movePresentBlockSide(\''+kind+'\',\''+side+'\','+i+')">'+(side==='left'?'→ в правую колонку':'← в левую колонку')+'</button></div>'}).join('');
 setModalHtml('Настроить режим урока',
  '<div class="tabs" style="margin-bottom:10px"><button class="'+(kind==='lesson'?'active':'')+'" onclick="openPresentLayoutConfig(\'lesson\')">Для уроков</button><button class="'+(kind==='club'?'active':'')+'" onclick="openPresentLayoutConfig(\'club\')">Для кружков</button></div>'+
  '<div class="muted small" style="margin-bottom:10px">Расположите блоки в удобном порядке — как конструктор. Слева — широкая колонка, справа — узкая. У уроков и у кружков — свои отдельные наборы.</div>'+
  '<h3 style="margin:6px 0">Левая колонка (широкая)</h3>'+(colHtml(layout.left,'left')||'<div class="muted small">Пусто.</div>')+
  '<h3 style="margin:14px 0 6px">Правая колонка (узкая)</h3>'+(colHtml(layout.right,'right')||'<div class="muted small">Пусто.</div>')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();renderPresentMode()">Готово</button></div>');
}
function movePresentBlock(kind,side,i,dir){
 let arr=D.settings[presentLayoutKey(kind)][side];let j=i+dir;if(j<0||j>=arr.length)return;
 [arr[i],arr[j]]=[arr[j],arr[i]];save();openPresentLayoutConfig(kind);
}
function movePresentBlockSide(kind,side,i){
 let layout=D.settings[presentLayoutKey(kind)];
 let other=side==='left'?'right':'left';
 let [item]=layout[side].splice(i,1);
 layout[other].push(item);
 save();openPresentLayoutConfig(kind);
}
function presentReminderHtml(l){
 let info=lessonTimeInfo(l,new Date());
 if(info&&info.remaining>0&&info.remaining<=5)return '⏰ До конца урока осталось '+fmtMinutes(info.remaining)+' мин.!';
 return '';
}
