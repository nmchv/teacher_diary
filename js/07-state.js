/* ===================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===================== */
let S={view:'home',classId:null,studentId:null,tab:'lessons',q:'',weekStart:mondayOf(toISO(new Date())),
 sidebarCollapsed:false,studentSort:'fio',statsFilter:{period:'all',classId:'',studentId:'',from:'',to:'',sortClasses:'name',sortDirClasses:'asc',sortStudents:'fio',sortDirStudents:'asc'},
 lessonModal:null /* {id, mode:'view'|'edit', draft} */, materialsCategory:'',
 chartPeriods:{student:{period:'all',from:'',to:''},class:{period:'all',from:'',to:''}},
 recentFilter:{classId:'',status:'',sort:'date_desc',limit:10},
 workTab:'meetings',selectedStudentIds:new Set(),libraryClassFilter:'',
 reportsSelClasses:new Set(),reportsLessonDates:{},reportsPlanPeriod:'',reportsPlanFrom:'',reportsPlanTo:'',reportsPlanOpts:{num:false,topic:true,hw:true,plan:false,cancelled:false},reportsComment:'',reportsIncludeHomeschool:true,classPrintIncludeHomeschool:true};

function resolvePeriodRange(periodKey,customFrom,customTo){
 let today=toISO(new Date());
 if(periodKey==='month')return{from:addDays(today,-30),to:today};
 if(periodKey==='custom')return{from:customFrom||'0000-01-01',to:customTo||'9999-12-31'};
 if(periodKey==='quarter_approx')return{from:addDays(today,-63),to:today};
 let q=(D.settings.quarters||[]).find(x=>x.id===periodKey);
 if(q)return{from:q.startDate,to:q.endDate};
 return{from:'0000-01-01',to:'9999-12-31'};
}
function periodOptionsList(){
 let opts=[['all','Весь период']];
 (D.settings.quarters||[]).forEach(q=>opts.push([q.id,q.name]));
 if(!(D.settings.quarters||[]).length)opts.push(['quarter_approx','Четверть (~9 нед., приблизительно)']);
 opts.push(['month','Месяц']);
 opts.push(['custom','Произвольный']);
 return opts;
}
function chartPeriodRange(scope){
 let cp=S.chartPeriods[scope];
 return resolvePeriodRange(cp.period,cp.from,cp.to);
}
function setChartPeriod(scope,period){S.chartPeriods[scope].period=period;render()}
function setChartCustomDate(scope,which,val){S.chartPeriods[scope][which]=val;render()}
function periodPickerHtml(scope){
 let cp=S.chartPeriods[scope];
 let opts=periodOptionsList();
 return '<div class="toolbar" style="margin-bottom:12px">'+
  opts.map(o=>'<button class="'+(cp.period===o[0]?'primary':'')+'" onclick="setChartPeriod(\''+scope+'\',\''+o[0]+'\')">'+e(o[1])+'</button>').join('')+
  (cp.period==='custom'?'<input type="date" value="'+e(cp.from)+'" onchange="setChartCustomDate(\''+scope+'\',\'from\',this.value)" style="width:150px;flex:0">&nbsp;–&nbsp;<input type="date" value="'+e(cp.to)+'" onchange="setChartCustomDate(\''+scope+'\',\'to\',this.value)" style="width:150px;flex:0">':'')+
  (!(D.settings.quarters||[]).length?'<div class="muted small" style="width:100%;margin-top:4px">Настройте точные границы четвертей в Настройках → Расписание, чтобы фильтровать по ним точно.</div>':'')+
  '</div>';
}

