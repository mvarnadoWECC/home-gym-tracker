(function(){
"use strict";

/* ---------------- DATA ---------------- */
var WARMUPS = {
  upper:{label:"Upper-Body",items:[
    ["Easy cardio (jog in place / jumping jacks)","90 sec"],
    ["Arm circles — forward + back","10 + 10"],
    ["Band shoulder pass-throughs","10"],
    ["Band pull-aparts","15"],
    ["Scapular push-ups","10"],
    ["Cat-cow","8"],
    ["T-spine rotations","8 / side"]
  ]},
  lower:{label:"Lower-Body",items:[
    ["Easy cardio (jog in place / jumping jacks)","90 sec"],
    ["Leg swings — front-back + side","10 / leg ea."],
    ["Bodyweight squats","15"],
    ["World's greatest stretch","5 / side"],
    ["Glute bridges","15"],
    ["90/90 hip switches","6 / side"],
    ["Ankle rocks on slant block","10 / side"]
  ]},
  full:{label:"Full-Body",items:[
    ["Easy cardio (jog in place / jumping jacks)","2 min"],
    ["Arm circles + band pass-throughs","10 ea."],
    ["Band pull-aparts","15"],
    ["Leg swings — front-back + side","10 / leg ea."],
    ["Bodyweight squats","15"],
    ["Glute bridges","15"],
    ["World's greatest stretch","5 / side"]
  ]}
};
var RAMP = "<b>Then ramp the first lift:</b> empty bar ×8 → ~50% ×5 → ~70% ×3 → ~85% ×1–2 → first working set. (Dumbbell/bodyweight lifts: 1–2 lighter feeler sets.)";

var DAYS = [
  {key:"benchmark", short:"Bench", tag:"Test", warm:"full", isBench:true,
   label:"Workout 1", name:"Benchmark Day",
   lead:"Ramp up, then ONE top set per lift leaving ~2 reps in the tank. The page estimates your 1-rep max and a starting weight.",
   ex:[
     {id:"bm_fsq", name:"Front Squat",         cue:"Top set of 5.",                                                    sets:1,weighted:true, calc:true, type:"bench",requires:["barbell","rack"]},
     {id:"bm_ohp", name:"Overhead Press",       cue:"Strict barbell, top set of 5.",                                   sets:1,weighted:true, calc:true, type:"bench",requires:["barbell","rack"]},
     {id:"bm_inc", name:"Incline Bench Press",  cue:"Top set of 5.",                                                   sets:1,weighted:true, calc:true, type:"bench",requires:["barbell","bench","rack"]},
     {id:"bm_rdl", name:"RDL (Barbell or DB)",  cue:"Top set of 8.",                                                   sets:1,weighted:true, calc:true, type:"bench",requires:["barbell"]},
     {id:"bm_curl",name:"DB Curl",              cue:"Top set of 10, per hand.",                                        sets:1,weighted:true, calc:true, type:"bench",requires:["dumbbells"]},
     {id:"bm_pull",name:"Pull-Ups",             cue:"One max-rep set. Log reps; weight = added load (blank if BW).",   sets:1,weighted:false,          type:"bench",requires:["pullup_bar"]}
   ]},
  {key:"upperA", short:"Upper A", tag:"Press·Pull", warm:"upper",
   label:"Day 1", name:"Upper A — Incline Focus", lead:"",
   ex:[
     {id:"ua_inc", name:"Incline Barbell Bench",      cue:"",                                    sets:4,weighted:true, type:"main",requires:["barbell","bench","rack"]},
     {id:"ua_pull",name:"Pull-Ups",                   cue:"band-assist if needed · weight = added load",sets:4,weighted:false,type:"main",requires:["pullup_bar"]},
     {id:"ua_ohp", name:"Seated DB Overhead Press",   cue:"",                                    sets:3,weighted:true, type:"acc", requires:["dumbbells","bench"]},
     {id:"ua_row", name:"One-Arm DB Row",             cue:"per side",                            sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"ua_curl",name:"DB Curl",                    cue:"",                                    sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"ua_pa",  name:"Band Pull-Aparts",           cue:"",                                    sets:3,weighted:false,type:"static",requires:["bands"]}
   ]},
  {key:"lowerA", short:"Lower A", tag:"Squat", warm:"lower",
   label:"Day 2", name:"Lower A — Squat Focus", lead:"",
   ex:[
     {id:"la_fsq", name:"Front Squat",             cue:"heel-elevate on slant blocks if needed",sets:4,weighted:true, type:"main",requires:["barbell","rack"]},
     {id:"la_rdl", name:"DB Romanian Deadlift",    cue:"",                                       sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"la_bss", name:"Bulgarian Split Squat",   cue:"per leg",                                sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"la_sw",  name:"Kettlebell Swing",         cue:"",                    repsOverride:"15", sets:3,weighted:true, type:"acc", requires:["kettlebell"]},
     {id:"la_calf",name:"Standing Calf Raise",      cue:"slant block + DB/KB", repsOverride:"12–20",sets:4,weighted:true,type:"acc",requires:["dumbbells"]},
     {id:"la_plank",name:"Plank",                   cue:"30–60 sec · log seconds in reps",       sets:3,weighted:false,type:"static",requires:[]}
   ]},
  {key:"upperB", short:"Upper B", tag:"Press·Pull", warm:"upper",
   label:"Day 3", name:"Upper B — Overhead Focus", lead:"",
   ex:[
     {id:"ub_ohp", name:"Barbell Overhead Press",      cue:"",                      sets:4,weighted:true, type:"main",requires:["barbell","rack"]},
     {id:"ub_flat",name:"Flat Barbell Bench",          cue:"",                      sets:3,weighted:true, type:"main",requires:["barbell","bench","rack"]},
     {id:"ub_chin",name:"Chin-Ups",                    cue:"band-assist if needed", sets:3,weighted:false,type:"main",requires:["pullup_bar"]},
     {id:"ub_csr", name:"Chest-Supported DB Row",      cue:"on incline bench",      sets:3,weighted:true, type:"acc", requires:["dumbbells","bench"]},
     {id:"ub_lat", name:"DB Lateral Raise",            cue:"",                      sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"ub_ham", name:"Hammer Curl",                 cue:"",                      sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"ub_push",name:"Push-Ups",                    cue:"AMRAP burnout · 2 sets",sets:2,weighted:false,type:"static",requires:[]}
   ]},
  {key:"lowerB", short:"Lower B", tag:"Hinge", warm:"lower",
   label:"Day 4", name:"Lower B — Hinge Focus", lead:"",
   ex:[
     {id:"lb_rdl",  name:"Barbell RDL / Deadlift",cue:"",            sets:4,weighted:true, type:"main",requires:["barbell"]},
     {id:"lb_sq",   name:"Goblet or Back Squat",  cue:"",            sets:3,weighted:true, type:"main",requires:["kettlebell"]},
     {id:"lb_lun",  name:"Walking Lunge",         cue:"per leg",     sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"lb_slrdl",name:"Single-Leg RDL",        cue:"per leg",     sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
     {id:"lb_calf", name:"Seated Calf Raise",     cue:"",repsOverride:"12–20",sets:4,weighted:true,type:"acc",requires:["dumbbells"]},
     {id:"lb_tgu",  name:"Turkish Get-Up",        cue:"3/side · 26# KB",sets:1,weighted:true,type:"static",requires:["kettlebell"]}
   ]}
];
function dayByKey(k){ for(var i=0;i<DAYS.length;i++) if(DAYS[i].key===k) return DAYS[i]; return DAYS[0]; }

/* ---------------- PERIODIZATION ---------------- */
var PHASES=[
  {name:"Hypertrophy",desc:"Build volume · 4 × 8–12"},
  {name:"Strength",   desc:"Build intensity · 4 × 5–8"},
  {name:"Power",      desc:"Peak strength · 5 × 3–5"},
  {name:"Deload",     desc:"Recovery · 2 × 8–10 · ~60% effort"}
];
var WEEKLY=[
  null,
  {main:{sets:4,reps:"8–12"}, acc:{sets:3,reps:"12–15"}},
  {main:{sets:4,reps:"5–8"},  acc:{sets:3,reps:"8–12"}},
  {main:{sets:5,reps:"3–5"},  acc:{sets:3,reps:"6–10"}},
  {main:{sets:2,reps:"8–10 · ~60%"}, acc:{sets:2,reps:"12–15 · ~60%"}}
];

/* ---------------- SUBSTITUTIONS ---------------- */
var SUBS={
  "ua_inc":    {id:"ua_inc_db",  name:"DB Incline Press",       cue:"",                                    sets:4,weighted:true, type:"main",requires:["dumbbells","bench"]},
  "ua_inc_db": {id:"ua_inc_pu",  name:"Push-Up Variations",     cue:"add weight vest or bands for load",   sets:4,weighted:false,type:"main",requires:[]},
  "ua_pull":   {id:"ua_pull_row",name:"DB Bent-Over Row",        cue:"bilateral · heavy",                  sets:4,weighted:true, type:"main",requires:["dumbbells"]},
  "ua_ohp":    {id:"ua_ohp_std", name:"DB Overhead Press",      cue:"standing",                            sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
  "ub_ohp":    {id:"ub_ohp_db",  name:"DB Overhead Press",      cue:"standing",                            sets:4,weighted:true, type:"main",requires:["dumbbells"]},
  "ub_flat":   {id:"ub_flat_db", name:"DB Flat Bench Press",    cue:"",                                    sets:3,weighted:true, type:"main",requires:["dumbbells","bench"]},
  "ub_flat_db":{id:"ub_flat_pu", name:"Push-Up Variations",     cue:"weighted or standard",                sets:3,weighted:false,type:"main",requires:[]},
  "ub_chin":   {id:"ub_chin_row",name:"DB Chest-Supported Row", cue:"face-down on incline or bench",       sets:3,weighted:true, type:"main",requires:["dumbbells"]},
  "ub_csr":    {id:"ub_csr_br",  name:"DB Bent-Over Row",       cue:"bilateral",                           sets:3,weighted:true, type:"acc", requires:["dumbbells"]},
  "la_fsq":    {id:"la_fsq_kb",  name:"Goblet Squat",           cue:"KB or DB · heels elevated if needed", sets:4,weighted:true, type:"main",requires:["kettlebell"]},
  "la_fsq_kb": {id:"la_fsq_bw",  name:"Bodyweight Squat",       cue:"slow tempo · pause at bottom",        sets:4,weighted:false,type:"main",requires:[]},
  "la_sw":     {id:"la_sw_db",   name:"DB Swing",               cue:"two-hand · same mechanics as KB",     sets:3,weighted:true, type:"acc", repsOverride:"15",requires:["dumbbells"]},
  "lb_rdl":    {id:"lb_rdl_db2", name:"DB Romanian Deadlift",   cue:"heavy DBs",                           sets:4,weighted:true, type:"main",requires:["dumbbells"]},
  "lb_sq":     {id:"lb_sq_db",   name:"DB Goblet Squat",        cue:"",                                    sets:3,weighted:true, type:"main",requires:["dumbbells"]},
  "lb_sq_db":  {id:"lb_sq_bw",   name:"Split Squat",            cue:"rear foot elevated · bodyweight",     sets:3,weighted:false,type:"main",requires:[]},
  "lb_tgu":    {id:"lb_tgu_db",  name:"DB Turkish Get-Up",      cue:"3/side",                              sets:1,weighted:true, type:"static",requires:["dumbbells"]},
  "ua_pa":     {id:"ua_pa_iso",  name:"Prone Shoulder W",       cue:"face-down · arms in W · 15 reps",     sets:3,weighted:false,type:"static",requires:[]}
};

/* ---------------- MOVEMENTS (for progress chart; groups same lift across days) ---------------- */
var MOVEMENTS=[
  {key:"fsq",  name:"Front Squat",   ids:["bm_fsq","la_fsq"]},
  {key:"ohp",  name:"Overhead Press",ids:["bm_ohp","ub_ohp"]},
  {key:"inc",  name:"Incline Bench", ids:["bm_inc","ua_inc"]},
  {key:"flat", name:"Flat Bench",    ids:["ub_flat"]},
  {key:"bbrdl",name:"Barbell RDL/DL",ids:["bm_rdl","lb_rdl"]},
  {key:"dbrdl",name:"DB RDL",        ids:["la_rdl"]}
];

/* Maps program exercise IDs to their benchmark counterpart for start-weight hints */
var BENCH_MAP={
  "la_fsq":"bm_fsq",
  "ub_ohp":"bm_ohp",
  "ua_inc":"bm_inc",
  "lb_rdl":"bm_rdl",
  "ua_curl":"bm_curl"
};

/* ---------------- STORAGE (dual: window.storage + localStorage fallback) ---------------- */
var SESS_KEY="hg_sessions_v2";
var DRAFT_KEY="hg_draft_v1";
var PROG_KEY="hg_program_v1";
var SUB_KEY="hg_subs_v1";
var sessions=[]; // in-memory source of truth
var drafts={};
var subState={};
var program={cycle:1,week:1};
var currentDay="benchmark";
var currentMove="fsq";
var restEnd=0,restTotal=90,restTick=null;

function hasWS(){ return (typeof window!=="undefined" && window.storage && typeof window.storage.get==="function"); }

function loadRaw(key){
  return new Promise(function(resolve){
    var done=false;
    function tryLocal(){
      try{ var v=localStorage.getItem(key); resolve(v); }catch(e){ resolve(null); }
    }
    if(hasWS()){
      try{
        window.storage.get(key,false).then(function(r){
          if(done) return; done=true;
          if(r && r.value!=null){ resolve(r.value); } else { tryLocal(); }
        }).catch(function(){ if(done) return; done=true; tryLocal(); });
        return;
      }catch(e){ tryLocal(); return; }
    }
    tryLocal();
  });
}
function saveRaw(key,value){
  return new Promise(function(resolve){
    var any=false, pending=0, settled=false;
    function finish(){ if(!settled){ settled=true; resolve(any); } }
    // localStorage attempt (sync)
    try{ localStorage.setItem(key,value); any=true; }catch(e){}
    if(hasWS()){
      pending++;
      try{
        window.storage.set(key,value,false).then(function(){ any=true; pending--; if(pending<=0) finish(); })
        .catch(function(){ pending--; if(pending<=0) finish(); });
      }catch(e){ pending--; }
    }
    if(pending<=0) finish();
  });
}

/* ---------------- HELPERS ---------------- */
function roundTo5(x){ return Math.round(x/5)*5; }
function est1RM(w,r){ if(!w||!r) return 0; return w*(1+r/30); }
function startW(w,r){ var e=est1RM(w,r); return e?roundTo5(e*0.80):0; }
function todayStr(){ var d=new Date(); var m=("0"+(d.getMonth()+1)).slice(-2); var day=("0"+d.getDate()).slice(-2); return d.getFullYear()+"-"+m+"-"+day; }
function fmtDate(s){ if(!s) return ""; var p=s.split("-"); if(p.length!==3) return s; return p[1]+"/"+p[2]+"/"+p[0].slice(2); }
function lastSessionFor(key){ for(var i=sessions.length-1;i>=0;i--){ if(sessions[i].day===key) return sessions[i]; } return null; }

/* ---------------- SUBSTITUTION + PERIODIZATION HELPERS ---------------- */
function getChain(ex){
  var chain=[ex]; var seen={}; seen[ex.id]=true;
  var cur=SUBS[ex.id];
  while(cur&&!seen[cur.id]){ chain.push(cur); seen[cur.id]=true; cur=SUBS[cur.id]; }
  return chain;
}
function resolveExercise(ex){
  var subId=subState[ex.id];
  if(!subId) return ex;
  var chain=getChain(ex);
  for(var i=0;i<chain.length;i++) if(chain[i].id===subId) return chain[i];
  return ex;
}
function cycleSub(origId){
  var d=dayByKey(currentDay);
  var ex=null;
  for(var i=0;i<d.ex.length;i++) if(d.ex[i].id===origId){ ex=d.ex[i]; break; }
  if(!ex) return;
  var chain=getChain(ex);
  if(chain.length<=1) return;
  var curId=subState[origId]||origId;
  var curIdx=0;
  for(var j=0;j<chain.length;j++) if(chain[j].id===curId){ curIdx=j; break; }
  var nextIdx=(curIdx+1)%chain.length;
  if(nextIdx===0) delete subState[origId]; else subState[origId]=chain[nextIdx].id;
  saveRaw(SUB_KEY,JSON.stringify(subState));
  renderDay();
}
function effectiveSets(ex){
  if(ex.type==="bench"||ex.type==="static") return ex.sets;
  var s=WEEKLY[program.week];
  if(!s) return ex.sets;
  return s[ex.type==="main"?"main":"acc"].sets;
}
function buildNote(ex){
  if(ex.type==="bench"||ex.type==="static") return ex.cue||"";
  var s=WEEKLY[program.week];
  if(!s) return ex.cue||"";
  var scheme=s[ex.type==="main"?"main":"acc"];
  var reps=ex.repsOverride||scheme.reps;
  var note=scheme.sets+" × "+reps;
  if(ex.cue) note+=" · "+ex.cue;
  return note;
}

function getBenchmarkRec(exId){
  var benchId=BENCH_MAP[exId];
  if(!benchId) return null;
  var benchSess=lastSessionFor("benchmark");
  if(!benchSess) return null;
  var sets=benchSess.logs&&benchSess.logs[benchId];
  if(!sets||!sets.length) return null;
  var best=0;
  for(var i=0;i<sets.length;i++){
    var w=parseFloat(sets[i].w)||0,r=parseInt(sets[i].r,10)||0;
    var e=est1RM(w,r); if(e>best) best=e;
  }
  if(!best) return null;
  return {e1rm:Math.round(best), start:roundTo5(best*0.80)};
}

function allTimeBestE1RM(exId){
  var best=0;
  for(var i=0;i<sessions.length;i++){
    var sets=sessions[i].logs&&sessions[i].logs[exId];
    if(!sets) continue;
    for(var j=0;j<sets.length;j++){
      var e=est1RM(parseFloat(sets[j].w)||0,parseInt(sets[j].r,10)||0);
      if(e>best) best=e;
    }
  }
  return best;
}

function startRest(secs){
  secs=secs||90;
  clearInterval(restTick);
  restTotal=secs;
  restEnd=Date.now()+secs*1000;
  var el=document.getElementById('restTimer');
  el.style.borderTopColor='';
  document.getElementById('restTime').style.color='';
  el.classList.add('active');
  tickRest();
  restTick=setInterval(tickRest,500);
}
function stopRest(){
  clearInterval(restTick);
  document.getElementById('restTimer').classList.remove('active');
}
function tickRest(){
  var ms=restEnd-Date.now();
  var secs=Math.max(0,Math.ceil(ms/1000));
  var m=Math.floor(secs/60),s=secs%60;
  document.getElementById('restTime').textContent=m+':'+(s<10?'0':'')+s;
  var pct=Math.max(0,Math.min(100,(ms/(restTotal*1000))*100));
  document.getElementById('restFill').style.width=pct+'%';
  if(secs===0){
    clearInterval(restTick);
    if(navigator.vibrate) navigator.vibrate([300,100,300]);
    var el=document.getElementById('restTimer');
    el.style.borderTopColor='var(--green)';
    document.getElementById('restTime').textContent='Done!';
    document.getElementById('restTime').style.color='var(--green)';
    setTimeout(stopRest,2000);
  }
}

function renderWeekBar(){
  var bar=document.getElementById("weekBar");
  if(!bar) return;
  var ph=PHASES[program.week-1];
  var dots="";
  for(var i=1;i<=4;i++) dots+="<span class='wdot"+(i===program.week?" cur":"")+"'></span>";
  var nextLabel=program.week===4?"New Cycle →":"Week "+(program.week+1)+" →";
  bar.innerHTML=
    "<div class='week-inner'>"+
    "<div class='week-info'>"+
    "<span class='week-num'>Cycle "+program.cycle+" · Week "+program.week+"/4</span>"+
    "<span class='week-phase'>"+ph.name+"</span>"+
    "<span class='week-desc'>"+ph.desc+"</span>"+
    "</div>"+
    "<div class='week-right'>"+
    "<div class='week-dots'>"+dots+"</div>"+
    "<button class='btn ghost week-adv' id='weekAdv'>"+nextLabel+"</button>"+
    "</div></div>";
  var advBtn=document.getElementById("weekAdv");
  if(advBtn) advBtn.addEventListener("click",function(){
    if(program.week===4){program.cycle++;program.week=1;}
    else program.week++;
    saveRaw(PROG_KEY,JSON.stringify(program));
    renderWeekBar();
    renderDay();
  });
}


/* ---------------- PROGRESS CHART ---------------- */
function moveByKey(k){ for(var i=0;i<MOVEMENTS.length;i++) if(MOVEMENTS[i].key===k) return MOVEMENTS[i]; return MOVEMENTS[0]; }

// best estimated 1RM for a movement within one session
function bestE1RM(sess,move){
  var best=0;
  move.ids.forEach(function(id){
    var arr=sess.logs&&sess.logs[id]; if(!arr) return;
    arr.forEach(function(set){
      var w=parseFloat(set.w)||0, r=parseInt(set.r,10)||0;
      var e=est1RM(w,r);
      if(e>best) best=e;
    });
  });
  return best;
}
function seriesFor(move){
  var pts=[];
  sessions.forEach(function(sess){
    var e=bestE1RM(sess,move);
    if(e>0) pts.push({date:sess.date,value:Math.round(e),key:sess.date+sess.id});
  });
  pts.sort(function(a,b){ return a.key<b.key?-1:1; });
  return pts;
}

function buildChartSVG(pts){
  var W=340,H=190,padL=10,padR=14,padT=24,padB=26;
  var innerW=W-padL-padR, innerH=H-padT-padB;
  var vals=pts.map(function(p){return p.value;});
  var lo=Math.min.apply(null,vals), hi=Math.max.apply(null,vals);
  if(lo===hi){ lo=Math.max(0,lo-10); hi=hi+10; }
  else { var rg=hi-lo; lo=Math.max(0,lo-rg*0.18); hi=hi+rg*0.22; }
  var n=pts.length;
  function X(i){ return n>1 ? padL+(i/(n-1))*innerW : padL+innerW/2; }
  function Y(v){ return padT+(1-(v-lo)/(hi-lo))*innerH; }

  var svg="<svg viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' font-family='Barlow,sans-serif'>";
  // gridlines + y labels
  var lines=3;
  for(var g=0;g<=lines;g++){
    var yv=lo+(hi-lo)*(g/lines);
    var yy=Y(yv);
    svg+="<line x1='"+padL+"' y1='"+yy.toFixed(1)+"' x2='"+(W-padR)+"' y2='"+yy.toFixed(1)+"' stroke='#3a4047' stroke-width='1' stroke-dasharray='2 4'/>";
    svg+="<text x='"+(W-padR)+"' y='"+(yy-3).toFixed(1)+"' fill='#9aa1a9' font-size='9' text-anchor='end'>"+Math.round(yv)+"</text>";
  }
  // area + line
  if(n>1){
    var d="";
    pts.forEach(function(p,i){ d+=(i?"L":"M")+X(i).toFixed(1)+" "+Y(p.value).toFixed(1)+" "; });
    // soft fill under line
    var fill=d+"L"+X(n-1).toFixed(1)+" "+(padT+innerH)+" L"+X(0).toFixed(1)+" "+(padT+innerH)+" Z";
    svg+="<path d='"+fill+"' fill='#f2c200' opacity='0.08'/>";
    svg+="<path d='"+d+"' fill='none' stroke='#f2c200' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round'/>";
  }
  // points + labels
  var labelAll = n<=6;
  pts.forEach(function(p,i){
    var x=X(i),y=Y(p.value);
    svg+="<circle cx='"+x.toFixed(1)+"' cy='"+y.toFixed(1)+"' r='4' fill='#15171a' stroke='#f2c200' stroke-width='2.5'/>";
    if(labelAll || i===0 || i===n-1){
      svg+="<text x='"+x.toFixed(1)+"' y='"+(y-9).toFixed(1)+"' fill='#f2c200' font-size='10' font-weight='700' text-anchor='middle'>"+p.value+"</text>";
      svg+="<text x='"+x.toFixed(1)+"' y='"+(H-8)+"' fill='#9aa1a9' font-size='8.5' text-anchor='middle'>"+fmtDate(p.date)+"</text>";
    }
  });
  svg+="</svg>";
  return svg;
}

function renderMoveChips(){
  var box=document.getElementById("moveChips");
  box.innerHTML="";
  MOVEMENTS.forEach(function(m){
    var has=seriesFor(m).length>0;
    var c=document.createElement("button");
    c.className="mchip"+(m.key===currentMove?" active":"")+(has?"":" empty-lift");
    c.textContent=m.name;
    c.addEventListener("click",function(){ currentMove=m.key; renderProgress(); });
    box.appendChild(c);
  });
}

function renderProgress(){
  renderMoveChips();
  var move=moveByKey(currentMove);
  var pts=seriesFor(move);
  var stats=document.getElementById("chartStats");
  var area=document.getElementById("chartArea");
  if(pts.length===0){
    stats.innerHTML="";
    area.innerHTML="<div class='chart-empty'>No "+move.name+" data yet. Log a few sets with weight × reps and your estimated 1RM trend appears here.</div>";
    return;
  }
  var latest=pts[pts.length-1].value, first=pts[0].value;
  var best=Math.max.apply(null,pts.map(function(p){return p.value;}));
  var diff=latest-first;
  var pct=first?Math.round((diff/first)*100):0;
  var cls=diff>0?"pos":(diff<0?"neg":"");
  var sign=diff>0?"+":"";
  stats.innerHTML=
    "<div class='stat'><div class='k'>Latest e1RM</div><div class='v'>"+latest+"<small> lb</small></div></div>"+
    "<div class='stat'><div class='k'>Best e1RM</div><div class='v'>"+best+"<small> lb</small></div></div>"+
    "<div class='stat'><div class='k'>Change ("+pts.length+" sessions)</div><div class='v "+cls+"'>"+sign+diff+"<small> lb ("+sign+pct+"%)</small></div></div>";
  area.innerHTML=buildChartSVG(pts);
  renderBWChart();
}

function renderBWChart(){
  var card=document.getElementById('bwCard');
  var stats=document.getElementById('bwStats');
  var area=document.getElementById('bwChartArea');
  if(!card||!stats||!area) return;
  var pts=[];
  sessions.forEach(function(s){
    var v=parseFloat(s.bw); if(v>0) pts.push({date:s.date,value:v,key:s.date+s.id});
  });
  pts.sort(function(a,b){ return a.key<b.key?-1:1; });
  if(!pts.length){ card.style.display='none'; return; }
  card.style.display='';
  var latest=pts[pts.length-1].value, first=pts[0].value;
  var diff=Math.round((latest-first)*10)/10;
  var sign=diff>0?'+':'', cls=diff>0?'pos':(diff<0?'neg':'');
  stats.innerHTML=
    "<div class='stat'><div class='k'>Current</div><div class='v'>"+latest+"<small> lb</small></div></div>"+
    "<div class='stat'><div class='k'>Change</div><div class='v "+cls+"'>"+sign+diff+"<small> lb</small></div></div>";
  area.innerHTML=pts.length>=2?buildChartSVG(pts):"<div class='chart-empty'>Add bodyweight in one more session to see the trend.</div>";
}

function renderStreak(){
  var grid=document.getElementById('streakGrid');
  var lead=document.getElementById('streakLead');
  if(!grid) return;

  var dateMap={};
  sessions.forEach(function(s){ if(s.date) dateMap[s.date]=true; });

  var today=new Date();
  var todayDs=todayStr();

  var streak=0;
  for(var w=0;w<52;w++){
    var weekHas=false;
    for(var d=0;d<7;d++){
      var dt=new Date(today);
      dt.setDate(today.getDate()-today.getDay()-w*7+d);
      var ds=dt.getFullYear()+'-'+('0'+(dt.getMonth()+1)).slice(-2)+'-'+('0'+dt.getDate()).slice(-2);
      if(dateMap[ds]){weekHas=true;break;}
    }
    if(!weekHas&&w===0) continue;
    if(!weekHas) break;
    streak++;
  }

  if(lead){
    if(!sessions.length) lead.textContent='No workouts logged yet.';
    else if(streak===0) lead.textContent='No workout logged this week — keep the streak alive!';
    else lead.textContent=streak+' week'+(streak===1?' streak':'s in a row')+'  ·  Last 16 weeks';
  }

  var WEEKS=16;
  var DAY_LABELS=['S','M','T','W','T','F','S'];
  var labelsHtml='<div class="streak-week-labels"><div class="streak-wk-lbl"></div>';
  for(var wi=WEEKS-1;wi>=0;wi--){
    var wdt=new Date(today);
    wdt.setDate(today.getDate()-today.getDay()-wi*7);
    var wLabel=(wdt.getMonth()+1)+'/'+wdt.getDate();
    labelsHtml+='<div class="streak-wk-lbl">'+wLabel+'</div>';
  }
  labelsHtml+='</div>';

  var calHtml='<div style="display:flex;gap:3px;align-items:start"><div style="display:grid;grid-template-rows:repeat(7,12px);gap:3px;margin-right:2px">';
  for(var dl=0;dl<7;dl++) calHtml+='<div style="width:12px;height:12px;display:flex;align-items:center;justify-content:center;font-size:.48rem;color:var(--txt-dim)">'+DAY_LABELS[dl]+'</div>';
  calHtml+='</div><div class="streak-cal">';
  for(var wi2=WEEKS-1;wi2>=0;wi2--){
    for(var di=0;di<7;di++){
      var dt2=new Date(today);
      dt2.setDate(today.getDate()-today.getDay()-wi2*7+di);
      var ds2=dt2.getFullYear()+'-'+('0'+(dt2.getMonth()+1)).slice(-2)+'-'+('0'+dt2.getDate()).slice(-2);
      var cls2='s-day'+(dateMap[ds2]?' has-log':'')+(ds2===todayDs?' today':'');
      calHtml+='<div class="'+cls2+'"></div>';
    }
  }
  calHtml+='</div></div>';
  grid.innerHTML=labelsHtml+calHtml;
}

/* ---------------- RENDER ---------------- */
var picker=document.getElementById("picker");
DAYS.forEach(function(d){
  var b=document.createElement("button");
  b.className="dbtn"+(d.key===currentDay?" active":"");
  b.setAttribute("data-key",d.key);
  b.innerHTML=d.short+"<small>"+d.tag+"</small>";
  b.addEventListener("click",function(){ selectDay(d.key); });
  picker.appendChild(b);
});

function selectDay(key){
  currentDay=key;
  var btns=picker.querySelectorAll(".dbtn");
  btns.forEach(function(b){ b.classList.toggle("active", b.getAttribute("data-key")===key); });
  renderDay();
}

// Chrome sticky hit-testing workaround: clicks on a composited sticky element
// can land on the wrong layer. Run during capture so we see the raw event before
// any overlay steals it; use visual bounding rects (not layout positions) to
// route the click to the correct tab.
document.addEventListener('click', function(e){
  var pi=document.getElementById('picker');
  if(!pi) return;
  var pr=pi.getBoundingClientRect();
  if(e.clientY<pr.top||e.clientY>pr.bottom||e.clientX<pr.left||e.clientX>pr.right) return;
  // If a .dbtn (or its child) was already the hit target, let the direct handler run.
  var t=e.target;
  while(t&&t!==pi){if(t.classList&&t.classList.contains('dbtn')) return; t=t.parentNode;}
  // Click landed inside the picker strip but missed a button — find by X coordinate.
  var btns=pi.querySelectorAll('.dbtn');
  for(var i=0;i<btns.length;i++){
    var r=btns[i].getBoundingClientRect();
    if(e.clientX>=r.left&&e.clientX<=r.right){selectDay(btns[i].getAttribute('data-key')); break;}
  }
}, true);

var draftTimer=null;
document.getElementById("exContainer").addEventListener("input",function(){
  updateCalc();
  clearTimeout(draftTimer);
  draftTimer=setTimeout(saveDraft,400);
});
document.getElementById("exContainer").addEventListener("click",function(e){
  if(e.target.classList.contains("btn-rest-row")){ startRest(90); return; }
  if(e.target.classList.contains("btn-add-set")){
    addSetRow(e.target.getAttribute("data-ex"));
  }
  if(e.target.classList.contains("btn-sub")){
    cycleSub(e.target.getAttribute("data-orig"));
  }
});
document.getElementById('restAdd').addEventListener('click',function(){ restEnd+=30000; restTotal+=30; });
document.getElementById('restSkip').addEventListener('click',stopRest);
document.getElementById("sessDate").addEventListener("change",function(){
  clearTimeout(draftTimer); draftTimer=setTimeout(saveDraft,400);
});
document.getElementById("sessBW").addEventListener("input",function(){
  clearTimeout(draftTimer); draftTimer=setTimeout(saveDraft,400);
});

function renderWarmup(d){
  var w=WARMUPS[d.warm];
  document.getElementById("warmTitle").innerHTML="Dynamic Warm-Up · <b>"+w.label+"</b>";
  var html="<ul class='warm-list'>";
  w.items.forEach(function(it){ html+="<li><span>"+it[0]+"</span><span class='reps'>"+it[1]+"</span></li>"; });
  html+="</ul><div class='ramp'>"+RAMP+"</div>";
  document.getElementById("warmBody").innerHTML=html;
}

function renderDay(){
  var d=dayByKey(currentDay);
  document.getElementById("dayLabel").textContent=d.label;
  document.getElementById("dayName").textContent=d.name;
  document.getElementById("dayLead").textContent=d.lead||"Log each set below — last session's numbers are pre-filled as your starting point.";
  document.getElementById("dayLead").style.display=(d.lead||!d.isBench)?"block":"block";
  renderWarmup(d);

  var draft=drafts[d.key]||null;
  document.getElementById("sessDate").value=(draft&&draft.date)||todayStr();
  document.getElementById("sessBW").value=(draft&&draft.bw)||"";

  var last=lastSessionFor(d.key);
  var cont=document.getElementById("exContainer");
  cont.innerHTML="";

  d.ex.forEach(function(ex){
    var resolved=resolveExercise(ex);
    var prev=last&&last.logs&&last.logs[ex.id]?last.logs[ex.id]:null;
    var draftSets=draft&&draft.logs&&draft.logs[ex.id]?draft.logs[ex.id]:null;
    var box=document.createElement("div");
    box.className="ex";
    var schemeCount=effectiveSets(resolved);
    var setCount=draftSets?Math.max(draftSets.length,schemeCount):schemeCount;
    var rows="";
    for(var s=0;s<setCount;s++){
      var pv=draftSets?(draftSets[s]||{}):(prev&&prev[s]?prev[s]:{});
      var wv=(pv.w!=null&&pv.w!=="")?pv.w:"";
      var rv=(pv.r!=null&&pv.r!=="")?pv.r:"";
      var label=setCount===1?"Set":("Set "+(s+1));
      var wInput=resolved.weighted
        ?"<input type='number' inputmode='decimal' data-ex='"+ex.id+"' data-set='"+s+"' data-f='w' value='"+wv+"' placeholder='wt'><span class='unit'>lb</span>"
        :"<input type='number' inputmode='decimal' data-ex='"+ex.id+"' data-set='"+s+"' data-f='w' value='"+wv+"' placeholder='+0'><span class='unit'>lb</span>";
      rows+="<div class='set-row'><span class='set-tag'>"+label+"</span>"+wInput+
            "<input type='number' inputmode='numeric' data-ex='"+ex.id+"' data-set='"+s+"' data-f='r' value='"+rv+"' placeholder='reps'><span class='unit'>rep</span>"+
            "<button class='btn-rest-row' type='button' title='Start rest timer'>⏱</button></div>";
    }
    var lastTxt="";
    if(prev){
      var parts=[];
      for(var k=0;k<prev.length;k++){ if(prev[k]&&(prev[k].w||prev[k].r)){ parts.push((prev[k].w?prev[k].w+"×":"")+(prev[k].r||"")); } }
      if(parts.length) lastTxt="Last: "+parts.join(", ");
    }
    var benchRec=getBenchmarkRec(ex.id);
    var chain=getChain(ex);
    var subBtn="";
    if(chain.length>1){
      var curSubId=subState[ex.id]||ex.id;
      var curIdx=0;
      for(var si=0;si<chain.length;si++) if(chain[si].id===curSubId){ curIdx=si; break; }
      var btnLbl=curIdx===0?"↻ Sub":"↻ Alt "+curIdx+"/"+(chain.length-1);
      subBtn="<button class='btn-sub"+(curIdx>0?" active":"")+"' data-orig='"+ex.id+"'>"+btnLbl+"</button>";
    }
    var benchLine=benchRec
      ?"<div class='ex-bench'>Benchmark → start at ~"+benchRec.start+" lb (e1RM ~"+benchRec.e1rm+" lb)</div>"
      :"";
    box.innerHTML=
      "<div class='ex-head'><span class='ex-title'>"+resolved.name+"</span>"+subBtn+"</div>"+
      "<div class='ex-note'>"+buildNote(resolved)+"</div>"+
      benchLine+
      "<div class='ex-last'>"+lastTxt+"</div>"+
      rows+
      "<button class='btn-add-set' data-ex='"+ex.id+"'>+ Add Set</button>"+
      (ex.calc?"<div class='calc' id='calc_"+ex.id+"'></div>":"");
    cont.appendChild(box);
  });

  updateCalc();
  renderWeekBar();
  renderHistory();
  renderProgress();
}

function updateCalc(){
  var d=dayByKey(currentDay);
  if(!d.isBench) return;
  d.ex.forEach(function(ex){
    if(!ex.calc) return;
    var el=document.getElementById("calc_"+ex.id);
    if(!el) return;
    var wEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='0'][data-f='w']");
    var rEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='0'][data-f='r']");
    var w=parseFloat(wEl&&wEl.value)||0, r=parseInt(rEl&&rEl.value,10)||0;
    if(w>0&&r>0){
      el.innerHTML="<div class='stat'><div class='k'>Est. 1-Rep Max</div><div class='v'>"+Math.round(est1RM(w,r))+"<small> lb</small></div></div>"+
                   "<div class='stat'><div class='k'>Start program at</div><div class='v'>"+startW(w,r)+"<small> lb</small></div></div>";
    } else el.innerHTML="";
  });
}

function collectSession(){
  var d=dayByKey(currentDay);
  var logs={};
  d.ex.forEach(function(ex){
    var arr=[];
    var has=false;
    var count=document.querySelectorAll("input[data-ex='"+ex.id+"'][data-f='w']").length;
    for(var s=0;s<count;s++){
      var wEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='"+s+"'][data-f='w']");
      var rEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='"+s+"'][data-f='r']");
      var w=wEl?wEl.value:"", r=rEl?rEl.value:"";
      arr.push({w:w,r:r});
      if(w!==""||r!=="") has=true;
    }
    if(has) logs[ex.id]=arr;
  });
  return {
    id:"s"+Date.now(),
    date:document.getElementById("sessDate").value||todayStr(),
    bw:document.getElementById("sessBW").value||"",
    day:d.key, dayName:d.name,
    logs:logs
  };
}

