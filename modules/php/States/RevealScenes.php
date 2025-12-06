<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Genre;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class RevealScenes extends GameState
{
    protected Scenes $scenes;
    protected array $SCENES;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 6,
            type: StateType::GAME,
            description: clienttranslate('Revealing scene cards...'),
        );

        $this->scenes = new Scenes($this->game);
        $this->SCENES = $this->game->SCENES;
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $this->scenes->revealDiscardedBoth($playerId);

            $sql = "SELECT {$this->scenes->cardFields} FROM {$this->scenes->dbTable} 
            WHERE draft>0 AND card_location_arg={$playerId} ORDER BY draft";
            $cards = $this->game->getCollectionFromDB($sql);

            foreach ($cards as $cardId => $card) {
                if ($card["type"] === "genre") {
                    $Genre = new Genre($this->game, $cardId);
                    $Genre->revealAttached($playerId);
                }

                $location = $card["location"];
                $Scene = new Scene($this->game, $cardId);

                if ($location === "discard") {
                    $Scene->revealDiscarded($playerId);
                }

                if ($location === "placed") {
                    $Scene->revealPlaced($playerId);
                }

                if ($location === "placedAnywhere") {
                    $Scene->revealPlacedAnywhere($playerId);
                }
            }

            for ($slot = 1; $slot <= 24; $slot++) {
                $Scene = $this->scenes->getMainInSlot($playerId, $slot);

                if (!$Scene) {
                    break;
                }

                $Scene->updateComplete($playerId);
            }
        }

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET draft=0 WHERE draft>0");
        return PassScenes::class;
    }
}
