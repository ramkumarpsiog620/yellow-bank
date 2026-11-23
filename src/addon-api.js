const key='AIzaSyAbMrEVN2H1lHLvbwaLWERe0jxISNI67Kc';
const root='https://firestore.googleapis.com/v1/projects/yellow-bank-6a887/databases/(default)/documents';
async function request(url, options={}) { const r=await fetch(url,options); const v=await r.json(); if(!r.ok) throw Error(v.error?.message||`HTTP ${r.status}`); return v; }
export async function login(email,password){return prepare(await request(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})}));}
function prepare(s){return {...s,expiresAt:Date.now()+Number(s.expiresIn||3600)*1000};}
const refreshing=new WeakMap();
async function valid(s){
 if(Date.now()<s.expiresAt-60000)return s;
 if(!refreshing.has(s))refreshing.set(s,(async()=>{const v=await request(`https://securetoken.googleapis.com/v1/token?key=${key}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:s.refreshToken})});if(v.user_id!==s.localId)throw Error('Session identity mismatch');Object.assign(s,prepare({idToken:v.id_token,refreshToken:v.refresh_token,expiresIn:v.expires_in}));return s;})().finally(()=>refreshing.delete(s)));
 return refreshing.get(s);
}
const headers=async s=>({'Authorization':`Bearer ${(await valid(s)).idToken}`,'Content-Type':'application/json'});
const encode=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,typeof v==='number'?{doubleValue:v}:{stringValue:String(v)}]));
const decode=d=>({id:d.name.split('/').pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,Object.values(v)[0]]))});
export async function list(s,c,all=false){const q={from:[{collectionId:c}]}; if(!all)q.where={fieldFilter:{field:{fieldPath:'uid'},op:'EQUAL',value:{stringValue:s.localId}}}; const rows=await request(root+':runQuery',{method:'POST',headers:await headers(s),body:JSON.stringify({structuredQuery:q})});return rows.filter(x=>x.document).map(x=>decode(x.document));}
export async function put(s,c,id,data){return request(`${root}/${c}/${encodeURIComponent(id)}?${Object.keys(data).map(k=>'updateMask.fieldPaths='+encodeURIComponent(k)).join('&')}`,{method:'PATCH',headers:await headers(s),body:JSON.stringify({fields:encode(data)})});}
export async function remove(s,c,id){return request(`${root}/${c}/${encodeURIComponent(id)}`,{method:'DELETE',headers:await headers(s)});}