function renderHistory(){
  var c=document.getElementById("histContainer");
  if(!sessions.length){ c.innerHTML="<div class='empty'>No workouts logged yet. Finish one above and tap Save.</div>"; return; }
  c.innerHTML="";
  var sorted=sessions.slice().sort(function(a,b){ return (b.date+b.id).localeCompare(a.date+a.id); });
  sorted.forEach(function(sess){
    var d=dayByKey(sess.day);
    var det=document.createElement("details"); det.className="hist-item";
    var nEx=Object.keys(sess.logs||{}).length;
    var body="";
    d.ex.forEach(function(ex){
      var arr=sess.logs&&sess.logs[ex.id]; if(!arr) return;
      var parts=[];
      for(var k=0;k<arr.length;k++){ if(arr[k].w||arr[k].r) parts.push((arr[k].w?arr[k].w+"×":"")+(arr[k].r||"")); }
      var prFlag=(sess.prs&&sess.prs.indexOf(ex.id)>=0)?"<span class='pr-badge'>PR</span>":"";
      if(parts.length) body+="<div class='hist-ex'><span class='n'>"+ex.name+prFlag+"</span> — <span class='s'>"+parts.join(", ")+"</span></div>";
    });
    det.innerHTML=
      "<summary><span><span class='hist-d'><span>"+d.short+"</span> · "+fmtDate(sess.date)+"</span><div class='hist-meta'>"+nEx+" exercises"+(sess.bw?" · BW "+sess.bw+"lb":"")+"</div></span><span class='chev'>+</span></summary>"+
      "<div class='hist-body'>"+body+"<button class='del' data-id='"+sess.id+"'>Delete this entry</button></div>";
    c.appendChild(det);
  });
  c.querySelectorAll(".del").forEach(function(b){
    b.addEventListener("click",function(){
      var id=b.getAttribute("data-id");
      sessions=sessions.filter(function(s){ return s.id!==id; });
      persist(); renderDay(); notifyChanged();
    });
  });
  renderStreak();
}

