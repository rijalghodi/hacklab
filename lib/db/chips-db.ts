import Dexie, { Table } from "dexie";

import { INDEXDB_NAME } from "@/lib/constants/names";
import { CircuitChip } from "@/lib/types/chips";
// Database version of CircuitChip without definitions to avoid circular refs
export type CircuitChipDB = Omit<CircuitChip, "definitions" | "id">;

export class ChipsDatabase extends Dexie {
  savedChips!: Table<CircuitChipDB>;

  constructor() {
    super(INDEXDB_NAME);
    this.version(1).stores({
      // Use chipType as the primary key, and name as an additional index (no id)
      // "&chipType" means chipType is the primary key, "&name" for unique name index
      savedChips: "&chipType,&name",
    });
  }
}

export const chipsDb = new ChipsDatabase();
