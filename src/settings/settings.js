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
  sCard('Режим оформления','<div class="toolbar">'+
   '<button class="'+(D.settings.colorMode!=='dark'?'primary':'')+'" onclick="setColorMode(\'light\')">☀ Светлая</button>'+
   '<button class="'+(D.settings.colorMode==='dark'?'primary':'')+'" onclick="setColorMode(\'dark\')">🌙 Тёмная</button>'+
   '</div>')+
  sCard('Акцентный цвет и темы',themeSwatchesHtml('','Обычные')+
  Object.keys(THEME_GROUP_LABELS).map(g=>themeSwatchesHtml(g,THEME_GROUP_LABELS[g])).join('')+
  '<div style="margin-top:14px"><label>Свой цвет (любой из палитры)</label><div class="row" style="align-items:center"><input type="color" style="width:60px;height:38px;padding:2px;flex:0" value="'+e(D.settings.accentColor||'#007aff')+'" onchange="setCustomAccent(this.value)"><button onclick="clearCustomAccent()">Сбросить до темы</button></div></div>')+
  sCard('Плотность интерфейса','<div class="toolbar">'+
   '<button class="'+(D.settings.compact?'':'primary')+'" onclick="setCompact(false)">Обычная</button>'+
   '<button class="'+(D.settings.compact?'primary':'')+'" onclick="setCompact(true)">Компактная</button>'+
   '</div>')+
  sCard('🍂 Частицы и фон по теме','<p class="muted small">Лёгкий фоновый узор и анимированные летящие иконки (листья, снег, тыквы, флаги, глобусы и т.д.) — подбираются автоматически по выбранной теме оформления выше (страна/предмет/яркая тема) или, если выбран обычный цвет, по времени года.</p><div class="toolbar">'+
   Object.keys(SEASON_LABELS).map(k=>'<button class="'+(D.settings.season===k?'primary':'')+'" onclick="setSeason(\''+k+'\')">'+SEASON_LABELS[k]+'</button>').join('')+
   '</div><label class="attrow" style="cursor:pointer;margin-top:10px"><span>Анимированные летящие частицы</span><input type="checkbox" '+(D.settings.seasonEffects?'checked':'')+' style="width:auto" onchange="toggleSeasonEffects(this.checked)"></label>'+
   '<div class="toolbar" style="margin-top:8px">'+Object.keys(PARTICLE_DENSITY_LABELS).map(k=>'<button class="'+((D.settings.particleDensity||'medium')===k?'primary':'')+'" onclick="setParticleDensity(\''+k+'\')">'+PARTICLE_DENSITY_LABELS[k]+'</button>').join('')+'</div>'+
   '<label class="attrow" style="cursor:pointer;margin-top:10px"><span>Фоновые тематические картинки (узор за карточками и часами)</span><input type="checkbox" '+(D.settings.bgDecorations?'checked':'')+' style="width:auto" onchange="toggleBgDecorations(this.checked)"></label>'+
   '<p class="muted small">Сейчас действует: '+SEASON_LABELS[currentSeasonKey()]+(D.settings.season==='auto'?' (подобрано автоматически по месяцу)':'')+'</p>')+
  sCard('Шрифт интерфейса','<div class="toolbar">'+
   Object.keys(FONT_LABELS).map(k=>'<button class="'+((D.settings.fontFamily||'system')===k?'primary':'')+'" style="font-family:'+FONT_FAMILIES[k]+'" onclick="setFont(\''+k+'\')">'+FONT_LABELS[k]+'</button>').join('')+
   '</div>')+
  sCard('Скругление углов','<div class="toolbar">'+
   [['0','Острые'],['0.6','Слегка'],['1','Обычные'],['1.6','Скруглённые'],['2.2','Максимум']].map(o=>'<button class="'+((String(D.settings.radius===undefined?1:D.settings.radius))===o[0]?'primary':'')+'" onclick="setRadius('+o[0]+')">'+o[1]+'</button>').join('')+
   '</div>')+
  sCard('Стиль боковой панели','<div class="toolbar">'+
   '<button class="'+(D.settings.sidebarStyle!=='gradient'?'primary':'')+'" onclick="setSidebarStyle(\'solid\')">Сплошная</button>'+
   '<button class="'+(D.settings.sidebarStyle==='gradient'?'primary':'')+'" onclick="setSidebarStyle(\'gradient\')">Градиент (в акцентный цвет)</button>'+
   '</div>')+
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
function themeSwatchesHtml(group,groupLabel){
 let list=THEMES.filter(t=>(t.group||'')===group);
 if(!list.length)return'';
 return '<div class="small muted" style="margin:'+(group?'14px':'0')+' 0 6px">'+e(groupLabel)+'</div><div class="themeswatches">'+list.map(t=>'<div class="swatch'+(D.settings.theme===t.key&&!D.settings.accentColor?' active':'')+'" style="background:'+(t.c2?'linear-gradient(135deg,'+t.c+','+t.c2+')':t.c)+'" onclick="setTheme(\''+t.key+'\')" title="'+e(t.label||t.key)+'">'+(t.emoji?'<span class="swatch-emoji">'+t.emoji+'</span>':'')+'</div>').join('')+'</div>';
}
function setTheme(key){D.settings.theme=key;D.settings.accentColor='';save();render()}
function setCustomAccent(v){D.settings.accentColor=v;save();render()}
function clearCustomAccent(){D.settings.accentColor='';save();render()}
function setColorMode(m){D.settings.colorMode=m;save();render()}
function setTeacherName(v){D.settings.teacherName=v.trim();save()}
function setPointsThreshold(v){D.settings.pointsThreshold=Math.max(1,+v||5);save()}
function setCompact(v){D.settings.compact=v;save();render()}
function settingsScheduleTab(){
 return sCard('Дни недели в расписании',
  '<label class="attrow" style="cursor:pointer"><span>Показывать субботу как учебный день</span><input type="checkbox" '+(D.settings.showSaturday?'checked':'')+' style="width:auto" onchange="toggleShowSaturday(this.checked)"></label>'+
  '<p class="muted small">Если выключить — суббота уберётся из недельного расписания, свободной таблицы «Расписание класса» и списка дней для авторасстановки.</p>')+
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
