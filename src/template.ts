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
        defaultZoom: window.innerWidth <= 400 ? 0.5 : 1,
      }),
      animations: new BgaAnimations.Manager({
        animationsActive: () => this.game.bgaAnimationsActive(),
      }),
    };

    this.game.stocks = {};
    this.setupZones();
    this.setupStocks();
  }

  public setupZones() {
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;

    const zones = document.getElementById(`scp_playerZones`);
    keysToNumbers(players).forEach((player_id) => {
      const { name, color } = players[player_id];

      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${player_id}" class="scp_playerZone">
            <h3 class="scp_title scp_zoneTitle" style="color: #${color}">${name}</h3>
            <div id="scp_themes-${player_id}" class="scp_themes"></div>
            <div id="scp_scenes-${player_id}" class="scp_scenes"></div>
          </div>`
      );
    });
  }

  public setupStocks() {
    const vipManager = new VipManager(this.game);
    vipManager.setup();

    const sceneManager = new SceneManager(this.game);
    sceneManager.setup();

    const themeManager = new ThemeManager(this.game);
    themeManager.setup();
  }
}
