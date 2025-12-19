var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var advThrottle = function (func, delay, options) {
    if (options === void 0) { options = { leading: true, trailing: false }; }
    var timer = null, lastRan = null, trailingArgs = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) { //called within cooldown period
            lastRan = this; //update context
            trailingArgs = args; //save for later
            return;
        }
        if (options.leading) { // if leading
            func.call.apply(// if leading
            func, __spreadArray([this], args, false)); //call the 1st instance
        }
        else { // else it's trailing
            lastRan = this; //update context
            trailingArgs = args; //save for later
        }
        var coolDownPeriodComplete = function () {
            if (options.trailing && trailingArgs) { // if trailing and the trailing args exist
                func.call.apply(// if trailing and the trailing args exist
                func, __spreadArray([lastRan], trailingArgs, false)); //invoke the instance with stored context "lastRan"
                lastRan = null; //reset the status of lastRan
                trailingArgs = null; //reset trailing arguments
                timer = setTimeout(coolDownPeriodComplete, delay); //clear the timout
            }
            else {
                timer = null; // reset timer
            }
        };
        timer = setTimeout(coolDownPeriodComplete, delay);
    };
};
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, }));
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
        window.addEventListener('resize', advThrottle(function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        }, this.throttleTime, { leading: true, trailing: true, }));
        if (window.ResizeObserver) {
            new ResizeObserver(advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, })).observe(settings.element);
        }
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     * Unsafe method as this is not protected by throttle. Surround with  `advThrottle(() => this.zoomOrDimensionChanged(), this.throttleTime, { leading: true, trailing: true, })` to avoid spamming recomputation.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.offsetWidth / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.offsetHeight * this._zoom, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BgaHelpButton = /** @class */ (function () {
    function BgaHelpButton() {
    }
    return BgaHelpButton;
}());
var BgaHelpPopinButton = /** @class */ (function (_super) {
    __extends(BgaHelpPopinButton, _super);
    function BgaHelpPopinButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpPopinButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var button = document.createElement('button');
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_popin-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "?";
        if (this.settings.buttonBackground) {
            button.style.setProperty('--background', this.settings.buttonBackground);
        }
        if (this.settings.buttonColor) {
            button.style.setProperty('--color', this.settings.buttonColor);
        }
        toElement.appendChild(button);
        button.addEventListener('click', function () { return _this.showHelp(); });
    };
    BgaHelpPopinButton.prototype.showHelp = function () {
        var _a, _b, _c;
        var popinDialog = new window.ebg.popindialog();
        popinDialog.create('bgaHelpDialog');
        popinDialog.setTitle(this.settings.title);
        popinDialog.setContent("<div id=\"help-dialog-content\">".concat((_a = this.settings.html) !== null && _a !== void 0 ? _a : '', "</div>"));
        (_c = (_b = this.settings).onPopinCreated) === null || _c === void 0 ? void 0 : _c.call(_b, document.getElementById('help-dialog-content'));
        popinDialog.show();
    };
    return BgaHelpPopinButton;
}(BgaHelpButton));
var BgaHelpExpandableButton = /** @class */ (function (_super) {
    __extends(BgaHelpExpandableButton, _super);
    function BgaHelpExpandableButton(settings) {
        var _this = _super.call(this) || this;
        _this.settings = settings;
        return _this;
    }
    BgaHelpExpandableButton.prototype.add = function (toElement) {
        var _a;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var folded = (_b = this.settings.defaultFolded) !== null && _b !== void 0 ? _b : true;
        if (this.settings.localStorageFoldedKey) {
            var localStorageValue = localStorage.getItem(this.settings.localStorageFoldedKey);
            if (localStorageValue) {
                folded = localStorageValue == 'true';
            }
        }
        var button = document.createElement('button');
        button.dataset.folded = folded.toString();
        (_a = button.classList).add.apply(_a, __spreadArray(['bga-help_button', 'bga-help_expandable-button'], (this.settings.buttonExtraClasses ? this.settings.buttonExtraClasses.split(/\s+/g) : []), false));
        button.innerHTML = "\n            <div class=\"bga-help_folded-content ".concat(((_c = this.settings.foldedContentExtraClasses) !== null && _c !== void 0 ? _c : '').split(/\s+/g), "\">").concat((_d = this.settings.foldedHtml) !== null && _d !== void 0 ? _d : '', "</div>\n            <div class=\"bga-help_unfolded-content  ").concat(((_e = this.settings.unfoldedContentExtraClasses) !== null && _e !== void 0 ? _e : '').split(/\s+/g), "\">").concat((_f = this.settings.unfoldedHtml) !== null && _f !== void 0 ? _f : '', "</div>\n        ");
        button.style.setProperty('--expanded-width', (_g = this.settings.expandedWidth) !== null && _g !== void 0 ? _g : 'auto');
        button.style.setProperty('--expanded-height', (_h = this.settings.expandedHeight) !== null && _h !== void 0 ? _h : 'auto');
        button.style.setProperty('--expanded-radius', (_j = this.settings.expandedRadius) !== null && _j !== void 0 ? _j : '10px');
        toElement.appendChild(button);
        button.addEventListener('click', function () {
            button.dataset.folded = button.dataset.folded == 'true' ? 'false' : 'true';
            if (_this.settings.localStorageFoldedKey) {
                localStorage.setItem(_this.settings.localStorageFoldedKey, button.dataset.folded);
            }
        });
    };
    return BgaHelpExpandableButton;
}(BgaHelpButton));
var HelpManager = /** @class */ (function () {
    function HelpManager(game, settings) {
        this.game = game;
        if (!(settings === null || settings === void 0 ? void 0 : settings.buttons)) {
            throw new Error('HelpManager need a `buttons` list in the settings.');
        }
        var leftSide = document.getElementById('left-side');
        var buttons = document.createElement('div');
        buttons.id = "bga-help_buttons";
        leftSide.appendChild(buttons);
        settings.buttons.forEach(function (button) { return button.add(buttons); });
    }
    return HelpManager;
}());
var Template = /** @class */ (function () {
    function Template(game) {
        this.game = game;
    }
    Template.prototype.setup = function () {
        var _this = this;
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
                animationsActive: function () {
                    return _this.game.bgaAnimationsActive();
                },
            }),
            counters: {
                player: {},
                table: {},
            },
        };
        this.game.stocks = {};
        document.getElementById("generalactions").insertAdjacentHTML("beforebegin", "<div id=\"scp_defaultActions\" class=\"scp_defaultActions\"></div>\n      <div id=\"scp_alertActions\" class=\"scp_alertActions\"></div>");
        this.game.addTooltipHtml("scp_sceneDeck", "<div class=\"scp_tooltip\"><span>".concat(_("scene cards"), "</span></div>"));
        this.game.addTooltipHtml("scp_genreDeck", "<div class=\"scp_tooltip\"><span>".concat(_("genre cards"), "</span></div>"));
        this.loadSounds();
        this.setupReferences();
        this.setupZones();
        this.setupStocks();
        this.setupCounters();
    };
    Template.prototype.loadSounds = function () {
        var sounds = this.game.sounds;
        sounds.load("hammer", "hammer");
        sounds.load("door", "door");
        sounds.load("violin", "violin");
        sounds.load("steps", "steps");
    };
    Template.prototype.setupReferences = function () {
        var _a = this.game, gamedatas = _a.gamedatas, player_id = _a.player_id;
        var players = gamedatas.players;
        var playerColor = players[player_id].color;
        var colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
        var colorId = colors.indexOf(playerColor) + 1;
        new HelpManager(this.game, {
            buttons: [
                new BgaHelpExpandableButton({
                    expandedHeight: "320px",
                    expandedWidth: "235px",
                    foldedHtml: "<div class=\"scp_foldedHelp\">?</div>",
                    unfoldedHtml: "<div id=\"scp_reference\" class=\"scp_card scp_reference\"\n          style=\"background-image: url(".concat(g_gamethemeurl, "img/references/reference_").concat(colorId, ".jpg)\">\n          </div>"),
                }),
            ],
        });
        this.game.addTooltipHtml("scp_reference", "<div class=\"scp_tooltip scp_tooltip-reference\">\n        <h3 class=\"scp_title\">".concat(_("Scoring"), "</h3>\n        <div>\n          <h4 class=\"scp_title\">").concat(_("End of Round (Day)"), "</h4>\n          <ul>\n            <li>").concat(_("Up to 2 points per scene (Theme)"), "</li>\n            <li>").concat(_("2 points per scene the VIP has entered"), "</li>\n          </ul>\n        </div>\n        <div>\n          <h4 class=\"scp_title\">").concat(_("End of Game"), "</h4>\n          <ul>\n            <li>").concat(_("Score completed scenes"), "</li>\n            <li>").concat(this.game.format_string_recursive(_("3 points for players with most ${lightning_icon}"), {
            lightning_icon: "",
        }), "</li>\n            <li>").concat(this.game.format_string_recursive(_("1 point each ${staffCost_icon} icon"), {
            staffing_icon: "",
        }), "</li>\n            <li>").concat(_("6 points for set of scenic symbols"), "</li>\n          </ul>\n        </div>\n      </div>"));
    };
    Template.prototype.setupZones = function () {
        var _this = this;
        var _a = this.game, gamedatas = _a.gamedatas, player_id = _a.player_id;
        var players = gamedatas.players, nextPlayers = gamedatas.nextPlayers, prevPlayers = gamedatas.prevPlayers, day = gamedatas.day, isSolo = gamedatas.isSolo;
        delete nextPlayers[0];
        this.game.keysFromMap(nextPlayers, player_id).forEach(function (playerId) {
            var playerColor = players[playerId].color;
            var playerName = _this.game.getFormattedPlayerName(playerId);
            var isCurrentPlayerId = player_id === playerId;
            var title = isCurrentPlayerId
                ? _this.game.format_string_recursive(_("${player_name} (You)"), {
                    player_name: playerName,
                })
                : playerName;
            var nextPlayerId = nextPlayers[playerId];
            var nextPlayerName = _this.game.getFormattedPlayerName(nextPlayerId);
            var nextPlayer = _this.game.format_string_recursive(_("${arrow} ${player_name} ${arrow}"), {
                arrow: "<i class=\"fa6 fa6-solid fa6-arrow-right\"></i>",
                player_name: nextPlayerName,
            });
            var nextPlayerColor = players[nextPlayerId].color;
            var prevPlayerId = prevPlayers[playerId];
            var prevPlayerName = _this.game.getFormattedPlayerName(prevPlayerId);
            var prevPlayer = _this.game.format_string_recursive(_("${arrow} ${player_name} ${arrow}"), {
                arrow: "<i class=\"fa6 fa6-solid fa6-arrow-right\"></i>",
                player_name: prevPlayerName,
            });
            var prevPlayerColor = players[prevPlayerId].color;
            var zones = document.getElementById("scp_playerZones");
            zones.insertAdjacentHTML("beforeend", "<div id=\"scp_playerZone-".concat(playerId, "\" class=\"scp_playerZone ").concat(isCurrentPlayerId ? "scp_playerZone-current" : "", "\" style=\"border-color: #").concat(playerColor, ";\">\n          <div class=\"scp_zoneTitles\">\n            ").concat(isSolo
                ? ""
                : "<a href=\"#scp_playerZone-".concat(prevPlayerId, "\" \n                id=\"scp_prevPlayer-").concat(playerId, "\" class=\"scp_title scp_nextPlayer scp_prevPlayer\" \n                style=\"color: #").concat(prevPlayerColor, "; background-color: #").concat(prevPlayerColor, "40;\">\n              ").concat(prevPlayer, "\n            </a>"), "\n            <h3 class=\"scp_title\" style=\"color: #").concat(playerColor, "; background-color: #").concat(playerColor, "40;\">\n              ").concat(title, "\n            </h3>\n            ").concat(isSolo
                ? ""
                : "<a href=\"#scp_playerZone-".concat(nextPlayerId, "\" \n              id=\"scp_nextPlayer-").concat(playerId, "\" class=\"scp_title scp_nextPlayer\" \n              style=\"color: #").concat(nextPlayerColor, "; background-color: #").concat(nextPlayerColor, "40;\">\n              ").concat(nextPlayer, "\n            </a>"), "\n          </div>\n            ").concat(isCurrentPlayerId
                ? "<div id=\"scp_hand\" class=\"scp_hand\"></div>"
                : "", "\n          <div id=\"scp_fakeHand-").concat(playerId, "\" class=\"scp_fakeHand\"></div>\n          <div id=\"scp_meepleHouse-").concat(playerId, "\" class=\"scp_meepleHouse\"></div>\n          <div class=\"scp_playerBoard\">\n            <div id=\"scp_themes-").concat(playerId, "\" class=\"scp_themes\"></div>\n            <div id=\"scp_scenes-").concat(playerId, "\" class=\"scp_scenes\"></div>\n          </div>\n        </div>"));
            if (isSolo) {
                return;
            }
            _this.game.addTooltipHtml("scp_nextPlayer-".concat(playerId), "<div class=\"scp_tooltip\">\n            <span>\n            ".concat(_this.game.format_string_recursive(_("${player_name} passes cards to ${player_name2}"), {
                player_name: playerName,
                player_name2: nextPlayerName,
            }), "\n            </span>\n        </div>"));
            _this.game.addTooltipHtml("scp_prevPlayer-".concat(playerId), "<div class=\"scp_tooltip\">\n            <span>\n            ".concat(_this.game.format_string_recursive(_("${player_name} receives cards from ${player_name2}"), {
                player_name: playerName,
                player_name2: nextPlayerName,
            }), "\n            </span>\n        </div>"));
        });
        this.game.togglePassDirection(day);
    };
    Template.prototype.setupStocks = function () {
        var vipManager = new VipManager(this.game);
        vipManager.setup();
        var sceneManager = new SceneManager(this.game);
        sceneManager.setup();
        var themeManager = new ThemeManager(this.game);
        themeManager.setup();
        var meepleManager = new MeepleManager(this.game);
        meepleManager.setup();
        this.setupStars();
    };
    Template.prototype.setupStars = function () {
        var starTrack = document.getElementById("scp_starTrack");
        for (var points = 0; points < 80; points++) {
            starTrack.insertAdjacentHTML("beforeend", "<div id=\"scp_stars-".concat(points, "\" class=\"scp_stars scp_stars-").concat(points, "\"></div>"));
        }
        var starManager = new StarManager(this.game);
        starManager.setup();
    };
    Template.prototype.setupCounters = function () {
        var _this = this;
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers, managers = _a.managers, player_id = _a.player_id;
        var isSolo = gamedatas.isSolo, players = gamedatas.players, staffCounts = gamedatas.staffCounts, staffCountPrivate = gamedatas.staffCountPrivate, abilityCounts = gamedatas.abilityCounts, oppAbilityCount = gamedatas.oppAbilityCount;
        var counters = managers.counters;
        counters.player = {
            staff: {},
            candelabra: {},
            lightbulb: {},
            audio: {},
            skull: {},
        };
        keysToNumbers(players).forEach(function (playerId) {
            _this.game.getPlayerPanelElement(playerId).insertAdjacentHTML("beforeend", "<div id=\"scp_staffCounter-".concat(playerId, "\" class=\"scp_counter scp_staffCounter\">\n          <i id=\"scp_staffCounterIcon-").concat(playerId, "\" class=\"scp_staffCounterIcon\"></i>\n          <span id=\"scp_staffCounterCount-").concat(playerId, "\" class=\"scp_count\"></span>\n        </div>\n        <div id=\"scp_abilityCounter-").concat(playerId, "\" class=\"scp_counter scp_abilityCounter\">\n          <i id=\"scp_abilityCounterIcon-").concat(playerId, "\" class=\"scp_abilityCounterIcon\"></i>\n          <div id=\"scp_abilityCounterCounts-").concat(playerId, "\" class=\"scp_abilityCounterCounts\">\n            <span id=\"scp_abilityCounterCount-").concat(playerId, "\" class=\"scp_count\"></span>\n            ").concat(isSolo
                ? "x<span id=\"scp_oppAbilityCounterCount\" class=\"scp_count\"></span>"
                : "", "\n          </div>\n        </div>\n        <div id=\"scp_candelabraCounter-").concat(playerId, "\" class=\"scp_counter scp_candelabraCounter\">\n          <i id=\"scp_candelabraCounterIcon-").concat(playerId, "\" class=\"scp_candelabraCounterIcon\"></i>\n          <span id=\"scp_candelabraCounterCount-").concat(playerId, "\" class=\"scp_counterCount\"></span>\n        </div>\n        <div id=\"scp_lightbulbCounter-").concat(playerId, "\" class=\"scp_counter scp_lightbulbCounter\">\n          <i id=\"scp_lightbulbCounterIcon-").concat(playerId, "\" class=\"scp_lightbulbCounterIcon\"></i>\n          <span id=\"scp_lightbulbCounterCount-").concat(playerId, "\" class=\"scp_count\"></span>\n        </div>\n        <div id=\"scp_audioCounter-").concat(playerId, "\" class=\"scp_counter scp_audioCounter\">\n          <i id=\"scp_audioCounterIcon-").concat(playerId, "\" class=\"scp_audioCounterIcon\"></i>\n          <span id=\"scp_audioCounterCount-").concat(playerId, "\" class=\"scp_count\"></span>\n        </div>\n        <div id=\"scp_skullCounter-").concat(playerId, "\" class=\"scp_counter scp_skullCounter\">\n          <i id=\"scp_skullCounterIcon-").concat(playerId, "\" class=\"scp_skullCounterIcon\"></i>\n          <span id=\"scp_skullCounterCount-").concat(playerId, "\" class=\"scp_count\"></span>\n        </div>"));
            _this.game.addTooltipHtml("scp_staffCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("staff tokens"), "</span></div>"));
            var staffCounter = new ebg.counter();
            staffCounter.create("scp_staffCounterCount-".concat(playerId), {
                value: player_id === playerId ? staffCountPrivate : staffCounts[playerId],
                playerCounter: "staff",
                playerId: playerId,
            });
            _this.game.addTooltipHtml("scp_candelabraCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("candelabra symbols"), "</span></div>"));
            var candelabraCounter = new ebg.counter();
            candelabraCounter.create("scp_candelabraCounterCount-".concat(playerId), {
                playerCounter: "candelabra",
                playerId: playerId,
            });
            _this.game.addTooltipHtml("scp_lightbulbCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("lightbulb symbols"), "</span></div>"));
            var lightbulbCounter = new ebg.counter();
            lightbulbCounter.create("scp_lightbulbCounterCount-".concat(playerId), {
                playerCounter: "lightbulb",
                playerId: playerId,
            });
            _this.game.addTooltipHtml("scp_audioCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("audio symbols"), "</span></div>"));
            var audioCounter = new ebg.counter();
            audioCounter.create("scp_audioCounterCount-".concat(playerId), {
                playerCounter: "audio",
                playerId: playerId,
            });
            _this.game.addTooltipHtml("scp_skullCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("skull symbols"), "</span></div>"));
            var skullCounter = new ebg.counter();
            skullCounter.create("scp_skullCounterCount-".concat(playerId), {
                playerCounter: "skull",
                playerId: playerId,
            });
            _this.game.addTooltipHtml("scp_abilityCounter-".concat(playerId), "<div class=\"scp_tooltip\"><span>".concat(_("special effects played"), "</span></div>"));
            var abilityCounter = new ebg.counter();
            abilityCounter.create("scp_abilityCounterCount-".concat(playerId), {
                value: abilityCounts[playerId],
                playerCounter: "ability",
                playerId: playerId,
            });
            counters.player.staff[playerId] = staffCounter;
        });
        if (isSolo) {
            var oppAbilityCounter = new ebg.counter();
            oppAbilityCounter.create("scp_oppAbilityCounterCount", {
                value: oppAbilityCount,
                tableCounter: "oppAbility",
            });
            counters.table.ability = oppAbilityCounter;
        }
        managers.counters = counters;
    };
    return Template;
}());
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// @ts-ignore
GameGui = (function () {
    // this hack required so we fake extend Game
    function Game() { }
    return Game;
})();
// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
var SCP = /** @class */ (function (_super) {
    __extends(SCP, _super);
    // @ts-ignore
    function SCP() {
        var _this = this;
        return _this;
    }
    SCP.prototype.setup = function (gamedatas) {
        this._attachedTooltips = {};
        this._registeredCustomTooltips = {};
        var template = new Template(this);
        template.setup();
        this.setupNotifications();
    };
    SCP.prototype.onEnteringState = function (stateName, args) {
        var stateManager = new StateManager(this);
        stateManager.onEntering(stateName, args.args);
    };
    SCP.prototype.onLeavingState = function (stateName) {
        var stateManager = new StateManager(this);
        stateManager.onLeaving(stateName);
    };
    SCP.prototype.onUpdateActionButtons = function (stateName, args) {
        this.attachRegisteredTooltips();
        var stateManager = new StateManager(this);
        stateManager.onUpdate(stateName, args);
    };
    SCP.prototype.setupNotifications = function () {
        var notifManager = new NotifManager(this);
        notifManager.setIgnoreChecks();
        this.bgaSetupPromiseNotifications({ handlers: [notifManager] });
    };
    SCP.prototype.performAction = function (actionName, args, params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.bgaPerformAction(actionName, args, params).finally(function () {
                        if (_this.on_client_state) {
                            _this.restoreServerGameState();
                        }
                    })];
            });
        });
    };
    SCP.prototype.addButton = function (label, callback, params) {
        var _a;
        if (params === void 0) { params = {}; }
        params.type = params.type || "default";
        var id = params.id ||
            "scp_button-".concat(Date.now().toString(36)).concat(Math.random()
                .toString(36)
                .slice(2));
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.remove();
        params.destination =
            params.destination ||
                document.getElementById("scp_".concat(params.type, "Actions"));
        params.color =
            params.color || (params.type === "alert" ? "alert" : "primary");
        this.statusBar.addActionButton(label, function () {
            callback();
        }, __assign({ id: id, classes: ["scp_button"] }, params));
    };
    SCP.prototype.clearButtons = function (preserveAlert) {
        if (preserveAlert === void 0) { preserveAlert = false; }
        document.getElementById("scp_defaultActions").innerHTML = "";
        if (!preserveAlert) {
            document.getElementById("scp_alertActions").innerHTML = "";
        }
    };
    SCP.prototype.keysToNumbers = function (object) {
        var keys = Object.keys(object).map(function (key) {
            return Number(key);
        });
        return keys;
    };
    SCP.prototype.keysFromMap = function (map, startKey) {
        var keys = this.keysToNumbers(map);
        var startIndex = keys.indexOf(startKey);
        if (startIndex === -1) {
            return keys;
        }
        var circularKeys = [];
        var key = startKey;
        for (var i = 0; i < keys.length; i++) {
            circularKeys.push(key);
            key = map[key];
        }
        return circularKeys;
    };
    SCP.prototype.togglePassDirection = function (day) {
        var _this = this;
        var _a = this.gamedatas, players = _a.players, prevPlayers = _a.prevPlayers, nextPlayers = _a.nextPlayers, isSolo = _a.isSolo;
        if (day > 3 || isSolo) {
            return;
        }
        var isClockwise = day !== 2;
        this.keysToNumbers(players).forEach(function (playerId) {
            var playerZone = document.getElementById("scp_playerZone-".concat(playerId));
            playerZone.querySelectorAll("i").forEach(function (icon) {
                icon.classList.toggle("fa6-arrow-left", !isClockwise);
                icon.classList.toggle("fa6-arrow-right", isClockwise);
            });
            var playerName = _this.getFormattedPlayerName(playerId);
            var prevPlayerId = prevPlayers[playerId];
            var prevPlayerName = _this.getFormattedPlayerName(prevPlayerId);
            var prevTooltip = isClockwise
                ? _this.format_string_recursive(_("${player_name} receives cards from ${player_name2}"), {
                    player_name: playerName,
                    player_name2: prevPlayerName,
                })
                : _this.format_string_recursive(_("${player_name} pass cards to ${player_name2}"), {
                    player_name: playerName,
                    player_name2: prevPlayerName,
                });
            _this.addTooltipHtml("scp_prevPlayer-".concat(playerId), "<div class=\"scp_tooltip\">\n            <span>\n            ".concat(prevTooltip, "\n            </span>\n        </div>"));
            var nextPlayerId = nextPlayers[playerId];
            var nextPlayerName = _this.getFormattedPlayerName(nextPlayerId);
            var nextTooltip = isClockwise
                ? _this.format_string_recursive(_("${player_name} pass cards to ${player_name2}"), {
                    player_name: playerName,
                    player_name2: nextPlayerName,
                })
                : _this.format_string_recursive(_("${player_name} receive cards from ${player_name2}"), {
                    player_name: playerName,
                    player_name2: nextPlayerName,
                });
            _this.addTooltipHtml("scp_nextPlayer-".concat(playerId), "<div class=\"scp_tooltip\">\n            <span>\n            ".concat(nextTooltip, "\n            </span>\n        </div>"));
        });
    };
    SCP.prototype.bgaFormatText = function (log, args) {
        var _this = this;
        try {
            this.addIcons(log, args);
            var keys = Object.keys(args);
            keys.forEach(function (key) {
                if (key.includes("Label")) {
                    var uid = "".concat(Date.now().toString(36)).concat(Math.random()
                        .toString(36)
                        .slice(2));
                    var elementId = "scp_logLabel-".concat(uid);
                    args[key] = "<span id=\"".concat(elementId, "\" style=\"font-weight: bold\">").concat(_(args[key]), "</span>");
                    if (key.includes("sceneLabel")) {
                        var sceneIdKey = "sceneId" + key.split("Label")[1];
                        var sceneId = args[sceneIdKey];
                        var tooltip = "<div id=\"scp_tooltip-".concat(sceneId, "-").concat(uid, "\" class=\"scp_card scp_scene scp_logTooltip bga-cards_card\"\n            style=\"background-image: url(").concat(g_gamethemeurl, "img/scenes/scene_").concat(sceneId, ".jpg)\"></div>");
                        _this.registerCustomTooltip(elementId, "<div class=\"scp_tooltip\">".concat(tooltip, "</div>"));
                        return;
                    }
                    if (key.includes("genreLabel") && args.genreId) {
                        var genreId = args.genreId;
                        var tooltip = "<div id=\"scp_tooltip-".concat(genreId, "-").concat(uid, "\" class=\"scp_card scp_genre scp_scene scp_logTooltip bga-cards_card\"\n            style=\"background-image: url(").concat(g_gamethemeurl, "img/genres/genre_").concat(genreId, ".jpg)\"></div>");
                        _this.registerCustomTooltip(elementId, "<div class=\"scp_tooltip\">".concat(tooltip, "</div>"));
                        return;
                    }
                    if (key.includes("themeLabel") && args.themeId) {
                        var themeId = args.themeId;
                        var tooltip = "<div id=\"scp_tooltip-".concat(themeId, "-").concat(uid, "\" class=\"scp_card scp_theme scp_logTooltip bga-cards_card\"\n            style=\"background-image: url(").concat(g_gamethemeurl, "img/themes/theme_").concat(themeId, ".jpg)\"></div>");
                        _this.registerCustomTooltip(elementId, "<div class=\"scp_tooltip\">".concat(tooltip, "</div>"));
                        return;
                    }
                }
            });
        }
        catch (error) {
            console.error(error);
        }
        return { log: log, args: args };
    };
    SCP.prototype.addIcons = function (log, args) {
        if (log.includes("${randomGenre_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/genre_0.png)");
            args.randomGenre_icon = "<span class=\"scp_icon scp_icon-genre\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${genre_icon}") && args.genreId) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/genre_").concat(args.genreId, ".png)");
            args.genre_icon = "<span class=\"scp_icon scp_icon-genre\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${candelabra_icon}")) {
            args.candelabra_icon = this.getScenicIcon("candelabra");
        }
        if (log.includes("${lightbulb_icon}")) {
            args.lightbulb_icon = this.getScenicIcon("lightbulb");
        }
        if (log.includes("${audio_icon}")) {
            args.audio_icon = this.getScenicIcon("audio");
        }
        if (log.includes("${skull_icon}")) {
            args.skull_icon = this.getScenicIcon("skull");
        }
        if (log.includes("${lightning_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/lightning.png)");
            args.lightning_icon = "<span class=\"scp_icon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${staff_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/staff.png)");
            args.staff_icon = "<span class=\"scp_icon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${staffCost_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/staffCost.png)");
            args.staffCost_icon = "<span class=\"scp_icon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
    };
    SCP.prototype.getScenicIcon = function (scenicName) {
        var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/").concat(scenicName, ".png)");
        return "<span class=\"scp_icon scp_icon-scenic\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
    };
    SCP.prototype.setLoader = function (image_progress, logs_progress) {
        // @ts-ignore
        this.inherited(arguments); // required, this is "super()" call, do not remove
        if (!this.isLoadingLogsComplete && logs_progress >= 100) {
            this.isLoadingLogsComplete = true;
            this.onLoadingLogsComplete();
        }
    };
    SCP.prototype.onLoadingLogsComplete = function () {
        this.attachRegisteredTooltips();
    };
    SCP.prototype.registerCustomTooltip = function (id, tooltip) {
        this._registeredCustomTooltips[id] = tooltip;
        return id;
    };
    SCP.prototype.attachRegisteredTooltips = function () {
        for (var id in this._registeredCustomTooltips) {
            var tooltip = this._registeredCustomTooltips[id];
            this.addCustomTooltip(id, tooltip);
            this._attachedTooltips[id] = tooltip;
        }
        this._registeredCustomTooltips = {};
    };
    SCP.prototype.addCustomTooltip = function (id, tooltip) {
        this.addTooltipHtml(id, tooltip, 1000);
    };
    return SCP;
}(GameGui));
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl("bga-animations", "1.x"),
    getLibUrl("bga-cards", "1.x"),
    getLibUrl("bga-score-sheet", "1.x"),
], function (dojo, declare, counter, gamegui, BgaAnimations, BgaCards, BgaScoreSheet) {
    window.BgaAnimations = BgaAnimations;
    window.BgaCards = BgaCards;
    window.BgaScoreSheet = BgaScoreSheet;
    return declare("bgagame.screampark", ebg.core.gamegui, new SCP());
});
var NotifManager = /** @class */ (function () {
    function NotifManager(game) {
        this.game = game;
        this.counters = this.game.managers.counters;
        this.themeManager = new ThemeManager(this.game);
        this.sceneManager = new SceneManager(this.game);
        this.vipManager = new VipManager(this.game);
        this.meepleManager = new MeepleManager(this.game);
    }
    NotifManager.prototype.setIgnoreChecks = function () {
        var _a = this.game, notifqueue = _a.notifqueue, player_id = _a.player_id;
        var notifsToIgnore = [
            "getTheme",
            "dealScenes",
            "placeScene",
            "discardScene",
            "discardBoth",
            "shiftScenes",
            "receiveScenes",
        ];
        notifsToIgnore.forEach(function (notifName) {
            notifqueue.setIgnoreNotificationCheck(notifName, function (notif) {
                var playerId = notif.args.player_id;
                return playerId === player_id;
            });
        });
        notifqueue.setIgnoreNotificationCheck("setPlayerCounter", function (notif) {
            var _a = notif.args, playerId = _a.playerId, ignore = _a.ignore;
            return playerId === player_id && ignore;
        });
    };
    NotifManager.prototype.notif_discardTheme = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, cardId, boards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, cardId = args.cardId;
                        boards = this.themeManager.stocks.boards;
                        return [4 /*yield*/, boards[playerId].removeCard({ id: cardId }, { fadeOut: true, slideTo: document.getElementById("player_boards") })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_getTheme = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, cardId, boards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, cardId = args.cardId;
                        boards = this.themeManager.stocks.boards;
                        return [4 /*yield*/, boards[playerId].addCard({ id: cardId }, {
                                fromElement: document.getElementById("player_boards"),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_getThemePrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, boards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, card = args.card;
                        boards = this.themeManager.stocks.boards;
                        return [4 /*yield*/, boards[playerId].addCard(card, {
                                fromElement: document.getElementById("player_boards"),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_revealTheme = function (args) {
        var playerId = args.player_id, card = args.card;
        var boards = this.themeManager.stocks.boards;
        boards[playerId].setCardVisible(card, true);
    };
    NotifManager.prototype.notif_dealScenesPrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cards, _a, hand, deck;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cards = args.cards;
                        _a = this.sceneManager.stocks, hand = _a.hand, deck = _a.deck;
                        return [4 /*yield*/, hand.addCards(cards, { fromStock: deck })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_dealScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, _a, fakeHands, deck, fakeCards, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerId = args.player_id;
                        _a = this.sceneManager.stocks, fakeHands = _a.fakeHands, deck = _a.deck;
                        fakeCards = [];
                        for (i = 1; i <= 8; i++) {
                            fakeCards.push({ id: -i, type: "scene" });
                        }
                        return [4 /*yield*/, fakeHands[playerId].addCards(fakeCards, { fromStock: deck })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_placeScenePrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, _a, boards, genreDeck;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerId = args.player_id, card = args.card;
                        if (card.type === "scene") {
                            this.playSound("hammer");
                        }
                        _a = this.sceneManager.stocks, boards = _a.boards, genreDeck = _a.genreDeck;
                        return [4 /*yield*/, boards[playerId].addCard(card, {
                                fromStock: card.type === "genre" ? genreDeck : undefined,
                                toPlaceholder: "off",
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_placeScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, _a, boards, genreDeck;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.playSound("hammer");
                        playerId = args.player_id, card = args.card;
                        _a = this.sceneManager.stocks, boards = _a.boards, genreDeck = _a.genreDeck;
                        return [4 /*yield*/, boards[playerId].addCard(card, {
                                fromStock: card.type === "genre" ? genreDeck : undefined,
                                fromElement: card.type === "scene"
                                    ? document.getElementById("scp_playerZone-".concat(playerId))
                                    : undefined,
                                toPlaceholder: "off",
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_discardScenePrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var card, discard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.playSound("door");
                        card = args.card;
                        discard = this.sceneManager.stocks.discard;
                        return [4 /*yield*/, discard.addCard(card)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_discardScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, _a, discard, fakeHands;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.playSound("door");
                        playerId = args.player_id, card = args.card;
                        _a = this.sceneManager.stocks, discard = _a.discard, fakeHands = _a.fakeHands;
                        return [4 /*yield*/, discard.addCard(card, {
                                fromStock: fakeHands[playerId],
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_discardBothPrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cards, discard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.playSound("insect");
                        cards = args.cards;
                        discard = this.sceneManager.stocks.discard;
                        return [4 /*yield*/, discard.addCards(cards)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_discardBoth = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, cards, _a, discard, fakeHands;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.playSound("insect");
                        playerId = args.player_id, cards = args.cards;
                        _a = this.sceneManager.stocks, discard = _a.discard, fakeHands = _a.fakeHands;
                        return [4 /*yield*/, discard.addCards(cards, {
                                fromStock: fakeHands[playerId],
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_shiftScenesPrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.notif_shiftScenes(args)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_shiftScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, cards, boards, board, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, cards = args.cards;
                        boards = this.sceneManager.stocks.boards;
                        board = boards[playerId];
                        promises = [];
                        cards.forEach(function (card) {
                            var previousSlot = Number(card.slot) - 1;
                            var animation = board.addCard(card, {
                                fromElement: document.querySelector("#scp_scenes-".concat(playerId, " [data-slot-id=\"").concat(previousSlot, "\"]")),
                                fromPlaceholder: "off",
                            });
                            promises.push(animation);
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_passScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId2, _a, hand, fakeHands, cards;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerId2 = args.player_id2;
                        _a = this.sceneManager.stocks, hand = _a.hand, fakeHands = _a.fakeHands;
                        cards = hand.getCards();
                        return [4 /*yield*/, fakeHands[playerId2].addCards(cards)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_receiveScenesPrivate = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cards, playerId2, _a, hand, fakeHands;
            return __generator(this, function (_b) {
                cards = args.cards, playerId2 = args.player_id2;
                _a = this.sceneManager.stocks, hand = _a.hand, fakeHands = _a.fakeHands;
                hand.addCards(cards, {
                    fromStock: fakeHands[playerId2],
                });
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_receiveScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var player_id, playerId, playerId2, cards, fakeHands;
            return __generator(this, function (_a) {
                player_id = this.game.player_id;
                playerId = args.player_id, playerId2 = args.player_id2, cards = args.cards;
                fakeHands = this.sceneManager.stocks.fakeHands;
                if (playerId2 === player_id) {
                    return [2 /*return*/];
                }
                fakeHands[playerId].addCards(cards, {
                    fromStock: fakeHands[playerId2],
                    toPlaceholder: "off",
                    fromPlaceholder: "on",
                });
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_renewHand = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, oldCards, newCards, _a, hand, deck, discard, fakeHands, fakeHand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        playerId = args.player_id, oldCards = args.oldCards, newCards = args.newCards;
                        _a = this.sceneManager.stocks, hand = _a.hand, deck = _a.deck, discard = _a.discard, fakeHands = _a.fakeHands;
                        if (!this.game.isSpectator) return [3 /*break*/, 3];
                        fakeHand = fakeHands[playerId];
                        oldCards = oldCards.map(function (card) {
                            delete card.type_arg;
                            return card;
                        });
                        newCards = newCards.map(function (card) {
                            delete card.type_arg;
                            return card;
                        });
                        return [4 /*yield*/, discard.addCards(oldCards, { fromStock: fakeHand })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, fakeHand.addCards(newCards, { fromStock: deck })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                    case 3: return [4 /*yield*/, discard.addCards(oldCards)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, hand.addCards(newCards, { fromStock: deck })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_drawToDiscard = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cards, _a, discard, deck;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cards = args.cards;
                        _a = this.sceneManager.stocks, discard = _a.discard, deck = _a.deck;
                        return [4 /*yield*/, discard.addCards(cards, { fromStock: deck }, true)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_dayEnd = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var previousDay, day, _a, gamedatas, keysToNumbers, players, tracks, board, card;
            return __generator(this, function (_b) {
                previousDay = args.previousDay, day = args.day;
                _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
                players = gamedatas.players;
                tracks = this.meepleManager.stocks.tracks;
                keysToNumbers(players).forEach(function (playerId) {
                    tracks[playerId][0].addCard({ id: playerId }, { fromPlaceholder: "off", toPlaceholder: "off" });
                });
                board = this.vipManager.stocks.board;
                card = board.getCards().find(function (card) {
                    return Number(card.location_arg) === previousDay;
                });
                board.flipCard(card);
                this.game.togglePassDirection(day);
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_scoreTheme = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, points, boards, board, card, cardElement;
            return __generator(this, function (_a) {
                playerId = args.player_id, points = args.points;
                boards = this.themeManager.stocks.boards;
                board = boards[playerId];
                card = board.getCards()[0];
                cardElement = board.getCardElement(card);
                this.displayScoring(playerId, points, cardElement);
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_scoreVip = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, slot, tracks, track, boards, cardElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.playSound("steps");
                        playerId = args.player_id, card = args.card, slot = args.slot;
                        tracks = this.meepleManager.stocks.tracks;
                        track = tracks[playerId];
                        return [4 /*yield*/, track[slot].addCard({ id: playerId }, {
                                forceToElement: document.querySelector("#scp_scenes-".concat(playerId, " [data-slot-id=\"").concat(slot, "\"]")),
                                fromPlaceholder: "off",
                                toPlaceholder: "off",
                            })];
                    case 1:
                        _a.sent();
                        boards = this.sceneManager.stocks.boards;
                        cardElement = boards[playerId].getCardElement(card);
                        return [4 /*yield*/, this.displayScoring(playerId, 2, cardElement)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_scoreScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, points, boards, cardElement;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, card = args.card, points = args.points;
                        boards = this.sceneManager.stocks.boards;
                        cardElement = boards[playerId].getCardElement(card);
                        return [4 /*yield*/, this.displayScoring(playerId, points, cardElement)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_completeScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, boards, cardElement;
            return __generator(this, function (_a) {
                playerId = args.player_id, card = args.card;
                boards = this.sceneManager.stocks.boards;
                cardElement = boards[playerId].getCardElement(card);
                cardElement.classList.add("scp_scene-completed");
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_updateVipFulfilling = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, fulfills, boards, cardElement;
            return __generator(this, function (_a) {
                playerId = args.player_id, card = args.card, fulfills = args.fulfills;
                boards = this.sceneManager.stocks.boards;
                cardElement = boards[playerId].getCardElement(card);
                cardElement.classList.toggle("scp_scene-vipFulfilling", fulfills);
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_setPlayerCounterPrivate = function (args) {
        var playerId = args.player_id, inc = args.inc, name = args.name;
        var counter = this.counters.player[name][playerId];
        counter.incValue(inc);
    };
    NotifManager.prototype.notif_setPlayerCounter = function (args) {
        var playerId = args.playerId, value = args.value, name = args.name;
        if (name === "player_score") {
            var starManager = new StarManager(this.game);
            starManager.set(playerId, value);
        }
    };
    NotifManager.prototype.displayScoring = function (playerId, points, cardElement) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, gamedatas, managers, players, playerColor;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.game, gamedatas = _a.gamedatas, managers = _a.managers;
                        players = gamedatas.players;
                        playerColor = players[playerId].color;
                        return [4 /*yield*/, managers.animations.displayScoring(cardElement, points, playerColor)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.playSound = function (soundId) {
        if (this.game.getGameUserPreference(101) === 0) {
            return;
        }
        this.game.disableNextMoveSound();
        this.game.sounds.play(soundId);
    };
    return NotifManager;
}());
var MeepleManager = /** @class */ (function () {
    function MeepleManager(game) {
        this.game = game;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks;
        this.manager = managers.meeples;
        this.stocks = stocks.meeples;
    }
    MeepleManager.prototype.build = function () {
        var _this = this;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks, keysToNumbers = _a.keysToNumbers, gamedatas = _a.gamedatas;
        var animations = managers.animations;
        managers.meeples = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_meeple",
            cardHeight: 100,
            cardWidth: 100,
            setupDiv: function (_a, element) {
                var playerId = _a.id;
                element.classList.add("scp_card");
                var playerColor = players[playerId].color;
                var colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
                var colorId = colors.indexOf(playerColor) + 1;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/meeple_").concat(colorId, ".png)");
                _this.game.addTooltipHtml(element.id, "<span class=\"scp_tooltip\">\n          ".concat(_this.game.format_string_recursive(_("${player_name}'s meeple"), {
                    player_name: _this.game.getFormattedPlayerName(playerId),
                }), "\n          </span>"));
            },
        });
        this.manager = managers.meeples;
        var players = gamedatas.players;
        var tracks = {};
        keysToNumbers(players).forEach(function (playerId) {
            tracks[playerId] = {};
            for (var slot = 0; slot <= 24; slot++) {
                tracks[playerId][slot] = new BgaCards.CardStock(_this.manager, document.getElementById("scp_meepleHouse-".concat(playerId)));
            }
        });
        stocks.meeples = { tracks: tracks };
        this.stocks = stocks.meeples;
    };
    MeepleManager.prototype.setup = function () {
        this.build();
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
        var players = gamedatas.players;
        var tracks = this.stocks.tracks;
        keysToNumbers(players).forEach(function (playerId) {
            var track = tracks[playerId];
            track[0].addCard({ id: playerId });
        });
    };
    return MeepleManager;
}());
var SceneManager = /** @class */ (function () {
    function SceneManager(game) {
        this.game = game;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks, gamedatas = _a.gamedatas;
        this.manager = managers.scenes;
        this.stocks = stocks.scenes;
        this.GENRES = gamedatas.GENRES;
        this.SCENES = gamedatas.SCENES;
        this.ABILITIES = gamedatas.ABILITIES;
    }
    SceneManager.prototype.build = function () {
        var _this = this;
        var _a = this.game, managers = _a.managers, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers, player_id = _a.player_id;
        var animations = managers.animations;
        managers.scenes = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_scene",
            cardHeight: 285.1,
            cardWidth: 150,
            cardBorderRadius: "8px",
            selectedSlotStyle: {
                outlineSize: 5,
            },
            selectableSlotStyle: {
                outlineSize: 5,
            },
            isCardVisible: function (_a) {
                var type_arg = _a.type_arg;
                return !!type_arg;
            },
            setupDiv: function (_a, element) {
                var type = _a.type;
                element.classList.add("scp_card");
                if (type === "genre") {
                    element.classList.add("scp_genre");
                }
            },
            setupFrontDiv: function (_a, element) {
                var type = _a.type, sceneId = _a.type_arg;
                if (!(sceneId > 0)) {
                    return;
                }
                if (type === "genre") {
                    element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/genres/genre_").concat(sceneId, ".jpg)");
                    var genreLabel = _this.GENRES[sceneId].label;
                    _this.game.addTooltipHtml(element.id, "<div class=\"scp_tooltip\"> \n            ".concat(_this.game.format_string_recursive(_("${genreLabel}"), {
                        genreLabel: genreLabel,
                    }), "\n            </div>"));
                    return;
                }
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/scenes/scene_").concat(sceneId, ".jpg)");
                var _b = _this.SCENES[sceneId], UP = _b.UP, DOWN = _b.DOWN;
                var tooltip = "<div class=\"scp_card scp_scene scp_logTooltip bga-cards_card\"\n            style=\"background-image: url(".concat(g_gamethemeurl, "img/scenes/scene_").concat(sceneId, ".jpg)\"></div>");
                _this.game.addTooltipHtml(element.id, "<div class=\"scp_tooltip scp_tooltip-scene\">\n            <h4 class=\"scp_title\">".concat(_(UP.label), "</h4>\n            ").concat(tooltip, "\n            <h5 class=\"scp_title\">").concat(_(DOWN.label), "</h5>\n            ").concat(DOWN.ability > 0
                    ? "<span>".concat(_(_this.ABILITIES[DOWN.ability]), "</span>")
                    : "", "\n          </div>"));
            },
            setupBackDiv: function (_a, element) {
                var type = _a.type;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/").concat(type, "s/").concat(type, "_0.jpg)");
            },
        });
        this.manager = this.game.managers.scenes;
        var players = gamedatas.players, sceneDeckCount = gamedatas.sceneDeckCount;
        var boards = {};
        var fakeHands = {};
        keysToNumbers(players).forEach(function (playerId) {
            boards[playerId] = new BgaCards.SlotStock(_this.manager, document.getElementById("scp_scenes-".concat(playerId)), {
                center: false,
                wrap: "wrap",
                gap: "16px",
                slotsIds: [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                    20, 21, 22, 23, 24,
                ],
                mapCardToSlot: function (_a) {
                    var slot = _a.slot;
                    return Number(slot);
                },
                autoPlace: function (_a) {
                    var location = _a.location, location_arg = _a.location_arg;
                    var locations = [
                        "board",
                        "placed",
                        "placedAnywhere",
                    ];
                    return (locations.includes(location) && Number(location_arg) === playerId);
                },
            });
            fakeHands[playerId] = new BgaCards.VoidStock(_this.manager, document.getElementById("scp_fakeHand-".concat(playerId)), {});
        });
        var stocks = {
            boards: boards,
            fakeHands: fakeHands,
            deck: new BgaCards.Deck(this.manager, document.getElementById("scp_sceneDeck"), {
                cardNumber: sceneDeckCount,
                fakeCardGenerator: function (deckId) {
                    var fakeCard = _this.manager.getFakeCardGenerator()(deckId);
                    fakeCard.type = "scene";
                    return fakeCard;
                },
            }),
            genreDeck: new BgaCards.Deck(this.manager, document.getElementById("scp_genreDeck"), {
                cardNumber: 20,
                fakeCardGenerator: function (deckId) {
                    var fakeCard = _this.manager.getFakeCardGenerator()(deckId);
                    fakeCard.type = "genre";
                    return fakeCard;
                },
            }),
            discard: new BgaCards.VoidStock(this.manager, document.getElementById("scp_sceneDiscard"), {}),
        };
        if (!this.game.isSpectator) {
            stocks.hand = new BgaCards.LineStock(this.manager, document.getElementById("scp_hand"), {
                wrap: "wrap",
                gap: "16px",
                sort: function (a, b) {
                    var SCENE = _this.SCENES[a.type_arg];
                    var SCENE2 = _this.SCENES[b.type_arg];
                    return SCENE.UP.points - SCENE2.UP.points;
                },
                autoPlace: function (_a) {
                    var location = _a.location, location_arg = _a.location_arg;
                    return ((location === "hand" || location === "todiscard") &&
                        Number(location_arg) === player_id);
                },
            });
        }
        this.game.stocks.scenes = stocks;
        this.stocks = this.game.stocks.scenes;
    };
    SceneManager.prototype.setup = function () {
        var _this = this;
        this.build();
        var _a = this.game.gamedatas, scenePublic = _a.scenePublic, sceneHand = _a.sceneHand, sceneBoard = _a.sceneBoard, completedScenes = _a.completedScenes, vipFulfillingScenes = _a.vipFulfillingScenes;
        sceneBoard.sort(function (a, b) {
            return Number(a.position) - Number(b.position);
        });
        scenePublic.sort(function (a, b) {
            return Number(a.position) - Number(b.position);
        });
        this.manager.placeCards(__spreadArray(__spreadArray(__spreadArray([], scenePublic, true), sceneHand, true), sceneBoard, true));
        completedScenes.forEach(function (cardId) {
            var cardElement = _this.manager.getCardElement({
                id: cardId,
                type: "scene",
            });
            cardElement.classList.add("scp_scene-completed");
        });
        vipFulfillingScenes.forEach(function (cardId) {
            var cardElement = _this.manager.getCardElement({
                id: cardId,
                type: "scene",
            });
            cardElement.classList.add("scp_scene-vipFulfilling");
        });
    };
    SceneManager.prototype.highlight = function (cards) {
        var _this = this;
        cards.forEach(function (card) {
            var cardElement = _this.manager.getCardElement(card);
            cardElement.classList.add("scp_card-highlight");
        });
    };
    SceneManager.prototype.clearHighlight = function () {
        document.querySelectorAll(".scp_card-highlight").forEach(function (cardElement) {
            cardElement.classList.remove("scp_card-highlight");
        });
    };
    return SceneManager;
}());
var StarManager = /** @class */ (function () {
    function StarManager(game) {
        this.game = game;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks;
        this.manager = managers.stars;
        this.stocks = stocks.stars;
    }
    StarManager.prototype.build = function () {
        var _this = this;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks, gamedatas = _a.gamedatas;
        var animations = managers.animations;
        var players = gamedatas.players;
        managers.stars = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_star",
            cardHeight: 40,
            cardWidth: 40,
            setupDiv: function (_a, element) {
                var playerId = _a.id;
                element.classList.add("scp_card");
                var colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
                var playerColor = players[playerId].color;
                var colorId = colors.indexOf(playerColor) + 1;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/star_").concat(colorId, ".png)");
                _this.game.addTooltipHtml(element.id, "<span class=\"scp_tooltip\">\n          ".concat(_this.game.format_string_recursive(_("${player_name}'s star"), {
                    player_name: _this.game.getFormattedPlayerName(playerId),
                }), "\n          </span>"));
            },
        });
        this.manager = managers.stars;
        var board = {};
        for (var points = 0; points < 80; points++) {
            board[points] = new BgaCards.LineStock(this.manager, document.getElementById("scp_stars-".concat(points)), {
                wrap: "nowrap",
                gap: "16px",
            });
        }
        stocks.stars = { board: board };
        this.stocks = stocks.stars;
    };
    StarManager.prototype.setup = function () {
        var _this = this;
        this.build();
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
        var players = gamedatas.players;
        keysToNumbers(players).forEach(function (playerId) {
            var score = players[playerId].score;
            _this.set(playerId, Number(score));
        });
    };
    StarManager.prototype.set = function (playerId, score) {
        var board = this.stocks.board;
        var starHouse = Number(score);
        if (starHouse >= 80) {
            var excess = Math.floor(starHouse / 80) * 80;
            starHouse -= excess;
        }
        board[starHouse].addCard({ id: playerId });
    };
    return StarManager;
}());
var ThemeManager = /** @class */ (function () {
    function ThemeManager(game) {
        this.game = game;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks, gamedatas = _a.gamedatas;
        this.manager = managers.themes;
        this.stocks = stocks.themes;
        this.THEMES = gamedatas.THEMES;
    }
    ThemeManager.prototype.build = function () {
        var _this = this;
        var _a = this.game, managers = _a.managers, stocks = _a.stocks, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
        var animations = managers.animations;
        managers.themes = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_theme",
            cardHeight: 286,
            cardWidth: 210,
            cardBorderRadius: "8px",
            isCardVisible: function (card) {
                return !!card.type_arg;
            },
            setupDiv: function (card, element) {
                element.classList.add("scp_card");
            },
            setupFrontDiv: function (_a, element) {
                var theme_id = _a.type_arg;
                if (!theme_id) {
                    return;
                }
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/themes/theme_").concat(theme_id, ".jpg)");
                var _b = _this.THEMES[theme_id], label = _b.label, genreCost = _b.genreCost;
                _this.game.addTooltipHtml(element.id, "<div class=\"scp_tooltip scp_themeTooltip\">\n            <h4 class=\"scp_title scp_tooltipTitle\">".concat(_(label), "</h4>\n            <div class=\"scp_themeTooltipContent\">\n                <p>End of round/day:</p>\n                <p class=\"scp_tooltipContent\">\n                ").concat(_this.game.format_string_recursive(_("1 point for each scene with any ${genre_icon}"), {
                    themeLabel: _(label),
                    genreId: genreCost[0],
                }), "\n                </p>\n                <p class=\"scp_tooltipContent\">\n                ").concat(_this.game.format_string_recursive(_("1 point for each scene with any ${genre_icon}"), {
                    themeLabel: _(label),
                    genreId: genreCost[1],
                }), "\n                </p>\n            </div>\n          </div>"));
            },
            setupBackDiv: function (card, element) {
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/themes/theme_0.jpg)");
            },
        });
        this.manager = managers.themes;
        var players = gamedatas.players;
        var boards = {};
        keysToNumbers(players).forEach(function (playerId) {
            boards[playerId] = new BgaCards.LineStock(_this.manager, document.getElementById("scp_themes-".concat(playerId)), {
                wrap: "nowrap",
                gap: "16px",
                autoPlace: function (_a) {
                    var location = _a.location, location_arg = _a.location_arg;
                    return ((location === "hand" || location === "board") &&
                        location_arg == playerId);
                },
            });
        });
        stocks.themes = {
            boards: boards,
        };
        this.stocks = stocks.themes;
    };
    ThemeManager.prototype.setup = function () {
        this.build();
        var _a = this.game.gamedatas, themeHands = _a.themeHands, themeCards = _a.themeCards;
        this.manager.placeCards(__spreadArray(__spreadArray([], themeHands, true), themeCards, true));
    };
    return ThemeManager;
}());
var VipManager = /** @class */ (function () {
    function VipManager(game) {
        this.game = game;
        this.manager = this.game.managers.vips;
        this.stocks = this.game.stocks.vips;
        this.VIPS = this.game.gamedatas.VIPS;
    }
    VipManager.prototype.build = function () {
        var _this = this;
        var _a = this.game, managers = _a.managers, gamedatas = _a.gamedatas;
        var animations = managers.animations;
        this.game.managers.vips = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_vip",
            cardHeight: 286,
            cardWidth: 210,
            cardBorderRadius: "8px",
            isCardVisible: function (card) {
                return Number(card.location_arg) >= gamedatas.day;
            },
            setupDiv: function (_a, element) {
                var vip_id = _a.type_arg;
                element.classList.add("scp_card");
                var _b = _this.VIPS[vip_id], label = _b.label, description = _b.description;
                _this.game.addTooltipHtml(element.id, "<div class=\"scp_tooltip\">\n            <span>".concat(_this.game.format_string_recursive(_("${vipLabel}: ${vip_description}"), {
                    vipLabel: _(label),
                    vip_description: {
                        log: _(description),
                        args: {},
                    },
                }), "\n            </span>\n          </div>"));
            },
            setupFrontDiv: function (_a, element) {
                var vip_id = _a.type_arg;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/vip/VIP_").concat(vip_id, ".jpg)");
            },
            setupBackDiv: function (card, element) {
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/vip/VIP_0.jpg)");
            },
        });
        this.manager = this.game.managers.vips;
        this.game.stocks.vips = {
            board: new BgaCards.SlotStock(this.manager, document.getElementById("scp_vips"), {
                slotsIds: [1, 2, 3],
                mapCardToSlot: function (card) {
                    return Number(card.location_arg);
                },
                gap: "52px",
                wrap: "nowrap",
            }),
        };
        this.stocks = this.game.stocks.vips;
    };
    VipManager.prototype.setup = function () {
        this.build();
        var vipCards = this.game.gamedatas.vipCards;
        var board = this.stocks.board;
        board.addCards(vipCards);
    };
    return VipManager;
}());
var StateManager = /** @class */ (function () {
    function StateManager(game) {
        this.game = game;
        this.states = {
            ChooseTheme: new ChooseTheme(this.game),
            PreTurn: new PreTurn(this.game),
            PlayerTurn: new PlayerTurn(this.game),
            AttachScene: new AttachScene(this.game),
            AttachGenre: new AttachGenre(this.game),
            PlaceAnywhere: new PlaceAnywhere(this.game),
        };
    }
    StateManager.prototype.onEntering = function (stateName, args) {
        var _a;
        var isSpectator = this.game.isSpectator;
        if (isSpectator) {
            return;
        }
        (_a = this.states[stateName]) === null || _a === void 0 ? void 0 : _a.onEntering(args);
    };
    StateManager.prototype.onUpdate = function (stateName, args) {
        var _a;
        var isSpectator = this.game.isSpectator;
        if (isSpectator) {
            return;
        }
        (_a = this.states[stateName]) === null || _a === void 0 ? void 0 : _a.onUpdate(args);
    };
    StateManager.prototype.onLeaving = function (stateName) {
        var _a;
        var isSpectator = this.game.isSpectator;
        if (isSpectator) {
            return;
        }
        (_a = this.states[stateName]) === null || _a === void 0 ? void 0 : _a.onLeaving();
    };
    return StateManager;
}());
var State = /** @class */ (function () {
    function State(game) {
        this.game = game;
    }
    State.prototype.onEntering = function (args) { };
    State.prototype.onUpdate = function (args) { };
    State.prototype.onLeaving = function () {
        this.game.clearButtons();
    };
    return State;
}());
var AttachGenre = /** @class */ (function (_super) {
    __extends(AttachGenre, _super);
    function AttachGenre(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        _this.GENRES = _this.game.gamedatas.GENRES;
        _this.SCENES = _this.game.gamedatas.SCENES;
        return _this;
    }
    AttachGenre.prototype.onUpdate = function (args) {
        var _this = this;
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        var cardsToDiscard = args.cardsToDiscard, maxSlot = args.maxSlot;
        this.sceneManager.highlight(cardsToDiscard);
        this.game.addButton(_("cancel"), function () {
            _this.game.performAction("actAttachGenreCancel");
        }, { type: "alert" });
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        var selectableSlots = [];
        for (var slot = 1; slot <= maxSlot; slot++) {
            selectableSlots.push(slot);
        }
        board.setSlotSelectionMode("single", selectableSlots);
        board.onSlotSelectionChange = function (selection, slot) {
            _this.game.clearButtons(true);
            if (selection.length === 0) {
                return;
            }
            var card = board.getCards().find(function (card) {
                return (card.slot == slot &&
                    card.position == 1 &&
                    card.location_arg == playerId);
            });
            var sceneId = card.type_arg;
            var UP = _this.SCENES[sceneId].UP;
            _this.game.addButton(_this.game.format_string_recursive(_("add to ${sceneLabel}"), {
                sceneLabel: _(UP.label),
            }), function () {
                _this.game.performAction("actAttachGenre", {
                    slot: slot,
                });
            });
        };
    };
    AttachGenre.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    AttachGenre.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        this.sceneManager.clearHighlight();
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        board.setSlotSelectionMode("none");
    };
    return AttachGenre;
}(State));
var AttachScene = /** @class */ (function (_super) {
    __extends(AttachScene, _super);
    function AttachScene(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        _this.SCENES = _this.game.gamedatas.SCENES;
        return _this;
    }
    AttachScene.prototype.onUpdate = function (args) {
        var _this = this;
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        this.game.addButton(_("cancel"), function () {
            _this.game.performAction("actAttachSceneCancel");
        }, { type: "alert" });
        var cardToAttach = args.cardToAttach, maxSlot = args.maxSlot;
        this.sceneManager.highlight([cardToAttach]);
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        var selectableSlots = [];
        for (var slot = 1; slot <= maxSlot; slot++) {
            selectableSlots.push(slot);
        }
        board.setSlotSelectionMode("single", selectableSlots);
        board.onSlotSelectionChange = function (selection, slot) {
            _this.game.clearButtons(true);
            if (selection.length === 0) {
                return;
            }
            var card = board.getCards().find(function (card) {
                return (card.slot == slot &&
                    card.position == 1 &&
                    card.location_arg == playerId);
            });
            var sceneId = card.type_arg;
            var UP = _this.SCENES[sceneId].UP;
            _this.game.addButton(_this.game.format_string_recursive(_("add to ${sceneLabel}"), {
                sceneLabel: _(UP.label),
            }), function () {
                _this.game.performAction("actAttachScene", {
                    slot: slot,
                });
            });
        };
    };
    AttachScene.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    AttachScene.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        this.sceneManager.clearHighlight();
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        board.setSlotSelectionMode("none");
    };
    return AttachScene;
}(State));
var ChooseTheme = /** @class */ (function (_super) {
    __extends(ChooseTheme, _super);
    function ChooseTheme(game) {
        var _this = _super.call(this, game) || this;
        _this.themeManager = new ThemeManager(_this.game);
        _this.THEMES = _this.game.gamedatas.THEMES;
        return _this;
    }
    ChooseTheme.prototype.onUpdate = function (args) {
        var _this = this;
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        var playerId = this.game.player_id;
        var boards = this.themeManager.stocks.boards;
        var board = boards[playerId];
        board.setSelectionMode("single");
        board.onSelectionChange = function (selection, card) {
            _this.game.clearButtons();
            if (selection.length === 0) {
                _this.game.clearButtons();
                return;
            }
            var cardId = card.id, themeId = card.type_arg;
            var label = _this.THEMES[themeId].label;
            _this.game.addButton(_this.game.format_string_recursive(_("keep ${themeLabel}"), {
                themeLabel: _(label),
            }), function () {
                _this.game.performAction("actChooseTheme", {
                    cardId: cardId,
                });
            });
        };
    };
    ChooseTheme.prototype.onInactiveUpdate = function () {
        var _this = this;
        this.onLeaving();
        this.game.addButton(_("change mind"), function () {
            _this.game.performAction("actUndoChooseTheme", undefined, {
                checkAction: false,
            });
        }, { color: "secondary" });
    };
    ChooseTheme.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        var playerId = this.game.player_id;
        var boards = this.themeManager.stocks.boards;
        boards[playerId].setSelectionMode("none");
    };
    return ChooseTheme;
}(State));
var PlaceAnywhere = /** @class */ (function (_super) {
    __extends(PlaceAnywhere, _super);
    function PlaceAnywhere(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        _this.SCENES = _this.game.gamedatas.SCENES;
        return _this;
    }
    PlaceAnywhere.prototype.onUpdate = function (args) {
        var _this = this;
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        this.game.addButton(_("cancel"), function () {
            _this.game.performAction("actPlaceAnywhereCancel");
        }, { type: "alert" });
        var cardToPlace = args.cardToPlace, selectableSlots = args.selectableSlots;
        this.sceneManager.highlight([cardToPlace]);
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        board.setSlotSelectionMode("single", selectableSlots);
        board.onSlotSelectionChange = function (selection, slot) {
            _this.game.clearButtons(true);
            if (selection.length === 0) {
                return;
            }
            var card = board.getCards().find(function (card) {
                return (card.slot == slot &&
                    card.position == 1 &&
                    card.location_arg == playerId);
            });
            var sceneId = card.type_arg;
            var UP = _this.SCENES[sceneId].UP;
            _this.game.addButton(_this.game.format_string_recursive(_("place to left of ${sceneLabel}"), {
                sceneLabel: _(UP.label),
            }), function () {
                _this.game.performAction("actPlaceAnywhere", {
                    slot: slot,
                });
            });
        };
    };
    PlaceAnywhere.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    PlaceAnywhere.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        this.sceneManager.clearHighlight();
        var playerId = this.game.player_id;
        var boards = this.sceneManager.stocks.boards;
        var board = boards[playerId];
        board.setSlotSelectionMode("none");
    };
    return PlaceAnywhere;
}(State));
var PlayerTurn = /** @class */ (function (_super) {
    __extends(PlayerTurn, _super);
    function PlayerTurn(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        _this.SCENES = _this.game.gamedatas.SCENES;
        _this.GENRES = _this.game.gamedatas.GENRES;
        return _this;
    }
    PlayerTurn.prototype.onUpdate = function (args) {
        var _this = this;
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        var keysToNumbers = this.game.keysToNumbers;
        var placeable = args.placeable, attachable = args.attachable, canAttachGenre = args.canAttachGenre, placeableAnywhere = args.placeableAnywhere, nbr = args.nbr;
        var hand = this.sceneManager.stocks.hand;
        hand.setSelectionMode(canAttachGenre ? "multiple" : "single");
        hand.onSelectionChange = function (selection, lastChange) {
            _this.game.clearButtons();
            _this.game.statusBar.setTitle(_("${you} must play or discard a scene card (${nbr} left)"), {
                nbr: nbr,
            });
            if (selection.length === 0) {
                return;
            }
            if (selection.length === 2) {
                _this.game.statusBar.setTitle(_("${you} may discard both scenes to pick any genre card"));
                keysToNumbers(_this.GENRES).forEach(function (genreId) {
                    var label = _this.GENRES[genreId].label;
                    _this.game.addButton(_this.game.format_string_recursive(_("${genre_icon}"), {
                        genreId: genreId,
                    }), function () {
                        _this.game.performAction("actAttachGenreStart", {
                            cardsIds: selection
                                .map(function (card) {
                                return Number(card.id);
                            })
                                .join(","),
                            genreId: genreId,
                        });
                    }, { title: _(label) });
                });
                return;
            }
            if (selection.length > 2) {
                hand.unselectAll();
                return;
            }
            var cardId = Number(selection[0].id);
            _this.game.addButton(_("place as new scene"), function () {
                _this.game.performAction("actPlaceScene", {
                    cardId: cardId,
                });
            }, {
                disabled: !placeable.includes(cardId),
            });
            _this.game.addButton(_("add to another scene"), function () {
                _this.game.performAction("actAttachSceneStart", {
                    cardId: cardId,
                });
            }, { disabled: !attachable.includes(cardId) });
            _this.game.addButton(_this.game.format_string_recursive(_("place to the left of another scene (-1 ${staff_icon})"), {}), function () {
                _this.game.performAction("actPlaceAnywhereStart", {
                    cardId: cardId,
                });
            }, { disabled: !placeableAnywhere.includes(cardId) });
            _this.game.addButton(_this.game.format_string_recursive(_("discard (+2 ${staff_icon})"), {}), function () {
                _this.game.performAction("actDiscardScene", {
                    cardId: cardId,
                });
            }, { type: "alert" });
        };
    };
    PlayerTurn.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    PlayerTurn.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        var hand = this.sceneManager.stocks.hand;
        hand.setSelectionMode("none");
    };
    return PlayerTurn;
}(State));
var PreTurn = /** @class */ (function (_super) {
    __extends(PreTurn, _super);
    function PreTurn(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        return _this;
    }
    PreTurn.prototype.onUpdate = function (args) {
        _super.prototype.onUpdate.call(this, args);
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
    };
    PreTurn.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    PreTurn.prototype.onLeaving = function () {
        _super.prototype.onLeaving.call(this);
        var playerId = this.game.player_id;
        this.sceneManager.clearHighlight();
        var _a = this.sceneManager.stocks, hand = _a.hand, boards = _a.boards;
        hand.setSelectionMode("none");
        var board = boards[playerId];
        board.setSlotSelectionMode("none");
    };
    return PreTurn;
}(State));
