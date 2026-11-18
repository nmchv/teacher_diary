function gradeOptionsHtml(selected){
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 return levels.map(n=>'<option value="'+e(n)+'"'+(String(selected)===String(n)?' selected':'')+'>'+e(n)+'</option>').join('');
}
function templateCardHtml(t){
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let details=lf.map(f=>section(f.label,t.fields[f.key])).join('');
 return '<div class="card"><details class="dblock" style="margin:0"><summary><span><b>'+e(t.name)+'</b>'+(t.topic?' <span class="muted small">· '+e(t.topic)+'</span>':'')+'</span></summary>'+
  '<div class="dbody">'+(details||'<div class="muted small">Поля пока не заполнены.</div>')+'</div></details>'+
  '<div class="toolbar" style="margin-top:12px;flex-wrap:wrap"><button class="primary" style="flex:1;min-width:200px" onclick="openPlaceTemplateInSchedule(\''+t.id+'\')">📅 Разместить в расписании</button><button style="flex:1;min-width:120px" onclick="openEditTemplate(\''+t.id+'\')">Изменить</button><button class="danger" style="flex:1;min-width:120px" onclick="deleteTemplate(\''+t.id+'\')">Удалить</button></div>'+
  '</div>';
}
function setLibraryGradeFilter(v){S.libraryClassFilter=v;render()}
function lessonLibraryPage(){
 let filter=S.libraryClassFilter||'';
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 let gradeOpts=levels.map(n=>'<option value="'+e(n)+'"'+(filter===String(n)?' selected':'')+'>'+e(n)+'-е классы</option>').join('');
 let filterHtml='<select onchange="setLibraryGradeFilter(this.value)" style="width:auto;display:inline-block"><option value=""'+(filter===''?' selected':'')+'>Все параллели</option><option value="__none__"'+(filter==='__none__'?' selected':'')+'>Без параллели</option>'+gradeOpts+'</select>';
 if(!D.lessonTemplates.length){
  return '<div class="top"><div><h1>Библиотека уроков</h1><div class="muted">Составьте урок заранее (тема, план, домашнее задание и т.д.), а потом сразу расставьте его по расписанию — в том числе одновременно на несколько параллельных классов</div></div>'+
   '<button class="primary" onclick="openAddTemplate()">＋ Новый урок в библиотеку</button></div>'+
   '<div class="card empty">В библиотеке пока нет уроков.</div>';
 }
 let groups={};
 D.lessonTemplates.forEach(t=>{let key=(t.gradeNumber===null||t.gradeNumber===undefined||t.gradeNumber==='')?'__none__':String(t.gradeNumber);(groups[key]=groups[key]||[]).push(t)});
 let sections=[];
 levels.forEach(n=>{
  let key=String(n);
  if(!groups[key])return;
  if(filter&&filter!==key)return;
  sections.push({title:n+'-е классы',items:groups[key]});
  delete groups[key];
 });
 if(!filter){
  Object.keys(groups).forEach(key=>{
   if(key==='__none__')return;
   sections.push({title:key+' (параллель убрана из настроек)',items:groups[key]});
  });
 }
 if(groups.__none__&&(!filter||filter==='__none__')){
  sections.push({title:'Без параллели',items:groups.__none__});
 }
 let body=sections.length?sections.map(sec=>
  '<h3 style="margin:18px 0 8px">'+e(sec.title)+' <span class="muted small">('+sec.items.length+')</span></h3>'+
  sec.items.map(templateCardHtml).join('')
 ).join(''):'<div class="card empty">В этой папке пока нет уроков.</div>';
 return '<div class="top"><div><h1>Библиотека уроков</h1><div class="muted">Составьте урок заранее (тема, план, домашнее задание и т.д.), а потом сразу расставьте его по расписанию — в том числе одновременно на несколько параллельных классов</div></div>'+
  '<button class="primary" onclick="openAddTemplate()">＋ Новый урок в библиотеку</button></div>'+
  '<div class="toolbar" style="margin-bottom:6px">Параллель: '+filterHtml+'</div>'+
  body;
}
function templateFormFields(t){
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 return lf.map(f=>'<label>'+e(f.label)+'</label>'+customFieldInput('t-lf_'+f.key,f,t.fields?t.fields[f.key]:''));
}
function openAddTemplate(){
 setModalHtml('Новый урок в библиотеку',
  '<label>Название (для себя, в списке библиотеки)</label><input id="t-name" placeholder="Стандартный урок географии">'+
  '<label>Параллель (папка в библиотеке)</label><select id="t-grade"><option value="">— без параллели —</option>'+gradeOptionsHtml('')+'</select>'+
  '<label>Тема урока</label><input id="t-topic" placeholder="Атмосфера Земли">'+
  templateFormFields({fields:{}}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveTemplate()">Сохранить в библиотеку</button><button onclick="closeModal()">Отмена</button></div>',true);
 initAutosize();
}
function saveTemplate(){
 let name=document.getElementById('t-name').value.trim();
 if(!name){alert('Укажите название.');return}
 let fields={};
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('t-lf_'+f.key);if(el)fields[f.key]=readFieldValue(f,el)});
 let gradeVal=document.getElementById('t-grade').value;
 D.lessonTemplates.push({id:uid(),name,gradeNumber:gradeVal||null,topic:document.getElementById('t-topic').value.trim(),fields});
 save();closeModal();render();
}
function openEditTemplate(id){
 let t=D.lessonTemplates.find(x=>x.id===id);if(!t)return;
 setModalHtml('Урок в библиотеке',
  '<label>Название (для себя, в списке библиотеки)</label><input id="t-name" value="'+e(t.name)+'">'+
  '<label>Параллель (папка в библиотеке)</label><select id="t-grade"><option value="">— без параллели —</option>'+gradeOptionsHtml(t.gradeNumber||'')+'</select>'+
  '<label>Тема урока</label><input id="t-topic" value="'+e(t.topic||'')+'">'+
  templateFormFields(t).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditTemplate(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteTemplate(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>',true);
 initAutosize();
}
function saveEditTemplate(id){
 let t=D.lessonTemplates.find(x=>x.id===id);if(!t)return;
 t.name=document.getElementById('t-name').value.trim();
 let gradeVal=document.getElementById('t-grade').value;
 t.gradeNumber=gradeVal||null;
 t.topic=document.getElementById('t-topic').value.trim();
 let fields={};
 D.settings.fields.lesson.filter(f=>f.visible).forEach(f=>{let el=document.getElementById('t-lf_'+f.key);if(el)fields[f.key]=readFieldValue(f,el)});
 t.fields=fields;
 save();closeModal();render();
}
function deleteTemplate(id){if(!confirm('Удалить урок из библиотеки?'))return;D.lessonTemplates=D.lessonTemplates.filter(t=>t.id!==id);save();closeModal();render()}
function applyTemplateToDraft(tid){
 let t=D.lessonTemplates.find(x=>x.id===tid);if(!t)return;
 let d=S.lessonModal.draft;
 let topicIsEmpty=!d.topic||!String(d.topic).trim();
 if(t.topic&&topicIsEmpty)d.topic=t.topic;
 d.customFields=d.customFields||{};
 Object.keys(t.fields||{}).forEach(k=>{
  let cur=d.customFields[k];
  let isEmpty=cur===undefined||cur===null||cur===''||(Array.isArray(cur)&&cur.length===0);
  if(isEmpty)d.customFields[k]=t.fields[k];
 });
 renderModalOnly();
}
function openPlaceTemplateInSchedule(templateId){
 let t=D.lessonTemplates.find(x=>x.id===templateId);if(!t)return;
 let today=toISO(new Date());
 let classesHtml='<label>В какие классы и на какое время поставить урок «'+e(t.name)+'»</label><table class="table"><tr><th></th><th>Класс</th><th>Дата</th><th>№ урока</th></tr>'+
  sortedClasses(D.classes.filter(c=>c.type!=='club')).map(c=>'<tr><td><input type="checkbox" class="tpl-c" data-class="'+c.id+'" style="width:auto"></td><td>'+e(c.name)+'</td><td><input type="date" class="tpl-date" data-class="'+c.id+'" value="'+today+'"></td><td><select class="tpl-num" data-class="'+c.id+'">'+LESSON_TIMES.map(x=>'<option value="'+x.n+'">'+x.n+'</option>').join('')+'</select></td></tr>').join('')+
  '</table>';
 setModalHtml('Разместить урок в расписании',classesHtml+'<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmPlaceTemplate(\''+templateId+'\')">Создать уроки</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmPlaceTemplate(templateId){
 let t=D.lessonTemplates.find(x=>x.id===templateId);if(!t)return;
 let created=0,skipped=[];
 document.querySelectorAll('.tpl-c').forEach(cb=>{
  if(!cb.checked)return;
  let classId=cb.dataset.class;
  let date=document.querySelector('.tpl-date[data-class="'+classId+'"]').value;
  let num=+document.querySelector('.tpl-num[data-class="'+classId+'"]').value;
  let blk=findBlock(date,num);
  if(blk){skipped.push(C(classId).name+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(C(classId).name+' — слот уже занят');return}
  let time=timeFor(num);
  let nl={id:uid(),date,lessonNumber:num,startTime:time.start,endTime:time.end,classId,topic:t.topic||'',
   customFields:{...t.fields},attendance:{},grades:{},materialIds:[]};
  D.lessons.push(nl);created++;
 });
 save();closeModal();
 alert('Создано уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
