/* ===================== ТЕМА (светлая / тёмная / киберпанк / web3) =====================
   Переключатель в стиле экосистемы nmchv.ru (одна кнопка data-theme-toggle).
   Кнопка в шапке перебирает темы по кругу: светлая → тёмная → киберпанк → web3.
   Темы «cyber» и «web3» строятся поверх тёмной: на <html> ставятся класс dark и класс темы.
   Значение синхронизируется с D.settings.colorMode при доступности D.
*/
(function(){
  'use strict';
  var KEY='teacher-diary-theme';
  var THEMES=['light','dark','cyber','web3'];
  var DARK_BASED={dark:1,cyber:1,web3:1};
  var NAMES={light:'светлую',dark:'тёмную',cyber:'киберпанк',web3:'web3'};
  var root=document.documentElement;
  var query=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;

  function valid(v){return THEMES.indexOf(v)!==-1;}
  function next(theme){return THEMES[(THEMES.indexOf(theme)+1)%THEMES.length];}
  function stored(){
    try{var v=localStorage.getItem(KEY);}catch(e){return null;}
    return valid(v)?v:null;
  }
  function save(v){
    try{localStorage.setItem(KEY,v);}catch(e){}
    if(typeof D!=='undefined'&&D&&D.settings)D.settings.colorMode=v;
  }
  function systemTheme(){return query&&query.matches?'dark':'light';}
  function resolve(){
    if(typeof D!=='undefined'&&D&&D.settings&&valid(D.settings.colorMode))return D.settings.colorMode;
    var s=stored();if(s)return s;
    return systemTheme();
  }
  function syncButtons(theme){
    var label='Включить тему: '+NAMES[next(theme)];
    var btns=document.querySelectorAll('[data-theme-toggle]');
    for(var i=0;i<btns.length;i++){
      btns[i].setAttribute('aria-label',label);
      btns[i].setAttribute('title',label);
    }
  }
  function apply(theme){
    root.setAttribute('data-theme',theme);
    root.classList.toggle('dark',!!DARK_BASED[theme]);
    root.classList.toggle('cyber',theme==='cyber');
    root.classList.toggle('web3',theme==='web3');
    syncButtons(theme);
    try{window.dispatchEvent(new CustomEvent('teacher-diary:themechange',{detail:{theme:theme}}));}catch(e){}
  }
  var animTimer;
  function set(theme,animate){
    if(!valid(theme))return;
    if(animate){
      root.classList.add('theme-anim');
      clearTimeout(animTimer);
      animTimer=setTimeout(function(){root.classList.remove('theme-anim');},400);
    }
    save(theme);
    apply(theme);
  }
  function toggle(){set(next(root.getAttribute('data-theme')||'light'),true);}
  apply(resolve());
  document.addEventListener('DOMContentLoaded',function(){syncButtons(root.getAttribute('data-theme'));});
  document.addEventListener('click',function(e){
    var btn=e.target&&e.target.closest?e.target.closest('[data-theme-toggle]'):null;
    if(btn){e.preventDefault();toggle();}
  });
  if(query){
    var onSystem=function(){
      var hasChoice=stored()||(typeof D!=='undefined'&&D&&D.settings&&valid(D.settings.colorMode));
      if(!hasChoice)apply(systemTheme());
    };
    if(query.addEventListener)query.addEventListener('change',onSystem);
    else if(query.addListener)query.addListener(onSystem);
  }
  window.addEventListener('storage',function(e){if(e.key===KEY&&valid(e.newValue))apply(e.newValue);});
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState!=='visible')return;
    var v=stored();
    if(v&&v!==root.getAttribute('data-theme'))apply(v);
  });
  /* ---- Анимации темы «web3»: подсветка за курсором и появление экранов при навигации ---- */
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFrame=0,lastPointer=null,lastCard=null;
  document.addEventListener('pointermove',function(e){
    if(reduceMotion||!root.classList.contains('web3'))return;
    lastPointer=e;
    if(pointerFrame)return;
    pointerFrame=requestAnimationFrame(function(){
      pointerFrame=0;
      var p=lastPointer;
      root.style.setProperty('--mx',p.clientX+'px');
      root.style.setProperty('--my',p.clientY+'px');
      var card=p.target&&p.target.closest?p.target.closest('.card,.modal'):null;
      if(lastCard&&lastCard!==card){lastCard.style.removeProperty('--cx');lastCard.style.removeProperty('--cy');}
      if(card){
        var r=card.getBoundingClientRect();
        card.style.setProperty('--cx',(p.clientX-r.left)+'px');
        card.style.setProperty('--cy',(p.clientY-r.top)+'px');
      }
      lastCard=card;
    });
  },{passive:true});
  var enterTimer;
  function playEnter(){
    if(reduceMotion||!root.classList.contains('web3'))return;
    root.classList.remove('cy-enter');
    void root.offsetWidth;
    root.classList.add('cy-enter');
    clearTimeout(enterTimer);
    enterTimer=setTimeout(function(){root.classList.remove('cy-enter');},1400);
  }
  document.addEventListener('DOMContentLoaded',function(){
    if(typeof window.goto==='function'&&!window.goto.__cyWrapped){
      var original=window.goto;
      var wrapped=function(){var r=original.apply(this,arguments);playEnter();return r;};
      wrapped.__cyWrapped=true;
      window.goto=wrapped;
    }
    setTimeout(playEnter,0);
  });
  window.addEventListener('teacher-diary:themechange',function(e){if(e.detail&&e.detail.theme==='web3')playEnter();});

  window.TeacherDiaryTheme={themes:THEMES.slice(),get:function(){return root.getAttribute('data-theme');},set:function(t){set(t,true);},toggle:toggle,refresh:function(){syncButtons(root.getAttribute('data-theme'));}};
})();
