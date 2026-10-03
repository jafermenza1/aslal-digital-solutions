"use client";
import { useEffect, useRef, useState } from "react";
type Redemption={id:string;serial_number:string;redeemed_at:string;redeemed_by:string;redemption_method:string;holder_name:string|null;holder_phone:string|null;asset_name:string;asset_type:string;partner_name:string;partner_number:string;order_number:string|null};
export default function PartnerSalesAssetRedemptionPage(){
 const [value,setValue]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[result,setResult]=useState<any>(null),[history,setHistory]=useState<Redemption[]>([]),[camera,setCamera]=useState(false);
 const videoRef=useRef<HTMLVideoElement|null>(null),streamRef=useRef<MediaStream|null>(null);
 async function loadHistory(){const r=await fetch("/api/admin/partner-engine/sales-assets/redemptions");const d=await r.json();if(r.ok)setHistory(d.redemptions||[]);}
 useEffect(()=>{void loadHistory();return()=>stopCamera()},[]);
 async function stopCamera(){streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setCamera(false)}
 async function startCamera(){
   setMessage("");
   const Detector=(window as any).BarcodeDetector;
   if(!Detector){setMessage("This browser does not provide the QR reader API. Use the normal phone camera/QR keyboard scanner or a supported modern browser.");return}
   try{
     const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});
     streamRef.current=stream;setCamera(true);
     requestAnimationFrame(async function scan(){
       if(!videoRef.current||!streamRef.current)return;
       try{
         const detector=new Detector({formats:["qr_code"]});
         const codes=await detector.detect(videoRef.current);
         if(codes?.[0]?.rawValue){setValue(codes[0].rawValue);await stopCamera();return}
       }catch{}
       if(streamRef.current)requestAnimationFrame(scan);
     });
   }catch{setMessage("Camera access was not granted. Check browser camera permission and try again.")}
 }
 async function verifyAndRedeem(){
   setBusy(true);setMessage("");setResult(null);
   try{
     const r=await fetch("/api/admin/partner-engine/sales-assets/redemptions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value})});
     const d=await r.json();if(!r.ok)throw new Error(d.error||"Verification failed.");
     setResult(d);setValue("");setMessage(d.alreadyRedeemed?"This asset was already redeemed; no second redemption was created.":"Attendee verified and checked in successfully.");await loadHistory();
   }catch(e){setMessage(e instanceof Error?e.message:"Verification failed")}finally{setBusy(false)}
 }
 return <main className="min-h-screen p-6 sm:p-8"><div className="mx-auto max-w-6xl"><div className="dashboard-kicker">PARTNER COMMERCE</div><h1 className="mt-2 text-3xl font-black">Verify, RSVP & Check In</h1><p className="mt-2 max-w-3xl opacity-70">Use the phone camera to read a ticket/coupon QR code, or enter its serial number. For assets configured with mandatory RSVP, only a confirmed RSVP can be checked in. Every successful scan records the attendant and check-in time.</p>
 <section className="mt-8 rounded-2xl border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><label className="block text-sm font-black" htmlFor="asset-code">QR payload or serial number</label><p className="mt-1 text-xs opacity-60">Camera scanning is preferred on a phone; keyboard-wedge scanners remain supported.</p></div><button disabled={camera||busy} onClick={()=>void startCamera()} className="rounded-xl border px-5 py-3 font-black">Scan with phone camera</button></div>
 {camera&&<div className="mt-4 overflow-hidden rounded-2xl border bg-black"><video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover"/></div>}
 <div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="asset-code" autoFocus value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!busy)void verifyAndRedeem()}} placeholder="Scan QR or enter ASL-2026-..." className="min-w-0 flex-1 rounded-xl border px-4 py-3"/>{camera&&<button onClick={()=>void stopCamera()} className="rounded-xl border px-5 py-3 font-black">Stop camera</button>}<button disabled={busy||!value.trim()} onClick={()=>void verifyAndRedeem()} className="rounded-xl border px-5 py-3 font-black">{busy?"Verifying…":"Verify & Check In"}</button></div>
 {message&&<div className="mt-4 rounded-xl border p-4 font-bold">{message}</div>}
 {result&&<div className="mt-4 rounded-xl border p-5"><div className="text-xs font-black uppercase opacity-60">{result.status}</div><h2 className="mt-1 text-xl font-black">{result.asset?.asset_name}</h2><p className="mt-1 text-sm opacity-70">Serial: {result.asset?.serial_number} · {result.asset?.asset_type}</p>{result.redemption&&<p className="mt-3 text-sm">Attendant: <b>{result.redemption.holder_name||"Ticket holder"}</b> · checked in by {result.redemption.redeemed_by} at {new Date(result.redemption.redeemed_at).toLocaleString("en-ET")}.</p>}</div>}</section>
 <section className="mt-8 rounded-2xl border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Attendance / check-in history</h2><p className="text-sm opacity-60">Each row represents a successful ticket/coupon redemption and identifies the operator who checked the attendee in.</p></div><span className="rounded-full border px-3 py-1 text-sm font-black">{history.length} records</span></div>
 <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Check-in</th><th className="p-3">Attendee</th><th className="p-3">Asset</th><th className="p-3">Serial</th><th className="p-3">Method</th><th className="p-3">Checked in by</th></tr></thead><tbody>{history.map(x=><tr key={x.id} className="border-b last:border-0"><td className="p-3 whitespace-nowrap">{new Date(x.redeemed_at).toLocaleString("en-ET")}</td><td className="p-3">{x.holder_name||"—"}{x.holder_phone&&<div className="text-xs opacity-60">{x.holder_phone}</div>}</td><td className="p-3">{x.asset_name}</td><td className="p-3 font-mono">{x.serial_number}</td><td className="p-3">{x.redemption_method}</td><td className="p-3">{x.redeemed_by}</td></tr>)}</tbody></table>{!history.length&&<p className="mt-4 text-sm opacity-60">No attendance records yet.</p>}</div></section>
 </div></main>;
}
