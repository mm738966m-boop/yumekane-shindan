/* ==========================================
   ユメカネお金の診断室 - 診断ロジック
========================================== */

// ==========================================
// 設定値（あとで変更しやすい場所）
// ==========================================
const CONFIG = {
  // LINE登録URL（ユメカネお金の診断室・公式LINE）
  LINE_REGISTER_URL: 'https://lin.ee/Tpi8Xg3',

  // サイトURL（シェア用、Netlifyデプロイ後に実URLに差し替え）
  SITE_URL: 'https://yumekane-shindan.netlify.app',

  // サイト名
  SITE_NAME: 'ユメカネお金の診断室',
};

// ==========================================
// 8問の質問データ
// ==========================================
const QUESTIONS = [
  {
    icon: '🌴',
    text: 'もしも、明日から3日間お休みがもらえたら…',
    options: [
      { text: 'ぱーっと旅行に出かけたい', axis: 'A' },              // 行動派
      { text: 'わくわく計画を立てる時間にしたい', axis: 'B' },       // 慎重派
      { text: '家でゆっくり、何もしない時間を満喫', axis: 'B' },     // 慎重派
      { text: '大切な人を誘って、何かしたい', axis: 'A' },           // 行動派
    ]
  },
  {
    icon: '🎁',
    text: '大切な人へのプレゼント、選び方は…',
    options: [
      { text: 'その人が好きそうなものをじっくり考える', axis: 'D' },  // 家族軸
      { text: '自分が「これ素敵」と思うものを贈る', axis: 'C' },      // 自分軸
      { text: '一緒にお店をまわって選ぶ時間も楽しむ', axis: 'D' },    // 家族軸
      { text: '長く愛用してもらえる、上質なものを', axis: 'C' },      // 自分軸
    ]
  },
  {
    icon: '🍑',
    text: 'もしも、桃太郎みたいに鬼ヶ島へ行くことになったら…',
    options: [
      { text: '仲間を集めて、すぐ出発!', axis: 'F' },               // 攻め
      { text: 'しっかり準備してから出かける', axis: 'E' },          // 守り
      { text: 'できれば、安全な場所で待っていたい', axis: 'E' },    // 守り
      { text: 'きびだんごをいっぱい持っていく(笑)', axis: 'F' },    // 攻め
    ]
  },
  {
    icon: '🏠',
    text: '家族や友達と過ごす休日、近いのは…',
    options: [
      { text: 'みんなでお出かけ、にぎやかが好き', axis: 'D' },       // 家族軸
      { text: '自分の時間も大事にしたい', axis: 'C' },              // 自分軸
      { text: 'おうちでまったり、一緒の空間を楽しむ', axis: 'D' },  // 家族軸
      { text: '一人でリフレッシュタイムが必要', axis: 'C' },        // 自分軸
    ]
  },
  {
    icon: '✨',
    text: 'もしも、ひとつだけ魔法が使えるとしたら…',
    options: [
      { text: '大切な人を笑顔にする魔法', axis: 'E' },              // 守り
      { text: '自分の夢を叶える魔法', axis: 'F' },                  // 攻め
      { text: '毎日が少し豊かになる魔法', axis: 'E' },              // 守り
      { text: '困っている人を助ける魔法', axis: 'F' },              // 攻め
    ]
  },
  {
    icon: '💭',
    text: '「やりたい」と思ったことに対して、あなたは…',
    options: [
      { text: '思い立ったら、もう動き始めてる', axis: 'A' },        // 行動派
      { text: 'まずはじっくり調べてから', axis: 'B' },              // 慎重派
      { text: 'タイミングを待つタイプ', axis: 'B' },                // 慎重派
      { text: '誰かと相談しながら決める', axis: 'A' },              // 行動派
    ]
  },
  {
    icon: '⭐',
    text: 'もしも、織姫みたいに大切な人と年に一度しか会えないなら…',
    options: [
      { text: 'その日のために、毎日ワクワク準備する', axis: 'F' },   // 攻め
      { text: '会える日を静かに待ち続ける', axis: 'E' },             // 守り
      { text: 'サプライズで会いに行ってしまう(笑)', axis: 'F' },     // 攻め
      { text: '手紙やプレゼントで気持ちを伝え続ける', axis: 'E' },   // 守り
    ]
  },
  {
    icon: '🌅',
    text: '10年後の自分、どんな笑顔でいたい?',
    options: [
      { text: '家族みんなで笑い合っている', axis: 'B' },            // 慎重派
      { text: '自分らしく、好きなことをしている', axis: 'A' },      // 行動派
      { text: '大切な人を、見守る存在になっている', axis: 'B' },    // 慎重派
      { text: '新しいことに挑戦し続けている', axis: 'A' },          // 行動派
    ]
  }
];

