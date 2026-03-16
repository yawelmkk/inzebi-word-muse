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

export const mockWords: Word[] = wordsData as Word[];
