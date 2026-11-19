/* ===================== ГЛАВНАЯ / РАСПИСАНИЕ ===================== */
/* ===================== ГЛАВНАЯ: ВИДЖЕТЫ-КОНСТРУКТОР ===================== */
function stripTime(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function bdayDiff(dateStr){
 if(!dateStr)return null;
 let b=new Date(dateStr+'T12:00:00');
 let today=stripTime(new Date());
 let y=today.getFullYear();
 let cands=[new Date(y-1,b.getMonth(),b.getDate()),new Date(y,b.getMonth(),b.getDate()),new Date(y+1,b.getMonth(),b.getDate())];
 let diffs=cands.map(c=>Math.round((c-today)/86400000));
 return diffs.reduce((best,d)=>Math.abs(d)<Math.abs(best)?d:best);
}
function classHasBirthdayToday(classId){
 return D.students.some(s=>s.status!=='archived'&&(s.classIds||[]).includes(classId)&&s.customFields.birthDate&&bdayDiff(s.customFields.birthDate)===0);
}
function fmtClockTime(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function fmtClockDate(d){let s=d.toLocaleDateString('ru-RU',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)}
function schoolYearProgress(){
  let ay=D.settings.academicYear||'2026–2027';
  let m=String(ay).match(/(\d{4})/g);
  if(!m)return 0;
  let startY=+m[0];
  let start=new Date(startY,8,1); // Sept 1
  let endY=m.length>1?+m[1]:startY+1;
  let end=new Date(endY,4,31); // May 31
  let now=new Date();
  if(now<start)return 0;
  if(now>end)return 100;
  return Math.round((now-start)/(end-start)*100);
}
function widgetClock(){
  let city=D.settings.weatherCity||WEATHER_DEFAULT_CITY;
  let coords=WEATHER_CITY_COORDS[city]||WEATHER_CITY_COORDS[WEATHER_DEFAULT_CITY];
  let w=S.weather&&S.weather.city===city?S.weather.data:null;
  let temp=w?Math.round(w.temperature_2m):'–';
  let progress=schoolYearProgress();
  return '<div class="card home-header-card" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;flex-wrap:wrap">'+
   '<div class="home-progress" style="flex:1;min-width:160px;text-align:left">'+
    '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-hover);margin-bottom:6px">Учебный год</div>'+
    '<div style="font-size:20px;font-weight:700;color:var(--color-text-primary);margin-bottom:6px">'+progress+'%</div>'+
    '<div class="progress-track"><div class="progress-fill" style="width:'+progress+'%"></div></div>'+
   '</div>'+
   '<div class="home-clock" style="text-align:center;flex:0 0 auto">'+
    '<div id="live-clock" style="font-size:44px;font-weight:700;letter-spacing:1px;font-variant-numeric:tabular-nums">'+fmtClockTime(new Date())+'</div>'+
    '<div class="muted" style="margin-top:4px">'+fmtClockDate(new Date())+'</div>'+
   '</div>'+
   '<div class="home-weather click" onclick="openWeatherDetail()" style="flex:0 0 auto;text-align:right">'+
    '<div style="font-size:20px;font-weight:700;color:var(--color-text-primary)">'+temp+'°</div>'+
    '<div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px">'+e(city)+'</div>'+
   '</div>'+
  '</div>';
}
function startClockTicker(){
 if(window._clockInterval){clearInterval(window._clockInterval);window._clockInterval=null}
 window._clockInterval=setInterval(()=>{
  let el=document.getElementById('live-clock');
  if(!el){clearInterval(window._clockInterval);window._clockInterval=null;return}
  el.textContent=fmtClockTime(new Date());
 },30000);
}
function fetchWeather(){
 let city=D.settings.weatherCity||WEATHER_DEFAULT_CITY;
 let coords=WEATHER_CITY_COORDS[city]||WEATHER_CITY_COORDS[WEATHER_DEFAULT_CITY];
 let url='https://api.open-meteo.com/v1/forecast?latitude='+coords.lat+'&longitude='+coords.lon+'&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=auto';
 fetch(url).then(r=>r.json()).then(data=>{
  if(data&&data.current){
   let daily=data.daily&&data.daily.precipitation_probability_max?data.daily.precipitation_probability_max[0]:null;
   S.weather={city:city,data:{...data.current,precipProb:daily}};
   render();
  }
 }).catch(e=>{console.warn('Weather fetch failed:',e)});
}
function initWeather(){
 fetchWeather();
 setInterval(fetchWeather,10*60*1000);
}
function openWeatherDetail(){
 let city=D.settings.weatherCity||WEATHER_DEFAULT_CITY;
 let w=S.weather&&S.weather.city===city?S.weather.data:null;
 if(!w){setModalHtml('Погода','<div class="empty">Данные о погоде ещё загружаются.</div><div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);return}
 let temp=Math.round(w.temperature_2m);
 let feels=Math.round(w.apparent_temperature||w.temperature_2m);
 let humidity=w.relative_humidity_2m||'–';
 let pressure=w.pressure_msl?Math.round(w.pressure_msl):'–';
 let wind=Math.round(w.wind_speed_10m||0);
 let precip=w.precipProb!==null?w.precipProb+'%':'–';
 let condition=weatherCondition(w.weather_code);
 let label=WEATHER_LABELS[condition];
 let emoji=WEATHER_EMOJI[condition];
 setModalHtml('Погода в '+e(city),
  '<div class="grid" style="gap:16px">'+
   '<div class="card" style="text-align:center;padding:24px">'+
    '<div class="weather-anim weather-'+condition+'" style="font-size:56px;line-height:1;margin-bottom:8px">'+emoji+'</div>'+
    '<div style="font-size:32px;font-weight:700">'+temp+'°</div>'+
    '<div style="font-size:14px;color:var(--color-text-secondary);margin-top:2px">'+e(label)+' · '+e(city)+'</div>'+
   '</div>'+
   '<div class="card">'+
    '<table class="table">'+
     '<tr><td>Ощущается как</td><td><b>'+feels+'°</b></td></tr>'+
     '<tr><td>Влажность</td><td><b>'+humidity+'%</b></td></tr>'+
     '<tr><td>Давление</td><td><b>'+pressure+' гПа</b></td></tr>'+
     '<tr><td>Ветер</td><td><b>'+wind+' м/с</b></td></tr>'+
     '<tr><td>Вероятность осадков</td><td><b>'+precip+'</b></td></tr>'+
    '</table>'+
   '</div>'+
  '</div>'+
  '<div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);
}
function widgetSchedule(){
 let dates=weekDates(S.weekStart);
 let title=fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+' '+new Date(dates[dates.length-1]+'T12:00:00').getFullYear();
 return '<div class="card">'+
   '<div class="weeknav"><button onclick="shiftWeek(-1)">‹ Предыдущая неделя</button><span class="wk-title">'+title+'</span><button onclick="shiftWeek(1)">Следующая неделя ›</button><button onclick="curWeek()">Текущая неделя</button></div>'+
   scheduleTable(dates)+
  '</div>';
}
function fullSchedulePage(){
 let dates=weekDates(S.weekStart);
 let title=fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+' '+new Date(dates[dates.length-1]+'T12:00:00').getFullYear();
 return '<div class="top"><div><h1>Расписание</h1><div class="muted">Полное расписание недели: уроки, кружки/секции и совещания</div></div>'+
  '<div class="toolbar"><button onclick="openBulkCreateWeek()">＋ Быстро заполнить неделю</button><button class="primary" onclick="openNewLesson()">＋ Новый урок</button></div></div>'+
  '<div class="card">'+
   '<div class="weeknav"><button onclick="shiftWeek(-1)">‹ Предыдущая неделя</button><span class="wk-title">'+title+'</span><button onclick="shiftWeek(1)">Следующая неделя ›</button><button onclick="curWeek()">Текущая неделя</button></div>'+
   scheduleTable(dates)+
  '</div>';
}
function openBulkCreateWeek(){
 let dates=weekDates(S.weekStart);
 let dayLabels=dates.map((d,i)=>DAY_NAMES[i]+' '+fmtDateShort(d));
 setModalHtml('Быстро заполнить неделю',
  '<div class="notice">Создаёт пустые уроки без темы — просто занимают место в расписании. Тему и план вы позже впишете сами или подставите урок из библиотеки.</div>'+
  '<label>Класс</label><select id="bc-class">'+classOptionsHtml(null)+'</select>'+
  '<label>№ урока</label><select id="bc-num">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'">'+t.n+' ('+t.start+'–'+t.end+')</option>').join('')+'</select>'+
  '<label>Дни ('+fmtDateShort(dates[0])+' – '+fmtDateShort(dates[dates.length-1])+')</label>'+
  '<div class="checks">'+dates.map((d,i)=>'<label class="attrow" style="cursor:pointer"><span>'+e(dayLabels[i])+'</span><input type="checkbox" class="bc-day" data-date="'+d+'" checked style="width:auto"></label>').join('')+'</div>'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmBulkCreateWeek()">Создать</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmBulkCreateWeek(){
 let classId=document.getElementById('bc-class').value;
 let num=+document.getElementById('bc-num').value;
 let cls=C(classId);
 if(cls&&cls.type==='club'){alert('Быстрое заполнение недели работает только для обычных классов — у кружков свободное время, создайте их уроки вручную.');return}
 let time=timeFor(num);
 let created=0,skipped=[];
 document.querySelectorAll('.bc-day:checked').forEach(cb=>{
  let date=cb.dataset.date;
  let blk=findBlock(date,num);
  if(blk){skipped.push(fmtDate(date)+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(fmtDate(date)+' — слот уже занят');return}
  D.lessons.push({id:uid(),date,lessonNumber:num,startTime:time.start,endTime:time.end,classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]});
  created++;
 });
 save();closeModal();
 alert('Создано пустых уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
function widgetStats(){
 let planned=activeLessons().filter(l=>lessonStatus(l)==='red').length;
 let done=activeLessons().filter(l=>lessonStatus(l)==='green').length;
 let needsWork=activeLessons().filter(l=>lessonStatus(l)==='blue').length;
 return '<div class="grid">'+stat(D.classes.length,'Классов')+stat(D.students.filter(s=>s.status!=='archived').length,'Учеников')+
  stat(D.lessons.length,'Всего уроков')+stat(done,'🟢 Заполнено')+stat(needsWork,'🔵 Нужна рефлексия')+stat(planned,'🔴 Не подготовлено')+'</div>';
}
function widgetTasks(){
 S.homeTaskFilter=S.homeTaskFilter||{priority:'',status:'open',sort:'due'};
 let f=S.homeTaskFilter;
 let items=D.workTasks.filter(t=>(!f.priority||t.priority===f.priority)&&(f.status==='open'?t.status!=='done':f.status==='done'?t.status==='done':true));
 let sorters={
  due:(a,b)=>(a.dueDate||'9999-99-99').localeCompare(b.dueDate||'9999-99-99'),
  priority:(a,b)=>({high:0,med:1,low:2}[b.priority||'med'])-({high:0,med:1,low:2}[a.priority||'med']),
  title:(a,b)=>a.title.localeCompare(b.title,'ru')
 };
 items=[...items].sort(sorters[f.sort]||sorters.due);
 let today=toISO(new Date());
 return '<div class="card"><div class="top"><h2 style="margin-top:0">✅ Задачи</h2><a href="#" class="small" onclick="event.preventDefault();S.view=\'work\';S.workTab=\'tasks\';render()">Все задачи →</a></div>'+
  '<div class="row" style="margin-bottom:8px"><input id="todo-input" placeholder="Новая задача..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();addQuickTask()}"><button class="primary" style="flex:0" onclick="addQuickTask()">Добавить</button></div>'+
  '<div class="toolbar" style="margin-bottom:8px">'+
   '<select onchange="S.homeTaskFilter.status=this.value;render()"><option value="open"'+(f.status==='open'?' selected':'')+'>Незавершённые</option><option value="done"'+(f.status==='done'?' selected':'')+'>Завершённые</option><option value="all"'+(f.status==='all'?' selected':'')+'>Все</option></select>'+
   '<select onchange="S.homeTaskFilter.priority=this.value;render()"><option value="">Любой приоритет</option><option value="high"'+(f.priority==='high'?' selected':'')+'>Высокий</option><option value="med"'+(f.priority==='med'?' selected':'')+'>Средний</option><option value="low"'+(f.priority==='low'?' selected':'')+'>Низкий</option></select>'+
   '<select onchange="S.homeTaskFilter.sort=this.value;render()"><option value="due"'+(f.sort==='due'?' selected':'')+'>По сроку</option><option value="priority"'+(f.sort==='priority'?' selected':'')+'>По приоритету</option><option value="title"'+(f.sort==='title'?' selected':'')+'>По названию</option></select>'+
  '</div>'+
  (items.length?'<div class="checks">'+items.map(t=>{let overdue=t.dueDate&&t.dueDate<today&&t.status!=='done';return '<div class="attrow"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;margin:0"><input type="checkbox" style="width:auto" '+(t.status==='done'?'checked':'')+' onchange="toggleWorkTaskDone(\''+t.id+'\')"><span style="'+(t.status==='done'?'text-decoration:line-through;color:var(--muted)':'')+'">'+e(t.title)+'</span>'+(t.dueDate?' <span class="small '+(overdue?'danger':'muted')+'">· '+fmtDate(t.dueDate)+(overdue?' ⚠':'')+'</span>':'')+' <span class="badge '+priorityBadgeClass(t.priority)+'">'+priorityLabel(t.priority)+'</span></label><button onclick="deleteWorkTask(\''+t.id+'\')">✕</button></div>'}).join('')+'</div>':'<div class="muted small">Подходящих задач нет.</div>')+
  '</div>';
}
function addQuickTask(){
 let inp=document.getElementById('todo-input');
 let text=inp.value.trim();if(!text)return;
 D.workTasks.push({id:uid(),title:text,dueDate:'',priority:'med',status:'todo',notes:''});
 save();render();
}
function widgetBirthdays(){
 let items=[];
 D.students.filter(s=>s.status!=='archived'&&s.customFields.birthDate).forEach(s=>{
  let days=bdayDiff(s.customFields.birthDate);
  if(days>=-3&&days<=14)items.push({days,html:'<span class="click" onclick="openStudentPage(\''+s.id+'\')">'+studentFio(s)+' <span class="muted small">· '+e(studentClassNames(s))+'</span></span>'});
 });
 (D.colleagues||[]).filter(c=>colleagueField(c,'birthDate')).forEach(c=>{
  let days=bdayDiff(colleagueField(c,'birthDate'));
  if(days>=-3&&days<=14)items.push({days,html:'<span class="click" onclick="openColleagueCard(\''+c.id+'\')">'+colleagueFio(c)+' <span class="muted small">· коллега'+(colleagueField(c,'position')?', '+e(colleagueField(c,'position')):'')+'</span></span>'});
 });
 items.sort((a,b)=>a.days-b.days);
 function badgeFor(days){
  if(days===0)return'сегодня! 🎂';
  if(days===1)return'завтра';
  if(days>1)return'через '+days+' дн.';
  if(days===-1)return'вчера';
  return days+' дн. назад';
 }
 return '<div class="card"><h2 style="margin-top:0">🎂 Дни рождения</h2>'+
  (items.length?items.map(x=>'<div class="attrow">'+x.html+'<span class="badge'+(x.days<0?' muted':'')+'">'+badgeFor(x.days)+'</span></div>').join(''):'<div class="muted small">Ни сегодня, ни в ближайшие 2 недели, ни за последние 3 дня дней рождения нет (ни у учеников, ни у коллег).</div>')+
  '</div>';
}
const HOME_WIDGETS={
 clock:{label:'Часы и дата',render:widgetClock},
 schedule:{label:'Расписание недели',render:widgetSchedule},
 stats:{label:'Быстрые показатели',render:widgetStats},
 todo:{label:'Задачи',render:widgetTasks},
 birthdays:{label:'Ближайшие дни рождения',render:widgetBirthdays},
 recent:{label:'Последние уроки',render:recentLessonsCard}
};
function openHomeConfig(){
 let widgets=D.settings.homeWidgets;
 setModalHtml('Настроить главную страницу',
  '<div class="muted small" style="margin-bottom:10px">Выберите, что показывать на главной, и в каком порядке — как конструктор.</div>'+
  widgets.map((w,i)=>{let meta=HOME_WIDGETS[w.key];if(!meta)return'';return '<div class="fieldrow"><span class="toolbar" style="flex:0"><button '+(i===0?'disabled':'')+' onclick="moveHomeWidget('+i+',-1)">↑</button><button '+(i===widgets.length-1?'disabled':'')+' onclick="moveHomeWidget('+i+',1)">↓</button></span><span class="fname">'+e(meta.label)+'</span><label style="display:flex;align-items:center;gap:5px;margin:0;flex:0"><input type="checkbox" style="width:auto" '+(w.visible?'checked':'')+' onchange="toggleHomeWidget(\''+w.key+'\')"> показывать</label></div>'}).join('')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal();render()">Готово</button></div>');
}
function moveHomeWidget(i,dir){let arr=D.settings.homeWidgets;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();openHomeConfig()}
function toggleHomeWidget(key){let w=D.settings.homeWidgets.find(x=>x.key===key);w.visible=!w.visible;save();openHomeConfig()}

function homePage(){
 return '<div class="top"><div><h1>Главная</h1><div class="muted">Личный рабочий кабинет учителя</div></div>'+
  '<div class="toolbar"><button onclick="openHomeConfig()">⚙ Настроить главную</button><button class="primary" onclick="openNewLesson()">＋ Новый урок</button></div></div>'+
  backupReminderBanner()+
  (D.settings.homeWidgets||[]).filter(w=>w.visible&&HOME_WIDGETS[w.key]).map(w=>HOME_WIDGETS[w.key].render()).join('');
}
function recentLessonsCard(){
 S.recentFilter=S.recentFilter||{classId:'',status:'',sort:'date_desc',limit:10};
 let f=S.recentFilter;
 let ls=activeLessons().filter(l=>(!f.classId||groupIds(f.classId).includes(l.classId))&&(!f.status||lessonStatus(l)===f.status));
 let sorters={
  date_desc:(a,b)=>b.date.localeCompare(a.date),
  date_asc:(a,b)=>a.date.localeCompare(b.date),
  class:(a,b)=>(C(a.classId)?.name||'').localeCompare(C(b.classId)?.name||'','ru'),
  status:(a,b)=>({red:0,blue:1,green:2}[lessonStatus(a)])-({red:0,blue:1,green:2}[lessonStatus(b)])
 };
 ls=[...ls].sort(sorters[f.sort]||sorters.date_desc);
 let total=ls.length;
 ls=ls.slice(0,f.limit);
 return '<div class="card"><div class="top"><h2>Последние уроки</h2></div>'+
  '<div class="toolbar" style="margin-bottom:10px">'+
   '<select onchange="S.recentFilter.classId=this.value;render()"><option value="">Все классы</option>'+classOptionsHtml(f.classId)+'</select>'+
   '<select onchange="S.recentFilter.status=this.value;render()"><option value="">Любой статус</option><option value="red"'+(f.status==='red'?' selected':'')+'>🔴 Не подготовлено</option><option value="blue"'+(f.status==='blue'?' selected':'')+'>🔵 Нужна рефлексия</option><option value="green"'+(f.status==='green'?' selected':'')+'>🟢 Заполнено</option></select>'+
   '<select onchange="S.recentFilter.sort=this.value;render()"><option value="date_desc"'+(f.sort==='date_desc'?' selected':'')+'>Сначала новые</option><option value="date_asc"'+(f.sort==='date_asc'?' selected':'')+'>Сначала старые</option><option value="class"'+(f.sort==='class'?' selected':'')+'>По классу</option><option value="status"'+(f.sort==='status'?' selected':'')+'>По статусу</option></select>'+
  '</div>'+
  (ls.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Тема</th><th>Статус</th></tr>'+
   ls.map(l=>'<tr class="click" onclick="openLessonModal(\''+l.id+'\')"><td>'+fmtDate(l.date)+'</td><td>'+e(C(l.classId)?.name||'—')+'</td><td>'+e(l.topic||'(без темы)')+'</td><td>'+statusBadge(l)+'</td></tr>').join('')+
   '</table>'+(total>f.limit?'<div class="toolbar" style="margin-top:8px"><button onclick="S.recentFilter.limit+=10;render()">Показать ещё ('+(total-f.limit)+')</button></div>':''):'<div class="empty">Уроков по этим условиям не найдено.</div>')+
  '</div>';
}
function statusBadge(l){let s=lessonStatus(l);return '<span class="badge '+s+'"><span class="dot '+s+'"></span>'+statusLabel(s)+'</span>'}
function shiftWeek(dir){S.weekStart=addDays(S.weekStart,7*dir);render()}
function curWeek(){S.weekStart=mondayOf(toISO(new Date()));render()}
function timeToMin(t){if(!t)return null;let p=String(t).split(':');let h=+p[0],m=+p[1];if(isNaN(h)||isNaN(m))return null;return h*60+m}
function scheduleTable(dates){
 let todayStr=toISO(new Date());
 let now=new Date();
 let nowMinutes=now.getHours()*60+now.getMinutes();
 let todayIndex=dates.indexOf(todayStr);
 function nowMarkerRow(){
  return '<tr class="now-row"><td class="numcol"></td>'+dates.map((d,i)=>'<td>'+(i===todayIndex?'<div class="now-line" title="Сейчас"></div>':'')+'</td>').join('')+'</tr>';
 }
 let periodRows=LESSON_TIMES.map(t=>({t,startMin:timeToMin(t.start),endMin:timeToMin(t.end)}));
 let rowsHtml='';
 if(todayIndex>=0&&periodRows.length&&nowMinutes<periodRows[0].startMin)rowsHtml+=nowMarkerRow();
 periodRows.forEach((pr,idx)=>{
  let t=pr.t;
  let cells=dates.map((d,di)=>{
   let isToday=di===todayIndex;
   let isPast=(d<todayStr)||(isToday&&nowMinutes>=pr.endMin);
   let blk=findBlock(d,t.n);
   let tdClass=isToday?' class="today-col"':'';
   if(blk)return '<td'+tdClass+'><div class="cell blocked'+(isPast?' cell-past':'')+'">'+e(blk.reason).toUpperCase()+'</div></td>';
   let l=activeLessons().find(x=>x.date===d&&+x.lessonNumber===t.n);
   if(l){let st=lessonStatus(l);let cls=C(l.classId);
    let flags=(l.flagPractice?'🧪':'')+(l.flagTest?'📝':'');
    let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
    return '<td'+tdClass+'><div class="cell st-'+st+(isPast?' cell-past':'')+'" onclick="openLessonModal(\''+l.id+'\')"><span class="cls">'+e(cls?cls.name:'—')+(flags?' '+flags:'')+cake+'</span><span>'+(l.cancelled?'🚫 Отменён':e(l.topic||'(без темы)'))+'</span></div></td>';
   }
   return '<td'+tdClass+'><div class="cell empty-cell'+(isPast?' cell-past':'')+'" onclick="quickCreateLesson(\''+d+'\','+t.n+')">+</div></td>';
  }).join('');
  rowsHtml+='<tr><td class="numcol">'+t.n+'<br><span class="small">'+t.start+'–'+t.end+'</span></td>'+cells+'</tr>';
  if(todayIndex>=0){
   let nextStart=idx+1<periodRows.length?periodRows[idx+1].startMin:null;
   if(nowMinutes>=pr.endMin&&(nextStart===null||nowMinutes<nextStart))rowsHtml+=nowMarkerRow();
  }
 });
 let clubsRow='<tr><td class="numcol" style="font-size:10.5px">Кружки / секции</td>'+dates.map((d,di)=>{
  let isToday=di===todayIndex;
  let items=activeLessons().filter(x=>x.date===d&&!x.lessonNumber&&C(x.classId)&&C(x.classId).type==='club').sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));
  if(!items.length)return '<td'+(isToday?' class="today-col"':'')+'></td>';
  return '<td'+(isToday?' class="today-col"':'')+' style="vertical-align:top;padding:4px"><div style="display:flex;flex-direction:column;gap:3px">'+
   items.map(l=>{let cls=C(l.classId);let st=lessonStatus(l);let isPast=(d<todayStr)||(isToday&&l.endTime&&nowMinutes>=timeToMin(l.endTime));
    let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
    return '<div class="cell st-'+st+(isPast?' cell-past':'')+'" style="padding:4px 6px;font-size:11px" onclick="openLessonModal(\''+l.id+'\')"><b>'+e(l.startTime||'')+(l.endTime?'–'+e(l.endTime):'')+'</b> '+e(cls?cls.name:'')+cake+' — '+e(l.topic||'(без темы)')+'</div>';
   }).join('')+
   '</div></td>';
 }).join('')+'</tr>';
 let meetingsRow='<tr><td class="numcol" style="font-size:10.5px">Совещания</td>'+dates.map((d,di)=>{
  let isToday=di===todayIndex;
  let ms=D.meetings.filter(m=>m.date===d);
  if(!ms.length)return '<td'+(isToday?' class="today-col"':'')+'></td>';
  return '<td'+(isToday?' class="today-col"':'')+' style="vertical-align:top;padding:4px"><div style="display:flex;flex-direction:column;gap:3px">'+
   ms.map(m=>'<div class="meeting-chip" onclick="openEditMeeting(\''+m.id+'\')">🗓 '+(m.time?e(m.time)+' ':'')+e(m.title)+'</div>').join('')+
   '</div></td>';
 }).join('')+'</tr>';
 let header='<tr><th class="numcol">№</th>'+dates.map((d,i)=>'<th'+(i===todayIndex?' class="today-col"':'')+'>'+DAY_NAMES[i]+' '+fmtDateShort(d)+(i===todayIndex?'<br><span class="badge blue" style="font-size:9px">СЕГОДНЯ</span>':'')+'</th>').join('')+'</tr>';
 return '<div style="overflow-x:auto"><table class="sched" style="min-width:760px">'+header+rowsHtml+clubsRow+meetingsRow+'</table></div>';
}

