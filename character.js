function Character(id, name) {
    this.Id = id;
    this.Name = name;
    this.x = 0;
    this.y = 0;

    this.Hp = null;
    this.Invisible = false;

    //used to show animation of varius type, like damage deal or exp gain
    this.info = [];
    this.Messages = null;

    //Character in pvp cannot move and do other actions
    this.pvp = false;

    this.Dst = {
        X: 0,
        Y: 0,
    };
    this.dst = {
        time: null,
        radius: 0,
    }

    this.target = null;

    this.Dx =  0;
    this.Dy = 0;
    this.Radius = CELL_SIZE / 4;
    this.isMoving = false;
    this.Speed = {Current: 0};
    this.Equip = [];

    this.IsNpc = false;

    this.Burden = 0;
    this.burden = null;

    this.Effects = {};
    this.Clothes = [];

    this.ballon = null;
    this.shownEffects = {};
    this.isPlayer = (this.Name == game.login);
    this.action = {
        progress: 0,
        last: 0,
    }

    this.speed = 1;
    this.sprites = {};
    Character.animations.forEach(function(animation) {
        var s = new Sprite();
        s.name = animation;
        this.sprites[animation] = s;
    }.bind(this));
    this.sprite = this.sprites.idle;
    this._clothes = "";
}

Character.prototype = {
    get X() {
        return this.x;
    },
    get Y() {
        return this.y;
    },
    set X(x) {
        if (this.x == x)
            return;
        if (this.Dx == 0 || Math.abs(this.x - x) > CELL_SIZE) {
            game.sortedEntities.remove(this);
            this.x = x;
            game.sortedEntities.add(this);
        }
    },
    set Y(y) {
        if (this.y == y)
            return;
        if (this.Dy == 0 || Math.abs(this.y - y) > CELL_SIZE) {
            game.sortedEntities.remove(this);
            this.y = y;
            game.sortedEntities.add(this);
        }
    },
    leftTopX: Entity.prototype.leftTopX,
    leftTopY: Entity.prototype.leftTopY,
    sortOrder: function() {
        return  this.Y + this.X;
    },
    screen: function() {
        return new Point(this.X, this.Y).toScreen();
    },
    sync: function(data, init) {
        Character.copy(this, data);

        this.burden = (this.Burden) ? Entity.get(this.Burden) : null

        while(this.Messages && this.Messages.length > 0) {
            var message = this.Messages.shift();
            this.info.push(new Info(message, this));
        }
        if (!init && JSON.stringify(this.getClothes()) != this._clothes) {
            for (var i in this.sprites) {
                this.sprites[i].ready = false;
            }
            this.loadSprite();
        }
    },
    init: function(data) {
        this.sync(data, true);
        this.loadSprite();
    },
    initSprite: function() {
        this.sprite.speed = 14000;
        this.sprite.offset = this.Radius;
	switch (this.Type) {
	case "kitty":
	    this.sprite.width = 64
	    this.sprite.height = 64
            this.sprite.frames = {
                "idle": 3,
                "run": 4,
            }
            break;
	case "chicken":
	    this.sprite.width = 30
	    this.sprite.height = 29
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 3],
            }
            break;
        case "dog":
	case "cat":
	case "horse":
	case "cow":
	case "sheep":
	case "wolf":
	case "butterfly":
	    this.sprite.width = 32
	    this.sprite.height = 32
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 3],
            }
            break;
	case "rabbit":
	    this.sprite.width = 23
	    this.sprite.height = 37
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 2],
            }
            break;
	case "jesus":
	    this.sprite.width = 64
	    this.sprite.height = 96
            this.sprite.frames = {
                "idle": 4,
                "run": 8,
            }
            break;
        case "charles":
	    this.sprite.width = 40;
	    this.sprite.height = 70
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 1,
                "run": 0,
            };
            break;
	case "desu":
	    this.sprite.width = 68
	    this.sprite.height = 96
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 4,
                "run": 0,
            };
            break;
        case "abu":
	    this.sprite.width = 128
	    this.sprite.height = 128
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            }
            break;
        case "mocherator":
	    this.sprite.width = 40;
	    this.sprite.height = 40;
            this.sprite.angle = Math.PI/2;
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            }
            break;
        case "omsk-overlord":
	    this.sprite.width = 128;
	    this.sprite.height = 128;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 0,
                "run": 0,
            };
            break;
        case "omsk":
	    this.sprite.width = 40;
	    this.sprite.height = 40;
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 0,
                "run": 0,
            };
            break;
	case "ufo":
	    this.sprite.width = 64
	    this.sprite.height = 64
            this.sprite.angle = Math.PI*2;
            this.sprite.frames = {
                "idle": 3,
                "run": 0,
            }
            break;
        case "wyvern":
	    this.sprite.width = 256;
	    this.sprite.height = 256;
            this.sprite.frames = {
                "idle": 4,
                "run": 4,
            }
            this.speed = 20000;
            break;
        case "daemon":
	    this.sprite.width = 256;
	    this.sprite.height = 256;
            this.sprite.frames = {
                "idle": 3,
                "run": 4,
            }
            this.speed = 20000;
            break;
	case "naked-ass":
	    this.sprite.width = 64
	    this.sprite.height = 96
            this.sprite.frames = {
                "idle": 1,
                "run": [0, 3],
            }
            break;
	case "red-hair":
	    this.sprite.width = 64
	    this.sprite.height = 96
            this.sprite.frames = {
                "idle": 1,
                "run": 3,
            }
            break;
        case "cirno":
        case "snegurochka":
        case "moroz":
        case "vendor":
            this.sprite.nameOffset = 96;
            this.sprite.frames = {
                "idle": 1,
                "run": 1,
            }
            break;
	default:
            this.sprite.nameOffset = 72;
            this.sprite.offset = 2*this.Radius;
	    this.sprite.width = 96
	    this.sprite.height = 96
	    this.sprite.speed = 7000
	}
        if (!this.sprite.nameOffset)
            this.sprite.nameOffset = this.sprite.height;
    },
    loadSprite: function() {
        var sprite = this.sprite;
        if (this.IsNpc) {
            this.initSprite();
            var type = this.Type;
            switch (this.Name) {
            case "Margo":
                type = "margo";
                break;
            case "Umi":
                type = "umi";
                break;
            case "Shot":
                type = "shot";
                break;
            default:
                switch (this.Type) {
                case "vendor":
                    type = "vendor-" + ([].reduce.call(this.Name, function(hash, c) {
                        return hash + c.charCodeAt(0);
                    }, 0) % 3 + 1);
                    console.log(type);
                    break;
                }
            }
            sprite.load(Character.spriteDir + type + ".png");
            return;
        }
        if (sprite.loading)
            return;
        sprite.loading = true;
        this.initSprite();

        console.time(this.Name + "-" + sprite.name + "-sprite" );
        var animation = sprite.name;
        var type = "";
        var dir = Character.spriteDir + this.Type + "/";
        var clothes = this.getClothes();
        this._clothes = JSON.stringify(clothes);

        if (typeof clothes == "string") {
            var parts = [loader.loadImage(dir + animation + "/" + clothes + ".png")];
        } else {
            var parts =  Object.keys(clothes).map(function(part) {
                var type = clothes[part];
                if (type == "naked")
                    return null;
                var path = dir +
                    animation + "/" +  // idle
                    part + "/" +       // body
                    type + ".png";     // naked
                    return loader.loadImage(path);
            });
        }

        if (animation == "attack") {
            var weapon = Character.weaponSprites.sword;
            if (weapon)
                parts.push(weapon.image);
        }

        loader.ready(function() {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var naked = Character.nakedSprites[animation];
            canvas.width = naked.image.width;
            canvas.height = naked.image.height;
            ctx.drawImage(naked.image, 0, 0);
            parts.forEach(function(image, i) {
                if (image) {
                    ctx.drawImage(image, 0, 0);
                }
            });

            sprite.image = canvas;
            sprite.makeOutline();
            sprite.ready = true;
            sprite.loading = false;
            // document.body.appendChild(canvas);
            Stats.update();
            console.timeEnd(this.Name + "-" + sprite.name + "-sprite" );
        }.bind(this));
    },
    getActions: function() {
        var actions = null;
        switch (this.Type) {
        case "vendor": {
            var name = this.Name;
            actions = {
                "Buy": function() {
                    game.network.send("buy-list", {Vendor: this.Id}, Vendor.buy.bind(this))
                },
                "Sell": function() {
                    game.network.send("sell-list", {Vendor: this.Id}, Vendor.sell.bind(this))
                },
            };
            if (this.Owner == game.player.Id) {
                actions["Take revenue"] = function() {
                    game.network.send("take-revenue", {Vendor: this.Id});
                };
                actions["Take sold items"] = function() {
                    game.network.send("take-sold-items", {Vendor: this.Id});
                };
                actions["Remove all selling items"] = function() {
                    game.network.send("undo-sells", {Vendor: this.Id}, Vendor.sell.bind(this));
                };
            }
            break;
        }
        case "moroz":
        case "snegurochka":
            actions = {
                "Tell me the rules": function() {
                    game.chat.addMessage({From: name, Body: game.talks.rules.presents, IsNpc: true});
                    game.controller.highlight("chat");
                },
                "Gimme a present!": function() {
                    if (confirm("I'll take your atoms. Okay?"))
                        game.network.send("ask-for-present", {Id: this.Id});
                }
            }
            break;
        default:
            if (this.Riding) {
                actions = {
                    "Mount": function() {
                        game.network.send("mount", {Id: this.Id});
                    },
                    "Dismount": function() {
                        game.network.send("dismount");
                    },
                }
            }
        }
        switch (this.Name) {
        case "Margo":
        case "Umi":
            actions["Buy sex"] = function() {
                game.network.send("buy-sex", {Id: this.Id});
            }
            break;
        case "Charles":
            actions = {
                "Talk": function() {
                    var talks = {
                        getActions: function() {
                            var actions = {}
                            for (var i in game.talks.vendor) {
                                actions[i] = function() {
                                    game.chat.addMessage({From: name, Body: this, IsNpc: true});
                                    game.controller.highlight("chat");
                                }.bind(game.talks.vendor[i])
                            }
                            return actions;
                        }
                    }
                    game.menu.show(talks, null, null, true);
                }
            }
            break;
        }
        return actions;
    },
    defaultAction: function(targetOnly) {
        if (!targetOnly && this.isPlayer && game.controller.iface.actionButton.state != "")
            game.controller.iface.actionButton.click();
        else
            game.player.target = this;
    },
    drawAction: function() {
        if(this.Action.Duration) {
            game.ctx.strokeStyle = "orange";
            game.ctx.beginPath();
            var p = this.screen();
            game.ctx.arc(p.x, p.y, CELL_SIZE, 0, this.action.progress);
            game.ctx.stroke();
        }
    },
    see: function(character) {
        if (this == character)
            return true;
        var len_x = character.X - this.X;
        var len_y = character.Y - this.Y;
        return util.distanceLessThan(len_x, len_y, Math.hypot(game.screen.width, game.screen.height));
    },
    setDst: function(x, y) {
        var leftBorder, rightBorder, topBorder, bottomBorder;
        leftBorder = this.Radius;
	topBorder = this.Radius;
	rightBorder = game.map.full.width - this.Radius;
	bottomBorder = game.map.full.height - this.Radius;

        if (x < leftBorder) {
            x = leftBorder;
        } else if (x > rightBorder) {
            x = rightBorder;
        }

        if (y < topBorder) {
            y = topBorder;
        } else if (y > bottomBorder) {
            y = bottomBorder;
        }

        if (x == this.Dst.X && y == this.Dst.Y)
            return;

        game.network.send("set-dst", {x: x, y: y}, game.controller.clearActionQueue);
        this.dst.radius = 9;
        this.dst.time = Date.now();
        this._setDst(x, y);
    },
    _setDst: function(x, y) {
        var len_x = x - this.X;
        var len_y = y - this.Y;
        var len  = Math.hypot(len_x, len_y);

        this.Dst.X = x;
        this.Dst.Y = y;

        this.Dx = len_x / len;
        this.Dy = len_y / len;
    },
    getDrawPoint: function() {
        var p = this.screen();
        return {
            p: p,
            x: Math.round(p.x - this.sprite.width / 2),
            y: Math.round(p.y - this.sprite.height + this.sprite.offset)
        };
    },
    draw: function() {
        if (this.Invisible)
            return;
        if (!game.player.see(this))
            return;
        this.drawDst();

        if (this.sprite.ready) {
            var p = this.getDrawPoint();
            this.sprite.draw(p);
            if (this != game.controller.world.hovered && this == game.player.target)
                this.drawHovered();
        }
    },
    drawUI: function() {
        if (!game.player.see(this))
            return;

        if (game.debug.player.box) {
            this.drawBox()
        }

        //else drawn in controller
        if (this != game.controller.world.hovered && this != game.player.target) {
            this.drawName();
        }


        var p = this.getDrawPoint();
        this.info.forEach(function(info) {
            info.draw(p.x, p.y - FONT_SIZE);
        }.bind(this));

        if(game.debug.player.position) {
            game.ctx.fillStyle = "#fff";
            var text = "(" + Math.floor(this.X) + " " + Math.floor(this.Y) + ")";
            var x = this.X - game.ctx.measureText(text).width / 2;
            game.drawStrokedText(text, x, this.Y);
        }

    },
    drawDst: function() {
        if (debug.player.path && this.Path) {
            var r = 2;
            game.ctx.fillStyle = "#f00";
            this.Path.forEach(function(p) {
                game.iso.fillRect(p.X-r, p.Y-r, 2*r, 2*r);
            })
        }
        if (this.dst.radius <= 0)
            return;
        var now = Date.now();
        if (this.dst.time + 33 > now) {
            game.ctx.strokeStyle = "#fff";
            game.ctx.beginPath();
            var p = new Point(this.Dst.X, this.Dst.Y).toScreen()
            game.ctx.arc(p.x, p.y, this.dst.radius--, 0, Math.PI * 2);
            game.ctx.stroke();
            this.dst.time = now;
        }
    },
    drawBox: function() {
        var p = this.screen();
        game.ctx.strokeStyle = "cyan";
        game.iso.strokeRect(this.leftTopX(), this.leftTopY(), this.Width, this.Height)
        game.iso.strokeCircle(this.X, this.Y, this.Radius);

        // game.ctx.beginPath();
        // game.ctx.fillStyle = "black";
        // game.ctx.beginPath();
        // game.ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        // game.ctx.fill();

        // game.ctx.fillStyle = "#fff";
        // game.ctx.beginPath();
        // game.ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        // game.ctx.fill();
    },
    drawName: function(drawHp, drawName) {
        if (this.Invisible)
            return;

        var name = this.Name;
        if (this.IsNpc) {
            switch (name) {
            default:
                name = name.replace(/-\d+$/, "");
            }
        }

        if (this.Fame == 10000) {
            name = "Lord " + name
        }

        var p = this.screen();
        var y = p.y - this.sprite.nameOffset;
        var dy = FONT_SIZE * 0.8;

        drawHp = drawHp || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.hp);
        drawName = drawName || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.name);

        if (this.PvpExpires) {
            var pvpExpires = new Date(this.PvpExpires * 1000);
            var diff = pvpExpires - Date.now();
            // blink when less then 3 sec
            if (diff > 0 && (diff > 3e3 || diff % 1000 < 500)) {
                game.ctx.fillStyle = "red";
                var x = p.x - game.ctx.measureText("pvp").width / 2;
                var pdy = 0;
                if (drawHp)
                    pdy += dy;
                if (drawName)
                    pdy += dy;
                game.drawStrokedText("pvp", x, y - pdy);
            }
        }

        if (!drawHp && !drawName)
            return;

        var x = p.x - game.ctx.measureText(name).width / 2;

        if (drawHp) {
            var w = 64;
            //full red rect
            game.ctx.fillStyle = '#c33';
            game.ctx.fillRect(p.x - w/2, y, w, dy); //wtf

            //green hp
            game.ctx.fillStyle = '#3c3';
            game.ctx.fillRect(p.x - w/2, y, w * this.Hp.Current / this.Hp.Max, dy); //wtf
        } else {
            dy = 0;
        }
        if (drawName) {
            game.ctx.fillStyle = (this.Karma < 0)
                ? "#f00"
                : ((this == game.player) ? "#ff0" : "#fff");
            game.drawStrokedText(name, x, y - dy / 2);
        }
    },
    animate: function() {
        var animation = "idle";
        if(this.Dx || this.Dy) {
            animation = "run";
            if (!this.IsNpc)
                this.sprite = this.sprites["run"];
            var sector = this.sprite.angle || Math.PI/4;
            var sectors = 2*Math.PI / sector;
            var angle = Math.atan2(-this.Dy, this.Dx);
            var index = Math.round(angle / sector);
            index += sectors + 1;
            index %= sectors;
            this.sprite.position = Math.floor(index);
        } else if (!this.IsNpc) {
            var sitting = this.Effects.Sitting;
            if (sitting) {
                animation = "sit";
                var seat = Entity.get(sitting.SeatId);
                if (seat) {
                    switch (seat.Orientation) {
                    case "w":
                        this.sprite.position = 1; break;
                    case "s":
                        this.sprite.position = 3; break;
                    case "e":
                        this.sprite.position = 5; break;
                    case "n":
                        this.sprite.position = 7; break;
                    }
                }
            } else {
                switch (this.Action.Name) {
                case "attack":
                case "dig":
                    animation = this.Action.Name;
                    break;
                case "":
                    break;
                default:
                    animation = "craft";
                }
            }
            var position = this.sprite.position;
            this.sprite = this.sprites[animation];
            this.sprite.position = position;
        }

        if (!this.sprite.ready) {
            this.loadSprite();
            return
        }

        var now = Date.now();
        var speed = (this.Speed && this.Speed.Current || 100);

        if (animation == "run")
            speed *= this.speed;

        if(now - this.sprite.lastUpdate > (this.sprite.speed / speed)) {
            this.sprite.frame++;
            this.sprite.lastUpdate = now;
        }


        if (this.IsNpc) {
            var start = 0, end = 0;
            var current = this.sprite.frames[animation];
            if (Array.isArray(current)) {
                start = current[0];
                end = current[1];
            } else {
                for (var i in this.sprite.frames) {
                    if (animation == i) {
                        end = start + this.sprite.frames[i];
                        break;
                    }
                    start += this.sprite.frames[i];
                }
            }
        } else {
            var start = 0, end = this.sprite.image.width / this.sprite.width;
        }

        if (this.sprite.frame < start || this.sprite.frame >= end) {
            this.sprite.frame = start;
            if (this.Type == "desu")
                this.sprite.lastUpdate = now + util.rand(5, 60) * 60;
        }
    },
    toggleActionSound: function() {
        if (this.action.name)
            game.sound.stopSound(this.action.name);

        this.action.name = this.Action.Name;

        if (!this.Action.Duration)
            return;

        if (this.action.name in game.sound.sounds)
            game.sound.playSound(this.action.name, 0);
    },
    update: function(k) {
        this.animate();
        if (this.Action) {
            if (this.Action.Started != this.action.last) {
                this.action.progress = 0;
                this.action.last = this.Action.Started;
                this.toggleActionSound();
            }
            if(this.Action.Duration) {
                this.action.progress += (Math.PI * 2 / this.Action.Duration * 1000 * k);
            } else {
                this.action.progress = 0;
            }
        }
        if (this.Mount) {
            if (!this.mount) {
                this.mount = Entity.get(this.Mount);
                this.mount.rider = this;
            }
        } else {
            if (this.mount) {
                this.mount.rider = null;
                this.mount = null;
            }
            this.updatePosition(k);
        }

        if(this.isPlayer) {
            if (this.target && !game.entities.has(this.target.Id))
                this.target = null;

            this.updateBuilding();
            this.updateCamera();
            this.updateBar();
        }

        this.info.map(function(info) {
            info.update(k);
        });

        if (this.ballon) {
            this.ballon.update();
        }

    },
    updateBuilding: function() {
        var n = false, w = false, s = false,  e = false;
        var x = this.X;
        var y = this.Y;

        game.filter("Entity").forEach(function(b) {
            if (b.Group == "wall" || b.Group == "gate") {
                n = n || (b.Y < y && Math.abs(b.X - x) < b.Width);
                w = w || (b.X < x && Math.abs(b.Y - y) < b.Height);
                s = s || (b.Y > y && Math.abs(b.X - x) < b.Width);
                e = e || (b.X > x && Math.abs(b.Y - y) < b.Height);
            }
        });

        this.inBuilding = (n && w && s && e);
    },
    updateBar: function() {
        ["Hp", "Fullness", "Stamina"].map(function(name) {
            var strip = document.getElementById(util.lcfirst(name));
            var param = this[name];
            var value = Math.round(param.Current / param.Max * 100);
            strip.firstChild.style.width = Math.min(100, value) + '%';
            strip.title = name + ": "
                + util.toFixed(this[name].Current) + " / " + util.toFixed(this[name].Max);
            strip.lastChild.style.width = Math.max(0, value - 100) + '%';
        }.bind(this));

        var button = game.controller.iface.actionButton;

        var state = "";
        var tool = Entity.get(this.Equip[Character.equipSlots.indexOf("right-hand")]);
        if (this.burden)
            state = "drop";
        else if (tool)
            state = tool.Type;

        if (button.state == state) {
            return;
        }
        button.onclick = null;
        button.innerHTML = "";
        button.state = state;

        switch (state) {
        case "":
            break;
        case "drop":
            var drop = document.createElement("div");
            drop.textContent = T("Drop");
            button.appendChild(drop);
            button.onclick = function() {
                this.liftStop()
            }.bind(this);
            break;
        default:
            switch (tool.Group) {
            case "pickaxe":
            case "shovel":
                button.appendChild(tool.icon());
                button.onclick = function() {
                    var dig = new Entity(0, tool.Type);
                    dig.initSprite();
                    dig.Sprite.Align = {X: CELL_SIZE, Y: CELL_SIZE};
                    var icon = tool._icon || tool.icon();
                    dig.Width = CELL_SIZE;
                    dig.Height = CELL_SIZE;
                    dig.Sprite.Dx = 6;
                    dig.Sprite.Dy = 56;
                    dig.sprite.image = icon;
                    dig.sprite.width = icon.width;
                    dig.sprite.height = icon.height;
                    game.controller.creatingCursor(dig, "dig");
                }
                break;
            }
        }
    },
    updateEffect: function(name, effect) {
        var id = "effect-" + name;
        var efdiv = document.getElementById(id);
        var hash = JSON.stringify(effect);
        if (efdiv) {
            if (efdiv.hash == hash)
                return;

            efdiv.innerHTML = "";
            clearInterval(efdiv.interval);
        } else {
            efdiv = document.createElement("div");
            efdiv.id = id;
        }

        efdiv.hash = hash;

        var duration = effect.Duration / 1e6;
        if (duration > 0) {
            var progress = document.createElement("div");
            var last = new Date(duration - (Date.now() - effect.Added*1000));

            progress.className = "effect-progress";
            progress.style.width = "100%";
            efdiv.appendChild(progress);

            var tick = 66;
            efdiv.interval = setInterval(function() {
                last = new Date(last.getTime() - tick);
                var hours = last.getUTCHours();
                var mins = last.getUTCMinutes();
                var secs = last.getUTCSeconds();
                efdiv.title = sprintf("%s: %02d:%02d:%02d\n", T("Duration"), hours, mins, secs);
                progress.style.width = 100 / (duration / last) + "%";
                if (last <= 0) {
                    clearInterval(efdiv.interval);
                }
            }, tick);
        }

        var ename = document.createElement("div");
        ename.className = "effect-name";
        ename.textContent = TS(name);
        if (effect.Stacks > 1)
            ename.textContent += " x" + effect.Stacks;

        efdiv.className  = "effect";
        efdiv.name = name;
        efdiv.appendChild(ename);

        var effects = document.getElementById("effects");
        effects.appendChild(efdiv);
        this.shownEffects[name] = efdiv;
    },
    removeEffect: function(name) {
        util.dom.remove(this.shownEffects[name]);
        delete this.shownEffects[name];
    },
    updateEffects: function() {
        for(var name in this.shownEffects) {
            if (!this.Effects[name]) {
                this.removeEffect(name);
            }
        }

        for (var name in this.Effects) {
            this.updateEffect(name, this.Effects[name]);
        }
    },
    updatePosition: function(k) {
        if (this.Dx == 0 && this.Dy == 0) {
            return;
        }
        k *= this.Speed.Current;
        var dx = this.Dx * k;
        var new_x = this.X + dx;

        var dy = this.Dy * k;
        var new_y = this.Y + dy;

        var cell = game.map.getCell(new_x, new_y);
        if (cell) {
            if(cell.biom.Blocked) {
                this.stop();
                return;
            }
            this.speed = cell.biom.Speed;
            dx *= this.speed;
            dy *= this.speed;
            new_x = this.X + dx;
            new_y = this.Y + dy;
        }

        if(new_x < this.Radius) {
            dx = this.Radius - this.X;
        } else if(new_x > game.map.full.width - this.Radius) {
            dx = game.map.full.width - this.Radius - this.X;
        } else if(this.isPlayer && Math.abs(this.Dst.X - this.X) < Math.abs(dx)) {
            dx = this.Dst.X - this.X;
        }


        if(new_y < this.Radius) {
            dy = this.Radius - this.Y;
        } else if(new_y > game.map.full.height - this.Radius) {
            dy = game.map.full.height - this.Radius - this.Y;
        } else if(this.isPlayer && Math.abs(this.Dst.Y - this.Y) < Math.abs(dy)) {
            dy = this.Dst.Y - this.Y;
        }

        new_x = this.X + dx;
        new_y = this.Y + dy;


        if(this.willCollide(new_x, new_y)) {
            this.stop();
            return;
        }

        game.sortedEntities.remove(this);
        this.x += dx;
        this.y += dy;
        game.sortedEntities.add(this);

        if (this.isPlayer) {
            Container.updateVisibility();
            game.controller.build.updateVisibility();
            game.controller.minimap.update();
        }

        this.updateBurden();
        this.updatePlow();

        if (this.rider) {
            this.rider.X = this.x;
            this.rider.Y = this.y;
            this.rider.updateBurden();
        }

        if (this.isPlayer && this.X == this.Dst.X && this.Y == this.Dst.Y) {
            if (this.Path && this.Path.length > 0) {
                var p = this.Path.pop();
                this._setDst(p.X, p.Y);
            } else {
                this.stop();
            }
        }
    },
    updateBurden: function() {
        if (this.burden) {
            this.burden.X = this.X;
            this.burden.Y = this.Y;
        }
    },
    updatePlow: function() {
        if (!this.Effects.Plowing)
            return;
        var plow = Entity.get(this.Effects.Plowing.Plow);
        plow.X = this.X;
        plow.Y = this.Y;
    },
    pickUp: function() {
        var self = this;
        var list = game.findItemsNear(this.X, this.Y).filter(function(e) {
            return e.MoveType == Entity.MT_PORTABLE;
        }).sort(function(a, b) {
            return a.distanceTo(self) - b.distanceTo(self);
        });
        if (list.length > 0)
            list[0].pickUp()
    },
    updateCamera: function() {
        var camera = game.camera;
        var screen = game.screen;
        var p = new Point(this.X, this.Y).toScreen();
        camera.x = p.x - screen.width / 2;
        camera.y = p.y - screen.height / 2;
    },
    willCollide: function(new_x, new_y) {
        return game.entities.some(function(e) {
            return (e instanceof Entity && e.collides(new_x, new_y, this.Radius))
        }.bind(this));
    },
    stop: function() {
        this.Dx = 0;
        this.Dy = 0;
    },
    isNear: function(entity) {
        if (entity.belongsTo(game.player))
            return true;
        if (entity.width) {
            var padding = this.Radius;
            return util.rectIntersects(
                entity.leftTopX() - padding,
                entity.leftTopY() - padding,
                entity.Width + padding * 2,
                entity.Height + padding * 2,
                this.leftTopX(),
                this.leftTopY(),
                this.Width,
                this.Height
            );
        }
        var len_x = entity.X - this.X;
        var len_y = entity.Y - this.Y;
        var r = Math.max(Math.max(entity.Radius, Math.min(entity.Width, entity.Height) / 2), this.Radius);
        return util.distanceLessThan(len_x, len_y, r * 2);
    },
    drawHovered: function() {
        if (this.Invisible)
            return;

        this.sprite.drawOutline(this.getDrawPoint());
        this.drawName(true, true);
    },
    intersects: Entity.prototype.intersects,
    canIntersect: function() {
        return this.sprite.outline != null && (config.ui.allowSelfSelection || this != game.player);
    },
    liftStop: function() {
        if (this.burden)
            game.controller.creatingCursor(this.burden.Type, "lift-stop")
    },
    bag: function() {
        return  Entity.get(this.Equip[0]);
    },
    hasItems: function(items) {
        var found = {};
        var bag = this.bag();
        if (!bag)
            return false;
        var equals = function(items, foundItems) {
            for(var item in items) {
                if (!foundItems || foundItems[item] < items[item])
                    return false;
            }
            return true;
        };

        for(var item in items)
            found[item] = 0;

        for(var i = 0, l = bag.Props.Slots.length; i < l; i++) {
            var eid = bag.Props.Slots[i];
            if (!eid)
                continue;
            var entity = Entity.get(eid);
            if (!entity) {
                game.sendError("hasItems: cannot find %d", eid)
                continue;
            }
            if (items[entity.Group]) {
                found[entity.Group]++;
                if (equals(items, found))
                    return true;
            }
        }
        return false;
    },
    equippedWith: function(group) {
        return this.Equip.filter(function(eid) {
            return (eid != 0);
        }).map(function(eid) {
            return Entity.get(eid);
        }).filter(function(item) {
            return (item.Group == group);
        }).length;
    },
    icon: function() {
        if (!this._icon)
            this._icon = this.sprite.icon();
        return this._icon;
    },
    getClothes: function() {
        var clothes = {};
        var body = this.Clothes[Character.parts.indexOf("body")];
        switch (body) {
        case "cloak":
            return body;
        }
        Character.parts.forEach(function(name, i) {
            clothes[name] = this.Clothes[i] || "naked";
        }.bind(this));
        return clothes;
    },
};
