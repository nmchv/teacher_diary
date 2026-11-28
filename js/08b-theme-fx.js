/* ===================== ЭФФЕКТЫ ТЕМ «ВЕСЕННЯЯ» И «ГОЛОГРАММА» =====================
   spring: летящие лепестки на canvas.
   holo:   свой курсор, вращающийся глобус-голограмма, консоль, «загрузка»
           при включении темы и расшифровка заголовка при переходах.
   Всё создаётся при включении темы и полностью убирается при переходе на другую.
*/
(function(){
  'use strict';
  var root=document.documentElement;
  var reduce=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  var finePointer=window.matchMedia?window.matchMedia('(hover: hover) and (pointer: fine)'):{matches:false};

  function el(tag,cls,parent){
    var n=document.createElement(tag);
    if(cls)n.className=cls;
    if(parent)parent.appendChild(n);
    return n;
  }
  function listen(list,target,type,fn,opts){
    target.addEventListener(type,fn,opts);
    list.push(function(){target.removeEventListener(type,fn,opts);});
  }
  function fitCanvas(canvas,w,h){
    var k=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*k);canvas.height=Math.round(h*k);
    var ctx=canvas.getContext('2d');
    if(ctx)ctx.setTransform(k,0,0,k,0,0);
    return ctx;
  }

  /* ---------------- Весна: лепестки ---------------- */
  function startPetals(){
    if(reduce.matches)return null;
    var off=[],canvas=el('canvas','spring-petals',document.body);
    canvas.setAttribute('aria-hidden','true');
    var W,H,ctx,frame=0,last=0;
    var COLORS=[['#ffe3ee','#ff9dbd'],['#fff0f5','#f7aecb'],['#efe6ff','#c3a9f2'],['#ffeee2','#ffbd9a']];
    function resize(){W=window.innerWidth;H=window.innerHeight;ctx=fitCanvas(canvas,W,H);}
    resize();
    if(!ctx){canvas.remove();return null;}
    function rnd(a,b){return a+Math.random()*(b-a);}
    function petal(fromTop){
      return {x:rnd(-40,W),y:fromTop?rnd(-80,-20):rnd(-20,H),s:rnd(6,13),vx:rnd(8,30),vy:rnd(22,48),
        a:rnd(0,6.28),va:rnd(-1.2,1.2),f:rnd(0,6.28),vf:rnd(1,2.6),c:COLORS[Math.floor(Math.random()*COLORS.length)],o:rnd(.55,.85),life:0};
    }
    var petals=[],burst=[],count=window.innerWidth<700?12:24;
    for(var i=0;i<count;i++)petals.push(petal(false));
    function draw(p,alpha){
      ctx.save();
      ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.scale(1,.35+.65*Math.abs(Math.cos(p.f)));
      var s=p.s,g=ctx.createLinearGradient(0,s,0,-s);
      g.addColorStop(0,p.c[1]);g.addColorStop(1,p.c[0]);
      ctx.globalAlpha=alpha;ctx.fillStyle=g;
      ctx.beginPath();
      ctx.moveTo(0,s);
      ctx.bezierCurveTo(-s*1.1,s*.3,-s*.85,-s,-s*.25,-s*.85);
      ctx.quadraticCurveTo(0,-s*.55,s*.25,-s*.85);
      ctx.bezierCurveTo(s*.85,-s,s*1.1,s*.3,0,s);
      ctx.fill();
      ctx.restore();
    }
    function tick(t){
      var dt=Math.min((t-(last||t))/1000,.05);last=t;
      ctx.clearRect(0,0,W,H);
      petals.forEach(function(p,i){
        p.f+=p.vf*dt;p.a+=p.va*dt;p.x+=(p.vx+Math.sin(p.f*.7)*26)*dt;p.y+=p.vy*dt;
        if(p.y>H+30||p.x>W+40)petals[i]=petal(true);
        draw(petals[i],petals[i].o);
      });
      for(var j=burst.length-1;j>=0;j--){
        var b=burst[j];
        b.life+=dt;b.vy+=260*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.a+=b.va*dt;b.f+=b.vf*dt;
        if(b.life>1.1)burst.splice(j,1);else draw(b,1-b.life/1.1);
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    listen(off,window,'resize',resize);
    /* салют из лепестков при нажатии на главные кнопки */
    listen(off,document,'click',function(e){
      var b=e.target&&e.target.closest?e.target.closest('button.primary'):null;
      if(!b||burst.length>60||(!e.clientX&&!e.clientY))return;
      for(var i=0;i<14;i++){
        var p=petal(false),a=rnd(0,6.28),v=rnd(70,210);
        p.x=e.clientX;p.y=e.clientY;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v-120;p.va=rnd(-6,6);p.vf=rnd(4,9);p.s=rnd(5,9);
        burst.push(p);
      }
    },true);
    return function(){cancelAnimationFrame(frame);off.forEach(function(f){f();});canvas.remove();};
  }

  /* ---------------- Голограмма: глобус ---------------- */
  function startGlobe(){
    var off=[],canvas=el('canvas','holo-globe',document.body);
    canvas.setAttribute('aria-hidden','true');
    var size,ctx,frame=0,prev=0;
    function resize(){size=canvas.clientWidth||520;ctx=fitCanvas(canvas,size,size);paint(prev);}
    function paint(t){
      if(!ctx)return;
      ctx.clearRect(0,0,size,size);
      var c=size/2,R=size*.34,spin=t/9000,tilt=.42;
      function point(lat,lon){
        var x=Math.cos(lat)*Math.sin(lon+spin),y=Math.sin(lat),z=Math.cos(lat)*Math.cos(lon+spin);
        return [c+x*R,c-(y*Math.cos(tilt)-z*Math.sin(tilt))*R,y*Math.sin(tilt)+z*Math.cos(tilt)];
      }
      var grad=ctx.createLinearGradient(c-R,c-R,c+R,c+R);
      grad.addColorStop(0,'#00b8e6');grad.addColorStop(.5,'#7a5cff');grad.addColorStop(1,'#ff4fc3');
      ctx.strokeStyle=grad;ctx.fillStyle=grad;ctx.lineWidth=1;
      function line(fn,steps){
        var a=fn(0);
        for(var i=1;i<=steps;i++){
          var b=fn(i/steps);
          ctx.globalAlpha=(a[2]+b[2])>0?.55:.14;
          ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
          a=b;
        }
      }
      var m,p;
      for(m=0;m<12;m++)(function(lon){line(function(u){return point((u-.5)*Math.PI,lon);},36);})(m*Math.PI/6);
      for(p=-2;p<=2;p++)(function(lat){line(function(u){return point(lat,u*Math.PI*2);},64);})(p*Math.PI/7);
      /* орбиты со спутниками */
      [[1.28,.34,-.45,1],[1.45,.22,.6,-.7]].forEach(function(o){
        ctx.save();ctx.translate(c,c);ctx.rotate(o[2]);
        ctx.globalAlpha=.45;ctx.setLineDash([2,6]);
        ctx.beginPath();ctx.ellipse(0,0,R*o[0],R*o[1],0,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([]);ctx.globalAlpha=.95;
        var a=t/2600*o[3];
        ctx.beginPath();ctx.arc(Math.cos(a)*R*o[0],Math.sin(a)*R*o[1],3.2,0,Math.PI*2);ctx.fill();
        ctx.restore();
      });
    }
    /* 30 кадров в секунду достаточно для фоновой голограммы */
    function tick(t){
      if(t-prev>=33){prev=t;paint(t);}
      frame=requestAnimationFrame(tick);
    }
    resize();
    if(!reduce.matches)frame=requestAnimationFrame(tick);
    listen(off,window,'resize',resize);
    return function(){cancelAnimationFrame(frame);off.forEach(function(f){f();});canvas.remove();};
  }

  /* ---------------- Голограмма: курсор ---------------- */
  function startCursor(){
    if(!finePointer.matches)return null;
    var off=[],box=el('div','holo-cursor',document.body);
    box.setAttribute('aria-hidden','true');
    var ringPos=el('div',null,box),ring=el('div','holo-cursor-ring',ringPos),tag=el('div','holo-cursor-tag',ringPos),dot=el('div','holo-cursor-dot',box);
    ringPos.style.position='absolute';
    var x=0,y=0,rx=0,ry=0,frame=0,shown=false;
    function loop(){
      var k=reduce.matches?1:.22;
      rx+=(x-rx)*k;ry+=(y-ry)*k;
      ringPos.style.transform='translate3d('+rx+'px,'+ry+'px,0)';
      frame=Math.abs(x-rx)+Math.abs(y-ry)>.3?requestAnimationFrame(loop):0;
    }
    function hide(){shown=false;box.classList.remove('is-visible');}
    listen(off,document,'pointermove',function(e){
      if(e.pointerType!=='mouse'&&e.pointerType!=='pen'){hide();root.classList.remove('holo-cursor-on');return;}
      /* родной курсор прячем только после первого движения мыши */
      root.classList.add('holo-cursor-on');
      x=e.clientX;y=e.clientY;
      if(!shown){shown=true;rx=x;ry=y;box.classList.add('is-visible');}
      dot.style.translate=x+'px '+y+'px';
      var t=e.target&&e.target.closest?e.target:null;
      var isText=!!(t&&t.closest('textarea,[contenteditable="true"],input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]):not([type=color]):not([type=file])'));
      var isLink=!isText&&!!(t&&t.closest('a,button:not(:disabled),select,summary,label,input,[onclick],.click,.sched-cell,.ws-cell.click,.chip-link,.ple-card'));
      box.classList.toggle('is-text',isText);
      box.classList.toggle('is-link',isLink);
      tag.textContent=isText?'':isLink?'[ SELECT ]':'X'+('000'+Math.round(x)).slice(-4)+' Y'+('000'+Math.round(y)).slice(-4);
      tag.style.display=isText?'none':'';
      if(!frame)frame=requestAnimationFrame(loop);
    },{passive:true});
    listen(off,document,'pointerdown',function(){box.classList.add('is-down');},true);
    listen(off,document,'pointerup',function(){box.classList.remove('is-down');},true);
    listen(off,root,'mouseleave',hide);
    listen(off,window,'blur',hide);
    return function(){cancelAnimationFrame(frame);off.forEach(function(f){f();});box.remove();root.classList.remove('holo-cursor-on');};
  }

  /* ---------------- Голограмма: консоль ---------------- */
  var SECTIONS={home:'главная',students:'ученики',search:'поиск',stats:'статистика',reports:'ведомости',materials:'материалы',library:'библиотека',planning:'планирование',announcements:'объявления',work:'работа',settings:'настройки',backup:'копия'};
  var consoleLog=null,history=['дневник учителя :: консоль готова','введите help, чтобы увидеть команды'];
  function write(text,kind){
    history.push(kind?{t:text,k:kind}:text);
    if(history.length>80)history.shift();
    if(consoleLog)appendLine(history[history.length-1]);
  }
  function appendLine(item){
    var line=el('div',item.k?'is-'+item.k:'',consoleLog);
    line.textContent=item.t||item;
    while(consoleLog.childNodes.length>80)consoleLog.removeChild(consoleLog.firstChild);
    consoleLog.scrollTop=consoleLog.scrollHeight;
  }
  function run(raw){
    var text=raw.trim();if(!text)return;
    write('$ '+text,'cmd');
    var parts=text.toLowerCase().split(/\s+/),cmd=parts[0],arg=parts.slice(1).join(' ');
    if(cmd==='help'||cmd==='помощь'){
      write('ls              список разделов\ncd <раздел>     перейти в раздел\ntheme           список тем\ntheme <код>     сменить тему\ndate            дата и время\nclear           очистить экран\nexit            свернуть консоль');
    }else if(cmd==='ls'){
      write(Object.keys(SECTIONS).map(function(k){return SECTIONS[k];}).join('  '));
    }else if(cmd==='cd'||cmd==='open'){
      var want=arg.replace(/^[~\/]+|\/+$/g,'')||'главная';
      var found=Object.keys(SECTIONS).filter(function(k){return k===want||SECTIONS[k]===want;})[0];
      if(found&&typeof window.goto==='function')window.goto(found);
      else write('cd: нет такого раздела: '+arg,'err');
    }else if(cmd==='theme'||cmd==='тема'){
      var api=window.TeacherDiaryTheme;
      if(api&&api.themes.indexOf(arg)!==-1){write('тема: '+arg,'ok');api.choose(arg);}
      else if(api)write(api.list.map(function(t){return (t.id+'        ').slice(0,8)+t.name;}).join('\n'),arg?'err':'');
    }else if(cmd==='date'){
      write(new Date().toLocaleString('ru-RU'));
    }else if(cmd==='clear'){
      history.length=0;if(consoleLog)consoleLog.textContent='';
    }else if(cmd==='exit'){
      return 'exit';
    }else write('команда не найдена: '+cmd+' (help — список команд)','err');
  }
  function startConsole(){
    var box=el('div','holo-console',document.body);
    var win=el('div','holo-console-win',box);win.hidden=true;win.id='holo-console-win';
    var head=el('div','holo-console-head',win);el('b',null,head).textContent='терминал ~/дневник';
    var close=el('button','holo-console-close',head);close.type='button';close.textContent='✕';close.setAttribute('aria-label','Свернуть консоль');
    var log=el('div','holo-console-log',win);log.setAttribute('role','log');
    var form=el('form','holo-console-form',win);el('span',null,form).textContent='>';
    var input=el('input',null,form);input.type='text';input.autocomplete='off';input.spellcheck=false;input.placeholder='help';input.setAttribute('aria-label','Команда консоли');
    var pill=el('button','holo-console-pill',box);pill.type='button';
    pill.setAttribute('aria-expanded','false');pill.setAttribute('aria-controls',win.id);pill.setAttribute('aria-label','Консоль');
    el('span','holo-console-led',pill);el('span',null,pill).textContent='консоль';el('span','holo-console-caret',pill);
    consoleLog=log;history.forEach(appendLine);
    function toggle(open){
      win.hidden=!open;pill.setAttribute('aria-expanded',String(open));
      if(open){log.scrollTop=log.scrollHeight;input.focus();}else pill.focus();
    }
    pill.addEventListener('click',function(){toggle(win.hidden);});
    close.addEventListener('click',function(){toggle(false);});
    win.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();toggle(false);}});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var value=input.value;input.value='';
      if(run(value)==='exit')toggle(false);
    });
    return function(){consoleLog=null;box.remove();};
  }

  /* ---------------- Голограмма: расшифровка заголовка ---------------- */
  var scrambleFrame=0,scrambleRestore=null;
  function stopScramble(){
    cancelAnimationFrame(scrambleFrame);
    if(scrambleRestore){scrambleRestore();scrambleRestore=null;}
  }
  function scramble(){
    stopScramble();
    if(reduce.matches)return;
    var h=document.querySelector('.main h1');if(!h)return;
    var node=Array.prototype.filter.call(h.childNodes,function(n){return n.nodeType===3&&n.nodeValue.trim();})[0];
    if(!node)return;
    var text=node.nodeValue,start=0,GLYPHS='АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ01<>/_#';
    scrambleRestore=function(){node.nodeValue=text;};
    function step(t){
      if(!start)start=t;
      var done=Math.floor((t-start)/600*text.length);
      if(done>=text.length){stopScramble();return;}
      node.nodeValue=text.split('').map(function(ch,i){return i<done||ch===' '?ch:GLYPHS.charAt(Math.floor(Math.random()*GLYPHS.length));}).join('');
      scrambleFrame=requestAnimationFrame(step);
    }
    scrambleFrame=requestAnimationFrame(step);
  }

  /* ---------------- Голограмма: «загрузка» при выборе темы ---------------- */
  var bootNode=null,bootTimers=[];
  function endBoot(now){
    bootTimers.forEach(clearTimeout);bootTimers=[];
    var n=bootNode;bootNode=null;if(!n)return;
    if(now){n.remove();return;}
    n.classList.add('is-done');
    setTimeout(function(){n.remove();},600);
  }
  function boot(){
    endBoot(true);
    if(reduce.matches)return;
    var n=el('div','holo-boot',document.body);bootNode=n;
    var box=el('div','holo-boot-box',n);el('div','holo-boot-orb',box);
    var lines=el('div','holo-boot-lines',box),bar=el('i',null,el('div','holo-boot-bar',box));
    var steps=['> инициализация интерфейса','> калибровка голограммы … ok','> загрузка дневника … ok','> добро пожаловать_'];
    steps.forEach(function(s,i){
      bootTimers.push(setTimeout(function(){lines.textContent+=(i?'\n':'')+s;bar.style.width=Math.round((i+1)/steps.length*100)+'%';},80+i*260));
    });
    bootTimers.push(setTimeout(function(){endBoot();scramble();},1400));
    n.addEventListener('click',function(){endBoot();});
  }

  function startHolo(){
    var stops=[startGlobe(),startCursor(),startConsole()];
    return function(){
      stopScramble();endBoot(true);
      stops.forEach(function(s){if(s)s();});
    };
  }

  /* ---------------- Включение и выключение ---------------- */
  var EFFECTS={spring:startPetals,holo:startHolo};
  var active=null,stop=null;
  function use(theme){
    if(theme===active)return;
    if(stop){stop();stop=null;}
    active=theme;
    if(EFFECTS[theme])stop=EFFECTS[theme]();
  }
  window.addEventListener('teacher-diary:themechange',function(e){use(e.detail&&e.detail.theme);});
  window.addEventListener('teacher-diary:themepicked',function(e){if(e.detail&&e.detail.theme==='holo')boot();});

  /* Переходы между экранами отслеживаем по render(): так учитываются и разделы, и карточки классов и учеников. */
  var screen='',springTimer;
  function screenKey(){return typeof S==='undefined'?'':[S.view,S.classId,S.studentId].join('|');}
  function onScreen(){
    var key=screenKey();
    if(key===screen)return;
    screen=key;
    if(active==='holo'){
      write('→ ~/'+(SECTIONS[S.view]||S.view),'ok');
      scramble();
    }
    if(active==='spring'){
      root.classList.add('sp-enter');
      clearTimeout(springTimer);
      springTimer=setTimeout(function(){root.classList.remove('sp-enter');},900);
    }
  }
  document.addEventListener('DOMContentLoaded',function(){
    if(typeof window.render==='function'){
      var original=window.render;
      window.render=function(){
        /* повторная отрисовка того же экрана не должна проигрывать анимацию появления заново */
        if(screenKey()!==screen){var r=original.apply(this,arguments);onScreen();return r;}
        root.classList.remove('sp-enter');
        return original.apply(this,arguments);
      };
    }
    onScreen();
  });

  use(root.getAttribute('data-theme'));
})();
