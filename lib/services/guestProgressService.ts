const GUEST_GAMES_KEY = "alphi-guest-games";
const GUEST_STATS_KEY = "alphi-guest-stats";

export interface GuestGameRound {
  poemId: string;
  verse: string;
  score: number;
  time: number;
  remainingLives: number;
  playedAt: string;
}

export interface GuestGameStats {
  totalGamesPlayed: number;
  totalTimePlayed: number;
  averageScore: number;
  bestScore: number;
  poemsCompleted: string[];
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage value for "${key}"`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to store value for "${key}"`, error);
  }
}

function computeStats(rounds: GuestGameRound[]): GuestGameStats {
  if (rounds.length === 0) {
    return {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      averageScore: 0,
      bestScore: 0,
      poemsCompleted: [],
    };
  }

  const totalGamesPlayed = rounds.length;
  const totalTimePlayed = rounds.reduce((sum, round) => sum + round.time, 0);
  const bestScore = rounds.reduce(
    (maxScore, round) => Math.max(maxScore, round.score),
    0,
  );
  const averageScore = Math.round(
    (rounds.reduce((sum, round) => sum + round.score, 0) / totalGamesPlayed) * 100,
  ) / 100;
  const poemsCompleted = Array.from(new Set(rounds.map((round) => round.poemId)));

  return {
    totalGamesPlayed,
    totalTimePlayed,
    averageScore,
    bestScore,
    poemsCompleted,
  };
}

export class GuestProgressService {
  static saveRound(round: Omit<GuestGameRound, "playedAt">) {
    const existingRounds = readStorage<GuestGameRound[]>(GUEST_GAMES_KEY, []);
    const newRound: GuestGameRound = {
      ...round,
      playedAt: new Date().toISOString(),
    };
    const updatedRounds = [...existingRounds, newRound];
    writeStorage(GUEST_GAMES_KEY, updatedRounds);

    const stats = computeStats(updatedRounds);
    writeStorage(GUEST_STATS_KEY, stats);
  }

  static getRounds(): GuestGameRound[] {
    return readStorage<GuestGameRound[]>(GUEST_GAMES_KEY, []);
  }

  static getStats(): GuestGameStats {
    return readStorage<GuestGameStats>(
      GUEST_STATS_KEY,
      computeStats(this.getRounds()),
    );
  }

  static clearAll(): GuestGameStats {
    const emptyRounds: GuestGameRound[] = [];
    writeStorage(GUEST_GAMES_KEY, emptyRounds);
    const emptyStats = computeStats(emptyRounds);
    writeStorage(GUEST_STATS_KEY, emptyStats);
    return emptyStats;
  }
}
