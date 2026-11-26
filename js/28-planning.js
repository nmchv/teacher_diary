/* ===================== ПЛАНИРОВАНИЕ УРОКОВ ===================== */
function planDefaults(){
  if(!D.planKtp)D.planKtp=[];
  if(!D.planStatus)D.planStatus=[];
  if(!D.planLessons)D.planLessons=[];
  let ps=D.settings.planSettings||{};
  if(!ps.academicYear)ps.academicYear=D.settings.academicYear;
  if(!ps.visible)ps.visible={materials:true,note:true};
  if(!ps.widths)ps.widths={num:56,date:130,topic:300,materials:200,note:220};
  D.settings.planSettings=ps;
}
function planConf(){return D.settings.planSettings}
function planYear(){return (planConf().academicYear||D.settings.academicYear)||''}
function planClasses(){
  let year=planYear();
  let list=D.classes.filter(c=>c.type==='class'&&(!year||c.academicYear===year));
  if(!list.length)list=D.classes.filter(c=>c.type==='class');
  return sortedClasses(list);
}
function planParallels(){
  let nums=[...new Set(planClasses().map(c=>c.gradeNumber).filter(Boolean))].sort((a,b)=>a-b);
  return nums.filter(n=>n>=5&&n<=11).map(n=>({grade:n,classes:sortedClasses(planClasses().filter(c=>c.gradeNumber===n))}));
}
function planKtpList(){
  return (D.planKtp||[]).filter(k=>k.academicYear===planYear()).sort((a,b)=>(a.gradeNumber||0)-(b.gradeNumber||0)||(a.order||0)-(b.order||0));
}
function planKtpThemes(grade){
  return planKtpList().filter(k=>k.gradeNumber===grade);
}
function planStatusOf(ktpId,classId){
  let s=(D.planStatus||[]).find(x=>x.ktpId===ktpId&&x.classId===classId);
  return s?s.status:'pending';
}
function planSetStatus(ktpId,classId,status){
  let arr=D.planStatus||[];
  let s=arr.find(x=>x.ktpId===ktpId&&x.classId===classId);
  if(s)s.status=status;else arr.push({ktpId,classId,status});
  save();
}
function statusCycle(s){return s==='pending'?'current':s==='current'?'done':'pending';}
function statusChar(s){return{done:'✓',current:'●',pending:'—'}[s];}
function statusLabel(s){return{done:'Пройдено',current:'Текущая',pending:'Не пройдено'}[s];}
function statusCls(s){return{done:'ktp-done',current:'ktp-current',pending:'ktp-pending'}[s];}
function planLessonsFor(classId){
  return (D.planLessons||[]).filter(l=>l.classId===classId).sort((a,b)=>{
    if(!a.date&&!b.date)return (a.order||0)-(b.order||0);
    if(!a.date)return 1;if(!b.date)return-1;
    let c=a.date.localeCompare(b.date);if(c!==0)return c;
    return (a.order||0)-(b.order||0);
  });
}
function planNextOrder(classId){
  let ls=planLessonsFor(classId);let m=0;ls.forEach(l=>{if((l.order||0)>m)m=l.order||0});return m+1;
}
function planSelectClass(id){
  S.planClassId=id;render();
}

/* ---- сводный блок КТП ---- */
function planKtpOverview(){
  let parallels=planParallels();
  if(!parallels.length){
    return '<div class="card empty">Для учебного года «'+e(planYear())+'» нет классов. Создайте классы в разделе «Классы».</div>';
  }
  let out='<div class="plan-bar"><span class="plan-bar-title">Темы КТП · '+e(planYear())+'</span>'+
   '<button class="primary" onclick="openPlanKtpSettings()">Настроить КТП</button>'+
   '<button onclick="planToggleParallels(true)">Развернуть все</button>'+
   '<button onclick="planToggleParallels(false)">Свернуть все</button>'+
   '</div>';
  parallels.forEach(p=>{
    let themes=planKtpThemes(p.grade);
    let stats=p.classes.map(c=>{let done=themes.filter(t=>planStatusOf(t.id,c.id)==='done').length;return{c,total:themes.length,done,pct:themes.length?Math.round(done/themes.length*100):0}});
    let maxPct=Math.max(0,...stats.map(s=>s.pct));
    out+=
    '<details class="plan-parallel" open>'+
     '<summary><span class="plan-parallel-title">'+p.grade+' классы</span>'+
     '<span class="plan-parallel-stats">'+stats.map(s=>'<b>'+e(s.c.name)+'</b> <span class="small">'+s.done+'/'+s.total+' · '+s.pct+'%</span>'+(s.pct&&s.pct<maxPct?' <span class="ktp-lag">отстаёт</span>':'')).join('   ')+'</span>'+
     '</summary>'+
     '<div class="plan-parallel-body">'+
      '<table class="table plan-ktp-table">'+
       '<thead><tr><th class="plan-col-num" style="width:44px">№</th><th class="plan-col-topic">Тема по КТП</th>'+
       p.classes.map(c=>'<th class="plan-col-class click" onclick="planSelectClass(\''+c.id+'\')" style="width:76px">'+e(c.name)+'</th>').join('')+
       '<th class="plan-col-act" style="width:150px"></th></tr></thead>'+
       '<tbody>'+
       themes.map((t,i)=>{
         return '<tr>'+
          '<td class="plan-col-num numcol">'+(i+1)+'</td>'+
          '<td class="plan-col-topic"><span class="plan-theme-text">'+e(t.theme||'')+'</span></td>'+
          p.classes.map(c=>{
            let s=planStatusOf(t.id,c.id);
            return '<td class="plan-col-class"><button class="ktp-st '+statusCls(s)+'" onclick="event.stopPropagation();planCycleStatus(\''+t.id+'\',\''+c.id+'\')" title="'+statusLabel(s)+'">'+statusChar(s)+'</button></td>';
          }).join('')+
          '<td class="plan-col-act"></td>'+
         '</tr>';
       }).join('')+
       '</tbody>'+
       '<tfoot><tr><td class="plan-col-num"></td><td class="plan-col-topic">Пройдено тем</td>'+
       p.classes.map(c=>{
         let st=stats.find(s=>s.c.id===c.id);let lag=st.pct&&st.pct<maxPct?' ktp-lag':'';
         return '<td class="plan-col-class ktp-foot'+lag+'">'+st.done+'/'+st.total+' <span class="small">· '+st.pct+'%</span>'+(st.pct&&st.pct<maxPct?' <span class="ktp-lag-text">отстаёт</span>':'')+'</td>';
       }).join('')+'<td class="plan-col-act"></td></tr></tfoot>'+
      '</table>'+
     '</div>'+
    '</details>';
  });
  return out;
}
function planToggleParallels(open){
  document.querySelectorAll('.plan-parallel').forEach(d=>d.open=open);
}
function planCycleStatus(ktpId,classId){
  planSetStatus(ktpId,classId,statusCycle(planStatusOf(ktpId,classId)));render();
}

