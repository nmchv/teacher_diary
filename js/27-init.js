/* ===================== ЗАПУСК ===================== */
console.log('Дневник учителя — версия 4.1.7');
loadData();
purgeOldArchivedLessons();
repairMissingLessonTimes();
render();
applySeasonClass();
initAssistant();
window.addEventListener('resize',()=>{lastParticleKey=null;applySeasonClass()});
