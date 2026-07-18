// 64卦数据。lines 为6位二进制，自下而上（lines[0]=初爻，lines[5]=上爻）。
// 1=阳爻(━━━)，0=阴爻(━ ━)。四正卦 isCardinal=true（乾坤坎离），不参与值年配卦。
// 卦序按先天六十四卦圆图（复起），去四正后60卦配60甲子。
// 同人=2026值年锚点：calendar.js 按卦名 findIndex 查找，不依赖固定 id（同人圆图序为第15卦）。
// judgment 取《周易》通行本卦辞（公有领域）。
export const HEXAGRAMS = [
  { id:  1, name: '复', lines: '100000', judgment: '亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。' },
  { id:  2, name: '颐', lines: '100001', judgment: '贞吉。观颐，自求口实。' },
  { id:  3, name: '屯', lines: '100010', judgment: '元亨，利贞。勿用有攸往，利建侯。' },
  { id:  4, name: '益', lines: '100011', judgment: '利有攸往，利涉大川。' },
  { id:  5, name: '震', lines: '100100', judgment: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。' },
  { id:  6, name: '噬嗑', lines: '100101', judgment: '亨。利用狱。' },
  { id:  7, name: '随', lines: '100110', judgment: '元亨，利贞，无咎。' },
  { id:  8, name: '无妄', lines: '100111', judgment: '元亨，利贞。其匪正有眚，不利有攸往。' },
  { id:  9, name: '明夷', lines: '101000', judgment: '利艰贞。' },
  { id: 10, name: '贲', lines: '101001', judgment: '亨。小利有攸往。' },
  { id: 11, name: '既济', lines: '101010', judgment: '亨小，利贞。初吉终乱。' },
  { id: 12, name: '家人', lines: '101011', judgment: '利女贞。' },
  { id: 13, name: '丰', lines: '101100', judgment: '亨。王假之，勿忧，宜日中。' },
  { id: 14, name: '革', lines: '101110', judgment: '巳日乃孚，元亨，利贞，悔亡。' },
  { id: 15, name: '同人', lines: '101111', judgment: '同人于野，亨。利涉大川，利君子贞。' },
  { id: 16, name: '临', lines: '110000', judgment: '元亨，利贞。至于八月有凶。' },
  { id: 17, name: '损', lines: '110001', judgment: '有孚，元吉，无咎，可贞，利有攸往。' },
  { id: 18, name: '节', lines: '110010', judgment: '亨。苦节，不可贞。' },
  { id: 19, name: '中孚', lines: '110011', judgment: '豚鱼吉，利涉大川，利贞。' },
  { id: 20, name: '归妹', lines: '110100', judgment: '征凶，无攸利。' },
  { id: 21, name: '睽', lines: '110101', judgment: '小事吉。' },
  { id: 22, name: '兑', lines: '110110', judgment: '亨，利贞。' },
  { id: 23, name: '履', lines: '110111', judgment: '履虎尾，不咥人，亨。' },
  { id: 24, name: '泰', lines: '111000', judgment: '小往大来，吉，亨。' },
  { id: 25, name: '大畜', lines: '111001', judgment: '利贞，不家食，吉，利涉大川。' },
  { id: 26, name: '需', lines: '111010', judgment: '有孚，光亨，贞吉。利涉大川。' },
  { id: 27, name: '小畜', lines: '111011', judgment: '亨。密云不雨，自我西郊。' },
  { id: 28, name: '大壮', lines: '111100', judgment: '利贞。' },
  { id: 29, name: '大有', lines: '111101', judgment: '元亨。' },
  { id: 30, name: '夬', lines: '111110', judgment: '扬于王庭，孚号有厉。告自邑，不利即戎，利有攸往。' },
  { id: 31, name: '乾', lines: '111111', isCardinal: true, judgment: '元亨，利贞。' },
  { id: 32, name: '姤', lines: '011111', judgment: '女壮，勿用取女。' },
  { id: 33, name: '大过', lines: '011110', judgment: '栋桡，利有攸往，亨。' },
  { id: 34, name: '鼎', lines: '011101', judgment: '元吉，亨。' },
  { id: 35, name: '恒', lines: '011100', judgment: '亨，无咎，利贞，利有攸往。' },
  { id: 36, name: '巽', lines: '011011', judgment: '小亨，利有攸往，利见大人。' },
  { id: 37, name: '井', lines: '011010', judgment: '改邑不改井，无丧无得，往来井井。汔至，亦未繘井，羸其瓶，凶。' },
  { id: 38, name: '蛊', lines: '011001', judgment: '元亨，利涉大川。先甲三日，后甲三日。' },
  { id: 39, name: '升', lines: '011000', judgment: '元亨，用见大人，勿恤，南征吉。' },
  { id: 40, name: '讼', lines: '010111', judgment: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。' },
  { id: 41, name: '困', lines: '010110', judgment: '亨，贞，大人吉，无咎。有言不信。' },
  { id: 42, name: '未济', lines: '010101', judgment: '亨。小狐汔济，濡其尾，无攸利。' },
  { id: 43, name: '解', lines: '010100', judgment: '利西南。无所往，其来复吉。有攸往，夙吉。' },
  { id: 44, name: '涣', lines: '010011', judgment: '亨。王假有庙，利涉大川，利贞。' },
  { id: 45, name: '蒙', lines: '010001', judgment: '亨。匪我求童蒙，童蒙求我。' },
  { id: 46, name: '师', lines: '010000', judgment: '贞，丈人吉，无咎。' },
  { id: 47, name: '遁', lines: '001111', judgment: '亨，小利贞。' },
  { id: 48, name: '咸', lines: '001110', judgment: '亨，利贞，取女吉。' },
  { id: 49, name: '旅', lines: '001101', judgment: '小亨，旅贞吉。' },
  { id: 50, name: '小过', lines: '001100', judgment: '亨，利贞。可小事，不可大事。' },
  { id: 51, name: '渐', lines: '001011', judgment: '女归吉，利贞。' },
  { id: 52, name: '蹇', lines: '001010', judgment: '利西南，不利东北。利见大人，贞吉。' },
  { id: 53, name: '艮', lines: '001001', judgment: '艮其背，不获其身。行其庭，不见其人。无咎。' },
  { id: 54, name: '谦', lines: '001000', judgment: '亨，君子有终。' },
  { id: 55, name: '否', lines: '000111', judgment: '否之匪人，不利君子贞，大往小来。' },
  { id: 56, name: '萃', lines: '000110', judgment: '亨。王假有庙，利见大人，亨，利贞。' },
  { id: 57, name: '晋', lines: '000101', judgment: '康侯用锡马蕃庶，昼日三接。' },
  { id: 58, name: '豫', lines: '000100', judgment: '利建侯行师。' },
  { id: 59, name: '观', lines: '000011', judgment: '盥而不荐，有孚颙若。' },
  { id: 60, name: '比', lines: '000010', judgment: '吉。原筮元永贞，无咎。' },
  { id: 61, name: '剥', lines: '000001', judgment: '不利有攸往。' },
  { id: 62, name: '坤', lines: '000000', isCardinal: true, judgment: '元亨，利牝马之贞。' },
  // 四正卦补全（坎离在值年60卦序之外，作为统领卦单列）
  { id: 63, name: '坎', lines: '010010', isCardinal: true, judgment: '习坎，有孚，维心亨，行有尚。' },
  { id: 64, name: '离', lines: '101101', isCardinal: true, judgment: '利贞，亨。畜牝牛，吉。' },
];

const byId = new Map(HEXAGRAMS.map(h => [h.id, h]));
const byName = new Map(HEXAGRAMS.map(h => [h.name, h]));

export function getById(id) {
  const h = byId.get(id);
  if (!h) throw new Error(`卦 id 不存在: ${id}`);
  return h;
}

export function getByName(name) {
  const h = byName.get(name);
  if (!h) throw new Error(`卦名不存在: ${name}`);
  return h;
}
