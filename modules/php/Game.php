<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * ScreamPark implementation : © Matheus Gomes matheusgomesforwork@gmail.com
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
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\States\ChooseTheme;
use Bga\Games\ScreamPark\States\DayEnd;
use Bga\Games\ScreamPark\States\EndScore;
use Bga\Games\ScreamPark\States\PassScenes;

define("gCompletedScenes", "gCompletedScenes");
define("statScore", "statScore");
define("statCompletedScenes", "statCompletedScenes");
define("statTotalScenes", "statTotalScenes");
define("statCardsPlayed", "statCardsPlayed");
define("statGenre1", "statGenre1");
define("statGenre2", "statGenre2");
define("statGenre3", "statGenre3");
define("statGenre4", "statGenre4");
define("statGenre5", "statGenre5");

class Game extends \Bga\GameFramework\Table
{
    use Notifs;

    public readonly array $VIPS;
    public readonly Deck $vip_cards;
    public readonly array $GENRES;
    public readonly array $SCENES;
    public readonly Deck $scene_cards;
    public readonly array $ABILITIES;
    public readonly array $THEMES;
    public readonly Deck $theme_cards;
    public readonly PlayerCounter $staffCounter;
    public readonly PlayerCounter $staffCounterPrivate;
    public readonly PlayerCounter $draftCounter;
    public readonly PlayerCounter $actionVariable;
    public readonly TableCounter $dayCounter;
    public readonly TableCounter $oppAbilityCounter;
    public readonly array $SCENICS;

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
        $this->actionVariable = $this->counterFactory->createPlayerCounter("action");
        $this->dayCounter = $this->counterFactory->createTableCounter("day", 1, 4);
        $this->oppAbilityCounter = $this->counterFactory->createTableCounter("oppAbility", 0, 9);

        $this->decorateNotifs();
    }

    public function getGameProgression()
    {
        $day = $this->dayCounter->get();
        $progression = 100 / 3 * ($day - 1);
        return round($progression);
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {
        $playerId = (int) $this->getCurrentPlayerId();
        $players = $this->loadPlayersBasicInfos();
        $isSpectator = $this->isSpectator();

        $Vips = new Vips($this);
        $Scenes = new Scenes($this);
        $Themes = new Themes($this);
        $Scenes = new Scenes($this);

        $day = $this->dayCounter->get();

        $gamedatas = [
            "players" => $this->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "VIPS" => $this->VIPS,
            "vipCards" => $Vips->getPublic(),
            "GENRES" => $this->GENRES,
            "SCENES" => $this->SCENES,
            "sceneDeckCount" => $Scenes->getDeckCount(),
            "ABILITIES" => $this->ABILITIES,
            "THEMES" => $this->THEMES,
            "themeCards" => $Themes->getPublic(),
            "themeHands" => $Themes->getHands($playerId),
            "sceneHand" => !$isSpectator ? $Scenes->getHand($playerId) : [],
            "scenePublic" => $Scenes->getPublic($playerId),
            "sceneBoard" => !$isSpectator ? $Scenes->getBoard($playerId) : [],
            "completedScenes" => $this->globals->get(gCompletedScenes)[$playerId],
            "vipFulfillingScenes" => !$isSpectator ? $Scenes->getVipFulfilling($playerId) : [],
            "staffCounts" => $this->staffCounter->getAll(),
            "abilityCounts" => $Scenes->getAbilityCounts(),
            "oppAbilityCount" => $this->oppAbilityCounter->get(),
            "SCENICS" => $this->SCENICS,
            "scenicsCounts" => $Scenes->getScenicsCounts(),
            "day" => $day,
            "nextPlayers" => $day === 2 ?  $this->getPrevPlayerTable($players) : $this->getNextPlayerTable(),
            "prevPlayers" => $day === 2 ? $this->getNextPlayerTable() : $this->getPrevPlayerTable($players),
            "isSolo" => $this->isSolo(),
        ];

        if (!$isSpectator) {
            $gamedatas["staffCountPrivate"] = $this->staffCounterPrivate->get($playerId);
        }

        return $gamedatas;
    }

    protected function setupNewGame($players, $options = [])
    {
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $playerId => $player) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $playerId,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        $this->DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();
        $this->activeNextPlayer();

        $Vips = new Vips($this);
        $Vips->setup();

        $Scenes = new Scenes($this);
        $Scenes->setup();

        $Themes = new Themes($this);
        $Themes->setup();

        $this->playerStats->init([
            statScore,
            statCompletedScenes,
            statTotalScenes,
            statCardsPlayed,
            statGenre1,
            statGenre2,
            statGenre3,
            statGenre4,
            statGenre5
        ], 0);

        $this->staffCounter->initDb(array_keys($players), 2);
        $this->staffCounterPrivate->initDb(array_keys($players), 2);
        $this->draftCounter->initDb(array_keys($players));
        $this->actionVariable->initDb(array_keys($players));
        $this->dayCounter->initDb(1);
        $this->oppAbilityCounter->initDb(0);

        $defaultGlobal = [];
        foreach ($players as $playerId => $player) {
            $defaultGlobal[$playerId] = [];
        }
        $this->globals->set(gCompletedScenes, $defaultGlobal);

        return ChooseTheme::class;
    }

    public function isSolo(): bool
    {
        return $this->getPlayerCount() === 1;
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

    public function debug_PassScenes(): void
    {
        $PassScenes = new PassScenes($this);
        $PassScenes->onEnteringState();
    }

    public function debug_EndScore(): void
    {
        $EndScore = new EndScore($this);
        $EndScore->onEnteringState();
    }

    public function debug_incScore(): void
    {
        $this->playerScore->set(2392034, 80);
    }
}