// ==========================================
// 8タイプの結果データ
// ==========================================
const RESULT_TYPES = {
  'A-C-F': {  // 行動派 × 自分軸 × 攻め
    id: 'momotaro',
    name: '桃太郎タイプ',
    emoji: '🍑',
    tagline: '目標決めたら、鬼ヶ島まで走るタイプ',
    image: 'images/01_momotaro.png',
    morikawaMessage: '桃太郎タイプは、エンジン全開で走れる人。でも、走る方向を間違えると、無駄に体力を使っちゃうんですよ。月に1回でいいから、地図を確認する時間を作りましょう。鬼ヶ島へ向かう前に、犬・猿・雉を集めるのと同じです。あなたの行動力に「正しい方向」がプラスされたら、そのお金、すごく頼もしいパートナーになりますよ。'
  },
  'A-C-E': {  // 行動派 × 自分軸 × 守り
    id: 'kintaro',
    name: '金太郎タイプ',
    emoji: '🌿',
    tagline: 'お金より、まず体。健康優良児タイプ',
    image: 'images/02_kintaro.png',
    morikawaMessage: '金太郎タイプは、自分の軸がしっかりある人。「お金より体が大事」って分かっているのは、本当に素敵なこと。ただね、せっかくの行動力を、もうちょっとお金にも向けてみませんか?健康と同じくらい、お金も「習慣」が大事なんです。NISA、まずは1,000円からでもいいから、始めてみよう。'
  },
  'A-D-F': {  // 行動派 × 家族軸 × 攻め
    id: 'warashibe',
    name: 'わらしべ長者タイプ',
    emoji: '🌾',
    tagline: '人脈が、なぜかお金になる人',
    image: 'images/03_warashibe.png',
    morikawaMessage: 'わらしべ長者タイプは、人とのご縁を活かせる才能の持ち主。家族や周りの人を巻き込んで、なぜかお金が回っていく…そんな不思議な力を持っています。ただね、「これ儲かるよ」って話には要注意。あなたの優しさが、変なやつに利用されないように。判断に迷ったら、必ず信頼できる人に相談してくださいね。'
  },
  'A-D-E': {  // 行動派 × 家族軸 × 守り
    id: 'otohime',
    name: '乙姫タイプ',
    emoji: '🐢',
    tagline: 'おもてなしの天才。気づいたら竜宮城ができてる',
    image: 'images/08_otohime.png',
    morikawaMessage: '乙姫タイプは、人を喜ばせる天才。家族や友達の好みを覚えていて、おもてなしすることに喜びを感じる人。でもね、ちょっと自分を後回しにしすぎてませんか?玉手箱(後悔の種)は絶対に開けないでください。あなた自身のためのお金も、ちゃんと確保してあげて。それが結局、長く周りを幸せにすることに繋がります。'
  },
  'B-C-F': {  // 慎重派 × 自分軸 × 攻め
    id: 'kaguyahime',
    name: 'かぐや姫タイプ',
    emoji: '🌙',
    tagline: '安いものより、本物が好き',
    image: 'images/05_kaguyahime.png',
    morikawaMessage: 'かぐや姫タイプは、本物を見極める目がある人。安いものを大量に買うより、長く愛せる一つを選ぶ。その価値観、すごく大切です。投資も「これ」と決めたものに集中投下するタイプ。決めるまでが長いけど、決めたら強い。月から迎えが来そうな雰囲気もあるけど(笑)、その独自性こそがあなたの最大の武器ですよ。'
  },
  'B-C-E': {  // 慎重派 × 自分軸 × 守り
    id: 'issunboshi',
    name: '一寸法師タイプ',
    emoji: '🌾',
    tagline: '小さく始めて、確実に積む人',
    image: 'images/04_issunboshi.png',
    morikawaMessage: '一寸法師タイプは、コツコツ系の優等生。月3,000円から始めた積立を、気づいたら10年続けていた…そんな静かな強さがある人。ただね、慎重すぎて機会を逃すこともあるんですよ。打ち出の小槌(=思い切り)を、たまには振ってみてください。あなたの真面目さがあれば、ちょっとした冒険も必ず実を結びます。'
  },
  'B-D-F': {  // 慎重派 × 家族軸 × 攻め
    id: 'orihime',
    name: '織姫タイプ',
    emoji: '⭐',
    tagline: '年に一度の再会のために、365日計画する人',
    image: 'images/07_orihime.png',
    morikawaMessage: '織姫タイプは、夢を数字に落とせる人。逆算思考で家族の未来を見据えている、本当に頼もしいタイプ。カレンダーとスプレッドシートが恋人(笑)というくらい計画的。ただね、たまには彦星(パートナー)と「計画じゃない時間」を過ごしてください。予想外の出費が来た時のために、心の余白も大事に。'
  },
  'B-D-E': {  // 慎重派 × 家族軸 × 守り
    id: 'tsuru',
    name: '鶴の恩返しタイプ',
    emoji: '🪶',
    tagline: '黙って家族を支える、見えない天才',
    image: 'images/06_tsuru.png',
    morikawaMessage: '鶴の恩返しタイプは、家族のために黙って尽くせる人。家計簿はキッチリ、自分のものは何年も買ってない…そんなあなたに、伝えたいことがあります。あなた自身にも、ちゃんとお金を使ってあげてください。「私のことはいいから」じゃなくて、「私もね」って言ってみよう。それが、家族をもっと笑顔にする秘訣です。'
  }
};

