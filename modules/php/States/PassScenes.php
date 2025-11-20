<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PassScenes extends GameState
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
            descriptionMyTurn: clienttranslate('Revealing scene cards'),
        );

        $this->scenes = new Scenes($this->game);
        $this->SCENES = $this->game->SCENES;
    }

    public function onEnteringState(): void
    {
        $this->gamestate->setAllPlayersMultiactive();
    }

    public function zombie(): void {}
}
