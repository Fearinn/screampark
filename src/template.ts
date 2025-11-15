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
        animationsActive: () => this.game.bgaAnimationsActive(),
      }),
    };

    this.game.stocks = {};
    this.setupZones();
    this.setupStocks();
  }

  public setupZones(): void {
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;

    const zones = document.getElementById(`scp_playerZones`);
    keysToNumbers(players).forEach((player_id) => {
      const { color: player_color } = players[player_id];
      const player_name = this.game.getFormattedPlayerName(player_id);

      const title =
        player_id === this.game.player_id
          ? this.game.format_string_recursive(_("${player_name} (you)"), {
              player_name,
            })
          : player_name;

      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${player_id}" class="scp_playerZone">
            <h3 class="scp_title" style="color: #${player_color}; background-color: #${player_color}44;">${title}</h3>
            <div id="scp_meepleSteps-${player_id}" class="scp_meepleSteps">
              <div id="scp_meepleStep-0-${player_id}" class="scp_meepleStep"></div>
            </div>
            <div class="scp_zoneContent">
            <div id="scp_themes-${player_id}" class="scp_themes"></div>
              <div id="scp_scenes-${player_id}" class="scp_scenes"></div>
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
}
