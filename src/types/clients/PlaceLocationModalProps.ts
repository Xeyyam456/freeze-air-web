import type { Place } from "./Place";
import type { PlaceLocationState } from "./PlaceLocationState";

export type PlaceLocationModalProps = { place: Place; loc: PlaceLocationState; onClose: () => void };
