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
    this.setupStocks();
  }

  public setupStocks() {
    const vipManager = new VipManager(this.game);
    vipManager.setup();

    const genreManager = new GenreManager(this.game);
    genreManager.setup();
  }
}
