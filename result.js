(() => {
  const $ = id => document.getElementById(id);
  const clamp = v => Math.max(0, Math.min(100, v));

  // 세션에서 결과 로드 + (옵션) URL 파라미터 백업
  function loadData() {
    try {
      const stored = sessionStorage.getItem('ps-result');
      if (stored) {
        const json = JSON.parse(stored);
        if (json && json.pct) {
          return {
            hasData: true,
            p: clamp(json.pct.physical),
            m: clamp(json.pct.psychological),
            o: clamp(json.pct.online)
          };
        }
      }
    } catch(e){}

    // URL 파라미터 fallback (?physical=..&psychological=..&online=..)
    const u = new URLSearchParams(location.search);
    const p = parseInt(u.get('physical')), m = parseInt(u.get('psychological')), o = parseInt(u.get('online'));
    const ok = [p,m,o].every(x => !isNaN(x));
    return {
      hasData: ok,
      p: clamp(p || 0), m: clamp(m || 0), o: clamp(o || 0)
    };
  }

  function topType(p,m,o){
    const rank = [{k:'physical',v:p},{k:'psychological',v:m},{k:'online',v:o}].sort((a,b)=>b.v-a.v);
    const balanced = Math.abs(rank[0].v - rank[2].v) <= 8;
    return balanced ? {key:'balanced', label:'균형형'} : {key:rank[0].k, label:
      rank[0].k==='physical'?'물리 민감형':rank[0].k==='psychological'?'심리 민감형':'온라인 민감형'};
  }

  function description(p,m,o){
    const max = Math.max(p,m,o);
    if (Math.abs(max - Math.min(p,m,o)) <= 8) {
      return "여러 영역에서 고르게 민감한 편입니다. 상황에 따라 유연하게 경계를 조절하면 편안함이 커져요.";
    }
    if (p===max) return "당신은 물리적 거리(신체 접촉·밀집 공간)에 민감합니다. 충분한 간격을 확보할 때 안정감을 느끼는 편입니다.";
    if (m===max) return "당신은 심리적 경계(말투·감정 개입)에 민감합니다. 감정적으로 안전한 대화 환경에서 몰입이 더 잘 됩니다.";
    return "당신은 온라인 프라이버시에 민감합니다. 알림·태그·응답 강요에 피로를 느끼기 쉬워요.";
  }

  function guide(p,m,o){
    const max = Math.max(p,m,o);
    if (p===max) return "물리적 공간 침범에 예민하니, 대화 시 1m 이상 거리를 확보하고 밀집 환경은 짧게 머무르세요.";
    if (m===max) return "심리적 거리 확보를 위해 감정 강요·사생활 질문은 경계하고, “괜찮을 때 이야기하자” 같은 합의를 두세요.";
    return "온라인 프라이버시 보호를 위해 태그 승인, 알림 시간제어, 공개 범위를 점검하세요.";
  }

  function bind() {
    const data = loadData();
    const p = data.p, m = data.m, o = data.o;
    const has = data.hasData;

    // 게이지 바 + 수치
    $('bar1').style.width = `${has?p:0}%`; $('v1').textContent = `${has?p:0}점`;
    $('bar2').style.width = `${has?m:0}%`; $('v2').textContent = `${has?m:0}점`;
    $('bar3').style.width = `${has?o:0}%`; $('v3').textContent = `${has?o:0}점`;

    // 평균/비교
    const avg = has ? Math.round((p+m+o)/3) : 0;
    $('avgScore').textContent = `${avg}점`;
    const trend = avg - 65;
    $('cmpText').textContent = has ? (trend>=0 ? `평균보다 ${trend}점 높습니다.` : `평균보다 ${Math.abs(trend)}점 낮습니다.`) : '테스트를 먼저 진행해 주세요.';
    const tri = document.getElementById('tri'); if (tri) tri.textContent = has ? (trend>=0 ? '▲' : '▼') : '-';

    // 거리(m): 0.3~2.4m 매핑, 미실시 0m
    const outer = document.querySelector('.gauge .outer');
    if (has) {
      const distance = ((avg/100)*(2.4-0.3)+0.3).toFixed(2);
      $('gaugeTitle').textContent = `${distance}m`;
      outer.style.display = 'block';
    } else {
      $('gaugeTitle').textContent = '0m';
      outer.style.display = 'none';
    }

    // 큰 점수/등급/칩
    document.querySelector('.score').innerHTML = `${avg}<small>점</small>`;
    const chipEl = document.querySelector('.chip');
    const rankEl = document.querySelector('.rank');

    if (!has) {
      chipEl.textContent = '-'; rankEl.textContent = '-';
    } else {
      if (avg>=80){ rankEl.textContent='상위 10%'; chipEl.textContent='매우 넓은 경계형'; }
      else if (avg>=65){ rankEl.textContent='상위 25%'; chipEl.textContent='넓은 경계형'; }
      else if (avg>=50){ rankEl.textContent='평균형';    chipEl.textContent='중간 경계형'; }
      else { rankEl.textContent='하위 50%'; chipEl.textContent='개방형'; }
    }

    // 설명/가이드
    document.querySelector('.desc').textContent = has ? description(p,m,o)
      : '테스트를 완료하시면 퍼스널 스페이스 분석 결과가 여기에 표시됩니다.';
    const guideBox = document.querySelector('.guide');
    guideBox.innerHTML = has
      ? `<img src="images/bulb.png" alt="전구"><div>${guide(p,m,o)}</div>`
      : `<img src="images/bulb.png" alt="전구"><div>테스트를 완료하시면 생활 가이드가 표시됩니다.</div>`;
  }

  function bindPrint() {
    const btn = document.getElementById('printBtn');
    if (btn) btn.addEventListener('click', () => window.print());
  }
  function applyResponsiveMode() {
    const ratio = window.innerWidth / window.innerHeight;
    document.body.classList.toggle('fluid', window.innerWidth < 1200 || ratio < 1.25);
  }

  function init() {
    bind(); bindPrint(); applyResponsiveMode();
    window.addEventListener('resize', applyResponsiveMode);
    window.addEventListener('orientationchange', applyResponsiveMode);
    window.addEventListener('beforeprint', () => document.body.classList.remove('fluid'));
    window.addEventListener('afterprint', () => requestAnimationFrame(applyResponsiveMode));
  }
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded', init, {once:true}) : init();
})();
