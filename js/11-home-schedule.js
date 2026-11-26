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
function quickCreateClub(date){
  let clubs=sortedClasses(D.classes.filter(c=>c.type==='club'));
  if(!clubs.length){alert('Сначала создайте кружок/секцию в «＋ Новый урок» → Кружок/секция.');return}
  if(!checkNotBlocked(date,null))return;
  let opts=clubs.map(c=>'<option value="'+c.id+'">'+e(c.name)+'</option>').join('');
  setModalHtml('Новое занятие кружка/секции','<div class="notice">'+fmtDate(date)+' · '+DAY_NAMES[dayIndexOfDate(date)]+'</div>'+
   '<label>Кружок / секция</label><select id="qc-club">'+opts+'</select>'+
   '<label>Время начала</label><input id="qc-start" type="time" value="15:30">'+
   '<label>Время окончания</label><input id="qc-end" type="time" value="16:10">'+
   '<label>Тема</label><input id="qc-topic" placeholder="Тема занятия">'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="quickCreateClubConfirm(\''+date+'\')">Создать</button><button onclick="closeModal()">Отмена</button></div>');
}
function quickCreateClubConfirm(date){
  let classId=document.getElementById('qc-club').value;
  let startTime=document.getElementById('qc-start').value;
  let endTime=document.getElementById('qc-end').value;
  let topic=document.getElementById('qc-topic').value.trim();
  if(!startTime||!endTime){alert('Укажите время начала и окончания.');return}
  let l={id:uid(),date,lessonNumber:null,startTime,endTime,classId,topic,customFields:{},attendance:{},grades:{},materialIds:[]};
  D.lessons.push(l);save();closeModal();openLessonModal(l.id);
}
function quickCreateMeeting(date){
  setModalHtml('Новое совещание','<div class="notice">'+fmtDate(date)+' · '+DAY_NAMES[dayIndexOfDate(date)]+'</div>'+
   '<label>Тема</label><input id="mt-title" placeholder="Педсовет">'+
   '<label>Время</label><input id="mt-time" placeholder="15:30">'+
   '<label>Место / формат</label><input id="mt-loc" placeholder="Каб. 204 / Zoom">'+
   '<label>Участники</label><input id="mt-part" placeholder="Завуч, кл. руководители 5-х классов">'+
   '<label>Повестка / заметки</label><textarea id="mt-agenda" class="autosize"></textarea>'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="quickCreateMeetingConfirm(\''+date+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
  initAutosize();
}
function quickCreateMeetingConfirm(date){
  let title=document.getElementById('mt-title').value.trim();
  let time=document.getElementById('mt-time').value.trim();
  let location=document.getElementById('mt-loc').value.trim();
  let participants=document.getElementById('mt-part').value.trim();
  let agenda=document.getElementById('mt-agenda').value;
  if(!title){alert('Укажите тему совещания.');return}
  D.meetings.push({id:uid(),title,date,time,location:document.getElementById('mt-loc').value.trim(),participants:document.getElementById('mt-part').value.trim(),agenda:document.getElementById('mt-agenda').value});
  save();closeModal();render();
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
  let condition=w?weatherCondition(w.weather_code):'cloudy';
  let progress=schoolYearProgress();
  return '<div class="card home-header-card" style="position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px">'+
   '<div class="weather-bg weather-'+condition+'" style="position:absolute;inset:0;z-index:0;pointer-events:none"></div>'+
   '<div class="click" onclick="openSchoolYearDetail()" style="position:relative;z-index:2;flex:1;max-width:170px;text-align:left">'+
    '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-hover);margin-bottom:6px">Учебный год</div>'+
    '<div style="font-size:20px;font-weight:700;color:var(--color-text-primary);margin-bottom:6px">'+progress+'%</div>'+
    '<div class="progress-track"><div class="progress-fill" style="width:'+progress+'%"></div></div>'+
   '</div>'+
   '<div class="home-clock" style="position:absolute;left:50%;transform:translateX(-50%);text-align:center;z-index:2">'+
    '<div id="live-clock" style="font-size:44px;font-weight:700;letter-spacing:1px;font-variant-numeric:tabular-nums">'+fmtClockTime(new Date())+'</div>'+
    '<div class="muted" style="margin-top:4px">'+fmtClockDate(new Date())+'</div>'+
   '</div>'+
   '<div class="home-weather click" onclick="openWeatherDetail()" style="position:relative;z-index:2;flex:1;max-width:260px;text-align:center">'+
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
function openSchoolYearDetail(){
  let ay=D.settings.academicYear||'2026–2027';
  let m=String(ay).match(/(\d{4})/g);
  if(!m){setModalHtml('Учебный год','<div class="empty">Учебный год не задан.</div><div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);return}
  let startY=+m[0];
  let endY=m.length>1?+m[1]:startY+1;
  let start=new Date(startY,8,1);
  let end=new Date(endY,4,31);
  let now=new Date();
  let progress=schoolYearProgress();
  let yearLessons=activeLessons().filter(l=>{
    let d=new Date(l.date+'T12:00:00');
    return !isNaN(d)&&d>=start&&d<=end;
  });
  let todayStr=toISO(now);
  let passedLessons=yearLessons.filter(l=>l.date<=todayStr).length;
  let remainingLessons=yearLessons.filter(l=>l.date>todayStr).length;
  let totalWeeks=Math.ceil((end-start)/(7*24*60*60*1000));
  let passedWeeks=Math.floor((now-start)/(7*24*60*60*1000));
  let remainingWeeks=Math.ceil((end-now)/(7*24*60*60*1000));
  let daysLeft=Math.ceil((end-now)/(24*60*60*1000));
  setModalHtml('Учебный год '+ay,
   '<div class="grid" style="gap:16px">'+
   '<div class="card" style="text-align:center;padding:20px">'+
   '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-hover);margin-bottom:6px">Прогресс учебного года</div>'+
   '<div style="font-size:32px;font-weight:700;color:var(--color-text-primary);margin-bottom:6px">'+progress+'%</div>'+
   '<div class="progress-track"><div class="progress-fill" style="width:'+progress+'%"></div></div>'+
   '<div class="muted" style="margin-top:8px">'+fmtDate(start)+' — '+fmtDate(toISO(end))+'</div>'+
   '</div>'+
   '<div class="card">'+
   '<div class="mgrid">'+
   '<div class="mstat"><div class="mv">'+passedLessons+'</div><div class="ml">Уроков прошло</div></div>'+
   '<div class="mstat"><div class="mv">'+remainingLessons+'</div><div class="ml">Уроков осталось</div></div>'+
   '<div class="mstat"><div class="mv">'+passedWeeks+'</div><div class="ml">Недель прошло</div></div>'+
   '<div class="mstat"><div class="mv">'+Math.max(0,remainingWeeks)+'</div><div class="ml">Недель осталось</div></div>'+
   '<div class="mstat"><div class="mv">'+Math.max(0,daysLeft)+' дн.</div><div class="ml">До конца года</div></div>'+
   '</div>'+
   '</div>'+
   '</div>'+
   '<div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);
}
function openFormalScheduleModal(){
  let days=D.settings.showSaturday?6:5;
  let dayNamesFull=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'].slice(0,days);
  let dayShort=DAY_NAMES.slice(0,days);
  let schedule={};
  (D.settings.formalSchedule||[]).forEach(s=>{let key=s.day+'|'+s.lessonNum;(schedule[key]=schedule[key]||[]).push(s)});
  let clubsByDay={};
  D.classes.filter(c=>c.type==='club').forEach(c=>{
   let seenDays={};
   D.lessons.filter(l=>l.classId===c.id&&!l.lessonNumber).forEach(l=>{
    let d=new Date(l.date+'T12:00:00');
    if(isNaN(d))return;
    let day=dayIndexOfDate(l.date);
    if(day>=days)return;
    if(seenDays[day])return;
    seenDays[day]=true;
    (clubsByDay[day]=clubsByDay[day]||[]).push({className:c.name,startTime:l.startTime,endTime:l.endTime});
   });
  });
  let dayColW=Math.floor(700/days);
  let rows='';
  LESSON_TIMES.forEach(t=>{
   rows+='<tr>'+
    '<td style="font-weight:600;color:var(--color-text-secondary);text-align:center;width:34px">'+t.n+'</td>'+
    '<td style="font-size:11px;color:var(--color-text-secondary);text-align:center;width:74px"><div style="font-weight:600">'+t.start+'</div><div style="font-weight:400">'+t.end+'</div></td>'+
    dayNamesFull.map((dn,di)=>{
     let key=di+'|'+t.n;
     let items=(schedule[key]||[]);
     if(!items.length)return '<td style="height:30px;width:'+dayColW+'px"></td>';
     return '<td style="height:30px;font-size:11px;line-height:1.2;width:'+dayColW+'px">'+
      items.map(it=>'<div style="padding:2px 4px;border-radius:4px;background:var(--color-surface-elevated);border:1px solid var(--color-border);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+e(it.className)+'</div>').join('')+'</td>';
    }).join('')+'</tr>';
  });
  let clubsHtml='';
  dayShort.forEach((dn,di)=>{
   let items=(clubsByDay[di]||[]);
   if(items.length){
    clubsHtml+='<div style="margin-top:8px"><div style="font-weight:600;color:var(--color-text-secondary);font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">'+dn+'</div>'+
     items.map(it=>'<div style="padding:3px 6px;border-radius:4px;background:rgb(91 141 239 / .1);border:1px solid var(--color-accent);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.3">🔸 '+e(it.className)+(it.startTime?' <span style="font-size:10px;color:var(--color-text-secondary)">'+it.startTime+(it.endTime?'–'+it.endTime:'')+'</span>':'')+'</div>').join('')+'</div>';
   }
  });
  let head='<tr><th style="width:34px">№</th><th style="text-align:center;width:74px">Время</th>'+dayShort.map(dn=>'<th style="text-align:center;width:'+dayColW+'px">'+dn+'</th>').join('')+'</tr>';
  setModalHtml('Моё расписание',
   '<div style="max-height:70vh;overflow:auto">'+
   '<table class="table" style="font-size:13px;table-layout:fixed;width:100%">'+head+rows+'</table>'+
   (clubsHtml?'<div style="margin-top:14px;border-top:1px solid var(--color-border);padding-top:12px">'+clubsHtml+'</div>':'')+
   '</div>'+
   '<div class="toolbar" style="margin-top:14px;gap:8px">'+
   '<button class="primary" onclick="createWeekLessonsFromFormal()">Проставить на неделю</button>'+
   '<button onclick="closeModal()">Закрыть</button>'+
   '</div>',true);
}
function createWeekLessonsFromFormal(){
  let days=D.settings.showSaturday?6:5;
  let now=new Date();
  let todayStr=toISO(now);
  let nowMinutes=now.getHours()*60+now.getMinutes();
  let monday=mondayOf(todayStr);
  let dates=weekDates(monday).filter((d,i)=>i<days);
  let created=0,skipped=[];
  dates.forEach(d=>{
   let day=dayIndexOfDate(d);
   if(day>=days)return;
   LESSON_TIMES.forEach(t=>{
    let key=day+'|'+t.n;
    let slots=(D.settings.formalSchedule||[]).filter(s=>s.day===day&&s.lessonNum===t.n);
    slots.forEach(s=>{
     let blk=findBlock(d,t.n);
     if(blk){skipped.push(fmtDate(d)+' '+t.n+'-й — заблокировано («'+blk.reason+'»)');return}
     if(activeLessons().find(x=>x.date===d&&+x.lessonNumber===t.n)){skipped.push(fmtDate(d)+' '+t.n+'-й — слот занят');return}
     D.lessons.push({id:uid(),date:d,lessonNumber:t.n,startTime:t.start,endTime:t.end,classId:s.classId,topic:'',customFields:{},attendance:{},grades:{},materialIds:[]});
     created++;
    });
   });
  });
  save();closeModal();
  alert('Создано уроков на будущую неделю: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
  render();
}
function widgetSchedule(){
 let dates=weekDates(S.weekStart);
 let todayStr=toISO(new Date());
 let now=new Date();
 let nowMinutes=now.getHours()*60+now.getMinutes();
 let todayIndex=dates.indexOf(todayStr);
 let head='';
 dates.forEach((d,i)=>{
  let isToday=i===todayIndex;
  let dayNameFull=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'][i];
  head+='<div class="ws-dayhead'+(isToday?' ws-today':'')+'">'+
   '<div class="ws-dayname">'+dayNameFull+'</div>'+
   '<div class="ws-daydate">'+fmtDateShort(d)+'</div>'+
   (isToday?'<div class="ws-today-label">сегодня</div>':'')+
  '</div>';
 });
 let body='';
 LESSON_TIMES.forEach(t=>{
  let endMin=timeToMin(t.end);
  body+='<div class="ws-time"><div class="ws-num">'+t.n+'</div><div class="ws-times"><span class="ws-start">'+t.start+'</span><span class="ws-end">'+t.end+'</span></div></div>';
  dates.forEach((d,i)=>{
   let isToday=i===todayIndex;
   let isPast=(d<todayStr)||(isToday&&nowMinutes>=endMin);
   let blk=findBlock(d,t.n);
   if(blk){body+='<div class="ws-cell ws-blocked" title="'+e(blk.reason)+'">'+e(blk.reason).toUpperCase()+'</div>';return}
   let l=activeLessons().find(x=>x.date===d&&+x.lessonNumber===t.n);
   if(l){
    let st=lessonStatus(l);let cls=C(l.classId);
    let flags=(l.flagPractice?'🧪':'')+(l.flagTest?'📝':'');
    let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
    body+='<div class="ws-cell ws-st-'+st+(isToday?' ws-today-cell':'')+' click" onclick="openLessonModal(\''+l.id+'\')">'+
     '<div class="ws-cls">'+e(cls?cls.name:'—')+(flags?' '+flags:'')+cake+'</div>'+
     '<div class="ws-topic">'+(l.cancelled?'🚫 Отменён':e(l.topic||'(без темы)'))+'</div>'+
    '</div>';
    return
   }
   body+='<div class="ws-cell ws-empty click" onclick="quickCreateLesson(\''+d+'\','+t.n+')">+</div>';
  });
 });
let clubsHtml='<div class="ws-extra-time-col"></div>';
  let hasClubs=false;
  dates.forEach((d,i)=>{
   let isToday=i===todayIndex;
   let items=activeLessons().filter(x=>x.date===d&&!x.lessonNumber&&C(x.classId)&&C(x.classId).type==='club').sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));
   if(items.length){
    hasClubs=true;
    clubsHtml+='<div class="ws-extra-col'+(isToday?' ws-today-col':'')+'"><div style="display:flex;flex-direction:column;gap:3px">'+
     items.map(l=>{
      let cls=C(l.classId);let st=lessonStatus(l);
      let isPast=(d<todayStr)||(isToday&&l.endTime&&nowMinutes>=timeToMin(l.endTime));
      let cake=(isToday&&d===todayStr&&classHasBirthdayToday(l.classId))?' 🎂':'';
      return '<div class="ws-extra-item ws-st-'+st+(isPast?' ws-past':'')+' click" onclick="openLessonModal(\''+l.id+'\')"><b>'+e(l.startTime||'')+(l.endTime?'–'+e(l.endTime):'')+'</b> '+e(cls?cls.name:'')+cake+' — '+e(l.topic||'(без темы)')+'</div>';
     }).join('')+
    '</div></div>';
   }else{
    clubsHtml+='<div class="ws-extra-col'+(isToday?' ws-today-col':'')+'"><div class="ws-extra-empty click" onclick="quickCreateClub(\''+d+'\')">+</div></div>';
   }
  });
  let meetingsHtml='<div class="ws-extra-time-col"></div>';
  let hasMeetings=false;
  dates.forEach((d,i)=>{
   let isToday=i===todayIndex;
   let ms=D.meetings.filter(m=>m.date===d);
   if(ms.length){
    hasMeetings=true;
    meetingsHtml+='<div class="ws-extra-col'+(isToday?' ws-today-col':'')+'"><div style="display:flex;flex-direction:column;gap:3px">'+
     ms.map(m=>'<div class="ws-meeting-item click" onclick="openEditMeeting(\''+m.id+'\')">🗓 '+(m.time?e(m.time)+' ':'')+e(m.title)+'</div>').join('')+
    '</div></div>';
   }else{
    meetingsHtml+='<div class="ws-extra-col'+(isToday?' ws-today-col':'')+'"><div class="ws-extra-empty click" onclick="quickCreateMeeting(\''+d+'\')">+</div></div>';
   }
  });
 let weekRange=fmtDateShort(dates[0])+' — '+fmtDateShort(dates[dates.length-1]);
 return '<div class="card ws-card">'+
  '<div class="ws-head">'+
   '<h2 style="margin:0">Расписание недели</h2>'+
   '<div class="ws-head-nav">'+
    '<button class="ws-arrow" onclick="shiftWeek(-1)">‹</button>'+
    '<span class="ws-title">'+weekRange+'</span>'+
    '<button class="ws-arrow" onclick="shiftWeek(1)">›</button>'+
   '</div>'+
   '<button class="ws-open" onclick="openFormalScheduleModal()">Моё расписание</button>'+
  '</div>'+
  '<div class="ws-grid" style="grid-template-columns:56px repeat('+dates.length+',1fr);gap:6px">'+
   '<div class="ws-headcell">№</div>'+head+
   body+
  '</div>'+
  (hasClubs?'<div class="ws-extra-section" style="grid-template-columns:56px repeat('+dates.length+',1fr);gap:6px">'+
   '<div class="ws-extra-label">Кружки / секции</div>'+clubsHtml+'</div>':'')+
  (hasMeetings?'<div class="ws-extra-section" style="grid-template-columns:56px repeat('+dates.length+',1fr);gap:6px">'+
   '<div class="ws-extra-label">Совещания</div>'+meetingsHtml+'</div>':
   '<div class="ws-extra-section ws-empty-section" style="grid-template-columns:56px repeat('+dates.length+',1fr);gap:6px">'+
   '<div class="ws-extra-label">Совещания</div>'+
   '<div class="ws-empty-msg" style="grid-column:2/-1;text-align:center;color:var(--color-text-secondary);padding:12px">Совещаний на этой неделе нет!</div></div>')+
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
function widgetTasks(){
  let items=[...D.workTasks].sort((a,b)=>{
    let sa=a.status==='done'?1:0,sb=b.status==='done'?1:0;
    if(sa!==sb)return sa-sb;
    return (a.dueDate||'9999-99-99').localeCompare(b.dueDate||'9999-99-99');
  });
  return '<div class="card"><div class="top" style="justify-content:space-between;align-items:center">'+
   '<h2 style="margin-top:0">Задачи</h2>'+
   '<button class="primary" onclick="openNewWorkTask()" style="flex:0;height:34px;width:34px;min-width:34px;min-height:34px;display:grid;place-items:center;font-size:18px;padding:0;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.15)">＋</button>'+
   '</div>'+
   (items.length?'<div class="checks">'+items.map(t=>{
    let overdue=t.dueDate&&t.dueDate<toISO(new Date())&&t.status!=='done';
    return '<div class="attrow" style="align-items:center;justify-content:space-between">'+
     '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;margin:0">'+
      '<input type="checkbox" style="width:auto" '+(t.status==='done'?'checked':'')+' onchange="toggleWorkTaskDone(\''+t.id+'\')">'+
      '<span style="'+(t.status==='done'?'text-decoration:line-through;color:var(--color-text-secondary)':'')+'">'+e(t.title)+'</span>'+
     '</label>'+
     '<div style="display:flex;align-items:center;gap:6px">'+
      (t.dueDate?'<span class="small '+(overdue?'danger':'muted')+'">'+fmtDate(t.dueDate)+(overdue?' ⚠':'')+'</span>':'')+
      '<span class="badge '+priorityBadgeClass(t.priority)+'">'+priorityLabel(t.priority)+'</span>'+
      '<button onclick="event.stopPropagation();openEditWorkTask(\''+t.id+'\')" style="background:none;border:none;padding:4px;font-size:14px;cursor:pointer;color:var(--color-text-secondary);display:inline-block;transform:rotate(90deg)">✎</button>'+
     '</div>'+
    '</div>';
   }).join('')+'</div>':'<div class="muted small">Задач пока нет.</div>')+
  '</div>';
}
function widgetBirthdays(){
  let items=[];
  D.students.filter(s=>s.status!=='archived'&&s.customFields.birthDate).forEach(s=>{
    let days=bdayDiff(s.customFields.birthDate);
    if(days>=-1&&days<=14)items.push({days,type:'student',html:'<span class="click" onclick="openStudentPage(\''+s.id+'\')">'+studentFio(s)+' <span class="muted small">· '+e(studentClassNames(s))+'</span></span>'});
  });
  (D.colleagues||[]).filter(c=>colleagueField(c,'birthDate')).forEach(c=>{
    let days=bdayDiff(colleagueField(c,'birthDate'));
    if(days>=-1&&days<=14)items.push({days,type:'colleague',html:'<span class="click" onclick="openColleagueCard(\''+c.id+'\')">'+colleagueFio(c)+' <span class="muted small">· коллега'+(colleagueField(c,'position')?', '+e(colleagueField(c,'position')):'')+'</span></span>'});
  });
  items.sort((a,b)=>a.days-b.days);
  if(items.length>7)items=items.slice(0,7);
  function badgeFor(days){
    if(days===0)return'сегодня! 🎂';
    if(days===1)return'завтра';
    if(days>1)return'через '+days+' дн.';
    if(days===-1)return'вчера';
    return days+' дн. назад';
  }
  return '<div class="card"><h2 style="margin-top:0">🎂 Дни рождения</h2>'+
   (items.length?items.map(x=>'<div class="attrow">'+x.html+'<span class="badge'+(x.days<0?' muted':'')+'">'+badgeFor(x.days)+'</span></div>').join(''):'<div class="muted small">Ближайшие 2 недели, сегодня и вчера — дней рождений нет.</div>')+
  '</div>';
}
const HOME_WIDGETS={
 clock:{label:'Часы, погода и учебный год',render:widgetClock},
 schedule:{label:'Расписание недели',render:widgetSchedule},
 todo:{label:'Задачи',render:widgetTasks},
 birthdays:{label:'Ближайшие дни рождения',render:widgetBirthdays},
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

