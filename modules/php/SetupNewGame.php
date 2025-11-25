<?php

namespace Bga\Games\ScreamPark;

use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\States\ChooseTheme;

trait SetupNewGame
{
    public function newGame(array $players, array $options = []): string
    {
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $playerId => $player) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $playerId,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        $this->DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();

        $Vips = new Vips($this);
        $Vips->setup();

        $Scenes = new Scenes($this);
        $Scenes->setup();

        $Themes = new Themes($this);
        $Themes->setup();

        $this->staffCounter->initDb(array_keys($players), 2);
        $this->staffCounterPrivate->initDb(array_keys($players), 2);
        $this->draftCounter->initDb(array_keys($players));
        $this->attachmentVariable->initDb(array_keys($players));
        $this->dayCounter->initDb(1);

        return ChooseTheme::class;
    }
}
