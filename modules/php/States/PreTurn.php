<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;

use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PreTurn extends GameState
{
    protected Scenes $scenes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 5,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            description: clienttranslate('Other player(s) must play or discard 2 scene cards'),
            initialPrivate: PlayerTurn::class,
        );
    }

    public function onEnteringState(): void
    {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();
    }

    public function zombie(int $playerId, array $args): void {}
}
