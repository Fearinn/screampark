<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;
use BgaVisibleSystemException;

class AttachScene extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $draftCounter;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 51,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must play or discard 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} must attach ${scene_label} to other scene'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
    }

    public function getArgs(int $playerId): array
    {
        $maxSlot = $this->scenes->getMaxSlot($playerId);
        $auto = $maxSlot === 1;

        $args = [
            "cardId" => $this->globals->get(gAttaching),
            "maxSlot" => $maxSlot,
            "auto" => $auto,
            "_no_notify" => $auto,
        ];

        return $args;
    }

    public function onEnteringState(int $currentPlayerId): void
    {
        $args = $this->getArgs($currentPlayerId);

        if ($args["auto"]) {
            $this->actAttachScene($currentPlayerId, 1, $args);
        }
    }

    #[PossibleAction]
    public function actAttachScene(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 24)] int $slot,
        array $args,
    ) {
        $cardId = $this->globals->get(gAttaching);
        $Scene = new Scene($this->game, $cardId);

        if ($args["maxSlot"] < $slot) {
            throw new \BgaVisibleSystemException("Unexpected error: 5");
        }

        $Scene->attach($currentPlayerId, $slot);
        $this->draftCounter->inc($currentPlayerId, 1);
        $this->globals->set(gAttaching, null);

        if ($this->draftCounter->get($currentPlayerId) === 2) {
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void {}
}
