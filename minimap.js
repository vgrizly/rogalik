function Minimap() {
    var SCALE = 0.25;
    this.mapImage = game.loader.loadImage("map.png");
    game.loader.ready(function() {
        this.mapImage.width = this.mapImage.width * SCALE;
        // this.mapImage.height = this.mapImage.height * SCALE;
    }.bind(this));
    this.points = {};
    this.characters = {}

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper no-drag";

    wrapper.appendChild(this.mapImage);

    this.panel = new Panel(
        "map",
        "Map",
        [wrapper],
        {
            click: function(e) {
                if (e.target != this.mapImage || !game.player.IsAdmin)
                    return;
                var x = e.pageX - wrapper.offsetLeft - this.panel.element.offsetLeft;
                var y = e.pageY - wrapper.offsetTop - this.panel.element.offsetTop;
                game.network.send(
                    "teleport",
                    {"x": x / SCALE * CELL_SIZE, "y": y / SCALE * CELL_SIZE}
                );
            }.bind(this)
        }
    );

    this.sync = function(data) {
        if (!data)
            return
        this.characters = data;
        this.update();
    }

    var x, y;
    this.update = function() {
        var characters = this.characters;
        for(var name in this.points) {
            if (!characters[name]) {
                util.dom.remove(this.points[name]);
                delete this.points[name];
            }
        }

        if (!this.panel.visible)
            return;

        for (var name in characters) {
            x = characters[name].X / CELL_SIZE;
            y = characters[name].Y / CELL_SIZE;

            if (!this.points[name]) {
                this.points[name] = document.createElement("div");
                this.points[name].className = "point";
                this.points[name].title = name;

                if (name == game.player.Name)
                    this.points[name].id = "player-point";

                wrapper.appendChild(this.points[name]);
            }
            this.points[name].style.left = SCALE * x + "px";
            this.points[name].style.top = SCALE * y + "px";
        }
    }

    this.panel.hooks.show = this.update.bind(this);
}
