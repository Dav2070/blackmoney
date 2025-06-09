import { Selectables } from "./selectables.model";


export interface Time {
  id: number;
  days: string[];
  opened: string;
  lunchStartSelected: number;
  lunchEndSelected: number;
  dinnerStartSelected: number;
  dinnerEndSelected: number;
  lunchStart: Selectables[];
  lunchEnd: Selectables[];
  dinnerStart: Selectables[];
  dinnerEnd: Selectables[];
  lunchStartLabel: string;
  lunchEndLabel: string;
  dinnerStartLabel: string;
  dinnerEndLabel: string;
}
