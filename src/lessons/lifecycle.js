function cancelLesson(id){
 let l=L(id);if(!l)return;
 if(l.cancelled){alert('Этот урок уже отменён.');return}
 if(!confirm('Отметить урок как отменённый?\n\nОн останется в расписании (будет закрашен серым) вместе со своей темой, планом, домашним заданием и заметками, но не будет учитываться в статистике. Ничего не будет автоматически перенесено на другие уроки — при необходимости перенесите план на следующий урок вручную.'))return;
 l.cancelled=true;
 save();closeModal();render();
}
function restoreCancelledLesson(id){
 let l=L(id);if(!l)return;
 if(!confirm('Отметить, что урок всё же состоялся? Тема/план и т.д. НЕ вернутся автоматически на прежнее место — при необходимости перенесите их обратно вручную.'))return;
 l.cancelled=false;
 save();closeModal();render();
}
function archiveLessonConfirm(id){
 if(!confirm('Архивировать урок? Он исчезнет из расписания и статистики, но не удалится сразу — хранится в архиве 30 дней и потом удаляется автоматически. Восстановить можно в любой момент в разделе «Работа → Архив уроков».'))return;
 let l=L(id);if(!l)return;
 l.archived=true;l.archivedAt=toISO(new Date());
 save();closeModal();render();
}
function restoreLessonFromArchive(id){
 let l=L(id);if(!l)return;
 l.archived=false;delete l.archivedAt;
 save();render();
}
function purgeLessonForever(id){
 if(!confirm('Удалить урок навсегда, минуя архив? Это действие необратимо.'))return;
 D.lessons=D.lessons.filter(x=>x.id!==id);
 save();render();
}
