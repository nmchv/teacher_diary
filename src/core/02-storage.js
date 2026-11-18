function defaultData(){
 return {version:3,classes:[],students:[],lessons:[],materials:[],scheduleBlocks:[],lessonTemplates:[],announcements:[],
  meetings:[],workTasks:[],colleagues:[],
  settings:{theme:'default',colorMode:'light',accentColor:'',academicYear:'2026–2027',
   lastBackupAt:null,backupReminder:{lastShown:null},
   fontFamily:'system',radius:1,sidebarStyle:'solid',season:'auto',seasonEffects:true,particleDensity:'medium',bgDecorations:true,
   assistant:{enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true},
   fields:{student:STUDENT_FIELDS_DEFAULT(),class:CLASS_FIELDS_DEFAULT(),lesson:LESSON_FIELDS_DEFAULT(),colleague:COLLEAGUE_FIELDS_DEFAULT()}}};
}
let D=null;
function loadData(){
 let raw=localStorage.getItem(LS_KEY);
 if(raw){try{D=JSON.parse(raw)}catch(e){D=defaultData()}}
 else{
  D=defaultData();
  migrateFromV2();
 }
 if(!D.settings)D.settings={theme:'default',academicYear:'2026–2027',fields:{student:STUDENT_FIELDS_DEFAULT(),class:CLASS_FIELDS_DEFAULT(),lesson:LESSON_FIELDS_DEFAULT(),colleague:COLLEAGUE_FIELDS_DEFAULT()}};
 if(!D.materials)D.materials=[];
 if(!D.scheduleBlocks)D.scheduleBlocks=[];
 if(!D.lessonTemplates)D.lessonTemplates=[];
 if(!D.announcements)D.announcements=[];
 if(!D.settings.presentLayout)D.settings.presentLayout={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
 if(!D.settings.presentLayoutClub)D.settings.presentLayoutClub={left:['plan','extra','homework'],right:['whoToAsk','grade','attendance','points','behavior','seating']};
 [D.settings.presentLayout,D.settings.presentLayoutClub].forEach(layout=>{
  if(layout&&!layout.left.includes('behavior')&&!layout.right.includes('behavior'))layout.right.push('behavior');
 });
 if(!D.settings.gradeScale)D.settings.gradeScale=[...GRADE_OPTIONS_DEFAULT];
 if(!D.settings.gradeCommentTemplates)D.settings.gradeCommentTemplates=[...GRADE_COMMENT_TEMPLATES_DEFAULT];
 if(!D.settings.libraryGradeLevels)D.settings.libraryGradeLevels=[...LIBRARY_GRADE_LEVELS_DEFAULT];
 if(D.settings.showSaturday===undefined)D.settings.showSaturday=true;
 if(!D.settings.colorMode)D.settings.colorMode='light';
 if(D.settings.accentColor===undefined)D.settings.accentColor='';
 if(D.settings.lastBackupAt===undefined)D.settings.lastBackupAt=null;
 if(!D.settings.backupReminder)D.settings.backupReminder={lastShown:null};
 D.students.forEach(s=>{if(!s.classIds){s.classIds=s.classId?[s.classId]:[];delete s.classId}});
 D.classes.forEach(c=>{if(!c.type)c.type='class'});
 D.classes.forEach(c=>{if(c.gradeNumber===undefined){let p=parseClassName(c.name);c.gradeNumber=p.number;c.gradeLetter=p.letter}});
 if(!D.documents)D.documents=[];
 if(!D.settings.quarters)D.settings.quarters=[];
 if(!D.todos)D.todos=[];
 if(!D.meetings)D.meetings=[];
 if(!D.workTasks)D.workTasks=[];
 if(D.todos.length){
  D.todos.forEach(t=>D.workTasks.push({id:t.id||uid(),title:t.text,dueDate:'',priority:'med',status:t.done?'done':'todo',notes:''}));
  D.todos=[];
 }
 if(!D.colleagues)D.colleagues=[];
 if(!D.settings.fields.colleague)D.settings.fields.colleague=COLLEAGUE_FIELDS_DEFAULT();
 D.colleagues.forEach(c=>{
  if(!c.customFields){
   c.customFields={position:c.position||'',birthDate:c.birthDate||'',phone:c.phone||'',email:c.email||'',notes:c.notes||''};
   delete c.position;delete c.birthDate;delete c.phone;delete c.email;delete c.notes;
  }
 });
 let headTeacherField=D.settings.fields.class.find(f=>f.key==='headTeacher');
 if(headTeacherField&&headTeacherField.type!=='colleagueLink')headTeacherField.type='colleagueLink';
 if(!D.settings.fields.student.find(f=>f.key==='nickname'))D.settings.fields.student.unshift({key:'nickname',label:'Никнейм (как называть в рассадке)',type:'text',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpNumber'))D.settings.fields.lesson.unshift({key:'ktpNumber',label:'№ по КТП',type:'number',system:false,visible:true});
 if(!D.settings.fields.lesson.find(f=>f.key==='ktpDate'))D.settings.fields.lesson.splice(1,0,{key:'ktpDate',label:'Дата по КТП',type:'date',system:false,visible:true});
 if(!D.settings.homeWidgets)D.settings.homeWidgets=[{key:'clock',visible:true},{key:'schedule',visible:true},{key:'stats',visible:true},{key:'todo',visible:true},{key:'birthdays',visible:true},{key:'recent',visible:true}];
 if(!D.settings.teacherName)D.settings.teacherName='';
 if(!D.settings.pointsThreshold)D.settings.pointsThreshold=5;
 if(D.settings.fontFamily===undefined)D.settings.fontFamily='system';
 if(D.settings.radius===undefined)D.settings.radius=1;
 if(D.settings.sidebarStyle===undefined)D.settings.sidebarStyle='solid';
 if(D.settings.season===undefined)D.settings.season='auto';
 if(D.settings.seasonEffects===undefined)D.settings.seasonEffects=true;
 if(D.settings.particleDensity===undefined)D.settings.particleDensity='medium';
 if(D.settings.bgDecorations===undefined)D.settings.bgDecorations=true;
 if(!D.settings.assistant)D.settings.assistant={enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true};
 if(D.settings.assistant.peeked===undefined)D.settings.assistant.peeked=false;
 if(D.settings.assistant.motivation===undefined)D.settings.assistant.motivation=true;
 D.materials.forEach(m=>{if(m.gradeNumber===undefined)m.gradeNumber=null});
}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(D))}
function migrateFromV2(){
 try{
  let rawV2=localStorage.getItem(LS_KEY_V2);
  if(!rawV2)return;
  let V2=JSON.parse(rawV2);
  let filesV2=JSON.parse(localStorage.getItem(LS_KEY_V2+'_files')||'[]');
  let classIdMap={};
  (V2.classes||[]).forEach(c=>{
   let nc={id:c.id,name:c.name,subject:c.subject||'',academicYear:c.year||D.settings.academicYear,customFields:{}};
   D.classes.push(nc);classIdMap[c.id]=c.id;
  });
  (V2.students||[]).forEach(s=>{
   D.students.push({id:s.id,lastName:s.last||'',firstName:s.first||'',middleName:s.middle||'',
    classIds:s.classId?[s.classId]:[],status:s.active===false?'archived':'active',
    customFields:{birthDate:s.birth||'',developmentFeatures:s.dev||'',learningFeatures:s.learn||'',
     strengths:s.strength||'',difficulties:s.diff||'',notes:s.notes||''}});
  });
  (V2.lessons||[]).forEach(l=>{
   let attendance={};
   (D.students.filter(s=>(s.classIds||[]).includes(l.classId))).forEach(s=>{attendance[s.id]=(l.absent||[]).includes(s.id)?'н':'+'});
   let grades={};
   (V2.grades||[]).filter(g=>g.lessonId===l.id).forEach(g=>{grades[g.studentId]={value:g.value,comment:g.comment||''}});
   let materialIds=[];
   filesV2.filter(f=>f.lessonId===l.id).forEach(f=>{
    let mid=uid();
    D.materials.push({id:mid,filename:f.name,category:'Из версии 2',mimeType:'',size:0,createdAt:new Date().toISOString(),legacyData:f.data});
    materialIds.push(mid);
   });
   D.lessons.push({id:l.id,date:l.date,lessonNumber:null,startTime:'',endTime:'',classId:l.classId,topic:l.topic||'',
    customFields:{planText:l.plan||'',stages:l.planned||'',doneWhat:l.done||'',notDone:l.notdone||'',
     homework:l.hw||'',workedWell:l.good||'',difficult:l.hard||'',notes:l.notes||''},
    attendance:l.after?attendance:{},grades,materialIds});
  });
  save();
 }catch(err){console.error('Ошибка миграции из v2:',err)}
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
