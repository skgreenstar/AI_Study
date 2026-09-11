/* React course dashboard: dynamic KST schedule + device-local editor.
 * Static JSON remains the canonical fallback. Local edits are isolated per browser.
 */
const {useEffect,useMemo,useState}=React;
const h=React.createElement;
const TYPE={lecture:'강의',recorded:'녹강',holiday:'휴강',exam:'시험',review:'해설(녹강)'};
const DAY=['일','월','화','수','목','금','토'];
const KEY=id=>`ai-study.course.${id}.v1`;
const esc=s=>String(s??'');
function seoulIso(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function parseIso(iso){return new Date(iso+'T00:00:00+09:00')}
function fmt(iso){const d=parseIso(iso);return `${d.getMonth()+1}/${d.getDate()} (${DAY[d.getDay()]})`}
function daysBetween(a,b){return Math.ceil((parseIso(b)-parseIso(a))/86400000)}
function loadLocal(id){try{return JSON.parse(localStorage.getItem(KEY(id))||'null')}catch{return null}}
function saveLocal(id,data){localStorage.setItem(KEY(id),JSON.stringify(data))}
function downloadJson(data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${data.course.id}-course-backup.json`;a.click();URL.revokeObjectURL(a.href);
}
function Summary({data,today}){
  const list=data.syllabus||[];
  const past=list.filter(x=>x.date<today&&x.type!=='holiday');
  const current=list.find(x=>x.date===today);
  const next=list.find(x=>x.date>today&&x.type!=='holiday');
  const recent=past.at(-1);
  const elapsed=list.filter(x=>x.date<=today).length;
  const pct=Math.max(0,Math.min(100,Math.round(elapsed/Math.max(list.length,1)*100)));
  const card=(label,item,meta,tone)=>h('article',{className:`now-card ${tone}`},
    h('span',{className:'now-label'},label),
    item?h(React.Fragment,null,h('b',null,`${item.week}주차 · ${fmt(item.date)}`),h('p',null,item.topic),h('small',null,meta)):h('p',null,'해당 일정이 없습니다.'));
  return h('section',{className:'now-board','aria-label':'현재 학기 진행 상황'},
    h('div',{className:'clock'},h('div',null,h('span',null,'서울 기준'),h('strong',null,today)),h('div',{className:'progress'},h('i',{style:{width:pct+'%'}})),h('small',null,`학기 일정 ${pct}% 진행`)),
    card(current?'오늘 수업':'최근 수업',current||recent,current?'오늘 진행':'복습 가능',current?'today':'recent'),
    card('다음 수업',current||next,current?'지금 진행 중':next?`D-${daysBetween(today,next.date)}`:'학기 종료','next'));
}
function Syllabus({data,today,onEdit}){
  const list=data.syllabus||[];
  const next=list.find(x=>x.date>=today&&x.type!=='holiday');
  return h('section',{className:'syllabus'},
    h('div',{className:'syllabus-head'},h('div',null,h('h3',null,`📅 수업 일정 · ${list.length}${data.course.weekUnit||'주차'}`),h('p',null,`${fmt(list[0].date)} 개강 – ${fmt(list.at(-1).date)} 종강 · Asia/Seoul 자동 계산`)),h('button',{className:'manage-btn',onClick:onEdit},'⚙ 일정 편집')),
    h('div',{className:'syllabus-legend'},...Object.entries(TYPE).map(([k,v])=>h('span',{className:'legend-'+k,key:k},v))),
    h('div',{className:'syllabus-scroll'},h('table',null,
      h('thead',null,h('tr',null,...['주차','날짜','구분','주제','강의 슬라이드','학습 자료'].map(x=>h('th',{key:x},x)))),
      h('tbody',null,...list.map(x=>{
        const state=x.date===today?'today':next&&x.date===next.date?'next':x.date<today?'past':'';
        return h('tr',{className:`${x.type} ${state}`,key:x.week},
          h('td',{className:'num'},x.week),h('td',{className:'date'},fmt(x.date)),
          h('td',null,h('span',{className:`type type-${x.type}`},TYPE[x.type]||x.type)),
          h('td',{className:'topic'},x.href?h('a',{href:x.href},x.topic):x.topic),
          h('td',{className:'slide'},x.slides?h('a',{href:x.slides,target:'_blank',rel:'noopener'},`Lecture ${x.lecture} PDF ↗`):h('span',null,'—')),
          h('td',{className:'note'},x.href?h('a',{href:x.href},'시각 자료 →'):h('span',null,'—'));
      })))));
}
function Weeks({data}){
 return h('section',{className:'weeks'},...(data.weeks||[]).map(w=>h('a',{className:'week',href:w.href,key:w.week,style:{'--accent':w.color||data.course.color||'#7357e8'}},
   h('div',{className:'top'},h('span',{className:'number'},typeof w.week==='number'?`LECTURE ${w.week}`:w.week),h('span',{className:'icon'},w.icon||'📘')),
   h('h3',null,w.title),h('p',null,w.subtitle||''),h('div',{className:'topics'},...(w.topics||[]).map(t=>h('span',{key:t},t))),
   w.classWeeks?.length?h('span',{className:'covers'},`수업 ${w.classWeeks.join('·')}${data.course.weekUnit||'주차'}`):null,
   h('div',{className:'status'},`${w.status||'학습 가능'} →`))));
}
function Editor({data,onClose,onSave,onReset}){
 const [draft,setDraft]=useState(()=>structuredClone(data));
 const [selected,setSelected]=useState(0);
 const row=draft.syllabus[selected]||{};
 const patch=(key,value)=>setDraft(d=>{const n=structuredClone(d);n.syllabus[selected][key]=value;return n});
 const importFile=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.course||!Array.isArray(x.syllabus))throw Error();setDraft(x)}catch{alert('올바른 과목 JSON 파일이 아닙니다.')}};r.readAsText(f)};
 return h('div',{className:'editor-backdrop',onMouseDown:e=>{if(e.target===e.currentTarget)onClose()}},
  h('aside',{className:'editor','aria-modal':'true',role:'dialog'},
   h('div',{className:'editor-head'},h('div',null,h('small',null,'DEVICE ADMIN'),h('h2',null,'과목 일정 편집')),h('button',{onClick:onClose,'aria-label':'닫기'},'×')),
   h('p',{className:'editor-notice'},'변경사항은 현재 브라우저에 저장됩니다. JSON 백업을 내려받으면 다른 기기에서도 복원할 수 있습니다.'),
   h('label',null,'수정할 주차',h('select',{value:selected,onChange:e=>setSelected(Number(e.target.value))},...draft.syllabus.map((x,i)=>h('option',{value:i,key:x.week},`${x.week}주차 · ${x.topic}`)))),
   h('div',{className:'editor-grid'},
    h('label',null,'날짜',h('input',{type:'date',value:row.date||'',onChange:e=>patch('date',e.target.value)})),
    h('label',null,'구분',h('select',{value:row.type||'lecture',onChange:e=>patch('type',e.target.value)},...Object.entries(TYPE).map(([k,v])=>h('option',{value:k,key:k},v))))),
   h('label',null,'주제',h('input',{value:row.topic||'',onChange:e=>patch('topic',e.target.value)})),
   h('label',null,'슬라이드 URL',h('input',{value:row.slides||'',placeholder:'https:// 또는 저장소 상대경로',onChange:e=>patch('slides',e.target.value)})),
   h('label',null,'학습자료 URL',h('input',{value:row.href||'',placeholder:'week4.html',onChange:e=>patch('href',e.target.value)})),
   h('div',{className:'editor-actions'},h('button',{className:'primary',onClick:()=>onSave(draft)},'저장하고 반영'),h('button',{onClick:()=>downloadJson(draft)},'JSON 백업'),h('label',{className:'file-btn'},'JSON 복원',h('input',{type:'file',accept:'application/json',onChange:importFile})),h('button',{className:'danger',onClick:onReset},'기본값으로 초기화')),
   h('div',{className:'backend-note'},h('b',null,'파일 업로드 확장 준비'),h('p',null,'현재는 저장소 경로나 외부 URL을 연결합니다. 다음 단계에서 Supabase Storage를 연결하면 PDF·음성 파일을 직접 업로드하고 여러 기기에서 공유할 수 있습니다.'))
  ));
}
function App(){
 const [base,setBase]=useState(null),[data,setData]=useState(null),[editing,setEditing]=useState(false);
 const today=useMemo(seoulIso,[]);
 useEffect(()=>{fetch('../../data/industrial-ai-course.json').then(r=>r.json()).then(x=>{setBase(x);setData(loadLocal(x.course.id)||x)}).catch(()=>setData({error:true}))},[]);
 if(!data)return h('div',{className:'loading'},'강의 일정을 불러오고 있습니다…');
 if(data.error)return h('div',{className:'error'},'주차 데이터를 불러오지 못했습니다.');
 const save=x=>{saveLocal(x.course.id,x);setData(x);setEditing(false)};
 const reset=()=>{if(confirm('이 기기의 편집 내용을 모두 지우고 기본 일정으로 돌아갈까요?')){localStorage.removeItem(KEY(data.course.id));setData(base);setEditing(false)}};
 return h(React.Fragment,null,
   h(Summary,{data,today}),
   h(Syllabus,{data,today,onEdit:()=>setEditing(true)}),
   h('div',{className:'heading'},h('h2',null,'강의별 학습 자료'),h('span',null,`${(data.weeks||[]).length}개 학습 자료`)),
   h(Weeks,{data}),
   editing?h(Editor,{data,onClose:()=>setEditing(false),onSave:save,onReset:reset}):null);
}
ReactDOM.createRoot(document.getElementById('course-app')).render(h(App));
