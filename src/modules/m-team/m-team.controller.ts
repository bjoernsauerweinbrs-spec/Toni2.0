// toni/src/modules/m-team/m-team.controller.ts

import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

export const MTeamController = {
  listPlayers(): Player[] {
    return PlayerService.list();
  },

  getPlayer(id: string): Player | undefined {
    return PlayerService.get(id);
  },

  createPlayer(data: Partial<Player>): Player {
    return PlayerService.create(data);
  },

  updatePlayer(id: string, patch: Partial<Player>): Player | undefined {
    return PlayerService.update(id, patch);
  },

  deletePlayer(id: string): boolean {
    return PlayerService.remove(id);
  }
};
