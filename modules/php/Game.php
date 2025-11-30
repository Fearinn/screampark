<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * ScreamPark implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\ScreamPark;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\Components\Counters\TableCounter;
use Bga\GameFramework\Components\Deck;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Gamedatas;
use Bga\Games\ScreamPark\SetupNewGame;
use Bga\Games\ScreamPark\States\DayEnd;
use Bga\Games\ScreamPark\States\EndScore;

class Game extends \Bga\GameFramework\Table
{
    use Gamedatas;
    use SetupNewGame;
    use Notifs;

    public readonly array $VIPS;
    public readonly Deck $vip_cards;
    public readonly array $GENRES;
    public readonly array $SCENES;
    public readonly Deck $scene_cards;
    public readonly array $THEMES;
    public readonly Deck $theme_cards;
    public readonly PlayerCounter $staffCounter;
    public readonly PlayerCounter $staffCounterPrivate;
    public readonly PlayerCounter $draftCounter;
    public readonly PlayerCounter $attachmentVariable;
    public readonly TableCounter $dayCounter;

    public function __construct()
    {
        require "_material/material.inc.php";

        parent::__construct();
        $this->initGameStateLabels([]);

        $this->vip_cards = $this->deckFactory->createDeck("vips");
        $this->scene_cards = $this->deckFactory->createDeck("scenes");
        $this->theme_cards = $this->deckFactory->createDeck("themes");

        $this->staffCounter = $this->counterFactory->createPlayerCounter("staff");
        $this->staffCounterPrivate = $this->counterFactory->createPlayerCounter("staffPrivate");
        $this->draftCounter = $this->counterFactory->createPlayerCounter("draft", 0, 2);
        $this->attachmentVariable = $this->counterFactory->createPlayerCounter("attachment");
        $this->dayCounter = $this->counterFactory->createTableCounter("day", 1, 4);

        $this->decorateNotifs();
    }

    public function getGameProgression()
    {
        return 0;
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {
        return $this->getGamedatas($this);
    }

    protected function setupNewGame($players, $options = [])
    {
        return $this->newGame($players, $options);
    }

    public function debug_goToState(int $state = 3)
    {
        $this->gamestate->jumpToState($state);
    }

    public function debug_playAutomatically(int $moves = 1)
    {
        $count = 0;
        while (intval($this->gamestate->getCurrentMainStateId()) < 99 && $count < $moves) {
            $count++;
            foreach ($this->gamestate->getActivePlayerList() as $playerId) {
                $playerId = (int) $playerId;
                $this->gamestate->runStateClassZombie($this->gamestate->getCurrentState($playerId), $playerId);
            }
        }
    }

    public function debug_DayEnd(): void
    {
        $DayEnd = new DayEnd($this);
        $DayEnd->onEnteringState();
    }

    public function debug_incScore(int $inc): void
    {
        $playerId = (int) $this->getCurrentPlayerId();
        $this->playerScore->inc($playerId, $inc);
    }
}
