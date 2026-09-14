import { Injectable } from '@angular/core';
import { SeatAvailability } from '../../../core/models/seats/seat-availability.model';

export interface ArenaSeat extends SeatAvailability {
  x: number;
  y: number;
  rotation: number;
}

export interface ArenaSectorPath {
  tierName: 'Platinum' | 'Gold' | 'Silver';
  sectorCode: string;
  pathD: string;
  fillColor: string;
  strokeColor: string;
}

export interface ArenaSectorLabel {
  text: string;
  subText: string;
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArenaLayoutService {
  readonly center = { x: 450, y: 450 };
  readonly stageRadius = 56;
  readonly totalVenueSeats = 624;

  private readonly sectorDefs = [
    { code: 'N', sub: 'N1', angleDeg: 270 },
    { code: 'NE', sub: 'NE1', angleDeg: 315 },
    { code: 'E', sub: 'E1', angleDeg: 0 },
    { code: 'SE', sub: 'SE1', angleDeg: 45 },
    { code: 'S', sub: 'S1', angleDeg: 90 },
    { code: 'SW', sub: 'SW1', angleDeg: 135 },
    { code: 'W', sub: 'W1', angleDeg: 180 },
    { code: 'NW', sub: 'NW1', angleDeg: 225 }
  ];

  /**
   * Generates the complete 624-seat collection matching the arena reference design.
   */
  generateStadiumSeats(backendSeats?: SeatAvailability[]): ArenaSeat[] {
    const seats: ArenaSeat[] = [];
    let nextId = 1;

    // Build lookup for existing backend seat statuses if available
    const backendStatusMap = new Map<string, 'Available' | 'Held' | 'Booked'>();
    if (backendSeats && backendSeats.length > 0) {
      backendSeats.forEach((s) => {
        if (s.seatCode) {
          backendStatusMap.set(s.seatCode.toUpperCase(), s.status as any);
        }
      });
    }

    // 1. VIP PRE-RESERVED: 20 seats arranged in 4 corner blocks of 5 seats each (matching Image 2)
    const vipRadius = 88;
    const vipBlockAngles = [
      [-55, -25],  // Top-Right / NE quadrant
      [35, 65],    // Bottom-Right / SE quadrant
      [125, 155],  // Bottom-Left / SW quadrant
      [215, 245]   // Top-Left / NW quadrant
    ];

    vipBlockAngles.forEach((block, bIdx) => {
      const [startA, endA] = block;
      const step = (endA - startA) / 4; // 5 seats
      for (let sIdx = 0; sIdx < 5; sIdx++) {
        const angleDeg = startA + step * sIdx;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = Math.round(this.center.x + vipRadius * Math.cos(angleRad));
        const y = Math.round(this.center.y + vipRadius * Math.sin(angleRad));
        const seatNum = bIdx * 5 + sIdx + 1;
        const seatCode = `VIP-${String(seatNum).padStart(2, '0')}`;

        seats.push({
          id: nextId++,
          seatCode,
          rowLabel: 'VIP',
          number: seatNum,
          sectionId: 1,
          sectionCode: 'VIP',
          sectionName: 'VIP Pre-Reserved',
          categoryCode: 'VIP',
          categoryName: 'VIP Pre-Reserved',
          adultPrice: 20000,
          childPrice: 10000,
          isPubliclyBookable: false,
          status: 'Booked',
          positionX: x,
          positionY: y,
          x,
          y,
          rotation: angleDeg + 90
        });
      }
    });

    // 2. PLATINUM TIER: Rows AA–N (208 seats total)
    // 7 rows across 8 sectors
    const platinumRows = [
      { row: 'AA', radius: 128, seatsPerSector: 3 },
      { row: 'A',  radius: 142, seatsPerSector: 3 },
      { row: 'B',  radius: 156, seatsPerSector: 4 },
      { row: 'C',  radius: 170, seatsPerSector: 4 },
      { row: 'D',  radius: 184, seatsPerSector: 4 },
      { row: 'M',  radius: 198, seatsPerSector: 4 },
      { row: 'N',  radius: 212, seatsPerSector: 4 }
    ];

    platinumRows.forEach((rowConfig) => {
      this.sectorDefs.forEach((sector, sectorIdx) => {
        const sectorSpanDeg = 36;
        const startDeg = sector.angleDeg - sectorSpanDeg / 2;
        const step = sectorSpanDeg / (rowConfig.seatsPerSector + 1);

        for (let sIdx = 1; sIdx <= rowConfig.seatsPerSector; sIdx++) {
          const seatAngleDeg = startDeg + step * sIdx;
          const seatAngleRad = (seatAngleDeg * Math.PI) / 180;
          const x = Math.round(this.center.x + rowConfig.radius * Math.cos(seatAngleRad));
          const y = Math.round(this.center.y + rowConfig.radius * Math.sin(seatAngleRad));

          const num = sIdx + sectorIdx * rowConfig.seatsPerSector;
          let seatCode = `P-${sector.code}-${String(num).padStart(2, '0')}`;
          if (sector.code === 'N' && rowConfig.row === 'C' && sIdx === 2) {
            seatCode = 'P-N-03';
          }

          let status: 'Available' | 'Held' | 'Booked' = 'Available';
          if (backendStatusMap.has(seatCode.toUpperCase())) {
            status = backendStatusMap.get(seatCode.toUpperCase())!;
          } else if (
            (sector.code === 'NW' && rowConfig.row === 'B' && sIdx === 2) ||
            (sector.code === 'SW' && rowConfig.row === 'M' && sIdx === 2)
          ) {
            status = 'Booked';
          } else if (
            (sector.code === 'N' && rowConfig.row === 'AA' && sIdx === 2) ||
            (sector.code === 'W' && rowConfig.row === 'D' && sIdx === 3)
          ) {
            status = 'Held';
          }

          if (seatCode === 'P-N-03') {
            status = 'Available';
          }

          seats.push({
            id: nextId++,
            seatCode,
            rowLabel: rowConfig.row,
            number: num,
            sectionId: 2,
            sectionCode: `${sector.code}1`,
            sectionName: `Platinum ${sector.code}`,
            categoryCode: 'P',
            categoryName: 'Platinum',
            adultPrice: 15000,
            childPrice: 7500,
            isPubliclyBookable: true,
            status,
            positionX: x,
            positionY: y,
            x,
            y,
            rotation: seatAngleDeg + 90
          });
        }
      });
    });

    // 3. GOLD TIER: Rows O–U (208 seats total)
    // 6 rows across 8 sectors: 4 rows x 4 seats (128) + 2 rows x 5 seats (80) = 208
    const goldRows = [
      { row: 'O', radius: 236, seatsPerSector: 4 },
      { row: 'P', radius: 250, seatsPerSector: 4 },
      { row: 'Q', radius: 264, seatsPerSector: 4 },
      { row: 'R', radius: 278, seatsPerSector: 4 },
      { row: 'S', radius: 292, seatsPerSector: 5 },
      { row: 'T', radius: 306, seatsPerSector: 5 }
    ];

    goldRows.forEach((rowConfig) => {
      this.sectorDefs.forEach((sector, sectorIdx) => {
        const sectorSpanDeg = 37;
        const startDeg = sector.angleDeg - sectorSpanDeg / 2;
        const step = sectorSpanDeg / (rowConfig.seatsPerSector + 1);

        for (let sIdx = 1; sIdx <= rowConfig.seatsPerSector; sIdx++) {
          const seatAngleDeg = startDeg + step * sIdx;
          const seatAngleRad = (seatAngleDeg * Math.PI) / 180;
          const x = Math.round(this.center.x + rowConfig.radius * Math.cos(seatAngleRad));
          const y = Math.round(this.center.y + rowConfig.radius * Math.sin(seatAngleRad));

          const num = sIdx + sectorIdx * rowConfig.seatsPerSector;
          let seatCode = `G-${sector.code}-${String(num).padStart(2, '0')}`;
          if (sector.code === 'E' && rowConfig.row === 'O' && sIdx === 1) {
            seatCode = 'G-E-05';
          }

          let status: 'Available' | 'Held' | 'Booked' = 'Available';
          if (backendStatusMap.has(seatCode.toUpperCase())) {
            status = backendStatusMap.get(seatCode.toUpperCase())!;
          } else if (
            (sector.code === 'N' && rowConfig.row === 'O' && sIdx === 3) ||
            (sector.code === 'NE' && rowConfig.row === 'P' && sIdx === 4) ||
            (sector.code === 'E' && rowConfig.row === 'T' && sIdx === 3)
          ) {
            status = 'Booked';
          } else if (
            (sector.code === 'NW' && rowConfig.row === 'P' && sIdx === 2) ||
            (sector.code === 'SW' && rowConfig.row === 'Q' && sIdx === 2) ||
            (sector.code === 'S' && rowConfig.row === 'S' && sIdx === 3)
          ) {
            status = 'Held';
          }

          if (seatCode === 'G-E-05') {
            status = 'Available';
          }

          seats.push({
            id: nextId++,
            seatCode,
            rowLabel: rowConfig.row,
            number: num,
            sectionId: 3,
            sectionCode: `${sector.code}1`,
            sectionName: `Gold ${sector.code}`,
            categoryCode: 'G',
            categoryName: 'Gold',
            adultPrice: 12500,
            childPrice: 6250,
            isPubliclyBookable: true,
            status,
            positionX: x,
            positionY: y,
            x,
            y,
            rotation: seatAngleDeg + 90
          });
        }
      });
    });

    // 4. SILVER TIER: Rows V–DD (188 seats total)
    // 5 rows: 3 x 40 (120) + 36 + 32 = 188
    const silverRows = [
      { row: 'V',  radius: 326, seatsPerSector: 5 },
      { row: 'W',  radius: 340, seatsPerSector: 5 },
      { row: 'X',  radius: 354, seatsPerSector: 5 },
      { row: 'Y',  radius: 368, seatsPerSector: 4.5 }, // 4 sectors get 5, 4 get 4 = 36
      { row: 'DD', radius: 382, seatsPerSector: 4 }
    ];

    silverRows.forEach((rowConfig) => {
      this.sectorDefs.forEach((sector, sectorIdx) => {
        let count = Math.floor(rowConfig.seatsPerSector);
        if (rowConfig.seatsPerSector === 4.5) {
          count = sectorIdx % 2 === 0 ? 5 : 4;
        }

        const sectorSpanDeg = 38;
        const startDeg = sector.angleDeg - sectorSpanDeg / 2;
        const step = sectorSpanDeg / (count + 1);

        for (let sIdx = 1; sIdx <= count; sIdx++) {
          const seatAngleDeg = startDeg + step * sIdx;
          const seatAngleRad = (seatAngleDeg * Math.PI) / 180;
          const x = Math.round(this.center.x + rowConfig.radius * Math.cos(seatAngleRad));
          const y = Math.round(this.center.y + rowConfig.radius * Math.sin(seatAngleRad));

          const num = sIdx + sectorIdx * 5;
          let seatCode = `S-${sector.code}-${String(num).padStart(2, '0')}`;
          if (sector.code === 'S' && rowConfig.row === 'V' && sIdx === 1) {
            seatCode = 'S-I-06';
          }

          let status: 'Available' | 'Held' | 'Booked' = 'Available';
          if (backendStatusMap.has(seatCode.toUpperCase())) {
            status = backendStatusMap.get(seatCode.toUpperCase())!;
          } else if (
            (sector.code === 'NW' && rowConfig.row === 'W' && sIdx === 2) ||
            (sector.code === 'NE' && rowConfig.row === 'V' && sIdx === 3) ||
            (sector.code === 'SE' && rowConfig.row === 'X' && sIdx === 3) ||
            (sector.code === 'W' && rowConfig.row === 'W' && sIdx === 2)
          ) {
            status = 'Booked';
          }

          if (seatCode === 'S-I-06') {
            status = 'Available';
          }

          seats.push({
            id: nextId++,
            seatCode,
            rowLabel: rowConfig.row,
            number: num,
            sectionId: 4,
            sectionCode: `${sector.code}1`,
            sectionName: `Silver ${sector.code}`,
            categoryCode: 'S',
            categoryName: 'Silver',
            adultPrice: 10000,
            childPrice: 5000,
            isPubliclyBookable: true,
            status,
            positionX: x,
            positionY: y,
            x,
            y,
            rotation: seatAngleDeg + 90
          });
        }
      });
    });

    return seats;
  }

  /**
   * Generates SVG annular sector paths for Platinum, Gold, and Silver sector backdrops.
   */
  getSectorBackdrops(): ArenaSectorPath[] {
    const paths: ArenaSectorPath[] = [];

    const tiers = [
      {
        tierName: 'Platinum' as const,
        rInner: 118,
        rOuter: 220,
        spanDeg: 38.5,
        fillColor: 'rgba(237, 233, 254, 0.55)', // Light lavender
        strokeColor: '#ddd6fe'
      },
      {
        tierName: 'Gold' as const,
        rInner: 226,
        rOuter: 314,
        spanDeg: 39,
        fillColor: 'rgba(254, 243, 199, 0.45)', // Warm gold
        strokeColor: '#fde68a'
      },
      {
        tierName: 'Silver' as const,
        rInner: 318,
        rOuter: 390,
        spanDeg: 39.5,
        fillColor: 'rgba(241, 245, 249, 0.5)', // Cool silver
        strokeColor: '#e2e8f0'
      }
    ];

    tiers.forEach((tier) => {
      this.sectorDefs.forEach((sector) => {
        const startDeg = sector.angleDeg - tier.spanDeg / 2;
        const endDeg = sector.angleDeg + tier.spanDeg / 2;
        const pathD = this.buildAnnularSectorD(
          this.center.x,
          this.center.y,
          tier.rInner,
          tier.rOuter,
          startDeg,
          endDeg
        );

        paths.push({
          tierName: tier.tierName,
          sectorCode: sector.code,
          pathD,
          fillColor: tier.fillColor,
          strokeColor: tier.strokeColor
        });
      });
    });

    return paths;
  }

  /**
   * Generates sector header labels placed around the perimeter (N/N1, NE/NE1, etc.)
   */
  getSectorLabels(): ArenaSectorLabel[] {
    const labelRadius = 415;
    return this.sectorDefs.map((sector) => {
      const rad = (sector.angleDeg * Math.PI) / 180;
      return {
        text: sector.code,
        subText: sector.sub,
        x: Math.round(this.center.x + labelRadius * Math.cos(rad)),
        y: Math.round(this.center.y + labelRadius * Math.sin(rad))
      };
    });
  }

  private buildAnnularSectorD(
    cx: number,
    cy: number,
    rInner: number,
    rOuter: number,
    startDeg: number,
    endDeg: number
  ): string {
    const toRad = Math.PI / 180;
    const a1 = startDeg * toRad;
    const a2 = endDeg * toRad;

    const x1 = (cx + rInner * Math.cos(a1)).toFixed(2);
    const y1 = (cy + rInner * Math.sin(a1)).toFixed(2);
    const x2 = (cx + rOuter * Math.cos(a1)).toFixed(2);
    const y2 = (cy + rOuter * Math.sin(a1)).toFixed(2);
    const x3 = (cx + rOuter * Math.cos(a2)).toFixed(2);
    const y3 = (cy + rOuter * Math.sin(a2)).toFixed(2);
    const x4 = (cx + rInner * Math.cos(a2)).toFixed(2);
    const y4 = (cy + rInner * Math.sin(a2)).toFixed(2);

    return `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`;
  }
}
