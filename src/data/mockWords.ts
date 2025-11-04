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

export const mockWords: Word[] = [
  {
    id: "1",
    nzebi_word: "Mbolo",
    french_word: "yawel",
    part_of_speech: "grand hommes",
    example_nzebi: "Mbolo, comment vas-tu ?",
    example_french: "Bonjour, comment vas-tu ?",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "",
    synonyms: "Salut",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "2",
    nzebi_word: "Nzambi",
    french_word: "Dieu",
    part_of_speech: "nom",
    example_nzebi: "Nzambi est grand",
    example_french: "Dieu est grand",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "",
    synonyms: "",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "3",
    nzebi_word: "Mwana",
    french_word: "Enfant",
    part_of_speech: "nom",
    example_nzebi: "Le mwana joue dehors",
    example_french: "L'enfant joue dehors",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "Bana",
    synonyms: "",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "4",
    nzebi_word: "Ndako",
    french_word: "Maison",
    part_of_speech: "nom",
    example_nzebi: "Je rentre à la ndako",
    example_french: "Je rentre à la maison",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "Mindako",
    synonyms: "",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "5",
    nzebi_word: "Lola",
    french_word: "Parler",
    part_of_speech: "verbe",
    example_nzebi: "Il sait lola en Inzébi",
    example_french: "Il sait parler en Inzébi",
    pronunciation_url: "",
    is_verb: "true",
    plural_form: "",
    synonyms: "",
    scientific_name: "",
    imperative: "Lola!"
  },
  {
    id: "6",
    nzebi_word: "Dibuka",
    french_word: "Nourriture",
    part_of_speech: "nom",
    example_nzebi: "La dibuka est prête",
    example_french: "La nourriture est prête",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "",
    synonyms: "Aliment",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "7",
    nzebi_word: "Maza",
    french_word: "Eau",
    part_of_speech: "nom",
    example_nzebi: "Je bois du maza",
    example_french: "Je bois de l'eau",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "",
    synonyms: "",
    scientific_name: "",
    imperative: ""
  },
  {
    id: "8",
    nzebi_word: "Ngonda",
    french_word: "Lune",
    part_of_speech: "nom",
    example_nzebi: "La ngonda est belle ce soir",
    example_french: "La lune est belle ce soir",
    pronunciation_url: "",
    is_verb: "false",
    plural_form: "",
    synonyms: "",
    scientific_name: "",
    imperative: ""
  }
];
