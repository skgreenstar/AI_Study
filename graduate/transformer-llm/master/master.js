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
