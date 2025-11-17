class NotifManager {
  private readonly game: SCP;
  private readonly themeManager: ThemeManager;

  constructor(game: SCP) {
    this.game = game;
    this.themeManager = new ThemeManager(this.game);
  }

  public setIgnoreChecks() {
    const { notifqueue, player_id } = this.game;

    notifqueue.setIgnoreNotificationCheck(
      "getTheme",
      (notif: Notif<{ player_id: number }>) => {
        const { player_id: playerId } = notif.args;
        return playerId === player_id;
      }
    );
  }

  public async notif_discardTheme(args: {
    player_id: number;
    cardId: number;
  }): Promise<void> {
    const { player_id: playerId, cardId } = args;

    const { boards } = this.themeManager.stocks;

    await boards[playerId].removeCard(
      { id: cardId },
      { fadeOut: true, slideTo: document.getElementById("player_boards") }
    );
  }

  public async notif_getTheme(args: {
    player_id: number;
    cardId: number;
  }): Promise<void> {
    const { player_id: playerId, cardId } = args;
    const { boards } = this.themeManager.stocks;

    await boards[playerId].addCard(
      { id: cardId },
      {
        fromElement: document.getElementById("player_boards"),
      }
    );
  }

  public async notif_privateGetTheme(args: {
    player_id: number;
    card: ThemeCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards } = this.themeManager.stocks;

    await boards[playerId].addCard(card, {
      fromElement: document.getElementById("player_boards"),
    });
  }

  public notif_revealTheme(args: { player_id: number; card: ThemeCard }): void {
    const { player_id: playerId, card } = args;
    const { boards } = this.themeManager.stocks;

    boards[playerId].setCardVisible(card, true);
  }
}
