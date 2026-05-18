import wordsData from "./mockWords.json";

export interface Word {
  id: string;
  nzebi_word: string;
  french_word: string;
  part_of_speech: string;
  example_nzebi: string;
  example_french: string;
  pronunciation_url: string;
  is_verb: string;
  plural_form: string;
  synonyms: string;
  scientific_name: string;
  imperative: string;
}

const toText = (value: unknown): string => (value == null ? "" : String(value));

export const mockWords: Word[] = Array.isArray(wordsData)
  ? wordsData.map((word, index) => {
      const item = word && typeof word === "object" ? (word as Record<string, unknown>) : {};

      return {
        id: toText(item.id) || `word-${index}`,
        nzebi_word: toText(item.nzebi_word),
        french_word: toText(item.french_word),
        part_of_speech: toText(item.part_of_speech),
        example_nzebi: toText(item.example_nzebi),
        example_french: toText(item.example_french),
        pronunciation_url: toText(item.pronunciation_url),
        is_verb: toText(item.is_verb),
        plural_form: toText(item.plural_form),
        synonyms: toText(item.synonyms),
        scientific_name: toText(item.scientific_name),
        imperative: toText(item.imperative),
      };
    })
  : [];
