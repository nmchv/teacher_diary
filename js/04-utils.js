/* ===================== УТИЛИТЫ ===================== */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const e=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nl2br=x=>e(x).replace(/\n/g,'<br>');
function richTextView(val){
 if(!val)return'';
 if(/<[a-z][^>]*>/i.test(val))return val;
 return nl2br(val);
}
const C=i=>D.classes.find(x=>x.id===i);
function parseClassName(name){
 let m=String(name||'').match(/^\s*(\d+)\s*(.*)$/);
 if(m)return{number:+m[1],letter:m[2].trim()};
 return{number:null,letter:String(name||'').trim()};
}
function compareClasses(a,b){
 let an=a.gradeNumber,bn=b.gradeNumber;
 if(an!=null&&bn!=null&&an!==bn)return an-bn;
 if(an!=null&&bn==null)return -1;
 if(an==null&&bn!=null)return 1;
 return (a.gradeLetter||a.name||'').localeCompare(b.gradeLetter||b.name||'','ru')||(a.name||'').localeCompare(b.name||'','ru');
}
function sortedClasses(list){return [...list].sort(compareClasses)}
function clubsSidebarHtml(){
 let clubs=sortedClasses(D.classes.filter(c=>c.type==='club'));
 if(!clubs.length)return '<div class="small muted label" style="padding:6px 8px">Кружков пока нет</div>';
 let byParent={};
 clubs.forEach(c=>{if(c.parentClubId){(byParent[c.parentClubId]=byParent[c.parentClubId]||[]).push(c)}});
 let clubIds=new Set(clubs.map(c=>c.id));
 let row=(c,indent)=>'<div class="classrow" style="padding-left:'+(indent*14)+'px"><button class="label" onclick="openClass(\''+c.id+'\')">'+(indent?'↳ ':'')+e(c.name)+'</button><button class="label" onclick="event.stopPropagation();openEditClass(\''+c.id+'\')">⋯</button></div>';
 let html='';
 clubs.filter(c=>!c.parentClubId||!clubIds.has(c.parentClubId)).forEach(c=>{
  html+=row(c,0);
  (byParent[c.id]||[]).forEach(g=>html+=row(g,1));
 });
 return html;
}
function classOptionsHtml(selectedId){
 let classes=sortedClasses(D.classes.filter(c=>c.type!=='club'));
 let clubs=sortedClasses(D.classes.filter(c=>c.type==='club'));
 let opt=c=>'<option value="'+c.id+'"'+(c.id===selectedId?' selected':'')+'>'+e(c.name)+'</option>';
 let html='';
 if(classes.length)html+='<optgroup label="Классы">'+classes.map(opt).join('')+'</optgroup>';
 if(clubs.length)html+='<optgroup label="Кружки">'+clubs.map(opt).join('')+'</optgroup>';
 return html;
}
const P=i=>D.students.find(x=>x.id===i);
const L=i=>D.lessons.find(x=>x.id===i);
function activeLessons(){return D.lessons.filter(l=>!l.archived)}
function purgeOldArchivedLessons(){
 let today=toISO(new Date());
 D.lessons=D.lessons.filter(l=>{
  if(!l.archived)return true;
  return daysBetween(l.archivedAt||today,today)<30;
 });
}
const M=i=>D.materials.find(x=>x.id===i);
function fmtDate(x){if(!x)return'—';let d=new Date(x+'T12:00:00');if(isNaN(d))return'—';return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()}
function fmtDateShort(x){let d=new Date(x+'T12:00:00');return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')}
function age(x){if(!x)return'—';let b=new Date(x+'T12:00:00'),n=new Date(),a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()==b.getMonth()&&n.getDate()<b.getDate()))a--;return a>=0&&a<130?a:'—'}
function toISO(d){return d.toISOString().slice(0,10)}
function mondayOf(dateStr){let d=new Date(dateStr+'T12:00:00');let day=d.getDay();let diff=(day===0?-6:1-day);d.setDate(d.getDate()+diff);return toISO(d)}
function addDays(dateStr,n){let d=new Date(dateStr+'T12:00:00');d.setDate(d.getDate()+n);return toISO(d)}
function weekDates(monday){return (D.settings.showSaturday?[0,1,2,3,4,5]:[0,1,2,3,4]).map(i=>addDays(monday,i))}
function dayIndexOfDate(dateStr){let d=new Date(dateStr+'T12:00:00');let day=d.getDay();return day===0?6:day-1} // 0=Пн..4=Пт,5=Сб,6=Вс
function timeFor(n){let t=LESSON_TIMES.find(x=>x.n===+n);return t?{start:t.start,end:t.end}:{start:'',end:''}}
function fieldDefs(entity){return D.settings.fields[entity]}
function visibleFields(entity){return fieldDefs(entity).filter(f=>f.visible).sort((a,b)=>0)}
function fieldByKey(entity,key){return fieldDefs(entity).find(f=>f.key===key)}
function people(cid){return D.students.filter(s=>(s.classIds||[]).includes(cid)&&s.status!=='archived').sort((a,b)=>(a.lastName+a.firstName).localeCompare(b.lastName+b.firstName,'ru'))}
function groupIds(cid){let out=[cid],q=[cid];while(q.length){let par=q.shift();D.classes.forEach(c=>{if(c.parentClubId===par&&!out.includes(c.id)){out.push(c.id);q.push(c.id)}})}return out}
function hasChildGroups(cid){return groupIds(cid).length>1}
function groupLessons(cid){let ids=groupIds(cid);return activeLessons().filter(l=>ids.includes(l.classId))}
function peopleGroup(cid){let ids=groupIds(cid);return D.students.filter(s=>s.status!=='archived'&&(s.classIds||[]).some(i=>ids.includes(i))).sort((a,b)=>(a.lastName+a.firstName).localeCompare(b.lastName+b.firstName,'ru'))}
function attendablePeople(cid){return people(cid).filter(s=>!s.homeschool)}
function studentClassObjs(s){return (s.classIds||[]).map(id=>C(id)).filter(Boolean)}
function studentClassNames(s){let cs=studentClassObjs(s);return cs.length?cs.map(c=>c.name+(c.subject?' ('+c.subject+')':'')).join(', '):'Без класса'}
function studentFio(s){return e(s.lastName)+' '+e(s.firstName)+(s.middleName?' '+e(s.middleName):'')}
function avg(nums){if(!nums.length)return null;return nums.reduce((a,b)=>a+b,0)/nums.length}
function round2(n){return n===null||n===undefined?'—':Math.round(n*100)/100}

