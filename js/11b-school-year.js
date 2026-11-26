/* ===================== ОКНО «УЧЕБНЫЙ ГОД» ===================== */
const dayStart=iso=>new Date(iso+'T00:00:00');
function localISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function plural(n,one,few,many){let a=Math.abs(n)%100,b=a%10;return a>10&&a<20?many:b===1?one:b>1&&b<5?few:many}
const clamp01=v=>Math.max(0,Math.min(1,v));
function longDate(d){return d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}

function openSchoolYearDetail(){
 let ay=D.settings.academicYear||'2026–2027';
 let m=String(ay).match(/(\d{4})/g);
 if(!m){
  openSheet('sheet-year','Учебный год','<div class="sheet-state"><h2>Учебный год не задан</h2><p>Укажите его в разделе «Настройки», чтобы увидеть прогресс.</p><button type="button" class="primary" onclick="closeModal();goto(\'settings\')">Открыть настройки</button></div>','');
  return;
 }
 let startY=+m[0],endY=m.length>1?+m[1]:startY+1;
 let start=new Date(startY,8,1),end=new Date(endY,4,31);
 let now=new Date(),todayStr=localISO(now),today=dayStart(todayStr);
 const DAY=86400000,WEEK=7*DAY;
 let progress=schoolYearProgress();
 let totalDays=Math.round((end-start)/DAY)+1;
 let passedDays=Math.max(0,Math.min(totalDays,Math.round((today-start)/DAY)));
 let daysLeft=Math.max(0,Math.round((end-today)/DAY));
 let totalWeeks=Math.ceil((end-start)/WEEK);
 let passedWeeks=Math.max(0,Math.min(totalWeeks,Math.floor((today-start)/WEEK)));

 let from=localISO(start),to=localISO(end);
 let lessons=activeLessons().filter(l=>l.date>=from&&l.date<=to);
 let passedLessons=lessons.filter(l=>l.date<=todayStr).length;
 let remainingLessons=lessons.length-passedLessons;

 let status=today<start?'Начнётся '+longDate(start):today>end?'Учебный год завершён':
  'До конца учебного года '+daysLeft+' '+plural(daysLeft,'день','дня','дней');

 /* лента месяцев: ширина пропорциональна числу дней */
 let months='';
 for(let k=0;k<9;k++){
  let a=new Date(startY,8+k,1),b=new Date(startY,9+k,1),len=Math.round((b-a)/DAY);
  let fill=clamp01((today-a)/(b-a)),current=today>=a&&today<b;
  months+='<li class="yr-month'+(current?' current':'')+(fill>=1?' done':'')+'" style="flex-grow:'+len+'">'+
   '<span class="yr-bar"><i style="--fill:'+fill+'"></i>'+(current?'<em style="left:'+(fill*100)+'%"></em>':'')+'</span>'+
   '<span class="yr-month-name">'+a.toLocaleDateString('ru-RU',{month:'short'}).replace('.','')+'</span></li>';
 }

 let quarters=(D.settings.quarters||[]).filter(q=>q.startDate&&q.endDate&&q.endDate>=from&&q.startDate<=to)
  .sort((a,b)=>a.startDate.localeCompare(b.startDate));
 let qHtml=quarters.map(q=>{
  let a=dayStart(q.startDate),b=dayStart(q.endDate),p=clamp01((today-a)/Math.max(DAY,b-a));
  let current=todayStr>=q.startDate&&todayStr<=q.endDate,done=todayStr>q.endDate;
  let left=Math.round((b-today)/DAY),wait=Math.round((a-today)/DAY);
  let note=done?'Завершена':current?(left===0?'Последний день':'Осталось '+left+' '+plural(left,'день','дня','дней')):'Начнётся через '+wait+' '+plural(wait,'день','дня','дней');
  return '<li class="yr-quarter'+(current?' current':'')+(done?' done':'')+'">'+
   '<div class="yr-quarter-head"><b>'+e(q.name)+'</b><span>'+longDate(a)+' – '+longDate(b)+'</span></div>'+
   '<div class="yr-line"><i style="--fill:'+(done?1:p)+'"></i></div><div class="yr-quarter-note">'+note+'</div></li>';
 }).join('');

 const stat=(title,done,left,doneLabel,leftLabel,empty)=>{
  let total=done+left;
  return '<section class="wx-panel yr-stat"><h3>'+title+'</h3>'+
   (total?'<div class="yr-stat-nums"><div><b>'+done+'</b><span>'+doneLabel+'</span></div><div><b>'+left+'</b><span>'+leftLabel+'</span></div></div>'+
   '<div class="yr-line"><i style="--fill:'+(done/total)+'"></i></div><p>Всего '+total+'</p>':'<p>'+empty+'</p>')+'</section>';
 };

 openSheet('sheet-year','Учебный год '+ay,
  '<header class="yr-hero">'+
   '<div class="yr-title"><h2>Учебный год '+e(ay)+'</h2><span>'+fmtDate(from)+' – '+fmtDate(to)+'</span></div>'+
   '<div class="yr-main"><div class="yr-percent">'+progress+'<small>%</small></div>'+
    '<div class="yr-status"><b>'+status+'</b><span>Позади '+passedDays+' из '+totalDays+' календарных дней</span></div></div>'+
   '<ol class="yr-months" aria-label="Прогресс по месяцам">'+months+'</ol>'+
  '</header>'+
  '<div class="wx-body">'+
   '<div class="yr-stats">'+
    stat('Уроки в дневнике',passedLessons,remainingLessons,'по сегодня','запланировано впереди','За этот учебный год в дневнике пока нет уроков.')+
    stat('Недели',passedWeeks,totalWeeks-passedWeeks,'прошло','осталось','')+
   '</div>'+
   '<section class="wx-panel"><h3>Четверти и периоды</h3>'+
    (qHtml?'<ul class="yr-quarters">'+qHtml+'</ul>':'<p class="yr-empty">Даты четвертей пока не указаны.</p><button type="button" onclick="closeModal();goto(\'settings\')">Указать в настройках</button>')+
   '</section>'+
  '</div>','');
}
