import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChapterNode, ConceptNode, OfflinePack, dataIndex } from '@/data';

type QAResult = {
  answer: string;
  topic?: string;
  found: boolean;
};

type UseQAModelResponse = {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  findAnswer: (question: string) => QAResult | null;
};

const dataCache = new Map<string, ConceptNode[]>();

const CLASS_FOLDER_MAP: Record<string, string> = {
  '5': '5th',
  '6': '6th',
  '7': '7th',
  '8': '8th',
  '9': '9th',
  '10': '10th',
  '11': '11th',
  '12': '12th',
};

const normalizeText = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type PackShape = OfflinePack | OfflinePack[] | ChapterNode[] | undefined;

const extractChapters = (pack: PackShape): ChapterNode[] => {
  if (!pack) return [];
  if (Array.isArray(pack)) {
    // Some packs export an array of chapter nodes directly.
    return pack as unknown as ChapterNode[];
  }
  if (Array.isArray(pack.chapters)) {
    return pack.chapters;
  }
  return [];
};

const flattenConcepts = (pack?: PackShape) =>
  extractChapters(pack).reduce<ConceptNode[]>((acc, chapter: ChapterNode) => {
    if (chapter?.concepts?.length) {
      acc.push(...chapter.concepts);
    }
    return acc;
  }, []);

const resolveDataKey = (classId?: string | null, subjectId?: string | null) => {
  if (!subjectId) return null;
  if (!classId) return null;
  const trimmedClass = classId.trim();
  const classFolder = CLASS_FOLDER_MAP[trimmedClass] ?? (trimmedClass.endsWith('th') ? trimmedClass : `${trimmedClass}th`);
  if (!classFolder) return null;
  return `${classFolder}/subjects/${subjectId}.json`;
};

export function useQAModel(classId?: string | null, subjectId?: string | null): UseQAModelResponse {
  const [concepts, setConcepts] = useState<ConceptNode[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataKey = useMemo(() => {
    const preferredKey = resolveDataKey(classId, subjectId);
    const fallbackKey = subjectId ? `8th/subjects/${subjectId}.json` : null;

    if (preferredKey && dataIndex[preferredKey]) {
      return preferredKey;
    }

    if (fallbackKey && dataIndex[fallbackKey]) {
      return fallbackKey;
    }

    return preferredKey ?? fallbackKey;
  }, [classId, subjectId]);

  useEffect(() => {
    if (!dataKey) {
      setConcepts(null);
      setError('Select a class and subject to load the offline pack.');
      return;
    }

    const loader = dataIndex[dataKey];
    if (!loader) {
      setConcepts(null);
      setError('Offline pack not downloaded for this subject yet.');
      return;
    }

    if (dataCache.has(dataKey)) {
      setConcepts(dataCache.get(dataKey) ?? null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const pack = loader();
      const flattened = flattenConcepts(pack);
      dataCache.set(dataKey, flattened);
      setConcepts(flattened);
    } catch (err) {
      console.error('[qa] load pack error', err);
      setError('Unable to load the offline pack.');
      setConcepts(null);
    } finally {
      setIsLoading(false);
    }
  }, [dataKey]);

  const findAnswer = useCallback(
    (question: string): QAResult | null => {
      if (!concepts || !concepts.length) return null;

      const normalizedQuestion = normalizeText(question);
      if (!normalizedQuestion) {
        return null;
      }

      const tokens = new Set(normalizedQuestion.split(' ').filter(Boolean));

      let bestScore = 0;
      let bestConcept: ConceptNode | null = null;

      concepts.forEach((concept) => {
        const keywords = (concept.keywords ?? []).map((kw) => normalizeText(kw)).filter(Boolean);
        const topic = normalizeText(concept.topic);
        const questionVariations = (concept.question_variations ?? [])
          .map((variation) => normalizeText(variation))
          .filter(Boolean);

        let score = 0;

        if (normalizedQuestion && keywords.length) {
          keywords.forEach((keyword) => {
            if (!keyword) return;
            if (normalizedQuestion.includes(keyword)) {
              score += 5;
            }
          });
        }

        if (questionVariations.length) {
          questionVariations.forEach((variation) => {
            if (!variation) return;
            if (variation.includes(normalizedQuestion) || normalizedQuestion.includes(variation)) {
              score += 3;
            }
          });
        }

        if (topic && (topic.includes(normalizedQuestion) || normalizedQuestion.includes(topic))) {
          score += 3;
        }

        if (tokens.size && keywords.length) {
          tokens.forEach((token) => {
            if (keywords.includes(token)) {
              score += 1;
            }
          });
        }

        if (score > bestScore) {
          bestScore = score;
          bestConcept = concept;
        }
      });

      if (!bestConcept || bestScore <= 0) {
        return {
          found: false,
          topic: undefined,
          answer: "I'm sorry, I couldn't find an answer to that question. Please try rephrasing it.",
        };
      }

      const resolvedConcept = bestConcept as ConceptNode;
      const explanation = resolvedConcept.content_payload?.explanation_text?.trim();
      const keyPoints = (resolvedConcept.content_payload?.key_points ?? [])
        .map((point) => (typeof point === 'string' ? point.trim() : ''))
        .filter((point) => point.length > 0);

      const sections = [] as string[];
      if (explanation) {
        sections.push(explanation);
      }

      if (keyPoints.length) {
        const bullets = keyPoints.map((point) => `• ${point}`).join('\n');
        sections.push(bullets);
      }

      return {
        found: true,
        topic: resolvedConcept.topic,
        answer: sections.join('\n\n').trim(),
      };
    },
    [concepts],
  );

  return {
    isReady: !!concepts?.length,
    isLoading,
    error,
    findAnswer,
  };
}
