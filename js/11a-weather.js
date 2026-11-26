/* ===================== ПОГОДА ===================== */
let weatherTimer=null;
let weatherError=false;

function weatherCityName(){return D.settings.weatherCity||WEATHER_DEFAULT_CITY}
function currentWeather(){let c=weatherCityName();return S.weather&&S.weather.city===c?S.weather:null}

function fetchWeather(){
 let city=weatherCityName();
 let coords=WEATHER_CITY_COORDS[city]||WEATHER_CITY_COORDS[WEATHER_DEFAULT_CITY];
 let url='https://api.open-meteo.com/v1/forecast?latitude='+coords.lat+'&longitude='+coords.lon+
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,precipitation,cloud_cover'+
  '&hourly=temperature_2m,weather_code,precipitation_probability,is_day,dew_point_2m,visibility,surface_pressure,uv_index'+
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,uv_index_max'+
  '&forecast_days=7&wind_speed_unit=ms&timezone=auto';
 return fetch(url).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(json=>{
  if(!json||!json.current)throw new Error('Пустой ответ');
  weatherError=false;
  if(city!==weatherCityName())return;
  S.weather={city:city,data:json.current,hourly:json.hourly||{},daily:json.daily||{},fetchedAt:new Date()};
  render();
  if(document.querySelector('.sheet-weather'))openWeatherDetail(true);
 }).catch(err=>{
  weatherError=true;
  console.warn('Weather fetch failed:',err);
  if(document.querySelector('.sheet-weather'))openWeatherDetail(true);
 });
}
function initWeather(){
 clearInterval(weatherTimer);
 fetchWeather();
 weatherTimer=setInterval(fetchWeather,10*60*1000);
}
function retryWeather(btn){btn.disabled=true;btn.textContent='Обновляем…';fetchWeather()}

/* ---- Справочники и форматирование ---- */
const WMO_TEXT={0:'Ясно',1:'Преимущественно ясно',2:'Переменная облачность',3:'Пасмурно',45:'Туман',48:'Туман с изморозью',
 51:'Слабая морось',53:'Морось',55:'Сильная морось',56:'Ледяная морось',57:'Сильная ледяная морось',
 61:'Небольшой дождь',63:'Дождь',65:'Сильный дождь',66:'Ледяной дождь',67:'Сильный ледяной дождь',
 71:'Небольшой снег',73:'Снег',75:'Сильный снег',77:'Снежная крупа',
 80:'Небольшой ливень',81:'Ливень',82:'Сильный ливень',85:'Снегопад',86:'Сильный снегопад',
 95:'Гроза',96:'Гроза с градом',99:'Сильная гроза с градом'};
function wmoText(code){return WMO_TEXT[code]||WEATHER_LABELS[weatherCondition(code)]}
function weatherIconName(code,isDay){
 if(code===0||code===1)return isDay?'sun':'moon';
 if(code===2)return isDay?'partsun':'partmoon';
 let c=weatherCondition(code);
 return c==='cloudy'?'cloud':c;
}
const isNum=v=>typeof v==='number'&&isFinite(v);
const wNum=(v,suffix)=>isNum(v)?Math.round(v)+(suffix||''):'—';
function wTemp(v){if(!isNum(v))return'—';let r=Math.round(v);return(r>0?'+':r<0?'−':'')+Math.abs(r)+'°'}
const wTime=iso=>iso?iso.slice(11,16):'—';
const minutesOf=iso=>iso?+iso.slice(11,13)*60 + +iso.slice(14,16):null;
function windName(deg){return isNum(deg)?['северный','северо-восточный','восточный','юго-восточный','южный','юго-западный','западный','северо-западный'][Math.round(deg/45)%8]:''}
function uvLevel(v){if(!isNum(v))return'';return v<3?'Низкий':v<6?'Умеренный':v<8?'Высокий':v<11?'Очень высокий':'Экстремальный'}

