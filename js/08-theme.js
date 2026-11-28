/* ===================== ТЕМЫ ОФОРМЛЕНИЯ =====================
   Тема выбирается из выпадающего списка в шапке или в «Настройках».
   Темы «cyber» и «web3» строятся поверх тёмной: на <html> ставятся класс dark и класс темы.
   Темы «spring» и «holo» строятся поверх светлой: ставится только класс темы.
   Значение синхронизируется с D.settings.colorMode при доступности D.
*/
(function(){
  'use strict';
  var KEY='teacher-diary-theme';
  function svg(body,extra){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"'+(extra||'')+'>'+body+'</svg>';}
  /* Порядок в этом списке — порядок в меню. sw — цвета кружка-образца. */
  var LIST=[
    {id:'light',name:'Стандартная светлая',sw:'linear-gradient(135deg,#ffffff 50%,#2c5fd0 50%)',
     icon:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>')},
    {id:'dark',name:'Стандартная тёмная',sw:'linear-gradient(135deg,#111318 50%,#5b8def 50%)',
     icon:svg('<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/>')},
    {id:'spring',name:'Весенняя',sw:'linear-gradient(135deg,#ffc7da,#e3d4ff 52%,#c9f0dc)',
     icon:svg('<path d="M12 9.2C9 7.4 9.4 3 12 3s3 4.4 0 6.2ZM14.7 11.1c.9-3.4 5.3-4.1 6.1-1.6.8 2.5-3.2 4.4-6.1 1.6ZM13.7 14.3c3.5.2 5.5 4.200 3.4 5.700-2.100 1.500-5.100-1.700-3.400-5.700ZM10.300 14.300c1.700 4-1.300 7.200-3.4 5.700-2.100-1.500-.1-5.5 3.4-5.700ZM9.3 11.1C6.400 13.900 2.400 12 3.200 9.5 4 7 8.4 7.700 9.300 11.100Z"/><circle cx="12" cy="12" r="1.600"/>')},
    {id:'holo',name:'Голограмма',sw:'conic-gradient(from 200deg,#b9f2ff,#d9c9ff,#ffd1ec,#fff2c2,#c8ffe6,#b9f2ff)',
     icon:svg('<path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.600V7.400ZM4.300 7.500 12 12l7.700-4.500M12 12v9"/>')},
    {id:'cyber',name:'Киберпанк',sw:'linear-gradient(135deg,#00f0ff 50%,#ff2bd6 50%)',
     icon:svg('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z"/>')},
    {id:'web3',name:'Web3',sw:'linear-gradient(135deg,#050507 42%,#b38cff 66%,#7fd3ff)',
     icon:svg('<path d="M12 2.500c.600 4.600 2.900 6.900 7.500 7.500-4.600.600-6.900 2.900-7.500 7.500-.600-4.600-2.900-6.900-7.500-7.500 4.600-.600 6.900-2.900 7.500-7.500Z"/><path d="M19 15.500c.250 1.900 1.100 2.750 3 3-1.900.250-2.750 1.100-3 3-.250-1.900-1.100-2.750-3-3 1.900-.250 2.750-1.100 3-3Z"/>')}
  ];
  var THEMES=LIST.map(function(t){return t.id;});
  var DARK_BASED={dark:1,cyber:1,web3:1};
  var OWN_CLASS=['cyber','web3','spring','holo'];
  function info(theme){return LIST[THEMES.indexOf(theme)]||LIST[0];}
  var root=document.documentElement;
  var query=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;

  function valid(v){return THEMES.indexOf(v)!==-1;}
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
  /* ---- Выпадающий список тем в шапке ---- */
  function menuEls(){
    var box=document.querySelector('.theme-menu');
    return box?{box:box,button:box.querySelector('[data-theme-menu-button]'),list:box.querySelector('.theme-list'),current:box.querySelector('[data-theme-current]')}:null;
  }
  function syncMenu(theme){
    var m=menuEls();if(!m)return;
    var t=info(theme),label='Тема: '+t.name+'. Выбрать другую';
    m.current.innerHTML=t.icon;
    m.button.setAttribute('aria-label',label);
    m.button.setAttribute('title',label);
    var items=m.list.querySelectorAll('[data-theme-value]');
    for(var i=0;i<items.length;i++){
      var on=items[i].getAttribute('data-theme-value')===theme;
      items[i].setAttribute('aria-checked',String(on));
    }
  }
  function buildMenu(){
    var m=menuEls();if(!m)return;
    m.list.innerHTML=LIST.map(function(t){
      return '<button type="button" class="theme-item" role="menuitemradio" tabindex="-1" data-theme-value="'+t.id+'">'+
        '<span class="theme-swatch" style="background:'+t.sw+'"></span><span class="theme-name">'+t.name+'</span>'+
        '<svg class="theme-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></button>';
    }).join('');
    syncMenu(root.getAttribute('data-theme'));
  }
  function isOpen(){var m=menuEls();return !!m&&!m.list.hidden;}
  function setOpen(open,focusButton){
    var m=menuEls();if(!m)return;
    m.list.hidden=!open;
    m.button.setAttribute('aria-expanded',String(open));
    if(open){
      var cur=m.list.querySelector('[aria-checked="true"]')||m.list.firstElementChild;
      if(cur)cur.focus({preventScroll:true});
    }else if(focusButton)m.button.focus({preventScroll:true});
  }
  function apply(theme){
    root.setAttribute('data-theme',theme);
    root.classList.toggle('dark',!!DARK_BASED[theme]);
    OWN_CLASS.forEach(function(c){root.classList.toggle(c,theme===c);});
    syncMenu(theme);
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
  /* Выбор пользователя: применяем и сразу записываем в настройки приложения,
     иначе после перезагрузки вернётся прежняя тема из D.settings. */
  function choose(theme){
    if(!valid(theme))return;
    var changed=theme!==root.getAttribute('data-theme');
    set(theme,true);
    if(typeof D!=='undefined'&&D&&typeof window.save==='function')window.save();
    if(typeof S!=='undefined'&&S.view==='settings'&&typeof window.render==='function')window.render();
    if(changed){try{window.dispatchEvent(new CustomEvent('teacher-diary:themepicked',{detail:{theme:theme}}));}catch(e){}}
  }
  apply(resolve());
  buildMenu();
  document.addEventListener('click',function(e){
    var m=menuEls();if(!m||!e.target||!e.target.closest)return;
    var item=e.target.closest('[data-theme-value]');
    if(item&&m.list.contains(item)){setOpen(false,true);choose(item.getAttribute('data-theme-value'));return;}
    if(e.target.closest('[data-theme-menu-button]')){setOpen(!isOpen());return;}
    if(isOpen()&&!m.box.contains(e.target))setOpen(false);
  });
  /* закрываем по нажатию вне меню, даже если обработчик на странице остановил click */
  document.addEventListener('pointerdown',function(e){
    var m=menuEls();
    if(m&&isOpen()&&!m.box.contains(e.target))setOpen(false);
  },true);
  document.addEventListener('keydown',function(e){
    var m=menuEls();if(!m||!m.box.contains(e.target))return;
    if(!isOpen()){
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}
      return;
    }
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setOpen(false,true);return;}
    if(e.key==='Tab'){setOpen(false);return;}
    var items=Array.prototype.slice.call(m.list.querySelectorAll('.theme-item'));
    var i=items.indexOf(document.activeElement),n=null;
    if(e.key==='ArrowDown')n=(i+1)%items.length;
    else if(e.key==='ArrowUp')n=(i-1+items.length)%items.length;
    else if(e.key==='Home')n=0;
    else if(e.key==='End')n=items.length-1;
    if(n!==null){e.preventDefault();items[n].focus({preventScroll:true});}
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
  /* ---- Анимации тем «web3» и «holo»: подсветка за курсором и появление экранов при навигации ---- */
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function glowTheme(){return root.classList.contains('web3')||root.classList.contains('holo');}
  var pointerFrame=0,lastPointer=null,lastCard=null;
  document.addEventListener('pointermove',function(e){
    if(reduceMotion||!glowTheme())return;
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
    if(reduceMotion||!glowTheme())return;
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
  window.addEventListener('teacher-diary:themechange',function(e){if(e.detail&&(e.detail.theme==='web3'||e.detail.theme==='holo'))playEnter();});

  window.TeacherDiaryTheme={
    themes:THEMES.slice(),
    list:LIST.map(function(t){return {id:t.id,name:t.name};}),
    get:function(){return root.getAttribute('data-theme');},
    set:function(t){set(t,true);},
    choose:choose,
    refresh:function(){syncMenu(root.getAttribute('data-theme'));}
  };
})();
