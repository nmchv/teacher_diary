/* ===================== РАССАДКА ===================== */
function studentFioShort(s){return e(s.lastName)+' '+e(s.firstName)}
function seatDisplayName(s){
 let nick=s.customFields&&s.customFields.nickname&&s.customFields.nickname.trim();
 return nick?e(nick):studentFioShort(s);
}
function presentName(s){
 let nick=s.customFields&&s.customFields.nickname&&String(s.customFields.nickname).trim();
 return nick?e(nick):studentFio(s);
}
function presentNamePlain(s){
 let nick=s.customFields&&s.customFields.nickname&&String(s.customFields.nickname).trim();
 return nick||studentFioPlain(s);
}
function isAbsentOnLesson(l,sid){return !!l&&(l.attendance||{})[sid]==='н'}
function seatingGridHtml(c,editable,att){
 let seating=c.seating;
 let grid='<div class="seat-grid">';
 for(let r=0;r<seating.rows;r++){
  grid+='<div class="seat-row">';
  for(let col=0;col<seating.cols;col++){
   grid+='<div class="seat-desk">';
   for(let s=0;s<seating.seatsPerDesk;s++){
    let key=r+'_'+col+'_'+s;
    let sid=seating.seats[key];
    let student=sid?P(sid):null;
    let cls='seat-box '+(student?'filled':'empty')+(student&&att&&att[student.id]==='н'?' absent':'');
    grid+='<div class="'+cls+'"'+(editable?' onclick="openSeatPicker(\''+c.id+'\',\''+key+'\')"':'')+'>'+(student?seatDisplayName(student):'+')+'</div>';
   }
   grid+='</div>';
  }
  grid+='</div>';
 }
 grid+='<div class="muted small" style="text-align:center;margin-top:8px">— доска —</div>';
 grid+='</div>';
 return grid;
}
function classSeatingTab(c){
 if(!c.seating)return '<div class="card"><div class="empty">Рассадка для этого класса ещё не создана.<br><span class="small">Кабинеты и предметы у вас разные — поэтому схема настраивается отдельно для каждого класса.</span></div><div class="toolbar" style="justify-content:center;margin-top:10px"><button class="primary" onclick="openSeatingConfig(\''+c.id+'\')">＋ Добавить рассадку</button></div></div>';
 let ps=people(c.id);
 let seatedIds=new Set(Object.values(c.seating.seats));
 let unseated=ps.filter(s=>!seatedIds.has(s.id));
 return '<div class="card"><div class="top"><h2>Рассадка</h2><div class="toolbar"><button onclick="openSeatingConfig(\''+c.id+'\')">Изменить схему</button><button class="danger" onclick="deleteSeating(\''+c.id+'\')">Удалить рассадку</button></div></div>'+
  seatingGridHtml(c,true)+
  (unseated.length?'<div class="muted small" style="margin-top:14px">Ещё не рассажены: '+unseated.map(s=>studentFio(s)).join(', ')+'</div>':'')+
  '</div>';
}
function openSeatingConfig(classId){
 let c=C(classId);
 let cur=c.seating||{rows:5,cols:3,seatsPerDesk:2};
 setModalHtml('Настройка рассадки',
  '<div class="notice">Например: 5 рядов по 3 парты, по 2 человека за партой.</div>'+
  '<label>Количество рядов</label><input id="sc-rows" type="number" min="1" max="12" value="'+cur.rows+'">'+
  '<label>Парт в ряду</label><input id="sc-cols" type="number" min="1" max="12" value="'+cur.cols+'">'+
  '<label>Мест за партой</label><input id="sc-seats" type="number" min="1" max="4" value="'+cur.seatsPerDesk+'">'+
  (c.seating?'<div class="notice">Изменение схемы очистит текущую рассадку учеников по местам.</div>':'')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveSeatingConfig(\''+classId+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveSeatingConfig(classId){
 let c=C(classId);
 let rows=Math.max(1,+document.getElementById('sc-rows').value||1);
 let cols=Math.max(1,+document.getElementById('sc-cols').value||1);
 let seatsPerDesk=Math.max(1,+document.getElementById('sc-seats').value||1);
 c.seating={rows,cols,seatsPerDesk,seats:{}};
 save();closeModal();render();
}
function deleteSeating(classId){
 if(!confirm('Удалить схему рассадки для этого класса?'))return;
 C(classId).seating=null;save();render();
}
function openSeatPicker(classId,seatKey){
 let c=C(classId);
 let seated=new Set(Object.values(c.seating.seats));
 let currentId=c.seating.seats[seatKey];
 let available=people(classId).filter(s=>s.id===currentId||!seated.has(s.id));
 setModalHtml('Кто сидит на этом месте?',
  (available.length?'<div class="checks">'+available.map(s=>'<div class="attrow click" onclick="assignSeat(\''+classId+'\',\''+seatKey+'\',\''+s.id+'\')"><span>'+studentFio(s)+'</span>'+(s.id===currentId?'<span class="badge blue">сейчас здесь</span>':'')+'</div>').join('')+'</div>':'<div class="muted small">Все ученики класса уже рассажены.</div>')+
  (currentId?'<div class="toolbar" style="margin-top:10px"><button class="danger" onclick="assignSeat(\''+classId+'\',\''+seatKey+'\',\'\')">Убрать с места</button><button onclick="closeModal()">Отмена</button></div>':'<div class="toolbar" style="margin-top:10px"><button onclick="closeModal()">Отмена</button></div>'));
}
function assignSeat(classId,seatKey,studentId){
 let c=C(classId);
 if(studentId)c.seating.seats[seatKey]=studentId; else delete c.seating.seats[seatKey];
 save();closeModal();render();
}

