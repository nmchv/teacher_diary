function svgBarChart(data,opts){
 opts=opts||{};
 if(!data.length||!data.some(d=>d.value>0))return '<div class="muted small">Пока нет данных для графика.</div>';
 let w=opts.width||320,h=opts.height||170,pad=30;
 let max=opts.maxValue||Math.max(1,...data.map(d=>d.value));
 let bw=(w-pad*2)/data.length;
 let bars=data.map((d,i)=>{
  let bh=max?Math.round((d.value/max)*(h-pad*2)):0;
  let bwid=bw*0.62,x=pad+i*bw+(bw-bwid)/2,y=h-pad-bh;
  let clickable=d.onclick&&d.value>0;
  return (clickable?'<g onclick="'+d.onclick+'" style="cursor:pointer">':'<g>')+
   (clickable?'<rect x="'+x.toFixed(1)+'" y="'+pad+'" width="'+bwid.toFixed(1)+'" height="'+(h-pad*2)+'" fill="transparent"><title>Показать подробности</title></rect>':'')+
   '<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+bwid.toFixed(1)+'" height="'+bh+'" fill="'+(d.color||'var(--accent)')+'" rx="4"></rect>'+
   '<text x="'+(x+bwid/2).toFixed(1)+'" y="'+(h-pad+16)+'" text-anchor="middle" font-size="11" fill="var(--muted)">'+e(d.label)+'</text>'+
   (d.value?'<text x="'+(x+bwid/2).toFixed(1)+'" y="'+(y-5)+'" text-anchor="middle" font-size="11" fill="var(--ink)">'+d.value+'</text>':'')+
   '</g>';
 }).join('');
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto"><line x1="'+pad+'" y1="'+(h-pad)+'" x2="'+(w-pad)+'" y2="'+(h-pad)+'" stroke="var(--border)"/>'+bars+'</svg>';
}
function svgLineChart(points,opts){
 opts=opts||{};
 if(points.length<2)return '<div class="muted small">Недостаточно данных для графика (нужно минимум 2 урока с оценками за выбранный период).</div>';
 let w=opts.width||520,h=opts.height||160,pad=28;
 let maxY=opts.maxY||5,minY=opts.minY||1;
 let n=points.length;
 let xStep=(w-pad*2)/(n-1);
 let scaleY=v=>h-pad-((v-minY)/((maxY-minY)||1))*(h-pad*2);
 let coords=points.map((p,i)=>[pad+i*xStep,scaleY(p.y)]);
 let path=coords.map((c,i)=>(i===0?'M':'L')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
 let strokeColor=opts.mono?'#111':'var(--accent)';
 let textColor=opts.mono?'#333':'var(--muted)';
 let dots=coords.map(c=>'<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="3.2" fill="'+strokeColor+'"></circle>').join('');
 let showLabels=n<=14;
 let labels=showLabels?points.map((p,i)=>'<text x="'+coords[i][0].toFixed(1)+'" y="'+(h-7)+'" font-size="9" text-anchor="middle" fill="'+textColor+'">'+e(p.label||'')+'</text>').join(''):'';
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto"><path d="'+path+'" fill="none" stroke="'+strokeColor+'" stroke-width="2.2"/>'+dots+labels+'</svg>';
}
function svgPrintTrendChart(points,opts){
 opts=opts||{};
 if(!points||points.length<2)return '<p class="muted">Недостаточно данных для графика (нужно минимум 2 урока с оценками).</p>';
 let w=opts.width||520,h=opts.height||150,pad=34;
 let maxY=5,minY=2;
 let n=points.length;
 let xStep=n>1?(w-pad*2)/(n-1):0;
 let scaleY=v=>h-pad-((Math.max(minY,Math.min(maxY,v))-minY)/(maxY-minY))*(h-pad*2);
 let coords=points.map((p,i)=>[pad+i*xStep,scaleY(p.y)]);
 let path=coords.map((c,i)=>(i===0?'M':'L')+c[0].toFixed(1)+','+c[1].toFixed(1)).join(' ');
 let grid='';
 for(let v=2;v<=5;v++){
  let y=scaleY(v);
  grid+='<line x1="'+pad+'" y1="'+y.toFixed(1)+'" x2="'+(w-pad)+'" y2="'+y.toFixed(1)+'" stroke="#cccccc" stroke-width="1" stroke-dasharray="2,2"/>'+
   '<text x="'+(pad-8)+'" y="'+(y+3).toFixed(1)+'" font-size="10" text-anchor="end" fill="#555555">'+v+'</text>';
 }
 let dotsAndLabels=coords.map((c,i)=>
  '<circle cx="'+c[0].toFixed(1)+'" cy="'+c[1].toFixed(1)+'" r="4.5" fill="#000000" stroke="#ffffff" stroke-width="1.2"></circle>'+
  '<text x="'+c[0].toFixed(1)+'" y="'+(c[1]-9).toFixed(1)+'" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">'+e(String(points[i].y))+'</text>'
 ).join('');
 let showAxisLabels=n<=16;
 let axisLabels=showAxisLabels?points.map((p,i)=>'<text x="'+coords[i][0].toFixed(1)+'" y="'+(h-9)+'" font-size="9" text-anchor="middle" fill="#000000">'+e(p.label||'')+'</text>').join(''):'';
 return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" style="width:100%;max-width:'+w+'px;height:auto;background:#ffffff">'+grid+'<path d="'+path+'" fill="none" stroke="#000000" stroke-width="2.2"/>'+dotsAndLabels+axisLabels+'</svg>';
}
function donutChart(present,absent,size,onclick){
 size=size||110;
 let total=present+absent;
 let pct=total?Math.round(present/total*100):0;
 let deg=total?Math.round(present/total*360):0;
 let wrapAttrs=onclick?' onclick="'+onclick+'" style="cursor:pointer" title="Показать, кто и когда отсутствовал"':'';
 return '<div'+wrapAttrs+'><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'+
  '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:conic-gradient(var(--accent) '+deg+'deg, var(--border) 0deg);display:flex;align-items:center;justify-content:center;flex:0 0 auto">'+
  '<div style="width:'+Math.round(size*0.62)+'px;height:'+Math.round(size*0.62)+'px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-weight:700">'+(total?pct+'%':'—')+'</div></div>'+
  '<div class="small"><div><span class="dot" style="background:var(--accent)"></span>Присутствовали: '+present+'</div><div><span class="dot" style="background:var(--border)"></span>Отсутствовали: '+absent+'</div></div></div></div>';
}
function donutChartPct(pct,size,onclick){
 size=size||110;
 let deg=pct===null?0:Math.round(pct*3.6);
 let wrapAttrs=onclick?' onclick="'+onclick+'" style="cursor:pointer" title="Показать, кто и когда отсутствовал"':'';
 return '<div'+wrapAttrs+'><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">'+
  '<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:conic-gradient(var(--accent) '+deg+'deg, var(--border) 0deg);display:flex;align-items:center;justify-content:center;flex:0 0 auto">'+
  '<div style="width:'+Math.round(size*0.62)+'px;height:'+Math.round(size*0.62)+'px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-weight:700">'+(pct===null?'—':Math.round(pct*10)/10+'%')+'</div></div>'+
  '<div class="small muted">Средняя посещаемость по урокам</div></div></div>';
}
function avgAttendancePctPerLesson(ls){
 let pcts=[];
 ls.forEach(l=>{
  let vals=Object.values(l.attendance||{});
  if(vals.length){let present=vals.filter(v=>v!=='н').length;pcts.push(present/vals.length*100)}
 });
 return pcts.length?avg(pcts):null;
}
function gradeBarColor(v){
 let n=gradeNumericValue(v);
 if(n===null)return'#8a8aa3';
 return n>=4?'#2fa84f':n>=3?'#e8a800':'#e64c3c';
}
function gradeDistData(vals,scope,scopeId,from,to){
 let scale=(D.settings.gradeScale&&D.settings.gradeScale.length)?D.settings.gradeScale:GRADE_OPTIONS_DEFAULT;
 let counts={};
 vals.forEach(v=>{counts[v]=(counts[v]||0)+1});
 let mk=scope?(v=>"showGradeBreakdown('"+scope+"','"+(scopeId||'')+"','"+String(v).replace(/'/g,"\\'")+"','"+(from||'')+"','"+(to||'')+"')"):null;
 let bars=scale.map(v=>({label:v,value:counts[v]||0,color:gradeBarColor(v),onclick:mk?mk(v):null}));
 Object.keys(counts).forEach(v=>{if(!scale.includes(v))bars.push({label:v,value:counts[v],color:'#999',onclick:mk?mk(v):null})});
 return bars;
}
function gradeBreakdownRows(scope,scopeId,gradeValue,from,to){
 let ls=activeLessons().filter(l=>!l.cancelled&&(!from||l.date>=from)&&(!to||l.date<=to));
 if(scope==='class'){let gi=groupIds(scopeId);ls=ls.filter(l=>gi.includes(l.classId))}
 let rows=[];
 ls.forEach(l=>{
  Object.keys(l.grades||{}).forEach(sid=>{
   if(scope==='student'&&sid!==scopeId)return;
   let g=l.grades[sid];
   if(g&&g.value===gradeValue){
    rows.push({date:l.date,student:P(sid),cls:C(l.classId),topic:l.topic,comment:g.comment,lessonId:l.id});
   }
  });
 });
 rows.sort((a,b)=>b.date.localeCompare(a.date));
 return rows;
}
function showGradeBreakdown(scope,scopeId,gradeValue,from,to){
 let rows=gradeBreakdownRows(scope,scopeId,gradeValue,from,to);
 setModalHtml('Оценка «'+gradeValue+'» — кому и когда',
  rows.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Ученик</th><th>Урок</th><th>Коммент.</th></tr>'+
   rows.map(r=>'<tr class="click" onclick="closeModal();openLessonModal(\''+r.lessonId+'\')"><td>'+fmtDate(r.date)+'</td><td>'+e(r.cls?r.cls.name:'—')+'</td><td>'+(r.student?studentFio(r.student):'—')+'</td><td>'+e(r.topic||'(без темы)')+'</td><td class="muted">'+e(r.comment||'')+'</td></tr>').join('')+'</table>'
  :'<div class="empty">За выбранный период таких оценок не найдено.</div>');
}
function attendanceBreakdownRows(scope,scopeId,from,to){
 let ls=activeLessons().filter(l=>!l.cancelled&&(!from||l.date>=from)&&(!to||l.date<=to));
 if(scope==='class'){let gi=groupIds(scopeId);ls=ls.filter(l=>gi.includes(l.classId))}
 let rows=[];
 ls.forEach(l=>{
  Object.keys(l.attendance||{}).forEach(sid=>{
   if(scope==='student'&&sid!==scopeId)return;
   if(l.attendance[sid]==='н'){
    rows.push({date:l.date,student:P(sid),cls:C(l.classId),topic:l.topic,lessonId:l.id});
   }
  });
 });
 rows.sort((a,b)=>b.date.localeCompare(a.date));
 return rows;
}
function showAttendanceBreakdown(scope,scopeId,from,to){
 let rows=attendanceBreakdownRows(scope,scopeId,from,to);
 setModalHtml('Пропуски — кто и когда',
  rows.length?'<table class="table"><tr><th>Дата</th><th>Класс</th><th>Ученик</th><th>Урок</th></tr>'+
   rows.map(r=>'<tr class="click" onclick="closeModal();openLessonModal(\''+r.lessonId+'\')"><td>'+fmtDate(r.date)+'</td><td>'+e(r.cls?r.cls.name:'—')+'</td><td>'+(r.student?studentFio(r.student):'—')+'</td><td>'+e(r.topic||'(без темы)')+'</td></tr>').join('')+'</table>'
  :'<div class="empty">За выбранный период пропусков не найдено.</div>');
}
