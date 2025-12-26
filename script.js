/* ======================
     GLOBAL VARIABLES
======================*/
const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let habits=8;
let weekOffset=0;
let today=new Date(); today.setHours(0,0,0,0);
let soundReady=false;

/* DARK MODE */
if(localStorage.getItem("dark")==="true")
 document.body.classList.add("dark");

function toggleDark(){
 document.body.classList.toggle("dark");
 localStorage.setItem("dark",document.body.classList.contains("dark"));
}

/* ======================
     MUSIC PLAYER
======================*/
let defaultSongs=[
 {name:"Pump Up 🔥",url:"https://www.bensound.com/bensound-music/bensound-epic.mp3"},
 {name:"Beast Mode ⚡",url:"https://www.bensound.com/bensound-music/bensound-actionable.mp3"},
 {name:"Focus Boost 🎧",url:"https://www.bensound.com/bensound-music/bensound-funkyelement.mp3"}
];

let customSongs = JSON.parse(localStorage.getItem("customSongs")||"[]");
let playlist = [...defaultSongs, ...customSongs];

let curSong=+localStorage.getItem("lastSongIndex")||0;
let music=document.getElementById("music");

function loadSong(){
  music.src=playlist[curSong].url;
  songName.innerText=playlist[curSong].name;
  localStorage.setItem("lastSongIndex",curSong);
  music.play();
}

music.volume = +localStorage.getItem("vol")||0.6;
volumeControl.value = music.volume;
loadSong();

function toggleMusic(){ music.paused ? music.play() : music.pause(); }
function nextSong(){ curSong=(curSong+1)%playlist.length; loadSong(); }
function prevSong(){ curSong=(curSong-1+playlist.length)%playlist.length; loadSong(); }
function changeVolume(v){ music.volume=v; localStorage.setItem("vol",v); }
function toggleLoop(){ music.loop=!music.loop; event.target.innerText="🔁 Loop: "+(music.loop?"On":"Off"); }

/* PLAYLIST SCREEN */
function openPlaylist(){
 mainApp.style.display="none";
 playlistScreen.style.display="block";
 displaySongs();
}
function closePlaylist(){
 playlistScreen.style.display="none";
 mainApp.style.display="block";
}

function displaySongs(){
 songList.innerHTML="";
 playlist.forEach((s,i)=>{
  songList.innerHTML+=`
   <div class="songItem">
     ${s.name}
     ${i>=defaultSongs.length ? `<button onclick="deleteSong(${i})">❌</button>` : ""}
   </div>`;
 });
}

function addCustomSong(){
 let file=songUpload.files[0];
 if(!file) return alert("Select a song");
 customSongs.push({name:file.name,url:URL.createObjectURL(file)});
 localStorage.setItem("customSongs",JSON.stringify(customSongs));
 playlist=[...defaultSongs,...customSongs]; loadSong(); displaySongs();
}
function deleteSong(i){
 customSongs.splice(i-defaultSongs.length,1);
 localStorage.setItem("customSongs",JSON.stringify(customSongs));
 playlist=[...defaultSongs,...customSongs];
 loadSong(); displaySongs();
}

/* ======================
       PROFILE
======================*/
function saveProfile(){
 let n=userName.value;
 if(n) localStorage.setItem("name",n);

 let f=photoInput.files[0];
 if(f){
   let r=new FileReader();
   r.onload=()=>{ localStorage.setItem("pic",r.result); profilePic.src=r.result; };
   r.readAsDataURL(f);
 }
 loadProfile();
}

function loadProfile(){
 userNameShow.innerText="👤 "+(localStorage.getItem("name")||"Your Name");
 profilePic.src=localStorage.getItem("pic")||"";
 updateStats(); updateStreak();
}

/* ======================
       HABIT EDIT
======================*/
function editHabits(){
 habitEditor.innerHTML="";
 let saved=JSON.parse(localStorage.getItem("habitNames")||"[]");

 for(let i=0;i<habits;i++){
   habitEditor.innerHTML+=`<input id="h${i}" value="${saved[i]||"Habit "+(i+1)}">`;
 }
 habitEditor.innerHTML+=`<button onclick="saveHabits()">Save</button>`;
 habitEditor.style.display="block";
}

function saveHabits(){
 let arr=[];
 for(let i=0;i<habits;i++) arr.push(document.getElementById("h"+i).value);
 localStorage.setItem("habitNames",JSON.stringify(arr));
 habitEditor.style.display="none";
 render();
}

/* ======================
      TICK SOUND
======================*/
function unlockSound(){
 tickSound.play().then(()=>{
  tickSound.pause(); tickSound.currentTime=0; soundReady=true;
 });
}

/* ======================
   WATER / WEIGHT TRACK
======================*/
function saveWater(){localStorage.setItem("water",water.value);updateStats();}
function saveWeight(){localStorage.setItem("weight",weight.value);updateStats();}
function updateStats(){
 statsShow.innerText=`💧${localStorage.getItem("water")||0} | ⚖️${localStorage.getItem("weight")||0}`;
}

/* ======================
         ALARM
======================*/
function setAlarm(){
 let t=alarmTime.value;
 if(!t) return alert("Select a time!");
 localStorage.setItem("alarm",t);
 Notification.requestPermission();
 alert("⏰ Alarm Set!");
}

