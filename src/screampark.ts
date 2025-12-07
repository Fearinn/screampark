// @ts-ignore
GameGui = (function () {
  // this hack required so we fake extend Game
  function Game() {}
  return Game;
})();

// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
class SCP extends GameGui<SCP_Gamedatas> implements SCP {
  // @ts-ignore
  constructor() {}

  public setup(gamedatas: SCP_Gamedatas) {
    this._attachedTooltips = {};
    this._registeredCustomTooltips = {};

    const template = new Template(this);
    template.setup();

    this.setupNotifications();
  }

  public onEnteringState(
    stateName: StateName,
    args: { args: Record<string, any> }
  ) {
    const stateManager = new StateManager(this);
    stateManager.onEntering(stateName, args.args);
  }

  public onLeavingState(stateName: StateName) {
    const stateManager = new StateManager(this);
    stateManager.onLeaving(stateName);
  }

  public onUpdateActionButtons(
    stateName: StateName,
    args: Record<string, any>
  ) {
    this.attachRegisteredTooltips();
    const stateManager = new StateManager(this);
    stateManager.onUpdate(stateName, args);
  }

  public setupNotifications() {
    const notifManager = new NotifManager(this);
    notifManager.setIgnoreChecks();
    this.bgaSetupPromiseNotifications({ handlers: [notifManager] });
  }

  public async performAction(
    actionName: ActionName,
    args?: any,
    params?: {
      lock?: boolean;
      checkAction?: boolean;
      checkPossibleActions?: boolean;
    }
  ): Promise<void> {
    return this.bgaPerformAction(actionName, args, params).finally(() => {
      if (this.on_client_state) {
        this.restoreServerGameState();
      }
    });
  }

  public addButton(
    label: string,
    callback: () => void,
    params: {
      id?: string;
      type?: "default" | "alert";
      color?: "primary" | "secondary" | "alert";
      destination?: HTMLElement;
      classes?: string[];
      disabled?: boolean;
      confirm?: string;
      title?: string;
    } = {}
  ) {
    params.type = params.type || "default";

    const id =
      params.id ||
      `scp_button-${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2)}`;

    document.getElementById(id)?.remove();

    params.destination =
      params.destination ||
      document.getElementById(`scp_${params.type}Actions`);

    params.color =
      params.color || (params.type === "alert" ? "alert" : "primary");

    this.statusBar.addActionButton(
      label,
      () => {
        callback();
      },
      {
        id,
        classes: ["scp_button"],
        ...params,
      }
    );
  }

  public clearButtons(preserveAlert = false): void {
    document.getElementById("scp_defaultActions").innerHTML = "";

    if (!preserveAlert) {
      document.getElementById("scp_alertActions").innerHTML = "";
    }
  }

  public keysToNumbers(object: Record<number, any>) {
    const keys = Object.keys(object).map((key) => {
      return Number(key);
    });

    return keys;
  }

  public keysFromMap(map: Record<number, any>, startKey: number): number[] {
    const keys = this.keysToNumbers(map);
    const startIndex = keys.indexOf(startKey);

    if (startIndex === -1) {
      return keys;
    }

    const circularKeys = [];
    let key = startKey;
    for (let i = 0; i < keys.length; i++) {
      circularKeys.push(key);
      key = map[key];
    }

    return circularKeys;
  }

