(() => {
  const $ = id => document.getElementById(id);
  const clamp = v => Math.max(0, Math.min(100, v));

  // 1. 테스트 점수 로드 (sessionStorage 우선)
  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const physical = parseInt(params.get('physical'));
    const mental = parseInt(params.get('mental'));
    const online = parseInt(params.get('online'));

    let hasData = !isNaN(physical) && !isNaN(mental) && !isNaN(online);

    if (!hasData) {
      try {
        const stored = JSON.parse(sessionStorage.getItem('ps-result'));
        if (stored && stored.pct) {
          return {
            hasData: true,
            physical: clamp(stored.pct.physical),
            mental: clamp(stored.pct.psychological),
            online: clamp(stored.pct.online)
          };
        }
      } catch (e) {
        console.warn('세션 저장된 결과 파싱 실패', e);
      }
    }

    return {
      hasData,
      physical: clamp(physical || 0),
      mental: clamp(mental || 0),
      online: clamp(online || 0)
    };
  }

  // 2. 설명 문구 결정 함수
  function getDescription({ physical, mental, online }) {
    const scores = { 물리적: physical, 심리적: mental, 온라인: online };
    const maxScore = Math.max(physical, mental, online);
    const topAreas = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([key]) => key);

    const descriptions = {
      물리적: `당신은 **물리적 거리**에 가장 민감한 편입니다. 가까운 공간에서의 타인과의 접촉을 불편해하며, 충분한 물리적 간격을 통해 안정감을 느끼는 성향이에요.`,
      심리적: `당신은 **심리적 거리**에 민감한 성향입니다. 감정적 거리를 중시하고, 타인의 감정 개입이나 질문에 예민할 수 있어요. 감정적으로 안전한 환경을 선호합니다.`,
      온라인: `당신은 **온라인 프라이버시**에 민감합니다. 디지털 공간에서도 나의 정보와 대화가 안전하게 보호되기를 원하며, 온라인에서도 '나만의 공간'을 지키려는 경향이 강합니다.`,
    };

    if (topAreas.length === 1) {
      return descriptions[topAreas[0]];
    } else {
      return `여러 영역에서 민감한 경향이 있습니다. 물리적, 심리적, 온라인 공간에서 모두 일정 수준의 경계심을 유지하며, 상황에 따라 유동적으로 반응합니다.`;
    }
  }

  // 3. 생활 가이드 문구 설정 함수
  function setGuide({ physical, mental, online, hasData }) {
    const guideBox = document.querySelector('.guide');
    if (!hasData) {
      guideBox.innerHTML = `
        <img src="images/bulb.png" alt="전구">
        <div>테스트를 완료하시면 생활 가이드가 표시됩니다.</div>
      `;
      return;
    }

    const max = Math.max(physical, mental, online);
    let message = '';
    if (physical === max) {
      message = '물리적 공간의 침범에 예민하므로 충분한 거리를 유지하도록 하세요!';
    } else if (mental === max) {
      message = '심리적 거리 확보를 위해 감정적으로 안전한 대화를 나누는 환경을 만들어 보세요.';
    } else {
      message = '온라인에서의 프라이버시 보호를 위해 개인정보 설정을 꼼꼼히 확인하세요.';
    }

    guideBox.innerHTML = `
      <img src="images/bulb.png" alt="전구">
      <div>${message}</div>
    `;
  }

  // 4. 화면에 데이터 반영
  function bindData(data) {
    const { physical, mental, online, hasData } = data;

    // 게이지
    $('bar1').style.width = `${physical}%`;
    $('bar2').style.width = `${mental}%`;
    $('bar3').style.width = `${online}%`;

    // 수치 텍스트
    $('v1').textContent = `${physical}점`;
    $('v2').textContent = `${mental}점`;
    $('v3').textContent = `${online}점`;

    const avgScore = hasData ? Math.round((physical + mental + online) / 3) : 0;
    $('avgScore').textContent = `${avgScore}점`;

    // 비교 문구
    $('cmpText').textContent = hasData
      ? (avgScore >= 65 ? '평균보다 높습니다.' : '평균보다 낮습니다.')
      : '테스트를 먼저 진행해 주세요.';

    // 퍼스널 스페이스 거리 계산 (0.3m ~ 2.4m)
    const distance = hasData
      ? ((avgScore / 100) * (2.4 - 0.3) + 0.3).toFixed(2)
      : '-';
    $('gaugeTitle').textContent = hasData ? `${distance}m` : '-';

    // 주황 원 표시 여부
    document.querySelector('.gauge .outer').style.display = hasData ? 'block' : 'none';

    // 설명 문구
    document.querySelector('.desc').textContent = hasData
      ? getDescription(data)
      : '테스트를 완료하시면 퍼스널 스페이스 분석 결과가 여기에 표시됩니다.';

    // 상단 점수 영역 (크게)
    const scoreEl = document.querySelector('.score');
    scoreEl.innerHTML = `${avgScore}<small>점</small>`;

    // 등급 & 칩
    const rankEl = document.querySelector('.rank');
    const chipEl = document.querySelector('.chip');

    if (!hasData) {
      rankEl.textContent = '-'; chipEl.textContent = '-';
    } else if (avgScore >= 80) {
      rankEl.textContent = '상위 10%'; chipEl.textContent = '매우 넓은 경계형';
    } else if (avgScore >= 65) {
      rankEl.textContent = '상위 25%'; chipEl.textContent = '넓은 경계형';
    } else if (avgScore >= 50) {
      rankEl.textContent = '평균형'; chipEl.textContent = '중간 경계형';
    } else {
      rankEl.textContent = '하위 50%'; chipEl.textContent = '개방형';
    }

    // 생활 가이드 렌더링
    setGuide(data);
  }

  // 5. 인쇄 버튼, 반응형 처리, 초기화
  function bindPrint() {
    $('#printBtn')?.addEventListener('click', () => window.print());
  }

  function applyResponsiveMode() {
    const ratio = window.innerWidth / window.innerHeight;
    document.body.classList.toggle('fluid', window.innerWidth < 1200 || ratio < 1.25);
  }

  function initOnce() {
    const data = getParams();
    bindData(data);
    bindPrint();
    applyResponsiveMode();

    window.addEventListener('resize', applyResponsiveMode);
    window.addEventListener('orientationchange', applyResponsiveMode);
    window.addEventListener('beforeprint', () => document.body.classList.remove('fluid'));
    window.addEventListener('afterprint', () => requestAnimationFrame(applyResponsiveMode));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnce, { once: true });
  } else {
    initOnce();
  }
})();