setInterval(()=>{
 let set=localStorage.getItem("alarm");
 if(!set) return;
 let n=new Date();
 let cur=n.getHours()+":"+String(n.getMinutes()).padStart(2,"0");
 if(cur===set){ alert("⏰ Time to move!"); }
},60000);

/* ======================
         STREAK
======================*/
function updateStreak(){
 let s=0;
 let d=new Date(today);

 while(true){
  let done=false;
  for(let i=0;i<habits;i++){
   let k=`${d.getFullYear()}-${d.getMonth()}_${d.getDate()}_${i}`;
   if(localStorage.getItem(k)==="1") done=true;
  }
  if(!done) break;
  s++; d.setDate(d.getDate()-1);
 }

 streakShow.innerText="🔥 Streak: "+s;
 localStorage.setItem("streak",s);
}

/* ======================
      HABIT TABLE
======================*/
function changeWeek(v){ weekOffset+=v; render(); }
function weekStart(d){ let x=new Date(d); x.setDate(x.getDate()-x.getDay()); return x; }

function render(){
 let start=weekStart(new Date(today.getTime()+weekOffset*7*86400000));
 monthYear.innerText=start.toLocaleString("default",{month:"long",year:"numeric"});
 weekTitle.innerText=start.toDateString();

 let names=JSON.parse(localStorage.getItem("habitNames")||"[]");
 let row=`<th>Date</th><th>Day</th>`;
 for(let i=0;i<habits;i++) row+=`<th>${names[i]||"Habit "+(i+1)}</th>`;
 row+=`<th>%</th>`; habitHeadRow.innerHTML=row;

 chartBody.innerHTML="";
 for(let i=0;i<7;i++){
  let d=new Date(start); d.setDate(start.getDate()+i);
  let istoday=d.toDateString()===today.toDateString();
  let r=`<td>${d.getDate()}</td><td>${days[d.getDay()]}</td>`;

  for(let h=0;h<habits;h++){
   let k=`${d.getFullYear()}-${d.getMonth()}_${d.getDate()}_${h}`;
   let ch=localStorage.getItem(k)==="1";
   r+=`<td><input type="checkbox" ${ch?'checked':''}
    ${!istoday?'disabled':''}
    onclick="saveTick('${k}',this)"></td>`;
  }
  chartBody.innerHTML+=`<tr class="${istoday?'today':''}">
    ${r}<td class="per">0%</td></tr>`;
 }
 calcPercent();
}

function saveTick(k,el){
 localStorage.setItem(k,el.checked?"1":"0");
 if(soundReady){ tickSound.currentTime=0; tickSound.play(); }
 updateStreak(); calcPercent();
}

function calcPercent(){
 document.querySelectorAll(".per").forEach(per=>{
  let row=per.parentNode;
  per.innerText=Math.round(row.querySelectorAll("input:checked").length/habits*100)+"%";
 });
}

/* ======================
 WORKOUT TIMER FULLSCREEN
======================*/
let timerSec=0, remaining=0, timerInterval, isRunning=false;
const timerScreen=document.getElementById("timerScreen");
const timerDisplay=document.getElementById("timerDisplay");
const canvas=document.getElementById("circleCanvas");
const ctx=canvas.getContext("2d");
let radius=canvas.width/2-10;

function openTimer(){ timerScreen.style.display="block"; document.body.style.overflow="hidden"; }
function closeTimer(){ resetTimerFS(); timerScreen.style.display="none"; document.body.style.overflow="auto"; }

function setTime(sec){
 timerSec=sec; remaining=sec;
 updateTimerUI(); drawCircle(1);
}
function drawCircle(progress){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.beginPath(); ctx.arc(canvas.width/2,canvas.height/2,radius,0,2*Math.PI);
 ctx.strokeStyle="#003366"; ctx.lineWidth=12; ctx.stroke();
 ctx.beginPath();
 ctx.arc(canvas.width/2,canvas.height/2,radius,-Math.PI/2,(2*Math.PI*progress)-Math.PI/2);
 ctx.strokeStyle="#4da6ff"; ctx.lineWidth=12; ctx.stroke();
}
function updateTimerUI(){
 let m=Math.floor(remaining/60), s=remaining%60;
 timerDisplay.innerText=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
 drawCircle(remaining/timerSec);
}
updateTimerUI();

function startTimerFS(){
 if(isRunning) return;
 if(timerSec===0){
  let custom=+document.getElementById("customTime").value;
  if(!custom) return alert("Enter time!");
  setTime(custom);
 }
 isRunning=true;
 timerInterval=setInterval(()=>{
  remaining--; updateTimerUI();
  if(remaining<=0) completeTimer();
 },1000);
}
function pauseTimerFS(){ isRunning=false; clearInterval(timerInterval); }
function resetTimerFS(){ isRunning=false; clearInterval(timerInterval); remaining=timerSec; updateTimerUI(); }
function completeTimer(){
 clearInterval(timerInterval); isRunning=false; remaining=0; updateTimerUI();
 if(navigator.vibrate) navigator.vibrate([500,200,500]);
 let beep=new Audio("https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3"); beep.play();
 alert("🔥 Workout Round Completed!");
}

/* ======================
         INIT
======================*/
loadProfile();
render();
displaySongs();

