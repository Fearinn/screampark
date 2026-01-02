<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\StateType;

use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PreTurn extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $staffCounter;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 5,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            description: clienttranslate('Other player(s) must draft 2 scene cards'),
            initialPrivate: PlayerTurn::class,
            updateGameProgression: true,
        );

        $this->scenes = new Scenes($this->game);
    }

    public function onEnteringState(): void
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $this->storeUndo($playerId);
            $this->game->giveExtraTime($playerId);
        }

        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->initializePrivateStateForAllActivePlayers();
    }

    #[PossibleAction]
    #[CheckAction(false)]
    public function actResetTurn(int $currentPlayerId): void
    {
        $PlayerTurn = new PlayerTurn($this->game);
        $PlayerTurn->actResetTurn($currentPlayerId);
    }

    private function storeUndo(int $playerId): void
    {
        $staff = $this->game->staffCounter->get($playerId);
        $ability = $this->scenes->countAbilities($playerId, true);

        $scenicCounts = $this->scenes->countScenics($playerId, true);
        $candelabra = $scenicCounts[1];
        $lightbulb = $scenicCounts[2];
        $audio = $scenicCounts[3];
        $skull = $scenicCounts[4];

        $sql = "UPDATE player SET staff={$staff}, ability={$ability}, 
            candelabra={$candelabra}, lightbulb={$lightbulb}, audio={$audio}, skull={$skull}
            WHERE player_id={$playerId}";
        $this->game->DbQuery($sql);
    }

    public function zombie(int $playerId, array $args): void {}
}
