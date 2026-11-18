function boot(){
 loadData();
 purgeOldArchivedLessons();
 repairMissingLessonTimes();
 render();
 applySeasonClass();
 initAssistant();
 window.addEventListener('resize',()=>{lastParticleKey=null;applySeasonClass()});
}
