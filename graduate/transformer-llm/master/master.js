/* 전문가 마스터 탭 공통 스크립트
 * - 장별 "이해 완료" 체크를 브라우저에 저장하고(실패해도 페이지는 동작), 전체 지도에 진행률을 표시한다.
 */
(function(){
  var KEY='tlm-master-done';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
  var state=load();

  // 장 페이지: <label class="done"><input type="checkbox" data-chapter="ch1">…</label>
  var box=document.querySelector('.done input[data-chapter]');
  if(box){
    box.checked=!!state[box.dataset.chapter];
    box.addEventListener('change',function(){state[box.dataset.chapter]=box.checked;save(state)});
  }

  // 전체 지도: <a class="chap" data-chapter="ch1">…<span class="st"></span></a>
  var cards=document.querySelectorAll('.chap[data-chapter]');
  if(cards.length){
    var n=0;
    cards.forEach(function(c){
      var d=!!state[c.dataset.chapter];
      if(d)n++;
      c.classList.toggle('isdone',d);
      var st=c.querySelector('.st');
      if(st)st.textContent=d?'✅ 이해 완료':'읽으러 가기 →';
    });
    var bar=document.querySelector('.progress i'),txt=document.getElementById('progress-text');
    if(bar)bar.style.width=Math.round(n/cards.length*100)+'%';
    if(txt)txt.textContent=cards.length+'개 장 중 '+n+'개 이해 완료';
  }
})();

/* 메인 전용 보기 전환. JS가 없으면 두 보기를 모두 읽을 수 있다. */
(function(){
  var tabs=Array.from(document.querySelectorAll('[data-master-view]'));
  if(!tabs.length)return;
  var panels=Array.from(document.querySelectorAll('.master-view'));
  var list=document.querySelector('.master-view-tabs');
  list.setAttribute('role','tablist');
  var media=window.matchMedia('(max-width:760px)');
  function orientation(){list.setAttribute('aria-orientation',media.matches?'horizontal':'vertical')}
  orientation();
  if(media.addEventListener)media.addEventListener('change',orientation);
  tabs.forEach(function(tab){
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',tab.dataset.masterView);
  });
  panels.forEach(function(panel){panel.setAttribute('role','tabpanel');panel.tabIndex=0});
  function activate(id){
    panels.forEach(function(panel){panel.hidden=panel.id!==id});
    tabs.forEach(function(tab){
      var active=tab.dataset.masterView===id;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
  }
  function fromHash(scroll){
    var id;
    try{id=decodeURIComponent(window.location.hash.slice(1))}catch(e){id=''}
    var target=id?document.getElementById(id):null;
    var panel=target&&target.closest('.master-view');
    activate(panel?panel.id:'history');
    if(scroll&&panel&&target)target.scrollIntoView({block:'start'});
  }
  tabs.forEach(function(tab,index){
    tab.addEventListener('click',function(){activate(tab.dataset.masterView)});
    tab.addEventListener('keydown',function(event){
      var next=index;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else if(event.key===' '){event.preventDefault();tab.click();return}
      else return;
      event.preventDefault();tabs[next].focus();tabs[next].click();
    });
  });
  window.addEventListener('hashchange',function(){fromHash(true)});
  fromHash(!!window.location.hash);
})();
