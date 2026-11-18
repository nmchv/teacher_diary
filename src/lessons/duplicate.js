function openDuplicateLesson(id){
 let l=L(id);
 let lf=D.settings.fields.lesson.filter(f=>f.visible);
 let fieldsHtml='<label>Что скопировать</label><div class="checks" style="max-height:190px">'+
  '<div class="attrow"><span>Тема</span><input type="checkbox" id="dup-f-topic" checked style="width:auto"></div>'+
  lf.map(f=>'<div class="attrow"><span>'+e(f.label)+'</span><input type="checkbox" class="dup-f" data-key="'+f.key+'" '+(['planText','stages','homework'].includes(f.key)?'checked':'')+' style="width:auto"></div>').join('')+
  '<div class="attrow"><span>Материалы</span><input type="checkbox" id="dup-f-materials" checked style="width:auto"></div>'+
  '</div><div class="muted small">Посещаемость и оценки никогда не копируются — для нового урока они начинаются заново.</div>';
 let classesHtml='<label style="margin-top:14px">В какие классы и на какое время скопировать</label><table class="table"><tr><th></th><th>Класс</th><th>Дата</th><th>№ урока</th></tr>'+
  sortedClasses(D.classes.filter(c=>c.type===C(l.classId).type)).map(c=>'<tr><td><input type="checkbox" class="dup-c" data-class="'+c.id+'" style="width:auto"></td><td>'+e(c.name)+'</td><td><input type="date" class="dup-date" data-class="'+c.id+'" value="'+e(l.date)+'"></td><td><select class="dup-num" data-class="'+c.id+'">'+LESSON_TIMES.map(t=>'<option value="'+t.n+'" '+(t.n===+l.lessonNumber?'selected':'')+'>'+t.n+'</option>').join('')+'</select></td></tr>').join('')+
  '</table>';
 setModalHtml('Дублировать урок'+(D.classes.length>1?' на параллель':''),fieldsHtml+classesHtml+'<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="confirmDuplicateLesson(\''+id+'\')">Создать уроки</button><button onclick="closeModal()">Отмена</button></div>',true);
}
function confirmDuplicateLesson(sourceId){
 let l=L(sourceId);
 let copyTopic=document.getElementById('dup-f-topic').checked;
 let copyMaterials=document.getElementById('dup-f-materials').checked;
 let fieldKeys=[...document.querySelectorAll('.dup-f')].filter(x=>x.checked).map(x=>x.dataset.key);
 let created=0,skipped=[];
 document.querySelectorAll('.dup-c').forEach(cb=>{
  if(!cb.checked)return;
  let classId=cb.dataset.class;
  let date=document.querySelector('.dup-date[data-class="'+classId+'"]').value;
  let num=+document.querySelector('.dup-num[data-class="'+classId+'"]').value;
  let blk=findBlock(date,num);
  if(blk){skipped.push(C(classId).name+' — заблокировано («'+blk.reason+'»)');return}
  if(activeLessons().find(x=>x.date===date&&+x.lessonNumber===num)){skipped.push(C(classId).name+' — слот уже занят');return}
  let t=timeFor(num);
  let nl={id:uid(),date,lessonNumber:num,startTime:t.start,endTime:t.end,classId,topic:copyTopic?l.topic:'',
   customFields:{},attendance:{},grades:{},materialIds:copyMaterials?[...(l.materialIds||[])]:[]};
  fieldKeys.forEach(k=>nl.customFields[k]=l.customFields[k]);
  D.lessons.push(nl);created++;
 });
 save();closeModal();
 alert('Создано уроков: '+created+(skipped.length?'.\nПропущено:\n'+skipped.join('\n'):''));
 render();
}
