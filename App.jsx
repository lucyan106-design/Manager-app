import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const fmt      = (n)  => `\u00a3${Math.round(n).toLocaleString("en-GB")}`;
const allocVal = (s)  => Math.round(s.total * (1 - (s.profitPct + s.overheadPct) / 100));
const earnedVal= (s)  => Math.round(allocVal(s) * s.completed / 100);
const pctTag   = (p)  => p < 70 ? "green" : p < 90 ? "amber" : "red";
const ragDot   = (p)  => p < 70 ? "🟢" : p < 90 ? "🟡" : "🔴";
const fileIcon = (name) => {
  const ext = (name||"").split(".").pop().toLowerCase();
  if(["jpg","jpeg","png","webp"].includes(ext)) return "🖼️";
  if(["mp4","mov","avi"].includes(ext))         return "🎬";
  if(["pdf"].includes(ext))                     return "📄";
  if(["eml","msg"].includes(ext))               return "📧";
  return "📎";
};

// Week helpers (demo base = Mon 9 Jun 2026)
const BASE_MON = new Date(2026,5,9);
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function weekMonday(off=0){ const d=new Date(BASE_MON); d.setDate(d.getDate()+off*7); return d; }
function weekDates(off=0){ const m=weekMonday(off); return Array.from({length:6},(_,i)=>{ const d=new Date(m); d.setDate(d.getDate()+i); return d; }); }
function weekKey(off=0){ const d=weekMonday(off); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtDate(d){ return `${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function dateToWK(ds){ const d=new Date(ds); const di=(d.getDay()+6)%7; const m=new Date(d); m.setDate(d.getDate()-di); return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`; }
function dateToDI(ds){ return (new Date(ds).getDay()+6)%7; }  // 0=Mon…5=Sat

// ─────────────────────────────────────────────────────────
//  COLOURS
// ─────────────────────────────────────────────────────────
const N="#0F1F35",NM="#1A3A5C",OR="#E07B35",BG="#EEF2F7";
const TX="#1E293B",MU="#64748B",BD="#E2E8F0";
const GN="#10B981",AM="#F59E0B",RD="#EF4444";
const RAG_BG  ={green:"#ECFDF5",amber:"#FFFBEB",red:"#FEF2F2"};
const RAG_BD  ={green:"#A7F3D0",amber:"#FDE68A",red:"#FCA5A5"};
const RAG_COL ={green:GN,       amber:AM,        red:RD};
const TRADE_COL={"Management":NM,"Structural":OR,"General":GN,"Plant":AM,"Mechanical":"#3B82F6","Electrical":"#8B5CF6","Masonry":"#78716C","Carpentry":"#14B8A6"};

// ─────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────
const MANAGER={name:"James Mitchell",initials:"JM"};
const CATS=["Materials","Labour","Plant & Equipment","Subcontract","Preliminaries","Other"];
const TODAY="2026-06-13";

const SITES=[
  {id:1,name:"Highfield Business Park",    client:"Nexus Developments Ltd", address:"Highfield Rd, Aldershot GU11",status:"active",  appStatus:"draft",    start:"Jan 2025",end:"Aug 2025"},
  {id:2,name:"Riverside Apartments \u2014 Block C",client:"Riverside Living PLC",address:"Riverside Dr, Farnham GU9",  status:"active",  appStatus:"submitted",start:"Mar 2025",end:"Nov 2025"},
  {id:3,name:"Sainsbury\u2019s Refurb \u2014 Fleet",client:"Sainsbury\u2019s Supermarkets",address:"Fleet Rd, Fleet GU51",       status:"complete",appStatus:"finalised",start:"Nov 2024",end:"Apr 2025"},
];

const INIT_SCOPES={
  1:[
    {id:1,name:"Groundworks & Drainage",  total:95000, profitPct:12,overheadPct:8, completed:100},
    {id:2,name:"Structural Steel Frame",  total:142000,profitPct:15,overheadPct:7, completed:85},
    {id:3,name:"Cladding & Curtain Wall", total:118000,profitPct:10,overheadPct:9, completed:40},
    {id:4,name:"Electrical First Fix",    total:67000, profitPct:12,overheadPct:8, completed:60},
    {id:5,name:"Mechanical Services",     total:63000, profitPct:11,overheadPct:9, completed:20},
  ],
  2:[
    {id:6,name:"Demolition & Strip Out",  total:45000, profitPct:10,overheadPct:8, completed:100},
    {id:7,name:"RC Frame Works",          total:120000,profitPct:14,overheadPct:8, completed:55},
    {id:8,name:"Brickwork & Masonry",     total:88000, profitPct:12,overheadPct:7, completed:20},
    {id:9,name:"Roof & Waterproofing",    total:67000, profitPct:11,overheadPct:9, completed:0},
  ],
  3:[
    {id:10,name:"Strip Out & Demolition", total:32000, profitPct:8, overheadPct:7, completed:100},
    {id:11,name:"M&E Services",           total:78000, profitPct:10,overheadPct:8, completed:100},
    {id:12,name:"Finishes & Fittings",    total:68000, profitPct:9, overheadPct:8, completed:100},
  ],
};

const INIT_EXP=[
  {id:1,siteId:1,scopeId:2,desc:"Steel delivery \u2014 Phase 1",   amount:14800,date:"12 May 2025",category:"Materials",        files:["invoice_steel.pdf"], status:"approved"},
  {id:2,siteId:1,scopeId:4,desc:"Cable drum & conduit supply",      amount:3400, date:"20 May 2025",category:"Materials",        files:["receipt_elec.jpg"],  status:"pending"},
  {id:3,siteId:2,scopeId:7,desc:"Pump hire \u2014 concrete pour",   amount:1650, date:"30 Apr 2025",category:"Plant & Equipment",files:["hire_invoice.pdf"],  status:"approved"},
];

const INIT_VAR=[
  {id:1,siteId:1,ref:"VAR-001",title:"Additional waterproof membrane to basement",desc:"Client requested upgraded spec following high water table survey.",amount:8500,status:"pending", files:["survey_report.pdf","site_photo_001.jpg"]},
  {id:2,siteId:1,ref:"VAR-002",title:"Revised escape route \u2014 Level 2",     desc:"Building control requirement following L2 design change.",        amount:3200,status:"approved",files:["bcf_email.eml","revised_plan.pdf"]},
];

// Labour – workers now carry dailyRate (£/day)
const LABOUR_DATA={
  1:{
    workers:[
      {id:"w1",name:"Dave Hartley",role:"Site Foreman",  trade:"Management",initials:"DH",dailyRate:380},
      {id:"w2",name:"Mike Patel",  role:"Steel Fixer",   trade:"Structural",initials:"MP",dailyRate:280},
      {id:"w3",name:"John Walsh",  role:"Steel Fixer",   trade:"Structural",initials:"JW",dailyRate:270},
      {id:"w4",name:"Steve Clarke",role:"Labourer",      trade:"General",   initials:"SC",dailyRate:200},
      {id:"w5",name:"Ryan Brooks", role:"Plant Operator",trade:"Plant",     initials:"RB",dailyRate:320},
      {id:"w6",name:"Lucy Chen",   role:"M&E Engineer",  trade:"Mechanical",initials:"LC",dailyRate:350},
    ],
    schedule:{
      "2026-05-19":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,2,3,4],w4:[0,1,2,3,4],w5:[0,1,2],w6:[]},
      "2026-05-26":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,2,3],  w4:[0,1,2,3,4],w5:[0,2,4],w6:[]},
      "2026-06-02":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,3,4],  w4:[0,2,3,4],  w5:[1,3],  w6:[2,3]},
      "2026-06-09":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,2,3],  w4:[0,1,2,3,4,5],w5:[0,2,4],w6:[2,3,4]},
      "2026-06-16":{w1:[0,1,2,3,4],w2:[0,1,3,4],  w3:[0,1,2,3,4],w4:[1,2,3,4],  w5:[0,1,2],w6:[0,1,2,3,4]},
    },
  },
  2:{
    workers:[
      {id:"w7", name:"Tom Bradley",role:"Site Foreman",trade:"Management",initials:"TB",dailyRate:360},
      {id:"w8", name:"Sean Murphy",role:"Bricklayer",  trade:"Masonry",   initials:"SM",dailyRate:260},
      {id:"w9", name:"Ali Hassan", role:"Carpenter",   trade:"Carpentry", initials:"AH",dailyRate:250},
      {id:"w10",name:"Chris Ford", role:"Labourer",    trade:"General",   initials:"CF",dailyRate:190},
    ],
    schedule:{
      "2026-06-02":{w7:[0,1,2,3,4],w8:[0,1,2,3],  w9:[0,2,4],   w10:[0,1,2,3,4]},
      "2026-06-09":{w7:[0,1,2,3,4],w8:[0,1,2,3,4],w9:[1,2,3],   w10:[0,1,3,4]},
      "2026-06-16":{w7:[0,1,2,3,4],w8:[0,2,3,4],  w9:[0,1,2,3,4],w10:[0,1,2]},
    },
  },
  3:{
    workers:[
      {id:"w11",name:"Paul Green", role:"Site Foreman",trade:"Management",initials:"PG",dailyRate:360},
      {id:"w12",name:"Neil Carter",role:"M&E Engineer",trade:"Mechanical",initials:"NC",dailyRate:340},
      {id:"w13",name:"Sam Osei",   role:"Electrician", trade:"Electrical",initials:"SO",dailyRate:290},
    ],
    schedule:{"2026-04-07":{w11:[0,1,2,3,4],w12:[0,1,2,3,4],w13:[0,1,2,3,4]}},
  },
};

