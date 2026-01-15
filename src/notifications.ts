class NotifManager {
  private readonly game: SCP;
  private readonly counters: Counters;
  private readonly themeManager: ThemeManager;
  private readonly sceneManager: SceneManager;
  private readonly vipManager: VipManager;
  private readonly meepleManager: MeepleManager;

  constructor(game: SCP) {
    this.game = game;
    this.counters = this.game.managers.counters;
    this.themeManager = new ThemeManager(this.game);
    this.sceneManager = new SceneManager(this.game);
    this.vipManager = new VipManager(this.game);
    this.meepleManager = new MeepleManager(this.game);
  }

  public setIgnoreChecks() {
    const { notifqueue, player_id } = this.game;

    const notifsToIgnore = [
      "getTheme",
      "dealScenes",
      "placeScene",
      "discardScene",
      "discardBoth",
      "shiftScenes",
      "receiveScenes",
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

  public async notif_dealScenes(args: { player_id: number }): Promise<void> {
    const { player_id: playerId } = args;
    const { fakeHands, deck } = this.sceneManager.stocks;

    const fakeCards: SceneCard[] = [];
    for (let i = 1; i <= 8; i++) {
      fakeCards.push({ id: -i, type: "scene" });
    }

    await fakeHands[playerId].addCards(fakeCards, { fromStock: deck });
  }

  public async notif_placeScenePrivate(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    const { player_id: playerId, card } = args;

    if (card.type === "scene") {
      this.playSound("hammer");
    }

    const { boards, genreDeck } = this.sceneManager.stocks;

    await boards[playerId].addCard(card, {
      fromStock: card.type === "genre" ? genreDeck : undefined,
      toPlaceholder: "off",
    });
  }

  public async notif_placeScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    this.playSound("hammer");

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
    this.playSound("door");

    const { card } = args;
    const { discard } = this.sceneManager.stocks;

    await discard.addCard(card);
  }

  public async notif_discardScene(args: {
    player_id: number;
    card: SceneCard;
  }): Promise<void> {
    this.playSound("door");

    const { player_id: playerId, card } = args;
    const { discard, fakeHands } = this.sceneManager.stocks;

    await discard.addCard(card, {
      fromStock: fakeHands[playerId],
    });
  }

  public async notif_discardBothPrivate(args: {
    cards: SceneCard[];
  }): Promise<void> {
    this.playSound("insect");

    const { cards } = args;
    const { discard } = this.sceneManager.stocks;

    await discard.addCards(cards);
  }

  public async notif_discardBoth(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    this.playSound("insect");

    const { player_id: playerId, cards } = args;
    const { discard, fakeHands } = this.sceneManager.stocks;

    await discard.addCards(cards, {
      fromStock: fakeHands[playerId],
    });
  }

  public async notif_shiftScenesPrivate(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    await this.notif_shiftScenes(args);
  }

  public async notif_shiftScenes(args: {
    player_id: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id: playerId, cards } = args;
    const { boards } = this.sceneManager.stocks;
    const board = boards[playerId];

    const promises = [];
    cards.forEach((card) => {
      const animation = board.addCard(card);
      promises.push(animation);
    });

    await Promise.all(promises);
  }

  public async notif_passScenes(args: {
    player_id: number;
    player_id2: number;
  }): Promise<void> {
    const { player_id2: playerId2 } = args;
    const { hand, fakeHands } = this.sceneManager.stocks;
    const cards = hand.getCards();
    await fakeHands[playerId2].addCards(cards);
  }

  public async notif_receiveScenesPrivate(args: {
    player_id: number;
    player_id2: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { cards, player_id2: playerId2 } = args;

    const { hand, fakeHands } = this.sceneManager.stocks;
    hand.addCards(cards, {
      fromStock: fakeHands[playerId2],
    });
  }

  public async notif_receiveScenes(args: {
    player_id: number;
    player_id2: number;
    cards: SceneCard[];
  }): Promise<void> {
    const { player_id } = this.game;
    const { player_id: playerId, player_id2: playerId2, cards } = args;
    const { fakeHands } = this.sceneManager.stocks;

    if (playerId2 === player_id) {
      return;
    }

    fakeHands[playerId].addCards(cards, {
      fromStock: fakeHands[playerId2],
      toPlaceholder: "off",
      fromPlaceholder: "on",
    });
  }

  public async notif_renewHand(args: {
    oldCards: SceneCard[];
    newCards: SceneCard[];
    player_id: number;
  }): Promise<void> {
    let { player_id: playerId, oldCards, newCards } = args;
    const { hand, deck, discard, fakeHands } = this.sceneManager.stocks;

    if (this.game.isSpectator) {
      const fakeHand = fakeHands[playerId];

      oldCards = oldCards.map((card) => {
        delete card.type_arg;
        return card;
      });

      newCards = newCards.map((card) => {
        delete card.type_arg;
        return card;
      });

      await discard.addCards(oldCards, { fromStock: fakeHand });
      await fakeHand.addCards(newCards, { fromStock: deck });

      return;
    }

    await discard.addCards(oldCards);
    await hand.addCards(newCards, { fromStock: deck });
  }

  public async notif_drawToDiscard(args: {
    cards: SceneCard[];
  }): Promise<void> {
    const { cards } = args;
    const { discard, deck } = this.sceneManager.stocks;
    await discard.addCards(cards, { fromStock: deck }, true);
  }

  public async notif_dayEnd(args: {
    previousDay: number;
    day: number;
  }): Promise<void> {
    const { previousDay, day } = args;

    const { gamedatas, keysToNumbers } = this.game;
    const { players } = gamedatas;
    const { tracks } = this.meepleManager.stocks;
    keysToNumbers(players).forEach((playerId) => {
      tracks[playerId][0].addCard(
        { id: playerId },
        { fromPlaceholder: "off", toPlaceholder: "off" }
      );
    });

    const { board } = this.vipManager.stocks;
    const card = board.getCards().find((card) => {
      return Number(card.location_arg) === previousDay;
    });
    board.flipCard(card);

    this.game.togglePassDirection(day);

    document
      .querySelectorAll(".scp_scene-vipFulfilling")
      .forEach((cardElement) => {
        cardElement.classList.remove("scp_scene-vipFulfilling");
      });
  }

  public async notif_scoreTheme(args: {
    player_id: number;
    points: number;
  }): Promise<void> {
    const { player_id: playerId, points } = args;
    const { boards } = this.themeManager.stocks;
    const board = boards[playerId];

    const card = board.getCards()[0];
    const cardElement = board.getCardElement(card);
    this.displayScoring(playerId, points, cardElement);
  }

  public async notif_scoreVip(args: {
    player_id: number;
    card: SceneCard;
    slot: number;
  }): Promise<void> {
    this.playSound("steps");

    const { player_id: playerId, card, slot } = args;

    const { tracks } = this.meepleManager.stocks;
    const track = tracks[playerId];
    await track[slot].addCard(
      { id: playerId },
      {
        forceToElement: document.querySelector(
          `#scp_scenes-${playerId} [data-slot-id="${slot}"]`
        ),
        fromPlaceholder: "off",
        toPlaceholder: "off",
      }
    );

    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    await this.displayScoring(playerId, 2, cardElement);
  }

  public async notif_scoreScene(args: {
    player_id: number;
    card: SceneCard;
    points: number;
  }): Promise<void> {
    const { player_id: playerId, card, points } = args;

    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    await this.displayScoring(playerId, points, cardElement);
  }

  public async notif_completeScene(args: {
    player_id: number;
    card: SceneCard;
  }) {
    const { player_id: playerId, card } = args;
    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    cardElement.classList.add("scp_scene-completed");
  }

  public async notif_updateVipFulfilling(args: {
    player_id: number;
    card: SceneCard;
    fulfills: boolean;
  }) {
    const { player_id: playerId, card, fulfills } = args;
    const { boards } = this.sceneManager.stocks;
    const cardElement = boards[playerId].getCardElement(card);
    cardElement.classList.toggle("scp_scene-vipFulfilling", fulfills);
  }

  public notif_setPlayerCounterPrivate(args: {
    player_id: number;
    name: "staff" | "candelabra" | "lightbulb" | "audio" | "skull";
    value?: number;
    inc?: number;
  }): void {
    const { player_id: playerId, name, value, inc } = args;

    const counter = this.counters.player[name][playerId];

    if (value) {
      counter.toValue(value);
      return;
    }

    counter.incValue(inc);
  }

  public notif_setPlayerCounter(args: {
    playerId: number;
    value: number;
    name:
      | "player_score"
      | "ability"
      | "candelabra"
      | "lightbulb"
      | "audio"
      | "skull";
    manual?: boolean;
  }): void {
    const { playerId, value, name, manual } = args;

    if (name === "player_score") {
      const starManager = new StarManager(this.game);
      starManager.set(playerId, value);
      return;
    }

    if (manual) {
      const counter = this.counters.player[name][playerId];
      counter.toValue(value);
    }
  }

  public async notif_undoTurn(args: {
    player_id: number;
    staff: number;
    ability: number;
    candelabra: number;
    lightbulb: number;
    audio: number;
    skull: number;
    draftedCards: SceneCard[];
    shiftedCards: SceneCard[];
    completedScenes: number[];
    vipFulfilling: number[];
  }): Promise<void> {
    const {
      player_id: playerId,
      staff,
      ability,
      candelabra,
      lightbulb,
      audio,
      skull,
      draftedCards,
      shiftedCards,
      completedScenes,
      vipFulfilling,
    } = args;

    document.querySelectorAll(".scp_scene-completed").forEach((cardElement) => {
      const cardId = Number(cardElement.id.split("scp_scene-")[1]);

      cardElement.classList.toggle(
        "scp_scene-completed",
        completedScenes.includes(cardId)
      );
    });

    document
      .querySelectorAll(".scp_scene-vipFulfilling")
      .forEach((cardElement) => {
        const cardId = Number(cardElement.id.split("scp_scene-")[1]);

        cardElement.classList.toggle(
          "scp_scene-vipFulfilling",
          vipFulfilling.includes(cardId)
        );
      });

    const { hand, boards, discard } = this.sceneManager.stocks;
    for (const card of draftedCards) {
      if (card.type === "genre") {
        await boards[playerId].removeCard(card, {
          fadeOut: true,
          slideTo: document.getElementById("scp_genreDeck"),
        });
        continue;
      }

      await hand.addCard(card, {
        fromStock: ["todiscard", "discard"].includes(card.location)
          ? discard
          : undefined,
      });
    }

    this.notif_shiftScenes({ player_id: playerId, cards: shiftedCards });

    const counters = this.counters.player;
    counters.staff[playerId].toValue(staff);
    counters.ability[playerId].toValue(ability);
    counters.candelabra[playerId].toValue(candelabra);
    counters.lightbulb[playerId].toValue(lightbulb);
    counters.audio[playerId].toValue(audio);
    counters.skull[playerId].toValue(skull);
  }

  private async displayScoring(
    playerId: number,
    points: number,
    cardElement: HTMLElement
  ): Promise<void> {
    const { gamedatas, managers } = this.game;
    const { players } = gamedatas;
    const { color: playerColor } = players[playerId];
    await managers.animations.displayScoring(cardElement, points, playerColor);
  }

  private playSound(soundId: "hammer" | "door" | "steps" | "insect"): void {
    if (this.game.getGameUserPreference(101) === 0) {
      return;
    }

    this.game.disableNextMoveSound();
    this.game.sounds.play(soundId);
  }
}
