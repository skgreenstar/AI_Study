/* 대학원 과목 페이지 공통 렌더러
 * - data/<course>-course.json 하나로 (1) 16주 수업 일정 표 (2) 강의 자료 카드 를 그린다.
 * - 강의 자료 카드(weeks)는 Stanford Lecture 단위, 수업 일정(syllabus)은 실제 수업 주차 단위이며
 *   syllabus[].lecture → weeks[].week 로 매핑된다.
 * 사용: <script src="../../assets/course-syllabus.js" data-course="transformer-llm"></script>
 */
(function(){
  const script=document.currentScript;
  const courseId=script.dataset.course;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const TYPE={lecture:'강의',recorded:'녹강',holiday:'휴강',exam:'시험',review:'해설(녹강)'};
  const DAY=['일','월','화','수','목','금','토'];
  const fmt=iso=>{const d=new Date(iso+'T00:00:00');return `${d.getMonth()+1}/${d.getDate()} (${DAY[d.getDay()]})`};
  const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};

  function rowState(item,today,nextIso){
    if(item.date===today)return 'today';
    if(item.date===nextIso)return 'next';
    if(item.date<today)return 'past';
    return '';
  }

  function renderSyllabus(data){
    const root=document.getElementById('syllabus');
    if(!root)return;
    const list=data.syllabus||[];
    if(!list.length){root.hidden=true;return}
    const today=todayIso();
    const upcoming=list.find(x=>x.date>=today);
    const nextIso=upcoming&&upcoming.date!==today?upcoming.date:null;
    const unit=data.course.weekUnit||'주차';
    const ref=data.course.reference;
    const rows=list.map(x=>{
      const state=rowState(x,today,nextIso);
      const topic=x.href?`<a href="${esc(x.href)}">${esc(x.topic)}</a>`:esc(x.topic);
      const slide=x.slides?`<a href="${esc(x.slides)}" target="_blank" rel="noopener">Lecture ${esc(x.lecture)} PDF ↗</a>`:'<span>—</span>';
      const note=x.href?`<a href="${esc(x.href)}">시각 자료 →</a>`:'<span>—</span>';
      return `<tr class="${esc(x.type)} ${state}"><td class="num">${esc(x.week)}</td><td class="date">${fmt(x.date)}</td><td><span class="type type-${esc(x.type)}">${esc(TYPE[x.type]||x.type)}</span></td><td class="topic">${topic}</td><td class="slide">${slide}</td><td class="note">${note}</td></tr>`;
    }).join('');
    const legend=Object.keys(TYPE).map(k=>`<span class="legend-${k}">${TYPE[k]}</span>`).join('');
    const first=list[0],last=list[list.length-1];
    root.innerHTML=`<div class="syllabus-head"><div><h3>📅 수업 일정 · ${list.length}${unit}</h3><p>${fmt(first.date)} 개강 – ${fmt(last.date)} 종강 · 매주 ${esc(data.course.classDay||'토')}요일${upcoming?` · 다음 수업 <b>${fmt(upcoming.date)} ${esc(upcoming.topic)}</b>`:''}</p></div>${ref?`<a href="${esc(ref.url)}" target="_blank" rel="noopener">참고 강좌 ${esc(ref.name)} ↗</a>`:''}</div><div class="syllabus-legend">${legend}</div><div class="syllabus-scroll"><table><thead><tr><th>${esc(unit)}</th><th>날짜</th><th>구분</th><th>주제</th><th>강의 슬라이드</th><th>학습 자료</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderWeeks(data){
    const root=document.getElementById('weeks');
    const unit=data.course.weekUnit||'주차';
    const accentDefault=data.course.color||'#7357e8';
    document.getElementById('count').textContent=(data.weeks||[]).length+'개 학습 자료';
    root.innerHTML=(data.weeks||[]).map(w=>{
      const covers=(w.classWeeks&&w.classWeeks.length)?`<span class="covers">수업 ${w.classWeeks.join('·')}${unit}</span>`:'';
      const label=typeof w.week==='number'?`LECTURE ${esc(w.week)}`:esc(w.week);
      return `<a class="week" href="${esc(w.href)}" style="--accent:${esc(w.color||accentDefault)}"><div class="top"><span class="number">${label}</span><span class="icon">${esc(w.icon||'📘')}</span></div><h3>${esc(w.title)}</h3><p>${esc(w.subtitle||'')}</p><div class="topics">${(w.topics||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>${covers}<div class="status">${esc(w.status||'학습 가능')} →</div></a>`;
    }).join('');
  }

  fetch(`../../data/${courseId}-course.json`).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{
    document.getElementById('semester').textContent=data.course.semester;
    document.getElementById('title').textContent=data.course.title;
    document.getElementById('description').textContent=data.course.description;
    const pre=document.getElementById('prerequisite');
    if(pre&&data.course.prerequisiteHref)pre.href=data.course.prerequisiteHref;
    renderSyllabus(data);
    renderWeeks(data);
  }).catch(()=>{
    document.getElementById('weeks').innerHTML='<div class="error">주차 데이터를 불러오지 못했습니다.</div>';
  });
})();
