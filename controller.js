function Controller(game) {
    //controll bar for creating objects
    this.ready = false;
    this.adminBar = null;
    this.terraBar = null;
    this.stats = null;
    this.containers = {};
    var controller = this;
    this.callback = [null, null, null];
    this.LEFT = 0;
    this.MIDDLE = 1;
    this.RIGHT = 2;
    this.actionQueue = [];
    this.mouse = {
        x: 0,
        y: 0,
    };
    this.modifier = {
        ctrl: false,
        shift: false,
        alt: false
    };
    this.keys = {};
    this.currentTarget = null;
    this.iface = {
        x: 0,
        y: 0,
        cursor: null,
        actionButton: null,
        get mouseIsValid() {
            return this.x > 0 && this.y > 0 && this.x < game.screen.width && this.y < game.screen.height;
        },
        element: null,
        hovered: null,
        setCursor: function(item, x, y, callback) {
            var canvas = document.createElement("canvas");
            canvas.width = item.width;
            canvas.height = item.height;
            canvas.container = item.container;
            canvas.getContext("2d").drawImage(item, 0, 0);
            this.cursor.innerHTML = "";
            this.cursor.appendChild(canvas);
            this.cursor.style.display = "block";
            this.cursor.style.left = x + "px";
            this.cursor.style.top = y + "px";
            this.cursor.style.marginLeft = -item.width / 2 + "px";
            this.cursor.style.marginTop = -item.height / 2 + "px";
            this.cursor.entity = Entity.get(item.id);
            this.updateHovered(x, y);
            window.addEventListener('mousemove', this.moveListener);
            controller.callback[controller.RIGHT] = function(e) {
                callback(e);
                return true;
            };

            controller.callback[controller.LEFT] = function(e) {
                var hovered = controller.iface.hovered;
                // if(!hovered && !controller.iface.mouseIsValid)
                //     return false;
                if (hovered) {
                    if (this.modifier.shift) {
                        game.chat.linkEntity(item.entity);
                        return true;
                    }
                    if (hovered.check && !hovered.check(controller.iface.cursor))
                        return false;

                    if (hovered.canUse && hovered.canUse(item.entity)) {
                        return hovered.use(item.entity);
                    }
                    if (hovered.craft)
                        return controller.craft.use(item, hovered);

                    if (hovered.build)
                        return controller.build.blank.use(item);

                    if (hovered.vendor)
                        return hovered.use(item, hovered);

                    if (hovered.item == item)
                        return true;

                    Container.moveItem(
                        item.id,
                        item.container,
                        hovered.container,
                        hovered.index
                    );
                    return true;
                }

                var hovered = controller.world.hovered;
                if (hovered) {
                    var t = Entity.get(item.id)
                    if (hovered.canUse && hovered.canUse(t)) {
                        return hovered.use(t);
                    }
                } else {
                    item.container.dropItem(item.id);
                }

                return true;
            }
        },
        updateHovered: function(x, y) {
            util.dom.hide(this.cursor);
            var hovered = document.elementFromPoint(x, y);
            util.dom.show(this.cursor);
            if (hovered.classList.contains("item-preview") || hovered.classList.contains("item"))
                hovered = hovered.parentNode;
            else if (!hovered.classList.contains("slot"))
                hovered = null;

            var oldHovered = controller.iface.hovered;
            if(oldHovered != hovered) {
                if(oldHovered) {
                    oldHovered.classList.remove("hovered");
                    oldHovered.classList.remove("invalid");
                }
                if(hovered){
                    hovered.classList.add("hovered");
                    if(hovered.check && !hovered.check(controller.iface.cursor))
                        hovered.classList.add("invalid")
                }
            }
            controller.iface.hovered = hovered;
        },
        moveListener: function(e) {
            var x = e.pageX;
            var y = e.pageY;

            var entity = controller.iface.cursor.entity;
            this.cursor.style.left = x + "px";
            this.cursor.style.top = y + "px";
            controller.iface.updateHovered(e.clientX, e.clientY);

            if (controller.iface.hovered)
                return;
        },
    }
    this.world = {
        cursor: null,
        hovered: null,
        menuHovered: null, //from X menu
        _p: new Point(),
        get point() {
            this._p.set(
                controller.iface.x + game.camera.x,
                controller.iface.y + game.camera.y
            ).toWorld();
            return this._p;
        },
        get x() {
            return this.point.x;
        },
        get y() {
            return this.point.y;
        },
        scroll: false,
    };
}

