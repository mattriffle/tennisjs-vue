// Player position in doubles
export type PlayerPosition = "A" | "B";
export type TeamNumber = 1 | 2;
export type PlayerNum = 1 | 2;

// New unified API interfaces based on tennisjs v2.2+
export interface UnifiedPlayerStats {
  pointsWon: number;
  pointsPlayed: number;
  serving: {
    aces: number;
    doubleFaults: number;
    serviceWinners: number;
    firstServePercentage?: number;
  };
  returning: {
    returnWinners: number;
    breakPointsWon: number;
    breakPointsPlayed: number;
  };
  rally: {
    winners: number;
    unforcedErrors: number;
  };
}

// Legacy player statistics interface (for backward compatibility)
export interface PlayerStats {
  ace: number;
  double_fault: number;
  service_winner: number;
  return_winner: number;
  winner: number;
  unforced_error: number;
  break_point_won: number;
  break_point_played: number;
  points_won: number;
  points_played: number;
}

// Unified match summary structure
export interface UnifiedMatchSummary {
  meta: {
    matchType: "singles" | "doubles" | "mixed-doubles";
    status:
      | "not-started"
      | "in-progress"
      | "completed"
      | "retired"
      | "walkover";
    format: {
      sets: number;
      tiebreakAt: number;
      finalSetTiebreak: boolean;
    };
  };
  score: {
    sets: number[];
    games: number[];
    points: {
      values: (string | number)[];
      type: "game" | "tiebreak";
    };
    server: {
      current: string | null;
      rotation?: string[];
    };
    winner?: 1 | 2 | null;
  };
  participants: {
    1: {
      info: {
        name: string;
        type: "player" | "team";
        players?: {
          a: { id: string; name: string };
          b: { id: string; name: string };
        };
      };
      stats: {
        serving: {
          aces: number;
          doubleFaults: number;
          serviceWinners: number;
        };
        returning: {
          returnWinners: number;
          breakPointsWon: number;
          breakPointsPlayed: number;
        };
        rally: {
          winners: number;
          unforcedErrors: number;
        };
        pointsWon: number;
        pointsPlayed: number;
        playerStats?: Record<string, UnifiedPlayerStats>;
      };
    };
    2: {
      info: {
        name: string;
        type: "player" | "team";
        players?: {
          a: { id: string; name: string };
          b: { id: string; name: string };
        };
      };
      stats: {
        serving: {
          aces: number;
          doubleFaults: number;
          serviceWinners: number;
        };
        returning: {
          returnWinners: number;
          breakPointsWon: number;
          breakPointsPlayed: number;
        };
        rally: {
          winners: number;
          unforcedErrors: number;
        };
        pointsWon: number;
        pointsPlayed: number;
        playerStats?: Record<string, UnifiedPlayerStats>;
      };
    };
  };
  matchScore: string;
  setHistory: any[];
}

// Legacy interfaces (for backward compatibility)
export interface PlayerScore {
  sets: number;
  games: number;
  points: string;
  stats: PlayerStats;
}

export interface DoublesPlayer {
  name: string;
  stats: PlayerStats;
}

export interface DoublesTeam {
  sets: number;
  games: number;
  points: string;
  players: {
    A: DoublesPlayer;
    B: DoublesPlayer;
  };
}

// Type guards
export function isDoublesMatch(summary: any): boolean {
  return summary?.meta?.matchType === "doubles";
}

export function isSinglesMatch(summary: any): boolean {
  return summary?.meta?.matchType === "singles" || !summary?.meta?.matchType;
}

// Legacy match summary interface (for backward compatibility)
export interface MatchSummary {
  meta: {
    type: "Game" | "Tiebreak";
    matchType?: "singles" | "doubles";
    tiebreakActive: boolean;
    server?: PlayerNum;
    receiver?: PlayerNum;
    player?: { [key: number]: string };
    currentServer?: { team: number; position: "A" | "B" };
    numSets: number;
  };
  player1?: PlayerScore;
  player2?: PlayerScore;
  team1?: DoublesTeam;
  team2?: DoublesTeam;
  winner?: 1 | 2;
  matchScore?: string;
}

// Union type for both old and new APIs
export type MatchSummaryUnion = MatchSummary | UnifiedMatchSummary;

// Check if using new unified API
export function isUnifiedMatchSummary(
  summary: any
): summary is UnifiedMatchSummary {
  return summary?.participants && summary?.score?.server?.current !== undefined;
}

// Check if using legacy API
export function isLegacyMatchSummary(summary: any): summary is MatchSummary {
  return summary?.meta?.type && !summary?.participants;
}

// Game data interfaces for starting new games
export interface SinglesGameData {
  matchType: "singles";
  player1: string;
  player2: string;
  selectedSets: number;
}

export interface DoublesGameData {
  matchType: "doubles";
  team1: [string, string];
  team2: [string, string];
  selectedSets: number;
}

export type GameData = SinglesGameData | DoublesGameData;

// Scoring event interfaces
export interface DoublesScoreEvent {
  team: TeamNumber;
  player: PlayerPosition;
  outcome: any; // PointOutcomes from tennisjs
}
