function assistantSettings(){if(!D.settings.assistant)D.settings.assistant={enabled:true,character:'dog',freq:20,lastTipAt:null,peeked:false,motivation:true};return D.settings.assistant}
let assistantTimer=null,assistantPos=null;
function initAssistant(){
 let a=assistantSettings();
 let wrap=document.getElementById('assistant-wrap');
 if(!a.enabled){wrap.classList.add('hidden');document.getElementById('assistant-toggle').classList.add('show');return}
 document.getElementById('assistant-toggle').classList.remove('show');
 wrap.classList.remove('hidden');
 wrap.classList.toggle('peeked',!!a.peeked);
 renderAssistantChar();
 if(assistantTimer)clearInterval(assistantTimer);
 assistantTimer=setInterval(assistantAutoTip,Math.max(3,a.freq||20)*60000);
}
function renderAssistantChar(collapsedBubble){
 let a=assistantSettings();
 let ch=ASSISTANT_CHARACTERS[a.character]||ASSISTANT_CHARACTERS.dog;
 let wrap=document.getElementById('assistant-wrap');
 wrap.classList.toggle('peeked',!!a.peeked);
 let charOnclick=a.peeked?'assistantUnpeek()':'assistantSpeak()';
 let charTitle=a.peeked?'Выглядывает — нажмите, чтобы показать снова':(e(ch.name)+' — нажмите за советом');
 wrap.innerHTML=(collapsedBubble?'<div class="assistant-bubble" id="assistant-bubble">'+collapsedBubble+'</div>':'')+
  '<div class="assistant-char" id="assistant-char" title="'+charTitle+'" onclick="'+charOnclick+'">'+ch.emoji+'</div>';
 makeAssistantDraggable();
}
function pickTip(){
 if(shouldShowBackupReminder())return{text:'🗄 Давно не было резервной копии. Загляните в раздел «Резервная копия», это займёт пару секунд.',kind:'tip'};
 let a=assistantSettings();
 let useMotivation=a.motivation!==false&&Math.random()<0.35;
 if(useMotivation)return{text:ASSISTANT_MOTIVATION[Math.floor(Math.random()*ASSISTANT_MOTIVATION.length)],kind:'motivation'};
 return{text:ASSISTANT_TIPS[Math.floor(Math.random()*ASSISTANT_TIPS.length)],kind:'tip'};
}
function assistantSpeak(forcedText,forcedKind){
 let a=assistantSettings();
 if(a.peeked){a.peeked=false;save()}
 let picked=forcedText?{text:forcedText,kind:forcedKind||'tip'}:pickTip();
 let text=picked.text,kind=picked.kind;
 let ch=ASSISTANT_CHARACTERS[a.character]||ASSISTANT_CHARACTERS.dog;
 let wrap=document.getElementById('assistant-wrap');
 wrap.classList.remove('peeked');
 wrap.classList.toggle('assistant-motivation',kind==='motivation');
 let label=kind==='motivation'?'💛 '+e(ch.name):e(ch.name);
 wrap.innerHTML='<div class="assistant-bubble" id="assistant-bubble"><b>'+label+'</b><br>'+e(text)+
  '<div class="abtn-row"><button onclick="assistantSpeak()">Другой совет</button><button onclick="assistantMotivate()">💛 Поддержка</button><button onclick="assistantHideBubble()">Спасибо!</button></div>'+
  '<div class="abtn-row"><button onclick="assistantPeek()">🫥 Спрятать частично</button><button onclick="assistantHide()">Отключить</button><button onclick="assistantShowSettings()">⚙</button></div></div>'+
  '<div class="assistant-char talk" id="assistant-char" title="Нажмите за советом" onclick="assistantSpeak()">'+ch.emoji+'</div>';
 makeAssistantDraggable();
 a.lastTipAt=toISO(new Date());save();
}
function assistantMotivate(){assistantSpeak(ASSISTANT_MOTIVATION[Math.floor(Math.random()*ASSISTANT_MOTIVATION.length)],'motivation')}
function assistantHideBubble(){renderAssistantChar()}
function assistantAutoTip(){
 let a=assistantSettings();
 if(!a.enabled||a.peeked)return;
 assistantSpeak();
}
function assistantHide(){D.settings.assistant.enabled=false;save();initAssistant()}
function assistantShow(){D.settings.assistant.enabled=true;D.settings.assistant.peeked=false;save();initAssistant();assistantSpeak('Я снова здесь! Чем могу помочь?')}
function assistantPeek(){let a=assistantSettings();a.peeked=true;save();renderAssistantChar()}
function assistantUnpeek(){let a=assistantSettings();a.peeked=false;save();assistantSpeak('Я тут, если понадоблюсь!')}
function assistantShowSettings(){S.view='settings';S.settingsTab='appearance';render()}
function makeAssistantDraggable(){
 let el=document.getElementById('assistant-char');
 if(!el)return;
 let wrap=document.getElementById('assistant-wrap');
 let dragging=false,startX,startY,origRight,origBottom;
 el.onmousedown=function(ev){
  ev.preventDefault();dragging=true;
  let r=wrap.getBoundingClientRect();
  startX=ev.clientX;startY=ev.clientY;
  origRight=window.innerWidth-r.right;origBottom=window.innerHeight-r.bottom;
  document.onmousemove=function(ev2){
   if(!dragging)return;
   let dx=ev2.clientX-startX,dy=ev2.clientY-startY;
   wrap.style.right=Math.max(4,origRight-dx)+'px';
   wrap.style.bottom=Math.max(4,origBottom-dy)+'px';
  };
  document.onmouseup=function(){dragging=false;document.onmousemove=null;document.onmouseup=null};
 };
}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function shouldShowBackupReminder(){
 let today=toISO(new Date());
 let last=D.settings.lastBackupAt;
 let daysSinceBackup=last?daysBetween(last,today):Infinity;
 if(daysSinceBackup<7)return false;
 let lastShown=D.settings.backupReminder&&D.settings.backupReminder.lastShown;
 let daysSinceShown=lastShown?daysBetween(lastShown,today):Infinity;
 return daysSinceShown>=7;
}
function dismissBackupReminder(){D.settings.backupReminder={lastShown:toISO(new Date())};save();render()}
function backupReminderBanner(){
 if(!shouldShowBackupReminder())return'';
 let last=D.settings.lastBackupAt;
 return '<div class="notice" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 12px;flex-wrap:nowrap">'+
  '<span style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📦 '+(last?'Копия от '+fmtDate(last)+' — пора обновить':'Резервная копия ещё не создавалась')+'</span>'+
  '<span style="display:flex;gap:6px;flex:0 0 auto;white-space:nowrap"><button class="primary" style="padding:5px 10px;font-size:12px" onclick="goto(\'backup\')">Сделать копию</button><button style="padding:5px 10px;font-size:12px" onclick="dismissBackupReminder()">Позже</button></span></div>';
}
