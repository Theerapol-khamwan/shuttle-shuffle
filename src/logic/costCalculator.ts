import { Player, Session } from '../store/usePlayerStore';

export interface CalculatedCostShare {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  excludeFromSplit: boolean;
  isPaid: boolean;
  share: number;
}

/**
 * Calculates the split cost for each player in a session based on the cost configuration.
 *
 * @param players List of players in the session
 * @param session Current session containing cost configuration
 * @returns An object mapping playerId to their calculated cost share (rounded to 2 decimal places)
 */
export function calculateSplits(players: Player[], session: Session): Record<string, number> {
  const courtHourlyRate = session.court_hourly_rate || 0;
  const hoursPlayed = session.hours_played || 0;
  const shuttleUnitPrice = session.shuttle_unit_price || 0;
  const shuttlesUsed = session.shuttles_used || 0;
  const splitMethod = session.cost_split_method || 'equal';

  const totalCourts = session.total_courts || 1;
  const courtCost = courtHourlyRate * hoursPlayed * totalCourts;
  const shuttleCost = shuttleUnitPrice * shuttlesUsed;
  const totalCost = Math.round((courtCost + shuttleCost) * 100) / 100;

  // Filter players included in the split
  const includedPlayers = players.filter(p => !p.exclude_from_split);

  if (includedPlayers.length === 0 || totalCost <= 0) {
    const result: Record<string, number> = {};
    players.forEach(p => {
      result[p.id] = 0;
    });
    return result;
  }

  const result: Record<string, number> = {};
  
  // Initialize all players (including excluded ones) with 0 share
  players.forEach(p => {
    result[p.id] = 0;
  });

  if (splitMethod === 'pro_rata') {
    // Pro-rata split: based on the games played by each player
    const totalGames = includedPlayers.reduce((sum, p) => sum + (p.games_played || 0), 0);

    // Fallback to equal split if total games of included players is 0
    if (totalGames === 0) {
      const equalShare = totalCost / includedPlayers.length;
      const roundedShare = Math.round(equalShare * 100) / 100;
      
      includedPlayers.forEach(p => {
        result[p.id] = roundedShare;
      });
    } else {
      includedPlayers.forEach(p => {
        const share = totalCost * ((p.games_played || 0) / totalGames);
        result[p.id] = Math.round(share * 100) / 100;
      });
    }
  } else {
    // Equal split: cost is split equally among all included players
    const equalShare = totalCost / includedPlayers.length;
    const roundedShare = Math.round(equalShare * 100) / 100;

    includedPlayers.forEach(p => {
      result[p.id] = roundedShare;
    });
  }

  // Adjust for rounding differences (ensure sum of shares equals totalCost exactly)
  const sumShares = includedPlayers.reduce((sum, p) => sum + (result[p.id] || 0), 0);
  const diff = Math.round((totalCost - sumShares) * 100) / 100;

  if (diff !== 0 && includedPlayers.length > 0) {
    // Sort included players by games_played desc, then by name to make it deterministic
    const sortedIncluded = [...includedPlayers].sort((a, b) => {
      if (b.games_played !== a.games_played) {
        return b.games_played - a.games_played;
      }
      return a.name.localeCompare(b.name);
    });

    const playerToAdjustId = sortedIncluded[0].id;
    result[playerToAdjustId] = Math.round(((result[playerToAdjustId] || 0) + diff) * 100) / 100;
  }

  return result;
}
