<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\Game;
use Bga\Games\ScreamPark\components\themes\Themes;

class RevealThemes extends GameState
{
    protected Themes $themes;
    protected array $THEMES;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 3,
            type: StateType::GAME,
            description: clienttranslate('Revealing Themes...'),
        );

        $this->themes = new Themes($this->game);
        $this->THEMES = $this->game->THEMES;
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $sql = "SELECT card_id FROM {$this->themes->dbTable} WHERE card_location='hand' AND card_location_arg={$playerId}";
            $cardId = $this->game->getUniqueValueFromDB($sql);
            $this->themes->deck->moveCard($cardId, "board", $playerId);
            $card = $this->themes->deck->getCard($cardId);

            $themeId = (int) $card["type_arg"];

            $this->notify->all(
                "revealTheme",
                clienttranslate('${player_name} reveals his theme: ${theme_label}'),
                [
                    "i18n" => ["theme_label"],
                    "preserve" => ["themeId"],
                    "player_id" => $playerId,
                    "theme_label" => $this->THEMES[$themeId]["label"],
                    "themeId" => $themeId,
                    "card" => $card,
                ],
            );
        }

        return PlayerTurn::class;
    }
}
