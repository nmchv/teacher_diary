/* ===================== IndexedDB (файлы материалов) ===================== */
const FILES_DB='teacherDiaryV3Files',FILES_STORE='files';
let _dbp=null;
function openFilesDB(){
 if(_dbp)return _dbp;
 _dbp=new Promise((res,rej)=>{
  let rq=indexedDB.open(FILES_DB,1);
  rq.onupgradeneeded=()=>{rq.result.createObjectStore(FILES_STORE,{keyPath:'id'})};
  rq.onsuccess=()=>res(rq.result);
  rq.onerror=()=>rej(rq.error);
 });
 return _dbp;
}
async function fileStorePut(id,blob){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).put({id,blob});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function fileStoreGet(id){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readonly');let rq=tx.objectStore(FILES_STORE).get(id);rq.onsuccess=()=>res(rq.result?rq.result.blob:null);rq.onerror=()=>rej(rq.error)})}
async function fileStoreDelete(id){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).delete(id);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
async function fileStoreAll(){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readonly');let rq=tx.objectStore(FILES_STORE).getAll();rq.onsuccess=()=>res(rq.result||[]);rq.onerror=()=>rej(rq.error)})}
async function fileStoreClear(){let db=await openFilesDB();return new Promise((res,rej)=>{let tx=db.transaction(FILES_STORE,'readwrite');tx.objectStore(FILES_STORE).clear();tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
function blobToBase64(blob){return new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(blob)})}
function base64ToBlob(dataUrl){return fetch(dataUrl).then(r=>r.blob())}