/* ---------------- ACTIONS ---------------- */
function flash(el,msg,kind){
  el.textContent=msg; el.className="note "+(kind||"ok")+" show";
  setTimeout(function(){ el.classList.remove("show"); },2400);
}
function persist(){ return saveRaw(SESS_KEY,JSON.stringify(sessions)); }

document.getElementById("saveSession").addEventListener("click",function(){
  var sess=collectSession();
  if(Object.keys(sess.logs).length===0){ flash(document.getElementById("saveNote"),"Nothing logged yet","err"); return; }
  var prNames=[];
  var d=dayByKey(currentDay);
  d.ex.forEach(function(ex){
    if(!ex.weighted) return;
    var sets=sess.logs[ex.id]; if(!sets||!sets.length) return;
    var newBest=0;
    sets.forEach(function(s){ var e=est1RM(parseFloat(s.w)||0,parseInt(s.r,10)||0); if(e>newBest) newBest=e; });
    if(newBest>0 && newBest>allTimeBestE1RM(ex.id)){ prNames.push(resolveExercise(ex).name); sess.prs=sess.prs||[]; sess.prs.push(ex.id); }
  });
  sessions.push(sess);
  delete drafts[currentDay];
  saveRaw(DRAFT_KEY,JSON.stringify(drafts));
  persist().then(function(ok){
    if(ok) flash(document.getElementById("saveNote"), prNames.length?"Saved · PR: "+prNames.join(", ")+"!":"Workout saved ✓","ok");
    else flash(document.getElementById("saveNote"),"Saved on page, but storage failed — Copy Backup!","err");
    setStatus(); renderHistory(); renderProgress();
    notifyChanged();
  });
});

