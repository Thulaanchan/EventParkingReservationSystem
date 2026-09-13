/**
 * Canonical typed model representing backend HTTP 409 conflict payload variants
 * from direct parking reservation endpoints and booking integration workflows.
 */
export interface ParkingConflictResponse {
  status?: number;
  code?: string;
  message: string;
  conflictingResourceIds?: number[];
  conflictingParkingSlotId?: number | null;
}