/* ---- Настройка КТП (отдельный интерфейс) ---- */
function openPlanKtpSettings(){
  let year=planYear();
  let grades=[...new Set((D.planKtp||[]).filter(k=>k.academicYear===year).map(k=>k.gradeNumber))];
  planClasses().forEach(c=>{if(c.gradeNumber)grades.push(c.gradeNumber);});
  grades=[...new Set(grades)].sort((a,b)=>a-b);
  let sel=grades[0]||null;
  S.ktpSettings={year:year,grade:sel,themes:(planKtpThemes(sel||0)||[]).map(t=>({id:t.id,theme:t.theme||'',order:t.order||0})),paste:'',preview:[]};
  renderKtpSettingsModal();
}
function renderKtpSettingsModal(){
  let s=S.ktpSettings||{};
  let yearOpts='';
  let years=[D.settings.academicYear||'2026–2027',s.year||D.settings.academicYear||'2026–2027'];
  [...new Set(years.filter(Boolean))].forEach(y=>{yearOpts+='<option value="'+e(y)+'"'+(s.year===y?' selected':'')+'>'+e(y)+'</option>'});
  let grades=[...new Set(planClasses().map(c=>c.gradeNumber).filter(Boolean).concat((D.planKtp||[]).filter(k=>k.academicYear===s.year).map(k=>k.gradeNumber)))].sort((a,b)=>a-b);
  let gradeOpts=grades.map(g=>'<option value="'+g+'"'+(s.grade==g?' selected':'')+'>'+g+' класс'+(g!==1?'ы':'')+'</option>').join('');
  let themeRows=s.themes.map((t,i)=>'<tr>'+
   '<td class="numcol">'+(i+1)+'</td>'+
   '<td><input class="plan-inline" value="'+e(t.theme)+'" oninput="ktpSetTheme('+i+',this.value)"></td>'+
   '<td style="width:120px"><button class="plan-act" onclick="ktpMoveTheme('+i+',-1)">↑</button><button class="plan-act" onclick="ktpMoveTheme('+i+',1)">↓</button></td>'+
   '<td style="width:56px"><button class="plan-act danger" onclick="ktpDeleteTheme('+i+')">✕</button></td>'+
  '</tr>').join('');
  let addRow='<div class="row" style="margin-top:8px"><input id="ktp-new-theme" class="plan-inline" placeholder="Название новой темы" style="width:260px"><button class="plan-act" onclick="ktpAddTheme()">Добавить тему</button></div>';
  let pasteHtml='<label>Массовое добавление из Word</label>'+
   '<p class="muted small">Скопируйте столбец с темами из Microsoft Word и вставьте его в поле ниже. Каждая строка станет отдельной темой.</p>'+
   '<textarea id="ktp-paste" class="autosize" placeholder="Вставьте список тем сюда…" style="min-height:140px"></textarea>'+
   '<div class="toolbar" style="margin-top:8px"><button onclick="ktpParsePaste()">Предпросмотр</button><button class="danger" onclick="ktpClearPaste()">Очистить</button></div>';
  let preview='';
  if(s.preview&&s.preview.length){
   preview='<h3>Предварительный просмотр</h3>'+
    '<table class="table plan-ktp-preview"><thead><tr><th class="numcol" style="width:44px">№</th><th>Тема</th></tr></thead><tbody>'+
    s.preview.map((t,i)=>'<tr><td class="numcol">'+(i+1)+'</td><td>'+e(t)+'</td></tr>').join('')+
    '</tbody></table>'+
    '<div class="toolbar" style="margin-top:8px"><button class="primary" onclick="ktpImportPreview()">Импортировать темы</button><button class="danger" onclick="ktpClearPreview()">Очистить предварительный просмотр</button></div>';
  }
  setModalHtml('Настройка КТП',
   '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px">'+
    '<div style="flex:1;min-width:240px">'+
     '<label>Учебный год</label><select id="ktp-year" onchange="ktpChangeYear()">'+yearOpts+'</select>'+
     '<label>Параллель</label><select id="ktp-grade" onchange="ktpChangeGrade()">'+gradeOpts+'</select>'+
    '</div>'+
   '</div>'+
   '<h3>Темы КТП · '+e((s.grade||'')+' класс'+(s.grade!==1?'ы':''))+'</h3>'+
   '<table class="table plan-ktp-settings-table"><thead><tr><th class="numcol" style="width:44px">№</th><th>Тема</th><th style="width:120px">Порядок</th><th style="width:56px"></th></tr></thead><tbody>'+themeRows+'</tbody></table>'+addRow+
   '<hr style="border:none;border-top:1px solid var(--color-border);margin:16px 0">'+
   pasteHtml+preview+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="ktpSave()">Сохранить КТП</button> <button onclick="openFederalKtpImport()">Импорт федерального КТП</button> <button onclick="closeModal()">Отмена</button></div>',true);
  initAutosize();
}
function ktpChangeYear(){
  let el=document.getElementById('ktp-year');if(!el)return;
  S.ktpSettings.year=el.value;ktpChangeGrade();
}
function ktpChangeGrade(){
  let el=document.getElementById('ktp-grade');if(!el)return;
  let grade=+el.value;S.ktpSettings.grade=grade;
  S.ktpSettings.themes=(planKtpThemes(grade)||[]).map(t=>({id:t.id,theme:t.theme||'',order:t.order||0}));
  S.ktpSettings.preview=[];
  renderKtpSettingsModal();
}
function ktpSetTheme(i,val){let t=S.ktpSettings.themes[i];if(t)t.theme=(val||'').trim();}
function ktpMoveTheme(i,dir){let arr=S.ktpSettings.themes;let j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];renderKtpSettingsModal();}
function ktpDeleteTheme(i){S.ktpSettings.themes.splice(i,1);renderKtpSettingsModal();}
function ktpAddTheme(){
  let el=document.getElementById('ktp-new-theme');if(!el)return;
  let val=(el.value||'').trim();if(!val)return;
  S.ktpSettings.themes.push({id:null,theme:val,order:S.ktpSettings.themes.length+1});
  el.value='';renderKtpSettingsModal();
}
function ktpParsePaste(){
  let el=document.getElementById('ktp-paste');if(!el)return;
  S.ktpSettings.paste=el.value||'';
  S.ktpSettings.preview=ktpParseText(S.ktpSettings.paste);
  renderKtpSettingsModal();
}
function ktpClearPaste(){let el=document.getElementById('ktp-paste');if(el)el.value='';S.ktpSettings.paste='';S.ktpSettings.preview=[];renderKtpSettingsModal();}
function ktpClearPreview(){S.ktpSettings.preview=[];renderKtpSettingsModal();}
function ktpImportPreview(){
  let s=S.ktpSettings;if(!s.preview||!s.preview.length){alert('Нет тем для импорта.');return}
  let count=s.preview.length;
  if(!confirm('Добавить '+count+' тем в КТП «'+s.grade+' класс»? Существующие темы останутся без изменений.'))return;
  let year=s.year||planYear();let grade=+s.grade;
  if(!grade){alert('Выберите параллель.');return}
  let base=0;
  (D.planKtp||[]).filter(k=>k.academicYear===year&&k.gradeNumber===grade).forEach(k=>{if((k.order||0)>base)base=k.order||0;});
  s.preview.forEach(theme=>{base++;D.planKtp.push({id:uid(),academicYear:year,gradeNumber:grade,theme:theme,order:base});});
  save();
  s.preview=[];s.paste='';let el=document.getElementById('ktp-paste');if(el)el.value='';
  closeModal();render();
  alert('Импортировано тем: '+count+'. КТП для '+grade+' классов обновлено.');
}
function ktpParseText(text){
  if(!text)return[];
  return String(text).replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').map(l=>l.split('\t')[0].trim()).filter(t=>t.length>0);
}
function ktpSave(){
  let s=S.ktpSettings;if(!s||!s.grade)return;
  let year=s.year||planYear();let grade=+s.grade;
  let keepIds=new Set();s.themes.forEach(t=>{if(t.id)keepIds.add(t.id);});
  let removed=D.planKtp.filter(k=>k.academicYear===year&&k.gradeNumber===grade&&!keepIds.has(k.id));
  let removedIds=new Set(removed.map(k=>k.id));
  D.planKtp=D.planKtp.filter(k=>!(k.academicYear===year&&k.gradeNumber===grade&&!keepIds.has(k.id)));
  let classIds=new Set(D.classes.filter(c=>c.gradeNumber===grade).map(c=>c.id));
  D.planStatus=(D.planStatus||[]).filter(x=>!(removedIds.has(x.ktpId)&&classIds.has(x.classId)));
  let order=0;s.themes.forEach(t=>{
   order++;
   let theme=(t.theme||'').trim();if(!theme)return;
   if(t.id){let k=D.planKtp.find(x=>x.id===t.id);if(k){k.theme=theme;k.order=order;}}
   else D.planKtp.push({id:uid(),academicYear:year,gradeNumber:grade,theme:theme,order:order});
  });
  save();closeModal();render();
  alert('КТП для '+grade+' классов сохранено.');
}

