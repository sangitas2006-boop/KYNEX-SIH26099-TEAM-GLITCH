import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveMaterial, runBenchmark, evaluateLabelledRows, parseCsv } from './engine.mjs'
import { db, createResolution, createReview, listReviews, updateReview, listPolicies, addAudit, listAudit, createDataset, insertRecords, createExport, createPassport, getPassport, createBenchmarkSet, insertBenchmarkRows, listBenchmarkSets, getBenchmarkRows, createMeasurement, listMeasurements } from './db.mjs'
import { authenticate, authSummary, hasRole } from './auth.mjs'

const serverRoot=dirname(fileURLToPath(import.meta.url))
const distRoot=join(serverRoot,'..','dist')
const readRegistry=(name)=>JSON.parse(readFileSync(join(serverRoot,'data',name),'utf8'))
const standardsRegistry=readRegistry('standards.json')
const evidenceRegistry=readRegistry('evidence.json')
const kpiRegistry=readRegistry('pilot-kpis.json')
const evidenceManifest=readRegistry('evidence-manifest.json')

const PORT = Number(process.env.PORT || 8787)
const ALLOWED_ORIGIN = process.env.KYNEX_ALLOWED_ORIGIN || 'http://localhost:5173'
const MAX_BODY_BYTES = Number(process.env.KYNEX_MAX_BODY_BYTES || 10 * 1024 * 1024)
const protectedMethods=new Set(['POST','PUT','PATCH','DELETE'])
const protectedPaths=['/api/resolve','/api/datasets/import','/api/benchmarks/import','/api/benchmarks/evaluate','/api/reviews/','/api/decisions','/api/exports','/api/passports','/api/measurements']
const protectedReadPaths=['/api/reviews','/api/audit','/api/benchmark-sets','/api/measurements']
function needsAuthentication(method,url){return (protectedMethods.has(method)&&protectedPaths.some(path=>url===path||url.startsWith(path)))||protectedReadPaths.some(path=>url===path||url.startsWith(`${path}/`))}
function json(res,status,payload){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','access-control-allow-origin':ALLOWED_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type, authorization, x-kynex-demo-role'});res.end(JSON.stringify(payload))}
async function readBody(req){let text='',bytes=0;for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>MAX_BODY_BYTES)throw new Error(`Request body exceeds the ${MAX_BODY_BYTES} byte limit`);text+=chunk}return text?JSON.parse(text):{}}
function csvEscape(value){const text=String(value??'');return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text}
function recordsToCsv(records){const headers=['org','code','description','plant','event_year','entity_key','status'];return [headers.join(','),...records.map(x=>headers.map(h=>csvEscape(x[h])).join(','))].join('\n')}
function routeId(url,prefix){return decodeURIComponent(url.slice(prefix.length).split('/')[0])}

