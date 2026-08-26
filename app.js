(function () {
  'use strict';

  var variantMeta = {
    A: { name: '全景关系网', note: '看见全部节点与带条件连线' },
    B: { name: '学习路线地铁图', note: '看见依赖顺序与换乘关系' },
    C: { name: '诊断矩阵', note: '看见节点、探针与证据状态' }
  };

  var layers = {
    orient: { name: '入口与对象', color: '#2a6f97', short: '入口' },
    represent: { name: '形式表征', color: '#6d5cae', short: '表征' },
    change: { name: '变化方向', color: '#d55b40', short: '变化' },
    role: { name: '反应角色', color: '#a44878', short: '角色' },
    quant: { name: '守恒与定量', color: '#277d63', short: '定量' },
    context: { name: '高考情境桥梁', color: '#b37a16', short: '情境' },
    boundary: { name: '边界与防误推', color: '#5f6872', short: '边界' }
  };

  var evidenceStates = [
    { id: 'unobserved', name: '尚未观察', color: '#cfd6d1' },
    { id: 'independent', name: '无提示支持一次', color: '#2d7f67' },
    { id: 'prompted', name: '提示后可以', color: '#e3a32b' },
    { id: 'candidate_gap', name: '候选断连', color: '#d85e4b' },
    { id: 'surface_transfer', name: '异表面迁移支持', color: '#3977a6' },
    { id: 'delayed_retrieval', name: '延迟调用支持', color: '#7558a7' }
  ];

  var nodes = [
    { id: 'O1', name: '题目目标', layer: 'orient', x: 22, y: 80, summary: '先判断题目究竟要求识别变化、命名角色、求比例、判断可行性，还是规范表达。', boundary: '目标读取属于任务监控，不是化学知识本身；忽略“不涉及”“错误的是”会让完整化学推理指向相反答案。', example: '题干要求选择“不涉及氧化还原”的成果。', probe: '题目最终要找有变化还是无变化？正确项还是错误项？' },
    { id: 'O2', name: '实际反应粒子', layer: 'orient', x: 22, y: 230, summary: '从分子式、离子式、流程或装置中找出真正发生状态变化的粒子。', boundary: '出现在方程式中不等于参与电子当量变化；旁观离子可能只维持电中性。', example: 'Fe + CuSO4 中优先追踪 Fe 与 Cu2+，而不是把 SO4 2- 当电子搬运者。', probe: '把反应前后完全不变的粒子划掉，还剩谁发生变化？' },
    { id: 'O3', name: '同一元素前后载体', layer: 'orient', x: 22, y: 380, summary: '把同一元素在反应前和反应后所在的物种一一对齐。', boundary: '不能比较两个不同元素的氧化数，也不能只标一侧便判断方向。', example: 'NO3- 中 N 对齐到 NH3 中 N；PbSO4 中 Pb 对齐到 Pb。', probe: '同一元素在反应前后分别藏在哪两个物种里？' },

    { id: 'R1', name: '粒子边界与总电荷', layer: 'represent', x: 182, y: 50, summary: '先圈定中性分子、单原子离子或多原子离子的整体边界，再决定氧化数代数和。', boundary: '整体电荷属于整个粒子，不可直接赋给中心原子。', example: 'SO4 2- 的氧化数代数和为 -2，而不是 0。', probe: '右上角电荷属于一个原子还是整个粒子？代数和应等于多少？' },
    { id: 'R2', name: '形式电子分配', layer: 'represent', x: 182, y: 165, summary: '按统一规则把异核键电子形式上归给更吸引电子的一方，为氧化态提供记账依据。', boundary: '这是形式模型；共价反应中不必存在逐个整数电子沿可见路线飞行。', example: 'H2O 中 O 记为 -2、H 记为 +1，但水不是自由 H+ 与 O2- 的集合。', probe: '这个数是形式分配结果，还是实测局域电荷？' },
    { id: 'R3', name: '氧化态', layer: 'represent', x: 182, y: 280, summary: '描述原子在规定的离子近似下所处的形式氧化程度。', boundary: '复杂固体、非无辜配体或不等价原子可能存在平均值与局部状态差异。', example: 'MnO4- 中 Mn 的形式氧化态为 +7。', probe: '这个状态描述的是哪个原子，在什么粒子边界内？' },
    { id: 'R4', name: '氧化数', layer: 'represent', x: 182, y: 395, summary: '氧化态的数值表达，是高考中追踪电子当量变化的主要形式工具。', boundary: '氧化数不是原子的真实局域整数电荷，也不能单独决定反应强弱。', example: 'Fe2+ 到 Fe3+：Fe 的氧化数由 +2 升至 +3。', probe: '请同时说出数值、它属于谁，以及比较的前后对象。' },
    { id: 'R5', name: '氧化数赋值规则', layer: 'represent', x: 182, y: 510, summary: '利用单质为 0、常见元素规则和“代数和等于整体电荷”求未知氧化数。', boundary: '过氧化物、金属氢化物、平均价态等需要额外边界，不能机械套常见值。', example: '(+1)+x+4(-2)=0，得到 KMnO4 中 Mn 为 +7。', probe: '你能先只写代数式，不判断氧化剂吗？' },

    { id: 'C1', name: '氧化数升高', layer: 'change', x: 342, y: 80, summary: '比较同一元素前后状态，数值升高表示形式电子当量减少。', boundary: '数值变大不代表电子数变多；电子带负电。', example: 'Fe2+ → Fe3+，失去 1 个电子当量。', probe: '若 Fe2+ 得到负电子，电荷会更正还是更负？' },
    { id: 'C2', name: '氧化数降低', layer: 'change', x: 342, y: 195, summary: '比较同一元素前后状态，数值降低表示形式电子当量增加。', boundary: '必须先确认比较对象相同，不能从“高价”直接跳到“强氧化剂”。', example: 'Pb(+4) → Pb(+2)，接受 2 个电子当量。', probe: '+4 到 +2 时电子应写在半反应左侧还是右侧？' },
    { id: 'C3', name: '氧化', layer: 'change', x: 342, y: 310, summary: '对氧化数升高、形式电子当量减少这一变化的命名。', boundary: '“氧化”不要求一定有氧元素参与。', example: '2Cl- → Cl2 + 2e-，Cl- 被氧化。', probe: '没有氧元素时，只要失电子能否仍叫氧化？' },
    { id: 'C4', name: '还原', layer: 'change', x: 342, y: 425, summary: '对氧化数降低、形式电子当量增加这一变化的命名。', boundary: '“还原”不是简单等同于去氧；应引用实际状态变化。', example: 'NO3- 中 N(+5) → NH3 中 N(-3)，N 被还原。', probe: '请不用“去氧”解释这次还原。' },
    { id: 'C5', name: '氧化—还原成对', layer: 'change', x: 342, y: 540, summary: '完整氧化还原过程中，一方电子当量减少必有另一方增加。', boundary: '半反应是分析切片；不能把孤立半反应误当封闭体系的完整反应。', example: 'Zn 失电子与 Cu2+ 得电子是同一耦合过程的两面。', probe: '你找到一方失电子后，电子当量由谁接受？' },

    { id: 'A1', name: '氧化剂', layer: 'role', x: 502, y: 145, summary: '在具体反应中接受电子当量、使对方氧化，而自身被还原的反应物角色。', boundary: '角色属于具体反应；高价、含氧或常见名称不自动赋予氧化剂身份。', example: 'PbO2 被 H2O2 还原时，PbO2 是氧化剂。', probe: '先填“自身被什么”，再命名它是什么剂。' },
    { id: 'A2', name: '还原剂', layer: 'role', x: 502, y: 305, summary: '在具体反应中给出电子当量、使对方还原，而自身被氧化的反应物角色。', boundary: '活泼金属只是常见倾向线索；没有实际反应便没有“该反应中的角色”。', example: 'H2O2 使 Pb(+4) 变 Pb(+2) 时，H2O2 是还原剂。', probe: '若把试剂名换成 X，只保留对方被还原，X 是什么角色？' },
    { id: 'A3', name: '角色只属于具体反应', layer: 'role', x: 502, y: 465, summary: '同一物质可在不同反应中表现为氧化剂、还原剂，甚至不承担氧化还原角色。', boundary: '不能把物质类别或记忆中的“常用氧化剂”当永久标签。', example: 'H2O2 在不同反应中可被氧化为 O2，也可被还原为 H2O。', probe: '若物质没有发生状态变化，还能称它为该反应中的某种剂吗？' },

    { id: 'Q1', name: '每原子电子当量变化', layer: 'quant', x: 662, y: 45, summary: '由同一元素氧化数差得到每个变化原子的形式电子当量变化。', boundary: '这里只得到“每个原子”的量，不能跳过粒子内原子数。', example: 'Sb：0→+5，每个 Sb 失 5 个电子当量。', probe: '你报出的数字是每原子、每粒子，还是整条方程式？' },
    { id: 'Q2', name: '总电子当量', layer: 'quant', x: 662, y: 150, summary: '总变化量等于氧化数差乘变化原子数，再乘该物种的计量数。', boundary: '不能只看氧化数差；N2、N2H4 或多中心物种尤其容易漏乘。', example: '4 mol Sb 每个升 5，共失去 20 mol e-。', probe: '每粒子有几个变化原子，方程式中共有几份粒子？' },
    { id: 'Q3', name: '电子当量守恒', layer: 'quant', x: 662, y: 255, summary: '完整反应中总失电子当量等于总得电子当量。', boundary: '守恒只约束计量，不单独证明反应方向、速率、自发性或产物唯一。', example: '阳极失去的 2 mol e- 与阴极得到的 2 mol e- 是同一批，不相加。', probe: '两极电子数应相等还是相加？为什么？' },
    { id: 'Q4', name: '计量系数与比例', layer: 'quant', x: 662, y: 360, summary: '所有物质系数必须引用同一反应进度，再由电子当量连接物质比。', boundary: '不能孤立看到某个系数 2 就直接乘或除。', example: '铅酸电池中 2 mol e- 对应消耗 2 mol H2SO4，因此为 1:1。', probe: '一组总反应同时对应几 mol e- 和几 mol 目标物质？' },
    { id: 'Q5', name: '氧化还原配平', layer: 'quant', x: 662, y: 465, summary: '用化合价升降或半反应程序执行原子、电荷和电子当量守恒。', boundary: '配平成功是必要检查，不是反应真实发生的充分证据。', example: '分别配阴、阳极半反应，令电子数相等后相加。', probe: '它通过了哪些守恒检查，还缺少哪类反应性证据？' },
    { id: 'Q6', name: '介质与反应条件', layer: 'quant', x: 662, y: 570, summary: '酸碱介质、浓度、温度和电极环境约束可使用的物种与配平方式。', boundary: '同一元素在不同介质中可能生成不同产物；不能脱离条件搬用半反应。', example: '碱性条件中常用 H2O、OH- 完成 H/O 和电荷配平。', probe: '题目给的是酸性、碱性还是未说明？这会改变哪些物种？' },
    { id: 'Q7', name: '物质的量定量', layer: 'quant', x: 662, y: 675, summary: '通过反应进度和电子当量，把目标质量、气体体积、浓度或物质的量连接起来。', boundary: '计算正确仍依赖前面的反应式、电子数和条件均正确。', example: '先由电量求 n(e-)，再按半反应系数求 Cl2。', probe: '你计算的桥梁是反应系数、电子当量，还是未经说明的比例？' },

    { id: 'X1', name: '净离子与旁观离子', layer: 'context', x: 830, y: 20, summary: '把分子式转为实际反应粒子，删除反应前后不变的旁观离子。', boundary: '旁观离子可能参与溶解度、电中性或介质，却不必承担电子当量变化。', example: '更换可溶性旁观阴离子不应改变 Fe 与 Cu2+ 的核心电子方向。', probe: '换掉不参与净反应的阴离子，变化中心是否改变？' },
    { id: 'X2', name: '阴极还原、阳极氧化', layer: 'context', x: 830, y: 92, summary: '将氧化/还原过程映射到电极：阴极发生还原，阳极发生氧化。', boundary: '阴阳极按过程命名；正负极还需区分原电池、电解池和充放电状态。', example: '充电时仍是阴极还原，但蓄电池总反应方向与放电相反。', probe: '先不谈正负：哪个电极发生得电子过程？' },
    { id: 'X3', name: '外电路电子方向', layer: 'context', x: 830, y: 164, summary: '电子由发生氧化、产生电子的电极，经外电路流向发生还原的电极。', boundary: '电子不通过电解质溶液或离子交换膜迁移。', example: '外电路电子由阳极流向阴极。', probe: '哪一极产生电子，哪一极消耗电子？' },
    { id: 'X4', name: '离子迁移与电中性', layer: 'context', x: 830, y: 236, summary: '溶液中的离子迁移用于维持各区电中性，并受盐桥或膜选择性约束。', boundary: '离子迁移方向不能只靠“异性相吸”；必须先确定电极过程、局部电荷变化和膜类型。', example: '阳离子交换膜中 K+ 可向阴极室迁移。', probe: '已知阴极位置和膜只让阳离子通过，哪种离子能向哪里移动？' },
    { id: 'X5', name: '电量 Q = n(e-)F', layer: 'context', x: 830, y: 308, summary: '用法拉第关系把外电路电量转成电子的物质的量，再接入半反应计量。', boundary: 'Q 不能直接与任意物质系数相乘；必须经过 n(e-) 这座桥。', example: 'a C 对应 a/96500 mol e-。', probe: 'C 除以 C·mol-1 得到什么单位？' },
    { id: 'X6', name: '歧化与归中', layer: 'context', x: 830, y: 380, summary: '歧化是同一中间价态分别升高、降低；归中是高低价态共同走向中间价态。', boundary: '互补的是两种变化，不要求一定由两个不同化学式承担。', example: '同一反应物的不同原子可分别承担氧化剂和还原剂角色。', probe: '把三个氧化态画在数轴上，箭头是从中间分开还是向中间汇合？' },
    { id: 'X7', name: '可行性与强弱', layer: 'context', x: 830, y: 452, summary: '用具体反应对、电势、结构、介质、浓度等判断反应倾向和氧化还原性强弱。', boundary: '氧化数只表示形式状态和可变化空间，不包含完整热力学与动力学信息。', example: '跨元素不能仅按氧化数高低排列氧化性。', probe: '除了氧化数，还需要哪种条件或电势证据？' },
    { id: 'X8', name: '实验现象证据', layer: 'context', x: 830, y: 524, summary: '颜色、气体、沉淀、褪色等现象为物种变化提供证据。', boundary: '现象可能不唯一，必须与条件、对照和物种特征共同解释。', example: 'b 处 Cl2 使湿润蓝石蕊先红后褪色。', probe: '这个现象能唯一证明什么？还有哪些竞争解释？' },
    { id: 'X9', name: '工业流程信息', layer: 'context', x: 830, y: 596, summary: '把流程箭头、加入试剂和目标产物翻译为同一元素前后状态。', boundary: '工艺目的、分离操作和氧化还原变化应分开；加入试剂不一定承担 redox 角色。', example: 'PbO2 经过 H2O2/酸变为 Pb2+，由 Pb 价态反推 H2O2 角色。', probe: '先遮住试剂名，只看目标元素前后升还是降。' },
    { id: 'X10', name: '串联中间体净速率', layer: 'context', x: 830, y: 668, summary: '中间体同时生成和消耗，其净变化率等于生成速率减消耗速率。', boundary: '这是动力学/物料衡算桥梁，不可被“它会继续反应”或氧化数方向替代。', example: 'NO2- 在 NO3-→NO2-→NH3 中浓度不一定持续下降。', probe: '若生成速率为 v1、消耗速率为 v2，dc/dt 如何表示？' },
    { id: 'X11', name: '有机物氧化还原', layer: 'context', x: 830, y: 740, summary: '可用关键碳原子的氧化态、得氧失氢等受限启发式追踪有机反应的 redox 变化。', boundary: '得氧失氢只是部分有机场景的快捷表面，仍需落回反应中心和形式电子变化。', example: '醇氧化为醛时，关键碳的氧化程度升高。', probe: '请指出真正变化的碳原子，而不是只看分子总 O/H 数。' },

    { id: 'B1', name: '氧化数 ≠ 实测电荷', layer: 'boundary', x: 1045, y: 120, summary: '形式记账数值不能自动解释为原子的真实局域整数电荷。', boundary: '单原子离子中数值重合是特例，不应外推到共价分子和多原子离子。', example: 'SO4 2- 的整体电荷 -2 与 S 的氧化数 +6 可以同时成立。', probe: '如果 H2O 真由自由 H+ 与 O2- 构成，它的性质应当怎样？' },
    { id: 'B2', name: '守恒成立 ≠ 反应发生', layer: 'boundary', x: 1045, y: 265, summary: '原子、电荷和电子守恒是方程可接受的必要条件，不是反应自发、快速或产物唯一的证明。', boundary: '还需反应性、条件、能量或实验事实。', example: '数学上可配平的重排不一定在给定介质中发生。', probe: '配平后它只通过了哪类检查，还缺什么？' },
    { id: 'B3', name: '高价态 ≠ 强氧化剂', layer: 'boundary', x: 1045, y: 410, summary: '高氧化数只表示有下降空间，不足以给出具体物种的氧化性强弱。', boundary: '强弱比较需具体物种、反应对、介质、浓度和电势等。', example: '不能跨元素只按 +7、+6、+5 排氧化性。', probe: '氧化数中是否包含反应自由能和势垒信息？' },
    { id: 'B4', name: '物质名称 ≠ 永久角色', layer: 'boundary', x: 1045, y: 555, summary: '“常见氧化剂”“活泼金属”是倾向或经验，不是具体反应角色的定义。', boundary: '无反应、换产物或换条件时角色可能变化或消失。', example: 'Zn 与 Mg2+ 不反应时，不能称 Zn 是“该反应”的还原剂。', probe: '如果没有实际状态变化，角色名称还有对应的反应吗？' },
    { id: 'B5', name: '电子当量 ≠ 唯一微观轨迹', layer: 'boundary', x: 1045, y: 700, summary: '半反应和氧化数能可靠记账，但不总是逐个描述共价反应的真实电子密度变化路径。', boundary: '净电子交换、形式电子归属和反应机理属于不同描述层。', example: 'CH4 燃烧可用氧化数计电子当量，但不能据此声称每个整数电子都有唯一可见轨迹。', probe: '这一步是在描述物理迁移、形式记账，还是具体机理？' }
  ];

  var edges = [
    { id: 'E01', from: 'O1', to: 'O2', label: '限定提取对象', type: 'constrains', condition: '先明确题目要判断或求什么', reason: '目标决定哪些信息是必要输入，避免见到熟悉物质便机械套程序。' },
    { id: 'E02', from: 'O2', to: 'O3', label: '对齐变化载体', type: 'allows_inference_of', condition: '反应物和产物已知', reason: '氧化态变化只能通过同一元素反应前后的状态比较得到。' },
    { id: 'E03', from: 'R1', to: 'R5', label: '约束代数和', type: 'constrains', condition: '已圈定完整粒子边界', reason: '粒子内所有原子氧化数代数和等于粒子整体电荷。' },
    { id: 'E04', from: 'R2', to: 'R3', label: '形式表征', type: 'formally_represents', condition: '采用规定的异核键电子分配', reason: '形式电子分配产生可比较的氧化态。' },
    { id: 'E05', from: 'R3', to: 'R4', label: '数值表达', type: 'quantifies_change_in', condition: '氧化态可用数值表示', reason: '氧化数是氧化态的数值参数。' },
    { id: 'E06', from: 'R5', to: 'R4', label: '计算得到', type: 'operationalizes', condition: '常见规则和粒子总电荷适用', reason: '赋值规则把粒子边界与已知贡献转为未知元素的氧化数。' },
    { id: 'E07', from: 'O3', to: 'R4', label: '允许前后比较', type: 'allows_inference_of', condition: '同一元素的前后载体已对齐', reason: '只有对象保持，氧化数差才表示该反应中心的变化。' },
    { id: 'E08', from: 'R4', to: 'C1', label: '比较后升高', type: 'allows_inference_of', condition: '同一元素反应后数值更高', reason: '数值差给出氧化程度增加的方向。' },
    { id: 'E09', from: 'R4', to: 'C2', label: '比较后降低', type: 'allows_inference_of', condition: '同一元素反应后数值更低', reason: '数值差给出氧化程度降低的方向。' },
    { id: 'E10', from: 'C1', to: 'Q1', label: '形式电子减少', type: 'allows_inference_of', condition: '比较同一原子前后', reason: '失去负电子当量使形式氧化数升高。' },
    { id: 'E11', from: 'C2', to: 'Q1', label: '形式电子增加', type: 'allows_inference_of', condition: '比较同一原子前后', reason: '接受负电子当量使形式氧化数降低。' },
    { id: 'E12', from: 'C1', to: 'C3', label: '命名为氧化', type: 'names_transformation', condition: '氧化数确已升高', reason: '氧化是形式电子当量减少这一变化的名称。' },
    { id: 'E13', from: 'C2', to: 'C4', label: '命名为还原', type: 'names_transformation', condition: '氧化数确已降低', reason: '还原是形式电子当量增加这一变化的名称。' },
    { id: 'E14', from: 'C3', to: 'C5', label: '要求互补变化', type: 'is_coupled_with', condition: '描述完整封闭 redox 过程', reason: '电子当量不会只在一方凭空减少。' },
    { id: 'E15', from: 'C4', to: 'C5', label: '要求互补变化', type: 'is_coupled_with', condition: '描述完整封闭 redox 过程', reason: '电子当量不会只在一方凭空增加。' },
    { id: 'E16', from: 'C4', to: 'A1', label: '自身还原者', type: 'names_reaction_role', condition: '该反应物实际参与并被还原', reason: '接受电子当量并使对方氧化的反应物称氧化剂。' },
    { id: 'E17', from: 'C3', to: 'A2', label: '自身氧化者', type: 'names_reaction_role', condition: '该反应物实际参与并被氧化', reason: '给出电子当量并使对方还原的反应物称还原剂。' },
    { id: 'E18', from: 'A1', to: 'A3', label: '角色受情境限定', type: 'applies_under', condition: '必须指明具体反应和条件', reason: '物质只有在实际接受电子当量的反应中才承担氧化剂角色。' },
    { id: 'E19', from: 'A2', to: 'A3', label: '角色受情境限定', type: 'applies_under', condition: '必须指明具体反应和条件', reason: '物质只有在实际给出电子当量的反应中才承担还原剂角色。' },
    { id: 'E20', from: 'Q1', to: 'Q2', label: '乘原子数与计量数', type: 'quantifies_change_in', condition: '已明确每原子变化和计数单位', reason: '总电子当量等于每原子差乘变化原子数及物种份数。' },
    { id: 'E21', from: 'Q2', to: 'Q3', label: '总失等于总得', type: 'constrains', condition: '完整氧化还原反应', reason: '电子当量守恒把两支变化定量耦合。' },
    { id: 'E22', from: 'Q3', to: 'Q4', label: '约束计量比例', type: 'constrains', condition: '所有系数引用同一反应进度', reason: '电子守恒提供变化物种之间的系数关系。' },
    { id: 'E23', from: 'Q3', to: 'Q5', label: '进入配平程序', type: 'operationalizes', condition: '同时满足原子与电荷守恒', reason: '配平把电子当量约束落实为可接受系数。' },
    { id: 'E24', from: 'Q6', to: 'Q5', label: '限定配平物种', type: 'applies_under', condition: '酸碱介质和反应环境已明确', reason: '介质决定可用 H+、OH-、H2O 及可能产物。' },
    { id: 'E25', from: 'Q4', to: 'Q7', label: '换算目标量', type: 'allows_inference_of', condition: '反应方程式和系数已验证', reason: '同一反应进度中的系数比连接电子量与目标物质量。' },
    { id: 'E26', from: 'O2', to: 'X1', label: '删除不变粒子', type: 'operationalizes', condition: '可溶物按粒子形式表示', reason: '对齐反应前后粒子可识别旁观离子和净变化。' },
    { id: 'E27', from: 'C3', to: 'X2', label: '映射到阳极', type: 'names_reaction_role', condition: '电极上发生氧化', reason: '发生氧化的电极按过程命名为阳极。' },
    { id: 'E28', from: 'C4', to: 'X2', label: '映射到阴极', type: 'names_reaction_role', condition: '电极上发生还原', reason: '发生还原的电极按过程命名为阴极。' },
    { id: 'E29', from: 'X2', to: 'X3', label: '确定电子方向', type: 'allows_inference_of', condition: '外电路连通', reason: '阳极产生电子，阴极消耗电子，因此电子经外电路由阳极流向阴极。' },
    { id: 'E30', from: 'X2', to: 'X4', label: '结合电中性判断', type: 'allows_inference_of', condition: '同时知道膜类型和各室电荷变化', reason: '电极过程造成局部离子组成变化，离子迁移补偿电荷。' },
    { id: 'E31', from: 'Q2', to: 'X5', label: '连接外电量', type: 'quantifies_change_in', condition: '电子通过外电路且电流效率按题意处理', reason: '法拉第常量把电子物质的量与电量连接。' },
    { id: 'E32', from: 'X5', to: 'Q7', label: '再接物质计量', type: 'allows_inference_of', condition: '已知半反应电子系数', reason: '电量先变为 n(e-)，再由计量关系求目标物质。' },
    { id: 'E33', from: 'C5', to: 'X6', label: '允许同物质分流', type: 'allows_inference_of', condition: '同一中间价态的不同原子分别升降', reason: '耦合要求两种互补变化，不要求两个不同化学式。' },
    { id: 'E34', from: 'R4', to: 'X11', label: '追踪反应中心', type: 'allows_inference_of', condition: '关键碳原子前后结构可对齐', reason: '碳的形式氧化态变化可识别有机物的氧化还原。' },
    { id: 'E35', from: 'O2', to: 'X8', label: '由现象提供证据', type: 'evidences', condition: '现象与物种性质、条件和对照相符', reason: '可观察结果能支持但通常不能单独唯一确定微观变化。' },
    { id: 'E36', from: 'O3', to: 'X9', label: '翻译流程箭头', type: 'allows_inference_of', condition: '流程给出原料、试剂和目标产物', reason: '前后载体对齐把工业叙事还原为状态变化。' },
    { id: 'E37', from: 'C1', to: 'X7', label: '与条件合用预测', type: 'may_predict_with', condition: '另有具体物种、电势、介质和浓度信息', reason: '氧化数升高方向提供可能变化，但强弱与可行性需额外模型。' },
    { id: 'E38', from: 'C2', to: 'X7', label: '与条件合用预测', type: 'may_predict_with', condition: '另有具体物种、电势、介质和浓度信息', reason: '氧化数降低方向提供可能变化，但强弱与可行性需额外模型。' },
    { id: 'E39', from: 'X8', to: 'X7', label: '提供反应性证据', type: 'evidences', condition: '排除主要竞争解释并控制条件', reason: '实验现象可为实际反应和方向提供经验支持。' },
    { id: 'E40', from: 'O2', to: 'X10', label: '识别串联中间体', type: 'allows_inference_of', condition: '同一物种既是前一步产物又是后一步反应物', reason: '中间体的浓度变化必须同时考虑生成与消耗。' },
    { id: 'E41', from: 'R4', to: 'B1', label: '不能推出真实电荷', type: 'does_not_imply', condition: '尤其是共价分子和多原子离子', reason: '氧化数来自形式分配，不是电子密度测量值。' },
    { id: 'E42', from: 'Q5', to: 'B2', label: '不能推出必然发生', type: 'does_not_imply', condition: '即使原子、电荷、电子均守恒', reason: '守恒不包含反应自由能、势垒、介质和产物选择信息。' },
    { id: 'E43', from: 'R4', to: 'B3', label: '不能单独推出强弱', type: 'does_not_imply', condition: '跨物种或条件不同的比较', reason: '氧化数不包含完整热力学、动力学和结构信息。' },
    { id: 'E44', from: 'A3', to: 'B4', label: '阻断永久标签', type: 'does_not_imply', condition: '换反应、换条件或不反应时', reason: '角色由具体反应中的实际变化定义。' },
    { id: 'E45', from: 'Q2', to: 'B5', label: '不能推出唯一轨迹', type: 'does_not_imply', condition: '特别是共价反应的形式记账', reason: '电子当量是守恒记账量，不等同完整微观机理。' },
    { id: 'E46', from: 'X1', to: 'Q5', label: '进入净离子配平', type: 'operationalizes', condition: '实际变化粒子已识别', reason: '去除旁观离子后可对净变化做原子、电荷和电子守恒。' },
    { id: 'E47', from: 'Q6', to: 'X7', label: '条件参与方向判断', type: 'applies_under', condition: '判断实际反应和强弱', reason: '介质、浓度和电极环境会改变电势、产物和反应倾向。' },
    { id: 'E48', from: 'X3', to: 'X5', label: '电流积分成电量', type: 'quantifies_change_in', condition: '外电路电荷传递可计量', reason: '电流随时间积分得到电量，再由 F 转为电子物质的量。' }
  ];

  var questions = {
    all: { name: '全部连接', short: '全景', nodes: nodes.map(function (n) { return n.id; }), edges: edges.map(function (e) { return e.id; }), note: '展示项目目前定义的全部核心节点、情境桥梁和边界。' },
    Q001: { name: 'Q001 反应识别', short: '识别', nodes: ['O1','O2','O3','R1','R4','R5','C1','C2','C3','C4','C5'], edges: ['E01','E02','E03','E06','E07','E08','E09','E12','E13','E14','E15'], note: '2025 山东 Q1：从历史叙事恢复反应事实并识别 redox。' },
    Q002: { name: 'Q002 充电方向', short: '方向', nodes: ['O1','O3','R4','C2','C4','Q1','Q5','Q6','X2'], edges: ['E07','E09','E11','E13','E23','E24','E28'], note: '2025 北京 Q16(1)①：充电反向、阴极还原、半反应守恒。' },
    Q003: { name: 'Q003 反应角色', short: '角色', nodes: ['O2','O3','R4','C1','C2','C3','C4','A1','A2','A3','B4','X9'], edges: ['E02','E07','E08','E09','E12','E13','E16','E17','E18','E19','E36','E44'], note: '2025 北京 Q16(2)②：由 Pb 的变化反推 H2O2 与 K2S2O8 角色。' },
    Q004: { name: 'Q004 电子计数', short: '计数', nodes: ['O2','O3','R4','C1','Q1','Q2','Q3','Q4','Q7','X5'], edges: ['E02','E07','E08','E10','E20','E21','E22','E25','E31','E32'], note: '2025 北京 Q16(1)②：电量经电子当量连接到 H2SO4 物耗。' },
    Q005: { name: 'Q005 电解组合', short: '组合', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','C5','Q1','Q2','Q3','Q5','Q6','X2','X3','X4','X5','X8','X10'], edges: ['E01','E02','E07','E08','E09','E10','E11','E12','E13','E14','E15','E20','E21','E23','E24','E27','E28','E29','E30','E31','E35','E40'], note: '2025 湖南 Q9：电极、迁移、中间体浓度、现象与总反应协同调用。' },
    Q006: { name: 'Q006 归中角色', short: '归中', nodes: ['O1','O2','O3','R1','R2','R4','C1','C2','C3','C4','C5','A1','A2','X6'], edges: ['E01','E02','E04','E07','E08','E09','E12','E13','E14','E15','E16','E17','E33'], note: '2025 安徽 Q5：在 HOF + H2O 中追踪不同来源 O 的归中变化。' },
    Q007: { name: 'Q007 充放电迁移', short: '迁移', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','Q3','Q4','Q7','X2','X3','X4'], edges: ['E01','E02','E07','E08','E09','E12','E13','E21','E22','E25','E27','E28','E29','E30'], note: '2025 安徽 Q13：反转充放电后判断电极、Li+ 迁移与溶液质量。' },
    Q008: { name: 'Q008 方程核验', short: '核验', nodes: ['O1','O2','O3','R4','C1','C2','Q1','Q2','Q3','Q5','Q6','B2'], edges: ['E01','E02','E07','E08','E09','E10','E11','E20','E21','E23','E24','E42'], note: '2025 江苏 Q6 A项：黑火药方程式须同时通过反应事实与守恒核验。' },
    Q009: { name: 'Q009 光解水', short: '光解', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','Q2','Q3','Q4','Q7','X2','X3','X4'], edges: ['E01','E02','E07','E08','E09','E12','E13','E20','E21','E22','E25','E27','E28','E29','E30'], note: '2025 江苏 Q8：从电子方向推电极、质子迁移、pH 与产气量。' },
    Q010: { name: 'Q010 机理分层', short: '分层', nodes: ['O1','O2','O3','R1','R4','C1','C2','C4','Q1','Q2','Q3','Q5','Q6','B5'], edges: ['E01','E02','E03','E07','E08','E09','E10','E11','E13','E20','E21','E23','E24','E45'], note: '2025 江苏 Q10：区分过程Ⅱ的表面中间体变化与净反应的 16e- 计量。' },
    Q011: { name: 'Q011 旁路氧化', short: '旁路', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','A3','B4','Q5','X2'], edges: ['E01','E02','E07','E08','E09','E12','E13','E18','E19','E23','E27','E28','E44'], note: '2025 湖北 Q12：补锂时真正氧化的是添加剂，正极 Fe 价态并未变化。' },
    Q012: { name: 'Q012 对照实验', short: '对照', nodes: ['O1','O2','O3','R4','C2','C4','A1','A2','X8','X11'], edges: ['E01','E02','E07','E09','E13','E16','E17','E34','E35'], note: '2025 湖北 Q18(1)：用葡萄糖组与空白加热组分开解释 Cu2O 和 CuO。' },
    Q013: { name: 'Q013 串联证据', short: '串联', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','C5','A1','A2','A3','Q6','X6','X8','X11'], edges: ['E01','E02','E07','E08','E09','E12','E13','E14','E15','E16','E17','E18','E19','E24','E33','E34','E35'], note: '2025 广东 Q11：H2O2 歧化、碘显色、乙醇氧化与银镜条件串联判断。' },
    Q014: { name: 'Q014 电池定量', short: '容量', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','Q1','Q2','Q3','Q4','Q7','X2'], edges: ['E01','E02','E07','E08','E09','E10','E11','E12','E13','E20','E21','E22','E25','E27','E28'], note: '2025 广东 Q14：由 MnO2 减少确定放电方向、pH 和理论容量。' },
    Q015: { name: 'Q015 证据边界', short: '证据', nodes: ['O1','O2','O3','R4','C1','C2','C3','C4','A1','A2','Q6','X7','X8','X11'], edges: ['E01','E02','E07','E08','E09','E12','E13','E16','E17','E24','E34','E35','E37','E38','E39','E47'], note: '2025 重庆 Q9：逐项检查实验现象是否足以推出所给结论。' }
  };

  var questionBank = {
    Q001: {
      id: 'Q001', year: 2025, province: '山东', number: '第 1 题', score: '2 分', format: '单项选择',
      title: '判断不涉及氧化还原反应的化学史成果',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（山东）化学高考真题/2025年高考化学试卷（山东卷）（解析卷）.pdf',
      validation: '题面、材料答案和解析已单次核对', usage: 'private_analysis_only',
      stem: ['下列在化学史上产生重要影响的成果中，不涉及氧化还原反应的是'],
      options: [
        'A．侯德榜发明了以 NH3、CO2 和 NaCl 为原料的联合制碱法',
        'B．戴维电解盐酸得到 H2 和 Cl2，从而提出了酸的含氢学说',
        'C．拉瓦锡基于金属和 O2 的反应提出了燃烧的氧化学说',
        'D．哈伯发明了以 N2 和 H2 为原料合成氨的方法'
      ],
      answer: 'A',
      analysis: [
        'A：联合制碱法的主要反应中各元素氧化数不变，属于非氧化还原过程。',
        'B：H 由 +1 降至 0，Cl 由 -1 升至 0，存在耦合升降。',
        'C：金属由 0 升为正价，O 由 0 降为负价。',
        'D：N 由 0 降至 -3，H 由 0 升至 +1。',
        '题干要求选择“不涉及”氧化还原的一项，因此选 A。'
      ],
      path: [
        { node: 'O1', action: '读取否定目标', result: '最终要找 non-redox，而不是最明显的 redox', check: '重读“不涉及”' },
        { node: 'O2', action: '恢复反应事实', result: '分别列出 A—D 的反应前后物种', check: '不按人物熟悉度猜答案' },
        { node: 'O3', action: '对齐同一元素', result: '为每项找出同一元素的前后载体', check: '不跨元素比较' },
        { node: 'R4', action: '标关键氧化数', result: 'A 无变化；B/C/D 均出现升降', check: '单质为 0，并抽查代数和' },
        { node: 'C5', action: '按耦合变化分类', result: 'A 为 non-redox，B/C/D 为 redox', check: '每个 redox 至少有一升一降' },
        { node: 'O1', action: '回查题目目标', result: '选择 A', check: '答案类别与“不涉及”一致' }
      ],
      gaps: [
        { id: 'G-01', node: 'O1', name: '否定目标丢失', symptom: '证明了某项是 redox，却把它当最终答案。', probe: '题目要找“有变化”还是“无变化”？', repair: '只看 5 个题干，圈出“正确/错误/不涉及”，不做化学题。', success: '五次目标极性均能复述正确。', transfer: '换一题“不正确的是”，无提示先复述目标。' },
        { id: 'G-02', node: 'O2', name: '反应事实无法恢复', symptom: '知道 redox 定义，但不知道联合制碱法的反应前后物种。', probe: '若直接给出 A 的两个方程式，你能否判断氧化数变化？', repair: '只把三条叙事翻译成“反应物→产物”，暂不判断 redox。', success: '能独立恢复最小反应事实。', transfer: '换成工业流程叙事，只圈前后物种。' },
        { id: 'G-04', node: 'C1', name: '把有氧当作 redox 定义', symptom: '认为没有 O2 的合成氨不是氧化还原。', probe: 'N2 + H2 → NH3 中 N、H 的氧化数是否变化？', repair: '成对比较一个无氧 redox 和一个含氧 non-redox，只说状态变化。', success: '不再以是否含氧作为中心理由。', transfer: '用卤素置换题验证无氧表面。' },
        { id: 'G-12', node: 'R4', name: '答案正确但理由不可靠', symptom: '选 A，但理由只有“我记得联合制碱不是”。', probe: '把人物名遮住，只给反应物和产物，还能证明吗？', repair: '每项只写“同一元素前态→后态”，用关系替换记忆标签。', success: '能给出足以推出结论的中心理由。', transfer: '换成新的化学史或工业叙事。' }
      ]
    },
    Q002: {
      id: 'Q002', year: 2025, province: '北京', number: '第 16 题（1）①', score: '填空子问', format: '电极反应式',
      title: '由充电方向确定铅酸电池阴极反应',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（北京）化学高考真题/2025年高考化学试卷（北京卷）（解析卷）.pdf',
      validation: '题面、材料答案和解析已单次核对', usage: 'private_analysis_only',
      stem: ['铅酸电池工作原理：PbO2 + Pb + 2H2SO4 ⇌ 2PbSO4 + 2H2O（放电向右，充电向左）。', '充电时，阴极发生的电极反应为________。'],
      options: [],
      answer: 'PbSO4 + 2e- → Pb + SO4 2-',
      analysis: [
        '充电时总反应沿放电反方向进行，要由 PbSO4 再生 PbO2 与 Pb。',
        '阴极始终发生还原，因此只选择 Pb(+2)→Pb(0) 这一支。',
        '每个 Pb 接受 2 个电子当量；补出硫酸根后，原子和电荷同时守恒。',
        '得到 PbSO4 + 2e- → Pb + SO4 2-。'
      ],
      path: [
        { node: 'O1', action: '读取运行状态', result: '充电，故总反应向左', check: '是否在再生放电消耗的物质' },
        { node: 'X2', action: '锁定阴极过程', result: '阴极发生还原，电子写左侧', check: '先不混用正负极称谓' },
        { node: 'O3', action: '选择铅的变化载体', result: 'PbSO4 → Pb', check: '另一支 PbSO4→PbO2 是氧化' },
        { node: 'R4', action: '比较 Pb 氧化数', result: '+2→0，降低 2', check: '与阴极还原一致' },
        { node: 'Q1', action: '补电子当量', result: '每份 PbSO4 接受 2e-', check: '电子在反应物侧' },
        { node: 'Q5', action: '完成并检查半反应', result: 'PbSO4 + 2e- → Pb + SO4 2-', check: 'Pb/S/O 与总电荷均守恒' }
      ],
      gaps: [
        { id: 'G-04', node: 'O1', name: '充放电方向断连', symptom: '直接照搬放电方向写电极反应。', probe: '充电相对放电是同向还是反向？', repair: '给三个可逆式，只画“充电/放电”的反应方向，不写半反应。', success: '三次运行方向无提示正确。', transfer: '换成另一种二次电池。' },
        { id: 'G-08', node: 'X2', name: '阴极—还原断连', symptom: '在阴极反应中把电子写在右侧。', probe: '先不看本题：阴极发生得电子还是失电子？', repair: '对四个电极过程只填“得/失 e-”，暂不碰物质。', success: '能用电子带负电解释，而非只背口令。', transfer: '去掉正负极标签后再判断。' },
        { id: 'G-04', node: 'C2', name: '氧化数方向断连', symptom: '在 Pb(+2)→Pb(0) 与 Pb(+2)→Pb(+4) 间选错还原支路。', probe: '+2→0 与 +2→+4，哪一支接受电子？', repair: '只做三组“前态→后态”，把电子放在正确一侧。', success: '方向和电子位置一致。', transfer: '换成 Fe2+/Fe3+。' },
        { id: 'G-11', node: 'Q5', name: '半反应守恒断连', symptom: '漏写 SO4 2- 或电子数不对。', probe: '删去电子后，哪一种原子或原子团没有去处？', repair: '一次只做原子检查，再做电荷检查，不重做整题。', success: '两类检查均能主动执行。', transfer: '换一种阴离子或介质。' }
      ]
    },
    Q003: {
      id: 'Q003', year: 2025, province: '北京', number: '第 16 题（2）②', score: '填空子问', format: '反应角色判断',
      title: '由流程中的铅价态变化反推试剂角色',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（北京）化学高考真题/2025年高考化学试卷（北京卷）（解析卷）.pdf',
      validation: '题面、材料答案和解析已单次核对', usage: 'private_analysis_only',
      stem: ['步骤 II：PbO2 --H2O2、酸→ 含 Pb2+ 溶液。', '步骤 III：Pb(OH)2、PbO、PbO2 --K2S2O8、强碱→ PbO2。', '步骤 II、III 中 H2O2 和 K2S2O8 的作用分别是________。'],
      options: [],
      answer: 'H2O2 为还原剂；K2S2O8 为氧化剂。',
      analysis: [
        '步骤 II：Pb 由 +4 降到 +2，被还原，所以 H2O2 必须被氧化，是还原剂。',
        '步骤 III：Pb(OH)2/PbO 中 Pb 由 +2 升到 PbO2 中 +4，被氧化，所以 S2O8 2- 接受电子，是氧化剂。',
        '角色只由该反应中的实际变化决定，不能按“H2O2 通常具有氧化性”直接贴标签。'
      ],
      path: [
        { node: 'X9', action: '翻译流程箭头', result: 'II：Pb(+4)→Pb(+2)；III：Pb(+2)→Pb(+4)', check: '只跟踪实际变化的 Pb 组分' },
        { node: 'O3', action: '对齐同一元素', result: '把 Pb 的前态和后态配对', check: '不被试剂名称抢先引导' },
        { node: 'C4', action: '命名步骤 II 变化', result: 'Pb 被还原', check: '+4→+2' },
        { node: 'A2', action: '反推 H2O2 角色', result: 'H2O2 自身被氧化，是还原剂', check: '使对方还原者为还原剂' },
        { node: 'C3', action: '命名步骤 III 变化', result: 'Pb 被氧化', check: '+2→+4' },
        { node: 'A1', action: '反推 K2S2O8 角色', result: 'K2S2O8 是氧化剂', check: '使对方氧化者为氧化剂' },
        { node: 'A3', action: '检查角色边界', result: '角色属于当前反应', check: '不能按物质永久属性作答' }
      ],
      gaps: [
        { id: 'G-02', node: 'X9', name: '流程载体未对齐', symptom: '一看到试剂名就判断角色，没有先看 Pb 的前后状态。', probe: '遮住试剂名，只看 Pb，两个步骤分别升还是降？', repair: '对三条流程只画“同一元素前态→后态”，暂不命名剂。', success: '三种流程表面均能对齐变化对象。', transfer: '换成 Fe 或 Mn 的工业流程。' },
        { id: 'G-05', node: 'A1', name: '变化与角色反转', symptom: '知道 Pb 被还原，却把 H2O2 写成氧化剂。', probe: '使对方被还原的试剂，自己是供电子还是接电子？', repair: '固定句式：“X 自身被__，所以 X 是__剂”，正向和反向各做一次。', success: '角色命名与自身变化稳定一致。', transfer: '用 CO/Fe2O3 的陌生表面复测。' },
        { id: 'G-12', node: 'A3', name: '把物质当永久角色', symptom: '理由只是“H2O2 通常是氧化剂”。', probe: '若 H2O2 在本反应中变为 O2，它自身被氧化还是还原？', repair: '同一 H2O2 给出一氧化、一还原、一无 redox 情境，只引用实际变化。', success: '能在无反应时拒绝赋角色。', transfer: '换成 SO2 等可表现双重性质的物质。' }
      ]
    },
    Q004: {
      id: 'Q004', year: 2025, province: '北京', number: '第 16 题（1）②', score: '填空子问', format: '电化学定量',
      title: '由放电电量计算硫酸消耗量',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（北京）化学高考真题/2025年高考化学试卷（北京卷）（解析卷）.pdf',
      validation: '题面、材料答案和解析已单次核对', usage: 'private_analysis_only',
      stem: ['铅酸电池放电反应：PbO2 + Pb + 2H2SO4 → 2PbSO4 + 2H2O。', '放电时产生 a 库仑电量，消耗 H2SO4 的物质的量为________ mol。已知转移 1 mol 电子产生 96500 库仑电量。'],
      options: [],
      answer: 'a/96500 mol',
      analysis: [
        '每发生一组总反应，Pb(0)→Pb(+2)，转移 2 mol e-；同时消耗 2 mol H2SO4。',
        '所以 n(H2SO4):n(e-) = 2:2 = 1:1。',
        'a C 对应 a/96500 mol e-，因此消耗 H2SO4 为 a/96500 mol。',
        '两极的 2 mol e- 是同一批电子，不能相加为 4 mol。'
      ],
      path: [
        { node: 'O2', action: '读取放电总反应', result: '酸系数为 2', check: '所有量引用同一反应进度' },
        { node: 'R4', action: '比较 Pb 氧化数', result: 'Pb：0→+2', check: '另一极 +4→+2 与其耦合' },
        { node: 'Q1', action: '求每原子电子变化', result: '每个 Pb 失 2e-', check: '计数单位为每个 Pb' },
        { node: 'Q2', action: '求一组反应电子量', result: '2 mol e-', check: '不在两极重复计数' },
        { node: 'Q4', action: '建立同进度比例', result: '2 mol e- 对 2 mol H2SO4，即 1:1', check: '没有孤立使用酸系数 2' },
        { node: 'X5', action: '由电量换电子量', result: 'n(e-)=a/96500 mol', check: 'C÷(C·mol-1)=mol' },
        { node: 'Q7', action: '换算目标物耗', result: 'a/96500 mol H2SO4', check: '令 a=96500 C 得 1 mol' }
      ],
      gaps: [
        { id: 'G-06', node: 'Q2', name: '电子总量漏乘或重复计数', symptom: '只看氧化数差，或把两极电子相加。', probe: '阳极失去与阴极得到的是两批电子还是同一批？', repair: '画一批电子从阳极到阴极，再只算“差×原子数×份数”。', success: '能说清每原子、每粒子和整组反应。', transfer: '换成 N2 或多中心物种。' },
        { id: 'G-07', node: 'X5', name: '电量换算方向错误', symptom: '写成 96500/a 或量纲混乱。', probe: 'C ÷ (C·mol-1) 的单位是什么？', repair: '只做三次 Q↔n(e-) 量纲换算，不带化学物质。', success: '能用单位反推乘除。', transfer: '换 q C 与另一法拉第常量表达。' },
        { id: 'G-06', node: 'Q4', name: '反应进度比例断连', symptom: '得到 a/(2F) 或 2a/F，只孤立处理酸系数。', probe: '一组总反应同时对应几 mol e-、几 mol H2SO4？', repair: '画两列表，只填同一次反应中的 e- 与目标物质。', success: '先建立比值，再代入电量。', transfer: '换成 2Cl-→Cl2+2e- 求气体量。' }
      ]
    },
    Q005: {
      id: 'Q005', year: 2025, province: '湖南', number: '第 9 题', score: '单项选择', format: '电解装置综合',
      title: '硝酸盐产氨电解装置的组合路径判断',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（湖南）化学高考真题/2025年高考化学试卷（湖南卷）（解析卷）.pdf',
      image: './assets/q005-hunan-2025-q09-apparatus.png',
      imageAlt: '2025 湖南高考化学第 9 题电解装置原图：左室硝酸根经亚硝酸根生成氨，右室氯离子生成氯气，两室之间为阳离子交换膜。',
      validation: '题面、装置语义、材料答案和解析已单次核对', usage: 'private_analysis_only',
      stem: ['一种电化学处理硝酸盐产氨的装置：左室为 KNO3 溶液，发生 NO3-→NO2-→NH3；右室为 KCl 溶液，发生 Cl-→Cl2；两室由阳离子交换膜隔开，气体出口分别为 a、b。', '下列说法错误的是'],
      options: [
        'A．电解过程中，K+ 向左室迁移',
        'B．电解过程中，左室中 NO2- 的浓度持续下降',
        'C．用湿润的蓝色石蕊试纸置于 b 处，试纸先变红后褪色',
        'D．NO3- 完全转化为 NH3 的总反应：NO3- + 8Cl- + 6H2O → NH3↑ + 9OH- + 4Cl2↑'
      ],
      answer: 'B',
      analysis: [
        '左室 N 由 +5 经 +3 降到 -3，发生还原，为阴极；K+ 可经阳离子交换膜向左室迁移，所以 A 正确。',
        'NO2- 同时是前一步产物和后一步反应物，净浓度变化由生成速率减消耗速率决定，不能断言持续下降，所以 B 错误。',
        '右室 Cl- 被氧化为 Cl2，b 处氯气使湿润蓝色石蕊先因酸性变红，再因 HClO 漂白而褪色，所以 C 正确。',
        '阴极半反应 NO3- + 8e- + 6H2O → NH3 + 9OH-；阳极半反应 8Cl- → 4Cl2 + 8e-。相加得到 D，所以 D 正确。'
      ],
      path: [
        { node: 'O1', action: '读取“错误的是”', result: '最终寻找不能成立的一项', check: '避免四项判断正确却选错极性' },
        { node: 'O3', action: '翻译左右室变化', result: '左 N：+5→+3→-3；右 Cl：-1→0', check: '同一元素前后对齐' },
        { node: 'X2', action: '命名两极', result: '左阴极、右阳极', check: '还原在阴极、氧化在阳极' },
        { node: 'X4', action: '判断离子迁移', result: 'K+ 经阳离子膜向左室', check: '膜类型与电中性同时满足' },
        { node: 'X10', action: '判断 NO2- 净变化', result: 'dc/dt=v生成-v消耗，方向未知', check: '题面未给两步速率关系' },
        { node: 'X8', action: '识别 b 处 Cl2 现象', result: '蓝石蕊先红后褪色', check: '先确定气体，再调用性质' },
        { node: 'Q5', action: '配两极半反应并相加', result: 'D 的总反应原子、电荷、电子均守恒', check: '左、右电荷均为 -9' },
        { node: 'O1', action: '回到否定目标', result: '选择 B', check: '证明 B 不能断言，而非证明它正确' }
      ],
      gaps: [
        { id: 'G-08', node: 'X2', name: '电极映射断连', symptom: '左右电极判反，后续迁移和产物一起翻转。', probe: 'NO3- 中 N(+5) 到 NH3 中 N(-3) 是得还是失电子？', repair: '给四条状态变化，只答“氧化/还原→阳/阴极”。', success: '不靠正负极口诀也能映射。', transfer: '换成文字型电解流程。' },
        { id: 'G-09', node: 'X4', name: '离子迁移断连', symptom: '知道左边是阴极，却仍判断 K+ 向右。', probe: '已知左阴极且膜只让阳离子通过，K+ 往哪边？', repair: '在已标阴阳极和膜类型的三张简图上，只画一种离子箭头。', success: '能同时引用膜选择性与电中性。', transfer: '交换装置左右位置再问。' },
        { id: 'G-10', node: 'X10', name: '中间体净速率断连', symptom: '把“NO2- 会继续反应”直接推出“持续下降”。', probe: 'A→B→C 中，d[B]/dt 应怎样表示？已知正负吗？', repair: '对三个 A→B→C 链只写 d[B]/dt=v1-v2，不做电化学。', success: '能在未给速率关系时拒绝判断单调方向。', transfer: '换成 CO2→HCOOH→CH3OH。' },
        { id: 'CTX-Cl2', node: 'X8', name: '氯气现象知识缺失', symptom: '已识别 b 为 Cl2，但不能判断石蕊现象。', probe: 'Cl2 与水生成的两种酸分别提供什么性质？', repair: '只做“气体→水中物种→酸性/漂白性→现象顺序”一条链。', success: '能解释先红后褪色的因果顺序。', transfer: '换成氯水或漂白粉情境。' },
        { id: 'G-11', node: 'Q5', name: '碱性半反应配平断连', symptom: 'N 的电子数正确，但 H/O 或电荷不守恒。', probe: '先只配 NO3-→NH3：N 接受几个电子？再检查哪一侧缺 H/O？', repair: '只配一支半反应，依次做 N、O、H、电荷检查。', success: '四次检查能指出具体失败项。', transfer: '换成另一含氧离子的碱性半反应。' },
        { id: 'G-01', node: 'O1', name: '否定目标丢失', symptom: '四项判断完成，却选择一个正确项。', probe: '题目要求选择正确项还是错误项？', repair: '只圈五个混合极性题干的目标词。', success: '作答前能先复述答案类别。', transfer: '换成“不正确的是”题干。' }
      ]
    },
    Q006: {
      id: 'Q006', year: 2025, province: '安徽', number: '第 5 题', score: '3 分', format: '单项选择',
      title: '在 HOF 与水的反应中区分归中、角色和产物',
      source: '../../化学（按省份分类）2008-2025/2012-2025·（安徽）化学高考真题/2025年高考化学试卷（安徽卷）（解析卷）.pdf',
      image: './assets/q006-anhui-2025-q05-original.png',
      imageAlt: '2025 安徽高考化学第 5 题原题裁切，含 F2 与冰生成 HOF、HOF 与水生成 H2O2 的反应及四个选项。',
      validation: '题面、材料答案、O 的氧化数与角色已独立复核', usage: 'private_analysis_only',
      stem: ['氟气通过碎冰表面发生反应①：F2 + H2O → HOF + HF（-40 ℃）；生成的 HOF 遇水发生反应②：HOF + H2O → HF + H2O2。下列说法正确的是'],
      options: [
        'A．HOF 的电子式中 O、F 的孤电子对数表示正确',
        'B．H2O2 为非极性分子',
        'C．反应①中有非极性键的断裂和形成',
        'D．反应②中 HF 为还原产物'
      ],
      answer: 'A（D 项错误：HF 中 F 的氧化数未变；反应②是 O(0) 与 O(-2) 归中到 O(-1)）',
      analysis: [
        'HOF 中 O 为中心原子，H—O—F 的电子式满足各原子的价层电子结构，A 正确。',
        'H2O2 分子构型不使正、负电荷中心重合，是极性分子，B 错误。',
        '反应①断裂 F—F 非极性键，但形成 H—F、H—O 等极性键，没有新的非极性键形成，C 错误。',
        '反应②中 F 在 HOF 和 HF 中均为 -1，HF 不是氧化/还原产物。HOF 中 O 为 0，水中 O 为 -2，二者在 H2O2 中均为 -1，分别发生还原与氧化。'
      ],
      path: [
        { node: 'O1', action: '先读取“正确的是”', result: '四项分别核验，不能只证明某一项错误', check: '最终答案类别是正确项' },
        { node: 'R1', action: '圈定 HOF、H2O、HF、H2O2 的粒子边界', result: '各分子氧化数代数和均为 0', check: '分子电中性不等于每个原子氧化数为 0' },
        { node: 'R4', action: '标记反应②中 O、F 的前后氧化数', result: 'O：0 与 -2 → -1；F：-1→-1', check: '分别追踪不同来源的 O，F 只作同元素对齐' },
        { node: 'X6', action: '识别两种 O 的变化方式', result: '高、低价 O 共同走向 -1，属于归中', check: '箭头由两端指向中间' },
        { node: 'A1', action: '按自身变化命名 HOF', result: 'HOF 中 O 被还原，HOF 是氧化剂', check: '角色属于反应②' },
        { node: 'A2', action: '按自身变化命名 H2O', result: '水中 O 被氧化，H2O 是还原剂', check: '不能因“水”常被当介质就忽略实际变化' },
        { node: 'O1', action: '回查四个选项', result: 'D 的 HF 未变价；整题只有 A 正确', check: '不把 H2O2 单一标成某一种产物' }
      ],
      gaps: [
        { id: 'G-13', node: 'R1', name: '粒子内原子氧化数混成整体电荷', symptom: '把中性 HOF 中所有原子都判成 0。', probe: 'H、F 按常见规则分别为多少？三者代数和应等于几？', repair: '只做 HOF、H2O2 两个中性分子的氧化数代数式。', success: '能写出 H(+1)、F(-1) 并求出 O。', transfer: '换成 OF2 与 H2O。' },
        { id: 'G-14', node: 'X6', name: '归中关系未建立', symptom: '只看到 HOF 中 O 降低，漏掉水中 O 升高。', probe: '产物 H2O2 有两个 O，分别来自哪两个反应物？', repair: '在数轴上只画 0→-1 与 -2→-1 两支箭头。', success: '能说出两支变化和共同终点。', transfer: '换成高低价同元素生成中间价产物。' },
        { id: 'G-05', node: 'A1', name: '产物和角色命名错位', symptom: '因 HF 是产物就强行称为还原产物。', probe: 'HF 中 F 相比 HOF 中 F 的氧化数是否改变？', repair: '给四个产物，只对实际变价的元素标“氧化/还原产物”。', success: '无变价时主动拒绝角色标签。', transfer: '换成旁观离子也出现在产物侧的方程。' }
      ]
    },
    Q007: {
      id: 'Q007', year: 2025, province: '安徽', number: '第 13 题', score: '3 分', format: '二次电池综合',
      title: '先反转充放电，再判断 Li+ 迁移和溶液质量',
      source: '../../化学（按省份分类）2008-2025/2012-2025·（安徽）化学高考真题/2025年高考化学试卷（安徽卷）（解析卷）.pdf',
      image: './assets/q007-anhui-2025-q13-apparatus.png',
      imageAlt: '2025 安徽高考化学第 13 题锂氢可充电电池示意图，含储氢容器、LiH2PO4 电解质溶液、固体电解质和金属锂。',
      validation: '题面、两组电极反应、质量变化和材料答案已独立复核', usage: 'private_analysis_only',
      stem: ['研究人员开发出一种锂—氢可充电电池，使用前需先充电；固体电解质仅允许 Li+ 通过。下列说法正确的是'],
      options: [
        'A．放电时电解质溶液质量减小',
        'B．放电时电池总反应为 H2 + 2Li → 2LiH',
        'C．充电时 Li+ 移向惰性电极',
        'D．充电时每转移 1 mol 电子，c(H+) 降低 1 mol·L-1'
      ],
      answer: 'C',
      analysis: [
        '充电时惰性电极为阴极：Li+ + e- → Li，所以 Li+ 通过固体电解质移向惰性电极，C 正确。',
        '充电的另一极发生 H2 - 2e- + 2H2PO4- → 2H3PO4；放电时两极反向。',
        '放电每转移 2 mol e-，有 2 mol Li+ 进入溶液，同时生成 1 mol H2 离开溶液，溶液净增重 14-2=12 g，A 错误。',
        '放电总反应为 2Li + 2H3PO4 → H2↑ + 2LiH2PO4，B 错误；D 把物质的量变化直接写成浓度变化，缺少溶液体积。'
      ],
      path: [
        { node: 'O1', action: '识别“使用前先充电”与当前状态', result: '题目同时考充电与放电，过程需分别反向', check: '不把装置标签永久绑定正负极' },
        { node: 'X2', action: '写充电时的阴极支路', result: 'Li+ + e- → Li，惰性电极为阴极', check: '阴极始终得电子' },
        { node: 'X4', action: '结合固体电解质选择性判断迁移', result: '充电时 Li+ 移向惰性电极', check: '只允许 Li+ 通过' },
        { node: 'Q3', action: '把两极电子当量配成同一批', result: '2 mol e- 对 2 mol Li+ 与 1 mol H2', check: '两极电子不重复相加' },
        { node: 'Q7', action: '分别计算进入和离开溶液的质量', result: '放电时净增 12 g/2 mol e-', check: '体系边界是电解质溶液，不是整个电池' },
        { node: 'O1', action: '逐项回查量纲和过程', result: '只有 C 成立', check: '浓度变化必须另有体积' }
      ],
      gaps: [
        { id: 'G-04', node: 'X2', name: '充放电反向未落实到电极', symptom: '充电、放电时都写 Li 失电子。', probe: '“使用前先充电”是要生成 Li 还是消耗 Li？', repair: '只把两条半反应写成一对正反箭头，并标充/放。', success: '换任一运行状态都能选对箭头。', transfer: '换成另一种预充电二次电池。' },
        { id: 'G-09', node: 'X4', name: '只背阳离子向正极', symptom: '未先确定充电阴极就猜 Li+ 方向。', probe: '哪一极正在消耗 Li+？膜又只让谁通过？', repair: '给三张仅标半反应和膜类型的图，只画 Li+ 箭头。', success: '能引用局部消耗与膜选择性。', transfer: '交换左右位置。' },
        { id: 'G-15', node: 'Q7', name: '体系质量边界断连', symptom: '只看到 Li+ 进入便忽略 H2 离开，或把整个电池当溶液。', probe: '以“电解质溶液”为边界，哪种物质进入、哪种离开？', repair: '只列“进入/离开/不在边界内”三栏，再做加减。', success: '先列物流再计算净质量。', transfer: '换成有气体逸出的电解池。' }
      ]
    },
    Q008: {
      id: 'Q008', year: 2025, province: '江苏', number: '第 6 题 A 项', score: '选项训练单元', format: '方程式核验',
      title: '黑火药方程式：守恒通过前先确认真实产物',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（江苏）化学高考真题/2025年高考化学试卷（江苏卷）（解析卷）.pdf',
      validation: '题面、正确方程式、原子与电子守恒已独立复核', usage: 'private_analysis_only',
      stem: ['原题第 6 题要求判断“下列化学反应表示正确的是”。本训练单元只聚焦 A 项：黑火药爆炸写为 2KNO3 + C + 3S → K2CO3 + N2↑ + 3SO2↑。判断该表示是否正确，并写出材料所采用的正确方程式。'],
      options: [],
      answer: 'A 项错误。材料采用：2KNO3 + 3C + S → K2S + N2↑ + 3CO2↑。（整题答案为 D）',
      analysis: [
        '原式首先不能通过 O 原子守恒：左侧 6 个 O，右侧 K2CO3 与 3SO2 共 9 个 O。',
        '更根本的是题给黑火药的实际主要产物应先按材料反应事实确定为 K2S、N2、CO2，而不是用调系数挽救错误产物。',
        '正确式中 N：+5→0，共得 10e-；S：0→-2，得 2e-；3 个 C：0→+4，共失 12e-，总得失相等。',
        '原子、电子均守恒只是方程可接受的检查；实际产物仍来自反应事实，不能由配平程序自行创造。'
      ],
      path: [
        { node: 'O1', action: '把任务缩成“判断 A 并修正”', result: '既要查表达，也要保留真实反应', check: '不是只求一组能配平的系数' },
        { node: 'O2', action: '先锁定材料采用的实际产物', result: 'K2S、N2、CO2', check: '不让配平程序替代反应事实' },
        { node: 'Q5', action: '对原式做最快原子检查', result: 'O：6≠9，原式立即失败', check: '先查元素种类，再查原子数' },
        { node: 'R4', action: '标正确式中的变化中心', result: 'N：+5→0；S：0→-2；C：0→+4', check: 'K 不变价' },
        { node: 'Q2', action: '计算总电子当量', result: 'N 得10、S得2、C失12', check: 'C 有 3 份，N 在 2 个硝酸根中' },
        { node: 'Q3', action: '核验电子守恒', result: '总得12=总失12', check: '电子数不写进总方程' },
        { node: 'B2', action: '保留反应事实边界', result: '守恒是必要条件，不是产物真实性证明', check: '能说明产物依据来自哪里' }
      ],
      gaps: [
        { id: 'G-16', node: 'O2', name: '用配平替代产物判断', symptom: '不断改系数，默认题给产物一定正确。', probe: '如果产物种类写错，改变系数能把它变成真实反应吗？', repair: '做三组“只判断产物事实，不配系数”的微任务。', success: '先确认物种，再进入守恒。', transfer: '换成电解饱和食盐水的错误产物。' },
        { id: 'G-06', node: 'Q2', name: '多中心电子当量漏算', symptom: '只算 N 或只算 C，忽略 S 也被还原。', probe: '正确式中除 N 外，还有哪个元素从 0 变为负价？', repair: '只列 N、S、C 三行“差×原子数×份数”。', success: '三行合计能闭合到 12e-。', transfer: '换一个有两个还原中心的反应。' },
        { id: 'G-11', node: 'Q5', name: '没有主动做最低成本检查', symptom: '长时间分析机理却没发现 O 数量不守恒。', probe: '原式左右 O 原子各有几个？', repair: '连续五式只做 15 秒原子清点，不求答案。', success: '能先用最低成本检查淘汰。', transfer: '换成离子方程式再查电荷。' }
      ]
    },
    Q009: {
      id: 'Q009', year: 2025, province: '江苏', number: '第 8 题', score: '3 分', format: '光电化学综合',
      title: '由电子箭头贯通电极、质子迁移、pH 与产气量',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（江苏）化学高考真题/2025年高考化学试卷（江苏卷）（解析卷）.pdf',
      image: './assets/q009-jiangsu-2025-q08-apparatus.png',
      imageAlt: '2025 江苏高考化学第 8 题光解水装置：左侧受光电极 a、右侧电极 b、质子交换膜和外电路电子箭头。',
      validation: '题面、装置箭头、半反应、pH 与计量已独立复核', usage: 'private_analysis_only',
      stem: ['以稀 H2SO4 为电解质溶液的光解水装置如图，总反应为 2H2O → 2H2↑ + O2↑。下列说法正确的是'],
      options: [
        'A．电极 a 上发生氧化反应生成 O2',
        'B．H+ 通过质子交换膜从右室移向左室',
        'C．光解前后 H2SO4 溶液的 pH 不变',
        'D．外电路每通过 0.01 mol 电子，电极 b 上产生 0.01 mol H2'
      ],
      answer: 'A',
      analysis: [
        '图示电子从 a 经外电路流出，所以 a 发生氧化：2H2O - 4e- → O2↑ + 4H+，A 正确。',
        'b 消耗电子发生还原：2H+ + 2e- → H2↑；H+ 从左室经质子交换膜移向右室，B 错误。',
        '总反应消耗水，H2SO4 的物质的量近似不变但溶剂减少，浓度增大、pH 减小，C 错误。',
        '2 mol e- 生成 1 mol H2，所以 0.01 mol e- 对应 0.005 mol H2，D 错误。'
      ],
      path: [
        { node: 'X3', action: '读取外电路电子箭头', result: '电子由 a 流出、向 b 流入', check: '箭头描述电子而非电流' },
        { node: 'X2', action: '由电子得失命名电极过程', result: 'a 氧化，b 还原', check: '先不套正负极称谓' },
        { node: 'Q3', action: '写两极半反应', result: 'a 生成 O2/H+；b 消耗 H+ 生成 H2', check: '两支电子数配成 4' },
        { node: 'X4', action: '由局部生成/消耗与膜判断迁移', result: 'H+ 从左室向右室', check: '质子交换膜允许 H+ 通过' },
        { node: 'Q7', action: '用 2e-:1H2 做计量', result: '0.01 mol e-→0.005 mol H2', check: '不把电子系数漏除 2' },
        { node: 'O2', action: '检查溶剂也参与总反应', result: '水减少使酸浓度增大、pH 减小', check: '溶质不变不等于浓度不变' },
        { node: 'O1', action: '逐项收束', result: '选 A', check: '其余三项各有明确反证' }
      ],
      gaps: [
        { id: 'G-08', node: 'X3', name: '电子箭头无法映射到电极过程', symptom: '看到电子从 a 流出，却把 a 判为还原。', probe: '一个电极向外电路提供电子，它自身是失还是得电子？', repair: '只看六个电子箭头，标“供电子/收电子→氧化/还原”。', success: '无需正负极口诀即可判断。', transfer: '反转图的左右位置。' },
        { id: 'G-09', node: 'X4', name: '质子迁移只靠异性相吸', symptom: '忽略两室 H+ 的生成和消耗。', probe: '哪一室生成 H+，哪一室消耗 H+？膜允许谁通过？', repair: '先在两室写“+H+/−H+”，再画唯一可行箭头。', success: '方向同时满足物料与膜。', transfer: '换成阳离子交换膜的另一体系。' },
        { id: 'G-17', node: 'O2', name: '溶剂变化未进入浓度模型', symptom: '认为 H2SO4 未反应所以 pH 必不变。', probe: '溶质的量不变而水减少，浓度如何变化？', repair: '只做三组 n 不变、V 改变的 c=n/V 口算。', success: '主动同时检查溶质和溶剂。', transfer: '换成蒸发或电解水情境。' },
        { id: 'G-06', node: 'Q7', name: '半反应系数未接到目标量', symptom: '把 0.01 mol e- 直接当 0.01 mol H2。', probe: '生成 1 mol H2 需要几 mol e-？', repair: '只做 e- 与 H2、Cl2、Cu 三个两列表。', success: '先写比再代数。', transfer: '换为析铜量。' }
      ]
    },
    Q010: {
      id: 'Q010', year: 2025, province: '江苏', number: '第 10 题', score: '3 分', format: '电催化机理与配平',
      title: '区分表面中间步骤与净反应的电子计量',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（江苏）化学高考真题/2025年高考化学试卷（江苏卷）（解析卷）.pdf',
      image: './assets/q010-jiangsu-2025-q10-mechanism.png',
      imageAlt: '2025 江苏高考化学第 10 题 CO2 与 NO3- 电催化生成尿素的四步表面机理图及选项。',
      validation: '题面、C/N 氧化数、16e- 总量、电荷与材料答案已独立复核', usage: 'private_analysis_only',
      stem: ['CO2 与 NO3- 通过电催化反应生成 CO(NH2)2，吸附在催化剂表面的物种用“*”标注。下列说法正确的是'],
      options: [
        'A．过程Ⅱ和过程Ⅲ都有极性共价键形成',
        'B．过程Ⅱ中 NO3- 发生了氧化反应',
        'C．总反应可写为 CO2 + 2NO3- + 18H+ → CO(NH2)2 + 7H2O（未写电子）',
        'D．常温常压、无催化剂时，CO2 与 NH3·H2O 可直接生产尿素'
      ],
      answer: 'A',
      analysis: [
        '过程Ⅱ生成 N—H，过程Ⅲ生成 C—N，均有极性共价键形成，A 正确。',
        'N 由 NO3- 中 +5 降至尿素中 -3；C 由 CO2 中 +4 降至尿素羰基碳 +4? 需谨慎：材料按中间体 *CO 将 C 记为 +2，但净尿素中羰基碳仍为 +4。净反应的 16e- 全部由两个 N 的 +5→-3 提供。',
        '正确的酸性半反应为 CO2 + 2NO3- + 18H+ + 16e- → CO(NH2)2 + 7H2O；C 漏写电子，左右电荷分别 +16 与 0，不守恒。',
        '催化机理和反应条件不能由一个守恒式替代；常温常压无催化剂时 CO2 与氨水主要形成铵盐，D 错误。'
      ],
      path: [
        { node: 'O1', action: '分开结构、氧化数、方程与可行性四类判断', result: '每个选项调用不同检查，不用单一口诀包办', check: '知道 A 与 C 的证据类型不同' },
        { node: 'O3', action: '对齐 N 的前后载体', result: '2 个 NO3- 中 N(+5) → 尿素中 N(-3)', check: '尿素中 N 与 H、C 相连，氧化数为 -3' },
        { node: 'Q1', action: '求每个 N 的电子当量', result: '每个 N 得 8e-', check: '+5→-3 的差为 8' },
        { node: 'Q2', action: '乘以两个 N', result: '总共接受 16e-', check: '产物含两个 N' },
        { node: 'Q5', action: '在酸性介质补 H2O、H+、e-', result: '得到含 16e- 的正确半反应', check: 'C/N/H/O 与总电荷均守恒' },
        { node: 'B5', action: '区分净电子记账与表面机理', result: '净 16e- 不等于每个中间步骤的唯一微观轨迹', check: '星号物种只描述吸附态' },
        { node: 'O1', action: '回查四项', result: 'A 正确；B/C/D 各自失败', check: 'C 左右电荷一眼可否决' }
      ],
      gaps: [
        { id: 'G-06', node: 'Q2', name: '多原子中心漏乘', symptom: '算出每个 N 得 8e- 就停在 8e-。', probe: '一分子尿素里有几个由硝酸根来的 N？', repair: '连续三题只写“每原子差×变化原子数”。', success: '能明确 8×2=16 的计数单位。', transfer: '换成 N2H4 或双金属中心。' },
        { id: 'G-11', node: 'Q5', name: '原子守恒后忘查电荷', symptom: '接受 C 项，因为原子数看起来平。', probe: 'C 项左侧总电荷与右侧总电荷各是多少？', repair: '五个离子方程只做最后一列“左右总电荷”。', success: '把电荷检查列为独立步骤。', transfer: '换成碱性半反应。' },
        { id: 'G-18', node: 'B5', name: '氧化数记账与机理混同', symptom: '用净电子数声称过程Ⅱ恰好一次转移全部电子。', probe: '净反应守恒能否唯一确定每个吸附中间步骤？', repair: '把“净计量能推出/不能推出”各写两条。', success: '能区分总量约束与机理顺序。', transfer: '换成另一催化循环图。' }
      ]
    },
    Q011: {
      id: 'Q011', year: 2025, province: '湖北', number: '第 12 题', score: '3 分', format: '电池新情境',
      title: '区分主电极材料与补锂添加剂的旁路氧化',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（湖北）化学高考真题/2025年高考化学试卷（湖北卷）（解析卷）.pdf',
      image: './assets/q011-hubei-2025-q12-original.png',
      imageAlt: '2025 湖北高考化学第 12 题原题裁切，描述 LiSO2CF3 补锂试剂在充电时转化为气体离去。',
      validation: '题面、添加剂电极反应、Fe 价态与材料答案已独立复核', usage: 'private_analysis_only',
      stem: ['某电池正极材料为 LiFePO4，负极材料为嵌锂石墨。补锂试剂 LiSO2CF3 能使失活电池再生并保持原结构。注入后充电补锂，[SO2CF3]- 转化为气体离去。下列说法错误的是'],
      options: [
        'A．[SO2CF3]- 在阳极失去电子',
        'B．生成气体中含有氟代烃',
        'C．过程中铁元素的价态降低',
        'D．[SO2CF3]- 反应并离去是电池保持原结构的原因'
      ],
      answer: 'C',
      analysis: [
        '充电时 Li+ 在阴极得到电子并嵌入负极；[SO2CF3]- 在阳极失电子，A 正确。',
        '阳极反应为 2[SO2CF3]- - 2e- → 2SO2 + CF3—CF3，产物含氟代烃，B 正确。',
        '这条补锂旁路反应不要求 LiFePO4 正极材料参与，题干给出的过程中 Fe 价态保持不变，C 错误。',
        '添加剂反应后以气体离去，不在电池内部累积新固相，有利于保持原结构，D 正确。'
      ],
      path: [
        { node: 'O1', action: '读取“充电补锂”且寻找错误项', result: '不能把常规放电方向直接套入', check: '目标是错误项' },
        { node: 'O2', action: '列出真正发生变化的两类粒子', result: 'Li+ 与 [SO2CF3]-；Fe 未被题面写入反应', check: '材料名称出现不等于一定参与' },
        { node: 'X2', action: '按得失电子映射两极', result: 'Li+ 在阴极还原，阴离子在阳极氧化', check: '充电时阴阳极定义仍按过程' },
        { node: 'Q5', action: '核验添加剂半反应', result: '2 个阴离子失 2e- 生成 2SO2 与 CF3—CF3', check: '原子和总电荷守恒' },
        { node: 'A3', action: '只给实际变化者赋角色', result: '不能因“正极材料”四字就宣布 Fe 被还原', check: '先找 Fe 的前后载体' },
        { node: 'B4', action: '阻断材料名称到永久角色的跳步', result: '本过程 Fe 价态不变，C 为错误项', check: '结论引用本次旁路反应' }
      ],
      gaps: [
        { id: 'G-02', node: 'O2', name: '把所有已出现物质都当变化中心', symptom: '看到 LiFePO4 就自动追踪 Fe 并判变价。', probe: '题干明确写出的生成/消耗粒子是哪两个？Fe 的后态在哪里？', repair: '给三段流程，只圈“有前态也有后态”的粒子。', success: '无后态证据时不擅自宣布变化。', transfer: '换成催化剂或电极载体情境。' },
        { id: 'G-08', node: 'X2', name: '充电时阳极氧化映射断连', symptom: '认为充电阳极应得电子。', probe: '不谈正负极：阳极的定义是氧化还是还原？', repair: '四个充放电情境只填“阳极氧化/阴极还原”。', success: '过程命名稳定，不随正负极混乱。', transfer: '换成电镀。' },
        { id: 'G-12', node: 'B4', name: '按“正极材料”贴还原标签', symptom: '把正极、氧化剂、还原过程当作永久同义词。', probe: '本次充电补锂中，正极材料是否写进半反应？', repair: '对“电极材料/活性粒子/旁路添加剂”做三栏归类。', success: '只有实际变化粒子获得角色。', transfer: '换成惰性电极。' }
      ]
    },
    Q012: {
      id: 'Q012', year: 2025, province: '湖北', number: '第 18 题（1）', score: '填空子问', format: '对照实验与现象解释',
      title: '把葡萄糖还原 Cu2+ 与空白组受热分解分开',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（湖北）化学高考真题/2025年高考化学试卷（湖北卷）（解析卷）.pdf',
      validation: '题面、两种沉淀、价态变化和方程式已独立复核', usage: 'private_analysis_only',
      stem: [
        '向 2 mL 10% NaOH 溶液中加入 5 滴 5% CuSO4 溶液，振荡后加入 2 mL 10% 葡萄糖溶液并加热。①砖红色沉淀的化学式是什么？葡萄糖表现什么性质？',
        '②若没有加入葡萄糖溶液就加热，生成黑色沉淀。用化学方程式说明原因。'
      ],
      options: [],
      answer: '① Cu2O；还原性。② Cu(OH)2 受热分解：Cu(OH)2 → CuO + H2O（Δ）。',
      analysis: [
        '含葡萄糖组中 Cu 由 +2 降到 Cu2O 中 +1，铜物种被还原；葡萄糖提供电子当量，表现还原性。',
        '砖红色是 Cu2O 的物种证据，但仍要结合新制 Cu(OH)2、碱性和加热条件。',
        '空白加热组未加入葡萄糖，黑色 CuO 来自 Cu(OH)2 受热分解，Cu 仍为 +2，不是一次还原。',
        '两组必须分开解释；不能用含葡萄糖组的 redox 模型覆盖空白组。'
      ],
      path: [
        { node: 'O1', action: '把两个实验小问分成两个因果任务', result: '砖红组判断 redox；黑色空白组解释热分解', check: '不把两组混成同一反应' },
        { node: 'X8', action: '将颜色映射到候选物种', result: '砖红候选 Cu2O，黑色候选 CuO', check: '颜色须与条件共同使用' },
        { node: 'O3', action: '对齐含葡萄糖组中 Cu 的前后载体', result: 'Cu(OH)2/Cu2+ 中 +2 → Cu2O 中 +1', check: 'Cu2O 的 O 为 -2' },
        { node: 'C4', action: '命名铜的变化', result: 'Cu 被还原', check: '氧化数降低' },
        { node: 'A2', action: '反推葡萄糖角色', result: '葡萄糖表现还原性', check: '使对方还原者自身被氧化' },
        { node: 'X8', action: '用空白组排除葡萄糖作用', result: 'Cu(OH)2 受热生成 CuO，Cu 价态不变', check: '方程式不需要电子' }
      ],
      gaps: [
        { id: 'G-19', node: 'X8', name: '现象到物种只靠颜色', symptom: '一见黑色就写 Cu，忽略空白组条件。', probe: '空白组最初已经制得什么沉淀？它受热常生成什么？', repair: '对三组“颜色＋试剂＋条件”只选候选物种并写排除理由。', success: '现象解释至少引用一个条件。', transfer: '换成 Fe(OH)2/Fe(OH)3。' },
        { id: 'G-05', node: 'A2', name: '对方被还原却不会命名还原剂', symptom: '能写 Cu(+2)→Cu(+1)，仍答葡萄糖有氧化性。', probe: '铜得到电子，这批电子由谁给出？', repair: '固定句式“X 使 Cu 被还原，所以 X 是还原剂”做三次。', success: '自身变化与角色命名一致。', transfer: '换银镜反应。' },
        { id: 'G-20', node: 'O1', name: '对照组模型串台', symptom: '把黑色 CuO 也解释成葡萄糖还原产物。', probe: '该操作明确缺少哪一种试剂？', repair: '只练“实验组—对照组唯一差异—能归因什么”三联表。', success: '两组分别写反应，不共享不存在的试剂。', transfer: '换成催化剂空白对照。' }
      ]
    },
    Q013: {
      id: 'Q013', year: 2025, province: '广东', number: '第 11 题', score: '3 分', format: '串联实验综合',
      title: '在串联装置中分开 H2O2 歧化、碘显色与乙醇氧化',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（广东）化学高考真题/2025年高考化学试卷（广东卷）（解析卷）.pdf',
      image: './assets/q013-guangdong-2025-q11-apparatus.png',
      imageAlt: '2025 广东高考化学第 11 题串联实验装置，含 H2O2/MnO2 发生器、酸化淀粉-KI、铜丝乙醇氧化与银氨溶液。',
      validation: '题面、装置时序、H2O2 歧化、乙醇产物和材料答案已独立复核', usage: 'private_analysis_only',
      stem: ['打开 K1、K2，一定时间后 a 中溶液变蓝；关闭 K1、打开 K3，点燃酒精灯加热数分钟后滴入无水乙醇。下列说法错误的是'],
      options: [
        'A．a 中现象体现了 I- 的还原性',
        'B．b 中 H2O2 既作氧化剂也作还原剂',
        'C．乙醇滴加过程中，c 中铜丝由黑变红，说明乙醇被氧化',
        'D．d 中有银镜反应发生，说明 c 中产物有乙酸'
      ],
      answer: 'D',
      analysis: [
        'b 中 MnO2 催化 2H2O2 → 2H2O + O2。O(-1) 分别变为 -2 和 0，是歧化，H2O2 同时承担两种角色。',
        'O2 进入 a 氧化 I- 为 I2，淀粉显蓝，说明 I- 给出电子、具有还原性。',
        'c 中 Cu 先被 O2 氧化为黑色 CuO；乙醇把 CuO 还原为红色 Cu，自身被氧化为乙醛。',
        '银镜反应需要加热，图示 d 未加热；并且 c 的主要有机产物是乙醛而非乙酸，所以 D 错误。'
      ],
      path: [
        { node: 'O1', action: '按阀门和加热时序切分装置', result: '先制 O2/检验 I-，再做乙醇催化氧化', check: '不同阶段不串用条件' },
        { node: 'X6', action: '追踪 H2O2 中 O(-1)', result: '一支到 O2 中 0，一支到 H2O 中 -2', check: '同一中间价态分别升降' },
        { node: 'A3', action: '按两支变化命名 H2O2', result: '在歧化中同时作氧化剂和还原剂', check: '不是永久单一角色' },
        { node: 'X8', action: '解释 a 中蓝色证据', result: 'I- 被 O2 氧化为 I2，体现还原性', check: '淀粉只是显色试剂' },
        { node: 'X11', action: '对齐乙醇关键碳与产物', result: '乙醇→乙醛，关键碳氧化程度升高', check: '铜丝黑→红只支持 CuO 被还原' },
        { node: 'Q6', action: '检查银镜所需条件', result: 'd 未加热，不能发生题述银镜', check: '反应物与条件必须同时满足' },
        { node: 'O1', action: '回到错误项', result: '选 D', check: 'D 同时错在条件与有机产物判断' }
      ],
      gaps: [
        { id: 'G-21', node: 'X6', name: 'H2O2 被贴成永久氧化剂', symptom: '不看产物就否认 B。', probe: 'H2O2 中 O(-1) 到 O2(0) 与 H2O(-2) 分别是什么变化？', repair: '只画 -2、-1、0 数轴并标两支箭头。', success: '能由实际升降说明双重角色。', transfer: '换成 Cl2 与碱的歧化。' },
        { id: 'G-19', node: 'X8', name: '把显色试剂当反应中心', symptom: '认为淀粉被氧化才变蓝。', probe: '没有淀粉时，O2 与 I- 的氧化还原是否仍发生？蓝色对应什么物种？', repair: '把“反应物—指示剂—现象”分三栏。', success: '能说出 I2—淀粉提供证据。', transfer: '换成 Fe3+/SCN- 显色。' },
        { id: 'G-22', node: 'Q6', name: '条件信息被装置整体覆盖', symptom: '看到前段酒精灯就默认 d 也被加热。', probe: '火焰实际位于哪一段？银氨试管 d 是否受热？', repair: '三张串联装置只圈“条件作用范围”。', success: '能按空间和时序限定条件。', transfer: '换冷凝或尾气吸收装置。' }
      ]
    },
    Q014: {
      id: 'Q014', year: 2025, province: '广东', number: '第 14 题', score: '3 分', format: '水系电池综合',
      title: '由 MnO2 减少反推电极方向、pH 与容量',
      source: '../../化学（按省份分类）2008-2025/2008-2025·（广东）化学高考真题/2025年高考化学试卷（广东卷）（解析卷）.pdf',
      image: './assets/q014-guangdong-2025-q14-apparatus.png',
      imageAlt: '2025 广东高考化学第 14 题水系电池图，电极 I 为 S/MnS，电极 II 为 MnO2，两侧为 MnSO4 溶液。',
      validation: '题面、两极半反应、pH、16 g S 容量与材料答案已独立复核', usage: 'private_analysis_only',
      stem: ['一种高容量水系电池如图。已知放电时电极Ⅱ上 MnO2 减少；电极材料每转移 1 mol 电子对应理论容量 26.8 A·h。下列说法错误的是'],
      options: [
        'A．充电时Ⅱ为阳极',
        'B．放电时Ⅱ极室中溶液的 pH 降低',
        'C．放电时负极反应为 MnS - 2e- → S + Mn2+',
        'D．充电时 16 g S 能提供的理论容量为 26.8 A·h'
      ],
      answer: 'B',
      analysis: [
        '放电时 MnO2 减少并转化为 Mn2+：MnO2 + 4H+ + 2e- → Mn2+ + 2H2O，电极Ⅱ发生还原，是正极。',
        '该反应消耗 H+，所以Ⅱ极室 pH 升高而不是降低，B 错误。',
        '电极Ⅰ中 MnS 被氧化：MnS - 2e- → S + Mn2+，是放电负极反应，C 正确。',
        '充电时方向反转，Ⅱ为阳极。16 g S 为 0.5 mol，生成 MnS 需 1 mol e-，理论容量为 26.8 A·h，A、D 正确。'
      ],
      path: [
        { node: 'O1', action: '读取“放电时 MnO2 减少”和错误项', result: '以放电事实为锚，再反推充电', check: '不先猜电极正负' },
        { node: 'O3', action: '对齐电极Ⅱ中 Mn 的载体', result: 'MnO2 中 +4 → Mn2+ 中 +2', check: '“减少”指物质被消耗，不是氧化数减少的同义词' },
        { node: 'X2', action: '由还原映射电极', result: '放电Ⅱ为正极/还原极；充电Ⅱ为阳极', check: '充电反向' },
        { node: 'Q5', action: '写酸性半反应', result: 'MnO2 + 4H+ + 2e- → Mn2+ + 2H2O', check: '原子与电荷均为 +2' },
        { node: 'Q7', action: '由 H+ 计量判断 pH', result: '放电消耗 H+，pH 升高', check: '先判断 c(H+) 方向再转为 pH' },
        { node: 'Q2', action: '由充电半反应连接 S 与电子', result: '0.5 mol S 对 1 mol e-', check: '每 mol S 需要 2 mol e-' },
        { node: 'Q4', action: '换算理论容量', result: '1 mol e-→26.8 A·h', check: '16 g S=0.5 mol' },
        { node: 'O1', action: '回查错误项', result: '选 B', check: 'A/C/D 均与同一组半反应一致' }
      ],
      gaps: [
        { id: 'G-08', node: 'X2', name: '“物质减少”直接映射电极', symptom: '认为 MnO2 减少就一定发生氧化。', probe: 'Mn 从 +4 到 +2 是得电子还是失电子？', repair: '三组“物质量减少但可能氧化/还原”的题只追踪价态。', success: '以电子方向而非“增减”词命名电极。', transfer: '换成电极质量减小的金属负极。' },
        { id: 'G-23', node: 'Q7', name: 'H+ 与 pH 方向反转', symptom: '写出消耗 H+ 却仍判 pH 降低。', probe: 'c(H+) 变小，-lg c(H+) 变大还是变小？', repair: '只做五次 c(H+)↑/↓ 与 pH 方向转换。', success: '能用定义解释方向。', transfer: '换成生成 OH- 的电极。' },
        { id: 'G-06', node: 'Q2', name: '质量—物质的量—电子链断开', symptom: '把 16 g S 直接对应 0.5×26.8 A·h。', probe: '0.5 mol S 的半反应系数对应几 mol e-？', repair: '只写三格：m(S)→n(S)→n(e-)→容量。', success: '每格注明单位和比例。', transfer: '换成 32 g 或不同电子系数。' }
      ]
    },
    Q015: {
      id: 'Q015', year: 2025, province: '重庆', number: '第 9 题', score: '3 分', format: '实验结论证据判断',
      title: '逐项判断实验现象能推出什么、不能推出什么',
      source: '../../化学（按省份分类）2008-2025/2012-2025·（重庆）化学高考真题/2025年高考化学试卷（重庆卷）（解析卷）.pdf',
      image: './assets/q015-chongqing-2025-q09-table.png',
      imageAlt: '2025 重庆高考化学第 9 题原题表格，列出镁与 CO2、盐溶液 pH、锌铜接触腐蚀和葡萄糖检验四组证据。',
      validation: '题面、四项推理边界、材料答案与关键 redox 关系已独立复核', usage: 'private_analysis_only',
      stem: ['下列实验操作及其现象不能推出相应结论的是'],
      options: [
        'A．点燃的镁条伸入 CO2，产生白烟和黑色固体 → CO2 具有氧化性',
        'B．用 pH 计测得碳酸钠溶液的 pH 小于苯酚钠溶液的 pH → 酸性：碳酸＞苯酚',
        'C．锌片在稀盐酸中放气；铜丝接触锌后放气加快 → 电化学腐蚀速率＞化学腐蚀速率',
        'D．葡萄糖与新制 Cu(OH)2 悬浊液加热生成砖红色沉淀 → 葡萄糖属于还原糖'
      ],
      answer: 'B',
      analysis: [
        'A 中 2Mg + CO2 → 2MgO + C；CO2 中 C 由 +4 降到 0，接受电子，体现氧化性，结论可推出。',
        'B 未说明两种盐溶液等浓度；而且水解直接比较的是 HCO3- 与苯酚的酸性关系，不能越级推出“碳酸＞苯酚”，结论证据不足。',
        'C 中 Cu、Zn 接触并浸在电解质中形成原电池，H+ 在铜上更快还原为 H2，支持电化学腐蚀加快。',
        'D 中 Cu(II) 被还原为砖红色 Cu2O，葡萄糖提供电子当量，表现还原性，结论可推出。'
      ],
      path: [
        { node: 'O1', action: '把目标改写为“找证据不足的一项”', result: '不是找结论本身一定错误', check: '关注“能否推出”' },
        { node: 'X8', action: '为每项建立“现象→中间事实→结论”链', result: '四项必须逐条检查是否缺桥梁', check: '不能从现象直接跳标签' },
        { node: 'R4', action: '核验 A 的变化中心', result: 'CO2 中 C(+4)→C(0)，CO2 被还原', check: 'Mg：0→+2 与其耦合' },
        { node: 'A1', action: '由自身被还原命名 CO2', result: 'CO2 在该反应中是氧化剂', check: '角色只属于镁燃烧反应' },
        { node: 'Q6', action: '检查 B 的比较条件与推理层级', result: '缺等浓度，且盐水解只直接连接到共轭酸', check: '现象没有唯一锁定题给酸性排序' },
        { node: 'X7', action: '核验 C 的装置改变', result: '接触 Cu 后形成原电池，速率增大有模型支持', check: '相同 Zn/酸条件，新增电极通道' },
        { node: 'X11', action: '核验 D 的有机 redox', result: 'Cu(+2)→Cu(+1)，葡萄糖表现还原性', check: '砖红物种为 Cu2O' },
        { node: 'O1', action: '收束证据最弱项', result: '选 B', check: '表述为“不能由本实验推出”' }
      ],
      gaps: [
        { id: 'G-24', node: 'X8', name: '现象直接跳结论', symptom: '只因两个 pH 有大小就接受任意酸性排序。', probe: '两种溶液的浓度是否相同？盐的 pH 直接由哪个共轭碱水解决定？', repair: '给三组实验，只补写缺失的控制变量或中间事实。', success: '能指出至少一个具体缺口。', transfer: '换沉淀转化或置换强弱实验。' },
        { id: 'G-05', node: 'A1', name: 'CO2 因“常见稳定”而被排除氧化性', symptom: '认为 CO2 不可能是氧化剂。', probe: '反应后黑色 C 的氧化数是多少？它来自 CO2 中的谁？', repair: '只追踪 Mg 与 C 两行氧化数，不讨论物质常见印象。', success: '由实际变化给 CO2 命名角色。', transfer: '换成活泼金属与 N2。' },
        { id: 'G-19', node: 'X11', name: '砖红现象与还原糖连接不完整', symptom: '背“砖红=还原糖”，说不出电子方向。', probe: 'Cu(OH)2 中 Cu(+2) 到 Cu2O 中 Cu 是多少价？', repair: '只写 Cu(+2)→Cu(+1)→葡萄糖给电子这一条链。', success: '标签可由价态变化重新推出。', transfer: '换成银镜反应。' }
      ]
    }
  };

  var expandedQuestionBank = window.expandedQuestionBank || {};

  function inferExpandedQuestionEdges(path) {
    var result = [];
    var seen = {};
    for (var i = 1; i < path.length; i += 1) {
      var previous = path[i - 1].node;
      var current = path[i].node;
      edges.forEach(function (edge) {
        var connectsPair = (edge.from === previous && edge.to === current) ||
          (edge.from === current && edge.to === previous);
        if (connectsPair && !seen[edge.id]) {
          seen[edge.id] = true;
          result.push(edge.id);
        }
      });
    }
    return result;
  }

  Object.keys(expandedQuestionBank).forEach(function (id) {
    var question = expandedQuestionBank[id];
    var pathNodes = [];
    var seenNodes = {};
    questionBank[id] = question;
    question.path.forEach(function (pathStep) {
      if (!seenNodes[pathStep.node]) {
        seenNodes[pathStep.node] = true;
        pathNodes.push(pathStep.node);
      }
    });
    questions[id] = {
      name: id + ' ' + (question.short || question.title),
      short: question.short || id,
      nodes: pathNodes,
      edges: inferExpandedQuestionEdges(question.path),
      note: question.year + ' ' + question.province + ' ' + question.number + '：' + question.title
    };
  });

  // PROTOTYPE QUESTION: Does an option/subquestion-level route make the reviewed
  // whole-question path easier to inspect without inventing unsupported steps?
  // Transcribed options use reviewed, manually selected subsets of the existing path.
  var optionUnitSpecs = {
    Q001: [
      { keyword: '氧化还原判定', nodes: ['O1','O2','O3','R4','C5'], analysis: 0 },
      { keyword: '元素价态升降', nodes: ['O1','O2','O3','R4','C5'], analysis: 1 },
      { keyword: '元素价态升降', nodes: ['O1','O2','O3','R4','C5'], analysis: 2 },
      { keyword: '元素价态升降', nodes: ['O1','O2','O3','R4','C5'], analysis: 3 }
    ],
    Q005: [
      { keyword: '离子迁移与电中性', nodes: ['O1','O3','X2','X4'], analysis: 0 },
      { keyword: '中间体净速率', nodes: ['O1','O3','X10'], analysis: 1 },
      { keyword: '气体现象证据', nodes: ['O1','O3','X2','X8'], analysis: 2 },
      { keyword: '两极半反应相加', nodes: ['O1','O3','Q5'], analysis: 3 }
    ],
    Q006: [
      { keyword: '电子式', nodes: [], analysis: 0, outside: '该选项主要依赖分子结构与电子式，不在当前氧化还原知识图内伪造路径。' },
      { keyword: '分子极性', nodes: [], analysis: 1, outside: '该选项需要分子空间结构与极性模型，当前氧化还原图不展开。' },
      { keyword: '键的极性', nodes: [], analysis: 2, outside: '该选项需要化学键类型模型，不把它错挂到氧化还原节点上。' },
      { keyword: '归中与产物命名', nodes: ['O1','R1','R4','X6','A1','A2'], analysis: 3 }
    ],
    Q007: [
      { keyword: '放电时溶液质量', nodes: ['O1','X2','Q3','Q7'], analysis: 2 },
      { keyword: '充放电方向反转', nodes: ['O1','X2','Q3'], analysis: 3 },
      { keyword: 'Li+ 迁移方向', nodes: ['O1','X2','X4'], analysis: 0 },
      { keyword: '物质的量不能直接当浓度', nodes: ['O1','Q3','Q7'], analysis: 3 }
    ],
    Q009: [
      { keyword: '电子流向到电极反应', nodes: ['X3','X2','Q3'], analysis: 0 },
      { keyword: '质子迁移', nodes: ['X3','X2','X4'], analysis: 1 },
      { keyword: '溶剂变化与 pH', nodes: ['X2','Q3','Q7','O2'], analysis: 2 },
      { keyword: '电子与气体计量', nodes: ['X2','Q3','Q7'], analysis: 3 }
    ],
    Q010: [
      { keyword: '极性共价键', nodes: [], analysis: 0, outside: '该选项主要检查化学键形成，当前氧化还原图只保留与净反应相关的路径。' },
      { keyword: '过程与净反应分层', nodes: ['O1','O3','Q1','B5'], analysis: 1 },
      { keyword: '16e- 电荷守恒', nodes: ['O1','O3','Q1','Q2','Q5','B5'], analysis: 2 },
      { keyword: '守恒不能代替反应条件', nodes: ['O1','B5'], analysis: 3 }
    ],
    Q011: [
      { keyword: '阳极失电子', nodes: ['O1','O2','X2','Q5'], analysis: 0 },
      { keyword: '阳极气体产物', nodes: ['O2','Q5'], analysis: 1 },
      { keyword: '铁价态未变', nodes: ['O1','O2','A3','B4'], analysis: 2 },
      { keyword: '添加剂旁路反应', nodes: ['O2','Q5','A3','B4'], analysis: 3 }
    ],
    Q013: [
      { keyword: 'I- 的还原性', nodes: ['O1','X8','A3'], analysis: 1 },
      { keyword: 'H2O2 歧化', nodes: ['O1','X6','A3'], analysis: 0 },
      { keyword: '现象到有机氧化', nodes: ['O1','X8','X11'], analysis: 2 },
      { keyword: '银镜反应条件', nodes: ['O1','X11','Q6'], analysis: 3 }
    ],
    Q014: [
      { keyword: '充放电电极反转', nodes: ['O1','O3','X2'], analysis: 3 },
      { keyword: '半反应中 H+ 消耗', nodes: ['O1','O3','X2','Q5'], analysis: 1 },
      { keyword: '负极半反应', nodes: ['O1','O3','X2','Q5'], analysis: 2 },
      { keyword: '电子当量与容量', nodes: ['O1','O3','X2','Q2','Q4','Q7'], analysis: 3 }
    ],
    Q015: [
      { keyword: 'CO2 的氧化性', nodes: ['O1','X8','R4','A1'], analysis: 0 },
      { keyword: '控制变量与强弱证据', nodes: ['O1','X8','Q6','X7'], analysis: 1 },
      { keyword: '原电池加速腐蚀', nodes: ['O1','X8','X7'], analysis: 2 },
      { keyword: '现象到还原糖', nodes: ['O1','X8','X11'], analysis: 3 }
    ]
  };

  var pathArchetypes = [
    {
      id: 'T1', name: '价态—反应角色判定', short: '价态角色', color: '#d46b3c',
      summary: '从同一元素的反应前后载体出发，先判价态变化，再命名氧化、还原及试剂角色。',
      cues: ['氧化剂/还原剂', '氧化性/还原性', '氧化产物/还原产物'],
      backbone: [
        { node: 'O1', action: '锁定具体反应阶段和待判对象' },
        { node: 'O3', action: '把同一元素的反应前后载体对齐' },
        { node: 'R4', action: '比较氧化数的升高、降低或不变' },
        { node: 'C3', action: '由实际得失电子命名试剂角色' }
      ],
      branches: [
        { label: '价态升高', route: ['C1','A2'], note: '失去形式电子当量，该物质是还原剂。' },
        { label: '价态降低', route: ['C2','A1'], note: '得到形式电子当量，该物质是氧化剂。' },
        { label: '价态不变', route: ['A3','B4'], note: '不能只因物质名称就强行贴角色标签。' }
      ],
      boundary: '角色只属于这一个具体反应；“常见氧化剂”不代表在任何情境中都是氧化剂。',
      probe: '只追踪题中该物质实际改变的元素：它反应前后的氧化数分别是多少？',
      repair: '只画“反应前载体—氧化数箭头—反应后载体”两行，暂不写完整方程式。',
      match: function (question, nodeIds) { return ['A1','A2','C3','C4','C5'].some(function (id) { return nodeIds.indexOf(id) >= 0; }); }
    },
    {
      id: 'T2', name: '陌生方程式与半反应配平', short: '方程配平', color: '#367c6a',
      summary: '先确定实际变化粒子和价态差，再用电子、原子与电荷守恒完成方程式。',
      cues: ['书写半反应', '离子方程式正误', '陌生产物配平'],
      backbone: [
        { node: 'O2', action: '确定当前介质中的实际粒子' },
        { node: 'O3', action: '对齐变化元素的前后载体' },
        { node: 'R4', action: '由氧化数差得到每粒子电子差' },
        { node: 'Q3', action: '令总失电子数与总得电子数相等' },
        { node: 'Q5', action: '配平并逐项检查原子、电荷和电子' },
        { node: 'Q6', action: '用酸碱介质和题给条件限定实际形式' }
      ],
      branches: [
        { label: '净离子方程式', route: ['X1'], note: '先移除旁观离子，但弱电解质不能机械拆分。' },
        { label: '电极半反应', route: ['X2'], note: '先定阴阳极和电子所在一侧，再完成电荷检查。' },
        { label: '反应可行性', route: ['B2'], note: '守恒只是必要条件，不能由“可配平”推出“必发生”。' }
      ],
      boundary: '配平程序不能自动创造题目没有给出的产物，产物与介质必须有反应事实支持。',
      probe: '不配完式，只说变化中心每份得或失几个电子，两边最小公倍是多少？',
      repair: '只配一支半反应，固定按“中心元素→O→H→电荷”四次检查。',
      match: function (question, nodeIds, text) { return nodeIds.indexOf('Q5') >= 0 && (/方程|配平|半反应/.test(text) || nodeIds.indexOf('Q3') >= 0); }
    },
    {
      id: 'T3', name: '电化学方向、电极与迁移', short: '电化学方向', color: '#3479a7',
      summary: '从电极上的实际物质变化出发，依次确定氧化/还原、阴阳极、电子方向与离子迁移。',
      cues: ['充电/放电', '阴极/阳极', '电子或离子迁移'],
      backbone: [
        { node: 'O3', action: '读出两极实际变化的前后载体' },
        { node: 'R4', action: '根据价态变化判定氧化或还原' },
        { node: 'X2', action: '用“阴极还原、阳极氧化”命名电极' },
        { node: 'X3', action: '外电路电子从氧化的阳极流向还原的阴极' },
        { node: 'X4', action: '结合膜类型、电极反应和电中性判断离子迁移' }
      ],
      branches: [
        { label: '半反应书写', route: ['Q5','Q6'], note: '电极定位后再配原子、电荷和介质粒子。' },
        { label: '电量与物料计算', route: ['X5','Q4','Q7'], note: '先经电子物质的量这座桥，不直接把电量对应到任意物质。' },
        { label: 'pH 或溶液变化', route: ['Q6','Q7'], note: '从半反应中实际生成/消耗的 H+、OH- 和溶剂出发。' }
      ],
      boundary: '正负极会随原电池/电解池以及充放电状态改变；阴阳极才是由氧化还原定义的稳定名称。',
      probe: '先不问正负极：题给状态下，哪一极的哪个物质在得电子？',
      repair: '只做四组“物质变化→氧化/还原→阳/阴极”三步映射，暂不算电势与定量。',
      match: function (question, nodeIds) { return nodeIds.indexOf('X2') >= 0; }
    },
    {
      id: 'T4', name: '电子当量与氧化还原定量', short: '电子当量', color: '#8c66b8',
      summary: '把价态差、粒子个数和反应份数合成一批电子，再连到目标物质的量。',
      cues: ['转移电子数', '质量/体积/含量', '电量与滴定计算'],
      backbone: [
        { node: 'O3', action: '对齐定量中心的前后载体' },
        { node: 'Q1', action: '求每个变价原子的电子差' },
        { node: 'Q2', action: '乘原子数与物质份数，但不重复计数两极同一批电子' },
        { node: 'Q4', action: '建立电子与目标物质的计量比' },
        { node: 'Q7', action: '最后换算质量、体积、浓度或百分含量' }
      ],
      branches: [
        { label: '外电路电量', route: ['X5'], note: '用 Q=n(e-)F 先得电子物质的量。' },
        { label: '滴定计量', route: ['Q5','Q6'], note: '标准液经半反应电子当量连到待测物。' },
        { label: '多中心或平均价', route: ['R5'], note: '先分清总电子差与平均价，再进入物质的量。' }
      ],
      boundary: '系数比只能在同一反应进度中使用；不能把某个物质的系数孤立当成电子数。',
      probe: '请只写一组反应同时对应几 mol e- 和几 mol 目标物，不代入数字。',
      repair: '画一张两列表：左列只写 n(e-)，右列只写目标物质，仅填一组反应的对应量。',
      match: function (question, nodeIds) {
        var hasQuantBridge = nodeIds.indexOf('Q4') >= 0 && ['Q1','Q2','Q3','Q7','X5'].some(function (id) { return nodeIds.indexOf(id) >= 0; });
        var isDirectElectronCount = nodeIds.indexOf('Q1') >= 0 && nodeIds.indexOf('Q2') >= 0;
        return hasQuantBridge || isDirectElectronCount;
      }
    },
    {
      id: 'T5', name: '实验现象—微观结论证据链', short: '实验证据', color: '#c18d22',
      summary: '先确认实际发生颜色、气体、沉淀或指示变化的物种，再逐层连到价态和反应结论。',
      cues: ['颜色、气体、沉淀', '对照实验', '现象能否证明'],
      backbone: [
        { node: 'O1', action: '明确题目要求证明的结论强度' },
        { node: 'X8', action: '记录实际观察到的现象，不先写推断' },
        { node: 'O2', action: '确定直接发生现象的实际物种' },
        { node: 'O3', action: '对齐该物种变化前后的载体' },
        { node: 'R4', action: '用价态变化支持或否定氧化还原解释' }
      ],
      branches: [
        { label: '试剂性质', route: ['A1','A2'], note: '现象只能在变价链完整时支持氧化性或还原性。' },
        { label: '实验条件与对照', route: ['Q6'], note: '检查浓度、介质、温度、加热和空白组。' },
        { label: '结论边界', route: ['B2','X7'], note: '单一现象可能有竞争解释，不能越级推出唯一机理。' }
      ],
      boundary: '现象是证据而不是自带唯一含义的标签；必须同时保留条件、对照和竞争解释。',
      probe: '这个颜色、气体或沉淀是哪个具体物种直接产生的？还有没有另一种可能原因？',
      repair: '只写三格：“观察到什么→直接物种是谁→最多能支持什么结论”。',
      match: function (question, nodeIds) { return nodeIds.indexOf('X8') >= 0; }
    },
    {
      id: 'T6', name: '工业流程中的载体、价态与试剂作用', short: '工业流程', color: '#6f7d35',
      summary: '沿流程箭头追踪目标元素的载体和价态，再判断各试剂是转化、保护、介质还是分离用途。',
      cues: ['浸取—转化—分离', '试剂的作用', '目标元素收率'],
      backbone: [
        { node: 'X9', action: '确定流程的目标元素和最终载体' },
        { node: 'O3', action: '沿每个箭头对齐目标元素的前后载体' },
        { node: 'R4', action: '检查关键转化步骤是否变价' },
        { node: 'C3', action: '由实际变化判断试剂的氧化还原角色' },
        { node: 'Q6', action: '用介质、浓度、温度和后续分离要求核对条件' }
      ],
      branches: [
        { label: '书写关键反应', route: ['Q5'], note: '只对已确定的实际转化粒子配方程式。' },
        { label: '检验与现象', route: ['X8'], note: '区分流程反应和后续检验反应。' },
        { label: '电沉积/电解', route: ['X2'], note: '把溶液中的目标离子连到阴极还原和固体产物。' }
      ],
      boundary: '流程中的每一种试剂不一定都参加氧化还原；也可能只调介质、保护物种或提供分离条件。',
      probe: '只追踪目标元素：加试剂前后它分别在哪个物种中，氧化数有没有变？',
      repair: '在流程图下只画一条“目标元素载体链”，其他试剂先全部隐去。',
      match: function (question, nodeIds) { return nodeIds.indexOf('X9') >= 0; }
    },
    {
      id: 'T7', name: '歧化、归中与同元素多价态', short: '歧化归中', color: '#bb4e73',
      summary: '先分开同一元素的不同来源或不同去向，再用价态数轴判断一分为二还是两端归中。',
      cues: ['同一元素多价态', '中间价态', '歧化/归中'],
      backbone: [
        { node: 'O3', action: '标清同一元素的不同来源与去向' },
        { node: 'R5', action: '区分平均价态和实际多中心价态' },
        { node: 'R4', action: '把每一支的前后氧化数单独写出' },
        { node: 'X6', action: '在价态数轴上识别歧化或归中箭头' },
        { node: 'Q3', action: '用总升降相等检查两条支路' }
      ],
      branches: [
        { label: '中间价分向两端', route: ['A1','A2'], note: '同一反应物同时承担氧化剂与还原剂角色。' },
        { label: '高低价共同走向中间', route: ['Q5'], note: '分别计算高价降低和低价升高的电子差后配比。' },
        { label: '条件限制', route: ['Q6'], note: '中间价产物是否稳定取决于介质与反应条件。' }
      ],
      boundary: '“一个反应物生成两个产物”不等于歧化；必须是同一元素的同一起始价态同时升高和降低。',
      probe: '把题中该元素的所有起点价态和终点价态写在数轴上，箭头是一个起点分开，还是两个起点汇合？',
      repair: '只画价态数轴和两支箭头，暂不写物质名称与方程式。',
      match: function (question, nodeIds) { return nodeIds.indexOf('X6') >= 0; }
    },
    {
      id: 'T8', name: '氧化还原滴定、终点与误差传递', short: '滴定误差', color: '#6e6460',
      summary: '分开主反应、终点指示反应和读数换算，再沿“实际消耗→体积读数→回算结果”判断方向。',
      cues: ['标准液与终点', '过量试剂干扰', '测定结果偏高/偏低'],
      backbone: [
        { node: 'O1', action: '锁定目标是终点、含量还是误差方向' },
        { node: 'Q6', action: '按滴加时序区分主反应、竞争反应和指示反应' },
        { node: 'X8', action: '把终点现象连到“某物质首次稳定过量”' },
        { node: 'Q7', action: '区分反应体积、读数体积和最终换算量' },
        { node: 'Q4', action: '经电子当量把滴定剂连到待测物' }
      ],
      branches: [
        { label: '指示剂终点', route: ['X8'], note: '说清谁直接变色、为什么在当量点后才稳定出现。' },
        { label: '竞争消耗与待测物损失', route: ['C3','Q6'], note: '先判断会使标准液多消耗还是少消耗。' },
        { label: '滴定管与视线误差', route: ['R1','Q7'], note: '从刻度方向、气泡去处和读数差逐步传到结果。' }
      ],
      boundary: '不能只背“过量偏高”或“仰小俯大”；必须写出该操作改变了哪一个实际量，以及它如何进入回算公式。',
      probe: '不说偏高或偏低，只先回答：这个操作使“真正参加反应的标准液”变多、变少还是不变？',
      repair: '只画三箭头：“操作→实际消耗或读数 V ↑/↓→回算结果↑/↓”。',
      match: function (question, nodeIds, text) { return /滴定|误差|偏高|偏低|终点/.test(text); }
    },
    {
      id: 'T9', name: '氧化数赋值、平均价与结构推断', short: '价态计算', color: '#7659a6',
      summary: '先确定粒子边界与总电荷，再用赋值规则求未知价态，并区分平均价、局部价态和形式电荷。',
      cues: ['求氧化数', '平均化合价', '由结构或组成推断价态'],
      backbone: [
        { node: 'R1', action: '圈定参与代数和的完整粒子边界' },
        { node: 'R5', action: '写出已知元素贡献与整体电荷的代数式' },
        { node: 'R4', action: '得到目标元素的氧化数或平均氧化数' },
        { node: 'B1', action: '检查是否把形式氧化数误当真实局域电荷' }
      ],
      branches: [
        { label: '常规粒子赋值', route: ['R1','R5','R4'], note: '代数和等于粒子整体电荷。' },
        { label: '平均价态', route: ['R5','R3'], note: '平均值不自动表示每个原子都处于同一局部状态。' },
        { label: '特殊成键边界', route: ['R2','B1'], note: '过氧键、金属氢化物等先修改默认赋值规则。' }
      ],
      boundary: '氧化数计算是形式记账；只得到平均值时，不能无证据拆成唯一的整数价态组合。',
      probe: '先不判断升降，只写出“各元素氧化数代数和＝粒子整体电荷”的式子。',
      repair: '连续做三次“圈粒子边界→写代数和”，停止在列式，不进入反应角色判断。',
      match: function (question, nodeIds, text) { return nodeIds.indexOf('R5') >= 0 && (/氧化数|化合价|价态|平均|过氧|超氧/.test(text) || nodeIds.indexOf('R1') >= 0); }
    },
    {
      id: 'T10', name: '氧化还原强弱与反应可行性', short: '强弱可行性', color: '#347d76',
      summary: '把“可能变价”与“在给定条件下能否发生”分开，再用反应事实、电势、介质或对照证据比较强弱。',
      cues: ['氧化性/还原性强弱', '能否发生', '反应先后顺序'],
      backbone: [
        { node: 'O2', action: '写清待比较的具体物种而非只写元素名称' },
        { node: 'Q6', action: '补齐介质、浓度、温度和产物条件' },
        { node: 'X7', action: '调用反应事实或电势证据判断方向与强弱' },
        { node: 'B3', action: '排除只按氧化数高低排序的伪规则' }
      ],
      branches: [
        { label: '由已知反应比较', route: ['X8','X7'], note: '以真实反应方向建立相对强弱关系。' },
        { label: '竞争反应顺序', route: ['Q6','X7'], note: '结合物种浓度与条件判断优先过程。' },
        { label: '守恒式的边界', route: ['Q5','B2'], note: '方程可配平不等于反应在该条件下会发生。' }
      ],
      boundary: '强弱属于具体反应对和条件；跨物种比较不能只看最高价、含氧多少或熟悉名称。',
      probe: '除了氧化数，本题给了哪条能够支持反应方向的事实、条件或电势证据？',
      repair: '只做两物种的“具体反应对—条件—观察方向”比较，不背整张强弱顺序表。',
      match: function (question, nodeIds, text) { return nodeIds.indexOf('X7') >= 0 || /氧化性.*强|还原性.*强|强弱|能否发生|先反应/.test(text); }
    },
    {
      id: 'T11', name: '过氧化物与特殊氧化数边界', short: '特殊价态', color: '#c0644c',
      summary: '识别过氧键、超氧结构或非常规氢化物，先修正默认赋值规则，再判断变化与角色。',
      cues: ['H2O2/过氧化物', '超氧化物', '特殊氧化数'],
      backbone: [
        { node: 'R1', action: '判断物种是否含有需要特殊处理的结构单元' },
        { node: 'R5', action: '使用该结构对应的特殊赋值规则' },
        { node: 'R4', action: '得到实际参与变化的氧化数' },
        { node: 'A3', action: '由具体产物判断其在本反应中的角色' }
      ],
      branches: [
        { label: '被还原为低价产物', route: ['C2','A1'], note: '特殊物种在本反应中承担氧化剂角色。' },
        { label: '被氧化为高价产物', route: ['C1','A2'], note: '同一物种也可能承担还原剂角色。' },
        { label: '歧化', route: ['X6','C5'], note: '同一起始价态向高、低两侧同时变化。' }
      ],
      boundary: '“H2O2 是氧化剂”不是永久标签；必须根据它实际变成 O2、H2O 或其他产物再命名角色。',
      probe: '该物种中的 O 当前按多少赋值，反应后变成什么含氧物种？',
      repair: '只做三张 H2O2 去向卡：到 O2、到 H2O、同时两向；每张只写氧价变化和角色。',
      match: function (question, nodeIds, text) { return /H2O2|过氧|超氧|过硫酸|O2\^?2-|O₂²/.test(text); }
    },
    {
      id: 'T12', name: '金属腐蚀与电化学保护', short: '腐蚀防护', color: '#8b7434',
      summary: '先确定金属失电子位置与电池构型，再判断腐蚀快慢、保护方式和电极材料变化。',
      cues: ['腐蚀快慢', '牺牲阳极/外加电流', '镀层保护'],
      backbone: [
        { node: 'O2', action: '识别真正形成电化学回路的金属、介质和接触关系' },
        { node: 'C1', action: '定位发生金属氧化溶解的位置' },
        { node: 'X2', action: '把金属氧化映射为阳极过程' },
        { node: 'X7', action: '结合材料活泼性与装置条件判断反应倾向' }
      ],
      branches: [
        { label: '原电池加速腐蚀', route: ['X3','X4'], note: '电子通路和离子通路同时成立才构成持续腐蚀。' },
        { label: '牺牲阳极保护', route: ['A2','X2'], note: '更易氧化的金属承担阳极并消耗。' },
        { label: '外加电流保护', route: ['X2','X3'], note: '使被保护金属保持为发生还原的阴极。' }
      ],
      boundary: '只说“更活泼”不足以判断全部现象，还要检查是否接触、是否有电解质和回路是否闭合。',
      probe: '在这套装置里，哪个金属原子真正变成了溶液中的离子？',
      repair: '画一幅只含“阳极金属→电子→阴极”的极简回路，不计算电势。',
      match: function (question, nodeIds, text) { return /腐蚀|防护|牺牲阳极|外加电流|镀层|电镀|锈蚀/.test(text); }
    },
    {
      id: 'T13', name: '有机反应中的氧化还原中心', short: '有机氧化还原', color: '#a45277',
      summary: '锁定真正改变成键环境的碳原子，用关键碳氧化程度判断，而不是只看整分子得氧失氢。',
      cues: ['醇醛酸转化', '燃烧与氧化', '还原糖检验'],
      backbone: [
        { node: 'O2', action: '定位发生官能团或成键变化的关键碳原子' },
        { node: 'R2', action: '按键的形式电子归属比较关键碳前后状态' },
        { node: 'X11', action: '用受限的得氧失氢启发式辅助判断方向' },
        { node: 'C3', action: '命名关键碳发生氧化还是还原' }
      ],
      branches: [
        { label: '醇—醛—酸', route: ['R4','C1'], note: '追踪同一官能团碳的氧化程度逐步升高。' },
        { label: '燃烧与完全氧化', route: ['Q3','Q5'], note: '用平均价和电子当量完成总体计量。' },
        { label: '有机检验反应', route: ['X8','A2'], note: '把银镜或砖红沉淀连回有机物被氧化。' }
      ],
      boundary: '得氧失氢只是常见表面线索；分子重排、加成或消去必须回到具体反应中心判断。',
      probe: '请圈出反应前后连接原子发生变化的那个碳，而不是比较整分子式。',
      repair: '只比较一个关键碳周围的 C—H、C—O、C=O 键，不展开完整有机反应网络。',
      match: function (question, nodeIds) { return nodeIds.indexOf('X11') >= 0; }
    },
    {
      id: 'T14', name: '中间体、催化循环与竞争反应', short: '反应网络', color: '#4f7185',
      summary: '把总反应拆成生成、消耗与再生步骤，区分中间体、催化剂和竞争通道，并判断净变化。',
      cues: ['中间体浓度', '催化循环', '竞争/并行反应与选择性'],
      backbone: [
        { node: 'O2', action: '列出每一步真正消耗和生成的物种' },
        { node: 'X10', action: '对中间体写净速率＝生成速率－消耗速率' },
        { node: 'Q6', action: '用条件判断哪条通道被促进或抑制' },
        { node: 'B2', action: '避免由净方程式反推唯一微观机理' }
      ],
      branches: [
        { label: '串联中间体', route: ['X10','Q7'], note: '中间体浓度由生成、消耗两条速率共同决定。' },
        { label: '催化剂再生', route: ['A3','B4'], note: '跨步骤追踪再生，不能按单一步骤给永久角色。' },
        { label: '并行竞争通道', route: ['Q6','X7'], note: '选择性取决于条件与相对反应速率。' }
      ],
      boundary: '总反应式不能唯一揭示中间体、催化步骤和实际电子微观轨迹。',
      probe: '这个物种在哪一步生成、在哪一步消耗？两者谁更快才能决定它的净变化？',
      repair: '只把两步反应上下排列，逐项划掉相消物种，再写一次“生成－消耗”。',
      match: function (question, nodeIds, text) { return nodeIds.indexOf('X10') >= 0 || /中间体|催化|竞争反应|并行反应|选择性/.test(text); }
    }
  ];

  var archetypeFamilies = [
    { id: 'F1', name: '价态与角色模型', summary: '回答“谁变、怎么变、扮演什么角色”。', archetypes: ['T9','T1','T7','T11'] },
    { id: 'F2', name: '守恒、表达与定量', summary: '把变化转成方程、电子当量和测量结果。', archetypes: ['T2','T4','T8'] },
    { id: 'F3', name: '装置、流程与材料', summary: '把基本模型迁移到电池、工业流程和腐蚀防护。', archetypes: ['T3','T6','T12'] },
    { id: 'F4', name: '证据、可行性与复杂网络', summary: '处理实验论证、强弱比较、有机中心及多步反应。', archetypes: ['T5','T10','T13','T14'] }
  ];

  var archetypeSubtypeSpecs = {
    T1: [
      { id: 'T1a', name: '由变价判试剂角色', route: ['O3','R4','C1','A2'], surfaces: ['试剂作用填空','氧化剂/还原剂判断'], match: function (q,n,t) { return /氧化剂|还原剂|试剂.*作用/.test(t); } },
      { id: 'T1b', name: '同一物质的角色切换', route: ['A3','B4'], surfaces: ['H2O2 双重性','同物质不同反应'], match: function (q,n,t) { return n.indexOf('A3') >= 0 || /既.*氧化.*又.*还原|双重/.test(t); } },
      { id: 'T1c', name: '氧化产物与还原产物', route: ['C3','C4','C5'], surfaces: ['产物类型判断','成对变化追踪'], match: function (q,n,t) { return /氧化产物|还原产物|被氧化|被还原/.test(t); } }
    ],
    T2: [
      { id: 'T2a', name: '陌生离子方程式配平', route: ['O2','R4','Q3','Q5','Q6'], surfaces: ['酸碱介质','缺项或系数填空'], match: function (q,n,t) { return /离子方程|配平|系数/.test(t); } },
      { id: 'T2b', name: '电极半反应书写', route: ['X2','Q5','Q6'], surfaces: ['电池电极式','电解产物'], match: function (q,n,t) { return /电极反应|半反应|正极|负极|阴极|阳极/.test(t); } },
      { id: 'T2c', name: '方程式正误与边界', route: ['Q5','B2'], surfaces: ['离子式正误','产物合理性'], match: function (q,n,t) { return /方程.*正确|方程.*错误|能否发生/.test(t); } }
    ],
    T3: [
      { id: 'T3a', name: '电极与电子方向', route: ['R4','X2','X3'], surfaces: ['原电池','电解池','充放电'], match: function (q,n,t) { return /电子.*流|正极|负极|阴极|阳极|充电|放电/.test(t); } },
      { id: 'T3b', name: '离子迁移与膜', route: ['X2','X4'], surfaces: ['盐桥','离子交换膜','双室电解槽'], match: function (q,n,t) { return /迁移|交换膜|盐桥|隔膜/.test(t); } },
      { id: 'T3c', name: '电量、pH 与物料变化', route: ['X5','Q4','Q7'], surfaces: ['电量计算','pH变化','电解产物'], match: function (q,n,t) { return /电量|电流|pH|物质的量|质量|体积/.test(t); } }
    ],
    T4: [
      { id: 'T4a', name: '转移电子数判断', route: ['Q1','Q2','Q3'], surfaces: ['电子数选择题','多中心计数'], match: function (q,n,t) { return /电子数|转移.*电子|电子.*mol/.test(t); } },
      { id: 'T4b', name: '电子当量到物质的量', route: ['Q3','Q4','Q7'], surfaces: ['质量体积换算','产率含量'], match: function (q,n,t) { return /质量|体积|含量|产率|物质的量/.test(t); } },
      { id: 'T4c', name: '电量法定量', route: ['X5','Q4','Q7'], surfaces: ['法拉第定律','电池容量'], match: function (q,n,t) { return /电量|电流|容量|库仑|96500/.test(t); } }
    ],
    T5: [
      { id: 'T5a', name: '现象到物种识别', route: ['X8','O2'], surfaces: ['颜色变化','气体或沉淀'], match: function (q,n,t) { return /颜色|褪色|沉淀|气体|现象/.test(t); } },
      { id: 'T5b', name: '对照与结论强度', route: ['O1','Q6','X7'], surfaces: ['控制变量','性质强弱比较'], match: function (q,n,t) { return /对照|控制变量|证明|说明|强弱/.test(t); } },
      { id: 'T5c', name: '检验反应证据边界', route: ['X8','B2'], surfaces: ['特征反应','竞争解释'], match: function (q,n,t) { return /检验|鉴别|证明|现象/.test(t); } }
    ],
    T6: [
      { id: 'T6a', name: '目标元素载体链', route: ['X9','O3','R4'], surfaces: ['浸取转化','焙烧氧化'], match: function (q,n,t) { return /流程|浸取|焙烧|转化/.test(t); } },
      { id: 'T6b', name: '流程试剂作用', route: ['R4','C3','A3','Q6'], surfaces: ['氧化还原试剂','调介质或保护'], match: function (q,n,t) { return /试剂.*作用|作用是|目的/.test(t); } },
      { id: 'T6c', name: '电解回收与沉积', route: ['X9','X2','Q7'], surfaces: ['电沉积','电解制备'], match: function (q,n,t) { return /电解|电沉积|回收/.test(t); } }
    ],
    T7: [
      { id: 'T7a', name: '歧化反应', route: ['R4','X6','C5'], surfaces: ['中间价一分为二','同物质双角色'], match: function (q,n,t) { return /歧化/.test(t); } },
      { id: 'T7b', name: '归中反应', route: ['R4','X6','Q3'], surfaces: ['高低价态汇合','同元素多反应物'], match: function (q,n,t) { return /归中|归中反应/.test(t); } },
      { id: 'T7c', name: '平均价与多中心', route: ['R5','R3','X6'], surfaces: ['混合价化合物','平均氧化数'], match: function (q,n,t) { return /平均|混合价|多价态/.test(t); } }
    ],
    T8: [
      { id: 'T8a', name: '氧化还原滴定计量', route: ['Q5','Q4','Q7'], surfaces: ['含量测定','返滴定'], match: function (q,n,t) { return /滴定|标准液|含量/.test(t); } },
      { id: 'T8b', name: '终点现象与时序', route: ['Q6','X8'], surfaces: ['自身指示','指示剂变色'], match: function (q,n,t) { return /终点|指示剂|变色/.test(t); } },
      { id: 'T8c', name: '操作误差传递', route: ['R1','Q7'], surfaces: ['滴定管读数','样品或标准液误差'], match: function (q,n,t) { return /误差|偏高|偏低|仰视|俯视|气泡/.test(t); } }
    ],
    T9: [
      { id: 'T9a', name: '常规氧化数赋值', route: ['R1','R5','R4'], surfaces: ['分子与离子','未知价态求解'], match: function (q,n,t) { return /氧化数|化合价|价态/.test(t); } },
      { id: 'T9b', name: '平均价态与组成', route: ['R5','R3','B1'], surfaces: ['混合价固体','平均化合价'], match: function (q,n,t) { return /平均|混合价|组成/.test(t); } },
      { id: 'T9c', name: '结构边界修正', route: ['R2','R5','B1'], surfaces: ['过氧键','金属氢化物'], match: function (q,n,t) { return /过氧|超氧|氢化物/.test(t); } }
    ],
    T10: [
      { id: 'T10a', name: '由反应事实比较强弱', route: ['X8','X7'], surfaces: ['置换或竞争反应','实验现象比较'], match: function (q,n,t) { return /强弱|氧化性|还原性|反应先后/.test(t); } },
      { id: 'T10b', name: '条件改变与反应方向', route: ['Q6','X7'], surfaces: ['介质浓度','温度与产物'], match: function (q,n,t) { return /条件|介质|浓度|温度|酸性|碱性/.test(t); } },
      { id: 'T10c', name: '可配平不等于可发生', route: ['Q5','B2','B3'], surfaces: ['方程式正误','反应可行性'], match: function (q,n,t) { return /能否发生|方程.*正|方程.*误|可行/.test(t); } }
    ],
    T11: [
      { id: 'T11a', name: '过氧化氢作氧化剂', route: ['R5','C2','A1'], surfaces: ['还原为水','氧化低价物种'], match: function (q,n,t) { return /H2O2|过氧化氢/.test(t) && /氧化剂|被还原|还原为/.test(t); } },
      { id: 'T11b', name: '过氧化氢作还原剂', route: ['R5','C1','A2'], surfaces: ['氧化为氧气','还原高价物种'], match: function (q,n,t) { return /H2O2|过氧化氢/.test(t) && /还原剂|氧气|O2/.test(t); } },
      { id: 'T11c', name: '特殊含氧结构赋值', route: ['R1','R5','B1'], surfaces: ['过氧化物','超氧化物','过硫酸盐'], match: function (q,n,t) { return /过氧|超氧|过硫酸/.test(t); } }
    ],
    T12: [
      { id: 'T12a', name: '原电池腐蚀快慢', route: ['C1','X2','X3'], surfaces: ['异种金属接触','吸氧或析氢腐蚀'], match: function (q,n,t) { return /腐蚀|锈蚀|加速/.test(t); } },
      { id: 'T12b', name: '牺牲阳极保护', route: ['A2','X2','X7'], surfaces: ['船体管道保护','活泼金属连接'], match: function (q,n,t) { return /牺牲阳极|保护/.test(t); } },
      { id: 'T12c', name: '电镀与外加电流', route: ['X2','X3','Q6'], surfaces: ['电镀','阴极保护'], match: function (q,n,t) { return /电镀|外加电流|阴极保护/.test(t); } }
    ],
    T13: [
      { id: 'T13a', name: '官能团碳氧化程度', route: ['O2','R2','X11'], surfaces: ['醇醛酸','烯烃氧化'], match: function (q,n,t) { return /醇|醛|酸|有机|官能团/.test(t); } },
      { id: 'T13b', name: '还原糖检验', route: ['X8','X11','A2'], surfaces: ['银镜反应','新制氢氧化铜'], match: function (q,n,t) { return /银镜|还原糖|氢氧化铜/.test(t); } },
      { id: 'T13c', name: '有机物燃烧电子当量', route: ['R4','Q3','Q7'], surfaces: ['燃烧耗氧','产物定量'], match: function (q,n,t) { return /燃烧|耗氧|二氧化碳/.test(t); } }
    ],
    T14: [
      { id: 'T14a', name: '串联中间体净变化', route: ['O2','X10','Q7'], surfaces: ['浓度变化','速率关系'], match: function (q,n,t) { return /中间体|净速率|生成速率|消耗速率/.test(t); } },
      { id: 'T14b', name: '催化剂跨步骤再生', route: ['O2','A3','B4'], surfaces: ['催化循环','催化剂价态循环'], match: function (q,n,t) { return /催化/.test(t); } },
      { id: 'T14c', name: '竞争反应与选择性', route: ['Q6','X7','B2'], surfaces: ['并行反应','副反应','选择性控制'], match: function (q,n,t) { return /竞争|并行|副反应|选择性/.test(t); } }
    ]
  };

  var nodeById = {};
  var edgeById = {};
  var nodeLearningData = window.nodeLearningData || {};
  nodes.forEach(function (n) { nodeById[n.id] = n; });
  edges.forEach(function (e) { edgeById[e.id] = e; });

  function pathSubset(question, allowedNodes) {
    if (!allowedNodes) return question.path.slice();
    var selected = question.path.filter(function (step) { return allowedNodes.indexOf(step.node) >= 0; });
    if (selected.length > 1 && selected[0].node === 'O1' && selected[selected.length - 1].node === 'O1') selected.pop();
    return selected;
  }

  function questionFamily(question) {
    if (question.format.indexOf('大题子问') < 0 || !question.image) return [question];
    return Object.keys(questionBank).map(function (id) { return questionBank[id]; }).filter(function (candidate) {
      return candidate.format.indexOf('大题子问') >= 0 && candidate.image === question.image;
    });
  }

  function questionUnits(question) {
    var family = questionFamily(question);
    if (family.length > 1) {
      return family.map(function (child) {
        return {
          key: 'subquestion:' + child.id,
          kind: 'subquestion',
          questionId: child.id,
          label: child.number,
          title: child.title,
          keyword: child.short || nodeById[child.path[0].node].name,
          prompt: child.stem.join(' '),
          explanation: child.answer,
          path: child.path.slice(),
          sourceNote: '该小问已作为独立 ItemUnit 完成题面、答案和路径核对。'
        };
      });
    }

    var specs = optionUnitSpecs[question.id];
    if (question.options.length && specs && specs.length === question.options.length) {
      return question.options.map(function (option, index) {
        var spec = specs[index];
        return {
          key: 'option:' + question.id + ':' + index,
          kind: 'option',
          questionId: question.id,
          optionIndex: index,
          label: String.fromCharCode(65 + index) + ' 项',
          title: option.replace(/^[A-D]．\s*/, ''),
          keyword: spec.keyword,
          prompt: option,
          explanation: question.analysis[spec.analysis] || '',
          path: pathSubset(question, spec.nodes),
          outside: spec.outside || '',
          sourceNote: spec.outside ? '该选项超出当前氧化还原局部图谱。' : '子路径仅从已复核的整题路径中取得，未添加新的化学结论。'
        };
      });
    }

    return [{
      key: 'item:' + question.id,
      kind: 'item',
      questionId: question.id,
      label: question.format.indexOf('大题子问') >= 0 ? '本小问' : '当前 ItemUnit',
      title: question.title,
      keyword: question.short || nodeById[question.path[0].node].name,
      prompt: question.stem.join(' '),
      explanation: question.answer,
      path: question.path.slice(),
      sourceNote: question.options.length ? '当前选项尚未逐项转写，因此保留已复核的 ItemUnit 路径，不自动伪拆。' : '该 ItemUnit 本身就是一个已拆小问或单一任务。'
    }];
  }

  function unitByKey(question, key) {
    var units = questionUnits(question);
    return units.filter(function (unit) { return unit.key === key; })[0] || units[0];
  }

  function edgeIdsForPath(path) {
    var ids = path.map(function (step) { return step.node; });
    return edges.filter(function (edge) {
      return ids.indexOf(edge.from) >= 0 && ids.indexOf(edge.to) >= 0;
    }).map(function (edge) { return edge.id; });
  }

  function questionSearchText(question) {
    return [question.id, question.title, question.format, question.short]
      .concat(question.stem || [], question.analysis || [])
      .join(' ');
  }

  function archetypeNodeIds(archetype) {
    return archetype.backbone.map(function (step) { return step.node; });
  }

  function questionsForArchetype(archetype) {
    return Object.keys(questionBank).map(function (id) { return questionBank[id]; }).filter(function (question) {
      var nodeIds = question.path.map(function (step) { return step.node; });
      return archetype.match(question, nodeIds, questionSearchText(question));
    });
  }

  function archetypesForQuestion(question) {
    var nodeIds = question.path.map(function (step) { return step.node; });
    var text = questionSearchText(question);
    return pathArchetypes.filter(function (archetype) { return archetype.match(question, nodeIds, text); });
  }

  function archetypeById(id) {
    return pathArchetypes.filter(function (archetype) { return archetype.id === id; })[0] || pathArchetypes[0];
  }

  function subtypeSpecsForArchetype(archetype) {
    return archetypeSubtypeSpecs[archetype.id] || [];
  }

  function subtypeById(id) {
    var found = null;
    Object.keys(archetypeSubtypeSpecs).some(function (archetypeId) {
      found = archetypeSubtypeSpecs[archetypeId].filter(function (subtype) { return subtype.id === id; })[0] || null;
      return !!found;
    });
    return found;
  }

  function questionsForSubtype(archetype, subtype) {
    return questionsForArchetype(archetype).filter(function (question) {
      var nodeIds = question.path.map(function (step) { return step.node; });
      return subtype.match(question, nodeIds, questionSearchText(question));
    });
  }

  function subtypesForQuestion(archetype, question) {
    var nodeIds = question.path.map(function (step) { return step.node; });
    var text = questionSearchText(question);
    return subtypeSpecsForArchetype(archetype).filter(function (subtype) { return subtype.match(question, nodeIds, text); });
  }

  function evidenceTier(archetype) {
    var count = questionsForArchetype(archetype).length;
    if (count >= 3) return { label: '已有多题支持', className: 'strong' };
    if (count > 0) return { label: '初步样本', className: 'emerging' };
    return { label: '覆盖前沿', className: 'frontier' };
  }

  var initialVariant = new URL(window.location.href).searchParams.get('variant') || 'A';
  if (!variantMeta[initialVariant]) initialVariant = 'A';
  function isTouchLandscapeView() { return window.matchMedia('(max-height: 520px) and (pointer: coarse)').matches; }
  var touchLandscapeView = isTouchLandscapeView();
  var compactGraphView = window.matchMedia('(max-width: 820px)').matches || touchLandscapeView;

  var graphCanvasWidth = 1200;
  var graphCanvasHeight = 815;
  var graphNodeWidth = 138;
  var graphNodeAnchorY = 27;

  var state = {
    variant: initialVariant,
    query: '',
    libraryQuery: '',
    layer: 'all',
    question: 'all',
    selectedKind: 'node',
    selectedId: 'R4',
    evidence: {},
    showState: false,
    showQuestionLibrary: false,
    showArchetypeLibrary: false,
    activeArchetypeId: null,
    activeSubtypeId: null,
    highlightedArchetypeId: null,
    openQuestionId: null,
    questionTab: 'original',
    activeUnitKey: null,
    activePathNodeIds: null,
    activePathEdgeIds: null,
    activePathLabel: '',
    activeGapId: null,
    showLandscapeDetail: false,
    graphZoom: compactGraphView ? 0.72 : 1,
    graphPanX: compactGraphView ? 10 : 20,
    graphPanY: compactGraphView ? 45 : 12
  };

  nodes.forEach(function (n) { state.evidence[n.id] = 'unobserved'; });

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function currentEvidence(nodeId) {
    var id = state.evidence[nodeId] || 'unobserved';
    return evidenceStates.find(function (e) { return e.id === id; }) || evidenceStates[0];
  }

  function connectionFor(nodeId) {
    return edges.filter(function (e) { return e.from === nodeId || e.to === nodeId; });
  }

  function relatedQuestionIdsForNode(nodeId) {
    return Object.keys(questionBank).filter(function (id) { return questions[id].nodes.indexOf(nodeId) >= 0; });
  }

  function relatedQuestionIdsForEdge(edgeId) {
    return Object.keys(questionBank).filter(function (id) { return questions[id].edges.indexOf(edgeId) >= 0; });
  }

  function questionTag(question) {
    return '（' + question.year + '·' + question.province + '）' + question.number;
  }

  function matchesNode(node) {
    if (state.layer !== 'all' && node.layer !== state.layer) return false;
    if (!state.query.trim()) return true;
    var q = state.query.trim().toLowerCase();
    var edgeText = connectionFor(node.id).map(function (e) { return e.label + ' ' + e.reason; }).join(' ');
    var learning = nodeLearningData[node.id] || { statement: '', surfaces: [], misconception: '' };
    return [node.id, node.name, node.summary, node.boundary, node.example, node.probe, learning.statement, learning.surfaces.join(' '), learning.misconception, edgeText].join(' ').toLowerCase().indexOf(q) >= 0;
  }

  function pathHasNode(id) {
    if (state.activePathNodeIds) return state.activePathNodeIds.indexOf(id) >= 0;
    return state.question === 'all' || questions[state.question].nodes.indexOf(id) >= 0;
  }

  function pathHasEdge(id) {
    if (state.activePathEdgeIds) return state.activePathEdgeIds.indexOf(id) >= 0;
    return state.question === 'all' || questions[state.question].edges.indexOf(id) >= 0;
  }

  function nodeDimmed(node) {
    return !matchesNode(node) || !pathHasNode(node.id);
  }

  function edgeDimmed(edge) {
    if (!pathHasEdge(edge.id)) return true;
    if (state.layer !== 'all' && nodeById[edge.from].layer !== state.layer && nodeById[edge.to].layer !== state.layer) return true;
    if (state.query && nodeDimmed(nodeById[edge.from]) && nodeDimmed(nodeById[edge.to])) return true;
    return false;
  }

  function topbar() {
    var observed = Object.keys(state.evidence).filter(function (id) { return state.evidence[id] !== 'unobserved'; }).length;
    return [
      '<header class="topbar">',
        '<div class="brand">',
          '<div class="brand-mark">氧</div>',
          '<div><h1>氧化还原知识连接地图</h1><p>节点不是章节标签；每条箭头都写明条件、关系和理由</p></div>',
        '</div>',
        '<div class="top-state">',
          '<span class="state-pill prototype-pill">PROTOTYPE</span>',
          '<span class="state-pill"><strong>' + nodes.length + '</strong> 节点</span>',
          '<span class="state-pill"><strong>' + edges.length + '</strong> 条连接</span>',
          '<button class="ghost-button archetype-library-button" data-action="open-archetypes">题型路径 <strong>' + pathArchetypes.length + '</strong></button>',
          '<button class="ghost-button question-library-button" data-action="open-library">真题库 <strong>' + Object.keys(questionBank).length + '</strong></button>',
          '<a class="primary-button challenge-entry" href="./challenge.html">节点闯关</a>',
          '<a class="primary-button challenge-entry path-challenge-entry" href="./path-challenge-prototype.html">氧化还原路径闯关</a>',
          '<a class="primary-button challenge-entry path-challenge-entry" href="./subjective-challenge.html">主观题型闯关</a>',
          '<span class="state-pill"><strong>' + observed + '</strong> 条证据标记</span>',
          '<button class="ghost-button" data-action="show-state">查看状态</button>',
        '</div>',
      '</header>'
    ].join('');
  }

  function commonToolbar() {
    var questionButtons = Object.keys(questions).map(function (id) {
      return '<button class="question-chip ' + (state.question === id ? 'active' : '') + '" data-action="question" data-id="' + id + '" title="' + esc(questions[id].note) + '">' + esc(questions[id].short) + '</button>';
    }).join('');
    var layerButtons = ['all'].concat(Object.keys(layers)).map(function (id) {
      var name = id === 'all' ? '全部层' : layers[id].short;
      return '<button class="chip ' + (state.layer === id ? 'active' : '') + '" data-action="layer" data-id="' + id + '">' + esc(name) + '</button>';
    }).join('');
    return [
      '<div class="toolbar">',
        '<label class="search-box"><span class="visually-hidden">搜索知识点</span><input id="map-search" value="' + esc(state.query) + '" placeholder="搜索节点、关系、广义陈述或高考表面"></label>',
        '<div class="control-group"><span class="control-label">真题路径</span>' + questionButtons + '</div>',
        '<div class="control-group"><span class="control-label">知识层</span>' + layerButtons + '</div>',
      '</div>'
    ].join('');
  }

  function sourceAction(question) {
    if (window.location.protocol === 'file:') {
      return '<a class="ghost-button source-link" href="' + esc(question.source) + '" target="_blank" rel="noreferrer">源 PDF</a>';
    }
    return '<span class="ghost-button source-link disabled-source" title="整卷 PDF 未随公开演示站上传">源 PDF 仅本地</span>';
  }

  function usageNotice() {
    if (window.location.protocol === 'file:') {
      return '原题材料许可状态未知；当前仅用于本地私人学习分析。装置题以经过核对的语义转写呈现，源 PDF 保留原图。';
    }
    return '公开测试演示：仅包含题目摘录、必要题图和教研路径，不提供整卷 PDF，也不保存学生作答或个人数据。';
  }

  function questionContextBar() {
    if (state.question === 'all') {
      if (state.highlightedArchetypeId && state.activePathNodeIds) {
        var activeArchetype = archetypeById(state.highlightedArchetypeId);
        var activeSubtype = state.activeSubtypeId ? subtypeById(state.activeSubtypeId) : null;
        return '<section class="question-context-bar archetype-context"><div class="question-context-meta"><span class="exam-tag" style="--archetype-color:' + activeArchetype.color + '">' + (activeSubtype ? '二级子型' : '一级主干') + '</span><div><span class="unit-path-context-label">' + esc(activeSubtype ? activeSubtype.id + ' · ' + activeSubtype.name : activeArchetype.id + ' · ' + activeArchetype.short) + '</span><strong>' + esc(activeArchetype.name) + '</strong><span>当前高亮 ' + state.activePathNodeIds.length + ' 个路径节点；具体真题和题面情境在分层题型库中展开。</span></div></div><button class="primary-button" data-action="' + (activeSubtype ? 'open-subtype' : 'open-archetype') + '" data-archetype="' + activeArchetype.id + '" data-id="' + (activeSubtype ? activeSubtype.id : activeArchetype.id) + '">重新打开分层题型</button></section>';
      }
      return '<section class="question-context-bar overview"><div><strong>已接入 ' + Object.keys(questionBank).length + ' 个已核验 ItemUnit</strong><span>其余本地整卷仍是候选源，尚未逐题拆解和教研复核。</span></div><button class="primary-button" data-action="open-library">浏览真题、路径与修补</button></section>';
    }
    var q = questionBank[state.question];
    var pathScope = state.activePathLabel
      ? '<span class="unit-path-context-label">题内小路径 · ' + esc(state.activePathLabel) + '</span>'
      : '';
    return [
      '<section class="question-context-bar">',
        '<div class="question-context-meta"><span class="exam-tag">' + esc(questionTag(q)) + '</span><div>' + pathScope + '<strong>' + esc(q.title) + '</strong><span>' + esc(q.format + ' · ' + q.validation) + '</span></div></div>',
        '<div class="question-context-actions"><button class="primary-button" data-action="open-question" data-id="' + q.id + '">查看原题、解析与路径</button>' + sourceAction(q) + '</div>',
      '</section>'
    ].join('');
  }

  function relatedQuestionButtons(ids) {
    if (!ids.length) return '<p class="muted-note">当前已核验题库中还没有题目调用这里。</p>';
    return '<div class="related-question-list">' + ids.map(function (id) {
      var q = questionBank[id];
      var active = state.question === id;
      return [
        '<div class="related-question-row">',
          '<button class="related-question ' + (active ? 'active' : '') + '" data-action="highlight-question" data-id="' + id + '">',
            '<span>' + esc(questionTag(q)) + (active ? ' · 当前路径' : '') + '</span>',
            '<strong>' + esc(q.title) + '</strong>',
            '<small>切换整张知识图与节点题目语境</small>',
          '</button>',
          '<button class="related-question-open" data-action="open-question" data-id="' + id + '">看原题</button>',
        '</div>'
      ].join('');
    }).join('') + '</div>';
  }

  function questionNodeContext(node) {
    if (state.question === 'all' || !questionBank[state.question]) return null;
    var question = questionBank[state.question];
    var calls = [];
    question.path.forEach(function (pathStep, index) {
      if (pathStep.node === node.id) calls.push({ step: pathStep, index: index + 1 });
    });
    if (!calls.length) return { question: question, calls: [] };
    var matchingGaps = question.gaps.filter(function (candidate) { return candidate.node === node.id; });
    var firstCall = calls[0].step;
    var boundary = matchingGaps.length
      ? '候选误跳：' + matchingGaps.map(function (candidate) { return candidate.symptom; }).join('；') + ' 本题仍须完成“' + firstCall.action + '”，并用“' + firstCall.check + '”自检。'
      : '不能从题面直接跳到“' + firstCall.result + '”。本题仍须先完成“' + firstCall.action + '”，并用“' + firstCall.check + '”检查中间依据。';
    var learning = nodeLearningData[node.id] || { statement: node.summary };
    var directStatement = learning.statement + ' 在本题中的具体落点是：先“' + firstCall.action + '”，得到“' + firstCall.result + '”。';
    return {
      question: question,
      calls: calls,
      boundary: boundary,
      directStatement: directStatement
    };
  }

  function renderQuestionNodeContext(node) {
    var context = questionNodeContext(node);
    if (!context) return '';
    var question = context.question;
    if (!context.calls.length) {
      return [
        '<section class="question-node-context off-path">',
          '<div class="question-context-kicker"><span>当前题目语境</span><strong>' + esc(questionTag(question)) + '</strong></div>',
          '<p>当前题目的有效路径没有调用“' + esc(node.name) + '”。因此这里不伪造本题例子；下面只展示这个节点的通用模型。可从“经过这个节点的题目”切换到真正调用它的题。</p>',
        '</section>'
      ].join('');
    }
    var callHtml = context.calls.map(function (call) {
      return '<div class="question-context-call"><span>Step ' + call.index + '</span><p><strong>' + esc(call.step.action) + '</strong> → ' + esc(call.step.result) + '</p><small>自检：' + esc(call.step.check) + '</small></div>';
    }).join('');
    return [
      '<section class="question-node-context">',
        '<div class="question-context-kicker"><span>当前题目语境 · 会随题目切换</span><strong>' + esc(questionTag(question)) + '</strong></div>',
        '<h3>本题怎样调用这个节点</h3><div class="question-context-calls">' + callHtml + '</div>',
        '<h3>本题中发生的变化</h3><div class="reason-box canonical-statement">' + esc(context.directStatement) + '</div>',
        '<h3>本题不能直接推出</h3><div class="boundary-box">' + esc(context.boundary) + '</div>',
        '<button class="ghost-button context-open-question" data-action="open-question" data-id="' + question.id + '">打开这道题核对题面</button>',
      '</section>'
    ].join('');
  }

  function detailPanel(compact) {
    var item = state.selectedKind === 'edge' ? edgeById[state.selectedId] : nodeById[state.selectedId];
    if (!item) return '<div class="detail-empty">点击一个知识节点或连接箭头，查看它能推出什么、不能推出什么。</div>';
    if (state.selectedKind === 'edge') {
      var from = nodeById[item.from];
      var to = nodeById[item.to];
      var edgeQuestionIds = relatedQuestionIdsForEdge(item.id);
      return [
        '<article class="detail-card">',
          '<span class="eyebrow">' + esc(item.id + ' · ' + item.type) + '</span>',
          '<h2>' + esc(item.label) + '</h2>',
          '<p><strong>' + esc(from.name) + '</strong>　→　<strong>' + esc(to.name) + '</strong></p>',
          '<h3>适用条件</h3><div class="boundary-box">' + esc(item.condition) + '</div>',
          '<h3>为什么成立</h3><div class="reason-box">' + esc(item.reason) + '</div>',
          '<h3>学生必须能说出的完整句</h3>',
          '<p>在“' + esc(item.condition) + '”时，' + esc(from.name) + '通过“' + esc(item.label) + '”连接到' + esc(to.name) + '，因为' + esc(item.reason) + '</p>',
          '<h3>调用这条连接的已核验真题 · ' + edgeQuestionIds.length + '</h3>' + relatedQuestionButtons(edgeQuestionIds),
          '<div style="margin-top:16px"><button class="ghost-button" data-action="select-node" data-id="' + item.from + '">看起点</button> <button class="ghost-button" data-action="select-node" data-id="' + item.to + '">看终点</button></div>',
        '</article>'
      ].join('');
    }
    var layer = layers[item.layer];
    var conns = connectionFor(item.id);
    var nodeQuestionIds = relatedQuestionIdsForNode(item.id);
    var ev = currentEvidence(item.id);
    var learning = nodeLearningData[item.id] || {
      statement: item.summary,
      surfaces: [item.example],
      misconception: item.boundary
    };
    var connectionHtml = conns.map(function (e) {
      var other = nodeById[e.from === item.id ? e.to : e.from];
      var arrow = e.from === item.id ? '→' : '←';
      return '<button class="connection-item" data-action="select-edge" data-id="' + e.id + '">' + arrow + ' ' + esc(e.label) + ' · ' + esc(other.name) + '</button>';
    }).join('');
    var evidenceHtml = evidenceStates.map(function (e) {
      return '<button class="evidence-option ' + (ev.id === e.id ? 'active' : '') + '" style="--evidence-color:' + e.color + '" data-action="evidence" data-node="' + item.id + '" data-id="' + e.id + '">' + esc(e.name) + '</button>';
    }).join('');
    var questionContextHtml = renderQuestionNodeContext(item);
    return [
      '<article class="detail-card" style="--node-color:' + layer.color + '">',
        '<span class="detail-layer">' + esc(layer.name) + '</span>',
        '<div class="detail-code">' + esc(item.id) + '</div>',
        '<h2>' + esc(item.name) + '</h2>',
        questionContextHtml,
        '<div class="generic-node-model">',
          '<div class="generic-model-title"><span>通用知识模型</span><small>不随题目改变</small></div>',
          '<p>' + esc(item.summary) + '</p>',
          '<h3>广义必备陈述</h3><div class="reason-box canonical-statement">' + esc(learning.statement) + '</div>',
          '<h3>常见高考表面</h3><div class="surface-factor-list">' + learning.surfaces.map(function (surface) { return '<span>' + esc(surface) + '</span>'; }).join('') + '</div>',
          '<h3>易混边界</h3><div class="boundary-box"><strong>错误陈述：</strong>' + esc(learning.misconception) + '<br><strong>广义边界：</strong>' + esc(item.boundary) + '</div>',
          '<a class="ghost-button node-challenge-link" href="./challenge.html?node=' + item.id + '">练习这个节点</a>',
        '</div>',
        '<h3>经过这个节点的已核验真题 · ' + nodeQuestionIds.length + '</h3>' + relatedQuestionButtons(nodeQuestionIds),
        '<h3>相邻连接 · ' + conns.length + '</h3><div class="connection-list">' + connectionHtml + '</div>',
        compact ? '' : '<h3>学生证据覆盖层</h3><div class="evidence-selector">' + evidenceHtml + '</div>',
      '</article>'
    ].join('');
  }

  function sideFilters() {
    var layerHtml = ['all'].concat(Object.keys(layers)).map(function (id) {
      var info = id === 'all' ? { name: '全部知识层', color: '#123d35' } : layers[id];
      var count = id === 'all' ? nodes.length : nodes.filter(function (n) { return n.layer === id; }).length;
      return '<button class="layer-button ' + (state.layer === id ? 'active' : '') + '" data-action="layer" data-id="' + id + '"><span><span class="dot" style="background:' + info.color + '"></span>' + esc(info.name) + '</span><span class="mini-count">' + count + '</span></button>';
    }).join('');
    var qHtml = Object.keys(questions).map(function (id) {
      return '<button class="question-button ' + (state.question === id ? 'active' : '') + '" data-action="question" data-id="' + id + '"><span>' + esc(questions[id].name) + '</span><span class="mini-count">' + questions[id].nodes.length + '点</span></button>';
    }).join('');
    return '<aside class="side-panel"><h2 class="panel-title">知识层</h2><div class="layer-list">' + layerHtml + '</div><h2 class="panel-title">真题实际路径</h2><div class="question-list">' + qHtml + '</div><div class="boundary-box">当前没有真实学生数据。证据标记只用于体验状态语言，刷新后清空。</div></aside>';
  }

  function curve(edge) {
    var a = nodeById[edge.from];
    var b = nodeById[edge.to];
    var x1 = a.x + graphNodeWidth;
    var y1 = a.y + graphNodeAnchorY;
    var x2 = b.x;
    var y2 = b.y + graphNodeAnchorY;
    var bend = Math.max(34, Math.abs(x2 - x1) * 0.48);
    if (x2 >= x1) return 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + bend) + ' ' + y1 + ', ' + (x2 - bend) + ' ' + y2 + ', ' + x2 + ' ' + y2;
    return 'M ' + (a.x + graphNodeWidth / 2) + ' ' + (a.y + 54) + ' C ' + (a.x + graphNodeWidth / 2) + ' ' + (a.y + 86) + ', ' + (b.x + graphNodeWidth / 2) + ' ' + (b.y + 86) + ', ' + (b.x + graphNodeWidth / 2) + ' ' + (b.y + 54);
  }

  function graphSvg() {
    var layerOrder = Object.keys(layers);
    var backdropX = { orient: 8, represent: 168, change: 328, role: 488, quant: 648, context: 816, boundary: 1030 };
    var backdropW = { orient: 146, represent: 146, change: 146, role: 146, quant: 154, context: 160, boundary: 154 };
    var backs = layerOrder.map(function (id) {
      return '<rect class="layer-backdrop" x="' + backdropX[id] + '" y="4" width="' + backdropW[id] + '" height="800"></rect><text class="layer-caption" x="' + (backdropX[id] + 12) + '" y="28">' + esc(layers[id].name) + '</text>';
    }).join('');
    var edgeHtml = edges.map(function (e) {
      var active = pathHasEdge(e.id) && (state.question !== 'all' || !!state.activePathNodeIds);
      var dim = edgeDimmed(e);
      var cls = 'edge-path' + (active ? ' active' : '') + (dim ? ' dimmed' : '');
      var d = curve(e);
      var a = nodeById[e.from], b = nodeById[e.to];
      var lx = (a.x + graphNodeWidth + b.x) / 2;
      var ly = (a.y + b.y) / 2 + 18;
      return '<path class="' + cls + '" d="' + d + '"></path><path class="edge-hit" d="' + d + '" data-action="select-edge" data-id="' + e.id + '"><title>' + esc(e.label + '｜' + e.condition) + '</title></path>' + (active || state.selectedId === e.id ? '<text class="edge-label ' + (active ? 'active' : '') + '" x="' + lx + '" y="' + ly + '">' + esc(e.label) + '</text>' : '');
    }).join('');
    var nodeHtml = nodes.map(function (n) {
      var layer = layers[n.layer];
      var ev = currentEvidence(n.id);
      var cls = 'graph-node' + (state.selectedKind === 'node' && state.selectedId === n.id ? ' active' : '') + ((state.question !== 'all' || state.activePathNodeIds) && pathHasNode(n.id) ? ' path-active' : '') + (nodeDimmed(n) ? ' dimmed' : '');
      return '<foreignObject class="node-foreign" x="' + n.x + '" y="' + n.y + '" width="146" height="70"><div xmlns="http://www.w3.org/1999/xhtml" class="' + cls + '" style="--node-color:' + layer.color + '" data-action="select-node" data-id="' + n.id + '" role="button" tabindex="0"><div><div class="node-code">' + n.id + '</div><div class="node-name">' + esc(n.name) + '</div></div><span class="evidence-dot" style="--evidence-color:' + ev.color + '" title="' + esc(ev.name) + '"></span></div></foreignObject>';
    }).join('');
    return '<svg class="knowledge-svg" viewBox="0 0 1200 815" role="img" aria-label="氧化还原知识连接全景图"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 z" fill="#8f9b94"></path></marker></defs>' + backs + edgeHtml + nodeHtml + '</svg>';
  }

  function graphTransformStyle() {
    return 'transform:translate3d(' + state.graphPanX + 'px,' + state.graphPanY + 'px,0) scale(' + state.graphZoom + ')';
  }

  function renderVariantA() {
    return [
      '<div class="app-shell ' + (state.showLandscapeDetail ? 'landscape-detail-open' : '') + '">',
        topbar(),
        commonToolbar(),
        questionContextBar(),
        '<main class="variant-a-grid">',
          sideFilters(),
          '<section class="graph-stage" id="knowledge-graph">',
            '<div class="graph-toolbar"><button class="icon-button" data-action="zoom-out" title="缩小" aria-label="缩小知识图">−</button><button class="icon-button graph-zoom-value" data-action="zoom-reset" title="重置缩放和位置">' + Math.round(state.graphZoom * 100) + '%</button><button class="icon-button" data-action="zoom-in" title="放大" aria-label="放大知识图">＋</button><span class="graph-help">Ctrl＋滚轮缩放 · 按住空白处拖动</span><span class="graph-mobile-help">单指拖动 · 双指缩放</span><a class="graph-mobile-detail-link" href="#mobile-detail">看详情↓</a><button class="landscape-detail-trigger" data-action="open-landscape-detail">节点详情</button></div>',
            '<div class="graph-canvas" style="width:' + graphCanvasWidth + 'px;height:' + graphCanvasHeight + 'px;' + graphTransformStyle() + '">' + graphSvg() + '</div>',
          '</section>',
          '<button class="landscape-detail-backdrop ' + (state.showLandscapeDetail ? 'open' : '') + '" data-action="close-landscape-detail" aria-label="关闭节点详情"></button>',
          '<aside class="side-panel right landscape-detail-drawer ' + (state.showLandscapeDetail ? 'open' : '') + '" id="mobile-detail"><div class="mobile-detail-handle"><span>节点详情 · 区域内上下滑动</span><a href="#knowledge-graph">返回图↑</a><button class="landscape-detail-close" data-action="close-landscape-detail" aria-label="关闭节点详情">×</button></div>' + detailPanel(false) + '</aside>',
        '</main>',
        archetypeLibrary(),
        questionLibrary(),
        questionDrawer(),
        switcher(),
        stateDrawer(),
      '</div>'
    ].join('');
  }

  function metroLane(layerId) {
    var layer = layers[layerId];
    var laneNodes = nodes.filter(function (n) { return n.layer === layerId; });
    var stations = laneNodes.map(function (n) {
      var cls = 'station' + (state.selectedKind === 'node' && state.selectedId === n.id ? ' active' : '') + ((state.question !== 'all' || state.activePathNodeIds) && pathHasNode(n.id) ? ' path-active' : '') + (nodeDimmed(n) ? ' dimmed' : '');
      return '<div class="' + cls + '" data-action="select-node" data-id="' + n.id + '"><span class="station-dot"></span><div class="station-name">' + esc(n.name) + '</div><div class="station-code">' + n.id + '</div></div>';
    }).join('');
    return '<section class="metro-lane" style="--line-color:' + layer.color + '"><div class="line-name">' + esc(layer.name) + '</div><div class="stations">' + stations + '</div></section>';
  }

  function transferRows() {
    return edges.filter(function (e) {
      return nodeById[e.from].layer !== nodeById[e.to].layer && !edgeDimmed(e);
    }).slice(0, 24).map(function (e) {
      return '<div class="transfer-row" data-action="select-edge" data-id="' + e.id + '"><span>' + esc(nodeById[e.from].name) + '</span><span class="transfer-arrow">—' + esc(e.label) + '→</span><span>' + esc(nodeById[e.to].name) + '</span></div>';
    }).join('');
  }

  function renderVariantB() {
    var observed = Object.keys(state.evidence).filter(function (id) { return state.evidence[id] !== 'unobserved'; }).length;
    var percent = Math.round(observed / nodes.length * 100);
    return [
      '<div class="app-shell">',
        topbar(),
        commonToolbar(),
        questionContextBar(),
        '<main class="metro-shell">',
          '<section class="metro-hero">',
            '<div class="metro-hero-card"><span class="eyebrow">方案 B · 依赖路线</span><h2>先看主干，再换乘到高考情境</h2><p>每条线是一层知识依赖；站点是学生必须能调用的节点。真题筛选会把实际经过的站点点亮，而不是把整章全部标成“考过”。</p></div>',
            '<div class="route-summary"><h3>' + esc(questions[state.question].name) + '</h3><p>' + esc(questions[state.question].note) + '</p><div class="progress-bar"><span style="width:' + percent + '%"></span></div><p><strong>' + observed + '</strong> / ' + nodes.length + ' 个节点有演示证据标记。未标记不等于不会。</p></div>',
          '</section>',
          '<section class="metro-board">',
            '<div class="metro-board-header"><div><h2>七条知识线路</h2><p>横向看层内顺序，向下看跨层换乘。</p></div><span class="state-pill">当前高亮 ' + questions[state.question].nodes.length + ' 个节点</span></div>',
            Object.keys(layers).map(metroLane).join(''),
          '</section>',
          '<section class="transfer-board">',
            '<div class="transfer-list"><h3>当前可见的跨层换乘</h3>' + transferRows() + '</div>',
            '<aside class="metro-detail">' + detailPanel(false) + '</aside>',
          '</section>',
        '</main>',
        archetypeLibrary(),
        questionLibrary(),
        questionDrawer(),
        switcher(),
        stateDrawer(),
      '</div>'
    ].join('');
  }

  function matrixRow(node) {
    var outgoing = edges.filter(function (e) { return e.from === node.id; });
    var incoming = edges.filter(function (e) { return e.to === node.id; });
    var ev = currentEvidence(node.id);
    var edgesText = outgoing.slice(0, 2).map(function (e) { return '→ ' + e.label + '：' + nodeById[e.to].name; })
      .concat(incoming.slice(0, 1).map(function (e) { return '← ' + e.label + '：' + nodeById[e.from].name; })).join('<br>');
    var cls = (state.selectedKind === 'node' && state.selectedId === node.id ? 'active ' : '') + (nodeDimmed(node) ? 'dimmed' : '');
    return '<tr class="' + cls + '" data-action="select-node" data-id="' + node.id + '"><td><div class="matrix-node" style="--node-color:' + layers[node.layer].color + '"><span class="matrix-node-code">' + node.id + '</span><strong>' + esc(node.name) + '</strong></div></td><td>' + esc(layers[node.layer].name) + '</td><td>' + esc(node.summary) + '</td><td class="matrix-edge-list">' + edgesText + '</td><td>' + esc(node.probe) + '</td><td><span class="evidence-badge" style="--evidence-color:' + ev.color + '">' + esc(ev.name) + '</span></td></tr>';
  }

  function renderVariantC() {
    var qButtons = Object.keys(questions).map(function (id) {
      return '<button class="question-button ' + (state.question === id ? 'active' : '') + '" data-action="question" data-id="' + id + '"><span>' + esc(questions[id].name) + '</span><span class="mini-count">' + questions[id].nodes.length + '</span></button>';
    }).join('');
    var layerButtons = ['all'].concat(Object.keys(layers)).map(function (id) {
      var label = id === 'all' ? '全部层' : layers[id].name;
      return '<button class="question-button ' + (state.layer === id ? 'active' : '') + '" data-action="layer" data-id="' + id + '">' + esc(label) + '</button>';
    }).join('');
    return [
      '<div class="app-shell">',
        topbar(),
        questionContextBar(),
        '<main class="matrix-shell">',
          '<aside class="matrix-nav"><h2>诊断工作台</h2><p>不是按章节给分，而是逐个观察连接是否能在当前情境中被调用。</p><h3 class="panel-title">真题路径</h3><div class="question-list">' + qButtons + '</div><h3 class="panel-title">知识层</h3><div class="question-list">' + layerButtons + '</div><button class="ghost-button" style="color:white;border-color:#52665d;width:100%" data-action="show-state">导出当前原型状态</button></aside>',
          '<section class="matrix-main">',
            '<div class="matrix-head"><div><h2>节点—连接—探针—证据矩阵</h2><p>' + esc(questions[state.question].note) + '</p></div><label class="search-box"><span class="visually-hidden">搜索</span><input id="map-search" value="' + esc(state.query) + '" placeholder="筛选节点、关系或探针"></label></div>',
            '<div class="matrix-layout">',
              '<div class="matrix-table-wrap"><table class="matrix-table"><thead><tr><th>知识节点</th><th>层</th><th>学生需要保留什么</th><th>关键连接</th><th>最小探针</th><th>证据</th></tr></thead><tbody>' + nodes.map(matrixRow).join('') + '</tbody></table></div>',
              '<aside class="matrix-detail">' + detailPanel(false) + '</aside>',
            '</div>',
          '</section>',
        '</main>',
        archetypeLibrary(),
        questionLibrary(),
        questionDrawer(),
        switcher(),
        stateDrawer(),
      '</div>'
    ].join('');
  }

  function switcher() {
    var meta = variantMeta[state.variant];
    return '<nav class="prototype-switcher" aria-label="原型方案切换"><button class="switch-arrow" data-action="prev-variant" aria-label="上一个方案">←</button><div class="switch-label"><strong>' + state.variant + ' — ' + esc(meta.name) + '</strong>' + esc(meta.note) + '</div><button class="switch-arrow" data-action="next-variant" aria-label="下一个方案">→</button></nav>';
  }

  function pathMiniSteps(path) {
    return path.map(function (step) {
      return '<span class="path-mini-node" style="--node-color:' + layers[nodeById[step.node].layer].color + '">' + esc(nodeById[step.node].name) + '</span>';
    }).join('<span class="path-mini-arrow">→</span>');
  }

  function pathMini(question) {
    return pathMiniSteps(question.path);
  }

  function archetypeRouteHtml(nodeIds) {
    return nodeIds.map(function (id) {
      var node = nodeById[id];
      return '<span class="archetype-route-node" style="--node-color:' + layers[node.layer].color + '"><small>' + id + '</small><strong>' + esc(node.name) + '</strong></span>';
    }).join('<span class="archetype-route-arrow">→</span>');
  }

  function renderArchetypeOverview() {
    var covered = {};
    var subtypeCount = 0;
    pathArchetypes.forEach(function (archetype) {
      questionsForArchetype(archetype).forEach(function (question) { covered[question.id] = true; });
      subtypeCount += subtypeSpecsForArchetype(archetype).length;
    });
    var familySections = archetypeFamilies.map(function (family) {
      var cards = family.archetypes.map(function (archetypeId) {
        var archetype = archetypeById(archetypeId);
        var matched = questionsForArchetype(archetype);
        var tier = evidenceTier(archetype);
        var subtypeChips = subtypeSpecsForArchetype(archetype).map(function (subtype) {
          return '<button data-action="open-subtype" data-archetype="' + archetype.id + '" data-id="' + subtype.id + '"><span>' + subtype.id + '</span>' + esc(subtype.name) + '<small>' + questionsForSubtype(archetype, subtype).length + '题</small></button>';
        }).join('');
        return [
          '<article class="archetype-card" style="--archetype-color:' + archetype.color + '">',
            '<header><span>' + archetype.id + '</span><strong class="evidence-tier ' + tier.className + '">' + tier.label + ' · ' + matched.length + '题</strong></header>',
            '<h3>' + esc(archetype.name) + '</h3>',
            '<p>' + esc(archetype.summary) + '</p>',
            '<div class="archetype-level-label"><span>二级子型</span><strong>' + subtypeSpecsForArchetype(archetype).length + ' 条任务分叉</strong></div>',
            '<div class="archetype-subtype-chips">' + subtypeChips + '</div>',
            '<div class="archetype-card-route">' + archetypeRouteHtml(archetypeNodeIds(archetype)) + '</div>',
            '<footer><span>一级主干 ' + archetype.backbone.length + ' 节点</span><button class="primary-button" data-action="open-archetype" data-id="' + archetype.id + '">展开三级证据</button></footer>',
          '</article>'
        ].join('');
      }).join('');
      return '<section class="archetype-family"><header><span>' + family.id + ' · 一级路径组</span><h3>' + esc(family.name) + '</h3><p>' + esc(family.summary) + '</p></header><div class="archetype-grid">' + cards + '</div></section>';
    }).join('');
    return [
      '<div class="archetype-overview">',
        '<section class="archetype-hero"><div><span class="prototype-label">HIERARCHICAL PATH LIBRARY / PROTOTYPE</span><h2>一级主干 → 二级子型 → 真实题目</h2><p>一级主干表示稳定的认知连接，二级子型表示任务分叉，年份、省份、材料和装置只是题面情境。新题先尝试落入旧路径，无法解释时才新增子型或主干。</p></div><div class="archetype-hero-stats"><strong>' + archetypeFamilies.length + '</strong><span>个路径组</span><strong>' + pathArchetypes.length + '</strong><span>条一级主干</span><strong>' + subtypeCount + '</strong><span>个二级子型</span><strong>' + Object.keys(covered).length + '/' + Object.keys(questionBank).length + '</strong><span>题至少命中一条主干</span></div></section>',
        '<section class="taxonomy-rule"><strong>不要混为一层</strong><div><span><b>一级主干</b>：稳定解题连接</span><span><b>二级子型</b>：同一主干的任务分叉</span><span><b>题面情境</b>：电池、流程、环保材料、某省某年</span></div></section>',
        familySections,
        '<section class="coverage-frontier"><div><span>COVERAGE FRONTIER</span><h3>“更完整”不等于宣称“全部题型”</h3></div><p>当前分类由本地 65 个已核验 ItemUnit 反推。出现 0—2 道支持的路径会保留为“覆盖前沿/初步样本”；后续加入更多年份与省份后，只有当旧主干无法解释新题时才新增路径。</p></section>',
      '</div>'
    ].join('');
  }

  function renderArchetypeDetail(archetype) {
    var allMatched = questionsForArchetype(archetype);
    var activeSubtype = state.activeSubtypeId ? subtypeById(state.activeSubtypeId) : null;
    if (activeSubtype && subtypeSpecsForArchetype(archetype).indexOf(activeSubtype) < 0) activeSubtype = null;
    var matched = activeSubtype ? questionsForSubtype(archetype, activeSubtype) : allMatched;
    var tier = evidenceTier(archetype);
    var steps = archetype.backbone.map(function (step, index) {
      var node = nodeById[step.node];
      return '<article class="archetype-step" style="--node-color:' + layers[node.layer].color + '"><button data-action="inspect-archetype-node" data-id="' + node.id + '"><span>' + node.id + '</span><strong>' + esc(node.name) + '</strong></button><div><small>STEP ' + (index + 1) + '</small><p>' + esc(step.action) + '</p></div></article>';
    }).join('');
    var branches = archetype.branches.map(function (branch) {
      return '<article class="archetype-branch"><header><span>常见分支</span><strong>' + esc(branch.label) + '</strong></header><div>' + archetypeRouteHtml(branch.route) + '</div><p>' + esc(branch.note) + '</p></article>';
    }).join('');
    var subtypeCards = subtypeSpecsForArchetype(archetype).map(function (subtype) {
      var subtypeQuestions = questionsForSubtype(archetype, subtype);
      return '<article class="archetype-subtype-card ' + (activeSubtype && activeSubtype.id === subtype.id ? 'active' : '') + '"><header><span>' + subtype.id + '</span><strong>' + subtypeQuestions.length + ' 道真题证据</strong></header><h4>' + esc(subtype.name) + '</h4><div class="archetype-subtype-surfaces">' + subtype.surfaces.map(function (surface) { return '<span>' + esc(surface) + '</span>'; }).join('') + '</div><div class="archetype-subtype-route">' + archetypeRouteHtml(subtype.route) + '</div><footer><button data-action="open-subtype" data-archetype="' + archetype.id + '" data-id="' + subtype.id + '">只看该子型真题</button><button data-action="highlight-subtype" data-archetype="' + archetype.id + '" data-id="' + subtype.id + '">高亮子路径</button></footer></article>';
    }).join('');
    var questionsHtml = matched.map(function (question) {
      var subtypeNames = subtypesForQuestion(archetype, question).map(function (subtype) { return subtype.id; }).join(' / ');
      return '<button class="archetype-question" data-action="open-question" data-id="' + question.id + '"><span>' + esc(questionTag(question)) + '</span><strong>' + esc(question.title) + '</strong><small>' + esc(question.short || question.format) + ' · ' + question.path.length + ' 步整题路径' + (subtypeNames ? ' · ' + subtypeNames : '') + '</small></button>';
    }).join('') || '<div class="archetype-question-empty"><strong>当前本地样本还没有命中这一子型</strong><p>保留它作为覆盖前沿，等待后续真题核验；不会用算法伪造题目证据。</p></div>';
    return [
      '<div class="archetype-detail" style="--archetype-color:' + archetype.color + '">',
        '<button class="archetype-back" data-action="archetype-overview">← 返回全部题型</button>',
        '<header class="archetype-detail-head"><div><span>' + archetype.id + ' · 一级主干 · ' + esc(archetype.short) + '</span><h2>' + esc(archetype.name) + '</h2><p>' + esc(archetype.summary) + '</p><em class="evidence-tier ' + tier.className + '">' + tier.label + '</em></div><div><strong>' + allMatched.length + '</strong><span>道当前真题调用</span></div></header>',
        '<section class="archetype-signal-panel"><strong>看见这些任务信号</strong><div>' + archetype.cues.map(function (cue) { return '<span>' + esc(cue) + '</span>'; }).join('') + '</div></section>',
        '<section class="archetype-backbone"><header><div><span>LEVEL 1 · STABLE BACKBONE</span><h3>一级：不随题面轻易变化的主干</h3></div><button class="primary-button" data-action="highlight-archetype" data-id="' + archetype.id + '">在知识图中高亮主干</button></header><div class="archetype-route-large">' + archetypeRouteHtml(archetypeNodeIds(archetype)) + '</div><div class="archetype-step-list">' + steps + '</div></section>',
        '<section><div class="archetype-section-title"><span>LEVEL 2 · TASK SUBTYPES</span><h3>二级：同一主干下的任务子型</h3><p>点击子型后，三级真题只保留真正命中该分叉的题。</p></div><div class="archetype-subtype-grid">' + subtypeCards + '</div></section>',
        '<section><div class="archetype-section-title"><span>VARIABLE BRANCHES</span><h3>作答时可能转入的局部分支</h3></div><div class="archetype-branch-grid">' + branches + '</div></section>',
        '<section class="archetype-diagnosis-grid"><article><span>适用边界</span><p>' + esc(archetype.boundary) + '</p></article><article><span>最小诊断问题</span><p>' + esc(archetype.probe) + '</p></article><article><span>最小修补动作</span><p>' + esc(archetype.repair) + '</p></article></section>',
        '<section class="archetype-question-section"><div class="archetype-section-title"><span>LEVEL 3 · EVIDENCE FROM QUESTIONS</span><h3>' + (activeSubtype ? esc(activeSubtype.id + ' · ' + activeSubtype.name) : '全部二级子型') + '：' + matched.length + ' 道真题</h3><p>年份、省份、材料和装置在这一层出现。点击题目可继续查看题内小路径、整题路径和断连修补。</p>' + (activeSubtype ? '<button class="clear-subtype" data-action="clear-subtype">清除子型筛选</button>' : '') + '</div><div class="archetype-question-grid">' + questionsHtml + '</div></section>',
      '</div>'
    ].join('');
  }

  function archetypeLibrary() {
    if (!state.showArchetypeLibrary) return '';
    var content = state.activeArchetypeId ? renderArchetypeDetail(archetypeById(state.activeArchetypeId)) : renderArchetypeOverview();
    return '<div class="archetype-library-overlay" data-action="close-archetypes"><section class="archetype-library-modal"><header><div><span class="eyebrow">题型—路径—真题证据</span><strong>氧化还原题型路径库</strong></div><button class="icon-button" data-action="close-archetypes">×</button></header><div class="archetype-library-body">' + content + '</div></section></div>';
  }

  function questionLibrary() {
    if (!state.showQuestionLibrary) return '';
    var libraryQuery = state.libraryQuery.trim().toLowerCase();
    var visibleIds = Object.keys(questionBank).filter(function (id) {
      if (!libraryQuery) return true;
      var q = questionBank[id];
      var unitKeywords = questionUnits(q).map(function (unit) { return unit.keyword; }).join(' ');
      return [id, q.year, q.province, q.number, q.format, q.title, questions[id].note, unitKeywords].join(' ').toLowerCase().indexOf(libraryQuery) >= 0;
    });
    var cards = visibleIds.map(function (id) {
      var q = questionBank[id];
      var unitCount = questionUnits(q).length;
      return [
        '<article class="question-library-card">',
          '<div class="question-library-meta"><span class="exam-tag">' + esc(questionTag(q)) + '</span><span>' + esc(q.format) + '</span></div>',
          '<h3>' + esc(q.title) + '</h3>',
          '<p>' + esc(questions[id].note) + '</p>',
          '<div class="question-card-path">' + pathMini(q) + '</div>',
          '<div class="question-card-footer"><span>' + q.path.length + ' 步整题路径 · ' + unitCount + ' 个题内路径 · ' + q.gaps.length + ' 个候选断连</span><div><button class="ghost-button" data-action="highlight-question" data-id="' + id + '">只高亮路径</button> <button class="primary-button" data-action="open-question" data-id="' + id + '">打开题目</button></div></div>',
        '</article>'
      ].join('');
    }).join('');
    var empty = visibleIds.length ? '' : '<div class="question-library-empty"><strong>没有匹配的题目</strong><span>可搜索年份、省份、题号、路径主题或题型。</span></div>';
    return '<div class="question-library-overlay" data-action="close-library"><section class="question-library-modal"><header><div><span class="eyebrow">' + Object.keys(questionBank).length + ' 个已核验 ItemUnit</span><h2>氧化还原真题—路径库</h2><p>只收录已经完成题面、答案和路径核对的题。其他本地 PDF 尚未自动变成已审核题卡。</p></div><button class="icon-button" data-action="close-library">×</button></header><div class="question-library-tools"><label class="search-box"><span class="visually-hidden">搜索真题库</span><input id="library-search" value="' + esc(state.libraryQuery) + '" placeholder="搜索：省份、年份、题号、路径主题"></label><span>显示 ' + visibleIds.length + ' / ' + Object.keys(questionBank).length + '</span></div><div class="question-library-grid">' + cards + '</div>' + empty + '</section></div>';
  }

  function renderOriginal(question) {
    var units = questionUnits(question);
    var stem = question.stem.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var options = question.options.length ? '<div class="original-options">' + question.options.map(function (p, index) {
      var unit = units.filter(function (candidate) { return candidate.kind === 'option' && candidate.optionIndex === index; })[0];
      return '<article class="original-option-card"><p>' + esc(p) + '</p>' + (unit
        ? '<button class="option-path-entry" data-action="open-unit-path" data-key="' + esc(unit.key) + '"><span>解题关键词</span><strong>' + esc(unit.keyword) + '</strong><small>查看该选项的单独路径 →</small></button>'
        : '') + '</article>';
    }).join('') + '</div>' : '';
    var figure = question.image ? '<figure class="original-figure"><img src="' + esc(question.image) + '" alt="' + esc(question.imageAlt) + '"><figcaption>源 PDF 题图裁切；文字题干与选项在本页单独转写。</figcaption></figure>' : '';
    var family = questionFamily(question);
    var launchers = !question.options.length || family.length > 1
      ? '<section class="inline-unit-launchers"><header><div><span>题内路径入口</span><strong>' + (family.length > 1 ? '这张原题图已拆出 ' + family.length + ' 个氧化还原小问' : '当前 ItemUnit 的最小任务') + '</strong></div><small>点击关键词，只看该小问的路径</small></header><div>' + units.map(function (unit) {
        return '<button data-action="open-unit-path" data-key="' + esc(unit.key) + '"><span>' + esc(unit.label) + '</span><strong>' + esc(unit.keyword) + '</strong><small>' + esc(unit.title) + '</small></button>';
      }).join('') + '</div></section>'
      : '';
    return [
      '<section class="question-tab-panel">',
        '<div class="private-study-note">' + esc(usageNotice()) + ' 页面中的“解题关键词”可直接打开选项或小问路径。</div>',
        '<div class="original-question">' + stem + figure + options + '</div>',
        launchers,
        '<div class="answer-gate"><span>先让学生作答时，不展开“材料答案与解析”标签。</span><button class="ghost-button" data-action="question-tab" data-id="analysis">查看答案与解析</button></div>',
      '</section>'
    ].join('');
  }

  function renderAnalysis(question) {
    return [
      '<section class="question-tab-panel">',
        '<div class="validated-answer"><span>材料答案 / 教研核对</span><strong>' + esc(question.answer) + '</strong></div>',
        '<div class="analysis-list">' + question.analysis.map(function (line, index) { return '<div><span>' + (index + 1) + '</span><p>' + esc(line) + '</p></div>'; }).join('') + '</div>',
        '<div class="boundary-box">一次答案正确或错误都不能证明“已掌握/不会”。诊断还需要学生原话、实际书写和最小探针。</div>',
      '</section>'
    ].join('');
  }

  function renderPathTimeline(path) {
    return '<div class="path-timeline">' + path.map(function (step, index) {
      var node = nodeById[step.node];
      return '<article class="path-step"><button class="path-step-node" style="--node-color:' + layers[node.layer].color + '" data-action="select-node" data-id="' + node.id + '"><span>' + node.id + '</span><strong>' + esc(node.name) + '</strong></button><div class="path-step-body"><span>Step ' + (index + 1) + '</span><h4>' + esc(step.action) + '</h4><p><strong>中间结论：</strong>' + esc(step.result) + '</p><p class="path-check"><strong>自检：</strong>' + esc(step.check) + '</p></div></article>';
    }).join('') + '</div>';
  }

  function renderUnitPaths(question) {
    var units = questionUnits(question);
    var active = unitByKey(question, state.activeUnitKey);
    var navigation = units.map(function (unit) {
      return '<button class="unit-path-nav-item ' + (unit.key === active.key ? 'active' : '') + '" data-action="select-unit-path" data-key="' + esc(unit.key) + '"><span>' + esc(unit.label) + '</span><strong>' + esc(unit.keyword) + '</strong><small>' + esc(unit.title) + '</small></button>';
    }).join('');
    var pathContent = active.path.length
      ? '<div class="unit-path-overview"><span>该单元实际调用 ' + active.path.length + ' 个步骤</span><div class="path-overview">' + pathMiniSteps(active.path) + '</div></div>' + renderPathTimeline(active.path)
      : '<div class="unit-outside-map"><strong>当前氧化还原图不展开这个选项</strong><p>' + esc(active.outside) + '</p><span>这是有意保留的边界：不因为它出现在同一道题中，就强行给它连一条氧化还原路径。</span></div>';
    return [
      '<section class="question-tab-panel unit-path-panel">',
        '<div class="unit-path-principle"><strong>整题路径 ≠ 每个小问都调用全部节点。</strong><span>选中一个关键词后，只显示该选项或小问实际需要的已复核步骤。</span></div>',
        '<div class="unit-path-layout">',
          '<nav class="unit-path-nav"><header><span>' + (units[0].kind === 'subquestion' ? '同一大题的小问' : '题内判定单元') + '</span><strong>' + units.length + ' 个可查路径</strong></header>' + navigation + '</nav>',
          '<article class="unit-path-detail">',
            '<header><div><span>' + esc(active.label) + ' · 路径入口关键词</span><h3>' + esc(active.keyword) + '</h3></div><span class="unit-kind-badge">' + (active.kind === 'option' ? '选项级' : active.kind === 'subquestion' ? '小问级' : 'ItemUnit 级') + '</span></header>',
            '<div class="unit-prompt"><span>本单元题面</span><p>' + esc(active.prompt) + '</p></div>',
            '<div class="unit-reviewed-result"><span>已核对的判定依据</span><p>' + esc(active.explanation) + '</p><small>' + esc(active.sourceNote) + '</small></div>',
            pathContent,
            '<div class="unit-path-actions">' + (active.path.length ? '<button class="primary-button" data-action="highlight-unit-path" data-key="' + esc(active.key) + '">在知识图中只高亮这条小路径</button>' : '') + (active.kind === 'subquestion' && active.questionId !== question.id ? '<button class="ghost-button" data-action="open-unit-question" data-id="' + active.questionId + '">打开该小问的原题与解析</button>' : '') + '</div>',
          '</article>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderQuestionPath(question) {
    var matchedArchetypes = archetypesForQuestion(question);
    var archetypeLinks = matchedArchetypes.length
      ? '<section class="question-archetype-links"><header><span>从单题回到分层题型</span><strong>这道题调用 ' + matchedArchetypes.length + ' 条一级主干</strong></header><div>' + matchedArchetypes.map(function (archetype) {
          var subtypes = subtypesForQuestion(archetype, question);
          var primarySubtype = subtypes[0];
          return '<button style="--archetype-color:' + archetype.color + '" data-action="' + (primarySubtype ? 'open-subtype' : 'open-archetype') + '" data-archetype="' + archetype.id + '" data-id="' + (primarySubtype ? primarySubtype.id : archetype.id) + '"><span>' + archetype.id + '</span><strong>' + esc(archetype.short) + '</strong><small>' + esc(subtypes.length ? subtypes.map(function (subtype) { return subtype.id + ' ' + subtype.name; }).join(' / ') : '暂未命中二级子型') + '</small></button>';
        }).join('') + '</div></section>'
      : '<div class="question-archetype-empty">当前 ' + pathArchetypes.length + ' 条一级主干还不能稳定概括这道题，先保留单题路径，不强行归类。</div>';
    return [
      '<section class="question-tab-panel">',
        archetypeLinks,
        '<div class="path-overview">' + pathMini(question) + '</div>',
        renderPathTimeline(question.path),
        '<button class="primary-button" data-action="highlight-question" data-id="' + question.id + '">在知识图中高亮这条路径</button>',
      '</section>'
    ].join('');
  }

  function renderRepairs(question) {
    var activeKey = state.activeGapId;
    return [
      '<section class="question-tab-panel">',
        '<div class="probe-discipline"><strong>证据纪律：</strong>下列只是这道题可能暴露的候选分叉。必须先保存学生“答案＋一句依据”，再用一个最小探针区分竞争解释。</div>',
        '<div class="gap-repair-list">' + question.gaps.map(function (gap, index) {
          var key = question.id + ':' + index;
          var active = activeKey === key;
          return [
            '<article class="gap-repair-card ' + (active ? 'active' : '') + '" style="--node-color:' + layers[nodeById[gap.node].layer].color + '">',
              '<header><div><span>' + esc(gap.id + ' · ' + nodeById[gap.node].name) + '</span><h3>' + esc(gap.name) + '</h3></div><button class="' + (active ? 'primary-button' : 'ghost-button') + '" data-action="activate-gap" data-question="' + question.id + '" data-index="' + index + '">' + (active ? '已标为候选断连' : '有证据后选择此分叉') + '</button></header>',
              '<p><strong>可能表现：</strong>' + esc(gap.symptom) + '</p>',
              '<div class="repair-two-col"><div class="probe-box"><strong>只问一个最小问题</strong><p>' + esc(gap.probe) + '</p></div><div class="repair-action-box"><strong>只做一个最小修补</strong><p>' + esc(gap.repair) + '</p></div></div>',
              '<div class="repair-proof"><span><strong>当场停止条件：</strong>' + esc(gap.success) + '</span><span><strong>未见迁移：</strong>' + esc(gap.transfer) + '</span></div>',
              active ? '<div class="today-action"><span>当前唯一动作</span><strong>' + esc(gap.repair) + '</strong><small>训练项目正确只记 practice_success；仍需未见、无提示和延迟证据。</small></div>' : '',
            '</article>'
          ].join('');
        }).join('') + '</div>',
      '</section>'
    ].join('');
  }

  function questionDrawer() {
    if (!state.openQuestionId) return '';
    var question = questionBank[state.openQuestionId];
    if (!question) return '';
    var family = questionFamily(question);
    var showingFamilyPaths = state.questionTab === 'unitpath' && family.length > 1;
    var drawerTag = showingFamilyPaths
      ? '(' + question.year + '·' + question.province + ') ' + question.number.split('（')[0] + ' · 小问组'
      : questionTag(question);
    var drawerTitle = showingFamilyPaths ? '同一综合题的 ' + family.length + ' 条小问路径' : question.title;
    var drawerNote = showingFamilyPaths
      ? '共用同一张完整题面的小问组；每个小问保留独立答案、路径和候选断连。'
      : question.validation + ' · ' + question.usage;
    var tabs = [
      { id: 'original', name: '原题' },
      { id: 'analysis', name: '答案与解析' },
      { id: 'unitpath', name: '题内小路径' },
      { id: 'path', name: '整题路径' },
      { id: 'repair', name: '断连与最小修补' }
    ].map(function (tab) {
      return '<button class="question-tab ' + (state.questionTab === tab.id ? 'active' : '') + '" data-action="question-tab" data-id="' + tab.id + '">' + tab.name + '</button>';
    }).join('');
    var body = state.questionTab === 'analysis' ? renderAnalysis(question)
      : state.questionTab === 'unitpath' ? renderUnitPaths(question)
      : state.questionTab === 'path' ? renderQuestionPath(question)
      : state.questionTab === 'repair' ? renderRepairs(question)
      : renderOriginal(question);
    return [
      '<div class="question-drawer-overlay" data-action="close-question">',
        '<aside class="question-drawer">',
          '<header class="question-drawer-head"><div><div class="question-library-meta"><span class="exam-tag">' + esc(drawerTag) + '</span><span>' + esc(question.score + ' · ' + question.format) + '</span></div><h2>' + esc(drawerTitle) + '</h2><p>' + esc(drawerNote) + '</p></div><div class="drawer-actions">' + sourceAction(question) + '<button class="icon-button" data-action="close-question">×</button></div></header>',
          '<nav class="question-tabs">' + tabs + '</nav>',
          '<div class="question-drawer-body">' + body + '</div>',
        '</aside>',
      '</div>'
    ].join('');
  }

  function stateDrawer() {
    if (!state.showState) return '';
    var publicState = {
      variant: state.variant,
      question_path: state.question,
      layer_filter: state.layer,
      search: state.query,
      library_search: state.libraryQuery,
      selected: { kind: state.selectedKind, id: state.selectedId },
      open_question: state.openQuestionId,
      question_tab: state.questionTab,
      active_question_unit: state.activeUnitKey,
      archetype_library: { open: state.showArchetypeLibrary, selected: state.activeArchetypeId, subtype: state.activeSubtypeId, highlighted: state.highlightedArchetypeId },
      active_subpath: state.activePathNodeIds ? { label: state.activePathLabel, nodes: state.activePathNodeIds, edges: state.activePathEdgeIds } : null,
      active_candidate_gap: state.activeGapId,
      graph_view: { zoom: state.graphZoom, pan_x: state.graphPanX, pan_y: state.graphPanY, landscape_detail_open: state.showLandscapeDetail },
      evidence_overlay: Object.keys(state.evidence).filter(function (id) { return state.evidence[id] !== 'unobserved'; }).reduce(function (acc, id) { acc[id] = state.evidence[id]; return acc; }, {}),
      persistence: 'memory_only',
      student_evidence_imported: false
    };
    return '<div class="state-drawer" data-action="close-state"><section class="state-card" role="dialog" aria-modal="true"><header><h2>当前完整原型状态</h2><button class="icon-button" data-action="close-state">×</button></header><p>所有证据标记仅在内存中；这不是 Case 001 的真实认知画像。</p><pre>' + esc(JSON.stringify(publicState, null, 2)) + '</pre></section></div>';
  }

  function setVariant(next) {
    state.variant = next;
    var url = new URL(window.location.href);
    url.searchParams.set('variant', next);
    window.history.replaceState({}, '', url);
    render();
  }

  function cycleVariant(delta) {
    var ids = Object.keys(variantMeta);
    var index = ids.indexOf(state.variant);
    setVariant(ids[(index + delta + ids.length) % ids.length]);
  }

  function clampGraphPan() {
    var stage = document.querySelector('.graph-stage');
    if (!stage) return;
    var visibleMargin = 120;
    var scaledWidth = graphCanvasWidth * state.graphZoom;
    var scaledHeight = graphCanvasHeight * state.graphZoom;
    state.graphPanX = Math.min(stage.clientWidth - visibleMargin, Math.max(visibleMargin - scaledWidth, state.graphPanX));
    state.graphPanY = Math.min(stage.clientHeight - visibleMargin, Math.max(visibleMargin - scaledHeight, state.graphPanY));
    state.graphPanX = Math.round(state.graphPanX * 10) / 10;
    state.graphPanY = Math.round(state.graphPanY * 10) / 10;
  }

  function applyGraphTransform() {
    var canvas = document.querySelector('.graph-canvas');
    if (!canvas) return;
    clampGraphPan();
    canvas.style.transform = 'translate3d(' + state.graphPanX + 'px,' + state.graphPanY + 'px,0) scale(' + state.graphZoom + ')';
    var value = document.querySelector('.graph-zoom-value');
    if (value) value.textContent = Math.round(state.graphZoom * 100) + '%';
  }

  function setGraphZoom(nextZoom, anchorX, anchorY) {
    var stage = document.querySelector('.graph-stage');
    if (!stage) return;
    var oldZoom = state.graphZoom;
    var minimumZoom = compactGraphView ? 0.45 : 0.55;
    var next = Math.min(2.4, Math.max(minimumZoom, Math.round(nextZoom * 100) / 100));
    if (next === oldZoom) return;
    var x = anchorX == null ? stage.clientWidth / 2 : anchorX;
    var y = anchorY == null ? stage.clientHeight / 2 : anchorY;
    var canvasX = (x - state.graphPanX) / oldZoom;
    var canvasY = (y - state.graphPanY) / oldZoom;
    state.graphZoom = next;
    state.graphPanX = x - canvasX * next;
    state.graphPanY = y - canvasY * next;
    applyGraphTransform();
  }

  function resetGraphView() {
    var stage = document.querySelector('.graph-stage');
    state.graphZoom = compactGraphView ? 0.72 : 1;
    state.graphPanX = compactGraphView ? 10 : (stage ? Math.max(20, (stage.clientWidth - graphCanvasWidth) / 2) : 20);
    state.graphPanY = compactGraphView ? 45 : 12;
    applyGraphTransform();
  }

  function bindGraphInteractions() {
    var stage = document.querySelector('.graph-stage');
    if (!stage) return;
    stage.addEventListener('wheel', function (event) {
      if (!event.ctrlKey) return;
      event.preventDefault();
      var rect = stage.getBoundingClientRect();
      var factor = Math.exp(-event.deltaY * 0.0013);
      setGraphZoom(state.graphZoom * factor, event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });

    var drag = null;
    var touchPoints = {};
    var suppressedTouchTaps = {};
    var pinch = null;
    function pointDistance(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function startPinch() {
      var points = Object.keys(touchPoints).map(function (id) { return touchPoints[id]; });
      if (points.length < 2) return;
      var rect = stage.getBoundingClientRect();
      var midX = (points[0].x + points[1].x) / 2 - rect.left;
      var midY = (points[0].y + points[1].y) / 2 - rect.top;
      pinch = {
        distance: pointDistance(points[0], points[1]),
        zoom: state.graphZoom,
        canvasX: (midX - state.graphPanX) / state.graphZoom,
        canvasY: (midY - state.graphPanY) / state.graphZoom
      };
      Object.keys(touchPoints).forEach(function (id) { suppressedTouchTaps[id] = true; });
      drag = null;
      stage.classList.add('is-panning');
    }
    stage.addEventListener('pointerdown', function (event) {
      var graphTappable = event.target.closest('.graph-node, .edge-hit');
      if (event.pointerType === 'touch') {
        if (!graphTappable && event.target.closest('[data-action], button, a, input')) return;
        touchPoints[event.pointerId] = { id: event.pointerId, x: event.clientX, y: event.clientY };
        stage.setPointerCapture(event.pointerId);
        if (Object.keys(touchPoints).length >= 2) startPinch();
        else if (!graphTappable) {
          drag = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.graphPanX, panY: state.graphPanY };
          stage.classList.add('is-panning');
        }
        event.preventDefault();
        return;
      }
      if (event.target.closest('[data-action], button, a, input, .graph-node, .edge-hit')) return;
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.graphPanX, panY: state.graphPanY };
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-panning');
      event.preventDefault();
    });
    stage.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch' && touchPoints[event.pointerId]) {
        touchPoints[event.pointerId].x = event.clientX;
        touchPoints[event.pointerId].y = event.clientY;
        var points = Object.keys(touchPoints).map(function (id) { return touchPoints[id]; });
        if (pinch && points.length >= 2) {
          var rect = stage.getBoundingClientRect();
          var midX = (points[0].x + points[1].x) / 2 - rect.left;
          var midY = (points[0].y + points[1].y) / 2 - rect.top;
          var minimumZoom = compactGraphView ? 0.45 : 0.55;
          var nextZoom = Math.min(2.4, Math.max(minimumZoom, pinch.zoom * pointDistance(points[0], points[1]) / pinch.distance));
          state.graphZoom = Math.round(nextZoom * 100) / 100;
          state.graphPanX = midX - pinch.canvasX * state.graphZoom;
          state.graphPanY = midY - pinch.canvasY * state.graphZoom;
          applyGraphTransform();
          event.preventDefault();
          return;
        }
      }
      if (!drag || drag.id !== event.pointerId) return;
      state.graphPanX = drag.panX + event.clientX - drag.x;
      state.graphPanY = drag.panY + event.clientY - drag.y;
      applyGraphTransform();
      event.preventDefault();
    });
    function endDrag(event) {
      if (event.pointerType === 'touch') {
        delete touchPoints[event.pointerId];
        if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
        var remaining = Object.keys(touchPoints).map(function (id) { return touchPoints[id]; });
        if (remaining.length < 2) pinch = null;
        if (remaining.length === 1) {
          drag = { id: remaining[0].id, x: remaining[0].x, y: remaining[0].y, panX: state.graphPanX, panY: state.graphPanY };
        } else if (!remaining.length) {
          drag = null;
          stage.classList.remove('is-panning');
        }
        return;
      }
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      stage.classList.remove('is-panning');
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', function (event) {
      if (event.pointerType === 'touch') delete touchPoints[event.pointerId];
      if (!Object.keys(touchPoints).length) { drag = null; pinch = null; stage.classList.remove('is-panning'); }
    });
    stage.addEventListener('pointerup', function (event) {
      if (event.pointerType !== 'touch') return;
      if (suppressedTouchTaps[event.pointerId]) { delete suppressedTouchTaps[event.pointerId]; return; }
      var tappable = event.target.closest('.graph-node, .edge-hit');
      if (!tappable) return;
      tappable.click();
      event.preventDefault();
    });
  }

  function bind() {
    document.querySelectorAll('[data-action]').forEach(function (el) {
      el.addEventListener('click', function (event) {
        var action = el.getAttribute('data-action');
        if (action === 'select-node') { state.selectedKind = 'node'; state.selectedId = el.getAttribute('data-id'); if (el.closest('.question-drawer')) state.openQuestionId = null; if (isTouchLandscapeView()) state.showLandscapeDetail = true; render(); }
        else if (action === 'select-edge') { state.selectedKind = 'edge'; state.selectedId = el.getAttribute('data-id'); if (isTouchLandscapeView()) state.showLandscapeDetail = true; render(); }
        else if (action === 'open-landscape-detail') { state.showLandscapeDetail = true; render(); }
        else if (action === 'close-landscape-detail') { state.showLandscapeDetail = false; render(); }
        else if (action === 'layer') { state.layer = el.getAttribute('data-id'); render(); }
        else if (action === 'question') {
          state.question = el.getAttribute('data-id');
          state.activePathNodeIds = null;
          state.activePathEdgeIds = null;
          state.activePathLabel = '';
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          render();
        }
        else if (action === 'evidence') { state.evidence[el.getAttribute('data-node')] = el.getAttribute('data-id'); render(); }
        else if (action === 'open-archetypes') { state.showArchetypeLibrary = true; state.activeArchetypeId = null; state.activeSubtypeId = null; render(); }
        else if (action === 'open-archetype') { state.showArchetypeLibrary = true; state.activeArchetypeId = el.getAttribute('data-id'); state.activeSubtypeId = null; render(); }
        else if (action === 'open-subtype') { state.showArchetypeLibrary = true; state.activeArchetypeId = el.getAttribute('data-archetype'); state.activeSubtypeId = el.getAttribute('data-id'); render(); }
        else if (action === 'clear-subtype') { state.activeSubtypeId = null; render(); }
        else if (action === 'archetype-overview') { state.activeArchetypeId = null; state.activeSubtypeId = null; render(); }
        else if (action === 'close-archetypes') {
          if (event.target === el || el.tagName === 'BUTTON') { state.showArchetypeLibrary = false; render(); }
        }
        else if (action === 'highlight-archetype') {
          var archetype = archetypeById(el.getAttribute('data-id'));
          var archetypeNodes = archetypeNodeIds(archetype);
          state.question = 'all';
          state.activeArchetypeId = archetype.id;
          state.highlightedArchetypeId = archetype.id;
          state.activePathNodeIds = archetypeNodes;
          state.activePathEdgeIds = edgeIdsForPath(archetypeNodes.map(function (id) { return { node: id }; }));
          state.activePathLabel = '题型主干 · ' + archetype.name;
          state.showArchetypeLibrary = false;
          state.openQuestionId = null;
          render();
        }
        else if (action === 'highlight-subtype') {
          var subtypeArchetype = archetypeById(el.getAttribute('data-archetype'));
          var subtype = subtypeById(el.getAttribute('data-id'));
          var subtypeNodes = subtype.route.slice();
          state.question = 'all';
          state.activeArchetypeId = subtypeArchetype.id;
          state.activeSubtypeId = subtype.id;
          state.highlightedArchetypeId = subtypeArchetype.id;
          state.activePathNodeIds = subtypeNodes;
          state.activePathEdgeIds = edgeIdsForPath(subtypeNodes.map(function (id) { return { node: id }; }));
          state.activePathLabel = '二级子型 · ' + subtype.name;
          state.showArchetypeLibrary = false;
          state.openQuestionId = null;
          render();
        }
        else if (action === 'inspect-archetype-node') {
          state.selectedKind = 'node';
          state.selectedId = el.getAttribute('data-id');
          state.showArchetypeLibrary = false;
          render();
        }
        else if (action === 'open-library') { state.showQuestionLibrary = true; render(); }
        else if (action === 'close-library') {
          if (event.target === el || el.tagName === 'BUTTON') { state.showQuestionLibrary = false; render(); }
        }
        else if (action === 'open-question') {
          state.openQuestionId = el.getAttribute('data-id');
          state.question = state.openQuestionId;
          state.questionTab = 'original';
          state.activeUnitKey = null;
          state.activePathNodeIds = null;
          state.activePathEdgeIds = null;
          state.activePathLabel = '';
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          state.activeGapId = null;
          state.showQuestionLibrary = false;
          state.showArchetypeLibrary = false;
          render();
        }
        else if (action === 'close-question') {
          if (event.target === el || el.tagName === 'BUTTON') { state.openQuestionId = null; render(); }
        }
        else if (action === 'question-tab') { state.questionTab = el.getAttribute('data-id'); render(); }
        else if (action === 'open-unit-path' || action === 'select-unit-path') {
          state.activeUnitKey = el.getAttribute('data-key');
          state.questionTab = 'unitpath';
          render();
        }
        else if (action === 'open-unit-question') {
          state.openQuestionId = el.getAttribute('data-id');
          state.question = state.openQuestionId;
          state.questionTab = 'original';
          state.activeUnitKey = null;
          state.activePathNodeIds = null;
          state.activePathEdgeIds = null;
          state.activePathLabel = '';
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          render();
        }
        else if (action === 'highlight-unit-path') {
          var unitQuestion = questionBank[state.openQuestionId];
          var unit = unitByKey(unitQuestion, el.getAttribute('data-key'));
          state.question = unit.questionId;
          state.activePathNodeIds = unit.path.map(function (step) { return step.node; }).filter(function (id, index, list) { return list.indexOf(id) === index; });
          state.activePathEdgeIds = edgeIdsForPath(unit.path);
          state.activePathLabel = unit.label + ' · ' + unit.keyword;
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          state.openQuestionId = null;
          state.showQuestionLibrary = false;
          render();
        }
        else if (action === 'highlight-question') {
          state.question = el.getAttribute('data-id');
          state.activePathNodeIds = null;
          state.activePathEdgeIds = null;
          state.activePathLabel = '';
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          state.openQuestionId = null;
          state.showQuestionLibrary = false;
          render();
        }
        else if (action === 'activate-gap') {
          var qid = el.getAttribute('data-question');
          var gapIndex = Number(el.getAttribute('data-index'));
          var gap = questionBank[qid].gaps[gapIndex];
          state.activeGapId = qid + ':' + gapIndex;
          state.evidence[gap.node] = 'candidate_gap';
          state.question = qid;
          state.activePathNodeIds = null;
          state.activePathEdgeIds = null;
          state.activePathLabel = '';
          state.activeArchetypeId = null;
          state.activeSubtypeId = null;
          state.highlightedArchetypeId = null;
          state.questionTab = 'repair';
          render();
        }
        else if (action === 'prev-variant') cycleVariant(-1);
        else if (action === 'next-variant') cycleVariant(1);
        else if (action === 'show-state') { state.showState = true; render(); }
        else if (action === 'close-state') {
          if (event.target === el || el.tagName === 'BUTTON') { state.showState = false; render(); }
        }
        else if (action === 'zoom-in') setGraphZoom(state.graphZoom + 0.15);
        else if (action === 'zoom-out') setGraphZoom(state.graphZoom - 0.15);
        else if (action === 'zoom-reset') resetGraphView();
      });
    });
    var search = document.getElementById('map-search');
    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value;
        var position = search.selectionStart;
        render();
        var next = document.getElementById('map-search');
        if (next) { next.focus(); next.setSelectionRange(position, position); }
      });
    }
    var librarySearch = document.getElementById('library-search');
    if (librarySearch) {
      librarySearch.addEventListener('input', function () {
        state.libraryQuery = librarySearch.value;
        var position = librarySearch.selectionStart;
        render();
        var next = document.getElementById('library-search');
        if (next) { next.focus(); next.setSelectionRange(position, position); }
      });
    }
    bindGraphInteractions();
  }

  function render() {
    var app = document.getElementById('app');
    if (state.variant === 'B') app.innerHTML = renderVariantB();
    else if (state.variant === 'C') app.innerHTML = renderVariantC();
    else app.innerHTML = renderVariantA();
    document.title = '方案 ' + state.variant + '｜氧化还原知识连接地图';
    bind();
  }

  window.addEventListener('keydown', function (event) {
    var tag = document.activeElement && document.activeElement.tagName;
    var editable = document.activeElement && document.activeElement.isContentEditable;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
    if (event.key === 'ArrowLeft') cycleVariant(-1);
    if (event.key === 'ArrowRight') cycleVariant(1);
    if (event.key === 'Escape' && state.showLandscapeDetail) { state.showLandscapeDetail = false; render(); }
    else if (event.key === 'Escape' && state.showState) { state.showState = false; render(); }
    else if (event.key === 'Escape' && state.openQuestionId) { state.openQuestionId = null; render(); }
    else if (event.key === 'Escape' && state.showQuestionLibrary) { state.showQuestionLibrary = false; render(); }
    else if (event.key === 'Escape' && state.showArchetypeLibrary) { state.showArchetypeLibrary = false; render(); }
  });

  render();
}());
