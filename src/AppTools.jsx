// ─── AppTools.jsx — Embedded tools (SiteManager, SiteDocGen, AssetRegister) ──
// This file is auto-split from App.jsx for GitHub compatibility
// Import in App.jsx: import { SiteManagerView, SiteDocGeneratorView, AssetRegisterView } from './AppTools';

// ─── Site Manager App — dark theme matching Labour Schedule ───────────────────
const SiteManagerView = (()=>{

// ─── Helpers ──────────────────────────────────────────────────────────────────
const smFmt    = (n)  => `£${Math.round(n).toLocaleString("en-GB")}`;
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

const BASE_MON = new Date(2026,5,9);
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function weekMonday(off=0){ const d=new Date(BASE_MON); d.setDate(d.getDate()+off*7); return d; }
function weekDates(off=0){ const m=weekMonday(off); return Array.from({length:6},(_,i)=>{ const d=new Date(m); d.setDate(d.getDate()+i); return d; }); }
function weekKey(off=0){ const d=weekMonday(off); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function smFmtDate(d){ return `${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function dateToWK(ds){ const d=new Date(ds); const di=(d.getDay()+6)%7; const m=new Date(d); m.setDate(d.getDate()-di); return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`; }
function dateToDI(ds){ return (new Date(ds).getDay()+6)%7; }

// ─── Colour palette — matches Labour Schedule dark theme ──────────────────────
const C = {
  bg:     "#0a0e1a",   // page background
  card:   "#111827",   // card background
  card2:  "#1a1f2e",   // elevated card
  border: "#1e2535",   // borders
  border2:"#2d3555",   // lighter borders
  accent: "#3b82f6",   // blue
  green:  "#34d399",   // green
  yellow: "#fbbf24",   // amber
  red:    "#f87171",   // red
  purple: "#a78bfa",   // purple
  orange: "#f97316",   // orange
  text:   "#f1f5f9",   // primary text
  sub:    "#94a3b8",   // secondary text
  muted:  "#64748b",   // muted text
  dim:    "#374151",   // very dim
};

const RAG_C = {
  green: {bg:"#0d221844",bd:"#34d39944",col:"#34d399"},
  amber: {bg:"#1a150044",bd:"#fbbf2444",col:"#fbbf24"},
  red:   {bg:"#2d151544",bd:"#f8717144",col:"#f87171"},
};
const TRADE_COL={
  "Management":"#3b82f6","Structural":"#f97316","General":"#34d399",
  "Plant":"#fbbf24","Mechanical":"#a78bfa","Electrical":"#818cf8",
  "Masonry":"#94a3b8","Carpentry":"#2dd4bf"
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const MANAGER={name:"James Mitchell",initials:"JM"};
const SM_CATS=["Materials","Labour","Plant & Equipment","Subcontract","Preliminaries","Other"];
const TODAY="2026-06-13";

const SITES=[
  {id:1,name:"Highfield Business Park",    client:"Nexus Developments Ltd", address:"Highfield Rd, Aldershot GU11",status:"active",  appStatus:"draft",    start:"Jan 2025",end:"Aug 2025"},
  {id:2,name:"Riverside Apartments — Block C",client:"Riverside Living PLC",address:"Riverside Dr, Farnham GU9",  status:"active",  appStatus:"submitted",start:"Mar 2025",end:"Nov 2025"},
  {id:3,name:"Sainsbury's Refurb — Fleet",client:"Sainsbury's Supermarkets",address:"Fleet Rd, Fleet GU51",       status:"complete",appStatus:"finalised",start:"Nov 2024",end:"Apr 2025"},
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
  {id:1,siteId:1,scopeId:2,desc:"Steel delivery — Phase 1",   amount:14800,date:"12 May 2025",category:"Materials",        files:["invoice_steel.pdf"], status:"approved"},
  {id:2,siteId:1,scopeId:4,desc:"Cable drum & conduit supply", amount:3400, date:"20 May 2025",category:"Materials",        files:["receipt_elec.jpg"],  status:"pending"},
  {id:3,siteId:2,scopeId:7,desc:"Pump hire — concrete pour",   amount:1650, date:"30 Apr 2025",category:"Plant & Equipment",files:["hire_invoice.pdf"],  status:"approved"},
];

const INIT_VAR=[
  {id:1,siteId:1,ref:"VAR-001",title:"Additional waterproof membrane to basement",desc:"Client requested upgraded spec following high water table survey.",amount:8500,status:"pending", files:["survey_report.pdf","site_photo_001.jpg"]},
  {id:2,siteId:1,ref:"VAR-002",title:"Revised escape route — Level 2",desc:"Building control requirement following L2 design change.",amount:3200,status:"approved",files:["bcf_email.eml","revised_plan.pdf"]},
];

const LABOUR_DATA={
  1:{workers:[{id:"w1",name:"Dave Hartley",role:"Site Foreman",trade:"Management",initials:"DH",dailyRate:380},{id:"w2",name:"Mike Patel",role:"Steel Fixer",trade:"Structural",initials:"MP",dailyRate:280},{id:"w3",name:"John Walsh",role:"Steel Fixer",trade:"Structural",initials:"JW",dailyRate:270},{id:"w4",name:"Steve Clarke",role:"Labourer",trade:"General",initials:"SC",dailyRate:200},{id:"w5",name:"Ryan Brooks",role:"Plant Operator",trade:"Plant",initials:"RB",dailyRate:320},{id:"w6",name:"Lucy Chen",role:"M&E Engineer",trade:"Mechanical",initials:"LC",dailyRate:350}],
    schedule:{"2026-05-19":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,2,3,4],w4:[0,1,2,3,4],w5:[0,1,2],w6:[]},"2026-06-09":{w1:[0,1,2,3,4],w2:[0,1,2,3,4],w3:[0,1,2,3],w4:[0,1,2,3,4,5],w5:[0,2,4],w6:[2,3,4]},"2026-06-16":{w1:[0,1,2,3,4],w2:[0,1,3,4],w3:[0,1,2,3,4],w4:[1,2,3,4],w5:[0,1,2],w6:[0,1,2,3,4]}}},
  2:{workers:[{id:"w7",name:"Tom Bradley",role:"Site Foreman",trade:"Management",initials:"TB",dailyRate:360},{id:"w8",name:"Sean Murphy",role:"Bricklayer",trade:"Masonry",initials:"SM",dailyRate:260},{id:"w9",name:"Ali Hassan",role:"Carpenter",trade:"Carpentry",initials:"AH",dailyRate:250},{id:"w10",name:"Chris Ford",role:"Labourer",trade:"General",initials:"CF",dailyRate:190}],
    schedule:{"2026-06-09":{w7:[0,1,2,3,4],w8:[0,1,2,3,4],w9:[1,2,3],w10:[0,1,3,4]},"2026-06-16":{w7:[0,1,2,3,4],w8:[0,2,3,4],w9:[0,1,2,3,4],w10:[0,1,2]}}},
  3:{workers:[{id:"w11",name:"Paul Green",role:"Site Foreman",trade:"Management",initials:"PG",dailyRate:360},{id:"w12",name:"Neil Carter",role:"M&E Engineer",trade:"Mechanical",initials:"NC",dailyRate:340},{id:"w13",name:"Sam Osei",role:"Electrician",trade:"Electrical",initials:"SO",dailyRate:290}],
    schedule:{"2026-04-07":{w11:[0,1,2,3,4],w12:[0,1,2,3,4],w13:[0,1,2,3,4]}}},
};

const INIT_SIGN_INS={
  1:{"2026-06-09":{w1:2,w2:2,w3:2,w4:3,w5:3,w6:null},"2026-06-10":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:5},"2026-06-11":{w1:2,w2:2,w3:2,w4:3,w5:3,w6:5},"2026-06-12":{w1:2,w2:2,w3:2,w4:3,w5:null,w6:5},"2026-06-13":{w1:null,w2:null,w3:null,w4:3,w5:3,w6:null}},
  2:{"2026-06-09":{w7:7,w8:8,w9:null,w10:7},"2026-06-10":{w7:7,w8:8,w9:7,w10:7},"2026-06-11":{w7:7,w8:8,w9:7,w10:7},"2026-06-12":{w7:7,w8:8,w9:null,w10:7}},
  3:{},
};

// ─── Micro components ──────────────────────────────────────────────────────────
function SmBadge({s}){
  const M={
    approved:[C.green+"22",C.green,"Approved"],
    pending: [C.yellow+"22",C.yellow,"Pending"],
    rejected:[C.red+"22",C.red,"Rejected"],
    draft:   [C.border,C.muted,"Draft"],
    submitted:[C.accent+"22",C.accent,"Submitted"],
    finalised:[C.green+"22",C.green,"Finalised"],
    active:  [C.accent+"22",C.accent,"Active"],
    complete:[C.green+"22",C.green,"Complete"],
  };
  const [bg,col,lbl]=M[s]||[C.border,C.muted,s];
  return <span style={{background:bg,color:col,padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:700,border:`1px solid ${col}44`}}>{lbl}</span>;
}

function SmBar({pct,thin,color}){
  const c=color||(pct===100?C.green:pct>80?C.red:pct>60?C.yellow:C.accent);
  return <div style={{background:C.border,borderRadius:999,height:thin?3:6,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,background:c,borderRadius:999,height:"100%",transition:"width .4s ease"}}/>
  </div>;
}

function SmCrumb({crumbs}){
  return <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:14,flexWrap:"wrap"}}>
    {crumbs.map((c,i)=>(
      <span key={i} style={{display:"flex",alignItems:"center",gap:5}}>
        {i>0&&<span style={{color:C.muted,fontSize:13}}>›</span>}
        <span onClick={c.fn} style={{fontSize:12,color:c.fn?C.accent:C.sub,cursor:c.fn?"pointer":"default",fontWeight:c.fn?500:700}}>{c.label}</span>
      </span>
    ))}
  </div>;
}

function SmPill({name,onX}){
  return <span style={{background:C.card2,border:`1px solid ${C.border2}`,borderRadius:6,padding:"4px 10px",fontSize:11,color:C.sub,display:"inline-flex",alignItems:"center",gap:4}}>
    {fileIcon(name)}{name}
    {onX&&<span style={{cursor:"pointer",color:C.muted,marginLeft:2}} onClick={onX}>✕</span>}
  </span>;
}

function SmDrop({fRef,onFiles,hint}){
  return <>
    <div onClick={()=>fRef.current?.click()} style={{border:`2px dashed ${C.border2}`,borderRadius:10,padding:"22px 16px",textAlign:"center",cursor:"pointer",background:C.card}}>
      <div style={{fontSize:28,marginBottom:5}}>📎</div>
      <div style={{color:C.sub,fontSize:13,fontWeight:500}}>Click to attach files</div>
      <div style={{color:C.muted,fontSize:11,marginTop:2}}>{hint}</div>
    </div>
    <input ref={fRef} type="file" multiple style={{display:"none"}} onChange={e=>{onFiles(Array.from(e.target.files).map(f=>f.name));e.target.value="";}}/>
  </>;
}

