const url=process.env.SMOKE_URL;
if(!url){console.error('SMOKE_URL is required');process.exit(1);}
const res=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000)});
if(!res.ok){console.error('HTTP '+res.status);process.exit(1);}
const html=await res.text();
if(html.length<100){console.error('Unexpectedly short response');process.exit(1);}
console.log('Smoke OK:',res.status,new URL(url).origin,'bytes:',html.length);
