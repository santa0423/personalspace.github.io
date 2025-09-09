(() => {
  const $ = id => document.getElementById(id);
  const clamp = v => Math.max(0, Math.min(100, v));

  // 세션에서 결과 로드 (없으면 null)
  function loadResult() {
    const raw = sessionStorage.getItem('ps-result');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // 설명 문구
  function getDescription({ physical, psychological, online }) {
    const map = { 물리적: physical, 심리적: psychological, 온라인: online };
    const max = Math.max(physical, psychological, online);
    const top = Object.entries(map).filter(([,v]) => v === max).map(([k]) => k);

    const descs = {
      물리적: "당신은 물리적 거리(신체 접촉·밀집 공간)에 민감합니다. 충분한 간격을 확보할 때 안정감을 느끼는 편입니다.",
      심리적: "당신은 심리적 경계(말투·감정 개입)에 민감합니다. 감정적으로 안전한 대화 환경에서 몰입이 더 잘 됩니다.",
      온라인: "당신은 온라인 프라이버시에 민감합니다. 알림·태그·메신저 응답 강요에 피로를 느끼기 쉽습니다."
    };

    if (top.length === 1) return descs[top[0]];
    return "여러 영역에서 고르게 민감한 편입니다. 상황에 맞춰 유연하게 경계를 조절하면 더 편안해질 수 있어요.";
  }

  // 생활 가이드
  function setGuide({ physical, psychological, online }, hasData) {
    const el = document.querySelector('.guide');
    if (!hasData) {
      el.innerHTML = `<img src="images/bulb.png" alt="전구"><div>테스트를 완료하시면 생활 가이드가 표시됩니다.</div>`;
      return;
    }
    const max = Math.max(physical, psychological, online);
    let msg = '';
    if (physical === max) msg = '물리적 공간 침범에 예민하니, 대화 시 1m 이상 거리를 확보하고 불가피한 밀집 환경은 짧게 머무르세요.';
    else if (psychological === max) msg = '심리적 거리 확보를 위해 감정 강요·사생활 질문은 경계하고, 대화 전 “괜찮을 때 이야기하자”를 합의하세요.';
    else msg = '온라인 프라이버시 보호를 위해 태그 승인, 상태메시지/알림 시간제어, 개인정보 공개범위를 점검하세요.';
    el.innerHTML = `<img src="images/bulb.png" alt="전구"><div>${msg}</div>`;
  }

  // 데이터 바인딩
  function bindData() {
    const stored = loadResult();

    // 기본(미실시) 세팅
    let hasData = !!(stored && stored.pct);
    let p = 0, m = 0, o = 0;

    if (hasData) {
      p = clamp(stored.pct.physical);
      m = clamp(stored.pct.psychological);
      o = clamp(stored.pct.online);
    }

    // 게이지 바
    $('bar1').style.width = `${p}%`;
    $('bar2').style.width = `${m}%`;
    $('bar3').style.width = `${o}%`;

    // 수치 텍스트
    $('v1').textContent = `${hasData ? p : 0}점`;
    $('v2').textContent = `${hasData ? m : 0}점`;
    $('v3').textContent = `${hasData ? o : 0}점`;

    // 평균·비교
    const avg = hasData ? Math.round((p + m + o) / 3) : 0;
    $('avgScore').textContent = `${avg}점`;
    const trend = avg - 65;
    $('cmpText').textContent = hasData
      ? (trend >= 0 ? `평균보다 ${trend}점 높습니다.` : `평균보다 ${Math.abs(trend)}점 낮습니다.`)
      : '테스트를 먼저 진행해 주세요.';
    $('tri').textContent = hasData ? (trend >= 0 ? '▲' : '▼') : '-';

    // 퍼스널 스페이스 거리(m): 평균 0~100 → 0.3m~2.4m
    // 미실시 시 0m 표기 + 주황 원 숨김
    const outer = document.querySelector('.gauge .outer');
    if (hasData) {
      const distance = ((avg / 100) * (2.4 - 0.3) + 0.3).toFixed(2);
      $('gaugeTitle').textContent = `${distance}m`;
      outer.style.display = 'block';
    } else {
      $('gaugeTitle').textContent = '0m';
      outer.style.display = 'none';
    }

    // 큰 점수
    document.querySelector('.score').innerHTML = `${avg}<small>점</small>`;

    // 등급/칩
    const rankEl = document.querySelector('.rank');
    const chipEl = document.querySelector('.chip');
    if (!hasData) {
      rankEl.textContent = '-'; chipEl.textContent = '-';
    } else if (avg >= 80) {
      rankEl.textContent = '상위 10%'; chipEl.textContent = '매우 넓은 경계형';
    } else if (avg >= 65) {
      rankEl.textContent = '상위 25%'; chipEl.textContent = '넓은 경계형';
    } else if (avg >= 50) {
      rankEl.textContent = '평균형'; chipEl.textContent = '중간 경계형';
    } else {
      rankEl.textContent = '하위 50%'; chipEl.textContent = '개방형';
    }

    // 설명/가이드
    document.querySelector('.desc').textContent = hasData
      ? getDescription({ physical: p, psychological: m, online: o })
      : '테스트를 완료하시면 퍼스널 스페이스 분석 결과가 여기에 표시됩니다.';
    setGuide({ physical: p, psychological: m, online: o }, hasData);
  }

  function bindPrint() {
    const btn = document.getElementById('printBtn');
    if (btn) btn.addEventListener('click', () => window.print());
  }

  function applyResponsiveMode() {
    const ratio = window.innerWidth / window.innerHeight;
    const shouldFluid = (window.innerWidth < 1200) || (ratio < 1.25);
    document.body.classList.toggle('fluid', shouldFluid);
  }

  // 초기화
  function init() {
    bindData();
    bindPrint();
    applyResponsiveMode();
    window.addEventListener('resize', applyResponsiveMode);
    window.addEventListener('orientationchange', applyResponsiveMode);
    window.addEventListener('beforeprint', () => document.body.classList.remove('fluid'));
    window.addEventListener('afterprint', () => requestAnimationFrame(applyResponsiveMode));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