// ─── Financial Widget ──────────────────────────────────────────────────────────
function FinancialWidget({fin,scopes,open,onToggle}){
  const tag=pctTag(fin.pctUsed);
  const rag=RAG_C[tag];
  return <div style={{background:rag.bg,border:`1px solid ${rag.bd}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        {[["Allocated Budget",smFmt(fin.allocated),C.text],["Total Spent",smFmt(fin.totalSpent),C.sub],["Remaining",fin.remaining>=0?smFmt(fin.remaining):`${smFmt(Math.abs(fin.remaining))} OVER`,fin.remaining>=0?C.green:C.red]].map(([l,v,c])=>(
          <div key={l}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:22}}>{ragDot(fin.pctUsed)}</span>
        <button onClick={onToggle} style={{background:C.card,border:`1px solid ${rag.bd}`,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:11,color:C.sub,fontWeight:700}}>
          {open?"▲ Hide":"▼ Scopes"}
        </button>
      </div>
    </div>
    <SmBar pct={fin.pctUsed} thin color={rag.col}/>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
      <span>Labour {smFmt(fin.labour)} · Expenses {smFmt(fin.expenses)}</span>
      <span style={{fontWeight:700,color:rag.col}}>{fin.pctUsed.toFixed(1)}% of budget used</span>
    </div>
    {open&&<div style={{marginTop:14,borderTop:`1px solid ${rag.bd}`,paddingTop:12,display:"flex",flexDirection:"column",gap:10}}>
      {scopes.map(s=>{
        const av=allocVal(s),lc=fin.labourByScope[s.id]||0,ec=fin.expByScope[s.id]||0,sp=lc+ec,rem=av-sp,p=av>0?sp/av*100:0,st=pctTag(p);
        return <div key={s.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:700,color:C.text}}>{s.name}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,color:C.muted}}>{smFmt(sp)} of {smFmt(av)}</span>
              <span style={{fontSize:13}}>{ragDot(p)}</span>
            </div>
          </div>
          <SmBar pct={p} thin color={RAG_C[st].col}/>
          <div style={{fontSize:10,color:C.muted,marginTop:2,display:"flex",gap:10}}>
            <span>Labour {smFmt(lc)}</span><span>Expenses {smFmt(ec)}</span>
            <span style={{color:rem>=0?C.green:C.red,fontWeight:700}}>{rem>=0?`${smFmt(rem)} left`:`${smFmt(Math.abs(rem))} OVER`}</span>
            <span style={{marginLeft:"auto",color:C.muted}}>{s.completed}% done</span>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

// ─── Shell ─────────────────────────────────────────────────────────────────────
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
  return <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",color:C.text}}>
    {/* Header */}
    <header style={{background:"#0f172a",borderBottom:`1px solid ${C.border}`,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,.4)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏗️</div>
        <div>
          <div style={{color:C.text,fontSize:14,fontWeight:800,letterSpacing:"-0.01em"}}>Site Manager</div>
          <div style={{color:C.muted,fontSize:10}}>Bright Metalwork</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{textAlign:"right"}}>
          <div style={{color:C.text,fontSize:12,fontWeight:600}}>{MANAGER.name}</div>
          <div style={{color:C.muted,fontSize:10}}>Site Manager</div>
        </div>
        <div style={{width:34,height:34,background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12}}>{MANAGER.initials}</div>
      </div>
    </header>

    {/* Nav tabs */}
    <nav style={{background:"#111827",borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto"}}>
      {navItems.map(n=>(
        <button key={n.id} onClick={()=>go(n.id)}
          style={{padding:"11px 13px",background:"none",border:"none",
            borderBottom:`2px solid ${isActive(n.id)?C.accent:"transparent"}`,
            cursor:"pointer",fontSize:11,fontWeight:700,
            color:isActive(n.id)?C.accent:C.muted,
            whiteSpace:"nowrap",transition:"color .15s"}}>
          <span style={{marginRight:3}}>{n.icon}</span>{n.label}
        </button>
      ))}
    </nav>

    <main style={{flex:1,maxWidth:860,width:"100%",margin:"0 auto",padding:"16px 16px 48px",boxSizing:"border-box"}}>
      {hasSite&&fin&&<FinancialWidget fin={fin} scopes={scopes} open={widgetOpen} onToggle={onWidgetToggle}/>}
      {children}
    </main>

    {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:C.green,color:"#0a1a10",padding:"11px 24px",borderRadius:10,fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(52,211,153,.4)",zIndex:9999,whiteSpace:"nowrap"}}>{toast}</div>}
  </div>;
}

// ─── Shared card / section styles ─────────────────────────────────────────────
const smCard={background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14};
const smBtn=(pri)=>({padding:"8px 16px",borderRadius:8,border:pri?"none":`1px solid ${C.border2}`,background:pri?"linear-gradient(135deg,#1e3a5f,#3b82f6)":C.card,color:pri?C.text:C.sub,cursor:"pointer",fontSize:12,fontWeight:700});
const smInp={width:"100%",background:C.card,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
const smSel={...smInp,cursor:"pointer"};
const smTH={padding:"8px 12px",background:"#0d1117",color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"left",borderBottom:`1px solid ${C.border}`};
const smTD={padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.text};

function pop(setToast,msg){setToast(msg);setTimeout(()=>setToast(null),2400);}
function SmSec({title,action,children}){
  return <div style={smCard}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{fontSize:12,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{title}</div>
      {action}
    </div>
    {children}
  </div>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
return function SiteManagerView(){
  const [view,setView]       =useState("dashboard");
  const [siteId,setSiteId]   =useState(null);
  const [scopeId,setScopeId] =useState(null);
  const [scopes,setScopes]   =useState(INIT_SCOPES);
  const [expenses,setExp]    =useState(INIT_EXP);
  const [variations,setVar]  =useState(INIT_VAR);
  const [signIns,setSignIns] =useState(INIT_SIGN_INS);
  const [scopePct,setScopePct]=useState(null);
  const [weekOffset,setWeekOff]=useState(0);
  const [widgetOpen,setWidgetOpen]=useState(false);
  const [signInDate,setSignInDate]=useState(TODAY);
  const [draftSI,setDraftSI] =useState(null);
  const [expForm,setEF]=useState({desc:"",amount:"",category:"Materials",scopeId:"",date:"",files:[]});
  const [varForm,setVF]=useState({title:"",desc:"",amount:"",files:[]});
  const [toast,setToast]=useState(null);
  const expRef=useRef(); const varRef=useRef();

  const go=(v,opts={})=>{
    setView(v);
    if(opts.siteId!==undefined) setSiteId(opts.siteId);
    if(opts.scopeId!==undefined) setScopeId(opts.scopeId);
    if(opts.pct!==undefined) setScopePct(opts.pct);
  };
  const site=SITES.find(s=>s.id===siteId);
  const siteSc=siteId?scopes[siteId]||[]:[];
  const siteLD=siteId?LABOUR_DATA[siteId]:null;
  const siteSI=siteId?signIns[siteId]||{}:{};

  const fin=siteId?(()=>{
    const ss=scopes[siteId]||[];
    const allocated=ss.reduce((a,s)=>a+allocVal(s),0);
    const labourByScope={};
    const expByScope={};
    Object.entries(siteSI).forEach(([date,day])=>{
      Object.entries(day).forEach(([wid,sid])=>{
        if(!sid) return;
        const w=siteLD?.workers.find(x=>x.id===wid);
        if(!w) return;
        labourByScope[sid]=(labourByScope[sid]||0)+w.dailyRate;
      });
    });
    (expenses.filter(e=>e.siteId===siteId)).forEach(e=>{
      expByScope[e.scopeId]=(expByScope[e.scopeId]||0)+e.amount;
    });
    const labour=Object.values(labourByScope).reduce((a,v)=>a+v,0);
    const exps=Object.values(expByScope).reduce((a,v)=>a+v,0);
    const totalSpent=labour+exps;
    const remaining=allocated-totalSpent;
    const pctUsed=allocated>0?totalSpent/allocated*100:0;
    return{allocated,labour,expenses:exps,totalSpent,remaining,pctUsed,labourByScope,expByScope};
  })():null;

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if(view==="dashboard") return <Shell view={view} siteId={null} go={(v)=>go(v)} toast={toast} fin={null} scopes={[]} widgetOpen={false} onWidgetToggle={()=>{}}>
    <div style={{marginBottom:20}}>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:2}}>My Sites</div>
      <div style={{fontSize:12,color:C.muted}}>Welcome back, {MANAGER.name}</div>
    </div>
    {SITES.map(s=>{
      const ss=scopes[s.id]||[];
      const totalVal=ss.reduce((a,x)=>a+x.total,0);
      const avgDone=ss.length?ss.reduce((a,x)=>a+x.completed,0)/ss.length:0;
      return <div key={s.id} onClick={()=>go("site",{siteId:s.id})}
        style={{...smCard,cursor:"pointer",borderLeft:`3px solid ${s.status==="complete"?C.green:C.accent}`,
          transition:"border-color .15s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{s.name}</div>
            <div style={{fontSize:11,color:C.muted}}>{s.client} · {s.address}</div>
          </div>
          <SmBadge s={s.status}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          {[["Contract Value",smFmt(totalVal),C.accent],["Avg Progress",avgDone.toFixed(0)+"%",avgDone===100?C.green:C.yellow],["Scopes",ss.length+" items",C.sub]].map(([l,v,col])=>(
            <div key={l} style={{background:C.bg,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:14,fontWeight:800,color:col,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        <SmBar pct={avgDone}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:C.muted}}>
          <span>{s.start} — {s.end}</span>
          <span style={{color:C.accent,fontWeight:600}}>Open site →</span>
        </div>
      </div>;
    })}
  </Shell>;

  // ── SITE OVERVIEW ─────────────────────────────────────────────────────────
  if(view==="site"&&site) return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
    <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name}]}/>
    <div style={{...smCard}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div><div style={{fontSize:18,fontWeight:800,color:C.text}}>{site.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{site.client} · {site.address}</div></div>
        <SmBadge s={site.status}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Start",site.start],["End",site.end],["PA Status",site.appStatus],["Scopes",siteSc.length+" items"]].map(([l,v])=>(
          <div key={l} style={{background:C.bg,borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{l}</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {[["📁 Scopes","scopes",C.accent],["👷 Labour","labour",C.purple],["✅ Sign-In","signin",C.green],["🧾 Expenses","expenses",C.yellow],["📐 Variations","variations",C.orange],["📊 Application","application",C.red]].map(([l,v,col])=>(
        <button key={v} onClick={()=>go(v,{siteId})}
          style={{padding:"14px 16px",background:C.card2,border:`1px solid ${col}33`,borderRadius:10,cursor:"pointer",textAlign:"left",transition:"border-color .15s"}}>
          <div style={{fontSize:16,marginBottom:4}}>{l.split(" ")[0]}</div>
          <div style={{fontSize:13,fontWeight:700,color:col}}>{l.split(" ").slice(1).join(" ")}</div>
        </button>
      ))}
    </div>
  </Shell>;

  // ── SCOPES ─────────────────────────────────────────────────────────────────
  if(view==="scopes"&&site) return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
    <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Scopes"}]}/>
    {siteSc.map(s=>{
      const av=allocVal(s),lab=fin?.labourByScope[s.id]||0,exp=fin?.expByScope[s.id]||0,sp=lab+exp,rem=av-sp,p=av>0?sp/av*100:0,st=pctTag(p);
      return <div key={s.id} style={{...smCard,borderLeft:`3px solid ${RAG_C[st].col}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{s.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>{ragDot(p)}</span>
            <SmBadge s={s.completed===100?"complete":"active"}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
          {[["Contract",smFmt(s.total),C.accent],["Budget",smFmt(av),C.text],["Spent",smFmt(sp),sp>av?C.red:C.sub],["Remaining",rem>=0?smFmt(rem):`${smFmt(Math.abs(rem))} OVER`,rem>=0?C.green:C.red]].map(([l,v,c])=>(
            <div key={l} style={{background:C.bg,borderRadius:7,padding:"7px 9px"}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:c,marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        <SmBar pct={p} color={RAG_C[st].col}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:10,color:C.muted}}>
          <span>Work done: <b style={{color:C.text}}>{s.completed}%</b></span>
          <span>{p.toFixed(0)}% of budget used</span>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Completion Progress</div>
          <SmBar pct={s.completed} color={s.completed===100?C.green:C.accent}/>
        </div>
      </div>;
    })}
  </Shell>;

  // ── LABOUR ─────────────────────────────────────────────────────────────────
  if(view==="labour"&&site&&siteLD) return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
    <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Labour"}]}/>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <button onClick={()=>setWeekOff(o=>o-1)} style={{...smBtn(false),padding:"6px 12px"}}>←</button>
      <div style={{flex:1,textAlign:"center"}}>
        <div style={{fontWeight:700,color:C.text,fontSize:14}}>WC {smFmtDate(weekMonday(weekOffset))}</div>
        <div style={{fontSize:10,color:C.muted}}>Week {weekOffset===0?"(Current)":weekOffset>0?`+${weekOffset}`:`${weekOffset}`}</div>
      </div>
      <button onClick={()=>setWeekOff(o=>o+1)} style={{...smBtn(false),padding:"6px 12px"}}>→</button>
    </div>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
        <thead><tr>
          <th style={smTH}>Worker</th>
          {weekDates(weekOffset).map(d=><th key={d} style={{...smTH,textAlign:"center",minWidth:48}}>{smFmtDate(d)}</th>)}
          <th style={{...smTH,textAlign:"right"}}>Days</th>
          <th style={{...smTH,textAlign:"right"}}>Cost</th>
        </tr></thead>
        <tbody>
          {siteLD.workers.map((w,i)=>{
            const wk=weekKey(weekOffset);
            const sched=siteLD.schedule[wk]?.[w.id]||[];
            const days=sched.length;
            return <tr key={w.id} style={{background:i%2===0?C.card:"#0f1421"}}>
              <td style={smTD}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:7,background:(TRADE_COL[w.trade]||C.accent)+"22",border:`1px solid ${(TRADE_COL[w.trade]||C.accent)}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:TRADE_COL[w.trade]||C.accent}}>{w.initials}</div>
                  <div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{w.name}</div><div style={{fontSize:10,color:C.muted}}>{w.role}</div></div>
                </div>
              </td>
              {weekDates(weekOffset).map((d,di)=>{
                const on=sched.includes(di);
                return <td key={d} style={{...smTD,textAlign:"center"}}>
                  <div style={{width:24,height:24,borderRadius:5,background:on?(TRADE_COL[w.trade]||C.accent)+"33":"transparent",border:`1px solid ${on?(TRADE_COL[w.trade]||C.accent)+"66":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:12}}>
                    {on?"✓":""}
                  </div>
                </td>;
              })}
              <td style={{...smTD,textAlign:"right",color:C.accent,fontWeight:700}}>{days}</td>
              <td style={{...smTD,textAlign:"right",color:C.green,fontWeight:700}}>{smFmt(days*w.dailyRate)}</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  </Shell>;

  // ── SIGN-IN ────────────────────────────────────────────────────────────────
  if(view==="signin"&&site&&siteLD){
    const dayKey=signInDate;
    const dayData=siteSI[dayKey]||{};
    const draft=draftSI||Object.fromEntries(siteLD.workers.map(w=>[w.id,dayData[w.id]!==undefined?dayData[w.id]:null]));
    const save=()=>{setSignIns(si=>({...si,[siteId]:{...si[siteId],[dayKey]:draft}}));setDraftSI(null);pop(setToast,"Sign-in saved ✓");};
    return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Daily Sign-In"}]}/>
      <div style={{...smCard,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Date</div>
            <input type="date" value={signInDate} onChange={e=>{setSignInDate(e.target.value);setDraftSI(null);}} style={{...smInp}}/>
          </div>
          <button onClick={save} style={{...smBtn(true),marginTop:16,whiteSpace:"nowrap"}}>Save Sign-In</button>
        </div>
      </div>
      <div style={{border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={smTH}>Worker</th>
            <th style={smTH}>Trade</th>
            <th style={{...smTH,textAlign:"center"}}>Present</th>
            <th style={smTH}>Scope</th>
          </tr></thead>
          <tbody>
            {siteLD.workers.map((w,i)=>{
              const present=draft[w.id]!==null&&draft[w.id]!==undefined&&draft[w.id]!==false;
              const sc=present?draft[w.id]:null;
              return <tr key={w.id} style={{background:i%2===0?C.card:"#0f1421"}}>
                <td style={smTD}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:7,background:(TRADE_COL[w.trade]||C.accent)+"22",border:`1px solid ${(TRADE_COL[w.trade]||C.accent)}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:TRADE_COL[w.trade]||C.accent}}>{w.initials}</div>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{w.name}<div style={{fontSize:10,color:C.muted}}>{w.role}</div></div>
                  </div>
                </td>
                <td style={smTD}><span style={{color:TRADE_COL[w.trade]||C.accent,fontSize:11,fontWeight:600}}>{w.trade}</span></td>
                <td style={{...smTD,textAlign:"center"}}>
                  <div onClick={()=>setDraftSI(d=>({...d,[w.id]:present?null:(siteSc[0]?.id||null)}))}
                    style={{width:28,height:28,borderRadius:7,background:present?C.green+"22":C.card,border:`2px solid ${present?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",margin:"0 auto",fontSize:14,fontWeight:700,color:present?C.green:C.dim}}>
                    {present?"✓":""}
                  </div>
                </td>
                <td style={smTD}>
                  {present
                    ?<select value={sc||""} onChange={e=>setDraftSI(d=>({...d,[w.id]:Number(e.target.value)||null}))} style={{...smSel,width:"100%"}}>
                        <option value="">— Scope —</option>
                        {siteSc.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    :<span style={{fontSize:11,color:C.dim}}>—</span>}
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </Shell>;
  }

  // ── EXPENSES ───────────────────────────────────────────────────────────────
  if((view==="expenses"||view==="expense-new")&&site){
    const siteExp=expenses.filter(e=>e.siteId===siteId);
    if(view==="expense-new") return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Expenses",fn:()=>go("expenses",{siteId})},{label:"New Expense"}]}/>
      <div style={smCard}>
        {[["Description","text","desc","Steel delivery…"],["Amount £","number","amount","0.00"],["Date","date","date",""]].map(([l,t,k,ph])=>(
          <div key={k} style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <input type={t} value={expForm[k]} onChange={e=>setEF(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={smInp}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Category</div>
          <select value={expForm.category} onChange={e=>setEF(f=>({...f,category:e.target.value}))} style={smSel}>
            {SM_CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Scope</div>
          <select value={expForm.scopeId} onChange={e=>setEF(f=>({...f,scopeId:e.target.value}))} style={smSel}>
            <option value="">— Select scope —</option>
            {siteSc.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Attachments</div>
          <SmDrop fRef={expRef} onFiles={fs=>setEF(f=>({...f,files:[...f.files,...fs]}))} hint="Invoices, receipts, photos"/>
          {expForm.files.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{expForm.files.map((n,i)=><SmPill key={i} name={n} onX={()=>setEF(f=>({...f,files:f.files.filter((_,j)=>j!==i)}))}/>)}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>go("expenses",{siteId})} style={{...smBtn(false),flex:1}}>Cancel</button>
          <button onClick={()=>{if(!expForm.desc||!expForm.amount)return;setExp(ex=>[...ex,{id:Date.now(),siteId,scopeId:Number(expForm.scopeId)||null,desc:expForm.desc,amount:Number(expForm.amount),date:expForm.date||TODAY,category:expForm.category,files:expForm.files,status:"pending"}]);setEF({desc:"",amount:"",category:"Materials",scopeId:"",date:"",files:[]});go("expenses",{siteId});pop(setToast,"Expense submitted ✓");}} style={{...smBtn(true),flex:2}}>Submit Expense</button>
        </div>
      </div>
    </Shell>;

    return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Expenses"}]}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button onClick={()=>go("expense-new",{siteId})} style={smBtn(true)}>+ New Expense</button>
      </div>
      {siteExp.length===0&&<div style={{...smCard,textAlign:"center",color:C.muted,padding:32}}>No expenses yet.</div>}
      {siteExp.map(e=>(
        <div key={e.id} style={{...smCard,borderLeft:`3px solid ${e.status==="approved"?C.green:e.status==="pending"?C.yellow:C.red}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,flex:1,marginRight:10}}>{e.desc}</div>
            <SmBadge s={e.status}/>
          </div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:C.muted}}>
            <span style={{color:C.green,fontWeight:700,fontSize:14}}>{smFmt(e.amount)}</span>
            <span>{e.category}</span><span>{e.date}</span>
            {e.scopeId&&<span style={{color:C.accent}}>{siteSc.find(s=>s.id===e.scopeId)?.name||"—"}</span>}
          </div>
          {e.files.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{e.files.map((n,i)=><SmPill key={i} name={n}/>)}</div>}
        </div>
      ))}
    </Shell>;
  }

  // ── VARIATIONS ─────────────────────────────────────────────────────────────
  if((view==="variations"||view==="variation-new")&&site){
    const siteVar=variations.filter(v=>v.siteId===siteId);
    if(view==="variation-new") return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Variations",fn:()=>go("variations",{siteId})},{label:"New Variation"}]}/>
      <div style={smCard}>
        {[["Title","text","title","e.g. Additional steelwork to level 3"],["Description","text","desc","Reason / instruction reference…"],["Amount £","number","amount","0.00"]].map(([l,t,k,ph])=>(
          <div key={k} style={{marginBottom:12}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
            <input type={t} value={varForm[k]} onChange={e=>setVF(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={smInp}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Supporting Files</div>
          <SmDrop fRef={varRef} onFiles={fs=>setVF(f=>({...f,files:[...f.files,...fs]}))} hint="Emails, drawings, photos"/>
          {varForm.files.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{varForm.files.map((n,i)=><SmPill key={i} name={n} onX={()=>setVF(f=>({...f,files:f.files.filter((_,j)=>j!==i)}))}/>)}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>go("variations",{siteId})} style={{...smBtn(false),flex:1}}>Cancel</button>
          <button onClick={()=>{if(!varForm.title||!varForm.amount)return;const n=siteVar.length+1;setVar(vs=>[...vs,{id:Date.now(),siteId,ref:`VAR-${String(n).padStart(3,"0")}`,title:varForm.title,desc:varForm.desc,amount:Number(varForm.amount),status:"pending",files:varForm.files}]);setVF({title:"",desc:"",amount:"",files:[]});go("variations",{siteId});pop(setToast,"Variation submitted ✓");}} style={{...smBtn(true),flex:2}}>Submit Variation</button>
        </div>
      </div>
    </Shell>;

    return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Variations"}]}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button onClick={()=>go("variation-new",{siteId})} style={smBtn(true)}>+ New Variation</button>
      </div>
      {siteVar.map(v=>(
        <div key={v.id} style={{...smCard,borderLeft:`3px solid ${v.status==="approved"?C.green:v.status==="pending"?C.yellow:C.red}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,fontFamily:"monospace",marginBottom:2}}>{v.ref}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{v.title}</div>
            </div>
            <SmBadge s={v.status}/>
          </div>
          {v.desc&&<div style={{fontSize:12,color:C.sub,marginBottom:8,lineHeight:1.5}}>{v.desc}</div>}
          <div style={{fontSize:14,fontWeight:800,color:C.orange,marginBottom:8}}>{smFmt(v.amount)}</div>
          {v.files.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{v.files.map((n,i)=><SmPill key={i} name={n}/>)}</div>}
        </div>
      ))}
    </Shell>;
  }

  // ── PAYMENT APPLICATION ────────────────────────────────────────────────────
  if(view==="application"&&site){
    const appStat=site.appStatus;
    const approvedVars=variations.filter(v=>v.siteId===siteId&&v.status==="approved");
    const varTotal=approvedVars.reduce((a,v)=>a+v.amount,0);
    const scopeTotal=siteSc.reduce((a,s)=>a+earnedVal(s),0);
    return <Shell {...{view,siteId,go:(v)=>go(v,{siteId}),toast,fin,scopes:siteSc,widgetOpen,onWidgetToggle:()=>setWidgetOpen(o=>!o)}}>
      <SmCrumb crumbs={[{label:"My Sites",fn:()=>go("dashboard")},{label:site.name,fn:()=>go("site",{siteId})},{label:"Payment Application"}]}/>
      <div style={{...smCard,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:700,color:C.sub}}>Application Status</div>
        <SmBadge s={appStat}/>
      </div>
      <div style={{border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"9px 14px",background:"#0d1117",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Scope Breakdown — Earned Value</div>
        </div>
        {siteSc.map((s,i)=>(
          <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:i%2===0?C.card:"#0f1421",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text,flex:1}}>{s.name}</div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.accent}}>{smFmt(earnedVal(s))}</div>
              <div style={{fontSize:10,color:C.muted}}>{s.completed}% of {smFmt(allocVal(s))}</div>
            </div>
          </div>
        ))}
        <div style={{padding:"10px 14px",background:"#0d1117",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,fontSize:12,color:C.sub}}>Scopes Subtotal</span>
          <span style={{fontWeight:800,fontSize:14,color:C.green}}>{smFmt(scopeTotal)}</span>
        </div>
      </div>
      {approvedVars.length>0&&<div style={{border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"9px 14px",background:"#0d1117",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Approved Variations</div>
        </div>
        {approvedVars.map(v=><div key={v.id} style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",background:C.card}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text}}>{v.ref} — {v.title}</div>
          <div style={{fontWeight:800,color:C.orange}}>{smFmt(v.amount)}</div>
        </div>)}
        <div style={{padding:"10px 14px",background:"#0d1117",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:700,fontSize:12,color:C.sub}}>Variations Subtotal</span>
          <span style={{fontWeight:800,fontSize:14,color:C.orange}}>{smFmt(varTotal)}</span>
        </div>
      </div>}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#1a1f2e)",border:`1px solid ${C.accent}44`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Manager's Total (excl. margin)</div>
          <div style={{color:C.sub,fontSize:11,marginTop:1}}>Director will add margin values before issuing to client</div>
        </div>
        <div style={{color:C.green,fontSize:28,fontWeight:900}}>{smFmt(scopeTotal+varTotal)}</div>
      </div>
      {appStat==="draft"&&<div style={{...smCard,border:`1px solid ${C.yellow}44`,background:C.yellow+"11"}}>
        <div style={{fontWeight:800,color:C.yellow,fontSize:13,marginBottom:5}}>⚠️ Submit for Director Review</div>
        <div style={{color:C.sub,fontSize:12,marginBottom:12,lineHeight:1.5}}>Once submitted the director and finance team will review, add full margin values, and issue to the client.</div>
        <button style={smBtn(true)} onClick={()=>pop(setToast,"Submitted for director review ✓")}>Submit for Review</button>
      </div>}
      {appStat==="submitted"&&<div style={{...smCard,border:`1px solid ${C.accent}44`,background:C.accent+"11"}}>
        <div style={{fontWeight:800,color:C.accent,fontSize:13,marginBottom:5}}>⏳ Awaiting Finalisation</div>
        <div style={{color:C.sub,fontSize:12}}>With the director team. You'll be notified once finalised and issued to the client.</div>
      </div>}
      {appStat==="finalised"&&<div style={{...smCard,border:`1px solid ${C.green}44`,background:C.green+"11"}}>
        <div style={{fontWeight:800,color:C.green,fontSize:13,marginBottom:5}}>✅ Finalised & Issued</div>
        <div style={{color:C.sub,fontSize:12}}>Finalised by the director team and issued to the client.</div>
      </div>}
    </Shell>;
  }

  return null;
};

})();
// ─── Site Doc Generator (self-contained IIFE — zero scope conflicts) ─────────
const SiteDocGeneratorView = (()=>{

// ═══════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════

const DEMO_SITES = [
  {
    id: "s1", name: "Paddington Station", address: "Praed St, London W2 1HQ",
    scope: "External façade works – structural repointing and brick replacement",
    supervisor: { name: "Marcus Webb", phone: "07700 900123" },
    workers: [
      { id: "w1", name: "Tom Bradley", role: "Scaffolder" },
      { id: "w2", name: "Sarah Chen", role: "Bricklayer" },
      { id: "w3", name: "Dev Patel", role: "Labourer" },
      { id: "w4", name: "James O'Brien", role: "Foreman" },
    ],
  },
  {
    id: "s2", name: "Canary Wharf – Tower B", address: "Bank St, London E14 5JP",
    scope: "Internal fit-out – MEP first fix and structural steelwork",
    supervisor: { name: "Lisa Park", phone: "07700 900456" },
    workers: [
      { id: "w5", name: "Ahmed Khalil", role: "Steel Erector" },
      { id: "w6", name: "Emma Thornton", role: "Electrician" },
      { id: "w7", name: "Carlos Mendez", role: "Pipefitter" },
      { id: "w8", name: "Priya Singh", role: "Site Manager" },
      { id: "w9", name: "Noel Byrne", role: "Labourer" },
    ],
  },
];

const CATEGORIES = [
  { id: "safety",     label: "Safety",               color: "#F5A623" },
  { id: "inspection", label: "Pre-Use Inspections",  color: "#3B82F6" },
  { id: "lifting",    label: "Lifting",              color: "#7C3AED" },
  { id: "qa",         label: "Quality Assurance",    color: "#0D9488" },
  { id: "legal",      label: "Legal",                color: "#DC2626" },
];

const DOC_TYPES = [
  { id: "daily_safe_start", label: "Daily Safe Start",       cat: "safety",     desc: "Pre-work briefing, hazard ID & team sign-off" },
  { id: "toolbox_talk",     label: "Toolbox Talk",           cat: "safety",     desc: "Focused safety topic with attendance record" },
  { id: "puwer",            label: "PUWER Assessment",       cat: "safety",     desc: "Provision & Use of Work Equipment Regulations" },
  { id: "loler",            label: "LOLER Checklist",        cat: "safety",     desc: "Lifting Operations & Lifting Equipment Regs" },
  { id: "coshh",            label: "COSHH Assessment",       cat: "safety",     desc: "Control of Substances Hazardous to Health" },
  { id: "task_briefing",    label: "Task Briefing",          cat: "safety",     desc: "Method statement briefing & team sign-off" },
  { id: "harness",          label: "Harness Inspection",     cat: "inspection", desc: "Full-body harness pre-use checklist" },
  { id: "scissor_lift",     label: "Scissor Lift",           cat: "inspection", desc: "Aerial work platform pre-use check" },
  { id: "cherry_picker",    label: "Cherry Picker",          cat: "inspection", desc: "MEWP / boom lift pre-use inspection" },
  { id: "spider_crane",     label: "Spider Crane",           cat: "inspection", desc: "Mini crawler crane pre-use check" },
  { id: "pat_testing",      label: "PAT Testing Record",     cat: "lifting",    desc: "Portable appliance test record" },
  { id: "thorough_exam",    label: "Thorough Examination",   cat: "lifting",    desc: "LOLER thorough examination certificate" },
  { id: "qa_handover",      label: "QA Handover Form",       cat: "qa",         desc: "Quality assurance sign-off for completed works" },
  { id: "ncr",              label: "NCR Form",               cat: "qa",         desc: "Non-Conformance Report" },
  { id: "early_delay",      label: "Early Delay Notice",     cat: "legal",      desc: "Early warning of potential delay event" },
  { id: "delay_notice",     label: "Delay Notice",           cat: "legal",      desc: "Formal notice of delay and compensation claim" },
];

const CL = {
  harness: {
    s: null, sc: null,
    items: [
      "Webbing – cuts, fraying, abrasion, heat or chemical damage",
      "Stitching – all intact, no broken threads",
      "Back D-ring – no deformation, cracks or corrosion",
      "Front / chest D-ring – secure, no deformation",
      "Buckles & adjusters – undamaged, function correctly",
      "Leg straps – no twisting, correct routing",
      "Shoulder straps – no deformation, correct routing",
      "Connectors / karabiners – gate closes and locks",
      "Lanyard / energy absorber – no deployment triggered",
      "ID label – serial number and manufacture date legible",
    ],
  },
  scissor_lift: {
    s: ["External", "Ground controls", "Platform", "Platform controls", "Safety devices"],
    sc: [3, 3, 4, 4, 2],
    items: [
      "Body panels – no significant damage or missing sections",
      "Tyres / wheels – correct pressure, no damage",
      "Hydraulic lines – no visible leaks or damage",
      "Emergency lowering function – operates correctly",
      "Ground control panel – labelling legible, switches functional",
      "Battery / fuel level – adequate for task",
      "Platform floor – anti-slip surface intact",
      "Guardrails – all in place, no deformation",
      "Mid-rails and toe-boards – present and secure",
      "Platform gate – closes and latches correctly",
      "Control panel – all labels legible",
      "Drive / steer controls – smooth, self-centring",
      "Lift / lower controls – smooth, correct speed",
      "Emergency stop – tested and functional",
      "Pothole protection / outriggers – deploy and lock",
      "Tilt sensor / alarm – tested and operational",
    ],
  },
  cherry_picker: {
    s: ["External", "Boom", "Outriggers", "Platform / basket", "Ground controls", "Platform controls", "Safety devices"],
    sc: [3, 3, 3, 3, 3, 3, 2],
    items: [
      "Body – no significant damage, leaks or missing guards",
      "Engine / battery – fluid levels correct, no leaks",
      "Drive system – tyres / tracks in good condition",
      "Boom sections – no cracks, buckles or deformation",
      "Boom seals – no hydraulic leaks at cylinders",
      "Rotation system – slewing smooth, locks correctly",
      "Outrigger legs – extend and retract fully",
      "Outrigger pads – present, in good condition",
      "Machine levelling – achieves level within tolerance",
      "Basket floor and sides – no cracks or missing sections",
      "Guardrails – all present, height correct",
      "Anchor point – rated, no deformation",
      "Ground control panel – all functions operate correctly",
      "Emergency descent – tested and operational",
      "Key switch / access control – functioning",
      "Control panel – legible, all switches functional",
      "Joystick / controls – smooth, self-centring",
      "Emergency stop on platform – tested",
      "Overload indicator – present and functional",
      "Envelope / height limiter – set and tested",
    ],
  },
  spider_crane: {
    s: ["Outrigger legs", "Boom & structure", "Wire rope & hoist", "Hook & lifting gear", "Controls & drive", "Safety & hydraulics"],
    sc: [3, 3, 3, 4, 3, 4],
    items: [
      "All four legs extend fully, locking pins secure",
      "Outrigger pads in place, adequate bearing capacity",
      "Machine levels within tolerance before lift",
      "Main boom sections – no cracks, welds sound",
      "Hinge pins fully inserted with retaining clips",
      "Hydraulic cylinders – no leaks at seals",
      "Wire rope – no broken strands, kinks or corrosion",
      "Rope anchoring on drum correct, min 3 turns remaining",
      "Sheaves / rollers – no cracking, rotate freely",
      "Hook – no deformation, latch closes and holds",
      "Hook swivel rotates freely",
      "Sling / chain certificate – in date",
      "Shackles / slings in use – rated, no damage",
      "Radio / pendant controls – all functions tested",
      "E-stop on remote and machine – tested",
      "Slew / boom controls – smooth, no drift",
      "SLI (safe load indicator) – calibrated, alarm sounds",
      "Hydraulic fluid level – within acceptable range",
      "All hydraulic connections tight, no weeping",
      "Anti-two-block device – present and functional",
    ],
  },
};

const QA_ITEMS = [
  "Workmanship meets specification",
  "Materials correct type and grade as specified",
  "Dimensions within tolerance per drawings",
  "Surface finish meets required standard",
  "Fixings / connections correctly installed",
  "Waterproofing / sealing correctly applied",
  "Adequate protection applied post-installation",
  "As-built record / marked-up drawing available",
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toLocaleDateString("en-GB");
const CAT_COLOR = { safety: "#F5A623", inspection: "#3B82F6", lifting: "#7C3AED", qa: "#0D9488", legal: "#DC2626" };
const RESP_ROLES = ["foreman", "supervisor", "site manager", "manager"];

function itemSection(docId, idx) {
  const cl = CL[docId];
  if (!cl?.s) return null;
  let c = 0;
  for (let si = 0; si < cl.s.length; si++) {
    c += cl.sc[si];
    if (idx < c) return cl.s[si];
  }
  return null;
}

function initChecks(docId) {
  const cl = CL[docId];
  if (!cl) return {};
  return cl.items.reduce((a, _, i) => { a[i] = { r: "", n: "" }; return a; }, {});
}

function initFd(dt, site) {
  return {
    date: today(), site: site?.name || "", address: site?.address || "",
    scope: site?.scope || "", supervisor: site?.supervisor?.name || "",
    supPhone: site?.supervisor?.phone || "", preparedBy: site?.supervisor?.name || "",
    topic: "", hazards: "", controls: "", ppe: "", emergencyProc: "",
    methodRef: "", taskDesc: "", resources: "", taskRisks: "", taskControls: "",
    equipment: "", equipmentId: "", make: "", model: "",
    riskLevel: "", frequency: "", maintenance: "", training: "",
    substance: "", supplier: "", hazardType: "", exposureLimits: "",
    healthEffects: "", exposureRoutes: "", cohhControls: "", cohhPpe: "", emergencyActions: "",
    liftingEquip: "", swl: "", liftPlan: "", examDate: "", nextExam: "", examRef: "",
    applianceDesc: "", assetNo: "", location: "", testedBy: "",
    visualPass: "", earthPass: "", insulationPass: "", polarityPass: "", patResult: "", nextTestDate: "",
    examEquipment: "", examId: "", examSWL: "", examiner: "", examBody: "",
    conditionRating: "", defectsDesc: "", safeForUse: "", nextExamDate: "",
    contractRef: "", workPackage: "", deficiencies: "",
    qaItems: QA_ITEMS.map(item => ({ item, result: "", notes: "" })),
    ncrRef: "", ncrDesc: "", rootCause: "", correctiveAction: "", targetDate: "", closedBy: "",
    contractNo: "", employer: "", contractor: "", programmeRef: "",
    eventDate: today(), eventDesc: "", delayWeeks: "", costImpact: "", delayImpact: "", replyBy: "",
    checks: initChecks(dt.id), result: "", notes: "",
    attendees: (site?.workers || []).map(w => ({
      ...w, present: true,
      responsible: RESP_ROLES.some(r => w.role?.toLowerCase().includes(r)),
    })),
  };
}

async function loadDocs() {
  try {
    const raw = localStorage.getItem("bm_site_documents");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

async function saveDoc(doc, existing) {
  try {
    const updated = [...(existing || []).filter(d => d.id !== doc.id), doc];
    localStorage.setItem("bm_site_documents", JSON.stringify(updated));
    return updated;
  } catch (_) { return existing || []; }
}

// ═══════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════

const BG = "#F5F4F0", DARK = "#111318", HDR = "#0F1117", AMB = "#F5A623",
  GY1 = "#F3F4F6", GY2 = "#E5E7EB", GY3 = "#D1D5DB",
  GY5 = "#6B7280", GY6 = "#4B5563", GY7 = "#374151", GY8 = "#1F2937",
  GRN = "#15803D", GBG = "#DCFCE7", GRL = "#86EFAC",
  RED = "#DC2626", RBG = "#FEE2E2",
  BLU = "#1D4ED8", BBG = "#DBEAFE";

const inp = {
  width: "100%", padding: "7px 10px", border: `1px solid ${GY3}`,
  borderRadius: 6, fontSize: 13, color: GY8, background: "#fff",
  boxSizing: "border-box", fontFamily: "inherit",
};
const ta = { ...inp, resize: "vertical", minHeight: 70, lineHeight: 1.5 };
const lbl = {
  fontSize: 10, fontWeight: 600, color: GY5,
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3, display: "block",
};

// ═══════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════

function Field({ label, value, onChange, multi, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      {label && <label style={lbl}>{label}</label>}
      {multi
        ? <textarea style={ta} value={value || ""} onChange={e => onChange?.(e.target.value)} />
        : <input style={inp} value={value || ""} onChange={e => onChange?.(e.target.value)} />}
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${GY2}`, borderRadius: 10, padding: "14px 17px", marginBottom: 12 }}>
      <p style={{ margin: "0 0 11px", fontSize: 10, fontWeight: 700, color: GY5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 11 }}>
      {children}
    </div>
  );
}

function DocCard({ dt, onClick, count }) {
  const cc = CAT_COLOR[dt.cat];
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? GY1 : "#fff", border: `1px solid ${GY2}`,
        borderLeft: `3px solid ${cc}`, borderRadius: 0,
        padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "background 0.1s",
      }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GY8 }}>{dt.label}</p>
      <p style={{ margin: "3px 0 0", fontSize: 11, color: GY5 }}>{dt.desc}</p>
      {count > 0 && <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, color: cc }}>{count} saved</p>}
    </button>
  );
}

function IBlock({ label, value }) {
  return (
    <div style={{ flex: 1, minWidth: 140 }}>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: GY7 }}>{value || "—"}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════

function Sidebar({ sites, sel, setSel, sync, syncSt, onRep, docsCount }) {
  return (
    <aside style={{ width: 210, background: DARK, display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
      <div style={{ padding: "16px 13px 11px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
          <div style={{ width: 26, height: 26, background: AMB, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: DARK }}>SD</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Site Docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: syncSt === "live" ? "#22C55E" : AMB }} />
          <span style={{ fontSize: 10, color: syncSt === "live" ? "#86EFAC" : "#FCD34D" }}>
            {syncSt === "live" ? "Live – Labour Schedule" : "Demo mode"}
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 7px", flex: 1, overflowY: "auto" }}>
        <p style={{ margin: "0 0 5px", color: "rgba(255,255,255,0.28)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 6px" }}>Sites</p>
        {sites.map(s => (
          <button key={s.id} onClick={() => setSel(s)} style={{
            width: "100%", textAlign: "left", padding: "7px 7px", borderRadius: 6, border: "none", cursor: "pointer",
            background: sel?.id === s.id ? "rgba(245,166,35,0.12)" : "transparent", marginBottom: 2,
          }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: sel?.id === s.id ? AMB : "rgba(255,255,255,0.85)" }}>{s.name}</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.workers?.length || 0} workers</p>
          </button>
        ))}
      </div>
      <div style={{ padding: "10px 11px 13px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={onRep} style={{ width: "100%", padding: "7px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", marginBottom: 6, textAlign: "left" }}>
          📋 Reports ({docsCount})
        </button>
        <button onClick={sync} style={{ width: "100%", padding: "5px 10px", background: "none", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 6, color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>↻ Sync now</button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════

return function SiteDocGeneratorView() {
  const [sites, setSites] = useState([]);
  const [sel, setSel] = useState(null);
  const [syncSt, setSyncSt] = useState("demo");
  const [view, setView] = useState("dash");
  const [docType, setDocType] = useState(null);
  const [fd, setFd] = useState({});
  const [docs, setDocs] = useState([]);
  const [activeCat, setActiveCat] = useState("safety");

  const sync = useCallback(async () => {
    // Sites data comes from the labour schedule app via props
    // Falls back to built-in demo sites when no live data available
    setSites(DEMO_SITES); setSyncSt("demo");
  }, []);

  useEffect(() => {
    sync();
    loadDocs().then(setDocs);
    const iv = setInterval(sync, 30000);
    return () => clearInterval(iv);
  }, [sync]);

  useEffect(() => { if (sites.length && !sel) setSel(sites[0]); }, [sites, sel]);

  const start = dt => { setDocType(dt); setFd(initFd(dt, sel)); setView("form"); };

  const onGen = async formData => {
    const doc = {
      id: genId(), docType: docType.id, docLabel: docType.label, category: docType.cat,
      site: formData.site, siteId: sel?.id, generatedBy: formData.preparedBy,
      generatedAt: new Date().toISOString(), date: formData.date,
      responsible: (formData.attendees || []).filter(a => a.responsible).map(a => a.name),
      team: (formData.attendees || []).filter(a => a.present).map(a => `${a.name} (${a.role})`),
      formData,
    };
    const updated = await saveDoc(doc, docs);
    setDocs(updated); setFd(formData); setView("preview");
  };

  if (view === "form") return <DocForm dt={docType} initFd={fd} onBack={() => setView("dash")} onGen={onGen} />;
  if (view === "preview") return <Preview dt={docType} fd={fd} onBack={() => setView("form")} onNew={() => setView("dash")} onRep={() => setView("reports")} />;
  if (view === "reports") return (
    <Reports docs={docs} sites={sites} onBack={() => setView("dash")}
      onView={doc => { setDocType(DOC_TYPES.find(d => d.id === doc.docType)); setFd(doc.formData); setView("preview"); }} />
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: BG }}>
      <Sidebar sites={sites} sel={sel} setSel={setSel} sync={sync} syncSt={syncSt} onRep={() => setView("reports")} docsCount={docs.length} />
      <main style={{ flex: 1, padding: "22px 26px", overflowY: "auto" }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: GY8 }}>Site Document Generator</h1>
          {sel && <p style={{ margin: "3px 0 0", fontSize: 13, color: GY5 }}>{sel.name} · {sel.address}</p>}
        </div>
        {sel && (
          <div style={{ background: "#fff", border: `1px solid ${GY2}`, borderRadius: 10, padding: "12px 15px", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <IBlock label="Scope" value={sel.scope} />
              <IBlock label="Supervisor" value={`${sel.supervisor?.name} · ${sel.supervisor?.phone}`} />
              <IBlock label="Workers" value={`${sel.workers?.length || 0} allocated`} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
              padding: "6px 13px", borderRadius: 20, border: `1px solid ${activeCat === cat.id ? cat.color : GY2}`,
              background: activeCat === cat.id ? cat.color : "#fff", fontSize: 12, cursor: "pointer",
              color: activeCat === cat.id ? (cat.id === "safety" ? DARK : "#fff") : GY6,
              fontWeight: activeCat === cat.id ? 700 : 400,
            }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 10 }}>
          {DOC_TYPES.filter(d => d.cat === activeCat).map(dt => (
            <DocCard key={dt.id} dt={dt} onClick={() => start(dt)}
              count={docs.filter(d => d.docType === dt.id && d.siteId === sel?.id).length} />
          ))}
        </div>
        {syncSt === "demo" && (
          <div style={{ marginTop: 22, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8, fontSize: 12, color: "#92400E" }}>
            <b>Demo mode.</b> Connect your Labour Schedule app — save to storage key <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 3 }}>labour_schedule_data</code>.
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DOC FORM
// ═══════════════════════════════════════════════════════

function DocForm({ dt, initFd: init, onBack, onGen }) {
  const [fd, setFd] = useState(init);
  const set = (k, v) => setFd(f => ({ ...f, [k]: v }));
  const chk = (i, f, v) => setFd(d => ({ ...d, checks: { ...d.checks, [i]: { ...d.checks[i], [f]: v } } }));
  const qa = (i, f, v) => setFd(d => ({ ...d, qaItems: d.qaItems.map((it, idx) => idx === i ? { ...it, [f]: v } : it) }));
  const tog = (id, fld) => setFd(d => ({ ...d, attendees: d.attendees.map(a => a.id === id ? { ...a, [fld]: !a[fld] } : a) }));

  const isCl = dt.cat === "inspection";
  const cl = CL[dt.id];
  const noAtt = dt.cat === "legal";

  const RadioRow = ({ label, field }) => (
    <tr style={{ borderBottom: `1px solid ${GY2}` }}>
      <td style={{ padding: "7px 10px", color: GY8, fontSize: 13 }}>{label}</td>
      {["pass", "fail", "na"].map(r => (
        <td key={r} style={{ padding: "7px 10px", textAlign: "center" }}>
          <input type="radio" name={field} checked={fd[field] === r} onChange={() => set(field, r)}
            style={{ accentColor: r === "pass" ? GRN : r === "fail" ? RED : "#9CA3AF" }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <div style={{ background: HDR, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 13, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.38)" }}>New document</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{dt.label}</p>
        </div>
        <button onClick={() => onGen(fd)} style={{ padding: "7px 18px", background: AMB, border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer", color: DARK }}>Generate →</button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 16px 40px" }}>
        {/* Always: site details */}
        <Sec title="Site details">
          <Grid>
            <Field label="Site name" value={fd.site} onChange={v => set("site", v)} />
            <Field label="Date" value={fd.date} onChange={v => set("date", v)} />
            <Field label="Address" value={fd.address} onChange={v => set("address", v)} span />
            <Field label="Scope of works" value={fd.scope} onChange={v => set("scope", v)} span multi />
            <Field label="Supervisor" value={fd.supervisor} onChange={v => set("supervisor", v)} />
            <Field label="Contact number" value={fd.supPhone} onChange={v => set("supPhone", v)} />
            <Field label="Prepared by" value={fd.preparedBy} onChange={v => set("preparedBy", v)} />
          </Grid>
        </Sec>

        {/* Inspection: equipment */}
        {isCl && (
          <Sec title="Equipment details">
            <Grid cols={3}>
              <Field label="Equipment ID / serial" value={fd.equipmentId} onChange={v => set("equipmentId", v)} />
              <Field label="Make" value={fd.make} onChange={v => set("make", v)} />
              <Field label="Model" value={fd.model} onChange={v => set("model", v)} />
            </Grid>
          </Sec>
        )}

        {/* Daily Safe Start */}
        {dt.id === "daily_safe_start" && (
          <Sec title="Briefing content">
            <Grid cols={1}>
              <Field label="Hazards identified" value={fd.hazards} onChange={v => set("hazards", v)} multi />
              <Field label="Control measures in place" value={fd.controls} onChange={v => set("controls", v)} multi />
              <Field label="PPE required" value={fd.ppe} onChange={v => set("ppe", v)} />
              <Field label="Emergency procedure / muster point" value={fd.emergencyProc} onChange={v => set("emergencyProc", v)} />
            </Grid>
          </Sec>
        )}

        {/* Toolbox Talk */}
        {dt.id === "toolbox_talk" && (
          <Sec title="Talk content">
            <Grid cols={1}>
              <Field label="Topic / title" value={fd.topic} onChange={v => set("topic", v)} />
              <Field label="Key points covered" value={fd.hazards} onChange={v => set("hazards", v)} multi />
              <Field label="Actions arising / follow-up" value={fd.controls} onChange={v => set("controls", v)} multi />
            </Grid>
          </Sec>
        )}

        {/* PUWER */}
        {dt.id === "puwer" && (<>
          <Sec title="Equipment">
            <Grid>
              <Field label="Equipment / machine" value={fd.equipment} onChange={v => set("equipment", v)} />
              <Field label="Equipment ID / ref" value={fd.equipmentId} onChange={v => set("equipmentId", v)} />
              <Field label="Make" value={fd.make} onChange={v => set("make", v)} />
              <Field label="Model" value={fd.model} onChange={v => set("model", v)} />
            </Grid>
          </Sec>
          <Sec title="Risk assessment & controls">
            <Grid cols={1}>
              <Field label="Hazards associated with equipment" value={fd.hazards} onChange={v => set("hazards", v)} multi />
              <Field label="Risk level (High / Medium / Low)" value={fd.riskLevel} onChange={v => set("riskLevel", v)} />
              <Field label="Control measures" value={fd.controls} onChange={v => set("controls", v)} multi />
              <Field label="Training required / provided" value={fd.training} onChange={v => set("training", v)} multi />
              <Field label="Maintenance schedule" value={fd.maintenance} onChange={v => set("maintenance", v)} />
              <Field label="Inspection frequency" value={fd.frequency} onChange={v => set("frequency", v)} />
            </Grid>
          </Sec>
        </>)}

        {/* LOLER */}
        {dt.id === "loler" && (<>
          <Sec title="Lifting equipment">
            <Grid>
              <Field label="Equipment type" value={fd.liftingEquip} onChange={v => set("liftingEquip", v)} />
              <Field label="SWL / WLL" value={fd.swl} onChange={v => set("swl", v)} />
              <Field label="Equipment ID" value={fd.equipmentId} onChange={v => set("equipmentId", v)} />
              <Field label="Certificate / exam ref" value={fd.examRef} onChange={v => set("examRef", v)} />
              <Field label="Last examination date" value={fd.examDate} onChange={v => set("examDate", v)} />
              <Field label="Next examination due" value={fd.nextExam} onChange={v => set("nextExam", v)} />
            </Grid>
          </Sec>
          <Sec title="Lift plan">
            <Grid cols={1}>
              <Field label="Lift description / method" value={fd.liftPlan} onChange={v => set("liftPlan", v)} multi />
              <Field label="Lifting equipment to be used" value={fd.resources} onChange={v => set("resources", v)} multi />
              <Field label="Hazards / special precautions" value={fd.hazards} onChange={v => set("hazards", v)} multi />
            </Grid>
          </Sec>
        </>)}

        {/* COSHH */}
        {dt.id === "coshh" && (<>
          <Sec title="Substance">
            <Grid>
              <Field label="Substance name" value={fd.substance} onChange={v => set("substance", v)} />
              <Field label="Supplier / manufacturer" value={fd.supplier} onChange={v => set("supplier", v)} />
              <Field label="Hazard type (GHS classification)" value={fd.hazardType} onChange={v => set("hazardType", v)} />
              <Field label="WEL (workplace exposure limit)" value={fd.exposureLimits} onChange={v => set("exposureLimits", v)} />
              <Field label="Health effects of exposure" value={fd.healthEffects} onChange={v => set("healthEffects", v)} span multi />
            </Grid>
          </Sec>
          <Sec title="Controls">
            <Grid cols={1}>
              <Field label="Exposure routes (inhalation / dermal / ingestion)" value={fd.exposureRoutes} onChange={v => set("exposureRoutes", v)} />
              <Field label="Engineering / substitution controls" value={fd.cohhControls} onChange={v => set("cohhControls", v)} multi />
              <Field label="PPE required" value={fd.cohhPpe} onChange={v => set("cohhPpe", v)} />
              <Field label="Emergency actions (spillage / fire / first aid)" value={fd.emergencyActions} onChange={v => set("emergencyActions", v)} multi />
            </Grid>
          </Sec>
        </>)}

        {/* Task Briefing */}
        {dt.id === "task_briefing" && (
          <Sec title="Task details">
            <Grid cols={1}>
              <Field label="Task description" value={fd.taskDesc} onChange={v => set("taskDesc", v)} multi />
              <Field label="Method statement reference" value={fd.methodRef} onChange={v => set("methodRef", v)} />
              <Field label="Plant / equipment / materials required" value={fd.resources} onChange={v => set("resources", v)} multi />
              <Field label="Task-specific risks" value={fd.taskRisks} onChange={v => set("taskRisks", v)} multi />
              <Field label="Controls / safe working methods" value={fd.taskControls} onChange={v => set("taskControls", v)} multi />
            </Grid>
          </Sec>
        )}

        {/* PAT Testing */}
        {dt.id === "pat_testing" && (<>
          <Sec title="Appliance details">
            <Grid>
              <Field label="Appliance description" value={fd.applianceDesc} onChange={v => set("applianceDesc", v)} />
              <Field label="Asset / inventory number" value={fd.assetNo} onChange={v => set("assetNo", v)} />
              <Field label="Location on site" value={fd.location} onChange={v => set("location", v)} />
              <Field label="Tested by" value={fd.testedBy} onChange={v => set("testedBy", v)} />
            </Grid>
          </Sec>
          <Sec title="Test results">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: GY1 }}>
                <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, color: GY7 }}>Test</th>
                <th style={{ padding: "7px 10px", width: 65, textAlign: "center" }}>Pass</th>
                <th style={{ padding: "7px 10px", width: 65, textAlign: "center" }}>Fail</th>
                <th style={{ padding: "7px 10px", width: 65, textAlign: "center" }}>N/A</th>
              </tr></thead>
              <tbody>
                <RadioRow label="Visual inspection" field="visualPass" />
                <RadioRow label="Earth continuity" field="earthPass" />
                <RadioRow label="Insulation resistance" field="insulationPass" />
                <RadioRow label="Polarity check" field="polarityPass" />
              </tbody>
            </table>
            <div style={{ marginTop: 12, display: "flex", gap: 9 }}>
              {[{ v: "pass", l: "✓ Pass", bg: GBG, c: GRN }, { v: "fail", l: "✗ Fail", bg: RBG, c: RED }].map(o => (
                <button key={o.v} onClick={() => set("patResult", o.v)} style={{ padding: "7px 16px", borderRadius: 6, border: `1.5px solid ${fd.patResult === o.v ? o.c : GY2}`, background: fd.patResult === o.v ? o.bg : "#fff", color: fd.patResult === o.v ? o.c : GY5, fontWeight: fd.patResult === o.v ? 700 : 400, cursor: "pointer", fontSize: 13 }}>{o.l}</button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}><Field label="Next test date" value={fd.nextTestDate} onChange={v => set("nextTestDate", v)} /></div>
          </Sec>
        </>)}

        {/* Thorough Examination */}
        {dt.id === "thorough_exam" && (<>
          <Sec title="Equipment">
            <Grid>
              <Field label="Equipment type" value={fd.examEquipment} onChange={v => set("examEquipment", v)} />
              <Field label="Equipment ID / serial" value={fd.examId} onChange={v => set("examId", v)} />
              <Field label="SWL / WLL" value={fd.examSWL} onChange={v => set("examSWL", v)} />
              <Field label="Examination reference" value={fd.examRef} onChange={v => set("examRef", v)} />
            </Grid>
          </Sec>
          <Sec title="Examination details">
            <Grid>
              <Field label="Examiner name" value={fd.examiner} onChange={v => set("examiner", v)} />
              <Field label="Examination body / company" value={fd.examBody} onChange={v => set("examBody", v)} />
              <Field label="Date of examination" value={fd.examDate} onChange={v => set("examDate", v)} />
              <Field label="Next examination due" value={fd.nextExamDate} onChange={v => set("nextExamDate", v)} />
              <Field label="Condition rating (1–4)" value={fd.conditionRating} onChange={v => set("conditionRating", v)} />
            </Grid>
            <div style={{ marginTop: 10 }}><Field label="Defects found (or 'None')" value={fd.defectsDesc} onChange={v => set("defectsDesc", v)} multi /></div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {[{ v: "yes", l: "✓ Safe for use" }, { v: "no", l: "✗ Not safe – remove" }, { v: "conditions", l: "⚠ Conditional" }].map(o => (
                <button key={o.v} onClick={() => set("safeForUse", o.v)} style={{ padding: "6px 12px", borderRadius: 6, border: `1.5px solid ${fd.safeForUse === o.v ? BLU : GY2}`, background: fd.safeForUse === o.v ? BBG : "#fff", color: fd.safeForUse === o.v ? BLU : GY5, fontWeight: fd.safeForUse === o.v ? 600 : 400, cursor: "pointer", fontSize: 12 }}>{o.l}</button>
              ))}
            </div>
          </Sec>
        </>)}

        {/* QA Handover */}
        {dt.id === "qa_handover" && (<>
          <Sec title="Contract details">
            <Grid>
              <Field label="Contract reference" value={fd.contractRef} onChange={v => set("contractRef", v)} />
              <Field label="Work package" value={fd.workPackage} onChange={v => set("workPackage", v)} />
            </Grid>
          </Sec>
          <Sec title="Quality checklist">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: GY1 }}>
                <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, color: GY7 }}>Item</th>
                <th style={{ padding: "7px 10px", width: 55, textAlign: "center" }}>Pass</th>
                <th style={{ padding: "7px 10px", width: 55, textAlign: "center" }}>Fail</th>
                <th style={{ padding: "7px 10px", width: 55, textAlign: "center" }}>N/A</th>
                <th style={{ padding: "7px 10px", width: 140, textAlign: "left" }}>Notes</th>
              </tr></thead>
              <tbody>
                {fd.qaItems?.map((it, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${GY2}` }}>
                    <td style={{ padding: "7px 10px", color: GY8 }}>{it.item}</td>
                    {["pass", "fail", "na"].map(r => (
                      <td key={r} style={{ padding: "7px 10px", textAlign: "center" }}>
                        <input type="radio" name={`qa${i}`} checked={it.result === r} onChange={() => qa(i, "result", r)} />
                      </td>
                    ))}
                    <td style={{ padding: "7px 6px" }}>
                      <input type="text" value={it.notes || ""} onChange={e => qa(i, "notes", e.target.value)} placeholder="Notes…" style={{ ...inp, fontSize: 11, padding: "3px 6px" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10 }}><Field label="Deficiencies / outstanding items" value={fd.deficiencies} onChange={v => set("deficiencies", v)} multi /></div>
          </Sec>
        </>)}

        {/* NCR */}
        {dt.id === "ncr" && (
          <Sec title="Non-conformance details">
            <Grid>
              <Field label="NCR reference number" value={fd.ncrRef} onChange={v => set("ncrRef", v)} />
              <Field label="Target closure date" value={fd.targetDate} onChange={v => set("targetDate", v)} />
              <Field label="Description of non-conformance" value={fd.ncrDesc} onChange={v => set("ncrDesc", v)} span multi />
              <Field label="Root cause analysis" value={fd.rootCause} onChange={v => set("rootCause", v)} span multi />
              <Field label="Corrective action required" value={fd.correctiveAction} onChange={v => set("correctiveAction", v)} span multi />
              <Field label="Closed by" value={fd.closedBy} onChange={v => set("closedBy", v)} />
            </Grid>
          </Sec>
        )}

        {/* Early Delay / Delay Notice */}
        {(dt.id === "early_delay" || dt.id === "delay_notice") && (<>
          <Sec title="Contract details">
            <Grid>
              <Field label="Contract number" value={fd.contractNo} onChange={v => set("contractNo", v)} />
              <Field label="Programme reference" value={fd.programmeRef} onChange={v => set("programmeRef", v)} />
              <Field label="Employer" value={fd.employer} onChange={v => set("employer", v)} />
              <Field label="Contractor" value={fd.contractor} onChange={v => set("contractor", v)} />
            </Grid>
          </Sec>
          <Sec title="Event details">
            <Grid>
              <Field label="Date of event" value={fd.eventDate} onChange={v => set("eventDate", v)} />
              <Field label="Reply required by" value={fd.replyBy} onChange={v => set("replyBy", v)} />
              <Field label="Description of delay event" value={fd.eventDesc} onChange={v => set("eventDesc", v)} span multi />
              <Field label="Delay (weeks)" value={fd.delayWeeks} onChange={v => set("delayWeeks", v)} />
              {dt.id === "delay_notice" && <Field label="Cost impact (£)" value={fd.costImpact} onChange={v => set("costImpact", v)} />}
              <Field label="Programme impact / consequences" value={fd.delayImpact} onChange={v => set("delayImpact", v)} span multi />
            </Grid>
          </Sec>
        </>)}

        {/* Inspection checklist */}
        {isCl && cl && (<>
          <Sec title="Inspection checklist">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: GY1 }}>
                  {cl.s && <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: GY7, width: 100 }}>Section</th>}
                  <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600, color: GY7 }}>Item</th>
                  <th style={{ padding: "6px 8px", width: 44, textAlign: "center" }}>Pass</th>
                  <th style={{ padding: "6px 8px", width: 44, textAlign: "center" }}>Fail</th>
                  <th style={{ padding: "6px 8px", width: 44, textAlign: "center" }}>N/A</th>
                  <th style={{ padding: "6px 8px", width: 130, textAlign: "left" }}>Notes</th>
                </tr></thead>
                <tbody>
                  {cl.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${GY2}` }}>
                      {cl.s && <td style={{ padding: "6px 8px", fontSize: 10, color: GY5, fontWeight: 500, verticalAlign: "top" }}>{itemSection(dt.id, i)}</td>}
                      <td style={{ padding: "6px 8px", color: GY8, verticalAlign: "top" }}>{item}</td>
                      {["pass", "fail", "na"].map(r => (
                        <td key={r} style={{ padding: "6px 8px", textAlign: "center", verticalAlign: "top" }}>
                          <input type="radio" name={`c${i}`} checked={fd.checks?.[i]?.r === r} onChange={() => chk(i, "r", r)}
                            style={{ accentColor: r === "pass" ? GRN : r === "fail" ? RED : "#9CA3AF" }} />
                        </td>
                      ))}
                      <td style={{ padding: "6px 5px" }}>
                        <input type="text" value={fd.checks?.[i]?.n || ""} onChange={e => chk(i, "n", e.target.value)}
                          placeholder="Notes…" style={{ width: "100%", fontSize: 11, border: `1px solid ${GY2}`, borderRadius: 4, padding: "3px 5px", background: "#fff" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>
          <Sec title="Overall result">
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {[
                { v: "safe",   l: "✓ Safe to use",         bg: GBG,      c: GRN },
                { v: "remove", l: "✗ Remove from service", bg: RBG,      c: RED },
                { v: "monitor",l: "⚠ Monitor",             bg: "#FFF7ED", c: "#C2410C" },
              ].map(o => (
                <button key={o.v} onClick={() => set("result", o.v)} style={{ padding: "7px 13px", borderRadius: 6, border: `1.5px solid ${fd.result === o.v ? o.c : GY2}`, background: fd.result === o.v ? o.bg : "#fff", color: fd.result === o.v ? o.c : GY6, fontWeight: fd.result === o.v ? 700 : 400, cursor: "pointer", fontSize: 12 }}>{o.l}</button>
              ))}
            </div>
            <div style={{ marginTop: 10 }}><Field label="Additional notes" value={fd.notes} onChange={v => set("notes", v)} multi /></div>
          </Sec>
        </>)}

        {/* Attendees & responsible signatories */}
        {!noAtt && fd.attendees?.length > 0 && (
          <Sec title="Team & responsible signatories">
            <p style={{ margin: "0 0 9px", fontSize: 11, color: GY5 }}>Tick who is present. Mark as responsible the person(s) who sign off this document.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 8 }}>
              {fd.attendees.map(a => (
                <div key={a.id} style={{ padding: "9px 11px", background: a.present ? GBG : GY1, border: `1px solid ${a.present ? GRL : GY2}`, borderRadius: 7 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: a.present ? GRN : GY6 }}>{a.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: a.present ? "#16A34A" : GY5 }}>{a.role}</p>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer" }}>
                      <input type="checkbox" checked={a.present} onChange={() => tog(a.id, "present")} style={{ accentColor: GRN }} />
                      <span style={{ fontSize: 9, color: "#9CA3AF" }}>Present</span>
                    </label>
                  </div>
                  {a.present && (
                    <label style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={a.responsible || false} onChange={() => tog(a.id, "responsible")} style={{ accentColor: AMB }} />
                      <span style={{ fontSize: 10, color: GY6 }}>Responsible signatory</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </Sec>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, paddingTop: 4 }}>
          <button onClick={onBack} style={{ padding: "8px 18px", border: `1px solid ${GY3}`, background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 13, color: GY7 }}>Cancel</button>
          <button onClick={() => onGen(fd)} style={{ padding: "8px 22px", background: AMB, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, color: DARK }}>Generate document →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PREVIEW
// ═══════════════════════════════════════════════════════

function Preview({ dt, fd, onBack, onNew, onRep }) {
  const isCl = dt.cat === "inspection";
  const cl = CL[dt.id];
  const resp = (fd.attendees || []).filter(a => a.responsible);
  const team = (fd.attendees || []).filter(a => a.present);
  const noAtt = dt.cat === "legal";
  const cc = CAT_COLOR[dt.cat];

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "piso";
    el.textContent = `@media print{body *{visibility:hidden}#pdoc,#pdoc *{visibility:visible}#pdoc{position:fixed;top:0;left:0;width:100%;padding:16px}@page{margin:12mm}}`;
    document.head.appendChild(el);
    return () => document.getElementById("piso")?.remove();
  }, []);

  const tb = { width: "100%", borderCollapse: "collapse", border: `1px solid ${GY2}` };

  function PR({ l, v }) {
    return (
      <tr>
        <td style={{ padding: "5px 10px", fontWeight: 600, color: GY7, fontSize: 12, width: "32%", verticalAlign: "top" }}>{l}</td>
        <td style={{ padding: "5px 10px", color: GY8, fontSize: 12, whiteSpace: "pre-wrap" }}>{v || "—"}</td>
      </tr>
    );
  }

  function PS({ title, children }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: GY5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</p>
        {children}
      </div>
    );
  }

  function Badge({ val, pass = "pass", fail = "fail" }) {
    const isP = val === pass, isF = val === fail;
    return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: isP ? GBG : isF ? RBG : GY1, color: isP ? GRN : isF ? RED : GY5 }}>{val?.toUpperCase() || "—"}</span>;
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <div style={{ background: HDR, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, flex: 1 }}>{dt.label}</span>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={onRep} style={{ padding: "6px 12px", background: "none", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 6, color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 11 }}>Reports</button>
          <button onClick={onNew} style={{ padding: "6px 12px", background: "none", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 6, color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 11 }}>New doc</button>
          <button onClick={() => window.print()} style={{ padding: "6px 14px", background: AMB, border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", color: DARK }}>🖨 Print / PDF</button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "18px auto 40px", padding: "0 14px" }}>
        <div id="pdoc" style={{ background: "#fff", border: `1px solid ${GY2}`, borderRadius: 10, overflow: "hidden" }}>
          {/* Document header */}
          <div style={{ borderTop: `4px solid ${cc}`, padding: "18px 22px 13px", borderBottom: `1px solid ${GY2}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em" }}>Construction site document</p>
                <h1 style={{ margin: "3px 0 0", fontSize: 21, fontWeight: 800, color: GY8 }}>{dt.label}</h1>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>Date issued</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: GY8 }}>{fd.date}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: "18px 22px" }}>
            {/* Site details — always */}
            <PS title="Site details">
              <table style={tb}><tbody>
                <PR l="Site" v={fd.site} />
                <PR l="Address" v={fd.address} />
                <PR l="Scope of works" v={fd.scope} />
                <PR l="Supervisor" v={`${fd.supervisor}${fd.supPhone ? ` · ${fd.supPhone}` : ""}`} />
                <PR l="Prepared by" v={fd.preparedBy} />
              </tbody></table>
            </PS>

            {/* Doc-specific content */}
            {(dt.id === "daily_safe_start" || dt.id === "toolbox_talk") && (
              <PS title={dt.id === "toolbox_talk" ? "Talk content" : "Briefing content"}>
                <table style={tb}><tbody>
                  {dt.id === "toolbox_talk" && <PR l="Topic" v={fd.topic} />}
                  <PR l={dt.id === "toolbox_talk" ? "Key points" : "Hazards identified"} v={fd.hazards} />
                  <PR l={dt.id === "toolbox_talk" ? "Actions arising" : "Control measures"} v={fd.controls} />
                  {dt.id === "daily_safe_start" && <><PR l="PPE required" v={fd.ppe} /><PR l="Emergency procedure" v={fd.emergencyProc} /></>}
                </tbody></table>
              </PS>
            )}
            {dt.id === "puwer" && (
              <PS title="PUWER assessment">
                <table style={tb}><tbody>
                  <PR l="Equipment" v={fd.equipment} /><PR l="ID / ref" v={fd.equipmentId} />
                  <PR l="Make / model" v={`${fd.make} ${fd.model}`.trim()} /><PR l="Hazards" v={fd.hazards} />
                  <PR l="Risk level" v={fd.riskLevel} /><PR l="Controls" v={fd.controls} />
                  <PR l="Training" v={fd.training} /><PR l="Maintenance" v={fd.maintenance} />
                  <PR l="Inspection frequency" v={fd.frequency} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "loler" && (
              <PS title="LOLER details">
                <table style={tb}><tbody>
                  <PR l="Lifting equipment" v={fd.liftingEquip} /><PR l="SWL / WLL" v={fd.swl} />
                  <PR l="Equipment ID" v={fd.equipmentId} /><PR l="Certificate ref" v={fd.examRef} />
                  <PR l="Last examination" v={fd.examDate} /><PR l="Next examination" v={fd.nextExam} />
                  <PR l="Lift plan" v={fd.liftPlan} /><PR l="Equipment to be used" v={fd.resources} />
                  <PR l="Hazards / precautions" v={fd.hazards} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "coshh" && (
              <PS title="COSHH assessment">
                <table style={tb}><tbody>
                  <PR l="Substance" v={fd.substance} /><PR l="Supplier" v={fd.supplier} />
                  <PR l="Hazard type" v={fd.hazardType} /><PR l="WEL" v={fd.exposureLimits} />
                  <PR l="Health effects" v={fd.healthEffects} /><PR l="Exposure routes" v={fd.exposureRoutes} />
                  <PR l="Controls" v={fd.cohhControls} /><PR l="PPE required" v={fd.cohhPpe} />
                  <PR l="Emergency actions" v={fd.emergencyActions} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "task_briefing" && (
              <PS title="Task briefing">
                <table style={tb}><tbody>
                  <PR l="Task description" v={fd.taskDesc} /><PR l="Method statement ref" v={fd.methodRef} />
                  <PR l="Resources required" v={fd.resources} /><PR l="Task risks" v={fd.taskRisks} />
                  <PR l="Safe working methods" v={fd.taskControls} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "pat_testing" && (
              <PS title="PAT testing record">
                <table style={tb}><tbody>
                  <PR l="Appliance" v={fd.applianceDesc} /><PR l="Asset number" v={fd.assetNo} />
                  <PR l="Location" v={fd.location} /><PR l="Tested by" v={fd.testedBy} />
                  {[["Visual inspection", fd.visualPass], ["Earth continuity", fd.earthPass], ["Insulation resistance", fd.insulationPass], ["Polarity check", fd.polarityPass]].map(([l, v]) => (
                    <tr key={l}>
                      <td style={{ padding: "5px 10px", fontWeight: 600, color: GY7, fontSize: 12, width: "32%" }}>{l}</td>
                      <td style={{ padding: "5px 10px" }}><Badge val={v} /></td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "5px 10px", fontWeight: 600, color: GY7, fontSize: 12 }}>Overall result</td>
                    <td style={{ padding: "5px 10px" }}><span style={{ padding: "3px 11px", borderRadius: 4, fontSize: 12, fontWeight: 800, background: fd.patResult === "pass" ? GBG : RBG, color: fd.patResult === "pass" ? GRN : RED }}>{fd.patResult?.toUpperCase() || "—"}</span></td>
                  </tr>
                  <PR l="Next test date" v={fd.nextTestDate} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "thorough_exam" && (
              <PS title="Thorough examination">
                <table style={tb}><tbody>
                  <PR l="Equipment" v={fd.examEquipment} /><PR l="ID / serial" v={fd.examId} />
                  <PR l="SWL" v={fd.examSWL} /><PR l="Exam reference" v={fd.examRef} />
                  <PR l="Examiner" v={fd.examiner} /><PR l="Examination body" v={fd.examBody} />
                  <PR l="Date of examination" v={fd.examDate} /><PR l="Condition rating" v={fd.conditionRating} />
                  <PR l="Defects found" v={fd.defectsDesc || "None"} />
                  <tr>
                    <td style={{ padding: "5px 10px", fontWeight: 600, color: GY7, fontSize: 12 }}>Safe for use</td>
                    <td style={{ padding: "5px 10px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: fd.safeForUse === "yes" ? GBG : fd.safeForUse === "conditions" ? "#FFF7ED" : RBG, color: fd.safeForUse === "yes" ? GRN : fd.safeForUse === "conditions" ? "#C2410C" : RED }}>
                        {fd.safeForUse === "yes" ? "YES – SAFE" : fd.safeForUse === "conditions" ? "CONDITIONAL" : "NO – REMOVE"}
                      </span>
                    </td>
                  </tr>
                  <PR l="Next examination" v={fd.nextExamDate} />
                </tbody></table>
              </PS>
            )}
            {dt.id === "qa_handover" && (
              <PS title="QA handover checklist">
                <p style={{ margin: "0 0 6px", fontSize: 12, color: GY6 }}>Contract: {fd.contractRef || "—"} · Work package: {fd.workPackage || "—"}</p>
                <table style={{ ...tb, fontSize: 12 }}><thead><tr style={{ background: GY1 }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Item</th>
                  <th style={{ padding: "6px 10px", width: 60, textAlign: "center", fontWeight: 600 }}>Result</th>
                  <th style={{ padding: "6px 10px", width: 160, textAlign: "left", fontWeight: 600 }}>Notes</th>
                </tr></thead><tbody>
                  {(fd.qaItems || []).map((it, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${GY2}` }}>
                      <td style={{ padding: "5px 10px" }}>{it.item}</td>
                      <td style={{ padding: "5px 10px", textAlign: "center" }}><Badge val={it.result} /></td>
                      <td style={{ padding: "5px 10px", color: GY5, fontSize: 11 }}>{it.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody></table>
                {fd.deficiencies && <p style={{ marginTop: 7, fontSize: 12, color: GY7 }}><b>Deficiencies:</b> {fd.deficiencies}</p>}
              </PS>
            )}
            {dt.id === "ncr" && (
              <PS title="Non-conformance report">
                <table style={tb}><tbody>
                  <PR l="NCR reference" v={fd.ncrRef} /><PR l="Description" v={fd.ncrDesc} />
                  <PR l="Root cause" v={fd.rootCause} /><PR l="Corrective action" v={fd.correctiveAction} />
                  <PR l="Target date" v={fd.targetDate} /><PR l="Closed by" v={fd.closedBy} />
                </tbody></table>
              </PS>
            )}
            {(dt.id === "early_delay" || dt.id === "delay_notice") && (
              <PS title={dt.label}>
                <table style={tb}><tbody>
                  <PR l="Contract number" v={fd.contractNo} /><PR l="Programme ref" v={fd.programmeRef} />
                  <PR l="Employer" v={fd.employer} /><PR l="Contractor" v={fd.contractor} />
                  <PR l="Date of event" v={fd.eventDate} /><PR l="Description" v={fd.eventDesc} />
                  <PR l="Delay (weeks)" v={fd.delayWeeks} />
                  {dt.id === "delay_notice" && <PR l="Cost impact (£)" v={fd.costImpact} />}
                  <PR l="Programme impact" v={fd.delayImpact} /><PR l="Reply by" v={fd.replyBy} />
                </tbody></table>
              </PS>
            )}

            {/* Inspection checklist */}
            {isCl && cl && (
              <PS title="Inspection checklist">
                <table style={{ ...tb, fontSize: 11 }}>
                  <thead><tr style={{ background: GY1 }}>
                    {cl.s && <th style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600, width: 95 }}>Section</th>}
                    <th style={{ padding: "5px 8px", textAlign: "left", fontWeight: 600 }}>Item</th>
                    <th style={{ padding: "5px 8px", width: 52, textAlign: "center" }}>Result</th>
                    <th style={{ padding: "5px 8px", width: 140, textAlign: "left" }}>Notes</th>
                  </tr></thead>
                  <tbody>
                    {cl.items.map((item, i) => {
                      const r = fd.checks?.[i]?.r;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${GY2}` }}>
                          {cl.s && <td style={{ padding: "4px 8px", fontSize: 10, color: GY5, fontWeight: 500 }}>{itemSection(dt.id, i)}</td>}
                          <td style={{ padding: "4px 8px", color: GY7 }}>{item}</td>
                          <td style={{ padding: "4px 8px", textAlign: "center" }}>
                            <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: r === "pass" ? GBG : r === "fail" ? RBG : GY1, color: r === "pass" ? GRN : r === "fail" ? RED : GY5 }}>{r?.toUpperCase() || "—"}</span>
                          </td>
                          <td style={{ padding: "4px 8px", fontSize: 10, color: GY5 }}>{fd.checks?.[i]?.n || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {fd.result && (
                  <div style={{ marginTop: 9, padding: "7px 12px", display: "inline-block", borderRadius: 6, background: fd.result === "safe" ? GBG : fd.result === "remove" ? RBG : "#FFF7ED" }}>
                    <span style={{ fontWeight: 800, fontSize: 12, color: fd.result === "safe" ? GRN : fd.result === "remove" ? RED : "#C2410C" }}>
                      Overall: {fd.result === "safe" ? "SAFE TO USE" : fd.result === "remove" ? "REMOVE FROM SERVICE" : "MONITOR / CONDITIONAL"}
                    </span>
                  </div>
                )}
                {fd.notes && <p style={{ marginTop: 8, fontSize: 12, color: GY7 }}><b>Notes:</b> {fd.notes}</p>}
              </PS>
            )}

            {/* Attendance register */}
            {!noAtt && team.length > 0 && (
              <PS title="Attendance register">
                <table style={{ ...tb, fontSize: 12 }}>
                  <thead><tr style={{ background: GY1 }}>
                    <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600 }}>Role</th>
                    <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: 600, width: 80 }}>Responsible</th>
                    <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600, width: 180 }}>Signature</th>
                  </tr></thead>
                  <tbody>
                    {team.map((a, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${GY2}` }}>
                        <td style={{ padding: "8px 10px", fontWeight: 500 }}>{a.name}</td>
                        <td style={{ padding: "8px 10px", color: GY5 }}>{a.role}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>{a.responsible ? <span style={{ color: AMB, fontWeight: 800, fontSize: 14 }}>✓</span> : ""}</td>
                        <td style={{ padding: "8px 10px", borderLeft: `2px solid ${GY2}` }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PS>
            )}

            {/* Responsible person sign-off boxes */}
            {!noAtt && resp.length > 0 && (
              <PS title="Responsible person sign-off">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
                  {[...resp, { name: fd.preparedBy || "—", role: "Document prepared by" }].map((a, i) => (
                    <div key={i} style={{ border: `1px solid ${GY2}`, borderRadius: 7, padding: "12px 14px" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: GY8 }}>{a.name}</p>
                      <p style={{ margin: "2px 0 12px", fontSize: 11, color: GY5 }}>{a.role}</p>
                      <div style={{ borderBottom: `1.5px solid ${GY7}`, height: 32, marginBottom: 4 }}></div>
                      <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>Signature · Date ___________</p>
                    </div>
                  ))}
                </div>
              </PS>
            )}

            <div style={{ borderTop: `1px solid ${GY2}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9CA3AF" }}>
              <span>Generated by {fd.preparedBy || "—"} · {fd.date}</span>
              <span>Site Document Generator · {fd.site || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════

function Reports({ docs, sites, onBack, onView }) {
  const [fSite, setFSite] = useState("all");
  const [fCat, setFCat] = useState("all");

  const filtered = docs
    .filter(d => (fSite === "all" || d.siteId === fSite) && (fCat === "all" || d.category === fCat))
    .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <div style={{ background: HDR, padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 18, padding: 0 }}>←</button>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, flex: 1 }}>Document reports</span>
        <span style={{ padding: "2px 10px", background: "rgba(245,166,35,0.2)", borderRadius: 12, fontSize: 11, color: AMB, fontWeight: 700 }}>{filtered.length} total</span>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", gap: 9, marginBottom: 18, flexWrap: "wrap" }}>
          <select value={fSite} onChange={e => setFSite(e.target.value)} style={{ ...inp, width: "auto", minWidth: 160 }}>
            <option value="all">All sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={fCat} onChange={e => setFCat(e.target.value)} style={{ ...inp, width: "auto", minWidth: 160 }}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: GY5 }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: GY7 }}>No documents yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Generate your first document from the dashboard — it will appear here, saved with the team and signatories.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {filtered.map(doc => {
              const cc = CAT_COLOR[doc.category];
              const genAt = new Date(doc.generatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
              return (
                <div key={doc.id} onClick={() => onView(doc)}
                  style={{ background: "#fff", border: `1px solid ${GY2}`, borderLeft: `3px solid ${cc}`, borderRadius: 0, padding: "11px 15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = GY1}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: GY8 }}>{doc.docLabel}</p>
                      <span style={{ padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: cc + "22", color: cc }}>
                        {CATEGORIES.find(c => c.id === doc.category)?.label}
                      </span>
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: GY5 }}>{doc.site} · {genAt} · by {doc.generatedBy || "—"}</p>
                    {doc.team?.length > 0 && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: GY5 }}>
                        Team: {doc.team.slice(0, 3).join(", ")}{doc.team.length > 3 ? ` +${doc.team.length - 3} more` : ""}
                      </p>
                    )}
                    {doc.responsible?.length > 0 && (
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: AMB, fontWeight: 600 }}>
                        Responsible: {doc.responsible.join(", ")}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: GY5, flexShrink: 0 }}>View →</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

})();
// ─── Asset Register — embedded (localStorage, zero conflicts) ─────────────────
function AssetRegisterView(){
  const htmlDoc=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>SiteKit — Asset Register</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --steel:#1f2933; --steel-2:#323f4b; --steel-3:#3e4c59;
    --paper:#f3f2ee; --card:#ffffff;
    --ink:#1f2933; --ink-soft:#52606d; --ink-faint:#9aa5b1; --line:#e2e0da;
    --hivis:#ffb000; --hivis-ink:#3a2a00;
    --ok:#2e9e5b; --ok-bg:#e7f4ec;
    --due:#ef7d18; --due-bg:#fdeede;
    --over:#d64545; --over-bg:#fbe6e6;
    --none:#7b8794; --none-bg:#eceef0;
    --r:14px;
    --shadow:0 1px 2px rgba(31,41,51,.06), 0 6px 18px rgba(31,41,51,.06);
    --sheet-shadow:0 -8px 40px rgba(31,41,51,.22);
    --safe-b:env(safe-area-inset-bottom,0px);
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:"Barlow",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--paper);
    color:var(--ink);-webkit-font-smoothing:antialiased;overscroll-behavior-y:none}
  button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
  input,select,textarea{font-family:inherit;font-size:16px}
  .mono{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace}

  .app{max-width:520px;margin:0 auto;min-height:100vh;min-height:100dvh;position:relative;background:var(--paper)}
  .topbar{position:sticky;top:0;z-index:20;background:var(--steel);color:#fff;
    padding:calc(env(safe-area-inset-top,0px) + 14px) 18px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .brand{display:flex;align-items:center;gap:10px;min-width:0}
  .brand .mark{width:30px;height:30px;border-radius:7px;flex:none;background:var(--hivis);color:var(--hivis-ink);
    display:grid;place-items:center;font-weight:700;box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)}
  .brand .mark svg{width:18px;height:18px}
  .brand h1{font-family:"Barlow Condensed";font-weight:700;font-size:21px;letter-spacing:.06em;text-transform:uppercase;margin:0;line-height:1}
  .brand small{display:block;font-family:"IBM Plex Mono";font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#9aa5b1;margin-top:3px}
  .icon-btn{width:40px;height:40px;border-radius:10px;flex:none;background:var(--steel-2);color:#cdd5dd;display:grid;place-items:center;transition:background .15s,color .15s}
  .icon-btn:hover{background:var(--steel-3);color:#fff}
  .icon-btn svg{width:20px;height:20px}

  .scroll{padding:18px 16px 130px;animation:fade .25s ease}
  @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .eyebrow{font-family:"Barlow Condensed";font-weight:600;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin:0 2px 10px}
  .h-row{display:flex;align-items:baseline;justify-content:space-between;margin:0 2px 12px}
  .h-row h2{font-family:"Barlow Condensed";font-weight:700;font-size:24px;letter-spacing:.02em;margin:0;text-transform:uppercase}
  .muted{color:var(--ink-soft);font-size:14px;line-height:1.5;padding:4px 2px}

  .tiles{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:22px}
  .tile{background:var(--card);border-radius:var(--r);padding:15px 15px 13px;box-shadow:var(--shadow);border:1px solid var(--line);position:relative;overflow:hidden}
  .tile .n{font-family:"Barlow Condensed";font-weight:700;font-size:38px;line-height:.95}
  .tile .l{font-size:12.5px;color:var(--ink-soft);margin-top:5px;font-weight:500}
  .tile .bar{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--steel-3)}
  .tile.acc .bar{background:var(--hivis)}
  .tile.due .bar{background:var(--due)} .tile.due .n{color:var(--due)}
  .tile.over .bar{background:var(--over)} .tile.over .n{color:var(--over)}

  /* inspection tag */
  .tag{display:inline-flex;align-items:center;gap:7px;padding:4px 9px 4px 6px;border-radius:5px;
    font-family:"IBM Plex Mono";font-size:11px;font-weight:500;line-height:1;white-space:nowrap;border:1px solid transparent}
  .tag .hole{width:7px;height:7px;border-radius:50%;flex:none;background:var(--paper);box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.18)}
  .tag .lab{font-weight:600;letter-spacing:.04em}
  .tag.ok{background:var(--ok-bg);color:#1c6b3c;border-color:#bfe3cd} .tag.ok .hole{box-shadow:inset 0 0 0 1.5px var(--ok)}
  .tag.due{background:var(--due-bg);color:#9a4e08;border-color:#f6cda3} .tag.due .hole{box-shadow:inset 0 0 0 1.5px var(--due)}
  .tag.over{background:var(--over-bg);color:#a32525;border-color:#f0bcbc} .tag.over .hole{box-shadow:inset 0 0 0 1.5px var(--over)}
  .tag.none{background:var(--none-bg);color:#52606d;border-color:#d5dadf}

  .alert{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 13px;margin-bottom:9px;box-shadow:var(--shadow);transition:transform .12s}
  .alert:active{transform:scale(.99)}
  .alert .thumb{width:42px;height:42px;border-radius:9px;flex:none;background:var(--paper);background-size:cover;background-position:center;display:grid;place-items:center;color:var(--ink-faint)}
  .alert .thumb svg{width:20px;height:20px}
  .alert .mid{min-width:0;flex:1}
  .alert .nm{font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .alert .sub{font-size:12.5px;color:var(--ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .search{display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:10px 13px;margin-bottom:13px;box-shadow:var(--shadow)}
  .search svg{width:18px;height:18px;color:var(--ink-faint);flex:none}
  .search input{border:none;outline:none;background:none;width:100%;color:var(--ink)}
  .chips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 12px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .chips::-webkit-scrollbar{display:none}
  .chip{flex:none;padding:7px 13px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-family:"Barlow Condensed";font-weight:600;font-size:13.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft);transition:.15s}
  .chip.on{background:var(--steel);color:#fff;border-color:var(--steel)}

  .card{display:flex;gap:13px;background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:12px;margin-bottom:11px;box-shadow:var(--shadow);transition:transform .12s;position:relative}
  .card:active{transform:scale(.992)}
  .card.oos{border-color:#f0bcbc}
  .card.oos::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:var(--r) 0 0 var(--r);background:var(--over)}
  .card .photo{width:74px;height:74px;border-radius:11px;flex:none;background:var(--paper);background-size:cover;background-position:center;display:grid;place-items:center;color:var(--ink-faint);border:1px solid var(--line);position:relative;overflow:hidden}
  .card .photo svg{width:26px;height:26px}
  .card .photo .oosdot{position:absolute;inset:auto 0 0 0;background:rgba(214,69,69,.92);color:#fff;font-family:"Barlow Condensed";font-weight:700;font-size:9px;letter-spacing:.08em;text-align:center;padding:2px 0;text-transform:uppercase}
  .card .body{min-width:0;flex:1;display:flex;flex-direction:column}
  .card .name{font-weight:600;font-size:16.5px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  .card .cat{font-family:"IBM Plex Mono";font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin-top:3px}
  .card .tagrow{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
  .card .meta{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:9px;font-size:12px;color:var(--ink-soft)}
  .card .meta svg{width:13px;height:13px;flex:none;color:var(--ink-faint)}

  .site{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:14px 15px;margin-bottom:11px;box-shadow:var(--shadow);transition:transform .12s}
  .site:active{transform:scale(.992)}
  .site .st-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .site .st-name{display:flex;align-items:center;gap:9px;min-width:0}
  .site .pin{width:34px;height:34px;border-radius:9px;flex:none;background:var(--paper);display:grid;place-items:center;color:var(--steel);border:1px solid var(--line)}
  .site .pin svg{width:18px;height:18px}
  .site .st-name b{font-family:"Barlow Condensed";font-weight:700;font-size:19px;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .site .count{font-family:"IBM Plex Mono";font-size:12px;color:var(--ink-soft);flex:none}
  .site .breakdown{display:flex;gap:7px;margin-top:12px;flex-wrap:wrap}
  .pillstat{display:inline-flex;align-items:center;gap:6px;font-family:"IBM Plex Mono";font-size:11px;padding:4px 8px;border-radius:6px;background:var(--paper)}
  .pillstat i{width:8px;height:8px;border-radius:50%;display:inline-block}

  .empty{text-align:center;padding:46px 24px;color:var(--ink-soft)}
  .empty .ic{width:62px;height:62px;border-radius:16px;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;margin:0 auto 16px;color:var(--ink-faint);box-shadow:var(--shadow)}
  .empty .ic svg{width:30px;height:30px}
  .empty h3{font-family:"Barlow Condensed";font-weight:700;font-size:21px;letter-spacing:.02em;text-transform:uppercase;margin:0 0 6px;color:var(--ink)}
  .empty p{margin:0 auto 18px;max-width:300px;font-size:14.5px;line-height:1.5}

  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:"Barlow Condensed";font-weight:700;font-size:15px;letter-spacing:.05em;text-transform:uppercase;padding:12px 20px;border-radius:11px;transition:transform .1s,filter .15s}
  .btn:active{transform:scale(.97)}
  .btn svg{width:17px;height:17px}
  .btn-pri{background:var(--hivis);color:var(--hivis-ink);box-shadow:0 3px 0 #c98a00}
  .btn-pri:active{box-shadow:0 1px 0 #c98a00;transform:translateY(2px)}
  .btn-ghost{background:var(--card);border:1px solid var(--line);color:var(--ink)}
  .btn-block{width:100%}

  .navwrap{position:fixed;left:0;right:0;bottom:0;z-index:30;pointer-events:none}
  .navwrap .inner{max-width:520px;margin:0 auto;position:relative}
  .nav{pointer-events:auto;background:var(--steel);padding:8px 12px calc(8px + var(--safe-b));display:grid;grid-template-columns:1fr 1fr 1.4fr 1fr 1fr;align-items:center;box-shadow:0 -2px 20px rgba(31,41,51,.18)}
  .nav button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;color:#8895a2;font-family:"Barlow Condensed";font-weight:600;font-size:11px;letter-spacing:.07em;text-transform:uppercase;transition:color .15s}
  .nav button svg{width:22px;height:22px}
  .nav button.on{color:#fff}
  .fab{pointer-events:auto;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(20px + var(--safe-b));width:60px;height:60px;border-radius:50%;background:var(--hivis);color:var(--hivis-ink);display:grid;place-items:center;box-shadow:0 6px 18px rgba(255,176,0,.45),0 0 0 5px var(--paper);transition:transform .12s}
  .fab:active{transform:translateX(-50%) scale(.93)}
  .fab svg{width:30px;height:30px}

  /* sheet + modal share base */
  .scrim{position:fixed;inset:0;background:rgba(31,41,51,.5);z-index:40;opacity:0;transition:opacity .2s;pointer-events:none;backdrop-filter:blur(2px)}
  .scrim.show{opacity:1;pointer-events:auto}
  .sheet{position:fixed;left:0;right:0;bottom:0;z-index:50;max-width:520px;margin:0 auto;background:var(--paper);border-radius:22px 22px 0 0;box-shadow:var(--sheet-shadow);max-height:94vh;max-height:94dvh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s cubic-bezier(.32,.72,0,1)}
  .sheet.show{transform:none}
  .modal-scrim{z-index:60}
  .modal{z-index:70}
  .grab{width:38px;height:4px;border-radius:99px;background:#cfd4d9;margin:9px auto 2px}
  .sh-head{display:flex;align-items:center;justify-content:space-between;padding:6px 16px 12px;border-bottom:1px solid var(--line)}
  .sh-head h3{font-family:"Barlow Condensed";font-weight:700;font-size:22px;letter-spacing:.03em;text-transform:uppercase;margin:0}
  .sh-x{width:34px;height:34px;border-radius:9px;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink-soft)}
  .sh-x svg{width:18px;height:18px}
  .sh-body{overflow-y:auto;padding:16px 16px 14px;-webkit-overflow-scrolling:touch}
  .sh-foot{padding:13px 16px calc(14px + var(--safe-b));border-top:1px solid var(--line);display:flex;gap:11px;background:var(--paper)}
  .sh-foot .btn{flex:1}

  .photozone{position:relative;width:100%;aspect-ratio:16/10;border-radius:14px;overflow:hidden;background:var(--card);border:1.5px dashed var(--line);display:grid;place-items:center;margin-bottom:18px;background-size:cover;background-position:center}
  .photozone .ph-empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink-faint)}
  .photozone .ph-empty svg{width:30px;height:30px}
  .photozone .ph-empty span{font-family:"Barlow Condensed";font-weight:600;font-size:14px;letter-spacing:.06em;text-transform:uppercase}
  .photozone.has{border-style:solid}
  .ph-actions{position:absolute;right:10px;bottom:10px;display:flex;gap:8px}
  .ph-actions button{width:38px;height:38px;border-radius:10px;background:rgba(31,41,51,.82);color:#fff;display:grid;place-items:center;backdrop-filter:blur(4px)}
  .ph-actions button svg{width:18px;height:18px}

  .field{margin-bottom:15px}
  .field label{display:block;font-family:"Barlow Condensed";font-weight:600;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px}
  .field .req{color:var(--over)}
  .inp{width:100%;padding:12px 13px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:var(--ink);outline:none;transition:border-color .15s,box-shadow .15s}
  .inp:focus{border-color:var(--hivis);box-shadow:0 0 0 3px rgba(255,176,0,.18)}
  textarea.inp{resize:vertical;min-height:64px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:11px}

  .seg{display:flex;gap:8px}
  .seg button{flex:1;padding:11px 0;border-radius:11px;border:1px solid var(--line);background:var(--card);font-family:"Barlow Condensed";font-weight:700;font-size:15px;letter-spacing:.03em;color:var(--ink-soft);transition:.15s}
  .seg button.on{background:var(--steel);color:#fff;border-color:var(--steel)}
  .seg.use button.on.yes{background:var(--ok);border-color:var(--ok);color:#fff}
  .seg.use button.on.no{background:var(--over);border-color:var(--over);color:#fff}
  .seg.res button.on.pass{background:var(--ok);border-color:var(--ok);color:#fff}
  .seg.res button.on.fail{background:var(--over);border-color:var(--over);color:#fff}

  .nextline{font-family:"IBM Plex Mono";font-size:12.5px;margin-top:9px;padding:9px 11px;border-radius:9px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;gap:8px;color:var(--ink-soft)}
  .nextline b{color:var(--ink)}
  .danger{color:var(--over);font-family:"Barlow Condensed";font-weight:700;font-size:14px;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;margin-top:4px;border-radius:11px;border:1px solid #f0c9c9;background:#fdf2f2}
  .danger svg{width:16px;height:16px}

  /* detail */
  .det-photo{position:relative;width:100%;aspect-ratio:16/10;border-radius:14px;background:var(--card);border:1px solid var(--line);background-size:cover;background-position:center;margin-bottom:14px;display:grid;place-items:center;color:var(--ink-faint);overflow:hidden}
  .det-photo svg{width:40px;height:40px}
  .oos-ribbon{position:absolute;inset:auto 0 0 0;background:rgba(214,69,69,.94);color:#fff;font-family:"Barlow Condensed";font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;text-align:center;padding:7px 0}
  .det-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
  .det-head .dh-name{font-family:"Barlow Condensed";font-weight:700;font-size:24px;letter-spacing:.02em;line-height:1.05}
  .det-head .dh-cat{font-family:"IBM Plex Mono";font-size:11px;letter-spacing:.06em;color:var(--ink-faint);margin-top:4px;text-transform:uppercase}
  .det-chips{display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex:none}
  .qa{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0 6px}
  .qa button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 4px;border-radius:12px;background:var(--card);border:1px solid var(--line);transition:transform .1s}
  .qa button:active{transform:scale(.95)}
  .qa button .qi{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--paper);color:var(--steel)}
  .qa button .qi svg{width:17px;height:17px}
  .qa button span{font-family:"Barlow Condensed";font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft);text-align:center;line-height:1.05}
  .qa button.accent .qi{background:var(--hivis);color:var(--hivis-ink)}

  .sec{display:flex;align-items:center;justify-content:space-between;margin:22px 2px 11px}
  .sec span{font-family:"Barlow Condensed";font-weight:700;font-size:16px;letter-spacing:.06em;text-transform:uppercase}
  .addlink{font-family:"Barlow Condensed";font-weight:700;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:#9a6a00;display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:9px;background:var(--due-bg);border:1px solid #f6cda3}
  .addlink svg{width:14px;height:14px}

  .det-row{display:flex;justify-content:space-between;gap:14px;padding:12px 2px;border-bottom:1px solid var(--line)}
  .det-row .k{font-family:"Barlow Condensed";font-weight:600;font-size:13px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-faint);flex:none}
  .det-row .v{text-align:right;font-size:15px}
  .det-row .v.mono{font-size:13.5px}

  .patrec{display:flex;gap:11px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:9px;box-shadow:var(--shadow)}
  .patrec .pr-main{flex:1;min-width:0}
  .patrec .pr-date{font-family:"IBM Plex Mono";font-weight:500;font-size:14px}
  .patrec .pr-meta{font-size:12.5px;color:var(--ink-soft);margin-top:3px}
  .patrec .pr-meta b{color:var(--ink)}
  .patrec .pr-tester{font-size:12px;color:var(--ink-faint);margin-top:2px}
  .patrec .pr-right{display:flex;flex-direction:column;gap:7px;align-items:flex-end;flex:none}
  .cert-btn{display:inline-flex;align-items:center;gap:5px;font-family:"Barlow Condensed";font-weight:700;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:6px 9px;border-radius:8px}
  .cert-btn svg{width:13px;height:13px}

  .tl{position:relative;margin-left:6px;padding-left:20px}
  .tl::before{content:"";position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:var(--line)}
  .tl-item{position:relative;padding:0 0 16px}
  .tl-item .dot{position:absolute;left:-19px;top:2px;width:14px;height:14px;border-radius:50%;background:var(--card);border:2px solid var(--steel-3);display:grid;place-items:center}
  .tl-item .dot.move{border-color:var(--steel)}
  .tl-item .dot.cond{border-color:var(--due)}
  .tl-item .dot.pat{border-color:var(--ok)}
  .tl-item .dot.oos{border-color:var(--over)}
  .tl-item .ti-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
  .tl-item .ti-title{font-weight:600;font-size:14.5px}
  .tl-item .ti-date{font-family:"IBM Plex Mono";font-size:10.5px;color:var(--ink-faint);flex:none}
  .tl-item .ti-sub{font-size:13px;color:var(--ink-soft);margin-top:2px;line-height:1.4}
  .tl-item .ti-photo{margin-top:8px;width:100%;max-width:200px;aspect-ratio:4/3;border-radius:10px;background-size:cover;background-position:center;border:1px solid var(--line)}
  .move-arrow{display:inline-flex;align-items:center;gap:6px;font-family:"IBM Plex Mono";font-size:12.5px;margin-top:3px}
  .move-arrow svg{width:13px;height:13px;color:var(--ink-faint)}

  /* mini photo control (modals) */
  .mphoto{display:flex;gap:11px;align-items:center;margin-bottom:4px}
  .mphoto .prev{width:74px;height:74px;border-radius:11px;background:var(--card);border:1px solid var(--line);background-size:cover;background-position:center;display:grid;place-items:center;color:var(--ink-faint);flex:none}
  .mphoto .prev svg{width:24px;height:24px}
  .mphoto .addbtn{flex:1;padding:13px;border-radius:11px;border:1.5px dashed var(--line);background:var(--card);font-family:"Barlow Condensed";font-weight:600;font-size:14px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);display:flex;align-items:center;justify-content:center;gap:8px}
  .mphoto .addbtn svg{width:18px;height:18px}
  .mphoto .rm{font-family:"Barlow Condensed";font-weight:600;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--over);background:none;padding:6px}

  .toast{position:fixed;left:50%;transform:translateX(-50%) translateY(20px);bottom:calc(96px + var(--safe-b));z-index:95;background:var(--steel);color:#fff;padding:11px 18px;border-radius:11px;font-weight:500;font-size:14px;box-shadow:var(--shadow);opacity:0;transition:.25s;pointer-events:none;display:flex;align-items:center;gap:9px;max-width:90%}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  .toast svg{width:18px;height:18px;color:var(--hivis);flex:none}

  .export-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:14px}
  .export-card h4{font-family:"Barlow Condensed";font-weight:700;font-size:16px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 4px}
  .export-card p{margin:0 0 11px;font-size:13.5px;color:var(--ink-soft);line-height:1.45}
  .export-card .row{display:flex;gap:9px}
  .export-card .btn{flex:1;font-size:13.5px;padding:11px 10px}
  textarea.exp{width:100%;height:140px;border:1px solid var(--line);border-radius:11px;padding:11px;font-family:"IBM Plex Mono";font-size:11px;line-height:1.4;background:var(--paper);color:var(--ink-soft);resize:none}

  @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
</style>
</head>
<body>
<div class="app">
  <header class="topbar">
    <div class="brand">
      <div class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18"/><path d="M5 18V11a7 7 0 0 1 14 0v7"/><path d="M12 4v2"/></svg></div>
      <div><h1>SiteKit</h1><small>Asset register</small></div>
    </div>
    <button class="icon-btn" id="exportBtn" aria-label="Share register with head office" title="Share with head office">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>
    </button>
  </header>
  <main id="view" class="scroll"></main>
</div>

<div class="navwrap"><div class="inner">
  <nav class="nav" id="nav">
    <button data-view="overview" class="on">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>Overview
    </button>
    <button data-view="assets">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.27 6.96 8.73 5.04 8.73-5.04"/><path d="M12 22.08V12"/></svg>Assets
    </button>
    <span></span>
    <button data-view="sites">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>Sites
    </button>
    <button data-view="assets" style="visibility:hidden">x</button>
  </nav>
  <button class="fab" id="fab" aria-label="Add asset"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
</div></div>

<!-- primary sheet (detail / create / edit / export) -->
<div class="scrim" id="scrim"></div>
<section class="sheet" id="sheet" aria-hidden="true">
  <div class="grab"></div>
  <div class="sh-head"><h3 id="sheetTitle">Add asset</h3>
    <button class="sh-x" id="sheetClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
  <div class="sh-body" id="sheetBody"></div>
</section>

<!-- secondary modal (move / update / pat) layered above the detail sheet -->
<div class="scrim modal-scrim" id="modalScrim"></div>
<section class="sheet modal" id="modal" aria-hidden="true">
  <div class="grab"></div>
  <div class="sh-head"><h3 id="modalTitle"></h3>
    <button class="sh-x" id="modalClose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
  <div class="sh-body" id="modalBody"></div>
</section>

<div class="toast" id="toast"><span id="toastMsg"></span></div>
<input type="file" id="fileInput" accept="image/*" capture="environment" style="display:none">

<script>
"use strict";
/* ============================================================
   SiteKit v2 — asset register with PAT records, moves,
   condition updates, serviceability and certificate output.
   ============================================================ */

/* ---------- storage ---------- */
// Storage: localStorage with in-memory fallback
const mem = new Map();
const Store = {
  async list(){
    try{
      const keys=Object.keys(localStorage).filter(k=>k.startsWith("bm_asset:"));
      return keys.map(k=>k.replace(/^bm_/,""));
    }catch(e){ return [...mem.keys()].filter(k=>k.startsWith("asset:")); }
  },
  async get(k){
    try{ const v=localStorage.getItem("bm_"+k); return v||null; }
    catch(e){ return mem.get(k)||null; }
  },
  async set(k,v){
    try{ localStorage.setItem("bm_"+k,v); }
    catch(e){ mem.set(k,v); }
  },
  async del(k){
    try{ localStorage.removeItem("bm_"+k); }
    catch(e){ mem.delete(k); }
  }
};

/* ---------- state ---------- */
const state = { assets:[], view:"overview", filterSite:"__all", search:"" };
let editingId=null, editFromDetail=false;
let draftPhoto=null;
let photoSink=null;           // callback for the shared file input
const CATS=["Power tools","Plant & machinery","Access equipment","Site lighting","Leads & cables","Welfare unit","Survey equipment","Hand tools","Other"];

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>(s==null?"":String(s)).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const uid=()=>"a"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function parseD(s){ if(!s) return null; const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function fmtD(s){ const d=(s instanceof Date)?s:parseD(s); if(!d) return "—"; return d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear(); }
function fmtShort(d){ const x=(d instanceof Date)?d:parseD(d); return x?x.getDate()+" "+MON[x.getMonth()]:"—"; }
function isoLocal(d){ const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0"); return d.getFullYear()+"-"+m+"-"+day; }
function addMonths(d,n){ const x=new Date(d.getTime()); const day=x.getDate(); x.setMonth(x.getMonth()+n); if(x.getDate()<day) x.setDate(0); return x; }
function today0(){ const t=new Date(); return new Date(t.getFullYear(),t.getMonth(),t.getDate()); }
function tsDate(ts){ return fmtD(isoLocal(new Date(ts))); }
const boxIcon=\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.27 6.96 8.73 5.04 8.73-5.04"/><path d="M12 22.08V12"/></svg>\`;
const pinIcon=\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>\`;

/* ---------- PAT engine ---------- */
function latestPat(a){ if(!a.patTests||!a.patTests.length) return null; return [...a.patTests].sort((x,y)=>(y.date||"").localeCompare(x.date||""))[0]; }
function patExpiry(t,a){ if(!t||!t.date) return null; return addMonths(parseD(t.date), t.interval||(a&&a.interval)||3); }
function patStatus(a){
  const lp=latestPat(a);
  if(!lp) return {key:"none",due:null,days:null};
  const due=patExpiry(lp,a);
  if(lp.result==="fail") return {key:"fail",due,days:null};
  const days=Math.round((due-today0())/86400000);
  return {key: days<0?"over":(days<=30?"due":"ok"), due, days};
}
function tagHTML(a){
  const s=patStatus(a); let txt;
  if(s.key==="none") txt="NO PAT TEST";
  else if(s.key==="fail") txt="PAT FAILED";
  else if(s.key==="over") txt="OVERDUE "+fmtShort(s.due);
  else if(s.key==="due") txt="DUE "+fmtShort(s.due);
  else txt="PAT OK · "+fmtShort(s.due);
  const cls=(s.key==="fail")?"over":s.key;
  return \`<span class="tag \${cls}"><span class="hole"></span><span class="lab">\${txt}</span></span>\`;
}
const oosTag=\`<span class="tag over"><span class="hole"></span><span class="lab">OUT OF SERVICE</span></span>\`;

/* an asset needs attention if out of service or PAT over/due/failed */
function attention(a){
  if(a.usable===false) return {sev:0,label:"Out of service",reason:"oos"};
  const s=patStatus(a);
  if(s.key==="fail") return {sev:0,label:"PAT failed",reason:"fail"};
  if(s.key==="over") return {sev:0,label:\`PAT overdue · \${Math.abs(s.days)}d\`,reason:"over"};
  if(s.key==="due")  return {sev:1,label:\`PAT due \${fmtShort(s.due)} · \${s.days}d\`,reason:"due"};
  return null;
}

/* ---------- load + migrate ---------- */
async function loadAll(){
  const keys=await Store.list();
  const out=[];
  for(const raw of keys){
    const k=String(raw).startsWith("asset:")?String(raw):"asset:"+raw;
    const v=await Store.get(k);
    if(v){ try{ out.push(migrate(JSON.parse(v))); }catch(e){} }
  }
  out.sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  state.assets=out;
}
function migrate(a){
  if(a.usable===undefined) a.usable=true;
  if(a.interval===undefined) a.interval=3;
  if(!Array.isArray(a.activity)) a.activity=[];
  if(!Array.isArray(a.patTests)){
    a.patTests=[];
    if(a.lastPat) a.patTests.push({id:uid(),date:a.lastPat,interval:a.interval||3,result:"pass",tester:"",notes:""});
  }
  return a;
}
async function saveAsset(a){ await Store.set("asset:"+a.id, JSON.stringify(a)); }
async function deleteAsset(id){ await Store.del("asset:"+id); }
function findAsset(id){ return state.assets.find(x=>x.id===id); }
function logActivity(a,entry){ entry.id=uid(); entry.ts=entry.ts||Date.now(); a.activity=a.activity||[]; a.activity.unshift(entry); }

/* ---------- sites + filter ---------- */
function sites(){ return [...new Set(state.assets.map(a=>a.site).filter(Boolean))].sort((a,b)=>a.localeCompare(b)); }
function filteredAssets(){
  const q=state.search.trim().toLowerCase();
  return state.assets.filter(a=>{
    if(state.filterSite!=="__all" && a.site!==state.filterSite) return false;
    if(q){ const hay=[a.name,a.category,a.site,a.tag,a.notes].join(" ").toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  });
}

/* ============================================================
   RENDER VIEWS
   ============================================================ */
function render(){
  document.querySelectorAll(".nav button[data-view]").forEach(b=>{ if(b.style.visibility==="hidden") return; b.classList.toggle("on", b.dataset.view===state.view); });
  const v=$("#view");
  v.style.animation="none"; void v.offsetWidth; v.style.animation="";
  if(state.view==="overview") v.innerHTML=renderOverview();
  else if(state.view==="assets") v.innerHTML=renderAssets();
  else if(state.view==="sites") v.innerHTML=renderSites();
  wire();
}

function renderOverview(){
  const total=state.assets.length;
  if(total===0) return emptyState();
  const nSites=sites().length;
  let patAtt=0, oos=0;
  state.assets.forEach(a=>{ const s=patStatus(a); if(s.key==="due"||s.key==="over"||s.key==="fail") patAtt++; if(a.usable===false) oos++; });

  const alerts=state.assets.map(a=>({a,att:attention(a)})).filter(x=>x.att).sort((x,y)=> x.att.sev-y.att.sev);

  let html=\`<p class="eyebrow">Site overview</p>
    <div class="tiles">
      <div class="tile acc"><span class="bar"></span><div class="n">\${total}</div><div class="l">Assets tracked</div></div>
      <div class="tile"><span class="bar"></span><div class="n">\${nSites}</div><div class="l">Active site\${nSites===1?"":"s"}</div></div>
      <div class="tile due"><span class="bar"></span><div class="n">\${patAtt}</div><div class="l">Need PAT attention</div></div>
      <div class="tile over"><span class="bar"></span><div class="n">\${oos}</div><div class="l">Out of service</div></div>
    </div>
    <div class="h-row"><h2>Action needed</h2></div>\`;

  if(!alerts.length){
    html+=\`<div class="alert" style="color:var(--ink-soft)">
      <div class="thumb" style="background:var(--ok-bg);color:var(--ok)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
      <div class="mid"><div class="nm">All clear</div><div class="sub">No PAT due and nothing out of service.</div></div></div>\`;
  } else {
    alerts.forEach(({a,att})=>{
      const ph=a.photo?\`style="background-image:url('\${a.photo}')"\`:"";
      const t = att.reason==="oos" ? oosTag : tagHTML(a);
      html+=\`<div class="alert" data-open="\${a.id}">
        <div class="thumb" \${ph}>\${a.photo?"":boxIcon}</div>
        <div class="mid"><div class="nm">\${esc(a.name)}</div><div class="sub">\${esc(a.site||"No site")} · \${esc(att.label)}</div></div>
        \${t}</div>\`;
    });
  }
  return html;
}

function renderAssets(){
  if(state.assets.length===0) return emptyState();
  const list=filteredAssets(), ss=sites();
  let chips=\`<button class="chip \${state.filterSite==="__all"?"on":""}" data-site="__all">All sites</button>\`;
  ss.forEach(s=> chips+=\`<button class="chip \${state.filterSite===s?"on":""}" data-site="\${esc(s)}">\${esc(s)}</button>\`);

  let html=\`<div class="h-row"><h2>Assets</h2><span class="mono" style="font-size:12px;color:var(--ink-faint)">\${list.length} item\${list.length===1?"":"s"}</span></div>
    <div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="searchInput" type="search" placeholder="Search name, tag, category…" value="\${esc(state.search)}"></div>
    <div class="chips">\${chips}</div>\`;

  if(!list.length){ html+=\`<div class="empty"><div class="ic">\${boxIcon}</div><h3>Nothing here</h3><p>No assets match your search or this site.</p></div>\`; return html; }

  list.forEach(a=>{
    const ph=a.photo?\`style="background-image:url('\${a.photo}')"\`:"";
    const oos=a.usable===false;
    html+=\`<div class="card \${oos?"oos":""}" data-open="\${a.id}">
      <div class="photo" \${ph}>\${a.photo?"":boxIcon}\${oos?'<div class="oosdot">Out of service</div>':""}</div>
      <div class="body">
        <div class="name">\${esc(a.name)}</div>
        <div class="cat">\${esc(a.category||"Uncategorised")}\${a.tag?" · "+esc(a.tag):""}</div>
        <div class="tagrow">\${tagHTML(a)}\${oos?oosTag:""}</div>
        <div class="meta">\${pinIcon}\${esc(a.site||"No site")}\${a.delivered?\`&nbsp;·&nbsp;<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> \${fmtShort(a.delivered)}\`:""}</div>
      </div></div>\`;
  });
  return html;
}

function renderSites(){
  if(state.assets.length===0) return emptyState();
  const ss=sites();
  let html=\`<div class="h-row"><h2>Sites</h2><span class="mono" style="font-size:12px;color:var(--ink-faint)">\${ss.length} active</span></div>\`;
  if(!ss.length){ html+=\`<div class="empty"><div class="ic">\${pinIcon}</div><h3>No sites yet</h3><p>Add a site when you create an asset and it will appear here.</p></div>\`; return html; }
  ss.forEach(site=>{
    const items=state.assets.filter(a=>a.site===site);
    let ok=0,due=0,over=0,oos=0;
    items.forEach(a=>{ if(a.usable===false){oos++;return;} const s=patStatus(a); if(s.key==="ok")ok++; else if(s.key==="due")due++; else over++; });
    const seg=(n,c,l)=> n>0?\`<span class="pillstat"><i style="background:\${c}"></i>\${n} \${l}</span>\`:"";
    html+=\`<div class="site" data-site-open="\${esc(site)}">
      <div class="st-top"><div class="st-name"><div class="pin">\${pinIcon}</div><b>\${esc(site)}</b></div>
        <span class="count">\${items.length} asset\${items.length===1?"":"s"}</span></div>
      <div class="breakdown">\${seg(oos,"var(--over)","out of service")}\${seg(over,"var(--over)","PAT issue")}\${seg(due,"var(--due)","PAT due")}\${seg(ok,"var(--ok)","ready")}</div>
    </div>\`;
  });
  return html;
}

function emptyState(){
  return \`<div class="empty"><div class="ic">\${boxIcon}</div><h3>No assets yet</h3>
    <p>Add the tools, plant and equipment on your sites. Then move them, log condition and track PAT tests over time.</p>
    <div style="display:flex;flex-direction:column;gap:10px;align-items:center">
      <button class="btn btn-pri" id="emptyAdd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Add your first asset</button>
      <button class="btn btn-ghost" id="emptySample">Load sample assets</button>
    </div></div>\`;
}

/* ---------- wiring ---------- */
function wire(){
  document.querySelectorAll("[data-open]").forEach(n=> n.onclick=()=>openDetail(n.dataset.open));
  document.querySelectorAll(".chip[data-site]").forEach(n=> n.onclick=()=>{state.filterSite=n.dataset.site;render();});
  document.querySelectorAll("[data-site-open]").forEach(n=> n.onclick=()=>{state.filterSite=n.dataset.siteOpen;state.view="assets";render();});
  const si=$("#searchInput"); if(si) si.oninput=()=>{ state.search=si.value; renderAssetsInPlace(); };
  const ea=$("#emptyAdd"); if(ea) ea.onclick=()=>openSheet(null);
  const es=$("#emptySample"); if(es) es.onclick=loadSamples;
}
function renderAssetsInPlace(){
  const v=$("#view"); const val=$("#searchInput")?$("#searchInput").value:null;
  v.innerHTML=renderAssets(); wire();
  const si=$("#searchInput"); if(si&&val!=null){ si.focus(); si.setSelectionRange(val.length,val.length); }
}

$("#nav").addEventListener("click",e=>{ const b=e.target.closest("button[data-view]"); if(!b||b.style.visibility==="hidden") return; state.view=b.dataset.view; render(); });
$("#fab").onclick=()=>openSheet(null);

/* ============================================================
   DETAIL  (primary sheet)
   ============================================================ */
function openDetail(id){
  const a=findAsset(id); if(!a) return;
  const s=patStatus(a);
  const ph=a.photo?\`style="background-image:url('\${a.photo}')"\`:"";
  const oos=a.usable===false;
  const useChip = oos
    ? \`<span class="tag over"><span class="hole"></span><span class="lab">NOT USABLE</span></span>\`
    : \`<span class="tag ok"><span class="hole"></span><span class="lab">USABLE</span></span>\`;

  $("#sheetTitle").textContent="Asset details";
  $("#sheetBody").innerHTML=\`
    <div class="det-photo" \${ph}>\${a.photo?"":boxIcon}\${oos?'<div class="oos-ribbon">Out of service</div>':""}</div>
    <div class="det-head">
      <div><div class="dh-name">\${esc(a.name)}</div><div class="dh-cat">\${esc(a.category||"Uncategorised")}\${a.tag?" · "+esc(a.tag):""}</div></div>
      <div class="det-chips">\${tagHTML(a)}\${useChip}</div>
    </div>

    <div class="qa">
      <button id="detMove"><span class="qi">\${pinIcon}</span><span>Move</span></button>
      <button id="detUpdate" class="accent"><span class="qi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg></span><span>Update</span></button>
      <button id="detPat"><span class="qi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3-4-3-9-3-9 1.34-9 3"/></svg></span><span>PAT test</span></button>
      <button id="detEdit"><span class="qi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></span><span>Edit</span></button>
    </div>

    <div class="sec"><span>Details</span></div>
    <div class="det-row"><span class="k">Current site</span><span class="v">\${esc(a.site||"—")}</span></div>
    <div class="det-row"><span class="k">Asset tag</span><span class="v mono">\${esc(a.tag||"—")}</span></div>
    <div class="det-row"><span class="k">Delivered to site</span><span class="v mono">\${a.delivered?fmtD(a.delivered):"—"}</span></div>
    <div class="det-row"><span class="k">Next PAT due</span><span class="v mono">\${s.due?fmtD(s.due):"—"}</span></div>
    \${a.notes?\`<div class="det-row" style="flex-direction:column;align-items:flex-start"><span class="k" style="margin-bottom:6px">Notes</span><span class="v" style="text-align:left;font-size:14px;color:var(--ink-soft);line-height:1.5">\${esc(a.notes)}</span></div>\`:""}

    <div class="sec"><span>PAT tests</span><button class="addlink" id="patAdd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Add test</button></div>
    <div id="patList">\${patListHTML(a)}</div>

    <div class="sec"><span>Activity</span></div>
    <div id="actList">\${activityHTML(a)}</div>
    <div style="height:8px"></div>\`;
  showSheet();

  $("#detMove").onclick=()=>openMove(id);
  $("#detUpdate").onclick=()=>openUpdate(id);
  $("#detPat").onclick=()=>openPat(id);
  $("#patAdd").onclick=()=>openPat(id);
  $("#detEdit").onclick=()=>{ editFromDetail=true; openSheet(id); };
  wireCertButtons(a);
}

function patListHTML(a){
  if(!a.patTests||!a.patTests.length) return \`<p class="muted">No PAT tests recorded. Add one to start tracking the expiry date.</p>\`;
  return [...a.patTests].sort((x,y)=>(y.date||"").localeCompare(x.date||"")).map(t=>{
    const exp=patExpiry(t,a);
    const pass=t.result!=="fail";
    return \`<div class="patrec">
      <div class="pr-main">
        <div class="pr-date">\${fmtD(t.date)}</div>
        <div class="pr-meta">Retest every \${t.interval||a.interval||3} mo · expires <b>\${fmtD(exp)}</b></div>
        \${t.tester?\`<div class="pr-tester">Tested by \${esc(t.tester)}</div>\`:""}
      </div>
      <div class="pr-right">
        <span class="tag \${pass?"ok":"over"}"><span class="hole"></span><span class="lab">\${pass?"PASS":"FAIL"}</span></span>
        <button class="cert-btn" data-cert="\${t.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg> Certificate</button>
      </div></div>\`;
  }).join("");
}
function wireCertButtons(a){ document.querySelectorAll("[data-cert]").forEach(b=> b.onclick=()=>generateCert(a.id,b.dataset.cert)); }

function activityHTML(a){
  if(!a.activity||!a.activity.length) return \`<p class="muted">No activity yet. Moves, condition photos and comments will appear here.</p>\`;
  return \`<div class="tl">\`+a.activity.map(e=>{
    let dotCls="", title="", sub="";
    if(e.type==="create"){ title="Added to register"; sub=e.to?\`Initial location: \${esc(e.to)}\`:""; }
    else if(e.type==="move"){ dotCls="move"; title="Moved"; sub=\`<span class="move-arrow">\${esc(e.from||"—")} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> \${esc(e.to||"—")}</span>\${e.text?\`<br>\${esc(e.text)}\`:""}\`; }
    else if(e.type==="condition"){ dotCls=e.usable===false?"oos":"cond"; title="Condition update"; const bits=[]; if(e.usable===true)bits.push("Marked usable"); if(e.usable===false)bits.push("Marked not usable"); if(e.text)bits.push(esc(e.text)); sub=bits.join(" · "); }
    else if(e.type==="pat"){ dotCls=e.result==="fail"?"oos":"pat"; title=\`PAT test — \${e.result==="fail"?"failed":"passed"}\`; sub=e.expiry?\`Expires \${fmtD(e.expiry)}\`:""; }
    const date = e.effDate?fmtD(e.effDate):tsDate(e.ts);
    const photo = e.photo?\`<div class="ti-photo" style="background-image:url('\${e.photo}')"></div>\`:"";
    return \`<div class="tl-item"><div class="dot \${dotCls}"></div>
      <div class="ti-top"><div class="ti-title">\${title}</div><div class="ti-date">\${date}</div></div>
      \${sub?\`<div class="ti-sub">\${sub}</div>\`:""}\${photo}</div>\`;
  }).join("")+\`</div>\`;
}

/* ============================================================
   CREATE / EDIT  (primary sheet)
   ============================================================ */
let formUsable=true;
function openSheet(id){
  editingId=id;
  const a=id?findAsset(id):null;
  draftPhoto=a?(a.photo||null):null;
  formUsable=a?(a.usable!==false):true;
  $("#sheetTitle").textContent=a?"Edit asset":"Add asset";
  const siteOpts=sites().map(s=>\`<option value="\${esc(s)}">\`).join("");
  const catOpts=CATS.map(c=>\`<option value="\${esc(c)}">\`).join("");
  const todayISO=isoLocal(today0());

  $("#sheetBody").innerHTML=\`
    <div class="photozone \${draftPhoto?"has":""}" id="photozone" \${draftPhoto?\`style="background-image:url('\${draftPhoto}')"\`:""}>
      \${draftPhoto?"":\`<div class="ph-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Tap to add photo</span></div>\`}
      <div class="ph-actions"><button type="button" id="photoBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg></button>\${draftPhoto?\`<button type="button" id="photoDel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>\`:""}</div>
    </div>
    <div class="field"><label for="f_name">Asset name <span class="req">*</span></label><input class="inp" id="f_name" placeholder="e.g. 110V transformer" value="\${a?esc(a.name):""}"></div>
    <div class="two">
      <div class="field"><label for="f_cat">Category</label><input class="inp" id="f_cat" list="catList" placeholder="Choose / type" value="\${a?esc(a.category||""):""}"><datalist id="catList">\${catOpts}</datalist></div>
      <div class="field"><label for="f_tag">Asset tag / serial</label><input class="inp mono" id="f_tag" placeholder="e.g. TRF-0142" value="\${a?esc(a.tag||""):""}"></div>
    </div>
    <div class="field"><label for="f_site">\${a?"Current site":"Site"} <span class="req">*</span></label><input class="inp" id="f_site" list="siteList" placeholder="e.g. Riverside Plot 4" value="\${a?esc(a.site||""):""}"><datalist id="siteList">\${siteOpts}</datalist>
      \${a?\`<div class="nextline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg><span>To record a relocation with history, use <b>Move</b> instead of editing this field.</span></div>\`:""}
    </div>
    <div class="field"><label for="f_delivered">Delivered to site</label><input class="inp mono" id="f_delivered" type="date" max="\${todayISO}" value="\${a?esc(a.delivered||""):""}"></div>
    <div class="field"><label>Serviceability</label>
      <div class="seg use" id="useSel"><button type="button" class="yes" data-u="1">Usable</button><button type="button" class="no" data-u="0">Not usable</button></div>
    </div>
    <div class="field"><label for="f_notes">Notes</label><textarea class="inp" id="f_notes" placeholder="Condition, accessories, who delivered it…">\${a?esc(a.notes||""):""}</textarea></div>
    \${id?\`<button class="danger" id="deleteBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg> Delete this asset</button>\`:""}\`;

  // footer
  let foot=$("#sheetFoot"); if(foot) foot.remove();
  foot=el("div","sh-foot"); foot.id="sheetFoot";
  foot.innerHTML=\`<button class="btn btn-ghost" id="cancelBtn">\${editFromDetail?"Back":"Cancel"}</button><button class="btn btn-pri" id="saveBtn">\${id?"Save changes":"Add asset"}</button>\`;
  $("#sheet").appendChild(foot);

  function paintUse(){ document.querySelectorAll("#useSel button").forEach(b=> b.classList.toggle("on", (b.dataset.u==="1")===formUsable)); }
  document.querySelectorAll("#useSel button").forEach(b=> b.onclick=()=>{ formUsable=(b.dataset.u==="1"); paintUse(); });
  paintUse();

  $("#photoBtn").onclick=()=>pickPhoto(u=>{draftPhoto=u;refreshPhotoZone();});
  $("#photozone").onclick=(e)=>{ if(e.target.closest(".ph-actions")) return; pickPhoto(u=>{draftPhoto=u;refreshPhotoZone();}); };
  const pd=$("#photoDel"); if(pd) pd.onclick=()=>{draftPhoto=null;refreshPhotoZone();};

  const db=$("#deleteBtn");
  if(db) db.onclick=async()=>{ if(!confirm("Delete this asset? This cannot be undone.")) return; await deleteAsset(id); await loadAll(); closeSheet(); render(); toast("Asset deleted"); };

  $("#cancelBtn").onclick=()=>{ if(editFromDetail){ editFromDetail=false; openDetail(id); } else closeSheet(); };
  $("#saveBtn").onclick=saveFromForm;
  showSheet();
  setTimeout(()=>{ const n=$("#f_name"); if(n&&!id) n.focus(); },320);
}
function refreshPhotoZone(){
  const z=$("#photozone"); if(!z) return;
  z.classList.toggle("has",!!draftPhoto);
  z.style.backgroundImage=draftPhoto?\`url('\${draftPhoto}')\`:"";
  z.innerHTML = (draftPhoto?"":\`<div class="ph-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg><span>Tap to add photo</span></div>\`)
    + \`<div class="ph-actions"><button type="button" id="photoBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg></button>\${draftPhoto?\`<button type="button" id="photoDel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>\`:""}</div>\`;
  $("#photoBtn").onclick=()=>pickPhoto(u=>{draftPhoto=u;refreshPhotoZone();});
  const pd=$("#photoDel"); if(pd) pd.onclick=()=>{draftPhoto=null;refreshPhotoZone();};
}

async function saveFromForm(){
  const name=$("#f_name").value.trim(), site=$("#f_site").value.trim();
  if(!name){ toast("Please enter an asset name"); $("#f_name").focus(); return; }
  if(!site){ toast("Please enter a site"); $("#f_site").focus(); return; }
  const isNew=!editingId;
  let a = isNew ? {id:uid(),patTests:[],activity:[],interval:3,created:Date.now()} : Object.assign({},findAsset(editingId));
  const prevUsable = a.usable;
  a.name=name; a.category=$("#f_cat").value.trim(); a.tag=$("#f_tag").value.trim();
  a.site=site; a.delivered=$("#f_delivered").value||""; a.notes=$("#f_notes").value.trim();
  a.photo=draftPhoto||null; a.usable=formUsable;
  if(isNew){ logActivity(a,{type:"create",to:site,effDate:a.delivered||isoLocal(today0())}); }
  else if(prevUsable!==formUsable){ logActivity(a,{type:"condition",usable:formUsable,text:"Updated from edit screen"}); }
  await saveAsset(a);
  await loadAll();
  const back=editFromDetail; editFromDetail=false;
  if(back){ openDetail(a.id); } else { closeSheet(); }
  render();
  toast(isNew?"Asset added":"Asset updated");
}

/* ---------- primary sheet open/close ---------- */
function showSheet(){ $("#scrim").classList.add("show"); $("#sheet").classList.add("show"); $("#sheet").setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
function closeSheet(){ $("#scrim").classList.remove("show"); $("#sheet").classList.remove("show"); $("#sheet").setAttribute("aria-hidden","true"); document.body.style.overflow=""; editingId=null; editFromDetail=false; draftPhoto=null; }
$("#scrim").onclick=closeSheet; $("#sheetClose").onclick=()=>{ if(editFromDetail){ const id=editingId; editFromDetail=false; openDetail(id);} else closeSheet(); };

/* ============================================================
   MODAL LAYER  (move / update / pat)  — above the detail sheet
   ============================================================ */
let modalPhoto=null;
function showModal(title){ $("#modalTitle").textContent=title; $("#modalScrim").classList.add("show"); $("#modal").classList.add("show"); $("#modal").setAttribute("aria-hidden","false"); }
function closeModal(){ $("#modalScrim").classList.remove("show"); $("#modal").classList.remove("show"); $("#modal").setAttribute("aria-hidden","true"); modalPhoto=null; }
$("#modalScrim").onclick=closeModal; $("#modalClose").onclick=closeModal;
function modalFoot(saveLabel){
  let f=$("#modalFoot"); if(f) f.remove();
  f=el("div","sh-foot"); f.id="modalFoot";
  f.innerHTML=\`<button class="btn btn-ghost" id="mCancel">Cancel</button><button class="btn btn-pri" id="mSave">\${saveLabel}</button>\`;
  $("#modal").appendChild(f); $("#mCancel").onclick=closeModal;
}
function refreshDetailSections(a){ const p=$("#patList"); if(p)p.innerHTML=patListHTML(a); const ac=$("#actList"); if(ac)ac.innerHTML=activityHTML(a); wireCertButtons(a); }

/* MOVE */
function openMove(id){
  const a=findAsset(id); if(!a) return;
  const siteOpts=sites().filter(s=>s!==a.site).map(s=>\`<option value="\${esc(s)}">\`).join("");
  const todayISO=isoLocal(today0());
  $("#modalBody").innerHTML=\`
    <div class="nextline" style="margin:0 0 16px"><span>Currently at <b>\${esc(a.site||"—")}</b></span></div>
    <div class="field"><label for="m_site">New location <span class="req">*</span></label><input class="inp" id="m_site" list="moveSites" placeholder="e.g. Eastgate Phase 2" autocomplete="off"><datalist id="moveSites">\${siteOpts}</datalist></div>
    <div class="field"><label for="m_date">Date moved</label><input class="inp mono" id="m_date" type="date" max="\${todayISO}" value="\${todayISO}"></div>
    <div class="field"><label for="m_note">Note (optional)</label><input class="inp" id="m_note" placeholder="e.g. transferred with the breaker set"></div>\`;
  modalFoot("Move asset"); showModal("Move asset");
  setTimeout(()=>$("#m_site").focus(),320);
  $("#mSave").onclick=async()=>{
    const to=$("#m_site").value.trim();
    if(!to){ toast("Enter the new location"); $("#m_site").focus(); return; }
    const from=a.site||""; const date=$("#m_date").value||todayISO;
    a.site=to; logActivity(a,{type:"move",from,to,text:$("#m_note").value.trim(),effDate:date});
    await saveAsset(a); closeModal(); openDetail(id); render(); toast("Moved to "+to);
  };
}

/* UPDATE CONDITION (photo + comment + usable) */
function openUpdate(id){
  const a=findAsset(id); if(!a) return;
  modalPhoto=null;
  let mUse=a.usable!==false;
  $("#modalBody").innerHTML=\`
    <div class="field"><label>Current condition photo</label><div class="mphoto" id="mPhotoWrap"></div></div>
    <div class="field"><label for="u_comment">Comment</label><textarea class="inp" id="u_comment" placeholder="e.g. casing cracked, guard missing, serviced and cleaned…"></textarea></div>
    <div class="field"><label>Serviceability</label><div class="seg use" id="uUse"><button type="button" class="yes" data-u="1">Usable</button><button type="button" class="no" data-u="0">Not usable</button></div></div>\`;
  modalFoot("Save update"); showModal("Update condition");
  function paintU(){ document.querySelectorAll("#uUse button").forEach(b=> b.classList.toggle("on",(b.dataset.u==="1")===mUse)); }
  document.querySelectorAll("#uUse button").forEach(b=> b.onclick=()=>{ mUse=(b.dataset.u==="1"); paintU(); });
  paintU();
  function paintPhoto(){
    const w=$("#mPhotoWrap"); if(!w) return;
    if(modalPhoto){ w.innerHTML=\`<div class="prev" style="background-image:url('\${modalPhoto}')"></div><button type="button" class="rm" id="mRm">Remove</button>\`; $("#mRm").onclick=()=>{modalPhoto=null;paintPhoto();}; }
    else { w.innerHTML=\`<div class="prev">\${boxIcon}</div><button type="button" class="addbtn" id="mAdd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3.5"/></svg> Take / choose photo</button>\`; $("#mAdd").onclick=()=>pickPhoto(u=>{modalPhoto=u;paintPhoto();}); }
  }
  paintPhoto();
  $("#mSave").onclick=async()=>{
    const comment=$("#u_comment").value.trim();
    const usableChanged = (a.usable!==false)!==mUse;
    if(!modalPhoto && !comment && !usableChanged){ toast("Add a photo, comment or change status"); return; }
    if(modalPhoto) a.photo=modalPhoto;            // newest photo = current condition
    a.usable=mUse;
    logActivity(a,{type:"condition",photo:modalPhoto||null,text:comment,usable:mUse});
    await saveAsset(a); closeModal(); openDetail(id); render(); toast("Condition updated");
  };
}

/* ADD PAT TEST */
function openPat(id){
  const a=findAsset(id); if(!a) return;
  let pInt=a.interval||3, pRes="pass";
  const todayISO=isoLocal(today0());
  $("#modalBody").innerHTML=\`
    <div class="field"><label for="p_date">Test date <span class="req">*</span></label><input class="inp mono" id="p_date" type="date" max="\${todayISO}" value="\${todayISO}"></div>
    <div class="field"><label>Retest every</label><div class="seg" id="pInt"><button type="button" data-m="3">3 mo</button><button type="button" data-m="6">6 mo</button><button type="button" data-m="12">12 mo</button></div>
      <div class="nextline" id="pNext"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span id="pNextTxt"></span></div></div>
    <div class="field"><label>Result</label><div class="seg res" id="pRes"><button type="button" class="pass" data-r="pass">Pass</button><button type="button" class="fail" data-r="fail">Fail</button></div></div>
    <div class="field"><label for="p_tester">Tested by (optional)</label><input class="inp" id="p_tester" placeholder="e.g. J. Doe / Acme PAT Ltd"></div>
    <div class="field"><label for="p_notes">Notes (optional)</label><input class="inp" id="p_notes" placeholder="e.g. replaced plug, retest passed"></div>\`;
  modalFoot("Save test"); showModal("Add PAT test");
  function paintInt(){ document.querySelectorAll("#pInt button").forEach(b=> b.classList.toggle("on",Number(b.dataset.m)===pInt)); updNext(); }
  function paintRes(){ document.querySelectorAll("#pRes button").forEach(b=> b.classList.toggle("on",b.dataset.r===pRes)); }
  function updNext(){
    const d=$("#p_date").value; const t=$("#pNextTxt");
    if(!d){ t.textContent="Pick a test date to see the expiry."; return; }
    const due=addMonths(parseD(d),pInt); const days=Math.round((due-today0())/86400000);
    t.innerHTML=\`Expires <b>\${fmtD(due)}</b>\${days>=0?\` · in \${days} day\${days===1?"":"s"}\`:\` · \${Math.abs(days)} day\${Math.abs(days)===1?"":"s"} ago\`}\`;
  }
  document.querySelectorAll("#pInt button").forEach(b=> b.onclick=()=>{pInt=Number(b.dataset.m);paintInt();});
  document.querySelectorAll("#pRes button").forEach(b=> b.onclick=()=>{pRes=b.dataset.r;paintRes();});
  $("#p_date").addEventListener("change",updNext);
  paintInt(); paintRes();
  $("#mSave").onclick=async()=>{
    const date=$("#p_date").value;
    if(!date){ toast("Pick a test date"); return; }
    const test={id:uid(),date,interval:pInt,result:pRes,tester:$("#p_tester").value.trim(),notes:$("#p_notes").value.trim()};
    a.patTests=a.patTests||[]; a.patTests.push(test); a.interval=pInt;
    const exp=patExpiry(test,a);
    logActivity(a,{type:"pat",result:pRes,expiry:isoLocal(exp),effDate:date});
    let msg="PAT test added";
    if(pRes==="fail"){ a.usable=false; logActivity(a,{type:"condition",usable:false,text:"Failed PAT test"}); msg="Recorded as failed — asset set out of service"; }
    await saveAsset(a); closeModal(); openDetail(id); render(); toast(msg);
  };
}

/* ---------- shared photo capture + compress ---------- */
function pickPhoto(cb){ photoSink=cb; const fi=$("#fileInput"); fi.value=""; fi.click(); }
$("#fileInput").addEventListener("change",function(){
  const f=this.files&&this.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=e=>{ const img=new Image(); img.onload=()=>{
    const max=1024; let w=img.width,h=img.height;
    if(w>max||h>max){ const r=Math.min(max/w,max/h); w=Math.round(w*r); h=Math.round(h*r); }
    const c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h);
    const data=c.toDataURL("image/jpeg",0.72); if(photoSink) photoSink(data); photoSink=null;
  }; img.src=e.target.result; };
  reader.readAsDataURL(f);
});

/* ---------- toast ---------- */
let toastT=null;
function toast(msg){
  const t=$("#toast"); $("#toastMsg").textContent=msg;
  const old=t.querySelector("svg"); if(old) old.remove();
  t.insertAdjacentHTML("afterbegin",\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>\`);
  t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400);
}

/* ============================================================
   PAT CERTIFICATE  (document generator)
   ============================================================ */
function generateCert(assetId,testId){
  const a=findAsset(assetId); if(!a) return;
  const t=(a.patTests||[]).find(x=>x.id===testId); if(!t) return;
  const exp=patExpiry(t,a);
  const pass=t.result!=="fail";
  const html=certHTML(a,t,exp,pass);
  const fname=\`PAT-cert-\${(a.tag||a.name||"asset").replace(/[^\\w-]+/g,"_")}-\${t.date}.html\`;
  const ok=download(fname,html,"text/html");
  toast(ok?"Certificate downloaded — open & print to PDF":"Use the on-screen copy instead");
  if(!ok){ // fallback: show in modal to copy
    $("#modalBody").innerHTML=\`<p class="muted">Couldn't download automatically. Copy this certificate file and save it as <b>\${esc(fname)}</b>, then open it in a browser to print.</p><textarea class="exp" readonly id="certArea" style="height:240px">\${esc(html)}</textarea>\`;
    modalFoot("Copy"); showModal("PAT certificate");
    $("#mSave").textContent="Copy"; $("#mSave").onclick=async()=>{ const ta=$("#certArea"); try{ await navigator.clipboard.writeText(ta.value); toast("Certificate copied"); }catch(e){ ta.focus(); ta.select(); toast("Selected — copy manually"); } };
  }
}
function certHTML(a,t,exp,pass){
  const E=esc;
  return \`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>PAT Certificate — \${E(a.name)}</title>
<style>
@page{size:A4;margin:18mm}
*{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
body{margin:0;color:#1f2933;background:#f3f2ee;padding:24px}
.sheet{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e2e0da;border-radius:10px;overflow:hidden}
.head{background:#1f2933;color:#fff;padding:22px 26px;display:flex;justify-content:space-between;align-items:flex-start}
.head h1{font-size:20px;letter-spacing:.06em;text-transform:uppercase;margin:0}
.head .sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#9aa5b1;margin-top:6px}
.mark{background:#ffb000;color:#3a2a00;font-weight:800;border-radius:8px;padding:8px 12px;font-size:13px;letter-spacing:.12em}
.body{padding:26px}
.result{display:flex;align-items:center;gap:16px;margin-bottom:22px}
.stamp{font-size:26px;font-weight:800;letter-spacing:.08em;padding:10px 22px;border-radius:8px;border:3px solid}
.pass{color:#1c6b3c;border-color:#2e9e5b;background:#e7f4ec}
.fail{color:#a32525;border-color:#d64545;background:#fbe6e6}
.result .meta{font-size:13px;color:#52606d}
table{width:100%;border-collapse:collapse;margin-bottom:8px}
td{padding:11px 6px;border-bottom:1px solid #eceae4;font-size:14px;vertical-align:top}
td.k{width:42%;color:#7b8794;text-transform:uppercase;letter-spacing:.06em;font-size:11px;font-weight:700;padding-top:13px}
.expiry{margin-top:18px;padding:14px 16px;border-radius:8px;background:#f3f2ee;border:1px solid #e2e0da;display:flex;justify-content:space-between;font-size:14px}
.expiry b{font-size:16px}
.sign{display:flex;gap:40px;margin-top:34px}
.sign div{flex:1}
.line{border-top:1px solid #1f2933;margin-top:34px;padding-top:6px;font-size:11px;color:#7b8794;text-transform:uppercase;letter-spacing:.06em}
.foot{padding:16px 26px;border-top:1px solid #eceae4;font-size:11px;color:#9aa5b1;display:flex;justify-content:space-between}
.print{position:fixed;right:18px;bottom:18px;background:#ffb000;color:#3a2a00;border:none;border-radius:10px;padding:13px 20px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)}
@media print{.print{display:none}body{background:#fff;padding:0}.sheet{border:none}}
</style></head><body>
<div class="sheet">
  <div class="head"><div><h1>Portable Appliance Test</h1><div class="sub">Test certificate</div></div><div class="mark">SITEKIT</div></div>
  <div class="body">
    <div class="result"><span class="stamp \${pass?"pass":"fail"}">\${pass?"PASS":"FAIL"}</span><div class="meta">Test performed on <b>\${fmtD(t.date)}</b>\${t.tester?\`<br>by \${E(t.tester)}\`:""}</div></div>
    <table>
      <tr><td class="k">Asset</td><td>\${E(a.name)}</td></tr>
      <tr><td class="k">Category</td><td>\${E(a.category||"—")}</td></tr>
      <tr><td class="k">Asset tag / serial</td><td>\${E(a.tag||"—")}</td></tr>
      <tr><td class="k">Location at test</td><td>\${E(a.site||"—")}</td></tr>
      <tr><td class="k">Test result</td><td>\${pass?"Pass — safe for use":"Fail — removed from service"}</td></tr>
      <tr><td class="k">Retest interval</td><td>Every \${t.interval||a.interval||3} months</td></tr>
      \${t.notes?\`<tr><td class="k">Notes</td><td>\${E(t.notes)}</td></tr>\`:""}
    </table>
    <div class="expiry"><span>Next test due</span><b>\${fmtD(exp)}</b></div>
    <div class="sign"><div><div class="line">Tester signature</div></div><div><div class="line">Date</div></div></div>
  </div>
  <div class="foot"><span>Generated by SiteKit asset register</span><span>\${fmtD(isoLocal(new Date()))}</span></div>
</div>
<button class="print" onclick="window.print()">Print / Save as PDF</button>
</body></html>\`;
}

/* ============================================================
   EXPORT / SHARE WITH HEAD OFFICE
   ============================================================ */
function buildCSV(){
  const head=["Name","Category","Asset tag","Current site","Delivered","Usable","Last PAT","Last result","Next PAT due","PAT status","PAT tests (count)","Notes"];
  const rows=state.assets.map(a=>{
    const s=patStatus(a), lp=latestPat(a);
    const st=s.key==="none"?"No test":s.key==="fail"?"Failed":s.key==="over"?"Overdue":s.key==="due"?"Due soon":"Valid";
    const cells=[a.name,a.category,a.tag,a.site,a.delivered,(a.usable===false?"No":"Yes"),lp?lp.date:"",lp?(lp.result==="fail"?"Fail":"Pass"):"",s.due?isoLocal(s.due):"",st,(a.patTests||[]).length,(a.notes||"").replace(/\\n/g," ")];
    return cells.map(v=>{ v=v==null?"":String(v); return /[",\\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(",");
  });
  return [head.join(","),...rows].join("\\n");
}
function buildJSON(){
  return JSON.stringify({
    exported:new Date().toISOString(), site_count:sites().length, asset_count:state.assets.length,
    assets:state.assets.map(a=>{ const {photo,activity,patTests,...rest}=a; return {...rest, patTests:patTests||[], activity:(activity||[]).map(({photo,...e})=>e)}; })
  },null,2);
}
function download(filename,text,mime){
  try{ const blob=new Blob([text],{type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},500); return true; }catch(e){ return false; }
}
async function copyText(t){ try{ await navigator.clipboard.writeText(t); return true; }catch(e){ return false; } }

$("#exportBtn").onclick=()=>{
  if(state.assets.length===0){ toast("Add some assets first"); return; }
  closeModal();
  $("#sheetTitle").textContent="Share with head office";
  const csv=buildCSV();
  $("#sheetBody").innerHTML=\`
    <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin:2px 2px 16px">Export the full register to send or upload to the parent company. In a live system this would sync automatically.</p>
    <div class="export-card"><h4>Spreadsheet (CSV)</h4><p>Opens in Excel or Sheets — every asset, location, PAT date and status.</p>
      <div class="row"><button class="btn btn-pri" id="csvDl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> Download CSV</button><button class="btn btn-ghost" id="csvCopy">Copy</button></div></div>
    <div class="export-card"><h4>Data backup (JSON)</h4><p>Full structured backup including PAT history for re-import or integration.</p>
      <div class="row"><button class="btn btn-pri" id="jsonDl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> Download JSON</button><button class="btn btn-ghost" id="jsonCopy">Copy</button></div></div>
    <label class="field" style="margin-top:4px"><span style="font-family:'Barlow Condensed';font-weight:600;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);display:block;margin-bottom:6px">Preview (CSV)</span></label>
    <textarea class="exp" id="expArea" readonly>\${esc(csv)}</textarea>\`;
  let foot=$("#sheetFoot"); if(foot) foot.remove();
  foot=el("div","sh-foot"); foot.id="sheetFoot"; foot.innerHTML=\`<button class="btn btn-ghost btn-block" id="expClose">Done</button>\`;
  $("#sheet").appendChild(foot); $("#expClose").onclick=closeSheet;
  const stamp=isoLocal(new Date());
  $("#csvDl").onclick=()=>{ download(\`site-assets-\${stamp}.csv\`,csv,"text/csv")?toast("CSV downloaded"):toast("Use Copy instead"); };
  $("#jsonDl").onclick=()=>{ download(\`site-assets-\${stamp}.json\`,buildJSON(),"application/json")?toast("JSON downloaded"):toast("Use Copy instead"); };
  $("#csvCopy").onclick=async()=>{ (await copyText(csv))?toast("CSV copied"):selArea(); };
  $("#jsonCopy").onclick=async()=>{ const ar=$("#expArea"); ar.value=buildJSON(); (await copyText(ar.value))?toast("JSON copied"):selArea(); };
  showSheet();
};
function selArea(){ const a=$("#expArea"); a.focus(); a.select(); toast("Selected — copy manually"); }

/* ============================================================
   SAMPLE DATA  (new shape)
   ============================================================ */
async function loadSamples(){
  const t=today0(); const ago=d=>{ const x=new Date(t); x.setDate(x.getDate()-d); return isoLocal(x); };
  const now=Date.now(), DAY=86400000;
  const mk=(o)=>{ o.id=uid(); o.created=now; if(o.usable===undefined)o.usable=true; return o; };
  const samples=[
    mk({name:"110V site transformer 3.3kVA",category:"Power tools",tag:"TRF-0142",site:"Riverside Plot 4",delivered:ago(40),notes:"Yellow casing, twin outlet.",interval:3,
        patTests:[{id:uid(),date:ago(98),interval:3,result:"pass",tester:"Acme PAT Ltd",notes:""}],
        activity:[{id:uid(),ts:now-40*DAY,type:"create",to:"Riverside Plot 4",effDate:ago(40)}]}),
    mk({name:"Kango breaker K900",category:"Power tools",tag:"BRK-0098",site:"Riverside Plot 4",delivered:ago(22),notes:"In flight case with chisel set.",interval:3,
        patTests:[{id:uid(),date:ago(20),interval:3,result:"pass",tester:"J. Mara",notes:""}],
        activity:[{id:uid(),ts:now-20*DAY,type:"pat",result:"pass",expiry:ago(-70),effDate:ago(20)},{id:uid(),ts:now-22*DAY,type:"create",to:"Riverside Plot 4",effDate:ago(22)}]}),
    mk({name:"LED tower light",category:"Site lighting",tag:"LGT-0031",site:"Riverside Plot 4",delivered:ago(60),notes:"",interval:6,usable:false,
        patTests:[{id:uid(),date:ago(170),interval:6,result:"pass",tester:"Acme PAT Ltd",notes:""}],
        activity:[{id:uid(),ts:now-3*DAY,type:"condition",usable:false,text:"Mast won't extend — sent for repair",photo:null},{id:uid(),ts:now-60*DAY,type:"create",to:"Riverside Plot 4",effDate:ago(60)}]}),
    mk({name:"Belle cement mixer 150L",category:"Plant & machinery",tag:"MIX-0007",site:"Eastgate Phase 2",delivered:ago(12),notes:"",interval:6,
        patTests:[{id:uid(),date:ago(5),interval:6,result:"pass",tester:"",notes:""}],
        activity:[{id:uid(),ts:now-9*DAY,type:"move",from:"Riverside Plot 4",to:"Eastgate Phase 2",text:"Moved with the gang",effDate:ago(9)},{id:uid(),ts:now-12*DAY,type:"create",to:"Riverside Plot 4",effDate:ago(40)}]}),
    mk({name:"Extension lead 25m 110V",category:"Leads & cables",tag:"LD-0204",site:"Eastgate Phase 2",delivered:ago(12),notes:"Awaiting first PAT test.",interval:3,
        patTests:[],activity:[{id:uid(),ts:now-12*DAY,type:"create",to:"Eastgate Phase 2",effDate:ago(12)}]}),
    mk({name:"Podium step access platform",category:"Access equipment",tag:"ACC-0019",site:"Eastgate Phase 2",delivered:ago(30),notes:"",interval:6,
        patTests:[{id:uid(),date:ago(85),interval:6,result:"pass",tester:"",notes:""}],
        activity:[{id:uid(),ts:now-30*DAY,type:"create",to:"Eastgate Phase 2",effDate:ago(30)}]}),
  ];
  for(const s of samples){ s.photo=null; await saveAsset(s); }
  await loadAll(); render(); toast("Sample assets loaded");
}

/* ---------- boot ---------- */
(async function init(){ await loadAll(); render(); })();
</script>
</body>
</html>
`;
  return(
    <div style={{position:"fixed",top:0,left:200,right:0,bottom:0,background:"#f3f2ee",zIndex:5,display:"flex",flexDirection:"column"}}>
      <iframe
        srcDoc={htmlDoc}
        style={{flex:1,width:"100%",border:"none",display:"block"}}
        title="SiteKit Asset Register"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}

export { SiteManagerView, SiteDocGeneratorView, AssetRegisterView };
