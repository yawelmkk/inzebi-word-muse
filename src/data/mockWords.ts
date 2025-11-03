export interface Word {
  id: string;
  word: string;
  translation: string;
  type: string;
  definition: string;
  examples: string[];
  pronunciation?: string;
}

export const mockWords: Word[] = [
  {
    id: "1",
    word: "Mbolo",
    translation: "Bonjour",
    type: "salutation",
    definition: "Salutation utilisée pour souhaiter la bienvenue ou saluer quelqu'un",
    examples: [
      "Mbolo, comment vas-tu ?",
      "Je dis mbolo à mes amis chaque matin"
    ],
    pronunciation: "m-bo-lo"
  },
  {
    id: "2",
    word: "Nzambi",
    translation: "Dieu",
    type: "nom",
    definition: "Être suprême, créateur de toutes choses dans la cosmologie Inzébi",
    examples: [
      "Nzambi est grand",
      "Nous prions Nzambi"
    ],
    pronunciation: "n-zam-bi"
  },
  {
    id: "3",
    word: "Mwana",
    translation: "Enfant",
    type: "nom",
    definition: "Jeune personne, garçon ou fille",
    examples: [
      "Le mwana joue dehors",
      "C'est mon mwana"
    ],
    pronunciation: "mwa-na"
  },
  {
    id: "4",
    word: "Ndako",
    translation: "Maison",
    type: "nom",
    definition: "Habitation, lieu de résidence",
    examples: [
      "Je rentre à la ndako",
      "Notre ndako est grande"
    ],
    pronunciation: "n-da-ko"
  },
  {
    id: "5",
    word: "Lola",
    translation: "Parler",
    type: "verbe",
    definition: "Communiquer par la parole, s'exprimer",
    examples: [
      "Il sait lola en Inzébi",
      "Nous allons lola ensemble"
    ],
    pronunciation: "lo-la"
  },
  {
    id: "6",
    word: "Dibuka",
    translation: "Nourriture",
    type: "nom",
    definition: "Aliment, ce qui se mange",
    examples: [
      "La dibuka est prête",
      "J'aime cette dibuka"
    ],
    pronunciation: "di-bu-ka"
  },
  {
    id: "7",
    word: "Maza",
    translation: "Eau",
    type: "nom",
    definition: "Liquide transparent et inodore, essentiel à la vie",
    examples: [
      "Je bois du maza",
      "Le maza est frais"
    ],
    pronunciation: "ma-za"
  },
  {
    id: "8",
    word: "Ngonda",
    translation: "Lune",
    type: "nom",
    definition: "Satellite naturel de la Terre, visible la nuit",
    examples: [
      "La ngonda est belle ce soir",
      "Regarder la ngonda"
    ],
    pronunciation: "n-gon-da"
  }
];