/* Индекс текущего часа в почасовом прогнозе (время — местное для города) */
function hourIndex(w){
 let key=String(w.data.time||'').slice(0,13);
 let i=(w.hourly.time||[]).findIndex(t=>t.slice(0,13)===key);
 return i<0?0:i;
}
function weatherSummary(w,i){
 let h=w.hourly,codes=h.weather_code||[],times=h.time||[];
 const wet=c=>['drizzle','rain','snow','storm'].includes(weatherCondition(c));
 const kind=c=>weatherCondition(c)==='snow'?'снег':weatherCondition(c)==='storm'?'гроза':'дождь';
 let nowWet=wet(w.data.weather_code),text='';
 for(let j=i+1;j<Math.min(i+13,times.length);j++){
  if(wet(codes[j])!==nowWet){
   let at=(times[j].slice(0,10)!==times[i].slice(0,10)?'завтра ':'')+'около '+wTime(times[j]);
   text=nowWet?'Осадки должны закончиться '+at+'.':'Ожидается '+kind(codes[j])+' '+at+'.';
   if(!nowWet&&kind(codes[j])==='гроза')text='Ожидается гроза '+at+'.';
   break;
  }
 }
 if(!text)text=nowWet?'Осадки сохранятся в ближайшие 12 часов.':'В ближайшие 12 часов без осадков.';
 let feels=w.data.apparent_temperature,tips=[];
 let needUmbrella=['drizzle','rain','storm'].includes(weatherCondition(w.data.weather_code))||codes.slice(i,i+13).some(c=>['rain','storm'].includes(weatherCondition(c)));
 if(needUmbrella)tips.push('Возьмите зонт.');
 if(isNum(feels)&&feels<=-10)tips.push('Очень холодно — одевайтесь теплее.');
 else if(isNum(feels)&&feels>=28)tips.push('Жарко — не забудьте воду.');
 if((w.data.wind_gusts_10m||0)>=15)tips.push('Возможны сильные порывы ветра.');
 return text+(tips.length?' '+tips.join(' '):'');
}