// Sign-ins: signIns[siteId][dateStr][workerId] = scopeId | null (null = absent)
const INIT_SIGN_INS={
  1:{
    "2026-05-19":{w1:1,w2:1,w3:1,w4:1,w5:1,  w6:null},
    "2026-05-20":{w1:1,w2:1,w3:1,w4:1,w5:1,  w6:null},
    "2026-05-21":{w1:1,w2:1,w3:1,w4:1,w5:null,w6:null},
    "2026-05-22":{w1:2,w2:1,w3:1,w4:1,w5:1,  w6:null},
    "2026-05-23":{w1:2,w2:2,w3:1,w4:1,w5:null,w6:null},
    "2026-05-26":{w1:2,w2:2,w3:2,w4:3,w5:3,  w6:null},
    "2026-05-27":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:null},
    "2026-05-28":{w1:2,w2:2,w3:2,w4:3,w5:3,  w6:null},
    "2026-05-29":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:null},
    "2026-05-30":{w1:2,w2:2,w3:null,w4:3,w5:3,w6:null},
    "2026-06-02":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:null},
    "2026-06-03":{w1:2,w2:2,w3:2,w4:3,w5:3,  w6:null},
    "2026-06-04":{w1:4,w2:2,w3:2,w4:3,w5:null,w6:5},
    "2026-06-05":{w1:4,w2:2,w3:2,w4:3,w5:3,  w6:5},
    "2026-06-09":{w1:2,w2:2,w3:2,w4:3,w5:3,  w6:null},
    "2026-06-10":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:5},
    "2026-06-11":{w1:2,w2:2,w3:2,w4:3,w5:3,  w6:5},
    "2026-06-12":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:5},
    "2026-06-13":{w1:null,w2:null,w3:null,w4:3,w5:3,w6:null},
  },
  2:{
    "2026-06-09":{w7:7,w8:8,w9:null,w10:7},
    "2026-06-10":{w7:7,w8:8,w9:7,  w10:7},
    "2026-06-11":{w7:7,w8:8,w9:7,  w10:7},
    "2026-06-12":{w7:7,w8:8,w9:null,w10:7},
  },
  3:{},
};

// ─────────────────────────────────────────────────────────
//  MICRO COMPONENTS
// ─────────────────────────────────────────────────────────
function Badge({s}){
  const M={approved:["#ECFDF5","#065F46","Approved"],pending:["#FFFBEB","#92400E","Pending"],rejected:["#FEF2F2","#991B1B","Rejected"],draft:["#F1F5F9","#475569","Draft"],submitted:["#EFF6FF","#1D4ED8","Submitted"],finalised:["#D1FAE5","#065F46","Finalised"],active:["#EFF6FF","#1D4ED8","Active"],complete:["#D1FAE5","#065F46","Complete"]};
  const [bg,col,lbl]=M[s]||["#F1F5F9","#475569",s];
  return <span style={{background:bg,color:col,padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:700}}>{lbl}</span>;
}

function Bar({pct,thin,color}){
  return(<div style={{background:BD,borderRadius:999,height:thin?4:8,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,background:color||(pct===100?GN:OR),borderRadius:999,height:"100%",transition:"width .4s ease"}}/>
  </div>);
}

function Crumb({crumbs}){
  return(<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:14,flexWrap:"wrap"}}>
    {crumbs.map((c,i)=>(
      <span key={i} style={{display:"flex",alignItems:"center",gap:5}}>
        {i>0&&<span style={{color:"#CBD5E1",fontSize:13}}>›</span>}
        <span onClick={c.fn} style={{fontSize:12,color:c.fn?OR:MU,cursor:c.fn?"pointer":"default",fontWeight:c.fn?500:700}}>{c.label}</span>
      </span>
    ))}
  </div>);
}

