// toni/src/services/database.ts

import { Player } from '../models/player.model';

export class InMemoryDatabase {
  private players: Map<string, Player> = new Map();

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.get(id);
  }

  createPlayer(player: Player): Player {
    this.players.set(player.id, player);
    return player;
  }

  updatePlayer(id: string, patch: Partial<Player>): Player | undefined {
    const existing = this.players.get(id);
    if (!existing) return undefined;

    const updated: Player = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    this.players.set(id, updated);
    return updated;
  }

  deletePlayer(id: string): boolean {
    return this.players.delete(id);
  }

  seedPlayers(players: Player[]): void {
    players.forEach(p => this.players.set(p.id, p));
  }
}

export const db = new InMemoryDatabase();