Controller.prototype = {
    self: this,
    get cursor() {
        return this.world.cursor || this.iface.cursor.firstChild;
    },
    disableEvent: function(e) {
        e.preventDefault();
        return false;
    },
    bind: function(f){
        var self = this;
        return function(e) {
            var x = e.pageX - game.offset.x + game.camera.x;
            var y = e.pageY - game.offset.y + game.camera.y;
            f.call(self, e, x, y);
        }

    },
    highlight: function(name) {
        this[name].panel.button.classList.add("alert");
    },
    unhighlight: function(name) {
        if (this[name])
            this[name].panel.button.classList.remove("alert");
    },
    update: function() {
        if (!game.config.cursor.dontHide) {
            if (this.world.cursor || this.iface.cursor.entity)
                game.canvas.classList.add("cursor-hidden");
            else
                game.canvas.classList.remove("cursor-hidden");
        }

        if (this.world.hovered) {
            //item removed
            var e = Entity.get(this.world.hovered.Id)
            if (!e)
                this.world.hovered = null;
            else if (e instanceof Entity && e.inContainer())
                this.world.hovered = null;
        }
        this.minimap.update();
    },
    toggleBag: function() {
        var bag = game.player.bag();
        if (!bag)
            return
        var container = Container.open(bag.Id);
        if (!container)
            return;
        container.panel.toggle();
    },
    initHotkeys: function() {
        function toggle(panel) {
            return panel.toggle.bind(panel);
        }
        this.hotkeys = {
            R: {
                callback: function() {
                    if (this.lastCreatingType)
                        this.creatingCursor(this.lastCreatingType, this.lastCreatingCommand);
                }
            },
            B: {
                callback: this.toggleBag
            },
            I: {
                callback: this.toggleBag
            },
            C: {
                callback: toggle(game.panels.stats)
            },
            M: {
                callback: toggle(game.panels.map)
            },
            X: {
                button: "pick-up",
                callback: function() {
                    game.player.pickUp();
                },
            },
            F: {
                button: "fight",
                callback: function() {
                    this.fight.show();
                }
            },
            13: { //enter
                callback: function() {
                    game.controller.chat.panel.show();
                }
            },
            27: { //esc
                callback: function() {
                    if (Panel.top)
                        Panel.top.hide();
                    game.player.target = null;
                }
            },
            32: { //space
                button: "action",
                callback: function() {
                    game.player.defaultAction()
                }
            },
            37: { // left
                callback: function() {
                    this.rotate(-1);
                }
            },
            39: { // right
                callback: function() {
                    this.rotate(+1);
                }
            }
        };
        [1, 2, 3, 4, 5].forEach(function(key) {
            this.hotkeys[key] = {
                callback: function() {
                    this.fight.hotkey(key);
                }
            }
        }.bind(this));
    },
    initHotbar: function() {
        this.hotbar = {
            panel: document.getElementById("hotbar"),
        };
        for (var key in this.hotkeys) {
            var hotkey = this.hotkeys[key];
            if (!hotkey.button)
                continue;
            this.hotbar[key] = document.getElementById(hotkey.button + "-button");
            this.hotbar[key].addEventListener('click', hotkey.callback.bind(this))
        }
    },
    fpsStatsBegin: function() {
        if (this.fpsStats)
            this.fpsStats.begin();
    },
    fpsStatsEnd: function() {
        if (this.fpsStats)
            this.fpsStats.end();
    },
    interfaceInit: function(chatData) {
        game.map.minimapContainer.style.display = "block";
        game.timeElement.style.display = "block";

        window.addEventListener('mousedown', this.bind(this.mousedown));
        window.addEventListener('mouseup', this.bind(this.mouseup));
        window.addEventListener('mousemove', this.bind(this.mousemove));
        window.addEventListener('keydown', this.bind(this.keydown));
        window.addEventListener('keyup', this.bind(this.keyup));
        window.addEventListener('wheel', this.bind(this.wheel));

        window.addEventListener('contextmenu', this.disableEvent);
        window.addEventListener('dragstart', this.disableEvent);

        this.fight = new Fight();
        this.skills = new Skills();
        this.stats = new Stats();
        this.craft = new Craft();
        this.build = new Build();
        this.chat = new Chat();
        this.minimap = new Minimap();
        this.system = new System();
        this.fpsStats = this.system.fps;
        this.inventory = Container.open(game.player.Equip[0]) //0 - SLOT_BAG
        this.donate = new Donate();

        game.chat = this.chat;
        game.help = this.system.help;

        this.iface.cursor = document.getElementById("cursor");
        this.iface.actionButton = document.getElementById("action-button");
        this.iface.actionButton.state = "";

        this.iface.element = document.getElementById("interface");
        document.getElementById("effects").style.display = "inline-block";

        this.createButton(this.skills.panel, "skills");
        this.createButton(this.stats.panel, "stats");
        this.createButton(this.inventory.panel, "inventory");
        this.createButton(this.craft.panel, "craft");
        this.createButton(this.build.panel, "build");
        this.createButton(this.chat.panel, "chat");
        this.createButton(this.minimap.panel, "map");

        this.createButton(this.system.panel, "system");
        this.createButton(this.donate.panel, "donate");
        this.donate.afterButtonBind();

        this.inventory.panel.button.onclick = this.toggleBag;

        if (game.player.IsAdmin) {
            var bioms = game.map.bioms.map(function(biom, i) {
                var div = document.createElement("div");
                div.appendChild(game.map.tiles[i]);
                div.classList.add("slot");
                div.title = biom.Name;
                return div;
            });
            this.createButton(new Panel(
                "terra-bar",
                "Terraforming",
                bioms,
                this.bind(function(e) {
                    if(!e.target.id)
                        return;
                    this.terraCursor(e.target);
                })
            ));
        }

        this.initHotkeys();
        this.initHotbar();

        this.chat.sync(chatData || []);

        this.ready = true;
    },
    createButton: function(object, buttonName) {
        function makeToggle(button, object) {
            return function() {
                game.controller.unhighlight(buttonName);
                if (object.visible) {
                    object.hide();
                } else {
                    object.show();
                    game.help.runHook({type: button.id})
                }
            };
        };
        buttonName = buttonName || object.name;
        var button = document.getElementById(buttonName + "-button");
        button.style.display = "block";
        object.button = button;
        button.onclick = makeToggle(button, object);
        this.iface[name] = button;
    },
    terraCursor: function(tile) {
        this.world.cursor = {
            scale: 1,
            id: tile.id,
            setPoint: function(){}, //TODO: fixme
            alignedData: function() {return null},
            rotate: function(delta) {
                if (delta < 0)
                    this.scale++;
                else
                    this.scale--;
            },
            draw: function() {
                var size = CELL_SIZE;

                var p = game.controller.world.point.clone();
                p.x /= size;
                p.y /= size;
                p.floor();
                p.x *= size;
                p.y *= size;

                size *= this.scale;

                var s = p.clone().toScreen();

                game.ctx.drawImage(
                    tile,
                    0,
                    0,
                    CELL_SIZE * 2,
                    CELL_SIZE,
                    s.x - CELL_SIZE,
                    s.y,
                    CELL_SIZE * 2,
                    CELL_SIZE
                );

                game.ctx.strokeStyle = "#0ff";
                game.iso.strokeRect(
                    p.x,
                    p.y,
                    size,
                    size
                );
            }
        };
        this.callback[this.LEFT] = function() {
            var p = game.controller.world.point.clone();
            p.x /= CELL_SIZE;
            p.y /= CELL_SIZE;
            p.floor()
            game.network.send("map-change-cell", {
                Id: parseInt(this.world.cursor.id),
                X: p.x,
                Y: p.y,
                Scale: this.world.cursor.scale,
            });
        }
    },
    creatingCursor: function(arg, command, callback) {
        command = command || "entity-add";
        if (arg instanceof Entity) {
            this.lastCreatingType = arg.Type;
            this.world.cursor = arg;
        } else {
            this.lastCreatingType = arg;
            this.world.cursor = new Entity(0, arg);
        }

        this.lastCreatingCommand = command;

        this.callback[this.LEFT] = function() {
            if (!game.controller.iface.mouseIsValid)
                return false;
            var entity = this.world.cursor;
            if (!entity)
                return;
            var p = entity.point;
            var data = entity.alignedData(p);
            if (data) {
                p.x = data.x + data.w/2;
                p.y = data.y + data.h/2;
            }
            var args = {
                type: entity.Type,
                x: p.x,
                y: p.y,
            };
            if (entity.Orientation)
                args.Orientation = entity.Orientation;

            var pushToQueue = !!game.controller.modifier.shift;
            if (pushToQueue) {
                if (game.controller.actionQueue.length == 0 && !game.player.Action.Duration) {
                    game.network.send(command, args, game.controller.processActionQueue);
                } else {
                    game.controller.actionQueue.push({command: command, args: args})
                }
            } else {
                game.controller.actionQueue = [];
                game.network.send(command, args, callback);
            }

            this.clearCursors();
            return true;
        }
    },
    processActionQueue: function process(data) {
        if (!data.Done)
            return process;
        var action = game.controller.actionQueue.shift();
        if (!action)
            return;
        game.network.send(action.command, action.args);
        return process;
    },
    clearActionQueue: function(data) {
        if (data.Ack)
            game.controller.actionQueue = [];
    },
    clearCursors: function() {
        this.world.scroll = false;

        // clicking on player launches action, so don't cancel it
        if (this.world.hovered != game.player)
            this.world.cursor = null;

        this.world.hovered = null;

        this.iface.hovered = null;
        this.iface.cursor.innerHTML = "";
        this.iface.cursor.entity = null;
    },
    mousedown: function(e, x, y) {
        if(this.callback[e.button] != null) { // if callback for button is set
            if(!this.callback[e.button].call(this, e)) //if callback didn't handled click
                return false; //skip this click
            this.clearCursors();
        } else {
            switch(e.button) {
            case 0:
                if (e.target == game.canvas) {
                    if(this.world.hovered) {
                        if (this.modifier.shift) {
                            game.chat.linkEntity(this.world.hovered);
                            return false;
                        }
                        if (game.player.IsAdmin && game.debug.entity.logOnClick) {
                            console.log(this.world.hovered);
                        }
                        return this.world.hovered.defaultAction(true);
                    } else if (this.modifier.alt && game.player.IsAdmin) {
                        game.network.send("teleport", {X: this.world.x, Y: this.world.y});
                    } else if(!this.world.cursor) {
                        game.player.setDst(this.world.x, this.world.y);
                    }
                }
                if (!e.target.classList.contains("action"))
                    game.menu.hide();

                break;
            case 1:
                break;
            case 2:
                // It was used when use could grab world with mouse and drag it.
                // It hides rmb menu, so disabled
                // this.world.scroll = {
                //     x: x,
                //     y: y,
                // }

                if (this.world.hovered == game.player) {
                    return this.world.hovered.defaultAction();
                } else if (this.world.hovered && this.currentTarget == game.canvas) {
                    if (!game.menu.show(this.world.hovered)) {
                        game.menu.hide();
                    }
                } else if(!e.target.classList.contains("item") && !e.target.classList.contains("slot")){
                    game.menu.hide();
                }
                break;
            }
        }
        for(var i = 0; i < 3; i++) {
            this.callback[i] = null;
        }
        window.removeEventListener('mousemove', this.iface.moveListener);

        util.dom.removeClass(".hovered", "hovered");
        util.dom.removeClass(".invalid", "invalid");
        return false;
    },
    mouseup: function(e) {
        switch(e.button) {
        case 2:
            this.clearCursors();
            break;
        }
    },
    mousemove: function(e) {
        this.currentTarget = e.target;
        if (this.world.scroll) {
            game.menu.hide();
        }
        this.iface.x = e.pageX - game.offset.x;
        this.iface.y = e.pageY - game.offset.y;
        this.mouse.x = e.pageX;
        this.mouse.y = e.pageY;
        this.updateCamera();
        this.updateHovered();
    },
    rotate: function(delta) {
        var cursor = this.world.cursor;
        if (!cursor)
            return;
        cursor.rotate(delta)
    },
    wheel: function(e) {
        this.rotate(e.deltaY);
    },
    updateCamera: function() {
        if(this.world.scroll) {
            game.camera.x = this.world.scroll.x - this.iface.x;
            game.camera.y = this.world.scroll.y - this.iface.y;

            if (game.menu.visible) {
                game.menu.show();
            }
        }
    },
    updateHovered: function() {
        if (this.world.menuHovered)
            return;
        var p = this.world.point;
        this.world.hovered = game.sortedEntities.findReverse(function(entity) {
            return entity.intersects(p.x, p.y);
        });
    },
    drawAlign: function(entity, p) {
        var data = entity.alignedData(p);
        if (data) {
            game.ctx.strokeStyle = "#00ffff";
            game.iso.strokeRect(data.x, data.y, data.w, data.h);
        }
    },
    draw: function() {
        if (this.world.menuHovered) {
            this.world.menuHovered.drawHovered();
            return;
        }
        var cursor = this.world.cursor;
        var hovered = this.world.hovered;
        if (cursor) {
            if (cursor.Sprite) {
                if (this.modifier.shift && cursor.Sprite._align) {
                    cursor.Sprite.Align = cursor.Sprite._align;
                } else if (!cursor.Sprite.Align.X) {
                    cursor.Sprite._align = cursor.Sprite.Align;
                    cursor.Sprite.Align = {X: CELL_SIZE/2, Y: CELL_SIZE/2};
                }
            }

            cursor.setPoint(this.world.point);
            cursor.draw();
            this.drawAlign(cursor, this.world.point);
        } else if(hovered) {
            var iface = this.iface;
            // If not interface element (like menu) is over
            // and item is not outside of the visible area
            if (!iface.hovered && iface.mouseIsValid && this.currentTarget == game.canvas) {
                hovered.drawHovered();
            }
        }
        var entity = this.iface.cursor.entity
        if (entity)
            this.drawAlign(entity, this.world.point);
        Character.drawActions();
        if (this.modifier.ctrl && this.keys.X && !game.menu.visible) {
            this.drawItemsMenu();
        }
    },
    drawItemsMenu: function() {
        var items = game.findItemsNear(this.world.x, this.world.y);
        if (items.length == 0)
            return;
        game.menu.show({
            getActions: function() {
                var actions = {};
                items.forEach(function(item) {
                    var name = item.Name;
                    while (name in actions) {
                        name = name + " ";
                    }
                    actions[name] = {
                        item: item,
                        callback: function() {
                            game.menu.show(item, 0, 0, false, true);
                        }
                    };
                });
                return actions;
            }
        });
    },
    keydown: function(e) {
        //on double keydown kill xneur
        this.modifier.ctrl = e.ctrlKey;
        this.modifier.shift = e.shiftKey;
        this.modifier.alt = e.altKey;
        var c = String.fromCharCode(e.keyCode);
        //esc
        if(e.keyCode != 27 && e.target.id == "new-message")
            return false;
        this.keys[c] = true;

        var hotkey = this.hotkeys[e.keyCode] || this.hotkeys[c];
        if (hotkey) {
            hotkey.callback.call(this, e);
        }
        return false;
    },
    keyup: function(e) {
        this.modifier.ctrl = e.ctrlKey;
        this.modifier.shift = e.shiftKey;
        this.modifier.alt = e.altKey;
        var c = String.fromCharCode(e.keyCode);
        this.keys[c] = false;
        return true;
    },
    // TODO: refactor names
    showMessage: function(message, cls) {
        var warn = document.getElementById("warning");
        warn.textContent = message;
        if(warn.timeout)
            clearTimeout(warn.timeout);
        warn.style.display = "inline-block";
        warn.className = cls || "";
        warn.timeout = setTimeout(function() {
            warn.style.display = "none";
            clearTimeout(warn.timeout);
            warn.timeout = null;
        }, 3000);

        game.chat.addMessage(warn.textContent);

    },
    showError: function(message) {
        this.showMessage(message, "error");
    },
    showWarning: function(message) {
        this.showMessage(message, "warning");
    },
    showAnouncement: function(message) {
        var anouncement = document.getElementById("anouncement");
        anouncement.textContent = T(message);
        if(anouncement.timeout)
            clearTimeout(anouncement.timeout);
        anouncement.style.display = "inline-block";
        anouncement.timeout = setTimeout(function() {
            if (game.stage.name != "main")
                return;
            anouncement.style.display = "none";
            clearTimeout(anouncement.timeout);
            anouncement.timeout = null;
        }, 5000);
    },
    reset: function() {
        if (!confirm("Reset interface (page will be reloaded) ?"))
            return;
        for(var i in localStorage) {
            if (i.match(/^panels\./)) {
                localStorage.removeItem(i);
            }
        }
        game.panels = {}; //dont save positions;
        game.reload();
    }
};
