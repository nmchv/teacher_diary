/* ===================== БИБЛИОТЕКА МАТЕРИАЛОВ ===================== */
function setMaterialsGradeFilter(v){S.materialsGradeFilter=v;render()}
function materialCardHtml(m){
 return '<div class="m"><span>'+matIconOf(m)+' '+e(m.filename)+' <span class="muted small">'+(m.isLink?'ссылка':m.size?Math.round(m.size/1024)+' КБ':'')+(m.category?' · '+e(m.category):'')+'</span></span><span class="toolbar" style="flex:0"><button onclick="openMaterial(\''+m.id+'\')">'+(m.isLink?'Перейти':'Открыть')+'</button><button onclick="openEditMaterial(\''+m.id+'\')">Изменить</button><button class="danger" onclick="deleteMaterialConfirm(\''+m.id+'\')">Удалить</button></span></div>';
}
function materialsPage(){
 let filter=S.materialsGradeFilter||'';
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 let gradeOpts=levels.map(n=>'<option value="'+e(n)+'"'+(filter===String(n)?' selected':'')+'>'+e(n)+'-е классы</option>').join('');
 let filterHtml='<select onchange="setMaterialsGradeFilter(this.value)" style="width:auto;display:inline-block"><option value=""'+(filter===''?' selected':'')+'>Все параллели</option><option value="__none__"'+(filter==='__none__'?' selected':'')+'>Без параллели</option>'+gradeOpts+'</select>';
 let top='<div class="top"><div><h1>Материалы</h1><div class="muted">Общая библиотека файлов и ссылок, сгруппированная по тем же параллелям, что и «Библиотека уроков» — удобно прикреплять к конкретной параллели</div></div>'+
  '<div class="toolbar"><button onclick="document.getElementById(\'lib-upload\').click()">＋ Загрузить файл</button><input id="lib-upload" type="file" multiple hidden onchange="uploadToLibrary(this)"><button onclick="openAddLinkMaterial()">🔗 Добавить ссылку</button></div></div>';
 if(!D.materials.length)return top+'<div class="card empty">В библиотеке пока нет файлов и ссылок.</div>';
 let groups={};
 D.materials.forEach(m=>{let key=(m.gradeNumber===null||m.gradeNumber===undefined||m.gradeNumber==='')?'__none__':String(m.gradeNumber);(groups[key]=groups[key]||[]).push(m)});
 let sections=[];
 levels.forEach(n=>{
  let key=String(n);
  if(!groups[key])return;
  if(filter&&filter!==key)return;
  sections.push({title:n+'-е классы',items:groups[key]});
  delete groups[key];
 });
 if(!filter){
  Object.keys(groups).forEach(key=>{
   if(key==='__none__')return;
   sections.push({title:key+' (параллель убрана из настроек)',items:groups[key]});
  });
 }
 if(groups.__none__&&(!filter||filter==='__none__')){
  sections.push({title:'Без параллели',items:groups.__none__});
 }
 let body=sections.length?sections.map(sec=>{
  let cats={};
  sec.items.forEach(m=>{let cat=m.category||'Без категории';(cats[cat]=cats[cat]||[]).push(m)});
  let catNames=Object.keys(cats).sort((a,b)=>a.localeCompare(b,'ru'));
  return '<h3 style="margin:18px 0 8px">'+e(sec.title)+' <span class="muted small">('+sec.items.length+')</span></h3>'+
   catNames.map(cat=>'<div class="card"><div class="tree-cat">'+e(cat)+'</div><div class="materials-list">'+cats[cat].map(materialCardHtml).join('')+'</div></div>').join('');
 }).join(''):'<div class="card empty">В этой параллели пока нет материалов.</div>';
 return top+'<div class="toolbar" style="margin-bottom:6px">Параллель: '+filterHtml+'</div>'+body;
}
function materialGradeOptionsHtml(selected){
 let levels=(D.settings.libraryGradeLevels&&D.settings.libraryGradeLevels.length)?D.settings.libraryGradeLevels:LIBRARY_GRADE_LEVELS_DEFAULT;
 return '<option value="">— без параллели —</option>'+levels.map(n=>'<option value="'+e(n)+'"'+(String(selected)===String(n)?' selected':'')+'>'+e(n)+'</option>').join('');
}
function openAddLinkMaterial(presetCategory,presetGrade){
 setModalHtml('Добавить ссылку',
  '<label>Название</label><input id="lm-name" placeholder="Видео по теме «Атмосфера»">'+
  '<label>Ссылка (URL)</label><input id="lm-url" placeholder="https://...">'+
  '<label>Параллель (папка в библиотеке материалов)</label><select id="lm-grade">'+materialGradeOptionsHtml(presetGrade||'')+'</select>'+
  '<label>Категория</label><input id="lm-cat" value="'+e(presetCategory||'')+'" placeholder="Например, название класса или темы">'+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveLinkMaterial()">Добавить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveLinkMaterial(){
 let name=document.getElementById('lm-name').value.trim();
 let url=document.getElementById('lm-url').value.trim();
 if(!name||!url){alert('Укажите название и ссылку.');return}
 if(!/^https?:\/\//i.test(url))url='https://'+url;
 let mid=uid();
 let gradeVal=document.getElementById('lm-grade')?document.getElementById('lm-grade').value:'';
 D.materials.push({id:mid,filename:name,category:document.getElementById('lm-cat').value.trim()||'Без категории',gradeNumber:gradeVal||null,isLink:true,url,mimeType:'',size:0,createdAt:new Date().toISOString()});
 save();closeModal();render();
 return mid;
}
async function uploadToLibrary(input){
 for(let f of input.files){
  let mid=uid();
  await fileStorePut(mid,f);
  D.materials.push({id:mid,filename:f.name,category:'Без категории',gradeNumber:null,mimeType:f.type,size:f.size,createdAt:new Date().toISOString()});
 }
 save();render();
}
function openEditMaterial(mid){
 let m=D.materials.find(x=>x.id===mid);if(!m)return;
 setModalHtml('Изменить материал',
  '<label>Название</label><input id="em-name" value="'+e(m.filename)+'">'+
  '<label>Параллель (папка в библиотеке материалов)</label><select id="em-grade">'+materialGradeOptionsHtml(m.gradeNumber||'')+'</select>'+
  '<label>Категория</label><input id="em-cat" value="'+e(m.category||'')+'" placeholder="Например, название класса или темы">'+
  (m.isLink?'<label>Ссылка (URL)</label><input id="em-url" value="'+e(m.url||'')+'">':'')+
  '<div class="toolbar" style="margin-top:14px"><button class="primary" onclick="saveEditMaterial(\''+mid+'\')">Сохранить</button><button onclick="closeModal()">Отмена</button></div>');
}
function saveEditMaterial(mid){
 let m=D.materials.find(x=>x.id===mid);if(!m)return;
 let name=document.getElementById('em-name').value.trim();
 if(!name){alert('Укажите название.');return}
 m.filename=name;
 m.category=document.getElementById('em-cat').value.trim()||'Без категории';
 m.gradeNumber=document.getElementById('em-grade').value||null;
 if(m.isLink){
  let url=document.getElementById('em-url').value.trim();
  if(url){if(!/^https?:\/\//i.test(url))url='https://'+url;m.url=url}
 }
 save();closeModal();render();
}
function deleteMaterialConfirm(mid){
 if(!confirm('Удалить файл из библиотеки? Он также будет убран из всех уроков, где использовался.'))return;
  D.lessons.forEach(l=>{if(l.materialIds)l.materialIds=l.materialIds.filter(x=>x!==mid)});
  D.planLessons.forEach(l=>{if(l.materials)l.materials=l.materials.filter(x=>x!==mid)});
 D.materials=D.materials.filter(m=>m.id!==mid);
 fileStoreDelete(mid).catch(()=>{});
 save();render();
}