  public bgaFormatText(
    log: string,
    args: Record<string, any>
  ): { log: string; args: Record<string, any> } {
    try {
      this.addIcons(log, args);

      const keys = Object.keys(args);
      keys.forEach((key) => {
        if (key.includes("Label")) {
          const uid = `${Date.now().toString(36)}${Math.random()
            .toString(36)
            .slice(2)}`;
          const elementId = `scp_logLabel-${uid}`;

          args[key] = `<span id="${elementId}" style="font-weight: bold">${_(
            args[key]
          )}</span>`;

          if (key.includes("sceneLabel")) {
            const sceneIdKey = key === "sceneLabel" ? "sceneId" : "sceneId2";
            const sceneId = args[sceneIdKey];

            const tooltip = `<div id="scp_tooltip-${sceneId}-${uid}" class="scp_card scp_scene scp_logTooltip bga-cards_card"
            style="background-image: url(${g_gamethemeurl}img/scenes/scene_${sceneId}.jpg)"></div>`;
            this.registerCustomTooltip(
              elementId,
              `<div class="scp_tooltip">${tooltip}</div>`
            );
            return;
          }

          if (key.includes("genreLabel") && args.genreId) {
            const { genreId } = args;
            const tooltip = `<div id="scp_tooltip-${genreId}-${uid}" class="scp_card scp_genre scp_scene scp_logTooltip bga-cards_card"
            style="background-image: url(${g_gamethemeurl}img/genres/genre_${genreId}.jpg)"></div>`;
            this.registerCustomTooltip(
              elementId,
              `<div class="scp_tooltip">${tooltip}</div>`
            );
            return;
          }

          if (key.includes("themeLabel") && args.themeId) {
            const { themeId } = args;
            const tooltip = `<div id="scp_tooltip-${themeId}-${uid}" class="scp_card scp_theme scp_logTooltip bga-cards_card"
            style="background-image: url(${g_gamethemeurl}img/themes/theme_${themeId}.jpg)"></div>`;
            this.registerCustomTooltip(
              elementId,
              `<div class="scp_tooltip">${tooltip}</div>`
            );
            return;
          }
        }
      });
    } catch (error) {
      console.error(error);
    }

    return { log, args };
  }

  private addIcons(log: string, args: Record<string, any>) {
    if (log.includes("${randomGenre_icon}")) {
      const backgroundImage = `url(${g_gamethemeurl}img/icons/genre_0.png)`;
      args.randomGenre_icon = `<span class="scp_icon scp_icon-genre" style="background-image: ${backgroundImage};"></span>`;
    }

    if (log.includes("${genre_icon}") && args.genreId) {
      const backgroundImage = `url(${g_gamethemeurl}img/icons/genre_${args.genreId}.png)`;
      args.genre_icon = `<span class="scp_icon scp_icon-genre" style="background-image: ${backgroundImage};"></span>`;
    }

    if (log.includes("${candlestick_icon}")) {
      args.candlestick_icon = this.getScenicIcon("candlestick");
    }

    if (log.includes("${light_icon}")) {
      args.light_icon = this.getScenicIcon("light");
    }

    if (log.includes("${sound_icon}")) {
      args.sound_icon = this.getScenicIcon("sound");
    }

    if (log.includes("${skull_icon}")) {
      args.skull_icon = this.getScenicIcon("skull");
    }

    if (log.includes("${lightning_icon}")) {
      const backgroundImage = `url(${g_gamethemeurl}img/icons/lightning.png)`;
      args.lightning_icon = `<span class="scp_icon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
    }

    if (log.includes("${staff_icon}")) {
      const backgroundImage = `url(${g_gamethemeurl}img/staff.png)`;
      args.staff_icon = `<span class="scp_icon" style="background-image: ${backgroundImage};"></span>`;
    }

    if (log.includes("${staffCost_icon}")) {
      const backgroundImage = `url(${g_gamethemeurl}img/icons/staffCost.png)`;
      args.staffCost_icon = `<span class="scp_icon" style="background-image: ${backgroundImage};"></span>`;
    }
  }

  private getScenicIcon(scenicName: string): string {
    const scenicSymbols = {
      candlestick: 1,
      light: 2,
      sound: 3,
      skull: 4,
    };

    const scenic_id = scenicSymbols[scenicName];
    const backgroundImage = `url(${g_gamethemeurl}img/icons/scenic_${scenic_id}.png)`;

    return `<span class="scp_icon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
  }

  private setLoader(image_progress: number, logs_progress: number): void {
    // @ts-ignore
    this.inherited(arguments); // required, this is "super()" call, do not remove
    if (!this.isLoadingLogsComplete && logs_progress >= 100) {
      this.isLoadingLogsComplete = true;
      this.onLoadingLogsComplete();
    }
  }

  private onLoadingLogsComplete(): void {
    this.attachRegisteredTooltips();
  }

  private registerCustomTooltip(id: string, tooltip: string): string {
    this._registeredCustomTooltips[id] = tooltip;
    return id;
  }

  private attachRegisteredTooltips(): void {
    for (const id in this._registeredCustomTooltips) {
      let tooltip = this._registeredCustomTooltips[id];
      this.addCustomTooltip(id, tooltip);
      this._attachedTooltips[id] = tooltip;
    }

    this._registeredCustomTooltips = {};
  }

  private addCustomTooltip(id: string, tooltip: string): void {
    this.addTooltipHtml(id, tooltip, 1000);
  }
}
