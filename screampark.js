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
            counters: {},
        };
        this.game.stocks = {};
        document
            .getElementById("generalactions")
            .insertAdjacentHTML("afterend", "<div id=\"scp_alertActions\" class=\"scp_alertActions\"></div>");
        this.setupZones();
        this.setupStocks();
        this.setupPanels();
    };
    Template.prototype.setupZones = function () {
        var _this = this;
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers, player_id = _a.player_id;
        var players = gamedatas.players;
        keysToNumbers(players).forEach(function (playerId) {
            var player_color = players[playerId].color;
            var player_name = _this.game.getFormattedPlayerName(playerId);
            var isCurrentPlayerId = player_id === playerId;
            var title = isCurrentPlayerId
                ? _this.game.format_string_recursive(_("${player_name} (You)"), {
                    player_name: player_name,
                })
                : player_name;
            var zones = document.getElementById("scp_playerZones");
            zones.insertAdjacentHTML("beforeend", "<div id=\"scp_playerZone-".concat(playerId, "\" class=\"scp_playerZone ").concat(isCurrentPlayerId ? "scp_playerZone-current" : "", "\">\n          <h3 class=\"scp_title\" style=\"color: #").concat(player_color, "; background-color: #").concat(player_color, "40;\">\n            ").concat(title, "\n          </h3>\n          ").concat(isCurrentPlayerId
                ? "<div id=\"scp_hand\" class=\"scp_hand\"></div>"
                : "", "\n          <div id=\"scp_meepleSteps-").concat(playerId, "\" class=\"scp_meepleSteps\">\n            <div id=\"scp_meepleStep-0-").concat(playerId, "\" class=\"scp_meepleStep\"></div>\n          </div>\n          <div class=\"scp_playerBoard\">\n            <div id=\"scp_themes-").concat(playerId, "\" class=\"scp_themes\"></div>\n            <div id=\"scp_scenes-").concat(playerId, "\" class=\"scp_scenes\"></div>\n          </div>\n        </div>"));
        });
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
    Template.prototype.setupPanels = function () {
        var _this = this;
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers, managers = _a.managers, player_id = _a.player_id;
        var players = gamedatas.players, staffCounts = gamedatas.staffCounts, privateStaffCount = gamedatas.privateStaffCount;
        var counters = {};
        keysToNumbers(players).forEach(function (playerId) {
            _this.game.getPlayerPanelElement(playerId).insertAdjacentHTML("beforeend", "<div id=\"scp_staffCounter-".concat(playerId, "\" class=\"scp_staffCounter\">\n          <span id=\"scp_staffCounterCount-").concat(playerId, "\" class=\"scp_staffCounterCount\"></span>\n          <div id=\"scp_staffCounterIcon-").concat(playerId, "\" class=\"scp_staffCounterIcon\"></div>\n        </div>"));
            counters[playerId] = new ebg.counter();
            counters[playerId].create("scp_staffCounterCount-".concat(playerId), {
                value: player_id === playerId ? privateStaffCount : staffCounts[playerId],
                playerCounter: "staff",
                playerId: playerId,
            });
        });
        managers.counters = __assign(__assign({}, managers.counters), { staff: counters });
    };
    return Template;
}());
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
        if (params === void 0) { params = { type: "default" }; }
        var id = params.id ||
            "scp_button-".concat(Date.now().toString(36)).concat(Math.random()
                .toString(36)
                .slice(2));
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.remove();
        if (!params.destination && params.type === "alert") {
            params.destination = document.getElementById("scp_alertActions");
        }
        this.statusBar.addActionButton(label, function () {
            callback();
        }, __assign({ id: id, classes: ["scp_button"] }, params));
        document.getElementById(id).style.order = "".concat(params === null || params === void 0 ? void 0 : params.order) || "0";
    };
    SCP.prototype.clearActionButtons = function () {
        document.getElementById("scp_alertActions").innerHTML = "";
    };
    SCP.prototype.addConfirmation = function (label, callback, params) {
        this.addButton(label, function () {
            callback();
        }, __assign({ id: "scp_confirmationBtn" }, params));
    };
    SCP.prototype.removeConfirmation = function () {
        var _a;
        (_a = document.getElementById("scp_confirmationBtn")) === null || _a === void 0 ? void 0 : _a.remove();
    };
    SCP.prototype.keysToNumbers = function (object) {
        return Object.keys(object).map(function (key) {
            return Number(key);
        });
    };
    SCP.prototype.bgaFormatText = function (log, args) {
        try {
            this.addIcons(log, args);
        }
        catch (error) {
            console.error(error);
        }
        return { log: log, args: args };
    };
    SCP.prototype.addIcons = function (log, args) {
        if (log.includes("${randomGenre_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/genre_0.png)");
            args.randomGenre_icon = "<span class=\"scp_smIcon scp_genreIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${genre_icon}") && args.genre_id) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/genre_").concat(args.genre_id, ".png)");
            args.genre_icon = "<span class=\"scp_smIcon scp_genreIcons\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
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
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/lightning.png)");
            args.lightning_icon = "<span class=\"scp_smIcon scp_genreIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${staff_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/staff.png)");
            args.staff_icon = "<span class=\"scp_smIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
        if (log.includes("${staffCost_icon}")) {
            var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/staffCost.png)");
            args.staffCost_icon = "<span class=\"scp_smIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
        }
    };
    SCP.prototype.getScenicIcon = function (scenicName) {
        var scenicSymbols = {
            candlestick: 1,
            light: 2,
            sound: 3,
            skull: 4,
        };
        var scenic_id = scenicSymbols[scenicName];
        var backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/scenic_").concat(scenic_id, ".png)");
        return "<span class=\"scp_smIcon scp_genreIcon\" style=\"background-image: ".concat(backgroundImage, ";\"></span>");
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
    }
    NotifManager.prototype.setIgnoreChecks = function () {
        var _a = this.game, notifqueue = _a.notifqueue, player_id = _a.player_id;
        var notifsToIgnore = ["getTheme", "dealScenes"];
        notifsToIgnore.forEach(function (notifName) {
            notifqueue.setIgnoreNotificationCheck(notifName, function (notif) {
                var playerId = notif.args.player_id;
                return playerId === player_id;
            });
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
    NotifManager.prototype.notif_privateGetTheme = function (args) {
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
    NotifManager.prototype.notif_privateDealScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cards, _a, hand, deck;
            return __generator(this, function (_b) {
                cards = args.cards;
                _a = this.sceneManager.stocks, hand = _a.hand, deck = _a.deck;
                hand.addCards(cards, { fromStock: deck });
                return [2 /*return*/];
            });
        });
    };
    NotifManager.prototype.notif_dealScenes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var cardCount, playerId, deck, fakeCards, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cardCount = args.cardCount, playerId = args.player_id;
                        deck = this.sceneManager.stocks.deck;
                        fakeCards = [];
                        for (i = 1; i <= cardCount; i++) {
                            fakeCards.push({ id: -i, type: "scene" });
                        }
                        return [4 /*yield*/, deck.addCards(fakeCards)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, deck.removeCards(fakeCards, {
                                slideTo: document.getElementById("scp_playerZone-".concat(playerId)),
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_playScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, card, boards;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerId = args.player_id, card = args.card;
                        boards = this.sceneManager.stocks.boards;
                        return [4 /*yield*/, boards[playerId].addCard(card)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_discardScene = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var card, hand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        card = args.card;
                        hand = this.sceneManager.stocks.hand;
                        return [4 /*yield*/, hand.removeCard(card, {
                                fadeOut: true,
                                slideTo: document.getElementById("player_boards"),
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NotifManager.prototype.notif_privateSetCounter = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var playerId, inc, name, counter;
            return __generator(this, function (_a) {
                playerId = args.player_id, inc = args.inc, name = args.name;
                counter = this.counters[name][playerId];
                counter.incValue(inc);
                return [2 /*return*/];
            });
        });
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
                var player_id = _a.id, player_color = _a.player_color;
                element.classList.add("scp_card");
                var colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
                var color_id = colors.indexOf(player_color) + 1;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/meeple_").concat(color_id, ".png)");
                _this.game.addTooltip(element.id, _this.game.format_string_recursive(_("${player_name}'s meeple"), {
                    player_name: _this.game.getFormattedPlayerName(player_id),
                }), "");
            },
        });
        this.manager = managers.meeples;
        var players = gamedatas.players;
        var tracks = {};
        keysToNumbers(players).forEach(function (player_id) {
            tracks[player_id] = {
                0: new BgaCards.LineStock(_this.manager, document.getElementById("scp_meepleStep-".concat(0, "-").concat(player_id))),
            };
        });
        stocks.meeples = { tracks: tracks };
        this.stocks = stocks.meeples;
    };
    MeepleManager.prototype.setup = function () {
        this.build();
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
        var players = gamedatas.players;
        var tracks = this.stocks.tracks;
        keysToNumbers(players).forEach(function (player_id) {
            var player_color = players[player_id].color;
            tracks[player_id][0].addCard({ id: player_id, player_color: player_color });
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
                var type = _a.type, scene_id = _a.type_arg;
                if (!(scene_id > 0)) {
                    return;
                }
                if (type === "genre") {
                    element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/genres/genre_").concat(scene_id, ".jpg)");
                    var genre_label = _this.GENRES[scene_id].label;
                    _this.game.addTooltip(element.id, _this.game.format_string_recursive(_("${genre_label}"), {
                        genre_label: genre_label,
                    }), "");
                    return;
                }
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/scenes/scene_").concat(scene_id, ".jpg)");
                var _b = _this.SCENES[scene_id], up = _b.up, down = _b.down;
                _this.game.addTooltip(element.id, _this.game.format_string_recursive(_("${up_label} / ${down_label}"), {
                    up_label: _(up.label),
                    down_label: _(down.label),
                }), "");
            },
            setupBackDiv: function (_a, element) {
                var type = _a.type;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/").concat(type, "s/").concat(type, "_0.jpg)");
            },
        });
        this.manager = this.game.managers.scenes;
        var players = gamedatas.players, sceneDeckCount = gamedatas.sceneDeckCount;
        var boards = {};
        keysToNumbers(players).forEach(function (playerId) {
            boards[playerId] = new BgaCards.SlotStock(_this.manager, document.getElementById("scp_scenes-".concat(playerId)), {
                wrap: "nowrap",
                slotsIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                mapCardToSlot: function (_a) {
                    var slot = _a.slot;
                    return Number(slot);
                },
                autoPlace: function (_a) {
                    var location = _a.location, location_arg = _a.location_arg;
                    return ((location === "board" || location === "played") &&
                        Number(location_arg) === playerId);
                },
            });
        });
        this.game.stocks.scenes = {
            boards: boards,
            hand: new BgaCards.LineStock(this.manager, document.getElementById("scp_hand"), {
                gap: "16px",
                wrap: "nowrap",
                sort: function (a, b) {
                    return (_this.SCENES[a.type_arg].up.points -
                        _this.SCENES[b.type_arg].up.points);
                },
                autoPlace: function (_a) {
                    var location = _a.location, location_arg = _a.location_arg;
                    return location === "hand" && Number(location_arg) === player_id;
                },
            }),
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
        };
        this.stocks = this.game.stocks.scenes;
    };
    SceneManager.prototype.setup = function () {
        this.build();
        var _a = this.game.gamedatas, sceneCards = _a.sceneCards, sceneHand = _a.sceneHand;
        this.manager.placeCards(__spreadArray(__spreadArray([], sceneCards, true), sceneHand, true));
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
        var _a = this.game, managers = _a.managers, stocks = _a.stocks;
        var animations = managers.animations;
        managers.stars = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_star",
            cardHeight: 40,
            cardWidth: 40,
            setupDiv: function (_a, element) {
                var player_id = _a.id, player_color = _a.player_color;
                element.classList.add("scp_card");
                var colors = ["982fff", "008000", "ff0000", "72c3b1", "ffa500"];
                var color_id = colors.indexOf(player_color) + 1;
                element.style.backgroundImage = "url(".concat(g_gamethemeurl, "img/icons/star_").concat(color_id, ".png)");
                _this.game.addTooltip(element.id, _this.game.format_string_recursive(_("${player_name}'s star"), {
                    player_name: _this.game.getFormattedPlayerName(player_id),
                }), "");
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
        this.build();
        var _a = this.game, gamedatas = _a.gamedatas, keysToNumbers = _a.keysToNumbers;
        var players = gamedatas.players;
        var board = this.stocks.board;
        keysToNumbers(players).forEach(function (player_id) {
            var _a = players[player_id], score = _a.score, player_color = _a.color;
            board[score].addCard({ id: player_id, player_color: player_color });
        });
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
                var _b = _this.THEMES[theme_id], label = _b.label, genres = _b.genres;
                _this.game.addTooltipHtml(element.id, "<div class=\"scp_tooltip scp_themeTooltip\">\n            <h4 class=\"scp_title scp_tooltipTitle\">".concat(_(label), "</h4>\n            <div class=\"scp_flexWrapper\" style=\"--direction: column; --gap: 4px\">\n                <p>End of round/day:</p>\n                <p class=\"scp_tooltipContent\">\n                ").concat(_this.game.format_string_recursive(_("1 point for each scene with any ${genre_icon}"), {
                    theme_label: _(label),
                    genre_id: genres[0],
                }), "\n                </p>\n                <p class=\"scp_tooltipContent\">\n                ").concat(_this.game.format_string_recursive(_("1 point for each scene with any ${genre_icon}"), {
                    theme_label: _(label),
                    genre_id: genres[1],
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
    ThemeManager.prototype.setSelection = function (playerId, callback) {
        var boards = this.stocks.boards;
        var board = boards[playerId];
        board.setSelectionMode(callback ? "single" : "none");
        board.onSelectionChange = callback;
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
        var managers = this.game.managers;
        var animations = managers.animations;
        this.game.managers.vips = new BgaCards.Manager({
            animationManager: animations,
            type: "scp_vip",
            cardHeight: 286,
            cardWidth: 210,
            cardBorderRadius: "8px",
            setupDiv: function (_a, element) {
                var vip_id = _a.type_arg;
                element.classList.add("scp_card");
                var _b = _this.VIPS[vip_id], label = _b.label, description = _b.description;
                _this.game.addTooltip(element.id, _this.game.format_string_recursive(_("${vip_label}: ${vip_description}"), {
                    vip_label: _(label),
                    vip_description: {
                        log: _(description),
                        args: {},
                    },
                }), "");
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
            board: new BgaCards.SlotStock(managers.vips, document.getElementById("scp_vips"), {
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
            PlayerTurn: new PlayerTurn(this.game),
        };
    }
    StateManager.prototype.onEntering = function (stateName, args) {
        var _a;
        var _b = this.game, isSpectator = _b.isSpectator, on_client_state = _b.on_client_state;
        console.log(stateName, "TEST");
        if (isSpectator) {
            return;
        }
        (_a = this.states[stateName]) === null || _a === void 0 ? void 0 : _a.onEntering(args);
    };
    StateManager.prototype.onUpdate = function (stateName, args) {
        var _a;
        var _b = this.game, isSpectator = _b.isSpectator, on_client_state = _b.on_client_state;
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
    State.prototype.onLeaving = function () { };
    return State;
}());
var ChooseTheme = /** @class */ (function (_super) {
    __extends(ChooseTheme, _super);
    function ChooseTheme(game) {
        var _this = _super.call(this, game) || this;
        _this.themeManager = new ThemeManager(_this.game);
        _this.THEMES = _this.game.gamedatas.THEMES;
        return _this;
    }
    ChooseTheme.prototype.onUpdate = function () {
        var _this = this;
        var playerId = this.game.player_id;
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        this.themeManager.setSelection(playerId, function (selection, card) {
            if (selection.length === 0) {
                _this.game.removeConfirmation();
                return;
            }
            var cardId = card.id, themeId = card.type_arg;
            var label = _this.THEMES[themeId].label;
            _this.game.addConfirmation(_this.game.format_string_recursive(_("keep ${theme_label}"), {
                theme_label: _(label),
            }), function () {
                _this.game.performAction("actChooseTheme", {
                    cardId: cardId,
                });
            });
        });
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
        var playerId = this.game.player_id;
        this.themeManager.setSelection(playerId, null);
    };
    return ChooseTheme;
}(State));
var PlayerTurn = /** @class */ (function (_super) {
    __extends(PlayerTurn, _super);
    function PlayerTurn(game) {
        var _this = _super.call(this, game) || this;
        _this.sceneManager = new SceneManager(_this.game);
        _this.SCENES = _this.game.gamedatas.SCENES;
        return _this;
    }
    PlayerTurn.prototype.onUpdate = function (args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive()) {
            this.onInactiveUpdate();
            return;
        }
        var playableScenes = args.playableScenes, attachableScenes = args.attachableScenes;
        var hand = this.sceneManager.stocks.hand;
        hand.setSelectionMode("multiple");
        hand.onSelectionChange = function (selection, lastChange) {
            document.getElementById("generalactions").innerHTML = "";
            if (selection.length === 0) {
                return;
            }
            if (selection.length === 2) {
                _this.game.addButton(_("discard both and get a genre card"), function () { }, {
                    color: "alert",
                });
                return;
            }
            if (selection.length > 2) {
                hand.unselectAll();
                return;
            }
            var cardId = Number(selection[0].id);
            _this.game.addButton(_("play as new scene"), function () {
                _this.game.performAction("actPlayScene", {
                    cardId: cardId,
                });
            }, {
                disabled: !playableScenes.includes(cardId),
            });
            _this.game.addButton(_("attach to other scene"), function () {
                _this.game.performAction("actAttachScene", {
                    cardId: cardId,
                });
            }, { disabled: !attachableScenes.includes(cardId) });
            _this.game.addButton(_this.game.format_string_recursive(_("discard and get 2 ${staff_icon}"), {}), function () {
                _this.game.performAction("actDiscardScene", {
                    cardId: cardId,
                });
            }, { color: "alert" });
        };
    };
    PlayerTurn.prototype.onInactiveUpdate = function () {
        this.onLeaving();
    };
    PlayerTurn.prototype.onLeaving = function () {
        var hand = this.sceneManager.stocks.hand;
        hand.setSelectionMode("none");
    };
    return PlayerTurn;
}(State));
