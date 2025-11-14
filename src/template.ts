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
    this.setupStars();
  }

  public setupZones(): void {
    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;

    const zones = document.getElementById(`scp_playerZones`);
    keysToNumbers(players).forEach((player_id) => {
      const { name: player_name, color: player_color } = players[player_id];

      zones.insertAdjacentHTML(
        "beforeend",
        `<div id="scp_playerZone-${player_id}" class="scp_playerZone">
            <h3 class="scp_title" style="color: #${player_color}; background-color: #${player_color}44">${player_name}</h3>
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
