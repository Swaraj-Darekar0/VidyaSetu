export type ConceptPayload = {
  explanation_text?: string;
  key_points?: string[];
};

export type ConceptNode = {
  id?: string;
  topic?: string;
  keywords?: string[];
  question_variations?: string[];
  content_payload?: ConceptPayload;
};

export type ChapterNode = {
  chapter_id?: string;
  chapter_title?: string;
  concepts?: ConceptNode[];
};

export type OfflinePack = {
  meta?: Record<string, unknown>;
  chapters?: ChapterNode[];
};

type PackLoader = () => OfflinePack;

export const dataIndex: Record<string, PackLoader> = {
  '8th/subjects/english.json': () => require('./8th/english/4th English.json'),
  '8th/subjects/math.json': () => require('./8th/math/4th Mathematics.json'),
  '8th/subjects/science.json': () => require('./8th/science/4th Science.json'),
  '8th/subjects/history.json': () => require('./8th/history/4th History (1).json'),
  '8th/subjects/history_marathi.json': () => require('./8th/subjects/4th History in Marathi.json'),
};
