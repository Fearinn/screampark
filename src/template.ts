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

    document
      .getElementById("generalactions")
      .insertAdjacentHTML(
        "afterend",
        `<div id="scp_alertActions" class="scp_alertActions"></div>`
      );
    this.setupZones();
    this.setupStocks();
    this.setupPanels();
  }

  public setupZones(): void {
    const { gamedatas, keysToNumbers, player_id } = this.game;
    const { players } = gamedatas;

    keysToNumbers(players).forEach((playerId) => {
      const { color: player_color } = players[playerId];
      const player_name = this.game.getFormattedPlayerName(playerId);

      const isCurrentPlayerId = player_id === playerId;

      const title = isCurrentPlayerId
        ? this.game.format_string_recursive(_("${player_name} (You)"), {
            player_name,
          })
        : player_name;

      const zones = document.getElementById(`scp_playerZones`);
      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${playerId}" class="scp_playerZone ${
          isCurrentPlayerId ? "scp_playerZone-current" : ""
        }">
          <h3 class="scp_title" style="color: #${player_color}; background-color: #${player_color}40;">
            ${title}
          </h3>
          ${
            isCurrentPlayerId
              ? `<div id="scp_hand" class="scp_hand"></div>`
              : ""
          }
          <div id="scp_meepleSteps-${playerId}" class="scp_meepleSteps">
            <div id="scp_meepleStep-0-${playerId}" class="scp_meepleStep"></div>
          </div>
          <div class="scp_playerBoard">
            <div id="scp_themes-${playerId}" class="scp_themes"></div>
            <div id="scp_scenes-${playerId}" class="scp_scenes"></div>
          </div>
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
    const { players, staffCounts, privateStaffCount } = gamedatas;

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
          player_id === playerId ? privateStaffCount : staffCounts[playerId],
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