/* ---- Блоки окна ---- */
function hourlyHtml(w,i){
 let h=w.hourly,n=Math.min(24,(h.time||[]).length-i);
 if(n<2)return'';
 let temps=h.temperature_2m.slice(i,i+n),min=Math.min(...temps),max=Math.max(...temps),span=Math.max(1,max-min);
 const colW=62,H=54;
 let pts=temps.map((t,k)=>[k*colW+colW/2,8+(max-t)/span*(H-20)]);
 let line=pts.map((p,k)=>{if(!k)return'M'+p[0]+' '+p[1];let q=pts[k-1],mx=(q[0]+p[0])/2;return'C'+mx+' '+q[1]+' '+mx+' '+p[1]+' '+p[0]+' '+p[1]}).join(' ');
 let cols='';
 for(let k=0;k<n;k++){
  let j=i+k,prob=h.precipitation_probability?h.precipitation_probability[j]:null;
  cols+='<div class="wx-hour'+(k===0?' now':'')+'">'+
   '<span class="wx-hour-time">'+(k===0?'Сейчас':wTime(h.time[j]))+'</span>'+
   icon(weatherIconName(k===0?w.data.weather_code:h.weather_code[j],h.is_day?h.is_day[j]:1))+
   '<span class="wx-hour-prob">'+(prob>=10?prob+'%':'&nbsp;')+'</span>'+
   '<b>'+wTemp(k===0?w.data.temperature_2m:temps[k])+'</b></div>';
 }
 return '<section class="wx-panel"><h3>Прогноз на 24 часа</h3><div class="wx-hours" tabindex="0"><div class="wx-hours-track" style="width:'+(n*colW)+'px">'+
  '<div class="wx-hours-row">'+cols+'</div>'+
  '<svg class="wx-curve" width="'+(n*colW)+'" height="'+H+'" viewBox="0 0 '+(n*colW)+' '+H+'" aria-hidden="true">'+
   '<path class="wx-curve-area" d="'+line+' L'+pts[n-1][0]+' '+H+' L'+pts[0][0]+' '+H+'Z"/>'+
   '<path class="wx-curve-line" d="'+line+'"/>'+
   pts.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.6"/>').join('')+
  '</svg></div></div></section>';
}
function weekHtml(w){
 let d=w.daily;
 if(!d.time||!d.time.length)return'';
 let lo=Math.min(...d.temperature_2m_min),hi=Math.max(...d.temperature_2m_max),span=Math.max(1,hi-lo);
 let rows=d.time.map((day,k)=>{
  let date=new Date(day+'T12:00:00');
  let name=k===0?'Сегодня':k===1?'Завтра':date.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric'});
  let min=d.temperature_2m_min[k],max=d.temperature_2m_max[k],prob=d.precipitation_probability_max?d.precipitation_probability_max[k]:null;
  let dot='';
  if(k===0){let pos=Math.max(0,Math.min(1,(w.data.temperature_2m-min)/Math.max(1,max-min)));dot='<i style="left:'+(pos*100)+'%"></i>'}
  return '<li class="wx-day">'+
   '<span class="wx-day-name">'+e(name.charAt(0).toUpperCase()+name.slice(1))+'</span>'+
   '<span class="wx-day-icon" title="'+e(wmoText(d.weather_code[k]))+'">'+icon(weatherIconName(d.weather_code[k],1))+'<small>'+(prob>=10?prob+'%':'')+'</small></span>'+
   '<span class="wx-day-min">'+wTemp(min)+'</span>'+
   '<span class="wx-range"><span style="left:'+((min-lo)/span*100)+'%;width:'+Math.max(6,(max-min)/span*100)+'%">'+dot+'</span></span>'+
   '<span class="wx-day-max">'+wTemp(max)+'</span></li>';
 }).join('');
 return '<section class="wx-panel wx-week"><h3>Прогноз на неделю</h3><ul>'+rows+'</ul></section>';
}
function tile(ic,title,value,note,extra,cls){
 return '<section class="wx-panel wx-tile'+(cls?' '+cls:'')+'"><h3>'+icon(ic)+title+'</h3><div class="wx-value">'+value+'</div>'+(extra||'')+(note?'<p>'+note+'</p>':'')+'</section>';
}
const wMeter=p=>'<div class="wx-meter"><span style="width:'+Math.max(0,Math.min(100,p||0))+'%"></span></div>';
function sunHtml(w){
 let d=w.daily,rise=d.sunrise&&d.sunrise[0],set=d.sunset&&d.sunset[0];
 if(!rise||!set)return'';
 let a=minutesOf(rise),b=minutesOf(set),now=minutesOf(w.data.time);
 let t=Math.max(0,Math.min(1,(now-a)/Math.max(1,b-a))),up=now>=a&&now<=b;
 /* квадратичная кривая (10,70) → (150,-30) → (290,70) */
 let x=10+280*t,y=70-200*t*(1-t);
 let len=b-a;
 return '<section class="wx-panel wx-sun"><h3>'+icon('sunrise')+'Солнце</h3>'+
  '<svg viewBox="0 0 300 80" aria-hidden="true"><path class="wx-sun-path" d="M10 70Q150 -30 290 70"/><path class="wx-sun-horizon" d="M0 70H300"/>'+
  (up?'<circle class="wx-sun-dot" cx="'+x+'" cy="'+y+'" r="6"/>':'')+'</svg>'+
  '<div class="wx-sun-times"><span>Восход <b>'+wTime(rise)+'</b></span><span>День '+Math.floor(len/60)+' ч '+(len%60)+' мин</span><span>Закат <b>'+wTime(set)+'</b></span></div></section>';
}
function detailsHtml(w,i){
 let c=w.data,h=w.hourly,d=w.daily;
 const at=(arr,k)=>arr&&k>=0?arr[k]:null;
 let diff=isNum(c.apparent_temperature)?Math.round(c.apparent_temperature)-Math.round(c.temperature_2m):0;
 let feelsNote=diff<=-2?(c.wind_speed_10m>=4?'Из-за ветра кажется холоднее.':'Кажется холоднее, чем на самом деле.'):diff>=2?'Кажется теплее, чем на самом деле.':'Близко к фактической температуре.';
 let compass=isNum(c.wind_direction_10m)?'<svg class="wx-compass" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><text x="24" y="12">С</text><g style="transform:rotate('+((c.wind_direction_10m+180)%360)+'deg)"><path d="M24 33V16m-4.5 5L24 15.5 28.5 21"/></g></svg>':'';
 let dir=windName(c.wind_direction_10m);
 let windNote=(dir?dir.charAt(0).toUpperCase()+dir.slice(1)+'. ':'')+'Порывы <span style="white-space:nowrap">до '+wNum(c.wind_gusts_10m,' м/с')+'</span>.';
 let mm=isNum(c.surface_pressure)?Math.round(c.surface_pressure*0.750062):null;
 let before=at(h.surface_pressure,i-3),now=at(h.surface_pressure,i),pNote='';
 if(isNum(before)&&isNum(now))pNote=now-before>1?'Растёт за последние 3 часа.':before-now>1?'Падает за последние 3 часа.':'Держится стабильно.';
 let dew=at(h.dew_point_2m,i),vis=at(h.visibility,i),uv=at(h.uv_index,i),uvMax=at(d.uv_index_max,0);
 let sum=at(d.precipitation_sum,0),prob=at(d.precipitation_probability_max,0);
 return '<div class="wx-tiles">'+
  tile('drop','Влажность',wNum(c.relative_humidity_2m,'%'),isNum(dew)?'Точка росы '+wTemp(dew)+'.':'',wMeter(c.relative_humidity_2m))+
  tile('wind','Ветер',wNum(c.wind_speed_10m,' <small>м/с</small>'),windNote,compass,'wx-tile-wind')+
  tile('umbrella','Осадки сегодня',isNum(sum)?String(Math.round(sum*10)/10).replace('.',',')+' <small>мм</small>':'—',isNum(prob)?'Вероятность до '+prob+'%.':'',wMeter(prob))+
  tile('eye','Видимость',isNum(vis)?(vis>=10000?Math.round(vis/1000):String(Math.round(vis/100)/10).replace('.',','))+' <small>км</small>':'—',isNum(vis)?(vis>=10000?'Хорошая.':vis>=4000?'Средняя.':'Плохая.')+' Облачность '+wNum(c.cloud_cover,'%')+'.':'')+
  tile('gauge','Давление',mm===null?'—':mm+' <small>мм рт. ст.</small>',pNote,mm===null?'':wMeter((mm-720)/60*100))+
  tile('uv','УФ-индекс',wNum(uv),(isNum(uv)?uvLevel(uv)+' сейчас. ':'')+(isNum(uvMax)?'Максимум сегодня: '+Math.round(uvMax)+'.':''),wMeter((uv||0)/11*100))+
  tile('thermo','Ощущается как',wTemp(c.apparent_temperature),feelsNote,'','wx-tile-feels')+
  '</div>';
}

