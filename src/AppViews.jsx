// ─── AppViews.jsx — Dashboard views (Worker, Finance, Payments, Schedule) ───
// Import in App.jsx: import { ... } from './AppViews';

// ── Dashboard Worker Detail ───────────────────────────────────────────────────
function DWorkerDetail({workers,allSites,clients,activeDays,siteHours,workerId,timesheetRecords,payslipRecords,setTimesheetRecords,setPayslipRecords,setPage,setModal,weekLabel}){
  const w=workers.find(x=>x.id===workerId);
  if(!w)return <div style={DS.body}><div style={{color:"#374151",textAlign:"center",padding:40}}>Worker not found.</div></div>;

  const [tab,setTab]=useState("profile");

  // ── Derived data ────────────────────────────────────────────────────────────
  const {gross,net,stdH,otH}=calcPay(w,activeDays,siteHours);
  const heldCerts=CERTS.filter(c=>w.certs?.[c.key]?.held);
  const certAlerts=heldCerts.filter(c=>{const s=cSt(c,w);return s==="expired"||s==="expiring";});
  const CERT_STATUS_C={valid:"#34d399",expiring:"#fbbf24",expired:"#f87171",missing:"#374151"};

  // RTW
  const rtwExp=w.shareCodeExpiry?new Date(w.shareCodeExpiry):null;
  const rtwDays=rtwExp?(rtwExp-new Date())/86400000:null;
  const rtwStatus=!w.shareCode?"missing":!rtwExp?"valid":rtwDays<0?"expired":rtwDays<30?"expiring":"valid";
  const rtwColor={missing:"#f87171",valid:"#34d399",expiring:"#fbbf24",expired:"#f87171"}[rtwStatus];
  const rtwUploaded=!!(w.workerFiles||[]).length;

  // Pay rate history
  const payHistory=w.payRateHistory||[];

  // Timesheets & payslips for this worker
  const wTimesheets=(timesheetRecords||[]).filter(t=>t.workerId===w.id)
    .sort((a,b)=>new Date(b.weekLabel)-new Date(a.weekLabel));
  const wPayslips=(payslipRecords||[]).filter(p=>p.workerId===w.id)
    .sort((a,b)=>new Date(b.weekLabel)-new Date(a.weekLabel));

  // GPS confirmed work entries
  const wLogs=(w.attendanceLogs||[]).filter(l=>l.signIn&&l.signOut)
    .sort((a,b)=>new Date(b.signIn)-new Date(a.signIn));

  // This week's confirmed entries
  const thisWeekLogs=wLogs.filter(l=>l.weekLabel===weekLabel);
  const confirmedHrsThisWeek=thisWeekLogs.reduce((a,l)=>a+Math.round(((new Date(l.signOut)-new Date(l.signIn))/3600000)*100)/100,0);

  const initials=(w.name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const fmtD=d=>d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";
  const fmtT=iso=>iso?new Date(iso).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}):"—";

  // ── Action buttons ─────────────────────────────────────────────────────────
  const ActionButtons=()=><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:0}}>
    <button onClick={()=>setModal({type:"worker",worker:w})}
      style={{padding:"7px 13px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:12,fontWeight:700}}>
      ✏️ Edit
    </button>
    <button onClick={()=>setTab("payslips")}
      style={{padding:"7px 13px",background:tab==="payslips"?"#1a0d2e":"#0d1117",border:`1px solid ${tab==="payslips"?"#a78bfa":"#1e2535"}`,borderRadius:7,color:tab==="payslips"?"#a78bfa":"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:600}}>
      💷 Payslips{wPayslips.length>0?` (${wPayslips.length})`:""}
    </button>
    <button onClick={()=>exportWorkerProfile(w,allSites,weekLabel||formatWeekLabel(new Date()))}
      style={{padding:"7px 13px",background:"#0d1117",border:"1px solid #1e2535",borderRadius:7,color:"#64748b",cursor:"pointer",fontSize:12}}>
      📋 PDF
    </button>
  </div>;

  return <div>
    <DPageHdr
      title={<span style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,borderRadius:9,background:"#3b82f622",border:"1px solid #3b82f644",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#3b82f6"}}>{initials}</div>
        <div>
          <div>{w.name}</div>
          <div style={{fontSize:11,color:"#64748b",fontWeight:400,marginTop:1}}>{w.position} · {w.company}</div>
        </div>
      </span>}
      sub="" back="Workers" onBack={()=>setPage("workers")}
      actions={<ActionButtons/>}
    />

    <div style={DS.body}>
      {/* ── KPI STRIP — 4 tiles (no Certs Held) ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <DStat label="Hourly Rate" value={w.agreedRate?"£"+w.agreedRate+"/hr":"Not set"} color="#34d399"/>
        <DStat label="CIS Tax" value={Math.round((w.taxRate||0)*100)+"%"} color={w.taxRate===0.30?"#f87171":w.taxRate===0.20?"#fbbf24":"#34d399"}/>
        <DStat label="Wk Confirmed" value={confirmedHrsThisWeek>0?confirmedHrsThisWeek.toFixed(1)+"h":"—"} color="#60a5fa" sub="GPS sign-ins"/>
        <DStat label="Right to Work" value={rtwStatus.toUpperCase()} color={rtwColor} sub={rtwDays!==null&&rtwDays<30?rtwDays<0?"EXPIRED":Math.ceil(rtwDays)+"d left":""}/>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{display:"flex",gap:3,background:"#0d1117",borderRadius:8,padding:3,marginBottom:16,overflowX:"auto",flexWrap:"wrap"}}>
        {[
          ["profile","👤 Profile"],
          ["pay","💷 Pay Rate"],
          ["workentries","✅ Work Entries"],
          ["timesheets","⏱ Timesheets"+(wTimesheets.length?` (${wTimesheets.length})`:"")],
          ["payslips","💰 Payslips"+(wPayslips.length?` (${wPayslips.length})`:"")],
          ["certs","🏅 Certs"+(certAlerts.length?` ⚠${certAlerts.length}`:`(${heldCerts.length})`)],
          ["rtw","🛡 RTW"],
          ["schedule","📅 Schedule"],
          ["holidays","🏖 Holidays"],
        ].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{padding:"6px 11px",background:tab===v?"#1e3a5f":"transparent",
              border:tab===v?"1px solid #3b82f6":"1px solid transparent",
              borderRadius:6,color:tab===v?"#60a5fa":"#64748b",cursor:"pointer",
              fontSize:11,fontWeight:tab===v?700:400,whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      {/* ══ PROFILE TAB ══════════════════════════════════════════════════════ */}
      {tab==="profile"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Left — personal */}
        <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
          <div style={{fontSize:11,color:"#60a5fa",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Personal Details</div>
          {[["Full Name",w.name],["Position",w.position],["Company",w.company],["Nationality",w.nationality||"—"],["Date of Birth",w.dob?fmtD(w.dob):"—"],["Contact",w.contact||"—"],["Email",w.email||"—"],["Address",w.address||"—"],["Next of Kin",w.nextOfKin?(w.nextOfKin+(w.nextOfKinPhone?" · "+w.nextOfKinPhone:"")):"—"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid #1e2535"}}>
              <span style={{fontSize:10,color:"#64748b",fontWeight:700,minWidth:90,textTransform:"uppercase",flexShrink:0}}>{l}</span>
              <span style={{fontSize:12,color:"#e2e8f0",wordBreak:"break-word"}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Right — pay summary + certs widget */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Pay summary */}
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
            <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Pay Details</div>
            {[["Hourly Rate",w.agreedRate?"£"+w.agreedRate+"/hr":"Not set"],["CIS Tax",Math.round((w.taxRate||0)*100)+"%"],["OT Rate",w.customOTRate?"£"+w.customOTRate+"/hr":"×"+(w.overtimeMultiplier||1.5)+" standard"],["NINO",w.nino||"—"],["UTR",w.utr||"—"],["Bank",w.bankName?(w.bankName+" · "+(w.bankAccount||"")+" · "+(w.bankSort||"")):"—"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #1e2535"}}>
                <span style={{fontSize:10,color:"#64748b",fontWeight:700,minWidth:80,textTransform:"uppercase",flexShrink:0}}>{l}</span>
                <span style={{fontSize:12,color:"#e2e8f0"}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Certificates widget — held certs only */}
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,textTransform:"uppercase"}}>🏅 Certifications</div>
              <button onClick={()=>setTab("certs")} style={{fontSize:10,color:"#3b82f6",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>View all →</button>
            </div>
            {heldCerts.length===0
              ?<div style={{fontSize:12,color:"#374151",fontStyle:"italic"}}>No certifications recorded.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:4}}>
                {heldCerts.map(cert=>{
                  const s=cSt(cert,w);
                  const val=w.certs[cert.key];
                  return <div key={cert.key} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 7px",background:"#0f1421",borderRadius:6,border:`1px solid ${CERT_STATUS_C[s]}33`}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:CERT_STATUS_C[s],flexShrink:0}}/>
                    <span style={{fontSize:11,color:"#e2e8f0",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cert.label}</span>
                    {cert.hasExpiry&&val?.expiry&&<span style={{fontSize:10,color:CERT_STATUS_C[s],fontWeight:600,flexShrink:0}}>{fmtD(val.expiry)}</span>}
                    <span style={{fontSize:9,color:CERT_STATUS_C[s],fontWeight:700,textTransform:"uppercase",flexShrink:0}}>{s}</span>
                  </div>;
                })}
              </div>}
          </div>
        </div>
          {/* ── WEEK FORECAST WIDGET ── */}
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16,marginTop:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:11,color:"#3b82f6",fontWeight:700,textTransform:"uppercase"}}>📅 Week Forecast — WC {weekLabel||"—"}</div>
              <span style={{fontSize:10,color:"#374151",fontStyle:"italic"}}>Route only — confirmed by GPS sign-in</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>{
                const site=w.days?.[d];
                const off=!site||isOff(site);
                const confirmed=thisWeekLogs.some(l=>l.day===d);
                const activeNow=thisWeekLogs.some(l=>l.day===d&&l.signIn&&!l.signOut);
                const siteObj=allSites.find(s=>site&&(site.includes(s.name)||s.name.includes((site||"").split("-")[0]?.trim())));
                const col=siteObj?.color||"#3b82f6";
                const isToday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]===d;
                return <div key={d} style={{
                  textAlign:"center",
                  background:confirmed?"#0d2218":activeNow?"#0d1e2a":isToday?"#1a1f2e":"#0f1421",
                  borderRadius:9,
                  padding:"8px 4px",
                  border:`2px solid ${activeNow?"#fbbf24":confirmed?"#34d399":isToday?col+"88":"#1e2535"}`,
                  transition:"all 0.2s"
                }}>
                  <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",marginBottom:4,
                    color:activeNow?"#fbbf24":confirmed?"#34d399":isToday?col:"#64748b"}}>
                    {d}
                  </div>
                  {activeNow&&<div style={{fontSize:9,color:"#fbbf24",marginBottom:3}}>● Live</div>}
                  {!activeNow&&confirmed&&<div style={{fontSize:11,marginBottom:3}}>✅</div>}
                  {!off
                    ?<div style={{fontSize:9,color:off?"#374151":col,fontWeight:600,lineHeight:1.3,
                        overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                        wordBreak:"break-word",minHeight:28}}>
                        {site.trim()}
                      </div>
                    :<div style={{fontSize:9,color:"#374151",fontStyle:"italic"}}>Off</div>}
                </div>;
              })}
            </div>
            <div style={{display:"flex",gap:14,marginTop:8,fontSize:10,color:"#374151"}}>
              <span>✅ GPS confirmed</span>
              <span style={{color:"#fbbf24"}}>● On site now</span>
              <span>📋 Forecast only</span>
            </div>
          </div>
        </div>
      </div>}

      {/* ══ PAY RATE TAB ═════════════════════════════════════════════════════ */}
      {tab==="pay"&&<div>
        {/* Current rates */}
        <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16,marginBottom:14}}>
          <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Current Pay Rates</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            {[["Hourly Rate",w.agreedRate?"£"+w.agreedRate+"/hr":"Not set","#34d399"],["CIS Tax Rate",Math.round((w.taxRate||0)*100)+"%",w.taxRate===0.30?"#f87171":w.taxRate===0.20?"#fbbf24":"#34d399"],["OT Multiplier","×"+(w.overtimeMultiplier||1.5),"#fbbf24"],["Custom OT Rate",w.customOTRate?"£"+w.customOTRate+"/hr":"—","#f97316"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#0d1117",borderRadius:9,padding:"10px 13px",border:`1px solid ${c}22`}}>
                <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,padding:"8px 0",borderTop:"1px solid #1e2535",fontSize:11,color:"#64748b"}}>
            {w.payRateValidFrom&&<span>Valid from: <b style={{color:"#94a3b8"}}>{fmtD(w.payRateValidFrom)}</b></span>}
            {w.payRateValidTo&&<span>· Until: <b style={{color:"#94a3b8"}}>{fmtD(w.payRateValidTo)}</b></span>}
            <span style={{marginLeft:"auto",color:"#374151"}}>Edit rates via the ✏️ Edit button above</span>
          </div>
        </div>

        {/* Pay rate history */}
        <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>
            Pay Rate History — {payHistory.length} change{payHistory.length!==1?"s":""}
          </div>
          {payHistory.length===0
            ?<div style={{fontSize:12,color:"#374151",fontStyle:"italic"}}>No rate changes recorded yet. When you update pay rates, previous values are automatically saved here with a timestamp.</div>
            :<div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...payHistory].reverse().map((h,i)=>(
                <div key={i} style={{background:"#0f1421",borderRadius:8,padding:"10px 13px",border:"1px solid #1e2535"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>Changed on {fmtD(h.changedAt)}</div>
                    {h.changedBy&&<div style={{fontSize:10,color:"#64748b"}}>by {h.changedBy}</div>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {h.agreedRate!==undefined&&<div><span style={{fontSize:10,color:"#64748b"}}>Rate: </span><span style={{fontSize:12,fontWeight:700,color:"#94a3b8",textDecoration:"line-through"}}>£{h.agreedRate}/hr</span></div>}
                    {h.taxRate!==undefined&&<div><span style={{fontSize:10,color:"#64748b"}}>Tax: </span><span style={{fontSize:12,fontWeight:700,color:"#94a3b8",textDecoration:"line-through"}}>{Math.round(h.taxRate*100)}%</span></div>}
                    {h.overtimeMultiplier!==undefined&&<div><span style={{fontSize:10,color:"#64748b"}}>OT: </span><span style={{fontSize:12,fontWeight:700,color:"#94a3b8",textDecoration:"line-through"}}>×{h.overtimeMultiplier}</span></div>}
                  </div>
                  {h.note&&<div style={{fontSize:11,color:"#64748b",marginTop:5,fontStyle:"italic"}}>{h.note}</div>}
                </div>
              ))}
            </div>}
        </div>
      </div>}

      {/* ══ WORK ENTRIES TAB ════════════════════════════════════════════════ */}
      {tab==="workentries"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          <DStat label="Total Entries" value={wLogs.length} color="#60a5fa"/>
          <DStat label="This Week" value={thisWeekLogs.length} color="#34d399"/>
          <DStat label="Conf. Hours Wk" value={confirmedHrsThisWeek>0?confirmedHrsThisWeek.toFixed(1)+"h":"—"} color="#fbbf24"/>
          <DStat label="Sites Visited" value={[...new Set(wLogs.map(l=>l.siteName))].length} color="#a78bfa"/>
        </div>
        {wLogs.length===0
          ?<div style={{textAlign:"center",padding:40,color:"#374151",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:10}}>📍</div>
              No GPS work entries yet. Entries are created automatically when the worker signs in via the Worker Portal.
            </div>
          :<div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr>
                <th style={{...DS.th,textAlign:"left"}}>Date</th>
                <th style={{...DS.th,textAlign:"left"}}>Site</th>
                <th style={{...DS.th,textAlign:"center"}}>Sign In</th>
                <th style={{...DS.th,textAlign:"center"}}>Sign Out</th>
                <th style={{...DS.th,textAlign:"right"}}>Hours</th>
                <th style={{...DS.th,textAlign:"right"}}>OT</th>
                <th style={{...DS.th,textAlign:"left"}}>Week</th>
              </tr></thead>
              <tbody>
                {wLogs.map((l,i)=>{
                  const hrs=Math.round(((new Date(l.signOut)-new Date(l.signIn))/3600000)*100)/100;
                  const site=allSites.find(s=>s.id===l.siteId||s.name===l.siteName);
                  const otThreshold=site?.otThreshold||site?.stdHours||9;
                  const stdHrs=Math.min(hrs,otThreshold);
                  const otHrs=Math.max(0,Math.round((hrs-otThreshold)*100)/100);
                  const isThisWeek=l.weekLabel===weekLabel;
                  return <tr key={l.id} style={{background:isThisWeek?"#0d1e2a":i%2===0?"#111827":"#0f1421"}}>
                    <td style={{...DS.td,color:"#94a3b8",fontSize:11}}>{fmtD(l.signIn?.split("T")[0])}</td>
                    <td style={{...DS.td,fontWeight:600,color:"#f1f5f9"}}>{l.siteName||"—"}</td>
                    <td style={{...DS.td,textAlign:"center",color:"#34d399",fontWeight:600}}>{fmtT(l.signIn)}</td>
                    <td style={{...DS.td,textAlign:"center",color:"#f87171",fontWeight:600}}>{l.signOut?fmtT(l.signOut):<span style={{color:"#fbbf24"}}>On site</span>}</td>
                    <td style={{...DS.td,textAlign:"right",color:"#60a5fa",fontWeight:700}}>{hrs.toFixed(2)}h</td>
                    <td style={{...DS.td,textAlign:"right",color:otHrs>0?"#fbbf24":"#374151",fontWeight:otHrs>0?700:400}}>{otHrs>0?"+"+otHrs.toFixed(1)+"h":"—"}</td>
                    <td style={{...DS.td,fontSize:10,color:isThisWeek?"#3b82f6":"#64748b"}}>{l.weekLabel||"—"}{isThisWeek&&" ✓"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>}
      </div>}

      {/* ══ TIMESHEETS TAB ════════════════════════════════════════════════════ */}
      {tab==="timesheets"&&<div>
        <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>
          Timesheets are created automatically on first GPS sign-in of the week and close at week end ready for admin review.
        </div>
        {wTimesheets.length===0
          ?<div style={{textAlign:"center",padding:40,color:"#374151",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:10}}>⏱</div>No timesheets yet. Auto-created on first sign-in of each week.
            </div>
          :wTimesheets.map(ts=>{
            const tsLogs=wLogs.filter(l=>l.weekLabel===ts.weekLabel);
            const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
            const dayTotals={};
            tsLogs.forEach(l=>{
              const hrs=Math.round(((new Date(l.signOut)-new Date(l.signIn))/3600000)*100)/100;
              dayTotals[l.day]=(dayTotals[l.day]||0)+hrs;
            });
            const totalHrs=Object.values(dayTotals).reduce((a,v)=>a+v,0);
            const site0=allSites.find(s=>tsLogs[0]&&(s.id===tsLogs[0].siteId||s.name===tsLogs[0].siteName));
            const otThreshold=site0?.otThreshold||9;
            const otHrs=Math.max(0,totalHrs-otThreshold*Object.keys(dayTotals).length);
            const stdHrs=totalHrs-otHrs;
            const isOpen=ts.status==="open";
            return <div key={ts.id} style={{background:"#111827",border:`1px solid ${isOpen?"#3b82f644":"#34d39944"}`,borderRadius:11,padding:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#f1f5f9"}}>WC {ts.weekLabel}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{w.name} · {tsLogs.length} entries</div>
                </div>
                <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                  background:ts.status==="approved"?"#34d39922":ts.status==="open"?"#3b82f622":"#fbbf2422",
                  color:ts.status==="approved"?"#34d399":ts.status==="open"?"#60a5fa":"#fbbf24",
                  border:`1px solid ${ts.status==="approved"?"#34d39944":ts.status==="open"?"#3b82f644":"#fbbf2444"}`}}>
                  {ts.status==="approved"?"✓ Approved":ts.status==="open"?"● Open":"⏳ Pending Review"}
                </span>
              </div>
              {/* Day grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5,marginBottom:10}}>
                {days.map(d=>{
                  const hrs=dayTotals[d]||0;
                  return <div key={d} style={{textAlign:"center",background:"#0f1421",borderRadius:6,padding:"6px 4px",border:`1px solid ${hrs>0?"#3b82f633":"#1e2535"}`}}>
                    <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{d}</div>
                    <div style={{fontSize:12,fontWeight:700,color:hrs>0?"#60a5fa":"#374151",marginTop:2}}>{hrs>0?hrs.toFixed(1)+"h":"—"}</div>
                  </div>;
                })}
              </div>
              {/* Totals */}
              <div style={{display:"flex",gap:12,padding:"8px 10px",background:"#0d1117",borderRadius:7}}>
                <div><span style={{fontSize:10,color:"#64748b"}}>Std Hours: </span><span style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{stdHrs.toFixed(1)}h</span></div>
                <div><span style={{fontSize:10,color:"#64748b"}}>OT Hours: </span><span style={{fontSize:12,fontWeight:700,color:"#fbbf24"}}>{otHrs.toFixed(1)}h</span></div>
                <div><span style={{fontSize:10,color:"#64748b"}}>Total: </span><span style={{fontSize:14,fontWeight:900,color:"#34d399"}}>{totalHrs.toFixed(1)}h</span></div>
                <div style={{marginLeft:"auto",fontSize:10,color:"#374151",fontStyle:"italic"}}>Pay calculated in payslip — not here</div>
              </div>
              {ts.status!=="approved"&&<button
                onClick={()=>{
                  const updated=timesheetRecords.map(t=>t.id===ts.id?{...t,status:"approved",approvedAt:new Date().toISOString()}:t);
                  setTimesheetRecords(updated);
                }}
                style={{marginTop:10,width:"100%",padding:"8px",background:"linear-gradient(135deg,#14532d,#16a34a)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
                ✓ Approve Timesheet
              </button>}
            </div>;
          })}
      </div>}

      {/* ══ PAYSLIPS TAB ══════════════════════════════════════════════════════ */}
      {tab==="payslips"&&<div>
        {wPayslips.length===0
          ?<div style={{textAlign:"center",padding:40,color:"#374151",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:10}}>💰</div>No payslips yet.
            </div>
          :wPayslips.map(ps=>(
            <div key={ps.id} style={{background:"#111827",border:`1px solid ${ps.status==="paid"?"#34d39944":"#1e2535"}`,borderRadius:11,padding:16,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:"#f1f5f9"}}>WC {ps.weekLabel}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{w.name} · {w.address||"—"}</div>
                </div>
                <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:ps.status==="paid"?"#34d39922":"#fbbf2422",color:ps.status==="paid"?"#34d399":"#fbbf24",border:`1px solid ${ps.status==="paid"?"#34d39944":"#fbbf2444"}`}}>
                  {ps.status==="paid"?"✓ Paid":"⏳ Pending"}
                </span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                {[["Std Hours",(ps.stdH||0).toFixed(1)+"h @ £"+(w.agreedRate||0)+"/hr","#60a5fa"],["OT Hours",(ps.otH||0).toFixed(1)+"h @ ×"+(w.overtimeMultiplier||1.5),"#fbbf24"],["Gross","£"+(ps.gross||0).toFixed(2),"#34d399"],["CIS Tax "+Math.round((w.taxRate||0)*100)+"%","-£"+(ps.taxAmt||0).toFixed(2),"#f87171"],["Net Pay","£"+(ps.net||0).toFixed(2),"#a78bfa"],["Payment","£"+(ps.net||0).toFixed(2)+" → "+( w.bankAccount||"—"),"#34d399"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"#0d1117",borderRadius:7,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:c,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              {ps.status!=="paid"&&<button
                onClick={()=>{
                  const updated=payslipRecords.map(p=>p.id===ps.id?{...p,status:"paid",paidAt:new Date().toISOString()}:p);
                  setPayslipRecords(updated);
                }}
                style={{width:"100%",padding:"8px",background:"linear-gradient(135deg,#14532d,#16a34a)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
                💷 Mark as Paid
              </button>}
            </div>
          ))}
      </div>}

      {/* ══ CERTS TAB ════════════════════════════════════════════════════════ */}
      {tab==="certs"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {[["Held",heldCerts.length,"#60a5fa"],["Valid",heldCerts.filter(c=>cSt(c,w)==="valid").length,"#34d399"],["Expiring Soon",heldCerts.filter(c=>cSt(c,w)==="expiring").length,"#fbbf24"],["Expired",heldCerts.filter(c=>cSt(c,w)==="expired").length,"#f87171"]].map(([l,v,c])=>(
            <DStat key={l} label={l} value={v} color={c}/>
          ))}
        </div>
        {/* Full cert list — ALL certs, held ones highlighted */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {CERTS.map(cert=>{
            const val=w.certs?.[cert.key];
            const held=val?.held;
            const s=cSt(cert,w);
            if(!held)return null;
            return <div key={cert.key} style={{background:"#0f1421",borderRadius:9,padding:"10px 12px",border:`1px solid ${CERT_STATUS_C[s]}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{cert.label}</span>
                <span style={{fontSize:10,fontWeight:700,color:CERT_STATUS_C[s],textTransform:"uppercase"}}>{s}</span>
              </div>
              {cert.hasExpiry&&<div style={{fontSize:10,color:"#64748b"}}>Expires: <span style={{color:CERT_STATUS_C[s],fontWeight:600}}>{val?.expiry?fmtD(val.expiry):"—"}</span></div>}
              {val?.photoUrl&&<img src={val.photoUrl} alt={cert.label} style={{marginTop:7,width:"100%",maxHeight:80,objectFit:"cover",borderRadius:5,border:"1px solid #1e2535",cursor:"pointer"}} onClick={()=>window.open(val.photoUrl,"_blank")}/>}
            </div>;
          }).filter(Boolean)}
        </div>
        {heldCerts.length===0&&<div style={{textAlign:"center",padding:32,color:"#374151"}}>No certifications recorded. Edit the worker to add certificates.</div>}
      </div>}

      {/* ══ RTW TAB ══════════════════════════════════════════════════════════ */}
      {tab==="rtw"&&<div>
        <div style={{background:"#111827",border:`1px solid ${rtwColor}44`,borderRadius:11,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800,color:"#f1f5f9"}}>Right to Work Status</div>
            <span style={{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:rtwColor+"22",color:rtwColor,border:`1px solid ${rtwColor}44`}}>{rtwStatus.toUpperCase()}</span>
          </div>
          {[["Share Code",w.shareCode||"Not provided"],["Date Checked",w.shareCodeDate?fmtD(w.shareCodeDate):"—"],["Expiry",w.shareCodeExpiry?fmtD(w.shareCodeExpiry):"—"],["Documents",(w.workerFiles||[]).length+" file(s) attached"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid #1e2535"}}>
              <span style={{fontSize:10,color:"#64748b",fontWeight:700,minWidth:100,textTransform:"uppercase",flexShrink:0}}>{l}</span>
              <span style={{fontSize:12,color:"#e2e8f0"}}>{v}</span>
            </div>
          ))}
          {(w.workerFiles||[]).length>0&&<div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
            {(w.workerFiles||[]).map((wf,i)=>(
              <a key={i} href={wf.url} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#1a2035",borderRadius:6,border:"1px solid #2d3555",color:"#60a5fa",fontSize:11,textDecoration:"none"}}>
                {wf.type?.startsWith("image/")?"🖼":wf.type==="application/pdf"?"📄":"📎"} {wf.name}
              </a>
            ))}
          </div>}
        </div>
        {!rtwUploaded&&<div style={{background:"#2d1515",border:"1px solid #ef444444",borderRadius:9,padding:12,fontSize:12,color:"#f87171"}}>
          ⚠ No RTW documents uploaded. Please attach ID / share code proof via the Edit button.
        </div>}
      </div>}

      {/* ══ SCHEDULE TAB ══════════════════════════════════════════════════════ */}
      {tab==="schedule"&&<div>
        <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>Current week forecast allocation. ✅ = GPS confirmed on site.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>{
            const site=w.days?.[d];
            const off=!site||isOff(site);
            const confirmed=wLogs.some(l=>l.day===d&&l.weekLabel===weekLabel);
            const s=allSites.find(x=>site&&(site.includes(x.name)||x.name.includes(site)));
            const c=s?.color||"#374151";
            return <div key={d} style={{textAlign:"center",background:"#0f1421",borderRadius:8,padding:"10px 6px",border:`1px solid ${confirmed?"#34d39944":off?"#1e2535":c+"44"}`}}>
              <div style={{fontSize:10,color:confirmed?"#34d399":off?"#374151":c,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>{d}</div>
              {confirmed&&<div style={{fontSize:10,color:"#34d399",marginBottom:3}}>✅</div>}
              <div style={{fontSize:10,color:off?"#374151":c,fontWeight:off?400:600,wordBreak:"break-word",lineHeight:1.3}}>{site||"—"}</div>
            </div>;
          })}
        </div>
      </div>}

      {/* ══ HOLIDAYS TAB ══════════════════════════════════════════════════════ */}
      {tab==="holidays"&&(()=>{
        const [holidays,setHolidays]=useState(w.holidayRequests||[]);
        const [from,setFrom]=useState("");const [to,setTo]=useState("");const [note,setNote]=useState("");
        return <div>
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Request Holiday</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:8,marginBottom:10}}>
              <div><div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>From</div><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{...INP}}/></div>
              <div><div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>To</div><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{...INP}}/></div>
              <div><div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Note</div><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reason…" style={{...INP}}/></div>
            </div>
            <button onClick={()=>{if(!from)return;setHolidays(h=>[...h,{id:"hol_"+Date.now(),from,to:to||from,note,status:"pending",requestedAt:new Date().toISOString()}]);setFrom("");setTo("");setNote("");}}
              style={{...BP,padding:"7px 16px",fontSize:12}}>+ Add Holiday</button>
          </div>
          {holidays.map(h=>(
            <div key={h.id} style={{background:"#111827",border:`1px solid ${h.status==="approved"?"#34d39944":h.status==="declined"?"#ef444444":"#fbbf2444"}`,borderRadius:9,padding:"11px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{fmtD(h.from)}{h.to&&h.to!==h.from?" — "+fmtD(h.to):""}</div>
                {h.note&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{h.note}</div>}
              </div>
              <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:h.status==="approved"?"#34d39922":h.status==="declined"?"#ef444422":"#fbbf2422",color:h.status==="approved"?"#34d399":h.status==="declined"?"#f87171":"#fbbf24"}}>{h.status}</span>
              {h.status==="pending"&&<div style={{display:"flex",gap:5}}>
                <button onClick={()=>setHolidays(hs=>hs.map(x=>x.id===h.id?{...x,status:"approved"}:x))} style={{padding:"4px 9px",background:"#0d2218",border:"1px solid #34d399",borderRadius:5,color:"#34d399",cursor:"pointer",fontSize:11}}>✓</button>
                <button onClick={()=>setHolidays(hs=>hs.map(x=>x.id===h.id?{...x,status:"declined"}:x))} style={{padding:"4px 9px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:5,color:"#f87171",cursor:"pointer",fontSize:11}}>✕</button>
              </div>}
            </div>
          ))}
        </div>;
      })()}
    </div>
  </div>;
}

// ── Dashboard Sites Page ──────────────────────────────────────────────────────
function DSites({allSites,clients,workers,activeDays,siteHours,setPage,setDetailId,setModal}){
  const activeSites=allSites.filter(s=>!isOff(s.name));
  return <div>
    <DPageHdr title="🏗 Sites" sub={`${activeSites.length} sites`}
      actions={<button onClick={()=>setModal({type:"sites"})} style={{padding:"7px 14px",background:"#1e2535",border:"1px solid #f59e0b",borderRadius:7,color:"#fbbf24",cursor:"pointer",fontSize:12,fontWeight:700}}>🏗 Manage Sites</button>}/>
    <div style={DS.body}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {activeSites.map(site=>{
          const wk=workers.filter(w=>BASE_DAYS.some(d=>(w.days[d]||"").includes(site.name)));
          const client=clients.find(c=>c.id===site.clientId);
          const sc=site.scopes||[],vr=site.variations||[];
          const scopeT=sc.reduce((a,s)=>a+(s.qty*s.rate),0);
          const varT=vr.reduce((a,v)=>a+(v.type==="addition"?v.value:-v.value),0);
          return <div key={site.id} onClick={()=>{setDetailId(site.id);setPage("site_detail");}}
            style={{...DS.card(site.color),borderColor:`${site.color}33`}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=site.color;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${site.color}33`;e.currentTarget.style.transform="";}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:site.color}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{width:11,height:11,borderRadius:"50%",background:site.color,flexShrink:0}}/>
              <span style={{fontSize:15,fontWeight:800,color:"#f1f5f9",flex:1}}>{site.name}</span>
              {client&&<span style={DS.pill(client.color)}>{client.name}</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {[["Contract","£"+(scopeT+varT).toLocaleString(),"#60a5fa"],["Scope","£"+scopeT.toLocaleString(),"#34d399"],["Workers",wk.length,"#a78bfa"],["Variations",vr.length,"#fbbf24"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#0a0e17",borderRadius:6,padding:"6px 8px"}}>
                  <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:800,color:c,marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ── Dashboard Site Detail ─────────────────────────────────────────────────────

// ─── SiteWorkersPanel — GPS-confirmed workers with scope allocation ────────────

// ─── Pending Registrations View ───────────────────────────────────────────────
function PendingWorkersView({workers,onApprove}){
  const [pending,setPending]=useState([]);
  const [loading,setLoading]=useState(true);
  const [actioning,setActioning]=useState({});
  const [expanded,setExpanded]=useState(null);
  const [rejectNote,setRejectNote]=useState({});
  const CERT_LABELS=Object.fromEntries(CERTS.map(c=>[c.key,c.label]));
  const load=async()=>{setLoading(true);try{const rows=await sbGet("pending_workers","select=id,created_at,status,data&order=created_at.desc");setPending(rows);}catch(e){console.error(e);}setLoading(false);};
  useEffect(()=>{load();},[]);
  const approve=async(row)=>{
    if(!window.confirm(`Approve ${row.data.name} and add them as an active worker?`))return;
    setActioning(a=>({...a,[row.id]:"approving"}));
    try{
      await sbUpsert("workers",[{id:row.data.id,data:{...row.data,approvedAt:new Date().toISOString()}}]);
      await fetch(`${SB_URL}/rest/v1/pending_workers?id=eq.${row.id}`,{method:"PATCH",headers:{...SB_H,"Prefer":"return=minimal"},body:JSON.stringify({status:"approved"})});
      setPending(p=>p.map(x=>x.id===row.id?{...x,status:"approved"}:x));
      if(onApprove)onApprove();
    }catch(e){alert("Approval failed: "+e.message);}
    setActioning(a=>({...a,[row.id]:null}));
  };
  const reject=async(row)=>{
    if(!window.confirm(`Reject ${row.data.name}?`))return;
    setActioning(a=>({...a,[row.id]:"rejecting"}));
    try{
      await fetch(`${SB_URL}/rest/v1/pending_workers?id=eq.${row.id}`,{method:"PATCH",headers:{...SB_H,"Prefer":"return=minimal"},body:JSON.stringify({status:"rejected",data:{...row.data,rejectedAt:new Date().toISOString(),rejectionNote:rejectNote[row.id]||""}})});
      setPending(p=>p.map(x=>x.id===row.id?{...x,status:"rejected"}:x));
    }catch(e){alert("Rejection failed: "+e.message);}
    setActioning(a=>({...a,[row.id]:null}));
  };
  const pendingRows=pending.filter(r=>r.status==="pending");
  const doneRows=pending.filter(r=>r.status!=="pending");
  const WorkerCard=({row})=>{
    const d=row.data||{};const isOpen=expanded===row.id;const act=actioning[row.id];const isPend=row.status==="pending";const isApp=row.status==="approved";
    const heldCerts=Object.entries(d.certs||{}).filter(([,v])=>v?.held);
    return <div style={{background:"#111827",border:`1px solid ${isPend?"#f59e0b44":isApp?"#34d39944":"#ef444444"}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 15px",cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:row.id)}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#1e3a5f,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff",flexShrink:0}}>{d.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"?"}</div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:"#f1f5f9"}}>{d.name||"Unknown"}</div><div style={{fontSize:11,color:"#64748b",marginTop:1}}>{d.position||"—"} · {d.company||"—"} · {d.email||"—"}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"#64748b"}}>{new Date(row.created_at).toLocaleDateString("en-GB")}</span>
          <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:isPend?"#f59e0b22":isApp?"#34d39922":"#ef444422",color:isPend?"#fbbf24":isApp?"#34d399":"#f87171",border:`1px solid ${isPend?"#f59e0b44":isApp?"#34d39944":"#ef444444"}`}}>{isPend?"⏳ Pending":isApp?"✓ Approved":"✕ Rejected"}</span>
          <span style={{color:"#64748b",fontSize:13}}>{isOpen?"▲":"▼"}</span>
        </div>
      </div>
      {isOpen&&<div style={{borderTop:"1px solid #1e2535",padding:"14px 15px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px",marginBottom:14}}>
          {[["Full Name",d.name],["Position",d.position],["Company",d.company],["Date of Birth",d.dob?new Date(d.dob).toLocaleDateString("en-GB"):"—"],["Phone",d.phone],["NI Number",d.niNumber],["Email",d.email],["Address",d.address],["Emergency Contact",d.emergencyName],["Emergency Phone",d.emergencyPhone],["Bank Name",d.bankName],["Sort Code",d.sortCode],["Account No",d.accountNo?"••••"+d.accountNo.slice(-4):"—"],["T&Cs Signed",d.termsSignedAt?new Date(d.termsSignedAt).toLocaleString("en-GB"):"—"]].map(([l,v])=>
            <div key={l} style={{padding:"4px 0",borderBottom:"1px solid #1e2535"}}><div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:12,color:v?"#f1f5f9":"#374151",marginTop:1}}>{v||"—"}</div></div>
          )}
        </div>
        {d.termsAccepted&&<div style={{background:"#0d2218",border:"1px solid #34d39944",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#34d399"}}>✅ T&Cs signed {d.termsSignedAt?new Date(d.termsSignedAt).toLocaleString("en-GB"):""}</div>}
        {heldCerts.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:7}}>Certifications ({heldCerts.length})</div>
          {heldCerts.map(([key,val])=><div key={key} style={{background:"#0f1421",borderRadius:7,padding:"8px 12px",marginBottom:6,border:"1px solid #1e2535"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:val.photoUrl?6:0}}>
              <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{CERT_LABELS[key]||key}</span>
              <div style={{display:"flex",gap:8}}>{val.expiry&&<span style={{fontSize:11,color:"#64748b"}}>Exp: {new Date(val.expiry).toLocaleDateString("en-GB")}</span>}<span style={{fontSize:11,fontWeight:700,color:"#34d399"}}>✓</span></div>
            </div>
            {val.photoUrl&&<img src={val.photoUrl} alt={key} style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:6,border:"1px solid #2d3555",cursor:"pointer"}} onClick={()=>window.open(val.photoUrl,"_blank")}/>}
          </div>)}
        </div>}
        {isPend&&<div style={{borderTop:"1px solid #1e2535",paddingTop:12,marginTop:4}}>
          <div style={{marginBottom:9}}><div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Rejection Note (optional)</div>
            <input value={rejectNote[row.id]||""} onChange={e=>setRejectNote(n=>({...n,[row.id]:e.target.value}))} placeholder="Reason for rejection…" style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:7,padding:"8px 11px",color:"#e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>reject(row)} disabled={!!act} style={{flex:1,padding:"9px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:8,color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700,opacity:act?0.6:1}}>{act==="rejecting"?"Rejecting…":"✕ Reject"}</button>
            <button onClick={()=>approve(row)} disabled={!!act} style={{flex:2,padding:"9px",background:"linear-gradient(135deg,#14532d,#16a34a)",border:"1px solid #34d399",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:800,opacity:act?0.6:1}}>{act==="approving"?"Approving…":"✓ Approve & Add to Workers"}</button>
          </div>
        </div>}
      </div>}
    </div>;
  };
  return <div style={{padding:"16px 20px"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
      {[["Pending",pendingRows.length,"#f59e0b"],["Approved",pending.filter(r=>r.status==="approved").length,"#34d399"],["Rejected",pending.filter(r=>r.status==="rejected").length,"#f87171"]].map(([l,v,c])=>
        <div key={l} style={{background:"#1a1f2e",border:`1px solid ${c}44`,borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div></div>
      )}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button onClick={load} style={{padding:"5px 13px",background:"#1e2535",border:"1px solid #2d3555",borderRadius:7,color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>↻ Refresh</button></div>
    {loading&&<div style={{textAlign:"center",padding:40,color:"#64748b"}}>Loading registrations…</div>}
    {!loading&&pendingRows.length===0&&<div style={{textAlign:"center",padding:40,color:"#374151",fontSize:13}}><div style={{fontSize:32,marginBottom:10}}>✅</div>No pending registrations.</div>}
    {pendingRows.map(row=><WorkerCard key={row.id} row={row}/>)}
    {doneRows.length>0&&<div style={{marginTop:20}}><div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Previously Processed ({doneRows.length})</div>{doneRows.map(row=><WorkerCard key={row.id} row={row}/>)}</div>}
  </div>;
}

function SiteWorkersPanel({site,allWorkers,weekLabel,scopes,setDetailId,setPage}){
  const [scopeAlloc,setScopeAlloc]=useState({});
  // ── Fresh worker data fetched from Supabase on every render of this tab ──────
  // allWorkers is cached at startup; attendanceLogs are written by the Worker Portal
  // so we need a live fetch to see sign-ins that happened after the admin app loaded
  const [liveWorkers,setLiveWorkers]=useState(allWorkers);
  const [fetching,setFetching]=useState(false);
  const [lastFetch,setLastFetch]=useState(null);

  const refreshFromDB=async()=>{
    setFetching(true);
    try{
      const rows=await sbGet("workers","select=id,data&order=data->name");
      if(rows.length>0) setLiveWorkers(rows.map(r=>({...r.data,id:r.id})));
    }catch(e){console.warn("Workers refresh failed:",e.message);}
    setFetching(false);
    setLastFetch(new Date());
  };

  // Auto-refresh when panel first mounts and every 30 seconds while open
  useEffect(()=>{
    refreshFromDB();
    const t=setInterval(refreshFromDB,30000);
    return()=>clearInterval(t);
  },[site.id]);

  // ── FIX: include workers currently ON SITE (signIn exists, signOut may not yet) ──
  const confirmedWorkers=useMemo(()=>{
    return liveWorkers
      .map(w=>{
        // Include logs that have signIn — regardless of whether signOut exists yet
        const logs=(w.attendanceLogs||[]).filter(l=>
          (l.siteId===site.id||l.siteName===site.name)&&l.signIn
        );
        if(logs.length===0)return null;
        // Hours: for active sessions (no signOut), calculate up to now
        const totalHrs=logs.reduce((a,l)=>{
          const end=l.signOut?new Date(l.signOut):new Date();
          return a+Math.max(0,Math.round(((end-new Date(l.signIn))/3600000)*100)/100);
        },0);
        const activeLog=logs.find(l=>l.signIn&&!l.signOut); // currently on site
        return{...w,confirmedLogs:logs,confirmedHours:totalHrs,
               labourCost:totalHrs*(w.agreedRate||0),activeLog};
      })
      .filter(Boolean);
  },[liveWorkers,site.id,site.name]);

  // Forecast workers (in schedule but not yet signed in to this site)
  const forecastWorkers=useMemo(()=>{
    const confirmedIds=new Set(confirmedWorkers.map(w=>w.id));
    return liveWorkers.filter(w=>
      !confirmedIds.has(w.id)&&
      Object.values(w.days||{}).some(d=>(d||"").includes(site.name))
    );
  },[liveWorkers,confirmedWorkers,site.name]);

  // Cost per scope (from confirmed hours)
  const costPerScope=useMemo(()=>{
    const m={};
    confirmedWorkers.forEach(w=>{
      const sid=scopeAlloc[w.id]||"unassigned";
      m[sid]=(m[sid]||0)+w.labourCost;
    });
    return m;
  },[confirmedWorkers,scopeAlloc]);

  const totalLabour=confirmedWorkers.reduce((a,w)=>a+w.labourCost,0);
  const currentlyOnSite=confirmedWorkers.filter(w=>w.activeLog).length;
  const fmtH=h=>h>0?h.toFixed(1)+"h":"—";
  const fmtM=v=>"£"+v.toFixed(2);

  return <div>
    {/* Header with refresh button */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{fontSize:11,color:"#64748b"}}>
        {fetching?"⟳ Refreshing…":lastFetch?`Last updated: ${lastFetch.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}`:""}
      </div>
      <button onClick={refreshFromDB} disabled={fetching}
        style={{padding:"5px 13px",background:"#1e2535",border:"1px solid #3b82f6",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,opacity:fetching?0.6:1}}>
        <span style={{fontSize:13,display:"inline-block",animation:fetching?"spin 1s linear infinite":""}}>{fetching?"⟳":"↻"}</span>
        Refresh Sign-ins
      </button>
    </div>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

    {/* Summary bar */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
      {[
        ["Currently On Site",currentlyOnSite+" workers","#34d399"],
        ["Forecast Only",forecastWorkers.length+" workers","#fbbf24"],
        ["Total Confirmed Hrs",confirmedWorkers.reduce((a,w)=>a+w.confirmedHours,0).toFixed(1)+"h","#60a5fa"],
        ["Total Labour Cost","£"+totalLabour.toFixed(2),"#f87171"],
      ].map(([l,v,c])=><div key={l} style={{background:"#0f1421",border:`1px solid ${c}33`,borderRadius:9,padding:"10px 13px"}}>
        <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
        <div style={{fontSize:16,fontWeight:800,color:c,marginTop:3}}>{v}</div>
      </div>)}
    </div>

    {/* Cost per scope */}
    {scopes.length>0&&<div style={{marginBottom:16,background:"#0f1421",borderRadius:10,padding:"12px 14px",border:"1px solid #1e2535"}}>
      <div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:9}}>Labour Cost per Scope</div>
      {scopes.map(sc=>{
        const cost=costPerScope[sc.id]||0;
        const agreed=(Number(sc.qty)||0)*(Number(sc.rate)||0);
        const pct=agreed>0?Math.min(100,(cost/agreed*100)):0;
        return <div key={sc.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
          <div style={{fontSize:11,color:"#94a3b8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={sc.description}>{sc.description||"—"}</div>
          <div style={{flex:1,height:5,background:"#1e2535",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",background:pct>80?"#f87171":pct>50?"#fbbf24":"#34d399",width:pct+"%",borderRadius:3}}/>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:"#f87171",minWidth:65,textAlign:"right"}}>£{cost.toFixed(2)}</div>
          <div style={{fontSize:10,color:"#64748b",minWidth:38,textAlign:"right"}}>{pct.toFixed(0)}%</div>
        </div>;
      })}
      {(costPerScope["unassigned"]||0)>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:"1px solid #1e2535",fontSize:11,color:"#64748b"}}>
        <span>Unassigned labour</span><span style={{color:"#64748b",fontWeight:700}}>£{(costPerScope["unassigned"]||0).toFixed(2)}</span>
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",paddingTop:7,borderTop:"1px solid #1e2535",marginTop:4}}>
        <span style={{fontSize:11,color:"#94a3b8",fontWeight:700}}>Total</span>
        <span style={{fontSize:14,fontWeight:900,color:"#f87171"}}>£{totalLabour.toFixed(2)}</span>
      </div>
    </div>}


    {/* GPS-confirmed workers */}
    {confirmedWorkers.length>0&&<div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:"#34d399",fontWeight:700,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#34d399",display:"inline-block"}}/>
          On Site / GPS Confirmed ({confirmedWorkers.length})
        </div>
        {confirmedWorkers.filter(w=>w.activeLog).length>0&&
          <span style={{fontSize:10,color:"#34d399",background:"#0d221844",padding:"2px 9px",borderRadius:20,border:"1px solid #34d39944"}}>
            🟢 {confirmedWorkers.filter(w=>w.activeLog).length} currently on site
          </span>}
      </div>
      <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden",overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:640}}>
          <thead><tr>
            <th style={{...DS.th,textAlign:"left"}}>Worker</th>
            <th style={{...DS.th,textAlign:"center"}}>Status</th>
            <th style={{...DS.th,textAlign:"center"}}>Sessions</th>
            <th style={{...DS.th,textAlign:"right"}}>Hours</th>
            <th style={{...DS.th,textAlign:"right"}}>Cost</th>
            <th style={{...DS.th,textAlign:"left",minWidth:190}}>Scope Allocation</th>
          </tr></thead>
          <tbody>
            {confirmedWorkers.map((w,i)=>(
              <tr key={w.id} style={{background:i%2===0?"#111827":"#0f1421",cursor:"pointer",
                borderLeft:w.activeLog?"3px solid #34d399":"3px solid transparent"}}
                onClick={e=>{if(e.target.tagName==="SELECT")return;setDetailId(w.id);setPage("worker_detail");}}>
                <td style={DS.td}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:30,height:30,borderRadius:7,
                      background:w.activeLog?"#34d39922":"#3b82f622",
                      border:`2px solid ${w.activeLog?"#34d399":"#3b82f644"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:12,fontWeight:700,color:w.activeLog?"#34d399":"#60a5fa",
                      position:"relative"}}>
                      {(w.name||"?")[0]}
                      {w.activeLog&&<span style={{position:"absolute",top:-3,right:-3,width:8,height:8,
                        borderRadius:"50%",background:"#34d399",
                        boxShadow:"0 0 5px #34d399"}}/>}
                    </div>
                    <div>
                      <div style={{fontWeight:600,color:"#f1f5f9",fontSize:12}}>{w.name}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{w.position}</div>
                    </div>
                  </div>
                </td>
                <td style={{...DS.td,textAlign:"center"}}>
                  {w.activeLog
                    ?<span style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,
                        background:"#0d221844",color:"#34d399",border:"1px solid #34d39944",
                        display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                        <span style={{width:5,height:5,borderRadius:"50%",background:"#34d399",display:"inline-block"}}/>
                        On Site Now
                      </span>
                    :<span style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:600,
                        background:"#1e253544",color:"#64748b",border:"1px solid #2d355544",whiteSpace:"nowrap"}}>
                        Signed Out
                      </span>}
                </td>
                <td style={{...DS.td,textAlign:"center",color:"#60a5fa",fontWeight:600}}>{w.confirmedLogs.length}</td>
                <td style={{...DS.td,textAlign:"right",fontWeight:700,
                  color:w.activeLog?"#fbbf24":"#60a5fa"}}>
                  {fmtH(w.confirmedHours)}
                  {w.activeLog&&<div style={{fontSize:9,color:"#fbbf24"}}>in progress</div>}
                </td>
                <td style={{...DS.td,textAlign:"right",color:"#f87171",fontWeight:700}}>
                  {w.labourCost>0?fmtM(w.labourCost):"—"}
                  {w.activeLog&&<div style={{fontSize:9,color:"#fbbf24"}}>running</div>}
                </td>
                <td style={{...DS.td,minWidth:190}} onClick={e=>e.stopPropagation()}>
                  {scopes.length>0
                    ?<select value={scopeAlloc[w.id]||""} onChange={e=>setScopeAlloc(a=>({...a,[w.id]:e.target.value}))}
                        style={{width:"100%",background:scopeAlloc[w.id]?"#0d1e0d":"#0f1421",
                          border:`1px solid ${scopeAlloc[w.id]?"#34d399":"#2d3555"}`,
                          borderRadius:7,padding:"6px 9px",
                          color:scopeAlloc[w.id]?"#34d399":"#64748b",
                          fontSize:11,outline:"none",cursor:"pointer",fontWeight:scopeAlloc[w.id]?600:400}}>
                        <option value="">— Select scope —</option>
                        {scopes.map(sc=><option key={sc.id} value={sc.id}>{sc.description||"Scope item"}</option>)}
                      </select>
                    :<span style={{color:"#374151",fontSize:11,fontStyle:"italic"}}>No scopes on this site</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>}

    {/* Forecast workers (not yet signed in) */}
    {forecastWorkers.length>0&&<div>
      <div style={{fontSize:10,color:"#fbbf24",fontWeight:700,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:"#fbbf24",display:"inline-block"}}/>
        Forecast — Allocated but not yet GPS-confirmed ({forecastWorkers.length})
      </div>
      <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>
            <th style={{...DS.th,textAlign:"left"}}>Worker</th>
            <th style={{...DS.th,textAlign:"left"}}>Position</th>
            <th style={{...DS.th,textAlign:"left"}}>Allocated days</th>
          </tr></thead>
          <tbody>
            {forecastWorkers.map((w,i)=>{
              const allocDays=Object.entries(w.days||{}).filter(([,v])=>(v||"").includes(site.name)).map(([d])=>d);
              return <tr key={w.id} style={{background:i%2===0?"#111827":"#0f1421",cursor:"pointer"}} onClick={()=>{setDetailId(w.id);setPage("worker_detail");}}>
                <td style={DS.td}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:7,background:"#fbbf2422",border:"1px solid #fbbf2444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fbbf24"}}>{(w.name||"?")[0]}</div>
                    <div><div style={{fontWeight:600,color:"#e2e8f0",fontSize:12}}>{w.name}</div><div style={{fontSize:10,color:"#64748b"}}>{w.company}</div></div>
                  </div>
                </td>
                <td style={{...DS.td,color:"#94a3b8"}}>{w.position||"—"}</td>
                <td style={{...DS.td}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {allocDays.map(d=><span key={d} style={{padding:"2px 7px",borderRadius:5,background:"#fbbf2422",color:"#fbbf24",fontSize:10,fontWeight:600,border:"1px solid #fbbf2444"}}>{d}</span>)}
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:11,color:"#64748b",marginTop:7,fontStyle:"italic"}}>
        📋 These workers are in the forecast but have not GPS-signed in to this site. They will move to "GPS Confirmed" once they sign in via the Worker Portal.
      </div>
    </div>}

    {confirmedWorkers.length===0&&forecastWorkers.length===0&&<div style={{textAlign:"center",padding:36,color:"#374151",fontSize:12}}>
      <div style={{fontSize:32,marginBottom:10}}>👷</div>
      No workers allocated or GPS-confirmed on this site yet.
    </div>}
  </div>;
}

function DSiteDetail({allSites,clients,workers,activeDays,siteHours,siteId,invoices,payApplications,setPage,setDetailId,setModal,weekLabel}){
  const site=allSites.find(s=>s.id===siteId);
  if(!site) return <div style={DS.body}><div style={{color:"#374151",textAlign:"center",padding:40}}>Site not found.</div></div>;
  const client=clients.find(c=>c.id===site.clientId);
  const siteWorkers=workers.filter(w=>activeDays.some(d=>(w.days?.[d]||"").includes(site.name)));
  const sc=site.scopes||[], vr=site.variations||[];
  const isPW=site.contractType==="pricework";
  const pohPct=Number(site.pohPct)||0;
  const retPct=Number(site.retentionPct)||0;
  const scopeT=sc.reduce((a,s)=>a+(Number(s.qty)||0)*(Number(s.rate)||0),0);
  const pohTotal=isPW?scopeT*(pohPct/100):0;
  const scopeNetToBM=scopeT-pohTotal;            // budget for manager to execute
  const varT=vr.reduce((a,v)=>a+(v.type==="addition"?Number(v.value||0):-Number(v.value||0)),0);
  const contract=scopeT+varT;                    // original agreed price (for invoicing/payment apps)
  const retTotal=isPW?scopeNetToBM*(retPct/100):0;
  const netCertified=scopeNetToBM-retTotal;
  const labourCost=useMemo(()=>{let t=0;workers.forEach(w=>{const{bd}=calcPay(w,activeDays,siteHours);Object.values(bd).forEach(b=>{if(b.site===site.name||b.site.includes(site.name))t+=b.gross;});});return t;},[workers,activeDays,siteHours,site.name]);
  const siteInvs=(invoices||[]).filter(i=>i.siteId===site.id);
  const totalInvoiced=siteInvs.reduce((a,i)=>{const s=(i.lines||[]).reduce((x,l)=>x+(l.qty||0)*(l.rate||0),0);return a+s;},0);
  const totalPaid=siteInvs.filter(i=>i.status==="paid").reduce((a,i)=>{const s=(i.lines||[]).reduce((x,l)=>x+(l.qty||0)*(l.rate||0),0);return a+s;},0);
  const totalDue=totalInvoiced-totalPaid;
  const profit=contract-labourCost;
  const margin=contract>0?((contract-labourCost)/contract*100):0;
  const [tab,setTab]=useState("scopes");
  // Variation file attachments state — stored locally per session
  const [varFiles,setVarFiles]=useState({});
  const [siteFiles,setSiteFiles]=useState([]);
  const [newLinkUrl,setNewLinkUrl]=useState("");
  const [newLinkName,setNewLinkName]=useState("");

  function addSiteFile(file){
    const reader=new FileReader();
    reader.onload=ev=>{
      setSiteFiles(f=>[...f,{id:Date.now().toString(),name:file.name,size:file.size,type:file.type,url:ev.target.result,kind:"file",addedAt:new Date().toISOString()}]);
    };
    reader.readAsDataURL(file);
  }
  function addSiteLink(){
    const url=newLinkUrl.trim();
    if(!url) return;
    setSiteFiles(f=>[...f,{id:Date.now().toString(),name:newLinkName.trim()||url,url,kind:"link",type:"link",addedAt:new Date().toISOString()}]);
    setNewLinkUrl(""); setNewLinkName("");
  }
  function removeSiteFile(id){setSiteFiles(f=>f.filter(x=>x.id!==id));}

  function addVarFile(varId,file){
    const reader=new FileReader();
    reader.onload=ev=>{
      const url=ev.target.result;
      setVarFiles(f=>({...f,[varId]:[...(f[varId]||[]),{name:file.name,size:file.size,type:file.type,url,addedAt:new Date().toISOString()}]}));
    };
    reader.readAsDataURL(file);
  }
  function removeVarFile(varId,idx){
    setVarFiles(f=>({...f,[varId]:(f[varId]||[]).filter((_,i)=>i!==idx)}));
  }
  function fileIcon(type){
    if(type.startsWith("image/")) return "🖼";
    if(type.startsWith("video/")) return "🎬";
    if(type==="application/pdf") return "📄";
    if(type.includes("word")||type.includes("document")) return "📝";
    if(type.includes("email")||type.includes("message")) return "📧";
    if(type.includes("sheet")||type.includes("excel")) return "📊";
    return "📎";
  }

  // 6 financial cards
  const financials=[
    {label:"Contract Value",value:"£"+Math.round(contract).toLocaleString(),color:"#60a5fa",sub:"Scopes + variations"},
    {label:"Labour Cost (Gross)",value:"£"+Math.round(labourCost).toLocaleString(),color:"#f87171",sub:"Total weekly labour"},
    {label:"Invoiced to Date",value:"£"+Math.round(totalInvoiced).toLocaleString(),color:"#fbbf24",sub:siteInvs.length+" invoice"+(siteInvs.length!==1?"s":"")},
    {label:"Paid to Date",value:"£"+Math.round(totalPaid).toLocaleString(),color:"#34d399",sub:siteInvs.filter(i=>i.status==="paid").length+" paid"},
    {label:"Total Due",value:"£"+Math.round(totalDue).toLocaleString(),color:totalDue>0?"#f97316":"#34d399",sub:totalDue>0?"Outstanding":"Fully collected"},
    {label:"Profit / Loss",value:"£"+Math.round(Math.abs(profit)).toLocaleString(),color:profit>=0?"#a78bfa":"#f87171",sub:(profit>=0?"Profit ":"Loss ")+Math.abs(margin).toFixed(1)+"%"},
  ];

  return <div>
    <DPageHdr
      title={<span style={{display:"flex",alignItems:"center",gap:9}}>
        <span style={{width:13,height:13,borderRadius:"50%",background:site.color,boxShadow:"0 0 8px "+site.color+"88"}}/>
        {site.name}
      </span>}
      sub={client?<span>Client: <span style={{color:client.color,fontWeight:700}}>{client.name}</span></span>:"No client assigned"}
      back="Sites" onBack={()=>setPage("sites")}
      actions={<div style={{display:"flex",gap:7}}>
        <button onClick={()=>setModal({type:"siteDetail",site})} style={{padding:"6px 12px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:6,color:"#60a5fa",cursor:"pointer",fontSize:12,fontWeight:600}}>✏️ Edit Site</button>
      </div>}/>

    <div style={DS.body}>
      {/* 6-card financial header */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:20}}>
        {financials.map(({label,value,color,sub})=>(
          <div key={label} style={{background:"linear-gradient(145deg,#141924,#1a2035)",border:"1px solid "+color+"33",borderRadius:12,padding:"13px 14px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:color}}/>
            <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div>
            <div style={{fontSize:18,fontWeight:900,color,lineHeight:1,marginBottom:4}}>{value}</div>
            <div style={{fontSize:10,color:"#374151"}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Profit bar */}
      {contract>0&&<div style={{background:"#111827",borderRadius:10,padding:"11px 16px",marginBottom:18,border:"1px solid #1e2535",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:11,color:"#64748b",fontWeight:700,minWidth:110}}>Cost vs Contract</span>
        <div style={{flex:1,height:8,background:"#1e2535",borderRadius:4,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:4,background:labourCost>contract?"#ef4444":"linear-gradient(90deg,#34d399,#10b981)",width:Math.min(100,labourCost/contract*100)+"%",transition:"width 0.6s ease"}}/>
        </div>
        <span style={{fontSize:12,fontWeight:700,color:labourCost>contract?"#f87171":"#34d399",minWidth:80,textAlign:"right"}}>{Math.round(labourCost/contract*100)}% used</span>
        <span style={{fontSize:11,color:"#64748b"}}>Labour £{Math.round(labourCost).toLocaleString()} of £{Math.round(contract).toLocaleString()}</span>
      </div>}

      {/* Tab bar */}
      <div style={{display:"flex",gap:3,background:"#0d1117",borderRadius:8,padding:3,marginBottom:18,width:"fit-content",flexWrap:"wrap"}}>
        {[["scopes","📋 Scopes ("+(sc.length)+")"],["variations","⚡ Variations ("+(vr.length)+")"],["workers","👷 Workers ("+(siteWorkers.length)+")"],["costs","💷 Full Costs"],["invoices","🧾 Invoices ("+(siteInvs.length)+")"],["docs","📁 Documents"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:"6px 14px",background:tab===v?"#1e3a5f":"transparent",border:tab===v?"1px solid #3b82f6":"1px solid transparent",borderRadius:6,color:tab===v?"#60a5fa":"#64748b",cursor:"pointer",fontSize:12,fontWeight:tab===v?700:400}}>{l}</button>
        ))}
      </div>

      {/* Scopes */}
      {tab==="scopes"&&<div>
        {isPW&&(pohPct>0||retPct>0)&&<div style={{display:"flex",gap:14,marginBottom:12,padding:"8px 14px",background:"#0f1421",borderRadius:8,border:"1px solid #1e2535",fontSize:11,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:"#64748b",fontWeight:700}}>📐 Price Work</span>
          {pohPct>0&&<span style={{color:"#fbbf24"}}>P&OH deducted: <b>{pohPct}%</b></span>}
          {retPct>0&&<span style={{color:"#f97316"}}>Retention: <b>{retPct}%</b></span>}
          <span style={{color:"#64748b",marginLeft:"auto",fontStyle:"italic"}}>Agreed price shown in full · Budget = agreed − P&OH</span>
        </div>}
        {sc.length===0?<div style={{textAlign:"center",padding:40,border:"1px dashed #1e2535",borderRadius:10,color:"#374151"}}>
          No scopes yet. Click "✏️ Edit Site" to add scope line items.
        </div>:
        <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden",overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:isPW?780:500}}>
            <thead><tr>
              <th style={DS.th}>Description</th>
              <th style={{...DS.th,width:60,textAlign:"center"}}>Unit</th>
              <th style={{...DS.th,width:55,textAlign:"right"}}>Qty</th>
              <th style={{...DS.th,width:90,textAlign:"right"}}>Rate £</th>
              <th style={{...DS.th,width:100,textAlign:"right",color:"#60a5fa"}}>Agreed £</th>
              {isPW&&pohPct>0&&<th style={{...DS.th,width:95,textAlign:"right",color:"#fbbf24"}}>P&OH ({pohPct}%)</th>}
              {isPW&&<th style={{...DS.th,width:100,textAlign:"right",color:"#34d399"}}>Budget £</th>}
              {isPW&&retPct>0&&<th style={{...DS.th,width:100,textAlign:"right",color:"#f97316"}}>Retention</th>}
              {isPW&&retPct>0&&<th style={{...DS.th,width:105,textAlign:"right",color:"#a78bfa"}}>Net Certified</th>}
              {!isPW&&<th style={{...DS.th,width:105,textAlign:"right",color:"#34d399"}}>Total £</th>}
            </tr></thead>
            <tbody>
              {sc.map((s,i)=>{
                const agreed=(Number(s.qty)||0)*(Number(s.rate)||0);
                const poh=isPW?agreed*(pohPct/100):0;
                const budget=agreed-poh;
                const ret=isPW?budget*(retPct/100):0;
                const cert=budget-ret;
                return <tr key={s.id||i} style={{background:i%2===0?"#111827":"#0f1421"}}>
                  <td style={{...DS.td,fontWeight:600,color:"#f1f5f9"}}>{s.description||"—"}</td>
                  <td style={{...DS.td,textAlign:"center"}}><span style={DS.badge("#94a3b8","#1e2535")}>{s.unit}</span></td>
                  <td style={{...DS.td,textAlign:"right",color:"#60a5fa",fontWeight:600}}>{s.qty}</td>
                  <td style={{...DS.td,textAlign:"right"}}>£{Number(s.rate).toLocaleString()}</td>
                  <td style={{...DS.td,textAlign:"right",color:"#60a5fa",fontWeight:600}}>£{agreed.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                  {isPW&&pohPct>0&&<td style={{...DS.td,textAlign:"right",color:"#fbbf24"}}>-£{poh.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                  {isPW&&<td style={{...DS.td,textAlign:"right",color:"#34d399",fontWeight:700}}>£{budget.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                  {isPW&&retPct>0&&<td style={{...DS.td,textAlign:"right",color:"#f97316"}}>-£{ret.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                  {isPW&&retPct>0&&<td style={{...DS.td,textAlign:"right",color:"#a78bfa",fontWeight:700}}>£{cert.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                  {!isPW&&<td style={{...DS.td,textAlign:"right",color:"#34d399",fontWeight:700}}>£{agreed.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                </tr>;
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"#0d1117",borderTop:"2px solid #2d3555"}}>
                <td colSpan={4} style={{...DS.td,fontWeight:700,color:"#94a3b8"}}>TOTAL SCOPE</td>
                <td style={{...DS.td,textAlign:"right",color:"#60a5fa",fontWeight:800}}>£{scopeT.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                {isPW&&pohPct>0&&<td style={{...DS.td,textAlign:"right",color:"#fbbf24",fontWeight:800}}>-£{pohTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                {isPW&&<td style={{...DS.td,textAlign:"right",color:"#34d399",fontWeight:900,fontSize:14}}>£{scopeNetToBM.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                {isPW&&retPct>0&&<td style={{...DS.td,textAlign:"right",color:"#f97316",fontWeight:800}}>-£{retTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                {isPW&&retPct>0&&<td style={{...DS.td,textAlign:"right",color:"#a78bfa",fontWeight:900,fontSize:14}}>£{netCertified.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
                {!isPW&&<td style={{...DS.td,textAlign:"right",color:"#34d399",fontWeight:900,fontSize:14}}>£{scopeT.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>}
              </tr>
              {isPW&&<tr style={{background:"#0a1a0d",borderTop:"1px solid #1e2535"}}>
                <td colSpan={4} style={{...DS.td,fontSize:10,color:"#64748b",fontStyle:"italic"}}>
                  Agreed price = full contract value invoiced to client · Budget = manager's allocation after P&OH deduction
                </td>
                {pohPct>0&&<td style={{...DS.td}}/>}
                <td style={{...DS.td,textAlign:"right"}}>
                  <span style={{fontSize:10,color:"#34d399",fontWeight:700}}>Manager budget: £{scopeNetToBM.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                </td>
                {retPct>0&&<td style={{...DS.td}}/>}
                {retPct>0&&<td style={{...DS.td}}/>}
              </tr>}
            </tfoot>
          </table>
        </div>}
      </div>}

      {/* Variations — with file attachments + inline add */}
      {tab==="variations"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>
            {vr.length} Variation{vr.length!==1?"s":""} · Net: <span style={{color:varT>=0?"#34d399":"#f87171"}}>{varT>=0?"+":"-"}£{Math.abs(Math.round(varT)).toLocaleString()}</span>
          </div>
          <button onClick={()=>setModal({type:"siteDetail",site,defaultTab:"variations"})}
            style={{padding:"6px 14px",background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
            ⚡ + Add / Edit Variations
          </button>
        </div>
        {vr.length===0?<div style={{textAlign:"center",padding:40,border:"1px dashed #1e2535",borderRadius:10,color:"#374151"}}>
          No variations yet. Click "⚡ + Add / Edit Variations" above.
        </div>:vr.map((v,i)=>{
          const files=varFiles[v.id]||[];
          const isAdd=v.type==="addition";
          const val=Number(v.value||0);
          const bc=isAdd?"#34d399":"#f87171";
          return <div key={v.id||i} style={{background:"linear-gradient(145deg,#141924,#1a2035)",border:"1px solid "+(isAdd?"#065f4666":"#7f1d1d66"),borderRadius:12,padding:16,marginBottom:12,borderLeft:"4px solid "+bc}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#f1f5f9"}}>{v.description||"—"}</span>
                  <DStatusBadge status={v.type==="addition"?"addition":"omission"}/>
                  <DStatusBadge status={v.approved?"approved":"pending"}/>
                </div>
                {v.notes&&<div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{v.notes}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>Value</div>
                <div style={{fontSize:20,fontWeight:900,color:bc}}>{isAdd?"+":"-"}£{val.toLocaleString()}</div>
              </div>
            </div>

            {/* File attachments */}
            <div style={{background:"#0f1421",borderRadius:9,padding:"10px 12px",border:"1px solid #1e2535"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:files.length>0?10:0}}>
                <span style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>📎 Attachments ({files.length})</span>
                <label style={{padding:"4px 11px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:6,color:"#60a5fa",cursor:"pointer",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                  + Attach File
                  <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.eml,.msg" style={{display:"none"}} onChange={e=>{Array.from(e.target.files||[]).forEach(f=>addVarFile(v.id,f));e.target.value="";}}/>
                </label>
              </div>
              {files.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {files.map((f,fi)=>(
                  <div key={fi} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",background:"#1a2035",borderRadius:7,border:"1px solid #2d3555",maxWidth:220}}>
                    <span style={{fontSize:15,flexShrink:0}}>{fileIcon(f.type)}</span>
                    {f.type.startsWith("image/")?
                      <a href={f.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
                        <img src={f.url} alt={f.name} style={{width:40,height:40,objectFit:"cover",borderRadius:4,border:"1px solid #2d3555"}}/>
                      </a>:
                      <a href={f.url} download={f.name} style={{fontSize:10,color:"#60a5fa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120,textDecoration:"none"}} title={f.name}>{f.name}</a>
                    }
                    <span style={{fontSize:9,color:"#374151",flexShrink:0}}>{f.size>1048576?(f.size/1048576).toFixed(1)+"MB":(f.size/1024).toFixed(0)+"KB"}</span>
                    <button onClick={()=>removeVarFile(v.id,fi)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:13,lineHeight:1,flexShrink:0,padding:"0 2px"}}>×</button>
                  </div>
                ))}
              </div>}
              {files.length===0&&<div style={{fontSize:10,color:"#374151",marginTop:4}}>Attach photos, videos, PDFs, emails or documents as evidence for this variation.</div>}
            </div>
          </div>;
        })}
        {vr.length>0&&<div style={{textAlign:"right",padding:"10px 0",fontSize:14,fontWeight:800,color:varT>=0?"#34d399":"#f87171"}}>
          Net Variations: {varT>=0?"+":"-"}£{Math.abs(varT).toLocaleString()}
        </div>}
      </div>}

      {/* Workers */}
      {tab==="workers"&&<SiteWorkersPanel site={site} allWorkers={workers} weekLabel={weekLabel} scopes={sc} setDetailId={setDetailId} setPage={setPage}/>}

      {/* Full Costs */}
      {tab==="costs"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div style={{background:"#0f1421",borderRadius:11,padding:16,border:"1px solid #1e2535"}}>
            <div style={{fontSize:11,color:"#34d399",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Income</div>
            {[["Agreed Scope","£"+Math.round(scopeT).toLocaleString(),"#60a5fa"],["Approved Variations",(varT>=0?"+":"-")+"£"+Math.round(Math.abs(varT)).toLocaleString(),"#fbbf24"],["Total Contract Value","£"+Math.round(contract).toLocaleString(),"#34d399"],["Invoiced to Date","£"+Math.round(totalInvoiced).toLocaleString(),"#fbbf24"],["Paid to Date","£"+Math.round(totalPaid).toLocaleString(),"#34d399"],["Outstanding Due","£"+Math.round(totalDue).toLocaleString(),totalDue>0?"#f97316":"#34d399"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #1e2535"}}>
                <span style={{color:"#94a3b8",fontSize:12}}>{l}</span><span style={{fontWeight:700,color:c,fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#0f1421",borderRadius:11,padding:16,border:"1px solid #1e2535"}}>
            <div style={{fontSize:11,color:"#f87171",fontWeight:700,textTransform:"uppercase",marginBottom:12}}>Costs</div>
            {[["Labour Cost (Gross)","£"+Math.round(labourCost).toLocaleString(),"#f87171"],["Labour Cost (Net)","£"+Math.round(workers.reduce((a,w)=>{const{bd}=calcPay(w,activeDays,siteHours);return a+Object.values(bd).filter(b=>b.site===site.name||b.site.includes(site.name)).reduce((x,b)=>x+b.gross,0);},0)*(1-(workers.find(w=>activeDays.some(d=>(w.days?.[d]||"").includes(site.name)))?.taxRate||0))).toLocaleString(),"#ef4444"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #1e2535"}}>
                <span style={{color:"#94a3b8",fontSize:12}}>{l}</span><span style={{fontWeight:700,color:c,fontSize:13}}>{v}</span>
              </div>
            ))}
            <div style={{background:profit>=0?"#0d2218":"#2d1515",border:"2px solid "+(profit>=0?"#10b981":"#ef4444"),borderRadius:10,padding:14,textAlign:"center",marginTop:14}}>
              <div style={{fontSize:10,color:profit>=0?"#34d399":"#f87171",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{profit>=0?"Profit":"Loss"}</div>
              <div style={{fontSize:28,fontWeight:900,color:profit>=0?"#34d399":"#f87171"}}>£{Math.round(Math.abs(profit)).toLocaleString()}</div>
              {contract>0&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>Margin: {Math.abs(margin).toFixed(1)}%</div>}
            </div>
          </div>
        </div>
      </div>}

      {/* Invoices */}
      {tab==="invoices"&&<div>
        {/* Latest Payment Application banner */}
        {(()=>{
          const sitePAs=(payApplications||[]).filter(p=>p.siteId===site.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
          const latestPA=sitePAs[0];
          if(!latestPA) return null;
          const totalClaimed=latestPA.items.reduce((a,it)=>a+(it.useQty?(it.claimedQtyToDate||0)*it.contractRate:((it.claimedPctToDate||0)/100)*(it.contractQty*it.contractRate)),0);
          const totalContract=latestPA.items.reduce((a,it)=>a+it.contractQty*it.contractRate,0);
          const pct=totalContract>0?Math.round(totalClaimed/totalContract*100):0;
          const statusColor={draft:"#64748b",submitted:"#60a5fa",certified:"#34d399",paid:"#a78bfa"}[latestPA.status]||"#64748b";
          return <div style={{background:"linear-gradient(145deg,#0c1a2e,#111827)",border:"1px solid #1e3a5f",borderRadius:11,padding:14,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:13}}>📐</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>Latest Payment Application: <span style={{color:"#a78bfa"}}>{latestPA.number}</span></div>
                  <div style={{fontSize:10,color:"#64748b"}}>{latestPA.date} · {latestPA.items.length} items</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{padding:"2px 9px",borderRadius:5,fontSize:10,fontWeight:700,color:statusColor,background:statusColor+"18",border:"1px solid "+statusColor+"44",textTransform:"capitalize"}}>{latestPA.status}</span>
                <button onClick={()=>setPage("payapps")} style={{padding:"4px 11px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10,fontWeight:700}}>View All →</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
              {[["Contract",totalContract,"#60a5fa"],["Claimed to Date",totalClaimed,"#34d399"],["This Period",totalClaimed-latestPA.items.reduce((a,it)=>a+(it.previousQty||0)*it.contractRate,0),"#fbbf24"],["% Complete",pct+"%","#a78bfa"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#0d1117",borderRadius:7,padding:"7px 10px",border:"1px solid "+c+"22"}}>
                  <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",fontWeight:700}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:c,marginTop:3}}>{typeof v==="number"?"£"+Math.round(v).toLocaleString():v}</div>
                </div>
              ))}
            </div>
            {sitePAs.length>1&&<div style={{marginTop:8,fontSize:10,color:"#64748b"}}>{sitePAs.length} total applications for this site</div>}
          </div>;
        })()}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{siteInvs.length} Invoice{siteInvs.length!==1?"s":""}</div>
          <button onClick={()=>{
            const inv=emptyInvoice(clients,allSites,invoices);
            inv.siteId=site.id;
            inv.clientId=site.clientId||"";
            // pre-fill site name and client
            setModal({type:"invoice",invoice:inv});
          }} style={{padding:"6px 16px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
            🧾 + New Invoice
          </button>
        </div>
        {siteInvs.length===0?<div style={{textAlign:"center",padding:40,border:"1px dashed #1e2535",borderRadius:10,color:"#374151"}}>No invoices for this site yet. Click "+ New Invoice" above.</div>:
        <DTable cols={[
          {key:"invoiceNumber",label:"Invoice No.",r:v=><span style={{color:"#60a5fa",fontWeight:700}}>{v||"Draft"}</span>},
          {key:"issueDate",label:"Date",r:v=>v?new Date(v).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"},
          {key:"lines",label:"Amount",r:v=>{const t=(v||[]).reduce((a,l)=>a+(l.qty||0)*(l.rate||0),0);return <span style={{color:"#34d399",fontWeight:700}}>£{Math.round(t).toLocaleString()}</span>;}},
          {key:"status",label:"Status",r:v=><DStatusBadge status={v||"draft"}/>},
          {key:"id",label:"",r:(_,r)=><button onClick={e=>{e.stopPropagation();setModal({type:"invoice",invoice:r});}} style={{padding:"3px 9px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:4,color:"#60a5fa",cursor:"pointer",fontSize:10,fontWeight:700}}>✏️ Edit</button>},
        ]} rows={siteInvs}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",fontSize:13,fontWeight:700,color:"#fbbf24"}}>
          <span>Total Invoiced: £{Math.round(totalInvoiced).toLocaleString()} · Paid: £{Math.round(totalPaid).toLocaleString()}</span>
          <span style={{color:totalDue>0?"#f97316":"#34d399"}}>Due: £{Math.round(totalDue).toLocaleString()}</span>
        </div>
      </div>}

      {/* Documents & Links directory */}
      {tab==="docs"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
          {/* Upload files */}
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:14}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Upload Files</div>
            <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",background:"#1e3a5f",border:"2px dashed #3b82f6",borderRadius:8,cursor:"pointer",color:"#60a5fa",fontSize:12,fontWeight:600}}>
              📁 Click to upload files
              <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.eml,.msg,.zip,.dwg,.dxf" style={{display:"none"}}
                onChange={e=>{Array.from(e.target.files||[]).forEach(f=>addSiteFile(f));e.target.value="";}}/>
            </label>
            <div style={{fontSize:10,color:"#374151",marginTop:6}}>Images, PDFs, Word, Excel, emails, CAD files, videos, ZIP</div>
          </div>
          {/* Add shared link */}
          <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:14}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Add Shared Link</div>
            <input value={newLinkName} onChange={e=>setNewLinkName(e.target.value)} placeholder="Label (e.g. JAUK Drawing Pack)" style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:6,padding:"6px 9px",color:"#e2e8f0",fontSize:12,outline:"none",marginBottom:7,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:7}}>
              <input value={newLinkUrl} onChange={e=>setNewLinkUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSiteLink()} placeholder="https://drive.google.com/… or any URL" style={{flex:1,background:"#0f1421",border:"1px solid #2d3555",borderRadius:6,padding:"6px 9px",color:"#e2e8f0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              <button onClick={addSiteLink} style={{padding:"6px 13px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>+ Add</button>
            </div>
          </div>
        </div>

        {/* Files & links grid */}
        {siteFiles.length===0?<div style={{textAlign:"center",padding:40,border:"1px dashed #1e2535",borderRadius:10,color:"#374151"}}>
          <div style={{fontSize:28,marginBottom:8}}>📁</div>
          No files or links yet. Upload documents or add shared links above.
        </div>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {siteFiles.map(f=>{
            const isImg=f.type&&f.type.startsWith("image/");
            const isLink=f.kind==="link";
            const icon=isLink?"🔗":f.type?.startsWith("image/")?"🖼":f.type?.startsWith("video/")?"🎬":f.type==="application/pdf"?"📄":f.type?.includes("word")?"📝":f.type?.includes("sheet")||f.type?.includes("excel")?"📊":f.type?.includes("email")||f.type?.includes("message")?"📧":"📎";
            return <div key={f.id} style={{background:"linear-gradient(145deg,#141924,#1a2035)",border:"1px solid #2d3555",borderRadius:10,padding:12,position:"relative"}}>
              <button onClick={()=>removeSiteFile(f.id)} style={{position:"absolute",top:7,right:8,background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:15,lineHeight:1,padding:0}}>×</button>
              {isImg&&!isLink?
                <a href={f.url} target="_blank" rel="noreferrer">
                  <img src={f.url} alt={f.name} style={{width:"100%",height:90,objectFit:"cover",borderRadius:6,display:"block",marginBottom:7,border:"1px solid #2d3555"}}/>
                </a>:
                <div style={{height:60,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:7}}>{icon}</div>
              }
              <div style={{fontSize:11,color:"#f1f5f9",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}} title={f.name}>{f.name}</div>
              {!isLink&&<div style={{fontSize:9,color:"#374151",marginBottom:6}}>{f.size>1048576?(f.size/1048576).toFixed(1)+"MB":(f.size/1024).toFixed(0)+"KB"}</div>}
              <div style={{display:"flex",gap:6}}>
                <a href={f.url} target="_blank" rel="noreferrer" style={{flex:1,padding:"4px 0",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10,fontWeight:700,textAlign:"center",textDecoration:"none",display:"block"}}>
                  {isLink?"🔗 Open":"👁 View"}
                </a>
                {!isLink&&<a href={f.url} download={f.name} style={{padding:"4px 8px",background:"#0f1421",border:"1px solid #2d3555",borderRadius:5,color:"#94a3b8",cursor:"pointer",fontSize:10,textDecoration:"none",display:"block"}}>⬇</a>}
              </div>
              <div style={{fontSize:8,color:"#374151",marginTop:5}}>{new Date(f.addedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
            </div>;
          })}
        </div>}
      </div>}
    </div>
  </div>;
}

// ── Dashboard Clients Page ────────────────────────────────────────────────────
function DClients({clients,allSites,invoices,workers,activeDays,siteHours,setPage,setDetailId,setModal}){
  return <div>
    <DPageHdr title="👔 Clients" sub={`${clients.length} accounts`}
      actions={<button onClick={()=>setModal({type:"clients"})} style={{padding:"7px 14px",background:"#1e2535",border:"1px solid #8b5cf6",borderRadius:7,color:"#a78bfa",cursor:"pointer",fontSize:12,fontWeight:700}}>👔 Manage Clients</button>}/>
    <div style={DS.body}>
      {clients.map(c=>{
        const sites=allSites.filter(s=>s.clientId===c.id);
        const invs=invoices.filter(i=>i.siteId&&sites.find(s=>s.id===i.siteId));
        const totalInv=invs.reduce((a,i)=>a+i.amount,0);
        return <div key={c.id} onClick={()=>{setDetailId(c.id);setPage("client_detail");}}
          style={{...DS.card(c.color),borderColor:`${c.color}33`,marginBottom:12}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.transform="translateY(-2px)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=`${c.color}33`;e.currentTarget.style.transform="";}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${c.color}18`,border:`1px solid ${c.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:c.color}}>{c.name[0]}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{c.name}</div><div style={{fontSize:11,color:"#64748b"}}>{c.contact}</div></div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <button onClick={e=>{e.stopPropagation();openClientWindow(c,allSites,invoices,workers,activeDays,siteHours);}} title="Open client in new window" style={{padding:"3px 8px",background:"#1a1f2e",border:"1px solid #60a5fa",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10}}>🔗</button>
              <span style={{color:`${c.color}66`,fontSize:16}}>→</span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[["Sites",sites.length,"#60a5fa"],["Invoiced","£"+totalInv.toLocaleString(),"#34d399"],["Rates",(c.rates||[]).length,"#a78bfa"]].map(([l,v,col])=>(
              <div key={l} style={{background:"#0a0e17",borderRadius:7,padding:"7px 9px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:col,marginTop:2}}>{v}</div></div>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {(c.rates||[]).map(r=><span key={r.id} style={DS.pill(c.color)}>{TEAM_TYPES.find(t=>t.key===r.teamType)?.label.split("(")[0].trim()||r.teamType} · £{r.dayRate}/day</span>)}
            {(c.rates||[]).length===0&&<span style={{color:"#374151",fontSize:11}}>No day rates configured</span>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ── Dashboard Certs Page ──────────────────────────────────────────────────────
function DCerts({workers,setPage,setDetailId}){
  const allCerts=useMemo(()=>workers.flatMap(w=>
    Object.entries(w.certs||{}).filter(([,v])=>v.held).map(([k,v])=>({
      ...v,key:k,workerId:w.id,workerName:w.name,workerColor:w.color,
      label:CERTS.find(c=>c.key===k)?.label||k,
    }))
  ),[workers]);
  const expired=allCerts.filter(c=>{if(!c.expiry)return false;return new Date(c.expiry)<new Date();});
  const expiring=allCerts.filter(c=>{if(!c.expiry)return false;const d=(new Date(c.expiry)-new Date())/86400000;return d>=0&&d<30;});
  const[filter,setFilter]=useState("all");
  const shown=filter==="all"?allCerts:filter==="expiring"?expiring:expired;

  return <div>
    <DPageHdr title="🛡 Certificates" sub={`${allCerts.length} held · ${expiring.length} expiring · ${expired.length} expired`}/>
    <div style={DS.body}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <DStat label="Total" value={allCerts.length} color="#a78bfa"/>
        <DStat label="Valid" value={allCerts.length-expiring.length-expired.length} color="#34d399"/>
        <DStat label="Expiring Soon" value={expiring.length} color="#fbbf24" sub="within 30 days"/>
        <DStat label="Expired" value={expired.length} color="#f87171"/>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:14}}>
        {[["all","All"],["expiring","Expiring Soon"],["expired","Expired"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"5px 12px",background:filter===v?"#1e3a5f":"#1a1f2e",border:`1px solid ${filter===v?"#3b82f6":"#2d3555"}`,borderRadius:7,color:filter===v?"#60a5fa":"#64748b",cursor:"pointer",fontSize:12,fontWeight:filter===v?700:400}}>{l}</button>
        ))}
      </div>
      <DTable cols={[
        {key:"label",label:"Certificate",w:200},
        {key:"workerName",label:"Worker",r:(v,r)=><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:24,height:24,borderRadius:5,background:r.workerColor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:r.workerColor}}>{v[0]}</div><span style={{fontWeight:500}}>{v}</span></div>},
        {key:"regNo",label:"Reg No",r:v=>v?<span style={{color:"#60a5fa",fontFamily:"monospace",fontSize:12}}>{v}</span>:<span style={{color:"#374151"}}>—</span>},
        {key:"expiry",label:"Expiry",r:v=>{if(!v)return <span style={{color:"#374151"}}>No expiry</span>;const d=(new Date(v)-new Date())/86400000;const col=d<0?"#f87171":d<30?"#fbbf24":"#34d399";return <span style={{color:col,fontWeight:600}}>{v} {d<0?"(EXPIRED)":d<30?`(${Math.ceil(d)}d)`:"✓"}</span>;}},
        {key:"fileUrl",label:"File",r:v=>v?<a href={v} target="_blank" rel="noreferrer" style={{color:"#60a5fa",fontSize:11}}>📎 View</a>:<span style={{color:"#374151",fontSize:11}}>—</span>},
      ]} rows={shown} onRow={r=>{setDetailId(r.workerId);setPage("worker_detail");}}/>
    </div>
  </div>;
}

// ── Dashboard Invoices Page ───────────────────────────────────────────────────
function DInvoices({invoices,allSites,clients,setModal}){
  const total=invoices.reduce((a,i)=>a+i.amount,0);
  const paid=invoices.filter(i=>i.status==="paid").reduce((a,i)=>a+i.amount,0);
  return <div>
    <DPageHdr title="🧾 Invoices" sub={`${invoices.length} invoices · £${total.toLocaleString()} total`}
      actions={<button onClick={()=>setModal({type:"invoice",invoice:{id:"inv"+Date.now(),number:"INV-00"+(invoices.length+1),siteId:"",clientId:"",date:new Date().toISOString().slice(0,10),status:"draft",amount:0,items:[]}})} style={{padding:"7px 14px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ New Invoice</button>}/>
    <div style={DS.body}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <DStat label="Total" value={"£"+total.toLocaleString()} color="#34d399"/>
        <DStat label="Paid" value={"£"+paid.toLocaleString()} color="#a78bfa"/>
        <DStat label="Outstanding" value={"£"+(total-paid).toLocaleString()} color="#fbbf24"/>
        <DStat label="Draft" value={invoices.filter(i=>i.status==="draft").length} color="#94a3b8"/>
      </div>
      <DTable cols={[
        {key:"number",label:"Invoice",r:v=><span style={{color:"#60a5fa",fontWeight:700}}>{v}</span>},
        {key:"date",label:"Date"},
        {key:"siteId",label:"Site",r:v=>{const s=allSites.find(x=>x.id===v);return s?<span style={DS.pill(s.color)}>{s.name}</span>:<span style={{color:"#374151"}}>—</span>;}},
        {key:"clientId",label:"Client",r:v=>{const c=clients.find(x=>x.id===v);return c?<span style={DS.pill(c.color)}>{c.name}</span>:<span style={{color:"#374151"}}>—</span>;}},
        {key:"amount",label:"Amount",r:v=><span style={{color:"#34d399",fontWeight:700}}>£{v.toLocaleString()}</span>},
        {key:"status",label:"Status",r:v=><DStatusBadge status={v}/>},
              {key:"id",label:"",w:100,r:(_,r)=><div style={{display:"flex",gap:4}}>
          <button onClick={e=>{e.stopPropagation();setModal({type:"invoice",invoice:r});}} style={{padding:"3px 7px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10}}>✏️ Edit</button>
          <button onClick={e=>{e.stopPropagation();const c=allSites&&clients.find(x=>x.id===r.clientId);const s=allSites&&allSites.find(x=>x.id===r.siteId);openInvoiceWindow(r,c,s);}} title="Open in new window" style={{padding:"3px 7px",background:"1a1f2e",border:"1px solid #60a5fa",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10}}>🔗</button>
        </div>},
      ]} rows={invoices}/>
    </div>
  </div>;
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────

// ── Dashboard Payroll Page ────────────────────────────────────────────────────
function DPayroll({workers,allSites,activeDays,siteHours,weekLabel,setModal}){
  const rows=workers.map(w=>({...w,...calcPay(w,activeDays,siteHours)}));
  const tot=rows.reduce((a,r)=>({g:a.g+r.gross,t:a.t+r.tax,n:a.n+r.net}),{g:0,t:0,n:0});
  return <div>
    <DPageHdr title="💷 Payroll" sub={`WC: ${weekLabel} · ${workers.length} workers`}
      actions={<>
        <button onClick={()=>doExcel(workers,weekLabel,activeDays,siteHours,[],allSites)} style={{padding:"6px 12px",background:"linear-gradient(135deg,#059669,#10b981)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>⬇ Excel</button>
      </>}/>
    <div style={DS.body}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        <DStat label="Gross" value={"£"+tot.g.toFixed(0)} color="#34d399"/>
        <DStat label="Tax" value={"£"+tot.t.toFixed(0)} color="#f87171"/>
        <DStat label="Net Pay" value={"£"+tot.n.toFixed(0)} color="#a78bfa"/>
      </div>
      <DTable cols={[
        {key:"name",label:"Worker",w:180,r:(v,r)=><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:6,background:(r.color||"#3b82f6")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:r.color||"#3b82f6"}}>{v[0]}</div><div><div style={{fontWeight:600,color:"#f1f5f9"}}>{v}</div><div style={{fontSize:10,color:"#64748b"}}>{r.position}</div></div></div>},
        {key:"agreedRate",label:"Rate",r:v=>v?<span style={{color:"#34d399",fontWeight:600}}>£{v}/hr</span>:<span style={{color:"#374151"}}>—</span>},
        {key:"stdH",label:"Std h",r:v=><span style={{color:"#60a5fa",fontWeight:600}}>{v}h</span>},
        {key:"otH",label:"OT h",r:v=>v>0?<span style={{color:"#fbbf24",fontWeight:600}}>{v}h</span>:<span style={{color:"#374151"}}>—</span>},
        {key:"gross",label:"Gross",r:v=><span style={{color:"#34d399",fontWeight:700}}>£{v.toFixed(2)}</span>},
        {key:"tax",label:"Tax",r:v=><span style={{color:"#f87171"}}>£{v.toFixed(2)}</span>},
        {key:"net",label:"Net Pay",r:v=><span style={{color:"#a78bfa",fontWeight:800,fontSize:13}}>£{v.toFixed(2)}</span>},
        {key:"id",label:"Actions",r:(_,r)=><div style={{display:"flex",gap:5}}>
          <button onClick={()=>exportPayslip(r,activeDays,weekLabel,siteHours)} style={{padding:"4px 8px",background:"#0d2218",border:"1px solid #10b981",borderRadius:5,color:"#34d399",cursor:"pointer",fontSize:10,fontWeight:700}}>💷 Payslip</button>
          <button onClick={()=>openWorkerWindow(r,allSites,weekLabel,activeDays,siteHours)} style={{padding:"4px 8px",background:"#1a1f2e",border:"1px solid #60a5fa",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:10}}>🔗</button>
        </div>},
      ]} rows={rows}/>
    </div>
  </div>;
}

// ── Dashboard Stats Page ──────────────────────────────────────────────────────
function DStats({workers,allSites,activeDays}){
  const siteMap={};
  workers.forEach(w=>activeDays.forEach(d=>{const s=(w.days?.[d]||"").trim();if(s&&!isOff(s))siteMap[s]=(siteMap[s]||0)+1;}));
  return <div>
    <DPageHdr title="🔢 Stats" sub="Workers per site · Certificate compliance"/>
    <div style={DS.body}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:12}}>Workers per Site This Week</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {Object.entries(siteMap).sort((a,b)=>b[1]-a[1]).map(([site,cnt])=>(
            <div key={site} style={{background:"#1a1f2e",border:`1px solid ${getSiteColor(site,allSites)}`,borderRadius:10,padding:"10px 14px"}}>
              <div style={{fontSize:11,color:getSiteColor(site,allSites),fontWeight:700}}>{site}</div>
              <div style={{fontSize:22,fontWeight:900,color:"#f1f5f9"}}>{cnt}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",marginBottom:12}}>Certificate Compliance</div>
      {CERTS.slice(0,14).map(c=>{const held=workers.filter(w=>w.certs?.[c.key]?.held).length;const pct=workers.length>0?Math.round((held/workers.length)*100):0;return <div key={c.key} style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8",marginBottom:3}}><span>{c.label}</span><span style={{color:pct>50?"#34d399":"#64748b"}}>{held}/{workers.length} ({pct}%)</span></div>
        <div style={{height:5,background:"#1e2535",borderRadius:3}}><div style={{height:"100%",borderRadius:3,background:pct>70?"#34d399":pct>30?"#fbbf24":"#f87171",width:`${pct}%`,transition:"width 0.4s"}}/></div>
      </div>;})}
    </div>
  </div>;
}

// ── Dashboard Bank Import Page ────────────────────────────────────────────────
function DBank({allSites,clients,setModal}){
  return <div>
    <DPageHdr title="🏦 Bank" sub="Import bank statement and categorise transactions"/>
    <div style={DS.body}>
      <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:12,padding:32,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:14}}>🏦</div>
        <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>Bank Import & Categorisation</div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:20,lineHeight:1.6}}>Upload your bank Excel or CSV · categorise each transaction as income or expense · allocate to sites and clients</div>
        <button onClick={()=>setModal({type:"bank"})} style={{padding:"10px 24px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700}}>📂 Open Bank Import Tool</button>
      </div>
    </div>
  </div>;
}

// ── Dashboard Budget Page ─────────────────────────────────────────────────────
function DBudget({workers,clients,allSites,activeDays,siteHours,scopeData,setModal}){
  return <div>
    <DPageHdr title="📐 Budget" sub="Site budgets, scopes and financial overview"/>
    <div style={DS.body}>
      {allSites.filter(s=>!isOff(s.name)).map(site=>{
        const sc=(site.scopes||[]);const vr=(site.variations||[]);
        const scopeT=sc.reduce((a,s)=>a+(s.qty*s.rate),0);
        const varT=vr.reduce((a,v)=>a+(v.type==="addition"?v.value:-v.value),0);
        let labourT=0;workers.forEach(w=>{const{bd}=calcPay(w,activeDays,siteHours);Object.values(bd).forEach(b=>{if(b.site===site.name||b.site.includes(site.name))labourT+=b.gross;});});
        const profit=scopeT+varT-labourT;
        const client=clients.find(c=>c.id===site.clientId);
        return <div key={site.id} style={{background:"#111827",border:`1px solid ${site.color}33`,borderRadius:10,padding:"13px 16px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:site.color,flexShrink:0}}/>
            <span style={{fontWeight:700,color:site.color,fontSize:14,flex:1}}>{site.name}</span>
            {client&&<span style={DS.pill(client.color)}>{client.name}</span>}
            <button onClick={()=>setModal({type:"siteDetail",site})} style={{padding:"4px 10px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:11}}>✏️ Edit</button>
            <button onClick={()=>openSiteWindow(site,clients,workers,activeDays,siteHours)} style={{padding:"4px 10px",background:"#1a1f2e",border:"1px solid #60a5fa",borderRadius:5,color:"#60a5fa",cursor:"pointer",fontSize:11}}>🔗 Open</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {[["Scope",`£${scopeT.toLocaleString()}`,"#60a5fa"],["Variations",(varT>=0?"+":"")+"£"+Math.abs(varT).toLocaleString(),"#fbbf24"],["Contract","£"+(scopeT+varT).toLocaleString(),"#34d399"],["Labour","£"+labourT.toFixed(0),"#f87171"],[profit>=0?"Profit":"Loss","£"+Math.abs(profit).toFixed(0),profit>=0?"#34d399":"#f87171"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#0f1421",borderRadius:7,padding:"7px 9px"}}>
                <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase",fontWeight:700}}>{l}</div>
                <div style={{fontSize:14,fontWeight:800,color:c,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ── Dashboard Finance Page ────────────────────────────────────────────────────  
function DFinance({workers,clients,allSites,activeDays,siteHours,scopeData,invoices}){
  return <div>
    <DPageHdr title="📊 Finance" sub="Full financial overview — mirroring the Schedule Finance tab"/>
    <div style={DS.body}>
      <FinancialDashboard workers={workers} clients={clients} allSites={allSites} activeDays={activeDays} siteHours={siteHours} scopeData={scopeData} invoices={invoices}/>
    </div>
  </div>;
}



// ═══════════════════════════════════════════════════════════════════════════
// TIMESHEETS — individual records, saved per worker per week
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// TIMESHEETS — auto-generated from schedule, week-locked, finance approval
// ═══════════════════════════════════════════════════════════════════════════
function DTimesheets({workers,allSites,activeDays,siteHours,weekLabel,timesheetRecords,setTimesheetRecords,generateTimesheets,generatePayslips,payslipRecords,setPayslipRecords,setPage}){
  const [selWeek,setSelWeek]=useState(weekLabel);
  const [editId,setEditId]=useState(null);

  // Auto-sync current week timesheets from schedule whenever weekLabel or workers change
  useEffect(()=>{
    if(!workers||workers.length===0) return;
    const already=timesheetRecords.some(t=>t.weekLabel===weekLabel&&t.source==="auto");
    if(already) return; // don't overwrite if already generated
    const sheets=buildSheets(weekLabel,workers,activeDays,siteHours);
    if(sheets.length===0) return;
    setTimesheetRecords(prev=>{
      const other=prev.filter(t=>t.weekLabel!==weekLabel);
      return [...other,...sheets];
    });
  },[weekLabel,workers.length]);

  function buildSheets(wkLabel,wkrs,days,shrs){
    return wkrs.map(w=>{
      const dayBreakdown={};
      let stdH=0,otH=0,gross=0;
      (days||BASE_DAYS).forEach(d=>{
        const site=(w.days?.[d]||"").trim();
        if(!site||isOff(site)) return;
        const hrs=shrs?.[site]?.hours||w.hoursPerDay?.[d]||9;
        const ot=w.overtimeHours?.[d]||0;
        const rate=w.agreedRate||0;
        const otM=w.customOTRate||(w.overtimeMultiplier||1.5);
        const stdPay=hrs*rate, otPay=ot*rate*otM;
        stdH+=hrs; otH+=ot; gross+=stdPay+otPay;
        dayBreakdown[d]={site,hours:hrs,ot,stdPay,otPay,total:stdPay+otPay};
      });
      const tax=gross*(w.taxRate||0);
      return {
        id:"ts_"+w.id+"_"+wkLabel.replace(/\s+/g,""),
        workerId:w.id, workerName:w.name, position:w.position,
        company:w.company||"", weekLabel:wkLabel,
        stdHours:stdH, otHours:otH,
        rate:w.agreedRate||0, taxRate:w.taxRate||0,
        gross, tax, net:gross-tax,
        dayBreakdown, days:JSON.parse(JSON.stringify(w.days||{})),
        status:"draft",     // draft → submitted → approved → payslip_generated
        source:"auto", notes:"",
        lockedAt:null, approvedAt:null, approvedBy:"",
        createdAt:new Date().toISOString(),
      };
    }).filter(t=>t.stdHours>0||t.otHours>0);
  }

  // Recalculate a single timesheet from its day data
  function recalcSheet(t,w){
    let stdH=0,otH=0,gross=0;
    const bd={};
    (activeDays||BASE_DAYS).forEach(d=>{
      const site=(t.days?.[d]||"").trim();
      if(!site||isOff(site)) return;
      const hrs=t.dayBreakdown?.[d]?.hours||9;
      const ot=t.dayBreakdown?.[d]?.ot||0;
      const rate=t.rate||0;
      const otM=w?.customOTRate||(w?.overtimeMultiplier||1.5);
      const stdPay=hrs*rate, otPay=ot*rate*otM;
      stdH+=hrs; otH+=ot; gross+=stdPay+otPay;
      bd[d]={site,hours:hrs,ot,stdPay,otPay,total:stdPay+otPay};
    });
    const tax=gross*(t.taxRate||0);
    return {...t,stdHours:stdH,otHours:otH,gross,tax,net:gross-tax,dayBreakdown:bd};
  }

  function regenWeek(){
    if(!window.confirm("Re-sync WC "+weekLabel+" timesheets from current schedule data?\n\nThis will update DRAFT timesheets only. Approved timesheets are unchanged.")) return;
    const sheets=buildSheets(weekLabel,workers,activeDays,siteHours);
    setTimesheetRecords(prev=>{
      const other=prev.filter(t=>t.weekLabel!==weekLabel);
      const approved=prev.filter(t=>t.weekLabel===weekLabel&&t.status==="approved");
      const approvedIds=new Set(approved.map(t=>t.workerId));
      const merged=sheets.map(s=>approvedIds.has(s.workerId)?approved.find(a=>a.workerId===s.workerId):s);
      return [...other,...merged];
    });
  }

  function lockWeek(){
    if(!window.confirm("Lock WC "+selWeek+" and submit all timesheets for finance approval?\n\nThis action cannot be undone.")) return;
    setTimesheetRecords(prev=>prev.map(t=>
      t.weekLabel===selWeek&&t.status==="draft"
        ?{...t,status:"submitted",lockedAt:new Date().toISOString()}:t
    ));
  }

  function approveSheet(id){
    setTimesheetRecords(prev=>prev.map(t=>
      t.id===id?{...t,status:"approved",approvedAt:new Date().toISOString(),approvedBy:"Finance"}:t
    ));
  }
  function approveAll(){
    setTimesheetRecords(prev=>prev.map(t=>
      t.weekLabel===selWeek&&t.status==="submitted"
        ?{...t,status:"approved",approvedAt:new Date().toISOString(),approvedBy:"Finance"}:t
    ));
  }

  function updateDay(tsId,day,key,val){
    setTimesheetRecords(prev=>prev.map(t=>{
      if(t.id!==tsId) return t;
      const w=workers.find(x=>x.id===t.workerId);
      const newBd={...t.dayBreakdown,[day]:{...(t.dayBreakdown?.[day]||{}),[key]:Number(val)||0}};
      return recalcSheet({...t,dayBreakdown:newBd},w);
    }));
  }

  function createPayslips(){
    const approved=shown.filter(t=>t.status==="approved");
    if(approved.length===0){alert("No approved timesheets for this week.");return;}
    const existing=payslipRecords.filter(p=>p.weekLabel!==selWeek);
    const newPays=approved.map(t=>({
      id:"ps_"+t.workerId+"_"+selWeek.replace(/\s+/g,""),
      workerId:t.workerId, workerName:t.workerName,
      position:t.position, company:t.company||"",
      weekLabel:t.weekLabel, stdHours:t.stdHours, otHours:t.otHours,
      rate:t.rate, taxRate:t.taxRate, gross:t.gross, tax:t.tax, net:t.net,
      dayBreakdown:t.dayBreakdown, days:t.days,
      status:"pending",   // pending → issued
      timesheetId:t.id,
      approvedAt:t.approvedAt, approvedBy:t.approvedBy,
      issuedAt:null, createdAt:new Date().toISOString(),
    }));
    setPayslipRecords([...existing,...newPays]);
    // Mark timesheets as payslip generated
    setTimesheetRecords(prev=>prev.map(t=>approved.find(a=>a.id===t.id)?{...t,status:"payslip_generated"}:t));
    alert("✓ "+newPays.length+" payslips created for WC "+selWeek);
    setPage("payslips");
  }

  const allWeeks=[...new Set(timesheetRecords.map(t=>t.weekLabel))].sort((a,b)=>new Date(b)-new Date(a));
  if(!allWeeks.includes(weekLabel)) allWeeks.unshift(weekLabel);
  const shown=timesheetRecords.filter(t=>t.weekLabel===selWeek);
  const totGross=shown.reduce((a,t)=>a+t.gross,0);
  const totStd=shown.reduce((a,t)=>a+t.stdHours,0);
  const totOT=shown.reduce((a,t)=>a+t.otHours,0);

  // Week status
  const wkStatus=shown.length===0?"empty":
    shown.every(t=>t.status==="payslip_generated")?"payslip_generated":
    shown.every(t=>t.status==="approved"||(t.status==="payslip_generated"))?"approved":
    shown.some(t=>t.status==="submitted")?"submitted":"draft";

  const STATUS_STYLE={
    draft:   {color:"#64748b",bg:"#1e2535",border:"#2d3555",label:"Draft"},
    submitted:{color:"#fbbf24",bg:"#1a1500",border:"#92400e",label:"Submitted"},
    approved: {color:"#34d399",bg:"#0d2218",border:"#065f46",label:"Approved"},
    payslip_generated:{color:"#a78bfa",bg:"#1a0d2e",border:"#5b21b6",label:"Payslip Issued"},
  };

  return <div>
    <DPageHdr title="⏱ Timesheets" sub="Auto-generated from labour schedule · approve for payroll"
      actions={<div style={{display:"flex",gap:7,alignItems:"center"}}>
        {selWeek===weekLabel&&<button onClick={regenWeek} style={{padding:"6px 13px",background:"#1e2535",border:"1px solid #3b82f6",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:12,fontWeight:700}}>🔄 Re-sync from Schedule</button>}
        {wkStatus==="draft"&&shown.length>0&&<button onClick={lockWeek} style={{padding:"6px 13px",background:"#2d2008",border:"1px solid #f59e0b",borderRadius:7,color:"#fbbf24",cursor:"pointer",fontSize:12,fontWeight:700}}>🔒 Submit for Approval</button>}
        {wkStatus==="submitted"&&<button onClick={approveAll} style={{padding:"6px 13px",background:"#0d2218",border:"1px solid #10b981",borderRadius:7,color:"#34d399",cursor:"pointer",fontSize:12,fontWeight:700}}>✓ Approve All</button>}
        {wkStatus==="approved"&&<button onClick={createPayslips} style={{padding:"6px 13px",background:"linear-gradient(135deg,#7c3aed,#8b5cf6)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>💷 Create Payslips →</button>}
      </div>}/>

    <div style={DS.body}>
      {/* Workflow banner */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:18,background:"#111827",border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
        {[
          ["1","Auto-generate","Schedule → Timesheets","draft","#64748b"],
          ["2","Finance Review","Check hours & pay","submitted","#fbbf24"],
          ["3","Approve","Finance signs off","approved","#34d399"],
          ["4","Issue Payslips","Sent to workers","payslip_generated","#a78bfa"],
        ].map(([n,label,sub,st,c],i,arr)=>{
          const active=wkStatus===st;
          const past=["draft","submitted","approved","payslip_generated"].indexOf(wkStatus)>i;
          return <div key={n} style={{flex:1,padding:"11px 14px",background:active?c+"18":past?c+"08":"transparent",borderRight:i<arr.length-1?"1px solid #1e2535":"none",textAlign:"center"}}>
            <div style={{width:24,height:24,borderRadius:6,background:active?c:past?c+"33":"#1e2535",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 5px",fontSize:11,fontWeight:800,color:active?"#fff":past?c:"#374151"}}>{past?"✓":n}</div>
            <div style={{fontSize:11,fontWeight:700,color:active?c:past?c:'"#374151"'}}>{label}</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{sub}</div>
          </div>;
        })}
      </div>

      {/* Week selector */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,color:"#64748b",fontWeight:700,marginRight:4}}>Week:</span>
        {allWeeks.map(wk=>{
          const wkRecs=timesheetRecords.filter(t=>t.weekLabel===wk);
          const wkSt=wkRecs.length===0?"empty":wkRecs.every(t=>t.status==="payslip_generated")?"payslip_generated":wkRecs.every(t=>t.status==="approved"||(t.status==="payslip_generated"))?"approved":wkRecs.some(t=>t.status==="submitted")?"submitted":"draft";
          const sc=STATUS_STYLE[wkSt]||STATUS_STYLE.draft;
          return <button key={wk} onClick={()=>setSelWeek(wk)}
            style={{padding:"5px 12px",background:selWeek===wk?"#1e3a5f":"#1a1f2e",border:"1px solid "+(selWeek===wk?"#3b82f6":"#2d3555"),borderRadius:7,color:selWeek===wk?"#60a5fa":"#64748b",cursor:"pointer",fontSize:11,fontWeight:selWeek===wk?700:400,display:"flex",alignItems:"center",gap:5}}>
            WC {wk}
            {wkRecs.length>0&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:sc.bg,color:sc.color,border:"1px solid "+sc.border,fontWeight:700}}>{sc.label}</span>}
          </button>;
        })}
      </div>

      {/* Empty state */}
      {shown.length===0&&<div style={{textAlign:"center",padding:48,border:"1px dashed #1e2535",borderRadius:12}}>
        <div style={{fontSize:32,marginBottom:12}}>⏱</div>
        <div style={{fontSize:15,fontWeight:700,color:"#94a3b8",marginBottom:6}}>No timesheets for WC {selWeek}</div>
        <div style={{fontSize:12,color:"#374151",marginBottom:16}}>Timesheets are auto-generated as soon as workers are assigned to sites in the Labour Schedule.</div>
        {selWeek===weekLabel&&<button onClick={regenWeek} style={{padding:"8px 18px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>⚡ Generate Now from Current Schedule</button>}
      </div>}

      {shown.length>0&&<>
        {/* Summary cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
          <DStat label="Operatives" value={shown.length} color="#60a5fa"/>
          <DStat label="Std Hours" value={totStd+"h"} color="#34d399"/>
          <DStat label="OT Hours" value={totOT>0?totOT+"h":"—"} color="#fbbf24"/>
          <DStat label="Gross Pay" value={"£"+totGross.toFixed(0)} color="#a78bfa"/>
          <DStat label="Week Status" value={(STATUS_STYLE[wkStatus]||STATUS_STYLE.draft).label} color={(STATUS_STYLE[wkStatus]||STATUS_STYLE.draft).color}/>
        </div>

        {/* Main table */}
        <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <th style={DS.th}>Worker</th>
              <th style={DS.th}>Position</th>
              {(activeDays||BASE_DAYS).map(d=><th key={d} style={{...DS.th,textAlign:"center",color:d==="Sat"||d==="Sun"?"#fbbf24":"#64748b"}}>{d}</th>)}
              <th style={DS.th}>Std h</th>
              <th style={DS.th}>OT h</th>
              <th style={DS.th}>Rate</th>
              <th style={DS.th}>Gross</th>
              <th style={DS.th}>Tax</th>
              <th style={DS.th}>Net</th>
              <th style={DS.th}>Status</th>
              <th style={DS.th}>Actions</th>
            </tr></thead>
            <tbody>
              {shown.map((t,i)=>{
                const st=STATUS_STYLE[t.status]||STATUS_STYLE.draft;
                const isEditing=editId===t.id;
                const canEdit=t.status==="draft";
                return <tr key={t.id} style={{background:i%2===0?"#111827":"#0f1421"}}>
                  <td style={{...DS.td,fontWeight:600,color:"#f1f5f9"}}>
                    {t.workerName}
                    <div style={{fontSize:9,color:"#64748b"}}>{t.company}</div>
                  </td>
                  <td style={{...DS.td,color:"#94a3b8",fontSize:11}}>{t.position}</td>
                  {(activeDays||BASE_DAYS).map(d=>{
                    const bd=t.dayBreakdown?.[d];
                    const site=t.days?.[d]||"";
                    const sc=getSiteColor(site,allSites);
                    return <td key={d} style={{...DS.td,textAlign:"center",padding:"4px 3px"}}>
                      {bd?<div>
                        <div style={{display:"inline-block",padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,color:"#fff",background:sc,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={bd.site}>{bd.site.split("-")[0].trim()}</div>
                        {isEditing&&canEdit?<div style={{display:"flex",gap:1,marginTop:2,justifyContent:"center"}}>
                          <input type="number" value={bd.hours||0} onChange={e=>updateDay(t.id,d,"hours",e.target.value)} style={{width:28,background:"#0f1421",border:"1px solid #2d3555",borderRadius:3,padding:"1px 2px",color:"#34d399",fontSize:9,textAlign:"center",outline:"none"}} title="Std hrs"/>
                          <span style={{fontSize:9,color:"#374151"}}>+</span>
                          <input type="number" value={bd.ot||0} onChange={e=>updateDay(t.id,d,"ot",e.target.value)} style={{width:24,background:"#0f1421",border:"1px solid #2d3555",borderRadius:3,padding:"1px 2px",color:"#fbbf24",fontSize:9,textAlign:"center",outline:"none"}} title="OT hrs"/>
                        </div>:<div style={{fontSize:9,color:"#64748b",marginTop:1}}>{bd.hours}h{bd.ot>0?<span style={{color:"#fbbf24"}}>+{bd.ot}</span>:""}</div>}
                      </div>:<span style={{color:"#2d3555",fontSize:10}}>—</span>}
                    </td>;
                  })}
                  <td style={{...DS.td,color:"#34d399",fontWeight:700,textAlign:"center"}}>{t.stdHours}h</td>
                  <td style={{...DS.td,color:"#fbbf24",fontWeight:700,textAlign:"center"}}>{t.otHours>0?t.otHours+"h":"—"}</td>
                  <td style={{...DS.td,color:"#34d399"}}>{t.rate?`£${t.rate}/hr`:"—"}</td>
                  <td style={{...DS.td,color:"#34d399",fontWeight:700}}>£{t.gross.toFixed(2)}</td>
                  <td style={{...DS.td,color:"#f87171",fontSize:11}}>£{t.tax.toFixed(2)}</td>
                  <td style={{...DS.td,color:"#a78bfa",fontWeight:800}}>£{t.net.toFixed(2)}</td>
                  <td style={DS.td}>
                    <span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,color:st.color,background:st.bg,border:"1px solid "+st.border,whiteSpace:"nowrap"}}>{st.label}</span>
                  </td>
                  <td style={DS.td}>
                    <div style={{display:"flex",gap:3,flexWrap:"nowrap"}}>
                      {canEdit&&<button onClick={()=>setEditId(isEditing?null:t.id)}
                        style={{padding:"3px 7px",background:isEditing?"#1e3a5f":"#1a1f2e",border:"1px solid "+(isEditing?"#3b82f6":"#2d3555"),borderRadius:4,color:isEditing?"#60a5fa":"#64748b",cursor:"pointer",fontSize:10}}>
                        {isEditing?"✓":"Edit"}
                      </button>}
                      {t.status==="submitted"&&<button onClick={()=>approveSheet(t.id)}
                        style={{padding:"3px 7px",background:"#0d2218",border:"1px solid #10b981",borderRadius:4,color:"#34d399",cursor:"pointer",fontSize:10,fontWeight:700}}>✓ Approve</button>}
                      <button onClick={()=>exportPayslip({id:t.workerId,name:t.workerName,position:t.position,agreedRate:t.rate,taxRate:t.taxRate,overtimeMultiplier:1.5,customOTRate:null,days:t.days||{},overtimeHours:{},hoursPerDay:{}},activeDays,t.weekLabel,siteHours||{})}
                        style={{padding:"3px 6px",background:"#0d2218",border:"1px solid #10b981",borderRadius:4,color:"#34d399",cursor:"pointer",fontSize:10}}>💷</button>
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
            <tfoot><tr style={{background:"#0d1117",borderTop:"2px solid #2d3555"}}>
              <td colSpan={2+(activeDays||BASE_DAYS).length} style={{...DS.td,fontWeight:700,color:"#94a3b8"}}>TOTALS — {shown.length} operatives</td>
              <td style={{...DS.td,color:"#34d399",fontWeight:800,textAlign:"center"}}>{totStd}h</td>
              <td style={{...DS.td,color:"#fbbf24",fontWeight:800,textAlign:"center"}}>{totOT>0?totOT+"h":"—"}</td>
              <td style={DS.td}/>
              <td style={{...DS.td,color:"#34d399",fontWeight:800}}>£{totGross.toFixed(2)}</td>
              <td style={{...DS.td,color:"#f87171",fontWeight:700}}>£{shown.reduce((a,t)=>a+t.tax,0).toFixed(2)}</td>
              <td style={{...DS.td,color:"#a78bfa",fontWeight:900,fontSize:13}}>£{shown.reduce((a,t)=>a+t.net,0).toFixed(2)}</td>
              <td colSpan={2} style={DS.td}/>
            </tr></tfoot>
          </table>
        </div>
      </>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYSLIPS — created from approved timesheets, issued to worker portal
// ═══════════════════════════════════════════════════════════════════════════
function DPayslips({workers,allSites,activeDays,siteHours,weekLabel,payslipRecords,setPayslipRecords,timesheetRecords,generatePayslips,setPage}){
  const allWeeks=[...new Set(payslipRecords.map(p=>p.weekLabel))].sort((a,b)=>new Date(b)-new Date(a));
  const [selWeek,setSelWeek]=useState(payslipRecords[0]?.weekLabel||weekLabel);
  const [viewPayslip,setViewPayslip]=useState(null);
  const shown=payslipRecords.filter(p=>p.weekLabel===selWeek);
  const totGross=shown.reduce((a,p)=>a+p.gross,0);
  const totNet=shown.reduce((a,p)=>a+p.net,0);
  const totTax=shown.reduce((a,p)=>a+p.tax,0);

  function issueAll(){
    if(!window.confirm("Mark all payslips for WC "+selWeek+" as issued to workers?\n\nThis simulates sending to the worker portal.")) return;
    setPayslipRecords(recs=>recs.map(p=>
      p.weekLabel===selWeek&&p.status==="pending"
        ?{...p,status:"issued",issuedAt:new Date().toISOString()}:p
    ));
    alert("✓ "+shown.filter(p=>p.status==="pending").length+" payslips marked as issued.");
  }

  function issueOne(id){
    setPayslipRecords(recs=>recs.map(p=>
      p.id===id?{...p,status:"issued",issuedAt:new Date().toISOString()}:p
    ));
  }

  // Worker Portal preview - opens a printable payslip with portal styling
  function openPortal(p){
    const w=workers.find(x=>x.id===p.workerId)||{name:p.workerName,position:p.position,agreedRate:p.rate,taxRate:p.taxRate,days:p.days||{},overtimeHours:{},hoursPerDay:{},overtimeMultiplier:1.5,customOTRate:null};
    exportPayslip(w,activeDays,p.weekLabel,siteHours||{});
  }

  const allPending=shown.filter(p=>p.status==="pending").length;

  return <div>
    <DPageHdr title="💷 Payroll & Payslips" sub={"Total issued: "+payslipRecords.filter(p=>p.status==="issued").length+" · Pending: "+payslipRecords.filter(p=>p.status==="pending").length}
      actions={<div style={{display:"flex",gap:7}}>
        {allPending>0&&<button onClick={issueAll} style={{padding:"6px 13px",background:"linear-gradient(135deg,#059669,#10b981)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>📤 Issue All to Workers ({allPending})</button>}
      </div>}/>

    <div style={DS.body}>
      {/* Workflow reminder */}
      <div style={{background:"#0c1a0c",border:"1px solid #065f46",borderRadius:9,padding:"10px 16px",marginBottom:16,fontSize:11,color:"#34d399",display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:16}}>ℹ️</span>
        <span><strong>Payslip workflow:</strong> Timesheets are auto-generated → approved by finance → payslips created automatically → issued to worker portal. Go to <span onClick={()=>setPage("timesheets")} style={{color:"#60a5fa",cursor:"pointer",textDecoration:"underline"}}>Timesheets</span> to manage approval.</span>
      </div>

      {/* Week tabs */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,color:"#64748b",fontWeight:700}}>Week:</span>
        {payslipRecords.length===0&&<span style={{color:"#374151",fontSize:12}}>No payslips yet — approve timesheets first.</span>}
        {allWeeks.map(wk=>{
          const wkP=payslipRecords.filter(p=>p.weekLabel===wk);
          const allIssued=wkP.length>0&&wkP.every(p=>p.status==="issued");
          return <button key={wk} onClick={()=>setSelWeek(wk)}
            style={{padding:"5px 12px",background:selWeek===wk?"#1e3a5f":"#1a1f2e",border:"1px solid "+(selWeek===wk?"#3b82f6":"#2d3555"),borderRadius:7,color:selWeek===wk?"#60a5fa":"#64748b",cursor:"pointer",fontSize:11,fontWeight:selWeek===wk?700:400,display:"flex",alignItems:"center",gap:5}}>
            WC {wk}
            <span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:allIssued?"#0d2218":"#1a1500",color:allIssued?"#34d399":"#fbbf24",border:"1px solid "+(allIssued?"#065f46":"#92400e"),fontWeight:700}}>
              {allIssued?"✓ Issued":wkP.filter(p=>p.status==="pending").length+" pending"}
            </span>
          </button>;
        })}
      </div>

      {shown.length===0&&selWeek&&<div style={{textAlign:"center",padding:48,border:"1px dashed #1e2535",borderRadius:12}}>
        <div style={{fontSize:32,marginBottom:12}}>💷</div>
        <div style={{fontSize:15,fontWeight:700,color:"#94a3b8",marginBottom:6}}>No payslips for WC {selWeek}</div>
        <div style={{fontSize:12,color:"#374151",marginBottom:14}}>Approve timesheets for this week to generate payslips automatically.</div>
        <button onClick={()=>setPage("timesheets")} style={{padding:"8px 18px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>⏱ Go to Timesheets →</button>
      </div>}

      {shown.length>0&&<>
        {/* Summary */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
          <DStat label="Payslips" value={shown.length} color="#60a5fa"/>
          <DStat label="Gross Pay" value={"£"+totGross.toFixed(0)} color="#34d399"/>
          <DStat label="Tax" value={"£"+totTax.toFixed(0)} color="#f87171"/>
          <DStat label="Net Pay" value={"£"+totNet.toFixed(0)} color="#a78bfa"/>
          <DStat label="Issued" value={shown.filter(p=>p.status==="issued").length+"/"+shown.length} color={shown.every(p=>p.status==="issued")?"#34d399":"#fbbf24"}/>
        </div>

        {/* Payslip cards grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:20}}>
          {shown.map(p=>{
            const issued=p.status==="issued";
            const w=workers.find(x=>x.id===p.workerId);
            const initials=(p.workerName||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
            const color=w?.color||"#3b82f6";
            return <div key={p.id} style={{background:"linear-gradient(145deg,#141924,#1a2035)",border:"1px solid "+(issued?"#065f4666":"#1e2535"),borderRadius:12,padding:16,position:"relative",overflow:"hidden"}}>
              {/* Issued banner */}
              {issued&&<div style={{position:"absolute",top:10,right:-20,background:"#059669",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 24px",transform:"rotate(30deg)",letterSpacing:"0.08em"}}>ISSUED</div>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:color+"22",border:"1px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color,flexShrink:0}}>{initials}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#f1f5f9",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.workerName}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{p.position} · {p.company}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
                {[["Gross","£"+p.gross.toFixed(0),"#34d399"],["Tax","-£"+p.tax.toFixed(0),"#f87171"],["Net","£"+p.net.toFixed(0),"#a78bfa"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"#0f1421",borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:c,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:"#64748b",marginBottom:10,display:"flex",gap:8}}>
                <span>⏱ {p.stdHours}h std</span>
                {p.otHours>0&&<span style={{color:"#fbbf24"}}>+{p.otHours}h OT</span>}
                <span>£{p.rate||0}/hr</span>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>openPortal(p)} style={{flex:1,padding:"6px 0",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:6,color:"#60a5fa",cursor:"pointer",fontSize:11,fontWeight:700}}>💷 View Payslip</button>
                {!issued&&<button onClick={()=>issueOne(p.id)} style={{flex:1,padding:"6px 0",background:"#0d2218",border:"1px solid #10b981",borderRadius:6,color:"#34d399",cursor:"pointer",fontSize:11,fontWeight:700}}>📤 Issue</button>}
                {issued&&<div style={{flex:1,padding:"6px 0",textAlign:"center",fontSize:10,color:"#34d399",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>✓ {p.issuedAt?new Date(p.issuedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}):""}</div>}
              </div>
              {issued&&p.issuedAt&&<div style={{marginTop:6,fontSize:9,color:"#374151",textAlign:"center"}}>Issued {new Date(p.issuedAt).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>}
            </div>;
          })}
        </div>

        {/* Payslip table */}
        <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:"#0d1117",fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid #1e2535"}}>Payroll Summary Table</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <th style={DS.th}>Worker</th><th style={DS.th}>WC</th>
              <th style={DS.th}>Std h</th><th style={DS.th}>OT h</th>
              <th style={DS.th}>Rate</th><th style={DS.th}>Gross</th>
              <th style={DS.th}>Tax</th><th style={DS.th}>Net Pay</th>
              <th style={DS.th}>Status</th><th style={DS.th}>Actions</th>
            </tr></thead>
            <tbody>{shown.map((p,i)=>(
              <tr key={p.id} style={{background:i%2===0?"#111827":"#0f1421"}}>
                <td style={{...DS.td,fontWeight:600,color:"#f1f5f9"}}>{p.workerName}<div style={{fontSize:10,color:"#64748b"}}>{p.position}</div></td>
                <td style={{...DS.td,color:"#94a3b8",fontSize:11}}>{p.weekLabel}</td>
                <td style={{...DS.td,color:"#60a5fa",fontWeight:600,textAlign:"center"}}>{p.stdHours}h</td>
                <td style={{...DS.td,color:"#fbbf24",textAlign:"center"}}>{p.otHours>0?p.otHours+"h":"—"}</td>
                <td style={{...DS.td,color:"#34d399"}}>{p.rate?`£${p.rate}/hr`:"—"}</td>
                <td style={{...DS.td,color:"#34d399",fontWeight:700}}>£{p.gross.toFixed(2)}</td>
                <td style={{...DS.td,color:"#f87171"}}>£{p.tax.toFixed(2)}</td>
                <td style={{...DS.td,color:"#a78bfa",fontWeight:800,fontSize:13}}>£{p.net.toFixed(2)}</td>
                <td style={DS.td}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,color:p.status==="issued"?"#34d399":"#fbbf24",background:p.status==="issued"?"#0d2218":"#1a1500",border:"1px solid "+(p.status==="issued"?"#065f46":"#92400e")}}>{p.status==="issued"?"✓ Issued":"⏳ Pending"}</span></td>
                <td style={DS.td}><div style={{display:"flex",gap:4}}>
                  <button onClick={()=>openPortal(p)} style={{padding:"3px 7px",background:"#0d2218",border:"1px solid #10b981",borderRadius:4,color:"#34d399",cursor:"pointer",fontSize:10,fontWeight:700}}>💷 PDF</button>
                  {p.status==="pending"&&<button onClick={()=>issueOne(p.id)} style={{padding:"3px 7px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:4,color:"#60a5fa",cursor:"pointer",fontSize:10}}>📤</button>}
                  <button onClick={()=>setPayslipRecords(recs=>recs.filter(x=>x.id!==p.id))} style={{padding:"3px 7px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:4,color:"#f87171",cursor:"pointer",fontSize:10}}>✕</button>
                </div></td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{background:"#0d1117",borderTop:"2px solid #2d3555"}}>
              <td colSpan={4} style={{...DS.td,fontWeight:700,color:"#94a3b8"}}>TOTALS — {shown.length} payslips</td>
              <td style={DS.td}/>
              <td style={{...DS.td,color:"#34d399",fontWeight:800}}>£{totGross.toFixed(2)}</td>
              <td style={{...DS.td,color:"#f87171",fontWeight:800}}>£{totTax.toFixed(2)}</td>
              <td style={{...DS.td,color:"#a78bfa",fontWeight:900,fontSize:14}}>£{totNet.toFixed(2)}</td>
              <td colSpan={2} style={DS.td}/>
            </tr></tfoot>
          </table>
        </div>
      </>}
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════════════════
// BANK IMPORT — save transactions to system
// ═══════════════════════════════════════════════════════════════════════════
function DBankFull({allSites,clients,bankTransactions,setBankTransactions,setModal}){
  const [txns,setTxns]=useState([]);
  const [fileName,setFileName]=useState("");
  const INCOME_CATS=["Client Payment","Contract Payment","Variation Payment","Retention Release","Other Income"];
  const EXPENSE_CATS=["Materials","Plant Hire","Subcontractor","Labour (External)","Transport","Insurance","Tools & Equipment","Professional Fees","Utilities","Office","Other Expense"];

  // Convert Excel serial date number to readable string
  function excelDateToString(v){
    if(!v&&v!==0) return "";
    // If already a date string, return as-is
    if(typeof v==="string"&&v.includes("-")||typeof v==="string"&&v.includes("/")) return v;
    // Excel serial date: days since 1900-01-01
    if(typeof v==="number"&&v>1000&&v<100000){
      const d=new Date(Math.round((v-25569)*86400*1000));
      return d.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"});
    }
    return String(v||"");
  }

  const handleFile=e=>{
    const f=e.target.files[0];if(!f)return;setFileName(f.name);
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const wb=XLSX.read(ev.target.result,{type:"binary",cellDates:false});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const data=XLSX.utils.sheet_to_json(ws,{header:1,raw:true});
        // Auto-detect header row (skip empty rows at top)
        const startRow=data.findIndex(r=>r.some(c=>c!==undefined&&c!==""));
        const header=(data[startRow]||[]).map(h=>String(h||"").toLowerCase().trim());
        const dataRows=data.slice(startRow+1).filter(r=>r.some(c=>c!==undefined&&c!==""));

        // Smart column detection by header name
        let dateCol=-1,descCol=-1,amtCol=-1,creditCol=-1,debitCol=-1;
        header.forEach((h,i)=>{
          if(h.includes("date")) dateCol=i;
          if(h.includes("desc")||h.includes("narr")||h.includes("detail")||h.includes("memo")||h.includes("ref")) descCol=i;
          if(h.includes("amount")&&!h.includes("credit")&&!h.includes("debit")) amtCol=i;
          if(h.includes("credit")) creditCol=i;
          if(h.includes("debit")) debitCol=i;
        });
        // Fallback: if no header found, guess by column position
        if(dateCol===-1) dateCol=0;
        if(descCol===-1) descCol=1;
        if(amtCol===-1&&creditCol===-1) amtCol=2;

        setTxns(dataRows.map(r=>{
          const rawDate=r[dateCol];
          const desc=String(r[descCol]||r[descCol+1]||"").trim();
          let amount=0;
          if(creditCol>-1||debitCol>-1){
            // Separate credit/debit columns
            const cr=parseFloat(String(r[creditCol]||"0").replace(/[£,]/g,""))||0;
            const dr=parseFloat(String(r[debitCol]||"0").replace(/[£,]/g,""))||0;
            amount=cr>0?cr:-dr;
          } else {
            amount=parseFloat(String(r[amtCol]||"0").replace(/[£,]/g,""))||0;
          }
          return {
            id:"bt_"+Date.now()+Math.random().toString(36).slice(2),
            date:excelDateToString(rawDate),
            description:desc,
            amount:amount,
            type:amount>=0?"income":"expense",
            category:"",siteId:"",clientId:"",notes:"",saved:false,
          };
        }).filter(t=>t.description||t.amount!==0));
      }catch(err){alert("Error reading file: "+err.message+"\n\nMake sure the file has columns: Date, Description, Amount");}
    };
    reader.readAsBinaryString(f);
  };

  const upT=(id,k,v)=>setTxns(t=>t.map(x=>x.id===id?{...x,[k]:v}:x));

  function saveToSystem(){
    const toSave=txns.filter(t=>t.category);
    if(toSave.length===0){alert("Please categorise at least one transaction before saving.");return;}
    const existing=bankTransactions.filter(bt=>!txns.find(t=>t.id===bt.id));
    setBankTransactions([...existing,...txns.map(t=>({...t,saved:true}))]);
    alert(`✓ ${toSave.length} transactions saved to system.`);
  }

  function exportCat(){
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
      ["Date","Description","Amount","Type","Category","Site","Client","Notes"],
      ...txns.map(t=>[t.date,t.description,t.amount,t.type,t.category,
        allSites.find(s=>s.id===t.siteId)?.name||"",
        clients.find(c=>c.id===t.clientId)?.name||"",t.notes])
    ]),"Transactions");
    XLSX.writeFile(wb,"Bank_Categorised_"+new Date().toLocaleDateString("en-GB").replace(/\//g,"-")+".xlsx");
  }

  const saved=bankTransactions.length;
  const income=txns.filter(t=>t.type==="income").reduce((a,t)=>a+Math.abs(t.amount),0);
  const expense=txns.filter(t=>t.type==="expense").reduce((a,t)=>a+Math.abs(t.amount),0);
  const allSavedIncome=bankTransactions.filter(t=>t.type==="income").reduce((a,t)=>a+Math.abs(t.amount),0);
  const allSavedExpense=bankTransactions.filter(t=>t.type==="expense").reduce((a,t)=>a+Math.abs(t.amount),0);

  return <div>
    <DPageHdr title="🏦 Bank Import" sub={`${saved} transactions saved in system`}
      actions={<div style={{display:"flex",gap:7}}>
        {txns.length>0&&<button onClick={saveToSystem} style={{padding:"6px 13px",background:"linear-gradient(135deg,#059669,#10b981)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>💾 Save to System ({txns.filter(t=>t.category).length} categorised)</button>}
        {txns.length>0&&<button onClick={exportCat} style={{padding:"6px 13px",background:"#1a1f2e",border:"1px solid #3b82f6",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:12}}>⬇ Export Excel</button>}
      </div>}/>
    <div style={DS.body}>
      {/* Saved transactions summary */}
      {saved>0&&<div style={{background:"#0a1a0a",border:"1px solid #16a34a33",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
        <div style={{fontSize:11,color:"#34d399",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Saved in System ({saved} transactions)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          <DStat label="Total Income" value={"£"+allSavedIncome.toLocaleString()} color="#34d399"/>
          <DStat label="Total Expenses" value={"£"+allSavedExpense.toLocaleString()} color="#f87171"/>
          <DStat label="Net Position" value={"£"+(allSavedIncome-allSavedExpense).toLocaleString()} color={(allSavedIncome-allSavedExpense)>=0?"#34d399":"#f87171"}/>
        </div>
      </div>}

      {/* Import area */}
      <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:10,padding:16,marginBottom:16}}>
        <div style={{fontSize:11,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Import New Statement</div>
        <label style={{display:"block",padding:"12px 16px",background:"#1e3a5f",border:"2px dashed #3b82f6",borderRadius:8,cursor:"pointer",textAlign:"center",color:"#60a5fa",fontSize:12,fontWeight:600}}>
          📁 {fileName||"Click to upload Excel / CSV · Date | Description | Amount"}
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{display:"none"}}/>
        </label>
        {txns.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>
          <DStat label="Transactions" value={txns.length} color="#60a5fa"/>
          <DStat label="Income" value={"£"+income.toLocaleString()} color="#34d399"/>
          <DStat label="Expenses" value={"£"+expense.toLocaleString()} color="#f87171"/>
          <DStat label="Categorised" value={txns.filter(t=>t.category).length+"/"+txns.length} color="#fbbf24"/>
        </div>}
      </div>

      {txns.length>0&&<div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
        <div style={{maxHeight:480,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{position:"sticky",top:0,zIndex:1}}><tr>
              <th style={{...DS.th,minWidth:85}}>Date</th>
              <th style={{...DS.th,minWidth:180}}>Description</th>
              <th style={{...DS.th,minWidth:80}}>Amount</th>
              <th style={{...DS.th,minWidth:90}}>Type</th>
              <th style={{...DS.th,minWidth:150}}>Category</th>
              <th style={{...DS.th,minWidth:120}}>Site</th>
              <th style={{...DS.th,minWidth:110}}>Client</th>
              <th style={{...DS.th,minWidth:100}}>Notes</th>
            </tr></thead>
            <tbody>{txns.map((t,i)=>(
              <tr key={t.id} style={{background:i%2===0?"#111827":"#0f1421"}}>
                <td style={{...DS.td,color:"#94a3b8",fontSize:11}}>{t.date}</td>
                <td style={{...DS.td,maxWidth:180}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#e2e8f0",fontSize:12}} title={t.description}>{t.description}</div></td>
                <td style={{...DS.td,fontWeight:700,color:t.amount>=0?"#34d399":"#f87171",whiteSpace:"nowrap"}}>£{Math.abs(t.amount).toFixed(2)}</td>
                <td style={DS.td}><select value={t.type} onChange={e=>upT(t.id,"type",e.target.value)} style={{...{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 5px",color:t.type==="income"?"#34d399":"#f87171",fontSize:10,outline:"none"},cursor:"pointer"}}>
                  <option value="income">Income</option><option value="expense">Expense</option>
                </select></td>
                <td style={DS.td}><select value={t.category} onChange={e=>upT(t.id,"category",e.target.value)} style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 5px",color:t.category?"#e2e8f0":"#64748b",fontSize:10,outline:"none",cursor:"pointer"}}>
                  <option value="">— Category —</option>
                  <optgroup label="Income">{INCOME_CATS.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                  <optgroup label="Expenses">{EXPENSE_CATS.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                </select></td>
                <td style={DS.td}><select value={t.siteId} onChange={e=>upT(t.id,"siteId",e.target.value)} style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 5px",color:"#e2e8f0",fontSize:10,outline:"none",cursor:"pointer"}}>
                  <option value="">— Site —</option>
                  {allSites.filter(s=>!isOff(s.name)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select></td>
                <td style={DS.td}><select value={t.clientId} onChange={e=>upT(t.id,"clientId",e.target.value)} style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 5px",color:"#e2e8f0",fontSize:10,outline:"none",cursor:"pointer"}}>
                  <option value="">— Client —</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select></td>
                <td style={DS.td}><input value={t.notes} onChange={e=>upT(t.id,"notes",e.target.value)} placeholder="Notes…" style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 5px",color:"#e2e8f0",fontSize:10,outline:"none"}}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════════════════════
// EXPENSES — categorised transactions list + site cost summary
// ═══════════════════════════════════════════════════════════════════════════
const EXPENSE_CATS_LIST=["Materials","Plant Hire","Subcontractor","Labour (External)","Transport","Insurance","Tools & Equipment","Professional Fees","Utilities","Office","Other Expense"];
const INCOME_CATS_LIST=["Client Payment","Contract Payment","Variation Payment","Retention Release","Other Income"];

function DExpenses({bankTransactions,allSites,clients,workers,activeDays,siteHours,setPage}){
  const [typeF,setTypeF]=useState("all");
  const [catF,setCatF]=useState("");
  const [siteF,setSiteF]=useState("");
  const [srch,setSrch]=useState("");
  const txns=bankTransactions||[];
  const shown=txns.filter(t=>{
    if(typeF!=="all"&&t.type!==typeF) return false;
    if(catF&&t.category!==catF) return false;
    if(siteF&&t.siteId!==siteF) return false;
    if(srch&&!(t.description||"").toLowerCase().includes(srch.toLowerCase())&&!(t.category||"").toLowerCase().includes(srch.toLowerCase())) return false;
    return true;
  });
  const totInc=txns.filter(t=>t.type==="income").reduce((a,t)=>a+Math.abs(t.amount),0);
  const totExp=txns.filter(t=>t.type==="expense").reduce((a,t)=>a+Math.abs(t.amount),0);
  const totShown=shown.reduce((a,t)=>a+(t.type==="income"?1:-1)*Math.abs(t.amount),0);
  // Category breakdown
  const byCat={};txns.filter(t=>t.type==="expense").forEach(t=>{const c=t.category||"Uncategorised";byCat[c]=(byCat[c]||0)+Math.abs(t.amount);});
  const catRows=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxC=catRows[0]?.[1]||1;
  // Site expense totals (bank + labour)
  const bankBySite={};txns.filter(t=>t.type==="expense"&&t.siteId).forEach(t=>{bankBySite[t.siteId]=(bankBySite[t.siteId]||0)+Math.abs(t.amount);});
  const labourBySite={};workers.forEach(w=>{const{bd}=calcPay(w,activeDays,siteHours);Object.values(bd).forEach(b=>{labourBySite[b.site]=(labourBySite[b.site]||0)+b.gross;});});
  const actSites=allSites.filter(s=>!isOff(s.name));

  return <div>
    <DPageHdr title="💸 Expenses & Costs" sub={txns.length+" transactions · £"+Math.round(totExp).toLocaleString()+" expenses"}
      actions={<button onClick={()=>setPage("bank")} style={{padding:"6px 14px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:7,color:"#60a5fa",cursor:"pointer",fontSize:12,fontWeight:700}}>🏦 Import Bank Statement</button>}/>
    <div style={DS.body}>
      {txns.length===0?<div style={{textAlign:"center",padding:60,border:"1px dashed #1e2535",borderRadius:12}}>
        <div style={{fontSize:40,marginBottom:12}}>💸</div>
        <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>No transactions yet</div>
        <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>Import your bank statement to categorise income and expenses.</div>
        <button onClick={()=>setPage("bank")} style={{padding:"9px 22px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>🏦 Import Bank Statement</button>
      </div>:<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <DStat label="Total Income" value={"£"+Math.round(totInc).toLocaleString()} color="#34d399" sub={txns.filter(t=>t.type==="income").length+" txns"}/>
        <DStat label="Total Expenses" value={"£"+Math.round(totExp).toLocaleString()} color="#f87171" sub={txns.filter(t=>t.type==="expense").length+" txns"}/>
        <DStat label="Net Position" value={"£"+Math.round(totInc-totExp).toLocaleString()} color={(totInc-totExp)>=0?"#34d399":"#f87171"} sub="Income minus expenses"/>
        <DStat label="Filtered Total" value={"£"+Math.abs(Math.round(totShown)).toLocaleString()} color="#fbbf24" sub={shown.length+" records"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
        <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
          <div style={{fontSize:11,color:"#f87171",fontWeight:700,textTransform:"uppercase",marginBottom:14}}>Expenses by Category</div>
          {catRows.length===0?<div style={{color:"#374151",fontSize:12}}>No categorised expenses yet.</div>:
          catRows.map(([cat,amt])=>(
            <div key={cat} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:11,color:"#94a3b8"}}>{cat}</span>
                <span style={{fontSize:11,color:"#f87171",fontWeight:700}}>£{Math.round(amt).toLocaleString()}</span>
              </div>
              <div style={{height:6,background:"#1e2535",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#dc2626,#f87171)",width:(amt/maxC*100)+"%"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"#111827",border:"1px solid #1e2535",borderRadius:11,padding:16}}>
          <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,textTransform:"uppercase",marginBottom:14}}>Total Cost per Site (Bank + Labour)</div>
          {actSites.map(site=>{
            const bk=bankBySite[site.id]||0;
            const lb=labourBySite[site.name]||0;
            if(bk+lb===0) return null;
            return <div key={site.id} style={{marginBottom:10,padding:"9px 11px",background:"#0f1421",borderRadius:8,border:"1px solid "+site.color+"33"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:site.color,flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:site.color,flex:1}}>{site.name}</span>
                <span style={{fontSize:14,fontWeight:800,color:"#f87171"}}>£{Math.round(bk+lb).toLocaleString()}</span>
              </div>
              <div style={{display:"flex",gap:14,fontSize:10,color:"#64748b"}}>
                {lb>0&&<span>Labour: <span style={{color:"#f87171",fontWeight:600}}>£{Math.round(lb).toLocaleString()}</span></span>}
                {bk>0&&<span>Other: <span style={{color:"#fbbf24",fontWeight:600}}>£{Math.round(bk).toLocaleString()}</span></span>}
              </div>
            </div>;
          })}
        </div>
      </div>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {[["all","All"],["income","Income"],["expense","Expense"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTypeF(v)} style={{padding:"5px 12px",background:typeF===v?"#1e3a5f":"#1a1f2e",border:"1px solid "+(typeF===v?"#3b82f6":"#2d3555"),borderRadius:7,color:typeF===v?"#60a5fa":"#64748b",cursor:"pointer",fontSize:11,fontWeight:typeF===v?700:400}}>{l}</button>
        ))}
        <select value={catF} onChange={e=>setCatF(e.target.value)} style={{background:"#1a1f2e",border:"1px solid #2d3555",borderRadius:7,padding:"5px 9px",color:catF?"#e2e8f0":"#64748b",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="">All Categories</option>
          <optgroup label="Income">{INCOME_CATS_LIST.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
          <optgroup label="Expenses">{EXPENSE_CATS_LIST.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
        </select>
        <select value={siteF} onChange={e=>setSiteF(e.target.value)} style={{background:"#1a1f2e",border:"1px solid #2d3555",borderRadius:7,padding:"5px 9px",color:siteF?"#e2e8f0":"#64748b",fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="">All Sites</option>
          {actSites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="🔍 Search…" style={{background:"#1a1f2e",border:"1px solid #2d3555",borderRadius:7,padding:"5px 9px",color:"#e2e8f0",fontSize:11,outline:"none",width:160}}/>
        {(typeF!=="all"||catF||siteF||srch)&&<button onClick={()=>{setTypeF("all");setCatF("");setSiteF("");setSrch("");}} style={{padding:"5px 9px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:7,color:"#f87171",cursor:"pointer",fontSize:11,fontWeight:700}}>✕</button>}
      </div>
      <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={{...DS.th,minWidth:80}}>Date</th>
            <th style={{...DS.th,minWidth:200}}>Description</th>
            <th style={{...DS.th,minWidth:90}}>Amount</th>
            <th style={{...DS.th,minWidth:80}}>Type</th>
            <th style={{...DS.th,minWidth:140}}>Category</th>
            <th style={{...DS.th,minWidth:110}}>Site</th>
            <th style={{...DS.th,minWidth:100}}>Client</th>
          </tr></thead>
          <tbody>
            {shown.length===0&&<tr><td colSpan={7} style={{...DS.td,textAlign:"center",color:"#374151",padding:28}}>No records match filters.</td></tr>}
            {shown.map((t,i)=>{
              const site=allSites.find(s=>s.id===t.siteId);
              const client=clients.find(c=>c.id===t.clientId);
              const inc=t.type==="income";
              return <tr key={t.id||i} style={{background:i%2===0?"#111827":"#0f1421"}}>
                <td style={{...DS.td,color:"#94a3b8",fontSize:11,whiteSpace:"nowrap"}}>{t.date}</td>
                <td style={{...DS.td,maxWidth:200}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12,color:"#e2e8f0"}} title={t.description}>{t.description||"—"}</div>{t.notes&&<div style={{fontSize:9,color:"#64748b"}}>{t.notes}</div>}</td>
                <td style={{...DS.td,fontWeight:700,color:inc?"#34d399":"#f87171",whiteSpace:"nowrap"}}>{inc?"+":"-"}£{Math.abs(t.amount).toFixed(2)}</td>
                <td style={DS.td}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,color:inc?"#34d399":"#f87171",background:inc?"#0d2218":"#2d1515"}}>{inc?"Income":"Expense"}</span></td>
                <td style={{...DS.td,fontSize:11,color:"#fbbf24"}}>{t.category||<span style={{color:"#374151"}}>—</span>}</td>
                <td style={DS.td}>{site?<span style={{padding:"1px 7px",borderRadius:4,fontSize:10,fontWeight:600,color:"#fff",background:site.color}}>{site.name.split("-")[0].trim()}</span>:<span style={{color:"#374151",fontSize:11}}>—</span>}</td>
                <td style={{...DS.td,fontSize:11,color:client?.color||"#64748b"}}>{client?.name||"—"}</td>
              </tr>;
            })}
          </tbody>
          {shown.length>0&&<tfoot><tr style={{background:"#0d1117",borderTop:"2px solid #2d3555"}}>
            <td colSpan={2} style={{...DS.td,fontWeight:700,color:"#94a3b8"}}>{shown.length} RECORDS</td>
            <td style={{...DS.td,fontWeight:800,color:totShown>=0?"#34d399":"#f87171"}}>{totShown>=0?"+":"-"}£{Math.abs(Math.round(totShown)).toLocaleString()}</td>
            <td colSpan={4} style={DS.td}/>
          </tr></tfoot>}
        </table>
      </div>
    </>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT APPLICATIONS — per site, scopes+variations+dayworks+prelims
// ═══════════════════════════════════════════════════════════════════════════
const PA_ITEM_TYPES=["Scope of Work","Variation","Dayworks","Preliminaries","Other"];
const PA_UNITS=["l/m","m²","m³","nr","kg","tonne","day","week","%","sum","hrs"];

function DPayApps({allSites,clients,workers,activeDays,siteHours,scopeData,payApplications,setPayApplications,setPage,setDetailId}){
  const [selSite,setSelSite]=useState("");
  const activeSites=allSites.filter(s=>!isOff(s.name));

  function newPayApp(){
    if(!selSite){alert("Please select a site first.");return;}
    const site=allSites.find(s=>s.id===selSite);
    if(!site){return;}
    // Build items from site scopes and variations
    const items=[
      ...(site.scopes||[]).map(sc=>({
        id:"pai_"+Date.now()+Math.random().toString(36).slice(2),
        type:"Scope of Work",description:sc.description||sc.desc||"",
        unit:sc.unit||"sum",contractQty:sc.qty||0,contractRate:sc.rate||sc.unitIncome||0,
        claimedQtyToDate:0,claimedPctToDate:0,useQty:true,previousQty:0,
      })),
      ...(site.variations||[]).map(vr=>({
        id:"pai_"+Date.now()+Math.random().toString(36).slice(2),
        type:"Variation",description:vr.description||vr.desc||"",
        unit:"sum",contractQty:1,contractRate:vr.value||0,
        claimedQtyToDate:0,claimedPctToDate:0,useQty:false,previousQty:0,
      })),
    ];
    const pa={
      id:"pa_"+Date.now(),
      siteId:selSite,siteName:site.name,
      clientId:site.clientId||"",
      number:"PA-"+(payApplications.filter(p=>p.siteId===selSite).length+1).toString().padStart(3,"0"),
      date:new Date().toISOString().slice(0,10),
      status:"draft",items,
      createdAt:new Date().toISOString(),
    };
    setPayApplications(pas=>[...pas,pa]);
    setDetailId(pa.id);
    setPage("payapp_detail");
  }

  return <div>
    <DPageHdr title="📐 Payment Applications" sub={`${payApplications.length} applications across ${[...new Set(payApplications.map(p=>p.siteId))].length} sites`}
      actions={<div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
        <div>
          <label style={{...DS.th,display:"block",marginBottom:3}}>Select Site</label>
          <select value={selSite} onChange={e=>setSelSite(e.target.value)} style={{background:"#0f1421",border:"1px solid #2d3555",borderRadius:7,padding:"6px 10px",color:"#e2e8f0",fontSize:12,outline:"none",cursor:"pointer",minWidth:200}}>
            <option value="">— Choose site —</option>
            {activeSites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button onClick={newPayApp} style={{padding:"6px 14px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ New Application</button>
      </div>}/>
    <div style={DS.body}>
      {payApplications.length===0&&<div style={{textAlign:"center",padding:"60px 24px",border:"1px dashed #1e2535",borderRadius:12}}>
        <div style={{fontSize:40,marginBottom:14}}>📐</div>
        <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>No Payment Applications Yet</div>
        <div style={{fontSize:13,color:"#64748b"}}>Select a site above and click "+ New Application" to create a payment application from the site's scopes, variations, dayworks and preliminaries.</div>
      </div>}
      {/* Group by site */}
      {activeSites.filter(s=>payApplications.some(p=>p.siteId===s.id)).map(site=>{
        const sitePAs=payApplications.filter(p=>p.siteId===site.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
        return <div key={site.id} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{width:10,height:10,borderRadius:"50%",background:site.color}}/><span style={{fontWeight:700,color:site.color,fontSize:14}}>{site.name}</span>
            <span style={{fontSize:11,color:"#64748b"}}>{sitePAs.length} application{sitePAs.length!==1?"s":""}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {sitePAs.map(pa=>{
              const total=pa.items.reduce((a,it)=>{const v=it.useQty?(it.claimedQtyToDate||0)*it.contractRate:((it.claimedPctToDate||0)/100)*(it.contractQty*it.contractRate);return a+v;},0);
              const contract=pa.items.reduce((a,it)=>a+it.contractQty*it.contractRate,0);
              return <div key={pa.id} onClick={()=>{setDetailId(pa.id);setPage("payapp_detail");}}
                style={{background:"#111827",border:"1px solid #1e2535",borderRadius:10,padding:14,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=site.color;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2535";e.currentTarget.style.transform="";}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontWeight:700,color:"#a78bfa",fontSize:13}}>{pa.number}</span>
                  <span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,color:pa.status==="submitted"?"#60a5fa":pa.status==="certified"?"#34d399":"#94a3b8",background:pa.status==="submitted"?"#0d1a2e":pa.status==="certified"?"#0d2218":"#1e2535",textTransform:"capitalize"}}>{pa.status}</span>
                </div>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>{pa.date} · {pa.items.length} items</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div style={{background:"#0f1421",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>Claimed</div><div style={{fontSize:14,fontWeight:800,color:"#34d399"}}>£{total.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
                  <div style={{background:"#0f1421",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>Contract</div><div style={{fontSize:14,fontWeight:800,color:"#60a5fa"}}>£{contract.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ── Payment Application Detail ─────────────────────────────────────────────────
function DPayAppDetail({payApplications,setPayApplications,payappId,allSites,clients,setPage}){
  const pa=payApplications.find(p=>p.id===payappId);
  const [items,setItems]=useState(pa?JSON.parse(JSON.stringify(pa.items)):[]);
  const [addType,setAddType]=useState("Dayworks");
  if(!pa) return <div style={DS.body}><div style={{color:"#374151",textAlign:"center",padding:40}}>Application not found.</div></div>;
  const site=allSites.find(s=>s.id===pa.siteId);
  const client=clients.find(c=>c.id===pa.clientId);

  const calcClaimed=(it)=>{
    if(it.useQty) return (it.claimedQtyToDate||0)*it.contractRate;
    return ((it.claimedPctToDate||0)/100)*(it.contractQty*it.contractRate);
  };
  const calcPrev=(it)=>(it.previousQty||0)*it.contractRate;
  const calcThisPeriod=(it)=>calcClaimed(it)-calcPrev(it);

  const totalContract=items.reduce((a,it)=>a+it.contractQty*it.contractRate,0);
  const totalClaimed=items.reduce((a,it)=>a+calcClaimed(it),0);
  const totalPrev=items.reduce((a,it)=>a+calcPrev(it),0);
  const totalThis=totalClaimed-totalPrev;
  const pctComplete=totalContract>0?Math.round((totalClaimed/totalContract)*100):0;

  function updateItem(id,key,val){setItems(its=>its.map(it=>it.id===id?{...it,[key]:val}:it));}
  function toggleMode(id){setItems(its=>its.map(it=>it.id===id?{...it,useQty:!it.useQty}:it));}
  function addItem(){
    setItems(its=>[...its,{id:"pai_"+Date.now(),type:addType,description:"",unit:"sum",contractQty:1,contractRate:0,claimedQtyToDate:0,claimedPctToDate:0,useQty:addType!=="Preliminaries",previousQty:0}]);
  }
  function deleteItem(id){setItems(its=>its.filter(it=>it.id!==id));}

  function savePA(){
    setPayApplications(pas=>pas.map(p=>p.id===payappId?{...p,items,status:"draft"}:p));
    alert("✓ Saved");
  }
  function submitPA(){
    setPayApplications(pas=>pas.map(p=>p.id===payappId?{...p,items,status:"submitted"}:p));
    alert("✓ Submitted");
    setPage("payapps");
  }

  function exportPDF(){
    const html="<!DOCTYPE html><html><head><meta charset='utf-8'/><title>"+pa.number+" — "+(site?.name||"")+"<\/title>"+
"<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0d1117;color:#e2e8f0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;padding:24px;}"+
".hdr{display:flex;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #1e2535;}"+
"table{width:100%;border-collapse:collapse;margin-bottom:16px;}"+
"th{padding:7px 10px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #1e2535;background:#0a0e17;}"+
"td{padding:6px 10px;border-bottom:1px solid #1a2030;font-size:11px;}"+
"tr:nth-child(even) td{background:#111827;}tr:nth-child(odd) td{background:#0f1421;}"+
".total{background:#0d2218;border:2px solid #10b981;border-radius:10px;padding:16px 20px;margin-top:10px;}"+
".ft{margin-top:16px;padding-top:10px;border-top:1px solid #1e2535;display:flex;justify-content:space-between;font-size:9px;color:#374151;}"+
"@media print{@page{margin:8mm;size:A3 landscape;}}<\/style><\/head><body>"+
"<div class='hdr'>"+
"  <div><div style='font-size:22px;font-weight:800;color:#f1f5f9'>"+pa.number+"<\/div>"+
"  <div style='font-size:13px;color:#64748b'>"+(site?.name||"—")+" · "+(client?.name||"—")+"<\/div>"+
"  <div style='font-size:11px;color:#64748b;margin-top:4px'>Date: "+pa.date+" · Status: "+pa.status+"<\/div><\/div>"+
"  <div style='text-align:right'><div style='font-size:11px;color:#64748b'>Contract Value<\/div><div style='font-size:24px;font-weight:900;color:#60a5fa'>£"+totalContract.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/div><\/div>"+
"<\/div>"+
"<table><thead><tr><th>Type<\/th><th style='width:35%'>Description<\/th><th>Unit<\/th><th>Qty<\/th><th>Rate £<\/th><th>Contract £<\/th><th>Prev Qty<\/th><th>Claimed ToDate<\/th><th>This Period £<\/th><th>%<\/th><\/tr><\/thead><tbody>"+
items.map(it=>{const cl=calcClaimed(it);const pr=calcPrev(it);const th=cl-pr;const pct=it.contractQty*it.contractRate>0?Math.round((cl/(it.contractQty*it.contractRate))*100):0;
  return "<tr><td style='color:#a78bfa'>"+it.type+"<\/td><td style='font-weight:600'>"+(it.description||"—")+"<\/td><td>"+it.unit+"<\/td><td style='text-align:right'>"+it.contractQty+"<\/td><td style='text-align:right'>£"+it.contractRate.toLocaleString()+"<\/td><td style='text-align:right;font-weight:700'>£"+(it.contractQty*it.contractRate).toLocaleString()+"<\/td><td style='text-align:right;color:#64748b'>"+(it.previousQty||0)+"<\/td><td style='text-align:right;color:#34d399;font-weight:700'>£"+cl.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/td><td style='text-align:right;color:"+(th>=0?"#34d399":"#f87171")+";font-weight:700'>£"+th.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/td><td style='text-align:right'>"+pct+"%<\/td><\/tr>";
}).join("")+
"<\/tbody><\/table>"+
"<div class='total' style='display:grid;grid-template-columns:repeat(4,1fr);gap:16px'>"+
"  <div><div style='font-size:10px;color:#64748b;text-transform:uppercase'>Contract<\/div><div style='font-size:20px;font-weight:900;color:#60a5fa'>£"+totalContract.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/div><\/div>"+
"  <div><div style='font-size:10px;color:#64748b;text-transform:uppercase'>Claimed To Date<\/div><div style='font-size:20px;font-weight:900;color:#34d399'>£"+totalClaimed.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/div><\/div>"+
"  <div><div style='font-size:10px;color:#64748b;text-transform:uppercase'>This Period<\/div><div style='font-size:20px;font-weight:900;color:#fbbf24'>£"+totalThis.toLocaleString(undefined,{maximumFractionDigits:0})+"<\/div><\/div>"+
"  <div><div style='font-size:10px;color:#64748b;text-transform:uppercase'>% Complete<\/div><div style='font-size:20px;font-weight:900;color:#a78bfa'>"+pctComplete+"%<\/div><\/div>"+
"<\/div>"+
"<div class='ft'><span>"+pa.number+" — "+(site?.name||"")+"<\/span><span>"+(client?.name||"")+"<\/span><span>Bright Metalwork Ltd<\/span><span>"+new Date().toLocaleDateString("en-GB")+"<\/span><\/div>"+
"<script>window.onload=function(){window.print();}<\/script><\/body><\/html>";
    const blob=new Blob([html],{type:"text/html"});const url=URL.createObjectURL(blob);
    const win=window.open(url,"_blank","width=1200,height=820");
    if(!win){const a=document.createElement("a");a.href=url;a.download=pa.number+".html";a.click();}
    setTimeout(()=>URL.revokeObjectURL(url),6000);
  }

  function exportExcel(){
    // Colour helpers (ARGB)
    const COL={
      headerBg:"FF0A0E17", headerFg:"FF94A3B8",
      scopeBg:"FF0D1A2E",  scopeFg:"FF60A5FA",
      varBg:"FF1A1200",    varFg:"FFFBBF24",
      dayBg:"FF1A0D00",    dayFg:"FFF97316",
      prelBg:"FF1A0D2E",   prelFg:"FFA78BFA",
      totalBg:"FF0D2218",  totalFg:"FF34D399",
      contractFg:"FF34D399",
      prevFg:"FF94A3B8",
      thisFg:"FFFBBF24",
      pctFg:"FFA78BFA",
      white:"FFF1F5F9",    dark:"FF0D1117",
      border:"FF2D3555",
    };
    const typeColMap={"Scope of Work":{bg:COL.scopeBg,fg:COL.scopeFg},"Variation":{bg:COL.varBg,fg:COL.varFg},"Dayworks":{bg:COL.dayBg,fg:COL.dayFg},"Preliminaries":{bg:COL.prelBg,fg:COL.prelFg},"Other":{bg:"FF1E2535",fg:COL.white}};

    function cell(v,opts={}){
      const c={v};
      if(opts.t) c.t=opts.t;
      if(opts.f) c.f=opts.f;
      if(opts.s){
        c.s={};
        if(opts.s.fill) c.s.fill={patternType:"solid",fgColor:{argb:opts.s.fill}};
        if(opts.s.fgColor) c.s.font={...c.s.font,color:{argb:opts.s.fgColor},bold:!!opts.s.bold,sz:opts.s.sz||11};
        if(opts.s.bold) c.s.font={...c.s.font,bold:true};
        if(opts.s.sz) c.s.font={...c.s.font,sz:opts.s.sz};
        if(opts.s.align) c.s.alignment={horizontal:opts.s.align};
        if(opts.s.border) c.s.border={top:{style:"thin",color:{argb:COL.border}},bottom:{style:"thin",color:{argb:COL.border}},left:{style:"thin",color:{argb:COL.border}},right:{style:"thin",color:{argb:COL.border}}};
      }
      return c;
    }

    const wb=XLSX.utils.book_new();
    const dataRows=[];

    // ── Row 1: Title
    dataRows.push([
      cell(pa.number+" — "+(site?.name||""),{s:{fill:COL.dark,fgColor:COL.white,bold:true,sz:14}}),
      cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),cell("",{s:{fill:COL.dark}}),
    ]);
    // ── Row 2: Sub-title
    dataRows.push([
      cell("Client: "+(client?.name||"—")+" · Date: "+pa.date+" · Status: "+pa.status,{s:{fill:COL.dark,fgColor:COL.prevFg}}),
      cell(""),cell(""),cell(""),cell(""),cell(""),cell(""),cell(""),cell(""),cell(""),
    ]);
    dataRows.push(Array(10).fill(cell("",{s:{fill:COL.dark}})));

    // ── Row 4: Headers
    const hdrs=["Type","Description","Unit","Contract Qty","Rate £","Contract £","Prev. Qty","Claimed to Date £","This Period £","% Complete"];
    dataRows.push(hdrs.map(h=>cell(h,{s:{fill:COL.headerBg,fgColor:COL.headerFg,bold:true,border:true,align:"center"}})));

    // ── Data rows with formulas
    const DATA_START=5; // row index where data begins (1-based for formula)
    items.forEach((it,idx)=>{
      const row=idx+DATA_START;
      const tc=typeColMap[it.type]||typeColMap["Other"];
      const cl=calcClaimed(it);
      const pr=calcPrev(it);
      const th=cl-pr;
      const pct=it.contractQty*it.contractRate>0?Math.round((cl/(it.contractQty*it.contractRate))*100):0;
      const contractVal=it.contractQty*it.contractRate;
      // Use actual formulas for Contract £, This Period, %
      dataRows.push([
        cell(it.type,                            {s:{fill:tc.bg,fgColor:tc.fg,bold:true,border:true}}),
        cell(it.description||"",                 {s:{fill:tc.bg,fgColor:COL.white,border:true}}),
        cell(it.unit,                            {s:{fill:tc.bg,fgColor:COL.prevFg,border:true,align:"center"}}),
        cell(it.contractQty,                     {t:"n",s:{fill:tc.bg,fgColor:COL.white,border:true,align:"right"}}),
        cell(it.contractRate,                    {t:"n",s:{fill:tc.bg,fgColor:COL.contractFg,border:true,align:"right"}}),
        {v:contractVal,t:"n",f:"D"+row+"*E"+row,s:{fill:{patternType:"solid",fgColor:{argb:tc.bg}},font:{color:{argb:COL.contractFg},bold:true},alignment:{horizontal:"right"},border:{top:{style:"thin",color:{argb:COL.border}},bottom:{style:"thin",color:{argb:COL.border}},left:{style:"thin",color:{argb:COL.border}},right:{style:"thin",color:{argb:COL.border}}}}},
        cell(it.previousQty||0,                  {t:"n",s:{fill:tc.bg,fgColor:COL.prevFg,border:true,align:"right"}}),
        cell(cl,                                 {t:"n",s:{fill:tc.bg,fgColor:COL.contractFg,bold:true,border:true,align:"right"}}),
        {v:th,t:"n",f:"H"+row+"-G"+row+"*E"+row,s:{fill:{patternType:"solid",fgColor:{argb:tc.bg}},font:{color:{argb:th>=0?"FF34D399":"FFF87171"},bold:true},alignment:{horizontal:"right"},border:{top:{style:"thin",color:{argb:COL.border}},bottom:{style:"thin",color:{argb:COL.border}},left:{style:"thin",color:{argb:COL.border}},right:{style:"thin",color:{argb:COL.border}}}}},
        {v:pct/100,t:"n",f:"IF(F"+row+">0,H"+row+"/F"+row+",0)",z:"0%",s:{fill:{patternType:"solid",fgColor:{argb:tc.bg}},font:{color:{argb:COL.pctFg},bold:true},alignment:{horizontal:"center"},border:{top:{style:"thin",color:{argb:COL.border}},bottom:{style:"thin",color:{argb:COL.border}},left:{style:"thin",color:{argb:COL.border}},right:{style:"thin",color:{argb:COL.border}}}}},
      ]);
    });

    // ── Totals row
    const lastDataRow=DATA_START+items.length-1;
    const totRow=lastDataRow+1;
    dataRows.push([
      cell("TOTALS",{s:{fill:COL.totalBg,fgColor:COL.totalFg,bold:true,sz:12,border:true}}),
      cell("",{s:{fill:COL.totalBg,border:true}}),
      cell("",{s:{fill:COL.totalBg,border:true}}),
      cell("",{s:{fill:COL.totalBg,border:true}}),
      cell("",{s:{fill:COL.totalBg,border:true}}),
      {v:totalContract,t:"n",f:"SUM(F"+DATA_START+":F"+lastDataRow+")",s:{fill:{patternType:"solid",fgColor:{argb:COL.totalBg}},font:{color:{argb:COL.contractFg},bold:true,sz:12},alignment:{horizontal:"right"},border:{top:{style:"medium",color:{argb:"FF10B981"}},bottom:{style:"medium",color:{argb:"FF10B981"}},left:{style:"thin"},right:{style:"thin"}}}},
      cell("",{s:{fill:COL.totalBg,border:true}}),
      {v:totalClaimed,t:"n",f:"SUM(H"+DATA_START+":H"+lastDataRow+")",s:{fill:{patternType:"solid",fgColor:{argb:COL.totalBg}},font:{color:{argb:COL.contractFg},bold:true,sz:12},alignment:{horizontal:"right"},border:{top:{style:"medium",color:{argb:"FF10B981"}},bottom:{style:"medium",color:{argb:"FF10B981"}},left:{style:"thin"},right:{style:"thin"}}}},
      {v:totalThis,t:"n",f:"SUM(I"+DATA_START+":I"+lastDataRow+")",s:{fill:{patternType:"solid",fgColor:{argb:COL.totalBg}},font:{color:{argb:totalThis>=0?"FF34D399":"FFF87171"},bold:true,sz:12},alignment:{horizontal:"right"},border:{top:{style:"medium",color:{argb:"FF10B981"}},bottom:{style:"medium",color:{argb:"FF10B981"}},left:{style:"thin"},right:{style:"thin"}}},},
      {v:pctComplete/100,t:"n",f:"IF(F"+totRow+">0,H"+totRow+"/F"+totRow+",0)",z:"0%",s:{fill:{patternType:"solid",fgColor:{argb:COL.totalBg}},font:{color:{argb:COL.pctFg},bold:true,sz:12},alignment:{horizontal:"center"},border:{top:{style:"medium",color:{argb:"FF10B981"}},bottom:{style:"medium",color:{argb:"FF10B981"}},left:{style:"thin"},right:{style:"thin"}}}},
    ]);

    // ── Build sheet
    const ws=XLSX.utils.aoa_to_sheet(dataRows);

    // Column widths
    ws["!cols"]=[{wch:18},{wch:38},{wch:8},{wch:14},{wch:12},{wch:14},{wch:12},{wch:18},{wch:16},{wch:12}];

    // Merge title cells A1:J1
    ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:9}},{s:{r:1,c:0},e:{r:1,c:9}},{s:{r:2,c:0},e:{r:2,c:9}}];

    XLSX.utils.book_append_sheet(wb,ws,"Payment Application");

    // ── Summary sheet
    const sumRows=[
      [cell("PAYMENT APPLICATION SUMMARY",{s:{fill:COL.dark,fgColor:COL.white,bold:true,sz:14}})],
      [cell(pa.number+" · "+(site?.name||"")+" · "+(client?.name||""),{s:{fill:COL.dark,fgColor:COL.prevFg}})],
      [cell("")],
      [cell("Contract Value",{s:{fill:"FF1E3A5F",fgColor:"FF60A5FA",bold:true}}),cell("£"+totalContract.toLocaleString(undefined,{maximumFractionDigits:0}),{t:"n",s:{fill:"FF1E3A5F",fgColor:"FF34D399",bold:true,sz:13}})],
      [cell("Claimed to Date",{s:{fill:"FF0D2218",fgColor:"FF34D399",bold:true}}),cell("£"+totalClaimed.toLocaleString(undefined,{maximumFractionDigits:0}),{t:"n",s:{fill:"FF0D2218",fgColor:"FF34D399",bold:true,sz:13}})],
      [cell("Previous",{s:{fill:"FF111827",fgColor:COL.prevFg,bold:true}}),cell("£"+totalPrev.toLocaleString(undefined,{maximumFractionDigits:0}),{t:"n",s:{fill:"FF111827",fgColor:COL.prevFg,bold:true,sz:13}})],
      [cell("This Period",{s:{fill:"FF1A1500",fgColor:COL.thisFg,bold:true}}),cell("£"+totalThis.toLocaleString(undefined,{maximumFractionDigits:0}),{t:"n",s:{fill:"FF1A1500",fgColor:COL.thisFg,bold:true,sz:13}})],
      [cell("% Complete",{s:{fill:"FF1A0D2E",fgColor:COL.pctFg,bold:true}}),cell(pctComplete+"%",{s:{fill:"FF1A0D2E",fgColor:COL.pctFg,bold:true,sz:13}})],
    ];
    const ws2=XLSX.utils.aoa_to_sheet(sumRows);
    ws2["!cols"]=[{wch:22},{wch:20}];
    XLSX.utils.book_append_sheet(wb,ws2,"Summary");

    const safeNum=(pa.number||"PA").split("/").join("-").split("\\").join("-");
    const safeSite=(site?.name||"site").split(" ").join("_");
    XLSX.writeFile(wb,safeNum+"_"+safeSite+".xlsx");
  }


  const typeColors={"Scope of Work":"#60a5fa","Variation":"#fbbf24","Dayworks":"#f97316","Preliminaries":"#a78bfa","Other":"#94a3b8"};

  return <div>
    <DPageHdr title={`📐 ${pa.number}`} sub={`${site?.name||"—"} · ${client?.name||"—"} · ${pa.date}`}
      back="Payment Applications" onBack={()=>setPage("payapps")}
      actions={<div style={{display:"flex",gap:7}}>
        <button onClick={savePA} style={{padding:"6px 13px",background:"#1e2535",border:"1px solid #2d3555",borderRadius:7,color:"#94a3b8",cursor:"pointer",fontSize:12}}>💾 Save</button>
        <button onClick={exportPDF} style={{padding:"6px 13px",background:"#1a1f2e",border:"1px solid #ef4444",borderRadius:7,color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700}}>📄 PDF</button>
        <button onClick={exportExcel} style={{padding:"6px 13px",background:"#0a1a0a",border:"1px solid #10b981",borderRadius:7,color:"#34d399",cursor:"pointer",fontSize:12,fontWeight:700}}>📊 Excel</button>
        <button onClick={submitPA} style={{padding:"6px 13px",background:"linear-gradient(135deg,#059669,#10b981)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>✓ Submit</button>
      </div>}/>
    <div style={DS.body}>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <DStat label="Contract Value" value={"£"+totalContract.toLocaleString(undefined,{maximumFractionDigits:0})} color="#60a5fa"/>
        <DStat label="Claimed To Date" value={"£"+totalClaimed.toLocaleString(undefined,{maximumFractionDigits:0})} color="#34d399"/>
        <DStat label="This Period" value={"£"+totalThis.toLocaleString(undefined,{maximumFractionDigits:0})} color="#fbbf24"/>
        <DStat label="% Complete" value={pctComplete+"%"} color="#a78bfa"/>
      </div>

      {/* Add item */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"flex-end"}}>
        <div><label style={{...DS.th,display:"block",marginBottom:3}}>Item Type</label>
          <select value={addType} onChange={e=>setAddType(e.target.value)} style={{background:"#0f1421",border:"1px solid #2d3555",borderRadius:6,padding:"6px 10px",color:"#e2e8f0",fontSize:12,outline:"none",cursor:"pointer"}}>
            {PA_ITEM_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={addItem} style={{padding:"6px 14px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Add {addType} Item</button>
      </div>

      {/* Items table */}
      <div style={{border:"1px solid #1e2535",borderRadius:10,overflow:"hidden",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={{...DS.th,minWidth:100}}>Type</th>
            <th style={{...DS.th,minWidth:220}}>Description</th>
            <th style={{...DS.th,minWidth:60}}>Unit</th>
            <th style={{...DS.th,minWidth:70}}>Qty</th>
            <th style={{...DS.th,minWidth:80}}>Rate £</th>
            <th style={{...DS.th,minWidth:90}}>Contract £</th>
            <th style={{...DS.th,background:"#0d1a2e",color:"#60a5fa",minWidth:80}}>Prev Qty</th>
            <th style={{...DS.th,background:"#0d1a2e",color:"#60a5fa",minWidth:80}}>Mode</th>
            <th style={{...DS.th,background:"#0d1a2e",color:"#60a5fa",minWidth:90}}>Claimed ToDate</th>
            <th style={{...DS.th,background:"#0d2218",color:"#34d399",minWidth:90}}>This Period £</th>
            <th style={{...DS.th,minWidth:40}}></th>
          </tr></thead>
          <tbody>{items.map((it,i)=>{
            const cl=calcClaimed(it);const pr=calcPrev(it);const thisPeriod=cl-pr;
            const typeCol=typeColors[it.type]||"#94a3b8";
            return <tr key={it.id} style={{background:i%2===0?"#111827":"#0f1421"}}>
              <td style={DS.td}><span style={{fontSize:10,fontWeight:600,color:typeCol}}>{it.type}</span></td>
              <td style={DS.td}><input value={it.description} onChange={e=>updateItem(it.id,"description",e.target.value)} style={{width:"100%",background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"3px 6px",color:"#e2e8f0",fontSize:11,outline:"none"}}/></td>
              <td style={DS.td}><select value={it.unit} onChange={e=>updateItem(it.id,"unit",e.target.value)} style={{background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#94a3b8",fontSize:10,outline:"none",cursor:"pointer"}}>
                {PA_UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </select></td>
              <td style={DS.td}><input type="number" value={it.contractQty} onChange={e=>updateItem(it.id,"contractQty",Number(e.target.value))} style={{width:60,background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#60a5fa",fontSize:11,textAlign:"right",outline:"none"}}/></td>
              <td style={DS.td}><input type="number" value={it.contractRate} onChange={e=>updateItem(it.id,"contractRate",Number(e.target.value))} style={{width:70,background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#e2e8f0",fontSize:11,textAlign:"right",outline:"none"}}/></td>
              <td style={{...DS.td,fontWeight:700,color:"#e2e8f0",textAlign:"right"}}>£{(it.contractQty*it.contractRate).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
              <td style={{...DS.td,background:"#080d14"}}><input type="number" value={it.previousQty||0} onChange={e=>updateItem(it.id,"previousQty",Number(e.target.value))} style={{width:65,background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#64748b",fontSize:11,textAlign:"right",outline:"none"}}/></td>
              <td style={{...DS.td,background:"#080d14",textAlign:"center"}}>
                <button onClick={()=>toggleMode(it.id)} style={{padding:"2px 8px",background:it.useQty?"#0d1a2e":"#1a0d2e",border:`1px solid ${it.useQty?"#3b82f6":"#a855f7"}`,borderRadius:4,color:it.useQty?"#60a5fa":"#c084fc",cursor:"pointer",fontSize:10,fontWeight:700}}>
                  {it.useQty?"Qty":"Pct%"}
                </button>
              </td>
              <td style={{...DS.td,background:"#080d14"}}>
                {it.useQty
                  ?<input type="number" value={it.claimedQtyToDate||0} onChange={e=>updateItem(it.id,"claimedQtyToDate",Number(e.target.value))} style={{width:70,background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#34d399",fontSize:11,textAlign:"right",outline:"none"}} placeholder={it.unit}/>
                  :<div style={{display:"flex",alignItems:"center",gap:3}}><input type="number" min="0" max="100" value={it.claimedPctToDate||0} onChange={e=>updateItem(it.id,"claimedPctToDate",Number(e.target.value))} style={{width:50,background:"#0f1421",border:"1px solid #2d3555",borderRadius:4,padding:"2px 4px",color:"#34d399",fontSize:11,textAlign:"right",outline:"none"}}/><span style={{color:"#64748b",fontSize:11}}>%</span></div>
                }
              </td>
              <td style={{...DS.td,fontWeight:800,fontSize:13,color:thisPeriod>=0?"#34d399":"#f87171",background:"#080d14",textAlign:"right"}}>
                £{thisPeriod.toLocaleString(undefined,{maximumFractionDigits:0})}
                <div style={{fontSize:9,color:"#64748b"}}>{Math.round((cl/(it.contractQty*it.contractRate||1))*100)}%</div>
              </td>
              <td style={DS.td}><button onClick={()=>deleteItem(it.id)} style={{padding:"3px 6px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:4,color:"#f87171",cursor:"pointer",fontSize:10}}>✕</button></td>
            </tr>;
          })}</tbody>
          <tfoot><tr style={{background:"#0d1117",borderTop:"2px solid #2d3555"}}>
            <td colSpan={5} style={{...DS.td,fontWeight:700,color:"#94a3b8"}}>TOTALS</td>
            <td style={{...DS.td,fontWeight:800,color:"#e2e8f0",textAlign:"right"}}>£{totalContract.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
            <td colSpan={2} style={DS.td}/>
            <td style={{...DS.td,background:"#080d14",fontWeight:800,color:"#34d399",textAlign:"right"}}>£{totalClaimed.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
            <td style={{...DS.td,background:"#080d14",fontWeight:900,fontSize:15,color:"#34d399",textAlign:"right"}}>£{totalThis.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
            <td style={DS.td}/>
          </tr></tfoot>
        </table>
      </div>
    </div>
  </div>;
}


function DComingSoon({icon,title,sub}){
  return <div>
    <DPageHdr title={`${icon} ${title}`} sub={sub}/>
    <div style={{...DS.body,textAlign:"center",padding:60}}>
      <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:8}}>{title}</div>
      <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>{sub}</div>
      <div style={{fontSize:12,color:"#374151"}}>This section uses the same data as the Schedule view.<br/>Switch to 📋 Schedule to manage {title.toLowerCase()}.</div>
    </div>
  </div>;
}

// ─── DashboardView — the complete dashboard shell ─────────────────────────────

// ── Embedded Schedule View (full schedule table, inside dashboard) ─────────────
function DScheduleView({workers=[],allSites=[],activeDays=[],siteHours={},weekLabel,allSiteNames,filter={},setFilter,showWeekend,setShowWeekend,updateCell,setModal,delWorker,scheduleHistory,saveScheduleSnapshot,weeklyRecords,setWeeklyRecords}){
  // Build siteNames from allSiteNames prop or compute inline
  const siteNames=useMemo(()=>{
    if(allSiteNames&&allSiteNames.length>0) return allSiteNames;
    const s=new Set((allSites||[]).map(x=>x.name));
    (workers||[]).forEach(w=>ALL_DAYS.forEach(d=>{if(w.days?.[d])s.add(w.days[d].trim());}));
    return Array.from(s).filter(Boolean).sort();
  },[allSiteNames,allSites,workers]);

  // Auto-snapshot this week
  useEffect(()=>{
    if(workers.length>0&&scheduleHistory&&!scheduleHistory[weekLabel]&&saveScheduleSnapshot){
      saveScheduleSnapshot(weekLabel,workers);
    }
  },[weekLabel]);

  const nm=filter?.name||"";const pos=filter?.position||"";const si=filter?.site||"";
  const displayed=useMemo(()=>workers.filter(w=>{
    if(nm&&!w.name?.toLowerCase().includes(nm.toLowerCase())) return false;
    if(pos&&w.position!==pos) return false;
    if(si&&!Object.values(w.days||{}).some(d=>d&&d.toLowerCase().includes(si.toLowerCase()))) return false;
    return true;
  }),[workers,nm,pos,si]);

  // Group by primary site
  const groups=useMemo(()=>{
    const g={};
    displayed.forEach(w=>{
      const cnts={};
      (activeDays||BASE_DAYS).forEach(d=>{const s=w.days?.[d];if(s&&!isOff(s))cnts[s]=(cnts[s]||0)+1;});
      const primary=Object.entries(cnts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"Unassigned / Off";
      if(!g[primary])g[primary]=[];
      g[primary].push(w);
    });
    return g;
  },[displayed,activeDays]);

  const siteOrder=Object.keys(groups).sort((a,b)=>{
    if(a==="Unassigned / Off") return 1;
    if(b==="Unassigned / Off") return -1;
    return a.localeCompare(b);
  });

  const TH2={padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #1e2535",background:"#0a0e17",whiteSpace:"nowrap"};
  const TD2={padding:"5px 8px",borderBottom:"1px solid #1a2030",verticalAlign:"middle"};

  return <div>
    <DPageHdr title="📋 Route / Forecast" sub={`WC: ${weekLabel} · ${displayed.length} operatives · Forecast only — confirmed by GPS sign-in`}
      actions={<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <input value={nm} onChange={e=>setFilter&&setFilter(f=>({...f,name:e.target.value}))} placeholder="🔍 Name…"
          style={{background:"#1a1f2e",border:"1px solid #2d3555",borderRadius:6,padding:"5px 9px",color:"#e2e8f0",fontSize:11,outline:"none",width:100}}/>
        <button onClick={()=>setShowWeekend&&setShowWeekend(s=>!s)}
          style={{padding:"5px 10px",background:showWeekend?"#1a3020":"#1a1f2e",border:`1px solid ${showWeekend?"#10b981":"#2d3555"}`,borderRadius:6,color:showWeekend?"#34d399":"#64748b",cursor:"pointer",fontSize:10,fontWeight:700}}>
          {showWeekend?"✓ Weekend":"+ Weekend"}
        </button>
        <button onClick={()=>exportSchedulePDF(displayed,activeDays||BASE_DAYS,weekLabel,allSites)}
          style={{padding:"5px 10px",background:"#1a1f2e",border:"1px solid #ef4444",borderRadius:6,color:"#f87171",cursor:"pointer",fontSize:10,fontWeight:700}}>📄 PDF</button>
        <button onClick={()=>doExcel(workers,weekLabel,activeDays||BASE_DAYS,siteHours||{},{},allSites)}
          style={{padding:"5px 10px",background:"linear-gradient(135deg,#059669,#10b981)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:10,fontWeight:700}}>⬇ Excel</button>
        <button onClick={()=>setModal&&setModal({type:"worker",worker:mkW()})}
          style={{padding:"5px 10px",background:"linear-gradient(135deg,#3b82f6,#6366f1)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:10,fontWeight:700}}>+ Worker</button>
      </div>}/>

    <div style={{padding:"6px 20px",background:"#0f1421",borderBottom:"1px solid #1e2535",fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <span style={{color:"#fbbf24",fontWeight:700}}>🗺 This is a Route / Forecast only</span>
      <span style={{color:"#374151"}}>|</span>
      <span>Timesheet entries are created <strong style={{color:"#34d399"}}>only</strong> when a worker GPS signs in via the Worker Portal</span>
      <span style={{color:"#374151"}}>|</span>
      <span>✅ <span style={{color:"#34d399",fontWeight:600}}>Green cell</span> = GPS confirmed · 📋 Click cell to edit forecast</span>
      <span style={{color:"#374151"}}>|</span>
      <span>Route changes notify workers in-app and by email</span>
    </div>

    <div style={{overflowX:"auto"}}>
      {siteOrder.length===0&&<div style={{textAlign:"center",padding:50,color:"#374151"}}>No workers found. Add workers using the + Worker button.</div>}
      {siteOrder.map(siteName=>{
        const siteColor=getSiteColor(siteName,allSites);
        const grpWorkers=groups[siteName]||[];
        return <div key={siteName}>
          <div style={{background:`${siteColor}15`,borderLeft:`4px solid ${siteColor}`,padding:"6px 18px",display:"flex",alignItems:"center",gap:10,borderTop:"1px solid #1e2535",borderBottom:`1px solid ${siteColor}33`}}>
            <span style={{width:9,height:9,borderRadius:"50%",background:siteColor,flexShrink:0}}/>
            <span style={{fontWeight:800,color:siteColor,fontSize:13,flex:1}}>{siteName}</span>
            <span style={{fontSize:11,color:"#64748b"}}>{grpWorkers.length} operative{grpWorkers.length!==1?"s":""}</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>
              <th style={{...TH2,minWidth:140,paddingLeft:20}}>Worker</th>
              <th style={TH2}>Co.</th>
              <th style={TH2}>Position</th>
              {(activeDays||BASE_DAYS).map(d=><th key={d} style={{...TH2,minWidth:130,color:WEEKEND_DAYS.includes(d)?"#fbbf24":"#64748b"}}>{d}{WEEKEND_DAYS.includes(d)?" 🟡":""}</th>)}
              <th style={TH2}>Rate</th>
              <th style={TH2}>Tax</th>
              <th style={TH2}>Certs</th>
              <th style={TH2}>Actions</th>
            </tr></thead>
            <tbody>
              {grpWorkers.map((w,i)=>{
                const exp=CERTS.filter(c=>cSt(c,w)==="expired").length;
                const expg=CERTS.filter(c=>cSt(c,w)==="expiring").length;
                return <tr key={w.id} style={{background:i%2===0?"#111827":"#0f1421"}}>
                  <td style={{...TD2,fontWeight:600,color:"#f1f5f9",paddingLeft:20}}>
                    {w.name}
                    {w.comments&&<div style={{fontSize:9,color:"#fbbf24"}}>⚑ {w.comments}</div>}
                  </td>
                  <td style={{...TD2,color:"#94a3b8",fontSize:10}}>{(w.company||"").split(" ")[0]||"—"}</td>
                  <td style={{...TD2,color:"#94a3b8",fontSize:10}}>{w.position||"—"}</td>
                  {(activeDays||BASE_DAYS).map(d=>(
                    <td key={d} style={{...TD2,background:WEEKEND_DAYS.includes(d)?"rgba(251,191,36,0.03)":undefined,padding:"3px 6px"}}>
                      {(()=>{const confirmedLog=w.attendanceLogs?.find(l=>l.day===d&&l.weekLabel===weekLabel&&l.signIn&&l.signOut);return <InlineCell value={w.days?.[d]||""} workerId={w.id} day={d} allSiteNames={siteNames} allSites={allSites} onUpdate={updateCell||((id,day,val)=>{})} confirmed={!!confirmedLog}/>;})()}
                    </td>
                  ))}
                  <td style={{...TD2,color:"#34d399",fontWeight:600,fontSize:11}}>{w.agreedRate?`£${w.agreedRate}/hr`:"—"}</td>
                  <td style={TD2}><span style={{fontSize:10,fontWeight:700,color:w.taxRate===0.30?"#f87171":w.taxRate===0.20?"#fbbf24":"#34d399"}}>{Math.round((w.taxRate||0)*100)}%</span></td>
                  <td style={TD2}><div style={{display:"flex",gap:3}}>
                    {exp>0&&<span style={{color:"#f87171",fontSize:10,fontWeight:700}}>✗{exp}</span>}
                    {expg>0&&<span style={{color:"#fbbf24",fontSize:10,fontWeight:700}}>⚠{expg}</span>}
                    {exp===0&&expg===0&&<span style={{color:"#374151",fontSize:10}}>—</span>}
                  </div></td>
                  <td style={TD2}><div style={{display:"flex",gap:3,flexWrap:"nowrap"}}>
                    <button onClick={()=>setModal&&setModal({type:"worker",worker:w})} style={{padding:"3px 7px",background:"#1e3a5f",border:"1px solid #3b82f6",borderRadius:4,color:"#60a5fa",cursor:"pointer",fontSize:10,fontWeight:600}}>Edit</button>
                    <button onClick={()=>openWorkerWindow(w,allSites,weekLabel,activeDays||BASE_DAYS,siteHours||{})} style={{padding:"3px 6px",background:"#1a1f2e",border:"1px solid #60a5fa",borderRadius:4,color:"#60a5fa",cursor:"pointer",fontSize:10}}>🔗</button>
                    <button onClick={()=>exportWorkerProfile(w,allSites,weekLabel)} style={{padding:"3px 6px",background:"#1a2535",border:"1px solid #8b5cf6",borderRadius:4,color:"#a78bfa",cursor:"pointer",fontSize:10}}>📋</button>
                    <button onClick={()=>exportPayslip(w,activeDays||BASE_DAYS,weekLabel,siteHours||{})} style={{padding:"3px 6px",background:"#0d2218",border:"1px solid #10b981",borderRadius:4,color:"#34d399",cursor:"pointer",fontSize:10}}>💷</button>
                    <button onClick={()=>delWorker&&delWorker(w.id)} style={{padding:"3px 6px",background:"#2d1515",border:"1px solid #ef4444",borderRadius:4,color:"#f87171",cursor:"pointer",fontSize:10}}>✕</button>
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>;
      })}
    </div>

    {/* Site legend */}
    <div style={{padding:"8px 20px",borderTop:"1px solid #1e2535",background:"#0a0e17",display:"flex",flexWrap:"wrap",gap:4}}>
      {allSites.filter(s=>!isOff(s.name)).map(s=>(
        <span key={s.id} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:20,background:"#111827",border:`1px solid ${s.color}`,fontSize:9,color:"#94a3b8"}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:s.color}}/>{s.name}
        </span>
      ))}
    </div>
  </div>;
}

function DSiteBySite({workers,allSites,activeDays}){
  const sm={};
  workers.forEach(w=>activeDays.forEach(d=>{const s=(w.days[d]||"").trim();if(s){if(!sm[s])sm[s]={};if(!sm[s][d])sm[s][d]=[];sm[s][d].push(w);}}));
  return <div>
    <DPageHdr title="📍 By Site" sub="All workers grouped by site per day"/>
    <div style={{padding:"0 24px 24px",overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginTop:16}}>
        <thead><tr>
          <th style={{...DS.th,minWidth:180}}>Site</th>
          {activeDays.map(d=><th key={d} style={{...DS.th,minWidth:120,color:WEEKEND_DAYS.includes(d)?"#fbbf24":"#64748b"}}>{d}{WEEKEND_DAYS.includes(d)?" 🟡":""}</th>)}
          <th style={DS.th}>Total</th>
        </tr></thead>
        <tbody>{Object.keys(sm).sort().map((site,i)=>{
          const color=getSiteColor(site,allSites);
          const all=new Set();activeDays.forEach(d=>(sm[site][d]||[]).forEach(w=>all.add(w.id)));
          return <tr key={site} style={{background:i%2===0?"#111827":"#0f1421"}}>
            <td style={{...DS.td,borderLeft:`3px solid ${color}`,paddingLeft:12}}><span style={{fontWeight:700,color}}>{site}</span></td>
            {activeDays.map(d=><td key={d} style={DS.td}>{(sm[site][d]||[]).map(w=><div key={w.id} style={{fontSize:11,color:"#cbd5e1"}}>{w.name} <span style={{color:"#64748b",fontSize:10}}>({w.position||"—"})</span></div>)}</td>)}
            <td style={{...DS.td,textAlign:"center",fontWeight:700,color:"#60a5fa"}}>{all.size}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}


function DashboardView({workers,allSites,clients,weekLabel,activeDays,siteHours,scopeData,invoices,saveWorker,delWorker,setAllSites,setClients,setModal,weeklyRecords,setWeeklyRecords,scheduleHistory,saveScheduleSnapshot,bankTransactions,setBankTransactions,timesheetRecords,setTimesheetRecords,payslipRecords,setPayslipRecords,payApplications,setPayApplications,generateTimesheets,generatePayslips,showWeekend,setShowWeekend,filter,setFilter,allSiteNames,updateCell,dashPage,setDashPage,dashDetailId,setDashDetailId}){
  const nav=(page,id)=>{setDashPage(page);if(id!==undefined)setDashDetailId(id);};
  const goBack=(page)=>setDashPage(page);

    // Shared props passed to all dashboard pages
  const SP={
    workers,allSites,clients,invoices,activeDays,siteHours,weekLabel,setModal,scopeData,
    filter,setFilter,allSiteNames,updateCell,delWorker,showWeekend,setShowWeekend,
    weeklyRecords,setWeeklyRecords,scheduleHistory,saveScheduleSnapshot,
    bankTransactions,setBankTransactions,
    timesheetRecords,setTimesheetRecords,
    payslipRecords,setPayslipRecords,
    payApplications,setPayApplications,
    generateTimesheets,generatePayslips,
  };
  const renderPage=()=>{
    switch(dashPage){
      // ── Overview
      case "home":          return <DHome {...SP} weeklyRecords={weeklyRecords} setPage={setDashPage}/>;
      // ── Labour & People
      case "workers":       return <DWorkers {...SP} setPage={nav} setDetailId={setDashDetailId}/>;
      case "worker_detail": return <DWorkerDetail {...SP} workerId={dashDetailId} timesheetRecords={timesheetRecords} payslipRecords={payslipRecords} setTimesheetRecords={setTimesheetRecords} setPayslipRecords={setPayslipRecords} setPage={setDashPage}/>;
      // ── Labour Schedule (auto-snapshots each week)
      case "schedule":      return <DScheduleView {...SP}/>;
      case "site_by_site":  return <DSiteBySite {...SP}/>;
      case "payroll":       return <DPayroll {...SP}/>;
      case "payslips":      return <DPayslips {...SP} setPage={setDashPage}/>;
      case "timesheets":    return <DTimesheets {...SP} setPage={setDashPage}/>;
      case "weekly_records":return <DWeeklyRecords weeklyRecords={weeklyRecords} setWeeklyRecords={setWeeklyRecords} workers={workers} allSites={allSites} clients={clients} siteHours={siteHours} activeDays={activeDays} weekLabel={weekLabel} showWeekend={showWeekend} invoices={invoices} setPage={setDashPage} setDetailId={setDashDetailId}/>;
      case "weekly_record_detail": return <DWeeklyRecordDetail weeklyRecords={weeklyRecords} recordId={dashDetailId} setPage={setDashPage} allSites={allSites}/>;
      // ── Projects & Finance
      case "sites":         return <DSites {...SP} setPage={nav} setDetailId={setDashDetailId}/>;
      case "site_detail":   return <DSiteDetail {...SP} siteId={dashDetailId} setPage={setDashPage} setDetailId={setDashDetailId} invoices={invoices} payApplications={payApplications} weekLabel={weekLabel}/>;
      case "clients":       return <DClients {...SP} setPage={nav} setDetailId={setDashDetailId}/>;
      case "client_detail": return <DComingSoon icon="👔" title="Client Detail" sub="Select a client from the Clients list"/>;
      case "invoices":      return <DInvoices {...SP}/>;
      case "payapps":       return <DPayApps {...SP} setPage={setDashPage} setDetailId={setDashDetailId}/>;
      case "payapp_detail": return <DPayAppDetail payApplications={payApplications} setPayApplications={setPayApplications} payappId={dashDetailId} allSites={allSites} clients={clients} setPage={setDashPage}/>;
      case "budget":        return <DBudget {...SP}/>;
      // ── Analysis
      case "certs":         return <DCerts workers={workers} setPage={nav} setDetailId={setDashDetailId}/>;
      case "finance":       return <DFinance {...SP}/>;
      case "stats":         return <DStats workers={workers} allSites={allSites} activeDays={activeDays}/>;
      case "bank":          return <DBankFull {...SP}/>;
      case "expenses":      return <DExpenses bankTransactions={bankTransactions} allSites={allSites} clients={clients} workers={workers} activeDays={activeDays} siteHours={siteHours} setPage={setDashPage}/>;
      case "pending_reg":   return <PendingWorkersView workers={workers} onApprove={()=>window.location.reload()}/>;
      case "app_sitemanager":  return <SiteManagerView/>;
      case "app_sitedocs":    return <SiteDocGeneratorView/>;
      case "app_assets":      return <AssetRegisterView/>;
      default:              return <DHome {...SP} weeklyRecords={weeklyRecords} setPage={setDashPage}/>;
    }
  };


  // DashboardView only renders the page content — sidebar is in App
  return <div style={{height:"100%",background:"#080d14",overflowY:"auto"}}>{renderPage()}</div>;
}



export { DWorkerDetail, DSites, PendingWorkersView, SiteWorkersPanel, DSiteDetail, DClients, DCerts, DInvoices, DPayroll, DStats, DBank, DBudget, DFinance, DTimesheets, DPayslips, DBankFull, DExpenses, DPayApps, DPayAppDetail, DComingSoon, DScheduleView, DSiteBySite, DashboardView };
