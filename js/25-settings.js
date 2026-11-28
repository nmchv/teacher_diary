/* ===================== НАСТРОЙКИ ===================== */
function settingsPage(){
 let tab=S.settingsTab||'fields';
 return '<div class="top"><div><h1>Настройки</h1><div class="muted small">Версия 4.1.5</div></div></div>'+
  '<div class="tabs">'+[['fields','Поля'],['appearance','Внешний вид'],['schedule','Расписание / блокировки']].map(x=>'<button class="'+(tab===x[0]?'active':'')+'" onclick="S.settingsTab=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  (tab==='fields'?settingsFieldsTab():tab==='appearance'?settingsAppearanceTab():settingsScheduleTab());
}
function settingsFieldsTab(){
 let sub=S.fieldsSub||'student';
 return '<div class="tabs">'+[['student','Поля учеников'],['class','Поля классов'],['lesson','Поля уроков'],['colleague','Поля коллег']].map(x=>'<button class="'+(sub===x[0]?'active':'')+'" onclick="S.fieldsSub=\''+x[0]+'\';render()">'+x[1]+'</button>').join('')+'</div>'+
  '<div class="card">'+fieldsEditor(sub)+'</div>';
}
function fieldsEditor(entity){
 let fields=D.settings.fields[entity];
 return '<div>'+fields.map((f,i)=>'<div class="fieldrow">'+
   '<span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveField(\''+entity+'\','+i+',-1)">↑</button><button '+(i===fields.length-1?'disabled':'')+' onclick="moveField(\''+entity+'\','+i+',1)">↓</button></span>'+
   '<span class="fname">'+e(f.label)+' <small>('+fieldTypeLabel(f.type)+(f.system?', системное':'')+')</small></span>'+
   '<label style="display:flex;align-items:center;gap:5px;margin:0;flex:0"><input type="checkbox" style="width:auto" '+(f.visible?'checked':'')+' onchange="toggleFieldVisible(\''+entity+'\',\''+f.key+'\')"> видимо</label>'+
   '<button onclick="renameField(\''+entity+'\',\''+f.key+'\')">Переименовать</button>'+
   (f.system?'':'<button class="danger" onclick="deleteField(\''+entity+'\',\''+f.key+'\')">Удалить</button>')+
  '</div>').join('')+
  '</div><div class="toolbar" style="margin-top:14px"><button class="primary" onclick="openAddField(\''+entity+'\')">＋ Добавить поле</button></div>';
}
function fieldTypeLabel(t){return {text:'короткий текст',longtext:'длинный текст',number:'число',date:'дата',boolean:'да/нет',select:'выбор из списка',colleagueLink:'коллега (ссылка)'}[t]||t}
function moveField(entity,i,dir){
 let arr=D.settings.fields[entity];let j=i+dir;if(j<0||j>=arr.length)return;
 [arr[i],arr[j]]=[arr[j],arr[i]];save();render();
}
function toggleFieldVisible(entity,key){
 let f=fieldByKey(entity,key);f.visible=!f.visible;save();render();
}
function renameField(entity,key){
 let f=fieldByKey(entity,key);
 let nv=prompt('Новое название поля:',f.label);
 if(nv&&nv.trim()){f.label=nv.trim();save();render()}
}
function deleteField(entity,key){
 if(!confirm('Удалить пользовательское поле? Введённые данные в этом поле будут скрыты.'))return;
 D.settings.fields[entity]=D.settings.fields[entity].filter(f=>f.key!==key);save();render();
}
function openAddField(entity){
 setModalHtml('Новое поле',
  '<label>Название</label><input id="nf-label">'+
  '<label>Тип</label><select id="nf-type"><option value="text">Короткий текст</option><option value="longtext">Длинный текст</option><option value="number">Число</option><option value="date">Дата</option><option value="boolean">Да/нет</option><option value="select">Выбор из списка</option><option value="colleagueLink">Коллега (ссылка на карточку)</option></select>'+
  '<div id="nf-opts-wrap" style="display:none"><label>Варианты (через запятую)</label><input id="nf-opts"></div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewField(\''+entity+'\')">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
 document.getElementById('nf-type').onchange=e2=>{document.getElementById('nf-opts-wrap').style.display=e2.target.value==='select'?'block':'none'};
}
function saveNewField(entity){
 let label=document.getElementById('nf-label').value.trim();
 if(!label){alert('Укажите название поля.');return}
 let type=document.getElementById('nf-type').value;
 let options=type==='select'?document.getElementById('nf-opts').value.split(',').map(x=>x.trim()).filter(Boolean):undefined;
 D.settings.fields[entity].push({key:'custom_'+uid(),label,type,system:false,visible:true,options});
 save();closeModal();render();
}
function settingsAppearanceTab(){
 return sCard('Профиль','<label>Ваше ФИО (используется в заголовках печатных отчётов)</label><input id="teacher-name" value="'+e(D.settings.teacherName||'')+'" placeholder="Иванова Мария Петровна" onchange="setTeacherName(this.value)">')+
  sCard('Параллели в библиотеке уроков и материалах','<p class="muted small">Список папок-параллелей для группировки и фильтра в разделах «Библиотека уроков» и «Материалы». Уберите лишние или добавьте свои — например «10А спецкласс».</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.libraryGradeLevels||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveGradeLevel('+i+',-1)">↑</button><button '+(i===(D.settings.libraryGradeLevels.length-1)?'disabled':'')+' onclick="moveGradeLevel('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeGradeLevel('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-grade-level" placeholder="например, 10" style="max-width:200px"><button onclick="addGradeLevel()">＋ Добавить параллель</button></div>')+
  sCard('Шкала оценок','<p class="muted small">Значения, которые предлагаются при выставлении оценки, и категории в диаграмме «Распределение оценок». Порядок — как в списке ниже.</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.gradeScale||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveGradeScale('+i+',-1)">↑</button><button '+(i===(D.settings.gradeScale.length-1)?'disabled':'')+' onclick="moveGradeScale('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeGradeScale('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-grade-scale" placeholder="например, 3/4 или зачёт" style="max-width:200px"><button onclick="addGradeScale()">＋ Добавить значение</button></div>')+
  sCard('Шаблоны комментариев к оценкам','<p class="muted small">Варианты, которые подсказываются при вводе комментария к оценке. Можно всегда напечатать и свой текст — эти варианты лишь ускоряют ввод повторяющихся формулировок.</p>'+
  '<div class="checks" style="max-height:none">'+(D.settings.gradeCommentTemplates||[]).map((g,i)=>'<div class="attrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveCommentTemplate('+i+',-1)">↑</button><button '+(i===(D.settings.gradeCommentTemplates.length-1)?'disabled':'')+' onclick="moveCommentTemplate('+i+',1)">↓</button></span><span>'+e(g)+'</span><button class="danger" onclick="removeCommentTemplate('+i+')">✕</button></div>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:10px"><input id="new-comment-template" placeholder="например, Не сдал(а) работу" style="max-width:260px"><button onclick="addCommentTemplate()">＋ Добавить вариант</button></div>')+
  sCard('Накопительная система баллов','<label>Порог обмена баллов на оценку</label><input type="number" min="1" value="'+(D.settings.pointsThreshold||5)+'" style="max-width:120px" onchange="setPointsThreshold(this.value)"><p class="muted small">Используется в режиме «Начать урок» — баллы можно ставить за короткие ответы, а по достижении порога обменять на полноценную оценку.</p>')+
  sCard('Тема оформления','<div class="toolbar" role="group" aria-label="Тема оформления">'+
   TeacherDiaryTheme.list.map(t=>'<button type="button" class="'+(D.settings.colorMode===t.id?'primary':'')+'" aria-pressed="'+(D.settings.colorMode===t.id)+'" onclick="TeacherDiaryTheme.choose(\''+t.id+'\')">'+t.name+'</button>').join('')+
  '</div><p class="muted small">Тему можно выбрать и из списка в шапке.</p>')+
  sCard('Город для погоды','<label>Город, по которому показывать погоду на главной</label><select id="weather-city" style="width:100%;padding:9px;border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-surface);color:var(--color-text-primary)" onchange="setWeatherCity(this.value)">'+
   Object.keys(WEATHER_CITY_COORDS).map(c=>'<option value="'+e(c)+'"'+(D.settings.weatherCity===c?' selected':'')+'>'+e(c)+'</option>').join('')+
  '</select><p class="muted small">Погода обновляется каждые 10 минут через сервис Open-Meteo.</p>')+
  sCard('🐾 Ассистент','<p class="muted small">Помощник, как в старых версиях Windows — время от времени подскажет полезную мелочь или скажет пару тёплых слов. Можно перетаскивать по экрану, кликнуть — новый совет.</p>'+
  '<label class="attrow" style="cursor:pointer"><span>Показывать ассистента</span><input type="checkbox" '+(assistantSettings().enabled?'checked':'')+' style="width:auto" onchange="setAssistantEnabled(this.checked)"></label>'+
  '<label class="attrow" style="cursor:pointer"><span>Поддерживающие и мотивационные сообщения</span><input type="checkbox" '+(assistantSettings().motivation!==false?'checked':'')+' style="width:auto" onchange="setAssistantMotivation(this.checked)"></label>'+
  '<div style="margin-top:10px"><label>Персонаж</label><div class="toolbar">'+
   Object.keys(ASSISTANT_CHARACTERS).map(k=>'<button class="'+(assistantSettings().character===k?'primary':'')+'" onclick="setAssistantChar(\''+k+'\')">'+ASSISTANT_CHARACTERS[k].emoji+' '+ASSISTANT_CHARACTERS[k].name+'</button>').join('')+
  '</div></div>'+
  '<div style="margin-top:10px"><label>Как часто напоминать о себе</label><div class="toolbar">'+
   [[10,'10 мин'],[20,'20 мин'],[40,'40 мин'],[60,'1 час']].map(o=>'<button class="'+(assistantSettings().freq===o[0]?'primary':'')+'" onclick="setAssistantFreq('+o[0]+')">'+o[1]+'</button>').join('')+
  '</div></div>'+
  '<p class="muted small" style="margin-top:10px">Кнопка «🫥 Спрятать частично» у ассистента оставляет его выглядывающим с края экрана — нажмите на него снова, чтобы вернуть полностью. Чтобы выключить совсем — снимите галочку выше или нажмите «Отключить» в его подсказке.</p>'+
  '<div class="toolbar" style="margin-top:12px;flex-wrap:wrap"><button class="primary" onclick="assistantSpeak()">Спросить совет прямо сейчас</button><button onclick="assistantMotivate()">💛 Попросить поддержку</button><button onclick="assistantPeek()">🫥 Спрятать частично</button></div>');
}
function setAssistantEnabled(v){assistantSettings().enabled=v;if(v)assistantSettings().peeked=false;save();initAssistant()}
function setAssistantMotivation(v){assistantSettings().motivation=v;save()}
function setAssistantChar(k){assistantSettings().character=k;save();initAssistant();render()}
function setAssistantFreq(n){assistantSettings().freq=n;save();initAssistant();render()}
function addGradeScale(){
 let el=document.getElementById('new-grade-scale');
 let v=el.value.trim();
 if(!v)return;
 D.settings.gradeScale=D.settings.gradeScale||[];
 if(!D.settings.gradeScale.includes(v))D.settings.gradeScale.push(v);
 save();render();
}
function removeGradeScale(i){D.settings.gradeScale.splice(i,1);save();render()}
function moveGradeScale(i,dir){let arr=D.settings.gradeScale;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function addCommentTemplate(){
 let el=document.getElementById('new-comment-template');
 let v=el.value.trim();
 if(!v)return;
 D.settings.gradeCommentTemplates=D.settings.gradeCommentTemplates||[];
 if(!D.settings.gradeCommentTemplates.includes(v))D.settings.gradeCommentTemplates.push(v);
 save();render();
}
function removeCommentTemplate(i){D.settings.gradeCommentTemplates.splice(i,1);save();render()}
function moveCommentTemplate(i,dir){let arr=D.settings.gradeCommentTemplates;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function addGradeLevel(){
 let el=document.getElementById('new-grade-level');
 let v=el.value.trim();
 if(!v)return;
 D.settings.libraryGradeLevels=D.settings.libraryGradeLevels||[];
 if(!D.settings.libraryGradeLevels.includes(v))D.settings.libraryGradeLevels.push(v);
 save();render();
}
function removeGradeLevel(i){D.settings.libraryGradeLevels.splice(i,1);save();render()}
function moveGradeLevel(i,dir){let arr=D.settings.libraryGradeLevels;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();render()}
function setTeacherName(v){D.settings.teacherName=v.trim();save()}
function setPointsThreshold(v){D.settings.pointsThreshold=Math.max(1,+v||5);save()}
function setWeatherCity(v){D.settings.weatherCity=v;save();initWeather();render()}
function settingsScheduleTab(){
  return sCard('Дни недели в расписании',
   '<label class="attrow" style="cursor:pointer"><span>Показывать субботу как учебный день</span><input type="checkbox" '+(D.settings.showSaturday?'checked':'')+' style="width:auto" onchange="toggleShowSaturday(this.checked)"></label>'+
   '<p class="muted small">Если выключить — суббота уберётся из недельного расписания, свободной таблицы «Расписание класса» и списка дней для авторасстановки.</p>')+
   sCard('Формальное расписание (нагрузка)',
   '<p class="muted small">Задайте формальное расписание: какие уроки и для каких классов проходят в каждый день недели. Эта таблица показывается по кнопке «Моё расписание» на главной.</p>'+
   '<div class="toolbar" style="margin-bottom:10px"><button class="primary" onclick="openEditFormalSchedule()">Настроить формальное расписание</button></div>'+
   (D.settings.formalSchedule&&D.settings.formalSchedule.length?'<div class="muted small">Записей в формальном расписании: <b>'+D.settings.formalSchedule.length+'</b></div>':'<div class="empty">Формальное расписание пока не задано.</div>'))+
   sCard('Четверти учебного года',
  '<p class="muted small">Задайте границы четвертей один раз — тогда в статистике и на графиках оценок можно будет точно фильтровать «по четверти» вместо приблизительного периода.</p>'+
  '<div class="toolbar" style="margin-bottom:10px"><button class="primary" onclick="openAddQuarter()">＋ Добавить четверть</button></div>'+
  (D.settings.quarters.length?'<table class="table"><tr><th>Название</th><th>С</th><th>По</th><th></th></tr>'+
   D.settings.quarters.map(q=>'<tr><td>'+e(q.name)+'</td><td>'+fmtDate(q.startDate)+'</td><td>'+fmtDate(q.endDate)+'</td><td><button onclick="openEditQuarter(\''+q.id+'\')">Изменить</button> <button class="danger" onclick="deleteQuarter(\''+q.id+'\')">Удалить</button></td></tr>').join('')+'</table>':'<div class="empty">Четверти пока не заданы.</div>'))+
  sCard('Блокировки расписания (каникулы, выходные)',
  '<div class="toolbar" style="margin-bottom:10px"><button class="primary" onclick="openAddBlock()">＋ Добавить блокировку</button></div>'+
  (D.scheduleBlocks.length?'<table class="table"><tr><th>Причина</th><th>С</th><th>По</th><th>Уроки</th><th></th></tr>'+
   D.scheduleBlocks.map(b=>'<tr><td>'+e(b.reason)+'</td><td>'+fmtDate(b.startDate)+'</td><td>'+fmtDate(b.endDate)+'</td><td>'+(b.lessonNumbers&&b.lessonNumbers.length?b.lessonNumbers.join(', '):'весь день')+'</td><td><button class="danger" onclick="deleteBlock(\''+b.id+'\')">Удалить</button></td></tr>').join('')+'</table>':'<div class="empty">Блокировок пока нет.</div>'));
}
function toggleShowSaturday(val){D.settings.showSaturday=val;save();render()}
function openAddQuarter(){
 setModalHtml('Новая четверть',
  '<label>Название</label><input id="q-name" placeholder="1 четверть">'+
  '<label>С</label><input id="q-start" type="date">'+
  '<label>По</label><input id="q-end" type="date">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveNewQuarter()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveNewQuarter(){
 let name=document.getElementById('q-name').value.trim(),start=document.getElementById('q-start').value,end=document.getElementById('q-end').value;
 if(!name||!start||!end){alert('Заполните название и обе даты.');return}
 D.settings.quarters.push({id:uid(),name,startDate:start,endDate:end});
 save();closeModal();render();
}
function openEditQuarter(id){
 let q=D.settings.quarters.find(x=>x.id===id);
 setModalHtml('Четверть',
  '<label>Название</label><input id="q-name" value="'+e(q.name)+'">'+
  '<label>С</label><input id="q-start" type="date" value="'+e(q.startDate)+'">'+
  '<label>По</label><input id="q-end" type="date" value="'+e(q.endDate)+'">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditQuarter(\''+id+'\')">Сохранить</button><button class="danger" onclick="deleteQuarter(\''+id+'\')">Удалить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveEditQuarter(id){
 let q=D.settings.quarters.find(x=>x.id===id);
 q.name=document.getElementById('q-name').value.trim();q.startDate=document.getElementById('q-start').value;q.endDate=document.getElementById('q-end').value;
 save();closeModal();render();
}
function deleteQuarter(id){if(!confirm('Удалить четверть?'))return;D.settings.quarters=D.settings.quarters.filter(x=>x.id!==id);save();closeModal();render()}
function openAddBlock(){
 setModalHtml('Новая блокировка расписания',
  '<label>Название/причина</label><input id="b-reason" placeholder="Каникулы">'+
  '<label>С</label><input id="b-start" type="date">'+
  '<label>По</label><input id="b-end" type="date">'+
  '<label>Номера уроков (через запятую, пусто = весь день)</label><input id="b-nums" placeholder="1,2,3">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveBlock()">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveBlock(){
 let reason=document.getElementById('b-reason').value.trim(),start=document.getElementById('b-start').value,end=document.getElementById('b-end').value||start;
 if(!reason||!start){alert('Укажите название и дату.');return}
 let numsRaw=document.getElementById('b-nums').value.trim();
 let nums=numsRaw?numsRaw.split(',').map(x=>+x.trim()).filter(Boolean):[];
 D.scheduleBlocks.push({id:uid(),reason,startDate:start,endDate:end,lessonNumbers:nums});
 save();closeModal();render();
}
function deleteBlock(id){if(!confirm('Удалить блокировку?'))return;D.scheduleBlocks=D.scheduleBlocks.filter(b=>b.id!==id);save();render()}

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

/* ---- Размещение урока из библиотеки сразу на несколько классов ---- */
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

/* ---- Формальное расписание (нагрузка) ---- */
function openEditFormalSchedule(){
  let days=D.settings.showSaturday?6:5;
  let dayLabels=DAY_NAMES.slice(0,days);
  let classesHtml=sortedClasses(D.classes).map(c=>'<option value="'+c.id+'">'+e(c.name)+'</option>').join('');
  let grid='';
  dayLabels.forEach((dn,di)=>{
   grid+='<div style="display:flex;flex-direction:column;gap:3px"><div style="font-weight:600;color:var(--color-text-secondary);font-size:12px;text-transform:uppercase;letter-spacing:.05em">'+dn+'</div>'+
    LESSON_TIMES.map(t=>'<div style="display:flex;gap:5px;align-items:center"><span style="width:28px;text-align:right;font-size:11px;color:var(--color-text-secondary)">'+t.n+'.</span><select style="flex:1;padding:6px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text-primary);font-size:12px" onchange="setFormalSlot('+di+','+t.n+',this.value)"><option value="">—</option>'+classesHtml+'</select></div>').join('')+
   '</div>';
  });
  setModalHtml('Формальное расписание',
   '<div style="display:flex;gap:16px;flex-wrap:wrap">'+grid+'</div>'+
   '<p class="muted small" style="margin-top:12px">Выберите класс для каждого урока в каждый день. Пусто — урока нет. Кружки и секции отображаются автоматически из классов с типом «club».</p>'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal()">Закрыть</button></div>',true);
}
function setFormalSlot(day,lessonNum,classId){
  let idx=D.settings.formalSchedule.findIndex(x=>x.day===day&&x.lessonNum===lessonNum);
  if(classId){
   let cls=C(classId);
   if(idx>=0){D.settings.formalSchedule[idx].classId=classId;D.settings.formalSchedule[idx].className=cls?cls.name:''}
   else D.settings.formalSchedule.push({day,lessonNum,classId,className:C(classId)?C(classId).name:''});
  }else{
   if(idx>=0)D.settings.formalSchedule.splice(idx,1);
  }
  save();
}

