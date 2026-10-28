import type { Holding, Piece } from "@/views/Depot/utils";

export type WriteoffSource = { kind: "depot" } | { kind: "piece"; piece: Piece } | { kind: "holding"; holding: Holding };
