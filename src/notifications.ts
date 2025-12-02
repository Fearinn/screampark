class NotifManager {
  private readonly game: SCP;
  private readonly counters: Counters;
  private readonly themeManager: ThemeManager;
  private readonly sceneManager: SceneManager;
  private readonly vipManager: VipManager;

  constructor(game: SCP) {
    this.game = game;
    this.counters = this.game.managers.counters;
    this.themeManager = new ThemeManager(this.game);
    this.sceneManager = new SceneManager(this.game);
    this.vipManager = new VipManager(this.game);
  }

  public setIgnoreChecks() {
    const { notifqueue, player_id } = this.game;

    const notifsToIgnore = [
      "getTheme",
      "dealScenes",
      "placeScene",
      "discardScene",
      "discardBoth",
      "receiveCards",
    ];

    notifsToIgnore.forEach((notifName) => {
      notifqueue.setIgnoreNotificationCheck(
        notifName,
        (notif: Notif<{ player_id: number }>) => {
          const { player_id: playerId } = notif.args;
          return playerId === player_id;
        }
      );
    });

    notifqueue.setIgnoreNotificationCheck(
      "setPlayerCounter",
      (notif: Notif<{ playerId: number; ignore: boolean }>) => {
        const { playerId, ignore } = notif.args;
        return playerId === player_id && ignore;
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

  public async notif_getThemePrivate(args: {
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

  public async notif_dealScenesPrivate(args: {
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand, deck } = this.sceneManager.stocks;

    await hand.addCards(cards, { fromStock: deck });
  }

  public async notif_dealScenes(args: {
    player_id: number;
    cardCount: number;
  }): Promise<void> {
    const { cardCount, player_id: playerId } = args;
    const { fakeHands, deck } = this.sceneManager.stocks;

    const fakeCards: SceneCard[] = [];
    for (let i = 1; i <= cardCount; i++) {
      fakeCards.push({ id: -i, type: "scene" });
    }

    await fakeHands[playerId].addCards(fakeCards, { fromStock: deck });
  }

  public async notif_placeScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards, genreDeck } = this.sceneManager.stocks;

    boards[playerId].addCard(card, {
      fromStock: card.type === "genre" ? genreDeck : undefined,
      toPlaceholder: "off",
    });
  }

  public async notif_placeScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { boards, genreDeck } = this.sceneManager.stocks;

    await boards[playerId].addCard(card, {
      fromStock: card.type === "genre" ? genreDeck : undefined,
      fromElement:
        card.type === "scene"
          ? document.getElementById(`scp_playerZone-${playerId}`)
          : undefined,
      toPlaceholder: "off",
    });
  }

  public async notif_discardScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { card } = args;
    const { hand } = this.sceneManager.stocks;

    await hand.removeCard(card, {
      fadeOut: true,
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardBothPrivate(args: {
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand } = this.sceneManager.stocks;

    await hand.removeCards(cards, {
      fadeOut: true,
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;
    const { fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].removeCard(card, {
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_discardBoth(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id: playerId, cards } = args;
    const { fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].removeCards(cards, {
      slideTo: document.getElementById("player_boards"),
    });
  }

  public async notif_shiftScenesPrivate(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id: playerId, cards } = args;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];

    const promises = [];
    cards.forEach((card) => {
      const animation = board.addCard(card, {
        fromElement: document.querySelector(
          `#scp_scenes-${playerId} [data-slot-id="${card.slot}"]`
        ),
        fromPlaceholder: "off",
      });

      promises.push(animation);
    });

    await Promise.all(promises);
  }

  public async notif_receiveCardsPrivate(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { hand } = this.sceneManager.stocks;
    await hand.addCards(cards, {
      duration: 1000,
      toPlaceholder: "on",
      fromPlaceholder: "off",
    });
  }

  public async notif_receiveCards(args: {
    player_id: number;
    otherPlayerId: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id } = this.game;
    const { player_id: playerId, otherPlayerId, cards } = args;
    const { hand, fakeHands } = this.sceneManager.stocks;

    await fakeHands[playerId].addCards(cards, {
      fromStock: otherPlayerId === player_id ? hand : fakeHands[otherPlayerId],
      duration: 1000,
      toPlaceholder: "off",
      fromPlaceholder: "on",
    });
  }

  public async notif_dayEnd(args: { previousDay: number }): Promise<void> {
    const { previousDay } = args;
    const { board } = this.vipManager.stocks;
    const card = board.getCards().find((card) => {
      return Number(card.location_arg) === previousDay;
    });
    board.flipCard(card);
  }

  public async notif_scoreTheme(args: {
    player_id: number;
    points: number;
  }): Promise<void> {
    const { managers, gamedatas } = this.game;
    const { animations } = managers;
    const { players } = gamedatas;

    const { player_id: playerId, points } = args;
    const { color: playerColor } = players[playerId];
    const { boards } = this.themeManager.stocks;
    const board = boards[playerId];

    const card = board.getCards()[0];
    const cardElement = board.getCardElement(card);
    await animations.displayScoring(cardElement, points, playerColor);
  }

  public async notif_scoreVip(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { managers, gamedatas } = this.game;
    const { animations } = managers;
    const { players } = gamedatas;

    const { player_id: playerId, card } = args;
    const { color: playerColor } = players[playerId];

    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    await animations.displayScoring(cardElement, 2, playerColor);
  }

  public async notif_scoreScene(args: {
    player_id: number;
    card: SceneCard;
    points: number;
  }): Promise<void> {
    const { managers, gamedatas } = this.game;
    const { animations } = managers;
    const { players } = gamedatas;

    const { player_id: playerId, card, points } = args;
    const { color: playerColor } = players[playerId];

    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    await animations.displayScoring(cardElement, points, playerColor);
  }

  public notif_setPlayerCounterPrivate(args: {
    player_id: number;
    name: "staff";
    inc: number;
  }): void {
    const { player_id: playerId, inc, name } = args;
    const counter = this.counters[name][playerId];
    counter.incValue(inc);
  }

  public notif_setPlayerCounter(args: {
    playerId: number;
    name: "player_score";
    value: number;
  }): void {
    const { playerId, value, name } = args;

    if (name === "player_score") {
      const starManager = new StarManager(this.game);
      starManager.set(playerId, value);
    }
  }
}
