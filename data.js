// ═══════════════════════════════════════
// 理想汽车 SI3.0 外立面标准 — 弹窗内容数据
// 更新说明：只需修改此文件，无需改 HTML/CSS
// ═══════════════════════════════════════

const HOTSPOT_DATA = {

  biaoshi: {
    label: '标识',
    title: '标识定位原则',
    content: [
      { type: 'image', src: 'assets/standards/biaoshi-01.jpg', caption: '标识定位原则（一）' },
      { type: 'image', src: 'assets/standards/biaoshi-02.jpg', caption: '标识定位原则（二）' },
      { type: 'image', src: 'assets/standards/biaoshi-03.jpg', caption: '标识定位原则（三）' },
    ]
  },

  hengmei: {
    label: '横楣',
    title: '横楣（波浪板）设计规范',
    content: [
      { type: 'image', src: 'assets/standards/hengmei-01.jpg', caption: '横楣设计规范（一）' },
      { type: 'image', src: 'assets/standards/hengmei-02.jpg', caption: '横楣设计规范（二）' },
    ]
  },

  dengguang: {
    label: '灯光',
    title: '灯光设计标准',
    content: [
      { type: 'image', src: 'assets/standards/dengguang-01.jpg', caption: '灯光设计标准（一）' },
      { type: 'image', src: 'assets/standards/dengguang-02.jpg', caption: '灯光设计标准（二）' },
      { type: 'image', src: 'assets/standards/dengguang-03.jpg', caption: '灯光设计标准（三）' },
    ]
  },

  muqiang: {
    label: '幕墙',
    title: '幕墙饰面标准',
    content: [
      { type: 'image', src: 'assets/standards/muqiang-01.jpg', caption: '幕墙饰面标准（一）' },
      { type: 'image', src: 'assets/standards/muqiang-02.jpg', caption: '幕墙饰面标准（二）' },
      { type: 'image', src: 'assets/standards/muqiang-03.jpg', caption: '幕墙饰面标准（三）' },
    ]
  },

  mendou: {
    label: '门斗',
    title: '门斗构造细则',
    content: [
      { type: 'image', src: 'assets/standards/mendou-01.jpg', caption: '门斗构造细则（一）' },
      { type: 'image', src: 'assets/standards/mendou-02.jpg', caption: '门斗构造细则（二）' },
      { type: 'image', src: 'assets/standards/mendou-03.jpg', caption: '门斗构造细则（三）' },
      { type: 'image', src: 'assets/standards/mendou-04.jpg', caption: '门斗构造细则（四）' },
      { type: 'image', src: 'assets/standards/mendou-05.jpg', caption: '门斗构造细则（五）' },
      { type: 'image', src: 'assets/standards/mendou-06.jpg', caption: '门斗构造细则（六）' },
      { type: 'image', src: 'assets/standards/mendou-07.jpg', caption: '门斗构造细则（七）' },
      { type: 'image', src: 'assets/standards/mendou-08.jpg', caption: '门斗构造细则（八）' },
    ]
  }

}

// ═══════════════════════════════════════
// SI AGENT — 知识库
// ═══════════════════════════════════════

const AGENT_KB = [
  {
    keywords: ['标识', '品牌', 'logo', 'Logo', '发光字', '一级', '二级', '三级'],
    html: `<p>标识系统分为三个级别：</p><ol>
<li><strong>一级标识</strong>：理想汽车主 Logo，正发光，5mm 乳白亚克力，色温 6500K</li>
<li><strong>二级标识</strong>：理想综合中心文字牌，同材质规格</li>
<li><strong>三级标识</strong>：门斗发光字，视项目条件选用</li>
</ol><p>定位原则：标识中心线对齐横楣中心线，左右留边 ≥ 1.5m。</p>`,
    cta: 'biaoshi',
    suCad: true
  },
  {
    keywords: ['横楣', '波浪板', '门楣', '铝塑板', '铝单板', '珠珠灰', 'JX815', 'JX816'],
    html: `<p>横楣由三个必选材料层构成：</p><ul>
<li><strong>波浪板</strong>：直径 70mm 铝管，颜色鼠灰 JX816</li>
<li><strong>铝塑板 / 铝单板</strong>：珠珠灰 JX815（吉祥铝塑板色卡）</li>
<li><strong>洗墙灯</strong>：LED 线条灯，色温 5500K</li>
</ul><p>横楣高度建议 800–1200mm，具体视建筑层高按比例确定。</p>`,
    cta: 'hengmei',
    suCad: true
  },
  {
    keywords: ['幕墙', '玻璃', '透明', '通透', '超白', '普白', '透光'],
    html: `<p>幕墙饰面包含两个必选材料：</p><ul>
<li><strong>铝塑板 / 铝单板</strong>：珠珠灰 JX815，用于墙体实体部分</li>
<li><strong>透明玻璃</strong>：双层钢化（夹胶或中空），超白/普白，透光率 ≥ 75%</li>
</ul><p>玻璃分格宽度建议 900–1500mm，高度与层高匹配，保持通透感。</p>`,
    cta: 'muqiang',
    suCad: true
  },
  {
    keywords: ['门斗', '入口', '前厅', '自动门', '全玻'],
    html: `<p>门斗为展厅主入口构造，核心参数：</p><ul>
<li><strong>净宽</strong>：≥ 3600mm（双开自动门）</li>
<li><strong>净高</strong>：≥ 3200mm（与横楣底部齐平）</li>
<li><strong>门扇</strong>：超白全玻自动平移门，无框设计</li>
<li><strong>顶部发光字</strong>：品牌名称，色温 6500K</li>
</ul><p>门斗两侧柱体包铝板，颜色与横楣一致（JX815）。</p>`,
    cta: 'mendou',
    suCad: true
  },
  {
    keywords: ['灯光', '照明', 'LED', '色温', '洗墙', '线条灯'],
    html: `<p>外立面灯光系统包含两组：</p><ul>
<li><strong>顶部挑檐 LED</strong>：暖白，色温 3000K，均匀洗墙</li>
<li><strong>横楣洗墙灯</strong>：中性白，色温 5500K，强调波浪板纹理</li>
</ul><p>夜间效果要求：品牌 Logo 正发光亮度 ≥ 800 cd/m²，洗墙灯照度均匀度 ≥ 0.7。</p>`,
    cta: 'dengguang',
    suCad: false
  },
  {
    keywords: ['材料', '材质', '规格', '色卡', '吉祥'],
    html: `<p>SI 3.0 外立面主要材料清单：</p><ul>
<li>波浪板铝管：直径 70mm，鼠灰 JX816</li>
<li>铝塑板 / 铝单板：珠珠灰 JX815</li>
<li>发光字亚克力：5mm 乳白，透光率约 60%</li>
<li>幕墙玻璃：双钢化，超白/普白，≥ 75% 透光</li>
</ul>`,
    cta: null,
    suCad: true
  }
];

const AGENT_FALLBACK_HTML = `<p>我还在学习中，暂时没有找到关于「{Q}」的专项资料。</p><p>您可以尝试询问：<strong>标识定位</strong>、<strong>横楣材料</strong>、<strong>幕墙玻璃</strong> 或 <strong>门斗构造</strong>。</p>`;

const AGENT_WELCOME_HTML = `<p>你好！我是 <strong translate="no">SI 3.0 Agent</strong>，可以帮您查询理想汽车综合中心外立面设计标准。</p><p>请问您想了解哪方面的规范？</p>`;
