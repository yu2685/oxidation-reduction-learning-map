(function () {
  'use strict';

  var meta = window.nodeLearningMeta || { layers: {}, nodes: [] };
  var nodes = meta.nodes || [];
  var nodeById = {};
  nodes.forEach(function (item) { nodeById[item.id] = item; });

  var storageKey = 'oxidation-reduction-node-challenge-v1';
  var storageAvailable = true;
  var archive = loadArchive();
  var state = {
    view: 'home',
    archiveFilter: 'all',
    session: null,
    modalNodeId: null,
    notice: ''
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadArchive() {
    try {
      var saved = window.localStorage.getItem(storageKey);
      if (!saved) return { version: 1, nodes: {} };
      var parsed = JSON.parse(saved);
      return parsed && parsed.nodes ? parsed : { version: 1, nodes: {} };
    } catch (error) {
      storageAvailable = false;
      return { version: 1, nodes: {} };
    }
  }

  function saveArchive() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(archive));
    } catch (error) {
      storageAvailable = false;
    }
  }

  function recordFor(id) {
    if (!archive.nodes[id]) {
      archive.nodes[id] = { correct: 0, wrong: 0, streak: 0, lastResult: null, lastSeen: null };
    }
    return archive.nodes[id];
  }

  function nodeStatus(id) {
    var record = recordFor(id);
    var total = record.correct + record.wrong;
    if (!total) return 'unseen';
    if (record.streak >= 2 && record.correct >= 2) return 'provisional';
    return 'review';
  }

  function statusMeta(status) {
    if (status === 'provisional') return { name: '暂时掌握', note: '至少连续 2 次无提示正确', className: 'provisional' };
    if (status === 'review') return { name: '待巩固', note: '未达到暂时掌握或最近答错', className: 'review' };
    return { name: '未练习', note: '还没有作答证据', className: 'unseen' };
  }

  function archiveStats() {
    var stats = { provisional: 0, review: 0, unseen: 0, wrong: 0, correct: 0 };
    nodes.forEach(function (item) {
      var status = nodeStatus(item.id);
      stats[status] += 1;
      stats.wrong += recordFor(item.id).wrong;
      stats.correct += recordFor(item.id).correct;
    });
    return stats;
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function blankStatement(node) {
    if (node.statement.indexOf(node.keyword) >= 0) return node.statement.replace(node.keyword, '______');
    return node.statement + ' 核心关键词：______。';
  }

  function makeEntry(node, type, index) {
    var entry = {
      nodeId: node.id,
      type: type,
      prompt: '',
      options: [],
      correctValue: null,
      selected: null,
      response: '',
      resolved: false,
      wrongAttempts: 0
    };
    if (type === 'judge') {
      var useCorrectStatement = (index + node.id.charCodeAt(node.id.length - 1)) % 2 === 0;
      entry.prompt = useCorrectStatement ? node.statement : node.misconception;
      entry.correctValue = useCorrectStatement;
    } else {
      entry.prompt = blankStatement(node);
      entry.correctValue = node.keyword;
      if (type === 'choice') entry.options = shuffle([node.keyword].concat(node.distractors));
    }
    return entry;
  }

  function normalizeAnswer(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\s，。、“”‘’：:；;（）()]/g, '')
      .replace(/[−－]/g, '-')
      .replace(/电子的物质的量/g, 'n(e-)')
      .replace(/e−/g, 'e-');
  }

  function fillIsCorrect(node, response) {
    var accepted = [node.keyword].concat(node.aliases || []);
    var normalized = normalizeAnswer(response);
    return accepted.some(function (answer) { return normalizeAnswer(answer) === normalized; });
  }

  function updateRecord(id, correct) {
    var record = recordFor(id);
    if (correct) {
      record.correct += 1;
      record.streak += 1;
      record.lastResult = 'correct';
    } else {
      record.wrong += 1;
      record.streak = 0;
      record.lastResult = 'wrong';
    }
    record.lastSeen = new Date().toISOString();
    saveArchive();
  }

  function layerPill(node) {
    var layer = meta.layers[node.layer] || { name: node.layer, color: '#64716b' };
    return '<span class="layer-pill" style="--layer-color:' + layer.color + '">' + esc(layer.name) + '</span>';
  }

  function shell(content, active) {
    var stats = archiveStats();
    return [
      '<div class="challenge-shell">',
        '<header class="challenge-topbar">',
          '<a class="challenge-brand" href="./challenge.html"><span>关</span><div><strong>氧化还原节点闯关</strong><small>广义陈述 · 主动回忆 · 最小纠错</small></div></a>',
          '<nav>',
            '<a href="./index.html">返回知识地图</a>',
            '<a href="./path-challenge-prototype.html">路径闯关</a>',
            '<button class="nav-button ' + (active === 'archive' ? 'active' : '') + '" data-action="show-archive">学习归档</button>',
            '<span class="nav-stat">暂时掌握 <strong>' + stats.provisional + '</strong>/39</span>',
          '</nav>',
        '</header>',
        content,
        '<footer class="challenge-footer">PROTOTYPE · 记录仅保存在当前浏览器。一次正确不代表永久掌握。</footer>',
      '</div>',
      state.modalNodeId ? renderWrongModal(nodeById[state.modalNodeId]) : ''
    ].join('');
  }

  function statCard(value, name, note, className) {
    return '<article class="stat-card ' + className + '"><strong>' + value + '</strong><span>' + name + '</span><small>' + note + '</small></article>';
  }

  function renderHome() {
    var stats = archiveStats();
    var practiced = nodes.length - stats.unseen;
    var progress = Math.round(practiced / nodes.length * 100);
    var notice = state.notice ? '<div class="home-notice">' + esc(state.notice) + '</div>' : '';
    return shell([
      '<main class="challenge-home">',
        '<section class="challenge-hero">',
          '<div>',
            '<span class="prototype-label">LEARNING LOOP / PROTOTYPE</span>',
            '<h1>像背单词一样，逐个连接<br>氧化还原的核心节点</h1>',
            '<p>每轮只面对一个广义陈述。答错时只打开该节点的小卡片，不跳去刷整道题。</p>',
          '</div>',
          '<div class="hero-progress">',
            '<div><strong>' + progress + '%</strong><span>已有练习证据</span></div>',
            '<div class="progress-track"><span style="width:' + progress + '%"></span></div>',
            '<small>' + practiced + ' / 39 个节点至少作答过一次</small>',
          '</div>',
        '</section>',
        notice,
        '<section class="stats-grid">',
          statCard(stats.provisional, '暂时掌握', '连续 2 次无提示正确', 'provisional'),
          statCard(stats.review, '待巩固', '包含最近答错的节点', 'review'),
          statCard(stats.unseen, '未练习', '尚无作答证据', 'unseen'),
          statCard(stats.wrong, '累计错误', '用于安排最小复习', 'wrong'),
        '</section>',
        '<section class="start-grid">',
          '<article class="start-card primary-start">',
            '<span>混合闯关</span><h2>开始一轮主动回忆</h2>',
            '<p>填空、判断、选择交替出现。先调用广义陈述，再看具体题目。</p>',
            '<label>本轮节点数<select id="round-size"><option value="8">8 个 · 轻量</option><option value="15" selected>15 个 · 标准</option><option value="39">39 个 · 全量</option></select></label>',
            '<button class="main-action" data-action="start-session" data-mode="mixed">开始闯关</button>',
          '</article>',
          '<article class="start-card review-start">',
            '<span>错题回炉</span><h2>只练待巩固节点</h2>',
            '<p>优先重现答错或尚未形成连续正确证据的节点，不混入无关整题。</p>',
            '<div class="review-count"><strong>' + stats.review + '</strong><span>个节点等待复习</span></div>',
            '<button class="secondary-action" data-action="start-session" data-mode="review">开始复习</button>',
          '</article>',
          '<article class="start-card rules-card">',
            '<span>归档规则</span><h2>“掌握”只是暂时证据</h2>',
            '<ol><li>首次答对：仍在待巩固。</li><li>连续两次无提示正确：记为暂时掌握。</li><li>之后答错：立即回到待巩固。</li></ol>',
            '<button class="text-action" data-action="show-archive">查看 39 个节点归档 →</button>',
          '</article>',
        '</section>',
      '</main>'
    ].join(''), 'home');
  }

  function responseControls(entry) {
    if (entry.type === 'choice') {
      return '<div class="choice-grid">' + entry.options.map(function (option, index) {
        return '<button class="answer-choice ' + (entry.selected === index ? 'selected' : '') + '" data-action="select-choice" data-index="' + index + '"' + (entry.resolved ? ' disabled' : '') + '><span>' + String.fromCharCode(65 + index) + '</span>' + esc(option) + '</button>';
      }).join('') + '</div>';
    }
    if (entry.type === 'judge') {
      return '<div class="judge-grid"><button class="judge-button correct ' + (entry.selected === true ? 'selected' : '') + '" data-action="select-judge" data-value="true"' + (entry.resolved ? ' disabled' : '') + '>陈述正确</button><button class="judge-button wrong ' + (entry.selected === false ? 'selected' : '') + '" data-action="select-judge" data-value="false"' + (entry.resolved ? ' disabled' : '') + '>陈述错误</button></div>';
    }
    return '<label class="fill-answer"><span>填入核心词或关系</span><input id="fill-response" autocomplete="off" value="' + esc(entry.response) + '" placeholder="在这里填写"' + (entry.resolved ? ' disabled' : '') + '></label>';
  }

  function typeName(type) {
    return type === 'fill' ? '填空' : type === 'judge' ? '判断' : '选择';
  }

  function renderSession() {
    var session = state.session;
    if (!session || session.index >= session.entries.length) return renderSummary();
    var entry = session.entries[session.index];
    var node = nodeById[entry.nodeId];
    var record = recordFor(node.id);
    var status = statusMeta(nodeStatus(node.id));
    var percent = Math.round(session.index / session.entries.length * 100);
    var canSubmit = entry.type === 'fill' ? entry.response.trim().length > 0 : entry.selected !== null;
    var feedback = entry.resolved ? '<div class="correct-feedback"><span>连接成功</span><strong>' + esc(node.statement) + '</strong><small>当前连续正确：' + record.streak + ' 次</small></div>' : '';
    return shell([
      '<main class="session-page">',
        '<header class="session-head">',
          '<button class="exit-session" data-action="go-home">退出本轮</button>',
          '<div class="session-progress"><div><span>第 ' + (session.index + 1) + ' / ' + session.entries.length + ' 关</span><strong>' + percent + '%</strong></div><div class="progress-track"><span style="width:' + percent + '%"></span></div></div>',
          '<span class="session-score">正确 ' + session.correct + ' · 错误 ' + session.wrong + '</span>',
        '</header>',
        '<section class="challenge-question-card" style="--layer-color:' + (meta.layers[node.layer] || {}).color + '">',
          '<div class="question-card-top">' + layerPill(node) + '<span class="question-type">' + typeName(entry.type) + '</span></div>',
          '<div class="node-heading"><span>' + node.id + '</span><h1>' + esc(node.name) + '</h1></div>',
          '<p class="question-instruction">' + (entry.type === 'judge' ? '判断下面这条广义陈述是否成立' : '补全这条广义陈述中的核心连接') + '</p>',
          '<blockquote>' + esc(entry.prompt) + '</blockquote>',
          responseControls(entry),
          feedback,
          '<div class="question-actions">',
            entry.resolved
              ? '<button class="main-action" data-action="next-question">下一关</button>'
              : '<button class="main-action" data-action="submit-answer"' + (canSubmit ? '' : ' disabled') + '>确认答案</button>',
          '</div>',
          '<div class="node-evidence-line"><span class="status-dot ' + status.className + '"></span><strong>' + status.name + '</strong><span>累计正确 ' + record.correct + ' · 错误 ' + record.wrong + '</span></div>',
        '</section>',
      '</main>'
    ].join(''), 'session');
  }

  function renderWrongModal(node) {
    var record = recordFor(node.id);
    return [
      '<div class="node-card-overlay">',
        '<article class="wrong-node-card" style="--layer-color:' + (meta.layers[node.layer] || {}).color + '">',
          '<div class="wrong-card-head"><div>' + layerPill(node) + '<span class="wrong-label">本次断连点</span></div><strong>错误累计 ' + record.wrong + ' 次</strong></div>',
          '<div class="node-heading"><span>' + node.id + '</span><h2>' + esc(node.name) + '</h2></div>',
          '<section><small>必须直接说出的广义陈述</small><p class="card-statement">' + esc(node.statement) + '</p></section>',
          '<section><small>常见高考表面</small><div class="surface-chips">' + node.surfaces.map(function (surface) { return '<span>' + esc(surface) + '</span>'; }).join('') + '</div></section>',
          '<section class="misconception-box"><small>刚才容易掉入的错误陈述</small><p>' + esc(node.misconception) + '</p></section>',
          '<div class="minimum-repair"><strong>本次只做一个修补</strong><p>朗读一次广义陈述，遮住卡片后用自己的话复述，再重做当前这一小题。</p></div>',
          '<button class="main-action" data-action="retry-after-card">我理解了，重做当前题</button>',
        '</article>',
      '</div>'
    ].join('');
  }

  function renderSummary() {
    var session = state.session;
    if (!session) return renderHome();
    var uniqueMistakes = session.mistakeNodeIds.length;
    return shell([
      '<main class="summary-page">',
        '<section class="summary-card">',
          '<span class="summary-mark">完成</span><h1>这一轮连接结束</h1>',
          '<p>结果只更新当前浏览器里的练习证据，不宣布永久掌握。</p>',
          '<div class="summary-numbers"><div><strong>' + session.correct + '</strong><span>通过关卡</span></div><div><strong>' + session.wrong + '</strong><span>错误次数</span></div><div><strong>' + uniqueMistakes + '</strong><span>暴露节点</span></div></div>',
          '<div class="summary-actions"><button class="main-action" data-action="go-home">返回首页</button><button class="secondary-action" data-action="show-archive">查看学习归档</button>' + (uniqueMistakes ? '<button class="secondary-action" data-action="start-session" data-mode="mistakes">只复习本轮错点</button>' : '') + '</div>',
        '</section>',
      '</main>'
    ].join(''), 'summary');
  }

  function formatLastSeen(value) {
    if (!value) return '尚无记录';
    try { return new Date(value).toLocaleDateString('zh-CN'); } catch (error) { return '已有记录'; }
  }

  function renderArchiveCard(node) {
    var record = recordFor(node.id);
    var status = statusMeta(nodeStatus(node.id));
    var total = record.correct + record.wrong;
    var accuracy = total ? Math.round(record.correct / total * 100) + '%' : '—';
    return [
      '<article class="archive-node-card" style="--layer-color:' + (meta.layers[node.layer] || {}).color + '">',
        '<header><div><span>' + node.id + '</span><h3>' + esc(node.name) + '</h3></div><span class="archive-status ' + status.className + '">' + status.name + '</span></header>',
        '<p>' + esc(node.statement) + '</p>',
        '<div class="archive-metrics"><span>正确 <strong>' + record.correct + '</strong></span><span>错误 <strong>' + record.wrong + '</strong></span><span>正确率 <strong>' + accuracy + '</strong></span><span>' + formatLastSeen(record.lastSeen) + '</span></div>',
        '<button class="text-action" data-action="practice-node" data-id="' + node.id + '">单独练习这个节点 →</button>',
      '</article>'
    ].join('');
  }

  function renderArchive() {
    var filters = [
      { id: 'all', name: '全部 39' },
      { id: 'provisional', name: '暂时掌握' },
      { id: 'review', name: '待巩固' },
      { id: 'unseen', name: '未练习' }
    ];
    var visible = nodes.filter(function (node) { return state.archiveFilter === 'all' || nodeStatus(node.id) === state.archiveFilter; });
    return shell([
      '<main class="archive-page">',
        '<header class="archive-head"><div><span class="prototype-label">LOCAL LEARNING ARCHIVE</span><h1>39 个节点学习归档</h1><p>记录正确、错误、连续正确与最近练习；只代表当前浏览器中的证据。</p></div><button class="secondary-action" data-action="go-home">返回闯关首页</button></header>',
        '<nav class="archive-filters">' + filters.map(function (filter) { return '<button class="' + (state.archiveFilter === filter.id ? 'active' : '') + '" data-action="archive-filter" data-id="' + filter.id + '">' + filter.name + '</button>'; }).join('') + '</nav>',
        '<div class="archive-grid">' + visible.map(renderArchiveCard).join('') + '</div>',
        visible.length ? '' : '<div class="archive-empty">当前分类还没有节点。</div>',
      '</main>'
    ].join(''), 'archive');
  }

  function startSession(mode, preferredNodeId) {
    var sizeElement = document.getElementById('round-size');
    var requestedSize = sizeElement ? Number(sizeElement.value) : 15;
    var pool;
    var entryCount;
    if (preferredNodeId && nodeById[preferredNodeId]) {
      pool = [nodeById[preferredNodeId]];
      entryCount = 3;
    } else if (mode === 'mistakes' && state.session) {
      pool = state.session.mistakeNodeIds.map(function (id) { return nodeById[id]; }).filter(Boolean);
      entryCount = Math.max(pool.length, Math.min(12, pool.length * 2));
    } else if (mode === 'review') {
      pool = nodes.filter(function (node) { return nodeStatus(node.id) === 'review'; });
      if (!pool.length) {
        state.notice = '目前没有待巩固节点。先完成一轮混合闯关，系统才有证据安排复习。';
        state.view = 'home';
        render();
        return;
      }
      pool = shuffle(pool);
      entryCount = Math.max(pool.length, Math.min(requestedSize, pool.length * 2));
    } else {
      pool = shuffle(nodes);
      entryCount = Math.min(requestedSize, pool.length);
    }
    if (!pool.length) {
      state.notice = '当前没有可加入这一轮的节点。';
      state.view = 'home';
      render();
      return;
    }
    var types = ['choice', 'judge', 'fill'];
    var entries = [];
    for (var i = 0; i < entryCount; i += 1) {
      var node = pool[i % pool.length];
      var record = recordFor(node.id);
      var type = preferredNodeId ? types[i % types.length] : types[(i + record.correct + record.wrong) % types.length];
      entries.push(makeEntry(node, type, i));
    }
    state.notice = '';
    state.modalNodeId = null;
    state.session = { mode: mode, entries: entries, index: 0, correct: 0, wrong: 0, mistakeNodeIds: [] };
    state.view = 'session';
    render();
  }

  function currentEntry() {
    return state.session && state.session.entries[state.session.index];
  }

  function submitAnswer() {
    var entry = currentEntry();
    if (!entry || entry.resolved) return;
    if (entry.type === 'fill' && !entry.response.trim()) return;
    if (entry.type !== 'fill' && entry.selected === null) return;
    var node = nodeById[entry.nodeId];
    var correct = entry.type === 'fill'
      ? fillIsCorrect(node, entry.response)
      : entry.type === 'choice'
        ? entry.options[entry.selected] === entry.correctValue
        : entry.selected === entry.correctValue;
    if (correct) {
      entry.resolved = true;
      updateRecord(node.id, true);
      state.session.correct += 1;
    } else {
      entry.wrongAttempts += 1;
      entry.selected = null;
      entry.response = '';
      updateRecord(node.id, false);
      state.session.wrong += 1;
      if (state.session.mistakeNodeIds.indexOf(node.id) < 0) state.session.mistakeNodeIds.push(node.id);
      state.modalNodeId = node.id;
    }
    render();
  }

  function nextQuestion() {
    state.session.index += 1;
    if (state.session.index >= state.session.entries.length) state.view = 'summary';
    render();
  }

  function render() {
    var app = document.getElementById('challenge-app');
    if (!nodes.length) {
      app.innerHTML = '<div class="fatal-error">节点学习数据未加载。</div>';
      return;
    }
    if (state.view === 'archive') app.innerHTML = renderArchive();
    else if (state.view === 'session') app.innerHTML = renderSession();
    else if (state.view === 'summary') app.innerHTML = renderSummary();
    else app.innerHTML = renderHome();
  }

  document.getElementById('challenge-app').addEventListener('click', function (event) {
    var target = event.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');
    if (action === 'go-home') { state.view = 'home'; state.modalNodeId = null; render(); }
    else if (action === 'show-archive') { state.view = 'archive'; state.modalNodeId = null; render(); }
    else if (action === 'archive-filter') { state.archiveFilter = target.getAttribute('data-id'); render(); }
    else if (action === 'start-session') { startSession(target.getAttribute('data-mode')); }
    else if (action === 'practice-node') { startSession('node', target.getAttribute('data-id')); }
    else if (action === 'select-choice') { var choiceEntry = currentEntry(); if (choiceEntry && !choiceEntry.resolved) { choiceEntry.selected = Number(target.getAttribute('data-index')); render(); } }
    else if (action === 'select-judge') { var judgeEntry = currentEntry(); if (judgeEntry && !judgeEntry.resolved) { judgeEntry.selected = target.getAttribute('data-value') === 'true'; render(); } }
    else if (action === 'submit-answer') submitAnswer();
    else if (action === 'next-question') nextQuestion();
    else if (action === 'retry-after-card') { state.modalNodeId = null; render(); }
  });

  document.getElementById('challenge-app').addEventListener('input', function (event) {
    if (event.target.id !== 'fill-response') return;
    var entry = currentEntry();
    if (entry && !entry.resolved) {
      entry.response = event.target.value;
      var submit = document.querySelector('[data-action="submit-answer"]');
      if (submit) submit.disabled = !entry.response.trim();
    }
  });

  document.getElementById('challenge-app').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.id === 'fill-response') {
      event.preventDefault();
      submitAnswer();
    }
  });

  var requestedNode = new URL(window.location.href).searchParams.get('node');
  if (requestedNode && nodeById[requestedNode]) startSession('node', requestedNode);
  else render();
})();
