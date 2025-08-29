<script>
  /* ... 위쪽 기존 코드 생략 ... */

  const loadingLayer = document.getElementById('loadingLayer');

  // 문항별 도메인 매핑 (예시)
  // 물리(Physical): 5,6,7,8,14,15,20
  // 심리(Psychological): 10,11,12,16,17,19
  // 온라인(Online): 1,2,3,4,9,13,18
  const MAP = {
    physical:   [5,6,7,8,14,15,20],
    psychological: [10,11,12,16,17,19],
    online:     [1,2,3,4,9,13,18]
  };

  // 각 문항 응답 값 가져오기 (1~5)
  function collectAnswers(){
    const answers = [];
    for(let i=1; i<=20; i++){
      const checked = document.querySelector(`input[name="q${i}"]:checked`);
      answers.push( checked ? Number(checked.value) : null );
    }
    return answers;
  }

  // 카테고리 점수 계산 (합 / 평균 / 퍼센트)
  function calcScores(answers){
    const sum = (arr)=>arr.reduce((a,b)=>a+(b??0),0);
    const pick = (idxArr)=>idxArr.map(n=>answers[n-1]??0);

    const physicalVals   = pick(MAP.physical);
    const psychVals      = pick(MAP.psychological);
    const onlineVals     = pick(MAP.online);

    const maxPhysical    = MAP.physical.length    * 5;
    const maxPsych       = MAP.psychological.length*5;
    const maxOnline      = MAP.online.length      * 5;

    const sPhysical = sum(physicalVals);
    const sPsych    = sum(psychVals);
    const sOnline   = sum(onlineVals);

    const pctPhysical = Math.round(sPhysical / maxPhysical * 100);
    const pctPsych    = Math.round(sPsych / maxPsych * 100);
    const pctOnline   = Math.round(sOnline / maxOnline * 100);

    // 최대 카테고리
    const rank = [
      {key:'physical', label:'물리 민감형', score:pctPhysical},
      {key:'psychological', label:'심리 민감형', score:pctPsych},
      {key:'online', label:'온라인 민감형', score:pctOnline},
    ].sort((a,b)=>b.score-a.score);

    const top = rank[0];
    const balanced = Math.abs(rank[0].score - rank[2].score) <= 8; // 편차 작으면 균형형 처리

    return {
      raw: answers,
      sum: {physical:sPhysical, psychological:sPsych, online:sOnline},
      pct: {physical:pctPhysical, psychological:pctPsych, online:pctOnline},
      max: {physical:maxPhysical, psychological:maxPsych, online:maxOnline},
      type: balanced ? {key:'balanced', label:'균형형', score:rank[0].score} : top,
      rank
    };
  }

  // 버튼 클릭(결과)
  resultBtn.addEventListener('click', () => {
    if (resultBtn.disabled) return;

    // 응답 수집
    const answers = collectAnswers();

    // 로딩 오버레이 표시
    loadingLayer.style.display = 'flex';

    // 결과 계산 → 저장 → 결과 페이지 이동
    setTimeout(()=>{
      const result = calcScores(answers);

      // 세션 스토리지 저장 (결과 페이지에서 읽음)
      sessionStorage.setItem('ps-result', JSON.stringify(result));

      // 결과 페이지로 이동
      location.href = 'result.html';
    }, 1400); // 로딩 연출 시간
  });
</script>
