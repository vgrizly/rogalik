function System() {
    this.fps = new FpsStats();

    var fps = document.createElement("div");
    fps.id = "fps-stats";
    fps.appendChild(this.fps.domElement);

    this.ping = document.createElement("span");
    this.ping.textContent = "Ping: -";

    this.users = new Users();
    this.help = new Help();
    this.settings = new Settings();
    this.news = new News();

    var users = document.createElement("button");
    users.textContent = T("Users");
    users.onclick = this.users.panel.toggle.bind(this.users.panel);

    var news = document.createElement("button");
    news.textContent = T("News");
    news.onclick = this.news.panel.toggle.bind(this.news.panel);

    var help = document.createElement("button");
    help.textContent = T("Help");
    help.onclick = this.help.panel.toggle.bind(this.help.panel);

    var settings = document.createElement("button");
    settings.textContent = T("Settings");
    settings.onclick = this.settings.panel.toggle.bind(this.settings.panel);

    var reset = document.createElement("button")
    reset.id = "reset-interface";
    reset.textContent = T("Reset interface");
    reset.addEventListener('click', game.controller.reset);
    document.body.appendChild(reset);

    this.panel = new Panel(
        "system",
        "System",
        [
            fps,
            this.ping,
            util.hr(),
            settings,
            news,
            help,
            util.hr(),
            game.button.bugtracker(),
            game.button.wiki(),
            game.button.forum(),
            game.button.blog(),
            game.button.vk(),
            game.button.authors(),
            util.hr(),
            users,
            util.hr(),
            reset,
            game.button.logout(),
        ]
    )
}
