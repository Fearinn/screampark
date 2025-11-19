<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;
use BgaUserException;

class PlayerTurn extends GameState
{
    protected Scenes $scenes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 50,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must play or discard 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} must play or discard 2 scene cards'),
        );

        $this->scenes = new Scenes($this->game);
    }

    public function getArgs(int $playerId): array
    {
        $args = [
            "playableScenes" => $this->scenes->getPlayable($playerId),
            "attachableScenes" => [],
        ];

        return $args;
    }

    public function onEnteringState(): void {}

    #[PossibleAction]
    public function actPlayScene(
        int $currentPlayerId,
        array $args,
        #[IntParam(min: 1, max: 120)] int $cardId
    ): void {
        $playableScenes = $args["playableScenes"];

        if (!in_array($cardId, $playableScenes)) {
            throw new BgaUserException(clienttranslate("You can't play that card as a new scene"));
        }

        $Scene = new Scene($this->game, $cardId);
        $card = $Scene->play($currentPlayerId);

        $this->notify->player(
            $currentPlayerId,
            "playScene",
            "",
            [
                "card" => $card,
            ]
        );

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void {}
}