document.getElementById("copyBtn").addEventListener("click",function(){
  var data=JSON.stringify(sessions);
  var box=document.getElementById("backupBox");
  box.value=data;
  var note=document.getElementById("backupNote");
  try{
    box.select();
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(data).then(function(){ flash(note,"Copied ✓","ok"); }).catch(function(){ flash(note,"Selected — copy manually","ok"); });
    } else { document.execCommand&&document.execCommand("copy"); flash(note,"Copied ✓","ok"); }
  }catch(e){ flash(note,"Select the text & copy","ok"); }
});

document.getElementById("restoreBtn").addEventListener("click",function(){
  var note=document.getElementById("backupNote");
  var raw=document.getElementById("backupBox").value.trim();
  if(!raw){ flash(note,"Paste backup text first","err"); return; }
  try{
    var parsed=JSON.parse(raw);
    if(!Array.isArray(parsed)) throw 0;
    sessions=parsed; persist().then(function(){ flash(note,"Restored ✓","ok"); setStatus(); renderDay(); notifyChanged(); });
  }catch(e){ flash(note,"That doesn't look like valid backup data","err"); }
});

function setStatus(){
  var st=document.getElementById("status");
  var mode=hasWS()?"device storage":"browser storage";
  st.innerHTML="<b>"+sessions.length+"</b> workout"+(sessions.length===1?"":"s")+" logged · saving to "+mode+".";
}

