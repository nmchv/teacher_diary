/* ===================== ОКНА ПОВЕРХ СТРАНИЦЫ =====================
   Пока открыто модальное окно или режим урока, страница под ними не прокручивается.
   Состояние определяется по самому DOM, поэтому действует для любого способа открытия и закрытия.
*/
(function(){
 const modal=document.getElementById('modal');
 const present=document.getElementById('present');
 const root=document.documentElement;
 function sync(){
  const inPresent=!!present.firstElementChild;
  const hasModal=!!(modal.firstElementChild||document.getElementById('quick-grade-popup')||document.getElementById('present-layout-editor'));
  document.body.classList.toggle('present-open',inPresent);
  const lock=inPresent||hasModal;
  if(lock===root.classList.contains('scroll-lock'))return;
  /* на месте исчезнувшей полосы прокрутки остаётся отступ, чтобы страница не сдвигалась */
  const bar=lock?window.innerWidth-root.clientWidth:0;
  document.body.style.paddingRight=bar>0?bar+'px':'';
  root.classList.toggle('scroll-lock',lock);
 }
 const observer=new MutationObserver(sync);
 [modal,present,document.body].forEach(node=>observer.observe(node,{childList:true}));
 sync();
})();
