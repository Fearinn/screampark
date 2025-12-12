class Template {
  game: SCP;

  constructor(game: SCP) {
    this.game = game;
  }

  public setup() {
    this.game.managers = {
      zoom: new ZoomManager({
        element: document.getElementById("scp_gameArea"),
        zoomLevels: [0.3, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.5],
        localStorageZoomKey: "bga-zoom_screampark",
        zoomControls: {
          color: "white",
        },
        defaultZoom: window.innerWidth <= 400 ? 0.3 : 1,
      }),
      animations: new BgaAnimations.Manager({
        animationsActive: () => {
          return this.game.bgaAnimationsActive();
        },
      }),
      counters: {
        player: {},
        table: {},
      },
    };
    this.game.stocks = {};

    document.getElementById("generalactions").insertAdjacentHTML(
      "beforebegin",
      `<div id="scp_defaultActions" class="scp_defaultActions"></div>
      <div id="scp_alertActions" class="scp_alertActions"></div>`
    );
    this.game.addTooltipHtml(
      `scp_sceneDeck`,
      `<div class="scp_tooltip"><span>${_("scene cards")}</span></div>`
    );
    this.game.addTooltipHtml(
      `scp_genreDeck`,
      `<div class="scp_tooltip"><span>${_("genre cards")}</span></div>`
    );

    this.setupZones();
    this.setupStocks();
    this.setupCounters();
  }

  public setupZones(): void {
    const { gamedatas, player_id } = this.game;
    const { players, nextPlayers, prevPlayers, day, isSolo } = gamedatas;

    delete nextPlayers[0];

    this.game.keysFromMap(nextPlayers, player_id).forEach((playerId) => {
      const { color: playerColor } = players[playerId];
      const playerName = this.game.getFormattedPlayerName(playerId);

      const isCurrentPlayerId = player_id === playerId;

      const title = isCurrentPlayerId
        ? this.game.format_string_recursive(_("${player_name} (You)"), {
            player_name: playerName,
          })
        : playerName;

      const nextPlayerId = nextPlayers[playerId];
      const nextPlayerName = this.game.getFormattedPlayerName(nextPlayerId);
      const nextPlayer = this.game.format_string_recursive(
        _("${arrow} ${player_name} ${arrow}"),
        {
          arrow: `<i class="fa6 fa6-solid fa6-arrow-right"></i>`,
          player_name: nextPlayerName,
        }
      );
      const { color: nextPlayerColor } = players[nextPlayerId];

      const prevPlayerId = prevPlayers[playerId];
      const prevPlayerName = this.game.getFormattedPlayerName(prevPlayerId);
      const prevPlayer = this.game.format_string_recursive(
        _("${arrow} ${player_name} ${arrow}"),
        {
          arrow: `<i class="fa6 fa6-solid fa6-arrow-right"></i>`,
          player_name: prevPlayerName,
        }
      );
      const { color: prevPlayerColor } = players[prevPlayerId];

      const zones = document.getElementById(`scp_playerZones`);
      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${playerId}" class="scp_playerZone ${
          isCurrentPlayerId ? "scp_playerZone-current" : ""
        }" style="border-color: #${playerColor};">
          <div class="scp_zoneTitles">
            ${
              isSolo
                ? ""
                : `<a href="#scp_playerZone-${prevPlayerId}" 
                id="scp_prevPlayer-${playerId}" class="scp_title scp_nextPlayer scp_prevPlayer" 
                style="color: #${prevPlayerColor}; background-color: #${prevPlayerColor}40;">
              ${prevPlayer}
            </a>`
            }
            <h3 class="scp_title" style="color: #${playerColor}; background-color: #${playerColor}40;">
              ${title}
            </h3>
            ${
              isSolo
                ? ""
                : `<a href="#scp_playerZone-${nextPlayerId}" 
              id="scp_nextPlayer-${playerId}" class="scp_title scp_nextPlayer" 
              style="color: #${nextPlayerColor}; background-color: #${nextPlayerColor}40;">
              ${nextPlayer}
            </a>`
            }
          </div>
            ${
              isCurrentPlayerId
                ? `<div id="scp_hand" class="scp_hand"></div>`
                : ""
            }
          <div id="scp_fakeHand-${playerId}" class="scp_fakeHand"></div>
          <div id="scp_meepleHouse-${playerId}" class="scp_meepleHouse"></div>
          <div class="scp_playerBoard">
            <div id="scp_themes-${playerId}" class="scp_themes"></div>
            <div id="scp_scenes-${playerId}" class="scp_scenes"></div>
          </div>
        </div>`
      );

      if (isSolo) {
        return;
      }

      this.game.addTooltipHtml(
        `scp_nextPlayer-${playerId}`,
        `<div class="scp_tooltip">
            <span>
            ${this.game.format_string_recursive(
              _("${player_name} passes cards to ${player_name2}"),
              {
                player_name: playerName,
                player_name2: nextPlayerName,
              }
            )}
            </span>
        </div>`
      );

      this.game.addTooltipHtml(
        `scp_prevPlayer-${playerId}`,
        `<div class="scp_tooltip">
            <span>
            ${this.game.format_string_recursive(
              _("${player_name} receives cards from ${player_name2}"),
              {
                player_name: playerName,
                player_name2: nextPlayerName,
              }
            )}
            </span>
        </div>`
      );
    });

    this.game.togglePassDirection(day);
  }

  private setupStocks(): void {
    const vipManager = new VipManager(this.game);
    vipManager.setup();

    const sceneManager = new SceneManager(this.game);
    sceneManager.setup();

    const themeManager = new ThemeManager(this.game);
    themeManager.setup();

    const meepleManager = new MeepleManager(this.game);
    meepleManager.setup();

    this.setupStars();
  }

  private setupStars(): void {
    const starTrack = document.getElementById("scp_starTrack");
    for (let points = 0; points < 80; points++) {
      starTrack.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_stars-${points}" class="scp_stars scp_stars-${points}"></div>`
      );
    }
    const starManager = new StarManager(this.game);
    starManager.setup();
  }

  private setupCounters(): void {
    const { gamedatas, keysToNumbers, managers, player_id } = this.game;
    const {
      isSolo,
      players,
      staffCounts,
      staffCountPrivate,
      abilityCounts,
      oppAbilityCount,
    } = gamedatas;
    const { counters } = managers;

    counters.player = {
      staff: {},
      candelabra: {},
      lightbulb: {},
      audio: {},
      skull: {},
    };
    keysToNumbers(players).forEach((playerId) => {
      this.game.getPlayerPanelElement(playerId).insertAdjacentHTML(
        "beforeend",
        `<div id="scp_staffCounter-${playerId}" class="scp_counter scp_staffCounter">
          <i id="scp_staffCounterIcon-${playerId}" class="scp_staffCounterIcon"></i>
          <span id="scp_staffCounterCount-${playerId}" class="scp_count"></span>
        </div>
        <div id="scp_abilityCounter-${playerId}" class="scp_counter scp_abilityCounter">
          <i id="scp_abilityCounterIcon-${playerId}" class="scp_abilityCounterIcon"></i>
          <div id="scp_abilityCounterCounts-${playerId}" class="scp_abilityCounterCounts">
            <span id="scp_abilityCounterCount-${playerId}" class="scp_count"></span>
            ${
              isSolo
                ? `x<span id="scp_oppAbilityCounterCount" class="scp_count"></span>`
                : ""
            }
          </div>
        </div>
        <div id="scp_candelabraCounter-${playerId}" class="scp_counter scp_candelabraCounter">
          <i id="scp_candelabraCounterIcon-${playerId}" class="scp_candelabraCounterIcon"></i>
          <span id="scp_candelabraCounterCount-${playerId}" class="scp_counterCount"></span>
        </div>
        <div id="scp_lightbulbCounter-${playerId}" class="scp_counter scp_lightbulbCounter">
          <i id="scp_lightbulbCounterIcon-${playerId}" class="scp_lightbulbCounterIcon"></i>
          <span id="scp_lightbulbCounterCount-${playerId}" class="scp_count"></span>
        </div>
        <div id="scp_audioCounter-${playerId}" class="scp_counter scp_audioCounter">
          <i id="scp_audioCounterIcon-${playerId}" class="scp_audioCounterIcon"></i>
          <span id="scp_audioCounterCount-${playerId}" class="scp_count"></span>
        </div>
        <div id="scp_skullCounter-${playerId}" class="scp_counter scp_skullCounter">
          <i id="scp_skullCounterIcon-${playerId}" class="scp_skullCounterIcon"></i>
          <span id="scp_skullCounterCount-${playerId}" class="scp_count"></span>
        </div>`
      );

      this.game.addTooltipHtml(
        `scp_staffCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_("staff tokens")}</span></div>`
      );
      const staffCounter = new ebg.counter();
      staffCounter.create(`scp_staffCounterCount-${playerId}`, {
        value:
          player_id === playerId ? staffCountPrivate : staffCounts[playerId],
        playerCounter: "staff",
        playerId,
      });

      this.game.addTooltipHtml(
        `scp_candelabraCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_("candelabra symbols")}</span></div>`
      );
      const candelabraCounter = new ebg.counter();
      candelabraCounter.create(`scp_candelabraCounterCount-${playerId}`, {
        playerCounter: "candelabra",
        playerId,
      });

      this.game.addTooltipHtml(
        `scp_lightbulbCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_("lightbulb symbols")}</span></div>`
      );
      const lightbulbCounter = new ebg.counter();
      lightbulbCounter.create(`scp_lightbulbCounterCount-${playerId}`, {
        playerCounter: "lightbulb",
        playerId,
      });

      this.game.addTooltipHtml(
        `scp_audioCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_("audio symbols")}</span></div>`
      );
      const audioCounter = new ebg.counter();
      audioCounter.create(`scp_audioCounterCount-${playerId}`, {
        playerCounter: "audio",
        playerId,
      });

      this.game.addTooltipHtml(
        `scp_skullCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_("skull symbols")}</span></div>`
      );
      const skullCounter = new ebg.counter();
      skullCounter.create(`scp_skullCounterCount-${playerId}`, {
        playerCounter: "skull",
        playerId,
      });

      this.game.addTooltipHtml(
        `scp_abilityCounter-${playerId}`,
        `<div class="scp_tooltip"><span>${_(
          "special effects played"
        )}</span></div>`
      );
      const abilityCounter = new ebg.counter();
      abilityCounter.create(`scp_abilityCounterCount-${playerId}`, {
        value: abilityCounts[playerId],
        playerCounter: "ability",
        playerId,
      });

      counters.player.staff[playerId] = staffCounter;
    });

    if (isSolo) {
      const oppAbilityCounter = new ebg.counter();
      oppAbilityCounter.create(`scp_oppAbilityCounterCount`, {
        value: oppAbilityCount,
        tableCounter: "oppAbility",
      });

      counters.table.ability = oppAbilityCounter;
    }

    managers.counters = counters;
  }
}
