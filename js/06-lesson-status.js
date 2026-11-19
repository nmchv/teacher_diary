/* ===================== СТАТУС УРОКА / БЛОКИРОВКИ ===================== */
function lessonHasOccurred(l){
 let todayStr=toISO(new Date());
 if(l.date<todayStr)return true;
 if(l.date>todayStr)return false;
 let endMin=timeToMin(l.endTime);
 if(endMin===null)return true;
 let now=new Date();
 return (now.getHours()*60+now.getMinutes())>=endMin;
}
function lessonStatus(l){
 if(l.cancelled)return'cancelled';
 if(l.manualStatus)return l.manualStatus;
 if(l.manuallyCompleted)return'green';
 let plan=(l.customFields&&l.customFields.planText||'').trim();
 if(plan)return'blue';
 return'red';
}
function lessonHasActivity(l){return lessonStatus(l)!=='red'||Object.keys(l.attendance||{}).length||Object.keys(l.grades||{}).length}
function statusLabel(s){return s==='green'?'Заполнен':s==='yellow'?'Частично подготовлен':s==='blue'?'Подготовлен':s==='cancelled'?'Отменён':'Не подготовлен'}
function setLessonManualStatus(id,val){
 let l=L(id);if(!l)return;
 l.manualStatus=val||null;
 if(val==='green')l.manuallyCompleted=true;else if(l.manuallyCompleted&&val!=='green')l.manuallyCompleted=false;
 save();
 if(S.lessonModal)renderModalOnly();else render();
}
function lessonStatusPicker(l){
 return '<select onchange="setLessonManualStatus(\''+l.id+'\',this.value)" style="width:auto;display:inline-block;font-weight:600">'+
  '<option value=""'+(!l.manualStatus?' selected':'')+'>Авто (по плану)</option>'+
  '<option value="red"'+(l.manualStatus==='red'?' selected':'')+'>🔴 Не подготовлено</option>'+
  '<option value="yellow"'+(l.manualStatus==='yellow'?' selected':'')+'>🟡 Частично подготовлено</option>'+
  '<option value="blue"'+(l.manualStatus==='blue'?' selected':'')+'>🔵 Подготовлено</option>'+
  '<option value="green"'+(l.manualStatus==='green'?' selected':'')+'>🟢 Заполнено</option>'+
  '</select>';
}
function findBlock(dateStr,lessonNumber){
 return D.scheduleBlocks.find(b=>{
  if(dateStr<b.startDate||dateStr>b.endDate)return false;
  if(!b.lessonNumbers||!b.lessonNumbers.length)return true;
  return lessonNumber&&b.lessonNumbers.includes(+lessonNumber);
 })||null;
}
function checkNotBlocked(dateStr,lessonNumber){
 let b=findBlock(dateStr,lessonNumber);
 if(b){alert('Нельзя создать урок в это время. Этот период заблокирован: «'+b.reason+'».');return false}
 return true;
}

