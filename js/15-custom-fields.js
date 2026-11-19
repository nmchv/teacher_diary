/* ===================== ОБЩИЕ ПОЛЯ (ПОЛЬЗОВАТЕЛЬСКИЕ) ===================== */
function richToolbarHtml(domId){
 return '<div class="richtext-toolbar">'+
  '<button type="button" title="Жирный" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'bold\')"><b>Ж</b></button>'+
  '<button type="button" title="Курсив" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'italic\')"><i>К</i></button>'+
  '<button type="button" title="Подчёркнутый" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'underline\')"><u>Ч</u></button>'+
  '<button type="button" title="Список" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'insertUnorderedList\')">☰</button>'+
  '<button type="button" title="Очистить форматирование" onmousedown="event.preventDefault()" onclick="richExec(\''+domId+'\',\'removeFormat\')">✕</button>'+
  '</div>';
}
function richExec(domId,cmd){let el=document.getElementById(domId);if(!el)return;el.focus();document.execCommand(cmd,false,null)}
function customFieldInput(domId,f,val){
 val=val===undefined||val===null?'':val;
 if(f.type==='longtext'){
  let content=/<[a-z][^>]*>/i.test(val)?val:nl2br(val);
  return '<div class="richtext-wrap">'+richToolbarHtml(domId)+'<div id="'+domId+'" class="richtext-edit" contenteditable="true">'+content+'</div></div>';
 }
 if(f.type==='number')return '<input id="'+domId+'" type="number" value="'+e(val)+'">';
 if(f.type==='date')return '<input id="'+domId+'" type="date" value="'+e(val)+'">';
 if(f.type==='boolean')return '<select id="'+domId+'"><option value="">—</option><option value="yes"'+(val==='yes'?' selected':'')+'>Да</option><option value="no"'+(val==='no'?' selected':'')+'>Нет</option></select>';
 if(f.type==='select')return '<select id="'+domId+'"><option value="">—</option>'+(f.options||[]).map(o=>'<option value="'+e(o)+'"'+(val===o?' selected':'')+'>'+e(o)+'</option>').join('')+'</select>';
 if(f.type==='colleagueLink')return '<select id="'+domId+'"><option value="">— не назначен —</option>'+D.colleagues.map(c=>'<option value="'+c.id+'"'+(val===c.id?' selected':'')+'>'+e(colleagueFioPlain(c))+(colleagueField(c,'position')?' — '+e(colleagueField(c,'position')):'')+'</option>').join('')+'</select>';
 return '<input id="'+domId+'" value="'+e(val)+'">';
}
function readFieldValue(f,el){
 if(!el)return'';
 if(f.type==='longtext'){let h=el.innerHTML;return (h==='<br>'||h==='<div><br></div>')?'':h}
 return el.value;
}
function customFieldView(f,val){
 if(!val&&val!==0)return'';
 if(f.type==='date')return fmtDate(val);
 if(f.type==='boolean')return val==='yes'?'Да':val==='no'?'Нет':'';
 if(f.type==='colleagueLink'){let col=D.colleagues.find(x=>x.id===val);return col?colleagueFioPlain(col):''}
 return val;
}

