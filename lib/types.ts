export type Icon = { type: "emoji" | "image"; value: string };
export type Item = { id: string; text: string; selected: boolean; icon?: Icon };
export type Draw = { n: number; itemIds: string[]; at: number };
export type List = {
  id: string;
  name: string;
  items: Item[];
  pickCount: number;
  drawCounter: number;
  draws: Draw[];
  createdAt: number;
  icon?: Icon;
};
export const HISTORY_SIZE = 7;
