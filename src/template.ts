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
      counters: {},
    };
    this.game.stocks = {};

    document.getElementById("generalactions").insertAdjacentHTML(
      "beforebegin",
      `<div id="scp_defaultActions" class="scp_defaultActions"></div>
      <div id="scp_alertActions" class="scp_alertActions"></div>`
    );
    this.setupZones();
    this.setupStocks();
    this.setupPanels();
  }

  public setupZones(): void {
    const { gamedatas, player_id } = this.game;
    const { players, passToIds, receiveFromIds } = gamedatas;

    delete passToIds[0];

    this.game.keysFromMap(passToIds, player_id).forEach((playerId) => {
      const { color: playerColor } = players[playerId];
      const playerName = this.game.getFormattedPlayerName(playerId);

      const isCurrentPlayerId = player_id === playerId;

      const title = isCurrentPlayerId
        ? this.game.format_string_recursive(_("${player_name} (You)"), {
            player_name: playerName,
          })
        : playerName;

      const passToId = passToIds[playerId];
      const passToName = this.game.getFormattedPlayerName(passToId);
      const passTo = this.game.format_string_recursive(
        _("${arrow} ${player_name} ${arrow}"),
        {
          arrow: `<i class="fa6 fa6-solid fa6-arrow-right"></i>`,
          player_name: passToName,
        }
      );
      const { color: passToColor } = players[passToId];

      const receiveFromId = receiveFromIds[playerId];
      const receiveFromName = this.game.getFormattedPlayerName(receiveFromId);
      const receiveFrom = this.game.format_string_recursive(
        _("${arrow} ${player_name} ${arrow}"),
        {
          arrow: `<i class="fa6 fa6-solid fa6-arrow-right"></i>`,
          player_name: receiveFromName,
        }
      );
      const { color: receiveFromColor } = players[receiveFromId];

      let meepleSteps = "";
      for (let slot = 0; slot <= 24; slot++) {
        meepleSteps += `<div id="scp_meepleStep-${slot}-${playerId}" class="scp_meepleStep"></div>`;
      }

      const zones = document.getElementById(`scp_playerZones`);
      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${playerId}" class="scp_playerZone ${
          isCurrentPlayerId ? "scp_playerZone-current" : ""
        }" style="border-color: #${playerColor};">
          <div class="scp_zoneTitles">
            <a href="#scp_playerZone-${receiveFromId}" id="scp_receiveFrom-${playerId}" class="scp_title scp_passTo scp_receiveFrom" 
            style="color: #${receiveFromColor}; background-color: #${receiveFromColor}40;">
              ${receiveFrom}
            </a>
            <h3 class="scp_title" style="color: #${playerColor}; background-color: #${playerColor}40;">
              ${title}
            </h3>
            <a href="#scp_playerZone-${passToId}" id="scp_passTo-${playerId}" class="scp_title scp_passTo" 
            style="color: #${passToColor}; background-color: #${passToColor}40;">
              ${passTo}
            </a>
            ${
              isCurrentPlayerId
                ? `<div id="scp_hand" class="scp_hand"></div>`
                : ""
            }
          </div>
          <div id="scp_fakeHand-${playerId}" class="scp_fakeHand"></div>
          <div id="scp_meepleSteps-${playerId}" class="scp_meepleSteps">
            ${meepleSteps}
          </div>
          <div class="scp_playerBoard">
            <div id="scp_themes-${playerId}" class="scp_themes"></div>
            <div id="scp_scenes-${playerId}" class="scp_scenes"></div>
          </div>
        </div>`
      );

      this.game.addTooltipHtml(
        `scp_passTo-${playerId}`,
        `<div class="scp_tooltip">
            <span>
            ${this.game.format_string_recursive(
              _("${player_name} passes cards to ${player_name2}"),
              {
                player_name: playerName,
                player_name2: passToName,
              }
            )}
            </span>
        </div>`
      );

      this.game.addTooltipHtml(
        `scp_receiveFrom-${playerId}`,
        `<div class="scp_tooltip">
            <span>
            ${this.game.format_string_recursive(
              _("${player_name} receives cards from ${player_name2}"),
              {
                player_name: playerName,
                player_name2: passToName,
              }
            )}
            </span>
        </div>`
      );
    });
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

  private setupPanels(): void {
    const { gamedatas, keysToNumbers, managers, player_id } = this.game;
    const { players, staffCounts, staffCountPrivate } = gamedatas;

    const counters: Record<number, Counter> = {};

    keysToNumbers(players).forEach((playerId) => {
      this.game.getPlayerPanelElement(playerId).insertAdjacentHTML(
        "beforeend",
        `<div id="scp_staffCounter-${playerId}" class="scp_staffCounter">
          <span id="scp_staffCounterCount-${playerId}" class="scp_staffCounterCount"></span>
          <div id="scp_staffCounterIcon-${playerId}" class="scp_staffCounterIcon"></div>
        </div>`
      );

      counters[playerId] = new ebg.counter();
      counters[playerId].create(`scp_staffCounterCount-${playerId}`, {
        value:
          player_id === playerId ? staffCountPrivate : staffCounts[playerId],
        playerCounter: "staff",
        playerId,
      });
    });

    managers.counters = {
      ...managers.counters,
      staff: counters,
    };
  }
}
