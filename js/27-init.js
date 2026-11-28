/* ===================== ЗАПУСК ===================== */
console.log('Дневник учителя — версия 4.1.7');
loadData();
if(typeof TeacherDiaryTheme!=='undefined'&&D&&D.settings&&TeacherDiaryTheme.themes.indexOf(D.settings.colorMode)!==-1){
  TeacherDiaryTheme.set(D.settings.colorMode,false);
}
initWeather();
purgeOldArchivedLessons();
repairMissingLessonTimes();
render();
initAssistant();
