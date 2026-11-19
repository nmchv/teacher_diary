/* ===================== МОДАЛЬНОЕ ОКНО УРОКА ===================== */
function openLessonModal(id){S.lessonModal={id,mode:'view',draft:null};renderModalOnly()}
function quickCreateLesson(date,n){
 if(!D.classes.length){alert('Сначала создайте класс.');return}
 if(!checkNotBlocked(date,n))return;
 openQuickPicker(date,n);
}
function openQuickPicker(date,n){
 let t=timeFor(n);
 let opts=sortedClasses(D.classes.filter(c=>c.type!=='club')).map(c=>'<option value="'+c.id+'">'+e(c.name)+'</option>').join('');
 setModalHtml('Новый урок','<div class="notice">'+fmtDate(date)+' · '+DAY_NAMES[dayIndexOfDate(date)]+' · '+n+'-й урок ('+t.start+'–'+t.end+')</div>'+
  (opts?'<label>Класс</label><select id="qc-class">'+opts+'</select>':'<div class="notice">У вас нет классов (кружки создаются через «＋ Новый урок» — у них свободное время, не привязанное к сетке).</div>')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="quickCreateConfirm(\''+date+'\','+n+')" '+(opts?'':'disabled')+'>Создать</button><button onclick="closeModal()">Отмена</button></div>');
}
function quickCreateConfirm(date,n){
 let classId=document.getElementById('qc-class').value;
 let t=timeFor(n);
 let l={id:uid(),date,lessonNumber:n,startTime:t.start,endTime:t.end,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]};
 D.lessons.push(l);save();closeModal();openLessonModal(l.id);
}
function openNewLesson(presetClassId){
 if(!D.classes.length){alert('Сначала создайте класс.');return}
 let today=toISO(new Date());
 let selClass=presetClassId?C(presetClassId):D.classes[0];
 let isClub=selClass&&selClass.type==='club';
 setModalHtml('Новый урок',
  '<label>Дата</label><input id="nl-date" type="date" value="'+today+'">'+
  '<label>Класс</label><select id="nl-class" onchange="toggleNewLessonFields()">'+classOptionsHtml(presetClassId)+'</select>'+
  '<div id="nl-period-block" style="display:'+(isClub?'none':'block')+'">'+
   '<label>№ урока</label><select id="nl-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'">'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select>'+
   '<label>Время (можно изменить)</label><div class="row"><input id="nl-start" value="'+LESSON_TIMES[0].start+'"><input id="nl-end" value="'+LESSON_TIMES[0].end+'"></div>'+
  '</div>'+
  '<div id="nl-freetime-block" style="display:'+(isClub?'block':'none')+'">'+
   '<div class="notice">Это кружок/секция — время не привязано к сетке уроков.</div>'+
   '<label>Время начала</label><input id="nl-free-start" placeholder="15:00">'+
   '<label>Время окончания</label><input id="nl-free-end" placeholder="16:00">'+
  '</div>'+
  '<label>Тема (необязательно)</label><input id="nl-topic">'+
  '<label>План урока</label><textarea id="nl-plan" class="autosize"></textarea>'+
  '<label>Запланированные этапы</label><textarea id="nl-stages" class="autosize"></textarea>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="createLessonFull()">Создать</button><button onclick="closeModal()">Отмена</button></div>');
 document.getElementById('nl-num').onchange=e2=>{let t=timeFor(e2.target.value);document.getElementById('nl-start').value=t.start;document.getElementById('nl-end').value=t.end};
 initAutosize();
}
function toggleNewLessonFields(){
 let cid=document.getElementById('nl-class').value;
 let cls=C(cid);
 let isClub=cls&&cls.type==='club';
 document.getElementById('nl-period-block').style.display=isClub?'none':'block';
 document.getElementById('nl-freetime-block').style.display=isClub?'block':'none';
}
function createLessonFull(){
 let date=document.getElementById('nl-date').value,classId=document.getElementById('nl-class').value;
 if(!date||!classId){alert('Заполните дату и класс.');return}
 let cls=C(classId);
 let isClub=cls&&cls.type==='club';
 let lessonNumber=null,startTime='',endTime='';
 if(isClub){
  startTime=document.getElementById('nl-free-start').value.trim();
  endTime=document.getElementById('nl-free-end').value.trim();
  if(!startTime){alert('Укажите время начала.');return}
  if(!checkNotBlocked(date,null))return;
 }else{
  let num=document.getElementById('nl-num').value;
  if(!num){alert('Укажите номер урока.');return}
  if(!checkNotBlocked(date,num))return;
  lessonNumber=+num;
  startTime=document.getElementById('nl-start').value;endTime=document.getElementById('nl-end').value;
 }
 let l={id:uid(),date,lessonNumber,startTime,endTime,
  classId,topic:document.getElementById('nl-topic').value.trim(),
  customFields:{planText:document.getElementById('nl-plan').value,stages:document.getElementById('nl-stages').value},
  attendance:{},grades:{},materialIds:[]};
 D.lessons.push(l);save();closeModal();openLessonModal(l.id);
}
function setModalHtml(title,body,wide){
 document.getElementById('modal').innerHTML='<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal'+(wide?' wide':'')+'"><div class="top"><h2>'+title+'</h2><button class="closebtn" onclick="closeModal()">×</button></div>'+body+'</div></div>';
}
function closeModal(){S.lessonModal=null;document.getElementById('modal').innerHTML=''}
function renderModalOnly(){
 document.getElementById('modal').innerHTML='';
 renderLessonModal();
}
function renderLessonModal(){
 if(!S.lessonModal)return;
 let l=L(S.lessonModal.id);
 if(!l){S.lessonModal=null;return}
 let cls=C(l.classId);
 let title=e(l.topic||'Урок без темы');
 let sub=e(cls?cls.name:'—')+' · '+fmtDate(l.date)+(l.lessonNumber?' · '+l.lessonNumber+'-й урок':'')+(l.startTime?' · '+l.startTime+'–'+l.endTime:'');
 let body=S.lessonModal.mode==='edit'?lessonEditBody(l):lessonViewBody(l);
 document.getElementById('modal').innerHTML='<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal wide">'+
  '<div class="top"><div><h2>'+title+'</h2><div class="muted small">'+sub+'</div></div><button class="closebtn" onclick="closeModal()">×</button></div>'+
  body+'</div></div>';
 initAutosize();
}
function lessonField(l,key){return (l.customFields&&l.customFields[key])||''}
function fLabel(entity,key,fallback){let f=fieldByKey(entity,key);return f?e(f.label):fallback}
function lessonViewBody(l){
 let st=lessonStatus(l);
 let ps=people(l.classId);
 let att=l.attendance||{},grades=l.grades||{};
 let hasAttendance=Object.keys(att).length>0;
 let occurred=lessonHasOccurred(l);
 let prep=section(fLabel('lesson','planText','План урока'),lessonField(l,'planText'))+section(fLabel('lesson','stages','Запланированные этапы'),lessonField(l,'stages'));
 let attHtml=(hasAttendance||occurred)?'<div class="checks">'+ps.map(s=>{let v=att[s.id];if(v===undefined){if(!occurred)return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge">—</span></div>';v='+'}return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge '+(v==='н'?'red':'green')+'">'+v+'</span></div>'}).join('')+'</div>':'<div class="muted small">Посещаемость ещё не отмечена.</div>';
 let gradesHtml=Object.keys(grades).length?'<table class="table">'+ps.filter(s=>grades[s.id]).map(s=>'<tr><td>'+studentFio(s)+'</td><td>'+gradeViewHtml(grades[s.id])+'</td><td class="muted">'+e(grades[s.id].comment||'')+'</td></tr>').join('')+'</table>':'<div class="muted small">Оценок пока нет.</div>';
 let behaviorNotes=l.behaviorNotes||{};
 let behaviorViewHtml=Object.keys(behaviorNotes).length?'<table class="table">'+ps.filter(s=>behaviorNotes[s.id]).map(s=>'<tr><td>'+studentFio(s)+'</td><td>'+e(behaviorNotes[s.id])+'</td></tr>').join('')+'</table>':'<div class="muted small">Заметок о поведении пока нет.</div>';
 let homeworkVal=lessonField(l,'homework');
 let results=section(fLabel('lesson','doneWhat','Что успели'),lessonField(l,'doneWhat'))+
  section(fLabel('lesson','notDone','Что не успели'),lessonField(l,'notDone'))+
  section(fLabel('lesson','workedWell','Что сработало лучше'),lessonField(l,'workedWell'))+
  section(fLabel('lesson','difficult','Что было сложным'),lessonField(l,'difficult'))+
  section(fLabel('lesson','notes','Заметки'),lessonField(l,'notes'))+
  extraLessonFieldsView(l);
 return '<div style="margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+statusBadge(l)+lessonStatusPicker(l)+(l.flagPractice?' <span class="badge blue">🧪 Практическая работа</span>':'')+(l.flagTest?' <span class="badge red">📝 Контрольная/проверочная</span>':'')+'</div>'+
  (l.announcementText?'<div class="notice" style="background:#eef2ff;border-color:#5b6fe6;color:#2a3499;font-weight:600;margin-bottom:10px">📣 '+richTextView(l.announcementText)+'</div>':'')+
  '<div class="field-view">'+
  (prep?detailsBlock('Подготовка к уроку',prep,false):'')+
  (homeworkVal?detailsBlock(fLabel('lesson','homework','Домашнее задание'),richTextView(homeworkVal),true):'')+
  detailsBlock('Посещаемость',attHtml,false)+
  detailsBlock('Оценки',gradesHtml,false)+
  detailsBlock('Заметки о поведении',behaviorViewHtml,false)+
  (results?detailsBlock('Итоги урока',results,false):'')+
  detailsBlock('Материалы',lessonMaterialsView(l),false)+
  '</div>'+
  '<div class="toolbar" style="margin-top:16px"><button onclick="startLessonPresent(\''+l.id+'\')">▶ Начать урок</button><button onclick="startEditLesson()">Редактировать</button><button onclick="openPrintLessonOptions(\''+l.id+'\')">🖨 Печать</button><button onclick="copyLessonResultsText(\''+l.id+'\')">📋 Копировать результаты</button><button onclick="openDuplicateLesson(\''+l.id+'\')">⧉ Дублировать</button>'+(l.cancelled?'<button onclick="restoreCancelledLesson(\''+l.id+'\')">↩ Урок всё же состоялся</button>':'<button onclick="cancelLesson(\''+l.id+'\')">🚫 Урок отменён</button>')+'<button class="danger" onclick="archiveLessonConfirm(\''+l.id+'\')">🗄 Архивировать урок</button></div>';
}
function sCard(title,bodyHtml,open,sub){
 return '<details class="card collapsible"'+(open?' open':'')+'><summary><h2>'+title+(sub?'<span class="sc-sub">'+sub+'</span>':'')+'</h2></summary><div class="cbody">'+bodyHtml+'</div></details>';
}
function detailsBlock(label,contentHtml,open){
 if(!contentHtml)return'';
 return '<details class="dblock"'+(open?' open':'')+'><summary>'+e(label)+'</summary><div class="dbody">'+contentHtml+'</div></details>';
}
function section(label,val){if(!val)return'';return '<h3>'+label+'</h3><div class="val">'+richTextView(val)+'</div>'}
const LESSON_KNOWN_KEYS=['planText','stages','homework','doneWhat','notDone','workedWell','difficult','notes'];
function extraLessonFieldsView(l){
 let extra=D.settings.fields.lesson.filter(f=>f.visible&&!LESSON_KNOWN_KEYS.includes(f.key));
 return extra.map(f=>section(e(f.label),customFieldView(f,lessonField(l,f.key)))).join('');
}
function lessonMaterialsView(l){
 let ids=l.materialIds||[];
 if(!ids.length)return '<div class="muted small">Материалы не прикреплены.</div>';
 return '<div class="materials-list">'+ids.map(mid=>{let m=M(mid);if(!m)return'';return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+'</span><button onclick="openMaterial(\''+m.id+'\')">Открыть</button></div>'}).join('')+'</div>';
}
function matIcon(name){let ext=(name.split('.').pop()||'').toLowerCase();if(['png','jpg','jpeg','gif','webp'].includes(ext))return'🖼';if(['doc','docx'].includes(ext))return'📄';if(['ppt','pptx'].includes(ext))return'📊';if(ext==='pdf')return'📕';return'📎'}
function matIconOf(m){return m.isLink?'🔗':matIcon(m.filename)}
function startEditLesson(){
 let l=L(S.lessonModal.id);
 S.lessonModal.mode='edit';
 S.lessonModal.draft=JSON.parse(JSON.stringify(l));
 renderModalOnly();
}
const GRADE_OPTIONS_DEFAULT=['5','4/5','4','3/4','3','2/3','2','долг'];
const LIBRARY_GRADE_LEVELS_DEFAULT=['1','2','3','4','5','6','7','8','9','10','11'];
const GRADE_COMMENT_TEMPLATES_DEFAULT=['Активно работал(а) на уроке','Отличная работа','Не был(а) готов(а) к уроку','Не сдал(а) работу','Требуется пересдача','Нужна доп. консультация'];
function gradeInputHtml(domId,current,extraAttrs){
 extraAttrs=extraAttrs||'';
 let listId=domId+'-list';
 let scale=(D.settings.gradeScale&&D.settings.gradeScale.length)?D.settings.gradeScale:GRADE_OPTIONS_DEFAULT;
 return '<input list="'+listId+'" id="'+domId+'" '+extraAttrs+' value="'+e(current||'')+'" placeholder="5" style="width:70px;flex:0 0 70px">'+
  '<datalist id="'+listId+'">'+scale.map(v=>'<option value="'+e(v)+'">').join('')+'</datalist>';
}
function commentInputHtml(domId,current,extraAttrs){
 extraAttrs=extraAttrs||'';
 let listId=domId+'-list';
 let tpls=D.settings.gradeCommentTemplates||GRADE_COMMENT_TEMPLATES_DEFAULT;
 return '<input list="'+listId+'" id="'+domId+'" '+extraAttrs+' value="'+e(current||'')+'" placeholder="Комментарий">'+
  '<datalist id="'+listId+'">'+tpls.map(v=>'<option value="'+e(v)+'">').join('')+'</datalist>';
}
function gradeNumericValue(v){
 if(v===undefined||v===null||v==='')return null;
 if(v==='долг')return null;
 let s=String(v);
 if(s.includes('/')){let p=s.split('/').map(Number);if(p.length===2&&!isNaN(p[0])&&!isNaN(p[1]))return(p[0]+p[1])/2}
 let n=+s;return isNaN(n)?null:n;
}
/* ---- баллы к оценке ---- */
function parsePts(v){let n=parseFloat(String(v==null?'':v).replace(',','.').trim());return isNaN(n)||n<0?null:n}
function fmtPts(n){return String(Math.round(+n*100)/100).replace('.',',')}
function gradePointsText(g){
 if(!g||g.points==null||g.points==='')return '';
 return fmtPts(g.points)+(g.max?'/'+fmtPts(g.max):' б.');
}
function gradeText(g){
 if(!g)return '';
 let t=(g.value!==undefined&&g.value!==null)?String(g.value):'';
 let pt=gradePointsText(g);
 return pt?(t?t+' ('+pt+')':pt):t;
}
function gradeViewHtml(g){
 let pt=gradePointsText(g);
 return '<b>'+e(g.value||'')+'</b>'+(pt?(g.value?' <span class="muted small">'+e(pt)+'</span>':'<b>'+e(pt)+'</b>'):'');
}
function buildGrade(value,comment,pointsRaw,maxRaw){
 let g={value:value,comment:comment};
 let pt=parsePts(pointsRaw);
 if(pt!==null){g.points=pt;let m=parsePts(maxRaw);if(m)g.max=m}
 return g;
}
function readGradesFromForm(classId,keepCommentOnly){
 let out={};
 let mEl=document.getElementById('le-gmax');
 let max=mEl?mEl.value:'';
 people(classId).forEach(st=>{
  let gi=document.querySelector('[data-g="'+st.id+'"]');
  if(!gi)return;
  let v=gi.value.trim();
  let c=((document.querySelector('[data-c="'+st.id+'"]')||{}).value||'').trim();
  let pi=document.querySelector('[data-p="'+st.id+'"]');
  let pts=pi?pi.value:'';
  if(v||parsePts(pts)!==null)out[st.id]=buildGrade(v,c,pts,max);
  else if(keepCommentOnly&&c)out[st.id]={value:'',comment:c};
 });
 return out;
}
function readGradeMaxToDraft(d){
 let mEl=document.getElementById('le-gmax');if(!mEl)return;
 let m=parsePts(mEl.value);
 if(m)d.gradeMax=m;else delete d.gradeMax;
}
function applyBulkComment(){
 let inp=document.getElementById('le-bulk');
 let txt=inp?inp.value.trim():'';
 if(!txt){alert('Сначала впишите общий комментарий к работе.');return}
 let over=document.getElementById('le-bulk-over');over=over&&over.checked;
 let n=0;
 document.querySelectorAll('[data-c]').forEach(c=>{if(over||!c.value.trim()){c.value=txt;n++}});
 let note=document.getElementById('le-bulk-note');
 if(note)note.textContent='Комментарий проставлен: '+n+' уч. Он сохранится у тех, кому вы поставите оценку или баллы.';
}
function checkPointsInput(inp){
 let mEl=document.getElementById('le-gmax');
 let max=mEl?parsePts(mEl.value):null,pt=parsePts(inp.value);
 inp.style.borderColor=(max&&pt!==null&&pt>max)?'#c0392b':'';
}
function updateGradeMaxLabels(){
 let mEl=document.getElementById('le-gmax');
 let max=mEl?parsePts(mEl.value):null;
 document.querySelectorAll('.gmax-lbl').forEach(el=>el.textContent=max?'/ '+fmtPts(max):'');
 document.querySelectorAll('[data-p]').forEach(checkPointsInput);
}
function lessonEditBody(l){
 let d=S.lessonModal.draft;
 let ps=attendablePeople(d.classId);
 let att=d.attendance||{};
 let grades=d.grades||{};
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let isClub=C(d.classId)&&C(d.classId).type==='club';
 let occurred=lessonHasOccurred(d);
 let attHtml='<div class="checks">'+ps.map(s=>{let v=att[s.id];if(v===undefined&&!occurred)return '<div class="attrow"><span>'+studentFio(s)+'</span><span class="badge" title="Урок ещё не проведён">—</span></div>';v=v||'+';return '<div class="attrow"><span>'+studentFio(s)+'</span><button type="button" class="attbtn '+(v==='н'?'absent':'present')+'" data-att="'+s.id+'" onclick="toggleAttBtn(this)">'+v+'</button></div>'}).join('')+'</div>';
 let gmaxVal=d.gradeMax!=null?d.gradeMax:((Object.values(grades).find(x=>x&&x.max)||{}).max||'');
 let gradesHtml='<div class="gbulk"><div class="small muted" style="margin-bottom:4px">Работа целиком — общие параметры для всех учеников</div>'+
  '<label style="margin-top:0">Общий комментарий к работе</label>'+commentInputHtml('le-bulk','','placeholder="Напр.: Контрольная № 3 «Дроби»"')+
  '<div class="row" style="margin-top:6px"><button type="button" onclick="applyBulkComment()">Применить ко всем</button><label class="attrow" style="cursor:pointer;margin:0;gap:8px"><span class="small">заменять уже заполненные</span><input type="checkbox" id="le-bulk-over" style="width:auto"></label></div>'+
  '<div id="le-bulk-note" class="small muted" style="margin-top:4px"></div>'+
  '<label>Максимум баллов за работу</label><input id="le-gmax" inputmode="decimal" value="'+e(gmaxVal===''?'':fmtPts(gmaxVal))+'" placeholder="Напр. 20" style="max-width:140px" oninput="updateGradeMaxLabels()"></div>'+
  '<div class="grades ghead"><span>Ученик</span><span>Оценка</span><span>Баллы</span><span>Комментарий</span></div>'+
  ps.map(s=>{let g=grades[s.id]||{};return '<div class="grades"><span>'+studentFio(s)+'</span>'+gradeInputHtml('g_'+s.id,g.value,'data-g="'+s.id+'"')+
   '<div class="ptcell"><input inputmode="decimal" data-p="'+s.id+'" value="'+(g.points!=null?e(fmtPts(g.points)):'')+'" placeholder="баллы" oninput="checkPointsInput(this)"><span class="small muted gmax-lbl">'+(gmaxVal!==''?'/ '+e(fmtPts(gmaxVal)):'')+'</span></div>'+
   commentInputHtml('c_'+s.id,g.comment,'data-c="'+s.id+'"')+'</div>'}).join('');
 let behaviorNotes=d.behaviorNotes||{};
 let behaviorHtml='<div class="checks">'+ps.map(s=>'<div class="attrow"><span>'+studentFio(s)+'</span><input type="text" data-bn="'+s.id+'" value="'+e(behaviorNotes[s.id]||'')+'" placeholder="Не влияет на оценку" style="max-width:240px"></div>').join('')+'</div>';
 return '<label>Дата</label><input id="le-date" type="date" value="'+e(d.date)+'">'+
  '<label>Класс</label><select id="le-class" onchange="toggleLessonEditFields()">'+classOptionsHtml(d.classId)+'</select>'+
  '<div id="le-period-block" style="display:'+(isClub?'none':'block')+'"><label>№ урока</label><select id="le-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'"'+(+d.lessonNumber===t.n?' selected':'')+'>'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select></div>'+
  '<label>Время</label><div class="row"><input id="le-start" value="'+e(d.startTime||'')+'"><input id="le-end" value="'+e(d.endTime||'')+'"></div>'+
  (isClub?'<div class="muted small" style="margin-top:-8px;margin-bottom:8px">Кружок/секция — время свободное, не привязано к сетке уроков.</div>':'')+
  '<label>Тема</label><input id="le-topic" value="'+e(d.topic)+'">'+
  '<label style="display:flex;align-items:center;gap:6px;margin-top:12px"><input type="checkbox" id="le-practice" '+(d.flagPractice?'checked':'')+' style="width:auto"> 🧪 Практическая работа</label>'+
  '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="le-test" '+(d.flagTest?'checked':'')+' style="width:auto"> 📝 Контрольная / проверочная работа</label>'+
  (D.lessonTemplates.length?'<label>Применить шаблон</label><select onchange="if(this.value){syncDraftFromForm();applyTemplateToDraft(this.value)};this.value=\'\'"><option value="">— выбрать шаблон —</option>'+D.lessonTemplates.map(t=>'<option value="'+t.id+'">'+e(t.name)+'</option>').join('')+'</select>':'')+
  lf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('lf_'+f.key,f,d.customFields[f.key])).join('')+
  detailsBlock('Посещаемость',attHtml,true)+
  detailsBlock('Оценки',gradesHtml,true)+
  detailsBlock('Материалы',lessonMaterialsEdit(d),true)+
  '<div class="toolbar" style="margin-top:16px"><button class="primary" onclick="saveLessonEdit()">Сохранить</button><button onclick="cancelEditLesson()">Отмена</button></div>';
}
function toggleLessonEditFields(){
 let cid=document.getElementById('le-class').value;
 let isClub=C(cid)&&C(cid).type==='club';
 document.getElementById('le-period-block').style.display=isClub?'none':'block';
}
function toggleAttBtn(btn){let v=btn.textContent.trim();let nv=v==='н'?'+':'н';btn.textContent=nv;btn.className='attbtn '+(nv==='н'?'absent':'present')}
function syncDraftFromForm(){
 let d=S.lessonModal&&S.lessonModal.draft;if(!d)return;
 let el;
 if(el=document.getElementById('le-date'))d.date=el.value;
 if(el=document.getElementById('le-class'))d.classId=el.value;
 if(el=document.getElementById('le-num'))d.lessonNumber=(C(d.classId)&&C(d.classId).type==='club')?null:+el.value;
 if(el=document.getElementById('le-start'))d.startTime=el.value;
 if(el=document.getElementById('le-end'))d.endTime=el.value;
 if(el=document.getElementById('le-topic'))d.topic=el.value;
 if(el=document.getElementById('le-practice'))d.flagPractice=el.checked;
 if(el=document.getElementById('le-test'))d.flagTest=el.checked;
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let e2=document.getElementById('lf_'+f.key);if(e2)d.customFields[f.key]=readFieldValue(f,e2)});
 let attendance={};document.querySelectorAll('[data-att]').forEach(b=>{attendance[b.dataset.att]=b.textContent.trim()});
 if(Object.keys(attendance).length)d.attendance=attendance;
 d.grades=readGradesFromForm(d.classId,true);readGradeMaxToDraft(d);
 let behaviorNotes={};document.querySelectorAll('[data-bn]').forEach(inp=>{let v=inp.value.trim();if(v)behaviorNotes[inp.dataset.bn]=v});
 if(Object.keys(behaviorNotes).length)d.behaviorNotes=behaviorNotes;
}
function lessonMaterialsEdit(d){
 let ids=d.materialIds||[];
 return '<div class="materials-list" id="le-mats">'+ids.map(mid=>{let m=M(mid);if(!m)return'';return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+'</span><button onclick="removeMaterialFromDraft(\''+mid+'\')">Убрать</button></div>'}).join('')+'</div>'+
  '<div class="toolbar" style="margin-top:8px"><button onclick="document.getElementById(\'le-upload\').click()">Загрузить файл</button><input id="le-upload" type="file" multiple hidden onchange="uploadMaterialsToDraft(this)"><button onclick="pickFromLibrary()">Выбрать из библиотеки</button><button onclick="syncDraftFromForm();openAddLinkToLesson()">🔗 Добавить ссылку</button></div>';
}
function openAddLinkToLesson(){
 let cls=C(S.lessonModal.draft.classId);
 setModalHtml('Добавить ссылку к уроку',
  '<label>Название</label><input id="lm-name" placeholder="Видео по теме">'+
  '<label>Ссылка (URL)</label><input id="lm-url" placeholder="https://...">'+
  '<label>Категория</label><input id="lm-cat" value="'+e(cls?cls.name:'')+'">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveLinkAndAttach()">Добавить</button><button onclick="renderModalOnly()">Отмена</button></div>');
}
function saveLinkAndAttach(){
 let name=document.getElementById('lm-name').value.trim();
 let url=document.getElementById('lm-url').value.trim();
 if(!name||!url){alert('Укажите название и ссылку.');return}
 if(!/^https?:\/\//i.test(url))url='https://'+url;
 let mid=uid();
 D.materials.push({id:mid,filename:name,category:document.getElementById('lm-cat').value.trim()||'Без категории',isLink:true,url,mimeType:'',size:0,createdAt:new Date().toISOString()});
 let d=S.lessonModal.draft;
 d.materialIds=d.materialIds||[];d.materialIds.push(mid);
 save();renderModalOnly();
}
function removeMaterialFromDraft(mid){syncDraftFromForm();let d=S.lessonModal.draft;d.materialIds=(d.materialIds||[]).filter(x=>x!==mid);renderModalOnly()}
async function uploadMaterialsToDraft(input){
 syncDraftFromForm();
 let d=S.lessonModal.draft;
 for(let f of input.files){
  let mid=uid();
  await fileStorePut(mid,f);
  D.materials.push({id:mid,filename:f.name,category:C(d.classId)?C(d.classId).name:'Без категории',mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
  d.materialIds=d.materialIds||[];d.materialIds.push(mid);
 }
 save();renderModalOnly();
}
function pickFromLibrary(){
 syncDraftFromForm();
 let d=S.lessonModal.draft;
 let avail=D.materials.filter(m=>!(d.materialIds||[]).includes(m.id));
 setModalHtml('Выбрать из библиотеки',avail.length?
  '<div class="materials-list">'+avail.map(m=>'<label class="m" style="cursor:pointer"><span style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="pfl-cb" value="'+m.id+'" style="width:auto">'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">('+e(m.category||'')+')</span></span></label>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:12px"><button class="primary" onclick="addSelectedFromLibrary()">Добавить выбранные</button><button onclick="renderModalOnly()">Отмена</button></div>'
  :'<div class="empty">В библиотеке нет файлов.</div><div class="toolbar" style="margin-top:12px"><button onclick="renderModalOnly()">Закрыть</button></div>');
}
function addSelectedFromLibrary(){
 let d=S.lessonModal.draft;
 let ids=[...document.querySelectorAll('.pfl-cb')].filter(cb=>cb.checked).map(cb=>cb.value);
 if(!ids.length){alert('Выберите хотя бы один материал.');return}
 d.materialIds=d.materialIds||[];
 ids.forEach(mid=>{if(!d.materialIds.includes(mid))d.materialIds.push(mid)});
 renderModalOnly();
}
async function downloadMaterial(mid){
 let m=M(mid);if(!m)return;
 if(m.isLink){window.open(m.url,'_blank');return}
 let blob=m.legacyData?await base64ToBlob(m.legacyData):await fileStoreGet(mid);
 if(!blob){alert('Файл не найден в хранилище.');return}
 let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=m.filename;a.click();URL.revokeObjectURL(url);
}
async function openMaterial(mid){
 let m=M(mid);if(!m)return;
 if(m.isLink){window.open(m.url,'_blank');return}
 let blob=m.legacyData?await base64ToBlob(m.legacyData):await fileStoreGet(mid);
 if(!blob){alert('Файл не найден в хранилище.');return}
 let type=m.mimeType||blob.type||'';
 let ext=(m.filename.split('.').pop()||'').toLowerCase();
 let url=URL.createObjectURL(blob);
 if(type.startsWith('image/')){
  setModalHtml(m.filename,'<div style="text-align:center"><img src="'+url+'" style="max-width:100%;max-height:70vh;border-radius:8px"></div><div class="toolbar" style="margin-top:14px;justify-content:center"><button onclick="downloadMaterial(\''+mid+'\')">⬇ Скачать</button><button onclick="closeModal()">Закрыть</button></div>');
  return;
 }
 if(type==='application/pdf'||ext==='pdf'){
  window.open(url,'_blank');
  return;
 }
 if(type.startsWith('text/')||['txt','md','csv'].includes(ext)){
  let text=await blob.text();
  setModalHtml(m.filename,'<pre style="white-space:pre-wrap;max-height:70vh;overflow:auto;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px">'+e(text)+'</pre><div class="toolbar" style="margin-top:14px"><button onclick="downloadMaterial(\''+mid+'\')">⬇ Скачать</button><button onclick="closeModal()">Закрыть</button></div>');
  return;
 }
 alert('Этот тип файла браузер не может показать прямо в приложении (нужна программа вроде Word/PowerPoint/Excel) — сейчас он будет скачан.');
 downloadMaterial(mid);
}
function saveLessonEdit(){
 let d=S.lessonModal.draft;
 let date=document.getElementById('le-date').value,classId=document.getElementById('le-class').value;
 let cls=C(classId);
 let isClub=cls&&cls.type==='club';
 let numEl=document.getElementById('le-num');
 let num=numEl?numEl.value:null;
 let origLesson=L(d.id);
 if(isClub){
  if(!checkNotBlocked(date,null))return;
 }else{
  if(!num){alert('Укажите номер урока.');return}
  if(date!==origLesson.date||+num!==+origLesson.lessonNumber){
   if(!checkNotBlocked(date,num))return;
  }
 }
 d.date=date;d.classId=classId;d.lessonNumber=isClub?null:+num;
 d.startTime=document.getElementById('le-start').value;d.endTime=document.getElementById('le-end').value;
 d.topic=document.getElementById('le-topic').value.trim();
 d.flagPractice=document.getElementById('le-practice').checked;
 d.flagTest=document.getElementById('le-test').checked;
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{
  let el=document.getElementById('lf_'+f.key);if(el)d.customFields[f.key]=readFieldValue(f,el);
 });
 let attendance={};
 document.querySelectorAll('[data-att]').forEach(b=>{attendance[b.dataset.att]=b.textContent.trim()});
 d.attendance=attendance;
 let grades=readGradesFromForm(d.classId,false);
 if(Object.values(grades).some(g=>g.max&&g.points>g.max)&&!confirm('У некоторых учеников баллов больше максимума. Сохранить всё равно?'))return;
 d.grades=grades;readGradeMaxToDraft(d);
 let behaviorNotes={};
 document.querySelectorAll('[data-bn]').forEach(inp=>{let v=inp.value.trim();if(v)behaviorNotes[inp.dataset.bn]=v});
 d.behaviorNotes=behaviorNotes;
 let idx=D.lessons.findIndex(x=>x.id===d.id);
 D.lessons[idx]=d;
 save();
 S.lessonModal.mode='view';S.lessonModal.draft=null;
 renderModalOnly();
 if(S.view==='home'||S.view==='class')render();
}
function cancelEditLesson(){S.lessonModal.mode='view';S.lessonModal.draft=null;renderModalOnly()}
