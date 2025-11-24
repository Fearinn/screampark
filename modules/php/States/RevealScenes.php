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

    public function getArgs(): array
    {
        return [];
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $discardedCards = $this->scenes->deck->getCardsInLocation("discard", $playerId);

            foreach ($discardedCards as $cardId => $card) {
                $Scene =  new Scene($this->game, $cardId);
                $Scene->revealDiscarded($playerId);
            }

            $playedCards = $this->scenes->deck->getCardsInLocation("played", $playerId);
            foreach ($playedCards as $cardId => $card) {
                if ($card["type"] === "genre") {
                    $Genre = new Genre($this->game, $cardId);
                    $Genre->revealAttached($playerId);
                    continue;
                }
                $Scene = new Scene($this->game, $cardId);
                $Scene->revealPlayed($playerId);
            }
        }

        return PassScenes::class;
    }
}