function Pill({name,onX}){
  return(<span style={{background:"#F1F5F9",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#475569",display:"inline-flex",alignItems:"center",gap:4}}>
    {fileIcon(name)}{name}
    {onX&&<span style={{cursor:"pointer",color:"#9CA3AF",marginLeft:2}} onClick={onX}>✕</span>}
  </span>);
}

function Drop({fRef,onFiles,hint}){
  return(<>
    <div onClick={()=>fRef.current?.click()} style={{border:"2px dashed #D1D5DB",borderRadius:10,padding:"22px 16px",textAlign:"center",cursor:"pointer",background:"#FAFAFA"}}>
      <div style={{fontSize:28,marginBottom:5}}>📎</div>
      <div style={{color:MU,fontSize:13,fontWeight:500}}>Click to attach files</div>
      <div style={{color:"#9CA3AF",fontSize:11,marginTop:2}}>{hint}</div>
    </div>
    <input ref={fRef} type="file" multiple style={{display:"none"}} onChange={e=>{onFiles(Array.from(e.target.files).map(f=>f.name));e.target.value="";}}/>
  </>);
}

// ─────────────────────────────────────────────────────────
//  FINANCIAL WIDGET
// ─────────────────────────────────────────────────────────
function FinancialWidget({fin,scopes,open,onToggle}){
  const tag=pctTag(fin.pctUsed);
  const barCol=RAG_COL[tag];
  return(
    <div style={{background:RAG_BG[tag],border:`1px solid ${RAG_BD[tag]}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
      {/* Top row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {[["Allocated Budget",fmt(fin.allocated),N],["Total Spent",fmt(fin.totalSpent),TX],["Remaining",fin.remaining>=0?fmt(fin.remaining):`${fmt(Math.abs(fin.remaining))} OVER`,fin.remaining>=0?GN:RD]].map(([l,v,c])=>(
            <div key={l}>
              <div style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{l}</div>
              <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>{ragDot(fin.pctUsed)}</span>
          <button onClick={onToggle} style={{background:"none",border:`1px solid ${RAG_BD[tag]}`,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:11,color:MU,fontWeight:700,whiteSpace:"nowrap"}}>
            {open?"▲ Hide":"▼ Scopes"}
          </button>
        </div>
      </div>
      {/* Overall bar */}
      <Bar pct={fin.pctUsed} thin color={barCol}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MU,marginTop:4}}>
        <span>Labour {fmt(fin.labour)} · Expenses {fmt(fin.expenses)}</span>
        <span style={{fontWeight:700}}>{fin.pctUsed.toFixed(1)}% of budget used</span>
      </div>
      {/* Expanded per-scope breakdown */}
      {open&&(
        <div style={{marginTop:14,borderTop:`1px solid ${RAG_BD[tag]}`,paddingTop:12,display:"flex",flexDirection:"column",gap:10}}>
          {scopes.map(s=>{
            const av=allocVal(s);
            const lc=fin.labourByScope[s.id]||0;
            const ec=fin.expByScope[s.id]||0;
            const sp=lc+ec;
            const rem=av-sp;
            const p=av>0?sp/av*100:0;
            const st=pctTag(p);
            return(
              <div key={s.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:TX}}>{s.name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:10,color:MU}}>{fmt(sp)} of {fmt(av)}</span>
                    <span style={{fontSize:13}}>{ragDot(p)}</span>
                  </div>
                </div>
                <Bar pct={p} thin color={RAG_COL[st]}/>
                <div style={{fontSize:10,color:MU,marginTop:2,display:"flex",gap:10}}>
                  <span>Labour {fmt(lc)}</span>
                  <span>Expenses {fmt(ec)}</span>
                  <span style={{color:rem>=0?GN:RD,fontWeight:700}}>{rem>=0?`${fmt(rem)} left`:`${fmt(Math.abs(rem))} OVER`}</span>
                  <span style={{marginLeft:"auto",color:"#94A3B8"}}>{s.completed}% work done</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  SHELL
// ─────────────────────────────────────────────────────────
function Shell({view,siteId,go,toast,fin,scopes,widgetOpen,onWidgetToggle,children}){
  const hasSite=siteId!==null;
  const navItems=[
    {id:"dashboard",icon:"🏗️",label:"My Sites"},
    ...(hasSite?[
      {id:"site",       icon:"📍",label:"Site"},
      {id:"scopes",     icon:"📁",label:"Scopes"},
      {id:"labour",     icon:"👷",label:"Labour"},
      {id:"signin",     icon:"✅",label:"Sign-In"},
      {id:"expenses",   icon:"🧾",label:"Expenses"},
      {id:"variations", icon:"📐",label:"Variations"},
      {id:"application",icon:"📊",label:"Application"},
    ]:[]),
  ];
  const isActive=(id)=>{
    if(id==="expenses")  return view==="expenses"||view==="expense-new";
    if(id==="variations")return view==="variations"||view==="variation-new";
    return view===id;
  };
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <header style={{background:N,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,.35)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:OR,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏗️</div>
          <div>
            <div style={{color:"#FFF",fontSize:14,fontWeight:800,letterSpacing:"-0.01em"}}>SiteManager</div>
            <div style={{color:"#475569",fontSize:10}}>↔ Labour Schedule</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}><div style={{color:"#FFF",fontSize:12,fontWeight:600}}>{MANAGER.name}</div><div style={{color:"#475569",fontSize:10}}>Site Manager</div></div>
          <div style={{width:34,height:34,background:NM,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:OR,fontWeight:800,fontSize:12}}>{MANAGER.initials}</div>
        </div>
      </header>

      <nav style={{background:"#FFF",borderBottom:`1px solid ${BD}`,display:"flex",overflowX:"auto",paddingLeft:6}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>go(n.id)}
            style={{padding:"11px 11px",background:"none",border:"none",borderBottom:`2px solid ${isActive(n.id)?OR:"transparent"}`,cursor:"pointer",fontSize:11,fontWeight:700,color:isActive(n.id)?OR:MU,whiteSpace:"nowrap",transition:"color .15s"}}>
            <span style={{marginRight:3}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      <main style={{flex:1,maxWidth:820,width:"100%",margin:"0 auto",padding:"16px 16px 48px",boxSizing:"border-box"}}>
        {/* Financial widget – shown whenever inside a site */}
        {hasSite&&fin&&(
          <FinancialWidget fin={fin} scopes={scopes} open={widgetOpen} onToggle={onWidgetToggle}/>
        )}
        {children}
      </main>

      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:GN,color:"#FFF",padding:"11px 24px",borderRadius:10,fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.22)",zIndex:9999,whiteSpace:"nowrap"}}>{toast}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────
export default function App(){
  // Navigation
  const [view,setView]      =useState("dashboard");
  const [siteId,setSiteId]  =useState(null);
  const [scopeId,setScopeId]=useState(null);
  // Data
  const [scopes,setScopes]  =useState(INIT_SCOPES);
  const [expenses,setExp]   =useState(INIT_EXP);
  const [variations,setVar] =useState(INIT_VAR);
  const [signIns,setSignIns]=useState(INIT_SIGN_INS);
  // UI state
  const [scopePct,setScopePct]      =useState(null);
  const [weekOffset,setWeekOff]     =useState(0);
  const [widgetOpen,setWidgetOpen]  =useState(false);
  const [signInDate,setSignInDate]  =useState(TODAY);
  const [draftSI,setDraftSI]        =useState(null); // { [workerId]: scopeId|null }
  // Forms
  const [expForm,setEF]=useState({desc:"",amount:"",category:"Materials",scopeId:"",date:"",files:[]});
  const [varForm,setVF]=useState({title:"",desc:"",amount:"",files:[]});
  const [toast,setToast]=useState(null);
  const expRef=useRef(); const varRef=useRef();

  // Derived
  const site       =SITES.find(s=>s.id===siteId);
  const siteScopes =siteId?(scopes[siteId]||[]):[];
  const scope      =siteScopes.find(s=>s.id===scopeId);
  const siteExp    =expenses.filter(e=>e.siteId===siteId);
  const siteVar    =variations.filter(v=>v.siteId===siteId);
  const ld         =siteId?LABOUR_DATA[siteId]:null;
  const workers    =ld?.workers||[];

  // ── Financial computation ──
  const computeFin=(sid)=>{
    const ss=scopes[sid]||[];
    const sExp=expenses.filter(e=>e.siteId===sid&&e.status!=="rejected");
    const wrkrs=LABOUR_DATA[sid]?.workers||[];
    const wMap=Object.fromEntries(wrkrs.map(w=>[w.id,w]));
    const siteDays=signIns[sid]||{};
    const labourByScope={}, expByScope={};
    let totalLabour=0, totalExp=0;
    for(const daySigns of Object.values(siteDays)){
      for(const [wId,scId] of Object.entries(daySigns)){
        if(!scId) continue;
        const w=wMap[wId]; if(!w) continue;
        labourByScope[scId]=(labourByScope[scId]||0)+w.dailyRate;
        totalLabour+=w.dailyRate;
      }
    }
    for(const e of sExp){
      if(e.scopeId) expByScope[e.scopeId]=(expByScope[e.scopeId]||0)+e.amount;
      totalExp+=e.amount;
    }
    const allocated=ss.reduce((a,s)=>a+allocVal(s),0);
    const totalSpent=totalLabour+totalExp;
    return {allocated,labour:totalLabour,expenses:totalExp,totalSpent,remaining:allocated-totalSpent,pctUsed:allocated>0?totalSpent/allocated*100:0,labourByScope,expByScope};
  };
  const fin=siteId?computeFin(siteId):null;

  // Style helpers
  const card={background:"#FFF",borderRadius:12,border:`1px solid ${BD}`,padding:20,marginBottom:14};
  const inp={padding:"10px 14px",borderRadius:8,border:`1px solid ${BD}`,fontSize:14,width:"100%",boxSizing:"border-box",color:TX,outline:"none",background:"#FFF"};
  const lbl={fontSize:12,fontWeight:700,color:MU,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em"};
  const btn=(v="primary")=>({padding:"10px 18px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",border:"none",
    ...(v==="primary"?{background:OR,color:"#FFF"}:v==="navy"?{background:NM,color:"#FFF"}:v==="green"?{background:GN,color:"#FFF"}:{background:"transparent",color:MU,border:`1px solid ${BD}`})});

  const go=(v,sid,scid)=>{setView(v);if(sid!==undefined)setSiteId(sid);if(scid!==undefined){setScopeId(scid);setScopePct(null);}};
  const pop=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2700);};

  // Shell props bundle
  const shellProps={view,siteId,go,toast,fin,scopes:siteScopes,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)};

  // ── DASHBOARD ─────────────────────────────────────────
  if(view==="dashboard") return(
    <Shell {...shellProps}>
      <div style={{background:`${NM}18`,border:`1px solid ${NM}30`,borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:NM}}>
        🔗 <strong>Labour Schedule sync active.</strong> Site access and labour allocations are managed by your admin in Labour Schedule.
      </div>
      <h2 style={{color:N,fontSize:21,fontWeight:800,margin:"0 0 3px"}}>My Sites</h2>
      <p style={{color:MU,fontSize:13,margin:"0 0 18px"}}>{SITES.length} sites assigned to you</p>
      {SITES.map(s=>{
        const ss=scopes[s.id]||[];
        const f=computeFin(s.id);
        const pct=f.allocated>0?Math.round(f.totalSpent/f.allocated*100):0;
        const tag=pctTag(pct);
        return(
          <div key={s.id} style={{...card,cursor:"pointer",transition:"box-shadow .15s"}}
            onClick={()=>go("site",s.id)}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,.09)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:N,marginBottom:2}}>{s.name}</div>
                <div style={{color:MU,fontSize:12}}>{s.client} · {s.address}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:18}}>{ragDot(pct)}</span>
                <Badge s={s.appStatus}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
              {[["Allocated",fmt(f.allocated),N],["Spent",fmt(f.totalSpent),TX],["Remaining",fmt(f.remaining),f.remaining>=0?GN:RD],["Budget Used",pct+"%",RAG_COL[tag]]].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>
              ))}
            </div>
            <Bar pct={pct} thin color={RAG_COL[tag]}/>
            <div style={{marginTop:6,fontSize:11,color:"#94A3B8"}}>{s.start} → {s.end}</div>
          </div>
        );
      })}
    </Shell>
  );

  // ── SITE OVERVIEW ─────────────────────────────────────
  if(view==="site"&&site){
    const earned=siteScopes.reduce((a,s)=>a+earnedVal(s),0);
    const curSched=ld?.schedule[weekKey(0)]||{};
    const activeW=workers.filter(w=>(curSched[w.id]||[]).length>0).length;
    return(
      <Shell {...shellProps}>
        <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name}]}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div><h2 style={{color:N,fontSize:19,fontWeight:800,margin:"0 0 2px"}}>{site.name}</h2><div style={{color:MU,fontSize:12}}>{site.client} · {site.address}</div></div>
          <Badge s={site.appStatus}/>
        </div>
        {/* Earned value summary */}
        <div style={{background:N,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[["Earned to Date",fmt(earned),OR],["Workers (this wk)",activeW+"/"+workers.length,"#FFF"],["Scopes",siteScopes.length+" active","#FFF"]].map(([l,v,c])=>(
            <div key={l}><div style={{color:"#94A3B8",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div><div style={{color:c,fontSize:18,fontWeight:800}}>{v}</div></div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button style={btn("primary")} onClick={()=>go("scopes")}>📁 Scopes & Budget</button>
          <button style={btn("ghost")}   onClick={()=>go("signin")}>✅ Sign Workers In</button>
          <button style={btn("ghost")}   onClick={()=>go("expenses")}>🧾 Expenses <span style={{background:BD,borderRadius:999,padding:"1px 7px",marginLeft:4,fontSize:10}}>{siteExp.length}</span></button>
          <button style={btn("ghost")}   onClick={()=>go("application")}>📊 Application</button>
        </div>
        {/* Quick scope list */}
        <div style={{...card,padding:0,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",background:"#F8FAFC",borderBottom:`1px solid ${BD}`,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:800,fontSize:13,color:N}}>Scopes — tap to assess</span>
            <span style={{fontSize:11,color:MU}}>Allocated budget shown</span>
          </div>
          {siteScopes.map(s=>{
            const av=allocVal(s);
            const lc=(fin?.labourByScope[s.id]||0);
            const ec=(fin?.expByScope[s.id]||0);
            const sp=lc+ec;
            const rem=av-sp;
            const p=av>0?sp/av*100:0;
            return(
              <div key={s.id} style={{padding:"12px 18px",borderBottom:`1px solid #F8FAFC`,cursor:"pointer",transition:"background .12s"}}
                onClick={()=>{setScopePct(s.completed);go("scope",siteId,s.id);}}
                onMouseEnter={e=>e.currentTarget.style.background="#FAFCFF"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{fontWeight:600,fontSize:13,color:TX}}>{s.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:12,color:N}}>{fmt(av)}</div><div style={{fontSize:10,color:MU}}>your budget</div></div>
                    <span style={{fontSize:14}}>{ragDot(p)}</span>
                  </div>
                </div>
                <Bar pct={s.completed} thin/>
                <div style={{fontSize:10,color:MU,marginTop:3,display:"flex",justifyContent:"space-between"}}>
                  <span>{s.completed}% work complete · spent {fmt(sp)}</span>
                  <span style={{color:rem>=0?GN:RD,fontWeight:700}}>{fmt(rem)} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </Shell>
    );
  }

  // ── SCOPES DETAIL VIEW ────────────────────────────────
  if(view==="scopes"&&site){
    return(
      <Shell {...shellProps}>
        <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site")},{label:"Scopes & Budget"}]}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{color:N,fontSize:19,fontWeight:800,margin:0}}>Scopes & Budget</h2>
          <div style={{fontSize:11,color:MU,background:"#F1F5F9",borderRadius:7,padding:"4px 10px",fontWeight:600}}>Profit & overhead excluded from values shown</div>
        </div>
        {siteScopes.map(s=>{
          const av=allocVal(s);
          const lc=fin?.labourByScope[s.id]||0;
          const ec=fin?.expByScope[s.id]||0;
          const sp=lc+ec;
          const rem=av-sp;
          const p=av>0?sp/av*100:0;
          const tag=pctTag(p);
          return(
            <div key={s.id} style={{...card,borderLeft:`4px solid ${RAG_COL[tag]}`}}>
              {/* Scope header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15,color:N,marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:11,color:MU}}>Allocated budget (your portion) · {s.completed}% work complete</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:20,fontWeight:900,color:N}}>{fmt(av)}</div>
                  <div style={{fontSize:10,color:MU}}>allocated</div>
                </div>
              </div>
              {/* Budget bar */}
              <Bar pct={p} color={RAG_COL[tag]}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:MU,marginTop:4,marginBottom:14}}>
                <span>{p.toFixed(1)}% of budget spent</span>
                <span style={{fontSize:14}}>{ragDot(p)}</span>
              </div>
              {/* Cost breakdown grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,padding:"12px 14px",background:"#F8FAFC",borderRadius:8}}>
                {[["Labour Cost",fmt(lc),TX],["Expenses",fmt(ec),TX],["Total Spent",fmt(sp),sp>0?TX:MU],["Remaining",rem>=0?fmt(rem):`${fmt(Math.abs(rem))} OVER`,rem>=0?GN:RD]].map(([l,v,c])=>(
                  <div key={l}><div style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>
                ))}
              </div>
              {/* Work completion vs budget status */}
              <div style={{marginTop:10,display:"flex",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1,background:"#EFF6FF",borderRadius:7,padding:"8px 12px"}}>
                  <div style={{fontSize:10,color:"#1D4ED8",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Work Completion</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#1D4ED8"}}>{s.completed}%</div>
                </div>
                <div style={{flex:1,background:RAG_BG[tag],borderRadius:7,padding:"8px 12px"}}>
                  <div style={{fontSize:10,color:RAG_COL[tag],fontWeight:700,textTransform:"uppercase",marginBottom:2}}>Budget Health</div>
                  <div style={{fontSize:16,fontWeight:800,color:RAG_COL[tag]}}>{ragDot(p)} {p<70?"On track":p<90?"Watch spend":"Over risk"}</div>
                </div>
              </div>
              {/* Scope action */}
              <div style={{marginTop:10}}>
                <button style={{...btn("ghost"),fontSize:12,padding:"7px 14px"}} onClick={()=>{setScopePct(s.completed);go("scope",siteId,s.id);}}>
                  ✏️ Update completion %
                </button>
              </div>
            </div>
          );
        })}
      </Shell>
    );
  }

  // ── SCOPE ASSESSMENT ──────────────────────────────────
  if(view==="scope"&&scope){
    const pct=scopePct!==null?scopePct:scope.completed;
    const av=allocVal(scope),ev=Math.round(av*pct/100);
    const lc=fin?.labourByScope[scope.id]||0;
    const ec=fin?.expByScope[scope.id]||0;
    const sp=lc+ec; const rem=av-sp;
    return(
      <Shell {...shellProps}>
        <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Scopes",fn:()=>go("scopes")},{label:"Assess"}]}/>
        <div style={{background:N,borderRadius:12,padding:"18px 20px",marginBottom:16}}>
          <div style={{color:"#94A3B8",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>Scope Assessment</div>
          <div style={{color:"#FFF",fontSize:16,fontWeight:700,marginBottom:14}}>{scope.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[["Allocated",fmt(av),"#FFF"],["Earned Value",fmt(ev),OR],["Remaining Budget",rem>=0?fmt(rem):`${fmt(Math.abs(rem))} OVER`,rem>=0?GN:RD]].map(([l,v,c])=>(
              <div key={l}><div style={{color:"#94A3B8",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{l}</div><div style={{color:c,fontSize:18,fontWeight:800}}>{v}</div></div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={{fontWeight:800,fontSize:14,color:N,marginBottom:14}}>Volume of Work Completed</div>
          <div style={{fontSize:52,fontWeight:900,color:OR,textAlign:"center",lineHeight:1,marginBottom:10}}>{pct}%</div>
          <Bar pct={pct}/>
          <input type="range" min={0} max={100} step={5} value={pct} onChange={e=>setScopePct(Number(e.target.value))} style={{width:"100%",marginTop:12,accentColor:OR,cursor:"pointer"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:3}}>
            {[0,25,50,75,100].map(n=><span key={n}>{n}%</span>)}
          </div>
          <div style={{marginTop:14,padding:"12px 14px",background:"#F8FAFC",borderRadius:8,fontSize:13,color:MU,borderLeft:`3px solid ${OR}`}}>
            At <strong style={{color:N}}>{pct}%</strong> — earned value <strong style={{color:N}}>{fmt(ev)}</strong> · budget spent {fmt(sp)} of {fmt(av)} <span style={{color:rem>=0?GN:RD,fontWeight:700}}>({rem>=0?fmt(rem)+" left":fmt(Math.abs(rem))+" OVER"})</span>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button style={btn("primary")} onClick={()=>{setScopes(p=>({...p,[siteId]:p[siteId].map(s=>s.id===scopeId?{...s,completed:pct}:s)}));go("scopes");pop("Completion saved ✓");}}>Save Assessment</button>
            <button style={btn("ghost")} onClick={()=>go("scopes")}>Cancel</button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── SIGN-IN VIEW ──────────────────────────────────────
  if(view==="signin"&&site){
    // Workers scheduled for signInDate
    const wk=dateToWK(signInDate);
    const di=dateToDI(signInDate);
    const dayOfWeek=DAY_SHORT[di]||"";
    const weekSched=ld?.schedule[wk]||{};
    const scheduledW=workers.filter(w=>(weekSched[w.id]||[]).includes(di));
    // Initialise draft from saved sign-ins (or empty) when entering this view
    const savedDay=(signIns[siteId]||{})[signInDate]||{};
    const initDraft=(w)=>draftSI??(Object.fromEntries(scheduledW.map(w=>([w.id,savedDay[w.id]??w.id]))));
    const draft=draftSI??Object.fromEntries(scheduledW.map(w=>[w.id,savedDay[w.id]??null]));

    // Cost per scope from draft
    const draftCostByScope={};
    let draftTotal=0;
    for(const [wId,scId] of Object.entries(draft)){
      if(!scId) continue;
      const w=workers.find(x=>x.id===wId); if(!w) continue;
      draftCostByScope[scId]=(draftCostByScope[scId]||0)+w.dailyRate;
      draftTotal+=w.dailyRate;
    }

    const saveSignIn=()=>{
      setSignIns(p=>({...p,[siteId]:{...(p[siteId]||{}),[signInDate]:draft}}));
      setDraftSI(null);
      pop("Sign-in saved ✓");
    };

    return(
      <Shell {...shellProps}>
        <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site")},{label:"Daily Sign-In"}]}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <h2 style={{color:N,fontSize:19,fontWeight:800,margin:0}}>Daily Sign-In</h2>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#F1F5F9",borderRadius:8,padding:"5px 11px",fontSize:11,color:MU,fontWeight:600}}>
            <span style={{width:7,height:7,background:GN,borderRadius:"50%",display:"inline-block"}}/>
            Costs logged against scope budgets
          </div>
        </div>

        {/* Date selector */}
        <div style={{...card,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div>
              <label style={lbl}>Date</label>
              <input type="date" style={{...inp,maxWidth:200}} value={signInDate}
                onChange={e=>{setSignInDate(e.target.value);setDraftSI(null);}}/>
            </div>
            <div style={{paddingTop:22,color:MU,fontSize:13}}>
              {scheduledW.length>0?<span><strong style={{color:N}}>{scheduledW.length} workers</strong> scheduled · {dayOfWeek}</span>:<span style={{color:"#94A3B8"}}>No workers scheduled for this day</span>}
            </div>
          </div>
        </div>

        {scheduledW.length===0?(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#9CA3AF"}}><div style={{fontSize:40,marginBottom:10}}>📅</div><div style={{fontSize:13}}>No workers are scheduled for this site on the selected date.</div></div>
        ):(
          <>
            {/* Worker sign-in table */}
            <div style={{...card,padding:0,overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"12px 18px",background:"#F8FAFC",borderBottom:`1px solid ${BD}`,display:"grid",gridTemplateColumns:"1fr 80px 1fr 80px",gap:8}}>
                {["Worker","Rate","Assign to Scope","Present"].map(h=>(
                  <div key={h} style={{fontSize:10,color:MU,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
                ))}
              </div>
              {scheduledW.map((w,wi)=>{
                const currentScId=draft[w.id]??null;
                const present=currentScId!==null;
                const tc=TRADE_COL[w.trade]||NM;
                return(
                  <div key={w.id} style={{padding:"12px 18px",borderBottom:`1px solid #F8FAFC`,display:"grid",gridTemplateColumns:"1fr 80px 1fr 80px",gap:8,alignItems:"center",background:wi%2===0?"#FFF":"#FCFDFF"}}>
                    {/* Worker */}
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:`${tc}18`,border:`1.5px solid ${tc}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:tc,flexShrink:0}}>{w.initials}</div>
                      <div><div style={{fontSize:12,fontWeight:700,color:TX}}>{w.name}</div><div style={{fontSize:10,color:tc,fontWeight:600}}>{w.role}</div></div>
                    </div>
                    {/* Rate */}
                    <div style={{fontSize:12,fontWeight:700,color:N}}>{fmt(w.dailyRate)}</div>
                    {/* Scope selector */}
                    <select value={currentScId||""} disabled={!present}
                      onChange={e=>setDraftSI(p=>({...(p||draft),[w.id]:e.target.value?Number(e.target.value):null}))}
                      style={{...inp,padding:"6px 10px",fontSize:12,opacity:present?1:0.4}}>
                      <option value="">— Absent / Not on site —</option>
                      {siteScopes.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {/* Present toggle */}
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <button onClick={()=>{
                        const newPresent=!present;
                        setDraftSI(p=>({...(p||draft),[w.id]:newPresent?(siteScopes[0]?.id||null):null}));
                      }}
                        style={{width:34,height:34,borderRadius:8,border:`2px solid ${present?GN:BD}`,background:present?"#ECFDF5":"#F8FAFC",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {present?"✓":"—"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cost summary by scope */}
            {Object.keys(draftCostByScope).length>0&&(
              <div style={{...card,background:"#FFFBEB",borderColor:"#FDE68A",marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:13,color:"#92400E",marginBottom:10}}>💰 Labour Cost Today — by Scope</div>
                {siteScopes.filter(s=>draftCostByScope[s.id]).map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #FDE68A",fontSize:13}}>
                    <span style={{color:TX,fontWeight:600}}>{s.name}</span>
                    <span style={{fontWeight:800,color:"#92400E"}}>{fmt(draftCostByScope[s.id])}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:"2px solid #FDE68A"}}>
                  <span style={{fontWeight:700,color:TX}}>Total Labour Cost Today</span>
                  <span style={{fontWeight:900,fontSize:16,color:"#92400E"}}>{fmt(draftTotal)}</span>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:10}}>
              <button style={btn("green")} onClick={saveSignIn}>✓ Save Sign-In</button>
              <button style={btn("ghost")} onClick={()=>{setDraftSI(null);go("site");}}>Cancel</button>
            </div>
          </>
        )}
      </Shell>
    );
  }

  // ── LABOUR SCHEDULE ───────────────────────────────────
  if(view==="labour"&&site){
    const wk=weekKey(weekOffset);
    const sched=ld?.schedule[wk]||{};
    const dates=weekDates(weekOffset);
    const monDate=weekMonday(weekOffset);
    const dayTotals=Array.from({length:6},(_,di)=>workers.filter(w=>(sched[w.id]||[]).includes(di)).length);
    const totalPD=workers.reduce((a,w)=>a+(sched[w.id]||[]).length,0);
    const totalW=workers.filter(w=>(sched[w.id]||[]).length>0).length;
    const uniqueT=[...new Set(workers.filter(w=>(sched[w.id]||[]).length>0).map(w=>w.trade))];
    return(
      <Shell {...shellProps}>
        <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site")},{label:"Labour Schedule"}]}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <h2 style={{color:N,fontSize:19,fontWeight:800,margin:0}}>Labour Schedule</h2>
          <div style={{display:"flex",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:"#F1F5F9",borderRadius:8,padding:"5px 11px",fontSize:11,color:MU,fontWeight:600}}>
              <span style={{width:7,height:7,background:GN,borderRadius:"50%",display:"inline-block"}}/>Read only · Labour Schedule
            </div>
            <button style={btn("primary")} onClick={()=>go("signin")}>✅ Sign In Today</button>
          </div>
        </div>
        <div style={{background:N,borderRadius:12,padding:"14px 18px",marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[["Workers This Week",`${totalW}/${workers.length}`,"#FFF"],["Person-Days",totalPD,OR],["Trades",uniqueT.length,"#FFF"]].map(([l,v,c])=>(
            <div key={l}><div style={{color:"#94A3B8",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{l}</div><div style={{color:c,fontSize:19,fontWeight:800}}>{v}</div></div>
          ))}
        </div>
        {uniqueT.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{uniqueT.map(t=><span key={t} style={{background:`${TRADE_COL[t]||NM}18`,color:TRADE_COL[t]||NM,border:`1px solid ${TRADE_COL[t]||NM}40`,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700}}>{t}</span>)}</div>}
        {/* Week nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <button onClick={()=>setWeekOff(o=>o-1)} style={{...btn("ghost"),padding:"6px 12px",fontSize:12}}>‹ {fmtDate(weekMonday(weekOffset-1))}</button>
          <div style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:13,color:N}}>Week of {fmtDate(monDate)}</div>{weekOffset===0&&<div style={{fontSize:10,color:OR,fontWeight:700}}>CURRENT WEEK</div>}</div>
          <button onClick={()=>setWeekOff(o=>o+1)} style={{...btn("ghost"),padding:"6px 12px",fontSize:12}}>{fmtDate(weekMonday(weekOffset+1))} ›</button>
        </div>
        {/* Grid */}
        <div style={{...card,padding:0,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  <th style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:MU,textTransform:"uppercase",minWidth:170,borderBottom:`1px solid ${BD}`}}>Worker</th>
                  {dates.map((d,i)=><th key={i} style={{padding:"8px",textAlign:"center",fontSize:10,fontWeight:700,color:i<5?MU:"#94A3B8",minWidth:60,borderBottom:`1px solid ${BD}`,borderLeft:`1px solid ${BD}`}}><div>{DAY_SHORT[i]}</div><div style={{fontWeight:500,color:"#94A3B8"}}>{fmtDate(d)}</div></th>)}
                  <th style={{padding:"8px",textAlign:"center",fontSize:10,fontWeight:700,color:MU,minWidth:44,borderBottom:`1px solid ${BD}`,borderLeft:`1px solid ${BD}`}}>Days</th>
                </tr>
              </thead>
              <tbody>
                {workers.length===0?<tr><td colSpan={9} style={{padding:"32px",textAlign:"center",color:"#9CA3AF"}}>No workers allocated</td></tr>
                :workers.map((w,wi)=>{
                  const days=sched[w.id]||[];
                  const tc=TRADE_COL[w.trade]||NM;
                  return(
                    <tr key={w.id} style={{borderBottom:"1px solid #F8FAFC",background:wi%2===0?"#FFF":"#FCFDFF"}}>
                      <td style={{padding:"9px 14px",borderRight:`1px solid ${BD}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:`${tc}18`,border:`1.5px solid ${tc}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:tc,flexShrink:0}}>{w.initials}</div>
                          <div><div style={{fontSize:12,fontWeight:700,color:TX}}>{w.name}</div><div style={{fontSize:10,color:tc,fontWeight:600}}>{w.role} · {fmt(w.dailyRate)}/d</div></div>
                        </div>
                      </td>
                      {Array.from({length:6},(_,di)=>{
                        const on=days.includes(di);
                        return<td key={di} style={{padding:"8px",textAlign:"center",borderLeft:"1px solid #F1F5F9"}}>
                          {on?<div style={{width:26,height:26,borderRadius:6,background:`${tc}20`,border:`1.5px solid ${tc}50`,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:9,height:9,borderRadius:"50%",background:tc}}/></div>
                             :<div style={{width:26,height:26,borderRadius:6,background:"#F8FAFC",border:`1px solid ${BD}`,margin:"0 auto"}}/>}
                        </td>;
                      })}
                      <td style={{padding:"8px",textAlign:"center",borderLeft:`1px solid ${BD}`}}><span style={{fontWeight:800,fontSize:12,color:days.length>0?N:MU}}>{days.length}</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:"#F0F4F8",borderTop:`1px solid ${BD}`}}>
                  <td style={{padding:"9px 14px",fontSize:11,fontWeight:800,color:N,borderRight:`1px solid ${BD}`}}>Daily Headcount</td>
                  {dayTotals.map((t,i)=><td key={i} style={{padding:"8px",textAlign:"center",borderLeft:`1px solid ${BD}`}}><div style={{fontWeight:800,fontSize:12,color:t>0?OR:MU}}>{t}</div><div style={{fontSize:9,color:"#94A3B8"}}>ppl</div></td>)}
                  <td style={{padding:"8px",textAlign:"center",borderLeft:`1px solid ${BD}`}}><div style={{fontWeight:800,fontSize:12,color:N}}>{totalPD}</div><div style={{fontSize:9,color:"#94A3B8"}}>total</div></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Shell>
    );
  }

  // ── EXPENSES ──────────────────────────────────────────
  if(view==="expenses"){
    const total=siteExp.reduce((a,e)=>a+e.amount,0);
    return(<Shell {...shellProps}>
      <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Expenses"}]}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h2 style={{color:N,fontSize:19,fontWeight:800,margin:"0 0 2px"}}>Expenses</h2><div style={{color:MU,fontSize:12}}>Total: <strong style={{color:OR}}>{fmt(total)}</strong></div></div>
        <button style={btn("primary")} onClick={()=>go("expense-new")}>+ New</button>
      </div>
      {siteExp.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#9CA3AF"}}><div style={{fontSize:48,marginBottom:10}}>🧾</div><div>No expenses yet.</div></div>
      :siteExp.map(e=>{
        const sc=siteScopes.find(s=>s.id===e.scopeId);
        return(<div key={e.id} style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{flex:1,marginRight:12}}><div style={{fontWeight:700,fontSize:13,color:TX,marginBottom:2}}>{e.desc}</div><div style={{fontSize:11,color:MU}}>{e.category}{sc?` · ${sc.name}`:""} · {e.date}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:15,color:N,marginBottom:4}}>{fmt(e.amount)}</div><Badge s={e.status}/></div>
          </div>
          {e.files.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{e.files.map((f,i)=><Pill key={i} name={f}/>)}</div>}
        </div>);
      })}
    </Shell>);
  }

  if(view==="expense-new") return(<Shell {...shellProps}>
    <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Expenses",fn:()=>go("expenses")},{label:"New Expense"}]}/>
    <h2 style={{color:N,fontSize:19,fontWeight:800,margin:"0 0 16px"}}>New Expense</h2>
    <div style={card}>
      <div style={{marginBottom:12}}><label style={lbl}>Description *</label><input style={inp} placeholder="e.g. Concrete delivery — Pour 3" value={expForm.desc} onChange={e=>setEF(p=>({...p,desc:e.target.value}))}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div><label style={lbl}>Amount (£) *</label><input style={inp} type="number" min="0" value={expForm.amount} onChange={e=>setEF(p=>({...p,amount:e.target.value}))}/></div>
        <div><label style={lbl}>Date</label><input style={inp} type="date" value={expForm.date} onChange={e=>setEF(p=>({...p,date:e.target.value}))}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div><label style={lbl}>Category</label><select style={inp} value={expForm.category} onChange={e=>setEF(p=>({...p,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={lbl}>Scope</label><select style={inp} value={expForm.scopeId} onChange={e=>setEF(p=>({...p,scopeId:e.target.value}))}><option value="">— Unlinked —</option>{siteScopes.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      </div>
      <div style={{marginBottom:16}}><label style={lbl}>Evidence Files</label><Drop fRef={expRef} onFiles={n=>setEF(p=>({...p,files:[...p.files,...n]}))} hint="Invoices, receipts, photos, PDFs"/>
        {expForm.files.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{expForm.files.map((f,i)=><Pill key={i} name={f} onX={()=>setEF(p=>({...p,files:p.files.filter((_,j)=>j!==i)}))}/>)}</div>}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={btn("primary")} onClick={()=>{if(!expForm.desc.trim()||!expForm.amount){pop("Fill required fields");return;}setExp(p=>[...p,{id:Date.now(),siteId,scopeId:Number(expForm.scopeId)||null,...expForm,amount:Number(expForm.amount),date:expForm.date||"Today",status:"pending"}]);setEF({desc:"",amount:"",category:"Materials",scopeId:"",date:"",files:[]});go("expenses");pop("Expense saved ✓");}}>Save Expense</button>
        <button style={btn("ghost")} onClick={()=>go("expenses")}>Cancel</button>
      </div>
    </div>
  </Shell>);

  // ── VARIATIONS ────────────────────────────────────────
  if(view==="variations") return(<Shell {...shellProps}>
    <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Variations"}]}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h2 style={{color:N,fontSize:19,fontWeight:800,margin:0}}>Variations</h2>
      <button style={btn("primary")} onClick={()=>go("variation-new")}>+ New</button>
    </div>
    {siteVar.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#9CA3AF"}}><div style={{fontSize:48,marginBottom:10}}>📐</div><div>No variations yet.</div></div>
    :siteVar.map(v=>(
      <div key={v.id} style={card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{flex:1,marginRight:12}}><div style={{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{v.ref}</div><div style={{fontWeight:700,fontSize:13,color:TX,marginBottom:3}}>{v.title}</div>{v.desc&&<div style={{fontSize:12,color:MU}}>{v.desc}</div>}</div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:15,color:N,marginBottom:4}}>{fmt(v.amount)}</div><Badge s={v.status}/></div>
        </div>
        {v.files.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{v.files.map((f,i)=><Pill key={i} name={f}/>)}</div>}
      </div>
    ))}
  </Shell>);

  if(view==="variation-new") return(<Shell {...shellProps}>
    <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Variations",fn:()=>go("variations")},{label:"New Variation"}]}/>
    <h2 style={{color:N,fontSize:19,fontWeight:800,margin:"0 0 16px"}}>New Variation</h2>
    <div style={card}>
      <div style={{marginBottom:12}}><label style={lbl}>Title *</label><input style={inp} placeholder="Brief description of scope change" value={varForm.title} onChange={e=>setVF(p=>({...p,title:e.target.value}))}/></div>
      <div style={{marginBottom:12}}><label style={lbl}>Details / Justification</label><textarea style={{...inp,height:90,resize:"vertical"}} value={varForm.desc} onChange={e=>setVF(p=>({...p,desc:e.target.value}))}/></div>
      <div style={{marginBottom:12}}><label style={lbl}>Value (£) *</label><input style={{...inp,maxWidth:220}} type="number" min="0" value={varForm.amount} onChange={e=>setVF(p=>({...p,amount:e.target.value}))}/></div>
      <div style={{marginBottom:16}}>
        <label style={lbl}>Supporting Evidence</label>
        <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400E",marginBottom:8}}>📎 Attach photos, emails, instruction notices, drawings, videos</div>
        <Drop fRef={varRef} onFiles={n=>setVF(p=>({...p,files:[...p.files,...n]}))} hint="JPG, PNG, MP4, PDF, EML, MSG"/>
        {varForm.files.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{varForm.files.map((f,i)=><Pill key={i} name={f} onX={()=>setVF(p=>({...p,files:p.files.filter((_,j)=>j!==i)}))}/>)}</div>}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={btn("primary")} onClick={()=>{if(!varForm.title.trim()||!varForm.amount){pop("Fill required fields");return;}const ref=`VAR-${String(siteVar.length+1).padStart(3,"0")}`;setVar(p=>[...p,{id:Date.now(),siteId,ref,...varForm,amount:Number(varForm.amount),status:"pending"}]);setVF({title:"",desc:"",amount:"",files:[]});go("variations");pop("Variation created ✓");}}>Create Variation</button>
        <button style={btn("ghost")} onClick={()=>go("variations")}>Cancel</button>
      </div>
    </div>
  </Shell>);

  // ── APPLICATION ───────────────────────────────────────
  if(view==="application"){
    const scopeTotal=siteScopes.reduce((a,s)=>a+earnedVal(s),0);
    const approvedVars=siteVar.filter(v=>v.status==="approved");
    const varTotal=approvedVars.reduce((a,v)=>a+v.amount,0);
    const appStat=site?.appStatus||"draft";
    return(<Shell {...shellProps}>
      <Crumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site?.name,fn:()=>go("site")},{label:"Application"}]}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{color:N,fontSize:19,fontWeight:800,margin:0}}>Payment Application</h2><Badge s={appStat}/></div>
      <div style={{...card,padding:0,overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"11px 18px",background:"#F8FAFC",borderBottom:`1px solid ${BD}`,fontWeight:800,fontSize:12,color:N,textTransform:"uppercase",letterSpacing:"0.04em"}}>Scope Claims (your allocated values)</div>
        {siteScopes.map(s=>{const av=allocVal(s);const ev=earnedVal(s);return(<div key={s.id} style={{padding:"10px 18px",borderBottom:"1px solid #F8FAFC",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:600,color:TX}}>{s.name}</div><div style={{fontSize:11,color:MU}}>{s.completed}% complete · allocated {fmt(av)}</div></div><div style={{fontWeight:800,fontSize:13,color:N}}>{fmt(ev)}</div></div>);})}
        <div style={{padding:"11px 18px",background:"#F0F4F8",display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:800,fontSize:12,color:N}}>Scope Subtotal</span><span style={{fontWeight:800,fontSize:14,color:OR}}>{fmt(scopeTotal)}</span></div>
      </div>
      {approvedVars.length>0&&<div style={{...card,padding:0,overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"11px 18px",background:"#F8FAFC",borderBottom:`1px solid ${BD}`,fontWeight:800,fontSize:12,color:N,textTransform:"uppercase",letterSpacing:"0.04em"}}>Approved Variations</div>
        {approvedVars.map(v=><div key={v.id} style={{padding:"10px 18px",borderBottom:"1px solid #F8FAFC",display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:600,color:TX}}>{v.ref} — {v.title}</div><div style={{fontWeight:800,color:N}}>{fmt(v.amount)}</div></div>)}
        <div style={{padding:"11px 18px",background:"#F0F4F8",display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:800,fontSize:12,color:N}}>Variations Subtotal</span><span style={{fontWeight:800,fontSize:14,color:OR}}>{fmt(varTotal)}</span></div>
      </div>}
      <div style={{background:N,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{color:"#94A3B8",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Manager's Total (excl. margin)</div><div style={{color:"#64748B",fontSize:11,marginTop:1}}>Director will add full margin values before issuing to client</div></div>
        <div style={{color:OR,fontSize:28,fontWeight:900}}>{fmt(scopeTotal+varTotal)}</div>
      </div>
      {appStat==="draft"&&<div style={{...card,borderColor:"#FDE68A",background:"#FFFBEB"}}><div style={{fontWeight:800,color:"#92400E",fontSize:13,marginBottom:5}}>⚠️ Submit for Director Review</div><div style={{color:"#78350F",fontSize:12,marginBottom:12,lineHeight:1.5}}>Once submitted the director and finance team will review, add full margin values, and issue to the client.</div><button style={btn("primary")} onClick={()=>pop("Submitted for director review ✓")}>Submit for Review</button></div>}
      {appStat==="submitted"&&<div style={{...card,borderColor:"#BFDBFE",background:"#EFF6FF"}}><div style={{fontWeight:800,color:"#1D4ED8",fontSize:13,marginBottom:5}}>⏳ Awaiting Finalisation</div><div style={{color:"#1E40AF",fontSize:12}}>With the director team. You'll be notified once finalised and issued to the client.</div></div>}
      {appStat==="finalised"&&<div style={{...card,borderColor:"#A7F3D0",background:"#ECFDF5"}}><div style={{fontWeight:800,color:"#065F46",fontSize:13,marginBottom:5}}>✅ Finalised & Issued</div><div style={{color:"#047857",fontSize:12}}>Finalised by the director team and issued to the client.</div></div>}
    </Shell>);
  }

  return null;
}