// ==========================================
// 状態管理
// ==========================================
let currentQuestionIndex = 0;
let userAnswers = [];  // 各質問の axis を記録: ['A', 'D', 'F', ...]
let currentResult = null;

// ==========================================
// 画面遷移
// ==========================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen-active'));
  document.getElementById(screenId).classList.add('screen-active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startDiagnosis() {
  currentQuestionIndex = 0;
  userAnswers = [];
  showQuestion(0);
  showScreen('screen-question');
}

function showQuestion(index) {
  const question = QUESTIONS[index];
  if (!question) return;

  // 進捗バー更新
  document.getElementById('current-question-num').textContent = index + 1;
  document.getElementById('progress-fill').style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;

  // アイコン更新
  document.getElementById('question-icon').textContent = question.icon;

  // 質問テキスト更新
  document.getElementById('question-text').textContent = question.text;

  // 選択肢を生成
  const optionsContainer = document.getElementById('answer-options');
  optionsContainer.innerHTML = '';

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.className = 'answer-option';

    // 既に回答済みの場合、選択状態を復元
    if (userAnswers[index] && userAnswers[index].selectedIndex === optionIndex) {
      button.classList.add('selected');
    }

    button.innerHTML = `<span>${option.text}</span>`;
    button.onclick = () => selectAnswer(index, optionIndex, option.axis);
    optionsContainer.appendChild(button);
  });

  // 戻るボタンの状態
  const backButton = document.getElementById('back-button');
  backButton.disabled = index === 0;

  currentQuestionIndex = index;
}

