(function () {
  'use strict';

  function type(id, name, color, use, cues, nodes, connection, transfer, options, repair) {
    return { id: id, name: name, color: color, use: use, cues: cues, nodes: nodes, connection: connection, transfer: transfer, options: options, repair: repair };
  }

  var types = [
    type('F1', '化工流程题', '#6f7d35', '从原料沿流程得到目标产品，解释浸取、转化、除杂、分离和收率。', ['矿石或废料', '流程框图', '浸取/除杂/结晶'], ['锁定目标产品', '追踪目标元素载体', '解释单元操作', '写关键反应与计量', '核验纯度、收率和表达'], '目标元素载体决定当前物种；当前物种和条件决定操作与反应；反应计量再连接到产品指标。', '流程中加入一种新试剂，第一步最该判断什么？', ['它使目标元素载体或杂质发生了什么实际变化', '先把它记作氧化剂', '先计算整条流程总收率', '只根据试剂名称写用途'], '只画三格：该步前目标元素载体 → 加入试剂后的实际变化 → 该步后载体。'),
    type('F2', '实验综合与探究题', '#b47527', '设计、补全或评价实验方案，并用现象或数据支持有边界的结论。', ['实验装置', '探究目的', '对照组/现象/数据'], ['改写实验目的', '确定变量与对照', '逐段追踪装置物质流', '记录原始证据', '形成有限结论并评价误差'], '目的决定变量；变量决定装置和操作；原始证据只能支持与对照排除范围一致的结论。', '两组实验出现不同现象，最先检查什么？', ['除自变量外是否保持了可比条件', '哪组现象更明显', '是否使用了更多仪器', '直接接受预设结论'], '只写一张变量表：自变量 1 个、因变量 1 个、必须相同的控制变量 2 个。'),
    type('F3', '化学反应原理综合题', '#39776f', '综合处理热化学、速率、平衡、图像和条件优化。', ['ΔH/K/速率常数', '平衡组成', '温度压强图像'], ['明确体系、状态与目标量', '写反应并统一计量基准', '选择热力学/速率/平衡模型', '列式或读图求量', '用条件边界检查结论'], '体系与反应式限定模型；模型把条件连接到可计算量；所得数值必须回到题给状态和适用边界。', '升高温度后反应更快，能否直接推出平衡正向移动？', ['不能，应分别判断速率变化和平衡组成变化', '能，变快就是正向移动', '只看催化剂是否存在', '只比较反应物总质量'], '画两行：瞬时正逆速率怎样变；新平衡组成怎样变。两行禁止互相替代。'),
    type('F4', '原电池、电解池与新型电池题', '#2f7283', '判断电极过程、电子与离子方向，并完成电量或物料定量。', ['充放电/电解', '电极材料与膜', '电流、电量或容量'], ['判定工作状态与装置类型', '按实际变化定阴阳极', '写并配平半反应', '连接电子流与离子迁移', '用电子计量求目标量并复核'], '实际氧化还原变化定义电极；半反应给出电子数；电中性和外电路共同限定迁移与定量。', '遇到可充电电池的“充电”过程，第一步做什么？', ['先确认题目讨论充电还是放电，再按实际反应重定电极', '沿用放电时所有正负极结论', '只看电极材料名称', '先套 Q=nF 计算'], '只写两条半反应，并在旁边标“氧化/还原”；暂不写正负极和离子方向。'),
    type('F5', '有机合成与推断题', '#a94f75', '由分子式、谱图、反应网络或限定原料推断结构并设计合成路线。', ['有机反应网络', '限定原料', '分子式/谱学信号'], ['提取目标结构约束', '追踪碳骨架和原子映射', '定位官能团变化与反应位点', '逆向断键再正向安排条件', '核验结构、原子守恒和副产物'], '结构约束缩小候选；原子映射锁定骨架；官能团和条件决定可实现的成键断键。', '设计路线卡住时，最小的逆向动作是什么？', ['从目标物最关键的新键断开，寻找一步可得的直接前体', '从所有原料随机尝试反应', '先背更多物质名称', '只追求步骤最多'], '只圈目标物的一根关键新键，写出“断开后两块可能来自什么官能团”。'),
    type('F6', '物质结构与性质题', '#715da2', '从电子结构、成键、空间构型或晶体结构解释性质并完成晶胞计算。', ['电子排布/杂化', 'VSEPR/键角', '晶胞/熔沸点/导电性'], ['确定研究对象和结构层级', '写电子结构或成键信息', '得到构型、晶体或配位特征', '连接相互作用与宏观性质', '用共享规则或比较变量核验'], '研究对象决定结构层级；结构决定相互作用；相互作用才是连接宏观性质的中间桥。', '比较两种物质熔点时，哪种回答路径更完整？', ['先判结构类型，再比较主导作用及强弱，最后落到熔点', '只比较相对分子质量', '只写它们属于同一周期', '直接背诵熔点大小'], '强制写三格：“结构特征 → 主导作用 → 目标性质”，每格只准一个短语。'),
    type('F7', '无机物制备与元素化合物综合题', '#7c7135', '完成物质制备、无机推断、性质验证和条件化反应表达。', ['陌生物制备', '元素转化网络', '过量少量/酸碱条件'], ['锁定目标物和元素载体', '写实际粒子及题给条件', '选择产物并写关键反应', '安排分离、收集和保存', '用现象、纯度或产率检查'], '载体与条件共同决定产物；产物性质决定后续分离保存；现象只能作为有限证据回查路径。', '同一反应物可能生成不同产物时，先补哪类信息？', ['介质、用量、浓度、温度或通入顺序', '元素所在周期', '仪器数量', '化学式长度'], '把记忆中的方程式遮住，只列“反应物 + 条件 → 候选产物”，先做产物选择。'),
    type('F8', '滴定、定量分析与误差题', '#5a6884', '把样品处理、终点读数、反应计量和结果误差连成可追溯计算链。', ['滴定曲线/终点', '纯度或含量', '返滴定/误差判断'], ['明确待测量与样品处理', '建立终点反应计量关系', '把读数换成标准液物质的量', '逐级换算待测结果', '沿计算式传播误差并检查单位'], '终点定义有效反应量；反应系数连接标准液和待测物；原始读数的偏差沿同一计算链传到结果。', '某操作导致结果偏高，第一步应追踪什么？', ['它最先改变哪个原始读数或实际反应量', '直接套仰小俯大', '只看最终答案正负号', '重做整套试卷'], '只画“操作 → 原始量↑↓ → n(标准液)↑↓ → 待测结果↑↓”。'),
    type('F9', '图表数据与模型建构题', '#4f7185', '从表格、曲线或多变量材料中提取关系、选择模型并给出有边界的解释。', ['多曲线图', '数据表格', '拟合关系/异常点'], ['读清横纵轴、单位和分组', '区分自变量、因变量与控制量', '选择差值、比值、守恒或平衡模型', '解释趋势、拐点和异常', '限制结论范围并提出复测'], '坐标和变量定义数据含义；模型把数据变成关系；异常与适用范围决定结论能说到哪里。', '两条曲线不同，最先比较什么？', ['两组除目标变量外的条件、坐标和单位是否一致', '哪条曲线颜色更深', '直接判断机理不同', '只比较最后一个点'], '先遮住题目结论，只写：横轴、纵轴、分组变量、一个必须控制的量。')
  ];

  var gates = [
    { name: '认题型', prompt: '哪个题面信号最应启动这条路径？', gap: '题面信号到路径调用' },
    { name: '搭主干', prompt: '按解题顺序放置下一个桥墩。', gap: '路径节点的顺序调用' },
    { name: '说连接', prompt: '为什么这些桥墩可以这样连接？', gap: '节点间的因果关系' },
    { name: '找断桥', prompt: '缺失哪一步会最早让后续路径失效？', gap: '最早缺失桥段定位' },
    { name: '换表面', prompt: '题面变化后，底层路径怎样重新调用？', gap: '同模型迁移调用' }
  ];
  var storageKey = 'chemistry-subjective-type-challenge-v1';
  var archive = loadArchive();
  var state = { view: 'home', typeId: null, gate: 0, assembled: [], selected: null, feedback: null, hint: 0, attempts: 0, wrong: 0, support: 0, candidateGap: null };

  function esc(value) { return String(value == null ? '' : value).replace(/[&<>\"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function loadArchive() { try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (error) { return {}; } }
  function saveArchive() { try { localStorage.setItem(storageKey, JSON.stringify(archive)); } catch (error) {} }
  function recordFor(id) { if (!archive[id]) archive[id] = { completed: 0, wrong: 0, support: 0, lastSeen: null }; return archive[id]; }
  function currentType() { return types.find(function (item) { return item.id === state.typeId; }); }
  function resetFor(id) { state = { view: 'play', typeId: id, gate: 0, assembled: [], selected: null, feedback: null, hint: 0, attempts: 0, wrong: 0, support: 0, candidateGap: null }; render(); }
  function expected() { var item=currentType(); if (state.gate===0) return item.cues[0]; if (state.gate===1) return item.nodes[state.assembled.length]; if (state.gate===2) return item.connection; if (state.gate===3) return item.nodes[2]; return item.options[0]; }
  function choices() { var item=currentType(); if (state.gate===0) return [item.cues[0],'看到熟悉物质就套结论','先计算所有给出的数值','按试卷题号选择路径']; if (state.gate===1) return item.nodes; if (state.gate===2) return [item.connection,'它们属于同一章，所以自然相连','只要背住顺序就不需要说明条件','后一个词更像标准答案']; if (state.gate===3) return [item.nodes[2],item.nodes[0],item.nodes[4],item.nodes[1]]; return item.options; }
  function answer(value) {
    var item=currentType(); var ok=value===expected(); state.attempts+=1; state.selected=value;
    if (ok) {
      if (state.gate===1) { state.assembled.push(value); if (state.assembled.length<item.nodes.length) { state.feedback={ok:true,partial:true,text:'这个桥墩位置成立，继续选择下一个。'}; state.selected=null; render(); return; } }
      state.feedback={ok:true,text:['已用任务信号启动路径。','主干顺序已经搭好。','已说出连接理由。','已定位最早缺失桥段。','换表面后重新调用了路径。'][state.gate]}; state.support+=1; state.candidateGap=null; recordFor(item.id).support+=1; saveArchive();
    } else {
      state.feedback={ok:false,text:'当前选择不能完成这一桥段，只记录为本轮候选偏离。'}; state.wrong+=1; state.candidateGap=gates[state.gate].gap; recordFor(item.id).wrong+=1; saveArchive();
    }
    render();
  }
  function next() { if (!state.feedback || !state.feedback.ok || state.feedback.partial) return; if (state.gate===4) { var record=recordFor(state.typeId); record.completed+=1; record.lastSeen=new Date().toISOString(); saveArchive(); state.view='complete'; } else { state.gate+=1; state.assembled=[]; state.selected=null; state.feedback=null; state.hint=0; } render(); }
  function bridge(item) { return '<div class="bridge">'+item.nodes.map(function (node,index) { var visible=state.gate!==1||state.assembled.indexOf(node)>=0; if(state.gate===3&&index===2) visible=false; return (index?'<span class="bridge-arrow">→</span>':'')+'<div class="pier"><small>'+(index+1)+'</small><strong>'+esc(visible?node:'待补桥墩')+'</strong></div>'; }).join('')+'</div>'; }
  function shell(content) { return '<header class="topbar"><a class="brand" href="./subjective-challenge.html"><span class="brand-mark">型</span><div><strong>高考化学主观题型闯关</strong><small>认题型 · 搭主干 · 找断桥 · 最小修补</small></div></a><nav><a href="./index.html">知识地图</a><a href="./challenge.html">节点闯关</a><a href="./path-challenge-prototype.html">氧化还原路径闯关</a></nav></header>'+content; }
  function home() {
    var practiced=types.filter(function(item){var r=recordFor(item.id);return r.completed||r.wrong||r.support;}).length;
    return shell('<main class="page"><section class="hero"><div><span class="eyebrow">SUBJECTIVE ARCHETYPE BRIDGE</span><h1>看见主观题，先知道该搭哪座桥</h1><p>首批 9 类不是按物质名称死记题型，而是训练从题面信号启动一条可执行路径；答错后只修最早断开的桥段。</p></div><aside><strong>'+practiced+' / '+types.length+'</strong><span>类题型已有练习证据</span><small>一次完成只记一次过程支持，不宣布永久掌握。</small></aside></section><div class="evidence-note"><strong>分类边界：</strong>不同省份会把多个模块融合在同一道大题中。本页采用“主任务路径”分类；遇到融合题可以连续调用两条或更多路径。</div><section class="type-grid">'+types.map(function(item){var r=recordFor(item.id);return '<article class="type-card" style="--type-color:'+item.color+'"><header><span class="type-id">'+item.id+'</span><span class="record-pill">完成 '+r.completed+' · 错 '+r.wrong+'</span></header><h2>'+esc(item.name)+'</h2><p>'+esc(item.use)+'</p><div class="cue-list">'+item.cues.map(function(cue){return '<span>'+esc(cue)+'</span>';}).join('')+'</div><button class="start-button" data-start="'+item.id+'">开始搭桥</button></article>';}).join('')+'</section></main>');
  }
  function play() {
    var item=currentType(); var prompt=state.gate===4?item.transfer:gates[state.gate].prompt; var feedback=state.feedback?'<div class="feedback '+(state.feedback.ok?'ok':'wrong')+'"><strong>'+(state.feedback.ok?'当前桥段成立':'出现候选断连')+'</strong><p>'+esc(state.feedback.text)+'</p></div>':''; var repair=state.feedback&&!state.feedback.ok?'<div class="repair"><strong>本次最小修补</strong><p>'+esc(item.repair)+'</p></div>':''; var hint=state.hint?'<div class="hint"><strong>渐进提示 I'+state.hint+'</strong><p>'+(state.hint===1?'只看这类题的任务：'+esc(item.use):'主干依次是：'+item.nodes.map(esc).join(' → ')+'。仍请自己完成当前选择。')+'</p></div>':'';
    return shell('<main class="page"><div class="challenge-layout"><aside class="type-nav"><h2>选择主观题型</h2><p>融合题可完成多条路径。</p><div>'+types.map(function(t){return '<button class="'+(t.id===item.id?'active':'')+'" style="--type-color:'+t.color+'" data-start="'+t.id+'"><strong>'+t.id+' · '+esc(t.name)+'</strong><small>'+esc(t.cues[0])+'</small></button>';}).join('')+'</div></aside><section class="stage" style="--type-color:'+item.color+'"><header class="stage-head"><div><span class="eyebrow">'+item.id+' · SUBJECTIVE PATH</span><h1>'+esc(item.name)+'</h1><p>'+esc(item.use)+'</p></div><div class="gate-count"><strong>'+(state.gate+1)+'</strong><span>/ 5 关</span></div></header><div class="gate-rail">'+gates.map(function(g,i){return '<button class="'+(i===state.gate?'active':i<state.gate?'done':'')+'">'+(i+1)+'. '+g.name+'</button>';}).join('')+'</div><div class="stage-body"><div class="prompt"><small>'+gates[state.gate].name+'</small><h2>'+esc(prompt)+'</h2><p>'+esc(state.gate===2?'连接必须包含方向和理由，不能只说“相关”。':state.gate===4?'题面改变，底层路径保持不变。':'每次只回答当前这一座桥墩。')+'</p></div>'+bridge(item)+'<div class="answers">'+choices().map(function(choice){return '<button class="answer '+(state.selected===choice?'selected':'')+'" data-answer="'+esc(choice)+'">'+esc(choice)+'</button>';}).join('')+'</div>'+hint+feedback+repair+'<div class="actions"><button class="action" data-action="hint">增加一级提示</button>'+(state.feedback&&state.feedback.ok&&!state.feedback.partial?'<button class="action primary" data-action="next">进入下一关</button>':'')+'<button class="action" data-start="'+item.id+'">重走本题型</button></div>'+(state.candidateGap?'<div class="evidence-note"><strong>当前候选断连：</strong>'+esc(state.candidateGap)+'。仍需后续最小探针区分竞争解释。</div>':'')+'</div></section></div></main>');
  }
  function complete() { var item=currentType(); return shell('<main class="page"><section class="stage complete" style="--type-color:'+item.color+'"><div class="complete-mark">✓</div><h2>'+esc(item.name)+'：本轮建桥完成</h2><p>获得 '+state.support+' 条过程支持，出现 '+state.wrong+' 次候选偏离。它只表示本轮走通过路径；需要以后在无提示真题中重新调用，才增加迁移证据。</p><div class="actions"><button class="action primary" data-start="'+item.id+'">再走一次</button><button class="action" data-action="home">换一种题型</button></div></section></main>'); }
  function render(){ document.getElementById('subjective-app').innerHTML=state.view==='home'?home():state.view==='complete'?complete():play(); }
  document.getElementById('subjective-app').addEventListener('click',function(event){var start=event.target.closest('[data-start]');if(start){resetFor(start.getAttribute('data-start'));return;}var answerButton=event.target.closest('[data-answer]');if(answerButton){answer(answerButton.getAttribute('data-answer'));return;}var actionButton=event.target.closest('[data-action]');if(!actionButton)return;var actionName=actionButton.getAttribute('data-action');if(actionName==='next')next();else if(actionName==='hint'){state.hint=Math.min(2,state.hint+1);render();}else if(actionName==='home'){state.view='home';render();}});
  var requested=new URL(location.href).searchParams.get('type'); if(requested&&types.some(function(item){return item.id===requested;}))resetFor(requested);else render();
})();
