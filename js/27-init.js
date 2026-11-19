/* ===================== ЗАПУСК ===================== */
console.log('Дневник учителя — версия 4.1.7');
loadData();
if(typeof TeacherDiaryTheme!=='undefined'&&D&&D.settings&&(D.settings.colorMode==='light'||D.settings.colorMode==='dark')){
  TeacherDiaryTheme.set(D.settings.colorMode,false);
}
initWeather();
purgeOldArchivedLessons();
repairMissingLessonTimes();
render();
initAssistant();
