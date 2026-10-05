export type Item = { id: string; text: string; selected: boolean };
export type Draw = { n: number; itemIds: string[]; at: number };
export type List = {
  id: string;
  name: string;
  items: Item[];
  pickCount: number;
  drawCounter: number;
  draws: Draw[];
  createdAt: number;
};
export const HISTORY_SIZE = 7;
