// 章节元数据。draft=true 的章节在目录中灰显（后续迭代内容）。
export const CHAPTERS = [
  { id: 'intro', title: '導言：皇極經世是什麼', draft: false },
  { id: 'ch1',   title: '第一章：元會運世的數理結構', draft: false },
  { id: 'ch2',   title: '第二章：先天六十四卦圖', draft: false },
  { id: 'ch3',   title: '第三章：卦氣配法', draft: true },
  { id: 'ch4',   title: '第四章：以史推步', draft: true },
  { id: 'appendix', title: '附錄：原典索引·注疏·文獻', draft: true },
];

const byId = new Map(CHAPTERS.map(c => [c.id, c]));

export function getChapter(id) {
  const c = byId.get(id);
  if (!c) throw new Error('章节不存在: ' + id);
  return c;
}

export function getNext(id) {
  const i = CHAPTERS.findIndex(c => c.id === id);
  return i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
}

export function getPrev(id) {
  const i = CHAPTERS.findIndex(c => c.id === id);
  return i > 0 ? CHAPTERS[i - 1] : null;
}