/* ---- Окно ---- */
const WEATHER_SOURCE='<span class="sheet-source">Источник данных: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo.com</a></span>';
function openWeatherDetail(refresh){
 let city=weatherCityName(),w=currentWeather();
 if(!w){
  openSheet('sheet-weather','Погода: '+city,
   '<div class="sheet-state"><h2>'+e(city)+'</h2><p>'+(weatherError?'Не удалось получить погоду. Проверьте подключение к интернету и попробуйте ещё раз.':'Загружаем прогноз…')+'</p>'+
   (weatherError?'<button type="button" class="primary" onclick="retryWeather(this)">Повторить</button>':'')+'</div>',
   WEATHER_SOURCE,refresh);
  return;
 }
 let c=w.data,i=hourIndex(w),cond=weatherCondition(c.weather_code),isDay=c.is_day!==0,d=w.daily;
 let sky=cond==='clear'?(isDay?'clear-day':'clear-night'):cond+(isDay?'-day':'-night');
 let body=
  '<header class="wx-hero wx-sky-'+sky+'">'+
   '<canvas class="wx-canvas" aria-hidden="true"></canvas>'+
   '<div class="wx-hero-content">'+
    '<div class="wx-place"><h2>'+e(city)+'</h2><span>Местное время '+wTime(c.time)+'</span></div>'+
    '<div class="wx-now"><div class="wx-temp">'+wTemp(c.temperature_2m)+'</div>'+
     '<div class="wx-cond">'+icon(weatherIconName(c.weather_code,isDay))+'<span>'+e(wmoText(c.weather_code))+'</span></div>'+
     '<div class="wx-sub"><span>Ощущается как '+wTemp(c.apparent_temperature)+'</span>'+
     (d.temperature_2m_max?'<span>Днём до '+wTemp(d.temperature_2m_max[0])+'</span><span>Минимум '+wTemp(d.temperature_2m_min[0])+'</span>':'')+'</div></div>'+
    '<p class="wx-summary">'+e(weatherSummary(w,i))+'</p>'+
   '</div>'+
  '</header>'+
  '<div class="wx-body">'+hourlyHtml(w,i)+weekHtml(w)+detailsHtml(w,i)+sunHtml(w)+'</div>';
 let time=String(w.fetchedAt.getHours()).padStart(2,'0')+':'+String(w.fetchedAt.getMinutes()).padStart(2,'0');
 openSheet('sheet-weather','Погода: '+city,body,
  '<span class="sheet-note">'+(weatherError?'Нет связи. Данные от ':'Обновлено в ')+time+'</span>'+WEATHER_SOURCE,refresh);
 startWeatherScene(document.querySelector('.wx-canvas'),{code:c.weather_code,condition:cond,isDay:isDay,wind:c.wind_speed_10m||0,windDir:c.wind_direction_10m||0,clouds:c.cloud_cover});
}

