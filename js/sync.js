/* ============================================================
   SYNC MODULE  (js/sync.js)
   ------------------------------------------------------------
   Optional cross-device sync. Talks to the backend at window.SYNC_API
   (see js/config.js) using a "sync code" the user shares between
   devices. The code is the only secret — anyone with it can read/write
   that bucket, which is fine for a personal workout log. Data is stored
   in the cloud as { sessions:[...], program:{...}, updated:<ms> }.

   Merge strategy: union by session id (append-only; no data loss).
   Program (week/cycle state) is synced as-is — last push wins.
   Deletes do NOT propagate across devices in this version — delete on
   each device, or clear the cloud bucket. See CLAUDE.md.
   Depends on window.HG (exposed by app.js) and elements in index.html.
   ============================================================ */
(function(){
"use strict";

var CODE_KEY="hg_sync_code";
var AUTO_KEY="hg_sync_auto";
var els={};

function $(id){ return document.getElementById(id); }
function api(){ return (window.SYNC_API||"").replace(/\/+$/,""); }
function configured(){ return !!api(); }

function getCode(){ try{ return localStorage.getItem(CODE_KEY)||""; }catch(e){ return ""; } }
function setCode(c){ try{ localStorage.setItem(CODE_KEY,c); }catch(e){} }
function getAuto(){ try{ return localStorage.getItem(AUTO_KEY)==="1"; }catch(e){ return false; } }
function setAuto(v){ try{ localStorage.setItem(AUTO_KEY, v?"1":"0"); }catch(e){} }

function genCode(){
  var chars="ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  var s=""; for(var i=0;i<8;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
function validCode(c){ return /^[A-Za-z0-9]{6,32}$/.test(c); }

function flash(msg,kind){
  var n=els.note; if(!n) return;
  n.textContent=msg; n.className="note "+(kind||"ok")+" show";
  setTimeout(function(){ n.classList.remove("show"); },2800);
}

function unionById(a,b){
  var byId={};
  (a||[]).forEach(function(s){ if(s&&s.id) byId[s.id]=s; });
  (b||[]).forEach(function(s){ if(s&&s.id&&!byId[s.id]) byId[s.id]=s; });
  return Object.keys(byId).map(function(k){ return byId[k]; });
}

// GET cloud data; resolves to {sessions:[], program:null|{}}
function cloudGet(code){
  return fetch(api()+"/data/"+encodeURIComponent(code),{method:"GET"})
    .then(function(res){
      if(res.status===404) return {sessions:[],program:null};
      if(!res.ok) throw new Error("HTTP "+res.status);
      return res.json().then(function(j){
        var sessions=Array.isArray(j)?j:(j&&j.sessions)||[];
        var prog=(j&&j.program&&typeof j.program==='object')?j.program:null;
        return {sessions:sessions,program:prog};
      });
    });
}
function cloudPut(code,sessions,prog){
  return fetch(api()+"/data/"+encodeURIComponent(code),{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sessions:sessions,program:prog||null,updated:Date.now()})
  }).then(function(res){ if(!res.ok) throw new Error("HTTP "+res.status); return true; });
}

function ensureReady(){
  if(!configured()){ flash("Sync isn't set up yet — see the setup steps below.","err"); return null; }
  var code=(els.code&&els.code.value||"").trim();
  if(!validCode(code)){ flash("Enter a valid code (6+ letters/numbers) or tap Generate.","err"); return null; }
  setCode(code);
  return code;
}

function doPull(){
  var code=ensureReady(); if(!code) return Promise.resolve();
  flash("Pulling…","ok");
  return cloudGet(code).then(function(remote){
    return window.HG.merge(remote.sessions).then(function(added){
      if(remote.program && window.HG.applyProgram) window.HG.applyProgram(remote.program);
      flash(added>0 ? ("Pulled — "+added+" new workout"+(added===1?"":"s")+" merged.") : "Up to date — nothing new in the cloud.","ok");
      refreshStatus();
    });
  }).catch(function(e){ flash("Pull failed ("+e.message+").","err"); });
}

function doPush(){
  var code=ensureReady(); if(!code) return Promise.resolve();
  flash("Syncing…","ok");
  // pull-merge-put so we never clobber the other device's data
  return cloudGet(code).then(function(remote){
    var local=window.HG.getSessions();
    var union=unionById(local,remote.sessions);
    var prog=window.HG.getProgram?window.HG.getProgram():null;
    return cloudPut(code,union,prog).then(function(){
      return window.HG.merge(remote.sessions).then(function(added){
        if(remote.program && window.HG.applyProgram) window.HG.applyProgram(remote.program);
        flash("Synced — "+union.length+" workouts in the cloud"+(added>0?(", "+added+" pulled down"):"")+".","ok");
        refreshStatus();
      });
    });
  }).catch(function(e){ flash("Sync failed ("+e.message+").","err"); });
}

var autoTimer=null;
function scheduleAuto(){
  if(!getAuto()||!configured()) return;
  if(!validCode(getCode())) return;
  if(autoTimer) clearTimeout(autoTimer);
  autoTimer=setTimeout(function(){ doPush(); }, 2500); // debounce after edits
}

function refreshStatus(){
  if(!els.status) return;
  if(!configured()){
    els.status.innerHTML="Local only — not connected to a sync backend.";
    return;
  }
  var code=getCode();
  els.status.innerHTML = code
    ? "Connected · code <b>"+code+"</b> · "+(getAuto()?"auto-sync on":"manual sync")
    : "Backend ready — generate or enter a code to link this device.";
}

function render(){
  els.code=$("syncCode"); els.note=$("syncNote"); els.status=$("syncStatus");
  els.auto=$("syncAuto"); els.setup=$("syncSetup");

  if(!els.code) return; // section not present

  els.code.value=getCode();
  if(els.auto) els.auto.checked=getAuto();

  // Hide setup instructions once configured
  if(els.setup) els.setup.style.display = configured() ? "none" : "block";

  $("syncGen") && $("syncGen").addEventListener("click",function(){
    els.code.value=genCode(); setCode(els.code.value); refreshStatus();
    flash("New code generated. Enter the SAME code on your other device.","ok");
  });
  $("syncPush") && $("syncPush").addEventListener("click",doPush);
  $("syncPull") && $("syncPull").addEventListener("click",doPull);
  els.code.addEventListener("change",function(){ setCode(els.code.value.trim()); refreshStatus(); });
  els.auto && els.auto.addEventListener("change",function(){
    setAuto(els.auto.checked); refreshStatus();
    flash(els.auto.checked?"Auto-sync on — pushes shortly after each saved workout.":"Auto-sync off.","ok");
  });

  // auto-sync after local changes
  window.addEventListener("hg:changed",scheduleAuto);

  // silent pull on page load so every device gets the latest data automatically
  if(getAuto() && configured()){
    var savedCode=getCode();
    if(validCode(savedCode)){
      setTimeout(function(){
        cloudGet(savedCode).then(function(remote){
          return window.HG.merge(remote.sessions).then(function(added){
            if(remote.program && window.HG.applyProgram) window.HG.applyProgram(remote.program);
            if(added>0) flash("Auto-synced — "+added+" new workout"+(added===1?"":"s")+" pulled.","ok");
            refreshStatus();
          });
        }).catch(function(){}); // silent fail — don't disrupt the user
      },1200);
    }
  }

  refreshStatus();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",render);
else render();

})();
