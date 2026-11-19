function applyTheme(){
 let t=THEMES.find(x=>x.key===D.settings.theme)||THEMES[0];
 document.documentElement.style.setProperty('--accent',D.settings.accentColor||t.c);
 document.documentElement.style.setProperty('--accent2',D.settings.accentColor||t.c2||t.c);
 document.documentElement.classList.toggle('dark',D.settings.colorMode==='dark');
 document.documentElement.classList.toggle('compact',!!D.settings.compact);
 document.documentElement.style.setProperty('--font-family',FONT_FAMILIES[D.settings.fontFamily]||FONT_FAMILIES.system);
 document.documentElement.style.setProperty('--r',D.settings.radius===undefined?1:D.settings.radius);
 document.documentElement.classList.toggle('sidebar-gradient',D.settings.sidebarStyle==='gradient');
 let bgIcon=D.settings.bgDecorations?(THEME_BG_ICON[currentDecorKey()]||''):'';
 document.documentElement.style.setProperty('--bg-pattern',bgIcon?buildBgPatternUrl(bgIcon):'none');
 applySeasonClass();
}
/* ---- Сезонное и тематическое оформление ---- */
function currentSeasonKey(){
 let s=D.settings.season||'auto';
 if(s!=='auto')return s;
 let m=new Date().getMonth()+1;
 if([12,1,2].includes(m))return'winter';
 if([3,4,5].includes(m))return'spring';
 if([6,7,8].includes(m))return'summer';
 return'autumn';
}
const THEME_SEASON_ALIAS={'t-autumn':'autumn','t-winter':'winter','t-spring':'spring','t-summer':'summer'};
function currentDecorKey(){
 let key=D.settings.theme;
 if(THEME_SEASON_ALIAS[key])return THEME_SEASON_ALIAS[key];
 if(THEME_PARTICLES[key])return key;
 return currentSeasonKey();
}
function buildBgPatternUrl(emoji){
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><text x="75" y="98" font-size="64" text-anchor="middle" opacity="0.11">'+emoji+'</text></svg>';
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
let lastParticleKey=null;
function applySeasonClass(){
 let seasonKey=currentSeasonKey();
 let html=document.documentElement;
 ['season-autumn','season-winter','season-spring','season-summer'].forEach(c=>html.classList.remove(c));
 if(seasonKey!=='none')html.classList.add('season-'+seasonKey);
 let decorKey=currentDecorKey();
 let wantKey=D.settings.seasonEffects?(decorKey+'|'+(D.settings.particleDensity||'medium')):'none';
 if(wantKey!==lastParticleKey){lastParticleKey=wantKey;renderSeasonParticles(decorKey)}
}
const SEASON_EMOJI={autumn:['🍁','🍂','🍃','🎃','👻','🌰','☕'],winter:['❄️','❅','❆','⛄','🧊'],spring:['🌸','🌷','🌼','🐣','🦋','🌱'],summer:['☀️','🌻','✨','🍉','🦋']};
const THEME_PARTICLES={
 'c-de':['🇩🇪','🥨','🌰','⭐'],
 'c-us':['🇺🇸','🌰','⭐','🦅'],
 'c-fr':['🇫🇷','🥐','🗼','⭐'],
 'sub-geo':['🌍','🌎','🌏','🚩','🏔️','🌲','🧭'],
 'sub-phys':['⚛️','🔋','💡','🧲','⚡'],
 'sub-chem':['🧪','⚗️','🧫','💥','🔬'],
 'cool-neon':['⚡','✨','💎','🌟'],
 'cool-sunset':['🌇','🌅','🦩','🌴'],
 'cool-galaxy':['🌌','🪐','⭐','☄️','🚀'],
 'cool-aurora':['🌈','✨','🦌','❄️']
};
const THEME_BG_ICON={autumn:'🎃',winter:'❄️',spring:'🌸',summer:'☀️',
 'c-de':'🇩🇪','c-us':'🇺🇸','c-fr':'🇫🇷',
 'sub-geo':'🌍','sub-phys':'⚛️','sub-chem':'🧪',
 'cool-neon':'⚡','cool-sunset':'🌇','cool-galaxy':'🌌','cool-aurora':'🌈'};
const PARTICLE_DENSITY_MULT={low:0.4,medium:1,high:2.4};
const PARTICLE_DENSITY_LABELS={low:'Мало',medium:'Обычно',high:'Много'};
function renderSeasonParticles(key){
 let wrap=document.getElementById('season-particles');
 if(!wrap)return;
 wrap.innerHTML='';
 if(!D.settings.seasonEffects||key==='none')return;
 let set=THEME_PARTICLES[key]||SEASON_EMOJI[key];if(!set)return;
 let mult=PARTICLE_DENSITY_MULT[D.settings.particleDensity]||1;
 let count=Math.max(3,Math.round((window.innerWidth<700?14:26)*mult));
 for(let i=0;i<count;i++){
  let el=document.createElement('span');
  el.className='season-particle';
  el.textContent=set[i%set.length];
  let left=Math.random()*100;
  let dur=(9+Math.random()*10).toFixed(1);
  let delay=(-Math.random()*18).toFixed(1);
  let size=(14+Math.random()*14).toFixed(0);
  let drift=(Math.random()*80-40).toFixed(0)+'px';
  el.style.left=left+'vw';
  el.style.fontSize=size+'px';
  el.style.setProperty('--drift',drift);
  el.style.animation='seasonfall '+dur+'s linear '+delay+'s infinite';
  wrap.appendChild(el);
 }
}
function setSeason(v){D.settings.season=v;save();applySeasonClass()}
function toggleSeasonEffects(v){D.settings.seasonEffects=v;save();applySeasonClass()}
function setParticleDensity(v){D.settings.particleDensity=v;save();lastParticleKey=null;applySeasonClass()}
function toggleBgDecorations(v){D.settings.bgDecorations=v;save();applyTheme()}
function setFont(v){D.settings.fontFamily=v;save();applyTheme()}
function setRadius(v){D.settings.radius=(+v);save();document.documentElement.style.setProperty('--r',D.settings.radius)}
function setSidebarStyle(v){D.settings.sidebarStyle=v;save();applyTheme()}