function selectAnswer(questionIndex, optionIndex, axis) {
  // 回答を記録
  userAnswers[questionIndex] = { selectedIndex: optionIndex, axis: axis };

  // 選択状態を反映
  const options = document.querySelectorAll('.answer-option');
  options.forEach((opt, i) => {
    if (i === optionIndex) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });

  // 少し待ってから次の質問へ
  setTimeout(() => {
    if (questionIndex < QUESTIONS.length - 1) {
      showQuestion(questionIndex + 1);
    } else {
      // 全質問完了 → 判定 → LINE登録画面へ
      calculateResult();
      showScreen('screen-line-register');
    }
  }, 350);
}

function goBack() {
  if (currentQuestionIndex > 0) {
    showQuestion(currentQuestionIndex - 1);
  }
}

// ==========================================
// 結果計算（多数決方式）
// ==========================================
function calculateResult() {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  userAnswers.forEach(answer => {
    if (answer && answer.axis) {
      counts[answer.axis]++;
    }
  });

  // 各軸の多数決
  // 軸1：A(行動派) vs B(慎重派)
  // 軸2：C(自分軸) vs D(家族軸)
  // 軸3：E(守り) vs F(攻め)

  // 同点処理：軸2のデフォルトは家族軸(D)、軸3のデフォルトは攻め(F)
  let axis1, axis2, axis3;

  if (counts.A > counts.B) axis1 = 'A';
  else if (counts.B > counts.A) axis1 = 'B';
  else axis1 = userAnswers[userAnswers.length - 1].axis === 'A' ? 'A' : 'B';

  if (counts.C > counts.D) axis2 = 'C';
  else if (counts.D > counts.C) axis2 = 'D';
  else axis2 = 'D';  // 同点ならデフォルトで家族軸

  if (counts.E > counts.F) axis3 = 'E';
  else if (counts.F > counts.E) axis3 = 'F';
  else axis3 = 'F';  // 同点ならデフォルトで攻め

  const resultKey = `${axis1}-${axis2}-${axis3}`;
  currentResult = RESULT_TYPES[resultKey];

  // localStorage に結果を保存（7日間有効）
  try {
    const savedData = {
      resultKey: resultKey,
      timestamp: Date.now()
    };
    localStorage.setItem('yumekane_shindan_result', JSON.stringify(savedData));
  } catch (e) {
    console.warn('localStorage保存エラー:', e);
  }

  // デバッグ用ログ
  console.log('診断結果:', { counts, resultKey, currentResult });
}

// ==========================================
// 保存済み結果の復元（LINEから戻ってきた時用）
// ==========================================
function loadSavedResult() {
  try {
    const savedJson = localStorage.getItem('yumekane_shindan_result');
    if (!savedJson) return false;

    const saved = JSON.parse(savedJson);
    const ageInDays = (Date.now() - saved.timestamp) / (1000 * 60 * 60 * 24);

    // 7日以上経過していたら無効
    if (ageInDays > 7) {
      localStorage.removeItem('yumekane_shindan_result');
      return false;
    }

    const result = RESULT_TYPES[saved.resultKey];
    if (result) {
      currentResult = result;
      return true;
    }
    return false;
  } catch (e) {
    console.warn('localStorage読み込みエラー:', e);
    return false;
  }
}

// ==========================================
// 結果表示
// ==========================================
function showResult() {
  if (!currentResult) {
    calculateResult();
  }

  // 結果データを画面に反映
  document.getElementById('result-type-name').textContent = currentResult.name;
  document.getElementById('result-type-tagline').textContent = currentResult.tagline;
  document.getElementById('result-image').src = currentResult.image;
  document.getElementById('result-image').alt = currentResult.name;
  document.getElementById('result-morikawa-message').textContent = currentResult.morikawaMessage;

  // CTAボタンにLINE登録URLを設定
  document.getElementById('result-line-cta').href = CONFIG.LINE_REGISTER_URL;

  showScreen('screen-result');
}

