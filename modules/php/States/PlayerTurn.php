<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PlayerTurn extends GameState
{
    protected Scenes $scenes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 4,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            description: clienttranslate('Other player(s) must play or discard 2 Scenes'),
            descriptionMyTurn: clienttranslate('${you} must play or discard 2 Scenes'),
        );

        $this->scenes = new Scenes($this->game);
    }

    public function getArgs(): array
    {
        $args = [
            "_private" => [],
        ];

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $args["_private"][$playerId] = [
                "playableScenes" => [],
                "attachableScenes" => [],
            ];
        }
        return $args;
    }

    public function onEnteringState(): void
    {
        $this->gamestate->setAllPlayersMultiactive();
    }

    #[PossibleAction]
    public function actPlayScene(int $currentPlayerId, #[IntParam(min: 1, max: 120)] int $cardId): void {}

    public function zombie(int $playerId, array $args): void {}
}