/* ---------------- SYNC BRIDGE (consumed by js/sync.js) ----------------
   The app keeps `sessions` private inside this IIFE. To let the optional
   sync module read/merge data and trigger a re-render, we expose a tiny,
   stable API on window.HG and fire a "hg:changed" event after local edits. */
function notifyChanged(){ try{ window.dispatchEvent(new CustomEvent("hg:changed")); }catch(e){} }

function mergeIncoming(incoming){
  if(!Array.isArray(incoming)) return 0;
  var byId={};
  sessions.forEach(function(s){ if(s&&s.id) byId[s.id]=s; });   // local wins on id clash
  var added=0;
  incoming.forEach(function(s){ if(s&&s.id&&!byId[s.id]){ byId[s.id]=s; added++; } });
  var merged=Object.keys(byId).map(function(k){ return byId[k]; });
  merged.sort(function(a,b){ return (a.date+a.id)<(b.date+b.id)?-1:1; });
  sessions=merged;
  return added;
}

window.HG={
  storageKey:SESS_KEY,
  getSessions:function(){ return sessions.slice(); },
  count:function(){ return sessions.length; },
  // merge an incoming array of sessions into local, persist, re-render.
  // returns a Promise resolving to the number of NEW sessions added.
  merge:function(incoming){
    var added=mergeIncoming(incoming);
    return persist().then(function(){ setStatus(); renderDay(); return added; });
  }
};

