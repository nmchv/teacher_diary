/* ===================== ТЕМА (только светлая / тёмная) =====================
   Переключатель в стиле экосистемы nmchv.ru (одна кнопка data-theme-toggle).
   Значение синхронизируется с D.settings.colorMode при доступности D.
*/
(function(){
  'use strict';
  var KEY='teacher-diary-theme';
  var root=document.documentElement;
  var query=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;

  function stored(){
    try{var v=localStorage.getItem(KEY);}catch(e){return null;}
    return v==='light'||v==='dark'?v:null;
  }
  function save(v){
    try{localStorage.setItem(KEY,v);}catch(e){}
    if(typeof D!=='undefined'&&D&&D.settings)D.settings.colorMode=v;
  }
  function systemTheme(){return query&&query.matches?'dark':'light';}
  function resolve(){
    if(typeof D!=='undefined'&&D&&D.settings&&(D.settings.colorMode==='light'||D.settings.colorMode==='dark'))return D.settings.colorMode;
    var s=stored();if(s)return s;
    return systemTheme();
  }
  function syncButtons(theme){
    var btns=document.querySelectorAll('[data-theme-toggle]');
    for(var i=0;i<btns.length;i++){
      var toLight=theme==='dark';
      btns[i].setAttribute('aria-label',toLight?'Включить светлую тему':'Включить тёмную тему');
      btns[i].setAttribute('title',toLight?'Включить светлую тему':'Включить тёмную тему');
    }
  }
  function apply(theme){
    root.setAttribute('data-theme',theme);
    if(theme==='dark')root.classList.add('dark');else root.classList.remove('dark');
    syncButtons(theme);
    try{window.dispatchEvent(new CustomEvent('teacher-diary:themechange',{detail:{theme:theme}}));}catch(e){}
  }
  var animTimer;
  function set(theme,animate){
    if(theme!=='light'&&theme!=='dark')return;
    if(animate){
      root.classList.add('theme-anim');
      clearTimeout(animTimer);
      animTimer=setTimeout(function(){root.classList.remove('theme-anim');},400);
    }
    save(theme);
    apply(theme);
  }
  function toggle(){set(root.getAttribute('data-theme')==='light'?'dark':'light',true);}
  apply(resolve());
  document.addEventListener('DOMContentLoaded',function(){syncButtons(root.getAttribute('data-theme'));});
  document.addEventListener('click',function(e){
    var btn=e.target&&e.target.closest?e.target.closest('[data-theme-toggle]'):null;
    if(btn){e.preventDefault();toggle();}
  });
  if(query){
    var onSystem=function(){
      var hasChoice=stored()||(typeof D!=='undefined'&&D&&D.settings&&(D.settings.colorMode==='light'||D.settings.colorMode==='dark'));
      if(!hasChoice)apply(systemTheme());
    };
    if(query.addEventListener)query.addEventListener('change',onSystem);
    else if(query.addListener)query.addListener(onSystem);
  }
  window.addEventListener('storage',function(e){if(e.key===KEY&&(e.newValue==='light'||e.newValue==='dark'))apply(e.newValue);});
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState!=='visible')return;
    var v=stored();
    if(v&&v!==root.getAttribute('data-theme'))apply(v);
  });
  window.TeacherDiaryTheme={get:function(){return root.getAttribute('data-theme');},set:function(t){set(t,true);},toggle:toggle,refresh:function(){syncButtons(root.getAttribute('data-theme'));}};
})();
