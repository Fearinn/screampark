<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Genre;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class RevealScenes extends GameState
{
    protected Scenes $scenes;
    protected array $SCENES;
    protected Vips $vips;

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
        $this->vips = new Vips($this->game);
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
                    continue;
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

            $abilityCount = 0;
            $cards = $this->scenes->getBoard($playerId);

            foreach ($cards as $card) {
                if ($card["type"] === "genre") {
                    continue;
                }

                $cardId = (int) $card["id"];
                $Scene = new Scene($this->game, $cardId);

                if ($Scene->ability > 0) {
                    $abilityCount++;
                }
            }
            $this->game->abilityCounter->set($playerId, $abilityCount);

            $scenicsCounts = array_fill(1, 4, 0);
            $maxSlot = $this->scenes->getMaxSlot($playerId);

            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                $Scene = $this->scenes->getMainInSlot($playerId, $slot);
                $Scene->updateCompleted($playerId);
                $Scene->updateVipFulfilling($playerId);

                $slotScenics = [];

                $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);
                foreach ($Scenes as $Scene) {
                    $scenic = (int) $Scene->scenic;

                    if ($scenic > 0) {
                        if (!in_array($scenic, $slotScenics)) {
                            $slotScenics[] = $scenic;
                        }

                        $scenicsCounts[$scenic]++;
                    }
                }
            }

            $this->game->candelabraCounter->set($playerId, $scenicsCounts[1]);
            $this->game->lightbulbCounter->set($playerId, $scenicsCounts[2]);
            $this->game->audioCounter->set($playerId, $scenicsCounts[3]);
            $this->game->skullCounter->set($playerId, $scenicsCounts[4]);
        }

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET draft=0 WHERE draft>0");
        return PassScenes::class;
    }
}