function saveDraft(){
  var d=dayByKey(currentDay);
  var logs={};
  d.ex.forEach(function(ex){
    var count=document.querySelectorAll("input[data-ex='"+ex.id+"'][data-f='w']").length;
    var arr=[];
    for(var s=0;s<count;s++){
      var wEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='"+s+"'][data-f='w']");
      var rEl=document.querySelector("input[data-ex='"+ex.id+"'][data-set='"+s+"'][data-f='r']");
      arr.push({w:wEl?wEl.value:"",r:rEl?rEl.value:""});
    }
    logs[ex.id]=arr;
  });
  drafts[currentDay]={date:document.getElementById("sessDate").value,bw:document.getElementById("sessBW").value,logs:logs};
  saveRaw(DRAFT_KEY,JSON.stringify(drafts));
}

function addSetRow(exId){
  var d=dayByKey(currentDay);
  var ex=null;
  for(var i=0;i<d.ex.length;i++) if(d.ex[i].id===exId){ ex=d.ex[i]; break; }
  if(!ex) return;
  var s=document.querySelectorAll("input[data-ex='"+exId+"'][data-f='w']").length;
  var label="Set "+(s+1);
  var wInput=ex.weighted
    ?"<input type='number' inputmode='decimal' data-ex='"+exId+"' data-set='"+s+"' data-f='w' placeholder='wt'><span class='unit'>lb</span>"
    :"<input type='number' inputmode='decimal' data-ex='"+exId+"' data-set='"+s+"' data-f='w' placeholder='+0'><span class='unit'>lb</span>";
  var rowHtml="<div class='set-row'><span class='set-tag'>"+label+"</span>"+wInput+
    "<input type='number' inputmode='numeric' data-ex='"+exId+"' data-set='"+s+"' data-f='r' placeholder='reps'><span class='unit'>rep</span>"+
    "<button class='btn-rest-row' type='button' title='Start rest timer'>⏱</button></div>";
  var btn=document.querySelector(".btn-add-set[data-ex='"+exId+"']");
  if(btn) btn.insertAdjacentHTML("beforebegin",rowHtml);
  var newW=document.querySelector("input[data-ex='"+exId+"'][data-set='"+s+"'][data-f='w']");
  if(newW) newW.focus();
}

/* ---------------- INIT ---------------- */
Promise.all([
  loadRaw(SESS_KEY).then(function(raw){
    if(raw){ try{ var p=JSON.parse(raw); if(Array.isArray(p)) sessions=p; }catch(e){} }
  }).catch(function(){}),
  loadRaw(DRAFT_KEY).then(function(raw){
    if(raw){ try{ var p=JSON.parse(raw); if(p&&typeof p==="object"&&!Array.isArray(p)) drafts=p; }catch(e){} }
  }).catch(function(){}),
  loadRaw(SUB_KEY).then(function(raw){
    if(raw){ try{ var p=JSON.parse(raw); if(p&&typeof p==="object"&&!Array.isArray(p)) subState=p; }catch(e){} }
  }).catch(function(){}),
  loadRaw(PROG_KEY).then(function(raw){
    if(raw){ try{ var p=JSON.parse(raw); if(p&&typeof p==="object") program=Object.assign(program,p); }catch(e){} }
  }).catch(function(){})
]).then(function(){
  setStatus();
  renderWeekBar();
  renderDay();
}).catch(function(){ setStatus(); renderWeekBar(); renderDay(); });

})();
