<?php

namespace Bga\Games\ScreamPark;

use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;
use Bga\Games\ScreamPark\States\PlayerTurn;

trait SetupNewGame
{
    public function newGame(Game $game, array $players, array $options = []): string
    {
        $gameinfos = $game->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        $game->DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $game->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $game->reloadPlayersBasicInfos();
        $game->activeNextPlayer();

        $Vips = new Vips($this);
        $Vips->setup();

        return PlayerTurn::class;
    }
}
