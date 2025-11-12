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
    const template = new Template(this);
    template.setup();

    this.setupNotifications();
  }
  public onEnteringState(stateName: StateName, args: { args: any }) {
    const stateManager = new StateManager(this);
    stateManager.onEntering(stateName, args.args);
  }

  public onLeavingState(stateName: StateName) {
    const stateManager = new StateManager(this);
    stateManager.onLeaving(stateName);
  }

  public onUpdateActionButtons(stateName: StateName, args: any) {
    const stateManager = new StateManager(this);
    stateManager.onUpdate(stateName, args);
  }

  public setupNotifications() {
    this.bgaSetupPromiseNotifications({ handlers: [new NotifManager(this)] });
  }

  public bgaFormatText(log: string, args: any): { log: string; args: any } {
    try {
      if (log.includes("${randomGenre_icon}")) {
        const backgroundImage = `url(${g_gamethemeurl}img/icons/genre_0.png)`;
        args.randomGenre_icon = `<span class="scp_smIcon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
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

      if (log.includes("${staffCost_icon}")) {
        const backgroundImage = `url(${g_gamethemeurl}img/icons/staffCost.png)`;
        args.staffCost_icon = `<span class="scp_smIcon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
      }

      if (log.includes("${lightning_icon}")) {
        const backgroundImage = `url(${g_gamethemeurl}img/icons/lightning.png)`;
        args.lightning_icon = `<span class="scp_smIcon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
      }
    } catch (error) {
      console.error(error);
    }

    return { log, args };
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

    return `<span class="scp_smIcon scp_genreIcon" style="background-image: ${backgroundImage};"></span>`;
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

  public addBtn(
    label: string,
    callback: () => void,
    params: {
      id?: string;
      color?: "primary" | "secondary" | "alert";
      destination?: HTMLElement;
      classes?: string[];
      autoclick?: boolean;
      disabled?: boolean;
      order?: number;
      confirm?: string;
      type?: "alert" | "default";
    } = {}
  ) {
    const id =
      params.id ||
      `scp_btn-${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2)}`;

    document.getElementById(id)?.remove();

    if (!params.destination && params.type === "alert") {
      params.destination = document.getElementById(`scp_alertActions`);
    }

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

    document.getElementById(id).style.order = `${params?.order}` || "0";
  }

  public clearActionButtons(): void {
    document.getElementById("scp_alertActions").innerHTML = "";
  }

  public addConfirmation(
    label: string,
    callback: () => void,
    params?: {
      color?: "primary" | "secondary" | "alert";
      destination?: HTMLElement;
      classes?: string[];
      autoclick?: boolean;
      order?: number;
    }
  ) {
    this.addBtn(
      label,
      () => {
        callback();
      },
      {
        id: `scp_confirmationBtn`,
        ...params,
      }
    );
  }

  public removeConfirmation() {
    document.getElementById(`scp_confirmationBtn`)?.remove();
  }
}
