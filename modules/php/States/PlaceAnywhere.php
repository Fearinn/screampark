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

class PlaceAnywhere extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $draftCounter;
    protected PlayerCounter $actionVariable;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 53,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must draft 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} may place ${sceneLabel} before other scene'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
        $this->actionVariable = $this->game->actionVariable;
    }

    public function getArgs(int $playerId): array
    {
        $cardId = $this->actionVariable->get($playerId);
        $Scene = new Scene($this->game, $cardId);
        $possibleSlots = $Scene->possibleAnywhereSlots($playerId);

        $args = [
            "possibleSlots" => $possibleSlots,
            "cardId" => $cardId,
            "sceneLabel" => $Scene->downLabel,
            "cardToPlace" => $Scene->card,
        ];

        return $args;
    }

    public function onEnteringState(int $currentPlayerId): void {}

    #[PossibleAction]
    public function actPlaceAnywhere(
        int $currentPlayerId,
        array $args,
        #[IntParam(min: 1, max: 24)] int $slot,
    ) {
        $possibleSlots = $args["possibleSlots"];
        if (!in_array($slot, $possibleSlots)) {
            throw new \BgaVisibleSystemException("Unexpected error: 7");
        }

        $cardId = $this->actionVariable->get($currentPlayerId);
        $Scene = new Scene($this->game, $cardId);

        $this->placeAnywhere($currentPlayerId, $Scene, $slot);
    }

    public function placeAnywhere(int $currentPlayerId, Scene $Scene, int $slot): void
    {
        $Scene->placeAnywhere($currentPlayerId, $slot);

        $this->draftCounter->inc($currentPlayerId, 1);
        $this->actionVariable->set($currentPlayerId, 0);

        if ($this->draftCounter->get($currentPlayerId) === 2) {
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    #[PossibleAction]
    public function actPlaceAnywhereCancel(int $currentPlayerId): void
    {
        $this->actionVariable->set($currentPlayerId, 0);
        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void
    {
        $maxSlot = $args["maxSlot"];
        $slot = bga_rand(1, $maxSlot);
        $this->actPlaceAnywhere($playerId, $args, $slot);
    }
}
