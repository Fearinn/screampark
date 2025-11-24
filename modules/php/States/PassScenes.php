<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PassScenes extends GameState
{
    protected Scenes $scenes;
    protected array $SCENES;
    protected PlayerCounter $draftCounter;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 7,
            type: StateType::GAME,
            description: clienttranslate('Passing scene cards...'),
            initialPrivate: 51,
        );

        $this->scenes = new Scenes($this->game);
        $this->SCENES = $this->game->SCENES;
        $this->draftCounter = $this->game->draftCounter;
    }

    public function onEnteringState(): string
    {
        $this->draftCounter->setAll(0);
        return PreTurn::class;
    }
}