// LINE登録ボタンクリック処理
function trackLineRegister() {
  // 結果を計算しておく(まだの場合)
  if (!currentResult) {
    calculateResult();
  }

  // LINE登録URLへ遷移
  if (CONFIG.LINE_REGISTER_URL && CONFIG.LINE_REGISTER_URL !== '#') {
    window.location.href = CONFIG.LINE_REGISTER_URL;
  } else {
    // URL未設定の場合は結果画面へ進む
    alert('LINE登録URLが設定されていません。一旦結果を表示します。');
    showResult();
  }
}

// LINE登録案内画面のボタンクリック時もURL設定 + LINEから戻ってきた場合の処理
document.addEventListener('DOMContentLoaded', () => {
  const lineButton = document.getElementById('line-register-button');
  if (lineButton) {
    lineButton.href = CONFIG.LINE_REGISTER_URL;
  }

  // URLパラメータをチェック（LINE経由のリターンか）
  const urlParams = new URLSearchParams(window.location.search);
  const fromLine = urlParams.get('from') === 'line' || urlParams.has('result');

  // LINEから戻ってきた、または直接結果ページへのアクセス
  if (fromLine) {
    if (loadSavedResult()) {
      showResult();
    } else {
      // 結果が見つからない場合のメッセージ
      showMissingResultMessage();
    }
  }
});

// 結果が見つからない場合の案内
function showMissingResultMessage() {
  // スタート画面に遷移して、注意メッセージを表示
  showScreen('screen-start');
  setTimeout(() => {
    alert('結果データが見つかりませんでした。\n申し訳ありませんが、もう一度診断を受けてください🌷');
  }, 500);
}

// ==========================================
// シェア機能
// ==========================================
function shareToLine() {
  if (!currentResult) return;
  const text = `私は${currentResult.name}!\n「${currentResult.tagline}」\n\nあなたはどのタイプ?\n${CONFIG.SITE_NAME}`;
  const url = `https://line.me/R/share?text=${encodeURIComponent(text + '\n' + CONFIG.SITE_URL)}`;
  window.open(url, '_blank');
}

function shareToX() {
  if (!currentResult) return;
  const text = `私は${currentResult.name}!\n「${currentResult.tagline}」\n\nあなたはどのタイプ?\n#ユメカネお金の診断室 #お金タイプ`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(CONFIG.SITE_URL)}`;
  window.open(url, '_blank');
}

function shareToThreads() {
  if (!currentResult) return;
  const text = `私は${currentResult.name}!\n「${currentResult.tagline}」\n\nあなたはどのタイプ?\n${CONFIG.SITE_URL}\n\n#ユメカネお金の診断室 #お金タイプ`;
  const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareToInstagram() {
  if (!currentResult) return;
  // Instagramは公式のシェアURL APIがないため、URLをコピーしてユーザーに案内
  const text = `私は${currentResult.name}!\n「${currentResult.tagline}」\n\nあなたはどのタイプ?\n${CONFIG.SITE_URL}\n\n#ユメカネお金の診断室 #お金タイプ`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('テキストをコピーしました🌷\nInstagramを開いて貼り付けてください');
    }).catch(() => {
      fallbackCopyText(text);
      showToast('テキストをコピーしました🌷\nInstagramを開いて貼り付けてください');
    });
  } else {
    fallbackCopyText(text);
    showToast('テキストをコピーしました🌷\nInstagramを開いて貼り付けてください');
  }
}

function copyResultUrl() {
  const textToCopy = `私は${currentResult.name}!\n「${currentResult.tagline}」\n\nあなたはどのタイプ? ${CONFIG.SITE_URL}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('コピーしました🌷');
    }).catch(err => {
      fallbackCopyText(textToCopy);
    });
  } else {
    fallbackCopyText(textToCopy);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('コピーしました🌷');
  } catch (err) {
    showToast('コピーに失敗しました');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==========================================
// 診断やり直し
// ==========================================
function restartDiagnosis() {
  currentQuestionIndex = 0;
  userAnswers = [];
  currentResult = null;
  showScreen('screen-start');
}