const server=createServer(async(req,res)=>{
        if(req.method==='OPTIONS')return json(res,204,{})
        try{
                      const url=(req.url||'/').split('?')[0]
                      const identity=needsAuthentication(req.method||'GET',url)?await authenticate(req):{authenticated:false,actor:'system',role:'system',provider:'system'}
                      if(needsAuthentication(req.method||'GET',url)&&!identity.authenticated&&!identity.demo)return json(res,401,{ok:false,error:identity.error||'Authentication required',auth:authSummary()})
                      if(req.method==='GET'&&url==='/api/health')return json(res,200,{ok:true,service:'kynex-resolution-engine',version:'1.2.0',storage:'sqlite',model:'calibrated-reranker',mode:'connected-workspace',auth:authSummary(),evidenceManifest:evidenceManifest.schemaVersion,capabilities:['identity-resolution','compatibility-firewall','standards-context','expert-governance','pilot-measurement']})
                      if(req.method==='GET'&&url==='/api/evidence')return json(res,200,{standards:standardsRegistry,evidence:evidenceRegistry,kpis:kpiRegistry,manifest:evidenceManifest,dataReadiness:{status:'awaiting_authorized_cpse_export',requiredColumns:['org','code','description'],optionalColumns:['plant','event_year','entity_key','erp_system','language','supplier','family'],nextStep:evidenceManifest.nextEvidenceGate,publicProxy:{datasetName:'Public industrial procurement proxy — CPCL SJVN IOCL BPCL',rows:evidenceManifest.sources.find(source=>source.id==='public-industrial-proxy-expanded')?.rows||0,datasetId:3,scope:'Ingestion, lineage, conflict-firewall, and workflow testing only; no accuracy or impact claim.'}}})
                      if(req.method==='GET'&&url==='/api/datasets/template')return json(res,200,{schemaVersion:'kynex-material-v1',required:['org','code','description'],optional:['plant','event_year','entity_key','erp_system','language','supplier','family'],example:{org:'CPSE_CODE',code:'NATIVE-MATERIAL-CODE',description:'TECHNICAL DESCRIPTION',plant:'AUTHORIZED PLANT',event_year:2026,entity_key:'OPTIONAL_ENTITY_KEY',erp_system:'SAP_ORACLE_MAXIMO',language:'en',supplier:'OPTIONAL',family:'valve'}})
                      if(req.method==='GET'&&url==='/api/benchmarks/template')return json(res,200,{schemaVersion:'kynex-benchmark-v1',required:['query','label'],optional:['row_key','expected_code','plant','event_year','entity_key','split'],labels:['exact_duplicate','near_duplicate','functional_equivalent','conflict','unsafe_similarity','ambiguous','insufficient_evidence'],example:{row_key:'b001',query:'GATE VLV SS316 DN50 PN16 FLANGED',expected_code:'CPCL-VLV-04182',label:'near_duplicate',plant:'Bhilai Steel Plant',event_year:2025,entity_key:'gate-valve-ss50-pn16',split:'plant_test'}})
                      if(req.method==='GET'&&url==='/api/benchmark-sets')return json(res,200,{sets:listBenchmarkSets()})
                      if(req.method==='POST'&&url==='/api/benchmarks/import'){
                                            const payload=await readBody(req);const rows=parseCsv(payload.csv||'');const required=['query','label'];const headers=rows.length?Object.keys(rows[0]):[];const missing=required.filter(x=>!headers.includes(x));const allowedLabels=['exact_duplicate','near_duplicate','functional_equivalent','conflict','unsafe_similarity','ambiguous','insufficient_evidence'];const errors=[];rows.forEach((row,i)=>{if(!row.query)errors.push({row:i+2,field:'query',message:'Required field is empty'});if(!row.label)errors.push({row:i+2,field:'label',message:'Required field is empty'});if(row.label&&!allowedLabels.includes(row.label))errors.push({row:i+2,field:'label',message:`Unsupported label: ${row.label}`})});if(missing.length||errors.length)return json(res,422,{ok:false,error:'Benchmark schema validation failed',missing,errors,acceptedColumns:['row_key','query','expected_code','label','plant','event_year','entity_key','split']});const setId=createBenchmarkSet(payload.name||'Labelled benchmark upload',payload.source||'CSV upload',rows.length);insertBenchmarkRows(setId,rows);addAudit({event:'benchmark_imported',actor:identity.actor,action:'validated_benchmark_ingest',details:{setId,rowCount:rows.length,name:payload.name||'Labelled benchmark upload',role:identity.role}});return json(res,201,{ok:true,setId,rowCount:rows.length,columns:headers,validation:'passed',actor:identity.actor})
                      }
                      if(req.method==='POST'&&url==='/api/benchmarks/evaluate'){
                                            const payload=await readBody(req);const setId=Number(payload.setId);const set=db.prepare('SELECT * FROM benchmark_sets WHERE id=?').get(setId);if(!set)return json(res,404,{error:'Benchmark set not found'});const rows=getBenchmarkRows(setId);return json(res,200,evaluateLabelledRows(rows,set.name))
                      }
                      if(req.method==='GET'&&url==='/api/audit')return json(res,200,{records:listAudit()})
                      if(req.method==='GET'&&url==='/api/measurements')return json(res,200,{records:listMeasurements(),claimBoundary:'Only records with dataset_tier=authorized_cpse may support CPSE performance or operational-impact claims.'})
                      if(req.method==='POST'&&url==='/api/measurements'){
                                            if(!hasRole(identity,'material_master_officer'))return json(res,403,{error:'Measurement capture requires the material_master_officer role'});const payload=await readBody(req);const allowedTiers=['development_fixture','public_procurement_proxy','authorized_cpse'];const metricIds=new Set(kpiRegistry.map(item=>item.id));const value=Number(payload.value);if(!metricIds.has(payload.metricId)||!allowedTiers.includes(payload.datasetTier)||!Number.isFinite(value)||!payload.unit||!payload.source)return json(res,422,{ok:false,error:'Measurement requires a registered metric, valid evidence tier, numeric value, unit, and source',registeredMetrics:[...metricIds],allowedTiers});const status=payload.datasetTier==='authorized_cpse'?'pilot_measurement_recorded':'non_cpse_observation';const measurement=createMeasurement({metricId:payload.metricId,datasetTier:payload.datasetTier,value,unit:payload.unit,baseline:payload.baseline,cohort:payload.cohort,source:payload.source,status,actor:identity.actor});addAudit({event:'measurement_recorded',actor:identity.actor,action:'pilot_measurement',details:{measurementId:measurement.id,metricId:payload.metricId,datasetTier:payload.datasetTier,claimable:payload.datasetTier==='authorized_cpse'}});return json(res,201,{ok:true,measurement,claimBoundary:payload.datasetTier==='authorized_cpse'?'Eligible for CPSE pilot reporting after review':'Not eligible for CPSE performance or impact claims'})
                      }
                      if(req.method==='POST'&&url==='/api/resolve'){
                                            const payload=await readBody(req);const result=resolveMaterial(payload,{mode:payload.mode||'rules'});createResolution(result);addAudit({event:'resolution',requestId:result.requestId,actor:identity.actor,action:result.decision,details:{status:result.status,commonCode:result.recommendation.commonCode,mode:result.evidence.model,role:identity.role}})
                                            if(result.status==='conflict'||result.status==='abstain')createReview(result.requestId,null,result.status==='conflict'?'conflict':'pending',result.status==='conflict'?'critical':'high',result.recommendation.rationale.join('; '))
                                            return json(res,200,result)
                      }
                      if(req.method==='GET'&&url==='/api/benchmarks')return json(res,200,runBenchmark())
                      if(req.method==='GET'&&url==='/api/reviews')return json(res,200,{reviews:listReviews()})
                      if(req.method==='POST'&&url==='/api/decisions'){
                                            const payload=await readBody(req);if(!payload.requestId||!['approve','approve_substitution','reject','request_clarification'].includes(payload.action))return json(res,400,{error:'requestId and a valid action are required'});if(['approve','approve_substitution','reject'].includes(payload.action)&&!hasRole(identity,'material_master_officer'))return json(res,403,{error:'This action requires the material_master_officer role'});addAudit({event:'expert_decision',requestId:payload.requestId,actor:identity.actor,action:payload.action,details:{commonCode:payload.commonCode||'',role:identity.role,authProvider:identity.provider}});return json(res,201,{ok:true,entry:{requestId:payload.requestId,action:payload.action,role:identity.role,actor:identity.actor,createdAt:new Date().toISOString()}})
                      }
                      if(req.method==='POST'&&url.startsWith('/api/reviews/')){
                                            const id=Number(routeId(url,'/api/reviews/'));const payload=await readBody(req);if(!['approve','approve_substitution','reject','request_clarification'].includes(payload.action))return json(res,400,{error:'Unsupported review action'});if(['approve','approve_substitution','reject'].includes(payload.action)&&!hasRole(identity,'material_master_officer'))return json(res,403,{error:'This action requires the material_master_officer role'});const review=updateReview(id,payload.action==='request_clarification'?'pending':payload.action,payload.comments,identity.actor);return json(res,200,{ok:true,review,actor:identity.actor,role:identity.role})
                      }
                      if(req.method==='GET'&&url==='/api/policies')return json(res,200,{policies:listPolicies()})
                      if(req.method==='POST'&&url==='/api/datasets/import'){
                                            const payload=await readBody(req);const rows=parseCsv(payload.csv||'');const required=['code','description'];const headers=rows.length?Object.keys(rows[0]):[];const missing=required.filter(x=>!headers.includes(x));const errors=[];rows.forEach((row,i)=>{if(!row.code)errors.push({row:i+2,field:'code',message:'Required field is empty'});if(!row.description)errors.push({row:i+2,field:'description',message:'Required field is empty'})});if(missing.length||errors.length)return json(res,422,{ok:false,error:'Schema validation failed',missing,errors,acceptedColumns:['org','code','description','plant','event_year','entity_key']});const datasetId=createDataset(payload.name||'Material import',payload.source||'CSV upload',rows.length);insertRecords(datasetId,rows);addAudit({event:'dataset_imported',actor:identity.actor,action:'validated_ingest',details:{datasetId,rowCount:rows.length,name:payload.name||'Material import',role:identity.role}});return json(res,201,{ok:true,datasetId,rowCount:rows.length,columns:headers,validation:'passed',actor:identity.actor})
                      }
                      if(req.method==='POST'&&url==='/api/exports'){
                                            if(!hasRole(identity,'material_master_officer'))return json(res,403,{error:'Export requires the material_master_officer role'});const payload=await readBody(req);const datasetId=Number(payload.datasetId);const records=db.prepare('SELECT org,code,description,plant,event_year,entity_key,status FROM records WHERE dataset_id=? ORDER BY id').all(datasetId);if(!records.length)return json(res,404,{error:'Dataset not found or empty'});const exported=createExport(datasetId,recordsToCsv(records),payload.format||'csv');addAudit({event:'export_approved',actor:identity.actor,action:'export_only',details:{exportId:exported.id,datasetId,format:payload.format||'csv',role:identity.role}});return json(res,201,{...exported,actor:identity.actor,role:identity.role})
                      }
                      if(req.method==='POST'&&url==='/api/passports'){
                                            if(!hasRole(identity,'material_master_officer'))return json(res,403,{error:'Passport issuance requires the material_master_officer role'});const payload=await readBody(req);if(!payload.commonCode)return json(res,400,{error:'commonCode is required'});const passport=createPassport(payload.commonCode,payload.payload||{},payload.status||'certified');addAudit({event:'passport_issued',actor:identity.actor,action:'publish',details:{commonCode:payload.commonCode,status:passport.status,role:identity.role}});return json(res,201,{...passport,actor:identity.actor,role:identity.role})
                      }
                      if(req.method==='GET'&&url.startsWith('/api/passports/')){const passport=getPassport(routeId(url,'/api/passports/'));return passport?json(res,200,passport):json(res,404,{error:'Passport not found'})}
                      if(req.method==='GET'&&existsSync(distRoot)){
                                            const requested=decodeURIComponent(url.split('?')[0]||'/').replace(/^\/+/,'')
                                            const candidate=normalize(join(distRoot,requested))
                                            const safe=candidate.startsWith(normalize(distRoot))&&existsSync(candidate)&&statSync(candidate).isFile()
                                            const fallback=join(distRoot,'index.html')
                                            const file=safe?candidate:fallback
                                            if(existsSync(file)&&statSync(file).isFile()){
                                                                            const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':file.endsWith('.jpg')||file.endsWith('.jpeg')?'image/jpeg':'text/html'
                                                                            res.writeHead(200,{'content-type':contentType});
                                                                            let body=readFileSync(file)
                                                                            if(file===fallback&&contentType==='text/html'){
                                                                                                                        const runtimeConfig={supabaseUrl:process.env.SUPABASE_URL||'',supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||''}
                                                                                                                        const runtimeScript=`<script>window.__KYNEX_CONFIG__=${JSON.stringify(runtimeConfig)}</script>`
                                                                                                                        body=Buffer.from(body.toString('utf8').replace('</head>',`${runtimeScript}</head>`))
                                                                                }
                                                                            return res.end(body)
                                            }
                      }
                      return json(res,404,{error:'Not found'})
        }catch(error){return json(res,400,{error:error instanceof Error?error.message:'Invalid request'})}
})
server.listen(
    PORT,()=>console.log('KYNEX server listening on '+PORT))
