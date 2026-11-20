/* ===================== РЕЗЕРВНАЯ КОПИЯ ===================== */
function backupPage(){
 return '<div class="top"><div><h1>Резервное копирование</h1><div class="muted">Полный экспорт и импорт всех данных, включая файлы материалов</div></div></div>'+
  '<div class="card"><h2>Экспорт</h2><p class="muted">Создаёт файл со всеми классами, учениками (включая архив), уроками, оценками, посещаемостью, пользовательскими полями, настройками, расписанием/блокировками, шаблонами и библиотекой материалов.</p>'+
   '<p class="small muted">'+(D.settings.lastBackupAt?'Последняя копия: '+fmtDate(D.settings.lastBackupAt):'Резервная копия ещё не создавалась.')+'</p>'+
   '<button class="primary" onclick="doBackup()">⇩ Скачать резервную копию</button></div>'+
  '<div class="card"><h2>Импорт</h2><div class="notice">Импорт полностью заменит текущие данные приложения.</div><button onclick="document.getElementById(\'restore-input\').click()">⇧ Восстановить из файла</button><input id="restore-input" type="file" accept=".json" hidden onchange="doRestore(this)"></div>'+
   '<div class="card"><h2>Демонстрационные данные</h2><p class="muted">Загружает демонстрационный набор данных (классы, ученики, уроки, материалы) из файла <code>demo-data.json</code> в корне приложения.</p><button onclick="loadDemoData()">⇄ Загрузить демонстрационные данные</button></div>'+
   '<div class="card"><h2>Очистка данных</h2><p class="muted">Полностью удаляет все данные пользователя: классы, ученики, уроки, оценки, посещаемость, материалы, настройки и всё прочее. Действие необратимо.</p><div class="notice">Это удалит все данные. Рекомендуется вручную сделать резервную копию перед очисткой.</div><button class="danger" onclick="clearAllData()">☠ Очистить все данные</button></div>';
}
async function doBackup(){
 let files=await fileStoreAll();
 let filesEncoded=[];
 for(let f of files){filesEncoded.push({id:f.id,data:await blobToBase64(f.blob)})}
 D.settings.lastBackupAt=toISO(new Date());
 D.settings.backupReminder={lastShown:toISO(new Date())};
 save();
 let payload={exportedAt:new Date().toISOString(),app:'teacher-diary',version:3,D,files:filesEncoded};
 let blob=new Blob([JSON.stringify(payload)],{type:'application/json'});
 let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Дневник-учителя-backup-'+D.settings.lastBackupAt+'.json';a.click();URL.revokeObjectURL(url);
 render();
}
function doRestore(input){
  let f=input.files[0];if(!f)return;
  if(!confirm('Импорт заменит все текущие данные приложения. Продолжить?'))return;
  let r=new FileReader();
  r.onload=async()=>{
   try{
    let payload=JSON.parse(r.result);
    await restoreFromPayload(payload);
    alert('Данные успешно восстановлены.');
    S.view='home';render();
   }catch(err){alert('Не удалось прочитать файл резервной копии.');console.error(err)}
  };
  r.readAsText(f);
}
async function loadDemoData(){
  if(!confirm('Загрузка демонстрационных данных заменит все текущие данные приложения. Продолжить?'))return;
  try{
   let resp=await fetch('demo-data.json?'+new Date().getTime());
   if(!resp.ok)throw new Error('HTTP '+resp.status);
   let payload=await resp.json();
   await restoreFromPayload(payload);
   alert('Демонстрационные данные успешно загружены.');
   S.view='home';render();
   }catch(err){alert('Не удалось загрузить демонстрационные данные.');console.error(err)}
}
async function clearAllData(){
  if(!confirm('Это полностью удалит все ваши данные: классы, учеников, уроки, оценки, посещаемость, материалы, настройки и всё остальное. Действие необратимо. Рекомендуется вручную сделать резервную копию перед очисткой. Продолжить?'))return;
  try{
    await fileStoreClear();
    D=defaultData();
    save();
    alert('Все данные удалены.');
    S.view='home';render();
  }catch(err){alert('Не удалось очистить данные.');console.error(err)}
}
async function restoreFromPayload(payload){
  D=payload.D;
   if(!D.materials)D.materials=[];
   if(!D.scheduleBlocks)D.scheduleBlocks=[];
   if(!D.lessonTemplates)D.lessonTemplates=[];
   if(!D.announcements)D.announcements=[];
   if(!D.todos)D.todos=[];
   if(!D.meetings)D.meetings=[];
   if(!D.workTasks)D.workTasks=[];
   if(D.todos.length){
    D.todos.forEach(t=>D.workTasks.push({id:t.id||uid(),title:t.text,dueDate:'',priority:'med',status:t.done?'done':'todo',notes:''}));
    D.todos=[];
   }
   if(!D.colleagues)D.colleagues=[];
   if(!D.settings.fields.colleague)D.settings.fields.colleague=COLLEAGUE_FIELDS_DEFAULT();
   if(!D.settings.fields.student.find(f=>f.key==='nickname'))D.settings.fields.student.unshift({key:'nickname',label:'Никнейм (как называть в рассадке)',type:'text',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpNumber'))D.settings.fields.lesson.unshift({key:'ktpNumber',label:'№ по КТП',type:'number',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpDate'))D.settings.fields.lesson.splice(1,0,{key:'ktpDate',label:'Дата по КТП',type:'date',system:false,visible:true});
   if(!D.settings.homeWidgets)D.settings.homeWidgets=[{key:'clock',visible:true},{key:'schedule',visible:true},{key:'stats',visible:true},{key:'todo',visible:true},{key:'birthdays',visible:true},{key:'recent',visible:true}];
   if(!D.settings.presentLayout)D.settings.presentLayout={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
   if(!D.settings.presentLayoutClub)D.settings.presentLayoutClub={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
   [D.settings.presentLayout,D.settings.presentLayoutClub].forEach(layout=>{
    if(layout&&!layout.left.includes('behavior')&&!layout.right.includes('behavior'))layout.right.push('behavior');
   });
   if(!D.settings.gradeScale)D.settings.gradeScale=[...GRADE_OPTIONS_DEFAULT];
   if(!D.settings.gradeCommentTemplates)D.settings.gradeCommentTemplates=[...GRADE_COMMENT_TEMPLATES_DEFAULT];
   if(!D.settings.libraryGradeLevels)D.settings.libraryGradeLevels=[...LIBRARY_GRADE_LEVELS_DEFAULT];
   if(D.settings.showSaturday===undefined)D.settings.showSaturday=true;
   D.students.forEach(s=>{if(!s.classIds){s.classIds=s.classId?[s.classId]:[];delete s.classId}});
   D.classes.forEach(c=>{if(!c.type)c.type='class'});
 D.classes.forEach(c=>{if(c.gradeNumber===undefined){let p=parseClassName(c.name);c.gradeNumber=p.number;c.gradeLetter=p.letter}});
   if(!D.documents)D.documents=[];
   if(!D.settings.quarters)D.settings.quarters=[];
   try{
     save();
     await fileStoreClear();
     for(let fe of (payload.files||[])){
       let blob=await base64ToBlob(fe.data);
       await fileStorePut(fe.id,blob);
     }
   }catch(err){alert('Не удалось прочитать файл резервной копии.');console.error(err)}
 }

function repairMissingLessonTimes(){
 let fixed=0;
 D.lessons.forEach(l=>{
  if(l.lessonNumber&&(!l.startTime||!l.endTime)){
   let t=timeFor(l.lessonNumber);
   if(!l.startTime&&t.start)l.startTime=t.start;
   if(!l.endTime&&t.end)l.endTime=t.end;
   fixed++;
  }
 });
 if(fixed)save();
 return fixed;
}