/* ---- Федеральное КТП ---- */
function openFederalKtpImport(){
  let s=S.ktpSettings||{};
  let grade=s.grade||0;
  let grades=[...new Set((D.federalKtp||[]).map(k=>k.gradeNumber).filter(Boolean).concat(planClasses().map(c=>c.gradeNumber).filter(Boolean)))].sort((a,b)=>a-b);
  let gradeOpts=grades.map(g=>'<option value="'+g+'"'+(grade==g?' selected':'')+'>'+g+' класс'+(g!==1?'ы':'')+'</option>').join('');
  let subjects=[...new Set((D.federalKtp||[]).filter(k=>k.gradeNumber===grade).map(k=>k.subject))];
  let subjOpts=subjects.map(sj=>'<option value="'+e(sj)+'">'+e(sj)+'</option>').join('');
  let selSubj=subjects[0]||'';
  let ftps=(D.federalKtp||[]).filter(k=>k.gradeNumber===grade&&k.subject===selSubj);
  let listHtml=ftps.length?ftps.map(k=>'<tr><td>'+e(k.name||'Без названия')+'</td><td class="numcol">'+(k.hours||0)+'</td><td class="numcol">'+(k.themes?k.themes.length:0)+'</td><td style="width:200px"><button class="plan-act" onclick="previewFederalKtp(\''+k.id+'\')">Предпросмотр</button> <button class="plan-act primary" onclick="importFederalKtp(\''+k.id+'\')">Импортировать</button></td></tr>').join(''):'<tr><td colspan="4" class="empty small">Для выбранной параллели и предмета готовых федеральных КТП нет.</td></tr>';
  setModalHtml('Импорт федерального КТП',
   '<label>Параллель</label><select id="fktp-grade" onchange="fktpChangeGrade()">'+gradeOpts+'</select>'+
   '<label>Предмет</label><select id="fktp-subject" onchange="fktpChangeSubject()">'+subjOpts+'</select>'+
   '<table class="table"><thead><tr><th>Название КТП</th><th class="numcol" style="width:80px">Часов</th><th class="numcol" style="width:80px">Тем</th><th style="width:200px"></th></tr></thead><tbody id="fktp-list">'+listHtml+'</tbody></table>'+
   '<div class="toolbar" style="margin-top:14px"><button onclick="closeModal()">Закрыть</button></div>',true);
}
function fktpChangeGrade(){
  let el=document.getElementById('fktp-grade');if(!el)return;
  let grade=+el.value;
  let subjects=[...new Set((D.federalKtp||[]).filter(k=>k.gradeNumber===grade).map(k=>k.subject))];
  let subjEl=document.getElementById('fktp-subject');
  if(!subjEl)return;
  subjEl.innerHTML=subjects.map(sj=>'<option value="'+e(sj)+'">'+e(sj)+'</option>').join('');
  fktpChangeSubject();
}
function fktpChangeSubject(){
  let gradeEl=document.getElementById('fktp-grade');let subjEl=document.getElementById('fktp-subject');
  if(!gradeEl||!subjEl)return;
  let grade=+gradeEl.value;let subject=subjEl.value;
  let ftps=(D.federalKtp||[]).filter(k=>k.gradeNumber===grade&&k.subject===subject);
  let listHtml=ftps.length?ftps.map(k=>'<tr><td>'+e(k.name||'Без названия')+'</td><td class="numcol">'+(k.hours||0)+'</td><td class="numcol">'+(k.themes?k.themes.length:0)+'</td><td style="width:200px"><button class="plan-act" onclick="previewFederalKtp(\''+k.id+'\')">Предпросмотр</button> <button class="plan-act primary" onclick="importFederalKtp(\''+k.id+'\')">Импортировать</button></td></tr>').join(''):'<tr><td colspan="4" class="empty small">Для выбранной параллели и предмета готовых федеральных КТП нет.</td></tr>';
  document.getElementById('fktp-list').innerHTML=listHtml;
}
function previewFederalKtp(id){
  let k=(D.federalKtp||[]).find(x=>x.id===id);if(!k)return;
  let rows=(k.themes||[]).map((t,i)=>'<tr><td class="numcol">'+(i+1)+'</td><td>'+e(t.theme||'')+'</td></tr>').join('');
  setModalHtml('Предпросмотр КТП: '+e(k.name||'Без названия'),
   '<table class="table plan-ktp-preview"><thead><tr><th class="numcol" style="width:44px">№</th><th>Тема</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<p class="muted small">Часов: '+(k.hours||0)+' · Тем: '+(k.themes?k.themes.length:0)+'</p>'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="importFederalKtp(\''+id+'\')">Импортировать</button> <button onclick="openFederalKtpImport()">Назад</button></div>',true);
}
function importFederalKtp(id){
  let k=(D.federalKtp||[]).find(x=>x.id===id);if(!k)return;
  let s=S.ktpSettings||{};
  let year=s.year||planYear();let grade=+s.grade;
  if(!grade){alert('Выберите параллель.');return}
  let toRemove=D.planKtp.filter(x=>x.academicYear===year&&x.gradeNumber===grade&&x.sourceFederal===id);
  let removedIds=new Set(toRemove.map(x=>x.id));
  let classIds=new Set(D.classes.filter(c=>c.gradeNumber===grade).map(c=>c.id));
  D.planKtp=D.planKtp.filter(x=>!(x.academicYear===year&&x.gradeNumber===grade&&x.sourceFederal===id));
  D.planStatus=(D.planStatus||[]).filter(x=>!(removedIds.has(x.ktpId)&&classIds.has(x.classId)));
  let base=0;
  (D.planKtp||[]).filter(k2=>k2.academicYear===year&&k2.gradeNumber===grade).forEach(k2=>{if((k2.order||0)>base)base=k2.order||0;});
  (k.themes||[]).forEach((t,i)=>{base++;D.planKtp.push({id:uid(),academicYear:year,gradeNumber:grade,theme:t.theme||'',order:base,sourceFederal:id,subject:k.subject});});
  save();
  closeModal();render();
  alert('Импортировано тем: '+(k.themes?k.themes.length:0)+'. КТП для '+grade+' классов обновлено.');
}

/* ---- Автоматическое проставление дат ---- */
function openPlanDates(classId){
  let c=C(classId);if(!c)return;
  let cal=D.planCalendar[classId]||{academicYear:planYear(),startDate:'',endDate:'',lessonDays:[0,1,2,3,4],holidays:[],extraDays:[]};
  let daysHtml=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d,i)=>'<label style="display:inline-block;margin:0 8px"><input type="checkbox" value="'+i+'"'+(cal.lessonDays&&cal.lessonDays.includes(i)?' checked':'')+' style="width:auto"> '+d+'</label>').join('');
  let holidaysHtml=(cal.holidays||[]).map((h,i)=>'<tr><td><input type="text" value="'+e(h.name||'')+'" style="width:140px" onchange="planEditHoliday(\''+classId+'\','+i+',\'name\',this.value)"></td><td><input type="date" value="'+e(h.startDate||'')+'" style="width:120px" onchange="planEditHoliday(\''+classId+'\','+i+',\'startDate\',this.value)"></td><td><input type="date" value="'+e(h.endDate||'')+'" style="width:120px" onchange="planEditHoliday(\''+classId+'\','+i+',\'endDate\',this.value)"></td><td><button class="plan-act danger" onclick="planDeleteHoliday(\''+classId+'\','+i+')">✕</button></td></tr>').join('');
  let extraHtml=(cal.extraDays||[]).map((d,i)=>'<tr><td><input type="text" value="'+e(d.name||'')+'" style="width:140px" onchange="planEditExtraDay(\''+classId+'\','+i+',\'name\',this.value)"></td><td><input type="date" value="'+e(d.date||'')+'" style="width:120px" onchange="planEditExtraDay(\''+classId+'\','+i+',\'date\',this.value)"></td><td><button class="plan-act danger" onclick="planDeleteExtraDay(\''+classId+'\','+i+')">✕</button></td></tr>').join('');
  setModalHtml('Проставить даты — '+e(c.name),
   '<label>Начало учебного года</label><input type="date" id="pd-start" value="'+e(cal.startDate||'')+'" onchange="planEditCalendar(\''+classId+'\',\'startDate\',this.value)">'+
   '<label>Окончание учебного года</label><input type="date" id="pd-end" value="'+e(cal.endDate||'')+'" onchange="planEditCalendar(\''+classId+'\',\'endDate\',this.value)">'+
   '<label>Дни проведения уроков</label><div style="margin-bottom:8px">'+daysHtml+'</div>'+
   '<div class="toolbar" style="margin-top:4px;gap:4px">'+['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d,i)=>'<button class="plan-act plan-day-toggle'+(cal.lessonDays&&cal.lessonDays.includes(i)?' primary':'')+'" onclick="planToggleLessonDay(\''+classId+'\','+i+')">'+d+'</button>').join('')+'</div>'+
   '<label>Каникулы и неучебные периоды</label>'+
   '<table class="table"><thead><tr><th>Название</th><th class="numcol" style="width:120px">Начало</th><th class="numcol" style="width:120px">Окончание</th><th style="width:56px"></th></tr></thead><tbody id="pd-holidays">'+holidaysHtml+'</tbody></table>'+
   '<div class="toolbar" style="margin-top:6px"><button class="plan-act" onclick="planAddHoliday(\''+classId+'\')">＋ Период каникул</button></div>'+
   '<label>Дополнительные неучебные дни</label>'+
   '<table class="table"><thead><tr><th>Название</th><th class="numcol" style="width:120px">Дата</th><th style="width:56px"></th></tr></thead><tbody id="pd-extra">'+extraHtml+'</tbody></table>'+
   '<div class="toolbar" style="margin-top:6px"><button class="plan-act" onclick="planAddExtraDay(\''+classId+'\')">＋ Неучебный день</button></div>'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="planCalculateDates(\''+classId+'\')">Рассчитать даты</button> <button onclick="closeModal()">Отмена</button></div>',true);
}
function planEditCalendar(classId,key,value){let cal=D.planCalendar[classId]||{};cal[key]=value;D.planCalendar[classId]=cal;save();}
function planToggleLessonDay(classId,day){let cal=D.planCalendar[classId]||{};cal.lessonDays=cal.lessonDays||[];let idx=cal.lessonDays.indexOf(day);if(idx>=0)cal.lessonDays.splice(idx,1);else cal.lessonDays.push(day);cal.lessonDays.sort((a,b)=>a-b);D.planCalendar[classId]=cal;save();openPlanDates(classId);}
function planAddHoliday(classId){let cal=D.planCalendar[classId]||{};cal.holidays=cal.holidays||[];cal.holidays.push({name:'Каникулы',startDate:'',endDate:''});D.planCalendar[classId]=cal;save();openPlanDates(classId);}
function planDeleteHoliday(classId,i){let cal=D.planCalendar[classId]||{};if(!cal.holidays)return;cal.holidays.splice(i,1);D.planCalendar[classId]=cal;save();openPlanDates(classId);}
function planEditHoliday(classId,i,key,value){let cal=D.planCalendar[classId]||{};if(!cal.holidays)return;cal.holidays[i][key]=value;D.planCalendar[classId]=cal;save();}
function planAddExtraDay(classId){let cal=D.planCalendar[classId]||{};cal.extraDays=cal.extraDays||[];cal.extraDays.push({name:'Неучебный день',date:''});D.planCalendar[classId]=cal;save();openPlanDates(classId);}
function planDeleteExtraDay(classId,i){let cal=D.planCalendar[classId]||{};if(!cal.extraDays)return;cal.extraDays.splice(i,1);D.planCalendar[classId]=cal;save();openPlanDates(classId);}
function planEditExtraDay(classId,i,key,value){let cal=D.planCalendar[classId]||{};if(!cal.extraDays)return;cal.extraDays[i][key]=value;D.planCalendar[classId]=cal;save();}

function planCalculateDates(classId){
  let c=C(classId);if(!c)return;
  let cal=D.planCalendar[classId]||{};
  let ls=planLessonsFor(classId);
  if(!ls.length){alert('Нет уроков в планировании для класса '+c.name+'.');return}
  if(!cal.startDate||!cal.endDate){alert('Укажите начало и окончание учебного года.');return}
  if(!cal.lessonDays||!cal.lessonDays.length){alert('Выберите хотя бы один день недели для уроков.');return}
  // Build set of blocked dates
  let blocked=new Set();
  (cal.holidays||[]).forEach(h=>{if(!h.startDate||!h.endDate)return;let d=new Date(h.startDate);let end=new Date(h.endDate);while(d<=end){blocked.add(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}});
  (cal.extraDays||[]).forEach(d=>{if(d.date)blocked.add(d.date);});
  // Generate valid school days
  let start=new Date(cal.startDate);let end=new Date(cal.endDate);
  let validDays=[];
  let d=new Date(start);
  while(d<=end){
    let day=(d.getDay()+6)%7;let iso=d.toISOString().slice(0,10);
    if(cal.lessonDays.includes(day)&&!blocked.has(iso))validDays.push(iso);
    d.setDate(d.getDate()+1);
  }
  // Check lesson count warning
  let nLessons=ls.length;
  let warn='';
  if(nLessons!==34&&nLessons!==68){
    warn='В планировании обнаружено '+nLessons+' урока. Стандартная годовая нагрузка составляет 34 или 68 часов. Проверьте количество тем в КТП. Даты будут проставлены для всех имеющихся уроков.';
  }
  let undistributed=nLessons>validDays.length?nLessons-validDays.length:0;
  if(undistributed>0){
    warn+='\nДопустимых учебных дат не хватает: '+undistributed+' уроков останутся без даты.';
  }
  // Distribute
  let assignments=[];
  for(let i=0;i<ls.length;i++){
    let date=validDays[i]||'';
    assignments.push({lessonId:ls[i].id,date:date,topic:ls[i].topic});
  }
  // Preview
  let previewRows=assignments.map(a=>'<tr><td class="numcol">'+(a.lessonId&&assignments.indexOf(a)+1)+'</td><td>'+(a.date?fmtDate(a.date):'<span class="muted">—</span>')+'</td><td>'+e(a.topic||'')+'</td></tr>').join('');
  S.planDatesPreview={classId:classId,assignments:assignments,validDays:validDays,lessons:ls.length,distributed:validDays.length<ls.length?validDays.length:ls.length,undistributed:undistributed,warn:warn};
  let html='<div style="max-height:400px;overflow:auto"><table class="table plan-dates-preview"><thead><tr><th class="numcol" style="width:44px">№</th><th class="numcol" style="width:120px">Дата</th><th>Тема урока</th></tr></thead><tbody>'+previewRows+'</tbody></table></div>'+
   '<p class="muted small">Тем: '+ls.length+' · Рассчитано дат: '+(validDays.length<ls.length?validDays.length:ls.length)+' · Нераспределённых: '+undistributed+'</p>'+
   (warn?'<div class="notice" style="margin-top:8px">'+e(warn.replace(/\n/g,'<br>'))+'</div>':'')+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="planApplyDatesPreview()">Применить даты</button> <button onclick="openPlanDates(\''+classId+'\')">Изменить настройки</button> <button onclick="closeModal()">Отмена</button></div>';
  setModalHtml('Предпросмотр дат — '+e(c.name),html,true);
}
function planApplyDatesPreview(){
  let p=S.planDatesPreview;if(!p)return;
  let cid=p.classId;
  let applied=0;
  p.assignments.forEach(a=>{
    let l=(D.planLessons||[]).find(x=>x.id===a.lessonId);
    if(l){l.date=a.date||'';applied++;}
  });
  save();
  S.planDatesPreview=null;
  closeModal();
  render();
  alert('Даты проставлены для '+applied+' уроков.');
}

/* ---- поурочное планирование ---- */
function planLessonsBlock(){
  let cid=S.planClassId||null;
  let classes=planClasses();
  if(!classes.length){
    return '<div class="card empty">Нет классов для учебного года «'+e(planYear())+'».</div>';
  }
  if(!cid||!C(cid)){S.planClassId=classes[0].id;cid=S.planClassId;}
  let c=C(cid);
  let conf=planConf();
  let ls=planLessonsFor(c.id);
  let cols=[{key:'num',label:'№',w:conf.widths.num},{key:'date',label:'Дата',w:conf.widths.date},{key:'topic',label:'Тема урока',w:conf.widths.topic}];
  if(conf.visible.materials!==false)cols.push({key:'materials',label:'Материалы',w:conf.widths.materials});
  if(conf.visible.note!==false)cols.push({key:'note',label:'Примечание',w:conf.widths.note});
  cols.push({key:'act',label:'',w:70});
  let colHtml=cols.map(col=>'<col style="width:'+col.w+'px">').join('');
  let headHtml='<tr>'+cols.map(col=>'<th class="plan-col-'+col.key+'">'+(col.label?e(col.label):'')+'</th>').join('')+'</tr>';
  let body='',prevMonth=null,showedNoDate=false;
  ls.forEach((l,i)=>{
    let month=l.date?fmtDate(l.date).slice(3):null;
    if(month&&month!==prevMonth){
      prevMonth=month;body+='<tr><td class="plan-sep" colspan="'+(cols.length-1)+'">'+e(monthNames[+month.split('.')[0]-1]+' '+month.split('.')[1])+'</td><td></td></tr>';
    }else if(!month&&!showedNoDate){
      showedNoDate=true;body+='<tr><td class="plan-sep" colspan="'+(cols.length-1)+'">Без даты</td><td></td></tr>';
    }
    body+=planLessonRow(l,c,i+1,cols);
  });
  return '<div class="plan-block" id="plan-block2">'+
   '<div class="top"><div><h2>Индивидуальное поурочное планирование</h2><div class="muted small">'+e(c.name)+' · '+e(planYear())+'</div></div>'+
   '<div class="toolbar">'+
    '<label>Класс</label><select onchange="planSelectClass(this.value)">'+classes.map(x=>'<option value="'+x.id+'"'+(cid===x.id?' selected':'')+'>'+e(x.name)+'</option>').join('')+'</select>'+
    '<button onclick="planAddLesson(\''+c.id+'\')">＋ Урок</button>'+
    '<button onclick="planAddEmptyRows(\''+c.id+'\')">＋ Пустые строки</button>'+
    '<button onclick="openPlanSettings()">Настройки таблицы</button>'+
    '<button onclick="openPlanDates(\''+c.id+'\')">Проставить даты</button>'+
   '</div></div>'+
   '<div class="plan-table-wrap"><table class="table plan-lessons-table">'+colHtml+headHtml+'<tbody>'+body+'</tbody></table></div>'+
   '<div class="muted small" style="margin-top:6px">Всего уроков: '+ls.length+'</div>'+
   '</div>';
}
const monthNames=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
function planLessonRow(l,c,n,cols){
  let pe=S.planEdit;
  let ed=pe&&pe.lessonId===l.id;
  let rowClass='plan-lesson-row'+(l.date?'':' nodate');
  let cells='';
  cols.forEach(col=>{
    if(col.key==='num'){cells+='<td class="plan-col-num numcol">'+n+'</td>';return}
    if(col.key==='act'){
      cells+='<td class="plan-col-act"><div class="plan-actions">'+
       (l.date?'<button class="plan-act" onclick="event.stopPropagation();planMoveLesson(\''+l.id+'\',-1)" title="Выше">↑</button>':'')+
       (l.date?'<button class="plan-act" onclick="event.stopPropagation();planMoveLesson(\''+l.id+'\',1)" title="Ниже">↓</button>':'')+
       '<button class="plan-act" onclick="event.stopPropagation();planDuplicateLesson(\''+l.id+'\')" title="Дублировать">⧉</button>'+
       '<button class="plan-act danger" onclick="event.stopPropagation();planDeleteLesson(\''+l.id+'\')" title="Удалить">✕</button>'+
       '</div></td>';return
    }
    let cls='plan-col-'+col.key;
    let value=l[col.key]||'';
    if(ed&&pe.field===col.key){
      if(col.key==='date'){cells+='<td class="'+cls+'"><input type="date" class="plan-inline" value="'+e(value)+'" onblur="planSaveCell(\''+l.id+'\',\''+col.key+'\',this.value)" onkeydown="if(event.key===Enter)planSaveCell(\''+l.id+'\',\''+col.key+'\',this.value)"></td>';}
      else{cells+='<td class="'+cls+'"><input class="plan-inline" value="'+e(value)+'" onblur="planSaveCell(\''+l.id+'\',\''+col.key+'\',this.value)" onkeydown="if(event.key===Enter)planSaveCell(\''+l.id+'\',\''+col.key+'\',this.value)"></td>';}
      return;
    }
    if(col.key==='date'){cells+='<td class="'+cls+' click" onclick="planEditCell(\''+l.id+'\',\''+col.key+'\')">'+(value?fmtDate(value):'<span class="muted">—</span>')+'</td>';}
    else if(col.key==='materials'){
      let html='',ids=l.materials||[];
      ids.forEach(mid=>{let m=M(mid);if(!m)return;html+='<span class="plan-mat">'+matIconOf(m)+' '+e(m.filename)+'<button onclick="event.stopPropagation();planOpenMaterial(\''+mid+'\')" title="Открыть">🔍</button><button class="danger" onclick="event.stopPropagation();planDetachMaterial(\''+l.id+'\',\''+mid+'\')" title="Убрать">✕</button></span>'});
      html+='<button class="plan-attach" onclick="event.stopPropagation();planOpenAttach(\''+l.id+'\')">＋ Прикрепить</button>';
      cells+='<td class="'+cls+' plan-mat-cell">'+(html||'<span class="muted">—</span>')+'</td>';
    }else{cells+='<td class="'+cls+' click" onclick="planEditCell(\''+l.id+'\',\''+col.key+'\')">'+(value?e(value):'<span class="muted">—</span>')+'</td>';}
  });
  return '<tr class="'+rowClass+'">'+cells+'</tr>';
}
function planEditCell(lessonId,field){S.planEdit={lessonId,field};render();}
function planSaveCell(lessonId,field,value){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l){S.planEdit=null;render();return}
  l[field]=(value||'').trim();
  if(field==='date'&&l[field]==='')delete l[field];
  save();S.planEdit=null;render();
}
function planAddLesson(classId){
  D.planLessons.push({id:uid(),classId,date:'',topic:'',note:'',materials:[],order:planNextOrder(classId)});
  save();render();
}
function planAddEmptyRows(classId){
  let n=+prompt('Сколько пустых строк добавить?','5')||0;if(!n)return;
  for(let i=0;i<n;i++)D.planLessons.push({id:uid(),classId,date:'',topic:'',note:'',materials:[],order:planNextOrder(classId)});
  save();render();
}
function planDuplicateLesson(id){
  let orig=(D.planLessons||[]).find(x=>x.id===id);if(!orig)return;
  let copy={id:uid(),classId:orig.classId,date:'',topic:orig.topic,note:orig.note,materials:(orig.materials||[]).slice(),order:planNextOrder(orig.classId)};
  let arr=D.planLessons;let i=arr.findIndex(x=>x.id===id);arr.splice(i+1,0,copy);
  save();render();
}
function planDeleteLesson(id){
  if(!confirm('Удалить урок из плана?'))return;
  D.planLessons=(D.planLessons||[]).filter(x=>x.id!==id);save();render();
}
function planMoveLesson(id,dir){
  let cid=S.planClassId;let ls=planLessonsFor(cid);let i=ls.findIndex(x=>x.id===id);let j=i+dir;if(j<0||j>=ls.length)return;
  let o=ls[i].order||0;ls[i].order=ls[j].order;ls[j].order=o;save();render();
}

/* ---- материалы урока ---- */
function planOpenAttach(lessonId){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  l.materials=l.materials||[];
  let have=l.materials.map(mid=>M(mid)).filter(Boolean);
  let body='<div class="toolbar" style="margin-bottom:10px;flex-wrap:wrap">'+
   '<button onclick="document.getElementById(\'pl-upload\').click()">Загрузить файл</button>'+
   '<input id="pl-upload" type="file" multiple hidden onchange="planUploadFiles(\''+lessonId+'\',this)">'+
   '<button onclick="planOpenAddLink(\''+lessonId+'\')">🔗 Ссылка</button>'+
   '<button onclick="planPickLibrary(\''+lessonId+'\')">Из библиотеки</button>'+
   '</div>'+
   '<div class="materials-list">'+have.map(m=>'<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+'</span><span class="toolbar" style="flex:0"><button onclick="planOpenMaterial(\''+m.id+'\')">Открыть</button><button onclick="planDownloadMaterial(\''+m.id+'\')">⬇ Скачать</button><button class="danger" onclick="planDetachMaterial(\''+lessonId+'\',\''+m.id+'\')">Убрать</button></span></div>').join('')||'<div class="empty small">Материалов нет</div>'+
   '</div>';
  setModalHtml('Материалы урока',body);
}
async function planUploadFiles(lessonId,input){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  l.materials=l.materials||[];
  for(let f of input.files){
    let mid=uid();await fileStorePut(mid,f);
    D.materials.push({id:mid,filename:f.name,category:C(l.classId)?C(l.classId).name:'Без категории',mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
    l.materials.push(mid);
  }
  save();planOpenAttach(lessonId);
}
function planOpenAddLink(lessonId){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  let cls=C(l.classId);
  setModalHtml('Добавить ссылку',
   '<label>Название</label><input id="pl-link-name" placeholder="Видео по теме">'+
   '<label>Ссылка (URL)</label><input id="pl-link-url" placeholder="https://...">'+
   '<label>Категория</label><input id="pl-link-cat" value="'+e(cls?cls.name:'')+'">'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="planSaveAddLink(\''+lessonId+'\')">Добавить</button><button onclick="planOpenAttach(\''+lessonId+'\')">Отмена</button></div>');
}
function planSaveAddLink(lessonId){
  let name=document.getElementById('pl-link-name').value.trim();let url=document.getElementById('pl-link-url').value.trim();
  if(!name||!url){alert('Укажите название и ссылку.');return}
  if(!/^https?:\/\//i.test(url))url='https://'+url;
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  l.materials=l.materials||[];
  let mid=uid();D.materials.push({id:mid,filename:name,category:document.getElementById('pl-link-cat').value.trim()||'Без категории',isLink:true,url,mimeType:'',size:0,createdAt:new Date().toISOString()});
  l.materials.push(mid);save();planOpenAttach(lessonId);
}
function planPickLibrary(lessonId){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  let have=new Set(l.materials||[]);
  let avail=D.materials.filter(m=>!have.has(m.id));
  if(!avail.length){setModalHtml('Из библиотеки','<div class="empty">В библиотеке нет файлов.</div><div class="toolbar" style="margin-top:12px"><button onclick="planOpenAttach(\''+lessonId+'\')">Назад</button></div>');return}
  setModalHtml('Выбрать из библиотеки',
   '<div class="materials-list">'+avail.map(m=>'<label class="m" style="cursor:pointer"><span style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="pll-cb" value="'+m.id+'" style="width:auto">'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">('+e(m.category||'')+')</span></span></label>').join('')+'</div>'+
   '<div class="toolbar" style="margin-top:12px"><button class="primary" onclick="planSaveLibrary(\''+lessonId+'\')">Добавить выбранные</button><button onclick="planOpenAttach(\''+lessonId+'\')">Отмена</button></div>');
}
function planSaveLibrary(lessonId){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  l.materials=l.materials||[];
  document.querySelectorAll('.pll-cb').forEach(cb=>{if(cb.checked&&!l.materials.includes(cb.value))l.materials.push(cb.value)});
  save();planOpenAttach(lessonId);
}
function planDetachMaterial(lessonId,mid){
  let l=(D.planLessons||[]).find(x=>x.id===lessonId);if(!l)return;
  l.materials=(l.materials||[]).filter(x=>x!==mid);save();planOpenAttach(lessonId);
}

/* ---- настройки ---- */
function openPlanSettings(){
  let conf=planConf();
  setModalHtml('Настройки планирования',
   '<label>Учебный год</label><input id="ps-year" value="'+e(conf.academicYear||'')+'" onchange="planConf().academicYear=this.value;save()">'+
   '<h3>Отображаемые столбцы таблицы планирования</h3>'+
   '<label class="attrow" style="cursor:pointer"><span>№</span> <span class="muted small">обязательный</span></label>'+
   '<label class="attrow" style="cursor:pointer"><span>Дата</span> <span class="muted small">обязательный</span></label>'+
   '<label class="attrow" style="cursor:pointer"><span>Тема урока</span> <span class="muted small">обязательный</span></label>'+
   '<label class="attrow" style="cursor:pointer"><span>Материалы</span><input type="checkbox" '+(conf.visible.materials!==false?'checked':'')+' style="width:auto" onchange="planConf().visible.materials=this.checked;save();render()"></label>'+
   '<label class="attrow" style="cursor:pointer"><span>Примечание</span><input type="checkbox" '+(conf.visible.note!==false?'checked':'')+' style="width:auto" onchange="planConf().visible.note=this.checked;save();render()"></label>'+
   '<h3>Ширина столбцов (px)</h3>'+
   Object.keys(conf.widths).map(k=>'<label>'+e(k)+'</label><input type="number" min="40" value="'+conf.widths[k]+'" style="width:120px" onchange="planConf().widths[\''+k+'\']=+this.value||40;save();render()">').join('')+
    '<div class="section-sep"></div>'+
    '<h3>Темы КТП</h3><p class="muted small">Темы КТП настраиваются отдельно через кнопку «Настроить КТП» в сводной таблице или через импорт из Word. Классы одной параллели используют общий список тем, но имеют независимые статусы прохождения.</p>'+
   '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="closeModal()">Закрыть</button></div>');
}

/* ---- страница раздела ---- */
function planningPage(){
  planDefaults();
  let classes=planClasses();
  let year=planYear();
  if(!S.planClassId&&classes.length)S.planClassId=classes[0].id;
  return '<div class="plan-wrap">'+
   '<div class="top"><div><h1>Планирование уроков</h1><div class="muted small">Сводный обход КТП по параллелям и поурочное планирование классов · '+e(year)+'</div></div></div>'+
   '<div class="card plan-card"><h2>Обзор прохождения КТП по параллелям</h2>'+planKtpOverview()+'</div>'+
   '<div id="plan-anchor"></div>'+planLessonsBlock()+
   '</div>';
  setTimeout(()=>{let el=document.getElementById('plan-anchor');if(el&&S.planClassId){el.scrollIntoView({behavior:'smooth',block:'start'})}},0);
}