/* ---- Анимированное небо: солнце, звёзды, облака, дождь, снег, туман, гроза ---- */
function startWeatherScene(canvas,o){
 if(!canvas||!canvas.getContext)return;
 const ctx=canvas.getContext('2d');
 const still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let W=0,H=0;
 function resize(){
  let r=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
  W=r.width;H=r.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 resize();
 const rnd=(a,b)=>a+Math.random()*(b-a);
 const light=[51,56,61,66,71,80,85].includes(o.code),heavy=[55,57,65,67,75,82,86,99].includes(o.code);
 const power=light?.55:heavy?1.7:1;
 const cond=o.condition;
 /* снос по горизонтали: ветер с запада (270°) несёт осадки вправо */
 const drift=-Math.sin(o.windDir*Math.PI/180)*Math.min(o.wind,15);
 const rainy=cond==='rain'||cond==='storm'||cond==='drizzle',drizzle=cond==='drizzle';
 const make=(n,f)=>Array.from({length:Math.round(n)},f);
 const drops=rainy?make((drizzle?90:130)*power,()=>{let z=rnd(.4,1);return{x:rnd(-.2,1.2),y:rnd(0,1),z:z}}):[];
 const flakes=cond==='snow'?make(120*power,()=>{let z=rnd(.3,1);return{x:rnd(0,1),y:rnd(0,1),z:z,p:rnd(0,6.28),s:rnd(.6,1.4)}}):[];
 const cover=isNum(o.clouds)?o.clouds:60;
 const cloudCount=cond==='clear'?(cover>10?2:0):cond==='fog'?3:o.code===2?4:7;
 const clouds=make(cloudCount,(_,k)=>({x:rnd(0,1),y:rnd(-.05,.38),r:rnd(55,105),v:rnd(.004,.012)*(1+o.wind/12)*(drift<0?-1:1),a:rnd(.1,.2),k:k}));
 const stars=!o.isDay&&(cond==='clear'||o.code===2)?make(70,()=>({x:rnd(0,1),y:rnd(0,.75),r:rnd(.5,1.5),p:rnd(0,6.28)})):[];
 let flash=0,nextFlash=1.5,bolt=null,last=null,t=0;

 function glow(x,y,r,color){
  let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.replace(/[\d.]+\)$/,'0)'));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill();
 }
 function draw(dt){
  t+=dt;ctx.clearRect(0,0,W,H);
  stars.forEach(s=>{ctx.fillStyle='rgba(255,255,255,'+(.35+.45*Math.abs(Math.sin(t*.9+s.p)))+')';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,6.2832);ctx.fill()});
  if(cond==='clear'||o.code===2){
   let x=W*.78,y=H*.36;
   if(o.isDay){
    glow(x,y,150+Math.sin(t*1.2)*8,'rgba(255,214,120,.5)');
    ctx.save();ctx.translate(x,y);ctx.rotate(t*.08);ctx.strokeStyle='rgba(255,232,170,.35)';ctx.lineWidth=2;ctx.lineCap='round';
    for(let k=0;k<12;k++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(52,0);ctx.lineTo(k%2?68:80,0);ctx.stroke()}
    ctx.restore();
    ctx.fillStyle='#ffd873';ctx.beginPath();ctx.arc(x,y,38,0,6.2832);ctx.fill();
   }else{
    glow(x,y,100,'rgba(200,215,255,.28)');
    ctx.fillStyle='#e8eeff';ctx.beginPath();ctx.arc(x,y,28,0,6.2832);ctx.fill();
    ctx.fillStyle='rgba(150,165,205,.35)';[[-9,-6,6],[8,8,8],[10,-11,3]].forEach(m=>{ctx.beginPath();ctx.arc(x+m[0],y+m[1],m[2],0,6.2832);ctx.fill()});
   }
  }
  clouds.forEach(c=>{
   c.x+=c.v*dt;
   let span=W+c.r*4,x=((c.x*W+c.r*2)%span+span)%span-c.r*2,y=c.y*H+Math.sin(t*.3+c.k)*3;
   let tone=cond==='storm'?'150,160,185':o.isDay?'255,255,255':'170,185,215';
   [[0,0,1],[-.75,.18,.72],[.75,.2,.78],[.25,-.3,.7]].forEach(q=>glow(x+q[0]*c.r,y+q[1]*c.r,c.r*q[2],'rgba('+tone+','+c.a+')'));
  });
  ctx.lineCap='round';
  drops.forEach(p=>{
   let speed=(drizzle?240:520)*(.5+p.z),len=(drizzle?6:16)*(.5+p.z),slant=drift*14*(.5+p.z);
   p.y+=speed*dt/H;p.x+=slant*dt/W;
   if(p.y>1.05){p.y=-.08;p.x=rnd(-.2,1.2)}
   let x=p.x*W,y=p.y*H;
   ctx.strokeStyle='rgba(205,228,255,'+(.18+.42*p.z)+')';ctx.lineWidth=drizzle?1:.6+p.z;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-slant/speed*len,y-len);ctx.stroke();
  });
  flakes.forEach(p=>{
   p.y+=(22+55*p.z)*dt/H;p.x+=(drift*6*p.z+Math.sin(t*p.s+p.p)*14)*dt/W;
   if(p.y>1.03){p.y=-.03;p.x=rnd(0,1)}
   if(p.x>1.03)p.x=-.03;else if(p.x<-.03)p.x=1.03;
   ctx.fillStyle='rgba(255,255,255,'+(.35+.55*p.z)+')';ctx.beginPath();ctx.arc(p.x*W,p.y*H,.8+2.6*p.z*p.z,0,6.2832);ctx.fill();
  });
  if(cond==='fog'){
   for(let k=0;k<5;k++){
    let y=H*(.22+k*.17),x=W/2+Math.sin(t*(.12+k*.03)+k*1.7)*W*.28;
    ctx.save();ctx.translate(x,y);ctx.scale(6,.55);glow(0,0,70,'rgba(235,240,245,.3)');ctx.restore();
   }
  }
  if(cond==='storm'&&!still){
   nextFlash-=dt;
   if(nextFlash<=0){
    flash=1;nextFlash=rnd(3,7);
    let x=rnd(W*.5,W*.9),y=0;bolt=[[x,y]];
    while(y<H*.65){y+=rnd(14,30);x+=rnd(-18,18);bolt.push([x,y])}
   }
   if(flash>0){
    ctx.fillStyle='rgba(220,230,255,'+(flash*.18)+')';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,244,200,'+flash+')';ctx.lineWidth=2;ctx.beginPath();
    bolt.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
    flash-=dt*3.2;
   }
  }
 }
 if(still){draw(0);return}
 function frame(ts){
  if(!canvas.isConnected)return; /* окно закрыто — анимация останавливается */
  let r=canvas.getBoundingClientRect();
  if(Math.abs(r.width-W)>1||Math.abs(r.height-H)>1)resize();
  draw(last===null?0:Math.min(.05,(ts-last)/1000));last=ts;
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
