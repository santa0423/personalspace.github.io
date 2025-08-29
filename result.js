// ===== result.js (최종 합본: 한 번만 선언) =====
(() => {
  // ------- 데이터 -------
  const data = {
    parts: { physical: 85, mental: 20, online: 20 },
    avg: 65,
    trend: +10
  };
  const clamp = v => Math.max(0, Math.min(100, v));
  const $ = id => document.getElementById(id);

  // ------- 데이터 바인딩 -------
  function bindData() {
    const bar1 = $('bar1'), bar2 = $('bar2'), bar3 = $('bar3');
    const v1 = $('v1'), v2 = $('v2'), v3 = $('v3'), avgScore = $('avgScore');
    const cmpText = $('cmpText');

    if (bar1) bar1.style.width = clamp(data.parts.physical) + '%';
    if (bar2) bar2.style.width = clamp(data.parts.mental) + '%';
    if (bar3) bar3.style.width = clamp(data.parts.online) + '%';

    if (v1) v1.textContent = data.parts.physical + '점';
    if (v2) v2.textContent = data.parts.mental + '점';
    if (v3) v3.textContent = data.parts.online + '점';
    if (avgScore) avgScore.textContent = data.avg + '점';

    if (cmpText) {
      cmpText.textContent = (data.trend >= 0)
        ? `평균보다 ${data.trend}점 높습니다.`
        : `평균보다 ${Math.abs(data.trend)}점 낮습니다.`;
    }
  }

  // ------- 인쇄 버튼 -------
  function bindPrint() {
    const btn = $('printBtn');
    if (btn) btn.addEventListener('click', () => window.print(), { once: false });
  }

  // ------- 반응형(fluid) 토글 -------
  function applyResponsiveMode() {
    const ratio = window.innerWidth / window.innerHeight;
    const shouldFluid = (window.innerWidth < 1200) || (ratio < 1.25);
    document.body.classList.toggle('fluid', shouldFluid);
  }

  // ------- 이벤트 등록(중복 방지) -------
  let inited = false;
  function initOnce() {
    if (inited) return;
    inited = true;

    bindData();
    bindPrint();
    applyResponsiveMode();

    // 화면 회전/리사이즈 시 fluid 재적용
    window.addEventListener('resize', applyResponsiveMode);
    window.addEventListener('orientationchange', applyResponsiveMode);

    // 인쇄 전/후: fluid 잠깐 해제/복귀
    window.addEventListener('beforeprint', () => {
      document.body.classList.remove('fluid');
    });
    window.addEventListener('afterprint', () => {
      requestAnimationFrame(applyResponsiveMode);
    });
  }

  // DOM 준비 후 1회 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnce, { once: true });
  } else {
    initOnce();
  }
})();
